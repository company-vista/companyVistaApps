import React from 'react';
import { View } from 'react-native';
import DashboardSkeleton from '../../../../components/skeletons/HomeScreen';

export function DashboardOverlay({ insets, colors }) {
    return (<View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        paddingTop: insets.top,
        backgroundColor: colors.surface,
    }}>
        <DashboardSkeleton />
    </View>);
}
