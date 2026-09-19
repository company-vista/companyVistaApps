import React, { useState } from 'react';
import { Text, View, ScrollView, StatusBar, TouchableOpacity, ActivityIndicator, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from "./CompanyDetailScreenStyle";
// Vector icons badal kar image ke style se match kiya
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../../theme/colors';
import BackButton from '../../../components/buttons/BackButton';
import CompanyInfo from './companyInformationSection/CompanyInfo';
import ShareHolders from './companyInformationSection/ShareHolders';
import OrderDetailsScreen from './companyInformationSection/yourOrder/OrderDetailsScreen';
import DocumentNotFound from '../../../components/emptyState/DocumentNotFound';
import { useNavigation } from '@react-navigation/native';
const menuItems = [
    { id: 'companyInfo', label: 'Company Info', icon: 'building', iconBg: '#EEF2FF', iconColor: '#4F46E5' },
    { id: 'shareholders', label: 'Shareholders', icon: 'users', iconBg: '#E6F4EA', iconColor: '#137333' },
];
const CompanyDetailScreen = ({ activeSection: controlledActiveSection, onBackPress, onSectionPress, selectedCompany, isLoading, }) => {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const nav = useNavigation();
    const companyData = selectedCompany;
    const [localActiveSection, setLocalActiveSection] = useState(null);
    const activeSection = controlledActiveSection ?? localActiveSection;
    const isControlledSection = controlledActiveSection !== undefined;
    function handleBackPress() {
        if (isControlledSection) {
            onBackPress?.();
            return;
        }
        setLocalActiveSection(null);
    }
    function handleSectionPress(section) {
        if (onSectionPress) {
            onSectionPress(section);
            return;
        }
        setLocalActiveSection(section);
    }
    /* ── empty state ─────────────────────────────────────────────── */
    if (!companyData) {
        return (<View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background}/>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: insets.top + 12 }]}>
          <View style={styles.headerLeft}>
            <BackButton onPress={onBackPress ?? (() => nav.canGoBack() && nav.goBack())} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Company Details</Text>
          </View>
        </View>
        <View style={styles.emptyState}>
          {isLoading ? (<ActivityIndicator size="large" color={colors.mode === 'dark' ? '#93C5FD' : '#4F46E5'}/>) : (<DocumentNotFound />)}
        </View>
      </View>);
    }
    // TypeScript Error Fixed: Case-insensitive dynamic comparison strictly using String wrapper
    const isCompanyActive = String(companyData.status).toUpperCase() === 'ACTIVE';
    const statusColor = isCompanyActive
        ? { bg: '#E6F4EA', text: '#0F9D58', dot: '#0F9D58' }
        : { bg: '#FCE8E6', text: '#C5221F', dot: '#D93025' };
    /* ── sub-section view ────────────────────────────────────────── */
    const renderSection = () => {
        switch (activeSection) {
            case 'companyInfo':
                return <CompanyInfo companyData={companyData} />;
            case 'shareholders':
                return <ShareHolders companyId={companyData.id}/>;
            case 'orders':
                return <OrderDetailsScreen selectedCompany={companyData} onBackPress={handleBackPress} onMessagePress={() => nav.navigate('Support')} />;
            default:
                return null;
        }
    };
    /* ── main render ─────────────────────────────────────────────── */
    return (<View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background}/>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: insets.top + 12 }]}>
        <View style={styles.headerLeft}>
          <BackButton onPress={activeSection ? handleBackPress : (onBackPress ?? (() => nav.canGoBack() && nav.goBack()))} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {activeSection === 'companyInfo'
            ? 'Company Information'
            : activeSection === 'shareholders'
                ? 'Shareholders'
                : activeSection === 'orders'
                    ? 'Orders'
                    : 'Company Info'} 
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── SECTION CONTENT / MENU LIST ───────────────────── */}
        {activeSection ? (<View style={styles.sectionContent}>{renderSection()}</View>) : (
        /* Image ke jaisa separated floating card style list */
        <View style={styles.menuCard}>
            {menuItems.map((item) => (<TouchableOpacity key={item.id} activeOpacity={0.7} onPress={() => item.id && handleSectionPress(item.id)} style={styles.menuRow}>

                {/* Icon bubble */}
                <View style={[styles.iconBubble, { backgroundColor: colors.mode === 'dark' ? 'rgba(79,70,229,0.15)' : item.iconBg }]}>
                  <FontAwesome name={item.icon} size={16} color={colors.mode === 'dark' ? '#93C5FD' : item.iconColor}/>
                </View>

                {/* Label */}
                <Text style={[styles.menuLabel, { color: colors.text }]} numberOfLines={1}>
                  {item.label}
                </Text>
                <FontAwesome name="angle-right" size={18} color={colors.muted} />
              </TouchableOpacity>))}
          </View>)}
      </ScrollView>
    </View>);
};
export default CompanyDetailScreen;
