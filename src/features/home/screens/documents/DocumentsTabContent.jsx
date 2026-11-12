import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Linking, StyleSheet, Text, TextInput, View, Pressable, ActivityIndicator } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useAppSelector } from '../../../../store/hooks';
import { useThemeColors, themePalette } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import { s } from '../../../../theme/responsive';
import AnimatedAppear from '../../../../components/AnimatedAppear';
import DocumentNotFound from '../../../../components/emptyState/DocumentNotFound';
import { API_BASE } from '../../../../config/api';
import axios from 'axios';
import { fetchCompanyDocuments } from '../../api/clientDocumentApi';
import { formatDate } from '../../../../constants/dateFormatter';
import UnlockDocumentModal from './UnlockDocumentModal';
import ManageSubscriptionModal from './ManageSubscriptionModal';
import { capitalizeCompanyName } from '../../../../constants/convertFirstChar';
const HOME_HERO_COLORS = {
    panel: themePalette.hex_0d2137,
    accentBlue: themePalette.hex_85b7eb,
    accentYellow: themePalette.hex_fac775,
    white: themePalette.hex_ffffff,
};
const SINGLE_DOCUMENT_UNLOCK_PRICE = 30;
const SORT_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'locked', label: 'Locked' },
    { value: 'free', label: 'Free' },
    { value: 'mails&letter', label: 'Mails & Letter' },
    { value: 'docs', label: 'Docs' },
];
function getDocumentPalette(colors) {
    const isDark = colors.mode === 'dark';
    return {
        primaryText: isDark ? colors.text : HOME_HERO_COLORS.panel,
        accentText: isDark ? HOME_HERO_COLORS.accentBlue : themePalette.hex_303b47,
        panelButton: isDark ? themePalette.hex_183a5c : HOME_HERO_COLORS.panel,
        actionSurface: isDark ? themePalette.hex_183a5c : themePalette.hex_eaf4ff,
        actionBorder: isDark ? themePalette.rgba_133_183_235_0_35 : themePalette.hex_c7dff6,
        documentTypeText: isDark ? colors.muted : themePalette.hex_164066,
        iconSurface: isDark ? themePalette.rgba_133_183_235_0_14 : themePalette.hex_eaf4ff,
        iconColor: isDark ? HOME_HERO_COLORS.accentBlue : HOME_HERO_COLORS.panel,
        fileIconColor: isDark ? HOME_HERO_COLORS.accentBlue : HOME_HERO_COLORS.panel,
        link: isDark ? HOME_HERO_COLORS.accentYellow : themePalette.hex_9a640f,
        activeText: HOME_HERO_COLORS.white,
    };
}
function isMailDoc(doc) {
    const src = (doc.sourceGroup ?? '').toLowerCase();
    const dt = (doc.documentType ?? '').toLowerCase();
    return src.includes('mail') || dt.includes('mail') || dt.includes('letter');
}

function LockedDocumentCard({ item, idx, selectedCompany, colors, onUnlockPress }) {
    const dates = Array.isArray(item?.documentDates) ? item.documentDates : [];
    const createdAt = item?.createdAt || '';
    const formattedDate = formatDate(createdAt);
    const isUnlocked = Array.isArray(item?.unlockedIndices) && item.unlockedIndices.length > 0;
    return (<AnimatedAppear key={item._id ?? idx} index={idx}>
      <View style={[getStyles(colors).lockedCard, isUnlocked && { borderColor: themePalette.rgba_74_222_128_0_3 }]}>
        <View style={getStyles(colors).lockedCardTop}>
          <View style={[getStyles(colors).lockedIconWrap, { backgroundColor: isUnlocked ? themePalette.hex_f0fdf4 : themePalette.hex_fef2f2 }]}>
            <FontAwesome name={isUnlocked ? 'unlock-alt' : 'lock'} size={14} color={isUnlocked ? themePalette.hex_22c55e : themePalette.hex_dc2626}/>
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
            <FontAwesome name="clock-o" size={12} color={themePalette.hex_22c55e} style={{ marginRight: 6 }}/>
            <Text style={{ flex: 1, fontSize: font.sm, color: themePalette.hex_22c55e, lineHeight: 16 }}>
              We will deliver the document within <Text style={{ color: themePalette.hex_22c55e, fontWeight: '600' }}>24–72 hours.</Text>
            </Text>
          </View>) : (<Pressable style={[getStyles(colors).lockedBtn, { backgroundColor: themePalette.hex_16a34a }]} onPress={onUnlockPress}>
            <FontAwesome name="eye" size={12} color={themePalette.hex_fff} style={{ marginRight: 6 }}/>
            <Text style={getStyles(colors).lockedBtnText}>Pay to View Document</Text>
          </Pressable>)}
      </View>
    </AnimatedAppear>);
}

