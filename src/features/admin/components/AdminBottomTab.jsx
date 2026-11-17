import { font } from '../../../theme/typography';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

const AdminBottomTab = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const active = route.name;

  const tabs = [
    { key: 'AdminHome', label: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'AdminHome' },
    { key: 'AdminCompany', label: 'Registered Cos', icon: 'business-outline', activeIcon: 'business', route: 'AdminCompany' },
    { key: 'AdminMessages', label: 'Messages', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses', route: 'AdminChatList' },
    { key: 'AdminDocuments', label: 'Documents', icon: 'document-text-outline', activeIcon: 'document-text', route: 'AdminDocuments' },
    { key: 'AdminProfile', label: 'Profile', icon: 'person-outline', activeIcon: 'person', route: 'AdminProfile' },
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
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={font.display}
                color={isActive ? '#1E3A8A' : '#64748B'}
              />
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
    paddingTop: 9,
    paddingBottom: 8,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: font.xs,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '500',
  },
  activeNavText: {
    color: '#1E3A8A',
    fontWeight: '700',
  },
});
