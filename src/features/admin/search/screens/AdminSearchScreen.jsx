import { font } from '../../../../theme/typography';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../../store/hooks';
import { s } from '../../../../theme/responsive';
import { searchAdminWorkspace } from '../api/adminSearchApi';

const SHORTCUTS = [
  { key: 'create-invoice', label: 'Create Invoice', icon: 'add-circle-outline', screen: 'AdminCreateInvoice' },
  { key: 'clients', label: 'Clients', icon: 'people-outline', screen: 'AdminClients' },
  { key: 'add-expenses', label: 'Add Expenses', icon: 'wallet-outline', screen: 'AdminAddExpense' },
  { key: 'vista-leads', label: 'Vista Leads', icon: 'briefcase-outline', screen: 'CompanyVistaLeads' },
  { key: 'invoices', label: 'Invoices', icon: 'document-text-outline', screen: 'AdminInvoices', params: { invoiceKind: 'all' } },
  { key: 'estimates', label: 'Estimates', icon: 'receipt-outline', screen: 'AdminInvoices', params: { invoiceKind: 'estimate' } },
  { key: 'payment-records', label: 'Payment Records', icon: 'card-outline', screen: 'AdminTransactions' },
  { key: 'notifications', label: 'Notifications', icon: 'notifications-outline', screen: 'AdminNotifications' },
];

const getCompanyName = item =>
  item.company?.companyName ||
  item.company?.name ||
  item.companyInfo?.name ||
  item.companyName ||
  '';

const getResultTitle = (category, item) => {
  switch (category) {
    case 'clients':
      return (
        item.name ||
        `${item.firstName || ''} ${item.lastName || ''}`.trim() ||
        item.email ||
        'Client'
      );
    case 'companies':
      return item.companyName || item.alternateCompanyName || 'Company';
    case 'invoices':
      return item.invoiceNumber
        ? `Invoice ${item.invoiceNumber}`
        : item.title || 'Invoice';
    case 'payments':
      return (
        item.referenceId ||
        item.transactionId ||
        item.description ||
        'Payment'
      );
    case 'expenses':
      return item.title || item.description || item.name || 'Expense';
    case 'leads':
      return item.name || item.email || 'Vista Lead';
    case 'documents':
      return (
        item.originalFileName ||
        item.fileName ||
        item.title ||
        'Document'
      );
    case 'messages':
      return (
        item.client?.name ||
        item.user?.name ||
        item.name ||
        item.email ||
        'Conversation'
      );
    default:
      return 'Result';
  }
};

const getResultSubtitle = (category, item) => {
  switch (category) {
    case 'clients':
      return [item.email, item.phoneNumber, item.role].filter(Boolean).join(' · ');
    case 'companies':
      return [
        item.companyType,
        item.stateOfRegistration,
        item.countryOfIncorporation,
        item.registrationStatus,
      ]
        .filter(Boolean)
        .join(' · ');
    case 'invoices':
      return [
        getCompanyName(item),
        item.paymentStatus || item.status,
        item.total || item.totalAmount || item.amount,
      ]
        .filter(Boolean)
        .join(' · ');
    case 'payments':
      return [
        getCompanyName(item),
        item.type,
        item.amount ? `${item.currency || 'INR'} ${item.amount}` : '',
      ]
        .filter(Boolean)
        .join(' · ');
    case 'expenses':
      return [
        item.expenseHead?.name || item.expenseHead?.title,
        item.vendor || item.payee,
        item.amount,
      ]
        .filter(Boolean)
        .join(' · ');
    case 'leads':
      return [item.email, item.phone, item.company_name || item.companyName]
        .filter(Boolean)
        .join(' · ');
    case 'documents':
      return [
        item.company?.companyName || item.companyName,
        item.documentType || item.type || item.category,
      ]
        .filter(Boolean)
        .join(' · ');
    case 'messages': {
      const lastMessage = Array.isArray(item.messages)
        ? item.messages[item.messages.length - 1]
        : null;
      return (
        lastMessage?.text ||
        lastMessage?.message ||
        item.lastMessage ||
        item.subject ||
        item.email ||
        ''
      );
    }
    default:
      return '';
  }
};

