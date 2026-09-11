import { StyleSheet } from 'react-native';
import { s } from '../../../theme/responsive';
const styles = StyleSheet.create({
    container: {
        padding: s(14),
        paddingBottom: s(40),
        gap: s(14),
    },
    group: {
        gap: s(12),
    },
    sectionHeader: {
        fontSize: 17,
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
        fontSize: 16,
        fontWeight: '400',
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '400',
        marginTop: s(4),
    },
});
export default styles;
