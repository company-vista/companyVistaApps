import { font } from '../../../theme/typography';
import { StyleSheet } from 'react-native';
import { s } from '../../../theme/responsive';
const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    container: {
        padding: s(14),
        paddingBottom: s(40),
        gap: s(14),
    },
    group: {
        gap: s(12),
    },
    sectionHeader: {
        fontSize: font.md,
        fontWeight: '400',
        textTransform: 'capitalize',
        letterSpacing: 0.5,
        marginLeft: s(4),
    },
    menuItem: {
        minHeight: 68,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: s(16),
        paddingVertical: s(12),
    },
    iconWrap: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 17,
        marginRight: s(14),
    },
    copy: {
        flex: 1,
    },
    title: {
        fontSize: font.md,
        fontWeight: '400',
    },
    subtitle: {
        fontSize: font.sm,
        fontWeight: '400',
        marginTop: s(4),
    },
    themeCard: {
        flexDirection: 'column',
        alignItems: 'stretch',
        paddingVertical: s(14),
    },
    themeOptions: {
        flexDirection: 'row',
        marginTop: s(12),
        gap: s(10),
    },
    themeOption: {
        flex: 1,
        minHeight: s(58),
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: s(6),
    },
    themeOptionLabel: {
        fontSize: font.bodySmall,
        fontWeight: '600',
    },
});
export default styles;
