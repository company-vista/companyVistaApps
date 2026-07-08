import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, View, Pressable, ActivityIndicator } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { useAppSelector } from '../../../../store/hooks';
import { useThemeColors, type AppTheme } from '../../../../theme/colors';
import { API_BASE_URL } from '../../../../config/api';
import { fetchCompanyDocuments, type DocumentItem } from '../../api/clientDocumentApi';
import type { CompanyCardItem } from '../quickAccess/CompanyCard';

const HOME_HERO_COLORS = {
  panel: '#0D2137',
  accentBlue: '#85B7EB',
  accentYellow: '#FAC775',
  white: '#ffffff',
};

function getDocumentPalette(colors: AppTheme) {
  const isDark = colors.mode === 'dark';

  return {
    primaryText: isDark ? colors.text : HOME_HERO_COLORS.panel,
    accentText: isDark ? HOME_HERO_COLORS.accentBlue : '#2F6FAE',
    panelButton: isDark ? '#183A5C' : HOME_HERO_COLORS.panel,
    actionSurface: isDark ? '#183A5C' : '#EAF4FF',
    actionBorder: isDark ? 'rgba(133,183,235,0.35)' : '#C7DFF6',
    documentTypeText: isDark ? colors.muted : '#164066',
    iconSurface: isDark ? 'rgba(133,183,235,0.14)' : '#EAF4FF',
    iconColor: isDark ? HOME_HERO_COLORS.accentBlue : HOME_HERO_COLORS.panel,
    fileIconColor: isDark ? HOME_HERO_COLORS.accentBlue : HOME_HERO_COLORS.panel,
    link: isDark ? HOME_HERO_COLORS.accentYellow : '#9A640F',
    activeText: HOME_HERO_COLORS.white,
  };
}

type DocumentsTabContentProps = {
  selectedCompany?: CompanyCardItem | null;
  onDocumentViewPress?: (doc: DocumentItem) => void;
};

function DocumentsTabContent({ selectedCompany, onDocumentViewPress }: DocumentsTabContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const token = useAppSelector(state => state.auth.token);
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const palette = getDocumentPalette(colors);

  // --------------- Document Download Handler function -----------------
  const handleDownload = useCallback(async (doc: DocumentItem) => {
    if (!doc.downloadUrl) {
      Alert.alert('Error', 'Download URL not available for this document.');
      return;
    }

    const fullUrl = doc.downloadUrl.startsWith('http')
      ? doc.downloadUrl
      : `${API_BASE_URL}${doc.downloadUrl}`;
    try {
      await Linking.openURL(fullUrl);
    } catch (error) {
      console.log('Download error:', error);
      Alert.alert('Error', 'Something went wrong while downloading.');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (selectedCompany?.id) {
      setIsLoading(true);
      fetchCompanyDocuments({ companyId: selectedCompany.id, token }).then(result => {
        if (isMounted) {
          setDocuments(result.documents);
          setIsLoading(false);
        }
      });
    } else {
      setDocuments([]);
    }

    return () => {
      isMounted = false;
    };
  }, [selectedCompany?.id, token]);

  const filteredDocuments = documents.filter(doc => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    const fileName = (doc.originalFileName ?? doc.fileName ?? '').toLowerCase();
    const companyName = (doc.companyName ?? '').toLowerCase();
    const documentType = (doc.documentType ?? '').toLowerCase();
    return (
      fileName.includes(lowerQuery) ||
      companyName.includes(lowerQuery) ||
      documentType.includes(lowerQuery)
    );
  });

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <Text style={styles.headerTitle}>{selectedCompany?.name ?? 'Documents'}</Text>
            <Text style={styles.headerSubtitle}>Company Portal</Text>
          </View>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>{documents.length} Docs</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={16} color={palette.accentText} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by file last four digits, company, or type"
          placeholderTextColor={colors.subtle}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Document List */}
      <View style={styles.listContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={palette.accentText} style={{ marginTop: 40 }} />
        ) : filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc, index) => (
            <View key={doc._id ?? String(index)} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardIconContainer}>
                  <FontAwesome name="file-text-o" size={17} color={palette.fileIconColor} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{doc.companyName ?? 'Company'}</Text>
                  <Text numberOfLines={1} style={styles.cardSubtitle}>
                    {doc.originalFileName ?? doc.documentType ?? 'Document'}
                  </Text>
                  <Text numberOfLines={1} style={styles.documentTypeText}>
                    Type: {doc.documentType ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  <Pressable style={styles.actionButton} onPress={() => handleDownload(doc)}>
                    <FontAwesome name="download" size={15} color={palette.iconColor} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardBottom}>
                <Text style={styles.cardDate}>
                  Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                </Text>
                <Pressable onPress={() => onDocumentViewPress?.(doc)}>
                  <Text style={styles.cardLink}>View Details</Text>
                </Pressable>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 40, color: colors.muted }}>No documents found.</Text>
        )}
      </View>

    </View>
  );
}

const getStyles = (colors: AppTheme) => {
  const palette = getDocumentPalette(colors);

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: palette.primaryText,
    },
    headerSubtitle: {
      fontSize: 14,
      color: palette.accentText,
      marginTop: 2,
    },
    totalBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: palette.panelButton,
      justifyContent: 'center',
      alignItems: 'center',
    },
    totalBadgeText: {
      fontSize: 13,
      fontWeight: '700',
      color: HOME_HERO_COLORS.accentBlue,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 48,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      marginLeft: 10,
      fontSize: 14,
      color: palette.primaryText,
    },
    filtersContainer: {
      gap: 12,
      marginBottom: 24,
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: palette.accentText,
    },
    filterButtonActive: {
      backgroundColor: palette.panelButton,
      borderColor: palette.panelButton,
    },
    filterText: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.accentText,
    },
    filterTextActive: {
      color: palette.activeText,
    },
    listContainer: {
      gap: 16,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardIconContainer: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: palette.iconSurface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
      borderWidth: 1,
      borderColor: palette.actionBorder,
    },
    cardInfo: {
      flex: 1,
      marginRight: 12,
    },
    cardTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: palette.primaryText,
      marginBottom: 2,
    },
    cardSubtitle: {
      fontSize: 11,
      color: palette.accentText,
      fontWeight: '500',
    },
    documentTypeText: {
      color: palette.documentTypeText,
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 16,
      marginBottom: 2,
      marginTop: 2,
    },
    cardActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: palette.actionSurface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.actionBorder,
    },
    cardDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 10,
    },
    cardBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardDate: {
      fontSize: 11,
      color: palette.accentText,
    },
    cardLink: {
      fontSize: 12,
      fontWeight: '700',
      color: palette.link,
    },
  });
};

export default DocumentsTabContent;
