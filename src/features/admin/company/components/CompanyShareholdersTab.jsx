import React from 'react';
import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './companyDetailsStyles';
import {
  getShareholderEmail,
  getShareholderName,
  getShareholderPhone,
} from '../utils/companyDetails';

const CompanyShareholdersTab = ({ company }) => {
  const shareholders = company.shareholders || [];

  if (!shareholders.length) {
    return (
      <View style={styles.emptyBox}>
        <Ionicons name="people-outline" size={32} color="#94A3B8" />
        <Text style={styles.emptyText}>No shareholders added yet</Text>
      </View>
    );
  }

  return (
    <View>
      {shareholders.map((shareholder, index) => {
        const name = getShareholderName(shareholder);
        const email = getShareholderEmail(shareholder);
        const phone = getShareholderPhone(shareholder);
        return (
          <View
            key={`${shareholder.clientId?._id || index}`}
            style={styles.shareholderCard}>
            <View style={styles.shareholderTopRow}>
              <View style={styles.shareholderAvatar}>
                <Text style={styles.shareholderAvatarText}>
                  {(name[0] || '?').toUpperCase()}
                </Text>
              </View>
              <View style={styles.shareholderTextWrap}>
                <Text style={styles.shareholderName} numberOfLines={1}>
                  {name}
                </Text>
                {email ? (
                  <Text style={styles.shareholderMeta} numberOfLines={1}>
                    {email}
                  </Text>
                ) : null}
                {phone ? (
                  <Text style={styles.shareholderMeta} numberOfLines={1}>
                    {phone}
                  </Text>
                ) : null}
              </View>
              <View style={styles.sharePill}>
                <Text style={styles.sharePillText}>
                  {Number(shareholder.sharePercentage || 0)}%
                </Text>
              </View>
            </View>
            <View style={styles.shareholderFooter}>
              <Ionicons name="briefcase-outline" size={12} color="#64748B" />
              <Text style={styles.shareholderDesignation}>
                {shareholder.designation || 'Shareholder'}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default CompanyShareholdersTab;
