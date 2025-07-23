import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, FileText, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Income {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'pending' | 'received' | 'overdue';
  paymentMethod: string;
  client?: string;
  project?: string;
  hasInvoice: boolean;
  invoiceNumber?: string;
  dueDate?: string;
  notes?: string;
}

interface IncomeFormData {
  description: string;
  amount: string;
  date: string;
  category: string;
  paymentMethod: string;
  client: string;
  project: string;
  notes: string;
}

interface FormErrors {
  description?: string;
  amount?: string;
  date?: string;
  category?: string;
  paymentMethod?: string;
}

interface EditIncomeModalProps {
  income: Income;
  onClose: () => void;
  onSave: () => void;
}

const EditIncomeModal: React.FC<EditIncomeModalProps> = ({ income, onClose, onSave }) => {
  const [formData, setFormData] = useState<IncomeFormData>({
    description: income.description,
    amount: income.amount.toString(),
    date: income.date,
    category: income.category,
    paymentMethod: income.paymentMethod,
    client: income.client || '',
    project: income.project || '',
    notes: income.notes || ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a valid positive number';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Update income record
      const updatedIncome = {
        ...income,
        date: formData.date,
        description: formData.description,
        amount: Number(formData.amount),
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        client: formData.client || undefined,
        project: formData.project || undefined,
        notes: formData.notes || undefined
      };

      // Get existing income records from localStorage
      const existingIncomes = JSON.parse(localStorage.getItem('incomes') || '[]');
      
      // Update the specific income record
      const updatedIncomes = existingIncomes.map((inc: Income) => 
        inc.id === income.id ? updatedIncome : inc
      );
      
      // Save back to localStorage
      localStorage.setItem('incomes', JSON.stringify(updatedIncomes));

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('income-updated'));

      // Call onSave callback
      onSave();
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Error updating income:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof IncomeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Edit Income Record
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description *
              </label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter income description"
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Amount *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0.00"
                  className={errors.amount ? 'border-red-500' : ''}
                />
                {errors.amount && (
                  <p className="text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && (
                  <p className="text-sm text-red-600">{errors.date}</p>
                )}
              </div>
            </div>

            {/* Category and Payment Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category ? 'border-red-500' : ''
                  }`}
                >
                  <option value="Consulting">Consulting</option>
                  <option value="Product Sales">Product Sales</option>
                  <option value="Service Revenue">Service Revenue</option>
                  <option value="Investment">Investment</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.paymentMethod ? 'border-red-500' : ''
                  }`}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Check">Check</option>
                  <option value="Digital Payment">Digital Payment</option>
                </select>
                {errors.paymentMethod && (
                  <p className="text-sm text-red-600">{errors.paymentMethod}</p>
                )}
              </div>
            </div>

            {/* Client and Project */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client
                </label>
                <Input
                  type="text"
                  value={formData.client}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                  placeholder="Client name (optional)"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Project
                </label>
                <Input
                  type="text"
                  value={formData.project}
                  onChange={(e) => handleInputChange('project', e.target.value)}
                  placeholder="Project name (optional)"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Updating...' : 'Update Income'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditIncomeModal;