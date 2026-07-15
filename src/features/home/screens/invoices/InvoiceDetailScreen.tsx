import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { generatePDF } from 'react-native-html-to-pdf';
import RNFetchBlob from 'react-native-blob-util';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import logo from "../../../../assets/images/logoR.png"

import BackButton from '../../../../components/buttons/BackButton';
import { useThemeColors } from '../../../../theme/colors';
import { formatDate } from '../../../../constants/dateFormatter';
import StripeOneTimePayment from '../../../../stripe_pament_section/StripeOneTimePayment';
import RazorpayOneTimePayment from '../../../../stripe_pament_section/RazorpayOneTimePayment';
import type { ClientInvoice } from '../../api/clientInvoicesApi';


type InvoiceDetailScreenProps = {
  invoice: ClientInvoice;
  onBackPress: () => void;
};

function getStringValue(...values: unknown[]) {
  const value = values.find(
    candidate => typeof candidate === 'string' && candidate.trim().length > 0,
  );
  return typeof value === 'string' ? value.trim() : '';
}

function getNumberValue(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number(value.replace(/[^0-9.-]/g, ''));
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return 0;
}

function formatAmount(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    currency,
    style: 'currency',
  }).format(value);
}

// नंबर को इंग्लिश शब्दों में बदलने का बेसिक हेल्पर (Amount in Words के लिए)
function numberToWords(num: number, currency = 'USD'): string {
  if (num === 0) return currency === 'INR' ? 'Zero Indian Rupees Only' : 'Zero US Dollars Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function twoDigits(n: number): string {
    if (n < 20) return ones[n];
    const t = Math.floor(n / 10);
    const o = n % 10;
    return tens[t] + (o ? ' ' + ones[o] : '');
  }

  function threeDigits(n: number): string {
    const h = Math.floor(n / 100);
    const rem = n % 100;
    let result = '';
    if (h > 0) result += ones[h] + ' Hundred';
    if (rem > 0) result += (result ? ' and ' : '') + twoDigits(rem);
    return result;
  }

  const currencyName = currency === 'INR' ? 'Indian Rupees' : 'US Dollars';

  if (currency === 'INR') {
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const hundred = Math.floor(num % 1000);
    let result = '';
    if (crore > 0) result += twoDigits(crore) + ' Crore ';
    if (lakh > 0) result += twoDigits(lakh) + ' Lakh ';
    if (thousand > 0) result += twoDigits(thousand) + ' Thousand ';
    if (hundred > 0) result += threeDigits(hundred);
    return (result.trim() || 'Zero') + ' ' + currencyName + ' Only';
  }

  const millions = Math.floor(num / 1000000);
  const thousands = Math.floor((num % 1000000) / 1000);
  const remainder = Math.floor(num % 1000);
  let result = '';
  if (millions > 0) result += twoDigits(millions) + ' Million ';
  if (thousands > 0) result += twoDigits(thousands) + ' Thousand ';
  if (remainder > 0) result += threeDigits(remainder);
  return (result.trim() || 'Zero') + ' ' + currencyName + ' Only';
}

function InvoiceDetailScreen({
  invoice,
  onBackPress,
}: InvoiceDetailScreenProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  
  // डेटा पार्सिंग
  const paymentStatus = getStringValue(
    invoice.paymentStatus,
  ).toLowerCase();
  const isPaid = paymentStatus === 'paid';
  const isPartial = paymentStatus === 'partial';

  const companyName =
    getStringValue(invoice.companyName, invoice.businessName) ||
    'Company Vista Inc';
  const fromAddress =
    getStringValue(invoice.companyAddress, invoice.fromAddress) ||
    '10409 Montgomery West Pkwy NE, Suite 202A, Albuquerque, NM 87111';
  const companyEmail = getStringValue(
    invoice.companyEmail,
    'sales@companyvista.com',
  );

  const clientName =
    getStringValue((invoice?.company as Record<string, unknown>)?.companyName, invoice.companyName, invoice.customerName, invoice.clientName) ||
    'AARS EXHIBITS LLC';
  const clientAddress =
    getStringValue(invoice.clientAddress, invoice.toAddress) ||
    ((invoice?.company as Record<string, unknown>)?.countryOfIncorporation
      ? `Company address not available (${(invoice?.company as Record<string, unknown>)?.countryOfIncorporation})`
      : 'Company address not available');
  const clientCountry =
    getStringValue(invoice.country, invoice.clientCountry, invoice?.company?.countryOfIncorporation) || 'United States';

  const currency =
    getStringValue(invoice.currency, invoice.currencyCode) || 'USD';
  const subtotal =
    getNumberValue(invoice.subtotal, invoice.subTotal) ||
    getNumberValue(invoice.totalAmount, invoice.total, invoice.grandTotal, invoice.amount);
  const gstAmount = currency === 'INR' ? subtotal * 0.18 : 0;
  const totalAmount = subtotal + gstAmount;
  const rawPaidAmount = getNumberValue(invoice.paidAmount, invoice.amountPaid);
  const paidAmount = isPaid ? totalAmount : rawPaidAmount;
  const balanceDue = isPaid ? 0 : totalAmount - rawPaidAmount;

  const bankName = getStringValue(invoice.bankName, 'Column N.A.');
  const accountNo = getStringValue(invoice.accountNo, '939612679843912');
  const routing = getStringValue(invoice.routing, '121145433');

  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const invoiceNumber =
    getStringValue(invoice.invoiceNumber, invoice.invoiceNo, invoice.number) ||
    'INV-202606-0001';
  const invDate = formatDate(getStringValue(invoice.invoiceDate, invoice.createdAt) || undefined, currency);
  const dueDate = formatDate(getStringValue(invoice.dueDate, invoice.due) || undefined, currency);

  // PDF डाउनलोड करने का फ़ंक्शन (इमेज के डिज़ाइन जैसा ही HTML आउटपुट)
  async function handleDownload() {
    const itemsHtml = items
      .map((item: Record<string, unknown>, i: number) => {
        const itemName =
          getStringValue(item.itemName, item.name, item.title) ||
          'AGENT & ADDRESS';
        const itemDesc =
          getStringValue(item.description) ||
          'Provides your company with a professional business presence...';
        const itemAmount = getNumberValue(item.amount) || 145.0;
        const itemQty = getNumberValue(item.quantity, 1);
        const itemType = getStringValue(item.itemType) || 'ONE-TIME';

        return `
        <tr style="vertical-align: top;">
          <td style="padding: 15px 10px; text-align: center; color: #94a3b8; border-bottom: 1px solid #f1f5f9;">${i + 1
          }</td>
          <td style="padding: 15px 10px; border-bottom: 1px solid #f1f5f9;">
            <div style="margin-bottom: 5px;">
              <span style="background: #14b8a6; color: white; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; margin-right: 8px;">${itemType}</span>
              <span style="font-size: 13px; font-weight: bold; color: #1e1b4b;">${itemName}</span>
            </div>
            <div style="font-size: 11px; color: #64748b; line-height: 1.5;">${itemDesc}</div>
          </td>
          <td style="padding: 15px 10px; text-align: center; font-weight: 500; border-bottom: 1px solid #f1f5f9;">${itemQty}</td>
          <td style="padding: 15px 10px; text-align: right; font-weight: 500; border-bottom: 1px solid #f1f5f9;">${formatAmount(
            itemAmount / itemQty,
            currency,
          )}</td>
          <td style="padding: 15px 10px; text-align: right; font-weight: bold; color: #1e1b4b; border-bottom: 1px solid #f1f5f9;">${formatAmount(
            itemAmount,
            currency,
          )}</td>
        </tr>`;
      })
      .join('');

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; font-family: sans-serif; }
  body { background:#fff; padding:20px; color: #334155; }
  .header { background: #1e1b4b; color: white; padding: 25px; display: flex; justify-content: space-between; align-items: center; border-bottom: 5px solid #eab308; }
  .logo { font-size: 22px; font-weight: bold; letter-spacing: 0.5px; }
  .logo span { color: #eab308; font-weight: 300; }
  .status-badge { background: #ef4444; color: white; font-size: 11px; font-weight: bold; padding: 4px 14px; border-radius: 4px; text-transform: uppercase; margin-top: 5px; display: inline-block; }
  .status-paid { background: #22c55e; }
  .status-partial { background: #d97706; }
  .details-grid { display: flex; justify-content: space-between; padding: 25px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
  .column { width: 30%; }
  .column h3 { color: #6d28d9; font-size: 11px; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px; }
  .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
  .info-label { color: #94a3b8; }
  .info-value { font-weight: 600; color: #1e1b4b; }
  table { width: 100%; border-collapse: collapse; margin-top: 0px; }
  th { background: #231f4f; color: white; font-size: 11px; padding: 10px; text-transform: uppercase; font-weight: 600; }
  .summary-box { display: flex; border-top: 1px solid #f1f5f9; }
  .summary-left { width: 50%; padding: 20px; border-right: 1px solid #f1f5f9; display: flex; flex-direction: column; justify-content: space-between; }
  .summary-right { width: 50%; padding: 20px; background: #fafafa; }
  .balance-bar { background: #1e1b4b; color: white; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; }
  .words-bar { padding: 15px 25px; background: #faf5ff; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
  .footer { background: #16143c; color: #94a3b8; padding: 20px; text-align: center; font-size: 10px; }
</style>
</head>
<body>
  <div style="border: 1px solid #e2e8f0; max-width: 850px; margin: 0 auto; overflow: hidden;">
    <div class="header">
      <div>
        <div class="logo">🌐 company<span>vista</span></div>
        <div style="font-size: 9px; color: #94a3b8; letter-spacing: 2px; margin-top: 3px; padding-left: 20px;">BY KOSHIKA</div>
      </div>
      <div style="text-align: right;">
        <h1 style="font-size: 26px; font-weight: 900; letter-spacing: 1px;">INVOICE</h1>
        <div style="font-size: 12px; color: #cbd5e1; margin-top: 2px;">${invoiceNumber}</div>
        <span class="status-badge ${isPaid ? 'status-paid' : isPartial ? 'status-partial' : ''}">${isPaid ? 'PAID' : isPartial ? 'PARTIAL' : 'UNPAID'
      }</span>
      </div>
    </div>

    <div class="details-grid">
      <div class="column">
        <h3>From</h3>
        <div style="font-weight: bold; color: #1e1b4b; margin-bottom: 4px;">${companyName}</div>
        <div style="color: #64748b; line-height: 1.4;">${fromAddress}</div>
        <div style="color: #6d28d9; margin-top: 5px;">${companyEmail}</div>
      </div>
      <div class="column">
        <h3>Bill To</h3>
        <div style="font-weight: bold; color: #1e1b4b; margin-bottom: 4px;">${clientName}</div>
        <div style="color: #64748b; line-height: 1.4;">${clientAddress}</div>
        <div style="color: #64748b; mt: 3px;">${clientCountry}</div>
      </div>
      <div class="column">
        <h3>Invoice Details</h3>
        <div class="info-row"><span class="info-label">Invoice No.</span><span class="info-value">${invoiceNumber}</span></div>
        <div class="info-row"><span class="info-label">Date</span><span class="info-value">${invDate}</span></div>
        <div class="info-row"><span class="info-label">Due Date</span><span class="info-value">${dueDate}</span></div>
        <div class="info-row"><span class="info-label">Currency</span><span class="info-value">${currency} — US Dollar</span></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 5%;">#</th>
          <th style="width: 55%; text-align: left; padding-left: 10px;">Service / Description</th>
          <th style="width: 8%;">Qty</th>
          <th style="width: 16%; text-align: right;">Unit Price (${currency})</th>
          <th style="width: 16%; text-align: right; padding-right: 10px;">Amount (${currency})</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="summary-box">
      <div class="summary-left">
        <div>
          <h3 style="color: #6d28d9; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; font-weight: bold;">Bank Details</h3>
          <div style="font-size: 11px; display: grid; grid-template-columns: 80px 1fr; row-gap: 4px;">
            <span style="color:#94a3b8;">Bank Name:</span><span style="font-weight:bold; color:#1e1b4b;">${bankName}</span>
            <span style="color:#94a3b8;">Account No.:</span><span style="font-weight:bold; color:#1e1b4b;">${accountNo}</span>
            <span style="color:#94a3b8;">Routing:</span><span style="font-weight:bold; color:#1e1b4b;">${routing}</span>
            <span style="color:#94a3b8;">Account Holder:</span><span style="font-weight:bold; color:#1e1b4b;">${companyName}</span>
          </div>
        </div>
        <div style="margin-top: 15px;">
          <h3 style="color: #6d28d9; font-size: 11px; text-transform: uppercase; margin-bottom: 5px; font-weight: bold;">Payment Terms</h3>
          <ul style="font-size: 10px; color: #64748b; padding-left: 12px; margin: 0; line-height: 1.4;">
            <li>Payment due upon receipt of invoice.</li>
            <li>Accepted: Bank Transfer (ACH/Wire), Check, Credit Card.</li>
            <li>Late payments subject to 1.5% monthly finance charge.</li>
          </ul>
        </div>
      </div>
      
      <div class="summary-right">
        <h3 style="color: #6d28d9; font-size: 11px; text-transform: uppercase; margin-bottom: 12px; font-weight: bold;">Amount Summary</h3>
        <div style="font-size: 11px; space-y: 6px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <div>
              <span style="background: #14b8a6; color: white; font-size: 8px; font-weight: bold; padding: 1px 4px; border-radius: 3px; text-transform: uppercase; margin-right: 5px;">ONE-TIME</span>
              <span style="color:#94a3b8;">One-time Services</span>
            </div>
            <span style="font-weight: 600; color:#1e1b4b;">${formatAmount(
        subtotal,
        currency,
      )}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            <span style="color:#94a3b8;">Sub Total</span>
            <span style="font-weight: 600; color:#1e1b4b;">${formatAmount(
        subtotal,
        currency,
      )}</span>
          </div>
          {currency === 'INR' && (
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color:#94a3b8;">GST (18.0%)</span>
            <span style="font-weight: 600; color:#1e1b4b;">${formatAmount(
        gstAmount,
        currency,
      )}</span>
          </div>
          )}
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold; color: #1e1b4b;">
            <span>Total</span>
            <span>${formatAmount(totalAmount, currency)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; color:#94a3b8;">
            <span>Amount Received</span>
            <span>${formatAmount(paidAmount, currency)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="balance-bar">
      <span style="font-size: 15px; font-weight: 500;">Balance Due</span>
      <span style="font-size: 26px; font-weight: 900;">${formatAmount(
        Math.max(0, balanceDue),
        currency,
      )}</span>
    </div>

    <div class="words-bar">
      <span style="font-weight: bold; color: #4c1d95;">Amount in Words:</span> 
      <span style="color: #6d28d9; font-style: italic; font-weight: 500; margin-left: 5px;">${numberToWords(
        totalAmount,
        currency,
      )}</span>
    </div>

    <div class="footer">
      <p style="margin-bottom: 5px;">Thank you for choosing ${companyName}. This invoice is system-generated — no signature required.</p>
      <p style="color: #64748b; font-size: 11px;">${companyEmail} &bull; www.companyvista.com</p>
    </div>
  </div>
</body>
</html>`;

    try {
      const file = await generatePDF({
        html,
        fileName: `Invoice_${invoiceNumber}`,
      });

      if (file.filePath) {
        const fileName = `Invoice_${invoiceNumber}.pdf`;
        const downloadsPath = RNFetchBlob.fs.dirs.DownloadDir + '/' + fileName;
        await RNFetchBlob.fs.cp(file.filePath, downloadsPath);
        await RNFetchBlob.android.addCompleteDownload({
          title: fileName,
          path: downloadsPath,
          mime: 'application/pdf',
          description: `Invoice ${invoiceNumber}`,
          showNotification: true,
        });

        Toast.show({
          type: 'success',
          text1: 'PDF Downloaded',
          text2: 'Saved to Downloads folder',
        });
      }
    } catch (err: any) {
      console.log('Invoice PDF download failed', err);
      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: err?.message || 'Could not save PDF file.',
      });
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* शीर्ष ऐप बार */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
            paddingTop: insets.top + 10,
            paddingBottom: 14,
          },
        ]}
      >
        <BackButton onPress={onBackPress} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Invoice Details
        </Text>
        <Pressable onPress={handleDownload} style={styles.topDownloadBtn}>
          <FontAwesome name="download" size={14} color="#4f46e5" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* कॉर्पोरेट डार्क बैनर स्टाइल हेडर */}
        <View style={styles.corporateHeader}>
          <View>
            <Text style={styles.logoText}>
              <View>
                <Image
                  source={logo}
                  style={styles.logos}
                  resizeMode="contain"
                />
              </View> 
            </Text>
         
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.invoiceTitleText}>INVOICE</Text>
            <Text style={styles.invoiceNumText}>{invoiceNumber}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isPaid ? '#22c55e' : isPartial ? '#d97706' : '#ef4444' },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {isPaid ? 'PAID' : isPartial ? 'PARTIAL' : 'UNPAID'}
              </Text>
            </View>
          </View>
        </View>

        {/* पीला डिवाइडर बॉर्डर */}
        <View style={styles.yellowDivider} />

        {/* एड्रेस और इन्वॉइस मेटा डेटा ग्रिड */}
        <View style={styles.detailsGrid}>
          <View style={styles.gridColumn}>
            <Text style={styles.columnLabel}>FROM</Text>
            <Text style={styles.companyNameText}>{companyName}</Text>
            <Text style={styles.addressText}>{fromAddress}</Text>
            <Text style={styles.emailText}>{companyEmail}</Text>
          </View>

          <View style={styles.gridColumn}>
            <Text style={styles.columnLabel}>BILL TO</Text>
            <Text style={styles.companyNameText}>{clientName}</Text>
            <Text style={styles.addressText}>{clientAddress}</Text>
            <Text style={styles.addressText}>{clientCountry}</Text>
          </View>

          <View style={styles.gridColumn}>
            <Text style={styles.columnLabel}>INVOICE DETAILS</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice No.</Text>
              <Text style={styles.metaValue}>{invoiceNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={styles.metaValue}>{invDate}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Due Date</Text>
              <Text style={styles.metaValue}>{dueDate}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Currency</Text>
              <Text style={styles.metaValue}>{currency} — USD</Text>
            </View>
          </View>
        </View>

        {/* टेबल हेडर */}
        <View style={styles.tableHeaderRow}>
          <Text
            style={[styles.tableHeaderText, { width: 24, textAlign: 'center' }]}
          >
            #
          </Text>
          <Text style={[styles.tableHeaderText, { flex: 1, paddingLeft: 8 }]}>
            SERVICE / DESCRIPTION
          </Text>
          <Text
            style={[styles.tableHeaderText, { width: 36, textAlign: 'center' }]}
          >
            QTY
          </Text>
          <Text
            style={[styles.tableHeaderText, { width: 70, textAlign: 'right' }]}
          >
            PRICE
          </Text>
          <Text
            style={[styles.tableHeaderText, { width: 75, textAlign: 'right' }]}
          >
            AMOUNT
          </Text>
        </View>

        {/* टेबल लिस्ट आइटम्स */}
        {items.map((item: Record<string, unknown>, index: number) => {
          const itemAmount = getNumberValue(item.amount) || 145.0;
          const itemQty = getNumberValue(item.quantity, 1);
          const itemName =
            getStringValue(item.itemName, item.name, item.title) ||
            'AGENT & ADDRESS';
          const itemDesc =
            getStringValue(item.description) ||
            'Provides your company with a professional business presence...';
          const itemType = getStringValue(item.itemType) || 'ONE-TIME';

          return (
            <View key={index} style={styles.tableBodyRow}>
              <Text style={styles.tableRowIndex}>{index + 1}</Text>
              <View style={{ flex: 1, paddingHorizontal: 8 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 4,
                  }}
                >
                  <View style={styles.itemTypeTag}>
                    <Text style={styles.itemTypeTagText}>{itemType}</Text>
                  </View>
                  <Text style={styles.itemNameText}>{itemName}</Text>
                </View>
                <Text style={styles.itemDescText}>{itemDesc}</Text>
              </View>
              <Text style={styles.tableRowQty}>{itemQty}</Text>
              <Text style={styles.tableRowPrice}>
                {formatAmount(itemAmount / itemQty, currency)}
              </Text>
              <Text style={styles.tableRowAmount}>
                {formatAmount(itemAmount, currency)}
              </Text>
            </View>
          );
        })}

        <View style={styles.splitBox}>
          <View style={styles.splitLeft}>
            <Text style={styles.boxTitle}>BANK DETAILS</Text>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Bank Name:</Text>
              <Text style={styles.bankValue}>{bankName}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Account No:</Text>
              <Text style={styles.bankValue}>{accountNo}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Routing:</Text>
              <Text style={styles.bankValue}>{routing}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Account Holder:</Text>
              <Text style={styles.bankValue}>{companyName}</Text>
            </View>

            <Text style={[styles.boxTitle, { marginTop: 16 }]}>
              PAYMENT TERMS
            </Text>
            <Text style={styles.termsText}>
              • Payment due upon receipt of invoice.
            </Text>
            <Text style={styles.termsText}>
              • Accepted: Bank Transfer, Check, Credit Card.
            </Text>
          </View>

          <View style={styles.splitRight}>
            <Text style={styles.boxTitle}>AMOUNT SUMMARY</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelText}>One-time Services</Text>
              <Text style={styles.summaryValueText}>
                {formatAmount(subtotal, currency)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelText}>Sub Total</Text>
              <Text style={styles.summaryValueText}>
                {formatAmount(subtotal, currency)}
              </Text>
            </View>
            {currency === 'INR' && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelText}>GST (18.0%)</Text>
              <Text style={styles.summaryValueText}>
                {formatAmount(gstAmount, currency)}
              </Text>
            </View>
            )}
            <View
              style={[
                styles.summaryRow,
                { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 6 },
              ]}
            >
              <Text style={{ fontWeight: '700', fontSize: 12 }}>Total</Text>
              <Text style={{ fontWeight: '700', fontSize: 12 }}>
                {formatAmount(totalAmount, currency)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelText}>Amount Received</Text>
              <Text style={styles.summaryValueText}>
                {formatAmount(paidAmount, currency)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.balanceStrip}>
          <Text style={styles.balanceStripLabel}>Balance Due</Text>
          <Text style={styles.balanceStripValue}>
            {formatAmount(Math.max(0, balanceDue), currency)}
          </Text>
        </View>

        {paymentStatus !== 'paid' && (
          <View style={styles.payButtonsRow}>
            {currency === 'INR' && (
              <RazorpayOneTimePayment
                invoice={{
                  id: getStringValue(invoice._id as string) || invoiceNumber,
                  companyId: getStringValue(invoice.companyId) || undefined,
                  company: invoice.company as { _id?: string } | undefined,
                  amount: balanceDue,
                  currency,
                }}
                paymentType="invoice"
                label="Pay with Razorpay"
                buttonStyle={[styles.payButton, { backgroundColor: '#072654' }]}
              />
            )}
            <StripeOneTimePayment
              invoice={{
                id: invoiceNumber,
                companyId: getStringValue(invoice.companyId) || undefined,
                company: invoice.company as { _id?: string } | undefined,
                amount: balanceDue,
                currency,
              }}
              paymentType="invoice"
              label="Pay with Stripe"
              buttonStyle={[styles.payButton, { backgroundColor: '#635BFF' }]}
            />
          </View>
        )}

        <View style={styles.wordsStrip}>
          <Text style={styles.wordsLabel}>Amount in Words:</Text>
          <Text style={styles.wordsValue}>{numberToWords(totalAmount, currency)}</Text>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerMainText}>
            Thank you for choosing {companyName}.
          </Text>
          <Text style={styles.footerSubText}>
            This invoice is system-generated — no signature required.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  topDownloadBtn: { paddingLeft: 16 , paddingRight: 16, paddingBottom: 10, paddingTop: 10, backgroundColor: '#eef2ff', borderRadius: 8 },
  corporateHeader: {
    backgroundColor: '#1e1b4b',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logoLight: { color: '#eab308', fontWeight: '300' },
  logoSubText: {
    color: '#94a3b8',
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 2,
    paddingLeft: 18,
  },
  logos: {
    width: 162,
    height: 45
  },
  invoiceTitleText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 1,
  },
  invoiceNumText: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  yellowDivider: { height: 4, backgroundColor: '#eab308' },
  detailsGrid: { padding: 16, backgroundColor: '#ffffff', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridColumn: { flex: 1, minWidth: 140, marginBottom: 16, paddingHorizontal: 8, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, backgroundColor: '#fafafa' },
  columnLabel: {
    color: '#6d28d9',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  companyNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e1b4b',
    marginBottom: 4,
  },
  addressText: { fontSize: 12, color: '#64748b', lineHeight: 16 },
  emailText: { fontSize: 12, color: '#6d28d9', marginTop: 4 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  metaLabel: { fontSize: 12, color: '#94a3b8' },
  metaValue: { fontSize: 12, fontWeight: '600', color: '#1e1b4b' },
  tableHeaderRow: {
    backgroundColor: '#231f4f',
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableHeaderText: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
  tableBodyRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
    alignItems: 'flex-start',
  },
  tableRowIndex: {
    width: 24,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
  },
  itemTypeTag: {
    backgroundColor: '#14b8a6',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    marginRight: 6,
  },
  itemTypeTagText: { color: '#ffffff', fontSize: 9, fontWeight: '700' },
  itemNameText: { fontSize: 12, fontWeight: '700', color: '#1e1b4b', flex: 1 },
  itemDescText: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
    marginTop: 2,
  },
  tableRowQty: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    color: '#1e1b4b',
    fontWeight: '500',
  },
  tableRowPrice: {
    width: 70,
    textAlign: 'right',
    fontSize: 12,
    color: '#1e1b4b',
    fontWeight: '500',
  },
  tableRowAmount: {
    width: 75,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
    color: '#1e1b4b',
  },
  splitBox: {
    flexDirection: "column",
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  splitLeft: {
    flex: 1,
    padding: 14,
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
  },
  splitRight: { flex: 1, padding: 14, backgroundColor: '#fafafa' },
  boxTitle: {
    color: '#6d28d9',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  bankRow: { flexDirection: 'row', marginBottom: 4 },
  bankLabel: { width: 95, fontSize: 11, color: '#94a3b8' },
  bankValue: { flex: 1, fontSize: 11, fontWeight: '600', color: '#1e1b4b' },
  termsText: { fontSize: 10, color: '#64748b', marginBottom: 2 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabelText: { fontSize: 11, color: '#94a3b8' },
  summaryValueText: { fontSize: 11, fontWeight: '600', color: '#1e1b4b' },
  balanceStrip: {
    backgroundColor: '#1e1b4b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceStripLabel: { color: '#ffffff', fontSize: 14, fontWeight: '500' },
  balanceStripValue: { color: '#ffffff', fontSize: 22, fontWeight: '900' },
  wordsStrip: {
    padding: 12,
    backgroundColor: '#faf5ff',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  wordsLabel: { fontSize: 11, fontWeight: '700', color: '#4c1d95' },
  wordsValue: {
    fontSize: 11,
    color: '#6d28d9',
    fontStyle: 'italic',
    marginLeft: 4,
    flex: 1,
    fontWeight: '500',
  },
  footerContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  footerMainText: { fontSize: 12, fontWeight: '600', color: '#1e1b4b' },
  footerSubText: { fontSize: 10, color: '#64748b', marginTop: 2 },
  payButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
  },
  payButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default InvoiceDetailScreen;
