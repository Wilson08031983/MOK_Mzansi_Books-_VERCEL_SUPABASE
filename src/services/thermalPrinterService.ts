/**
 * Thermal Printer Service
 * 
 * This service provides functionality for printing receipts and other documents
 * to 80mm thermal printers commonly used in point-of-sale systems.
 */

// Types for thermal printer
export interface PrinterConfig {
  paperWidth: number;  // Width in mm
  printableWidth: number;  // Printable width in mm
  dpi: number;  // Dots per inch
  fontSize: number;  // Font size in px
  fontFamily: string;  // Font family
}

export interface PrintContent {
  companyName: string;
  companyInfo: string[];
  dateTime: string;
  items: PrintItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  paymentMethod: string;
  footer: string[];
}

export interface PrintItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Initialize the thermal printer service
export const initialize = (): boolean => {
  try {
    console.log('Thermal printer service initialized');
    return true;
  } catch (error) {
    console.error('Error initializing thermal printer service:', error);
    return false;
  }
};

/**
 * Get default printer configuration for 80mm thermal printer
 * @returns Default printer configuration
 */
export const getDefaultConfig = (): PrinterConfig => {
  return {
    paperWidth: 80,  // 80mm paper width
    printableWidth: 72,  // 72mm printable width
    dpi: 203,  // Standard thermal printer resolution
    fontSize: 12,  // 12px font size
    fontFamily: 'Courier, monospace'  // Monospaced font for alignment
  };
};

/**
 * Generate print CSS for thermal printer
 * @param config Printer configuration
 * @returns CSS string for print media
 */
export const generatePrintCSS = (config: PrinterConfig = getDefaultConfig()): string => {
  return `
    @media print {
      .receipt {
        width: ${config.paperWidth}mm;
        font-size: ${config.fontSize}px;
        font-family: ${config.fontFamily};
        margin: 0;
        padding: 0;
      }
      
      .receipt-header {
        text-align: center;
        margin-bottom: 10px;
      }
      
      .receipt-company {
        font-weight: bold;
        font-size: ${config.fontSize + 2}px;
      }
      
      .receipt-info {
        text-align: center;
        margin-bottom: 10px;
      }
      
      .receipt-items {
        width: 100%;
        border-top: 1px dashed #000;
        border-bottom: 1px dashed #000;
        margin: 10px 0;
        padding: 5px 0;
      }
      
      .receipt-item {
        display: flex;
        justify-content: space-between;
      }
      
      .receipt-item-name {
        flex: 2;
      }
      
      .receipt-item-qty {
        flex: 0.5;
        text-align: center;
      }
      
      .receipt-item-price {
        flex: 1;
        text-align: right;
      }
      
      .receipt-item-total {
        flex: 1;
        text-align: right;
      }
      
      .receipt-totals {
        margin-top: 10px;
        text-align: right;
      }
      
      .receipt-total {
        font-weight: bold;
      }
      
      .receipt-footer {
        text-align: center;
        margin-top: 10px;
        font-size: ${config.fontSize - 2}px;
      }
    }
  `;
};

/**
 * Generate HTML for a receipt
 * @param content Receipt content
 * @param config Printer configuration
 * @returns HTML string for the receipt
 */
export const generateReceiptHTML = (
  content: PrintContent,
  config: PrinterConfig = getDefaultConfig()
): string => {
  const formatCurrency = (amount: number): string => {
    return `R${amount.toFixed(2)}`;
  };
  
  const itemsHTML = content.items.map(item => `
    <div class="receipt-item">
      <div class="receipt-item-name">${item.name}</div>
      <div class="receipt-item-qty">${item.quantity}</div>
      <div class="receipt-item-price">${formatCurrency(item.unitPrice)}</div>
      <div class="receipt-item-total">${formatCurrency(item.total)}</div>
    </div>
  `).join('');
  
  const companyInfoHTML = content.companyInfo.map(line => `
    <div>${line}</div>
  `).join('');
  
  const footerHTML = content.footer.map(line => `
    <div>${line}</div>
  `).join('');
  
  return `
    <style>
      ${generatePrintCSS(config)}
    </style>
    <div class="receipt">
      <div class="receipt-header">
        <div class="receipt-company">${content.companyName}</div>
        ${companyInfoHTML}
      </div>
      
      <div class="receipt-info">
        <div>${content.dateTime}</div>
      </div>
      
      <div class="receipt-items">
        <div class="receipt-item" style="font-weight: bold;">
          <div class="receipt-item-name">Item</div>
          <div class="receipt-item-qty">Qty</div>
          <div class="receipt-item-price">Price</div>
          <div class="receipt-item-total">Total</div>
        </div>
        ${itemsHTML}
      </div>
      
      <div class="receipt-totals">
        <div>Subtotal: ${formatCurrency(content.subtotal)}</div>
        <div>VAT (${content.vatRate}%): ${formatCurrency(content.vatAmount)}</div>
        <div class="receipt-total">Total: ${formatCurrency(content.total)}</div>
        <div>Payment Method: ${content.paymentMethod}</div>
      </div>
      
      <div class="receipt-footer">
        ${footerHTML}
      </div>
    </div>
  `;
};

/**
 * Print a receipt
 * @param content Receipt content
 * @returns Promise resolving to boolean indicating success
 */
export const printReceipt = async (content: PrintContent): Promise<boolean> => {
  try {
    // Generate receipt HTML
    const receiptHTML = generateReceiptHTML(content);
    
    // In a real implementation, this would use the Web Print API
    // For now, we'll simulate printing with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Printed receipt for:', content.companyName);
    console.log('Receipt HTML:', receiptHTML);
    
    return true;
  } catch (error) {
    console.error('Error printing receipt:', error);
    return false;
  }
};

/**
 * Check if printing is available
 * @returns Boolean indicating if printing is available
 */
export const isPrintingAvailable = (): boolean => {
  // Check if we're in a browser environment with printing support
  return typeof window !== 'undefined' && 
    typeof window.print === 'function';
};

/**
 * Open print dialog for an element
 * @param elementId ID of the element to print
 * @returns Promise resolving to boolean indicating success
 */
export const printElement = async (elementId: string): Promise<boolean> => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return false;
    }
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID ${elementId} not found`);
      return false;
    }
    
    // Create an iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Write the element's content to the iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      console.error('Could not access iframe document');
      return false;
    }
    
    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          <style>
            ${generatePrintCSS()}
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
      </html>
    `);
    iframeDoc.close();
    
    // Wait for the iframe to load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Print the iframe
    iframe.contentWindow?.print();
    
    // Remove the iframe after printing
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('Error printing element:', error);
    return false;
  }
};
