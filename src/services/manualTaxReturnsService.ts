import { v4 as uuidv4 } from 'uuid';

export interface ManualTaxFile {
  id: string;
  name: string;
  type: string;
  size: number;
  storedRef: string; // base64 data or reference
  caption?: string;
  uploadedAt: string;
}

export interface ManualTaxReturn {
  id: string;
  taxType: 'IRP6' | 'ITR14' | 'DTR01' | 'CUSTOMS';
  period: string;
  inputs: Record<string, any>;
  computed: Record<string, number>;
  manualOverrides: Record<string, number>;
  files: ManualTaxFile[];
  notes: string;
  status: 'draft' | 'finalized';
  createdAt: string;
  updatedAt: string;
  changeLog: Array<{
    timestamp: string;
    action: string;
    user?: string;
    details?: string;
  }>;
}

export interface IRP6Inputs {
  taxPeriod: string;
  taxableIncome: number;
  estimatedTaxableIncome?: number;
  taxRate: number;
  effectiveRate?: number;
  calculatedTaxDue: number;
  paymentsAlreadyMade: number;
  balanceDue: number;
  assumptions: string;
}

export interface ITR14Inputs {
  taxableProfitBeforeAdjustments: number;
  additions: Array<{ description: string; amount: number }>;
  deductions: Array<{ description: string; amount: number }>;
  taxableIncomeAfterAdjustments: number;
  taxRate: number;
  taxPayable: number;
  taxCredits: number;
  balanceOrRefund: number;
  breakdownData?: string; // CSV/JSON paste area
}

export interface DTR01Inputs {
  grossDividendsDeclared: number;
  exemptions: number;
  taxableDividends: number;
  dividendsTaxRate: number;
  taxWithheld: number;
  balanceDue: number;
  isLocalResident: boolean;
  isExemptRecipient: boolean;
  hasRateOverride: boolean;
  overrideRate?: number;
  scenarioNotes: string;
}

export interface CustomsInputs {
  lineItems: Array<{
    id: string;
    goodsType: string;
    tariffCode: string;
    customsValue: number;
    dutyRate: number;
    exciseAmount: number;
    vatOnImport: number;
    totalImportLiability: number;
  }>;
  totalCustomsValue: number;
  totalDutyAmount: number;
  totalExciseAmount: number;
  totalVATOnImport: number;
  totalImportLiability: number;
}

class ManualTaxReturnsService {
  private readonly STORAGE_KEY = 'manualTaxReturns';

