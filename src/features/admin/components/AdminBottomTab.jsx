import { font } from '../../../theme/typography';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeColors } from '../../../theme/colors';

const AdminBottomTab = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const colors = useThemeColors();
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
    <View
      style={[
        styles.bottomNav,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom || 0,
        },
      ]}>
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
                color={isActive ? colors.accent : colors.muted}
              />
              <Text
                style={[
                  styles.navText,
                  { color: isActive ? colors.accent : colors.muted },
                  isActive && styles.activeNavText,
                ]}>
                {tab.label}
              </Text>
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
    borderTopWidth: 1,
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
    marginTop: 6,
    fontWeight: '500',
  },
  activeNavText: {
    fontWeight: '700',
  },
});
