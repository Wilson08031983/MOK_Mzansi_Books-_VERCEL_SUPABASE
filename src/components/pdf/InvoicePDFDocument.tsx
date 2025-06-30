import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Define a type for PDF styles that includes all supported properties
type PDFStyle = {
  // Layout
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  
  // Flexbox
  flex?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | string;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  
  // Position
  position?: 'absolute' | 'relative';
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  zIndex?: number;
  
  // Margin & Padding
  margin?: number | string;
  marginTop?: number | string;
  marginRight?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  marginHorizontal?: number | string;
  marginVertical?: number | string;
  padding?: number | string;
  paddingTop?: number | string;
  paddingRight?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  paddingHorizontal?: number | string;
  paddingVertical?: number | string;
  
  // Border
  borderWidth?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderColor?: string;
  borderTopColor?: string;
  borderRightColor?: string;
  borderBottomColor?: string;
  borderLeftColor?: string;
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomRightRadius?: number;
  borderBottomLeftRadius?: number;
  
  // Background
  backgroundColor?: string;
  
  // Text
  color?: string;
  fontSize?: number;
  fontWeight?: number | 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic';
  fontFamily?: string;
  lineHeight?: number | string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'underline line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpacing?: number;
  
  // Other
  opacity?: number;
  overflow?: 'hidden' | 'scroll' | 'visible';
  aspectRatio?: number;
  
  // Allow unknown properties to avoid TypeScript errors with react-pdf
  [key: string]: unknown;
};

// Type-safe style filter function
const filterStyle = (style: PDFStyle | undefined): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  
  if (!style) return result;
  
  Object.entries(style).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      result[key] = value;
    }
  });
  
  return result;
};

// Simple image component with type safety
const CustomImage = ({ 
  src, 
  style,
  alt = ''
}: { 
  src: string; 
  style?: PDFStyle;
  alt?: string;
}) => {
  const filteredStyle = filterStyle(style);
  return <Image src={src} style={filteredStyle} />;
};

// Define styles for the PDF document
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 30, // Reduced from 40px to 30pt for better A4 margins
    fontSize: 9, // Reduced from 12pt for better fit
    lineHeight: 1.2, // Tighter line height
    color: '#1F2937',
    fontFamily: 'Helvetica',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  pageContent: {
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '1px solid #E5E7EB',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 'auto',
    maxWidth: '100%',
    maxHeight: 60, // Reduced from 80px for better fit
  },
  invoiceTitle: {
    fontSize: 20, // Reduced from 24pt
    fontWeight: 'bold',
    marginBottom: 6, // Reduced from 8pt
    color: '#111827',
  },
  invoiceNumber: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  companyInfo: {
    textAlign: 'right',
  },
  companyName: {
    fontSize: 12, // Reduced from 16pt
    fontWeight: 'bold',
    marginBottom: 2, // Reduced from 4pt
    color: '#111827',
  },
  companyDetail: {
    fontSize: 10,
    color: '#4B5563',
    marginBottom: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 10, // Reduced from 14pt
    fontWeight: 'bold',
    marginBottom: 8, // Reduced from 12pt
    color: '#374151',
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: 4, // Reduced from 6pt
  },
  clientInfo: {
    backgroundColor: '#F9FAFB',
    padding: 12, // Reduced from 16pt
    borderRadius: 4, // Reduced from 8pt
    marginBottom: 16, // Reduced from 24pt
  },
  clientName: {
    fontSize: 10, // Reduced from 14pt
    fontWeight: 'bold',
    marginBottom: 2, // Reduced from 4pt
    color: '#111827',
  },
  clientDetail: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoItem: {
    width: '48%',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 12,
    color: '#111827',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: 8,
    marginBottom: 12,
    fontSize: 8, // Smaller font for table
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderBottom: '1px solid #E5E7EB',
    padding: '4px 6px',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #E5E7EB',
    padding: '3px 0',
  },
  tableCol: {
    padding: '2px 6px',
    fontSize: 9,
    lineHeight: 1.2,
  },
  colNumber: {
    width: '6%',
    textAlign: 'center',
  },
  colDescription: {
    width: '44%',
    paddingRight: 4,
  },
  colQty: {
    width: '10%',
    textAlign: 'right',
    paddingRight: 4,
  },
  colRate: {
    width: '15%',
    textAlign: 'right',
    paddingRight: 4,
  },
  colDiscount: {
    width: '15%',
    textAlign: 'right',
    paddingRight: 4,
  },
  colAmount: {
    width: '20%',
    textAlign: 'right',
    paddingRight: 4,
  },
  textRight: {
    textAlign: 'right',
  },
  textCenter: {
    textAlign: 'center',
  },
  totals: {
    marginTop: 12,
    width: '45%',
    marginLeft: 'auto',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 4, // Reduced margin
    fontSize: 9, // Smaller font
    padding: '2px 0', // Reduced padding
  },
  totalLabel: {
    fontSize: 9, // Match totalRow font size
    color: '#4B5563',
  },
  totalValue: {
    fontSize: 10,
    color: '#111827',
    fontWeight: 'bold',
    minWidth: 80, // Ensure consistent width for alignment
    textAlign: 'right',
  },
  bankDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  bankDetailItem: {
    width: '50%',
    marginBottom: 8,
  },
  bankDetailLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  notesContainer: {
    marginTop: 32,
    paddingTop: 16,
    borderTop: '1px solid #E5E7EB',
  },
  notesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  notesColumn: {
    width: '48%',
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 8,
  },
  notesContent: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 1.5,
  },
  bankDetails: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  bankDetailsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 12,
  },
  bankDetailValue: {
    fontSize: 12,
    color: '#111827',
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 48,
    paddingTop: 24,
    borderTop: '1px solid #E5E7EB',
  },
  signatureBox: {
    width: '45%',
    textAlign: 'center',
  },
  signatureImage: {
    width: '120px',
    height: '60px',
    objectFit: 'contain',
    margin: '0 auto 12px',
  },
  signatureLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    margin: '24px 0 8px',
  },
  signatureLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 4,
  },
  signatureSubtext: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  bankDetails: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    borderLeft: '3px solid #4F46E5',
  },
  bankDetailsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#111827',
  },
  bankDetailsRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bankDetailsLabel: {
    width: 100,
    fontSize: 8,
    color: '#6B7280',
  },
  bankDetailsValue: {
    flex: 1,
    fontSize: 8,
    color: '#111827',
    fontWeight: 'medium',
  },
  footerContainer: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: '1px solid #E5E7EB',
    textAlign: 'center',
  },
  thankYouText: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 15, // Reduced from 20
    left: 30, // Match page padding
    right: 30, // Match page padding
    fontSize: 8, // Smaller font for footer
    color: '#6B7280',
    textAlign: 'center',
    paddingTop: 12,
    borderTop: '1px solid #E5E7EB',
  },
  pageBreak: {
    pageBreakAfter: 'always',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#9CA3AF',
  },
});

