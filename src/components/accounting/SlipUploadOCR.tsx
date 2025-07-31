/**
 * Slip Upload OCR Component
 * Handles slip/receipt uploads with OCR VAT extraction
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  Upload, 
  FileImage, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Trash2,
  Zap,
  DollarSign
} from 'lucide-react';

import ocrVATExtractionService, { SlipVATExtraction } from '../../services/ocrVATExtractionService';

interface SlipUploadOCRProps {
  onVATExtracted?: (extraction: SlipVATExtraction) => void;
  expenseId?: string;
  className?: string;
}

const SlipUploadOCR: React.FC<SlipUploadOCRProps> = ({ 
  onVATExtracted, 
  expenseId,
  className = '' 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractions, setExtractions] = useState<SlipVATExtraction[]>([]);
  const [dragActive, setDragActive] = useState(false);

  /**
   * Handle file upload
   */
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Process the slip with OCR
      const extraction = await ocrVATExtractionService.processSlipImage(file, expenseId);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Update local state
      setExtractions(prev => [extraction, ...prev]);
      
      // Notify parent component
      onVATExtracted?.(extraction);
      
      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
      
    } catch (error) {
      console.error('Error processing slip:', error);
      alert('Error processing slip. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handle drag and drop
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, []);

  /**
   * Handle file input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
  };

  /**
   * Delete extraction
   */
  const handleDeleteExtraction = (id: string) => {
    if (confirm('Are you sure you want to delete this extraction?')) {
      ocrVATExtractionService.deleteExtraction(id);
      setExtractions(prev => prev.filter(ext => ext.id !== id));
    }
  };

  /**
   * Get status badge variant
   */
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'failed': return 'destructive';
      case 'manual_review': return 'outline';
      default: return 'secondary';
    }
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  /**
   * Load existing extractions on mount
   */
  React.useEffect(() => {
    const allExtractions = ocrVATExtractionService.getAllExtractions();
    const relevantExtractions = expenseId 
      ? allExtractions.filter(ext => ext.expenseId === expenseId)
      : allExtractions.slice(0, 5); // Show last 5 if no specific expense
    setExtractions(relevantExtractions);
  }, [expenseId]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-colors ${
        dragActive 
          ? 'border-mokm-purple-500 bg-mokm-purple-50' 
          : 'border-gray-300 hover:border-mokm-purple-400'
      }`}>
        <CardContent className="p-6">
          <div
            className="text-center"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <FileImage className="h-full w-full" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Slip/Receipt for OCR
              </h3>
              <p className="text-gray-600">
                Drag and drop an image or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports JPG, PNG • Max 10MB • VAT will be automatically extracted
              </p>
            </div>
            
            <div className="mt-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
                id="slip-upload"
                disabled={isUploading}
              />
              <label htmlFor="slip-upload">
                <Button
                  type="button"
                  disabled={isUploading}
                  className="cursor-pointer"
                  asChild
                >
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    {isUploading ? 'Processing...' : 'Choose File'}
                  </span>
                </Button>
              </label>
            </div>
            
            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing slip with OCR...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Extractions */}
      {extractions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-mokm-purple-500" />
              OCR Extractions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {extractions.map((extraction) => (
                <div
                  key={extraction.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {extraction.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : extraction.status === 'failed' ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-mokm-purple-500 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {extraction.fileName}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-gray-500">
                          {new Date(extraction.uploadDate).toLocaleDateString('en-ZA')}
                        </p>
                        <Badge variant={getStatusBadgeVariant(extraction.status)} className="text-xs">
                          {extraction.status.replace('_', ' ')}
                        </Badge>
                        {extraction.confidence > 0 && (
                          <span className="text-xs text-gray-500">
                            {Math.round(extraction.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {extraction.vatAmount > 0 && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(extraction.vatAmount)}
                        </p>
                        <p className="text-xs text-gray-500">VAT extracted</p>
                      </div>
                    )}
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // TODO: Implement preview modal
                          alert('Preview functionality coming soon');
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteExtraction(extraction.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Summary */}
            {extractions.length > 0 && (
              <div className="mt-4 p-3 bg-mokm-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-mokm-purple-600" />
                    <span className="text-sm font-medium text-mokm-purple-900">
                      Total VAT Extracted
                    </span>
                  </div>
                  <span className="text-sm font-bold text-mokm-purple-900">
                    {formatCurrency(
                      extractions
                        .filter(ext => ext.status === 'completed')
                        .reduce((sum, ext) => sum + ext.vatAmount, 0)
                    )}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Help Text */}
      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          <strong>OCR VAT Extraction:</strong> Upload clear images of receipts or slips. 
          The system will automatically detect and extract VAT amounts for your records. 
          Review extracted amounts before finalizing expenses.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SlipUploadOCR;