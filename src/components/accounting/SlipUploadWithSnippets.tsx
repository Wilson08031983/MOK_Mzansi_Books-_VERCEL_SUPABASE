import React, { useState, useEffect } from 'react';
import { Upload, FileText, Eye, Download, Trash2, AlertCircle, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { slipOCRService, ReceiptData } from '../../services/slipOCRService';
import fileStorageService, { ReceiptFile } from '../../services/fileStorageService';
import FileSnippet from './FileSnippet';
import DocumentViewer from './DocumentViewer';

interface SlipUploadWithSnippetsProps {
  expenseId: string;
  debitAmount?: number;
  onUploadComplete?: () => void;
  onStatusChange?: (status: string) => void;
  className?: string;
}

const SlipUploadWithSnippets: React.FC<SlipUploadWithSnippetsProps> = ({
  expenseId,
  debitAmount,
  onUploadComplete,
  onStatusChange,
  className = ''
}) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipts, setReceipts] = useState<ReceiptFile[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptFile | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [ocrResult, setOcrResult] = useState<ReceiptData | null>(null);
  const [replacingReceiptId, setReplacingReceiptId] = useState<string | null>(null);

  // Load existing receipts for this expense
  useEffect(() => {
    loadReceipts();
  }, [expenseId]);

  const loadReceipts = () => {
    const allReceipts = fileStorageService.getExpenseReceipts();
    const expenseReceipts = allReceipts.filter(r => r.expenseId === expenseId);
    setReceipts(expenseReceipts);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type - support both images and PDFs
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid file (JPG, PNG, WEBP, PDF)');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Process with OCR
      const receiptData = await slipOCRService.processSlipUpload(file, expenseId);
      setOcrResult(receiptData);

      // Enhanced amount validation with R1 tolerance using the service method
      if (receiptData.extractedAmount && debitAmount) {
        const isValidMatch = slipOCRService.validateAmountMatch(receiptData.extractedAmount, debitAmount);
        if (!isValidMatch) {
          receiptData.status = 'manual_verification_required';
          receiptData.matchStatus = 'amount_mismatch';
          toast.warning(`Amount mismatch detected. OCR: R${receiptData.extractedAmount.toFixed(2)}, Expected: R${debitAmount.toFixed(2)}`, {
            icon: '⚠️'
          });
        } else {
          receiptData.status = 'completed';
          receiptData.matchStatus = 'verified';
          toast.success('Receipt amount verified successfully!');
        }
      } else if (debitAmount && !receiptData.extractedAmount) {
        // If OCR failed to extract amount, require manual verification
        receiptData.status = 'manual_verification_required';
        receiptData.matchStatus = 'manual_review';
        toast.warning('OCR could not extract amount. Manual verification required.', {
          icon: '⚠️'
        });
      }
      
      // Save receipt data with updated status
      slipOCRService.saveReceiptData(receiptData);

      // If replacing an existing receipt, remove the old one
      if (replacingReceiptId) {
        fileStorageService.deleteExpenseReceipt(expenseId);
        setReplacingReceiptId(null);
      }

      // Save to file storage using the service method
      await fileStorageService.saveExpenseReceipt(expenseId, file, receiptData.receiptText);
      
      // Reload receipts
      loadReceipts();
      
      if (receiptData.status === 'manual_verification_required') {
        toast.success('Receipt uploaded successfully but requires manual verification.');
        onStatusChange?.('manual_verification_required');
      } else {
        toast.success('Receipt uploaded and processed successfully!');
        onStatusChange?.('completed');
      }
      onUploadComplete?.();
      
    } catch (error) {
      console.error('Error processing receipt:', error);
      toast.error('Failed to process receipt. Please try again.');
      onStatusChange?.('failed');
    } finally {
      setIsProcessing(false);
      setShowUploadDialog(false);
      setOcrResult(null);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleViewReceipt = (receipt: ReceiptFile) => {
    setSelectedReceipt(receipt);
    setShowViewer(true);
  };

  const handleReplaceReceipt = (receiptId: string) => {
    setReplacingReceiptId(receiptId);
    setShowUploadDialog(true);
  };

  const handleDownloadReceipt = (receipt: ReceiptFile) => {
    try {
      const link = document.createElement('a');
      link.href = receipt.base64Data;
      link.download = receipt.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  const handleDeleteReceipt = (receipt: ReceiptFile) => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this attachment? This will remove the receipt and clear any extracted VAT or amount data.');
    
    if (!confirmed) return;
    
    try {
      // Delete file from storage
      fileStorageService.deleteExpenseReceipt(receipt.expenseId);
      
      // Clear OCR receipt data from slipOCRService
      slipOCRService.deleteReceiptData(receipt.expenseId);
      
      // Reload receipts
      loadReceipts();
      
      // Notify parent component that receipt was deleted
      // This will trigger revalidation and remove amount mismatch warnings
      onStatusChange?.('missing');
      onUploadComplete?.(); // Trigger refresh of parent component
      
      toast.success('Receipt deleted successfully! Expense marked as "No receipt attached".');
    } catch (error) {
      console.error('Error deleting receipt:', error);
      toast.error('Failed to delete receipt');
    }
  };

  const getStatusIcon = () => {
    if (isProcessing) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    const receiptData = slipOCRService.getReceiptData(expenseId);
    if (receiptData?.status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (receiptData?.status === 'manual_verification_required') {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    if (receiptData?.status === 'failed') {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    return <Upload className="h-4 w-4" />;
  };

  const getButtonText = () => {
    if (isProcessing) {
      return 'Processing...';
    }
    
    const receiptData = slipOCRService.getReceiptData(expenseId);
    if (receiptData?.status === 'completed') {
      return 'Mark as Correct';
    }
    if (receiptData?.status === 'manual_verification_required') {
      return 'Review';
    }
    if (receiptData?.status === 'failed') {
      return 'Upload Failed';
    }
    
    if (receipts.length === 0) {
      return 'Upload Slip';
    }
    return `${receipts.length} Receipt${receipts.length > 1 ? 's' : ''}`;
  };

  return (
    <div className={className}>
      {/* Upload Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowUploadDialog(true)}
        disabled={isProcessing}
        className="w-full"
      >
        {getStatusIcon()}
        <span className="ml-2">{getButtonText()}</span>
      </Button>

      {/* Receipt Snippets */}
      {receipts.length > 0 && (
        <div className="mt-2 space-y-2">
          {receipts.map((receipt) => (
            <FileSnippet
              key={receipt.expenseId}
              file={receipt}
              type="receipt"
              onView={() => handleViewReceipt(receipt)}
              onReplace={() => handleReplaceReceipt(receipt.expenseId)}
              onDownload={() => handleDownloadReceipt(receipt)}
              onDelete={() => handleDeleteReceipt(receipt)}
            />
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {replacingReceiptId ? 'Replace Receipt' : 'Upload Receipt'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                {replacingReceiptId ? 'Select a new receipt to replace the existing one' : 'Upload a receipt or slip for this expense'}
              </p>
              
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="receipt-upload"
                disabled={isProcessing}
              />
              
              <label
                htmlFor="receipt-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </>
                )}
              </label>
              
              <p className="text-xs text-gray-500 mt-2">
                Supported: JPG, PNG, WEBP, PDF (max 10MB)
              </p>
            </div>

            {/* OCR Results */}
            {ocrResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">OCR Results</h4>
                {ocrResult.extractedAmount && (
                  <p className="text-sm text-green-700">
                    Extracted Amount: R{ocrResult.extractedAmount.toFixed(2)}
                  </p>
                )}
                {ocrResult.receiptText && (
                  <p className="text-xs text-green-600 mt-2 max-h-20 overflow-y-auto">
                    {ocrResult.receiptText.substring(0, 200)}...
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Viewer */}
      {selectedReceipt && (
        <DocumentViewer
          isOpen={showViewer}
          onClose={() => {
            setShowViewer(false);
            setSelectedReceipt(null);
          }}
          fileData={{
            filename: selectedReceipt.filename,
            fileType: selectedReceipt.fileType,
            base64Data: selectedReceipt.base64Data,
            fileSize: selectedReceipt.fileSize
          }}
        />
      )}
    </div>
  );
};

export default SlipUploadWithSnippets;