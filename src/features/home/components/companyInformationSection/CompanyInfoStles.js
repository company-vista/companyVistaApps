import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
    container: { paddingHorizontal: 4 },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
        marginBottom: 10,
        marginHorizontal: 4,
    },
    sectionContainer: {
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 4,
        marginBottom: 14,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    fieldGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
    },
    fieldIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fieldCopy: { flex: 1 },
    fieldLabel: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    fieldValue: {
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 20,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginLeft: 52,
    },
});
