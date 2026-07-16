import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions
} from 'react-native';
import { useThemeColors } from '../../theme/colors';

const { width } = Dimensions.get('window');

const CompanyVistaReferral: React.FC = () => {
  const colors = useThemeColors();

  return (
    <View style={styles.cardContainer}>

      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <Text style={[styles.headerI, { color: colors.text }]}>I</Text>
          <Text style={styles.heartIcon}>❤️</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Company Vista</Text>
        </View>
      </View>

      {/* Illustration Area */}
      <View style={styles.imageWrapper}>
        <Image
          source={require('../../assets/images/referals.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 16,
  },
  headerContainer: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerI: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 11,
  },
  heartIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  imageWrapper: {
    width: '100%',
    height: width * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  illustration: {
    width: '95%',
    height: '100%',
  },
});

export default CompanyVistaReferral;
