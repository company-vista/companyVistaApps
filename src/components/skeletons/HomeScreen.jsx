import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useThemeColors } from '../../theme/colors';

// Reusable Animated Skeleton Item Component
const SkeletonItem = ({ style }) => {
  const colors = useThemeColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return <Animated.View style={[styles.skeleton, { backgroundColor: colors.skeleton }, style, { opacity }]} />;
};

export default function DashboardSkeleton() {
  const colors = useThemeColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Top Header Skeleton */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <SkeletonItem style={styles.avatar} />
          <SkeletonItem style={{ width: 140, height: 20 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <SkeletonItem style={styles.iconBtn} />
          <SkeletonItem style={styles.iconBtn} />
        </View>
      </View>

      {/* 2. Main Company Card Skeleton */}
      <View style={[styles.mainCard, { backgroundColor: colors.surface, borderWidth: colors.mode === 'dark' ? 1 : 0, borderColor: colors.border }]}>
        {/* Country & Date Header */}
        <View style={styles.rowBetween}>
          <SkeletonItem style={{ width: 120, height: 14 }} />
          <SkeletonItem style={{ width: 100, height: 14 }} />
        </View>

        {/* Company Title Input Box */}
        <SkeletonItem style={styles.companyBox} />

        {/* EIN / Formation / State Row */}
        <View style={[styles.rowBetween, { marginVertical: 12 }]}>
          <SkeletonItem style={{ width: '30%', height: 30 }} />
          <SkeletonItem style={{ width: '30%', height: 30 }} />
          <SkeletonItem style={{ width: '30%', height: 30 }} />
        </View>

        {/* Action / Status Buttons Row */}
        <View style={styles.rowBetween}>
          <SkeletonItem style={styles.statusBox} />
          <SkeletonItem style={styles.statusBox} />
          <SkeletonItem style={styles.statusBox} />
        </View>
      </View>

      {/* 3. Action Required Banner Skeleton */}
      <SkeletonItem style={styles.banner} />

      {/* Pagination Dots Skeleton */}
      <View style={styles.dotsRow}>
        <SkeletonItem style={{ width: 24, height: 8, borderRadius: 4 }} />
        <SkeletonItem style={{ width: 8, height: 8, borderRadius: 4 }} />
        <SkeletonItem style={{ width: 8, height: 8, borderRadius: 4 }} />
      </View>

      {/* Section Title */}
      <SkeletonItem style={{ width: 150, height: 22, marginBottom: 16 }} />

      {/* 4. Compliance Grid Skeleton (2x2 Cards) */}
      <View style={styles.gridContainer}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={[styles.gridCard, { backgroundColor: colors.surface, borderWidth: colors.mode === 'dark' ? 1 : 0, borderColor: colors.border }]}>
            <View style={styles.rowBetween}>
              <SkeletonItem style={{ width: 40, height: 40, borderRadius: 8 }} />
              <SkeletonItem style={{ width: 70, height: 20, borderRadius: 10 }} />
            </View>
            <SkeletonItem style={{ width: '80%', height: 16, marginTop: 12 }} />
            <SkeletonItem style={{ width: '60%', height: 12, marginTop: 8 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F2',
    padding: 16,
  },
  skeleton: {
    backgroundColor: '#E1E9EE',
    borderRadius: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyBox: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    marginVertical: 14,
  },
  statusBox: {
    width: '31%',
    height: 80,
    borderRadius: 12,
  },
  banner: {
    width: '100%',
    height: 70,
    borderRadius: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    height: 110,
  },
});
