import { font } from '../../../../theme/typography';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, FlatList, Image, Keyboard, Linking, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { pick, types } from '@react-native-documents/picker';
import { launchCamera } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppSelector } from '../../../../store/hooks';
import {
  fetchAdminConversationThread,
  getAdminMessageMediaUrl,
  getAdminMessagesError,
  sendAdminMediaMessage,
  sendAdminMessage,
} from '../api/messagesApi';

const MIME_TYPES_BY_EXTENSION = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  mp4: 'video/mp4',
  '3gp': 'video/3gpp',
  aac: 'audio/aac',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  amr: 'audio/amr',
  ogg: 'audio/ogg',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
};

const MIN_INPUT_HEIGHT = 44;

const getAttachmentMimeType = file => {
  if (file.type) return file.type;
  const extension = file.name?.split('.').pop()?.toLowerCase();
  return MIME_TYPES_BY_EXTENSION[extension] || 'application/octet-stream';
};

const MessageImage = ({ item, conversationId, token }) => {
  const [viewerVisible, setViewerVisible] = useState(false);
  const isLocalImage =
    typeof item.mediaUrl === 'string' &&
    /^(file|content):\/\//i.test(item.mediaUrl);
  const imageSource = isLocalImage
    ? { uri: item.mediaUrl }
    : {
        uri: getAdminMessageMediaUrl({
          id: conversationId,
          messageId: item._id || item.id,
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          'x-auth-token': token,
        },
      };
  const [hasLoadError, setHasLoadError] = useState(false);

  if (hasLoadError) {
    return (
      <View style={styles.messageImageFallback}>
        <Ionicons name="image-outline" size={22} color="#BFDBFE" />
        <Text style={styles.messageImageFallbackText}>
          Image unavailable
        </Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity onPress={() => setViewerVisible(true)} activeOpacity={0.9}>
        <Image
          source={imageSource}
          style={styles.messageImage}
          resizeMode="cover"
          onError={() => setHasLoadError(true)}
        />
      </TouchableOpacity>
      <Modal
        visible={viewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setViewerVisible(false)}>
        <Pressable
          style={styles.imageViewer}
          onPress={() => setViewerVisible(false)}>
          <Image
            source={imageSource}
            style={styles.imageViewerImage}
            resizeMode="contain"
          />
          <Ionicons
            name="close-circle"
            size={34}
            color="#FFFFFF"
            style={styles.imageViewerClose}
          />
        </Pressable>
      </Modal>
    </>
  );
};

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

const renderFormattedMessage = text => {
  const parts = String(text).split(/(\*[^*\n]+\*|_[^_\n]+_)/g);
  return parts.map((part, index) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <Text key={index} style={styles.msgTextBold}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    if (part.startsWith('_') && part.endsWith('_')) {
      return (
        <Text key={index} style={styles.msgTextItalic}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  });
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
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);
  const [attachmentSheetVisible, setAttachmentSheetVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const threadListRef = useRef(null);
  const shouldScrollToLatest = useRef(true);

  useEffect(() => {
    let isActive = true;
    shouldScrollToLatest.current = true;
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

  const appendMessage = newMessage => {
    shouldScrollToLatest.current = true;
    setMessages(prev => [...prev, newMessage]);
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
      const sentMessage = await sendAdminMessage({ id: conversationId, text, token });
      appendMessage(sentMessage);
      setMessage('');
      setError('');
    } catch (sendError) {
      const failedMessage = sendError?.response?.data?.data;
      if (failedMessage) {
        appendMessage(failedMessage);
      }
      const errorMessage = getAdminMessagesError(sendError);
      setError(errorMessage);
      Alert.alert('Message not sent', errorMessage);
    } finally {
      setSending(false);
    }
  };

  const sendAttachment = async () => {
    if (sending || !conversationId) return;

    try {
      const selectedFiles = await pick({
        type: [
          types.images,
          types.video,
          types.audio,
          types.pdf,
          types.doc,
          types.docx,
          types.xls,
          types.xlsx,
          types.ppt,
          types.pptx,
          types.plainText,
        ],
        allowMultiSelection: false,
      });
      const selectedFile = selectedFiles?.[0];
      if (!selectedFile?.uri) return;
      await sendMediaFile({
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: getAttachmentMimeType(selectedFile),
      });
    } catch (sendError) {
      if (
        sendError?.code === 'DOCUMENT_PICKER_CANCELED' ||
        sendError?.code === 'user_cancelled'
      ) {
        return;
      }
      const failedMessage = sendError?.response?.data?.data;
      if (failedMessage) {
        appendMessage(failedMessage);
      }
      const errorMessage = getAdminMessagesError(sendError);
      setError(errorMessage);
      Alert.alert('Attachment not sent', errorMessage);
    }
  };

  const sendMediaFile = async file => {
    if (sending || !conversationId) return;
    setSending(true);
    try {
      const sentMessage = await sendAdminMediaMessage({
        id: conversationId,
        file,
        caption: message,
        token,
      });
      appendMessage({
        ...sentMessage,
        mediaUrl: file.uri,
        remoteMediaUrl: sentMessage.mediaUrl,
      });
      setMessage('');
      setError('');
    } catch (sendError) {
      const failedMessage = sendError?.response?.data?.data;
      if (failedMessage) {
        appendMessage(failedMessage);
      }
      const errorMessage = getAdminMessagesError(sendError);
      setError(errorMessage);
      Alert.alert('Attachment not sent', errorMessage);
    } finally {
      setSending(false);
    }
  };

  const captureAndSendPhoto = async () => {
    setAttachmentSheetVisible(false);
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.9,
        saveToPhotos: false,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        throw new Error(result.errorMessage || 'Unable to open the camera.');
      }
      const photo = result.assets?.[0];
      if (!photo?.uri) return;
      await sendMediaFile({
        uri: photo.uri,
        name: photo.fileName || `message-photo-${Date.now()}.jpg`,
        type: photo.type || 'image/jpeg',
      });
    } catch (cameraError) {
      Alert.alert('Camera unavailable', getAdminMessagesError(cameraError));
    }
  };

  const renderItem = ({ item }) => {
    const isAdmin = item.direction === 'outbound';
    return (
      <View style={[styles.msgRow, isAdmin ? styles.msgRowRight : styles.msgRowLeft]}>
        <View style={[styles.bubble, isAdmin ? styles.bubbleAdmin : styles.bubbleUser]}>
          {item.mediaType === 'image' ? (
            <MessageImage
              item={item}
              conversationId={conversationId}
              token={token}
            />
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
              {renderFormattedMessage(getMessageText(item))}
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
            onContentSizeChange={() => {
              if (!shouldScrollToLatest.current || !threadListRef.current) return;
              threadListRef.current.scrollToEnd({ animated: false });
              shouldScrollToLatest.current = false;
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>No messages yet.</Text>}
          />
        )}
          <Animated.View
            style={[
              styles.inputPanel,
              {
                paddingBottom: Math.max(insets.bottom - 4, 0),
                marginBottom: keyboardOffset,
              },
            ]}>
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={[styles.attachBtn, sending && styles.sendBtnDisabled]}
              onPress={() => setAttachmentSheetVisible(true)}
              disabled={sending || !conversationId}
              accessibilityRole="button"
              accessibilityLabel="Open attachment options">
              <Ionicons name="attach" size={22} color="#1E3A8A" />
            </TouchableOpacity>
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor="#94A3B8"
              value={message}
              onChangeText={value => {
                if (sending) return;
                setMessage(value);
              }}
              onContentSizeChange={event => {
                setInputHeight(Math.max(
                  MIN_INPUT_HEIGHT,
                  event.nativeEvent.contentSize.height,
                ));
              }}
              multiline
              submitBehavior="newline"
              returnKeyType="default"
              textAlignVertical="top"
              scrollEnabled={false}
              style={[styles.input, { height: inputHeight }]}
            />
            {message.trim() ? (
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  sending && styles.sendBtnDisabled,
                ]}
                onPress={sendMessage}
                disabled={sending || !conversationId}
                accessibilityRole="button"
                accessibilityLabel="Send message">
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View
                style={[styles.sendBtn, styles.micBtn]}
                accessible
                accessibilityRole="image"
                accessibilityLabel="Microphone">
                <Ionicons name="mic" size={20} color="#1E3A8A" />
              </View>
            )}
          </View>
          <Text style={styles.formatHint}>
            Use *text* for bold, _text_ for italic
          </Text>
        </Animated.View>
      </View>
      <Modal
        visible={attachmentSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAttachmentSheetVisible(false)}>
        <View style={styles.attachmentModal}>
          <Pressable
            style={styles.attachmentBackdrop}
            onPress={() => setAttachmentSheetVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Close attachment options"
          />
          <View
            style={[
              styles.attachmentSheet,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Share</Text>
            <View style={styles.attachmentOptions}>
              <TouchableOpacity
                style={styles.attachmentOption}
                onPress={() => {
                  setAttachmentSheetVisible(false);
                  sendAttachment();
                }}
                accessibilityRole="button"
                accessibilityLabel="Choose a file">
                <View style={styles.attachmentOptionIcon}>
                  <Ionicons name="document-outline" size={24} color="#1E3A8A" />
                </View>
                <Text style={styles.attachmentOptionLabel}>Files</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.attachmentOption}
                onPress={captureAndSendPhoto}
                disabled={sending}
                accessibilityRole="button"
                accessibilityLabel="Take and send a photo">
                <View style={styles.attachmentOptionIcon}>
                  <Ionicons name="camera-outline" size={24} color="#1E3A8A" />
                </View>
                <Text style={styles.attachmentOptionLabel}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminMessageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d5d9dd',
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
    fontSize: font.bodySmall,
    color: '#64748B',
  },
  errorText: {
    fontSize: font.bodySmall,
    color: '#B91C1C',
    textAlign: 'center',
  },
  retryText: {
    marginTop: 12,
    color: '#1E3A8A',
    fontSize: font.bodySmall,
    fontWeight: '600',
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: font.bodySmall,
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
    fontSize: font.xxl,
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
    fontSize: font.base,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  headerName: {
    fontSize: font.md,
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
    backgroundColor: '#E3F2FD',
    borderTopRightRadius: 4,
    color: '#111111',
  },
  messageImage: {
    width: 200,
    height: 160,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#E3F2FD',
  },
  messageImageFallback: {
    width: 200,
    minHeight: 80,
    borderRadius: 8,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  messageImageFallbackText: {
    color: '#111111',
    fontSize: font.caption,
    textAlign: 'center',
  },
  imageViewer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.94)',
  },
  imageViewerImage: {
    width: '100%',
    height: '100%',
  },
  imageViewerClose: {
    position: 'absolute',
    top: 48,
    right: 20,
  },
  mediaLink: {
    color: '#1D4ED8',
    textDecorationLine: 'underline',
    marginBottom: 4,
  },
  msgText: {
    fontSize: font.bodySmall,
    fontWeight: '400',
  },
  msgTextUser: {
    color: '#1E293B',
  },
  msgTextAdmin: {
    color: '#111111',
  },
  msgTime: {
    fontSize: font.caption,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  msgTimeUser: {
    color: '#94A3B8',
  },
  msgTimeAdmin: {
    color: '#111111',
  },
  inputPanel: {
    paddingHorizontal: 12,
    paddingTop: 0,
    // backgroundColor: '#FFFFFF',
    // borderTopWidth: 1,
    // borderTopColor: '#E2E8F0',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    borderRadius: 34,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: font.bodySmall,
    color: '#1E293B',
  },
  formatHint: {
    marginTop: 2,
    marginBottom: 4,
    marginLeft: 48,
    fontSize: font.caption,
    color: '#64748B',
  },
  msgTextBold: {
    fontWeight: '800',
  },
  msgTextItalic: {
    fontStyle: 'italic',
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  sendBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    borderRadius: 28,
    transform: [{ rotate: '-23deg' }],
  },
  micBtn: {
    backgroundColor: '#F1F5F9',
    transform: [{ rotate: '0deg' }],
  },
  attachmentModal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  attachmentBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  attachmentSheet: {
    paddingTop: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 16,
  },
  sheetTitle: {
    color: '#1E293B',
    fontSize: font.md,
    fontWeight: '600',
    marginBottom: 20,
  },
  attachmentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  attachmentOption: {
    alignItems: 'center',
    width: 80,
    marginBottom: 12,
  },
  attachmentOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    marginBottom: 8,
  },
  attachmentOptionLabel: {
    color: '#334155',
    fontSize: font.caption,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: font.bodySmall,
    fontWeight: '600',
  },
});
