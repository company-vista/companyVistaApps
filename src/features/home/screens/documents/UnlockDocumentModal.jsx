import React from 'react';
import { Modal, StyleSheet, Text, View, Pressable } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import StripeOneTimePayment from '../../../../stripe_pament_section/StripeOneTimePayment';
import { s } from '../../../../theme/responsive';
import { font } from '../../../../theme/typography';
import { themePalette, makeThemeStyles } from '../../../../theme/colors';
export default function UnlockDocumentModal({ visible, onClose, documentName = 'Document 3 - test', price, onPayPress, companyId, documentIndex, }) {
    console.log('UnlockDocumentModal render, visible:', visible);
    return (<Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>

          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.lockIconCircle}>
                <FontAwesome name="lock" size={18} color={themePalette.hex_fac775}/>
              </View>
              <View>
                <Text style={styles.headerTitle}>Unlock This Document</Text>
                <Text style={styles.headerSubtitle}>{documentName}</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <FontAwesome name="times" size={18} color={themePalette.hex_ffffff} style={{ opacity: 0.7 }}/>
            </Pressable>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.fileIconContainer}>
              <FontAwesome name="file-text-o" size={20} color={themePalette.hex_85b7eb}/>
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

            <StripeOneTimePayment invoice={{
            companyId,
            documentIndex,
            amount: price,
            currency: 'USD',
        }} paymentType="document_unlock" label={`Pay $${price} to Unlock`} buttonStyle={styles.payButton}/>
          </View>

          <View style={styles.noticeBox}>
            <FontAwesome name="clock-o" size={14} color={themePalette.hex_85b7eb} style={styles.noticeIcon}/>
            <Text style={styles.noticeText}>
              We will deliver the document with in <Text style={styles.whiteBoldText}>24–72 hours.</Text>
            </Text>
          </View>

        </View>
      </View>
    </Modal>);
}
const styles = makeThemeStyles(() => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: themePalette.rgba_0_0_0_0_55,
        justifyContent: 'center',
        alignItems: 'center',
        padding: s(24),
    },
    modalBox: {
        width: '100%',
        backgroundColor: themePalette.hex_1e3a5f,
        borderRadius: s(24),
        padding: s(18),
        borderWidth: 1,
        borderColor: themePalette.rgba_133_183_235_0_25,
        shadowColor: themePalette.hex_000,
        shadowOffset: { width: 0, height: s(10) },
        shadowOpacity: 0.3,
        shadowRadius: s(20),
        elevation: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: s(20),
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(12),
    },
    lockIconCircle: {
        width: s(38),
        height: s(38),
        borderRadius: s(19),
        backgroundColor: themePalette.rgba_250_199_117_0_12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: themePalette.rgba_250_199_117_0_25,
    },
    headerTitle: {
        fontSize: font.heading,
        fontWeight: '700',
        color: themePalette.hex_ffffff,
        letterSpacing: 0.3,
    },
    headerSubtitle: {
        fontSize: font.md,
        color: themePalette.hex_85b7eb,
        marginTop: 2,
    },
    closeBtn: {
        padding: s(6),
    },
    featureCard: {
        flexDirection: 'row',
        backgroundColor: themePalette.rgba_255_255_255_0_05,
        borderRadius: s(16),
        padding: s(16),
        borderWidth: 1,
        borderColor: themePalette.rgba_133_183_235_0_15,
        marginBottom: s(20),
    },
    fileIconContainer: {
        marginRight: s(12),
        marginTop: s(2),
    },
    featureTextColumn: {
        flex: 1,
    },
    featureTitle: {
        fontSize: font.xl,
        fontWeight: '700',
        color: themePalette.hex_ffffff,
        marginBottom: s(4),
    },
    featureDescription: {
        fontSize: font.md,
        color: themePalette.rgba_255_255_255_0_65,
        lineHeight: s(18),
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: s(16),
    },
    priceLabel: {
        fontSize: font.xl,
        color: themePalette.rgba_255_255_255_0_8,
        fontWeight: '500',
    },
    priceValue: {
        fontSize: font.displayLarge,
        fontWeight: '800',
        color: themePalette.hex_fac775,
    },
    upsellText: {
        fontSize: font.base,
        color: themePalette.rgba_255_255_255_0_45,
        lineHeight: s(18),
        marginBottom: s(24),
    },
    whiteBoldText: {
        color: themePalette.hex_ffffff,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        gap: s(12),
        marginBottom: s(20),
    },
    cancelButton: {
        flex: 1,
        height: s(46),
        borderRadius: s(12),
        borderWidth: 1,
        borderColor: themePalette.rgba_255_255_255_0_2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: themePalette.hex_ffffff,
        fontSize: font.lg,
        fontWeight: '600',
    },
    payButton: {
        flex: 1.3,
        height: s(46),
        backgroundColor: themePalette.hex_00c853,
        borderRadius: s(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    noticeBox: {
        flexDirection: 'row',
        backgroundColor: themePalette.rgba_133_183_235_0_06,
        borderRadius: s(12),
        padding: s(12),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: themePalette.rgba_133_183_235_0_1,
    },
    noticeIcon: {
        marginRight: s(8),
    },
    noticeText: {
        flex: 1,
        fontSize: font.sm,
        color: themePalette.rgba_255_255_255_0_5,
        lineHeight: s(16),
    },
}));
