import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import Feather from 'react-native-vector-icons/Feather';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { useAppSelector } from '../../../../store/hooks';
import { API_BASE_URL } from '../../../../config/api';

type Stage = 'submitted' | 'in_review' | 'resolved';

interface RequestItem {
  id: string;
  title: string;
  date: string;
  docs: number;
  stage: Stage;
  message?: string;
}

interface ChangeRequestApiItem {
  _id: string;
  companyId: any;
  clientId: string;
  type: string;
  fields: any[];
  message?: string;
  status?: string;
  stage?: string;
  createdAt?: string;
  updatedAt?: string;
  date?: string;
}
const FILTERS = ['All', 'Pending', 'Resolved'] as const;
type Filter = (typeof FILTERS)[number];

const DARK_COLORS = {
  bg: '#05070d',
  phone: '#0d1120',
  screen: '#11162a',
  card: '#171d38',
  gold: '#d9a94e',
  goldDark: '#3a2a08',
  purple: '#8f88e0',
  purpleNode: '#5e56b8',
  purpleText: '#a79ef2',
  track: '#2a3050',
  pendingBorder: '#3a3f5c',
  textPrimary: '#f2eee0',
  textSecondary: '#8b8fa3',
  textMuted: '#6f7387',
  pillBg: '#20263f',
  pillText: '#c9c6ba',
  divider: '#2a3050',
};

const LIGHT_COLORS = {
  bg: '#f1f5f9',
  phone: '#ffffff',
  screen: '#f8fafc',
  card: '#ffffff',
  gold: '#d9a94e',
  goldDark: '#7c5c10',
  purple: '#7c73e6',
  purpleNode: '#5e56b8',
  purpleText: '#5e56b8',
  track: '#e2e8f0',
  pendingBorder: '#cbd5e1',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  pillBg: '#f1f5f9',
  pillText: '#334155',
  divider: '#e2e8f0',
};

