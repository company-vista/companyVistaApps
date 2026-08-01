import React from 'react';
import { Animated, Pressable, ScrollView, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from '../HomeScreen.styles';
export function CompanySwitcherModal({ isOpen, isLoading, companyOptions, selectedCompany, companySwitcherOpacity, companySwitcherTranslateY, onSelectCompany, onClose, colors, safeAreaInsets, }) {
    if (!isOpen)
        return null;
    return (<View style={styles.companySwitcherOverlay}>
      <Pressable onPress={onClose} style={[styles.companySwitcherBackdrop, { backgroundColor: colors.backdrop }]}/>
      <Animated.View style={[
            styles.companySwitcherDropdown,
            {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: companySwitcherOpacity,
                top: safeAreaInsets.top + 236,
                transform: [{ translateY: companySwitcherTranslateY }],
            },
        ]}>
        <View style={styles.companySwitcherHeader}>
          <View>
            <Text style={[styles.companySwitcherTitle, { color: colors.text }]}>
              Switch company
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
                    {company.name}
                  </Text>
                  <Text numberOfLines={1} style={[styles.companySwitcherMeta, { color: colors.muted }]}>
                    {company.companyType} - EIN {company.ein}
                  </Text>
                </View>
                {isSelected ? (<FontAwesome name="check-circle" size={20} color={colors.accent}/>) : (<FontAwesome name="angle-right" size={20} color={colors.muted}/>)}
              </Pressable>);
        })}
        </ScrollView>
      </Animated.View>
    </View>);
}
