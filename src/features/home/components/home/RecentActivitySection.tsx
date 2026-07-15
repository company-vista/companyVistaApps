import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../../../theme/colors';
import styles from './RecentActivitySection.styles';

function RecentActivitySection() {
  const colors = useThemeColors();

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitleNoMargin, { color: colors.text }]}>
          Recent Activity
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}>
        {[1, 2].map((item, index) => (
          <View
            key={item}
            style={[
              styles.skeletonCard,
              { backgroundColor: colors.surface, borderColor: index === 0 ? '#3B82F6' : '#8B5CF6' },
            ]}>
            <View style={[styles.skeletonImage, { backgroundColor: colors.skeleton }]} />
            <View style={styles.skeletonContent}>
              <View
                style={[styles.skeletonLineLarge, { backgroundColor: colors.skeleton }]}
              />
              <View
                style={[styles.skeletonLineMedium, { backgroundColor: colors.skeleton }]}
              />
              <View
                style={[styles.skeletonLineSmall, { backgroundColor: colors.skeleton }]}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}



export default RecentActivitySection;
