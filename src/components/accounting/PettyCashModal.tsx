/**
 * Petty Cash Modal Component
 * Provides a form for recording petty cash transactions
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
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  Upload,
  Save,
  X,
  Receipt,
  Coins,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Project } from '@/types/project';
import { NewExpenseData } from './RecordExpenseModal';

interface PettyCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: NewExpenseData) => void;
  projects?: Project[];
}

const PETTY_CASH_CATEGORIES = [
  'Office Supplies',
  'Refreshments',
  'Postage & Courier',
  'Parking & Transport',
  'Small Equipment',
  'Cleaning Supplies',
  'Emergency Expenses',
  'Miscellaneous',
];

const PettyCashModal: React.FC<PettyCashModalProps> = ({
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
    transactionType: 'slip', // Petty cash is always slip/cash
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
        transactionType: 'slip',
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
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG) or PDF file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setReceiptFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setReceiptPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setReceiptPreview(''); // No preview for PDFs
      }
    }
  };

  /**
   * Remove receipt
   */
  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview('');
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsLoading(true);

    try {
      let receiptBase64 = '';

      // Convert receipt file to base64 if present
      if (receiptFile) {
        const reader = new FileReader();
        receiptBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(receiptFile);
        });
      }

      // Prepare expense data with petty cash prefix
      const expenseData: NewExpenseData = {
        ...formData,
        description: `[Petty Cash] ${formData.description}`,
        receipt: receiptBase64,
      };

      // Save the expense
      await onSave(expenseData);

      toast.success('Petty cash transaction recorded successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving petty cash transaction:', error);
      toast.error('Failed to save petty cash transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-green-600" />
            Record Petty Cash Transaction
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Transaction Details
              </h3>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.date}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., Office coffee supplies"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PETTY_CASH_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (R)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount || ''}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  className={errors.amount ? 'border-red-500' : ''}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.amount}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Assignment */}
          {projects.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium text-sm text-gray-700">Project Assignment (Optional)</h3>
                <div className="space-y-2">
                  <Label htmlFor="project">Assign to Project</Label>
                  <Select
                    value={formData.projectId?.toString() || 'none'}
                    onValueChange={handleProjectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Project</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.code} - {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Receipt Upload */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Receipt (Optional)
              </h3>

              {!receiptFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload receipt (optional)</p>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleReceiptUpload}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <Label
                    htmlFor="receipt-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Choose File
                  </Label>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">{receiptFile.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveReceipt}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {receiptPreview && (
                    <div className="mt-3">
                      <img
                        src={receiptPreview}
                        alt="Receipt preview"
                        className="max-w-full h-32 object-contain rounded border"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium text-sm text-gray-700">Additional Notes (Optional)</h3>
              <Textarea
                placeholder="Add any additional notes about this petty cash transaction..."
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Record Transaction
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PettyCashModal;