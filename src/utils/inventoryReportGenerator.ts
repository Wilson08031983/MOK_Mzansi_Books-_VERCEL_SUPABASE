/**
 * Inventory Report PDF Generator
 * ==============================
 * Generates a comprehensive A4 PDF report of inventory items including:
 * - Company details
 * - Stock history for each item
 * - Sales and delivery statistics
 * - Financial summaries and selling rates
 * 
 * Created: July 11, 2025
 */

// Import both jsPDF and jspdf-autotable properly
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { InventoryItem, StockHistoryEntry } from '@/types/inventory';
// DeliveryNote type defined locally below to avoid missing import
import { getAllInventoryItems, getAllStockHistory, getItemStockHistory } from '@/services/inventoryService';
import { getCompany as getScopedCompany, getCompanyAssets as getScopedCompanyAssets } from '@/services/companyService';
// jspdf-autotable is imported above

// Define interfaces for report data
interface CompanyDetails {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  vatNumber?: string;
  vatNumberNotApplicable?: boolean;
  regNumber?: string;
  taxNumber?: string;
  csdNumber?: string;
  csdNumberNotApplicable?: boolean;
  // Address fields
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  // Contact person fields
  contactName?: string;
  contactSurname?: string;
  position?: string;
  website?: string;
  websiteNotApplicable?: boolean;
}

interface CompanyAssets {
  Logo?: { dataUrl: string };
  Stamp?: { dataUrl: string };
  Signature?: { dataUrl: string };
}

interface ItemSalesRate {
  itemId: string;
  itemName: string;
  salesCount: number;
  rate: number; // 1-10 scale
}

interface ItemDeliveryData {
  itemId: string;
  itemName: string;
  deliveryCount: number;
  totalQuantity: number;
  totalValue: number;
}

interface InventoryReportData {
  items: InventoryItem[];
  history: StockHistoryEntry[];
  salesRates: ItemSalesRate[];
  deliveryData: ItemDeliveryData[];
  totalStockCost: number;
  totalStockValue: number;
  totalSoldValue: number;
  totalSoldCost: number;
  reportDate: Date;
}

// Helper functions to get data from localStorage
const getCompanyDetails = (): CompanyDetails => {
  try {
    const scoped = getScopedCompany();
    if (scoped) {
      return {
        name: scoped.name || 'Company Name Not Set',
        email: (scoped as any).email,
        phone: (scoped as any).phone,
        addressLine1: (scoped as any).addressLine1,
        addressLine2: (scoped as any).addressLine2,
        addressLine3: (scoped as any).addressLine3 || (scoped as any).city,
        addressLine4: (scoped as any).addressLine4 || [
          (scoped as any).state,
          (scoped as any).postalCode
        ].filter(Boolean).join(', '),
        vatNumber: (scoped as any).vatNumber,
        regNumber: (scoped as any).registrationNumber || (scoped as any).regNumber,
        taxNumber: (scoped as any).taxNumber,
        csdNumber: (scoped as any).csdNumber,
        contactName: (scoped as any).contactName,
        contactSurname: (scoped as any).contactSurname,
        position: (scoped as any).position,
        website: (scoped as any).website
      };
    }
  } catch (error) {
    console.error('Error getting scoped company details:', error);
  }
  // legacy fallback
  try {
    const companyData = localStorage.getItem('companyDetails');
    if (companyData) {
      const parsedData = JSON.parse(companyData);
      if (!parsedData.name) parsedData.name = 'Company Name Not Set';
      return parsedData;
    }
  } catch (error) {
    console.error('Error getting legacy company details:', error);
  }
  return { name: 'Company Name Not Set', email: 'Email Not Set', phone: 'Phone Not Set' };
};

