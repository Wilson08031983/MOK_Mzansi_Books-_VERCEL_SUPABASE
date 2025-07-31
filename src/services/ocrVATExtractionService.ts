/**
 * OCR VAT Extraction Service
 * Extracts VAT amounts from uploaded slip/receipt images using OCR
 */

import vatCalculationService from './vatCalculationService';

export interface OCRResult {
  text: string;
  confidence: number;
  vatAmount?: number;
  totalAmount?: number;
  vatRate?: number;
  extractedData: {
    vatLines: string[];
    totalLines: string[];
    possibleVATAmounts: number[];
  };
}

export interface SlipVATExtraction {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  ocrResult: OCRResult;
  vatAmount: number;
  totalAmount: number;
  confidence: number;
  status: 'processing' | 'completed' | 'failed' | 'manual_review';
  manuallyVerified?: boolean;
  expenseId?: string;
}

class OCRVATExtractionService {
  private readonly STORAGE_KEY = 'ocr_vat_extractions';
  private readonly VAT_KEYWORDS = [
    'vat', 'v.a.t', 'value added tax', 'btw', 'tax',
    'vat @', 'vat@', 'vat 15%', 'vat15%', '15% vat',
    'inclusive', 'incl', 'excl', 'exclusive'
  ];
  private readonly TOTAL_KEYWORDS = [
    'total', 'amount', 'sum', 'grand total', 'final',
    'balance', 'due', 'payable', 'subtotal', 'sub total'
  ];
  private readonly STANDARD_VAT_RATE = 0.15;

