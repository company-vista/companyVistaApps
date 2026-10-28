import React from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_BASE_URL } from '../../../../config/api';

const formatDate = (value) => {
  if (!value) return '';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return '';
  }
};

const DocumentCard = ({ item, token, onDelete, deletingId }) => {
  const title = item.originalFileName || item.fileName || item.title || 'Untitled Document';
  const companyName = item.company?.companyName || item.companyName || 'N/A';
  const uploadedBy = item.uploadedBy || item.uploadedByName || item.createdBy?.name || 'Admin';
  const uploadedAt = formatDate(item.uploadedAt || item.createdAt || item.createdDate);
  const documentType = item.documentType || item.type || item.documentTypeKey || item.category;
  const id = item._id || item.id;
  const isDeleting = deletingId === id;

  const getUrl = (doc, type) => {
    if (type === 'view') {
      return doc.viewUrl || doc.viewLink || doc.url;
    }
    return doc.downloadUrl || doc.downloadLink || doc.viewUrl || doc.url;
  };

  const handleView = () => {
    const url = getUrl(item, 'view');
    if (!url) {
      Alert.alert('Error', 'View link not available');
      return;
    }
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    Linking.openURL(fullUrl).catch(() => Alert.alert('Error', 'Unable to open document'));
  };

  const handleDownload = () => {
    const url = getUrl(item, 'download');
    if (!url) {
      Alert.alert('Error', 'Download link not available');
      return;
    }
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    Linking.openURL(fullUrl).catch(() => Alert.alert('Error', 'Unable to download document'));
  };

  const handleDeletePress = () => {
    if (!id) {
      Alert.alert('Error', 'Invalid document');
      return;
    }
    Alert.alert(
      'Delete',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete && onDelete(item),
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subText} numberOfLines={1}>
            {companyName}
          </Text>
          {documentType ? <Text style={styles.subText}>{documentType}</Text> : null}
          <Text style={styles.subText}>Uploaded by: {uploadedBy}</Text>
        </View>
      </View>
      <View style={styles.footerRow}>
        <View style={styles.dateWrap}>
          {uploadedAt ? <Text style={styles.uploadedAtText}>Uploaded: {uploadedAt}</Text> : null}
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleView}>
            <Ionicons name="eye-outline" size={18} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
            <Ionicons name="download-outline" size={18} color="#16A34A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleDeletePress} disabled={isDeleting}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DocumentCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  subText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '400',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dateWrap: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
  uploadedAtText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
