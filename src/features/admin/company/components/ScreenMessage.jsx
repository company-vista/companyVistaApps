import React from 'react';
import {
  ActivityIndicator,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenShell from './ScreenShell';
import TopNav from './TopNav';
import { styles } from './companyDetailsStyles';

const ScreenMessage = ({ navigation, loading, message, onRetry }) => (
  <ScreenShell>
    <StatusBar
      barStyle="dark-content"
      backgroundColor="#FFFFFF"
      translucent
    />
    <TopNav navigation={navigation} title="Company" />
    <View style={styles.centeredState}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.stateText}>Loading company...</Text>
        </>
      ) : (
        <>
          <Ionicons name="alert-circle-outline" size={40} color="#DC2626" />
          <Text style={styles.errorText}>{message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  </ScreenShell>
);

export default ScreenMessage;
