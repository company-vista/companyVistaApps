import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
    sectionTitle: {
        color: '#111827',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 32,
        marginBottom: 18,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
    },
    serviceCard: {
        width: '47.8%',
        minHeight: 92,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#d8b4fe',
        borderRadius: 12,
        backgroundColor: '#ffffff',
        padding: 10,
    },
    serviceTitle: {
        color: '#111827',
        fontSize: 14,
        fontWeight: '800',
        lineHeight: 19,
        marginTop: 8,
        textAlign: 'center',
    },
});
export default styles;
