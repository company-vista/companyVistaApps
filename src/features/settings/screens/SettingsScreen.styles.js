import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
    container: {
        padding: 14,
        paddingBottom: 40,
        gap: 14,
    },
    group: {
        gap: 12,
    },
    sectionHeader: {
        fontSize: 17,
        fontWeight: '400',
        textTransform: 'capitalize',
        letterSpacing: 0.5,
        marginLeft: 4,
    },
    menuItem: {
        minHeight: 68,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    iconWrap: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 17,
        marginRight: 14,
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
        marginTop: 4,
    },
});
export default styles;
