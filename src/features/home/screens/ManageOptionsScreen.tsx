import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedAppear from '../../../components/AnimatedAppear';
import { useThemeColors } from '../../../theme/colors';
import BackButton from '../../../components/buttons/BackButton';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { font } from '../../../theme/typography';

type ManageOptionsScreenProps = {
  onBackPress: () => void;
  onRequestChangePress: () => void;
};

const options = [
  {
    id: 'requestChange',
    label: 'Request Change',
    description: 'Submit changes for company details, shareholders, address & more',
    icon: 'edit',
    color: '#4F46E5',
  },
];

const ManageOptionsScreen: React.FC<ManageOptionsScreenProps> = ({
  onBackPress,
  onRequestChangePress,
}) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const handleOptionPress = (id: string) => {
    if (id === 'requestChange') {
      onRequestChangePress();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 4,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <StatusBar
        barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
          },
        ]}
      >
        <BackButton onPress={onBackPress} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Manages
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        {options.map((option, index) => (
          <AnimatedAppear key={option.id} index={index}>
            <Pressable
              style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleOptionPress(option.id)}
            >
              <View style={[styles.optionIconWrap, { backgroundColor: `${option.color}15` }]}>
                <FontAwesome name={option.icon} size={22} color={option.color} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={[styles.optionLabel, { color: colors.text }]}>
                  {option.label}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.muted }]}>
                  {option.description}
                </Text>
              </View>
              <FontAwesome name="angle-right" size={20} color={colors.subtle} />
            </Pressable>
          </AnimatedAppear>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  headerTitle: {
    fontSize: font.title,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionLabel: {
    fontSize: font.xxl,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: font.md,
    lineHeight: 18,
  },
});

export default ManageOptionsScreen;
