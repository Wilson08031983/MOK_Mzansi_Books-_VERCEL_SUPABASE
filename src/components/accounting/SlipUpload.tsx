import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, X, Link } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import ocrService from '../../services/ocrService';
import bankStatementService from '../../services/bankStatementService';
import { CategorizedExpense } from '../../services/expenseCategorizationService';

interface SlipUploadProps {
  companyId: string;
  expenseId?: string; // If provided, directly link to this expense
  onUploadComplete: (slipId: string, linkedExpenseId?: string) => void;
  onClose?: () => void;
}

interface UploadProgress {
  stage: 'uploading' | 'extracting' | 'linking' | 'complete' | 'error';
  progress: number;
  message: string;
}

interface ExtractedSlipData {
  amount?: number;
  date?: string;
  description?: string;
  vendor?: string;
}

const SlipUpload: React.FC<SlipUploadProps> = ({
  companyId,
  expenseId,
  onUploadComplete,
  onClose
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedSlipData | null>(null);
  const [availableExpenses, setAvailableExpenses] = useState<CategorizedExpense[]>([]);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string>(expenseId || '');
  const [manualLinking, setManualLinking] = useState(false);

  const acceptedFileTypes = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/tiff': ['.tiff', '.tif'],
    'image/bmp': ['.bmp']
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    // Check file type
    const isValidType = Object.keys(acceptedFileTypes).includes(file.type) ||
      file.name.toLowerCase().match(/\.(pdf|jpg|jpeg|png|tiff|tif|bmp)$/);
    
    if (!isValidType) {
      return 'Please upload a PDF or image file (JPG, PNG, TIFF, BMP)';
    }

    // Check file size (max 5MB for slips)
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const extractSlipData = (text: string): ExtractedSlipData => {
    const data: ExtractedSlipData = {};
    
    // Extract amount
    const amountPattern = /(?:total|amount|sum)\s*:?\s*R?\s*([\d,]+\.\d{2})/gi;
    const amountMatch = text.match(amountPattern);
    if (amountMatch) {
      const amount = parseFloat(amountMatch[0].replace(/[^\d.]/g, ''));
      if (!isNaN(amount)) {
        data.amount = amount;
      }
    }
    
    // Extract date
    const datePattern = /\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})\b/;
    const dateMatch = text.match(datePattern);
    if (dateMatch) {
      data.date = dateMatch[0];
    }
    
    // Extract vendor/description
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      // Usually the vendor name is in the first few lines
      data.vendor = lines[0].trim();
      data.description = lines.slice(0, 3).join(' ').trim();
    }
    
    return data;
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setUploadedFile(file);
    
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      // Stage 1: Uploading
      setUploadProgress({
        stage: 'uploading',
        progress: 20,
        message: 'Uploading slip...'
      });

      await new Promise<void>(resolve => setTimeout(resolve, 300));

      // Stage 2: Extracting text
      setUploadProgress({
        stage: 'extracting',
        progress: 50,
        message: 'Extracting text from slip...'
      });

      const extractedText = await ocrService.extractTextFromFile(file);
      const slipData = extractSlipData(extractedText);
      setExtractedData(slipData);

      // Stage 3: Linking to transaction
      setUploadProgress({
        stage: 'linking',
        progress: 80,
        message: 'Finding matching transaction...'
      });

      // Save the slip first
      const slipId = await bankStatementService.saveExpenseSlip(
        file,
        companyId,
        undefined, // Will link later
        extractedText
      );

      let linkedExpenseId: string | undefined;

      if (expenseId) {
        // Direct linking to provided expense
        linkedExpenseId = expenseId;
        await bankStatementService.updateExpense(expenseId, {
          slipAttached: true,
          slipUrl: await fileToBase64(file)
        });
      } else {
        // Auto-link to best matching transaction
        linkedExpenseId = bankStatementService.linkSlipToTransaction(
          slipId,
          slipData.amount,
          slipData.date,
          slipData.description
        ) || undefined;
        
        if (!linkedExpenseId) {
          // No automatic match found, show manual linking options
          const expenses = bankStatementService.getExpenses(companyId)
            .filter(exp => !exp.slipAttached)
            .slice(0, 10); // Show top 10 recent expenses
          setAvailableExpenses(expenses);
          setManualLinking(true);
        }
      }

      // Stage 4: Complete
      setUploadProgress({
        stage: 'complete',
        progress: 100,
        message: linkedExpenseId ? 'Slip uploaded and linked successfully!' : 'Slip uploaded. Please select a transaction to link.'
      });

      if (linkedExpenseId || manualLinking) {
        setTimeout(() => {
          onUploadComplete(slipId, linkedExpenseId);
        }, 1500);
      }

    } catch (err) {
      console.error('Error uploading slip:', err);
      setUploadProgress({
        stage: 'error',
        progress: 0,
        message: err instanceof Error ? err.message : 'An error occurred while processing the slip'
      });
      setError(err instanceof Error ? err.message : 'An error occurred while processing the slip');
    }
  };

  const handleManualLink = async () => {
    if (!selectedExpenseId || !uploadedFile) return;
    
    try {
      const fileUrl = await fileToBase64(uploadedFile);
      await bankStatementService.updateExpense(selectedExpenseId, {
        slipAttached: true,
        slipUrl: fileUrl
      });
      
      // Update the slip with the linked transaction
      const slips = bankStatementService.getExpenseSlips(companyId);
      const slip = slips.find(s => s.fileName === uploadedFile.name);
      if (slip) {
        // This would need to be implemented in bankStatementService
        console.log('Linking slip to expense:', slip.id, selectedExpenseId);
      }
      
      onUploadComplete(slip?.id || '', selectedExpenseId);
    } catch (err) {
      setError('Failed to link slip to transaction');
    }
  };

  const resetUpload = () => {
    setUploadProgress(null);
    setError(null);
    setUploadedFile(null);
    setExtractedData(null);
    setManualLinking(false);
    setSelectedExpenseId(expenseId || '');
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const getProgressColor = () => {
    if (uploadProgress?.stage === 'error') return 'bg-red-500';
    if (uploadProgress?.stage === 'complete') return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getStageIcon = () => {
    switch (uploadProgress?.stage) {
      case 'uploading':
      case 'extracting':
      case 'linking':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Receipt/Invoice
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadProgress && !manualLinking && (
          <>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Upload Receipt or Invoice</h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your receipt/invoice here, or click to browse
              </p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif,.bmp"
                onChange={handleFileSelect}
                className="hidden"
                id="slip-upload"
              />
              <Button 
                variant="outline" 
                className="cursor-pointer"
                onClick={() => {
                  const input = document.getElementById('slip-upload') as HTMLInputElement;
                  if (input) {
                    input.click();
                  }
                }}
              >
                Choose File
              </Button>
            </div>

            <div className="text-sm text-gray-500">
              <p className="font-medium mb-2">Supported formats:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">PDF</Badge>
                <Badge variant="secondary">JPG/JPEG</Badge>
                <Badge variant="secondary">PNG</Badge>
                <Badge variant="secondary">TIFF</Badge>
                <Badge variant="secondary">BMP</Badge>
              </div>
              <p className="mt-2">Maximum file size: 5MB</p>
            </div>
          </>
        )}

        {uploadProgress && !manualLinking && (
          <div className="space-y-4">
            {uploadedFile && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStageIcon()}
                  <span className="text-sm font-medium">{uploadProgress.message}</span>
                </div>
                <span className="text-sm text-gray-500">{uploadProgress.progress}%</span>
              </div>
              <Progress 
                value={uploadProgress.progress} 
                className="h-2"
              />
            </div>

            {extractedData && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Extracted Information:</h4>
                <div className="text-sm space-y-1">
                  {extractedData.amount && <p>Amount: R{extractedData.amount.toFixed(2)}</p>}
                  {extractedData.date && <p>Date: {extractedData.date}</p>}
                  {extractedData.vendor && <p>Vendor: {extractedData.vendor}</p>}
                </div>
              </div>
            )}

            {uploadProgress.stage === 'complete' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {uploadProgress.message}
                </AlertDescription>
              </Alert>
            )}

            {uploadProgress.stage === 'error' && (
              <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{uploadProgress.message}</AlertDescription>
                </Alert>
                <Button onClick={resetUpload} variant="outline" className="w-full">
                  Try Again
                </Button>
              </div>
            )}
          </div>
        )}

        {manualLinking && (
          <div className="space-y-4">
            <Alert>
              <Link className="h-4 w-4" />
              <AlertDescription>
                No automatic match found. Please select a transaction to link this slip to:
              </AlertDescription>
            </Alert>

            {extractedData && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Slip Information:</h4>
                <div className="text-sm space-y-1">
                  {extractedData.amount && <p>Amount: R{extractedData.amount.toFixed(2)}</p>}
                  {extractedData.date && <p>Date: {extractedData.date}</p>}
                  {extractedData.vendor && <p>Vendor: {extractedData.vendor}</p>}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="expense-select">Select Transaction:</Label>
              <Select value={selectedExpenseId} onValueChange={setSelectedExpenseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a transaction to link" />
                </SelectTrigger>
                <SelectContent>
                  {availableExpenses.map(expense => (
                    <SelectItem key={expense.id} value={expense.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{expense.description}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          R{expense.amount.toFixed(2)} - {expense.date}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleManualLink} 
                disabled={!selectedExpenseId}
                className="flex-1"
              >
                Link to Transaction
              </Button>
              <Button onClick={resetUpload} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {error && !uploadProgress && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SlipUpload;