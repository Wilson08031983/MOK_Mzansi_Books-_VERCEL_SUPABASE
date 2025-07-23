import React, { useState } from 'react';
import { X, DollarSign, Calendar, FileText, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface AddIncomeModalProps {
  onClose: () => void;
  onSave: () => void;
}

const INCOME_CATEGORIES = [
  'Consulting',
  'Product Sales',
  'Service Revenue',
  'Subscription',
  'Commission',
  'Interest',
  'Rental Income',
  'Other'
];

const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'PayPal',
  'Stripe',
  'Check',
  'Other'
];

const AddIncomeModal: React.FC<AddIncomeModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<IncomeFormData>({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Consulting',
    paymentMethod: 'Cash',
    client: '',
    project: '',
    notes: ''
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
      // Create income record
      const incomeRecord = {
        id: `income_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: formData.date,
        description: formData.description,
        amount: Number(formData.amount),
        category: formData.category,
        status: 'received' as const,
        paymentMethod: formData.paymentMethod,
        client: formData.client || undefined,
        project: formData.project || undefined,
        hasInvoice: false,
        notes: formData.notes || undefined,
        createdAt: new Date().toISOString()
      };

      // Get existing income records from localStorage
      const existingIncomes = JSON.parse(localStorage.getItem('incomes') || '[]');
      
      // Add new income record
      const updatedIncomes = [incomeRecord, ...existingIncomes];
      
      // Save to localStorage
      localStorage.setItem('incomes', JSON.stringify(updatedIncomes));

      // Show success message
      alert('Income recorded successfully!');
      
      // Call onSave callback
      onSave();
    } catch (error) {
      console.error('Error saving income:', error);
      alert('Error saving income. Please try again.');
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
          <CardTitle className="text-xl font-semibold text-slate-900 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            Record New Income
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Description *
              </label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="e.g., Consulting services for ABC Corp"
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Amount (R) *
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
                <label className="text-sm font-medium text-slate-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
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
                <label className="text-sm font-medium text-slate-700">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent ${errors.category ? 'border-red-500' : ''}`}
                >
                  {INCOME_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent ${errors.paymentMethod ? 'border-red-500' : ''}`}
                >
                  {PAYMENT_METHODS.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
                {errors.paymentMethod && (
                  <p className="text-sm text-red-600">{errors.paymentMethod}</p>
                )}
              </div>
            </div>

            {/* Client and Project */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Client (Optional)
                </label>
                <Input
                  type="text"
                  value={formData.client}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                  placeholder="Client name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Project (Optional)
                </label>
                <Input
                  type="text"
                  value={formData.project}
                  onChange={(e) => handleInputChange('project', e.target.value)}
                  placeholder="Project name"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent resize-none"
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
                className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white hover:shadow-colored-lg transition-all duration-300"
              >
                {isSubmitting ? 'Recording...' : 'Record Income'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddIncomeModal;