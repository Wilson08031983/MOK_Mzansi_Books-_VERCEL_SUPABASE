/**
 * Bank Statement Test Tool
 * A debugging component to test and troubleshoot bank statement parsing
 */

import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Eye, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ocrService, { ExtractedTransaction } from '../../services/ocrService';

interface BankStatementTestToolProps {
  className?: string;
}

const BankStatementTestTool: React.FC<BankStatementTestToolProps> = ({ className = '' }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [transactions, setTransactions] = useState<ExtractedTransaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [fallbackMode, setFallbackMode] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractedText('');
      setTransactions([]);
      setProcessingLogs([]);
      setFallbackMode(false);
    }
  };

  const processDocument = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProcessingLogs([]);
    
    // Capture console logs
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const logs: string[] = [];
    
    const captureLog = (level: string, ...args: any[]) => {
      const message = `[${level}] ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`;
      logs.push(message);
      setProcessingLogs([...logs]);
    };
    
    console.log = (...args) => {
      originalLog(...args);
      captureLog('LOG', ...args);
    };
    
    console.warn = (...args) => {
      originalWarn(...args);
      captureLog('WARN', ...args);
    };
    
    console.error = (...args) => {
      originalError(...args);
      captureLog('ERROR', ...args);
    };

    try {
      const result = await ocrService.processDocumentWithFallback(selectedFile);
      
      setExtractedText(result.rawExtractedText);
      setTransactions(result.transactions);
      setFallbackMode(result.fallbackMode);
      
      if (result.fallbackMode) {
        toast.warning('No structured transactions found, but text was extracted successfully.');
      } else {
        toast.success(`Successfully extracted ${result.transactions.length} transactions!`);
      }
      
    } catch (error) {
      console.error('Processing failed:', error);
      toast.error(`Processing failed: ${error.message}`);
    } finally {
      // Restore original console methods
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      setIsProcessing(false);
    }
  };

  const testManualParsing = () => {
    if (!extractedText) {
      toast.error('No extracted text available. Please process a document first.');
      return;
    }

    try {
      const manualTransactions = ocrService.parseTransactions(extractedText, 'manual_test');
      setTransactions(manualTransactions);
      toast.success(`Manual parsing found ${manualTransactions.length} transactions!`);
    } catch (error) {
      toast.error(`Manual parsing failed: ${error.message}`);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Bank Statement Test Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Bank Statement</label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-mokm-blue-50 file:text-mokm-blue-700 hover:file:bg-mokm-blue-100"
            />
          </div>
          
          {selectedFile && (
            <div className="flex gap-2">
              <Button 
                onClick={processDocument} 
                disabled={isProcessing}
                className="bg-mokm-blue-500 hover:bg-mokm-blue-600"
              >
                {isProcessing ? 'Processing...' : 'Process Document'}
              </Button>
              
              {extractedText && (
                <Button 
                  onClick={testManualParsing} 
                  variant="outline"
                  className="border-mokm-green-500 text-mokm-green-700 hover:bg-mokm-green-50"
                >
                  Test Manual Parsing
                </Button>
              )}
            </div>
          )}
          
          {selectedFile && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">{selectedFile.name}</Badge>
              <Badge variant="outline">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Badge>
              <Badge variant="outline">{selectedFile.type}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {(extractedText || transactions.length > 0 || processingLogs.length > 0) && (
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="text">Extracted Text</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="logs">Processing Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {fallbackMode ? (
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  Processing Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant={fallbackMode ? "destructive" : "default"}>
                      {fallbackMode ? 'Fallback Mode' : 'Success'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Transactions Found</p>
                    <p className="text-lg font-bold">{transactions.length}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Text Length</p>
                    <p className="text-lg font-bold">{extractedText.length} chars</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Processing Logs</p>
                    <p className="text-lg font-bold">{processingLogs.length} entries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="text">
            <Card>
              <CardHeader>
                <CardTitle>Extracted Text</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={extractedText}
                  readOnly
                  className="min-h-[400px] font-mono text-xs"
                  placeholder="Extracted text will appear here..."
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Parsed Transactions ({transactions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.map((transaction, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-slate-600">{transaction.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {transaction.type === 'credit' ? '+' : '-'}R{transaction.amount.toFixed(2)}
                            </p>
                            {transaction.balance && (
                              <p className="text-sm text-slate-600">Bal: R{transaction.balance.toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                        <details className="text-xs text-slate-500">
                          <summary className="cursor-pointer">Raw Text</summary>
                          <pre className="mt-1 p-2 bg-slate-100 rounded">{transaction.rawText}</pre>
                        </details>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No transactions found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Processing Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs max-h-[400px] overflow-y-auto">
                  {processingLogs.length > 0 ? (
                    processingLogs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">No logs available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default BankStatementTestTool;