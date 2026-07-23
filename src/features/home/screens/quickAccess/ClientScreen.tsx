import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { fetchClientCompanies, type ClientCompany } from '../../api/clientProfileApi';
import { useAppSelector } from '../../../../store/hooks';
import { useThemeColors } from '../../../../theme/colors';
import CompanyCard, { type CompanyCardItem } from './CompanyCard';
import CompanyEmptyCard from './CompanyEmptyCard';
import CompanyErrorCard from './CompanyErrorCard';
import CompanyLoadingCard from './CompanyLoadingCard';
import CompanySearchBar from './CompanySearchBar';
import CompanyStatusFilters, {
  type ClientStatusFilter,
} from './CompanyStatusFilters';
import { mapCompanyToListItem } from './companyListItem';

type ClientScreenProps = {
  isEmbedded?: boolean;
  onBackPress?: () => void;
  onCompanyPress?: (company: CompanyListItem) => void;
};

type CompanyListItem = CompanyCardItem;

const emptyCompanies: ClientCompany[] = [];

function ClientScreen({
  isEmbedded = false,
  onBackPress,
  onCompanyPress,
}: ClientScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();
  const token = useAppSelector(state => state.auth.token);
  const userId = useAppSelector(
    state => state.auth.user?._id ?? state.auth.user?.id ?? null,
  );
  const userCompanies = useAppSelector(
    state => state.auth.user?.companies ?? emptyCompanies,
  );
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatusFilter>('All');

  const loadCompanies = useCallback(async () => {
    setIsLoading(true);
    setApiError('');

    const result = await fetchClientCompanies({ token, userId });
    const loadedCompanies =
      result.companies.length > 0 ? result.companies : userCompanies;

    setCompanies(loadedCompanies.map(mapCompanyToListItem));
    setApiError(loadedCompanies.length > 0 ? '' : result.error);
    setIsLoading(false);
  }, [token, userCompanies]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const filteredClients = useMemo(() => companies.filter(client => {
    const query = searchQuery.trim().toLowerCase();
    const matchesStatus =
      statusFilter === 'All' || client.status === statusFilter;

    if (!matchesStatus) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [client.name, client.companyType]
      .join(' ')
      .toLowerCase()
      .includes(query);
  }), [companies, searchQuery, statusFilter]);

  const content = (
    <>
      <View style={styles.header}>
        {onBackPress ? (
          <Pressable onPress={onBackPress} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={22} color={colors.text} />
          </Pressable>
        ) : null}
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.text }]}>Companies</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Manage and view all your companies
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton}>
            <FontAwesome
              name="filter"
              size={20}
              color={colors.text}
              style={styles.headerActionIcon}
            />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <FontAwesome
              name="plus"
              size={20}
              color={colors.text}
              style={styles.headerActionIcon}
            />
          </Pressable>
        </View>
      </View>

      <CompanySearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />

      <CompanyStatusFilters value={statusFilter} onChange={setStatusFilter} />

      <Pressable
        style={[
          styles.sortButton,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
        <Text style={[styles.sortText, { color: colors.text }]}>Recently Added</Text>
        <FontAwesome name="angle-down" size={19} color={colors.text} />
      </Pressable>

      <View style={styles.clientList}>
        {isLoading ? (
          <CompanyLoadingCard />
        ) : null}
        {!isLoading && apiError ? (
          <CompanyErrorCard error={apiError} onRetry={loadCompanies} />
        ) : null}
        {!isLoading && !apiError && filteredClients.map(client => (
          <CompanyCard key={client.id} client={client} onPress={onCompanyPress} />
        ))}
        {!isLoading && !apiError && filteredClients.length === 0 ? (
          <CompanyEmptyCard
            title="No companies found"
            message="Try searching by another name or company type."
          />
        ) : null}
      </View>

      <Text style={[styles.companyCount, { color: colors.muted }]}>
        Showing {filteredClients.length} of {companies.length} companies
      </Text>
    </>
  );

  if (isEmbedded) {
    return <View style={styles.embeddedContent}>{content}</View>;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: safeAreaInsets.top + 22,
            paddingBottom: safeAreaInsets.bottom + 24,
          },
        ]}>
        {content}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: 18,
  },
  embeddedContent: {
    marginTop: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '400',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionIcon: {
    fontWeight: '500',
  },
  sortButton: {
    minHeight: 40,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginTop: 14,
    paddingHorizontal: 18,
  },
  sortText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '600',
  },
  clientList: {
    gap: 10,
    marginTop: 22,
  },
  companyCount: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'left',
  },
});

export default ClientScreen;
