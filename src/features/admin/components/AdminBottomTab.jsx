import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

const AdminBottomTab = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const active = route.name;

  const tabs = [
    { key: 'AdminHome', label: 'Home', icon: '🏠', route: 'AdminHome' },
    { key: 'AdminCompany', label: 'Company', icon: '🏢', route: 'AdminCompany' },
    { key: 'AdminMessages', label: 'Messages', icon: '💬', route: 'AdminChatList' },
    { key: 'AdminDocuments', label: 'Documents', icon: '📄', route: 'AdminDocuments' },
    { key: 'AdminProfile', label: 'Profile', icon: '👤', route: 'AdminProfile' },
  ];

  const handlePress = (tab) => {
    if (!tab.route) return;
    if (active === tab.route) return;
    try {
      navigation.navigate(tab.route);
    } catch (e) {
      console.log('AdminBottomTab navigation error:', e);
      Alert.alert('Error', 'Unable to open this screen');
    }
  };

  return (
    <View style={[styles.bottomNav, { paddingBottom: insets.bottom || 0 }]}>
      <View style={styles.navInner}>
        {tabs.map(tab => {
          const isActive = active === tab.route;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.navItem}
              activeOpacity={0.7}
              onPress={() => handlePress(tab)}>
              <Text style={[styles.navIcon, isActive && styles.activeNavIcon]}>{tab.icon}</Text>
              <Text style={[styles.navText, isActive && styles.activeNavText]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default AdminBottomTab;

const styles = StyleSheet.create({
  bottomNav: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  navInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 16,
    opacity: 0.5,
  },
  activeNavIcon: {
    opacity: 1,
  },
  navText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  activeNavText: {
    color: '#1E3A8A',
    fontWeight: '700',
  },
});
