/**
 * Slip Upload with OCR Component
 * Handles slip/receipt uploads with OCR text extraction and amount validation
 */

import React, { useState, useRef } from 'react';
import { Upload, FileCheck, AlertCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { slipOCRService, ReceiptData } from '../../services/slipOCRService';

interface SlipUploadWithOCRProps {
  expenseId: string;
  debitAmount: number;
  onUploadComplete?: (receiptData: ReceiptData) => void;
  className?: string;
}

const SlipUploadWithOCR: React.FC<SlipUploadWithOCRProps> = ({
  expenseId,
  debitAmount,
  onUploadComplete,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<any>(null);
  // Removed validationResult state as it's not part of the ReceiptData interface
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Reset previous results
    setOcrResult(null);
    // Reset validation result removed
  };

  const handleProcessSlip = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Process slip with OCR and validation
      const receiptData = await slipOCRService.processSlipUpload(
        uploadedFile,
        expenseId
      );
      
      setOcrResult({
        extractedAmount: receiptData.extractedAmount,
        confidence: receiptData.confidence
      });
      
      // No validation result property in the interface, so we'll skip this
      // setValidationResult(receiptData.validationResult);
      
      // Show appropriate toast message
      if (receiptData.status === 'completed') {
        toast.success(
          `Receipt processed successfully! Amount R${receiptData.extractedAmount?.toFixed(2)} extracted.`,
          { duration: 5000 }
        );
      } else if (receiptData.status === 'failed') {
        toast.error(
          `Receipt processing failed: ${receiptData.extractedAmount ? 
            `Extracted amount R${receiptData.extractedAmount.toFixed(2)}` : 
            'Could not extract amount from receipt'}`
        );
      }
      
      // Call completion callback
      onUploadComplete?.(receiptData);
      
      // Close dialog after successful processing
      setTimeout(() => {
        setIsOpen(false);
        resetForm();
      }, 2000);
      
    } catch (error) {
      console.error('Slip processing failed:', error);
      toast.error('Failed to process receipt. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setOcrResult(null);
    // Reset validation result removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center justify-center space-x-2 ${className}`}
        >
          <Upload className="h-4 w-4" />
          <span>Upload Slip</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Receipt/Slip with OCR Validation</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Expense Info */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Expense Details</h3>
            <div className="text-sm text-slate-600">
              <div>Expense ID: <span className="font-mono">{expenseId}</span></div>
              <div>Expected Amount: <span className="font-semibold text-mokm-blue-600">R{debitAmount.toFixed(2)}</span></div>
            </div>
          </div>
          
          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Receipt/Slip Image
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-mokm-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="slip-upload"
                />
                <label htmlFor="slip-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">
                    Click to select an image or drag and drop
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports JPG, PNG, WebP (max 10MB)
                  </p>
                </label>
              </div>
            </div>
            
            {/* File Preview */}
            {previewUrl && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-700">Preview</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetForm}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="border rounded-lg p-2 bg-white">
                  <img 
                    src={previewUrl} 
                    alt="Receipt preview" 
                    className="max-w-full max-h-64 mx-auto object-contain"
                  />
                </div>
                <div className="text-xs text-slate-500">
                  File: {uploadedFile?.name} ({(uploadedFile?.size || 0 / 1024 / 1024).toFixed(2)} MB)
                </div>
              </div>
            )}
            
            {/* OCR Results */}
            {ocrResult && (
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <h4 className="text-sm font-medium text-slate-700">OCR Results</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Extracted Amount:</span>
                    <span className="font-semibold">
                      {ocrResult.extractedAmount ? `R${ocrResult.extractedAmount.toFixed(2)}` : 'Not found'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">OCR Confidence:</span>
                    <span className="font-semibold">
                      {ocrResult.confidence ? `${(ocrResult.confidence * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    <span className={`font-semibold flex items-center space-x-1 ${
                      ocrResult ? 'text-mokm-green-600' : 'text-slate-600'
                    }`}>
                      {ocrResult && <FileCheck className="h-4 w-4" />}
                      <span>
                        {ocrResult ? 'Processed' : 'Pending'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleProcessSlip}
              disabled={!uploadedFile || isProcessing}
              className="bg-mokm-blue-600 hover:bg-mokm-blue-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Process Receipt
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SlipUploadWithOCR;