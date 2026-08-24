import React from 'react';
import { Animated, Pressable, Text } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from '../HomeScreen.styles';
export function QuickActionFab({ isFabMenuOpen, fabMenuOpacity, fabMenuScale, fabMenuTranslateY, fabIconRotate, onToggleMenu, onCloseMenu, onTransactionsPress, onAddCompanyPress, onRegistrationTrackingPress, colors, safeAreaInsets, }) {
    return (<>
      {isFabMenuOpen ? (<>
          <Pressable accessibilityRole="button" accessibilityLabel="Close quick actions" onPress={onCloseMenu} style={styles.fabMenuBackdrop}/>
          <Animated.View style={[
                styles.fabMenu,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    bottom: safeAreaInsets.bottom + 168,
                    opacity: fabMenuOpacity,
                    transform: [
                        { translateY: fabMenuTranslateY },
                        { scale: fabMenuScale },
                    ],
                },
            ]}>
            <Pressable onPress={() => {
                onCloseMenu();
                onAddCompanyPress();
            }} style={styles.fabMenuItem}>
              <FontAwesome name="building-o" size={19} color="#2563eb"/>
              <Text style={[styles.fabMenuText, { color: colors.text }]}>
                Add Company
              </Text>
            </Pressable>
            <Pressable onPress={() => {
                onCloseMenu();
                onRegistrationTrackingPress();
            }} style={styles.fabMenuItem}>
              <FontAwesome name="list-alt" size={19} color="#0f766e"/>
              <Text style={[styles.fabMenuText, { color: colors.text }]}>
                Registration Tracking
              </Text>
            </Pressable>
            <Pressable onPress={() => {
                onCloseMenu();
                onTransactionsPress();
            }} style={styles.fabMenuItem}>
              <FontAwesome name="credit-card" size={19} color="#f59e0b"/>
              <Text style={[styles.fabMenuText, { color: colors.text }]}>
                Transaction
              </Text>
            </Pressable>
            <Pressable style={styles.fabMenuItem}>
              <FontAwesome name="comments-o" size={19} color="#7c3aed"/>
              <Text style={[styles.fabMenuText, { color: colors.text }]}>
                Support
              </Text>
            </Pressable>
          </Animated.View>
        </>) : null}

      <Pressable onPress={onToggleMenu} style={[
            styles.fab,
            {
                backgroundColor: colors.mode === 'dark' ? colors.cardElevated : colors.buttonBackground,
                borderColor: colors.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderWidth: 1,
                bottom: safeAreaInsets.bottom + 104,
            },
        ]}>
        <Animated.View style={{ transform: [{ rotate: fabIconRotate }] }}>
          <FontAwesome name="plus" size={24} color={colors.textOnDark} style={styles.fabIcon}/>
        </Animated.View>
      </Pressable>
    </>);
}