function DocumentsTabContent({ selectedCompany, onDocumentViewPress }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('all');
    const [activeTab, setActiveTab] = useState('registered');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lockedItems, setLockedItems] = useState([]);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [selectedDocumentIndex, setSelectedDocumentIndex] = useState(0);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const token = useAppSelector(state => state.auth.token);
    const colors = useThemeColors();
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
    }, [selectedCompany?.id, token]);
    const filteredDocuments = documents.filter(doc => {
        if (activeTab === 'locked' || activeTab === 'unlocked')
            return false;
        if (activeTab === 'registered') {
            if (sortOption === 'mails&letter') {
                if (!isMailDoc(doc))
                    return false;
            }
            else if (isMailDoc(doc)) {
                return false;
            }
        }
        if (sortOption === 'docs' && isMailDoc(doc))
            return false;
        if (sortOption === 'locked' || sortOption === 'free')
            return false;
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
    const unlockedLockedItems = lockedItems.filter(item => Array.isArray(item?.unlockedIndices) && item.unlockedIndices.length > 0);
    const stillLockedItems = lockedItems.filter(item => !(Array.isArray(item?.unlockedIndices) && item.unlockedIndices.length > 0));
    const lockedToShow = activeTab === 'unlocked'
        ? unlockedLockedItems
        : activeTab === 'locked'
            ? stillLockedItems
            : sortOption === 'free' ? unlockedLockedItems : sortOption === 'locked' ? stillLockedItems : lockedItems;
    const showDocsList = activeTab === 'registered' && (sortOption === 'all' || sortOption === 'mails&letter' || sortOption === 'docs');
    const hasLocked = (activeTab === 'locked' || activeTab === 'unlocked') && lockedToShow.length > 0;
    const registeredDocsCount = documents.filter(doc => !isMailDoc(doc)).length;
    const lockedCount = stillLockedItems.length;
    const unlockedCount = unlockedLockedItems.length;
    return (<View style={styles.container}>

      {/* **************Search ************** */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={16} color={palette.accentText}/>
        <TextInput style={styles.searchInput} placeholder="Search by last four digits, company, or type" placeholderTextColor={colors.subtle} value={searchQuery} onChangeText={setSearchQuery}/>
      </View>

      {/* **************Sort by filter **************   */}
      <View style={styles.filterRow}>
        <Text style={[styles.sortLabel, { color: colors.muted }]}>Sort by:</Text>
        <Pressable onPress={() => setIsSortOpen(prev => !prev)} style={styles.sortDropdown}>
          <Text style={[styles.sortValue, { color: palette.link }]}>
            {SORT_OPTIONS.find(opt => opt.value === sortOption)?.label}
          </Text>
          <FontAwesome name={isSortOpen ? 'angle-up' : 'angle-down'} size={18} color={palette.accentText}/>
        </Pressable>
        {isSortOpen ? (<View style={[styles.sortDropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {SORT_OPTIONS.map(option => (<Pressable key={option.value} onPress={() => {
                    setSortOption(option.value);
                    setIsSortOpen(false);
                }} style={styles.sortDropdownItem}>
                <Text style={[styles.sortDropdownItemText, sortOption === option.value && { color: palette.accentText, fontWeight: '700' }]}>
                  {option.label}
                </Text>
                {sortOption === option.value ? <FontAwesome name="check" size={14} color={palette.accentText}/> : null}
              </Pressable>))}
          </View>) : null}
      </View>

      {/* **************Registered / Locked / Unlocked tabs ************** */}
      <View style={styles.tabsRow}>
        <Pressable onPress={() => setActiveTab('registered')} style={[styles.tab, activeTab === 'registered' && styles.tabActive]}>
          <FontAwesome name="file-text-o" size={10} color={activeTab === 'registered' ? palette.link : colors.muted} style={styles.tabIcon}/>
          <Text style={[styles.tabText, activeTab === 'registered' && styles.tabTextActive]} numberOfLines={1}>
            Company Docs
          </Text>
          <View style={[styles.tabCount, activeTab === 'registered' && styles.tabCountActive]}>
            <Text style={[styles.tabCountText, activeTab === 'registered' && styles.tabCountTextActive]}>{registeredDocsCount}</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => setActiveTab('locked')} style={[styles.tab, activeTab === 'locked' && styles.tabActive]}>
          <FontAwesome name="lock" size={10} color={activeTab === 'locked' ? palette.link : colors.muted} style={styles.tabIcon}/>
          <Text style={[styles.tabText, activeTab === 'locked' && styles.tabTextActive]} numberOfLines={1}>
            Locked
          </Text>
          <View style={[styles.tabCount, activeTab === 'locked' && styles.tabCountActive]}>
            <Text style={[styles.tabCountText, activeTab === 'locked' && styles.tabCountTextActive]}>{lockedCount}</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => setActiveTab('unlocked')} style={[styles.tab, activeTab === 'unlocked' && styles.tabActive]}>
          <FontAwesome name="unlock-alt" size={10} color={activeTab === 'unlocked' ? palette.link : colors.muted} style={styles.tabIcon}/>
          <Text style={[styles.tabText, activeTab === 'unlocked' && styles.tabTextActive]} numberOfLines={1}>
            Unlocked
          </Text>
          <View style={[styles.tabCount, activeTab === 'unlocked' && styles.tabCountActive]}>
            <Text style={[styles.tabCountText, activeTab === 'unlocked' && styles.tabCountTextActive]}>{unlockedCount}</Text>
          </View>
        </Pressable>
      </View>

      {/* **************Document List ************** */}
      <View style={styles.listContainer}>
        {isLoading ? (<ActivityIndicator size="large" color={palette.accentText} style={{ marginTop: 40 }}/>) : (<>
            {showDocsList && filteredDocuments.map((doc, index) => (<AnimatedAppear key={doc._id ?? String(index)} index={index}>
                <View style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardIconContainer}>
                      <FontAwesome name="file-text-o" size={17} color={palette.fileIconColor}/>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>{capitalizeCompanyName(selectedCompany?.name) ?? 'Company'}</Text>
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
                      <Text style={styles.cardLink}>View Docs</Text>
                    </Pressable>
                  </View>
                </View>
                </AnimatedAppear>))}

            {hasLocked && (<>
                {activeTab === 'locked' && lockedItems.length > 1 && (<Pressable style={[styles.unlockAllBtn, { backgroundColor: themePalette.hex_dc2626a6, alignSelf: 'flex-end', marginBottom: 8 }]} onPress={() => setShowSubscriptionModal(true)}>
                    <FontAwesome name="unlock-alt" size={12} color={themePalette.hex_fff} style={{ marginRight: 6 }}/>
                    <Text style={styles.unlockAllBtnText}>Unlock All</Text>
                  </Pressable>)}
                {lockedToShow.map((item, idx) => (<LockedDocumentCard key={item._id ?? `locked-${idx}`} item={item} idx={idx} selectedCompany={selectedCompany} colors={colors} onUnlockPress={() => { setSelectedDocumentIndex(idx); setShowUnlockModal(true); }}/>))}
              </>)}

            {filteredDocuments.length === 0 && !hasLocked && (<View style={{ alignItems: 'center', marginTop: 40 }}>
                <DocumentNotFound subtitle="No documents found." />
              </View>)}
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
            paddingHorizontal: s(2),
            marginHorizontal: s(-8),
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.mode === 'dark' ? colors.cardElevated : colors.cardHighlight,
            borderRadius: 12,
            paddingHorizontal: s(16),
            height: 50,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.mode === 'dark' ? themePalette.rgba_255_255_255_0_08 : colors.border,
        },
        searchInput: {
            flex: 1,
            marginLeft: 10,
            fontSize: font.md,
            color: palette.primaryText,
        },
        filterRow: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 8,
            marginBottom: 21,
            position: 'relative',
        },
        sortLabel: {
            fontSize: font.md,
            fontWeight: '500',
        },
        sortDropdown: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        sortValue: {
            fontSize: font.md,
            fontWeight: '500',
        },
        sortDropdownList: {
            position: 'absolute',
            right: 0,
            top: 32,
            zIndex: 20,
            elevation: 6,
            minWidth: 180,
            borderWidth: 1,
            borderRadius: 10,
            overflow: 'hidden',
            paddingVertical: 4,
        },
        sortDropdownItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            paddingHorizontal: s(14),
            paddingVertical: 10,
        },
        sortDropdownItemText: {
            color: palette.primaryText,
            fontSize: font.md,
        },
        tabsRow: {
            flexDirection: 'row',
            backgroundColor: colors.mode === 'dark' ? colors.cardElevated : colors.cardHighlight,
            borderRadius: 12,
            padding: 4,
            gap: 4,
            marginBottom: 18,
            borderWidth: 1,
            borderColor: colors.mode === 'dark' ? themePalette.rgba_255_255_255_0_08 : colors.border,
        },
        tab: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 9,
            paddingHorizontal: s(6),
            borderRadius: 12,
            gap: 4,
            minWidth: 0,
        },
        tabActive: {
            backgroundColor: colors.mode === 'dark' ? themePalette.hex_1e293b : themePalette.hex_ffffff,
            shadowColor: themePalette.hex_000,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
            borderWidth: 1,
            borderColor: colors.mode === 'dark' ? themePalette.hex_334155 : themePalette.hex_ffffff,
        },
        tabText: {
            fontSize: font.sm,
            fontWeight: '600',
            color: colors.mode === 'dark' ? themePalette.hex_94a3b8 : themePalette.hex_475569,
            letterSpacing: -0.1,
            flexShrink: 1,
        },
        tabIcon: {
            marginRight: 0,
        },
        tabCount: {
            minWidth: 18,
            height: 18,
            borderRadius: 999,
            paddingHorizontal: s(5),
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            backgroundColor: colors.mode === 'dark' ? themePalette.hex_1e293b : themePalette.hex_e2e8f0,
            borderWidth: 0,
        },
        tabCountActive: {
            backgroundColor: colors.mode === 'dark' ? themePalette.rgba_250_199_117_0_18 : themePalette.hex_0f172a,
        },
        tabCountText: {
            fontSize: font.xs,
            fontWeight: '700',
            color: colors.muted,
        },
        tabCountTextActive: {
            color: themePalette.hex_ffffff,
        },
        tabTextActive: {
            color: colors.mode === 'dark' ? themePalette.hex_f8fafc : themePalette.hex_0f172a,
            fontWeight: '700',
        },
        unlockAllBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            paddingHorizontal: s(14),
            borderRadius: 20,
        },
        unlockAllBtnText: {
            color: themePalette.hex_ffffff,
            fontSize: font.base,
            fontWeight: '700',
        },
        listContainer: {
            gap: 16,
        },
        card: {
            backgroundColor: colors.mode === 'dark' ? colors.cardElevated : colors.cardHighlight,
            borderRadius: 14,
            padding: 12,
            borderWidth: 1,
            borderColor: colors.mode === 'dark' ? themePalette.rgba_255_255_255_0_08 : colors.border,
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
            fontWeight: '400',
            color: palette.primaryText,
            marginBottom: 2,
        },
        cardSubtitle: {
            fontSize: font.sm,
            color: palette.accentText,
            fontWeight: '400',
        },
        documentTypeText: {
            color: palette.documentTypeText,
            fontSize: font.base,
            fontWeight: '400',
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
            fontWeight: '300',
            color: palette.link,
        },
        lockedCard: {
            backgroundColor: colors.mode === 'dark' ? colors.cardElevated : colors.cardHighlight,
            borderRadius: 10,
            padding: 6,
            borderWidth: 1,
            borderColor: themePalette.rgba_252_165_165_0_3,
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
            color: themePalette.hex_ffffff,
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
    });
};
export default DocumentsTabContent;