const getCompanyAssets = (): CompanyAssets => {
  try {
    const assets = getScopedCompanyAssets();
    const logo = (assets as any)?.logo || (assets as any)?.Logo?.dataUrl;
    const signature = (assets as any)?.signature || (assets as any)?.Signature?.dataUrl;
    const stamp = (assets as any)?.stamp || (assets as any)?.Stamp?.dataUrl;
    const normalized: CompanyAssets = {};
    if (logo) normalized.Logo = { dataUrl: logo };
    if (signature) normalized.Signature = { dataUrl: signature };
    if (stamp) normalized.Stamp = { dataUrl: stamp };
    return normalized;
  } catch (error) {
    console.error('Error getting scoped company assets:', error);
  }
  // legacy fallback
  try {
    const assets = localStorage.getItem('companyAssets');
    if (assets) {
      return JSON.parse(assets);
    }
  } catch (error) {
    console.error('Error getting legacy company assets:', error);
  }
  return {};
};

const getDeliveryNotes = (): DeliveryNote[] => {
  try {
    const deliveryNotes = localStorage.getItem('deliveryNotes');
    if (!deliveryNotes) return [];
    return JSON.parse(deliveryNotes);
  } catch (error) {
    console.error('Error getting delivery notes:', error);
    return [];
  }
};

const formatAddress = (company: CompanyDetails): string[] => {
  const addressParts: string[] = [];
  
  if (company.addressLine1) addressParts.push(company.addressLine1);
  if (company.addressLine2) addressParts.push(company.addressLine2);
  if (company.addressLine3) addressParts.push(company.addressLine3);
  if (company.addressLine4) addressParts.push(company.addressLine4);
  
  if (addressParts.length === 0 && company.address) {
    // If no structured address but there's a single address string
    addressParts.push(...company.address.split(',').map(part => part.trim()));
  }
  
  return addressParts;
};

// Calculate sales rate on a scale of 1-10 based on sales frequency
const calculateSalesRate = (itemId: string, history: StockHistoryEntry[]): number => {
  const itemSales = history.filter(h => h.inventoryItemId === itemId && h.type === 'sold');
  
  if (itemSales.length === 0) return 1; // No sales = lowest rate
  
  // Get all items that have sales
  const allItemIds = [...new Set(history.filter(h => h.type === 'sold').map(h => h.inventoryItemId))];
  
  // Get sales count for each item
  const itemSalesCounts = allItemIds.map(id => {
    return {
      id,
      count: history.filter(h => h.inventoryItemId === id && h.type === 'sold').length
    };
  });
  
  // Sort by sales count
  itemSalesCounts.sort((a, b) => b.count - a.count);
  
  // Find position of current item
  const itemPosition = itemSalesCounts.findIndex(item => item.id === itemId);
  
  // Calculate rate on scale of 1-10
  // Top item gets 10, bottom gets 1, rest are distributed
  if (itemSalesCounts.length === 1) return 5; // Only one item with sales
  
  // Create a scale from 1-10 based on position
  const rate = Math.round(10 - ((itemPosition / (itemSalesCounts.length - 1)) * 9));
  return rate === 0 ? 1 : rate; // Ensure minimum rate is 1
};

// Helper function to get delivery data
const getDeliveryData = (inventoryItems: InventoryItem[]): ItemDeliveryData[] => {
  try {
    const deliveryNotesString = localStorage.getItem('deliveryNotes');
    if (!deliveryNotesString) {
      console.log('No delivery notes found in localStorage');
      return inventoryItems.map(item => ({
        itemId: item.id,
        itemName: item.name,
        deliveryCount: 0,
        totalQuantity: 0,
        totalValue: 0
      }));
    }
    
    const deliveryNotes: DeliveryNote[] = JSON.parse(deliveryNotesString);
    const deliveryData: { [key: string]: ItemDeliveryData } = {};
    
    // Initialize data for all inventory items
    inventoryItems.forEach(item => {
      deliveryData[item.id] = {
        itemId: item.id,
        itemName: item.name,
        deliveryCount: 0,
        totalQuantity: 0,
        totalValue: 0
      };
    });
    
    // Process each delivery note
    if (Array.isArray(deliveryNotes)) {
      deliveryNotes.forEach(note => {
        if (note && note.items && Array.isArray(note.items)) {
          note.items.forEach(item => {
            if (deliveryData[item.inventoryItemId]) {
              deliveryData[item.inventoryItemId].deliveryCount += 1;
              deliveryData[item.inventoryItemId].totalQuantity += item.quantity;
              deliveryData[item.inventoryItemId].totalValue += item.amount;
            }
          });
        }
      });
    }
    
    return Object.values(deliveryData);
  } catch (error) {
    console.error('Error processing delivery data:', error);
    // Return empty delivery data for all inventory items as fallback
    return inventoryItems.map(item => ({
      itemId: item.id,
      itemName: item.name,
      deliveryCount: 0,
      totalQuantity: 0,
      totalValue: 0
    }));
  }
};

