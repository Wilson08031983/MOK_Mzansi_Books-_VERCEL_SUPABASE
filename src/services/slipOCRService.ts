/**
 * Slip OCR Service
 * Handles OCR text extraction from slip images and amount validation
 */

import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  extractedAmount: number | null;
  rawAmounts: number[];
}

export interface ReceiptData {
  status: 'missing' | 'attached' | 'rejected';
  uploadedFile: string | null; // base64 encoded image
  extractedAmount: number | null;
  uploadDate: string | null;
  validationResult: boolean | null;
  ocrConfidence: number | null;
}

class SlipOCRService {
  private readonly STORAGE_KEY = 'expense_receipts';
  private readonly AMOUNT_TOLERANCE = 0.01; // R0.01 tolerance for amount matching

  /**
   * Extract text and amounts from uploaded slip image
   */
  async extractTextFromImage(imageFile: File): Promise<OCRResult> {
    try {
      const result = await Tesseract.recognize(imageFile, 'eng', {
        logger: m => console.log(m)
      });

      const extractedText = result.data.text;
      const confidence = result.data.confidence;
      const amounts = this.extractAmountsFromText(extractedText);
      const finalAmount = this.selectFinalAmount(amounts, extractedText);

      return {
        text: extractedText,
        confidence: confidence / 100, // Convert to 0-1 scale
        extractedAmount: finalAmount,
        rawAmounts: amounts
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  /**
   * Extract monetary amounts from text using regex patterns
   */
  private extractAmountsFromText(text: string): number[] {
    const amounts: number[] = [];
    
    // Common South African currency patterns
    const patterns = [
      /R\s*([0-9,]+\.?[0-9]*)/gi,           // R450.00, R 450, R450
      /ZAR\s*([0-9,]+\.?[0-9]*)/gi,         // ZAR450.00
      /([0-9,]+\.[0-9]{2})\s*R/gi,          // 450.00 R
      /Total[:\s]*R?\s*([0-9,]+\.?[0-9]*)/gi, // Total: R450.00
      /Amount[:\s]*R?\s*([0-9,]+\.?[0-9]*)/gi, // Amount: 450.00
      /([0-9,]+\.[0-9]{2})/g                // Any decimal number
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const amountStr = match[1].replace(/,/g, '');
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount > 0) {
          amounts.push(amount);
        }
      }
    });

    // Remove duplicates and sort
    return [...new Set(amounts)].sort((a, b) => b - a);
  }

  /**
   * Select the most likely final amount from extracted amounts
   */
  private selectFinalAmount(amounts: number[], text: string): number | null {
    if (amounts.length === 0) return null;
    if (amounts.length === 1) return amounts[0];

    // Look for keywords that indicate final amount
    const finalKeywords = ['total', 'amount due', 'grand total', 'final', 'balance'];
    const textLower = text.toLowerCase();

    // Find amounts near final keywords
    for (const keyword of finalKeywords) {
      const keywordIndex = textLower.indexOf(keyword);
      if (keywordIndex !== -1) {
        // Look for amounts within 50 characters after the keyword
        const nearbyText = text.substring(keywordIndex, keywordIndex + 50);
        const nearbyAmounts = this.extractAmountsFromText(nearbyText);
        if (nearbyAmounts.length > 0) {
          return nearbyAmounts[0]; // Return first amount found near keyword
        }
      }
    }

    // If no keyword match, return the largest amount (most likely to be total)
    return amounts[0];
  }

  /**
   * Validate slip amount against expense debit amount
   */
  validateSlipAmount(extractedAmount: number, debitAmount: number): boolean {
    if (!extractedAmount || !debitAmount) return false;
    return Math.abs(extractedAmount - debitAmount) <= this.AMOUNT_TOLERANCE;
  }

