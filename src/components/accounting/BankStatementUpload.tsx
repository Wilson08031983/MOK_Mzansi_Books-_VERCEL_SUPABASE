import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, X, Eye, Edit3 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import ocrService from '../../services/ocrService';
import bankStatementService from '../../services/bankStatementService';

interface BankStatementUploadProps {
  companyId: string;
  onUploadComplete: (statementId: string) => void;
  onClose?: () => void;
}

interface UploadProgress {
  stage: 'uploading' | 'extracting' | 'processing' | 'categorizing' | 'complete' | 'error';
  progress: number;
  message: string;
}

const BankStatementUpload: React.FC<BankStatementUploadProps> = ({
  companyId,
  onUploadComplete,
  onClose
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [showTextPreview, setShowTextPreview] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);

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

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    console.log('BankStatementUpload: Starting file upload for:', file.name, 'Size:', file.size, 'Type:', file.type);
    setError(null);
    setUploadedFile(file);
    
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      console.error('BankStatementUpload: File validation failed:', validationError);
      setError(validationError);
      return;
    }

    try {
      // Stage 1: Uploading
      console.log('BankStatementUpload: Stage 1 - Uploading file');
      setUploadProgress({
        stage: 'uploading',
        progress: 10,
        message: 'Uploading file...'
      });

      await new Promise<void>(resolve => setTimeout(resolve, 500)); // Simulate upload time

      // Stage 2: Processing document with fallback
      console.log('BankStatementUpload: Stage 2 - Processing document with fallback');
      setUploadProgress({
        stage: 'extracting',
        progress: 30,
        message: 'Processing document...'
      });

      const result = await ocrService.processDocumentWithFallback(file);
      console.log('BankStatementUpload: Processing result:', result);
      
      // Store the extracted text for fallback mode
      setExtractedText(result.rawExtractedText);
      
      if (result.fallbackMode) {
        console.log('BankStatementUpload: Fallback mode - no structured transactions found');
        setFallbackMode(true);
        setUploadProgress({
          stage: 'complete',
          progress: 100,
          message: 'Text extracted successfully - No structured transactions found'
        });
        return;
      }

      // Stage 3: Processing transactions
      console.log('BankStatementUpload: Stage 3 - Processing transactions');
      setUploadProgress({
        stage: 'processing',
        progress: 60,
        message: 'Identifying transactions...'
      });

      const transactions = result.transactions;
      const extractedText = result.rawExtractedText;
      console.log('BankStatementUpload: Found transactions:', transactions.length);
      console.log('BankStatementUpload: Transaction details:', transactions);

      const bankInfo = ocrService.extractBankInfo(extractedText);
      console.log('BankStatementUpload: Bank info extracted:', bankInfo);

      // Stage 4: Categorizing expenses
      console.log('BankStatementUpload: Stage 4 - Categorizing expenses');
      setUploadProgress({
        stage: 'categorizing',
        progress: 80,
        message: `Categorizing ${transactions.length} transactions...`
      });

      await new Promise<void>(resolve => setTimeout(resolve, 1000)); // Simulate processing time

      // Save to bank statement service
      console.log('BankStatementUpload: Saving to bank statement service with companyId:', companyId);
      const statementId = await bankStatementService.saveBankStatement(
        {
          id: '',
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          bankName: bankInfo.bankName || 'Unknown Bank',
          accountNumber: bankInfo.accountNumber || 'Unknown Account',
          statementPeriod: bankInfo.statementPeriod || `${transactions[0]?.date || new Date().toISOString().split('T')[0]} to ${transactions[transactions.length - 1]?.date || new Date().toISOString().split('T')[0]}`,
          transactions,
          rawText: extractedText,
          rawExtractedText: extractedText,
          fallbackMode: false,
          fileType: file.type
        },
        file.name,
        companyId,
        transactions
      );
      console.log('BankStatementUpload: Bank statement saved with ID:', statementId);

      // Stage 5: Complete
      setUploadProgress({
        stage: 'complete',
        progress: 100,
        message: `Successfully processed ${transactions.length} transactions`
      });

      // Wait a moment then notify completion
      setTimeout(() => {
        console.log('BankStatementUpload: Calling onUploadComplete with statementId:', statementId);
        onUploadComplete(statementId);
      }, 1500);

    } catch (err) {
      console.error('Error processing bank statement:', err);
      setUploadProgress({
        stage: 'error',
        progress: 0,
        message: err instanceof Error ? err.message : 'An error occurred while processing the file'
      });
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file');
    }
  };

  const resetUpload = () => {
    setUploadProgress(null);
    setError(null);
    setUploadedFile(null);
    setExtractedText('');
    setShowTextPreview(false);
    setFallbackMode(false);
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
      case 'processing':
      case 'categorizing':
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
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload Bank Statement
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
        {!uploadProgress && (
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
              <h3 className="text-lg font-medium mb-2">Upload Bank Statement</h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your bank statement here, or click to browse
              </p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif,.bmp"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button 
                variant="outline" 
                className="cursor-pointer"
                onClick={() => {
                  const input = document.getElementById('file-upload') as HTMLInputElement;
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
              <p className="mt-2">Maximum file size: 10MB</p>
            </div>
          </>
        )}

        {uploadProgress && (
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

            {uploadProgress.stage === 'complete' && !fallbackMode && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Bank statement processed successfully! Transactions have been categorized and added to your expenses.
                </AlertDescription>
              </Alert>
            )}

            {uploadProgress.stage === 'complete' && fallbackMode && (
              <div className="space-y-4">
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    No structured transactions were found, but text was successfully extracted from your document.
                    You can review the extracted text below and manually identify transactions.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Extracted Statement Text</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTextPreview(true)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Full Text
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                      {extractedText.substring(0, 500)}{extractedText.length > 500 ? '...' : ''}
                    </pre>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowTextPreview(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Manual Review
                    </Button>
                    <Button onClick={resetUpload} variant="outline">
                      Upload Different File
                    </Button>
                  </div>
                </div>
              </div>
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

        {error && !uploadProgress && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        </CardContent>
      </Card>

      {/* Text Preview Modal */}
      <Dialog open={showTextPreview} onOpenChange={setShowTextPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Extracted Statement Text</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Review the extracted text below. You can manually identify transaction lines and copy them for manual entry.
              </p>
              <div className="flex gap-2 mb-4">
                <Badge variant="outline">File: {uploadedFile?.name}</Badge>
                <Badge variant="outline">Size: {extractedText.length} characters</Badge>
              </div>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50 h-96 overflow-y-auto">
              <Textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="w-full h-full resize-none border-none bg-transparent font-mono text-xs"
                placeholder="Extracted text will appear here..."
              />
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Look for lines containing dates, descriptions, and amounts. 
                Common patterns include: "MM/DD Description Amount" or "DD-MM-YYYY Description Debit Credit Balance"
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(extractedText);
                // You could add a toast notification here
              }}
            >
              Copy Text
            </Button>
            <Button onClick={() => setShowTextPreview(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BankStatementUpload;