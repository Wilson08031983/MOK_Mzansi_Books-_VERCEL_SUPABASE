import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Calendar, FileText, DollarSign, Download, Calculator } from 'lucide-react';
import { BusinessTaxReturn } from './BusinessTaxCard';
import { calculateVAT201, saveVAT201Return, VAT201Data, parsePeriod, getCurrentVATQuarter } from '../../services/vat201Service';
import { generateVAT201PDF } from '../../utils/vat201PdfGenerator';
import { toast } from 'sonner';

interface AddReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (taxReturn: Omit<BusinessTaxReturn, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const AddReturnModal: React.FC<AddReturnModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '' as BusinessTaxReturn['type'],
    status: 'pending' as BusinessTaxReturn['status'],
    dueDate: '',
    amount: '',
    period: '',
    reference: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [vat201Data, setVat201Data] = useState<VAT201Data | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showVATBreakdown, setShowVATBreakdown] = useState(false);

  const taxReturnTypes = [
    {
      value: 'VAT201' as const,
      label: 'VAT 201',
      description: 'Value Added Tax Return - Monthly/Bi-monthly submission'
    },
    {
      value: 'PAYE_EMP201' as const,
      label: 'PAYE/EMP201',
      description: 'Pay As You Earn / Employee Tax Return - Monthly submission'
    },
    {
      value: 'IRP6' as const,
      label: 'Provisional Tax (IRP6)',
      description: 'Provisional Tax Return - Bi-annual submission'
    },
    {
      value: 'ITR14' as const,
      label: 'Company Income Tax (ITR14)',
      description: 'Company Income Tax Return - Annual submission'
    },
    {
      value: 'DTR01' as const,
      label: 'Dividends Tax (DTR01)',
      description: 'Dividends Tax Return - As required'
    },
    {
      value: 'CUSTOMS' as const,
      label: 'Customs & Excise',
      description: 'Customs and Excise duties - As applicable'
    },
    {
      value: 'TURNOVER' as const,
      label: 'Turnover Tax',
      description: 'Turnover Tax for small businesses - Bi-annual'
    }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Return name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Tax return type is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      if (dueDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    if (!formData.period.trim()) {
      newErrors.period = 'Tax period is required';
    }

    if (formData.amount && isNaN(parseFloat(formData.amount))) {
      newErrors.amount = 'Amount must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const selectedType = taxReturnTypes.find(t => t.value === formData.type);
    
    const newTaxReturn: Omit<BusinessTaxReturn, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name.trim(),
      description: formData.description.trim() || selectedType?.description || '',
      type: formData.type,
      status: formData.status,
      dueDate: formData.dueDate,
      amount: formData.amount ? parseFloat(formData.amount) : undefined,
      period: formData.period.trim(),
      reference: formData.reference.trim() || undefined
    };

    onAdd(newTaxReturn);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      type: '' as BusinessTaxReturn['type'],
      status: 'pending',
      dueDate: '',
      amount: '',
      period: '',
      reference: ''
    });
    setErrors({});
    onClose();
  };

  const handleTypeChange = async (value: string) => {
    const selectedType = taxReturnTypes.find(t => t.value === value);
    
    if (value === 'VAT201') {
      // Auto-generate VAT quarter information for VAT 201
      const quarterInfo = getCurrentVATQuarter();
      
      setFormData(prev => ({
        ...prev,
        type: value as BusinessTaxReturn['type'],
        name: `VAT 201 - ${quarterInfo.period}`,
        description: selectedType?.description || '',
        period: quarterInfo.period,
        dueDate: quarterInfo.dueDate
      }));
      
      // Auto-calculate VAT amounts
      setTimeout(async () => {
        await calculateVATAmount();
      }, 100);
      
      toast.success('VAT 201 quarter auto-generated', {
        description: `Period: ${quarterInfo.period}, Due: ${new Date(quarterInfo.dueDate).toLocaleDateString()}`
      });
    } else {
      setFormData(prev => ({
        ...prev,
        type: value as BusinessTaxReturn['type'],
        name: selectedType?.label || '',
        description: selectedType?.description || ''
      }));
    }
  };

  const calculateVATAmount = async () => {
    if (formData.type !== 'VAT201' || !formData.period) return;

    setIsCalculating(true);
    try {
      const { startDate, endDate } = parsePeriod(formData.period);
      const vatData = calculateVAT201(startDate, endDate);
      setVat201Data(vatData);
      setFormData(prev => ({
        ...prev,
        amount: Math.abs(vatData.netVAT).toFixed(2)
      }));
      setShowVATBreakdown(true);
      toast.success('VAT 201 calculated successfully');
    } catch (error) {
      console.error('Error calculating VAT 201:', error);
      toast.error('Failed to calculate VAT 201. Please check your data.');
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto-calculate when period changes for VAT 201
  useEffect(() => {
    if (formData.type === 'VAT201' && formData.period) {
      const timeoutId = setTimeout(() => {
        calculateVATAmount();
      }, 500); // Debounce
      return () => clearTimeout(timeoutId);
    }
  }, [formData.period, formData.type]);

  const handleAddVAT201Return = async () => {
    if (!vat201Data) {
      toast.error('Please calculate VAT 201 first');
      return;
    }

    try {
      // Create tax return object
      const taxReturn: Omit<BusinessTaxReturn, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        dueDate: formData.dueDate,
        amount: parseFloat(formData.amount) || 0,
        period: formData.period,
        reference: formData.reference
      };
      
      // Save VAT 201 return to localStorage
      saveVAT201Return(vat201Data, formData.reference);
      
      // Add to Business Tax Returns
      onAdd(taxReturn);
      
      toast.success('VAT 201 tax return added successfully');
      handleClose();
    } catch (error) {
      console.error('Error adding VAT 201 return:', error);
      toast.error('Failed to add VAT 201 tax return');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass backdrop-blur-xl bg-white/95 border-white/30 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-slate-900 font-sf-pro flex items-center gap-2">
              <Plus className="h-5 w-5 text-mokm-orange-500" />
              Add New Tax Return
            </CardTitle>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tax Return Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium text-slate-700">
                Tax Return Type *
              </Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger className={`border-slate-200 focus:border-mokm-purple-500 ${errors.type ? 'border-red-300' : ''}`}>
                  <SelectValue placeholder="Select tax return type" />
                </SelectTrigger>
                <SelectContent>
                  {taxReturnTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{type.label}</span>
                        <span className="text-xs text-slate-500">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
            </div>

            {/* Return Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                Return Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., VAT 201 - June 2025"
                className={`border-slate-200 focus:border-mokm-purple-500 ${errors.name ? 'border-red-300' : ''}`}
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about this tax return..."
                className="border-slate-200 focus:border-mokm-purple-500 min-h-[80px]"
                rows={3}
              />
            </div>

            {/* Period and Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="period" className="text-sm font-medium text-slate-700">
                  Tax Period *
                </Label>
                <Input
                  id="period"
                  value={formData.period}
                  onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                  placeholder="e.g., June 2025, Q2 2025"
                  className={`border-slate-200 focus:border-mokm-purple-500 ${errors.period ? 'border-red-300' : ''} ${formData.type === 'VAT201' ? 'bg-slate-50' : ''}`}
                  readOnly={formData.type === 'VAT201'}
                />
                {errors.period && <p className="text-red-500 text-xs">{errors.period}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due Date *
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className={`border-slate-200 focus:border-mokm-purple-500 ${errors.dueDate ? 'border-red-300' : ''} ${formData.type === 'VAT201' ? 'bg-slate-50' : ''}`}
                  readOnly={formData.type === 'VAT201'}
                />
                {errors.dueDate && <p className="text-red-500 text-xs">{errors.dueDate}</p>}
              </div>
            </div>

            {/* Amount and Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Amount {formData.type === 'VAT201' ? '(Auto-calculated)' : '(Optional)'}
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    className={`border-slate-200 focus:border-mokm-purple-500 ${errors.amount ? 'border-red-300' : ''} ${formData.type === 'VAT201' ? 'bg-slate-50' : ''}`}
                    readOnly={formData.type === 'VAT201'}
                  />
                  {formData.type === 'VAT201' && isCalculating && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Calculator className="h-4 w-4 animate-spin text-mokm-purple-500" />
                    </div>
                  )}
                </div>
                {errors.amount && <p className="text-red-500 text-xs">{errors.amount}</p>}
                {formData.type === 'VAT201' && vat201Data && (
                  <p className="text-xs text-slate-600">
                    Net VAT {vat201Data.netVAT >= 0 ? 'Payable' : 'Refundable'}: R {Math.abs(vat201Data.netVAT).toFixed(2)}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reference" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Reference (Optional)
                </Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="e.g., VAT-2025-06"
                  className="border-slate-200 focus:border-mokm-purple-500"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-slate-700">
                Initial Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as BusinessTaxReturn['status'] }))}>
                <SelectTrigger className="border-slate-200 focus:border-mokm-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* VAT 201 Automation Info */}
            {formData.type === 'VAT201' && (
              <div className="space-y-3 p-4 bg-gradient-to-r from-mokm-purple-50 to-mokm-orange-50 rounded-lg border border-mokm-purple-200">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-mokm-purple-600" />
                  <h4 className="font-medium text-mokm-purple-900">VAT 201 Automation Active</h4>
                </div>
                <div className="text-sm text-mokm-purple-800 space-y-1">
                  <p>✓ <strong>Tax Period:</strong> Auto-generated based on current South African VAT quarters</p>
                  <p>✓ <strong>Due Date:</strong> Automatically set to 25th of month following quarter end</p>
                  <p>✓ <strong>Input VAT:</strong> Calculated from uploaded expense receipts using OCR extraction</p>
                  <p>✓ <strong>Output VAT:</strong> Calculated from your invoices and sales records</p>
                </div>
              </div>
            )}

            {/* VAT 201 Breakdown */}
            {formData.type === 'VAT201' && showVATBreakdown && vat201Data && (
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">VAT 201 Calculation Breakdown</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVATBreakdown(!showVATBreakdown)}
                    className="text-xs"
                  >
                    {showVATBreakdown ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-slate-700 flex items-center gap-1">
                      Input VAT (Collected)
                      <span className="text-xs text-mokm-purple-600 bg-mokm-purple-50 px-2 py-0.5 rounded-full">From Invoices</span>
                    </p>
                    <p className="text-slate-600">Standard Rate: R {vat201Data.outputVAT.standardRated.toFixed(2)}</p>
                    <p className="text-slate-600">Zero Rate: R {vat201Data.outputVAT.zeroRated.toFixed(2)}</p>
                    <p className="font-medium text-slate-900">Total: R {vat201Data.outputVAT.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 flex items-center gap-1">
                      Output VAT (Paid on Purchases)
                      <span className="text-xs text-mokm-orange-600 bg-mokm-orange-50 px-2 py-0.5 rounded-full">From Receipts</span>
                    </p>
                    <p className="text-slate-600">Standard Rate: R {vat201Data.inputVAT.standardRated.toFixed(2)}</p>
                    <p className="text-slate-600">Capital Goods: R {vat201Data.inputVAT.capitalGoods.toFixed(2)}</p>
                    <p className="font-medium text-slate-900">Total: R {vat201Data.inputVAT.total.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 mt-1">Calculated from uploaded expense receipts</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-300">
                  <p className="font-bold text-lg text-slate-900">
                    Net VAT {vat201Data.netVAT >= 0 ? 'Payable' : 'Refundable'}: R {Math.abs(vat201Data.netVAT).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
              
              {formData.type === 'VAT201' ? (
                <Button
                  type="button"
                  onClick={handleAddVAT201Return}
                  disabled={!vat201Data || isCalculating}
                  className="flex-1 bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tax Return
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white hover:shadow-lg transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tax Return
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddReturnModal;