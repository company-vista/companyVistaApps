import React, { useState } from 'react';
import { Text, View, ScrollView, StatusBar, TouchableOpacity, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from "./CompanyDetailScreenStyle";
// Vector icons badal kar image ke style se match kiya
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../../theme/colors';
import BackButton from '../../../components/buttons/BackButton';
import CompanyInfo from './companyInformationSection/CompanyInfo';
import ShareHolders from './companyInformationSection/ShareHolders';
const menuItems = [
    { id: 'companyInfo', label: 'Company Information', icon: 'building', iconBg: '#EEF2FF', iconColor: '#4F46E5' },
    { id: 'shareholders', label: 'Shareholders', icon: 'users', iconBg: '#E6F4EA', iconColor: '#137333' },
];
const CompanyDetailScreen = ({ activeSection: controlledActiveSection, onBackPress, onSectionPress, selectedCompany, }) => {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
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
        return (<View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background}/>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Company Details</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>No company selected</Text>
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
                return <CompanyInfo companyData={companyData}/>;
            case 'shareholders':
                return <ShareHolders companyId={companyData.id}/>;
            default:
                return null;
        }
    };
    /* ── main render ─────────────────────────────────────────────── */
    return (<View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background}/>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BackButton onPress={activeSection ? handleBackPress : onBackPress}/>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {activeSection === 'companyInfo'
            ? 'Company Information'
            : activeSection === 'shareholders'
                ? 'Shareholders'
                : 'Company Info'}
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.7} style={styles.editBtn}>
          <Text style={styles.requestChangesText}>
            {activeSection ? 'Edit' : 'Request Changes'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── HERO CARD ─────────────────────────────────────── */}
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Avatar */}
          <View style={[styles.avatarCircle, { backgroundColor: colors.mode === 'dark' ? '#1E293B' : '#EEF2FF' }]}>
            <Text style={[styles.avatarText, { color: colors.mode === 'dark' ? '#93C5FD' : '#4F46E5' }]}>
              {companyData.initials ?? companyData.name?.slice(0, 1)?.toUpperCase()}
            </Text>
          </View>

          {/* Name + Details */}
          <View style={styles.heroInfo}>
            {/* Name + Status row */}
            <View style={styles.heroNameRow}>
              <Text style={[styles.heroName, { color: colors.text }]} numberOfLines={1}>
                {companyData.name}
              </Text>

              {/* Status Badge */}
              <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor.dot }]}/>
                <Text style={[styles.statusText, { color: statusColor.text }]}>
                  {companyData.status?.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Mockup matching company details */}
            <Text style={[styles.heroMetaText, { color: colors.muted }]}>
              Your Company Name ·
            </Text>
            <View style={styles.einWrapperNo}>
              <Text style={[styles.heroMetaText, { color: colors.muted }]}>
                EIN
              </Text>
              <Text style={[styles.heroMetaText, { color: colors.muted }]}>
                {companyData.ein ?? 'XX-XXXXXXX'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── SECTION CONTENT / MENU LIST ───────────────────── */}
        {activeSection ? (<View style={styles.sectionContent}>{renderSection()}</View>) : (
        /* Image ke jaisa separated floating card style list */
        <View style={styles.menuCard}>
            {menuItems.map((item) => (<TouchableOpacity key={item.id} activeOpacity={0.7} onPress={() => item.id && handleSectionPress(item.id)} style={[styles.menuRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>

                {/* Icon bubble */}
                <View style={[styles.iconBubble, { backgroundColor: colors.mode === 'dark' ? 'rgba(79,70,229,0.15)' : item.iconBg }]}>
                  <FontAwesome name={item.icon} size={16} color={colors.mode === 'dark' ? '#93C5FD' : item.iconColor}/>
                </View>

                {/* Label */}
                <Text style={[styles.menuLabel, { color: colors.text }]}>
                  {item.label}
                </Text>

                {/* Arrow Right */}
                <FontAwesome name="angle-right" size={20} color={colors.muted}/>
              </TouchableOpacity>))}
          </View>)}
      </ScrollView>
    </View>);
};
export default CompanyDetailScreen;
