import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
const AgentRenewalScreen = () => {
    return (<View style={styles.container}>
      <Text style={styles.title}>Agent Renewal</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>);
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: 500,
        color: '#1a1a1a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 12,
        marginTop: 2,
        color: '#6b6b6b',
    },
});
export default AgentRenewalScreen;
