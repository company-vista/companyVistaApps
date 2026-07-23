import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { generatePDF } from 'react-native-html-to-pdf';
import RNFetchBlob from 'react-native-blob-util';
import Toast from 'react-native-toast-message';

import { BackButton } from '../../../components/buttons';
import { useThemeColors } from '../../../theme/colors';
import { styles } from './TransactionDetailScreenStyles';

export type TransactionDetail = {
  _id: string;
  amount: number;
  onlineAmount?: number;
  cashAmount?: number;
  currency: string;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'active' | string;
  type: string;
  description: string;
  notes: string;
  company: string;
  paymentMethod: string;
  referenceId: string;
  transactionId: string;
  gateway: string;
  bankName: string;
  accountLast4: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  invoice?: string | Record<string, unknown> | null;
};

type TransactionDetailScreenProps = {
  transaction: TransactionDetail;
  onBackPress: () => void;
};

export default function TransactionDetailScreen({
  transaction,
  onBackPress,
}: TransactionDetailScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return '#16a34a';
      case 'pending':
        return '#ca8a04';
      case 'failed':
        return '#dc2626';
      default:
        return colors.text;
    }
  };
console.log(transaction);
  const getStatusBg = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return '#f0fdf4';
      case 'pending':
        return '#fef9c3';
      case 'failed':
        return '#fef2f2';
      default:
        return colors.surface;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDetailValue = (value: unknown) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const invoiceNumber = typeof record.invoiceNumber === 'string' ? record.invoiceNumber : '';
      const invoiceId = typeof record._id === 'string' ? record._id : '';
      const numberValue = typeof record.number === 'string' ? record.number : '';
      return invoiceNumber || numberValue || invoiceId || '-';
    }

    return '-';
  };

  const handleDownload = async () => {
    const statusColor =
      transaction.status === 'completed' || transaction.status === 'active'
        ? '#16a34a'
        : transaction.status === 'pending'
          ? '#ca8a04'
        : '#dc2626';

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; font-family: sans-serif; }
  body { background:#fff; padding:20px; color:#334155; }
  .header { background:#1e1b4b; color:white; padding:25px; display:flex; justify-content:space-between; align-items:center; border-bottom:5px solid #eab308; }
  .logo { font-size:22px; font-weight:bold; letter-spacing:0.5px; }
  .logo span { color:#eab308; font-weight:300; }
  .receipt-title { font-size:26px; font-weight:900; letter-spacing:1px; }
  .receipt-id { font-size:12px; color:#cbd5e1; margin-top:2px; }
  .status-badge { color:white; font-size:11px; font-weight:bold; padding:4px 14px; border-radius:4px; text-transform:uppercase; margin-top:8px; display:inline-block; background:${statusColor}; }
  .amount-section { text-align:center; padding:30px; background:#fafafa; border-bottom:1px solid #e2e8f0; }
  .amount-label { font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
  .amount-value { font-size:36px; font-weight:900; color:#1e1b4b; }
  .breakdown { display:flex; justify-content:center; gap:30px; margin-top:16px; }
  .breakdown-item { text-align:center; }
  .breakdown-label { font-size:10px; color:#94a3b8; text-transform:uppercase; }
  .breakdown-value { font-size:16px; font-weight:700; margin-top:2px; }
  .details { padding:20px 25px; }
  .detail-row { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f1f5f9; }
  .detail-label { color:#94a3b8; font-size:12px; font-weight:600; }
  .detail-value { color:#1e1b4b; font-size:12px; font-weight:600; text-align:right; }
  .footer { background:#16143c; color:#94a3b8; padding:20px; text-align:center; font-size:10px; }
</style>
</head>
<body>
  <div style="border:1px solid #e2e8f0; max-width:600px; margin:0 auto; overflow:hidden;">
    <div class="header">
      <div>
        <div class="logo">Company<span>Vista</span></div>
        <div style="font-size:9px; color:#94a3b8; letter-spacing:2px; margin-top:3px;">BY KOSHIKA</div>
      </div>
      <div style="text-align:right;">
        <div class="receipt-title">PAYMENT RECEIPT</div>
        <div class="receipt-id">${transaction.transactionId || transaction._id}</div>
        <span class="status-badge">${transaction.status.toUpperCase()}</span>
      </div>
    </div>

    <div class="amount-section">
      <div class="amount-label">Total Amount</div>
      <div class="amount-value">${formatCurrency(transaction.amount, transaction.currency)}</div>
      <div class="breakdown">
        ${(transaction.paymentMethod === 'stripe' || transaction.paymentMethod === 'razorpay') ? `
        <div class="breakdown-item">
          <div class="breakdown-label">Online</div>
          <div class="breakdown-label" style="font-size:8px; letter-spacing:0.5px;">${transaction.paymentMethod.charAt(0).toUpperCase() + transaction.paymentMethod.slice(1)}</div>
          <div class="breakdown-value" style="color:#2563eb;">${formatCurrency(transaction.amount, transaction.currency)}</div>
        </div>` : ''}
        ${transaction.paymentMethod === 'cash' ? `
        <div class="breakdown-item">
          <div class="breakdown-label">Cash</div>
          <div class="breakdown-value" style="color:#059669;">${formatCurrency(transaction.amount, transaction.currency)}</div>
        </div>` : ''}
      </div>
    </div>

    <div class="details">
      <div class="detail-row">
        <span class="detail-label">Transaction ID</span>
        <span class="detail-value">${transaction.transactionId || '-'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Reference ID</span>
        <span class="detail-value">${transaction.referenceId || '-'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Type</span>
        <span class="detail-value">${transaction.type.replace(/_/g, ' ').toUpperCase()}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date</span>
        <span class="detail-value">${formatDate(transaction.date)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Payment Method</span>
        <span class="detail-value">${transaction.paymentMethod.toUpperCase()}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Gateway</span>
        <span class="detail-value">${transaction.gateway.charAt(0).toUpperCase() + transaction.gateway.slice(1)}</span>
      </div>
      ${transaction.bankName ? `
      <div class="detail-row">
        <span class="detail-label">Bank</span>
        <span class="detail-value">${transaction.bankName.toUpperCase()}</span>
      </div>` : ''}
      ${transaction.accountLast4 ? `
      <div class="detail-row">
        <span class="detail-label">Account</span>
        <span class="detail-value">•••• ${transaction.accountLast4}</span>
      </div>` : ''}
      ${transaction.description ? `
      <div class="detail-row">
        <span class="detail-label">Description</span>
        <span class="detail-value">${transaction.description}</span>
      </div>` : ''}
    </div>

    <div class="footer">
      <p style="margin-bottom:4px;">This is a system-generated payment receipt. No signature required.</p>
      <p style="color:#64748b; font-size:9px;">Downloaded on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
    </div>
  </div>
</body>
</html>`;

    try {
      const file = await generatePDF({
        html,
        fileName: `Receipt_${transaction.transactionId || transaction._id}`,
      });

      if (file.filePath) {
        const fileName = `Receipt_${transaction.transactionId || transaction._id}.pdf`;
        const downloadsPath = RNFetchBlob.fs.dirs.DownloadDir + '/' + fileName;
        await RNFetchBlob.fs.cp(file.filePath, downloadsPath);
        await RNFetchBlob.android.addCompleteDownload({
          title: fileName,
          path: downloadsPath,
          mime: 'application/pdf',
          description: `Payment Receipt ${transaction.transactionId}`,
          showNotification: true,
        });

        Toast.show({
          type: 'success',
          text1: 'Receipt Downloaded',
          text2: 'Saved to Downloads folder',
        });
      }
    } catch (err: any) {
      console.log('Receipt download failed', err);
      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: err?.message || 'Could not save receipt.',
      });
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: safeAreaInsets.top + 8 }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={onBackPress} />
        <Text style={[styles.title, { color: colors.text }]}>Transaction Details</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: safeAreaInsets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}>
        {/* Amount Section */}
        <View style={styles.downloadRow}>
          <Pressable style={styles.downloadButton} onPress={handleDownload}>
            <FontAwesome name="download" size={16} color="#4f46e5" />
            <Text style={styles.downloadButtonText}>Download Receipt</Text>
          </Pressable>
        </View>
        <View style={[styles.amountCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* <Text style={[styles.amountLabel, { color: colors.muted }]}>Total Amount</Text>
          <Text style={[styles.amountValue, { color: colors.text }]}>
            {formatCurrency(transaction.amount, transaction.currency)}
          </Text> */}
          <View style={styles.amountBreakdown}>
            {(transaction.paymentMethod === 'stripe' || transaction.paymentMethod === 'razorpay') && (
              <View style={[styles.amountModeCard, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
                <Text style={[styles.amountModeLabel, { color: '#2563eb' }]}>Online</Text>
                <Text style={[styles.amountModeGateway, { color: '#2563eb' }]}>
                  {transaction.paymentMethod.charAt(0).toUpperCase() + transaction.paymentMethod.slice(1)}
                </Text>
                <Text style={[styles.amountModeValue, { color: '#2563eb' }]}>
                  {formatCurrency(transaction.amount, transaction.currency)}
                </Text>
              </View>
            )}
            {transaction.paymentMethod === 'cash' && (
              <View style={[styles.amountModeCard, { backgroundColor: 'rgba(5, 150, 105, 0.1)' }]}>
                <Text style={[styles.amountModeLabel, { color: '#059669' }]}>Cash</Text>
                <Text style={[styles.amountModeValue, { color: '#059669' }]}>
                  {formatCurrency(transaction.amount, transaction.currency)}
                </Text>
              </View>
            )}
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusBg(transaction.status) },
            ]}>
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(transaction.status) },
              ]}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Transaction Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction Information</Text>

          <DetailRow
            label="Transaction ID"
            value={transaction.transactionId}
            colors={colors}
          />
          <DetailRow
            label="Reference ID"
            value={transaction.referenceId}
            colors={colors}
          />
          <DetailRow
            label="Type"
            value={transaction.type.replace(/_/g, ' ').toUpperCase()}
            colors={colors}
          />
          <DetailRow
            label="Date"
            value={formatDate(transaction.date)}
            colors={colors}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>

          <DetailRow
            label="Method"
            value={transaction.paymentMethod.toUpperCase()}
            colors={colors}
          />
          <DetailRow
            label="Gateway"
            value={transaction.gateway.charAt(0).toUpperCase() + transaction.gateway.slice(1)}
            colors={colors}
          />
          {transaction.bankName && (
            <DetailRow
              label="Bank"
              value={transaction.bankName.toUpperCase()}
              colors={colors}
            />
          )}
          {transaction.accountLast4 && (
            <DetailRow
              label="Account"
              value={`•••• ${transaction.accountLast4}`}
              colors={colors}
            />
          )}
        </View>

        {/* Description & Notes */}
        {(transaction.description || transaction.notes) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Additional Information</Text>

            {transaction.description && (
              <DetailRow
                label="Description"
                value={transaction.description}
                colors={colors}
              />
            )}
            {transaction.notes && (
              <DetailRow
                label="Notes"
                value={transaction.notes}
                colors={colors}
              />
            )}
          </View>
        )}

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Metadata</Text>

          <DetailRow
            label="Created At"
            value={formatDate(transaction.createdAt)}
            colors={colors}
          />
          <DetailRow
            label="Updated At"
            value={formatDate(transaction.updatedAt)}
            colors={colors}
          />
          <DetailRow
            label="Status"
            value={transaction.isActive ? 'Active' : 'Inactive'}
            colors={colors}
          />
          {transaction.invoice && (
            <DetailRow
              label="Invoice"
              value={formatDetailValue(transaction.invoice)}
              colors={colors}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

interface DetailRowProps {
  label: string;
  value: unknown;
  colors: any;
}

function DetailRow({ label, value, colors }: DetailRowProps) {
  const resolvedValue = typeof value === 'string' ? value : '';

  return (
    <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.detailLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={2}>
        {resolvedValue || '-'}
      </Text>
    </View>
  );
}

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     gap: 12,
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '500',
//   },
//   amountCard: {
//     padding: 20,
//     borderRadius: 16,
//     borderWidth: 1,
//     marginBottom: 24,
//     alignItems: 'center',
//   },
//   amountLabel: {
//     fontSize: 12,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   amountValue: {
//     fontSize: 32,
//     fontWeight: '800',
//     marginBottom: 12,
//   },
//   amountBreakdown: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 16,
//     width: '100%',
//   },
//   amountModeCard: {
//     flex: 1,
//     padding: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   amountModeLabel: {
//     fontSize: 10,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   amountModeValue: {
//     fontSize: 14,
//     fontWeight: '700',
//   },
//   statusBadge: {
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 8,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '700',
//   },
//   section: {
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: '700',
//     marginBottom: 12,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//   },
//   detailLabel: {
//     fontSize: 12,
//     fontWeight: '600',
//     flex: 0.4,
//   },
//   detailValue: {
//     fontSize: 12,
//     fontWeight: '500',
//     flex: 0.6,
//     textAlign: 'right',
//   },
// });