interface InvoiceItem {
  id: string;
  itemNo: number;
  description: string;
  quantity: number;
  rate: number;
  markupPercent: number;
  discount: number;
  amount: number;
  vat?: number;
}

interface ClientInfo {
  id: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  shippingAddress?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostal?: string;
  shippingCountry?: string;
  sameAsBilling?: boolean;
}

interface CompanyDetails {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  vatNumber?: string;
  regNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  bankName?: string;
  bankAccount?: string;
  accountType?: string;
  branchCode?: string;
  accountHolder?: string;
}

interface InvoicePDFDocumentProps {
  invoice: {
    id?: string;
    number: string;
    date: string;
    dueDate: string;
    reference?: string;
    clientId?: string;
    clientInfo?: ClientInfo;
    items: InvoiceItem[];
    subtotal: number;
    vatRate: number;
    vatTotal: number;
    grandTotal: number;
    terms: string;
    notes: string;
    status?: string;
    currency: string;
    companyDetails?: CompanyDetails;
  };
  companyAssets?: {
    Logo?: {
      name: string;
      dataUrl: string;
      lastModified: number;
    };
    Stamp?: {
      name: string;
      dataUrl: string;
      lastModified: number;
    };
    Signature?: {
      name: string;
      dataUrl: string;
      lastModified: number;
    };
  };
}

