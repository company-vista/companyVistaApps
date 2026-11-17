import { font } from '../../../../theme/typography';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../../../../store/hooks';
import { fetchAdminConversations, getAdminMessagesError } from '../api/messagesApi';

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

const getConversationName = conversation =>
  conversation.clientName || conversation.clientPhone || 'Unknown';

const getLastMessageText = lastMessage => {
  if (lastMessage?.text) return lastMessage.text;
  const mediaLabels = {
    image: 'Photo',
    document: 'Document',
    video: 'Video',
    audio: 'Audio',
  };
  return mediaLabels[lastMessage?.mediaType] || 'No messages yet.';
};

const AdminChatListScreen = () => {
  const navigation = useNavigation();
  const token = useAppSelector(state => state.auth.token);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [addNumberVisible, setAddNumberVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setConversations(await fetchAdminConversations(token));
    } catch (loadError) {
      setError(getAdminMessagesError(loadError));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations]),
  );

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredConversations = normalizedSearchQuery
    ? conversations.filter(conversation => {
        const searchableText = [
          conversation.clientName,
          conversation.clientPhone,
          getLastMessageText(conversation.lastMessage),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return searchableText.includes(normalizedSearchQuery);
      })
    : conversations;

  const renderItem = ({ item }) => {
    const name = getConversationName(item);
    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('AdminMessageScreen', { conversation: item })}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}{name.charAt(1).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.time}>{formatTime(item.lastMessage?.createdAt)}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.lastMsg} numberOfLines={1}>
              {item.lastMessage?.direction === 'outbound' ? 'You: ' : ''}
              {getLastMessageText(item.lastMessage)}
            </Text>
            {item.unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const openNewConversation = () => {
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      setPhoneError('Enter a valid phone number with country code.');
      return;
    }

    const normalizedPhone = digits.length === 10 ? `91${digits}` : digits;
    setPhoneError('');
    setPhoneNumber('');
    setAddNumberVisible(false);
    navigation.navigate('AdminMessageScreen', {
      conversation: {
        id: `phone:${normalizedPhone}`,
        clientName: '',
        clientPhone: `+${normalizedPhone}`,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Start a conversation with a phone number"
          style={styles.addButton}
          activeOpacity={0.75}
          onPress={() => {
            setPhoneError('');
            setAddNumberVisible(true);
          }}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search name, phone, message..."
          placeholderTextColor="#94A3B8"
          returnKeyType="search"
          accessibilityLabel="Search conversations"
        />
        {searchQuery ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Clear conversation search"
            onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>
      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator color="#1E3A8A" />
          <Text style={styles.stateText}>Loading conversations...</Text>
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadConversations}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, filteredConversations.length === 0 && styles.emptyList]}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {normalizedSearchQuery ? 'No conversations match your search.' : 'No conversations yet.'}
            </Text>
          }
        />
      )}
      <Modal
        visible={addNumberVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddNumberVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New conversation</Text>
            <Text style={styles.modalDescription}>Enter the phone number, including country code.</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="e.g. +91 98765 43210"
              placeholderTextColor="#94A3B8"
              value={phoneNumber}
              onChangeText={value => {
                setPhoneNumber(value);
                if (phoneError) setPhoneError('');
              }}
              keyboardType="phone-pad"
              autoFocus
              maxLength={20}
              onSubmitEditing={openNewConversation}
              returnKeyType="go"
            />
            {phoneError ? <Text style={styles.phoneError}>{phoneError}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setAddNumberVisible(false);
                  setPhoneNumber('');
                  setPhoneError('');
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.startButton} onPress={openNewConversation}>
                <Text style={styles.startButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminChatListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: font.xxl,
    fontWeight: '700',
    color: '#1E293B',
  },
  searchBox: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 22,
    backgroundColor: '#F0F2F5',
  },
  searchInput: {
    flex: 1,
    color: '#1E293B',
    fontSize: font.bodySmall,
    paddingVertical: 8,
    marginLeft: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 0,
    // borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: font.lg,
    fontWeight: '500',
    color: '#1E3A8A',
  },
  info: {
    flex: 1,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: font.base,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: font.small,
    color: '#94A3B8',
  },
  lastMsg: {
    flex: 1,
    fontSize: font.sm,
    color: '#64748B',
    marginTop: 2,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadText: {
    fontSize: font.xs,
    fontWeight: '700',
    color: '#FFFFFF',
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
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: font.bodySmall,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: font.xl,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalDescription: {
    marginTop: 6,
    marginBottom: 16,
    fontSize: font.bodySmall,
    color: '#64748B',
  },
  phoneInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: font.base,
    color: '#1E293B',
  },
  phoneError: {
    marginTop: 7,
    color: '#B91C1C',
    fontSize: font.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
    gap: 10,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    color: '#334155',
    fontSize: font.bodySmall,
    fontWeight: '600',
  },
  startButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1E3A8A',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: font.bodySmall,
    fontWeight: '600',
  },
});
