import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../theme/colors';
import FloatingPlusButton from './FloatingPlusButton';

function FloatingPlusButtonCard({ visible, onClose, bottomOffset = 90, onChatSupportPress }) {
    const colors = useThemeColors();
    const { width } = useWindowDimensions();
    const cardSize = Math.min(width - 120, 200);
    return (
        <Modal transparent visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <View style={styles.container}>
                <Pressable style={[styles.backdrop, { backgroundColor: colors.backdrop }]} onPress={onClose} />
                <View style={[styles.card, { width: cardSize, height: cardSize, marginBottom: bottomOffset + 66, backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Pressable style={styles.chatSupportBtn} onPress={onChatSupportPress}>
                        <View style={[styles.chatIcon, { backgroundColor: colors.accentSoft }]}>
                            <FontAwesome name="comments-o" size={26} color={colors.accent} />
                        </View>
                        <Text style={[styles.chatLabel, { color: colors.text }]}>Chat &amp; Support</Text>
                    </Pressable>
                </View>
                {/* Backdrop ke upar wahi FAB - click se card close ho jaye */}
                <FloatingPlusButton bottomOffset={bottomOffset} onPress={onClose} />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 12,
        paddingLeft: 6,
        marginRight: 18,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        gap: 6,
    },
    chatSupportBtn: {
        width: 70,
        alignItems: 'center',
        gap: 8,
    },
    chatIcon: {
        width: 58,
        height: 58,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatLabel: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default FloatingPlusButtonCard;
