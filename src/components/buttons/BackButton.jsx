import { Pressable, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../theme/colors';
function BackButton({ onPress }) {
    const colors = useThemeColors();
    return (<Pressable accessibilityRole="button" onPress={onPress} style={[styles.button, { backgroundColor: 'rgba(201, 168, 76, 0.15)' }]}>
      <FontAwesome name="angle-left" size={28} color="#C9A84C"/>
    </Pressable>);
}
const styles = StyleSheet.create({
    button: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 17,
    },
});
export default BackButton;
