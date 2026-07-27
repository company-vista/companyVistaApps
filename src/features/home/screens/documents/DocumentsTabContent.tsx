import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, View, Pressable, ActivityIndicator } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { useAppSelector } from '../../../../store/hooks';
import { useThemeColors, type AppTheme } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import AnimatedAppear from '../../../../components/AnimatedAppear';
import { API_BASE } from '../../../../config/api';
import axios from 'axios';
import { fetchCompanyDocuments, type DocumentItem } from '../../api/clientDocumentApi';
import type { CompanyCardItem } from '../quickAccess/CompanyCard';
import { formatDate } from '../../../../constants/dateFormatter';
import UnlockDocumentModal from './UnlockDocumentModal';
import ManageSubscriptionModal from './ManageSubscriptionModal';

const HOME_HERO_COLORS = {
  panel: '#0D2137',
  accentBlue: '#85B7EB',
  accentYellow: '#FAC775',
  white: '#ffffff',
};
const SINGLE_DOCUMENT_UNLOCK_PRICE = 30;

function getDocumentPalette(colors: AppTheme) {
  const isDark = colors.mode === 'dark';

  return {
    primaryText: isDark ? colors.text : HOME_HERO_COLORS.panel,
    accentText: isDark ? HOME_HERO_COLORS.accentBlue : '#303b47',
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
  const [activeTab, setActiveTab] = useState<'records' | 'mails' | 'locked'>('records');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lockedDocCount, setLockedDocCount] = useState(0);
  const [lockedDocDates, setLockedDocDates] = useState<string[]>([]);
  const [lockedItems, setLockedItems] = useState<any[]>([]);
  const [isLockedLoading, setIsLockedLoading] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState(0);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
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
      : `${API_BASE}${doc.downloadUrl}`;
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

  useEffect(() => {
    if (activeTab !== 'locked') return;
    const companyId = selectedCompany?.id;
    if (!companyId) return;

    let isMounted = true;
    setIsLockedLoading(true);
    const fetchLocked = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE}/api/locked-documents?companyId=${companyId}`,
          { headers: { Authorization: `Bearer ${token}`, 'x-auth-token': token, Cookie: `clientToken=${token}` } }
        );
      
        const items = Array.isArray(data?.data) ? data.data : [];
        const allDates: string[] = [];
        let totalCount = 0;

        for (const item of items) {
          const count = parseInt(item?.countDocuments, 10) || 0;
          totalCount += count;
          const dates = Array.isArray(item?.documentDates) ? item.documentDates : [];
          if (dates.length > 0) {
            allDates.push(...dates);
          } else {
            for (let i = 0; i < count; i++) {
              allDates.push(item?.createdAt || '');
            }
          }
        }

        setLockedDocCount(totalCount);
        setLockedDocDates(allDates);
        setLockedItems(items);
      } catch {
        if (isMounted) {
          setLockedDocCount(0);
          setLockedDocDates([]);
          setLockedItems([]);
        }
      } finally {
        if (isMounted) {
          setIsLockedLoading(false);
        }
      }
    };
    fetchLocked();

    return () => {
      isMounted = false;
    };
  }, [activeTab, selectedCompany?.id]);

  const filteredDocuments = documents.filter(doc => {
    if (activeTab === 'mails') {
      const src = (doc.sourceGroup ?? '').toLowerCase();
      const dt = (doc.documentType ?? '').toLowerCase();
      if (!src.includes('mail') && !dt.includes('mail') && !dt.includes('letter')) return false;
    }

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
            {/* <Text style={styles.headerSubtitle}>Company Portal</Text> */}
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
          placeholder="Search by last four digits, company, or type"
          placeholderTextColor={colors.subtle}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Pressable
          style={[styles.tab, activeTab === 'records' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('records')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'records' ? '#fff' : palette.accentText }]}>
            Records
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'mails' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('mails')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'mails' ? '#fff' : palette.accentText }]}>
            Mails & letters
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'locked' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('locked')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'locked' ? '#2c1f1fce' : palette.accentText }]}>
           {lockedItems.length} Locked
          </Text>
        </Pressable>
      </View>

      {activeTab === 'locked' && lockedItems.length > 1 && (
        <View style={styles.unlockAllRow}>
          <Pressable
            style={[styles.unlockAllBtn, { backgroundColor: '#dc2626a6' }]}
            onPress={() => setShowSubscriptionModal(true)}
          >
            <FontAwesome name="unlock-alt" size={12} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.unlockAllBtnText}>Unlock All Documents</Text>
          </Pressable>
        </View>
      )}

      {/* Document List */}
      <View style={styles.listContainer}>
        {activeTab === 'locked' ? (
          isLockedLoading ? (
            <ActivityIndicator size="large" color={palette.accentText} style={{ marginTop: 40 }} />
          ) : lockedItems.length > 0 ? (
            lockedItems.map((item, idx) => {
              const count = parseInt(item?.countDocuments, 10) || 0;
              const dates = Array.isArray(item?.documentDates) ? item.documentDates : [];
              const createdAt = item?.createdAt || '';
              const formattedDate = formatDate(createdAt);
              const isUnlocked = Array.isArray(item?.unlockedIndices) && item.unlockedIndices.length > 0;
              
              return (
                <AnimatedAppear key={item._id ?? idx} index={idx}>
                  <View style={[styles.lockedCard, isUnlocked && { borderColor: 'rgba(74, 222, 128, 0.3)' }]}>
                    <View style={styles.lockedCardTop}>
                      <View style={[styles.lockedIconWrap, { backgroundColor: isUnlocked ? '#F0FDF4' : '#FEF2F2' }]}>
                        <FontAwesome name={isUnlocked ? 'unlock-alt' : 'lock'} size={20} color={isUnlocked ? '#22C55E' : '#DC2626'} />
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{selectedCompany?.name ?? 'Documents'}</Text>
                        <Text numberOfLines={1} style={styles.cardSubtitle}>
                           document{count !== 1 ? 's' : ''} {isUnlocked ? 'unlocked' : 'locked'}
                        </Text>
                        {formattedDate ? <Text style={[styles.documentTypeText, { marginTop: 2 }]}>Created: {formattedDate}</Text> : null}
                      </View>
                    </View>

                    {dates.length > 0 && (
                      <>
                        <View style={[styles.lockedDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.dateList}>
                          {dates.map((date: string, i: number) => (
                            <Text key={i} style={[styles.dateText, { color: colors.muted }]}>
                              {formatDate(date)}
                            </Text>
                          ))}
                        </View>
                      </>
                    )}

                    <View style={[styles.lockedDivider, { backgroundColor: colors.border }]} />

                    {isUnlocked ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#065F46', borderRadius: 12, padding: 12 }}>
                        <FontAwesome name="clock-o" size={14} color="#6EE7B7" style={{ marginRight: 8 }} />
                        <Text style={{ flex: 1, fontSize: font.base, color: '#D1FAE5', lineHeight: 18 }}>
                          We will deliver the document within <Text style={{ color: '#ffffff', fontWeight: '600' }}>24–72 hours.</Text>
                        </Text>
                      </View>
                    ) : (
                      <Pressable style={[styles.lockedBtn, { backgroundColor: '#ef4444c7' }]} onPress={() => { setSelectedDocumentIndex(idx); setShowUnlockModal(true); }}>
                        <FontAwesome name="eye" size={15} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.lockedBtnText}>Pay to View Document</Text>
                      </Pressable>
                    )}
                  </View>
                </AnimatedAppear>
              );
            })
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 40, color: colors.muted }}>No locked documents found.</Text>
          )
        ) : isLoading ? (
          <ActivityIndicator size="large" color={palette.accentText} style={{ marginTop: 40 }} />
        ) : filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc, index) => (
            <AnimatedAppear key={doc._id ?? String(index)} index={index}>
              <View style={styles.card}>
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
                      Uploaded: {formatDate(doc.uploadedAt)}
                  </Text>
                  <Pressable onPress={() => onDocumentViewPress?.(doc)}>
                    <Text style={styles.cardLink}>View Details</Text>
                  </Pressable>
                </View>
              </View>
            </AnimatedAppear>
          ))
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 40, color: colors.muted }}>No documents found.</Text>
        )}
      </View>

      <UnlockDocumentModal
        visible={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        documentName={selectedCompany?.name ?? 'Document'}
        price={SINGLE_DOCUMENT_UNLOCK_PRICE.toString()}
        companyId={selectedCompany?.id}
        documentIndex={selectedDocumentIndex}
      />

      <ManageSubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

    </View>
  );
}

const getStyles = (colors: AppTheme) => {
  const palette = getDocumentPalette(colors);

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 2,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerTitle: {
      fontSize: font.heading,
      fontWeight: '600',
      color: palette.primaryText,
    },
    headerSubtitle: {
      fontSize: font.lg,
      color: palette.accentText,
      marginTop: 2,
    },
    totalBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      // backgroundColor: palette.panelButton,
      justifyContent: 'center',
      alignItems: 'center',
    },
    totalBadgeText: {
      fontSize: font.md,
      fontWeight: '700',
      color: colors.text,
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
      fontSize: font.lg,
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
      fontSize: font.base,
      fontWeight: '600',
      color: palette.accentText,
    },
    filterTextActive: {
      color: palette.activeText,
    },
    tabBar: {
      flexDirection: 'row',
      borderRadius: 24,
      padding: 3,
      marginBottom: 20,
      borderWidth: 1,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabText: {
      fontSize: font.md,
      fontWeight: '600',
    },
    unlockAllRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: 16,
    },
    unlockAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 20,
    },
    unlockAllBtnText: {
      color: '#ffffff',
      fontSize: font.base,
      fontWeight: '700',
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
      fontSize: font.md,
      fontWeight: '700',
      color: palette.primaryText,
      marginBottom: 2,
    },
    cardSubtitle: {
      fontSize: font.sm,
      color: palette.accentText,
      fontWeight: '500',
    },
    documentTypeText: {
      color: palette.documentTypeText,
      fontSize: font.base,
      fontWeight: '600',
      lineHeight: 16,
      marginBottom: 2,
      marginTop: 2,
    },
    cardActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: -4,
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
      fontSize: font.sm,
      color: palette.accentText,
    },
    cardLink: {
      fontSize: font.base,
      fontWeight: '700',
      color: palette.link,
    },
    lockedCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: '#FCA5A5',
    },
    lockedCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    lockedIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    lockedDivider: {
      height: 1,
      marginBottom: 16,
    },
    lockedBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 24,
    },
    lockedBtnText: {
      color: '#ffffff',
      fontSize: font.lg,
      fontWeight: '600',
    },
    dateList: {
      marginBottom: 8,
      gap: 4,
    },
    dateText: {
      fontSize: font.md,
    },
  });
};

export default DocumentsTabContent;