// Prepare data for the report
const prepareReportData = (): InventoryReportData => {
  const items = getAllInventoryItems();
  const history = getAllStockHistory();
  
  // Calculate sales rates for all items
  const salesRates: ItemSalesRate[] = items.map(item => {
    const rate = calculateSalesRate(item.id, history);
    return {
      itemId: item.id,
      itemName: item.name,
      salesCount: history.filter(h => h.inventoryItemId === item.id && h.type === 'sold').length,
      rate
    };
  });
  
  // Get delivery data for all items
  const deliveryData = getDeliveryData(items);
  
  // Calculate financial summaries
  const totalStockCost = items.reduce((sum, item) => sum + (item.costPrice * item.stockLevel), 0);
  const totalStockValue = items.reduce((sum, item) => sum + (item.price * item.stockLevel), 0);
  
  // Calculate sold values from history
  let totalSoldValue = 0;
  let totalSoldCost = 0;
  
  items.forEach(item => {
    const soldEntries = history.filter(h => h.inventoryItemId === item.id && h.type === 'sold');
    const soldQuantity = soldEntries.reduce((sum, entry) => sum + entry.quantity, 0);
    
    totalSoldValue += soldQuantity * item.price;
    totalSoldCost += soldQuantity * item.costPrice;
  });
  
  return {
    items,
    history,
    salesRates,
    deliveryData,
    totalStockCost,
    totalStockValue,
    totalSoldValue,
    totalSoldCost,
    reportDate: new Date()
  };
};

