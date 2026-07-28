import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { useThemeColors } from '../../../../theme/colors';
import { font } from '../../../../theme/typography';
import type { QuickAccessItemId } from '../../data/quickAccessItems';

type OrderServicesSectionProps = {
  onQuickAccessItemPress: (itemId: QuickAccessItemId) => void;
};

const serviceItems = [
  {
    title: 'State Tax Filing',
    subtitle: 'Delaware - Resolve overdue status',
    tag: 'Urgent',
    icon: 'file-text-o',
    tone: 'red',
  },
  {
    title: 'Federal Tax Filing',
    subtitle: 'Form 1120 / 5472 preparation',
    tag: 'Due_Jul_15',
    icon: 'file-text',
    tone: 'amber',
  },
  {
    title: 'Register New Entity',
    subtitle: 'LLC, C-Corp or S-Corp - Any state',
    tag: undefined,
    icon: 'building-o',
    tone: 'blue',
  },
  {
    title: 'Change Registered Agent',
    subtitle: 'Nationwide - Same day processing',
    tag: undefined,
    icon: 'exchange',
    tone: 'purple',
  },
  {
    title: 'Bookkeeping',
    subtitle: 'Monthly reconciliation and reports',
    tag: undefined,
    icon: 'calculator',
    tone: 'blue',
  },
  {
    title: 'Compliance Check',
    subtitle: 'Stay ahead of filing deadlines',
    tag: 'New',
    icon: 'check-square-o',
    tone: 'purple',
  },
] as const;

type Tone = (typeof serviceItems)[number]['tone'];

function getToneStyles(tone: Tone) {
  const toneStyles = {
    amber: {
      icon: styles.iconAmber,
      iconText: styles.iconTextAmber,
      tag: styles.tagAmber,
      tagText: styles.tagTextAmber,
      borderColor: 'rgba(245, 158, 11, 0.5)',
    },
    blue: {
      icon: styles.iconBlue,
      iconText: styles.iconTextBlue,
      tag: styles.tagBlue,
      tagText: styles.tagTextBlue,
      borderColor: 'rgba(59, 130, 246, 0.5)',
    },
    purple: {
      icon: styles.iconPurple,
      iconText: styles.iconTextPurple,
      tag: styles.tagPurple,
      tagText: styles.tagTextPurple,
      borderColor: 'rgba(139, 92, 246, 0.5)',
    },
    red: {
      icon: styles.iconRed,
      iconText: styles.iconTextRed,
      tag: styles.tagRed,
      tagText: styles.tagTextRed,
      borderColor: 'rgba(239, 68, 68, 0.5)',
    },
  };

  return toneStyles[tone];
}

function OrderServicesSection({
  onQuickAccessItemPress,
}: OrderServicesSectionProps) {
  const colors = useThemeColors();
  const isLight = colors.mode === 'light';
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleItems = serviceItems.slice(0, 4);
  const extraItems = serviceItems.slice(4);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Explore Services</Text>
        <Pressable onPress={() => setIsExpanded(value => !value)}>
          <Text style={styles.moreText}>{isExpanded ? 'Less' : 'More'}</Text>
        </Pressable>
      </View>

      <View style={styles.gridContainer}>
        {visibleItems.map(item => {
          const tone = getToneStyles(item.tone);

          return (
              <Pressable 
              key={item.title} 
              style={[styles.gridItem, { borderColor: tone.borderColor, backgroundColor: isLight ? 'rgba(229,231,235,0.5)' : 'rgba(255,255,255,0.07)' }]}
              onPress={item.title === 'Federal Filing' ? () => onQuickAccessItemPress('federalFiling') : () => console.log(item.title)} 
            >
              <View style={styles.iconWrapper}>
                <View style={[styles.serviceIcon, tone.icon]}>
                  <FontAwesome
                    name={item.icon}
                      size={21}
                    style={tone.iconText}
                  />
                </View>
              </View>

                  <Text style={[styles.serviceTitle, { color: colors.text }]} numberOfLines={2} ellipsizeMode="tail">
                {item.title}
              </Text>
              
              {/* 4. छोटा सब-टेक्स्ट (वर्टिकल लिस्ट के सबटाइटल का डेटा) */}
              {/* <Text style={[styles.serviceSubtitle, { color: colors.muted }]} numberOfLines={1}>
                {item.subtitle.split(' - ')[0]}
              </Text> */}
            </Pressable>
          );
        })}
      </View>

      {isExpanded && extraItems.length > 0 ? (
        <View style={styles.expandedSection}>
          <View style={styles.expandedGridContainer}>
            {extraItems.map(item => {
              const tone = getToneStyles(item.tone);

              return (
                <Pressable key={`${item.title}-extra`} style={[styles.gridItem, { borderColor: tone.borderColor, backgroundColor: isLight ? 'rgba(229,231,235,0.5)' : 'rgba(255,255,255,0.07)' }]} onPress={() => console.log(item.title)}>
                  <View style={styles.iconWrapper}>
                    <View style={[styles.serviceIcon, tone.icon]}>
                      <FontAwesome name={item.icon} size={18} style={tone.iconText} />
                    </View>
                  </View>
              <Text style={[styles.serviceTitle, { color: colors.text }]} numberOfLines={2} ellipsizeMode="tail">
                    {item.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 14,
    paddingHorizontal: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#2C2C2A',
    fontSize: font.xl,
    fontWeight: '500',
    
  },
  moreText: {
    color: '#D85A30',
    fontSize: font.base,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    columnGap: 10,
  },
  gridItem: {
    width: '24%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 6,
    overflow: 'hidden',
    aspectRatio: 1,
  },
  expandedSection: {
    marginTop: 10,
    paddingTop: 0,
  },
  expandedGridContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    columnGap: 10,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 2,
   
  },
  serviceIcon: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  serviceTitle: {
    fontSize: font.xs,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: font.xs + 2,
    minHeight: font.xs * 2 + 4,
  },
  serviceSubtitle: {
    fontSize: font.xs,
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.7,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    maxWidth: 45,
  },
  badgeText: {
    fontSize: font.xs,
    fontWeight: '600',
  },
  iconBlue: {},
  iconAmber: {},
  iconRed: {},
  iconPurple: {},
  iconTextBlue: {
    color: '#1D4ED8',
  },
  iconTextAmber: {
    color: '#B45309',
  },
  iconTextRed: {
    color: '#DC2626',
  },
  iconTextPurple: {
    color: '#7C3AED',
  },
  tagBlue: {
    backgroundColor: '#DBEAFE',
  },
  tagAmber: {
    backgroundColor: '#FEF3C7',
  },
  tagRed: {
    backgroundColor: '#FEE2E2',
  },
  tagPurple: {
    backgroundColor: '#EDE9FE',
  },
  tagTextBlue: {
    color: '#1D4ED8',
  },
  tagTextAmber: {
    color: '#B45309',
  },
  tagTextRed: {
    color: '#DC2626',
  },
  tagTextPurple: {
    color: '#7C3AED',
  },
});

export default OrderServicesSection;