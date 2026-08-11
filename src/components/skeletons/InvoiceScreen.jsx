import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';

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

  return <Animated.View style={[styles.skeleton, style, { opacity }]} />;
};

export default function InvoiceDashboardSkeleton() {
  return (
    <View style={styles.mainWrapper}>
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
      >
      {/* 1. Company Name Tag */}
      <SkeletonItem style={{ width: 190, height: 18, marginBottom: 16 }} />

      {/* 2. Search Bar */}
        <SkeletonItem style={styles.searchBar} />

        {/* 3. Sub-header (Showing Invoices count & Sort drop-down) */}
        <View style={[styles.rowBetween, { marginVertical: 18 }]}>
          <SkeletonItem style={{ width: 130, height: 16 }} />
          <SkeletonItem style={{ width: 100, height: 16 }} />
        </View>

        {/* 4. Invoice Item Cards List */}
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.invoiceCard}>
            {/* Top Row: Building Icon, Invoice Details & Amount */}
            <View style={styles.rowBetween}>
              <View style={styles.rowAlign}>
                <SkeletonItem style={styles.buildingIcon} />
                <View style={{ marginLeft: 10 }}>
                  <SkeletonItem style={{ width: 130, height: 16, marginBottom: 6 }} />
                  <SkeletonItem style={{ width: 100, height: 12 }} />
                </View>
              </View>
              <SkeletonItem style={{ width: 70, height: 20 }} />
            </View>

            {/* Divider Line */}
            <View style={styles.divider} />

            {/* Bottom Row: Created/Due Dates, View Icon & Status Pill */}
            <View style={styles.rowBetween}>
              <View>
                <SkeletonItem style={{ width: 120, height: 12, marginBottom: 6 }} />
                <SkeletonItem style={{ width: 110, height: 12 }} />
              </View>
              <View style={styles.rowAlign}>
                <SkeletonItem style={styles.viewBtn} />
                <SkeletonItem style={styles.statusPill} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 6. Bottom Navigation Bar Skeleton */}
      <View style={styles.bottomTabBar}>
        {[1, 2, 3, 4, 5].map((tab) => (
          <View key={tab} style={styles.tabItem}>
            <SkeletonItem style={{ width: 24, height: 24, borderRadius: 6, marginBottom: 4 }} />
            <SkeletonItem style={{ width: 36, height: 10, borderRadius: 3 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#F5F6ED', // UI Color matching
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  skeleton: {
    backgroundColor: '#E0E5CE', // Matches background color tone
    borderRadius: 6,
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
    height: 48,
    borderRadius: 24, // Rounded pill search bar
  },
  invoiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  buildingIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  viewBtn: {
    width: 44,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  statusPill: {
    width: 60,
    height: 28,
    borderRadius: 14,
  },
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 65,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});