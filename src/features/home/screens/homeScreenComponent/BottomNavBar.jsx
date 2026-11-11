import React from 'react';
import { Pressable, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from '../HomeScreen.styles';
const NAV_ICON_SIZE = 22;
const navIconContainerStyle = {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
};
const tabs = [
    { id: 'home', title: 'Home', icon: 'home' },
    { id: 'reports', title: 'Compliance', icon: 'check-square-o' },
    { id: 'billing', title: 'Invoice', icon: 'file-text-o' },
    { id: 'documents', title: 'Document', icon: 'folder-o' },
    { id: 'more', title: 'More', icon: 'ellipsis-h' },
]; 
export function BottomNavBar({ activeTab, isMoreOpen, onTabPress, colors, safeAreaInsets, }) {
    const bottomNavStyle = {
        backgroundColor: colors.mode === 'dark' ? colors.background : '#FFFFFF',
        paddingBottom: safeAreaInsets.bottom + 10,
    };
    return (<View style={[
        styles.bottomNav,
        bottomNavStyle,
    ]}>
        {tabs.map(tab => (<Pressable key={tab.title} onPress={() => onTabPress(tab.id)} style={styles.navItem}>
            <View style={navIconContainerStyle}>
                <FontAwesome name={tab.icon} size={NAV_ICON_SIZE} color={activeTab === tab.id || (tab.id === 'more' && isMoreOpen)
                    ? colors.accent
                    : colors.muted} />
            </View>
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