// Generate the inventory report PDF
export const generateInventoryReport = (): void => {
  // Clear any existing toasts first
  toast.dismiss();
  
  // Use a promise-based approach with proper sequential handling
  const generateReport = async () => {
    // Show loading toast
    toast.loading('Generating Inventory Report...', {
      id: 'inventory-report-toast'
    });
    
    try {
      // 1. VALIDATE DATA EXISTENCE
      console.log('Checking inventory data...');
      const inventoryItems = getAllInventoryItems();
      
      if (!inventoryItems || inventoryItems.length === 0) {
        throw new Error('No inventory items found. Please add items before generating a report.');
      }
      
      // 2. CREATE PDF DOCUMENT
      console.log('Creating PDF document...');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // 3. PREPARE DATA SAFELY
      console.log('Preparing report data...');
      const reportData = prepareReportData();
      const company = getCompanyDetails();
      
      // 4. DEFINE PAGE DIMENSIONS
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      
      // 5. SET FONT SIZES
      const titleFontSize = 18;
      const subtitleFontSize = 14;
      const normalFontSize = 10;
      const smallFontSize = 8;
      
      // 6. SAFELY ADD COMPANY LOGO 
      try {
        console.log('Adding company logo if available...');
        const assets = getCompanyAssets();
        
        if (assets && assets.Logo && assets.Logo.dataUrl && 
            typeof assets.Logo.dataUrl === 'string' && 
            assets.Logo.dataUrl.startsWith('data:')) {
          // Set logo dimensions to exactly 20mm x 20mm (converted to points: 1mm = 2.83465pt)
          const mmToPt = 2.83465; // conversion factor from mm to points
          const logoSize = 20 * mmToPt; // 20mm converted to points (~56.693)
          const logoX = (pageWidth - logoSize) / 2; // Center horizontally
          // Using the correct number of parameters for addImage to create square logo
          doc.addImage(assets.Logo.dataUrl, 'AUTO', logoX, margin, logoSize, logoSize);
          console.log('Logo added successfully');
        } else {
          console.log('No valid logo found, skipping');
        }
      } catch (logoError) {
        console.error('Logo rendering error (non-critical):', logoError);
        // Continue without logo
      }
      
      // 7. ADD REPORT TITLE
      doc.setFontSize(titleFontSize);
      doc.setFont('helvetica', 'bold');
      doc.text('INVENTORY REPORT', pageWidth / 2, margin + 22, { align: 'center' });
      
      // 8. ADD REPORT DATE
      doc.setFontSize(normalFontSize);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Report Date: ${new Date().toLocaleDateString('en-GB')}`,
        pageWidth / 2,
        margin + 30,
        { align: 'center' }
      );
      
      // 9. ADD COMPANY DETAILS
      let y = margin + 40;
      doc.setFont('helvetica', 'bold');
      doc.text(company.name || 'Company Name Not Available', margin, y);
      y += 7;
      
      doc.setFont('helvetica', 'normal');
      if (company.email) {
        doc.text(company.email, margin, y);
        y += 5;
      }
      
      if (company.phone) {
        doc.text(company.phone, margin, y);
        y += 5;
      }
      
      // 10. FORMAT AND ADD ADDRESS
      const addressLines = formatAddress(company);
      addressLines.forEach(line => {
        doc.text(line, margin, y);
        y += 5;
      });
      
      // 11. ADD SUMMARY INFO
      const summaryX = pageWidth - margin - 60;
      y = margin + 40;
      
      doc.setFont('helvetica', 'bold');
      doc.text('INVENTORY SUMMARY', summaryX, y);
      y += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Items: ${reportData.items.length}`, summaryX, y);
      y += 5;
      
      doc.text(
        `Total Stock Value: ${formatCurrency(reportData.totalStockValue)}`,
        summaryX,
        y
      );
      y += 5;
      
      doc.text(
        `Total Stock Cost: ${formatCurrency(reportData.totalStockCost)}`,
        summaryX,
        y
      );
      y += 5;
      
      const estimatedProfit = reportData.totalSoldValue - reportData.totalSoldCost;
      doc.text(`Est. Profit: ${formatCurrency(estimatedProfit)}`, summaryX, y);
      y += 15;
      
      // 12. ADD INVENTORY ITEMS TABLE
      y = Math.max(y, margin + 80);
      doc.setFontSize(subtitleFontSize);
      doc.setFont('helvetica', 'bold');
      doc.text('INVENTORY ITEMS', margin, y);
      y += 5;
      
      // Use imported autoTable function directly
      autoTable(doc, {
        startY: y,
        head: [['ID', 'Name', 'Stock', 'Min Stock', 'Price', 'Cost', 'Value', 'Sales Rate']],
        body: reportData.items.map(item => [
          item.id,
          item.name,
          item.stockLevel.toString(),
          item.minimumStockLevel ? item.minimumStockLevel.toString() : '-',
          formatCurrency(item.price),
          formatCurrency(item.costPrice),
          formatCurrency(item.price * item.stockLevel),
          reportData.salesRates.find(sr => sr.itemId === item.id)?.rate.toString() || '1'
        ]),
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 248, 255] },
        styles: { fontSize: 8 }
      });
      
      // 13. ADD PAGE NUMBERS
      console.log('Adding page numbers...');
      const pageCount = doc.getNumberOfPages();
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        doc.setFontSize(smallFontSize);
        doc.setFont('helvetica', 'italic');
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        
        doc.text(
          `Generated: ${new Date().toLocaleString()}`,
          margin,
          pageHeight - 10
        );
      }
      
      // 14. SAVE THE PDF
      console.log('Saving PDF document...');
      doc.save(`Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      // 15. SHOW SUCCESS MESSAGE
      console.log('PDF generated successfully');
      toast.dismiss('inventory-report-toast');
      toast.success('Inventory Report Generated Successfully!');
      
    } catch (error) {
      // Log detailed error information
      console.error('PDF Generation Error:', error);
      
      // Clear loading toast and show error
      toast.dismiss('inventory-report-toast');
      toast.error(error instanceof Error ? error.message : 'Failed to generate report');
    }
  };
  
  // Start the generation process
  generateReport().catch(err => {
    console.error('Unexpected error in report generation:', err);
    toast.dismiss('inventory-report-toast');
    toast.error('Unexpected error occurred');
  });
};

interface DeliveryNoteItem { inventoryItemId: string; quantity: number; amount: number }
interface DeliveryNote { id?: string; items?: DeliveryNoteItem[] }
