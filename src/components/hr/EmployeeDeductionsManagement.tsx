import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Percent,
  Calendar,
  User,
  Filter,
  Download,
  Eye,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { employeeDeductionsService, EmployeeDeduction, DeductionType, DEDUCTION_TYPES } from '@/services/employeeDeductionsService';
import { getAllEmployees, Employee } from '@/services/employeeService';
import { formatCurrency } from '@/lib/utils';

interface EmployeeDeductionsManagementProps {
  onClose?: () => void;
}

const EmployeeDeductionsManagement: React.FC<EmployeeDeductionsManagementProps> = ({ onClose }) => {
  const [deductions, setDeductions] = useState<EmployeeDeduction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState<EmployeeDeduction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state for add/edit deduction
  const [deductionForm, setDeductionForm] = useState({
    employeeId: '',
    deductionType: '' as DeductionType | '',
    amount: '',
    percentage: '',
    isPercentage: false,
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true
  });

  // Load data on component mount
  useEffect(() => {
    loadDeductions();
    loadEmployees();
  }, []);

  const loadDeductions = () => {
    const allDeductions = employeeDeductionsService.getAllDeductions();
    setDeductions(allDeductions);
  };

  const loadEmployees = () => {
    const allEmployees = getAllEmployees();
    setEmployees(allEmployees);
  };

  // Filter deductions based on search and filters
  const filteredDeductions = deductions.filter(deduction => {
    const matchesSearch = deduction.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deduction.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || deduction.deductionType === typeFilter;
    const matchesEmployee = employeeFilter === 'all' || deduction.employeeId === employeeFilter;
    
    return matchesSearch && matchesType && matchesEmployee && deduction.isActive;
  });

  // Handle form submission for adding deduction
  const handleAddDeduction = () => {
    if (!deductionForm.employeeId || !deductionForm.deductionType || !deductionForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!deductionForm.isPercentage && !deductionForm.amount) {
      toast.error('Please enter a deduction amount');
      return;
    }

    if (deductionForm.isPercentage && !deductionForm.percentage) {
      toast.error('Please enter a deduction percentage');
      return;
    }

    const employee = employees.find(emp => emp.id === deductionForm.employeeId);
    if (!employee) {
      toast.error('Employee not found');
      return;
    }

    setIsLoading(true);
    try {
      const newDeduction = employeeDeductionsService.addDeduction({
        employeeId: deductionForm.employeeId,
        employeeName: `${employee.firstName} ${employee.surname}`,
        deductionType: deductionForm.deductionType as DeductionType,
        amount: deductionForm.isPercentage ? 0 : parseFloat(deductionForm.amount),
        percentage: deductionForm.isPercentage ? parseFloat(deductionForm.percentage) : undefined,
        isPercentage: deductionForm.isPercentage,
        description: deductionForm.description,
        isActive: deductionForm.isActive,
        startDate: deductionForm.startDate,
        endDate: deductionForm.endDate || undefined
      });

      setDeductions(prev => [...prev, newDeduction]);
      resetForm();
      setShowAddModal(false);
      toast.success('Deduction added successfully');
    } catch (error) {
      console.error('Error adding deduction:', error);
      toast.error('Failed to add deduction');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission for editing deduction
  const handleEditDeduction = () => {
    if (!selectedDeduction) return;

    if (!deductionForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!deductionForm.isPercentage && !deductionForm.amount) {
      toast.error('Please enter a deduction amount');
      return;
    }

    if (deductionForm.isPercentage && !deductionForm.percentage) {
      toast.error('Please enter a deduction percentage');
      return;
    }

    setIsLoading(true);
    try {
      const success = employeeDeductionsService.updateDeduction(selectedDeduction.id, {
        amount: deductionForm.isPercentage ? 0 : parseFloat(deductionForm.amount),
        percentage: deductionForm.isPercentage ? parseFloat(deductionForm.percentage) : undefined,
        isPercentage: deductionForm.isPercentage,
        description: deductionForm.description,
        startDate: deductionForm.startDate,
        endDate: deductionForm.endDate || undefined,
        isActive: deductionForm.isActive
      });

      if (success) {
        loadDeductions();
        resetForm();
        setShowEditModal(false);
        setSelectedDeduction(null);
        toast.success('Deduction updated successfully');
      } else {
        toast.error('Failed to update deduction');
      }
    } catch (error) {
      console.error('Error updating deduction:', error);
      toast.error('Failed to update deduction');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deduction deletion
  const handleDeleteDeduction = (deduction: EmployeeDeduction) => {
    if (window.confirm(`Are you sure you want to delete this deduction for ${deduction.employeeName}?`)) {
      const success = employeeDeductionsService.deleteDeduction(deduction.id);
      if (success) {
        loadDeductions();
        toast.success('Deduction deleted successfully');
      } else {
        toast.error('Failed to delete deduction');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setDeductionForm({
      employeeId: '',
      deductionType: '' as DeductionType | '',
      amount: '',
      percentage: '',
      isPercentage: false,
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isActive: true
    });
  };

  // Open edit modal
  const openEditModal = (deduction: EmployeeDeduction) => {
    setSelectedDeduction(deduction);
    setDeductionForm({
      employeeId: deduction.employeeId,
      deductionType: deduction.deductionType,
      amount: deduction.amount.toString(),
      percentage: deduction.percentage?.toString() || '',
      isPercentage: deduction.isPercentage,
      description: deduction.description,
      startDate: deduction.startDate.split('T')[0],
      endDate: deduction.endDate?.split('T')[0] || '',
      isActive: deduction.isActive
    });
    setShowEditModal(true);
  };

  // Open view modal
  const openViewModal = (deduction: EmployeeDeduction) => {
    setSelectedDeduction(deduction);
    setShowViewModal(true);
  };

  // Get deduction summary
  const deductionSummary = employeeDeductionsService.getDeductionSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sf-pro">Employee Deductions</h2>
          <p className="text-slate-600 font-sf-pro">Manage employee salary deductions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 hover:from-mokm-purple-600 hover:to-mokm-blue-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Deduction
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Employees with Deductions</p>
                <p className="text-2xl font-bold text-slate-900">{deductionSummary.totalEmployeesWithDeductions}</p>
              </div>
              <User className="h-8 w-8 text-mokm-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Active Deductions</p>
                <p className="text-2xl font-bold text-slate-900">{filteredDeductions.length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-mokm-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Monthly Deduction Amount</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(deductionSummary.totalDeductionAmount)}</p>
              </div>
              <Calendar className="h-8 w-8 text-mokm-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search deductions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {DEDUCTION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.surname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deductions Table */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Active Deductions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Start Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeductions.map((deduction) => {
                  const deductionType = DEDUCTION_TYPES.find(type => type.value === deduction.deductionType);
                  return (
                    <tr key={deduction.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{deduction.employeeName}</p>
                          <p className="text-sm text-slate-500">{deduction.description}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="bg-mokm-purple-50 text-mokm-purple-700 border-mokm-purple-200">
                          {deductionType?.label || deduction.deductionType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {deduction.isPercentage ? (
                            <>
                              <Percent className="h-4 w-4 text-slate-500" />
                              <span className="font-medium">{deduction.percentage}%</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 text-slate-500" />
                              <span className="font-medium">{formatCurrency(deduction.amount)}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-600">
                          {new Date(deduction.startDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={deduction.isActive ? "default" : "secondary"}
                          className={deduction.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {deduction.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewModal(deduction)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(deduction)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDeduction(deduction)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredDeductions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500">No deductions found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Deduction Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Employee Deduction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee">Employee *</Label>
                <Select value={deductionForm.employeeId} onValueChange={(value) => setDeductionForm(prev => ({ ...prev, employeeId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.surname} - {employee.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deductionType">Deduction Type *</Label>
                <Select value={deductionForm.deductionType} onValueChange={(value) => setDeductionForm(prev => ({ ...prev, deductionType: value as DeductionType }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select deduction type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEDUCTION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Enter deduction description"
                value={deductionForm.description}
                onChange={(e) => setDeductionForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPercentage"
                checked={deductionForm.isPercentage}
                onCheckedChange={(checked) => setDeductionForm(prev => ({ ...prev, isPercentage: checked }))}
              />
              <Label htmlFor="isPercentage">Percentage-based deduction</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {deductionForm.isPercentage ? (
                <div>
                  <Label htmlFor="percentage">Percentage *</Label>
                  <Input
                    id="percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Enter percentage"
                    value={deductionForm.percentage}
                    onChange={(e) => setDeductionForm(prev => ({ ...prev, percentage: e.target.value }))}
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                    value={deductionForm.amount}
                    onChange={(e) => setDeductionForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={deductionForm.startDate}
                  onChange={(e) => setDeductionForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={deductionForm.endDate}
                onChange={(e) => setDeductionForm(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddDeduction}
                disabled={isLoading}
                className="bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 hover:from-mokm-purple-600 hover:to-mokm-blue-600 text-white"
              >
                {isLoading ? 'Adding...' : 'Add Deduction'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Deduction Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Employee Deduction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employee</Label>
                <Input value={selectedDeduction?.employeeName || ''} disabled />
              </div>
              <div>
                <Label>Deduction Type</Label>
                <Input value={DEDUCTION_TYPES.find(type => type.value === selectedDeduction?.deductionType)?.label || ''} disabled />
              </div>
            </div>

            <div>
              <Label htmlFor="editDescription">Description *</Label>
              <Textarea
                id="editDescription"
                placeholder="Enter deduction description"
                value={deductionForm.description}
                onChange={(e) => setDeductionForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="editIsPercentage"
                checked={deductionForm.isPercentage}
                onCheckedChange={(checked) => setDeductionForm(prev => ({ ...prev, isPercentage: checked }))}
              />
              <Label htmlFor="editIsPercentage">Percentage-based deduction</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {deductionForm.isPercentage ? (
                <div>
                  <Label htmlFor="editPercentage">Percentage *</Label>
                  <Input
                    id="editPercentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Enter percentage"
                    value={deductionForm.percentage}
                    onChange={(e) => setDeductionForm(prev => ({ ...prev, percentage: e.target.value }))}
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="editAmount">Amount *</Label>
                  <Input
                    id="editAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                    value={deductionForm.amount}
                    onChange={(e) => setDeductionForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="editStartDate">Start Date *</Label>
                <Input
                  id="editStartDate"
                  type="date"
                  value={deductionForm.startDate}
                  onChange={(e) => setDeductionForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="editEndDate">End Date (Optional)</Label>
              <Input
                id="editEndDate"
                type="date"
                value={deductionForm.endDate}
                onChange={(e) => setDeductionForm(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="editIsActive"
                checked={deductionForm.isActive}
                onCheckedChange={(checked) => setDeductionForm(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="editIsActive">Active</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => { setShowEditModal(false); resetForm(); setSelectedDeduction(null); }}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditDeduction}
                disabled={isLoading}
                className="bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 hover:from-mokm-purple-600 hover:to-mokm-blue-600 text-white"
              >
                {isLoading ? 'Updating...' : 'Update Deduction'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Deduction Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Deduction Details</DialogTitle>
          </DialogHeader>
          {selectedDeduction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Employee</Label>
                  <p className="text-slate-900">{selectedDeduction.employeeName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Type</Label>
                  <p className="text-slate-900">{DEDUCTION_TYPES.find(type => type.value === selectedDeduction.deductionType)?.label}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-600">Description</Label>
                <p className="text-slate-900">{selectedDeduction.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Amount</Label>
                  <p className="text-slate-900">
                    {selectedDeduction.isPercentage 
                      ? `${selectedDeduction.percentage}%` 
                      : formatCurrency(selectedDeduction.amount)
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Status</Label>
                  <Badge 
                    variant={selectedDeduction.isActive ? "default" : "secondary"}
                    className={selectedDeduction.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                  >
                    {selectedDeduction.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Start Date</Label>
                  <p className="text-slate-900">{new Date(selectedDeduction.startDate).toLocaleDateString()}</p>
                </div>
                {selectedDeduction.endDate && (
                  <div>
                    <Label className="text-sm font-medium text-slate-600">End Date</Label>
                    <p className="text-slate-900">{new Date(selectedDeduction.endDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Created</Label>
                  <p className="text-slate-900">{new Date(selectedDeduction.createdDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Last Updated</Label>
                  <p className="text-slate-900">{new Date(selectedDeduction.updatedDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeDeductionsManagement;