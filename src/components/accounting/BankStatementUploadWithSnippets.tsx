/**
 * Enhanced Bank Statement Upload Component with Snippets
 * Handles bank statement uploads with snippet display and document viewer
 */

import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, AlertCircle, Loader2, X, Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import fileStorageService, { BankStatementFile } from '../../services/fileStorageService';
import FileSnippet from './FileSnippet';
import DocumentViewer from './DocumentViewer';

interface BankStatementUploadWithSnippetsProps {
  companyId: string;
  onUploadComplete?: (statementId: string) => void;
  className?: string;
}

const BankStatementUploadWithSnippets: React.FC<BankStatementUploadWithSnippetsProps> = ({
  companyId,
  onUploadComplete,
  className = ''
}) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState<BankStatementFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [bankName, setBankName] = useState('');
  const [statementPeriod, setStatementPeriod] = useState('');
  const [bankStatements, setBankStatements] = useState<BankStatementFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing bank statements on mount
  useEffect(() => {
    const statements = fileStorageService.getBankStatements();
    setBankStatements(statements);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.startsWith('image/')) {
      toast.error('Please select a PDF or image file');
      return;
    }

    // Validate file size (max 20MB for bank statements)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size must be less than 20MB');
      return;
    }

    setUploadedFile(file);
    
    // Try to extract bank name and period from filename
    const filename = file.name.toLowerCase();
    if (filename.includes('standard')) setBankName('Standard Bank');
    else if (filename.includes('fnb')) setBankName('FNB');
    else if (filename.includes('absa')) setBankName('ABSA');
    else if (filename.includes('nedbank')) setBankName('Nedbank');
    else if (filename.includes('capitec')) setBankName('Capitec');
    
    // Try to extract period from filename
    const monthMatch = filename.match(/(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
    const yearMatch = filename.match(/(20\d{2})/i);
    if (monthMatch && yearMatch) {
      setStatementPeriod(`${monthMatch[0]} ${yearMatch[0]}`);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    
    try {
      // Save to file storage
      const savedStatement = await fileStorageService.saveBankStatement(
        uploadedFile,
        bankName || undefined,
        statementPeriod || undefined
      );
      
      // Update local state
      setBankStatements(prev => [...prev, savedStatement]);
      
      // Call completion callback
      if (onUploadComplete) {
        onUploadComplete(savedStatement.id);
      }
      
      toast.success('Bank statement uploaded successfully!');
      handleCloseUpload();
      
    } catch (error) {
      console.error('Error uploading bank statement:', error);
      toast.error('Failed to upload bank statement. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadClick = () => {
    setIsUploadOpen(true);
    setUploadedFile(null);
    setBankName('');
    setStatementPeriod('');
  };

  const handleDeleteStatement = async (statementId: string) => {
    const success = fileStorageService.deleteBankStatement(statementId);
    if (success) {
      setBankStatements(prev => prev.filter(s => s.id !== statementId));
      toast.success('Bank statement deleted successfully');
    } else {
      toast.error('Failed to delete bank statement');
    }
  };

  const handleViewStatement = (statement: BankStatementFile) => {
    setSelectedStatement(statement);
    setIsViewerOpen(true);
  };

  const handleCloseUpload = () => {
    setIsUploadOpen(false);
    setUploadedFile(null);
    setBankName('');
    setStatementPeriod('');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {/* Upload Button */}
      <Button
        onClick={handleUploadClick}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload Bank Statement
      </Button>
      
      {/* Uploaded Statements Section */}
      {bankStatements.length > 0 && (
        <Card className="mt-4 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Uploaded Bank Statements ({bankStatements.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bankStatements.map((statement) => (
                <FileSnippet
                  key={statement.id}
                  file={statement}
                  type="statement"
                  onView={() => handleViewStatement(statement)}
                  onDelete={() => handleDeleteStatement(statement.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Document Viewer */}
      <DocumentViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        fileData={selectedStatement ? {
          filename: selectedStatement.filename,
          fileType: selectedStatement.fileType,
          base64Data: selectedStatement.base64Data,
          fileSize: selectedStatement.fileSize
        } : null}
      />
      
      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Bank Statement</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!uploadedFile ? (
              <div 
                onClick={triggerFileInput}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-1">Click to select a bank statement</p>
                <p className="text-xs text-gray-500">Supports PDF and image files up to 20MB</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Preview */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Bank Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g., Standard Bank"
                    />
                  </div>
                  <div>
                    <Label htmlFor="statementPeriod">Statement Period</Label>
                    <Input
                      id="statementPeriod"
                      value={statementPeriod}
                      onChange={(e) => setStatementPeriod(e.target.value)}
                      placeholder="e.g., June 2025"
                    />
                  </div>
                </div>
                
                {/* Processing Status */}
                {isProcessing && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Uploading bank statement...</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCloseUpload}>
                Cancel
              </Button>
              {uploadedFile && !isProcessing && (
                <>
                  <Button variant="outline" onClick={triggerFileInput}>
                    <Plus className="h-4 w-4 mr-2" />
                    Select Different File
                  </Button>
                  <Button onClick={handleUpload} className="bg-green-600 hover:bg-green-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Statement
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankStatementUploadWithSnippets;