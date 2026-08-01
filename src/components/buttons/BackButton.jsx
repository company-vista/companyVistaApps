import { Pressable, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../theme/colors';
function BackButton({ onPress }) {
    const colors = useThemeColors();
    return (<Pressable accessibilityRole="button" onPress={onPress} style={[styles.button, { backgroundColor: colors.surface }]}>
      <FontAwesome name="angle-left" size={34} color={colors.text}/>
    </Pressable>);
}
const styles = StyleSheet.create({
    button: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
});
export default BackButton;
