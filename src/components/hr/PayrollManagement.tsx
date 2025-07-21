import React, { useState, useEffect } from 'react';
import { 
  Search, 
  DollarSign, 
  Calculator,
  TrendingUp,
  CreditCard,
  Eye,
  RefreshCw,
  Clock,
  X,
  AlertCircle,
  User,
  Download
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
import { PayslipService } from '@/services/payslipService';
import { Employee } from '@/services/employeeService';

const PayrollManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>(new Date().toISOString().slice(0, 7));
  const [statusFilter, setStatusFilter] = useState<string>('all');
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
      // Recalculate payroll to reflect the salary advance deduction
      const updatedCalculations = payrollCalculationService.calculateAllEmployeesPayroll(periodFilter);
      setPayrollCalculations(updatedCalculations);
      toast.success('Salary advance approved and deducted from payroll');
    } else {
      toast.error('Failed to approve salary advance');
    }
  };
  
  // View payroll details
  const handleViewPayrollDetails = (calculation: PayrollCalculation) => {
    setSelectedPayrollData(calculation);
    setShowPayrollDetails(true);
  };
  
  // Download payslip
  const handleDownloadPayslip = async (calculation: PayrollCalculation) => {
    try {
      // Get employee data from localStorage
      const employeesData = localStorage.getItem('employees');
      if (!employeesData) {
        toast.error('Employee data not found');
        return;
      }
      
      const employees: Employee[] = JSON.parse(employeesData);
      const employee = employees.find(emp => emp.id === calculation.employeeId);
      
      if (!employee) {
        toast.error('Employee not found');
        return;
      }
      
      // Show loading toast
      const loadingToast = toast.loading('Generating payslip PDF...');
      
      try {
        // Generate the payslip
        await PayslipService.generatePayslip(employee, calculation);
        
        // Dismiss the loading toast
        toast.dismiss(loadingToast);
        
        // Show success message
        toast.success('Payslip downloaded successfully!');
      } catch (pdfError) {
        // Dismiss the loading toast
        toast.dismiss(loadingToast);
        throw pdfError;
      }
      
    } catch (error) {
      console.error('Error downloading payslip:', error);
      toast.error('Failed to download payslip');
    }
  };
  
  // Filter payroll calculations
  const filteredCalculations = payrollCalculations.filter(calc => {
    const matchesSearch = calc.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || calc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  // Generate payroll summary
  const payrollSummary = payrollCalculationService.generatePayrollSummary(filteredCalculations);

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
      
      {/* Employee Payroll Table */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="font-sf-pro">Employee Payroll Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
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
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Net Salary</th>
                  <th className="text-left py-3 px-4 font-sf-pro font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalculations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500 font-sf-pro">
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
                        <div className="text-xs font-sf-pro space-y-0.5">
                          <div className="leading-tight">Regular: {calculation.regularHours.toFixed(1)}h</div>
                          <div className="text-orange-600 leading-tight">OT: {calculation.overtimeHours.toFixed(1)}h</div>
                          <div className="text-purple-600 leading-tight">Night: {calculation.nightShiftHours.toFixed(1)}h</div>
                          <div className="text-blue-600 leading-tight">Leave: {calculation.leaveHours.toFixed(1)}h</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sf-pro">R {calculation.attendancePay.toLocaleString()}</td>
                      <td className="py-3 px-4 font-sf-pro">R {calculation.allowances.totalAllowances.toLocaleString()}</td>
                      <td className="py-3 px-4 font-sf-pro font-semibold text-green-600">R {calculation.grossSalary.toLocaleString()}</td>
                      <td className="py-3 px-4 font-sf-pro font-semibold text-mokm-purple-600">R {calculation.netSalary.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewPayrollDetails(calculation)}
                            className="font-sf-pro"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadPayslip(calculation)}
                            className="font-sf-pro text-mokm-purple-600 hover:text-mokm-purple-700 hover:bg-mokm-purple-50"
                            title="Download Payslip"
                          >
                            <Download className="h-4 w-4" />
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900 font-sf-pro">
              Payroll Details - {selectedPayrollData?.employeeName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPayrollData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sf-pro">Employee Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Employee ID:</span>
                    <span className="font-medium font-sf-pro">{selectedPayrollData.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Name:</span>
                    <span className="font-medium font-sf-pro">{selectedPayrollData.employeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Base Salary:</span>
                    <span className="font-medium font-sf-pro">R {selectedPayrollData.baseSalary?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Period:</span>
                    <span className="font-medium font-sf-pro">{selectedPayrollData.period}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Status:</span>
                    <Badge 
                      variant={selectedPayrollData.status === 'paid' ? 'default' : 'secondary'}
                      className="font-sf-pro"
                    >
                      {selectedPayrollData.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Hours Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sf-pro">Hours Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Regular Hours:</span>
                    <span className="font-medium font-sf-pro">{(selectedPayrollData.regularHours || 0).toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-600 font-sf-pro">Overtime Hours:</span>
                    <span className="font-medium font-sf-pro">{(selectedPayrollData.overtimeHours || 0).toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-600 font-sf-pro">Night Shift Hours:</span>
                    <span className="font-medium font-sf-pro">{(selectedPayrollData.nightShiftHours || 0).toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600 font-sf-pro">Leave Hours:</span>
                    <span className="font-medium font-sf-pro">{(selectedPayrollData.leaveHours || 0).toFixed(1)}h</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-900 font-sf-pro">Total Hours:</span>
                      <span className="font-sf-pro">
                        {((selectedPayrollData.regularHours || 0) + (selectedPayrollData.overtimeHours || 0) + 
                          (selectedPayrollData.nightShiftHours || 0) + (selectedPayrollData.leaveHours || 0)).toFixed(1)}h
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Earnings Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sf-pro">Earnings Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Base Salary:</span>
                    <span className="font-medium font-sf-pro">R {selectedPayrollData.baseSalary?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Attendance Pay:</span>
                    <span className="font-medium font-sf-pro">R {selectedPayrollData.attendancePay?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Total Allowances:</span>
                    <span className="font-medium font-sf-pro">R {selectedPayrollData.allowances?.totalAllowances?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-green-600 font-sf-pro">Gross Salary:</span>
                      <span className="text-green-600 font-sf-pro">R {selectedPayrollData.grossSalary?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deductions Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sf-pro">Deductions Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Tax:</span>
                    <span className="font-medium font-sf-pro">R {selectedPayrollData.deductions?.tax?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">UIF:</span>
                    <span className="font-medium font-sf-pro">R {selectedPayrollData.deductions?.uif?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Medical Aid:</span>
                    <span className="font-medium font-sf-pro">R {selectedPayrollData.deductions?.medicalAid?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Retirement Fund:</span>
                    <span className="font-medium font-sf-pro">R {selectedPayrollData.deductions?.retirementFund?.toLocaleString() || '0'}</span>
                  </div>
                  {(selectedPayrollData.deductions?.salaryAdvance || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-600 font-sf-pro">Salary Advance:</span>
                      <span className="text-red-600 font-medium font-sf-pro">R {selectedPayrollData.deductions?.salaryAdvance?.toLocaleString() || '0'}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-sf-pro">Other Deductions:</span>
                    <span className="font-medium font-sf-pro">R {selectedPayrollData.deductions?.otherDeductions?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-red-600 font-sf-pro">Total Deductions:</span>
                      <span className="text-red-600 font-sf-pro">R {selectedPayrollData.deductions?.totalDeductions?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Allowances Breakdown */}
              {(selectedPayrollData.allowances?.totalAllowances || 0) > 0 && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="font-sf-pro">Allowances Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(selectedPayrollData.allowances?.housingAllowance || 0) > 0 && (
                        <div className="text-center">
                          <div className="text-sm text-slate-600 font-sf-pro">Housing</div>
                          <div className="font-medium font-sf-pro">R {selectedPayrollData.allowances?.housingAllowance?.toLocaleString() || '0'}</div>
                        </div>
                      )}
                      {(selectedPayrollData.allowances?.motorVehicleAllowance || 0) > 0 && (
                        <div className="text-center">
                          <div className="text-sm text-slate-600 font-sf-pro">Motor Vehicle</div>
                          <div className="font-medium font-sf-pro">R {selectedPayrollData.allowances?.motorVehicleAllowance?.toLocaleString() || '0'}</div>
                        </div>
                      )}
                      {(selectedPayrollData.allowances?.medicalAidAllowance || 0) > 0 && (
                        <div className="text-center">
                          <div className="text-sm text-slate-600 font-sf-pro">Medical Aid</div>
                          <div className="font-medium font-sf-pro">R {selectedPayrollData.allowances?.medicalAidAllowance?.toLocaleString() || '0'}</div>
                        </div>
                      )}
                      {(selectedPayrollData.allowances?.otherAllowances || 0) > 0 && (
                        <div className="text-center">
                          <div className="text-sm text-slate-600 font-sf-pro">Other</div>
                          <div className="font-medium font-sf-pro">R {selectedPayrollData.allowances?.otherAllowances?.toLocaleString() || '0'}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Net Salary Summary */}
              <Card className="md:col-span-2 bg-gradient-to-r from-purple-50 to-blue-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 font-sf-pro">Net Salary</h3>
                    <div className="text-3xl font-bold text-purple-600 font-sf-pro">
                      R {selectedPayrollData.netSalary?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-slate-600 mt-2 font-sf-pro">
                      Base Salary + Gross Salary - Total Deductions
                    </div>
                    <div className="text-sm text-slate-500 mt-1 font-sf-pro">
                      R {selectedPayrollData.baseSalary?.toLocaleString() || '0'} + R {selectedPayrollData.grossSalary?.toLocaleString() || '0'} - R {selectedPayrollData.deductions?.totalDeductions?.toLocaleString() || '0'}
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => setShowPayrollDetails(false)}
                  className="font-sf-pro"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayrollManagement;
