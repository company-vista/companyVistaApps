import React from 'react';
import { View } from 'react-native';
import { HomeHeader } from './HomeHeader';

export function FixedHomeHeader({ insets, colors, contentHeight = 72, displayName, notificationCount, bellRotation, onSearchPress, onNotificationPress }) {
    return (<View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: insets.top + contentHeight,
        zIndex: 30,
        justifyContent: 'center',
        paddingTop: insets.top,
        backgroundColor: colors.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    }}>
        <HomeHeader displayName={displayName} notificationCount={notificationCount} bellRotation={bellRotation} onSearchPress={onSearchPress} onNotificationPress={onNotificationPress} colors={colors} />
    </View>);
}