  /**
   * Process uploaded slip image and extract VAT
   */
  async processSlipImage(file: File, expenseId?: string): Promise<SlipVATExtraction> {
    const extraction: SlipVATExtraction = {
      id: `ocr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      ocrResult: {
        text: '',
        confidence: 0,
        extractedData: {
          vatLines: [],
          totalLines: [],
          possibleVATAmounts: []
        }
      },
      vatAmount: 0,
      totalAmount: 0,
      confidence: 0,
      status: 'processing',
      expenseId
    };

    try {
      // Convert file to base64 for processing
      const imageData = await this.fileToBase64(file);
      
      // Perform OCR using browser-based text extraction
      const ocrResult = await this.performOCR(imageData);
      extraction.ocrResult = ocrResult;
      
      // Extract VAT information
      const vatInfo = this.extractVATFromText(ocrResult.text);
      extraction.vatAmount = vatInfo.vatAmount;
      extraction.totalAmount = vatInfo.totalAmount;
      extraction.confidence = Math.min(ocrResult.confidence, vatInfo.confidence);
      
      // Determine status based on confidence
      if (extraction.confidence > 0.8 && extraction.vatAmount > 0) {
        extraction.status = 'completed';
        
        // Add to VAT calculation service
        vatCalculationService.addSlipVATExtraction({
          id: extraction.id,
          description: `OCR VAT from ${file.name}`,
          amount: extraction.totalAmount,
          vatAmount: extraction.vatAmount,
          date: new Date().toISOString().split('T')[0],
          reference: extraction.id,
          ocrConfidence: extraction.confidence
        });
      } else if (extraction.confidence > 0.5) {
        extraction.status = 'manual_review';
      } else {
        extraction.status = 'failed';
      }
      
    } catch (error) {
      console.error('OCR processing failed:', error);
      extraction.status = 'failed';
    }

    // Save extraction result
    this.saveExtraction(extraction);
    return extraction;
  }

  /**
   * Convert file to base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Perform OCR on image (simplified browser-based implementation)
   * In a real implementation, this would use Tesseract.js or similar
   */
  private async performOCR(imageData: string): Promise<OCRResult> {
    // Simulate OCR processing with sample text extraction
    // In production, integrate with Tesseract.js:
    // import Tesseract from 'tesseract.js';
    // const { data: { text, confidence } } = await Tesseract.recognize(imageData);
    
    // For now, return a mock result that simulates common receipt patterns
    const mockReceiptText = this.generateMockReceiptText();
    
    return {
      text: mockReceiptText,
      confidence: 0.85, // Mock confidence
      extractedData: {
        vatLines: [],
        totalLines: [],
        possibleVATAmounts: []
      }
    };
  }

  /**
   * Generate mock receipt text for demonstration
   */
  private generateMockReceiptText(): string {
    const mockTexts = [
      `RECEIPT\nDATE: ${new Date().toLocaleDateString()}\nITEMS:\nOffice Supplies R 130.43\nStationery R 86.96\n\nSUBTOTAL: R 189.00\nVAT (15%): R 28.35\nTOTAL: R 217.35\n\nTHANK YOU`,
      `TAX INVOICE\n${new Date().toLocaleDateString()}\n\nDESCRIPTION: Business Lunch\nAMOUNT EXCL VAT: R 156.52\nVAT @ 15%: R 23.48\nTOTAL INCL VAT: R 180.00\n\nVAT REG: 4123456789`,
      `SLIP\nTransportation Services\nBase Amount: R 39.13\nVAT 15%: R 5.87\nFinal Total: R 45.00\nDate: ${new Date().toLocaleDateString()}`,
      `RECEIPT\nMeeting Expenses\nSubtotal: R 434.78\nVAT (15%): R 65.22\nGrand Total: R 500.00\n\nVAT Inclusive`
    ];
    
    return mockTexts[Math.floor(Math.random() * mockTexts.length)];
  }

  /**
   * Extract VAT information from OCR text
   */
  private extractVATFromText(text: string): {
    vatAmount: number;
    totalAmount: number;
    confidence: number;
  } {
    const lines = text.toLowerCase().split('\n').map(line => line.trim());
    let vatAmount = 0;
    let totalAmount = 0;
    let confidence = 0;
    
    const vatLines: string[] = [];
    const totalLines: string[] = [];
    const possibleVATAmounts: number[] = [];
    
    // Look for VAT-related lines
    lines.forEach(line => {
      // Check for VAT keywords
      const hasVATKeyword = this.VAT_KEYWORDS.some(keyword => 
        line.includes(keyword.toLowerCase())
      );
      
      if (hasVATKeyword) {
        vatLines.push(line);
        
        // Extract numbers from VAT lines
        const numbers = this.extractNumbers(line);
        numbers.forEach(num => {
          if (num > 0 && num < 10000) { // Reasonable VAT amount range
            possibleVATAmounts.push(num);
          }
        });
      }
      
      // Check for total keywords
      const hasTotalKeyword = this.TOTAL_KEYWORDS.some(keyword => 
        line.includes(keyword.toLowerCase())
      );
      
      if (hasTotalKeyword) {
        totalLines.push(line);
        
        // Extract total amount
        const numbers = this.extractNumbers(line);
        if (numbers.length > 0) {
          totalAmount = Math.max(totalAmount, Math.max(...numbers));
        }
      }
    });
    
    // Determine VAT amount
    if (possibleVATAmounts.length > 0) {
      // Use the most likely VAT amount
      vatAmount = this.selectMostLikelyVATAmount(possibleVATAmounts, totalAmount);
      confidence = 0.8;
    } else if (totalAmount > 0) {
      // Try to calculate VAT from total (assuming VAT inclusive)
      vatAmount = this.calculateVATFromInclusive(totalAmount);
      confidence = 0.6;
    }
    
    // Validate VAT amount makes sense
    if (vatAmount > 0 && totalAmount > 0) {
      const calculatedRate = vatAmount / (totalAmount - vatAmount);
      if (Math.abs(calculatedRate - this.STANDARD_VAT_RATE) < 0.02) {
        confidence = Math.min(confidence + 0.2, 1.0);
      }
    }
    
    return {
      vatAmount: Math.round(vatAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      confidence
    };
  }

  /**
   * Extract numbers from text line
   */
  private extractNumbers(text: string): number[] {
    // Match currency amounts (R 123.45, R123.45, 123.45, etc.)
    const numberRegex = /(?:r\s*)?([0-9]+(?:[.,][0-9]{2})?)/gi;
    const matches = text.match(numberRegex) || [];
    
    return matches.map(match => {
      // Clean up the match and convert to number
      const cleaned = match.replace(/[^0-9.,]/g, '').replace(',', '.');
      return parseFloat(cleaned) || 0;
    }).filter(num => num > 0);
  }

  /**
   * Select the most likely VAT amount from candidates
   */
  private selectMostLikelyVATAmount(amounts: number[], totalAmount: number): number {
    if (amounts.length === 1) {
      return amounts[0];
    }
    
    // If we have a total, find the amount that gives us closest to 15% VAT rate
    if (totalAmount > 0) {
      let bestAmount = amounts[0];
      let bestRateDiff = Infinity;
      
      amounts.forEach(amount => {
        const impliedRate = amount / (totalAmount - amount);
        const rateDiff = Math.abs(impliedRate - this.STANDARD_VAT_RATE);
        
        if (rateDiff < bestRateDiff) {
          bestRateDiff = rateDiff;
          bestAmount = amount;
        }
      });
      
      return bestAmount;
    }
    
    // Otherwise, return the median amount
    const sorted = amounts.sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }

  /**
   * Calculate VAT from VAT-inclusive amount
   */
  private calculateVATFromInclusive(inclusiveAmount: number): number {
    return (inclusiveAmount * this.STANDARD_VAT_RATE) / (1 + this.STANDARD_VAT_RATE);
  }

  /**
   * Save extraction result
   */
  private saveExtraction(extraction: SlipVATExtraction): void {
    try {
      const extractions = this.getAllExtractions();
      extractions.push(extraction);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(extractions));
    } catch (error) {
      console.error('Error saving OCR extraction:', error);
    }
  }

  /**
   * Get all extractions
   */
  getAllExtractions(): SlipVATExtraction[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Get extraction by ID
   */
  getExtractionById(id: string): SlipVATExtraction | null {
    const extractions = this.getAllExtractions();
    return extractions.find(e => e.id === id) || null;
  }

  /**
   * Update extraction (for manual verification)
   */
  updateExtraction(id: string, updates: Partial<SlipVATExtraction>): boolean {
    try {
      const extractions = this.getAllExtractions();
      const index = extractions.findIndex(e => e.id === id);
      
      if (index >= 0) {
        extractions[index] = { ...extractions[index], ...updates };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(extractions));
        
        // Update VAT calculation if amounts changed
        if (updates.vatAmount !== undefined || updates.totalAmount !== undefined) {
          const extraction = extractions[index];
          vatCalculationService.addSlipVATExtraction({
            id: extraction.id,
            description: `OCR VAT from ${extraction.fileName} (Updated)`,
            amount: extraction.totalAmount,
            vatAmount: extraction.vatAmount,
            date: new Date().toISOString().split('T')[0],
            reference: extraction.id,
            ocrConfidence: extraction.confidence
          });
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating extraction:', error);
      return false;
    }
  }

  /**
   * Delete extraction
   */
  deleteExtraction(id: string): boolean {
    try {
      const extractions = this.getAllExtractions();
      const filteredExtractions = extractions.filter(e => e.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredExtractions));
      return true;
    } catch (error) {
      console.error('Error deleting extraction:', error);
      return false;
    }
  }

  /**
   * Get extractions requiring manual review
   */
  getExtractionsForReview(): SlipVATExtraction[] {
    return this.getAllExtractions().filter(e => e.status === 'manual_review');
  }

  /**
   * Get extraction statistics
   */
  getExtractionStats(): {
    total: number;
    completed: number;
    failed: number;
    manualReview: number;
    totalVATExtracted: number;
  } {
    const extractions = this.getAllExtractions();
    
    return {
      total: extractions.length,
      completed: extractions.filter(e => e.status === 'completed').length,
      failed: extractions.filter(e => e.status === 'failed').length,
      manualReview: extractions.filter(e => e.status === 'manual_review').length,
      totalVATExtracted: extractions
        .filter(e => e.status === 'completed')
        .reduce((sum, e) => sum + e.vatAmount, 0)
    };
  }
}

const ocrVATExtractionService = new OCRVATExtractionService();
export default ocrVATExtractionService;
export { OCRVATExtractionService };