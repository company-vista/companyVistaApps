// TabPlaceholder.styles.ts में ये प्रॉपर्टीज सुनिश्चित करें:
import { StyleSheet } from 'react-native';
import { font } from '../../../theme/typography';
import { s } from '../../../theme/responsive';
export default StyleSheet.create({
    container: {
        paddingTop: 1,
        padding: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 25,
    },
    activeDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#256F46',
        borderWidth: 2,
        borderColor: '#F8F9FA',
    },
    userInfo: {
        marginLeft: 12,
    },
    welcomeText: {
        fontSize: font.sm,
    },
    userName: {
        fontSize: font.xxl,
        fontWeight: '400',
    },
    userEmail: {
        fontSize: font.sm,
    },
    themeButton: {
        padding: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    healthCard: {
        borderRadius: 12,
        padding: 8,
        borderWidth: 1,
        marginBottom: 20,
    },
    healthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    healthTitle: {
        fontSize: font.base,
    },
    healthPercentage: {
        fontSize: font.xxl,
        fontWeight: '400',
    },
    progressBarBackground: {
        height: 6,
        borderRadius: 3,
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    healthSubtext: {
        fontSize: font.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'center',
    },
    sectionTitleText: {
        fontSize: font.xxl,
        fontWeight: '400',
        letterSpacing: 0.5,
    },
    mainCard: {
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTextBlock: {
        flex: 1,
        marginLeft: 12,
    },
    sectionTitle: {
        fontSize: font.base,
        fontWeight: '400',
    },
    sectionSubtitle: {
        fontSize: font.sm,
        marginTop: 2,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    dateText: {
        fontSize: font.small,
        marginLeft: 4,
    },
    badgeWrap: {
        paddingHorizontal: s(12),
        paddingVertical: 8,
        borderRadius: 12,
        // marginLeft: 4,
    },
    badgeArrowWrapper: {
        flexDirection: 'column',
        gap: 2,
        alignItems: 'center',
    },
    arrowIcon: {
        // backgroundColor: '#ece3e3a1',
        paddingVertical: 8,
        paddingHorizontal: s(10),
        borderRadius: 18,
        marginLeft: 6,
    },
    badgeText: {
        fontSize: font.sm,
        fontWeight: '400',
    },
    renewButton: {
        paddingHorizontal: s(13),
        paddingVertical: 7,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
    },
    renewButtonText: {
        fontSize: font.bodySmall,
        fontWeight: '400',
        // textTransform: 'uppercase',
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        marginTop: 0,
    },
    expandedDetails: {
        marginTop: 12,
    },
    divider: {
        height: 1,
        marginTop: 12,
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: font.small,
        fontWeight: '400',
    },
    detailValue: {
        fontSize: font.base,
        marginTop: 2,
        marginBottom: 8,
    },
    detailGrid: {
        flexDirection: 'row',
    },
    gridColumn: {
        flex: 1,
    },
});
