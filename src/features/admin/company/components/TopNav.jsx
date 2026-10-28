import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './companyDetailsStyles';

const TopNav = ({ navigation, title }) => (
  <View style={styles.topNav}>
    <TouchableOpacity
      style={styles.topNavButton}
      onPress={() =>
        navigation.canGoBack()
          ? navigation.goBack()
          : navigation.navigate('AdminHome')
      }
      hitSlop={8}>
      <Ionicons name="arrow-back" size={20} color="#0F172A" />
    </TouchableOpacity>
    <Text style={styles.topNavTitle} numberOfLines={1}>
      {title}
    </Text>
    <View style={styles.topNavButton} />
  </View>
);

export default TopNav;
