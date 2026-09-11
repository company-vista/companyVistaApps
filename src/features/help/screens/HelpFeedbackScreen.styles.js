import { StyleSheet } from "react-native";
import { s } from '../../../theme/responsive';

// Dynamic responsive styles - use with useResponsive() from responsive.js
// Example: const { rs, rvs, rms, width, height, isLandscape } = useResponsive(); const styles = createStyles({ rs, rvs, rms, width, height });
export function createStyles({ rs, rvs, rms, width, height }) {
    const isLandscape = width > height;
    const isTablet = width >= 768;
    const isLargeLandscape = isLandscape && width >= 600;

    // Horizontal padding dynamic - scales with width + orientation via rs()
    const headerHPad = isTablet ? rs(24) : isLargeLandscape ? rs(20) : isLandscape ? rs(16) : rs(14);
    const listHPad = isTablet ? rs(20) : isLargeLandscape ? rs(24) : rs(12);
    const contentHPad = isLargeLandscape ? rs(24) : isTablet ? rs(28) : isLandscape ? rs(20) : rs(14);
    const cardHPad = isTablet ? rs(24) : rs(20);

    return StyleSheet.create({
        screen: {
            flex: 1,
        },
        header: {
            minHeight: rvs(65),
            flexDirection: 'row',
            alignItems: 'center',
            gap: rs(10),
            borderBottomWidth: 1,
            paddingHorizontal: headerHPad, // dynamic horizontal padding
        },
        headerTitle: {
            flex: 1,
            fontSize: rms(20),
            fontWeight: '400',
        },
        // Help list - vertical in portrait, centered/grid in landscape
        list: {
            paddingTop: rvs(15),
            paddingHorizontal: listHPad, // dynamic horizontal padding
            gap: rs(8),
            // landscape: 2 columns grid
            flexDirection: isLargeLandscape ? 'row' : 'column',
            flexWrap: isLargeLandscape ? 'wrap' : 'nowrap',
            alignSelf: isLargeLandscape || isTablet ? 'center' : 'stretch',
            width: isLargeLandscape || isTablet ? '100%' : '100%',
            maxWidth: isTablet ? 720 : isLargeLandscape ? 640 : undefined,
        },
        itemRow: {
            minHeight: rvs(68),
            flexDirection: 'row',
            alignItems: 'center',
            gap: rs(14),
            paddingHorizontal: rs(25), // dynamic - scales with width
            borderRadius: rs(12),
            // in landscape grid, each item takes ~50% width
            width: isLargeLandscape ? '48.5%' : '100%',
            // responsive padding vertical
            paddingVertical: rs(8),
        },
        itemIcon: {
            width: rs(26),
            alignItems: 'center',
        },
        itemCopy: {
            flex: 1,
        },
        itemTitle: {
            fontSize: rms(16),
            fontWeight: '400',
        },
        itemSubtitle: {
            fontSize: rms(14),
            fontWeight: '400',
            marginTop: rvs(2),
        },
        feedbackHeader: {
            minHeight: rvs(66),
            flexDirection: 'row',
            alignItems: 'center',
            gap: rs(12),
            borderBottomWidth: 1,
            paddingHorizontal: headerHPad, // dynamic horizontal padding
        },
        feedbackHeaderTitle: {
            flex: 1,
            fontSize: rms(20),
            fontWeight: '400',
        },
        feedbackContent: {
            flex: 1,
            paddingHorizontal: contentHPad, // dynamic horizontal padding
            paddingTop: rvs(18),
        },
        // horizontal layout wrapper for landscape: input + media side by side
        feedbackBodyRow: {
            flex: 1,
            flexDirection: isLargeLandscape ? 'row' : 'column',
            gap: isLargeLandscape ? rs(24) : 0,
            marginTop: isLargeLandscape ? rvs(10) : 0,
        },
        feedbackBodyLeft: {
            flex: isLargeLandscape ? 1.4 : undefined,
        },
        feedbackBodyRight: {
            flex: isLargeLandscape ? 0.8 : undefined,
        },
        feedbackHelpText: {
            fontSize: rms(14),
            lineHeight: rvs(24),
        },
        linkText: {
            fontWeight: '700',
        },
        issueInput: {
            minHeight: isLandscape ? rvs(120) : rvs(140),
            borderWidth: 0.3,
            borderRadius: rs(10),
            fontSize: rms(14),
            lineHeight: rvs(24),
            marginTop: isLargeLandscape ? rvs(12) : rvs(40),
            paddingHorizontal: rs(10), // dynamic horizontal padding for input
            paddingTop: rs(10),
            paddingBottom: rs(18),
            textAlignVertical: 'top',
        },
        mediaSection: {
            marginTop: isLargeLandscape ? rvs(12) : rvs(46),
        },
        mediaTitle: {
            fontSize: rms(16),
            fontWeight: '500',
            lineHeight: rvs(23),
        },
        mediaSubtitle: {
            fontSize: rms(14),
            lineHeight: rvs(23),
            marginTop: rvs(2),
        },
        addMediaButton: {
            width: rs(90),
            height: rs(90),
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: rs(3),
            borderWidth: StyleSheet.hairlineWidth,
            marginTop: rvs(18),
            overflow: 'hidden',
        },
        selectedMediaPreview: {
            width: '100%',
            height: '100%',
        },
        plusBadge: {
            position: 'absolute',
            right: rs(-5),
            top: rs(-7),
            width: rs(17),
            height: rs(17),
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: rs(9),
            borderWidth: 2,
        },
        footer: {
            paddingHorizontal: contentHPad, // dynamic horizontal padding
            paddingTop: rvs(10),
        },
        footerText: {
            fontSize: rms(14),
            lineHeight: rvs(22),
        },
        sendButton: {
            minHeight: rvs(43),
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: rs(29),
            marginTop: rvs(20),
            // in landscape limit width & center
            alignSelf: isLargeLandscape ? 'flex-end' : 'stretch',
            width: isLargeLandscape ? rs(160) : '100%',
        },
        sendButtonText: {
            fontSize: rms(18),
            fontWeight: '700',
        },
        appInfoContent: {
            paddingHorizontal: contentHPad, // dynamic horizontal padding
            paddingTop: rvs(22),
            flexDirection: isLargeLandscape ? 'row' : 'column',
            gap: isLargeLandscape ? rs(18) : 0,
            alignSelf: isLargeLandscape || isTablet ? 'center' : 'stretch',
            width: '100%',
            maxWidth: isLargeLandscape ? 820 : isTablet ? 640 : undefined,
        },
        appInfoCard: {
            alignItems: 'center',
            borderRadius: rs(18),
            backgroundColor: '#ffffff',
            paddingHorizontal: cardHPad, // dynamic horizontal padding
            paddingVertical: rvs(28),
            flex: isLargeLandscape ? 0.9 : undefined,
        },
        appInfoIcon: {
            width: rs(66),
            height: rs(66),
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: rs(33),
            backgroundColor: '#ccfbf1',
            overflow: 'hidden',
        },
        appInfoLogo: {
            width: '100%',
            height: '100%',
        },
        appInfoTitle: {
            color: '#111827',
            fontSize: rms(21),
            fontWeight: '500',
            marginTop: rvs(16),
        },
        appInfoSubtitle: {
            color: '#64748b',
            fontSize: rms(13),
            fontWeight: '400',
            marginTop: rvs(5),
        },
        appInfoList: {
            borderRadius: rs(18),
            backgroundColor: '#ffffff',
            marginTop: isLargeLandscape ? 0 : rvs(18),
            paddingHorizontal: rs(16), // dynamic horizontal padding
            flex: isLargeLandscape ? 1.1 : undefined,
        },
        appInfoRow: {
            minHeight: rvs(62),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: rs(14),
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
        },
        appInfoLabel: {
            color: '#64748b',
            fontSize: rms(13),
            fontWeight: '500',
        },
        appInfoValue: {
            flex: 1,
            color: '#111827',
            fontSize: rms(14),
            fontWeight: '400',
            textAlign: 'right',
        },
    });
}

// Fallback static styles for non-responsive usage (portrait default)
const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: { minHeight: 65, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, paddingHorizontal: s(14) },
    headerTitle: { flex: 1, fontSize: 20, fontWeight: '400' },
    list: { paddingTop: 15, paddingHorizontal: s(12), gap: 8 },
    itemRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: s(25), borderRadius: 12 },
    itemIcon: { width: 26, alignItems: 'center' },
    itemCopy: { flex: 1 },
    itemTitle: { fontSize: 16, fontWeight: '400' },
    itemSubtitle: { fontSize: 14, fontWeight: '400', marginTop: 2 },
    feedbackHeader: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, paddingHorizontal: s(14) },
    feedbackHeaderTitle: { flex: 1, fontSize: 20, fontWeight: '400' },
    feedbackContent: { flex: 1, paddingHorizontal: s(28), paddingTop: 18 },
    feedbackBodyRow: { flex: 1 },
    feedbackBodyLeft: {},
    feedbackBodyRight: {},
    feedbackHelpText: { fontSize: 14, lineHeight: 24 },
    linkText: { fontWeight: '700' },
    issueInput: { minHeight: 140, borderWidth: 0.3, borderRadius: 10, fontSize: 14, lineHeight: 24, marginTop: 40, paddingHorizontal: s(10), paddingTop: 10, paddingBottom: 18 },
    mediaSection: { marginTop: 46 },
    mediaTitle: { fontSize: 16, fontWeight: '500', lineHeight: 23 },
    mediaSubtitle: { fontSize: 14, lineHeight: 23, marginTop: 2 },
    addMediaButton: { width: 90, height: 90, alignItems: 'center', justifyContent: 'center', borderRadius: 3, borderWidth: StyleSheet.hairlineWidth, marginTop: 18, overflow: 'hidden' },
    selectedMediaPreview: { width: '100%', height: '100%' },
    plusBadge: { position: 'absolute', right: -5, top: -7, width: 17, height: 17, alignItems: 'center', justifyContent: 'center', borderRadius: 9, borderWidth: 2 },
    footer: { paddingHorizontal: s(28), paddingTop: 10 },
    footerText: { fontSize: 14, lineHeight: 22 },
    sendButton: { minHeight: 43, alignItems: 'center', justifyContent: 'center', borderRadius: 29, marginTop: 20 },
    sendButtonText: { fontSize: 18, fontWeight: '700' },
    appInfoContent: { paddingHorizontal: s(22), paddingTop: 22 },
    appInfoCard: { alignItems: 'center', borderRadius: 18, backgroundColor: '#ffffff', paddingHorizontal: s(20), paddingVertical: 28 },
    appInfoIcon: { width: 66, height: 66, alignItems: 'center', justifyContent: 'center', borderRadius: 33, backgroundColor: '#ccfbf1', overflow: 'hidden' },
    appInfoLogo: { width: '100%', height: '100%' },
    appInfoTitle: { color: '#111827', fontSize: 21, fontWeight: '500', marginTop: 16 },
    appInfoSubtitle: { color: '#64748b', fontSize: 13, fontWeight: '400', marginTop: 5 },
    appInfoList: { borderRadius: 18, backgroundColor: '#ffffff', marginTop: 18, paddingHorizontal: s(16) },
    appInfoRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    appInfoLabel: { color: '#64748b', fontSize: 13, fontWeight: '500' },
    appInfoValue: { flex: 1, color: '#111827', fontSize: 14, fontWeight: '400', textAlign: 'right' },
});

export default styles;
