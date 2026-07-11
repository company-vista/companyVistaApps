import React from 'react';
import { Modal, StyleSheet, Text, View, Pressable } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import StripeOneTimePayment from '../../../../stripe_pament_section/StripeOneTimePayment';

interface UnlockDocumentModalProps {
  visible: boolean;
  onClose: () => void;
  documentName?: string;
  price?: string;
  onPayPress?: () => void;
  companyId?: string;
  documentIndex?: number;
}

export default function UnlockDocumentModal({
  visible,
  onClose,
  documentName = 'Document 3 - test',
  price ,
  onPayPress,
  companyId,
  documentIndex,
}: UnlockDocumentModalProps) {
  console.log('UnlockDocumentModal render, visible:', visible);
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>

          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.lockIconCircle}>
                <FontAwesome name="lock" size={18} color="#FAC775" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Unlock This Document</Text>
                <Text style={styles.headerSubtitle}>{documentName}</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <FontAwesome name="times" size={18} color="#ffffff" style={{ opacity: 0.7 }} />
            </Pressable>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.fileIconContainer}>
              <FontAwesome name="file-text-o" size={20} color="#85B7EB" />
            </View>
            <View style={styles.featureTextColumn}>
              <Text style={styles.featureTitle}>One-time unlock</Text>
              <Text style={styles.featureDescription}>
                Pay once to unlock just this document — no subscription required.
              </Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceValue}>${price}</Text>
          </View>

          <Text style={styles.upsellText}>
            Prefer to unlock everything instead? Use <Text style={styles.whiteBoldText}>Unlock All Documents</Text> for ongoing access to every document for this company.
          </Text>

          <View style={styles.actionRow}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <StripeOneTimePayment
              invoice={{
                companyId,
                documentIndex,
                amount: price,
                currency: 'USD',
              }}
              paymentType="document_unlock"
              label={`Pay $${price} to Unlock`}
              buttonStyle={styles.payButton}
            />
          </View>

          <View style={styles.noticeBox}>
            <FontAwesome name="clock-o" size={14} color="#85B7EB" style={styles.noticeIcon} />
            <Text style={styles.noticeText}>
              We will deliver the document with in <Text style={styles.whiteBoldText}>24–72 hours.</Text>
            </Text>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#1E3A5F',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(133, 183, 235, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lockIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(250, 199, 117, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(250, 199, 117, 0.25)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#85B7EB',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(133, 183, 235, 0.15)',
    marginBottom: 20,
  },
  fileIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  featureTextColumn: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FAC775',
  },
  upsellText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    lineHeight: 18,
    marginBottom: 24,
  },
  whiteBoldText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  payButton: {
    flex: 1.3,
    height: 46,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(133, 183, 235, 0.06)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(133, 183, 235, 0.1)',
  },
  noticeIcon: {
    marginRight: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 16,
  },
});
