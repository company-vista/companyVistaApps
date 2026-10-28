import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './formationDocumentsStyles';

const DOCUMENT_TYPES = [
  {
    key: 'formation',
    icon: 'document-text-outline',
    label: 'Initial Resolution',
    description:
      'Congratulations letter + Initial Resolutions (officers, directors, filing details).',
    types: ['inc'],
  },
  {
    key: 'initialResolutionLLC',
    icon: 'newspaper-outline',
    label: 'Initial Resolution (LLC)',
    description:
      'Congratulations letter + Initial Resolutions for an LLC (members, organizer, filing details).',
    types: ['llc'],
  },
  {
    key: 'membership',
    icon: 'people-outline',
    label: 'Membership Certificate',
    description:
      "Certifies one member's ownership stake in the company. Generate one per member.",
    types: [],
  },
  {
    key: 'bylaws',
    icon: 'file-tray-full-outline',
    label: 'Corporate Bylaws',
    description:
      "Full multi-page bylaws document with the company's shareholder table and secretary signature.",
    types: ['inc'],
  },
  {
    key: 'stock',
    icon: 'ribbon-outline',
    label: 'Stock Certificate',
    description:
      "Certifies one shareholder's share ownership. Generate one per shareholder.",
    types: ['inc'],
  },
  {
    key: 'forms',
    icon: 'documents-outline',
    label: 'Forms & Certificates',
    description:
      'Certification of Members + Membership Certificate + Resolution to Open a Bank Account, in one bundle.',
    types: ['llc'],
  },
  {
    key: 'ss4',
    icon: 'id-card-outline',
    label: 'Form SS-4',
    description:
      'IRS Application for Employer Identification Number — fill details and generate.',
  },
  {
    key: 'form5472',
    icon: 'globe-outline',
    label: 'Form 5472',
    description:
      'IRS Information Return of a 25%-Foreign-Owned Corporation — fill details and generate.',
  },
  {
    key: 'federalFiling',
    types: [],
    icon: 'flag-outline',
    label: 'Federal Filing Accepted',
    description:
      "Notice confirming the company's federal corporation filing was accepted by the IRS.",
  },
  {
    key: 'form8821',
    icon: 'shield-checkmark-outline',
    label: 'Form 8821',
    description:
      'IRS Tax Information Authorization — authorizes a designee to receive confidential tax info.',
  },
  {
    key: 'operatingAgreement',
    icon: 'book-outline',
    label: 'Operating Agreement',
    description:
      'Full LLC operating agreement — member-specific content and signature page.',
    types: ['llc'],
  },
];

const getDocumentTypesForCompany = company => {
  const type = String(company?.companyType || '')
    .trim()
    .toUpperCase();
  const isLLC = type === 'LLC';
  const isInc = type === 'INC' || /CORP/.test(type);
  if (!isLLC && !isInc) return DOCUMENT_TYPES;
  const bucket = isLLC ? 'llc' : 'inc';
  return DOCUMENT_TYPES.filter(
    d => !d.types || d.types.length === 0 || d.types.includes(bucket),
  );
};

const FormationDocumentPicker = ({ company, visible, onClose, onSelect }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.backdrop}>
      <View style={styles.pickerCard}>
        <View style={styles.pickerHeader}>
          <View>
            <Text style={styles.pickerTitle}>Which document?</Text>
            <Text style={styles.pickerSubtitle}>
              Choose a formation document to generate
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#475569" />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.pickerList}
          showsVerticalScrollIndicator={false}
        >
          {getDocumentTypesForCompany(company).map(docType => (
            <TouchableOpacity
              key={docType.key}
              style={styles.pickerItem}
              onPress={() => onSelect(docType.key)}
              activeOpacity={0.8}
            >
              <View style={styles.pickerIconWrap}>
                <Ionicons name={docType.icon} size={18} color="#4F46E5" />
              </View>
              <View style={styles.pickerTextWrap}>
                <Text style={styles.pickerItemTitle}>{docType.label}</Text>
                <Text style={styles.pickerItemDesc} numberOfLines={2}>
                  {docType.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export default FormationDocumentPicker;
