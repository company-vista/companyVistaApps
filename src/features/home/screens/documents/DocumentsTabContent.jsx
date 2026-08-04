import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Linking, StyleSheet, Text, TextInput, View, Pressable, ActivityIndicator } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useAppSelector } from '../../../../store/hooks';
import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import AnimatedAppear from '../../../../components/AnimatedAppear';
import { API_BASE } from '../../../../config/api';
import axios from 'axios';
import { fetchCompanyDocuments } from '../../api/clientDocumentApi';
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
function getDocumentPalette(colors) {
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
function LockedDocumentCard({ item, idx, selectedCompany, colors, onUnlockPress }) {
    const dates = Array.isArray(item?.documentDates) ? item.documentDates : [];
    const createdAt = item?.createdAt || '';
    const formattedDate = formatDate(createdAt);
    const isUnlocked = Array.isArray(item?.unlockedIndices) && item.unlockedIndices.length > 0;
    return (<AnimatedAppear key={item._id ?? idx} index={idx}>
      <View style={[getStyles(colors).lockedCard, isUnlocked && { borderColor: 'rgba(74, 222, 128, 0.3)' }]}>
        <View style={getStyles(colors).lockedCardTop}>
          <View style={[getStyles(colors).lockedIconWrap, { backgroundColor: isUnlocked ? '#F0FDF4' : '#FEF2F2' }]}>
            <FontAwesome name={isUnlocked ? 'unlock-alt' : 'lock'} size={14} color={isUnlocked ? '#22C55E' : '#DC2626'}/>
          </View>
          <View style={getStyles(colors).cardInfo}>
            <Text style={getStyles(colors).cardTitle}>{selectedCompany?.name ?? 'Documents'}</Text>
            {formattedDate ? <Text style={[getStyles(colors).documentTypeText, { marginTop: 2 }]}>Created: {formattedDate}</Text> : null}
          </View>
        </View>

        {dates.length > 0 && (<>
            <View style={[getStyles(colors).lockedDivider, { backgroundColor: colors.border }]}/>
            <View style={getStyles(colors).dateList}>
              {dates.map((date, i) => (<Text key={i} style={[getStyles(colors).dateText, { color: colors.muted }]}>
                  {formatDate(date)}
                </Text>))}
            </View>
          </>)}

        <View style={[getStyles(colors).lockedDivider, { backgroundColor: colors.border }]}/>

        {isUnlocked ? (<View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 8, padding: 6 }}>
            <FontAwesome name="clock-o" size={12} color="#22C55E" style={{ marginRight: 6 }}/>
            <Text style={{ flex: 1, fontSize: font.sm, color: '#22C55E', lineHeight: 16 }}>
              We will deliver the document within <Text style={{ color: '#22C55E', fontWeight: '600' }}>24–72 hours.</Text>
            </Text>
          </View>) : (<Pressable style={[getStyles(colors).lockedBtn, { backgroundColor: '#16a34a' }]} onPress={onUnlockPress}>
            <FontAwesome name="eye" size={12} color="#fff" style={{ marginRight: 6 }}/>
            <Text style={getStyles(colors).lockedBtnText}>Pay to View Document</Text>
          </Pressable>)}
      </View>
    </AnimatedAppear>);
}
function DocumentsTabContent({ selectedCompany, onDocumentViewPress }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('records');
    const [mailSubTab, setMailSubTab] = useState('locked');
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lockedItems, setLockedItems] = useState([]);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [selectedDocumentIndex, setSelectedDocumentIndex] = useState(0);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [tabBarWidth, setTabBarWidth] = useState(0);
    const [subTabBarWidth, setSubTabBarWidth] = useState(0);
    const tabWidth = tabBarWidth > 6 ? (tabBarWidth - 6) / 2 : 0;
    const subTabWidth = subTabBarWidth > 4 ? (subTabBarWidth - 4) / 2 : 0;
    const token = useAppSelector(state => state.auth.token);
    const colors = useThemeColors();
    const tabSlideAnim = useRef(new Animated.Value(0)).current;
    const subTabSlideAnim = useRef(new Animated.Value(0)).current;
    const styles = getStyles(colors);
    const palette = getDocumentPalette(colors);
    // --------------- Document Download Handler function -----------------
    const handleDownload = useCallback(async (doc) => {
        if (!doc.downloadUrl) {
            Alert.alert('Error', 'Download URL not available for this document.');
            return;
        }
        const fullUrl = doc.downloadUrl.startsWith('http')
            ? doc.downloadUrl
            : `${API_BASE}${doc.downloadUrl}`;
        try {
            await Linking.openURL(fullUrl);
        }
        catch (error) {
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
        }
        else {
            setDocuments([]);
        }
        return () => {
            isMounted = false;
        };
    }, [selectedCompany?.id, token]);
    useEffect(() => {
        if (activeTab !== 'mails')
            return;
        const companyId = selectedCompany?.id;
        if (!companyId)
            return;
        let isMounted = true;
        const fetchLocked = async () => {
            try {
                const { data } = await axios.get(`${API_BASE}/api/locked-documents?companyId=${companyId}`, { headers: { Authorization: `Bearer ${token}`, 'x-auth-token': token, Cookie: `clientToken=${token}` } });
                const items = Array.isArray(data?.data) ? data.data : [];
                setLockedItems(items);
            }
            catch {
                if (isMounted) {
                    setLockedItems([]);
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
            if (!src.includes('mail') && !dt.includes('mail') && !dt.includes('letter'))
                return false;
        }
        if (!searchQuery)
            return true;
        const lowerQuery = searchQuery.toLowerCase();
        const fileName = (doc.originalFileName ?? doc.fileName ?? '').toLowerCase();
        const companyName = (doc.companyName ?? '').toLowerCase();
        const documentType = (doc.documentType ?? '').toLowerCase();
        return (fileName.includes(lowerQuery) ||
            companyName.includes(lowerQuery) ||
            documentType.includes(lowerQuery));
    });
    return (<View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <Text style={styles.headerTitle}>{selectedCompany?.name ?? 'Documents'}</Text>
          </View>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>{documents.length} Docs</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={16} color={palette.accentText}/>
        <TextInput style={styles.searchInput} placeholder="Search by last four digits, company, or type" placeholderTextColor={colors.subtle} value={searchQuery} onChangeText={setSearchQuery}/>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]} onLayout={(e) => { const w = e.nativeEvent.layout.width; if (tabBarWidth !== w)
        setTabBarWidth(w); }}>
        <Animated.View style={[
            styles.activeTabIndicator,
            {
                backgroundColor: colors.mode === 'dark' ? '#183A5C' : colors.buttonBackground,
                left: tabSlideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [3, tabWidth + 3],
                }),
                width: tabWidth,
            },
        ]}/>
        <Pressable style={styles.tab} onPress={() => {
            Animated.spring(tabSlideAnim, { toValue: 0, useNativeDriver: false, tension: 50, friction: 10 }).start();
            setActiveTab('records');
        }}>
          <Text style={[styles.tabText, { color: activeTab === 'records' ? '#fff' : palette.accentText }]}>
            Regis documents
          </Text>
        </Pressable>
        <Pressable style={styles.tab} onPress={() => {
            Animated.spring(tabSlideAnim, { toValue: 1, useNativeDriver: false, tension: 80, friction: 10 }).start();
            setActiveTab('mails');
        }}>
          <Text style={[styles.tabText, { color: activeTab === 'mails' ? '#fff' : palette.accentText }]}>
            Mails & letters
          </Text>
        </Pressable>
      </View>

      {/* Document List */}
      <View style={styles.listContainer}>
        {isLoading ? (<ActivityIndicator size="large" color={palette.accentText} style={{ marginTop: 40 }}/>) : (<>
            {activeTab !== 'mails' && (filteredDocuments.length > 0 ? (filteredDocuments.map((doc, index) => (<AnimatedAppear key={doc._id ?? String(index)} index={index}>
                    <View style={styles.card}>
                      <View style={styles.cardTop}>
                        <View style={styles.cardIconContainer}>
                          <FontAwesome name="file-text-o" size={17} color={palette.fileIconColor}/>
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
                            <FontAwesome name="download" size={15} color={palette.iconColor}/>
                          </Pressable>
                        </View>
                      </View>

                      <View style={styles.cardDivider}/>

                      <View style={styles.cardBottom}>
                        <Text style={styles.cardDate}>
                            Uploaded: {formatDate(doc.uploadedAt)}
                        </Text>
                        <Pressable onPress={() => onDocumentViewPress?.(doc)}>
                          <Text style={styles.cardLink}>View Details</Text>
                        </Pressable>
                      </View>
                    </View>
                    </AnimatedAppear>))) : (<View style={{ alignItems: 'center', marginTop: 90 }}>
                    <Image source={require('../../../../assets/images/not_found.png')} style={{ width: 90, height: 90, marginBottom: 12 }} resizeMode="contain"/>
                    <Text style={{ color: colors.muted }}>No documents found.</Text>
                  </View>))}

            {activeTab === 'mails' && (<>
                <View style={[styles.subTabBar, { backgroundColor: colors.surface, borderColor: colors.border }]} onLayout={(e) => { const w = e.nativeEvent.layout.width; if (subTabBarWidth !== w)
                setSubTabBarWidth(w); }}>
                  <Animated.View style={[
                    styles.activeSubTabIndicator,
                    {
                        backgroundColor: colors.mode === 'dark' ? '#183A5C' : colors.buttonBackground,
                        left: subTabSlideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [2, subTabWidth + 2],
                        }),
                        width: subTabWidth,
                    },
                ]}/>
                  <Pressable style={styles.subTab} onPress={() => {
                    Animated.spring(subTabSlideAnim, { toValue: 0, useNativeDriver: false, tension: 80, friction: 10 }).start();
                    setMailSubTab('locked');
                }}>
                    <Text style={[styles.subTabText, { color: mailSubTab === 'locked' ? '#fff' : palette.accentText }]}>
                      Locked
                    </Text>
                  </Pressable>
                  <Pressable style={styles.subTab} onPress={() => {
                    Animated.spring(subTabSlideAnim, { toValue: 1, useNativeDriver: false, tension: 80, friction: 10 }).start();
                    setMailSubTab('unlocked');
                }}>
                    <Text style={[styles.subTabText, { color: mailSubTab === 'unlocked' ? '#fff' : palette.accentText }]}>
                      Unlocked
                    </Text>
                  </Pressable>
                </View>

                {mailSubTab === 'locked' && lockedItems.length > 0 && (<>
                    {lockedItems.length > 1 && (<Pressable style={[styles.unlockAllBtn, { backgroundColor: '#dc2626a6', alignSelf: 'flex-end', marginBottom: 8 }]} onPress={() => setShowSubscriptionModal(true)}>
                        <FontAwesome name="unlock-alt" size={12} color="#fff" style={{ marginRight: 6 }}/>
                        <Text style={styles.unlockAllBtnText}>Unlock All</Text>
                      </Pressable>)}
                    {lockedItems.map((item, idx) => (<LockedDocumentCard key={item._id ?? `locked-${idx}`} item={item} idx={idx} selectedCompany={selectedCompany} colors={colors} onUnlockPress={() => { setSelectedDocumentIndex(idx); setShowUnlockModal(true); }}/>))}
                  </>)}

                {mailSubTab === 'unlocked' && (filteredDocuments.length > 0 ? (filteredDocuments.map((doc, index) => (<AnimatedAppear key={doc._id ?? String(index)} index={index}>
                        <View style={styles.card}>
                          <View style={styles.cardTop}>
                            <View style={styles.cardIconContainer}>
                              <FontAwesome name="file-text-o" size={17} color={palette.fileIconColor}/>
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
                                <FontAwesome name="download" size={15} color={palette.iconColor}/>
                              </Pressable>
                            </View>
                          </View>

                          <View style={styles.cardDivider}/>

                          <View style={styles.cardBottom}>
                            <Text style={styles.cardDate}>
                                Uploaded: {formatDate(doc.uploadedAt)}
                            </Text>
                            <Pressable onPress={() => onDocumentViewPress?.(doc)}>
                              <Text style={styles.cardLink}>View Details</Text>
                            </Pressable>
                          </View>
                        </View>
                      </AnimatedAppear>))) : (<Text style={{ textAlign: 'center', marginTop: 40, color: colors.muted }}>No documents found.</Text>))}
              </>)}
          </>)}
      </View>

      <UnlockDocumentModal visible={showUnlockModal} onClose={() => setShowUnlockModal(false)} documentName={selectedCompany?.name ?? 'Document'} price={SINGLE_DOCUMENT_UNLOCK_PRICE.toString()} companyId={selectedCompany?.id} documentIndex={selectedDocumentIndex}/>

      <ManageSubscriptionModal visible={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)}/>

    </View>);
}
const getStyles = (colors) => {
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
        totalBadge: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
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
            borderRadius: 28,
            paddingHorizontal: 16,
            height: 50,
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
        tabBar: {
            flexDirection: 'row',
            borderRadius: 24,
            padding: 3,
            marginBottom: 20,
            borderWidth: 1,
        },
        tab: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
        },
        tabText: {
            fontSize: font.md,
            fontWeight: '600',
        },
        activeTabIndicator: {
            position: 'absolute',
            top: 3,
            bottom: 3,
            borderRadius: 24,
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
            borderRadius: 10,
            padding: 6,
            borderWidth: 1,
            borderColor: 'rgba(252, 165, 165, 0.3)',
        },
        lockedCardTop: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
        },
        lockedIconWrap: {
            width: 28,
            height: 28,
            borderRadius: 14,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8,
        },
        lockedDivider: {
            height: 1,
            marginBottom: 4,
        },
        lockedBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            borderRadius: 16,
        },
        lockedBtnText: {
            color: '#ffffff',
            fontSize: font.sm,
            fontWeight: '600',
        },
        dateList: {
            marginBottom: 4,
            gap: 2,
        },
        dateText: {
            fontSize: font.sm,
        },
        subTabBar: {
            flexDirection: 'row',
            borderRadius: 20,
            padding: 2,
            marginBottom: 12,
            borderWidth: 1,
        },
        activeSubTabIndicator: {
            position: 'absolute',
            top: 2,
            bottom: 2,
            borderRadius: 20,
        },
        subTab: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
        },
        subTabText: {
            fontSize: font.sm,
            fontWeight: '600',
        },
    });
};
export default DocumentsTabContent;
