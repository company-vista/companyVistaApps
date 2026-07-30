import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import BackButton from '../../../../components/buttons/BackButton';
import { useThemeColors } from '../../../../theme/colors';

type QuickAccessDetailScreenProps = {
  color: string;
  description: string;
  icon: string;
  onBackPress: () => void;
  title: string;
};

function QuickAccessDetailScreen({
  color,
  description,
  icon,
  onBackPress,
  title,
}: QuickAccessDetailScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: safeAreaInsets.top + 22 },
      ]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <BackButton onPress={onBackPress} />
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(safeAreaInsets.bottom, 24) },
        ]}>
        <View style={[styles.heroCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
            <FontAwesome name={icon} size={32} color={color} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.muted }]}>
            {description}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    paddingTop: 24,
  },
  heroCard: {
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#ffffff',
    paddingHorizontal: 22,
    paddingVertical: 36,
  },
  iconWrap: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: '#ecfeff',
  },
  heroTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 18,
    textAlign: 'center',
  },
  description: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default QuickAccessDetailScreen;
