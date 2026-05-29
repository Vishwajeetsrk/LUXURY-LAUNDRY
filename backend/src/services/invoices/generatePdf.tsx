import React from 'react';
import { Page, Text, View, Document, StyleSheet, renderToStream, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  logoSection: { flexDirection: 'column' },
  logo: { width: 120, height: 'auto', marginBottom: 10 },
  businessName: { fontSize: 20, fontWeight: 'bold' },
  businessDetails: { fontSize: 10, color: '#555', marginTop: 4 },
  invoiceTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  invoiceMeta: { marginTop: 10, fontSize: 10, textAlign: 'right' },
  section: { marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between' },
  col: { width: '48%' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: 5, marginBottom: 10 },
  textLine: { marginBottom: 4 },
  table: { width: '100%', marginBottom: 20 },
  tableHeader: { flexDirection: 'row', borderBottom: '2px solid #000', paddingBottom: 5, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #ddd', paddingVertical: 8 },
  colItem: { width: '40%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '20%', textAlign: 'right' },
  colTotal: { width: '25%', textAlign: 'right' },
  summary: { width: '40%', alignSelf: 'flex-end' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTop: '2px solid #000', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: 10 },
  qrSection: { width: '40%', alignItems: 'center' },
  qrCode: { width: 100, height: 100 },
  terms: { width: '55%', fontSize: 9, color: '#555' },
});

export const InvoiceDocument = ({ invoice, logoBuffer, qrBuffer }: { invoice: any, logoBuffer?: Buffer, qrBuffer?: Buffer }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.logoSection}>
          {logoBuffer && <Image src={logoBuffer} style={styles.logo} />}
          {!logoBuffer && <Text style={styles.businessName}>LuxWash Jaipur</Text>}
          <Text style={styles.businessDetails}>123 Laundry Street, Jaipur, Rajasthan</Text>
          <Text style={styles.businessDetails}>Phone: +91 9663574728</Text>
          <Text style={styles.businessDetails}>Email: support@luxwash.in</Text>
        </View>
        <View>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <View style={styles.invoiceMeta}>
            <Text style={styles.textLine}>Invoice #: {invoice.invoiceNumber}</Text>
            <Text style={styles.textLine}>Date: {new Date(invoice.generatedAt).toLocaleDateString()}</Text>
            <Text style={styles.textLine}>Status: {invoice.paymentStatus}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.col}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={styles.textLine}>{invoice.customer.name}</Text>
          <Text style={styles.textLine}>{invoice.customer.phone || invoice.customer.email}</Text>
          {invoice.order?.address && <Text style={styles.textLine}>{invoice.order.address}</Text>}
        </View>
        <View style={styles.col}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          {invoice.order?.pickupDate && <Text style={styles.textLine}>Pickup: {new Date(invoice.order.pickupDate).toLocaleDateString()}</Text>}
          {invoice.order?.deliveryDate && <Text style={styles.textLine}>Delivery: {new Date(invoice.order.deliveryDate).toLocaleDateString()}</Text>}
          <Text style={styles.textLine}>Payment Method: {invoice.paymentMethod}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colItem}>Service</Text>
          <Text style={styles.colQty}>Qty</Text>
          <Text style={styles.colPrice}>Price</Text>
          <Text style={styles.colTotal}>Total</Text>
        </View>
        {invoice.items.map((item: any, i: number) => (
          <View style={styles.tableRow} key={i}>
            <Text style={styles.colItem}>{item.serviceName}</Text>
            <Text style={styles.colQty}>{item.quantity} {item.unit}</Text>
            <Text style={styles.colPrice}>₹{item.unitPrice.toFixed(2)}</Text>
            <Text style={styles.colTotal}>₹{item.totalPrice.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text>Subtotal:</Text>
          <Text>₹{invoice.subtotal.toFixed(2)}</Text>
        </View>
        {invoice.discountAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text>Discount:</Text>
            <Text>-₹{invoice.discountAmount.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text>Taxable Amount:</Text>
          <Text>₹{invoice.taxableAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>CGST (9%):</Text>
          <Text>₹{invoice.cgstAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>SGST (9%):</Text>
          <Text>₹{invoice.sgstAmount.toFixed(2)}</Text>
        </View>
        {invoice.deliveryCharge > 0 && (
          <View style={styles.summaryRow}>
            <Text>Delivery Charge:</Text>
            <Text>₹{invoice.deliveryCharge.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.summaryTotal}>
          <Text>Total Amount:</Text>
          <Text>₹{invoice.totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.terms}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Terms & Conditions</Text>
          <Text>1. Payment is due upon delivery.</Text>
          <Text>2. We are not responsible for damages beyond 10x the service cost.</Text>
          <Text>3. Please inspect your garments at the time of delivery.</Text>
        </View>
        <View style={styles.qrSection}>
          <Text style={{ fontSize: 10, marginBottom: 5 }}>Scan to Pay via UPI</Text>
          {qrBuffer ? (
             <Image src={qrBuffer} style={styles.qrCode} />
          ) : (
             <View style={{ width: 100, height: 100, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }}>
               <Text style={{ fontSize: 8 }}>QR Missing</Text>
             </View>
          )}
          <Text style={{ fontSize: 9, marginTop: 5 }}>UPI ID: luxwash@ybl</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export async function generateInvoicePdfStream(invoice: any, logoBuffer?: Buffer, qrBuffer?: Buffer) {
  return await renderToStream(<InvoiceDocument invoice={invoice} logoBuffer={logoBuffer} qrBuffer={qrBuffer} />);
}
