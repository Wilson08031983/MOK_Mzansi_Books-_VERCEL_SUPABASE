import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calculator, 
  FileText, 
  Calendar, 
  DollarSign, 
  Receipt, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Building2
} from 'lucide-react';
import { Employee, getAllEmployees } from '@/services/employeeService';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

// Employee Tax Record Interface
interface EmployeeTaxRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  taxNumber: string;
  period: string; // YYYY-MM format
  taxPercentage: number;
  grossSalary: number;
  taxableIncome: number;
  taxAmount: number;
  uifContribution: number;
  allowances: {
    thirteenthMonthBonus: number;
    retirementPlan: number;
    housingAllowance: number;
    motorVehicleAllowance: number;
    medicalAidAllowance: number;
    otherAllowances: number;
    total: number;
  };
  paymentDate: string;
  status: 'calculated' | 'paid' | 'submitted' | 'overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Employee Tax Summary Interface
interface EmployeeTaxSummary {
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  taxNumber: string;
  department: string;
  position: string;
  currentTaxPercentage: number;
  totalTaxPaid: number;
  totalUifContribution: number;
  lastPaymentDate: string;
  status: 'active' | 'inactive';
}

interface EmployeeTaxManagementProps {
  selectedEmployee?: any;
  onEmployeeChange?: (employee: any) => void;
}

