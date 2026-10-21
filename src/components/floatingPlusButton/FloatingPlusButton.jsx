import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../theme/colors';

function FloatingPlusButton({ onPress, bottomOffset = 90, testID }) {
    const colors = useThemeColors();
    return (
        <Pressable
            testID={testID}
            onPress={onPress}
            hitSlop={8}
            style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.buttonBackground, bottom: bottomOffset },
                pressed && styles.pressed,
            ]}
        >
            <FontAwesome name="plus" size={24} color={colors.buttonText} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        right: 18,
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
    },
    pressed: {
        opacity: 0.85,
        transform: [{ scale: 0.96 }],
    },
});

export default FloatingPlusButton;
