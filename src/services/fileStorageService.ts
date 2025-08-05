/**
 * File Storage Service
 * Handles localStorage operations for expense receipts and bank statements
 */

export interface ReceiptFile {
  expenseId: string;
  filename: string;
  fileSize: string;
  fileType: string;
  uploadDate: string;
  base64Data: string;
  thumbnailData: string;
  ocrText?: string;
  status: 'Missing' | 'Attached' | 'Rejected';
}

export interface BankStatementFile {
  id: string;
  filename: string;
  fileSize: string;
  fileType: string;
  uploadDate: string;
  base64Data: string;
  thumbnailData: string;
  bankName?: string;
  statementPeriod?: string;
  extractedTransactions?: any[];
  metadata?: {
    pages?: number;
    accountNumber?: string;
    statementDate?: string;
  };
}

class FileStorageService {
  private readonly RECEIPTS_KEY = 'mokExpenseReceipts';
  private readonly BANK_STATEMENTS_KEY = 'mokBankStatements';
  private readonly MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB limit

  /**
   * Generate thumbnail from file
   */
  private async generateThumbnail(file: File, maxWidth: number = 100, maxHeight: number = 80): Promise<string> {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          // Calculate thumbnail dimensions
          const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        // For PDFs, create a generic thumbnail
        const canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = '#1f2937';
          ctx.fillRect(0, 0, maxWidth, maxHeight);
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('PDF', maxWidth / 2, maxHeight / 2);
        }
        
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve('');
      }
    });
  }

  /**
   * Convert file to base64
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Format file size
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check storage usage
   */
  private getStorageUsage(): number {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }
    return totalSize;
  }

  /**
   * Save expense receipt
   */
  async saveExpenseReceipt(expenseId: string, file: File, ocrText?: string): Promise<ReceiptFile> {
    try {
      // Check storage limit
      if (this.getStorageUsage() + file.size > this.MAX_STORAGE_SIZE) {
        throw new Error('Storage limit exceeded. Please delete some files.');
      }

      const base64Data = await this.fileToBase64(file);
      const thumbnailData = await this.generateThumbnail(file);
      
      const receiptFile: ReceiptFile = {
        expenseId,
        filename: file.name,
        fileSize: this.formatFileSize(file.size),
        fileType: file.type,
        uploadDate: new Date().toISOString(),
        base64Data,
        thumbnailData,
        ocrText,
        status: 'Attached'
      };

      // Get existing receipts
      const existingReceipts = this.getExpenseReceipts();
      
      // Remove any existing receipt for this expense
      const updatedReceipts = existingReceipts.filter(r => r.expenseId !== expenseId);
      
      // Add new receipt
      updatedReceipts.push(receiptFile);
      
      // Save to localStorage
      localStorage.setItem(this.RECEIPTS_KEY, JSON.stringify(updatedReceipts));
      
      return receiptFile;
    } catch (error) {
      console.error('Error saving expense receipt:', error);
      throw error;
    }
  }

  /**
   * Get expense receipt by ID
   */
  getExpenseReceipt(expenseId: string): ReceiptFile | null {
    const receipts = this.getExpenseReceipts();
    return receipts.find(r => r.expenseId === expenseId) || null;
  }

  /**
   * Get all expense receipts
   */
  getExpenseReceipts(): ReceiptFile[] {
    try {
      const data = localStorage.getItem(this.RECEIPTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading expense receipts:', error);
      return [];
    }
  }

  /**
   * Delete expense receipt
   */
  deleteExpenseReceipt(expenseId: string): boolean {
    try {
      const receipts = this.getExpenseReceipts();
      const updatedReceipts = receipts.filter(r => r.expenseId !== expenseId);
      localStorage.setItem(this.RECEIPTS_KEY, JSON.stringify(updatedReceipts));
      return true;
    } catch (error) {
      console.error('Error deleting expense receipt:', error);
      return false;
    }
  }

  /**
   * Save bank statement
   */
  async saveBankStatement(file: File, bankName?: string, statementPeriod?: string): Promise<BankStatementFile> {
    try {
      // Check storage limit
      if (this.getStorageUsage() + file.size > this.MAX_STORAGE_SIZE) {
        throw new Error('Storage limit exceeded. Please delete some files.');
      }

      const base64Data = await this.fileToBase64(file);
      const thumbnailData = await this.generateThumbnail(file, 120, 80);
      
      const statementFile: BankStatementFile = {
        id: `STMT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        filename: file.name,
        fileSize: this.formatFileSize(file.size),
        fileType: file.type,
        uploadDate: new Date().toISOString(),
        base64Data,
        thumbnailData,
        bankName,
        statementPeriod,
        extractedTransactions: [],
        metadata: {
          pages: file.type === 'application/pdf' ? undefined : 1,
          accountNumber: undefined,
          statementDate: undefined
        }
      };

      // Get existing statements
      const existingStatements = this.getBankStatements();
      
      // Add new statement
      existingStatements.push(statementFile);
      
      // Save to localStorage
      localStorage.setItem(this.BANK_STATEMENTS_KEY, JSON.stringify(existingStatements));
      
      return statementFile;
    } catch (error) {
      console.error('Error saving bank statement:', error);
      throw error;
    }
  }

  /**
   * Get bank statement by ID
   */
  getBankStatement(id: string): BankStatementFile | null {
    const statements = this.getBankStatements();
    return statements.find(s => s.id === id) || null;
  }

  /**
   * Get all bank statements
   */
  getBankStatements(): BankStatementFile[] {
    try {
      const data = localStorage.getItem(this.BANK_STATEMENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading bank statements:', error);
      return [];
    }
  }

  /**
   * Delete bank statement
   */
  deleteBankStatement(id: string): boolean {
    try {
      const statements = this.getBankStatements();
      const updatedStatements = statements.filter(s => s.id !== id);
      localStorage.setItem(this.BANK_STATEMENTS_KEY, JSON.stringify(updatedStatements));
      return true;
    } catch (error) {
      console.error('Error deleting bank statement:', error);
      return false;
    }
  }

  /**
   * Get storage usage info
   */
  getStorageInfo(): { used: number; total: number; percentage: number } {
    const used = this.getStorageUsage();
    const total = this.MAX_STORAGE_SIZE;
    const percentage = (used / total) * 100;
    
    return { used, total, percentage };
  }

  /**
   * Clear all stored files (for testing/debugging)
   */
  clearAllFiles(): void {
    localStorage.removeItem(this.RECEIPTS_KEY);
    localStorage.removeItem(this.BANK_STATEMENTS_KEY);
  }
}

export default new FileStorageService();