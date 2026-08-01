import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC', // Light clean background as per UI image
    },
    /* header */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    editBtn: {
        alignItems: 'flex-end',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        textAlign: 'left',
    },
    requestChangesText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#00BFA6', // Turquoise color from image
    },
    /* scroll */
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 48,
    },
    /* hero card */
    heroCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderRadius: 16,
        padding: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 34,
        // Subtle shadow for premium card look
        // shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    avatarCircle: {
        width: 54,
        height: 54,
        borderRadius: 28,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4F46E5',
    },
    heroInfo: {
        flex: 1,
        marginLeft: 16,
    },
    heroNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    heroName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0F172A',
        flexShrink: 1,
    },
    einWrapperNo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    heroMetaText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#94A3B8',
        marginTop: 3,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    /* settings menu card */
    menuCard: {
        alignSelf: 'stretch',
        width: '100%',
        gap: 4,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginBottom: 12,
        // Subtle shadow for cards
        shadowColor: '#000000cc',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    iconBubble: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuLabel: {
        flex: 1,
        marginLeft: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
    },
    divider: {
        display: 'none',
    },
    /* sub-section content */
    sectionContent: {},
    /* placeholder card */
    placeholderCard: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 40,
        alignItems: 'center',
        gap: 12,
    },
    placeholderText: {
        fontSize: 14,
        color: '#64748B',
    },
    /* empty state */
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#64748B',
    },
});
