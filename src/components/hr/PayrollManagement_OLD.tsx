
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  DollarSign, 
  Calendar, 
  FileText,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Filter,
  User,
  Mail,
  Printer,
  Calculator,
  TrendingUp,
  CreditCard,
  Plus,
  Eye,
  Edit,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { payrollCalculationService, PayrollCalculation, SalaryAdvance } from '@/services/payrollCalculationService';

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  dateProcessed?: string;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  status: 'draft' | 'processed' | 'paid';
  paymentMethod?: string;
  paymentReference?: string;
  emailSent: boolean;
}

const PayrollManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>(new Date().toISOString().slice(0, 7));
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [payrollCalculations, setPayrollCalculations] = useState<PayrollCalculation[]>([]);
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showPayrollDetails, setShowPayrollDetails] = useState(false);
  const [selectedPayrollData, setSelectedPayrollData] = useState<PayrollCalculation | null>(null);
  
  // Salary Advance Form State
  const [advanceForm, setAdvanceForm] = useState({
    employeeId: '',
    amount: '',
    reason: ''
  });
  
  // Current payroll period
  const currentPeriod = new Date().toISOString().slice(0, 7);
  
  // Load data on component mount
  useEffect(() => {
    loadPayrollData();
    loadSalaryAdvances();
  }, [periodFilter]);
  
  const loadPayrollData = () => {
    const calculations = payrollCalculationService.getPayrollCalculations(periodFilter);
    setPayrollCalculations(calculations);
  };
  
  const loadSalaryAdvances = () => {
    const advances = payrollCalculationService.getSalaryAdvances();
    setSalaryAdvances(advances);
  };
  
  // Calculate payroll for all employees
  const handleCalculatePayroll = async () => {
    setIsCalculating(true);
    try {
      const calculations = payrollCalculationService.calculateAllEmployeesPayroll(periodFilter);
      setPayrollCalculations(calculations);
      toast.success(`Payroll calculated for ${calculations.length} employees`);
    } catch (error) {
      console.error('Error calculating payroll:', error);
      toast.error('Failed to calculate payroll');
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Handle salary advance request
  const handleSalaryAdvanceRequest = () => {
    if (!advanceForm.employeeId || !advanceForm.amount || !advanceForm.reason) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const employee = payrollCalculations.find(calc => calc.employeeId === advanceForm.employeeId);
    if (!employee) {
      toast.error('Employee not found');
      return;
    }
    
    try {
      const advance = payrollCalculationService.requestSalaryAdvance(
        advanceForm.employeeId,
        employee.employeeName,
        parseFloat(advanceForm.amount),
        advanceForm.reason
      );
      
      setSalaryAdvances(prev => [...prev, advance]);
      setAdvanceForm({ employeeId: '', amount: '', reason: '' });
      setShowAdvanceModal(false);
      toast.success('Salary advance request submitted successfully');
    } catch (error) {
      console.error('Error requesting salary advance:', error);
      toast.error('Failed to submit salary advance request');
    }
  };
  
  // Approve salary advance
  const handleApproveSalaryAdvance = (advanceId: string) => {
    const success = payrollCalculationService.approveSalaryAdvance(advanceId, 'Admin User');
    if (success) {
      loadSalaryAdvances();
      toast.success('Salary advance approved');
    } else {
      toast.error('Failed to approve salary advance');
    }
  };
  
  // View payroll details
  const handleViewPayrollDetails = (calculation: PayrollCalculation) => {
    setSelectedPayrollData(calculation);
    setShowPayrollDetails(true);
  };
  
  // Filter payroll calculations
  const filteredCalculations = payrollCalculations.filter(calc => {
    const matchesSearch = calc.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || calc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  // Generate payroll summary
  const payrollSummary = payrollCalculationService.generatePayrollSummary(filteredCalculations);
  
  // Sample payroll records (keeping for backward compatibility)
  const [payrollRecords] = useState<PayrollRecord[]>([
    {
      id: 'PAY2025-06-001',
      employeeId: 'EMP001',
      employeeName: 'Sarah Parker',
      period: 'June 2025',
      grossAmount: 25000,
      deductions: 7500,
      netAmount: 17500,
      status: 'draft',
      emailSent: false
    },
    {
      id: 'PAY2025-06-002',
      employeeId: 'EMP002',
      employeeName: 'Michael Johnson',
      period: 'June 2025',
      grossAmount: 30000,
      deductions: 9000,
      netAmount: 21000,
      status: 'draft',
      emailSent: false
    },
    {
      id: 'PAY2025-06-003',
      employeeId: 'EMP003',
      employeeName: 'Lisa Williams',
      period: 'June 2025',
      grossAmount: 28000,
      deductions: 8400,
      netAmount: 19600,
      status: 'draft',
      emailSent: false
    },
    {
      id: 'PAY2025-05-001',
      employeeId: 'EMP001',
      employeeName: 'Sarah Parker',
      period: 'May 2025',
      dateProcessed: '2025-05-25',
      grossAmount: 25000,
      deductions: 7500,
      netAmount: 17500,
      status: 'paid',
      paymentMethod: 'Bank Transfer',
      paymentReference: 'REF123456',
      emailSent: true
    },
    {
      id: 'PAY2025-05-002',
      employeeId: 'EMP002',
      employeeName: 'Michael Johnson',
      period: 'May 2025',
      dateProcessed: '2025-05-25',
      grossAmount: 30000,
      deductions: 9000,
      netAmount: 21000,
      status: 'paid',
      paymentMethod: 'Bank Transfer',
      paymentReference: 'REF123457',
      emailSent: true
    }
  ]);

  // Filter payroll records
  const filteredRecords = payrollRecords.filter(record => {
    const matchesSearch = 
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesPeriod = periodFilter === 'all' || 
      (periodFilter === 'current' && record.period === currentPeriod) ||
      (periodFilter === 'previous' && record.period !== currentPeriod);
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  // Calculate totals
  const totalGross = filteredRecords.reduce((sum, record) => sum + record.grossAmount, 0);
  const totalNet = filteredRecords.reduce((sum, record) => sum + record.netAmount, 0);
  const totalDeductions = filteredRecords.reduce((sum, record) => sum + record.deductions, 0);

  // Function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'processed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Toggle payroll details
  const togglePayrollDetails = (id: string) => {
    if (selectedPayroll === id) {
      setSelectedPayroll(null);
    } else {
      setSelectedPayroll(id);
    }
  };

  // Process all draft payrolls
  const handleProcessPayroll = () => {
    setPayrollRecords(records => 
      records.map(record => 
        record.status === 'draft' && record.period === currentPeriod
          ? { 
              ...record, 
              status: 'processed', 
              dateProcessed: new Date().toISOString().split('T')[0]
            } 
          : record
      )
    );
    setShowPayrollAction(false);
  };
  
  // Mark processed payrolls as paid
  const handleMarkAsPaid = () => {
    setPayrollRecords(records => 
      records.map(record => 
        record.status === 'processed'
          ? { 
              ...record, 
              status: 'paid',
              paymentMethod: 'Bank Transfer',
              paymentReference: `REF${Math.floor(Math.random() * 1000000)}`
            } 
          : record
      )
    );
    setShowPayrollAction(false);
  };
  
  // Send payslips via email
  const handleSendPayslips = () => {
    setPayrollRecords(records => 
      records.map(record => 
        record.status === 'processed' || record.status === 'paid'
          ? { 
              ...record, 
              emailSent: true
            } 
          : record
      )
    );
    setShowPayrollAction(false);
    alert('Payslips sent successfully to all employees!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sf-pro">Payroll Management</h2>
          <p className="text-slate-600 font-sf-pro">Calculate payroll with Time & Attendance integration</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={handleCalculatePayroll}
            disabled={isCalculating}
            className="bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 hover:from-mokm-purple-600 hover:to-mokm-blue-600 font-sf-pro"
          >
            {isCalculating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4 mr-2" />
            )}
            {isCalculating ? 'Calculating...' : 'Calculate Payroll'}
          </Button>
          
          <Dialog open={showAdvanceModal} onOpenChange={setShowAdvanceModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="font-sf-pro">
                <CreditCard className="h-4 w-4 mr-2" />
                Salary Advance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Request Salary Advance</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Employee</label>
                  <Select value={advanceForm.employeeId} onValueChange={(value) => setAdvanceForm(prev => ({ ...prev, employeeId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {payrollCalculations.map(calc => (
                        <SelectItem key={calc.employeeId} value={calc.employeeId}>
                          {calc.employeeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (R)</label>
                  <Input
                    type="number"
                    value={advanceForm.amount}
                    onChange={(e) => setAdvanceForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter amount"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Reason</label>
                  <Textarea
                    value={advanceForm.reason}
                    onChange={(e) => setAdvanceForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Reason for salary advance"
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowAdvanceModal(false)}>Cancel</Button>
                  <Button onClick={handleSalaryAdvanceRequest}>Submit Request</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Payroll Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Total Employees</p>
                <p className="text-2xl font-bold text-slate-900 font-sf-pro">{payrollSummary.totalEmployees}</p>
              </div>
              <User className="h-8 w-8 text-mokm-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Gross Payroll</p>
                <p className="text-2xl font-bold text-green-600 font-sf-pro">R {payrollSummary.totalGrossSalary.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600 font-sf-pro">R {payrollSummary.totalDeductions.toLocaleString()}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Net Payroll</p>
                <p className="text-2xl font-bold text-mokm-purple-600 font-sf-pro">R {payrollSummary.totalNetSalary.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-mokm-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Hours Summary */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="font-sf-pro flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time & Attendance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900 font-sf-pro">{payrollSummary.totalRegularHours.toFixed(1)}</p>
              <p className="text-sm text-slate-600 font-sf-pro">Regular Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600 font-sf-pro">{payrollSummary.totalOvertimeHours.toFixed(1)}</p>
              <p className="text-sm text-slate-600 font-sf-pro">Overtime Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 font-sf-pro">{payrollSummary.totalNightShiftHours.toFixed(1)}</p>
              <p className="text-sm text-slate-600 font-sf-pro">Night Shift Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 font-sf-pro">{payrollSummary.totalLeaveHours.toFixed(1)}</p>
              <p className="text-sm text-slate-600 font-sf-pro">Leave Hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 font-sf-pro"
            />
          </div>
          
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={new Date().toISOString().slice(0, 7)}>Current Month</SelectItem>
              <SelectItem value={new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)}>Last Month</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="calculated">Calculated</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Employee Payroll Table */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="font-sf-pro">Employee Payroll Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Employee</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Base Salary</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Hours</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Attendance Pay</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Allowances</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Gross Salary</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Deductions</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Net Salary</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalculations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-500 font-sf-pro">
                      {payrollCalculations.length === 0 
                        ? "No payroll calculated yet. Click 'Calculate Payroll' to begin."
                        : "No employees match your search criteria."
                      }
                    </td>
                  </tr>
                ) : (
                  filteredCalculations.map((calculation) => (
                    <tr key={calculation.employeeId} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900 font-sf-pro">{calculation.employeeName}</p>
                          <p className="text-sm text-slate-500 font-sf-pro">{calculation.employeeId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sf-pro">R {calculation.baseSalary.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-sf-pro">
                          <div>Regular: {calculation.regularHours.toFixed(1)}h</div>
                          <div className="text-orange-600">OT: {calculation.overtimeHours.toFixed(1)}h</div>
                          <div className="text-purple-600">Night: {calculation.nightShiftHours.toFixed(1)}h</div>
                          <div className="text-blue-600">Leave: {calculation.leaveHours.toFixed(1)}h</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sf-pro">R {calculation.attendancePay.toLocaleString()}</td>
                      <td className="py-3 px-4 font-sf-pro">R {calculation.allowances.totalAllowances.toLocaleString()}</td>
                      <td className="py-3 px-4 font-sf-pro font-semibold text-green-600">R {calculation.grossSalary.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-sf-pro">
                          <div className="text-red-600">Tax: R {calculation.deductions.tax.toLocaleString()}</div>
                          <div className="text-red-600">UIF: R {calculation.deductions.uif.toLocaleString()}</div>
                          {calculation.deductions.salaryAdvance > 0 && (
                            <div className="text-orange-600">Advance: R {calculation.deductions.salaryAdvance.toLocaleString()}</div>
                          )}
                          <div className="font-medium">Total: R {calculation.deductions.totalDeductions.toLocaleString()}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sf-pro font-semibold text-mokm-purple-600">R {calculation.netSalary.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewPayrollDetails(calculation)}
                            className="font-sf-pro"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Badge 
                            variant={calculation.status === 'paid' ? 'default' : 'secondary'}
                            className="font-sf-pro"
                          >
                            {calculation.status}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Salary Advances Management */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="font-sf-pro flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Salary Advances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Employee</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Amount</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Request Date</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Deduction Period</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Reason</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {salaryAdvances.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500 font-sf-pro">
                      No salary advance requests found.
                    </td>
                  </tr>
                ) : (
                  salaryAdvances.map((advance) => (
                    <tr key={advance.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-sf-pro font-medium">{advance.employeeName}</td>
                      <td className="py-3 px-4 font-sf-pro font-semibold text-green-600">R {advance.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 font-sf-pro">{new Date(advance.requestDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-sf-pro">{advance.deductionPeriod}</td>
                      <td className="py-3 px-4 font-sf-pro">{advance.reason}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={advance.status === 'approved' ? 'default' : advance.status === 'pending' ? 'secondary' : 'destructive'}
                          className="font-sf-pro"
                        >
                          {advance.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {advance.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleApproveSalaryAdvance(advance.id)}
                            className="font-sf-pro"
                          >
                            Approve
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Payroll Details Modal */}
      <Dialog open={showPayrollDetails} onOpenChange={setShowPayrollDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payroll Details - {selectedPayrollData?.employeeName}</DialogTitle>
          </DialogHeader>
          {selectedPayrollData && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Employee Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedPayrollData.employeeName}</div>
                    <div><span className="font-medium">Employee ID:</span> {selectedPayrollData.employeeId}</div>
                    <div><span className="font-medium">Period:</span> {selectedPayrollData.period}</div>
                    <div><span className="font-medium">Base Salary:</span> R {selectedPayrollData.baseSalary.toLocaleString()}</div>
                    <div><span className="font-medium">Hourly Rate:</span> R {selectedPayrollData.hourlyRate.toFixed(2)}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Hours Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Regular Hours:</span> {selectedPayrollData.regularHours.toFixed(2)} (R {selectedPayrollData.regularPay.toLocaleString()})</div>
                    <div><span className="font-medium text-orange-600">Overtime Hours:</span> {selectedPayrollData.overtimeHours.toFixed(2)} (R {selectedPayrollData.overtimePay.toLocaleString()})</div>
                    <div><span className="font-medium text-purple-600">Night Shift Hours:</span> {selectedPayrollData.nightShiftHours.toFixed(2)} (R {selectedPayrollData.nightShiftPay.toLocaleString()})</div>
                    <div><span className="font-medium text-blue-600">Leave Hours:</span> {selectedPayrollData.leaveHours.toFixed(2)} (R {selectedPayrollData.leavePay.toLocaleString()})</div>
                    <div className="border-t pt-2"><span className="font-medium">Total Attendance Pay:</span> R {selectedPayrollData.attendancePay.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              
              {/* Allowances */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Allowances</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">13th Month Bonus:</span> R {selectedPayrollData.allowances.thirteenthMonthBonus.toLocaleString()}</div>
                  <div><span className="font-medium">Housing Allowance:</span> R {selectedPayrollData.allowances.housingAllowance.toLocaleString()}</div>
                  <div><span className="font-medium">Medical Aid Allowance:</span> R {selectedPayrollData.allowances.medicalAidAllowance.toLocaleString()}</div>
                  <div><span className="font-medium">Motor Vehicle Allowance:</span> R {selectedPayrollData.allowances.motorVehicleAllowance.toLocaleString()}</div>
                  <div><span className="font-medium">Retirement Plan:</span> R {selectedPayrollData.allowances.retirementPlan.toLocaleString()}</div>
                  <div><span className="font-medium">Other Allowances:</span> R {selectedPayrollData.allowances.otherAllowances.toLocaleString()}</div>
                  <div className="col-span-2 border-t pt-2"><span className="font-medium">Total Allowances:</span> R {selectedPayrollData.allowances.totalAllowances.toLocaleString()}</div>
                </div>
              </div>
              
              {/* Deductions */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Deductions</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium text-red-600">Tax (PAYE):</span> R {selectedPayrollData.deductions.tax.toLocaleString()}</div>
                  <div><span className="font-medium text-red-600">UIF:</span> R {selectedPayrollData.deductions.uif.toLocaleString()}</div>
                  <div><span className="font-medium text-red-600">Medical Aid:</span> R {selectedPayrollData.deductions.medicalAid.toLocaleString()}</div>
                  <div><span className="font-medium text-red-600">Retirement Fund:</span> R {selectedPayrollData.deductions.retirementFund.toLocaleString()}</div>
                  {selectedPayrollData.deductions.salaryAdvance > 0 && (
                    <div><span className="font-medium text-orange-600">Salary Advance:</span> R {selectedPayrollData.deductions.salaryAdvance.toLocaleString()}</div>
                  )}
                  <div><span className="font-medium text-red-600">Other Deductions:</span> R {selectedPayrollData.deductions.otherDeductions.toLocaleString()}</div>
                  <div className="col-span-2 border-t pt-2"><span className="font-medium">Total Deductions:</span> R {selectedPayrollData.deductions.totalDeductions.toLocaleString()}</div>
                </div>
              </div>
              
              {/* Summary */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Salary Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Base Salary + Attendance Pay:</span><span>R {(selectedPayrollData.baseSalary + selectedPayrollData.attendancePay).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Total Allowances:</span><span className="text-green-600">+ R {selectedPayrollData.allowances.totalAllowances.toLocaleString()}</span></div>
                  <div className="flex justify-between font-medium border-t pt-2"><span>Gross Salary:</span><span className="text-green-600">R {selectedPayrollData.grossSalary.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Total Deductions:</span><span className="text-red-600">- R {selectedPayrollData.deductions.totalDeductions.toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Net Salary:</span><span className="text-mokm-purple-600">R {selectedPayrollData.netSalary.toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayrollManagement;
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Current Period</p>
                <p className="text-3xl font-bold text-slate-900 font-sf-pro">{currentPeriod}</p>
                <p className="text-xs text-slate-500 font-sf-pro mt-1">Payment scheduled for 25th</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Total Gross</p>
                <p className="text-3xl font-bold text-slate-900 font-sf-pro">R{totalGross.toLocaleString()}</p>
                <p className="text-xs text-slate-500 font-sf-pro mt-1">
                  Net: R{totalNet.toLocaleString()} • Deductions: R{totalDeductions.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-green-500 to-mokm-blue-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Status</p>
                <p className="text-3xl font-bold text-slate-900 font-sf-pro">
                  {filteredRecords.filter(r => r.period === currentPeriod && r.status === 'draft').length > 0 ? 'Pending' : 'Processed'}
                </p>
                <p className="text-xs text-slate-500 font-sf-pro mt-1">
                  {filteredRecords.filter(r => r.period === currentPeriod && r.status === 'draft').length > 0 ? 
                    'Payroll not yet processed' : 
                    'All payslips generated'
                  }
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-yellow-500 to-mokm-orange-500">
                {filteredRecords.filter(r => r.period === currentPeriod && r.status === 'draft').length > 0 ? (
                  <Clock className="h-6 w-6 text-white" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search payroll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              >
                <option value="all">All Periods</option>
                <option value="current">Current Period</option>
                <option value="previous">Previous Periods</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="processed">Processed</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Payroll Records */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <div className="overflow-x-auto">
          {filteredRecords.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-6 text-left text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    Employee
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    Period
                  </th>
                  <th className="py-4 px-6 text-right text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    Gross
                  </th>
                  <th className="py-4 px-6 text-right text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    Deductions
                  </th>
                  <th className="py-4 px-6 text-right text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    Net
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    Status
                  </th>
                  <th className="py-4 px-6 text-right text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredRecords.map(record => (
                  <React.Fragment key={record.id}>
                    <tr 
                      className={`hover:bg-white/30 cursor-pointer transition-colors duration-200 ${selectedPayroll === record.id ? 'bg-white/30' : ''}`}
                      onClick={() => togglePayrollDetails(record.id)}
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-slate-900 font-sf-pro">{record.employeeName}</div>
                            <div className="text-xs text-slate-500 font-sf-pro">{record.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-slate-900 font-sf-pro">{record.period}</div>
                        {record.dateProcessed && (
                          <div className="text-xs text-slate-500 font-sf-pro">Processed: {record.dateProcessed}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right text-sm font-sf-pro">
                        <div className="font-medium text-slate-900">R{record.grossAmount.toLocaleString()}</div>
                      </td>
                      <td className="py-4 px-6 text-right text-sm font-sf-pro">
                        <div className="text-red-600">R{record.deductions.toLocaleString()}</div>
                      </td>
                      <td className="py-4 px-6 text-right text-sm font-sf-pro">
                        <div className="font-medium text-green-600">R{record.netAmount.toLocaleString()}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 text-xs rounded-full font-sf-pro ${getStatusBadgeColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {record.status !== 'draft' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`Downloading payslip for ${record.employeeName}`);
                              }}
                              className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          <button className="text-slate-400 hover:text-slate-600 transition-colors">
                            {selectedPayroll === record.id ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {selectedPayroll === record.id && (
                      <tr>
                        <td colSpan={7} className="p-0">
                          <div className="bg-white/70 backdrop-blur-sm p-6 border-t border-b border-white/20">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-sm font-medium text-slate-700 mb-3 font-sf-pro">Payroll Details</h4>
                                <div className="glass backdrop-blur-sm bg-white/50 p-4 rounded-xl border border-white/20 text-sm font-sf-pro">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="text-slate-500">Reference:</div>
                                    <div className="text-slate-900">{record.id}</div>
                                    
                                    <div className="text-slate-500">Period:</div>
                                    <div className="text-slate-900">{record.period}</div>
                                    
                                    {record.dateProcessed && (
                                      <>
                                        <div className="text-slate-500">Date Processed:</div>
                                        <div className="text-slate-900">{record.dateProcessed}</div>
                                      </>
                                    )}
                                    
                                    {record.paymentMethod && (
                                      <>
                                        <div className="text-slate-500">Payment Method:</div>
                                        <div className="text-slate-900">{record.paymentMethod}</div>
                                      </>
                                    )}
                                    
                                    {record.paymentReference && (
                                      <>
                                        <div className="text-slate-500">Reference:</div>
                                        <div className="text-slate-900">{record.paymentReference}</div>
                                      </>
                                    )}
                                    
                                    <div className="text-slate-500">Email Sent:</div>
                                    <div>
                                      {record.emailSent ? (
                                        <span className="text-green-600 flex items-center">
                                          <CheckCircle2 className="h-4 w-4 mr-1" /> Yes
                                        </span>
                                      ) : (
                                        <span className="text-red-600 flex items-center">
                                          <AlertCircle className="h-4 w-4 mr-1" /> No
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="mt-4 pt-4 border-t border-white/20">
                                    <div className="flex justify-between items-center">
                                      <div className="text-slate-700">Basic Salary:</div>
                                      <div className="text-slate-900">R{record.grossAmount.toLocaleString()}</div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                      <div className="text-slate-700">Tax:</div>
                                      <div className="text-red-600">-R{(record.deductions * 0.7).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                      <div className="text-slate-700">Benefits:</div>
                                      <div className="text-red-600">-R{(record.deductions * 0.3).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/20 font-medium">
                                      <div className="text-slate-900">Net Salary:</div>
                                      <div className="text-green-600">R{record.netAmount.toLocaleString()}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-slate-700 mb-3 font-sf-pro">Actions</h4>
                                <div className="space-y-3">
                                  {record.status === 'draft' && (
                                    <Button 
                                      onClick={() => {
                                        setPayrollRecords(records => 
                                          records.map(r => 
                                            r.id === record.id 
                                              ? { 
                                                  ...r, 
                                                  status: 'processed', 
                                                  dateProcessed: new Date().toISOString().split('T')[0]
                                                } 
                                              : r
                                          )
                                        );
                                      }}
                                      className="w-full bg-gradient-to-r from-mokm-green-500 to-mokm-blue-500 hover:from-mokm-green-600 hover:to-mokm-blue-600 font-sf-pro"
                                    >
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Process Payslip
                                    </Button>
                                  )}
                                  
                                  {record.status === 'processed' && (
                                    <Button 
                                      onClick={() => {
                                        setPayrollRecords(records => 
                                          records.map(r => 
                                            r.id === record.id 
                                              ? { 
                                                  ...r, 
                                                  status: 'paid',
                                                  paymentMethod: 'Bank Transfer',
                                                  paymentReference: `REF${Math.floor(Math.random() * 1000000)}`
                                                } 
                                              : r
                                          )
                                        );
                                      }}
                                      className="w-full bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 font-sf-pro"
                                    >
                                      <DollarSign className="h-4 w-4 mr-2" />
                                      Mark as Paid
                                    </Button>
                                  )}
                                  
                                  {(record.status === 'processed' || record.status === 'paid') && !record.emailSent && (
                                    <Button 
                                      onClick={() => {
                                        setPayrollRecords(records => 
                                          records.map(r => 
                                            r.id === record.id 
                                              ? { ...r, emailSent: true } 
                                              : r
                                          )
                                        );
                                        alert(`Email sent to ${record.employeeName}`);
                                      }}
                                      variant="outline"
                                      className="w-full font-sf-pro"
                                    >
                                      <Mail className="h-4 w-4 mr-2" />
                                      Send Payslip
                                    </Button>
                                  )}
                                  
                                  {(record.status === 'processed' || record.status === 'paid') && (
                                    <>
                                      <Button variant="outline" className="w-full font-sf-pro">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Payslip
                                      </Button>
                                      
                                      <Button variant="outline" className="w-full font-sf-pro">
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print Payslip
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 flex items-center justify-center">
                <DollarSign className="h-12 w-12 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-slate-500 font-sf-pro">No payroll records found</h3>
              <p className="mt-1 text-slate-400 font-sf-pro">
                Adjust your filters or process a new payroll
              </p>
              <div className="mt-6">
                <Button 
                  onClick={handleProcessPayroll}
                  className="bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 hover:from-mokm-purple-600 hover:to-mokm-blue-600 font-sf-pro"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Process Payroll
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PayrollManagement;
