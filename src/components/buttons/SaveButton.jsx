import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useThemeColors } from '../../theme/colors';
import { font } from '../../theme/typography';
function SaveButton({ disabled = false, isLoading = false, label = 'Save', onPress, }) {
    const colors = useThemeColors();
    const isDisabled = disabled || isLoading;
    return (<Pressable accessibilityRole="button" disabled={isDisabled} onPress={onPress} style={[
            styles.button,
            {
                backgroundColor: colors.mode === 'dark' ? colors.accentSoft : colors.danger,
                borderColor: colors.accent,
            },
            isDisabled ? styles.disabled : null,
        ]}>
      {isLoading ? (<ActivityIndicator size="small" color="#ffffff"/>) : (<Text style={styles.text}>{label}</Text>)}
    </Pressable>);
}
const styles = StyleSheet.create({
    button: {
        height: 54,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.2,
        borderRadius: 14,
        marginTop: 24,
    },
    disabled: {
        opacity: 0.72,
    },
    text: {
        color: '#ffffff',
        fontSize: font.xxl,
        fontWeight: '900',
    },
});
export default SaveButton;
