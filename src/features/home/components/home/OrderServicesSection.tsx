import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { useThemeColors } from '../../../../theme/colors';
import type { QuickAccessItemId } from '../../data/quickAccessItems';

type OrderServicesSectionProps = {
  onQuickAccessItemPress: (itemId: QuickAccessItemId) => void;
};

const serviceItems = [
  {
    title: 'State Filing',
    subtitle: 'Delaware - Resolve overdue status',
    tag: 'Urgent',
    icon: 'file-text-o',
    tone: 'red',
  },
  {
    title: 'Federal Filing',
    subtitle: 'Form 1120 / 5472 preparation',
    tag: 'Due_Jul_15',
    icon: 'file-text',
    tone: 'amber',
  },
  {
    title: 'Add Entity',
    subtitle: 'LLC, C-Corp or S-Corp - Any state',
    tag: undefined,
    icon: 'building-o',
    tone: 'blue',
  },
  {
    title: 'Change Agent',
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
    },
    blue: {
      icon: styles.iconBlue,
      iconText: styles.iconTextBlue,
      tag: styles.tagBlue,
      tagText: styles.tagTextBlue,
    },
    purple: {
      icon: styles.iconPurple,
      iconText: styles.iconTextPurple,
      tag: styles.tagPurple,
      tagText: styles.tagTextPurple,
    },
    red: {
      icon: styles.iconRed,
      iconText: styles.iconTextRed,
      tag: styles.tagRed,
      tagText: styles.tagTextRed,
    },
  };

  return toneStyles[tone];
}

function OrderServicesSection({
  onQuickAccessItemPress,
}: OrderServicesSectionProps) {
  const colors = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleItems = serviceItems.slice(0, 4);
  const extraItems = serviceItems.slice(4);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Order services</Text>
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
              style={styles.gridItem}
              onPress={item.title === 'Federal Filing' ? () => onQuickAccessItemPress('federalFiling') : () => console.log(item.title)} 
            >
              <View style={styles.iconWrapper}>
                {/* 1. स्क्वायर आइकॉन बॉक्स */}
                <View style={[styles.serviceIcon, tone.icon]}>
                  <FontAwesome
                    name={item.icon}
                    size={18}
                    style={tone.iconText}
                  />
                </View>

                {/* 2. एब्सोल्यूटली पोज़िशन किया हुआ टैग/पिल (यदि मौजूद हो) */}
                {item.tag ? (
                  <View style={[styles.badge, tone.tag]}>
                    <Text style={[styles.badgeText, tone.tagText]} numberOfLines={1}>
                      {item.tag.split(' ')[0]} {/* जगह की कमी के कारण पहला शब्द (जैसे 'Urgent' या 'Due') */}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* 3. मुख्य टाइटल (image_8ba545.png के टेक्स्ट स्टाइल में) */}
              <Text style={[styles.serviceTitle, { color: colors.text }]} numberOfLines={2}>
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
                <Pressable key={`${item.title}-extra`} style={styles.gridItem} onPress={() => console.log(item.title)}>
                  <View style={styles.iconWrapper}>
                    <View style={[styles.serviceIcon, tone.icon]}>
                      <FontAwesome name={item.icon} size={18} style={tone.iconText} />
                    </View>
                    {item.tag ? (
                      <View style={[styles.badge, tone.tag]}>
                        <Text style={[styles.badgeText, tone.tagText]} numberOfLines={1}>
                          {item.tag.split(' ')[0]}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.serviceTitle, { color: colors.text }]} numberOfLines={2}>
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
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#2C2C2A',
    fontSize: 15,
    fontWeight: '500',
    
  },
  moreText: {
    color: '#D85A30',
    fontSize: 12,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gridItem: {
    width: '23%', // 4 कॉलम ग्रिड के लिए परफेक्ट विड्थ
    alignItems: 'center',
  },
  expandedSection: {
    marginTop: 10,
    paddingTop: 0,
  },
  expandedGridContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    rowGap: 16,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  serviceIcon: {
    width: 54, // image_8ba545.png की तरह परफेक्ट स्क्वायर साइज
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  serviceTitle: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
    minHeight: 28,
  },
  serviceSubtitle: {
    fontSize: 9,
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
    fontSize: 8,
    fontWeight: '600',
  },
  iconBlue: {
    backgroundColor: '#DBEAFE',
  },
  iconAmber: {
    backgroundColor: '#FEF3C7',
  },
  iconRed: {
    backgroundColor: '#FEE2E2',
  },
  iconPurple: {
    backgroundColor: '#EDE9FE',
  },
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