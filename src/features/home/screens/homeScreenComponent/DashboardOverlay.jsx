import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function DashboardOverlay({ insets, colors }) {
    return (<View style={[styles.overlay, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
        <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.accent} />
        </View>
    </View>);
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
