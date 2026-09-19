import { StyleSheet } from 'react-native';
import { s } from '../../../../theme/responsive';
const styles = StyleSheet.create({
    sectionTitle: {
        color: '#111827',
        fontSize: s(18),
        fontWeight: '600',
        marginTop: s(32),
        marginBottom: s(18),
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: s(14),
    },
    serviceCard: {
        width: '47.8%',
        minHeight: s(92),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#d8b4fe',
        borderRadius: s(12),
        backgroundColor: '#ffffff',
        padding: s(10),
    },
    serviceTitle: {
        color: '#111827',
        fontSize: s(14),
        fontWeight: '800',
        lineHeight: s(19),
        marginTop: s(8),
        textAlign: 'center',
    },
});
export default styles;
