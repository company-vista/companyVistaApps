import React from 'react';
import { Animated, Image, Pressable, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import logoImage from '../../../../assets/images/logo.jpg';
import styles from '../HomeScreen.styles';

type HomeHeaderProps = {
  displayName: string;
  notificationCount: number;
  bellRotation: any;
  onSearchPress: () => void;
  onNotificationPress: () => void;
  colors: any;
};

export function HomeHeader({
  displayName,
  notificationCount,
  bellRotation,
  onSearchPress,
  onNotificationPress,
  colors,
}: HomeHeaderProps) {
  return (
    <View style={styles.header}>
      <Image
        source={logoImage}
        style={styles.avatar}
      />
      <Text numberOfLines={1} style={[styles.greeting, { color: colors.text }]}>
        Hi, {displayName || 'User'}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open search"
        onPress={onSearchPress}
        style={styles.headerIcon}>
        <FontAwesome name="search" size={20} color={colors.muted} />
      </Pressable>
      <Pressable
        onPress={onNotificationPress}
        style={[styles.headerIcon, styles.notificationButton]}>
        <Animated.View style={{ transform: [{ rotate: bellRotation }] }}>
          <FontAwesome name="bell-o" size={21} color={colors.text} />
        </Animated.View>
        {notificationCount > 0 ? (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {notificationCount > 9 ? '9+' : String(notificationCount)}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
