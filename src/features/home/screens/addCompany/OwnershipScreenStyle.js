import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#31384B",
        borderRadius: 12,
        padding: 18,
        marginBottom: 15,
    },
    activeCard: {
        borderColor: "#D4AF37",
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#999",
        marginRight: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    radioActive: {
        borderColor: "#D4AF37",
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#D4AF37",
    },
    cardTitle: {
        color: "#FFF",
        fontSize: 17,
        fontWeight: "600",
    },
    cardSubtitle: {
        color: "#9CA3AF",
        marginTop: 4,
    },
    sectionTitle: {
        color: "#D4AF37",
        fontSize: 24,
        marginTop: 30,
        marginBottom: 15,
        fontWeight: "600",
    },
    input: {
        borderWidth: 1,
        borderColor: "#31384B",
        borderRadius: 10,
        color: "#FFF",
        height: 55,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    half: {
        width: "48%",
    },
    addButton: {
        borderWidth: 1,
        borderColor: "#D4AF37",
        borderStyle: "dashed",
        borderRadius: 10,
        padding: 16,
        alignItems: "center",
        marginTop: 10,
    },
    addText: {
        color: "#D4AF37",
        fontWeight: "600",
    },
});
