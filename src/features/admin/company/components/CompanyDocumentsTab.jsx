import React, { useCallback } from 'react';
import { Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../../../../store/hooks';
import { styles } from './companyDetailsStyles';
import { formatDate, getDocumentGroups } from '../utils/companyDetails';
import { API_BASE_URL } from '../../../../config/api';

const DOCUMENT_GROUPS = [
  { key: 'mailsAndLetters', title: 'Mails & Letters' },
  { key: 'registration', title: 'Registration Documents' },
  { key: 'tax', title: 'Tax Files' },
  { key: 'annual', title: 'Annual State Filings' },
  { key: 'other', title: 'Other Documents' },
];

const getGroupKey = document => {
  const value = `${document?.sourceGroup || ''} ${
    document?.documentType || ''
  }`.toLowerCase();
  if (value.includes('registration')) return 'registration';
  if (value.includes('tax')) return 'tax';
  if (value.includes('annual') || value.includes('state filing'))
    return 'annual';
  if (value.includes('mail') || value.includes('letter')) {
    return 'mailsAndLetters';
  }
  return 'other';
};

const buildDocumentGroups = documents => {
  const groups = DOCUMENT_GROUPS.map(group => ({ ...group, items: [] }));
  const groupMap = new Map(groups.map(group => [group.key, group]));
  documents.forEach(document => {
    if (document) {
      groupMap.get(getGroupKey(document)).items.push(document);
    }
  });
  return groups;
};

const getFileName = document => {
  return (
    document?.originalFileName ||
    document?.originalname ||
    document?.fileName ||
    document?.filename ||
    document?.label ||
    document?.documentName ||
    document?.name ||
    'Document'
  );
};

const getDocumentTypeLabel = document => {
  const type = document?.documentType || document?.type || '';
  if (!type) return 'Document';
  return String(type)
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

const CompanyDocumentsTab = ({ company, documents }) => {
  const token = useAppSelector(state => state.auth.token);
  const groups =
    Array.isArray(documents) && documents.length
      ? buildDocumentGroups(documents)
      : getDocumentGroups(company);
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  const handleOpenDocument = useCallback(
    document => {
      const url =
        document?.fileUrl ||
        document?.url ||
        document?.downloadUrl ||
        document?.documentUrl ||
        document?.path ||
        document?.filePath ||
        document?.link ||
        document?.viewUrl ||
        document?.downloadPath ||
        document?.signedUrl ||
        document?.filePathUrl;
      if (url) {
        let resolved = String(url).trim();
        if (!resolved) {
          Alert.alert('Not available', 'Document link is not available.');
          return;
        }
        if (resolved.startsWith('/')) {
          resolved = `${API_BASE_URL}${resolved}`;
        } else if (!/^https?:\/\//i.test(resolved)) {
          resolved = `${API_BASE_URL}/${resolved.replace(/^\/+/, '')}`;
        }
        if (
          token &&
          (resolved.includes('/api/documents') ||
            resolved.includes('/documents'))
        ) {
          if (!/token=/i.test(resolved)) {
            resolved = resolved.includes('?')
              ? `${resolved}&token=${encodeURIComponent(token)}`
              : `${resolved}?token=${encodeURIComponent(token)}`;
          }
        }
        Linking.openURL(resolved).catch(() =>
          Alert.alert(
            'Unable to open',
            'This document link could not be opened.',
          ),
        );
        return;
      }

      const docId = document?._id || document?.id;
      if (docId && token) {
        const resolved = `${API_BASE_URL}/api/documents/admin/${docId}/view?token=${encodeURIComponent(
          token,
        )}`;
        Linking.openURL(resolved).catch(() =>
          Alert.alert(
            'Unable to open',
            'This document link could not be opened.',
          ),
        );
        return;
      }

      Alert.alert('Not available', 'Document link is not available.');
    },
    [token],
  );

  if (!total) {
    return (
      <View style={styles.emptyBox}>
        <Ionicons name="document-outline" size={32} color="#94A3B8" />
        <Text style={styles.emptyText}>No documents uploaded yet</Text>
      </View>
    );
  }

  return (
    <View>
      {groups.map(group =>
        group.items.length ? (
          <View key={group.key} style={styles.docSection}>
            <View style={styles.docSectionHeader}>
              <Text style={styles.docSectionTitle}>{group.title}</Text>
              <View style={styles.docCountPill}>
                <Text style={styles.docCountText}>{group.items.length}</Text>
              </View>
            </View>
            {group.items.map((document, index) => (
              <View
                key={`${group.key}-${
                  document?._id || document?.filename || index
                }`}
                style={styles.docRow}
              >
                <View style={styles.docIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={17}
                    color="#4F46E5"
                  />
                </View>
                <View style={styles.docTextWrap}>
                  <Text style={styles.docName} numberOfLines={1}>
                    {getFileName(document)}
                  </Text>
                  <Text style={styles.docMeta} numberOfLines={1}>
                    {getDocumentTypeLabel(document)} ·{' '}
                    {formatDate(document?.uploadedAt || document?.createdAt)}
                  </Text>
                  {(document?.uploadedBy || document?.uploadedByName) && (
                    <Text style={styles.docMeta} numberOfLines={1}>
                      Uploaded by:{' '}
                      {document.uploadedBy || document.uploadedByName}
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    style={styles.docAction}
                    activeOpacity={0.7}
                    onPress={() => handleOpenDocument(document)}
                    accessibilityRole="button"
                  >
                    <Ionicons name="eye-outline" size={18} color="#4F46E5" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.docAction}
                    activeOpacity={0.7}
                    onPress={() => handleOpenDocument(document)}
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name="download-outline"
                      size={18}
                      color="#22C55E"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : null,
      )}
    </View>
  );
};

export default CompanyDocumentsTab;