const InvoicePDFDocument: React.FC<InvoicePDFDocumentProps> = ({ 
  invoice, 
  companyAssets 
}) => {
  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || isNaN(amount)) return 'R 0.00';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: invoice.currency || 'ZAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Get company details with fallbacks
  const companyDetails = invoice.companyDetails || {
    name: 'Your Company Name',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    vatNumber: ''
  };

  // Calculate pagination
  const itemsPerPage = 15;
  const totalPages = Math.ceil((invoice.items?.length || 0) / itemsPerPage) || 1;

  return (
    <Document>
      {Array.from({ length: totalPages }).map((_, pageIndex) => {
        const startIndex = pageIndex * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, invoice.items?.length || 0);
        const pageItems = (invoice.items || []).slice(startIndex, endIndex);
        const isLastPage = pageIndex === totalPages - 1;

        return (
          <Page 
            key={`page-${pageIndex}`} 
            size="A4" 
            style={styles.page}
            wrap={false}
          >
            <View style={styles.pageContent}>
              {/* Header with logo and invoice info */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.invoiceTitle}>INVOICE</Text>
                  <Text style={styles.invoiceNumber}>#{invoice.number || '0001'}</Text>
                </View>
                
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>{companyDetails.name}</Text>
                  {companyDetails.addressLine1 && (
                    <Text style={styles.companyDetail}>{companyDetails.addressLine1}</Text>
                  )}
                  {companyDetails.email && (
                    <Text style={styles.companyDetail}>{companyDetails.email}</Text>
                  )}
                  {companyDetails.phone && (
                    <Text style={styles.companyDetail}>{companyDetails.phone}</Text>
                  )}
                </View>
                
                {companyAssets?.Logo?.dataUrl && (
                  <View style={styles.logoContainer}>
                    <CustomImage 
                      src={companyAssets.Logo.dataUrl} 
                      style={styles.logo}
                    />
                  </View>
                )}
              </View>

              {/* Client & Invoice Info */}
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Bill To:</Text>
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>
                      {invoice.clientInfo?.companyName || 
                       `${invoice.clientInfo?.firstName || ''} ${invoice.clientInfo?.lastName || ''}`.trim() || 'Client Name'}
                    </Text>
                    {invoice.clientInfo?.email && (
                      <Text style={styles.clientDetail}>{invoice.clientInfo.email}</Text>
                    )}
                    {invoice.clientInfo?.phone && (
                      <Text style={styles.clientDetail}>{invoice.clientInfo.phone}</Text>
                    )}
                    {invoice.clientInfo?.billingAddress && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={[styles.clientDetail, { fontWeight: 'bold' }]}>Billing Address:</Text>
                        <Text style={styles.clientDetail}>{invoice.clientInfo.billingAddress}</Text>
                      </View>
                    )}
                    {invoice.clientInfo?.shippingAddress && !invoice.clientInfo?.sameAsBilling && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={[styles.clientDetail, { fontWeight: 'bold' }]}>Shipping Address:</Text>
                        <Text style={styles.clientDetail}>{invoice.clientInfo.shippingAddress}</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={styles.infoLabel}>Invoice #:</Text>
                    <Text style={styles.infoValue}>{invoice.number || '0001'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={styles.infoLabel}>Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(invoice.date)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={styles.infoLabel}>Due Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(invoice.dueDate)}</Text>
                  </View>
                </View>
              </View>

              {/* Items Table */}
              <View style={{ marginBottom: 16 }}>
                <View style={styles.table}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableCol, styles.colNumber, { fontWeight: 'bold' }]}>#</Text>
                    <Text style={[styles.tableCol, styles.colDescription, { fontWeight: 'bold' }]}>Description</Text>
                    <Text style={[styles.tableCol, styles.colQty, { fontWeight: 'bold' }]}>Qty</Text>
                    <Text style={[styles.tableCol, styles.colRate, { fontWeight: 'bold' }]}>Rate</Text>
                    <Text style={[styles.tableCol, styles.colDiscount, { fontWeight: 'bold' }]}>Discount</Text>
                    <Text style={[styles.tableCol, styles.colAmount, { fontWeight: 'bold' }]}>Amount</Text>
                  </View>
                  
                  {/* Table Rows */}
                  {pageItems.map((item, index) => {
                    // Calculate row background color for better readability
                    const rowStyle = index % 2 === 0 
                      ? { ...styles.tableRow, backgroundColor: '#FFFFFF' } 
                      : { ...styles.tableRow, backgroundColor: '#F9FAFB' };
                    
                    return (
                      <View key={`${item.id}-${index}`} style={rowStyle}>
                        <Text style={[styles.tableCol, styles.colNumber]}>{item.itemNo || index + 1}</Text>
                        <Text style={[styles.tableCol, styles.colDescription]}>{item.description || ''}</Text>
                        <Text style={[styles.tableCol, styles.colQty]}>{item.quantity || 0}</Text>
                        <Text style={[styles.tableCol, styles.colRate]}>{formatCurrency(item.rate)}</Text>
                        <Text style={[styles.tableCol, styles.colDiscount]}>
                          {item.discount ? formatCurrency(item.discount) : '-'}
                        </Text>
                        <Text style={[styles.tableCol, styles.colAmount, { fontWeight: 'bold' }]}>
                          {formatCurrency(item.amount)}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Totals - Only show on last page */}
                {isLastPage && (
                  <View style={styles.totals}>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Subtotal:</Text>
                      <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>VAT ({invoice.vatRate || 0}%):</Text>
                      <Text style={styles.totalValue}>{formatCurrency(invoice.vatTotal)}</Text>
                    </View>
                    <View style={[styles.totalRow, { marginTop: 4, paddingTop: 4, borderTop: '1px solid #E5E7EB' }]}>
                      <Text style={[styles.totalLabel, { fontSize: 11 }]}>TOTAL:</Text>
                      <Text style={[styles.totalValue, { fontSize: 11 }]}>{formatCurrency(invoice.grandTotal)}</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Notes & Terms - Only show on last page */}
              {isLastPage && (
                <>
                  {(invoice.notes || invoice.terms) && (
                    <View style={styles.notesContainer}>
                      <View style={styles.notesGrid}>
                        {invoice.notes && (
                          <View style={styles.notesColumn}>
                            <Text style={styles.notesTitle}>Notes</Text>
                            <Text style={styles.notesContent}>{invoice.notes}</Text>
                          </View>
                        )}
                        {invoice.terms && (
                          <View style={styles.notesColumn}>
                            <Text style={styles.notesTitle}>Terms & Conditions</Text>
                            <Text style={styles.notesContent}>{invoice.terms}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Banking Details Section */}
                  <View style={styles.bankDetails}>
                    <Text style={styles.bankDetailsTitle}>BANKING DETAILS</Text>
                    <View style={styles.bankDetailsRow}>
                      <Text style={styles.bankDetailsLabel}>Bank Name:</Text>
                      <Text style={styles.bankDetailsValue}>{companyDetails.bankName || 'N/A'}</Text>
                    </View>
                    <View style={styles.bankDetailsRow}>
                      <Text style={styles.bankDetailsLabel}>Account Name:</Text>
                      <Text style={styles.bankDetailsValue}>{companyDetails.accountHolder || 'N/A'}</Text>
                    </View>
                    <View style={styles.bankDetailsRow}>
                      <Text style={styles.bankDetailsLabel}>Account Number:</Text>
                      <Text style={styles.bankDetailsValue}>{companyDetails.bankAccount || 'N/A'}</Text>
                    </View>
                    <View style={styles.bankDetailsRow}>
                      <Text style={styles.bankDetailsLabel}>Branch Code:</Text>
                      <Text style={styles.bankDetailsValue}>{companyDetails.branchCode || 'N/A'}</Text>
                    </View>
                    <View style={styles.bankDetailsRow}>
                      <Text style={styles.bankDetailsLabel}>Account Type:</Text>
                      <Text style={styles.bankDetailsValue}>{companyDetails.accountType || 'N/A'}</Text>
                    </View>
                    <View style={styles.bankDetailsRow}>
                      <Text style={styles.bankDetailsLabel}>Reference:</Text>
                      <Text style={styles.bankDetailsValue}>{invoice.number || 'N/A'}</Text>
                    </View>
                  </View>

                  {/* Signature and Stamp Section */}
                  <View style={styles.signatureSection}>
                    <View style={styles.signatureBox}>
                      {companyAssets?.Signature?.dataUrl ? (
                        <CustomImage 
                          src={companyAssets.Signature.dataUrl} 
                          style={styles.signatureImage}
                        />
                      ) : (
                        <View style={styles.signatureLine} />
                      )}
                      <Text style={styles.signatureLabel}>Authorized Signature</Text>
                      <Text style={styles.signatureSubtext}>Account Holder</Text>
                    </View>
                    
                    <View style={styles.signatureBox}>
                      {companyAssets?.Stamp?.dataUrl ? (
                        <CustomImage 
                          src={companyAssets.Stamp.dataUrl} 
                          style={styles.signatureImage}
                        />
                      ) : (
                        <View style={styles.signatureLine} />
                      )}
                      <Text style={styles.signatureLabel}>Company Stamp</Text>
                      <Text style={styles.signatureSubtext}>For {companyDetails.name}</Text>
                    </View>
                  </View>

                  {/* Footer with Thank You and Page Number */}
                  <View style={styles.footerContainer}>
                    <Text style={styles.thankYouText}>
                      Thank you for your business!
                    </Text>
                    <Text style={styles.pageNumber}>
                      Page {pageIndex + 1} of {totalPages}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

export default InvoicePDFDocument;
