import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
    searchBox: {
        minHeight: 50,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        backgroundColor: '#ffffff',
        marginTop: 28,
        paddingHorizontal: 18,
    },
    searchInput: {
        flex: 1,
        color: '#111827',
        fontSize: 14,
        fontWeight: '500',
        paddingVertical: 10,
        marginLeft: 14,
    },
    clearSearchButton: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
export default styles;