const EmployeeTaxManagement: React.FC<EmployeeTaxManagementProps> = ({
  selectedEmployee: propSelectedEmployee,
  onEmployeeChange
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [taxRecords, setTaxRecords] = useState<EmployeeTaxRecord[]>([]);
  const [taxSummaries, setTaxSummaries] = useState<EmployeeTaxSummary[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>(new Date().toISOString().slice(0, 7));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isEditingTaxNumber, setIsEditingTaxNumber] = useState<string | null>(null);
  const [tempTaxNumber, setTempTaxNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'calculate'>('overview');

  // Load data on component mount
  useEffect(() => {
    loadEmployees();
    loadTaxRecords();
  }, []);

  // Update summaries when employees or tax records change
  useEffect(() => {
    generateTaxSummaries();
  }, [employees, taxRecords]);

  // Handle prop changes for selected employee
  useEffect(() => {
    if (propSelectedEmployee && propSelectedEmployee.id) {
      setSelectedEmployee(propSelectedEmployee.id);
      setActiveTab('calculate');
    }
  }, [propSelectedEmployee]);

  // Notify parent when selected employee changes
  useEffect(() => {
    if (selectedEmployee && onEmployeeChange) {
      const employee = employees.find(emp => emp.id === selectedEmployee);
      if (employee) {
        onEmployeeChange(employee);
      }
    }
  }, [selectedEmployee, employees, onEmployeeChange]);

  const loadEmployees = () => {
    const employeeData = getAllEmployees();
    setEmployees(employeeData.filter(emp => emp.status === 'active'));
  };

  const loadTaxRecords = () => {
    const stored = localStorage.getItem('employeeTaxRecords');
    if (stored) {
      setTaxRecords(JSON.parse(stored));
    }
  };

  const saveTaxRecords = (records: EmployeeTaxRecord[]) => {
    localStorage.setItem('employeeTaxRecords', JSON.stringify(records));
    setTaxRecords(records);
  };

  const generateTaxSummaries = () => {
    const summaries: EmployeeTaxSummary[] = employees.map(employee => {
      const employeeRecords = taxRecords.filter(record => record.employeeId === employee.id);
      const totalTaxPaid = employeeRecords.reduce((sum, record) => sum + record.taxAmount, 0);
      const totalUifContribution = employeeRecords.reduce((sum, record) => sum + record.uifContribution, 0);
      const lastRecord = employeeRecords.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];
      
      return {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.surname}`,
        employeeNumber: employee.employeeNumber,
        taxNumber: getTaxNumber(employee.id) || 'Not Set',
        department: employee.department,
        position: employee.position,
        currentTaxPercentage: employee.taxPercentage,
        totalTaxPaid,
        totalUifContribution,
        lastPaymentDate: lastRecord?.paymentDate || 'Never',
        status: employee.status === 'active' ? 'active' : 'inactive'
      };
    });
    
    setTaxSummaries(summaries);
  };

  const getTaxNumber = (employeeId: string): string | null => {
    const stored = localStorage.getItem('employeeTaxNumbers');
    if (stored) {
      const taxNumbers = JSON.parse(stored);
      return taxNumbers[employeeId] || null;
    }
    return null;
  };

  const saveTaxNumber = (employeeId: string, taxNumber: string) => {
    const stored = localStorage.getItem('employeeTaxNumbers');
    const taxNumbers = stored ? JSON.parse(stored) : {};
    taxNumbers[employeeId] = taxNumber;
    localStorage.setItem('employeeTaxNumbers', JSON.stringify(taxNumbers));
    generateTaxSummaries();
  };

  const getEmployeeAllowances = (employeeId: string) => {
    const stored = localStorage.getItem('employeeAllowances');
    if (stored) {
      const allAllowances = JSON.parse(stored);
      const employeeAllowances = allAllowances[employeeId] || {
        thirteenthMonthBonus: 0,
        retirementPlan: 0,
        housingAllowance: 0,
        motorVehicleAllowance: 0,
        medicalAidAllowance: 0,
        otherAllowances: 0
      };
      
      const total = Object.values(employeeAllowances).reduce((sum: number, val: any) => sum + (val || 0), 0);
      return { ...employeeAllowances, total };
    }
    return {
      thirteenthMonthBonus: 0,
      retirementPlan: 0,
      housingAllowance: 0,
      motorVehicleAllowance: 0,
      medicalAidAllowance: 0,
      otherAllowances: 0,
      total: 0
    };
  };

  const calculateEmployeeTax = (employee: Employee, period: string) => {
    const allowances = getEmployeeAllowances(employee.id);
    const grossSalary = employee.salary + allowances.total;
    const taxableIncome = grossSalary; // Simplified - in reality, some allowances may be tax-free
    const taxAmount = taxableIncome * (employee.taxPercentage / 100);
    
    // UIF Calculation (1% employee contribution, capped at R177.12 per month)
    const uifContribution = Math.min(grossSalary * 0.01, 177.12);
    
    const newRecord: EmployeeTaxRecord = {
      id: `TAX-${employee.id}-${period}-${Date.now()}`,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.surname}`,
      employeeNumber: employee.employeeNumber,
      taxNumber: getTaxNumber(employee.id) || '',
      period,
      taxPercentage: employee.taxPercentage,
      grossSalary,
      taxableIncome,
      taxAmount,
      uifContribution,
      allowances,
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'calculated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return newRecord;
  };

  const handleCalculateTax = () => {
    if (!selectedEmployee || !selectedPeriod) {
      toast.error('Please select an employee and period');
      return;
    }
    
    const employee = employees.find(emp => emp.id === selectedEmployee);
    if (!employee) {
      toast.error('Employee not found');
      return;
    }
    
    // Check if record already exists for this period
    const existingRecord = taxRecords.find(
      record => record.employeeId === selectedEmployee && record.period === selectedPeriod
    );
    
    if (existingRecord) {
      toast.error('Tax record already exists for this employee and period');
      return;
    }
    
    setIsLoading(true);
    try {
      const newRecord = calculateEmployeeTax(employee, selectedPeriod);
      const updatedRecords = [...taxRecords, newRecord];
      saveTaxRecords(updatedRecords);
      
      toast.success(`Tax calculated for ${employee.firstName} ${employee.surname} - ${selectedPeriod}`);
      setActiveTab('records');
    } catch (error) {
      console.error('Error calculating tax:', error);
      toast.error('Failed to calculate tax');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTaxStatus = (recordId: string, newStatus: EmployeeTaxRecord['status']) => {
    const updatedRecords = taxRecords.map(record => 
      record.id === recordId 
        ? { ...record, status: newStatus, updatedAt: new Date().toISOString() }
        : record
    );
    saveTaxRecords(updatedRecords);
    toast.success('Tax record status updated');
  };

  const handleSaveTaxNumber = (employeeId: string) => {
    if (tempTaxNumber.trim()) {
      saveTaxNumber(employeeId, tempTaxNumber.trim());
      setIsEditingTaxNumber(null);
      setTempTaxNumber('');
      toast.success('Tax number saved');
    }
  };

  const filteredTaxRecords = taxRecords.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.taxNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'calculated': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const totalTaxLiability = taxRecords
    .filter(record => record.status === 'calculated' || record.status === 'overdue')
    .reduce((sum, record) => sum + record.taxAmount, 0);

  const totalUifLiability = taxRecords
    .filter(record => record.status === 'calculated' || record.status === 'overdue')
    .reduce((sum, record) => sum + record.uifContribution, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Employee Tax Management</h2>
          <p className="text-slate-600">Track and manage employee tax obligations and UIF contributions</p>
        </div>
        <Button 
          onClick={() => setActiveTab('calculate')}
          className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white"
        >
          <Calculator className="h-4 w-4 mr-2" />
          Calculate Tax
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Employees</p>
                <p className="text-2xl font-bold text-slate-900">{employees.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tax Liability</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalTaxLiability)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                <Receipt className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">UIF Liability</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalUifLiability)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Records</p>
                <p className="text-2xl font-bold text-slate-900">{taxRecords.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
        <TabsList className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business p-1 h-auto">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-orange-500 data-[state=active]:via-mokm-pink-500 data-[state=active]:to-mokm-purple-500 data-[state=active]:text-white px-6 py-3"
          >
            Employee Overview
          </TabsTrigger>
          <TabsTrigger 
            value="records" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-orange-500 data-[state=active]:via-mokm-pink-500 data-[state=active]:to-mokm-purple-500 data-[state=active]:text-white px-6 py-3"
          >
            Tax Records
          </TabsTrigger>
          <TabsTrigger 
            value="calculate" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-orange-500 data-[state=active]:via-mokm-pink-500 data-[state=active]:to-mokm-purple-500 data-[state=active]:text-white px-6 py-3"
          >
            Calculate Tax
          </TabsTrigger>
        </TabsList>

        {/* Employee Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee Tax Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Employee #</TableHead>
                      <TableHead>Tax Number</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Tax %</TableHead>
                      <TableHead>Total Tax Paid</TableHead>
                      <TableHead>UIF Contribution</TableHead>
                      <TableHead>Last Payment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxSummaries.map((summary) => (
                      <TableRow key={summary.employeeId}>
                        <TableCell className="font-medium">{summary.employeeName}</TableCell>
                        <TableCell>{summary.employeeNumber}</TableCell>
                        <TableCell>
                          {isEditingTaxNumber === summary.employeeId ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={tempTaxNumber}
                                onChange={(e) => setTempTaxNumber(e.target.value)}
                                placeholder="Enter tax number"
                                className="w-32"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveTaxNumber(summary.employeeId)}
                                className="h-8 w-8 p-0"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setIsEditingTaxNumber(null);
                                  setTempTaxNumber('');
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={summary.taxNumber === 'Not Set' ? 'text-red-500' : ''}>
                                {summary.taxNumber}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setIsEditingTaxNumber(summary.employeeId);
                                  setTempTaxNumber(summary.taxNumber === 'Not Set' ? '' : summary.taxNumber);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{summary.department}</TableCell>
                        <TableCell>{summary.currentTaxPercentage}%</TableCell>
                        <TableCell>{formatCurrency(summary.totalTaxPaid)}</TableCell>
                        <TableCell>{formatCurrency(summary.totalUifContribution)}</TableCell>
                        <TableCell>{summary.lastPaymentDate === 'Never' ? 'Never' : new Date(summary.lastPaymentDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedEmployee(summary.employeeId);
                              setActiveTab('calculate');
                            }}
                            className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white"
                          >
                            Calculate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Records Tab */}
        <TabsContent value="records" className="space-y-6">
          {/* Filters */}
          <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search by employee name, number, or tax number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="calculated">Calculated</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tax Records Table */}
          <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Employee Tax Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Tax Number</TableHead>
                      <TableHead>Gross Salary</TableHead>
                      <TableHead>Tax Amount</TableHead>
                      <TableHead>UIF</TableHead>
                      <TableHead>Allowances</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTaxRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{record.employeeName}</div>
                            <div className="text-sm text-slate-500">{record.employeeNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>{record.period}</TableCell>
                        <TableCell>{record.taxNumber || 'Not Set'}</TableCell>
                        <TableCell>{formatCurrency(record.grossSalary)}</TableCell>
                        <TableCell>{formatCurrency(record.taxAmount)}</TableCell>
                        <TableCell>{formatCurrency(record.uifContribution)}</TableCell>
                        <TableCell>{formatCurrency(record.allowances.total)}</TableCell>
                        <TableCell>{new Date(record.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(record.status)}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={record.status}
                            onValueChange={(value) => handleUpdateTaxStatus(record.id, value as any)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="calculated">Calculated</SelectItem>
                              <SelectItem value="submitted">Submitted</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredTaxRecords.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No tax records found. Start by calculating tax for employees.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calculate Tax Tab */}
        <TabsContent value="calculate" className="space-y-6">
          <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculate Employee Tax
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="employee">Select Employee</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.surname} - {employee.employeeNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="period">Tax Period</Label>
                  <Input
                    id="period"
                    type="month"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  />
                </div>
              </div>
              
              {selectedEmployee && (
                <div className="mt-6">
                  {(() => {
                    const employee = employees.find(emp => emp.id === selectedEmployee);
                    if (!employee) return null;
                    
                    const allowances = getEmployeeAllowances(employee.id);
                    const grossSalary = employee.salary + allowances.total;
                    const taxAmount = grossSalary * (employee.taxPercentage / 100);
                    const uifContribution = Math.min(grossSalary * 0.01, 177.12);
                    
                    return (
                      <Card className="bg-slate-50 border-slate-200">
                        <CardHeader>
                          <CardTitle className="text-lg">Tax Calculation Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Base Salary:</span>
                                <span className="font-medium">{formatCurrency(employee.salary)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Allowances:</span>
                                <span className="font-medium">{formatCurrency(allowances.total)}</span>
                              </div>
                              <div className="flex justify-between border-t pt-2">
                                <span className="font-medium">Gross Salary:</span>
                                <span className="font-bold">{formatCurrency(grossSalary)}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Tax Rate:</span>
                                <span className="font-medium">{employee.taxPercentage}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tax Amount:</span>
                                <span className="font-medium text-red-600">{formatCurrency(taxAmount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>UIF Contribution:</span>
                                <span className="font-medium text-blue-600">{formatCurrency(uifContribution)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </div>
              )}
              
              <div className="flex justify-end">
                <Button
                  onClick={handleCalculateTax}
                  disabled={!selectedEmployee || !selectedPeriod || isLoading}
                  className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white"
                >
                  {isLoading ? 'Calculating...' : 'Calculate & Save Tax Record'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeTaxManagement;