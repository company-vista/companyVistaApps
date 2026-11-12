import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity, } from 'react-native';
import axios from 'axios';
import AnimatedAppear from '../../../../components/AnimatedAppear';
import RequestCard from './components/RequestCard';
import { s } from '../../../../theme/responsive';
import { useThemeColors, themePalette } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { useAppSelector } from '../../../../store/hooks';
import { API_BASE_URL } from '../../../../config/api';
const FILTERS = ['All', 'Pending', 'Resolved'];
const DARK_COLORS = {
    bg: themePalette.hex_05070d,
    phone: themePalette.hex_0d1120,
    screen: themePalette.hex_11162a,
    card: themePalette.hex_171d38,
    gold: themePalette.hex_d9a94e,
    goldDark: themePalette.hex_3a2a08,
    purple: themePalette.hex_8f88e0,
    purpleNode: themePalette.hex_5e56b8,
    purpleText: themePalette.hex_a79ef2,
    track: themePalette.hex_2a3050,
    pendingBorder: themePalette.hex_3a3f5c,
    textPrimary: themePalette.hex_f2eee0,
    textSecondary: themePalette.hex_8b8fa3,
    textMuted: themePalette.hex_6f7387,
    pillBg: themePalette.hex_20263f,
    pillText: themePalette.hex_c9c6ba,
    divider: themePalette.hex_2a3050,
};
const LIGHT_COLORS = {
    bg: themePalette.hex_f1f5f9,
    phone: themePalette.hex_ffffff,
    screen: themePalette.hex_f8fafc,
    card: themePalette.hex_ffffff,
    gold: themePalette.hex_d9a94e,
    goldDark: themePalette.hex_7c5c10,
    purple: themePalette.hex_7c73e6,
    purpleNode: themePalette.hex_5e56b8,
    purpleText: themePalette.hex_5e56b8,
    track: themePalette.hex_e2e8f0,
    pendingBorder: themePalette.hex_cbd5e1,
    textPrimary: themePalette.hex_0f172a,
    textSecondary: themePalette.hex_475569,
    textMuted: themePalette.hex_64748b,
    pillBg: themePalette.hex_f1f5f9,
    pillText: themePalette.hex_334155,
    divider: themePalette.hex_e2e8f0,
};
function StatusDonut({ pendingShare, colors, mode, }) {
    const pct = Math.round(pendingShare * 100);
    return (<View style={innerStyles.wrapper}>
      <View style={[
            innerStyles.ring,
            { backgroundColor: colors.track },
        ]}>
        <View style={[
            innerStyles.half,
            { borderColor: colors.gold, backgroundColor: colors.purple },
        ]}>
          <View style={[
            innerStyles.halfInner,
            { backgroundColor: colors.track },
        ]}/>
        </View>
        <View style={[
            innerStyles.centerDot,
            { backgroundColor: colors.track },
        ]}>
          <Text style={[innerStyles.centerText, { color: colors.textPrimary }]}>
            {pct}%
          </Text>
        </View>
      </View>
    </View>);
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
const MyRequestsScreen = ({ companyId, refreshKey }) => {
    const theme = useThemeColors();
    const mode = theme.mode;
    const colors = mode === 'dark' ? DARK_COLORS : LIGHT_COLORS;
    const [filter, setFilter] = React.useState('All');
    const [requests, setRequests] = useState([]);
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
            const rawList = res.data?.data ?? [];
            const mapped = rawList.map(item => ({
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
    // --------------STYLES------------
    const containerStyle = { backgroundColor: mode === 'dark' ? DARK_COLORS.screen : themePalette.hex_ffffff };
    const trackStyle = { backgroundColor: colors.gold, borderWidth: 0 };
    // --------------STYLES------------
    const pendingCount = requests.filter(r => r.stage !== 'resolved').length;
    const submittedCount = requests.filter(r => r.stage === 'submitted').length;
    const total = requests.length;
    const pendingShare = total ? pendingCount / total : 0;
    const filteredRequests = filter === 'All'
        ? requests
        : filter === 'Pending'
            ? requests.filter(r => r.stage !== 'resolved')
            : requests.filter(r => r.stage === 'resolved');
    return (<View style={[
            styles.container,
            containerStyle,
        ]}>
      <AnimatedAppear index={0}>
        <View style={[
            styles.statusCard,
            { backgroundColor: colors.card },
        ]}>
          <StatusDonut pendingShare={pendingShare} colors={colors} mode={mode}/>
          <View>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Overall Status
            </Text>
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: colors.gold }]}/>
              <Text style={[styles.statusRowText, { color: colors.textPrimary }]}>
                {pendingCount}/{total} Pending Review
              </Text>
            </View>
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: colors.purple }]}/>
              <Text style={[styles.statusRowText, { color: colors.textPrimary }]}>
                {submittedCount}/{total} Submitted
              </Text>
            </View>
          </View>
        </View>
      </AnimatedAppear>

      <AnimatedAppear index={1}>
        <View style={styles.filters}>
          {FILTERS.map(f => (<TouchableOpacity key={f} onPress={() => setFilter(f)} style={[
                styles.filter,
                { borderColor: colors.track },
                filter === f && trackStyle,
            ]}>
              <Text style={[
                styles.filterText,
                { color: colors.textSecondary },
                filter === f && {
                    color: colors.goldDark,
                    fontWeight: '600',
                },
            ]}>
                {f}
              </Text>
          </TouchableOpacity>))}
        </View>
      </AnimatedAppear>

      {loading ? (<ActivityIndicator color={colors.gold} style={{ marginVertical: 32 }}/>) : error ? (<Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {error}
        </Text>) : filteredRequests.length === 0 ? (<Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {companyId ? 'No requests found.' : 'Select a company to view requests.'}
        </Text>) : (<View style={styles.cards}>
          {filteredRequests.map((item, idx) => (<AnimatedAppear key={item.id} index={2 + idx}>
              <RequestCard item={item} colors={colors}/>
            </AnimatedAppear>))}
        </View>)}
    </View>);
};
function mapStage(s) {
    if (s === 'submitted' || s === 'in_review' || s === 'resolved')
        return s;
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
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 16,
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
        gap: 24,
        marginBottom: 21,
    },
    filter: {
        paddingVertical: 8,
        paddingHorizontal: s(18),
        borderRadius: 20,
        borderWidth: 0.5,
    },
    filterText: {
        fontSize: font.md,
    },
    cards: {
        gap: 14,
    },
    infoText: {
        textAlign: 'center',
        marginVertical: 32,
        fontSize: font.lg,
        paddingHorizontal: s(16),
    },
});
export default MyRequestsScreen;