const getResultIcon = category => {
  switch (category) {
    case 'clients':
      return 'person-outline';
    case 'companies':
      return 'business-outline';
    case 'invoices':
      return 'document-text-outline';
    case 'payments':
      return 'card-outline';
    case 'expenses':
      return 'wallet-outline';
    case 'leads':
      return 'people-outline';
    case 'documents':
      return 'folder-open-outline';
    case 'messages':
      return 'chatbubble-outline';
    default:
      return 'search-outline';
  }
};

const getResultKey = (item, index) =>
  String(item._id || item.id || item.invoiceNumber || `result-${index}`);

const AdminSearchScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const [query, setQuery] = useState('');
  const [resultGroups, setResultGroups] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const trimmedQuery = query.trim();
    const currentRequestId = ++requestId.current;
    if (trimmedQuery.length < 2) {
      setResultGroups([]);
      setErrors([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const result = await searchAdminWorkspace({
          token,
          query: trimmedQuery,
        });
        if (requestId.current === currentRequestId) {
          setResultGroups(result.results);
          setErrors(result.errors);
        }
      } catch (error) {
        if (requestId.current === currentRequestId) {
          setResultGroups([]);
          setErrors([
            {
              key: 'search',
              label: 'Search',
              message:
                error instanceof Error ? error.message : 'Search failed.',
            },
          ]);
        }
      } finally {
        if (requestId.current === currentRequestId) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      if (requestId.current === currentRequestId) {
        requestId.current += 1;
      }
    };
  }, [query, token]);

  const openShortcut = shortcut =>
    navigation.navigate(shortcut.screen, shortcut.params);

  const openResult = (resultCategory, item) => {
    switch (resultCategory) {
      case 'clients':
        navigation.navigate('AdminClientDetails', {
          clientId: item._id || item.id,
        });
        break;
      case 'companies':
        navigation.navigate('AdminCompanyDetails', {
          companyId: item._id || item.id,
          company: item,
        });
        break;
      case 'invoices':
        navigation.navigate('AdminInvoices');
        break;
      case 'payments':
        navigation.navigate('AdminTransactions');
        break;
      case 'expenses':
        navigation.navigate('AdminExpenses');
        break;
      case 'leads':
        navigation.navigate('CompanyVistaLeads');
        break;
      case 'documents':
        navigation.navigate('AdminDocuments');
        break;
      case 'messages':
        navigation.navigate('AdminChatList');
        break;
    }
  };

  const flatResults = resultGroups.flatMap(group =>
    group.items.map((item, index) => ({
      item,
      category: group.key,
      categoryLabel: group.label,
      key: `${group.key}-${getResultKey(item, index)}`,
    })),
  );

  const renderResult = ({ item: result }) => (
    <Pressable
      style={styles.resultCard}
      onPress={() => openResult(result.category, result.item)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${result.categoryLabel}: ${getResultTitle(
        result.category,
        result.item,
      )}`}>
      <View style={styles.resultIcon}>
        <Ionicons
          name={getResultIcon(result.category)}
          size={19}
          color="#2563EB"
        />
      </View>
      <View style={styles.resultCopy}>
        <Text style={styles.resultCategory}>{result.categoryLabel}</Text>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {getResultTitle(result.category, result.item)}
        </Text>
        {getResultSubtitle(result.category, result.item) ? (
          <Text style={styles.resultSubtitle} numberOfLines={2}>
            {getResultSubtitle(result.category, result.item)}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </Pressable>
  );

  const emptyMessage =
    query.trim().length < 2
      ? 'Search clients, companies, invoices, payments and more.'
      : loading
        ? 'Searching workspace...'
        : errors.length === resultGroups.length && errors.length > 0
          ? 'Search could not be completed. Check the errors above and try again.'
          : 'No matching results found.';

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, s(12)) }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={21} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#64748B" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search everything..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search admin workspace"
        />
        {query ? (
          <Pressable
            onPress={() => setQuery('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={19} color="#94A3B8" />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={loading ? [] : flatResults}
        keyExtractor={item => item.key}
        renderItem={renderResult}
        ListHeaderComponent={
          <View>
            <Text style={styles.sectionTitle}>Quick access</Text>
            {SHORTCUTS.map(shortcut => (
              <Pressable
                key={shortcut.key}
                style={styles.shortcutRow}
                onPress={() => openShortcut(shortcut)}
                accessibilityRole="button"
                accessibilityLabel={shortcut.label}>
                <View style={styles.shortcutIcon}>
                  <Ionicons name={shortcut.icon} size={19} color="#2563EB" />
                </View>
                <Text style={styles.shortcutLabel}>{shortcut.label}</Text>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </Pressable>
            ))}
            {errors.length > 0 ? (
              <View style={styles.errorBanner}>
                <Ionicons name="warning-outline" size={17} color="#B45309" />
                <Text style={styles.errorText} numberOfLines={3}>
                  {errors
                    .map(error => `${error.label}: ${error.message}`)
                    .join('\n')}
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? (
              <ActivityIndicator size="large" color="#2563EB" />
            ) : (
              <Ionicons
                name={query.trim().length < 2 ? 'search-outline' : 'search'}
                size={32}
                color="#94A3B8"
              />
            )}
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        }
        contentContainerStyle={[
          styles.results,
          { paddingBottom: s(24) + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default AdminSearchScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    minHeight: s(58),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingBottom: s(10),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: s(38),
    height: s(38),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(10),
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#0F172A',
    fontSize: font.lg,
    fontWeight: '800',
  },
  headerSpacer: { width: s(38) },
  searchBox: {
    minHeight: s(46),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(9),
    marginHorizontal: s(16),
    marginTop: s(14),
    paddingHorizontal: s(12),
    borderRadius: s(11),
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    minHeight: s(44),
    color: '#0F172A',
    fontSize: font.sm,
  },
  results: { paddingHorizontal: s(16), paddingBottom: s(20) },
  sectionTitle: {
    color: '#64748B',
    fontSize: font.xs,
    fontWeight: '700',
    marginTop: s(16),
    marginBottom: s(8),
  },
  shortcutRow: {
    minHeight: s(54),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(10),
    marginBottom: s(7),
    borderRadius: s(11),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  shortcutIcon: {
    width: s(34),
    height: s(34),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(10),
    borderRadius: s(10),
    backgroundColor: '#EFF6FF',
  },
  shortcutLabel: {
    flex: 1,
    color: '#0F172A',
    fontSize: font.sm,
    fontWeight: '600',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: s(68),
    padding: s(11),
    marginBottom: s(8),
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  resultIcon: {
    width: s(38),
    height: s(38),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(10),
    borderRadius: s(11),
    backgroundColor: '#EFF6FF',
  },
  resultCopy: { flex: 1, marginRight: s(8) },
  resultCategory: {
    color: '#2563EB',
    fontSize: font.tiny,
    fontWeight: '700',
    marginBottom: s(2),
  },
  resultTitle: { color: '#0F172A', fontSize: font.sm, fontWeight: '700' },
  resultSubtitle: { color: '#64748B', fontSize: font.xs, marginTop: s(3) },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: s(8),
    padding: s(10),
    marginHorizontal: s(16),
    marginBottom: s(8),
    borderRadius: s(9),
    backgroundColor: '#FFFBEB',
  },
  errorText: { flex: 1, color: '#92400E', fontSize: font.tiny },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(28),
  },
  emptyText: {
    color: '#64748B',
    fontSize: font.sm,
    textAlign: 'center',
    marginTop: s(10),
  },
});
