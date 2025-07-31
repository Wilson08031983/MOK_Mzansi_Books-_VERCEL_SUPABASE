/**
 * VAT 201 PDF Generation Service
 * Generates professional VAT 201 tax return PDFs matching SARS format
 */

import { VATCalculation, VAT201Return } from './vatCalculationService';

export interface CompanyDetails {
  vatNumber: string;
  companyName: string;
  registrationNumber: string;
  physicalAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  postalAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  contactDetails: {
    phone: string;
    email: string;
    fax?: string;
  };
}

export interface VAT201PDFData {
  companyDetails: CompanyDetails;
  taxPeriod: string;
  dueDate: string;
  reference: string;
  calculation: VATCalculation;
  declaration: {
    fullName: string;
    capacity: 'Director' | 'Accountant' | 'Tax Practitioner' | 'Authorized Representative';
    submissionDate: string;
    digitalSignature?: string;
  };
}

class VAT201PDFService {
  private readonly STORAGE_KEY = 'vat201_pdfs';

  /**
   * Generate VAT 201 PDF
   */
  async generateVAT201PDF(vat201Return: VAT201Return): Promise<string> {
    try {
      // Get company details
      const companyDetails = this.getCompanyDetails();
      
      // Prepare PDF data
      const pdfData: VAT201PDFData = {
        companyDetails,
        taxPeriod: vat201Return.period,
        dueDate: vat201Return.dueDate,
        reference: vat201Return.reference,
        calculation: vat201Return.calculation,
        declaration: {
          fullName: '', // To be filled by user
          capacity: 'Director',
          submissionDate: new Date().toLocaleDateString('en-ZA'),
        }
      };
      
      // Generate PDF using browser-based PDF generation
      const pdfBlob = await this.createPDFBlob(pdfData);
      
      // Convert to base64 for storage
      const pdfBase64 = await this.blobToBase64(pdfBlob);
      
      // Save PDF reference
      this.savePDFReference(vat201Return.id, pdfBase64);
      
      return pdfBase64;
    } catch (error) {
      console.error('Error generating VAT 201 PDF:', error);
      throw error;
    }
  }

