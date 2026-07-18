import { Pressable, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { useThemeColors } from '../../theme/colors';

type BackButtonProps = {
  onPress?: () => void;
};

function BackButton({ onPress }: BackButtonProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.button, { backgroundColor: '#ffffff' }]}>
      <FontAwesome name="angle-left" size={34} color={colors.text} />
    </Pressable>
  );
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