  /**
   * Process slip upload and validation
   */
  async processSlipUpload(
    expenseId: string, 
    imageFile: File, 
    debitAmount: number
  ): Promise<ReceiptData> {
    try {
      // Convert file to base64
      const base64Image = await this.fileToBase64(imageFile);
      
      // Extract text and amounts using OCR
      const ocrResult = await this.extractTextFromImage(imageFile);
      
      // Validate amount
      const isValid = ocrResult.extractedAmount ? 
        this.validateSlipAmount(ocrResult.extractedAmount, debitAmount) : false;
      
      // Determine status
      const status: 'attached' | 'rejected' = isValid ? 'attached' : 'rejected';
      
      const receiptData: ReceiptData = {
        status,
        uploadedFile: base64Image,
        extractedAmount: ocrResult.extractedAmount,
        uploadDate: new Date().toISOString(),
        validationResult: isValid,
        ocrConfidence: ocrResult.confidence
      };
      
      // Save receipt data
      this.saveReceiptData(expenseId, receiptData);
      
      return receiptData;
    } catch (error) {
      console.error('Slip processing failed:', error);
      
      // Save as rejected if OCR fails
      const base64Image = await this.fileToBase64(imageFile);
      const receiptData: ReceiptData = {
        status: 'rejected',
        uploadedFile: base64Image,
        extractedAmount: null,
        uploadDate: new Date().toISOString(),
        validationResult: false,
        ocrConfidence: 0
      };
      
      this.saveReceiptData(expenseId, receiptData);
      return receiptData;
    }
  }

  /**
   * Convert file to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Save receipt data to localStorage
   */
  saveReceiptData(expenseId: string, receiptData: ReceiptData): void {
    try {
      const receipts = this.getAllReceipts();
      receipts[expenseId] = receiptData;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(receipts));
    } catch (error) {
      console.error('Failed to save receipt data:', error);
    }
  }

  /**
   * Get receipt data for specific expense
   */
  getReceiptData(expenseId: string): ReceiptData | null {
    try {
      const receipts = this.getAllReceipts();
      return receipts[expenseId] || null;
    } catch (error) {
      console.error('Failed to get receipt data:', error);
      return null;
    }
  }

  /**
   * Get all receipt data
   */
  private getAllReceipts(): Record<string, ReceiptData> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to parse receipt data:', error);
      return {};
    }
  }

  /**
   * Update receipt status
   */
  updateReceiptStatus(expenseId: string, status: 'missing' | 'attached' | 'rejected'): void {
    const receiptData = this.getReceiptData(expenseId);
    if (receiptData) {
      receiptData.status = status;
      this.saveReceiptData(expenseId, receiptData);
    }
  }

  /**
   * Delete receipt data
   */
  deleteReceiptData(expenseId: string): void {
    try {
      const receipts = this.getAllReceipts();
      delete receipts[expenseId];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(receipts));
    } catch (error) {
      console.error('Failed to delete receipt data:', error);
    }
  }

  /**
   * Get receipts by status
   */
  getReceiptsByStatus(status: 'missing' | 'attached' | 'rejected'): Record<string, ReceiptData> {
    const allReceipts = this.getAllReceipts();
    const filtered: Record<string, ReceiptData> = {};
    
    Object.entries(allReceipts).forEach(([expenseId, receiptData]) => {
      if (receiptData.status === status) {
        filtered[expenseId] = receiptData;
      }
    });
    
    return filtered;
  }

  /**
   * Get validation summary
   */
  getValidationSummary(): {
    total: number;
    attached: number;
    rejected: number;
    missing: number;
  } {
    const allReceipts = this.getAllReceipts();
    const summary = {
      total: Object.keys(allReceipts).length,
      attached: 0,
      rejected: 0,
      missing: 0
    };
    
    Object.values(allReceipts).forEach(receipt => {
      summary[receipt.status]++;
    });
    
    return summary;
  }
}

const slipOCRService = new SlipOCRService();
export default slipOCRService;
export { SlipOCRService };