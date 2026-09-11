import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

// Reusable Pulse Skeleton Component
const SkeletonItem = ({ style }) => {
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

  return <Animated.View style={[stylesStatic.skeleton, style, { opacity }]} />;
};

export default function InvoiceDashboardSkeleton() {
  const { rs, rvs, width, height } = useResponsive();
  const styles = useMemo(() => createStyles({ rs, rvs, width, height }), [rs, rvs, width, height]);
  return (
    <View style={styles.mainWrapper}>
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
      >
      {/* 1. Company Name Tag */}
      <SkeletonItem style={{ width: rs(190), height: rvs(18), marginBottom: rvs(16), borderRadius: rs(6) }} />

      {/* 2. Search Bar */}
        <SkeletonItem style={styles.searchBar} />

        {/* 3. Sub-header (Showing Invoices count & Sort drop-down) */}
        <View style={[styles.rowBetween, { marginVertical: rvs(18) }]}>
          <SkeletonItem style={{ width: rs(130), height: rvs(16), borderRadius: rs(6) }} />
          <SkeletonItem style={{ width: rs(100), height: rvs(16), borderRadius: rs(6) }} />
        </View>

        {/* 4. Invoice Item Cards List - horizontal responsive: 2 columns on landscape */}
        <View style={styles.cardList}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.invoiceCard}>
            {/* Top Row: Building Icon, Invoice Details & Amount */}
            <View style={styles.rowBetween}>
              <View style={styles.rowAlign}>
                <SkeletonItem style={styles.buildingIcon} />
                <View style={{ marginLeft: rs(10) }}>
                  <SkeletonItem style={{ width: rs(130), height: rvs(16), marginBottom: rvs(6), borderRadius: rs(6) }} />
                  <SkeletonItem style={{ width: rs(100), height: rvs(12), borderRadius: rs(6) }} />
                </View>
              </View>
              <SkeletonItem style={{ width: rs(70), height: rvs(20), borderRadius: rs(6) }} />
            </View>

            {/* Divider Line */}
            <View style={styles.divider} />

            {/* Bottom Row: Created/Due Dates, View Icon & Status Pill */}
            <View style={styles.rowBetween}>
              <View>
                <SkeletonItem style={{ width: rs(120), height: rvs(12), marginBottom: rvs(6), borderRadius: rs(6) }} />
                <SkeletonItem style={{ width: rs(110), height: rvs(12), borderRadius: rs(6) }} />
              </View>
              <View style={styles.rowAlign}>
                <SkeletonItem style={styles.viewBtn} />
                <SkeletonItem style={styles.statusPill} />
              </View>
            </View>
          </View>
        ))}
        </View>
      </ScrollView>

      {/* 6. Bottom Navigation Bar Skeleton */}
      <View style={styles.bottomTabBar}>
        {[1, 2, 3, 4, 5].map((tab) => (
          <View key={tab} style={styles.tabItem}>
            <SkeletonItem style={{ width: rs(24), height: rs(24), borderRadius: rs(6), marginBottom: rvs(4) }} />
            <SkeletonItem style={{ width: rs(36), height: rvs(10), borderRadius: rs(3) }} />
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
  const hPad = isTablet ? rs(24) : isLargeLandscape ? rs(20) : rs(16);
  return StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#F5F6ED',
  },
  container: {
    paddingHorizontal: hPad, // dynamic horizontal padding
    paddingTop: rvs(20),
    paddingBottom: rvs(20),
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchBar: {
    width: '100%',
    height: rvs(48),
    borderRadius: rs(24),
  },
  cardList: {
    flexDirection: isLargeLandscape ? 'row' : 'column',
    flexWrap: isLargeLandscape ? 'wrap' : 'nowrap',
    gap: rs(14),
    justifyContent: isLargeLandscape ? 'space-between' : 'flex-start',
  },
  invoiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    paddingHorizontal: rs(16), // dynamic horizontal padding
    paddingVertical: rvs(16),
    marginBottom: isLargeLandscape ? 0 : rvs(14),
    width: isLargeLandscape ? '48.5%' : '100%',
  },
  buildingIcon: {
    width: rs(42),
    height: rs(42),
    borderRadius: rs(21),
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: rvs(12),
  },
  viewBtn: {
    width: rs(44),
    height: rvs(28),
    borderRadius: rs(14),
    marginRight: rs(8),
  },
  statusPill: {
    width: rs(60),
    height: rvs(28),
    borderRadius: rs(14),
  },
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: rvs(65),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    paddingHorizontal: hPad, // dynamic horizontal padding
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  });
}

// static fallback for SkeletonItem default
const stylesStatic = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E5CE',
    borderRadius: 6,
  },
});