function StatusDonut({
  pendingShare,
  colors,
  mode,
}: {
  pendingShare: number;
  colors: typeof DARK_COLORS;
  mode: 'light' | 'dark';
}) {
  const pct = Math.round(pendingShare * 100);
  return (
    <View style={innerStyles.wrapper}>
      <View
        style={[
          innerStyles.ring,
          { backgroundColor: colors.track },
        ]}
      >
        <View
          style={[
            innerStyles.half,
            { borderColor: colors.gold, backgroundColor: colors.purple },
          ]}
        >
          <View
            style={[
              innerStyles.halfInner,
              { backgroundColor: colors.track },
            ]}
          />
        </View>
        <View
          style={[
            innerStyles.centerDot,
            { backgroundColor: colors.track },
          ]}
        >
          <Text style={[innerStyles.centerText, { color: colors.textPrimary }]}>
            {pct}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const innerStyles = StyleSheet.create({
  wrapper: {
    width: 62,
    height: 62,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  half: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
    borderWidth: 6,
  },
  halfInner: {
    flex: 1,
    borderRadius: 32,
    margin: 4,
  },
  centerDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  centerText: {
    fontSize: font.base,
    fontWeight: '700',
  },
});

const STAGE_COLORS = {
  submitted: {
    done: { bg: '#3b82f6', text: '#dbeafe' },
    current: { bg: '#60a5fa', text: '#1e3a5f' },
    line: '#3b82f6',
    label: '#60a5fa',
  },
  in_review: {
    done: { bg: '#8b5cf6', text: '#ede9fe' },
    current: { bg: '#d9a94e', text: '#3a2a08' },
    line: '#8b5cf6',
    label: '#a78bfa',
  },
  resolved: {
    done: { bg: '#22c55e', text: '#dcfce7' },
    current: { bg: '#4ade80', text: '#14532d' },
    line: '#22c55e',
    label: '#4ade80',
  },
};

const STAGE_LABEL: Record<Stage, string> = {
  submitted: 'Submitted',
  in_review: 'In review',
  resolved: 'Resolved',
};

function ProgressTrack({
  stage,
  colors,
}: {
  stage: Stage;
  colors: typeof DARK_COLORS;
}) {
  const order: Stage[] = ['submitted', 'in_review', 'resolved'];
  const currentIndex = order.indexOf(stage);
  const palette = STAGE_COLORS[stage];

  const nodeState = (index: number): 'done' | 'current' | 'pending' => {
    if (index < currentIndex) return 'done';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  const icons: Record<Stage, string> = {
    submitted: 'file-text',
    in_review: 'x-circle',
    resolved: 'zap',
  };

  return (
    <>
      <View style={styles.progressTrack}>
        {order.map((s, i) => {
          const state = nodeState(i);
          const iconName = icons[s];
          return (
            <React.Fragment key={s}>
              <View
                style={[
                  styles.node,
                  state === 'done' && {
                    backgroundColor: palette.done.bg,
                  },
                  state === 'current' && {
                    backgroundColor: palette.current.bg,
                  },
                  state === 'pending' && {
                    borderWidth: 2,
                    borderColor: colors.pendingBorder,
                    backgroundColor: 'transparent',
                  },
                ]}
              >
                <Feather
                  name={iconName}
                  size={14}
                  color={
                    state === 'done'
                      ? palette.done.text
                      : state === 'current'
                      ? palette.current.text
                      : colors.textMuted
                  }
                />
              </View>
              {i < order.length - 1 && (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor:
                        i < currentIndex
                          ? palette.line
                          : colors.pendingBorder,
                    },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
      <View style={styles.progressLegend}>
        {order.map((s, i) => (
          <Text
            key={s}
            style={[
              styles.legendText,
              { color: colors.textSecondary },
              i <= currentIndex && { color: palette.label },
            ]}
          >
            {STAGE_LABEL[s]}
          </Text>
        ))}
      </View>
    </>
  );
}

function RequestCard({
  item,
  colors,
}: {
  item: RequestItem;
  colors: typeof DARK_COLORS;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHead}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          {item.title}
        </Text>
        <Text style={[styles.cardDate, { color: colors.textMuted }]}>
          {item.date}
        </Text>
      </View>

      <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
        REQUEST PROGRESS
      </Text>
      <ProgressTrack stage={item.stage} colors={colors} />

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      <View style={styles.cardFoot}>
        <View style={styles.detailsToggle}>
          <Text
            style={[styles.detailsText, { color: colors.pillText }]}
            numberOfLines={1}
          >
            {item.message || `View details (${item.docs} docs)`}
          </Text>
        </View>

        <View style={[styles.statusPill, { backgroundColor: colors.pillBg }]}>
          <Feather
            name={
              item.stage === 'submitted'
                ? 'file-text'
                : item.stage === 'in_review'
                ? 'x-circle'
                : 'zap'
            }
            size={12}
            color={colors.pillText}
          />
          <Text style={[styles.statusPillText, { color: colors.pillText }]}>
            {item.stage === 'submitted'
              ? 'Submitted'
              : item.stage === 'in_review'
              ? 'In review'
              : 'Resolved'}
          </Text>
        </View>
      </View>
    </View>
  );
}

interface MyRequestsScreenProps {
  companyId?: string;
  refreshKey?: number;
}

const MyRequestsScreen = ({ companyId, refreshKey }: MyRequestsScreenProps) => {
  const theme = useThemeColors();
  const mode = theme.mode;
  const colors = mode === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  const [filter, setFilter] = React.useState<Filter>('All');
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = useAppSelector(state => state.auth.token);
  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      setRequests([]);
      return;
    }

    setLoading(true);
    setError('');

    axios
      .get(`${API_BASE_URL}/api/change-requests/my`, {
        params: { companyId },
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          'x-auth-token': token,
          Cookie: `clientToken=${token}`,
        },
      })
      .then(res => {
        const rawList: ChangeRequestApiItem[] = res.data?.data ?? [];
        const mapped: RequestItem[] = rawList.map(item => ({
          id: item._id,
          title: item.type,
          date: item.createdAt
            ? new Date(item.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '',
          docs: item.fields?.length ?? 0,
          message: item.message,
          stage: mapStage(item.status ?? item.stage),
        }));
        setRequests(mapped);
      })
      .catch(err => {
        const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to load requests';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [companyId, token, refreshKey]);

  const pendingCount = requests.filter(r => r.stage !== 'resolved').length;
  const submittedCount = requests.filter(r => r.stage === 'submitted').length;
  const total = requests.length;
  const pendingShare = total ? pendingCount / total : 0;

  const filteredRequests =
    filter === 'All'
      ? requests
      : filter === 'Pending'
      ? requests.filter(r => r.stage !== 'resolved')
      : requests.filter(r => r.stage === 'resolved');

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: mode === 'dark' ? DARK_COLORS.screen : '#ffffff' },
      ]}
    >
      <View
        style={[
          styles.statusCard,
          { backgroundColor: colors.card },
        ]}
      >
        <StatusDonut pendingShare={pendingShare} colors={colors} mode={mode} />
        <View>
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
            Overall status
          </Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: colors.gold }]} />
            <Text style={[styles.statusRowText, { color: colors.textPrimary }]}>
              {pendingCount}/{total} pending review
            </Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: colors.purple }]} />
            <Text style={[styles.statusRowText, { color: colors.textPrimary }]}>
              {submittedCount}/{total} submitted
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filter,
              { borderColor: colors.track },
              filter === f && {
                backgroundColor: colors.gold,
                borderWidth: 0,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: colors.textSecondary },
                filter === f && {
                  color: colors.goldDark,
                  fontWeight: '600',
                },
              ]}
            >
              {f}
            </Text>
        </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.gold} style={{ marginVertical: 32 }} />
      ) : error ? (
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {error}
        </Text>
      ) : filteredRequests.length === 0 ? (
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {companyId ? 'No requests found.' : 'Select a company to view requests.'}
        </Text>
      ) : (
        <View style={styles.cards}>
          {filteredRequests.map(item => (
            <RequestCard key={item.id} item={item} colors={colors} />
          ))}
        </View>
      )}
    </View>
  );
};

function mapStage(s?: string): Stage {
  if (s === 'submitted' || s === 'in_review' || s === 'resolved') return s;
  return 'in_review';
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    padding: 4,
  },
  statusCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusLabel: {
    fontSize: font.base,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 5,
  },
  statusRowText: {
    fontSize: font.lg,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  filter: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  filterText: {
    fontSize: font.md,
  },
  cards: {
    gap: 14,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    paddingBottom: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: font.xl,
    fontWeight: '600',
  },
  cardDate: {
    fontSize: font.sm,
  },
  progressLabel: {
    fontSize: font.sm,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  progressTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  node: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    height: 2,
  },
  progressLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  legendText: {
    fontSize: font.sm,
  },
  divider: {
    height: 0.5,
    marginBottom: 12,
  },
  cardFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailsText: {
    fontSize: font.md,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingLeft: 12,
    paddingRight: 5,
    borderRadius: 14,
  },
  statusPillText: {
    fontSize: font.sm,
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  infoText: {
    textAlign: 'center',
    marginVertical: 32,
    fontSize: font.lg,
    paddingHorizontal: 16,
  },
});

export default MyRequestsScreen;
