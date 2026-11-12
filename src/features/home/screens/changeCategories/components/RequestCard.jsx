import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { s } from '../../../../../theme/responsive';
import { font } from '../../../../../theme/typography';
import { themePalette } from '../../../../../theme/colors';
const STAGE_COLORS = {
    submitted: {
        done: { bg: themePalette.hex_3b82f6, text: themePalette.hex_dbeafe },
        current: { bg: themePalette.hex_60a5fa, text: themePalette.hex_1e3a5f },
        line: themePalette.hex_3b82f6,
        label: themePalette.hex_60a5fa,
    },
    in_review: {
        done: { bg: themePalette.hex_8b5cf6, text: themePalette.hex_ede9fe },
        current: { bg: themePalette.hex_d9a94e, text: themePalette.hex_3a2a08 },
        line: themePalette.hex_8b5cf6,
        label: themePalette.hex_a78bfa,
    },
    resolved: {
        done: { bg: themePalette.hex_22c55e, text: themePalette.hex_dcfce7 },
        current: { bg: themePalette.hex_4ade80, text: themePalette.hex_14532d },
        line: themePalette.hex_22c55e,
        label: themePalette.hex_4ade80,
    },
};
const STAGE_LABEL = {
    submitted: 'Submitted',
    in_review: 'In review',
    resolved: 'Resolved',
};
function ProgressTrack({ stage, colors, }) {
    const order = ['submitted', 'in_review', 'resolved'];
    const currentIndex = order.indexOf(stage);
    const palette = STAGE_COLORS[stage];
    const nodeState = (index) => {
        if (index < currentIndex)
            return 'done';
        if (index === currentIndex)
            return 'current';
        return 'pending';
    };
    const icons = {
        submitted: 'file-text',
        in_review: 'x-circle',
        resolved: 'zap',
    };
    return (<>
      <View style={styles.progressTrack}>
        {order.map((s, i) => {
            const state = nodeState(i);
            const iconName = icons[s];
            return (<React.Fragment key={s}>
              <View style={[
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
                ]}>
                <Feather name={iconName} size={14} color={state === 'done'
                    ? palette.done.text
                    : state === 'current'
                        ? palette.current.text
                        : colors.textMuted}/>
              </View>
              {i < order.length - 1 && (<View style={[
                        styles.line,
                        {
                            backgroundColor: i < currentIndex
                                ? palette.line
                                : colors.pendingBorder,
                        },
                    ]}/>)}
            </React.Fragment>);
        })}
      </View>
      <View style={styles.progressLegend}>
        {order.map((s, i) => (<Text key={s} style={[
                styles.legendText,
                { color: colors.textSecondary },
                i <= currentIndex && { color: palette.label },
            ]}>
            {STAGE_LABEL[s]}
          </Text>))}
      </View>
    </>);
}
function RequestCard({ item, colors, }) {
    return (<View style={[styles.card, { backgroundColor: colors.cardHighlight }]}>
      <View style={styles.cardHead}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          {item.title}
        </Text>
        <Text style={[styles.cardDate, { color: colors.textMuted }]}>
          {item.date}
        </Text>
      </View>

      <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
        Request Progress
      </Text>
      <ProgressTrack stage={item.stage} colors={colors}/>

      <View style={[styles.divider, { backgroundColor: colors.divider }]}/>

      <View style={styles.cardFoot}>
        <View style={styles.detailsToggle}>
          <Text style={[styles.detailsText, { color: colors.pillText }]} numberOfLines={1}>
            {item.message || `View details (${item.docs} docs)`}
          </Text>
        </View>

        <View style={[styles.statusPill, { backgroundColor: colors.pillBg }]}>
          <Feather name={item.stage === 'submitted'
            ? 'file-text'
            : item.stage === 'in_review'
                ? 'x-circle'
                : 'zap'} size={12} color={colors.pillText}/>
          <Text style={[styles.statusPillText, { color: colors.pillText }]}>
            {item.stage === 'submitted'
            ? 'Submitted'
            : item.stage === 'in_review'
                ? 'In review'
                : 'Resolved'}
          </Text>
        </View>
      </View>
    </View>);
}
const styles = StyleSheet.create({
    progressTrack: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: s(8),
    },
    node: {
        width: s(28),
        height: s(28),
        borderRadius: s(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    line: {
        flex: 1,
        height: s(2),
    },
    progressLegend: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: s(14),
    },
    legendText: {
        fontSize: font.sm,
    },
    card: {
        borderRadius: s(16),
        padding: s(16),
        paddingBottom: s(14),
        marginBottom: s(14),
    },
    cardHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: s(14),
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
        marginBottom: s(12),
    },
    divider: {
        height: 0.5,
        marginBottom: s(12),
    },
    cardFoot: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailsToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(6),
        flex: 1,
    },
    detailsText: {
        fontSize: font.md,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(6),
        paddingVertical: s(5),
        paddingLeft: s(12),
        paddingRight: s(5),
        borderRadius: s(14),
    },
    statusPillText: {
        fontSize: font.sm,
    },
});
export default RequestCard;
