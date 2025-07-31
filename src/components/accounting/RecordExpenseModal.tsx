/**
 * Record Expense Modal Component
 * Provides a comprehensive form for manually recording both bank and slip transactions
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  Upload,
  Save,
  X,
  Receipt,
  CreditCard,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Project } from '@/types/project';
import SlipUploadOCR from './SlipUploadOCR';

interface RecordExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: NewExpenseData) => void;
  projects?: Project[];
}

export interface NewExpenseData {
  date: string;
  description: string;
  category: string;
  amount: number;
  transactionType: 'bank' | 'slip';
  projectId?: number;
  projectName?: string;
  projectCode?: string;
  status: 'pending' | 'approved' | 'rejected';
  receipt?: string; // base64 encoded image
  notes?: string;
}

const EXPENSE_CATEGORIES = [
  'Transportation',
  'Business Meals',
  'Office Supplies',
  'Marketing & Advertising',
  'Professional Services',
  'Software & Subscriptions',
  'Equipment & Hardware',
  'Travel & Accommodation',
  'Utilities',
  'Insurance',
  'Training & Development',
  'Maintenance & Repairs',
  'Other',
];

const RecordExpenseModal: React.FC<RecordExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projects = [],
}) => {
  const [formData, setFormData] = useState<NewExpenseData>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    amount: 0,
    transactionType: 'bank',
    status: 'pending',
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        amount: 0,
        transactionType: 'bank',
        status: 'pending',
      });
      setReceiptFile(null);
      setReceiptPreview('');
      setErrors({});
    }
  }, [isOpen]);

  /**
   * Handle form field changes
   */
  const handleInputChange = (field: keyof NewExpenseData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Handle project selection
   */
  const handleProjectChange = (projectId: string) => {
    if (projectId === 'none') {
      setFormData(prev => ({
        ...prev,
        projectId: undefined,
        projectName: undefined,
        projectCode: undefined,
      }));
    } else {
      const project = projects.find(p => p.id.toString() === projectId);
      if (project) {
        setFormData(prev => ({
          ...prev,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.code,
        }));
      }
    }
  };

  /**
   * Handle receipt file upload
   */
  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setReceiptFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setReceiptPreview(result);
        setFormData(prev => ({ ...prev, receipt: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Remove receipt
   */
  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview('');
    setFormData(prev => ({ ...prev, receipt: undefined }));
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (formData.transactionType === 'slip' && !formData.receipt) {
      newErrors.receipt = 'Receipt is required for slip transactions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      await onSave(formData);
      toast.success('Expense recorded successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Format amount input
   */
  const formatAmount = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    const amount = parseFloat(numericValue) || 0;
    setFormData(prev => ({ ...prev, amount }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 shadow-2xl">
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle className="text-xl font-semibold text-white font-sf-pro flex items-center gap-2">
            <Receipt className="h-5 w-5 text-mokm-blue-400" />
            Record New Expense
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Date and Transaction Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-slate-200 font-sf-pro">
                Date *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 font-sf-pro ${
                    errors.date ? 'border-red-500' : 'focus:border-mokm-blue-400'
                  }`}
                />
              </div>
              {errors.date && (
                <p className="text-red-400 text-xs font-sf-pro flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.date}
                </p>
              )}
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-200 font-sf-pro">
                Transaction Type *
              </Label>
              <RadioGroup
                value={formData.transactionType}
                onValueChange={(value) => handleInputChange('transactionType', value as 'bank' | 'slip')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bank" id="bank" className="border-slate-500 text-mokm-blue-400" />
                  <Label htmlFor="bank" className="text-slate-200 font-sf-pro flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />
                    Bank Transaction
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="slip" id="slip" className="border-slate-500 text-mokm-blue-400" />
                  <Label htmlFor="slip" className="text-slate-200 font-sf-pro flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Slip Transaction
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-slate-200 font-sf-pro">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Enter expense description..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 font-sf-pro resize-none ${
                errors.description ? 'border-red-500' : 'focus:border-mokm-blue-400'
              }`}
              rows={3}
            />
            {errors.description && (
              <p className="text-red-400 text-xs font-sf-pro flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Category and Amount Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-200 font-sf-pro">
                Category *
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className={`bg-slate-800/50 border-slate-600 text-white font-sf-pro ${
                  errors.category ? 'border-red-500' : 'focus:border-mokm-blue-400'
                }`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category} className="text-white hover:bg-slate-700">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-400 text-xs font-sf-pro flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-slate-200 font-sf-pro">
                Amount (ZAR) *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-sf-pro">
                  R
                </span>
                <Input
                  id="amount"
                  type="text"
                  placeholder="0.00"
                  value={formData.amount > 0 ? formData.amount.toString() : ''}
                  onChange={(e) => formatAmount(e.target.value)}
                  className={`pl-8 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 font-sf-pro ${
                    errors.amount ? 'border-red-500' : 'focus:border-mokm-blue-400'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-red-400 text-xs font-sf-pro flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.amount}
                </p>
              )}
            </div>
          </div>

          {/* Project Assignment */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-200 font-sf-pro">
              Project Assignment (Optional)
            </Label>
            <Select
              value={formData.projectId?.toString() || 'none'}
              onValueChange={handleProjectChange}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white font-sf-pro focus:border-mokm-blue-400">
                <SelectValue placeholder="Assign to project..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="none" className="text-white hover:bg-slate-700">
                  No project assignment
                </SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()} className="text-white hover:bg-slate-700">
                    {project.code} - {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-200 font-sf-pro">
              Status
            </Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white font-sf-pro focus:border-mokm-blue-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="pending" className="text-white hover:bg-slate-700">
                  Pending
                </SelectItem>
                <SelectItem value="approved" className="text-white hover:bg-slate-700">
                  Approved
                </SelectItem>
                <SelectItem value="rejected" className="text-white hover:bg-slate-700">
                  Rejected
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Receipt Upload (for slip transactions) */}
          {formData.transactionType === 'slip' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-200 font-sf-pro">
                {formData.transactionType === 'slip' ? 'Slip Upload with OCR' : 'Receipt Upload'} *
              </Label>
              
              {formData.transactionType === 'slip' ? (
                <SlipUploadOCR
                  onVATExtracted={(extraction) => {
                    // Auto-fill amount if VAT was extracted
                    if (extraction.totalAmount > 0) {
                      setFormData(prev => ({
                        ...prev,
                        amount: extraction.totalAmount
                      }));
                    }
                    toast.success(`VAT extracted: R${extraction.vatAmount.toFixed(2)}`);
                  }}
                  className="bg-slate-800/30 border-slate-600"
                />
              ) : (
                <>
                  {!receiptPreview ? (
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-mokm-blue-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label htmlFor="receipt-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-300 font-sf-pro">Click to upload receipt</p>
                        <p className="text-slate-500 text-xs font-sf-pro mt-1">PNG, JPG up to 5MB</p>
                      </label>
                    </div>
                  ) : (
                    <Card className="bg-slate-800/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-200 font-sf-pro text-sm">Receipt Preview</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeReceipt}
                            className="text-slate-400 hover:text-red-400"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <img
                          src={receiptPreview}
                          alt="Receipt preview"
                          className="max-w-full h-32 object-contain rounded border border-slate-600"
                        />
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
              
              {errors.receipt && (
                <p className="text-red-400 text-xs font-sf-pro flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.receipt}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-slate-200 font-sf-pro">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes or comments..."
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 font-sf-pro resize-none focus:border-mokm-blue-400"
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 font-sf-pro"
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 font-sf-pro"
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordExpenseModal;