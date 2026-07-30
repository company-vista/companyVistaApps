import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { font } from '../../../../../theme/typography';

type Stage = 'submitted' | 'in_review' | 'resolved';

interface RequestItem {
  id: string;
  title: string;
  date: string;
  docs: number;
  stage: Stage;
  message?: string;
}

type Colors = {
  bg: string;
  phone: string;
  screen: string;
  card: string;
  gold: string;
  goldDark: string;
  purple: string;
  purpleNode: string;
  purpleText: string;
  track: string;
  pendingBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  pillBg: string;
  pillText: string;
  divider: string;
};

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
  colors: Colors;
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
  colors: Colors;
}) {
  const isLight = colors.mode === 'light';
  return (
    <View style={[styles.card, { backgroundColor: isLight ? 'rgba(229,231,235,0.5)' : 'rgba(255,255,255,0.07)' }]}>
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

const styles = StyleSheet.create({
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
  card: {
    borderRadius: 16,
    padding: 16,
    paddingBottom: 14,
    marginBottom: 14,
    
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
    flex: 1,
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
});

export default RequestCard;
