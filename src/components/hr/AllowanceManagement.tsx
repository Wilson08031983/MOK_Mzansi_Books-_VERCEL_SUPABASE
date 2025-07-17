import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  Calculator, 
  Users, 
  PiggyBank, 
  Car, 
  Home, 
  Heart, 
  Shield,
  Plus,
  Edit,
  Save,
  X
} from 'lucide-react';
import { Employee } from '@/services/employeeService';
import { toast } from 'sonner';

interface AllowanceData {
  employeeId: string;
  thirteenthBonus: number;
  retirementPlan: number;
  housingAllowance: number;
  motorVehicleAllowance: number;
  medicalAidAllowance: number;
  customAllowances: { name: string; amount: number }[];
  uifEmployee: number;
  uifEmployer: number;
  totalGross: number;
  totalAllowances: number;
  totalDeductions: number;
  netPay: number;
  lastUpdated: string;
}

interface AttendanceRecord {
  employeeId: string;
  hoursWorked: number;
  overtimeHours: number;
  daysWorked: number;
  month: string;
  year: number;
}

interface AllowanceManagementProps {
  employees: Employee[];
}

const AllowanceManagement: React.FC<AllowanceManagementProps> = ({ employees }) => {
  const [allowanceData, setAllowanceData] = useState<AllowanceData[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [customAllowanceName, setCustomAllowanceName] = useState('');
  const [customAllowanceAmount, setCustomAllowanceAmount] = useState('');

  // UIF Constants for 2025
  const UIF_RATE = 0.01; // 1%
  const UIF_MAX_SALARY = 17712; // R17,712 monthly cap
  const UIF_MAX_CONTRIBUTION = 177.12; // Maximum per party

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedAllowances = localStorage.getItem('allowanceData');
    const storedAttendance = localStorage.getItem('attendanceRecords');
    
    if (storedAllowances) {
      setAllowanceData(JSON.parse(storedAllowances));
    } else {
      // Initialize with default data for existing employees
      const initialData = employees.map(emp => createDefaultAllowanceData(emp.id));
      setAllowanceData(initialData);
    }
    
    if (storedAttendance) {
      setAttendanceRecords(JSON.parse(storedAttendance));
    } else {
      // Initialize with sample attendance data
      const sampleAttendance = employees.map(emp => ({
        employeeId: emp.id,
        hoursWorked: 160, // Standard 8 hours x 20 days
        overtimeHours: 0,
        daysWorked: 20,
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear()
      }));
      setAttendanceRecords(sampleAttendance);
    }
  }, [employees]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('allowanceData', JSON.stringify(allowanceData));
  }, [allowanceData]);

  useEffect(() => {
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const createDefaultAllowanceData = (employeeId: string): AllowanceData => {
    const employee = employees.find(emp => emp.id === employeeId);
    const baseSalary = employee?.salary || 0;
    
    return {
      employeeId,
      thirteenthBonus: 0,
      retirementPlan: 0,
      housingAllowance: 0,
      motorVehicleAllowance: 0,
      medicalAidAllowance: 0,
      customAllowances: [],
      uifEmployee: calculateUIF(baseSalary),
      uifEmployer: calculateUIF(baseSalary),
      totalGross: baseSalary,
      totalAllowances: 0,
      totalDeductions: 0,
      netPay: 0,
      lastUpdated: new Date().toISOString()
    };
  };

  const calculateUIF = (salary: number): number => {
    const cappedSalary = Math.min(salary, UIF_MAX_SALARY);
    return Math.min(cappedSalary * UIF_RATE, UIF_MAX_CONTRIBUTION);
  };

  const calculateSalaryBreakdown = (employeeId: string, allowances: Partial<AllowanceData>): AllowanceData => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return createDefaultAllowanceData(employeeId);

    const baseSalary = employee.salary || 0;
    const taxPercentage = employee.taxPercentage || 0;
    
    const totalAllowances = (
      (allowances.thirteenthBonus || 0) +
      (allowances.retirementPlan || 0) +
      (allowances.housingAllowance || 0) +
      (allowances.motorVehicleAllowance || 0) +
      (allowances.medicalAidAllowance || 0) +
      (allowances.customAllowances || []).reduce((sum, custom) => sum + custom.amount, 0)
    );

    const grossSalary = baseSalary + totalAllowances;
    const uifEmployee = calculateUIF(grossSalary);
    const uifEmployer = calculateUIF(grossSalary);
    const taxAmount = (grossSalary * taxPercentage) / 100;
    const totalDeductions = taxAmount + uifEmployee;
    const netPay = grossSalary - totalDeductions;

    return {
      employeeId,
      thirteenthBonus: allowances.thirteenthBonus || 0,
      retirementPlan: allowances.retirementPlan || 0,
      housingAllowance: allowances.housingAllowance || 0,
      motorVehicleAllowance: allowances.motorVehicleAllowance || 0,
      medicalAidAllowance: allowances.medicalAidAllowance || 0,
      customAllowances: allowances.customAllowances || [],
      uifEmployee,
      uifEmployer,
      totalGross: grossSalary,
      totalAllowances,
      totalDeductions,
      netPay,
      lastUpdated: new Date().toISOString()
    };
  };

  const updateAllowance = (employeeId: string, field: keyof AllowanceData, value: any) => {
    const currentData = allowanceData.find(data => data.employeeId === employeeId) || createDefaultAllowanceData(employeeId);
    const updatedData = { ...currentData, [field]: value };
    const recalculatedData = calculateSalaryBreakdown(employeeId, updatedData);
    
    setAllowanceData(prev => {
      const filtered = prev.filter(data => data.employeeId !== employeeId);
      return [...filtered, recalculatedData];
    });
  };

  const addCustomAllowance = (employeeId: string) => {
    if (!customAllowanceName.trim() || !customAllowanceAmount) {
      toast.error('Please enter both allowance name and amount');
      return;
    }

    const currentData = allowanceData.find(data => data.employeeId === employeeId) || createDefaultAllowanceData(employeeId);
    const newCustomAllowances = [
      ...currentData.customAllowances,
      { name: customAllowanceName.trim(), amount: parseFloat(customAllowanceAmount) }
    ];
    
    updateAllowance(employeeId, 'customAllowances', newCustomAllowances);
    setCustomAllowanceName('');
    setCustomAllowanceAmount('');
    toast.success('Custom allowance added successfully');
  };

  const removeCustomAllowance = (employeeId: string, index: number) => {
    const currentData = allowanceData.find(data => data.employeeId === employeeId);
    if (!currentData) return;
    
    const newCustomAllowances = currentData.customAllowances.filter((_, i) => i !== index);
    updateAllowance(employeeId, 'customAllowances', newCustomAllowances);
    toast.success('Custom allowance removed');
  };

  const getEmployeeAllowanceData = (employeeId: string): AllowanceData => {
    return allowanceData.find(data => data.employeeId === employeeId) || createDefaultAllowanceData(employeeId);
  };

  const getEmployeeAttendance = (employeeId: string): AttendanceRecord | null => {
    return attendanceRecords.find(record => record.employeeId === employeeId) || null;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getTotalSummary = () => {
    const totals = allowanceData.reduce((acc, data) => {
      acc.totalGross += data.totalGross;
      acc.totalAllowances += data.totalAllowances;
      acc.totalDeductions += data.totalDeductions;
      acc.totalNetPay += data.netPay;
      acc.totalUifEmployee += data.uifEmployee;
      acc.totalUifEmployer += data.uifEmployer;
      return acc;
    }, {
      totalGross: 0,
      totalAllowances: 0,
      totalDeductions: 0,
      totalNetPay: 0,
      totalUifEmployee: 0,
      totalUifEmployer: 0
    });
    
    return totals;
  };

  const filteredEmployees = selectedEmployee && selectedEmployee !== 'all' 
    ? employees.filter(emp => emp.id === selectedEmployee)
    : employees;

  const summary = getTotalSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sf-pro">Allowance Management</h2>
          <p className="text-slate-600 font-sf-pro">Manage employee allowances, UIF, and salary calculations</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-64 font-sf-pro">
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-sf-pro">Total Gross Salary</p>
                <p className="text-2xl font-bold text-slate-900 font-sf-pro">{formatCurrency(summary.totalGross)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-mokm-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-sf-pro">Total Allowances</p>
                <p className="text-2xl font-bold text-green-600 font-sf-pro">{formatCurrency(summary.totalAllowances)}</p>
              </div>
              <PiggyBank className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-sf-pro">Total UIF (Combined)</p>
                <p className="text-2xl font-bold text-blue-600 font-sf-pro">{formatCurrency(summary.totalUifEmployee + summary.totalUifEmployer)}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-sf-pro">Total Net Pay</p>
                <p className="text-2xl font-bold text-mokm-blue-600 font-sf-pro">{formatCurrency(summary.totalNetPay)}</p>
              </div>
              <Calculator className="h-8 w-8 text-mokm-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Allowance Cards */}
      <div className="grid grid-cols-1 gap-6">
        {filteredEmployees.map(employee => {
          const allowanceInfo = getEmployeeAllowanceData(employee.id);
          const attendanceInfo = getEmployeeAttendance(employee.id);
          const isEditing = editingEmployee === employee.id;
          
          return (
            <Card key={employee.id} className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
              <CardHeader className="border-b border-white/20">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-sf-pro text-slate-900">
                      {employee.firstName} {employee.surname}
                    </CardTitle>
                    <p className="text-sm text-slate-600 font-sf-pro">
                      {employee.position} • {employee.department} • Base Salary: {formatCurrency(employee.salary || 0)}
                    </p>
                    {attendanceInfo && (
                      <p className="text-xs text-slate-500 font-sf-pro">
                        Attendance: {attendanceInfo.daysWorked} days, {attendanceInfo.hoursWorked} hours
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingEmployee(isEditing ? null : employee.id)}
                    className="font-sf-pro"
                  >
                    {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Allowances Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 font-sf-pro flex items-center gap-2">
                      <PiggyBank className="h-4 w-4" />
                      Allowances
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {/* Standard Allowances */}
                      {[
                        { key: 'thirteenthBonus', label: '13th Month Bonus', icon: <DollarSign className="h-4 w-4" /> },
                        { key: 'retirementPlan', label: 'Retirement Plan', icon: <PiggyBank className="h-4 w-4" /> },
                        { key: 'housingAllowance', label: 'Housing Allowance', icon: <Home className="h-4 w-4" /> },
                        { key: 'motorVehicleAllowance', label: 'Motor Vehicle Allowance', icon: <Car className="h-4 w-4" /> },
                        { key: 'medicalAidAllowance', label: 'Medical Aid Allowance', icon: <Heart className="h-4 w-4" /> }
                      ].map(({ key, label, icon }) => (
                        <div key={key} className="flex items-center gap-2">
                          {icon}
                          <Label className="flex-1 text-sm font-sf-pro">{label}</Label>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={allowanceInfo[key as keyof AllowanceData] as number}
                              onChange={(e) => updateAllowance(employee.id, key as keyof AllowanceData, parseFloat(e.target.value) || 0)}
                              className="w-24 text-right font-sf-pro"
                              step="0.01"
                              min="0"
                            />
                          ) : (
                            <span className="w-24 text-right text-sm font-sf-pro">
                              {formatCurrency(allowanceInfo[key as keyof AllowanceData] as number)}
                            </span>
                          )}
                        </div>
                      ))}
                      
                      {/* Custom Allowances */}
                      {allowanceInfo.customAllowances.map((custom, index) => (
                        <div key={index} className="flex items-center gap-2 bg-slate-50 p-2 rounded">
                          <Plus className="h-4 w-4 text-slate-400" />
                          <span className="flex-1 text-sm font-sf-pro">{custom.name}</span>
                          <span className="w-24 text-right text-sm font-sf-pro">{formatCurrency(custom.amount)}</span>
                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCustomAllowance(employee.id, index)}
                              className="p-1 h-6 w-6"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {/* Add Custom Allowance */}
                      {isEditing && (
                        <div className="border-t pt-3 space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Allowance name"
                              value={customAllowanceName}
                              onChange={(e) => setCustomAllowanceName(e.target.value)}
                              className="flex-1 font-sf-pro"
                            />
                            <Input
                              type="number"
                              placeholder="Amount"
                              value={customAllowanceAmount}
                              onChange={(e) => setCustomAllowanceAmount(e.target.value)}
                              className="w-24 font-sf-pro"
                              step="0.01"
                              min="0"
                            />
                            <Button
                              onClick={() => addCustomAllowance(employee.id)}
                              size="sm"
                              className="font-sf-pro"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Salary Breakdown Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 font-sf-pro flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Salary Breakdown
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 font-sf-pro">Base Salary</span>
                        <span className="font-medium font-sf-pro">{formatCurrency(employee.salary || 0)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 font-sf-pro">Total Allowances</span>
                        <span className="font-medium text-green-600 font-sf-pro">+{formatCurrency(allowanceInfo.totalAllowances)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-sm font-medium text-slate-900 font-sf-pro">Gross Salary</span>
                        <span className="font-bold font-sf-pro">{formatCurrency(allowanceInfo.totalGross)}</span>
                      </div>
                      
                      <div className="space-y-2 border-t pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 font-sf-pro">Tax ({employee.taxPercentage}%)</span>
                          <span className="font-medium text-red-600 font-sf-pro">-{formatCurrency((allowanceInfo.totalGross * (employee.taxPercentage || 0)) / 100)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 font-sf-pro">UIF Employee (1%)</span>
                          <span className="font-medium text-red-600 font-sf-pro">-{formatCurrency(allowanceInfo.uifEmployee)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 font-sf-pro">UIF Employer (1%)</span>
                          <span className="font-medium text-blue-600 font-sf-pro">{formatCurrency(allowanceInfo.uifEmployer)}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-lg font-bold text-slate-900 font-sf-pro">Net Pay</span>
                        <span className="text-lg font-bold text-mokm-blue-600 font-sf-pro">{formatCurrency(allowanceInfo.netPay)}</span>
                      </div>
                      
                      <div className="text-xs text-slate-500 font-sf-pro">
                        Last updated: {new Date(allowanceInfo.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* UIF Information */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="text-lg font-sf-pro text-slate-900 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            UIF Information (2025)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-sf-pro">
            <div>
              <p className="font-medium text-slate-900">UIF Rate</p>
              <p className="text-slate-600">1% Employee + 1% Employer</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Maximum Salary Cap</p>
              <p className="text-slate-600">{formatCurrency(UIF_MAX_SALARY)} per month</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Maximum Contribution</p>
              <p className="text-slate-600">{formatCurrency(UIF_MAX_CONTRIBUTION)} per party</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AllowanceManagement;