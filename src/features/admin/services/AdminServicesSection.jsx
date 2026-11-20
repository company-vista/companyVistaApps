import { font } from '../../../theme/typography';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../../theme/colors';

const services = [
  { key: 'change-requests', title: 'Change Requests', icon: 'document-text-outline' },
  { key: 'services', title: 'Services Requests', icon: 'briefcase-outline' },
  { key: 'itin-apps', title: 'ITIN Apps', icon: 'card-outline' },
  { key: 'company-claims', title: 'Company Claims', icon: 'shield-checkmark-outline' },
];

const AdminServicesSection = () => {
  const navigation = useNavigation();
  const colors = useThemeColors();

  const handlePress = key => {
    if (key === 'change-requests') {
      navigation.navigate('AdminChangeRequests');
    } else if (key === 'services') {
      navigation.navigate('AdminServiceRequests');
    } else if (key === 'itin-apps') {
      navigation.navigate('AdminItin');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Services & Requests
        </Text>
      </View>
      <View style={styles.grid}>
        {services.map(item => (
          <TouchableOpacity
            key={item.key}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => handlePress(item.key)}>
            <View
              style={[
                styles.cardIconWrap,
                { backgroundColor: colors.cardHighlight },
              ]}>
              <Ionicons
                name={item.icon}
                size={font.displayMedium}
                color={colors.accent}
              />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default AdminServicesSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    marginTop: 16,
  },
  header: {
    paddingBottom: 0,
  },
  headerTitle: {
    fontSize: font.base,
    fontWeight: '700',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingBottom: 6,
    gap: 20,
  },
  card: {
    width: 64,
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 10,
    // borderWidth: 1,
    // borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    // elevation: 1,
    // shadowColor: '#000',
    // shadowOpacity: 0.02,
    // shadowRadius: 3,
    // shadowOffset: { width: 0, height: 1 },
  },
  cardTitle: {
    fontSize: font.sm,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    width: 66,
    minHeight: 24,
  },
});
