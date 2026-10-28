import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './companyDetailsStyles';

const ScreenShell = ({ children }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {children}
    </View>
  );
};

export default ScreenShell;
