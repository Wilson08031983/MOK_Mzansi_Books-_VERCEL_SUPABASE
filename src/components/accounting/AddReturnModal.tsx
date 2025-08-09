import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Calendar, FileText, DollarSign, Download, Calculator } from 'lucide-react';
import { BusinessTaxReturn } from './BusinessTaxCard';
import { calculateVAT201, saveVAT201Return, VAT201Data, parsePeriod, getCurrentVATQuarter } from '../../services/vat201Service';
import { emp201Service, EMP201Calculation } from '../../services/emp201Service';
import { getAllEmployees, Employee } from '../../services/employeeService';
import { payrollCalculationService, PayrollCalculation } from '../../services/payrollCalculationService';
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
    reference: '',
    selectedEmployee: '', // For PAYE/EMP201 employee selection
    calculateAllEmployees: false // For PAYE/EMP201 all employees option
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [vat201Data, setVat201Data] = useState<VAT201Data | null>(null);
  const [emp201Data, setEmp201Data] = useState<EMP201Calculation | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showVATBreakdown, setShowVATBreakdown] = useState(false);
  const [showEMP201Breakdown, setShowEMP201Breakdown] = useState(false);

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
      reference: '',
      selectedEmployee: '',
      calculateAllEmployees: false
    });
    setErrors({});
    setVat201Data(null);
    setEmp201Data(null);
    setShowVATBreakdown(false);
    setShowEMP201Breakdown(false);
    onClose();
  };

  // Load employees when component mounts
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const employeeList = getAllEmployees();
        setEmployees(employeeList);
        console.log(`🧮 [AddReturnModal] Loaded ${employeeList.length} employees for PAYE/EMP201`);
      } catch (error) {
        console.error('Error loading employees:', error);
      }
    };
    
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

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
    } else if (value === 'PAYE_EMP201') {
      // Auto-generate PAYE/EMP201 information
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
      const period = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Due date is 7th of following month
      const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 7);
      
      setFormData(prev => ({
        ...prev,
        type: value as BusinessTaxReturn['type'],
        name: `PAYE/EMP201 - ${currentMonth}`,
        description: selectedType?.description || '',
        period: period,
        dueDate: dueDate.toISOString().split('T')[0],
        selectedEmployee: '',
        calculateAllEmployees: false
      }));
      
      setShowEMP201Breakdown(true);
      
      toast.success('PAYE/EMP201 period auto-generated', {
        description: `Period: ${currentMonth}, Due: ${dueDate.toLocaleDateString()}`
      });
    } else {
      setFormData(prev => ({
        ...prev,
        type: value as BusinessTaxReturn['type'],
        name: selectedType?.label || '',
        description: selectedType?.description || '',
        selectedEmployee: '',
        calculateAllEmployees: false
      }));
      
      setShowEMP201Breakdown(false);
    }
  };

  const calculateVATAmount = async () => {
    if (formData.type !== 'VAT201' || !formData.period) return;

    setIsCalculating(true);
    try {
      const { startDate, endDate } = parsePeriod(formData.period);
      console.log(`🔄 [AddReturnModal] Calculating VAT for period ${startDate} to ${endDate}`);
      
      // Check if we have data in localStorage
      let localStorageInvoices = localStorage.getItem('invoices');
      const incomesData = localStorage.getItem('incomes');
      const expensesData = localStorage.getItem('expenses');
      
      console.log(`🔍 [AddReturnModal] Checking localStorage data before VAT calculation:`);
      console.log(`- Invoices in localStorage: ${localStorageInvoices ? 'Yes' : 'No'}`);
      if (localStorageInvoices) {
        const invoices = JSON.parse(localStorageInvoices);
        console.log(`- Number of invoices: ${invoices.length}`);
        console.log(`- Paid invoices:`, invoices.filter(inv => inv.status === 'paid').length);
      }
      
      console.log(`- Incomes/Sales in localStorage: ${incomesData ? 'Yes' : 'No'}`);
      if (incomesData) {
        const incomes = JSON.parse(incomesData);
        console.log(`- Number of incomes: ${incomes.length}`);
        console.log(`- Sales transactions:`, incomes.filter(inc => inc.notes && inc.notes.includes('Auto-generated from sales')).length);
      }
      
      console.log(`- Expenses in localStorage: ${expensesData ? 'Yes' : 'No'}`);
      if (expensesData) {
        const expenses = JSON.parse(expensesData);
        console.log(`- Number of expenses: ${expenses.length}`);
        console.log(`- Expenses with receipts:`, expenses.filter(exp => exp.hasReceipt).length);
      }
      
      // Force a fresh calculation by clearing any cached data
      localStorage.removeItem('vatCalculations');
      localStorage.removeItem('cachedVAT');
      localStorage.removeItem('vatCache');
      localStorage.removeItem('calculationCache');
      
      // Use only real data - no sample data creation
      console.log(`🔍 [AddReturnModal] Using only real data from localStorage for VAT calculation`);
      
      if (!localStorageInvoices || JSON.parse(localStorageInvoices).length === 0) {
        console.log(`🔍 [AddReturnModal] No invoices found in localStorage - VAT calculation will use actual data only`);
      }
      
      // Trigger a storage event to ensure all components are aware of the cache clearing
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'forceVATRecalculation',
        newValue: Date.now().toString(),
        oldValue: null,
        storageArea: localStorage
      }));
      
      // Calculate VAT with fresh data
      const vatData = calculateVAT201(startDate, endDate);
      console.log(`✅ [AddReturnModal] VAT calculation result:`, JSON.stringify(vatData));
      console.log(`✅ [AddReturnModal] Output VAT: ${JSON.stringify(vatData.outputVAT)}`);
      console.log(`✅ [AddReturnModal] Input VAT: ${JSON.stringify(vatData.inputVAT)}`);
      console.log(`✅ [AddReturnModal] Net VAT: ${vatData.netVAT}`);
      
      // Add calculation timestamp
      const calculationTimestamp = new Date().toISOString();
      console.log(`✅ [AddReturnModal] Calculation timestamp: ${calculationTimestamp}`);
      
      // The VAT data already includes breakdown information from the service
      console.log(`✅ [AddReturnModal] VAT data with breakdown:`, JSON.stringify(vatData));
      
      setVat201Data(vatData);
      
      // Create a safe version of the VAT data for display
      const safeVatData = {
        breakdown: vatData.breakdown,
        inputVAT: {
          standardRated: vatData.inputVAT?.standardRated || 0,
          zeroRated: vatData.inputVAT?.zeroRated || 0,
          exempt: vatData.inputVAT?.exempt || 0,
          exports: vatData.inputVAT?.exports || 0,
          total: vatData.inputVAT?.total || 0
        },
        outputVAT: {
          standardRated: vatData.outputVAT?.standardRated || 0,
          capitalGoods: vatData.outputVAT?.capitalGoods || 0,
          importVAT: vatData.outputVAT?.importVAT || 0,
          total: vatData.outputVAT?.total || 0
        },
        netVAT: vatData.netVAT || 0,
        period: vatData.period || formData.period,
        calculationTimestamp
      };
      
      console.log(`🔍 [AddReturnModal] Safe VAT data for UI display:`, JSON.stringify(safeVatData));
      console.log(`🔍 [AddReturnModal] Input VAT total: ${safeVatData.inputVAT.total}`);
      console.log(`🔍 [AddReturnModal] Input VAT breakdown:`, {
        standardRated: safeVatData.inputVAT.standardRated,
        zeroRated: safeVatData.inputVAT.zeroRated,
        exempt: safeVatData.inputVAT.exempt,
        exports: safeVatData.inputVAT.exports
      });
      console.log(`🔍 [AddReturnModal] Output VAT total: ${safeVatData.outputVAT.total}`);
      
      // Update the state with the VAT data
      setVat201Data(vatData);
      
      // Update the form amount to reflect the calculated VAT
      if (vatData.netVAT !== undefined) {
        setFormData(prev => ({
          ...prev,
          amount: vatData.netVAT.toFixed(2)
        }));
      }
      
      console.log(`✅ [AddReturnModal] Safe VAT data for display:`, JSON.stringify(safeVatData));
      
      setFormData(prev => ({
        ...prev,
        amount: Math.abs(safeVatData.netVAT).toFixed(2)
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

  // Auto-show VAT breakdown when VAT201 is selected
  useEffect(() => {
    if (formData.type === 'VAT201') {
      setShowVATBreakdown(true);
      // If we don't have a period, set a default one (current VAT quarter)
      if (!formData.period) {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth(); // 0-based
        
        // Determine current SA VAT quarter (Jan-Feb, Mar-Apr, May-Jun, Jul-Aug, Sep-Oct, Nov-Dec)
        let quarterPeriod;
        if (currentMonth <= 1) { // Jan-Feb
          quarterPeriod = `Jan-Feb ${currentYear}`;
        } else if (currentMonth <= 3) { // Mar-Apr
          quarterPeriod = `Mar-Apr ${currentYear}`;
        } else if (currentMonth <= 5) { // May-Jun
          quarterPeriod = `May-Jun ${currentYear}`;
        } else if (currentMonth <= 7) { // Jul-Aug
          quarterPeriod = `Jul-Aug ${currentYear}`;
        } else if (currentMonth <= 9) { // Sep-Oct
          quarterPeriod = `Sep-Oct ${currentYear}`;
        } else { // Nov-Dec
          quarterPeriod = `Nov-Dec ${currentYear}`;
        }
        
        console.log('🔄 [AddReturnModal] Setting default VAT period:', quarterPeriod);
        setFormData(prev => ({
          ...prev,
          period: quarterPeriod
        }));
      }
      // If we have a period, trigger calculation immediately
      if (formData.period) {
        console.log('🔄 [AddReturnModal] VAT201 selected with period, calculating VAT...');
        calculateVATAmount();
      }
    } else {
      setShowVATBreakdown(false);
      setVat201Data(null);
    }
  }, [formData.type]);
  
  // Auto-calculate when period changes for VAT 201 or when invoices change
  useEffect(() => {
    if (formData.type === 'VAT201' && formData.period) {
      const timeoutId = setTimeout(() => {
        calculateVATAmount();
      }, 500); // Debounce
      return () => clearTimeout(timeoutId);
    }
  }, [formData.period, formData.type]);
  
  // Initial calculation when modal opens with VAT201 type
  useEffect(() => {
    if (formData.type === 'VAT201' && formData.period && isOpen) {
      console.log('🔄 [AddReturnModal] Modal opened with VAT201 type, calculating VAT...');
      calculateVATAmount();
    }
  }, [isOpen]);

  // Ref to track last known invoices state
  const lastKnownInvoicesRef = useRef<string | null>(null);

  // Listen for localStorage changes to recalculate VAT when invoices are updated
  useEffect(() => {
    if (formData.type === 'VAT201' && formData.period) {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'invoices') {
          console.log('🔄 [AddReturnModal] Invoices changed in localStorage, recalculating VAT...');
          // Clear any cached calculations first
          localStorage.removeItem('vatCalculations');
          localStorage.removeItem('cachedVAT');
          localStorage.removeItem('vatCache');
          localStorage.removeItem('calculationCache');
          
          setTimeout(() => {
            calculateVATAmount();
          }, 100);
        }
      };

      // Listen for storage events from other tabs/windows
      window.addEventListener('storage', handleStorageChange);

      // Also set up a periodic check for same-tab changes
      const intervalId = setInterval(() => {
        const currentInvoices = localStorage.getItem('invoices');
        if (currentInvoices !== lastKnownInvoicesRef.current) {
          console.log('🔄 [AddReturnModal] Invoices changed in same tab, recalculating VAT...');
          // Clear any cached calculations first
          localStorage.removeItem('vatCalculations');
          localStorage.removeItem('cachedVAT');
          localStorage.removeItem('vatCache');
          localStorage.removeItem('calculationCache');
          
          lastKnownInvoicesRef.current = currentInvoices;
          calculateVATAmount();
        }
      }, 2000);

      // Store initial state
      lastKnownInvoicesRef.current = localStorage.getItem('invoices');
      
      // Force an initial calculation when the component mounts
      calculateVATAmount();

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(intervalId);
      };
    }
  }, [formData.type, formData.period]);

  // PAYE/EMP201 Calculation Function
  const calculateEMP201Amount = async () => {
    if (formData.type !== 'PAYE_EMP201' || !formData.period) return;

    setIsCalculating(true);
    try {
      console.log(`🧮 [AddReturnModal] Starting PAYE/EMP201 calculation for period: ${formData.period}`);
      
      // Debug: Check what payroll data exists
      const allPayrollData = localStorage.getItem('payrollCalculations');
      console.log(`🔍 [AddReturnModal] Payroll data in localStorage:`, allPayrollData ? JSON.parse(allPayrollData) : 'No data found');
      
      // Debug: Check what employees we have
      console.log(`🔍 [AddReturnModal] Available employees:`, employees.map(emp => ({ 
        id: emp.id, 
        name: `${emp.firstName} ${emp.surname}`,
        salary: emp.salary 
      })));
      console.log(`🔍 [AddReturnModal] Selected employee ID:`, formData.selectedEmployee);
      
      // Fallback function to create basic payroll data when HR service is unavailable
      const createFallbackPayrollData = (): PayrollCalculation[] => {
        console.log(`🔄 [AddReturnModal] Creating fallback payroll data using employee salaries...`);
        const payrollData: PayrollCalculation[] = [];
        
        if (formData.calculateAllEmployees) {
          for (const employee of employees) {
            const employeeSalary = employee.salary || 0;
            payrollData.push(createBasicPayrollRecord(employee, employeeSalary));
          }
        } else if (formData.selectedEmployee) {
          const selectedEmp = employees.find(emp => emp.id === formData.selectedEmployee);
          if (selectedEmp) {
            const employeeSalary = selectedEmp.salary || 0;
            payrollData.push(createBasicPayrollRecord(selectedEmp, employeeSalary));
          }
        }
        
        return payrollData;
      };
      
      // Helper function to create a basic payroll record
      const createBasicPayrollRecord = (employee: Employee, salary: number): PayrollCalculation => {
        const hourlyRate = salary / 173.33; // Standard monthly hours
        return {
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.surname}`,
          period: formData.period,
          baseSalary: salary,
          hourlyRate,
          regularHours: 173.33,
          overtimeHours: 0,
          nightShiftHours: 0,
          leaveHours: 0,
          regularPay: salary,
          overtimePay: 0,
          nightShiftPay: 0,
          leavePay: 0,
          attendancePay: salary,
          allowances: {
            thirteenthMonthBonus: 0,
            housingAllowance: 0,
            medicalAidAllowance: 0,
            motorVehicleAllowance: 0,
            retirementPlan: 0,
            otherAllowances: 0,
            totalAllowances: 0
          },
          grossSalary: salary,
          deductions: {
            tax: 0,
            uif: 0,
            medicalAid: 0,
            retirementFund: 0,
            salaryAdvance: 0,
            otherDeductions: 0,
            totalDeductions: 0
          },
          netSalary: salary, // For fallback, use full salary as net salary
          status: 'calculated' as const,
          calculatedDate: new Date().toISOString()
        };
      };
      
      // Use actual payroll calculations from HR Management that account for days worked
      const getActualPayrollData = () => {
        console.log(`🧮 [AddReturnModal] Getting actual payroll calculations that account for days worked...`);
        console.log(`🔍 [AddReturnModal] payrollCalculationService available:`, typeof payrollCalculationService);
        
        // Check if payrollCalculationService is available
        if (typeof payrollCalculationService === 'undefined') {
          console.error(`❌ [AddReturnModal] payrollCalculationService is not available, using fallback`);
          return createFallbackPayrollData();
        }
        
        // First, try to get existing payroll calculations from localStorage
        const existingPayrollData = payrollCalculationService.getPayrollCalculations(formData.period);
        
        if (existingPayrollData && existingPayrollData.length > 0) {
          console.log(`✅ [AddReturnModal] Found existing payroll calculations: ${existingPayrollData.length} employees`);
          
          if (formData.calculateAllEmployees) {
            return existingPayrollData;
          } else if (formData.selectedEmployee) {
            const selectedPayroll = existingPayrollData.find(p => p.employeeId === formData.selectedEmployee);
            return selectedPayroll ? [selectedPayroll] : [];
          }
        }
        
        // If no existing data, generate new payroll calculations using the proper service
        console.log(`🧮 [AddReturnModal] No existing payroll data found, generating new calculations using HR Management service...`);
        
        let payrollData: PayrollCalculation[] = [];
        
        if (formData.calculateAllEmployees) {
          // Calculate for all employees using the proper payroll service that accounts for attendance/days worked
          payrollData = payrollCalculationService.calculateAllEmployeesPayroll(formData.period);
          console.log(`✅ [AddReturnModal] Generated payroll for all employees: ${payrollData.length} calculations`);
        } else if (formData.selectedEmployee) {
          // Calculate for selected employee using the proper payroll service
          const selectedEmp = employees.find(emp => emp.id === formData.selectedEmployee);
          if (selectedEmp) {
            try {
              const calculation = payrollCalculationService.calculateEmployeePayroll(selectedEmp, formData.period);
              payrollData = [calculation];
              console.log(`✅ [AddReturnModal] Generated payroll for ${selectedEmp.firstName} ${selectedEmp.surname}:`);
              console.log(`   - Gross Salary: R${calculation.grossSalary.toFixed(2)}`);
              console.log(`   - Net Salary (after days worked): R${calculation.netSalary.toFixed(2)}`);
              console.log(`   - Regular Hours: ${calculation.regularHours}`);
            } catch (error) {
              console.error(`❌ [AddReturnModal] Error calculating payroll for ${selectedEmp.firstName} ${selectedEmp.surname}:`, error);
              // Fallback to basic calculation if HR service fails
              const employeeSalary = selectedEmp.salary || 0;
              payrollData = [{
                employeeId: selectedEmp.id,
                employeeName: `${selectedEmp.firstName} ${selectedEmp.surname}`,
                period: formData.period,
                baseSalary: employeeSalary,
                hourlyRate: employeeSalary / 173.33,
                regularHours: 173.33,
                overtimeHours: 0,
                nightShiftHours: 0,
                leaveHours: 0,
                regularPay: employeeSalary,
                overtimePay: 0,
                nightShiftPay: 0,
                leavePay: 0,
                attendancePay: employeeSalary,
                allowances: {
                  thirteenthMonthBonus: 0,
                  housingAllowance: 0,
                  medicalAidAllowance: 0,
                  motorVehicleAllowance: 0,
                  retirementPlan: 0,
                  otherAllowances: 0,
                  totalAllowances: 0
                },
                grossSalary: employeeSalary,
                deductions: {
                  tax: 0,
                  uif: 0,
                  medicalAid: 0,
                  retirementFund: 0,
                  salaryAdvance: 0,
                  otherDeductions: 0,
                  totalDeductions: 0
                },
                netSalary: employeeSalary, // Fallback to full salary
                status: 'calculated' as const,
                calculatedDate: new Date().toISOString()
              }];
            }
          }
        }
        
        return payrollData;
      };
      
      // Get actual payroll data that accounts for days worked
      const payrollDataToUse = getActualPayrollData();
      console.log(`🔍 [AddReturnModal] Payroll data retrieved:`, payrollDataToUse.length, 'records');
      console.log(`🔍 [AddReturnModal] Payroll data sample:`, payrollDataToUse.length > 0 ? {
        employeeName: payrollDataToUse[0].employeeName,
        grossSalary: payrollDataToUse[0].grossSalary,
        netSalary: payrollDataToUse[0].netSalary,
        period: payrollDataToUse[0].period
      } : 'No data');
      
      if (payrollDataToUse.length > 0) {
        // Get existing payroll data
        const existingPayrollData = allPayrollData ? JSON.parse(allPayrollData) : [];
        
        // Remove any existing data for this period to avoid duplicates
        const filteredExistingData = existingPayrollData.filter(p => p.period !== formData.period);
        
        // Add new payroll data
        const updatedPayrollData = [...filteredExistingData, ...payrollDataToUse];
        
        localStorage.setItem('payrollCalculations', JSON.stringify(updatedPayrollData));
        console.log(`✅ [AddReturnModal] Updated payroll data with ${payrollDataToUse.length} employee(s) using actual salaries`);
      }
      
      if (formData.calculateAllEmployees) {
        // Calculate for all employees
        console.log(`🧮 [AddReturnModal] Calculating EMP201 for all employees`);
        const emp201Data = emp201Service.calculateEMP201(formData.period);
        console.log(`🔍 [AddReturnModal] EMP201 calculation result:`, emp201Data);
        setEmp201Data(emp201Data);
        
        // Update form amount with total EMP201 amount
        setFormData(prev => ({
          ...prev,
          amount: emp201Data.totalEMP201Amount.toFixed(2),
          name: `PAYE/EMP201 - ${emp201Data.periodName} (All Employees)`
        }));
        
        toast.success(`EMP201 calculated for ${emp201Data.totalEmployees} employees`, {
          description: `Total: R ${emp201Data.totalEMP201Amount.toLocaleString()}`
        });
        
      } else if (formData.selectedEmployee) {
        // Calculate for single employee
        console.log(`🧮 [AddReturnModal] Calculating EMP201 for employee: ${formData.selectedEmployee}`);
        
        // Get employee details
        const selectedEmp = employees.find(emp => emp.id === formData.selectedEmployee);
        if (!selectedEmp) {
          throw new Error('Selected employee not found');
        }
        
        // Calculate EMP201 for all employees first, then filter for selected employee
        const fullEmp201Data = emp201Service.calculateEMP201(formData.period);
        const employeeBreakdown = fullEmp201Data.employeeBreakdown.find(
          emp => emp.employeeId === formData.selectedEmployee
        );
        
        if (!employeeBreakdown) {
          throw new Error('No payroll data found for selected employee');
        }
        
        // Create single employee EMP201 data
        const singleEmployeeEMP201: EMP201Calculation = {
          ...fullEmp201Data,
          totalEmployees: 1,
          totalPAYE: employeeBreakdown.paye,
          totalTaxableIncome: employeeBreakdown.taxableIncome,
          totalUIF: employeeBreakdown.uifTotal,
          totalUIFEmployee: employeeBreakdown.uifEmployee,
          totalUIFEmployer: employeeBreakdown.uifEmployer,
          totalUIFSalaries: employeeBreakdown.uifSalary,
          totalSDL: employeeBreakdown.sdl,
          totalSDLSalaries: employeeBreakdown.sdl > 0 ? employeeBreakdown.grossSalary : 0,
          totalEMP201Amount: employeeBreakdown.paye + employeeBreakdown.uifTotal + employeeBreakdown.sdl,
          employeeBreakdown: [employeeBreakdown]
        };
        
        setEmp201Data(singleEmployeeEMP201);
        
        // Update form amount with employee's total
        setFormData(prev => ({
          ...prev,
          amount: singleEmployeeEMP201.totalEMP201Amount.toFixed(2),
          name: `PAYE/EMP201 - ${singleEmployeeEMP201.periodName} (${selectedEmp.firstName} ${selectedEmp.surname})`
        }));
        
        toast.success(`EMP201 calculated for ${selectedEmp.firstName} ${selectedEmp.surname}`, {
          description: `Total: R ${singleEmployeeEMP201.totalEMP201Amount.toLocaleString()}`
        });
        
      } else {
        throw new Error('Please select an employee or choose "Calculate All Employees"');
      }
      
      // Always show the breakdown after successful calculation
      setShowEMP201Breakdown(true);
      console.log(`✅ [AddReturnModal] EMP201 calculation completed - showing breakdown`);
      
      // Force a re-render to ensure the breakdown shows
      setTimeout(() => {
        setShowEMP201Breakdown(true);
        console.log(`🔍 [AddReturnModal] Forced breakdown visibility after timeout`);
      }, 100);
      
    } catch (error) {
      console.error('❌ [AddReturnModal] Error calculating PAYE/EMP201:', error);
      console.error('❌ [AddReturnModal] Error details:', {
        selectedEmployee: formData.selectedEmployee,
        calculateAllEmployees: formData.calculateAllEmployees,
        period: formData.period,
        employeesCount: employees.length,
        error: error instanceof Error ? error.message : String(error)
      });
      
      let errorMessage = 'Failed to calculate PAYE/EMP201';
      let errorDescription = 'Please check your employee and payroll data';
      
      if (error instanceof Error) {
        if (error.message.includes('No payroll data found')) {
          errorDescription = 'No payroll data found for the selected employee(s)';
        } else if (error.message.includes('Selected employee not found')) {
          errorDescription = 'Selected employee not found in the system';
        } else {
          errorDescription = error.message;
        }
      }
      
      // Check if we have employees but no salary data
      if (employees.length === 0) {
        errorDescription = 'No employees found. Please add employees in HR Management first.';
      } else if (formData.selectedEmployee) {
        const selectedEmp = employees.find(emp => emp.id === formData.selectedEmployee);
        if (selectedEmp && (!selectedEmp.salary || selectedEmp.salary === 0)) {
          errorDescription = `Employee ${selectedEmp.firstName} ${selectedEmp.surname} has no salary configured. Please update their salary in HR Management.`;
        }
      }
      
      toast.error(errorMessage, {
        description: errorDescription
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle employee selection change
  const handleEmployeeSelectionChange = (value: string) => {
    if (value === 'all_employees') {
      setFormData(prev => ({
        ...prev,
        selectedEmployee: '',
        calculateAllEmployees: true
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedEmployee: value,
        calculateAllEmployees: false
      }));
    }
    
    // Auto-calculate when selection changes
    if (formData.type === 'PAYE_EMP201' && formData.period) {
      setTimeout(() => {
        calculateEMP201Amount();
      }, 100);
    }
  };

  // Auto-calculate EMP201 when type changes to PAYE_EMP201
  useEffect(() => {
    if (formData.type === 'PAYE_EMP201' && formData.period && (formData.selectedEmployee || formData.calculateAllEmployees)) {
      calculateEMP201Amount();
    } else if (formData.type !== 'PAYE_EMP201') {
      setShowEMP201Breakdown(false);
      setEmp201Data(null);
    }
  }, [formData.type, formData.selectedEmployee, formData.calculateAllEmployees]);

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

  const handleAddEMP201Return = async () => {
    if (!emp201Data) {
      toast.error('Please calculate PAYE/EMP201 first');
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
      
      // Save EMP201 calculation to localStorage
      emp201Service.saveEMP201Calculation(emp201Data);
      
      // Add to Business Tax Returns
      onAdd(taxReturn);
      
      toast.success('PAYE/EMP201 tax return added successfully', {
        description: `Total: R ${emp201Data.totalEMP201Amount.toLocaleString()} for ${emp201Data.totalEmployees} employee${emp201Data.totalEmployees !== 1 ? 's' : ''}`
      });
      handleClose();
    } catch (error) {
      console.error('Error adding EMP201 return:', error);
      toast.error('Failed to add PAYE/EMP201 tax return');
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

            {/* Employee Selection for PAYE/EMP201 */}
            {formData.type === 'PAYE_EMP201' && (
              <div className="space-y-2">
                <Label htmlFor="employeeSelection" className="text-sm font-medium text-slate-700">
                  Employee Selection *
                </Label>
                <Select
                  value={formData.calculateAllEmployees ? 'all_employees' : formData.selectedEmployee}
                  onValueChange={handleEmployeeSelectionChange}
                >
                  <SelectTrigger className="border-slate-200 focus:border-mokm-purple-500">
                    <SelectValue placeholder="Select employee or calculate for all" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_employees">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-mokm-purple-500" />
                        <span className="font-medium">Calculate All Employees</span>
                        <span className="text-xs text-slate-500">({employees.length} employees)</span>
                      </div>
                    </SelectItem>
                    <SelectSeparator />
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-mokm-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-mokm-purple-700">
                              {employee.firstName.charAt(0)}{employee.surname.charAt(0)}
                            </span>
                          </div>
                          <span>{employee.firstName} {employee.surname}</span>
                          <span className="text-xs text-slate-500">({employee.employeeNumber})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {employees.length === 0 && (
                  <p className="text-xs text-amber-600">
                    No employees found. Please add employees in HR Management first.
                  </p>
                )}
              </div>
            )}

            {/* Amount and Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Amount {(formData.type === 'VAT201' || formData.type === 'PAYE_EMP201') ? '(Auto-calculated)' : '(Optional)'}
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
                    className={`border-slate-200 focus:border-mokm-purple-500 ${errors.amount ? 'border-red-300' : ''} ${(formData.type === 'VAT201' || formData.type === 'PAYE_EMP201') ? 'bg-slate-50' : ''}`}
                    readOnly={formData.type === 'VAT201' || formData.type === 'PAYE_EMP201'}
                  />
                  {(formData.type === 'VAT201' || formData.type === 'PAYE_EMP201') && isCalculating && (
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
                {formData.type === 'PAYE_EMP201' && emp201Data && (
                  <p className="text-xs text-slate-600">
                    Total EMP201 Amount: R {emp201Data.totalEMP201Amount.toFixed(2)} 
                    ({emp201Data.totalEmployees} employee{emp201Data.totalEmployees !== 1 ? 's' : ''})
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
                
                {/* Output VAT Section */}
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-slate-800 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        Input VAT (VAT Collected)
                      </h5>
                      <span className="text-sm font-bold text-green-600">
                        R {vat201Data.inputVAT.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>• From Invoices ({vat201Data.breakdown?.invoiceCount || 0}):</span>
                        <span>R {((vat201Data.breakdown?.invoiceVAT || 0)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• From Sales ({vat201Data.breakdown?.salesCount || 0}):</span>
                        <span>R {((vat201Data.breakdown?.salesVAT || 0)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                        <span>Total Transactions: {(vat201Data.breakdown?.invoiceCount || 0) + (vat201Data.breakdown?.salesCount || 0)}</span>
                        <span>Period: {formData.period}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>VAT Rate: 15%</span>
                        <span>Last Updated: {new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Output VAT Section */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-slate-800 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        Output VAT (VAT Paid)
                      </h5>
                      <span className="text-sm font-bold text-blue-600">
                        R {vat201Data.outputVAT.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>• From Expenses with Receipts ({vat201Data.breakdown?.expenseCount || 0}):</span>
                        <span>R {((vat201Data.breakdown?.expenseVAT || 0)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                        <span>Total Receipts: {(vat201Data.breakdown?.expenseCount || 0)}</span>
                        <span>VAT Rate: 15%</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Calculation Method: Inclusive VAT</span>
                        <span>Formula: amount × (15 ÷ 115)</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Net VAT Section */}
                  <div className="bg-gradient-to-r from-mokm-purple-50 to-mokm-blue-50 p-3 rounded-lg border border-mokm-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-slate-800 flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-mokm-purple-600" />
                        Net VAT {vat201Data.netVAT >= 0 ? 'Payable' : 'Refundable'}
                      </h5>
                      <span className={`text-lg font-bold ${
                        vat201Data.netVAT >= 0 ? 'text-mokm-purple-600' : 'text-green-600'
                      }`}>
                        R {Math.abs(vat201Data.netVAT).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <div className="flex justify-between items-center">
                        <span>Input VAT - Output VAT = Net VAT</span>
                        <span className="text-mokm-purple-600 font-medium">
                          <span>R{vat201Data.inputVAT.total.toFixed(2)} - R{vat201Data.outputVAT.total.toFixed(2)} = R{vat201Data.netVAT.toFixed(2)}</span>
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-mokm-purple-100">
                        <div className="flex justify-between items-center">
                          <span>Total Transactions:</span>
                          <span className="font-medium">
                            {(vat201Data.breakdown?.invoiceCount || 0) + 
                             (vat201Data.breakdown?.salesCount || 0) + 
                             (vat201Data.breakdown?.expenseCount || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Tax Period:</span>
                          <span className="font-medium">{formData.period}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Last Updated:</span>
                          <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Calculation Info */}
                  <div className="text-center pt-2 border-t border-slate-200">
                    <p className="text-xs text-mokm-purple-600">
                      Last calculated: {new Date(vat201Data.calculationTimestamp || Date.now()).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Calculation includes invoices, confirmed sales, and expenses with receipts for period {formData.period}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PAYE/EMP201 Automation Info */}
            {formData.type === 'PAYE_EMP201' && (
              <div className="space-y-3 p-4 bg-gradient-to-r from-mokm-purple-50 to-mokm-orange-50 rounded-lg border border-mokm-purple-200">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-mokm-purple-600" />
                  <h4 className="font-medium text-mokm-purple-900">PAYE/EMP201 Automation Active</h4>
                </div>
                <div className="text-sm text-mokm-purple-800 space-y-1">
                  <p>✓ <strong>Tax Period:</strong> Auto-generated based on current month</p>
                  <p>✓ <strong>Due Date:</strong> Automatically set to 7th of following month</p>
                  <p>✓ <strong>PAYE:</strong> Calculated from employee payroll data using SARS 2024/2025 tax brackets</p>
                  <p>✓ <strong>UIF & SDL:</strong> Calculated according to South African labor law requirements</p>
                </div>
              </div>
            )}

            {/* EMP201 Breakdown */}
            {(() => {
              const shouldShow = formData.type === 'PAYE_EMP201' && showEMP201Breakdown && emp201Data;
              const hasData = !!emp201Data;
              console.log(`🔍 [AddReturnModal] Breakdown display check:`, {
                type: formData.type,
                showBreakdown: showEMP201Breakdown,
                hasData,
                shouldShow,
                emp201DataContent: emp201Data ? Object.keys(emp201Data) : 'null'
              });
              return shouldShow;
            })() && (
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">PAYE/EMP201 Calculation Breakdown</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEMP201Breakdown(!showEMP201Breakdown)}
                    className="text-xs"
                  >
                    {showEMP201Breakdown ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* PAYE Section */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-slate-800 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-red-600" />
                        PAYE
                      </h5>
                      <span className="text-sm font-bold text-red-600">
                        R {emp201Data?.totalPAYE?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Taxable Income:</span>
                        <span>R {emp201Data?.totalTaxableIncome?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Employees:</span>
                        <span>{emp201Data?.totalEmployees || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* UIF Section */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-slate-800 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        UIF
                      </h5>
                      <span className="text-sm font-bold text-blue-600">
                        R {emp201Data?.totalUIF?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Employee (1%):</span>
                        <span>R {emp201Data?.totalUIFEmployee?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Employer (1%):</span>
                        <span>R {emp201Data?.totalUIFEmployer?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* SDL Section */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-slate-800 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        SDL
                      </h5>
                      <span className="text-sm font-bold text-green-600">
                        R {emp201Data?.totalSDL?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Rate:</span>
                        <span>1% of payroll</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SDL Salaries:</span>
                        <span>R {emp201Data?.totalSDLSalaries?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Employee Breakdown Table */}
                {emp201Data?.employeeBreakdown && emp201Data.employeeBreakdown.length > 0 && (
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-100 border-b border-slate-200">
                      <h5 className="font-medium text-slate-800">Employee Breakdown</h5>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-slate-700">Employee</th>
                            <th className="px-3 py-2 text-right font-medium text-slate-700">Gross Salary</th>
                            <th className="px-3 py-2 text-right font-medium text-slate-700">Taxable Income</th>
                            <th className="px-3 py-2 text-right font-medium text-slate-700">PAYE</th>
                            <th className="px-3 py-2 text-right font-medium text-slate-700">UIF</th>
                            <th className="px-3 py-2 text-right font-medium text-slate-700">SDL</th>
                            <th className="px-3 py-2 text-right font-medium text-slate-700">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {emp201Data.employeeBreakdown.map((employee, index) => (
                            <tr key={employee.employeeId} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}>
                              <td className="px-3 py-2 font-medium text-slate-800">
                                {employee.employeeName}
                              </td>
                              <td className="px-3 py-2 text-right text-slate-600">
                                R {employee.grossSalary.toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-right text-slate-600">
                                R {employee.taxableIncome.toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-right text-red-600 font-medium">
                                R {employee.paye.toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-right text-blue-600 font-medium">
                                R {employee.uifTotal.toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-right text-green-600 font-medium">
                                R {employee.sdl.toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-right font-bold text-slate-800">
                                R {(employee.paye + employee.uifTotal + employee.sdl).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Total EMP201 Section */}
                <div className="bg-gradient-to-r from-mokm-purple-50 to-mokm-blue-50 p-3 rounded-lg border border-mokm-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-slate-800 flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-mokm-purple-600" />
                      Total EMP201 Amount
                    </h5>
                    <span className="text-lg font-bold text-mokm-purple-600">
                      R {emp201Data?.totalEMP201Amount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <div className="flex justify-between items-center">
                      <span>PAYE + UIF + SDL = Total</span>
                      <span className="text-mokm-purple-600 font-medium">
                        R{emp201Data?.totalPAYE?.toFixed(2) || '0.00'} + R{emp201Data?.totalUIF?.toFixed(2) || '0.00'} + R{emp201Data?.totalSDL?.toFixed(2) || '0.00'} = R{emp201Data?.totalEMP201Amount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-mokm-purple-100">
                      <div className="flex justify-between items-center">
                        <span>Total Employees:</span>
                        <span className="font-medium">{emp201Data?.totalEmployees || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Tax Period:</span>
                        <span className="font-medium">{emp201Data?.periodName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Last Updated:</span>
                        <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Calculation Info */}
                <div className="text-center pt-2 border-t border-slate-200">
                  <p className="text-xs text-mokm-purple-600">
                    Last calculated: {new Date().toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Calculation based on payroll data for period {emp201Data?.periodName || 'N/A'} using SARS 2024/2025 tax brackets
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
                  Add VAT 201 Return
                </Button>
              ) : formData.type === 'PAYE_EMP201' ? (
                <Button
                  type="button"
                  onClick={handleAddEMP201Return}
                  disabled={!emp201Data || isCalculating || (!formData.selectedEmployee && !formData.calculateAllEmployees)}
                  className="flex-1 bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add PAYE/EMP201 Return
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