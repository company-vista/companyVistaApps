import React from 'react';
import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { editColors, sharedStyles } from './editCompanyStyles';

const SectionCard = ({ icon, title, subtitle, children, style }) => (
  <View style={[sharedStyles.section, style]}>
    {title || icon ? (
      <View style={sharedStyles.sectionHeader}>
        {icon ? (
          <View style={sharedStyles.sectionIcon}>
            <Ionicons name={icon} size={18} color={editColors.primary} />
          </View>
        ) : null}
        <View style={sharedStyles.sectionTextWrap}>
          {title ? <Text style={sharedStyles.sectionTitle}>{title}</Text> : null}
          {subtitle ? (
            <Text style={sharedStyles.sectionSubtitle}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
    ) : null}
    {children}
  </View>
);

export default SectionCard;
