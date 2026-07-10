import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../../../theme/colors';

const PLANS_DATA = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: '$145',
    period: '/year',
    docs: '10 Documents/Year',
    accentColor: '#00A8E8',
    isActive: false,
    badge: null,
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '$245',
    period: '/year',
    docs: '25 Documents/Year',
    accentColor: '#8E7CFF',
    isActive: false,
    badge: 'Most Popular',
    badgeBg: '#FAC775',
    badgeText: '#0D2137',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: '$345',
    period: '/year',
    docs: 'Unlimited Documents',
    accentColor: '#FF6B4A',
    isActive: true,
    badge: 'Current Plan',
    badgeBg: '#10B981',
    badgeText: '#ffffff',
  },
];

interface ManageSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ManageSubscriptionModal({ visible, onClose }: ManageSubscriptionModalProps) {
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={[styles.overlay, { backgroundColor: colors.backdrop }]}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.container}>
            <View style={[styles.header, { borderColor: colors.border }]}>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Manage Subscription</Text>
                <Text style={[styles.headerSubtitle, { color: isDark ? '#85B7EB' : colors.accent }]}>Choose a plan for test.</Text>
              </View>
              <Pressable style={styles.closeBtn} onPress={onClose}>
                <FontAwesome name="times" size={20} color={colors.text} style={{ opacity: 0.6 }} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.sectionTitleRow}>
                <FontAwesome name="rocket" size={16} color="#FAC775" style={{ marginRight: 8 }} />
                <Text style={[styles.sectionTitleText, { color: colors.text }]}>Choose a Plan for test</Text>
              </View>

              {PLANS_DATA.map((plan) => (
                <View
                  key={plan.id}
                  style={[
                    styles.planCard,
                    { backgroundColor: colors.surface, borderColor: plan.isActive ? plan.accentColor : colors.border },
                    plan.isActive && styles.activeCardBorder,
                  ]}
                >
                  {plan.badge && (
                    <View style={[styles.badge, { backgroundColor: plan.badgeBg }]}>
                      <Text style={[styles.badgeText, { color: plan.badgeText }]}>{plan.badge}</Text>
                    </View>
                  )}

                  <View style={[styles.cardTopAccent, { backgroundColor: plan.accentColor }]} />

                  <View style={styles.cardMain}>
                    <View style={[styles.iconCircle, { backgroundColor: `${plan.accentColor}15` }]}>
                      <FontAwesome
                        name={plan.id === 'enterprise' ? 'shield' : 'file-text'}
                        size={18}
                        color={plan.accentColor}
                      />
                    </View>

                    <Text style={[styles.planNameText, { color: colors.text }]}>{plan.name}</Text>

                    <View style={styles.priceRow}>
                      <Text style={[styles.priceText, { color: colors.text }]}>{plan.price}</Text>
                      <Text style={[styles.periodText, { color: colors.muted }]}>{plan.period}</Text>
                    </View>

                    <Text style={[styles.docsText, { color: colors.subtle }]}>{plan.docs}</Text>
                  </View>

                  <View style={styles.cardBottomAction}>
                    {plan.isActive ? (
                      <View style={styles.activeLabelRow}>
                        <FontAwesome name="check-circle" size={16} color="#10B981" style={{ marginRight: 6 }} />
                        <Text style={styles.activeButtonText}>Active</Text>
                      </View>
                    ) : (
                      <Pressable style={[styles.subscribeBtn, { backgroundColor: plan.accentColor }]}>
                        <Text style={styles.subscribeBtnText}>Subscribe</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    borderRadius: 24,
    width: '98%',
    height: 600,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  closeBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  planCard: {
    width: '100%',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
  },
  activeCardBorder: {
    borderWidth: 1.5,
  },
  cardTopAccent: {
    height: 3,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardMain: {
    padding: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  planNameText: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 8,
  },
  priceText: {
    fontSize: 32,
    fontWeight: '800',
  },
  periodText: {
    fontSize: 14,
    marginLeft: 2,
  },
  docsText: {
    fontSize: 13,
    fontWeight: '500',
  },
  cardBottomAction: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  activeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButtonText: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '700',
  },
});
