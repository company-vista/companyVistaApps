import React from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from '../HomeScreen.styles';
import MoreTabContent from '../../components/MoreTabContent';

export function MoreTabSheet({ colors, insets, slideAnim, onClose, onFollowUsPress, onHelpFeedbackPress, onSupportPress, onProfilePress, onSettingsPress }) {
    return (<View style={styles.moreOverlay}>
        <Pressable onPress={onClose} style={[styles.moreBackdrop, { backgroundColor: colors.backdrop }]} />
        <Animated.View style={[
            styles.moreSheet,
            {
                backgroundColor: colors.sheet,
                paddingBottom: insets.bottom + 24,
                transform: [{ translateY: slideAnim }],
            },
        ]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>
                    More
                </Text>
                <Pressable onPress={onClose} style={[
                    styles.sheetCloseButton,
                    { backgroundColor: colors.surface },
                ]}>
                    <FontAwesome name="close" size={18} color={colors.text} />
                </Pressable>
            </View>
            <MoreTabContent onFollowUsPress={onFollowUsPress} onHelpFeedbackPress={onHelpFeedbackPress} onSupportPress={onSupportPress} onProfilePress={onProfilePress} onSettingsPress={onSettingsPress} />
        </Animated.View>
    </View>);
}
