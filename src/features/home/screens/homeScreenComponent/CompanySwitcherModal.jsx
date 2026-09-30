import React from 'react';
import { Animated, Pressable, ScrollView, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from '../HomeScreen.styles';
import { s } from '../../../../theme/responsive';
import { capitalizeCompanyName } from '../../../../constants/convertFirstChar';
export function CompanySwitcherModal({ isOpen, isLoading, companyOptions, selectedCompany, companySwitcherOpacity, companySwitcherTranslateY, onSelectCompany, onClose, onAddCompany, addCompanyBlocked, addCompanyBlockedReason, colors, safeAreaInsets, }) {
    if (!isOpen)
        return null;
    const companyCount = companyOptions.length;
    // Gold brand accent — same value the rest of the app hardcodes (#C9A84C).
    const goldAccent = '#D4AF37';
    const handleAddCompany = () => {
        if (addCompanyBlocked) {
            return;
        }
        onClose?.();
        onAddCompany?.();
    };
    return (<View style={styles.companySwitcherOverlay}>
      <Pressable onPress={onClose} style={[styles.companySwitcherBackdrop, { backgroundColor: colors.backdrop }]}/>
      <Animated.View style={[
            styles.companySwitcherDropdown,
            {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: companySwitcherOpacity,
                top: safeAreaInsets.top + s(236),
                transform: [{ translateY: companySwitcherTranslateY }],
            },
        ]}>
        <View style={styles.companySwitcherHeader}>
          <View>
            <Text style={[styles.companySwitcherTitle, { color: colors.text }]}>
              {companyCount > 0 ? `Select company (${companyCount})` : 'Select company'}
            </Text>
            <Text style={[styles.companySwitcherSubtitle, { color: colors.muted }]}>
              Select company context for the dashboard
            </Text>
          </View>
          <Pressable onPress={onClose} style={[styles.sheetCloseButton, { backgroundColor: colors.surface }]}>
            <FontAwesome name="close" size={18} color={colors.text}/>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.companySwitcherList}>
          {isLoading ? (<Text style={[styles.companySwitcherEmptyText, { color: colors.muted }]}>
              Loading companies...
            </Text>) : null}
          {!isLoading && companyOptions.length === 0 ? (<Text style={[styles.companySwitcherEmptyText, { color: colors.muted }]}>
              No companies available.
            </Text>) : null}
          {!isLoading && companyOptions.map(company => {
            const isSelected = selectedCompany?.id === company.id;
            return (<Pressable key={company.id} onPress={() => onSelectCompany(company)} style={[
                    styles.companySwitcherRow,
                    {
                        backgroundColor: colors.surface,
                        borderColor: isSelected ? colors.accentSoft : colors.border,
                    },
                ]}>
                <View style={[
                    styles.companySwitcherAvatar,
                    { backgroundColor: company.avatarColor },
                ]}>
                  <Text style={[
                    styles.companySwitcherAvatarText,
                    { color: company.initialsColor },
                ]}>
                    {company.initials}
                  </Text>
                </View>
                <View style={styles.companySwitcherCopy}>
                  <Text numberOfLines={1} style={[styles.companySwitcherName, { color: colors.text }]}>
                    {capitalizeCompanyName(company.name)}
                  </Text>
                  <Text numberOfLines={1} style={[styles.companySwitcherMeta, { color: colors.muted }]}>
                    {company.companyType} - EIN {company.ein}
                  </Text>
                </View>
                {isSelected ? (<FontAwesome name="check-circle" size={20} color={colors.accent}/>) : (<FontAwesome name="angle-right" size={20} color={colors.muted}/>)}
              </Pressable>);
        })}
        {/* Multi-company entry point. Ye row hamesha rahegi — ek company hone
            par bhi — kyunki tabhi user ko pata chalta hai ki aur companies
            bana sakta hai. */}
        <View style={[styles.companySwitcherDivider, { backgroundColor: colors.border }]}/>
        <Pressable
          onPress={handleAddCompany}
          disabled={addCompanyBlocked}
          accessibilityRole="button"
          accessibilityState={{ disabled: !!addCompanyBlocked }}
          style={[
            styles.companySwitcherAddRow,
            {
                backgroundColor: addCompanyBlocked ? 'transparent' : colors.accentSoft,
                borderColor: addCompanyBlocked ? colors.border : goldAccent,
            },
            addCompanyBlocked ? styles.companySwitcherAddRowDisabled : null,
        ]}
        >
          <View style={[styles.companySwitcherAddIcon, { backgroundColor: addCompanyBlocked ? colors.sheet : 'rgba(201,168,76,0.18)' }]}>
            <FontAwesome name="plus" size={16} color={addCompanyBlocked ? colors.muted : goldAccent}/>
          </View>
          <View style={styles.companySwitcherAddCopy}>
            <Text style={[styles.companySwitcherAddLabel, { color: addCompanyBlocked ? colors.muted : colors.text }]}>
              Add new company
            </Text>
            {addCompanyBlocked && addCompanyBlockedReason ? (<Text style={[styles.companySwitcherAddHint, { color: colors.danger }]}>
                {addCompanyBlockedReason}
              </Text>) : null}
          </View>
          <FontAwesome name="angle-right" size={18} color={addCompanyBlocked ? colors.muted : goldAccent}/>
        </Pressable>
        </ScrollView>
      </Animated.View>
    </View>);
}
