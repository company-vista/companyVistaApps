import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, FlatList, Image, Keyboard, Linking, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppSelector } from '../../../../store/hooks';
import {
  fetchAdminConversationThread,
  getAdminMessagesError,
  sendAdminMessage,
} from '../api/messagesApi';

const formatTime = date => {
  if (!date) return '';
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return '';
  return parsedDate.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getMessageText = item => {
  if (item.text) return item.text;
  if (item.mediaUrl) return '';
  const mediaLabels = {
    image: 'Photo',
    document: 'Document',
    video: 'Video',
    audio: 'Audio',
  };
  return mediaLabels[item.mediaType] || '';
};

const AdminMessageScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const conversation = route.params?.conversation || route.params?.user || {};
  const conversationId = conversation.id || conversation.clientId;
  const conversationName =
    conversation.clientName || conversation.name || conversation.clientPhone || 'Unknown';
  const token = useAppSelector(state => state.auth.token);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const threadListRef = useRef(null);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setError('');
    setMessages([]);
    fetchAdminConversationThread({ id: conversationId, token })
      .then(data => {
        if (isActive) setMessages(data);
      })
      .catch(loadError => {
        if (isActive) setError(getAdminMessagesError(loadError));
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [conversationId, token, refreshKey]);

  const openMedia = async url => {
    try {
      await Linking.openURL(url);
    } catch (openError) {
      Alert.alert('Unable to open attachment', getAdminMessagesError(openError));
    }
  };

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, event => {
      keyboardOffset.stopAnimation();
      Animated.timing(keyboardOffset, {
        toValue: event.endCoordinates.height,
        duration: Platform.OS === 'ios' ? event.duration ?? 250 : 200,
        useNativeDriver: false,
      }).start();
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      keyboardOffset.stopAnimation();
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? 200 : 0,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [keyboardOffset]);

  const sendMessage = async () => {
    const text = message.trim();
    if (!text || sending) return;

    setSending(true);
    try {
      const response = await sendAdminMessage({ id: conversationId, text, token });
      if (response?.data) {
        setMessages(prev => [...prev, response.data]);
        setMessage('');
        setError('');
      } else {
        throw new Error(response?.message || 'Message was not sent.');
      }
    } catch (sendError) {
      const failedMessage = sendError?.response?.data?.data;
      if (failedMessage) {
        setMessages(prev => [...prev, failedMessage]);
      }
      const errorMessage = getAdminMessagesError(sendError);
      setError(errorMessage);
      Alert.alert('Message not sent', errorMessage);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    const isAdmin = item.direction === 'outbound';
    return (
      <View style={[styles.msgRow, isAdmin ? styles.msgRowRight : styles.msgRowLeft]}>
        <View style={[styles.bubble, isAdmin ? styles.bubbleAdmin : styles.bubbleUser]}>
          {item.mediaType === 'image' && item.mediaUrl ? (
            <TouchableOpacity onPress={() => openMedia(item.mediaUrl)}>
              <Image source={{ uri: item.mediaUrl }} style={styles.messageImage} resizeMode="cover" />
            </TouchableOpacity>
          ) : null}
          {item.mediaType && item.mediaType !== 'image' && item.mediaUrl ? (
            <TouchableOpacity onPress={() => openMedia(item.mediaUrl)}>
              <Text style={styles.mediaLink}>
                {item.mediaType.charAt(0).toUpperCase() + item.mediaType.slice(1)}
              </Text>
            </TouchableOpacity>
          ) : null}
          {getMessageText(item) ? (
            <Text style={[styles.msgText, isAdmin ? styles.msgTextAdmin : styles.msgTextUser]}>
              {getMessageText(item)}
            </Text>
          ) : null}
          <Text style={[styles.msgTime, isAdmin ? styles.msgTimeAdmin : styles.msgTimeUser]}>
            {formatTime(item.createdAt)}
            {isAdmin && item.status === 'failed' ? ' · failed to send' : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) + 6 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>{conversationName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.headerName} numberOfLines={1}>
            {conversationName}
          </Text>
        </View>
      </View>
      <View style={styles.keyboardWrap}>
        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator color="#1E3A8A" />
            <Text style={styles.stateText}>Loading messages...</Text>
          </View>
        ) : error && messages.length === 0 ? (
          <View style={styles.state}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setRefreshKey(value => value + 1)}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            ref={threadListRef}
            data={messages}
            keyExtractor={item => String(item._id || item.id)}
            renderItem={renderItem}
            style={styles.messageList}
            contentContainerStyle={styles.chatList}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => threadListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={<Text style={styles.emptyText}>No messages yet.</Text>}
          />
        )}
        <Animated.View
          style={[
            styles.inputRow,
            { paddingBottom: Math.max(insets.bottom, 8), marginBottom: keyboardOffset },
          ]}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            value={message}
            onChangeText={setMessage}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={sending || !conversationId || !message.trim()}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export default AdminMessageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardWrap: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stateText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  errorText: {
    fontSize: 13,
    color: '#B91C1C',
    textAlign: 'center',
  },
  retryText: {
    marginTop: 12,
    color: '#1E3A8A',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  backText: {
    fontSize: 18,
    color: '#1E293B',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarSmallText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  headerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  chatList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  msgRow: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  msgRowLeft: {
    justifyContent: 'flex-start',
  },
  msgRowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleUser: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopLeftRadius: 4,
  },
  bubbleAdmin: {
    backgroundColor: '#1E3A8A',
    borderTopRightRadius: 4,
  },
  messageImage: {
    width: 200,
    height: 160,
    borderRadius: 8,
    marginBottom: 4,
  },
  mediaLink: {
    color: '#1D4ED8',
    textDecorationLine: 'underline',
    marginBottom: 4,
  },
  msgText: {
    fontSize: 13,
  },
  msgTextUser: {
    color: '#1E293B',
  },
  msgTextAdmin: {
    color: '#FFFFFF',
  },
  msgTime: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  msgTimeUser: {
    color: '#94A3B8',
  },
  msgTimeAdmin: {
    color: '#BFDBFE',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#1E293B',
  },
  sendBtn: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