  /**
   * Get all manual tax returns
   */
  getAllReturns(): ManualTaxReturn[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ [ManualTaxReturns] Error loading returns:', error);
      return [];
    }
  }

  /**
   * Get a specific manual tax return by ID
   */
  getReturn(id: string): ManualTaxReturn | null {
    const returns = this.getAllReturns();
    return returns.find(r => r.id === id) || null;
  }

  /**
   * Save a manual tax return (create or update)
   */
  saveReturn(taxReturn: Partial<ManualTaxReturn>): ManualTaxReturn {
    const returns = this.getAllReturns();
    const now = new Date().toISOString();
    
    let savedReturn: ManualTaxReturn;
    
    if (taxReturn.id) {
      // Update existing
      const index = returns.findIndex(r => r.id === taxReturn.id);
      if (index === -1) {
        throw new Error(`Tax return with ID ${taxReturn.id} not found`);
      }
      
      savedReturn = {
        ...returns[index],
        ...taxReturn,
        updatedAt: now,
        changeLog: [
          ...returns[index].changeLog,
          {
            timestamp: now,
            action: 'updated',
            details: 'Manual tax return updated'
          }
        ]
      } as ManualTaxReturn;
      
      returns[index] = savedReturn;
    } else {
      // Create new
      savedReturn = {
        id: uuidv4(),
        taxType: taxReturn.taxType!,
        period: taxReturn.period || '',
        inputs: taxReturn.inputs || {},
        computed: taxReturn.computed || {},
        manualOverrides: taxReturn.manualOverrides || {},
        files: taxReturn.files || [],
        notes: taxReturn.notes || '',
        status: taxReturn.status || 'draft',
        createdAt: now,
        updatedAt: now,
        changeLog: [
          {
            timestamp: now,
            action: 'created',
            details: `Manual ${taxReturn.taxType} tax return created`
          }
        ]
      };
      
      returns.push(savedReturn);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(returns));
    
    console.log(`💾 [ManualTaxReturns] Saved ${savedReturn.taxType} return:`, {
      event: 'manualTax.save',
      taxType: savedReturn.taxType,
      id: savedReturn.id,
      status: savedReturn.status,
      timestamp: now
    });
    
    return savedReturn;
  }

  /**
   * Finalize a tax return (prevents further editing)
   */
  finalizeReturn(id: string): ManualTaxReturn {
    const returns = this.getAllReturns();
    const index = returns.findIndex(r => r.id === id);
    
    if (index === -1) {
      throw new Error(`Tax return with ID ${id} not found`);
    }
    
    const now = new Date().toISOString();
    returns[index] = {
      ...returns[index],
      status: 'finalized',
      updatedAt: now,
      changeLog: [
        ...returns[index].changeLog,
        {
          timestamp: now,
          action: 'finalized',
          details: 'Tax return finalized - no further edits allowed'
        }
      ]
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(returns));
    
    console.log(`🔒 [ManualTaxReturns] Finalized return:`, {
      event: 'manualTax.finalize',
      taxType: returns[index].taxType,
      id: returns[index].id,
      timestamp: now
    });
    
    return returns[index];
  }

  /**
   * Upload a file for a tax return
   */
  async uploadFile(returnId: string, file: File, caption?: string): Promise<ManualTaxFile> {
    return new Promise((resolve, reject) => {
      // Validate file type
      const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.heic'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        reject(new Error(`File type ${fileExtension} not allowed. Allowed types: ${allowedTypes.join(', ')}`));
        return;
      }
      
      // Validate file size (warn over 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        const confirmUpload = confirm(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 10MB. Continue upload?`);
        if (!confirmUpload) {
          reject(new Error('Upload cancelled by user'));
          return;
        }
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        const fileData: ManualTaxFile = {
          id: uuidv4(),
          name: file.name,
          type: file.type,
          size: file.size,
          storedRef: reader.result as string, // base64 data
          caption: caption || '',
          uploadedAt: new Date().toISOString()
        };
        
        // Add file to tax return
        const returns = this.getAllReturns();
        const returnIndex = returns.findIndex(r => r.id === returnId);
        
        if (returnIndex === -1) {
          reject(new Error(`Tax return with ID ${returnId} not found`));
          return;
        }
        
        returns[returnIndex].files.push(fileData);
        returns[returnIndex].updatedAt = new Date().toISOString();
        returns[returnIndex].changeLog.push({
          timestamp: new Date().toISOString(),
          action: 'file_uploaded',
          details: `Uploaded file: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`
        });
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(returns));
        
        console.log(`📎 [ManualTaxReturns] File uploaded:`, {
          event: 'manualTax.fileUpload',
          returnId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          timestamp: new Date().toISOString()
        });
        
        resolve(fileData);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Remove a file from a tax return
   */
  removeFile(returnId: string, fileId: string): void {
    const returns = this.getAllReturns();
    const returnIndex = returns.findIndex(r => r.id === returnId);
    
    if (returnIndex === -1) {
      throw new Error(`Tax return with ID ${returnId} not found`);
    }
    
    const fileIndex = returns[returnIndex].files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) {
      throw new Error(`File with ID ${fileId} not found`);
    }
    
    const removedFile = returns[returnIndex].files[fileIndex];
    returns[returnIndex].files.splice(fileIndex, 1);
    returns[returnIndex].updatedAt = new Date().toISOString();
    returns[returnIndex].changeLog.push({
      timestamp: new Date().toISOString(),
      action: 'file_removed',
      details: `Removed file: ${removedFile.name}`
    });
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(returns));
    
    console.log(`🗑️ [ManualTaxReturns] File removed:`, {
      event: 'manualTax.fileRemove',
      returnId,
      fileName: removedFile.name,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Download a file
   */
  downloadFile(fileData: ManualTaxFile): void {
    const link = document.createElement('a');
    link.href = fileData.storedRef;
    link.download = fileData.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Normalize numeric input (handle . and , decimals)
   */
  normalizeNumericInput(value: string | number): number {
    if (typeof value === 'number') return Math.round(value * 100) / 100;
    
    const normalized = value.toString().replace(/,/g, '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  }

  /**
   * Calculate IRP6 tax due
   */
  calculateIRP6TaxDue(inputs: Partial<IRP6Inputs>): number {
    const taxableIncome = inputs.taxableIncome || 0;
    const taxRate = (inputs.taxRate || 0) / 100;
    return Math.round((taxableIncome * taxRate) * 100) / 100;
  }

  /**
   * Calculate ITR14 taxable income after adjustments
   */
  calculateITR14TaxableIncome(inputs: Partial<ITR14Inputs>): number {
    const profit = inputs.taxableProfitBeforeAdjustments || 0;
    const totalAdditions = (inputs.additions || []).reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalDeductions = (inputs.deductions || []).reduce((sum, item) => sum + (item.amount || 0), 0);
    return Math.round((profit + totalAdditions - totalDeductions) * 100) / 100;
  }

  /**
   * Calculate DTR01 taxable dividends
   */
  calculateDTR01TaxableDividends(inputs: Partial<DTR01Inputs>): number {
    const gross = inputs.grossDividendsDeclared || 0;
    const exemptions = inputs.exemptions || 0;
    return Math.round((gross - exemptions) * 100) / 100;
  }

  /**
   * Calculate Customs total liability
   */
  calculateCustomsTotalLiability(inputs: Partial<CustomsInputs>): number {
    const lineItems = inputs.lineItems || [];
    return Math.round(lineItems.reduce((sum, item) => sum + (item.totalImportLiability || 0), 0) * 100) / 100;
  }

  /**
   * Delete a tax return
   */
  deleteReturn(id: string): void {
    const returns = this.getAllReturns();
    const filteredReturns = returns.filter(r => r.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredReturns));
    
    console.log(`🗑️ [ManualTaxReturns] Deleted return:`, {
      event: 'manualTax.delete',
      id,
      timestamp: new Date().toISOString()
    });
  }
}

export const manualTaxReturnsService = new ManualTaxReturnsService();
