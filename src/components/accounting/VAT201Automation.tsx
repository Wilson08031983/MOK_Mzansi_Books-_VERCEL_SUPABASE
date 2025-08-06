/**
 * VAT 201 Automation Component
 * Provides automated VAT return generation with OCR integration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { 
  Calculator, 
  FileText, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Eye,
  RefreshCw,
  Zap,
  TrendingUp,
  DollarSign
} from 'lucide-react';

import vatCalculationService, { VAT201Return, VATCalculation } from '../../services/vatCalculationService';
import vat201PDFService from '../../services/vat201PDFService';
import ocrVATExtractionService from '../../services/ocrVATExtractionService';

interface VAT201AutomationProps {
  onVATReturnCreated?: (vatReturn: VAT201Return) => void;
}

const VAT201Automation: React.FC<VAT201AutomationProps> = ({ onVATReturnCreated }) => {
  const [vatReturns, setVatReturns] = useState<VAT201Return[]>([]);
  const [selectedReturn, setSelectedReturn] = useState<VAT201Return | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // Form state for new VAT return
  const [newReturnForm, setNewReturnForm] = useState({
    period: '',
    startDate: '',
    endDate: '',
    dueDate: '',
    description: ''
  });

  useEffect(() => {
    loadVATReturns();
  }, []);

  /**
   * Load existing VAT returns
   */
  const loadVATReturns = () => {
    const returns = vatCalculationService.getAllVAT201Returns();
    setVatReturns(returns);
  };

  /**
   * Generate new VAT 201 return
   */
  const handleGenerateVATReturn = async () => {
    if (!newReturnForm.period || !newReturnForm.startDate || !newReturnForm.endDate || !newReturnForm.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Step 1: Process pending OCR extractions (20%)
      setGenerationProgress(20);
      const pendingExtractions = ocrVATExtractionService.getExtractionsForReview();
      // Note: Individual processing would be done here in production

      // Step 2: Calculate VAT (40%)
      setGenerationProgress(40);
      const calculation = vatCalculationService.calculateVATForPeriod(
        newReturnForm.startDate,
        newReturnForm.endDate
      );

      // Step 3: Create VAT return (60%)
      setGenerationProgress(60);
      const vatReturn = vatCalculationService.generateVAT201Return(calculation);
      
      // Update VAT return with form data
      vatReturn.period = newReturnForm.period;
      vatReturn.dueDate = newReturnForm.dueDate;

      // Step 4: Generate PDF (80%)
      setGenerationProgress(80);
      await vat201PDFService.generateVAT201PDF(vatReturn);

      // Step 5: Complete (100%)
      setGenerationProgress(100);

      // Refresh list and notify
      loadVATReturns();
      onVATReturnCreated?.(vatReturn);
      setShowCreateModal(false);
      
      // Reset form
      setNewReturnForm({
        period: '',
        startDate: '',
        endDate: '',
        dueDate: '',
        description: ''
      });

      alert('VAT 201 return generated successfully!');
    } catch (error) {
      console.error('Error generating VAT return:', error);
      alert('Error generating VAT return. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  /**
   * Process OCR for slip uploads
   */
  const handleProcessOCR = async () => {
    setIsProcessingOCR(true);
    setOcrProgress(0);

    try {
      const pendingSlips = ocrVATExtractionService.getExtractionsForReview();
      const totalSlips = pendingSlips.length;

      if (totalSlips === 0) {
        alert('No pending slips to process');
        return;
      }

      for (let i = 0; i < totalSlips; i++) {
        // Update extraction status to completed
        ocrVATExtractionService.updateExtraction(pendingSlips[i].id, { status: 'completed' });
        setOcrProgress(((i + 1) / totalSlips) * 100);
      }

      alert(`Successfully processed ${totalSlips} slip(s)`);
    } catch (error) {
      console.error('Error processing OCR:', error);
      alert('Error processing OCR. Please try again.');
    } finally {
      setIsProcessingOCR(false);
      setOcrProgress(0);
    }
  };

  /**
   * Download VAT return PDF
   */
  const handleDownloadPDF = (vatReturn: VAT201Return) => {
    try {
      vat201PDFService.downloadPDF(vatReturn.id, `VAT201_${vatReturn.period}_${vatReturn.reference}.pdf`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF. Please try again.');
    }
  };

  /**
   * Preview VAT return
   */
  const handlePreviewReturn = (vatReturn: VAT201Return) => {
    setSelectedReturn(vatReturn);
    setShowPreviewModal(true);
  };

  /**
   * Get status badge color
   */
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'submitted': return 'default';
      case 'approved': return 'default';
      case 'overdue': return 'destructive';
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
   * Get suggested period based on current date
   */
  const getSuggestedPeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    return `${year} Q${quarter}`;
  };

  /**
   * Get suggested dates for current quarter
   */
  const getSuggestedDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const quarter = Math.ceil((month + 1) / 3);
    
    const startMonth = (quarter - 1) * 3;
    const endMonth = quarter * 3 - 1;
    
    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, endMonth + 1, 0);
    const dueDate = new Date(year, endMonth + 2, 25); // 25th of month after quarter end
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0]
    };
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">VAT 201 Automation</h2>
          <p className="text-gray-600">Automated VAT return generation with OCR integration</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleProcessOCR}
            disabled={isProcessingOCR}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isProcessingOCR ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Process OCR
          </Button>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Generate VAT Return
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate New VAT 201 Return</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="period">Tax Period *</Label>
                  <Input
                    id="period"
                    placeholder={getSuggestedPeriod()}
                    value={newReturnForm.period}
                    onChange={(e) => setNewReturnForm(prev => ({ ...prev, period: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newReturnForm.startDate}
                      onChange={(e) => setNewReturnForm(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newReturnForm.endDate}
                      onChange={(e) => setNewReturnForm(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newReturnForm.dueDate}
                    onChange={(e) => setNewReturnForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description for this VAT return"
                    value={newReturnForm.description}
                    onChange={(e) => setNewReturnForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                {/* Auto-fill suggestion */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const suggested = getSuggestedDates();
                    setNewReturnForm(prev => ({
                      ...prev,
                      period: getSuggestedPeriod(),
                      ...suggested
                    }));
                  }}
                  className="w-full"
                >
                  Auto-fill Current Quarter
                </Button>
                
                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Generating VAT Return...</span>
                      <span>{generationProgress}%</span>
                    </div>
                    <Progress value={generationProgress} className="w-full" />
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => setShowCreateModal(false)}
                    variant="outline"
                    className="flex-1"
                    disabled={isGenerating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateVATReturn}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* OCR Processing Progress */}
      {isProcessingOCR && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Processing OCR extractions...</span>
                <span>{Math.round(ocrProgress)}%</span>
              </div>
              <Progress value={ocrProgress} className="w-full" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* VAT Returns List */}
      <div className="grid gap-4">
        {vatReturns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calculator className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No VAT Returns Yet</h3>
              <p className="text-gray-600 text-center mb-4">
                Generate your first automated VAT 201 return to get started.
              </p>
              <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Generate First VAT Return
              </Button>
            </CardContent>
          </Card>
        ) : (
          vatReturns.map((vatReturn) => (
            <Card key={vatReturn.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      VAT 201 - {vatReturn.period}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {vatReturn.reference} • Due: {new Date(vatReturn.dueDate).toLocaleDateString('en-ZA')}
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(vatReturn.status)}>
                    {vatReturn.status.charAt(0).toUpperCase() + vatReturn.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">VAT Input (Collected)</p>
                      <p className="font-semibold">{formatCurrency(vatReturn.calculation.outputVAT.total)}</p>
                      <p className="text-xs text-gray-500">Invoices: {formatCurrency(vatReturn.calculation.outputVAT.invoices)} • Sales: {formatCurrency(vatReturn.calculation.outputVAT.sales)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">VAT Output (Paid)</p>
                      <p className="font-semibold">{formatCurrency(vatReturn.calculation.inputVAT.total)}</p>
                      <p className="text-xs text-gray-500">Expenses: {formatCurrency(vatReturn.calculation.inputVAT.expenses)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Net VAT</p>
                      <p className="font-semibold">{formatCurrency(vatReturn.calculation.netVAT)}</p>
                      <p className="text-xs text-gray-500">
                        {vatReturn.calculation.netVAT > 0 ? 'Amount Payable' : vatReturn.calculation.netVAT < 0 ? 'Refund Due' : 'No Amount Due'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {vatReturn.calculation.netVAT !== 0 && (
                  <div className={`p-3 rounded-lg mb-4 ${
                    vatReturn.calculation.netVAT > 0 
                      ? 'bg-red-50 border border-red-200' 
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <p className={`font-semibold ${
                      vatReturn.calculation.netVAT > 0 ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {vatReturn.calculation.netVAT > 0 
                        ? `Amount Payable: ${formatCurrency(vatReturn.calculation.vatPayable)}`
                        : `Refund Due: ${formatCurrency(vatReturn.calculation.vatRefund)}`
                      }
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePreviewReturn(vatReturn)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    onClick={() => handleDownloadPDF(vatReturn)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              VAT 201 Preview - {selectedReturn?.period}
            </DialogTitle>
          </DialogHeader>
          {selectedReturn && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Return Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Period:</strong> {selectedReturn.period}</p>
                    <p><strong>Reference:</strong> {selectedReturn.reference}</p>
                    <p><strong>Due Date:</strong> {new Date(selectedReturn.dueDate).toLocaleDateString('en-ZA')}</p>
                    <p><strong>Status:</strong> {selectedReturn.status}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">VAT Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>VAT Input (Collected):</strong> {formatCurrency(selectedReturn.calculation.outputVAT.total)}</p>
                    <p><strong>VAT Output (Paid):</strong> {formatCurrency(selectedReturn.calculation.inputVAT.total)}</p>
                    <p><strong>Net VAT:</strong> {formatCurrency(selectedReturn.calculation.netVAT)}</p>
                    {selectedReturn.calculation.netVAT > 0 && (
                      <p><strong>Amount Payable:</strong> {formatCurrency(selectedReturn.calculation.vatPayable)}</p>
                    )}
                    {selectedReturn.calculation.netVAT < 0 && (
                      <p><strong>Refund Due:</strong> {formatCurrency(selectedReturn.calculation.vatRefund)}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Detailed Breakdown */}
              <Tabs defaultValue="input" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="input">VAT Input (Collected)</TabsTrigger>
                  <TabsTrigger value="output">VAT Output (Paid)</TabsTrigger>
                </TabsList>
                
                <TabsContent value="input" className="space-y-4">
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        VAT Input - VAT Collected by Business
                      </h5>
                      
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded border">
                          <h6 className="font-medium text-gray-700 mb-2">Paid Invoices</h6>
                          <p className="text-sm text-gray-600">VAT from invoices marked as paid</p>
                          <p className="font-semibold text-lg">{formatCurrency(selectedReturn.calculation.outputVAT.invoices)}</p>
                        </div>
                        
                        <div className="bg-white p-3 rounded border">
                          <h6 className="font-medium text-gray-700 mb-2">Inventory Sales</h6>
                          <p className="text-sm text-gray-600">VAT from all sales transactions</p>
                          <p className="font-semibold text-lg">{formatCurrency(selectedReturn.calculation.outputVAT.sales)}</p>
                        </div>
                        
                        <div className="bg-green-100 p-3 rounded border-2 border-green-300">
                          <h6 className="font-semibold text-green-800">Total VAT Input</h6>
                          <p className="font-bold text-xl text-green-800">{formatCurrency(selectedReturn.calculation.outputVAT.total)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="output" className="space-y-4">
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        VAT Output - VAT Paid by Business
                      </h5>
                      
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded border">
                          <h6 className="font-medium text-gray-700 mb-2">Expense Receipts</h6>
                          <p className="text-sm text-gray-600">VAT from uploaded expense receipts</p>
                          <p className="font-semibold text-lg">{formatCurrency(selectedReturn.calculation.inputVAT.expenses)}</p>
                        </div>
                        
                        <div className="bg-blue-100 p-3 rounded border-2 border-blue-300">
                          <h6 className="font-semibold text-blue-800">Total VAT Output</h6>
                          <p className="font-bold text-xl text-blue-800">{formatCurrency(selectedReturn.calculation.inputVAT.total)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Net VAT Calculation */}
              <div className={`p-4 rounded-lg border-2 ${
                selectedReturn.calculation.netVAT > 0 
                  ? 'bg-red-50 border-red-300' 
                  : selectedReturn.calculation.netVAT < 0
                  ? 'bg-green-50 border-green-300'
                  : 'bg-gray-50 border-gray-300'
              }`}>
                <h5 className="font-semibold mb-2">VAT 201 Calculation</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>VAT Input (Collected):</span>
                    <span className="font-medium">{formatCurrency(selectedReturn.calculation.outputVAT.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT Output (Paid):</span>
                    <span className="font-medium">-{formatCurrency(selectedReturn.calculation.inputVAT.total)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Net VAT:</span>
                    <span className={selectedReturn.calculation.netVAT > 0 ? 'text-red-700' : selectedReturn.calculation.netVAT < 0 ? 'text-green-700' : 'text-gray-700'}>
                      {formatCurrency(selectedReturn.calculation.netVAT)}
                    </span>
                  </div>
                  {selectedReturn.calculation.netVAT > 0 && (
                    <div className="flex justify-between font-bold text-red-700">
                      <span>Amount Payable:</span>
                      <span>{formatCurrency(selectedReturn.calculation.vatPayable)}</span>
                    </div>
                  )}
                  {selectedReturn.calculation.netVAT < 0 && (
                    <div className="flex justify-between font-bold text-green-700">
                      <span>Refund Due:</span>
                      <span>{formatCurrency(selectedReturn.calculation.vatRefund)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VAT201Automation;