import { formatAmount } from './InvoiceDetailScreen';
export function buildInvoiceHtml(p) {
    return `<!DOCTYPE html>
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
        <div style="font-size: 12px; color: #cbd5e1; margin-top: 2px;">${p.invoiceNumber}</div>
        <span class="status-badge ${p.isPaid ? 'status-paid' : p.isPartial ? 'status-partial' : ''}">${p.isPaid ? 'PAID' : p.isPartial ? 'PARTIAL' : 'UNPAID'}</span>
      </div>
    </div>

    <div class="details-grid">
      <div class="column">
        <h3>From</h3>
        <div style="font-weight: bold; color: #1e1b4b; margin-bottom: 4px;">${p.companyName}</div>
        <div style="color: #64748b; line-height: 1.4;">${p.fromAddress}</div>
        <div style="color: #6d28d9; margin-top: 5px;">${p.companyEmail}</div>
      </div>
      <div class="column">
        <h3>Bill To</h3>
        <div style="font-weight: bold; color: #1e1b4b; margin-bottom: 4px;">${p.clientName}</div>
        <div style="color: #64748b; line-height: 1.4;">${p.clientAddress}</div>
        <div style="color: #64748b; mt: 3px;">${p.clientCountry}</div>
      </div>
      <div class="column">
        <h3>Invoice Details</h3>
        <div class="info-row"><span class="info-label">Invoice No.</span><span class="info-value">${p.invoiceNumber}</span></div>
        <div class="info-row"><span class="info-label">Date</span><span class="info-value">${p.invDate}</span></div>
        <div class="info-row"><span class="info-label">Due Date</span><span class="info-value">${p.dueDate}</span></div>
        <div class="info-row"><span class="info-label">Currency</span><span class="info-value">${p.currency} — US Dollar</span></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 5%;">#</th>
          <th style="width: 55%; text-align: left; padding-left: 10px;">Service / Description</th>
          <th style="width: 8%;">Qty</th>
          <th style="width: 16%; text-align: right;">Unit Price (${p.currency})</th>
          <th style="width: 16%; text-align: right; padding-right: 10px;">Amount (${p.currency})</th>
        </tr>
      </thead>
      <tbody>
        ${p.itemsHtml}
      </tbody>
    </table>

    <div class="summary-box">
      <div class="summary-left">
        <div>
          <h3 style="color: #6d28d9; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; font-weight: bold;">Bank Details</h3>
          <div style="font-size: 11px; display: grid; grid-template-columns: 80px 1fr; row-gap: 4px;">
            <span style="color:#94a3b8;">Bank Name:</span><span style="font-weight:bold; color:#1e1b4b;">${p.bankName}</span>
            <span style="color:#94a3b8;">Account No.:</span><span style="font-weight:bold; color:#1e1b4b;">${p.accountNo}</span>
            <span style="color:#94a3b8;">Routing:</span><span style="font-weight:bold; color:#1e1b4b;">${p.routing}</span>
            <span style="color:#94a3b8;">Account Holder:</span><span style="font-weight:bold; color:#1e1b4b;">${p.companyName}</span>
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
            <span style="font-weight: 600; color:#1e1b4b;">${formatAmount(p.subtotal, p.currency)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            <span style="color:#94a3b8;">Sub Total</span>
            <span style="font-weight: 600; color:#1e1b4b;">${formatAmount(p.subtotal, p.currency)}</span>
          </div>
          ${p.currency === 'INR' ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color:#94a3b8;">GST (18.0%)</span>
            <span style="font-weight: 600; color:#1e1b4b;">${formatAmount(p.gstAmount, p.currency)}</span>
          </div>` : ''}
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold; color: #1e1b4b;">
            <span>Total</span>
            <span>${formatAmount(p.totalAmount, p.currency)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; color:#94a3b8;">
            <span>Amount Received</span>
            <span>${formatAmount(p.paidAmount, p.currency)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="balance-bar">
      <span style="font-size: 15px; font-weight: 500;">Balance Due</span>
      <span style="font-size: 26px; font-weight: 900;">${formatAmount(Math.max(0, p.balanceDue), p.currency)}</span>
    </div>

    <div class="words-bar">
      <span style="font-weight: bold; color: #4c1d95;">Amount in Words:</span> 
      <span style="color: #6d28d9; font-style: italic; font-weight: 500; margin-left: 5px;">${p.amountInWords}</span>
    </div>

    <div class="footer">
      <p style="margin-bottom: 5px;">Thank you for choosing ${p.companyName}. This invoice is system-generated — no signature required.</p>
      <p style="color: #64748b; font-size: 11px;">${p.companyEmail} &bull; www.companyvista.com</p>
    </div>
  </div>
</body>
</html>`;
}
