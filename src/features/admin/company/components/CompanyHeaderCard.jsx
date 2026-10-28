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

const CompanyHeaderCard = ({ company, onEdit, onUpload, onFormationDocs }) => (
  <View style={styles.headerCard}>
    <View style={styles.headerTopRow}>
      <View style={styles.companyAvatar}>
        <Text style={styles.companyAvatarText}>{getInitial(company)}</Text>
      </View>
      <View style={styles.headerTextWrap}>
        <Text style={styles.companyName} numberOfLines={2}>
          {getCompanyName(company)}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color="#64748B" />
          <Text style={styles.locationText} numberOfLines={1}>
            {getCompanyLocation(company)}
          </Text>
        </View>
      </View>
      <StatusPill
        label={formatLabel(company.registrationStatus || 'pending')}
        tone={getStatusTone(company.registrationStatus)}
      />
    </View>

    <View style={styles.headerActionsRow}>
      <TouchableOpacity style={styles.headerAction} onPress={onEdit}>
        <Ionicons name="create-outline" size={15} color="#2563EB" />
        <Text style={styles.headerActionText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerAction} onPress={onUpload}>
        <Ionicons name="cloud-upload-outline" size={15} color="#7C3AED" />
        <Text style={styles.headerActionText}>Upload</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerAction} onPress={onFormationDocs}>
        <Ionicons name="document-text-outline" size={15} color="#059669" />
        <Text style={styles.headerActionText}>Formation Docs</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default CompanyHeaderCard;
