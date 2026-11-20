import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../../../../components/buttons/BackButton';
import { useAppSelector } from '../../../../store/hooks';
import { useThemeColors } from '../../../../theme/colors';
import { s } from '../../../../theme/responsive';
import { font } from '../../../../theme/typography';
import { fetchRecentActivity } from '../api/activityLogApi';

function formatRelativeTime(value) {
  if (!value) {
    return 'Just now';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }
  const diffInMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffInMinutes < 1) {
    return 'Just now';
  }
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  const hours = Math.floor(diffInMinutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${Math.floor(hours / 24)}d ago`;
}

function getEntryKey(item, index) {
  return item?._id || item?.id || `${item?.createdAt ?? 'activity'}-${index}`;
}

const FILTERS = [
  {
    key: 'today',
    label: 'Today',
    subtitle: 'Today',
    emptyText: 'No activity today.',
  },
  {
    key: 'yesterday',
    label: 'Yesterday',
    subtitle: 'Yesterday',
    emptyText: 'No activity yesterday.',
  },
  {
    key: '7days',
    label: '7 Days',
    subtitle: 'Last 7 days',
    emptyText: 'No activity in the last 7 days.',
  },
];

function isWithinFilter(value, filter) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (filter === 'today') {
    return date >= startOfToday && date < startOfTomorrow;
  }
  if (filter === 'yesterday') {
    return date >= startOfYesterday && date < startOfToday;
  }
  return true;
}

const RecentActivityScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const token = useAppSelector(state => state.auth.token);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('7days');

  const isDark = colors.mode === 'dark';
  const cardBackground = isDark ? colors.cardElevated : colors.cardHighlight;

  const themedStyles = {
    screen: { backgroundColor: colors.background },
    title: { color: colors.text },
    subtitle: { color: colors.muted },
    card: { backgroundColor: cardBackground },
    action: { color: colors.text },
    company: { color: colors.accent },
    details: { color: colors.muted },
    meta: { color: colors.subtle },
    empty: { color: colors.muted },
    autoDot: { backgroundColor: colors.accent },
    manualDot: { backgroundColor: '#F59E0B' },
    headerPadding: { paddingTop: insets.top + s(12) },
    listPadding: {
      paddingBottom: Math.max(insets.bottom, s(24)) + s(16),
    },
    filterChip: {
      backgroundColor: colors.cardHighlight,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.buttonBackground,
      borderColor: colors.buttonBackground,
    },
    filterChipText: { color: colors.muted },
    filterChipTextActive: { color: colors.buttonText },
  };

  const activeFilterConfig =
    FILTERS.find(filter => filter.key === activeFilter) ?? FILTERS[2];
  const filteredActivities = useMemo(
    () =>
      activities.filter(item =>
        isWithinFilter(item?.createdAt, activeFilter),
      ),
    [activities, activeFilter],
  );

  const loadActivities = useCallback(
    () => fetchRecentActivity({ token, days: 7 }),
    [token],
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setIsLoading(true);
      loadActivities().then(result => {
        if (!isActive) {
          return;
        }
        setActivities(result.isSuccess ? result.activities : []);
        setIsLoading(false);
      });
      return () => {
        isActive = false;
      };
    }, [loadActivities]),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const result = await loadActivities();
    setActivities(result.isSuccess ? result.activities : []);
    setIsRefreshing(false);
  }, [loadActivities]);

  const renderItem = ({ item, index }) => {
    const company = item?.company;
    const companyId = company?._id || company?.id;
    const companyName = company?.companyName || company?.name || '';
    const leadName = item?.lead?.name || '';
    const dotStyle =
      item?.source === 'manual' ? themedStyles.manualDot : themedStyles.autoDot;

    const openCompany = () => {
      if (!companyId) {
        return;
      }
      navigation.navigate('AdminCompanyDetails', {
        companyId,
        company,
      });
    };

    return (
      <View style={styles.row}>
        <View style={[styles.dot, dotStyle]} />
        <View style={styles.rowBody}>
          <Text style={[styles.action, themedStyles.action]}>
            {item?.action || 'Activity'}
            {companyName ? ' — ' : null}
            {companyName ? (
              <Text
                style={[styles.company, themedStyles.company]}
                onPress={openCompany}>
                {companyName}
              </Text>
            ) : null}
            {leadName ? ` — ${leadName} (Lead)` : null}
          </Text>
          {!!item?.details && (
            <Text
              style={[styles.details, themedStyles.details]}
              numberOfLines={2}>
              {item.details}
            </Text>
          )}
          <Text style={[styles.meta, themedStyles.meta]}>
            {formatRelativeTime(item?.createdAt)}
            {item?.performedBy?.name ? ` · ${item.performedBy.name}` : ''}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.stateWrap}>
      <Text style={[styles.emptyText, themedStyles.empty]}>
        {activeFilterConfig.emptyText}
      </Text>
    </View>
  ); 

  return (
    <View style={[styles.screen, themedStyles.screen]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={[styles.header, themedStyles.headerPadding]}>
        <View style={styles.titleRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <View>
            <Text style={[styles.title, themedStyles.title]}>
              Recent Activity
            </Text>
            <Text style={[styles.subtitle, themedStyles.subtitle]}>
              {activeFilterConfig.subtitle}
            </Text>
          </View>
        </View>
        <View style={styles.filterRow}>
          {FILTERS.map(filter => {
            const isActive = activeFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                onPress={() => setActiveFilter(filter.key)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                style={[
                  styles.filterChip,
                  themedStyles.filterChip,
                  isActive && themedStyles.filterChipActive,
                ]}>
                <Text
                  style={[
                    styles.filterChipText,
                    isActive
                      ? themedStyles.filterChipTextActive
                      : themedStyles.filterChipText,
                  ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredActivities}
          keyExtractor={getEntryKey}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContent, themedStyles.card, themedStyles.listPadding]}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.accent]}
              tintColor={colors.accent}
            />
          }
        />
      )}
    </View>
  );
};

export default RecentActivityScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: s(16),
    paddingBottom: s(12),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
  },
  title: {
    fontSize: font.title,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: font.sm,
    marginTop: s(2),
  },
  filterRow: {
    flexDirection: 'row',
    gap: s(8),
    marginTop: s(12),
  },
  filterChip: {
    paddingHorizontal: s(14),
    paddingVertical: s(7),
    borderWidth: 1,
    borderRadius: 18,
  },
  filterChipText: {
    fontSize: font.sm,
    fontWeight: '600',
  },
  listContent: {
    flexGrow: 1,
    marginHorizontal: s(16),
    borderRadius: 18,
    paddingHorizontal: s(16),
    paddingVertical: s(12),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: s(12),
    paddingVertical: s(10),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: s(6),
  },
  rowBody: {
    flex: 1,
  },
  action: {
    fontSize: font.sm,
    lineHeight: font.lg,
  },
  company: {
    fontWeight: '700',
  },
  details: {
    fontSize: font.sm,
    marginTop: s(3),
  },
  meta: {
    fontSize: font.xs,
    marginTop: s(3),
  },
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: s(24),
  },
  emptyText: {
    fontSize: font.sm,
    textAlign: 'center',
  },
});
