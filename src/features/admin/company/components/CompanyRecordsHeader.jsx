import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import StatusPill from './StatusPill';
import { styles } from './companyDetailsStyles';
import {
  formatLabel,
  getCompanyLocation,
  getCompanyName,
  getInitial,
  getStatusTone,
} from '../utils/companyDetails';

const CompanyRecordsHeader = ({ company, onEdit, onUpload }) => (
  <View style={styles.recordsHeaderCard}>
    <View style={styles.headerTopRow}>
      <View style={styles.companyAvatar}>
        <Text style={styles.companyAvatarText}>{getInitial(company)}</Text>
      </View>
      <View style={styles.headerTextWrap}>
        <Text style={styles.recordsCompanyName} numberOfLines={2}>
          {getCompanyName(company)}
        </Text>
        <Text style={styles.recordsLocation} numberOfLines={1}>
          {getCompanyLocation(company)}
        </Text>
      </View>
      <StatusPill
        label={formatLabel(company.registrationStatus || 'pending')}
        tone={getStatusTone(company.registrationStatus)}
      />
    </View>
    <View style={styles.recordsActionsRow}>
      <TouchableOpacity
        style={styles.recordsActionButton}
        onPress={onEdit}
        activeOpacity={0.8}>
        <Ionicons name="create-outline" size={15} color="#2563EB" />
        <Text style={styles.recordsEditText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.recordsActionButton}
        onPress={onUpload}
        activeOpacity={0.8}>
        <Ionicons name="cloud-upload-outline" size={15} color="#7C3AED" />
        <Text style={styles.recordsEditText}>Upload</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default CompanyRecordsHeader;
