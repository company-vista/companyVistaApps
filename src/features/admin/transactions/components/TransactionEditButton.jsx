import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TransactionEditButton = ({ onPress }) => (
  <TouchableOpacity
    style={styles.button}
    accessibilityRole="button"
    accessibilityLabel="Edit transaction"
    onPress={onPress}>
    <Ionicons name="create-outline" size={17} color="#2563EB" />
  </TouchableOpacity>
);

export default TransactionEditButton;

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