  /**
   * Create PDF blob using HTML to PDF conversion
   */
  private async createPDFBlob(data: VAT201PDFData): Promise<Blob> {
    // Create HTML content for PDF
    const htmlContent = this.generateHTMLContent(data);
    
    // In a real implementation, use a library like jsPDF or Puppeteer
    // For now, create a simple HTML-based PDF simulation
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    
    // Simulate PDF generation
    return new Promise((resolve) => {
      setTimeout(() => {
        // In production, this would be actual PDF generation
        const pdfContent = this.htmlToPDFSimulation(htmlContent);
        const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });
        resolve(pdfBlob);
      }, 1000);
    });
  }

  /**
   * Generate HTML content for VAT 201 return
   */
  private generateHTMLContent(data: VAT201PDFData): string {
    const { companyDetails, taxPeriod, dueDate, reference, calculation, declaration } = data;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>VAT 201 Return - ${reference}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 20mm;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            font-size: 10pt;
            line-height: 1.2;
            color: #000;
            margin: 0;
            padding: 0;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        
        .header h1 {
            font-size: 18pt;
            font-weight: bold;
            margin: 0;
            color: #000;
        }
        
        .header h2 {
            font-size: 14pt;
            margin: 5px 0;
            color: #333;
        }
        
        .company-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
            border: 1px solid #000;
            padding: 15px;
        }
        
        .company-info h3 {
            font-size: 12pt;
            font-weight: bold;
            margin: 0 0 10px 0;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
        }
        
        .tax-period {
            background-color: #f5f5f5;
            border: 1px solid #000;
            padding: 15px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .tax-period h3 {
            font-size: 14pt;
            margin: 0 0 10px 0;
        }
        
        .vat-sections {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .vat-section {
            border: 1px solid #000;
            padding: 15px;
        }
        
        .vat-section h4 {
            font-size: 12pt;
            font-weight: bold;
            margin: 0 0 15px 0;
            background-color: #e0e0e0;
            padding: 8px;
            text-align: center;
        }
        
        .vat-line {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px dotted #ccc;
        }
        
        .vat-line.total {
            font-weight: bold;
            border-bottom: 2px solid #000;
            border-top: 1px solid #000;
            margin-top: 10px;
            padding-top: 10px;
        }
        
        .calculation-summary {
            border: 2px solid #000;
            padding: 20px;
            margin-bottom: 20px;
            background-color: #f9f9f9;
        }
        
        .calculation-summary h4 {
            font-size: 14pt;
            text-align: center;
            margin: 0 0 20px 0;
            font-weight: bold;
        }
        
        .final-amount {
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            padding: 15px;
            border: 2px solid #000;
            background-color: #e8f4f8;
            margin: 20px 0;
        }
        
        .declaration {
            border: 1px solid #000;
            padding: 20px;
            margin-top: 20px;
        }
        
        .declaration h4 {
            font-size: 12pt;
            font-weight: bold;
            margin: 0 0 15px 0;
        }
        
        .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 30px;
        }
        
        .signature-box {
            border: 1px solid #000;
            height: 60px;
            padding: 10px;
        }
        
        .amount {
            font-family: 'Courier New', monospace;
            font-weight: bold;
        }
        
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>SOUTH AFRICAN REVENUE SERVICE</h1>
        <h2>VALUE ADDED TAX RETURN (VAT 201)</h2>
        <p><strong>Reference:</strong> ${reference} | <strong>Period:</strong> ${taxPeriod} | <strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString('en-ZA')}</p>
    </div>
    
    <!-- Company Information -->
    <div class="company-info">
        <div>
            <h3>Company Details</h3>
            <p><strong>VAT Number:</strong> ${companyDetails.vatNumber}</p>
            <p><strong>Company Name:</strong> ${companyDetails.companyName}</p>
            <p><strong>Registration Number:</strong> ${companyDetails.registrationNumber}</p>
        </div>
        <div>
            <h3>Contact Information</h3>
            <p><strong>Phone:</strong> ${companyDetails.contactDetails.phone}</p>
            <p><strong>Email:</strong> ${companyDetails.contactDetails.email}</p>
            ${companyDetails.contactDetails.fax ? `<p><strong>Fax:</strong> ${companyDetails.contactDetails.fax}</p>` : ''}
        </div>
    </div>
    
    <!-- Physical Address -->
    <div class="company-info">
        <div>
            <h3>Physical Address</h3>
            <p>${companyDetails.physicalAddress.street}</p>
            <p>${companyDetails.physicalAddress.city}, ${companyDetails.physicalAddress.province}</p>
            <p>${companyDetails.physicalAddress.postalCode}</p>
        </div>
        <div>
            <h3>Postal Address</h3>
            <p>${companyDetails.postalAddress.street}</p>
            <p>${companyDetails.postalAddress.city}, ${companyDetails.postalAddress.province}</p>
            <p>${companyDetails.postalAddress.postalCode}</p>
        </div>
    </div>
    
    <!-- Tax Period -->
    <div class="tax-period">
        <h3>Tax Period: ${taxPeriod}</h3>
        <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString('en-ZA')} | <strong>Days Remaining:</strong> ${this.calculateDaysRemaining(dueDate)}</p>
    </div>
    
    <!-- VAT Sections -->
    <div class="vat-sections">
        <!-- Output VAT -->
        <div class="vat-section">
            <h4>OUTPUT VAT (VAT Collected)</h4>
            
            <div class="vat-line">
                <span>Standard-rated supplies (15%)</span>
                <span class="amount">R ${this.formatAmount(calculation.outputVAT.standardRated.reduce((sum, item) => sum + item.vatAmount, 0))}</span>
            </div>
            
            <div class="vat-line">
                <span>Zero-rated supplies (0%)</span>
                <span class="amount">R ${this.formatAmount(calculation.outputVAT.zeroRated.reduce((sum, item) => sum + item.vatAmount, 0))}</span>
            </div>
            
            <div class="vat-line">
                <span>Export sales</span>
                <span class="amount">R ${this.formatAmount(calculation.outputVAT.exports.reduce((sum, item) => sum + item.vatAmount, 0))}</span>
            </div>
            
            <div class="vat-line">
                <span>OCR Extracted VAT (Slips)</span>
                <span class="amount">R ${this.formatAmount(calculation.outputVAT.slipVAT.reduce((sum, item) => sum + item.vatAmount, 0))}</span>
            </div>
            
            <div class="vat-line total">
                <span><strong>Total Output VAT</strong></span>
                <span class="amount"><strong>R ${this.formatAmount(calculation.outputVAT.total)}</strong></span>
            </div>
        </div>
        
        <!-- Input VAT -->
        <div class="vat-section">
            <h4>INPUT VAT (VAT Paid)</h4>
            
            <div class="vat-line">
                <span>Standard-rated expenses (15%)</span>
                <span class="amount">R ${this.formatAmount(calculation.inputVAT.standardRated.reduce((sum, item) => sum + item.vatAmount, 0))}</span>
            </div>
            
            <div class="vat-line">
                <span>Capital goods acquisitions</span>
                <span class="amount">R ${this.formatAmount(calculation.inputVAT.capitalGoods.reduce((sum, item) => sum + item.vatAmount, 0))}</span>
            </div>
            
            <div class="vat-line">
                <span>Import VAT and customs duties</span>
                <span class="amount">R ${this.formatAmount(calculation.inputVAT.imports.reduce((sum, item) => sum + item.vatAmount, 0))}</span>
            </div>
            
            <div class="vat-line">
                <span>Other deductible input tax</span>
                <span class="amount">R ${this.formatAmount(calculation.inputVAT.other.reduce((sum, item) => sum + item.vatAmount, 0))}</span>
            </div>
            
            <div class="vat-line total">
                <span><strong>Total Input VAT</strong></span>
                <span class="amount"><strong>R ${this.formatAmount(calculation.inputVAT.total)}</strong></span>
            </div>
        </div>
    </div>
    
    <!-- Calculation Summary -->
    <div class="calculation-summary">
        <h4>VAT CALCULATION SUMMARY</h4>
        
        <div class="vat-line">
            <span>Total Output VAT (VAT Collected)</span>
            <span class="amount">R ${this.formatAmount(calculation.outputVAT.total)}</span>
        </div>
        
        <div class="vat-line">
            <span>Total Input VAT (VAT Paid)</span>
            <span class="amount">R ${this.formatAmount(calculation.inputVAT.total)}</span>
        </div>
        
        <div class="vat-line">
            <span>Net VAT</span>
            <span class="amount">R ${this.formatAmount(calculation.netVAT)}</span>
        </div>
        
        <div class="vat-line">
            <span>Interest and Penalties</span>
            <span class="amount">R 0.00</span>
        </div>
    </div>
    
    <!-- Final Amount -->
    <div class="final-amount">
        ${calculation.netVAT >= 0 
          ? `<strong>AMOUNT PAYABLE: R ${this.formatAmount(calculation.vatPayable)}</strong>`
          : `<strong>REFUND DUE: R ${this.formatAmount(calculation.vatRefund)}</strong>`
        }
    </div>
    
    <!-- Declaration -->
    <div class="declaration">
        <h4>DECLARATION</h4>
        <p>I declare that the information provided in this return is true and correct to the best of my knowledge and belief.</p>
        
        <div class="signature-section">
            <div>
                <p><strong>Full Name:</strong> _________________________________</p>
                <p><strong>Capacity:</strong> _________________________________</p>
                <p><strong>Date:</strong> ${declaration.submissionDate}</p>
            </div>
            <div>
                <p><strong>Signature:</strong></p>
                <div class="signature-box"></div>
                <p style="text-align: center; margin-top: 10px;"><strong>Company Stamp</strong></p>
            </div>
        </div>
    </div>
    
    <!-- Page Break for Detailed Breakdown -->
    <div class="page-break">
        <div class="header">
            <h2>VAT 201 DETAILED BREAKDOWN</h2>
            <p><strong>Reference:</strong> ${reference} | <strong>Period:</strong> ${taxPeriod}</p>
        </div>
        
        <!-- Detailed Output VAT -->
        <div class="vat-section">
            <h4>DETAILED OUTPUT VAT SOURCES</h4>
            ${this.generateDetailedVATTable(calculation.outputVAT.standardRated.concat(calculation.outputVAT.slipVAT))}
        </div>
        
        <!-- Detailed Input VAT -->
        <div class="vat-section">
            <h4>DETAILED INPUT VAT SOURCES</h4>
            ${this.generateDetailedVATTable(calculation.inputVAT.standardRated.concat(calculation.inputVAT.other))}
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate detailed VAT table
   */
  private generateDetailedVATTable(sources: any[]): string {
    if (sources.length === 0) {
      return '<p>No transactions for this period.</p>';
    }
    
    let table = `
      <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Date</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Description</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Category</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: right;">Base Amount</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: right;">VAT Amount</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Reference</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    sources.forEach(source => {
      table += `
        <tr>
          <td style="border: 1px solid #000; padding: 6px;">${new Date(source.date).toLocaleDateString('en-ZA')}</td>
          <td style="border: 1px solid #000; padding: 6px;">${source.description}</td>
          <td style="border: 1px solid #000; padding: 6px;">${source.category}</td>
          <td style="border: 1px solid #000; padding: 6px; text-align: right;">R ${this.formatAmount(source.amount)}</td>
          <td style="border: 1px solid #000; padding: 6px; text-align: right;">R ${this.formatAmount(source.vatAmount)}</td>
          <td style="border: 1px solid #000; padding: 6px;">${source.reference || '-'}</td>
        </tr>
      `;
    });
    
    const totalVAT = sources.reduce((sum, source) => sum + source.vatAmount, 0);
    table += `
        <tr style="font-weight: bold; background-color: #f5f5f5;">
          <td colspan="4" style="border: 1px solid #000; padding: 8px; text-align: right;">TOTAL:</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: right;">R ${this.formatAmount(totalVAT)}</td>
          <td style="border: 1px solid #000; padding: 8px;"></td>
        </tr>
      </tbody>
    </table>
    `;
    
    return table;
  }

  /**
   * Format amount for display
   */
  private formatAmount(amount: number): string {
    return amount.toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Calculate days remaining until due date
   */
  private calculateDaysRemaining(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Simulate HTML to PDF conversion
   */
  private htmlToPDFSimulation(htmlContent: string): string {
    // In production, this would use a proper HTML to PDF library
    // For now, return the HTML content as a "PDF"
    return `%PDF-1.4\n% Simulated PDF Content\n% Generated VAT 201 Return\n\n${htmlContent}`;
  }

  /**
   * Convert blob to base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:application/pdf;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get company details from localStorage
   */
  private getCompanyDetails(): CompanyDetails {
    try {
      const stored = localStorage.getItem('companyDetails');
      if (stored) {
        const company = JSON.parse(stored);
        return {
          vatNumber: company.vatNumber || '4123456789',
          companyName: company.companyName || 'Sample Company (Pty) Ltd',
          registrationNumber: company.registrationNumber || '2023/123456/07',
          physicalAddress: {
            street: company.physicalAddress?.street || '123 Business Street',
            city: company.physicalAddress?.city || 'Cape Town',
            province: company.physicalAddress?.province || 'Western Cape',
            postalCode: company.physicalAddress?.postalCode || '8001'
          },
          postalAddress: {
            street: company.postalAddress?.street || 'PO Box 12345',
            city: company.postalAddress?.city || 'Cape Town',
            province: company.postalAddress?.province || 'Western Cape',
            postalCode: company.postalAddress?.postalCode || '8000'
          },
          contactDetails: {
            phone: company.contactDetails?.phone || '+27 21 123 4567',
            email: company.contactDetails?.email || 'info@company.co.za',
            fax: company.contactDetails?.fax
          }
        };
      }
    } catch (error) {
      console.error('Error loading company details:', error);
    }
    
    // Return default company details
    return {
      vatNumber: '4123456789',
      companyName: 'Sample Company (Pty) Ltd',
      registrationNumber: '2023/123456/07',
      physicalAddress: {
        street: '123 Business Street',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8001'
      },
      postalAddress: {
        street: 'PO Box 12345',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8000'
      },
      contactDetails: {
        phone: '+27 21 123 4567',
        email: 'info@company.co.za'
      }
    };
  }

  /**
   * Save PDF reference
   */
  private savePDFReference(vat201Id: string, pdfBase64: string): void {
    try {
      const pdfs = this.getAllPDFReferences();
      pdfs[vat201Id] = {
        id: vat201Id,
        pdfData: pdfBase64,
        generatedAt: new Date().toISOString(),
        fileSize: pdfBase64.length
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pdfs));
    } catch (error) {
      console.error('Error saving PDF reference:', error);
    }
  }

  /**
   * Get all PDF references
   */
  private getAllPDFReferences(): Record<string, any> {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  /**
   * Download PDF
   */
  downloadPDF(vat201Id: string, filename?: string): void {
    try {
      const pdfs = this.getAllPDFReferences();
      const pdfRef = pdfs[vat201Id];
      
      if (!pdfRef) {
        throw new Error('PDF not found');
      }
      
      // Create download link
      const pdfBlob = this.base64ToBlob(pdfRef.pdfData, 'application/pdf');
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `VAT201_${vat201Id}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  }

  /**
   * Convert base64 to blob
   */
  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  /**
   * Get PDF info
   */
  getPDFInfo(vat201Id: string): any {
    const pdfs = this.getAllPDFReferences();
    return pdfs[vat201Id] || null;
  }

  /**
   * Delete PDF
   */
  deletePDF(vat201Id: string): boolean {
    try {
      const pdfs = this.getAllPDFReferences();
      delete pdfs[vat201Id];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pdfs));
      return true;
    } catch (error) {
      console.error('Error deleting PDF:', error);
      return false;
    }
  }
}

const vat201PDFService = new VAT201PDFService();
export default vat201PDFService;
export { VAT201PDFService };