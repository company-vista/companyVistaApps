import React from 'react';
import { Pressable, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from '../HomeScreen.styles';
const tabs = [
    { id: 'home', title: 'Home', icon: 'home' },
    { id: 'reports', title: 'Compliance', icon: 'check-square-o' },
    { id: 'billing', title: 'Invoice', icon: 'file-text-o' },
    { id: 'documents', title: 'Document', icon: 'folder-o' },
    { id: 'more', title: 'More', icon: 'ellipsis-h' },
];
export function BottomNavBar({ activeTab, isMoreOpen, onTabPress, colors, safeAreaInsets, }) {
    return (<View style={[
            styles.bottomNav,
            {
                backgroundColor: colors.background,
                paddingBottom: safeAreaInsets.bottom + 10,
            },
        ]}>
      {tabs.map(tab => (<Pressable key={tab.title} onPress={() => onTabPress(tab.id)} style={styles.navItem}>
          <FontAwesome name={tab.icon} size={22} style={{ width: 24, textAlign: 'center' }} color={activeTab === tab.id || (tab.id === 'more' && isMoreOpen)
                ? colors.accent
                : colors.muted}/>
          <Text numberOfLines={1} adjustsFontSizeToFit style={[
                styles.navText,
                { color: activeTab === tab.id || (tab.id === 'more' && isMoreOpen) ? colors.accent : colors.muted },
                activeTab === tab.id || (tab.id === 'more' && isMoreOpen) ? styles.activeNavText : null,
            ]}>
            {tab.title}
          </Text>
        </Pressable>))}
    </View>);
}
