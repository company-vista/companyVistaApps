import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
    clientCard: {
        minHeight: 78,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        backgroundColor: '#ffffff',
        paddingHorizontal: 8,
        paddingVertical: 7,
    },
    avatar: {
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 23,
        backgroundColor: '#dbeafe',
        marginRight: 10,
    },
    avatarText: {
        color: '#2563eb',
        fontSize: 17,
        fontWeight: '600',
    },
    clientCopy: {
        flex: 1,
    },
    clientName: {
        color: '#111827',
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 20,
    },
    companyTypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    clientMeta: {
        flex: 1,
        color: '#64748b',
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 18,
    },
    clientMetaLabel: {
        color: '#111827',
        fontWeight: '500',
    },
    clientSide: {
        width: 142,
        alignItems: 'flex-end',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
        marginBottom: 4,
    },
    statusBadge: {
        borderRadius: 12,
        paddingHorizontal: 9,
        paddingVertical: 3,
    },
    activeBadge: {
        backgroundColor: '#dcfce7',
    },
    inactiveBadge: {
        backgroundColor: '#fee2e2',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '900',
    },
    activeStatusText: {
        color: '#059669',
    },
    inactiveStatusText: {
        color: '#b91c1c',
    },
    invoiceButton: {
        minHeight: 22,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#bfdbfe',
        borderRadius: 11,
        backgroundColor: '#eff6ff',
        gap: 4,
        paddingHorizontal: 7,
    },
    invoiceButtonText: {
        color: '#2563eb',
        fontSize: 10,
        fontWeight: '800',
    },
    addedText: {
        color: '#64748b',
        fontSize: 11,
        fontWeight: '600',
        lineHeight: 14,
        textAlign: 'right',
    },
    addedDate: {
        color: '#64748b',
        fontSize: 11,
        fontWeight: '600',
        lineHeight: 14,
        textAlign: 'right',
    },
});
export default styles;
