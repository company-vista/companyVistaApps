import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

export default function Compliance() {
  const complianceActions = [
    {
      id: '1',
      title: 'Agent Renewal Services',
      subtitle: 'Registered agent',
      date: 'Jun 5, 2027',
      status: 'Pending',
      statusColor: '#D97706',
      statusBg: '#FEF3C7',
      iconName: 'time-outline',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      hasButton: true,
      buttonText: 'Renew Now',
    },
    {
      id: '2',
      title: 'Address Renewal Services',
      subtitle: 'Registered address',
      date: 'Mar 12, 2027',
      status: 'Active',
      statusColor: '#16A34A',
      statusBg: '#DCFCE7',
      iconName: 'time-outline',
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
      hasButton: false,
    },
    {
      id: '3',
      title: 'Federal Filing Services',
      subtitle: 'Annual federal tax',
      date: 'Mar 15, 2026',
      status: 'Pending',
      statusColor: '#D97706',
      statusBg: '#FEF3C7',
      iconName: 'alert-circle-outline',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      hasButton: true,
      buttonText: 'Renew Now',
    },
    {
      id: '4',
      title: 'Annual Filing Services',
      subtitle: 'State compliance',
      date: 'Jul 1, 2026',
      status: 'Pending',
      statusColor: '#D97706',
      statusBg: '#FEF3C7',
      iconName: 'checkmark-circle-outline',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      hasButton: false,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* --- TOP HEADER --- */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Ionicons name="globe-outline" size={24} color="#1E3A8A" />
          </View>
          <Text style={styles.headerTitle}>Hi, Company vista</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={20} color="#1E293B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={20} color="#1E293B" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>4</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- MAIN SCROLLABLE CONTENT --- */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- USER PROFILE CARD --- */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={22} color="#64748B" />
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Company Vista</Text>
            <Text style={styles.userEmail}>shivam@gmail.com</Text>
          </View>
        </View>

        {/* --- COMPLIANCE HEALTH CARD --- */}
        <View style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <Text style={styles.healthTitle}>Compliance Health</Text>
            <Text style={styles.healthPercentage}>25%</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '25%' }]} />
          </View>

          <Text style={styles.healthSubtitle}>1 of 4 actions complete</Text>
        </View>

        {/* --- SECTION TITLE --- */}
        <Text style={styles.sectionTitle}>COMPLIANCE ACTIONS</Text>

        {/* --- ACTIONS LIST --- */}
        {complianceActions.map((item) => (
          <View key={item.id} style={styles.actionCard}>
            <View style={styles.cardTopRow}>
              {/* Icon */}
              <View style={[styles.actionIcon, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.iconName} size={22} color={item.iconColor} />
              </View>

              {/* Details */}
              <View style={styles.actionDetails}>
                <Text style={styles.actionTitle}>{item.title}</Text>
                <Text style={styles.actionSubtitle}>{item.subtitle}</Text>

                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={14} color="#64748B" />
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
              </View>

              {/* Status Badge & Arrow */}
              <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: item.statusBg }]}>
                  <Text style={[styles.statusText, { color: item.statusColor }]}>
                    {item.status}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748B" style={{ marginTop: 8 }} />
              </View>
            </View>

            {/* Action Button */}
            {item.hasButton && (
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>{item.buttonText}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {/* --- BOTTOM NAVIGATION BAR --- */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={22} color="#64748B" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="checkbox-outline" size={22} color="#E05638" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Compliance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="document-text-outline" size={22} color="#64748B" />
          <Text style={styles.navLabel}>Invoice</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Feather name="folder" size={22} color="#64748B" />
          <Text style={styles.navLabel}>Document</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#64748B" />
          <Text style={styles.navLabel}>More</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#F8FAFC',
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
  },
  healthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthTitle: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  healthPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#15803D',
    borderRadius: 4,
  },
  healthSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionDetails: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#1D638F',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  navItem: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#E05638',
    fontWeight: '600',
  },
});