import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useThemeColors } from '../../theme/colors';
import { useResponsive } from '../../hooks/useResponsive';

// Reusable Animated Skeleton Item Component
const SkeletonItem = ({ style, colors }) => {
  const fallbackColors = useThemeColors();
  const bg = colors?.skeleton ?? fallbackColors.skeleton;
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

  return <Animated.View style={[ { backgroundColor: bg, borderRadius: 6 }, style, { opacity }]} />;
};

export default function DashboardSkeleton() {
  const colors = useThemeColors();
  const { rs, rvs, rms, width, height } = useResponsive();
  const styles = useMemo(() => createStyles({ rs, rvs, rms, width, height }), [rs, rvs, rms, width, height]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Top Header Skeleton */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(12) }}>
          <SkeletonItem colors={colors} style={styles.avatar} />
          <SkeletonItem colors={colors} style={{ width: rs(140), height: rvs(20), borderRadius: rs(6) }} />
        </View>
        <View style={{ flexDirection: 'row', gap: rs(12) }}>
          <SkeletonItem colors={colors} style={styles.iconBtn} />
          <SkeletonItem colors={colors} style={styles.iconBtn} />
        </View>
      </View>

      {/* 2. Main Company Card Skeleton */}
      <View style={[styles.mainCard, { backgroundColor: colors.surface, borderWidth: colors.mode === 'dark' ? 1 : 0, borderColor: colors.border }]}>
        {/* Country & Date Header */}
        <View style={styles.rowBetween}>
          <SkeletonItem colors={colors} style={{ width: rs(120), height: rvs(14), borderRadius: rs(6) }} />
          <SkeletonItem colors={colors} style={{ width: rs(100), height: rvs(14), borderRadius: rs(6) }} />
        </View>

        {/* Company Title Input Box */}
        <SkeletonItem colors={colors} style={styles.companyBox} />

        {/* EIN / Formation / State Row */}
        <View style={[styles.rowBetween, { marginVertical: rvs(12) }]}>
          <SkeletonItem colors={colors} style={{ width: '30%', height: rvs(30), borderRadius: rs(6) }} />
          <SkeletonItem colors={colors} style={{ width: '30%', height: rvs(30), borderRadius: rs(6) }} />
          <SkeletonItem colors={colors} style={{ width: '30%', height: rvs(30), borderRadius: rs(6) }} />
        </View>

        {/* Action / Status Buttons Row */}
        <View style={styles.rowBetween}>
          <SkeletonItem colors={colors} style={styles.statusBox} />
          <SkeletonItem colors={colors} style={styles.statusBox} />
          <SkeletonItem colors={colors} style={styles.statusBox} />
        </View>
      </View>

      {/* 3. Action Required Banner Skeleton */}
      <SkeletonItem colors={colors} style={styles.banner} />

      {/* Pagination Dots Skeleton */}
      <View style={styles.dotsRow}>
        <SkeletonItem colors={colors} style={{ width: rs(24), height: rs(8), borderRadius: rs(4) }} />
        <SkeletonItem colors={colors} style={{ width: rs(8), height: rs(8), borderRadius: rs(4) }} />
        <SkeletonItem colors={colors} style={{ width: rs(8), height: rs(8), borderRadius: rs(4) }} />
      </View>

      {/* Section Title */}
      <SkeletonItem colors={colors} style={{ width: rs(150), height: rvs(22), marginBottom: rvs(16), borderRadius: rs(6) }} />

      {/* 4. Compliance Grid Skeleton (2x2 Cards) - horizontal responsive */}
      <View style={styles.gridContainer}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={[styles.gridCard, { backgroundColor: colors.surface, borderWidth: colors.mode === 'dark' ? 1 : 0, borderColor: colors.border }]}>
            <View style={styles.rowBetween}>
              <SkeletonItem colors={colors} style={{ width: rs(40), height: rs(40), borderRadius: rs(8) }} />
              <SkeletonItem colors={colors} style={{ width: rs(70), height: rvs(20), borderRadius: rs(10) }} />
            </View>
            <SkeletonItem colors={colors} style={{ width: '80%', height: rvs(16), marginTop: rvs(12), borderRadius: rs(6) }} />
            <SkeletonItem colors={colors} style={{ width: '60%', height: rvs(12), marginTop: rvs(8), borderRadius: rs(6) }} />
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles({ rs, rvs, width, height }) {
  const isLandscape = width > height;
  const isTablet = width >= 768;
  const isLargeLandscape = isLandscape && width >= 600;
  // horizontal padding dynamic via rs() + orientation
  const containerHPad = isTablet ? rs(24) : isLargeLandscape ? rs(20) : rs(16);
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F2',
    paddingHorizontal: containerHPad, // dynamic horizontal padding
    paddingVertical: rvs(16),
  },
  skeleton: {
    backgroundColor: '#E1E9EE',
    borderRadius: rs(6),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rvs(20),
  },
  avatar: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
  },
  iconBtn: {
    width: rs(28),
    height: rs(28),
    borderRadius: rs(14),
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    paddingHorizontal: isLargeLandscape ? rs(20) : rs(16), // dynamic horizontal padding
    paddingVertical: rvs(16),
    marginBottom: rvs(16),
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyBox: {
    width: '100%',
    height: rvs(48),
    borderRadius: rs(12),
    marginVertical: rvs(14),
  },
  statusBox: {
    width: '31%',
    height: rvs(80),
    borderRadius: rs(12),
  },
  banner: {
    width: '100%',
    height: rvs(70),
    borderRadius: rs(12),
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: rs(6),
    marginVertical: rvs(16),
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: rs(14),
    // horizontal: 3-4 columns on tablet/landscape
  },
  gridCard: {
    width: isTablet ? '31.5%' : isLargeLandscape ? '48%' : '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(14),
    paddingHorizontal: rs(12), // dynamic horizontal padding
    paddingVertical: rvs(12),
    height: rvs(110),
  },
  });
}
