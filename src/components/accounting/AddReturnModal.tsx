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
import { hrAccountingLinkService, AccountingEmployeeOption, HREmployeeData } from '../../services/hrAccountingLinkService';
import { directDeductionsLinkService, DirectPAYEUIFData } from '../../services/directDeductionsLinkService';
import { accountingPayeUifCalculatorService } from '../../services/accountingPayeUifCalculatorService';
import { stuckToastCleanupService } from '@/services/stuckToastCleanupService';
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
  const [hrEmployeeOptions, setHrEmployeeOptions] = useState<AccountingEmployeeOption[]>([]);
  const [selectedEmployeeHRData, setSelectedEmployeeHRData] = useState<HREmployeeData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showVATBreakdown, setShowVATBreakdown] = useState(false);
  const [showEMP201Breakdown, setShowEMP201Breakdown] = useState(false);
  // HR authoritative linkage state (read-only in Accounting)
  const [hrLinkedPAYE, setHrLinkedPAYE] = useState<number | null>(null);
  const [hrLinkedUIF, setHrLinkedUIF] = useState<number | null>(null);
  const [hrLinkedTotals, setHrLinkedTotals] = useState<{ paye: number; uif: number } | null>(null);
  const [isRefreshingHR, setIsRefreshingHR] = useState(false);

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
  const loadEmployees = async () => {
    try {
      console.log('🔗 [AddReturnModal] Loading employees directly from HR Payroll Calculations table...');
      
      // Sync HR data to Accounting first
      const syncSuccess = hrAccountingLinkService.syncHRToAccounting();
      if (!syncSuccess) {
        console.warn('⚠️ [AddReturnModal] HR-Accounting sync failed, falling back to regular employee service');
        const employeeList = getAllEmployees();
        setEmployees(employeeList);
        return;
      }
      
      // Get employee options from HR Payroll table
      const hrOptions = hrAccountingLinkService.getAccountingEmployeeOptions();
      setHrEmployeeOptions(hrOptions);
      
      // Also load regular employees for compatibility
      const employeeList = getAllEmployees();
      setEmployees(employeeList);
      
      console.log(`✅ [AddReturnModal] Loaded ${hrOptions.length} HR employees and ${employeeList.length} regular employees`);
      console.log('🎯 [AddReturnModal] HR Employee Options:', hrOptions.map(opt => ({
        id: opt.value,
        name: opt.label,
        attendancePay: opt.hrData.attendancePay
      })));
      
    } catch (error) {
      console.error('❌ [AddReturnModal] Error loading employees from HR:', error);
      // Fallback to regular employee loading
      const employeeList = getAllEmployees();
      setEmployees(employeeList);
    }
  };

  const loadHREmployeeOptions = async () => {
    try {
      const hrOptions = hrAccountingLinkService.getAccountingEmployeeOptions();
      setHrEmployeeOptions(hrOptions);
    } catch (error) {
      console.error('❌ [AddReturnModal] Error loading HR employee options:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
      loadHREmployeeOptions();
      
      // Clean up any stuck PAYE sync toasts when modal opens
      stuckToastCleanupService.forceCleanupAndShowStatus();
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
      // Load authoritative HR values for display
      setTimeout(() => {
        loadHRLinkedValues();
      }, 50);
      
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

  // Load authoritative HR Payroll PAYE/UIF values for selected scope
  const loadHRLinkedValues = () => {
    if (formData.type !== 'PAYE_EMP201' || !formData.period) return;
    try {
      const periodKey = `payroll_calculations_${formData.period}`;
      const raw = localStorage.getItem(periodKey) || localStorage.getItem('payrollCalculations');
      if (!raw) {
        setHrLinkedPAYE(null);
        setHrLinkedUIF(null);
        setHrLinkedTotals(null);
        console.warn('⚠️ [AddReturnModal] No HR payroll data found when loading HR-linked values');
        toast.warning('Payroll deductions not found', {
          description: 'Please open HR → Payroll → View Payroll Details to calculate payroll first.'
        });
        return;
      }
      const records: PayrollCalculation[] = JSON.parse(raw);
      const ts = new Date().toISOString();
      if (formData.calculateAllEmployees) {
        const paye = records.reduce((s, r) => s + (r.deductions?.tax || 0), 0);
        const uif = records.reduce((s, r) => s + (r.deductions?.uif || 0), 0);
        const payeRounded = Math.round(paye * 100) / 100;
        const uifRounded = Math.round(uif * 100) / 100;
        
        // Validate UIF cap (R177.12 per employee max)
        const maxUIF = records.length * 177.12;
        const cappedUIF = Math.min(uifRounded, maxUIF);
        
        setHrLinkedTotals({ paye: payeRounded, uif: cappedUIF });
        setHrLinkedPAYE(null);
        setHrLinkedUIF(null);
        localStorage.setItem('accounting_hr_link_snapshot', JSON.stringify({
          period: formData.period,
          scope: 'all',
          paye: payeRounded || 0,
          uif: cappedUIF || 0,
          timestamp: ts,
          employeeCount: records.length
        }));
        console.log(`🔗 [AddReturnModal] HR-linked totals refreshed for ${formData.period}: PAYE R${(payeRounded || 0).toFixed(2)}, UIF R${(cappedUIF || 0).toFixed(2)} (${records.length} employees) @ ${ts}`);
        
        if (uifRounded > maxUIF) {
          console.warn(`⚠️ [AddReturnModal] UIF exceeds cap: R${(uifRounded || 0).toFixed(2)} > R${(maxUIF || 0).toFixed(2)} (capped)`);
        }
      } else if (formData.selectedEmployee) {
        const rec = records.find(r => r.employeeId === formData.selectedEmployee);
        if (!rec) {
          setHrLinkedPAYE(null);
          setHrLinkedUIF(null);
          setHrLinkedTotals(null);
          console.warn('⚠️ [AddReturnModal] Selected employee not found in HR payroll when loading HR-linked values');
          toast.warning('Employee payroll not found', {
            description: 'Please calculate payroll for this employee in HR Management first.'
          });
          return;
        }
        const paye = Math.round((rec.deductions?.tax || 0) * 100) / 100;
        const rawUIF = Math.round((rec.deductions?.uif || 0) * 100) / 100;
        const cappedUIF = Math.min(rawUIF, 177.12); // Cap UIF at monthly maximum
        
        setHrLinkedPAYE(paye);
        setHrLinkedUIF(cappedUIF);
        setHrLinkedTotals(null);
        localStorage.setItem('accounting_hr_link_snapshot', JSON.stringify({
          period: formData.period,
          scope: 'single',
          employeeId: rec.employeeId,
          employeeName: rec.employeeName,
          paye,
          uif: cappedUIF,
          timestamp: ts
        }));
        console.log(`🔗 [AddReturnModal] HR-linked values refreshed for ${rec.employeeName} (${rec.employeeId}) in ${formData.period}: PAYE R${(paye || 0).toFixed(2)}, UIF R${(cappedUIF || 0).toFixed(2)} @ ${ts}`);
        
        if (rawUIF > 177.12) {
          console.warn(`⚠️ [AddReturnModal] Employee UIF exceeds cap: R${(rawUIF || 0).toFixed(2)} > R177.12 (capped)`);
        }
      } else {
        setHrLinkedPAYE(null);
        setHrLinkedUIF(null);
        setHrLinkedTotals(null);
      }
    } catch (error) {
      console.error('❌ [AddReturnModal] Failed to load HR-linked PAYE/UIF:', error);
      setHrLinkedPAYE(null);
      setHrLinkedUIF(null);
      setHrLinkedTotals(null);
      toast.error('Failed to load HR payroll values', {
        description: 'Please check console for details and try refreshing.'
      });
    }
  };

  // Manual refresh handler
  const handleRefreshFromHR = async () => {
    if (formData.type !== 'PAYE_EMP201') return;
    setIsRefreshingHR(true);
    try {
      console.log('🔄 [AddReturnModal] Refreshing from HR Payroll...');
      // Clear caches to avoid stale data
      hrAccountingLinkService.clearCache();
      localStorage.removeItem('emp201Calculations');
      localStorage.removeItem('cachedEMP201');
      localStorage.removeItem('accounting_hr_link_snapshot');
      
      // First load HR values, then recalculate EMP201
      loadHRLinkedValues();
      await calculateEMP201Amount();
      
      const scope = formData.calculateAllEmployees ? 'all employees' : (formData.selectedEmployee ? 'selected employee' : 'none');
      toast.success('Refreshed from HR Payroll', {
        description: `PAYE and UIF values reloaded for ${scope} (read-only in Accounting)`
      });
    } catch (error) {
      console.error('❌ [AddReturnModal] Error refreshing from HR:', error);
      toast.error('Failed to refresh from HR Payroll', {
        description: 'Please check that payroll is calculated in HR Management first.'
      });
    } finally {
      setIsRefreshingHR(false);
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
          amount: (vatData.netVAT || 0).toFixed(2)
        }));
      }
      
      console.log(`✅ [AddReturnModal] Safe VAT data for display:`, JSON.stringify(safeVatData));
      
      setFormData(prev => ({
        ...prev,
        amount: Math.abs(safeVatData.netVAT || 0).toFixed(2)
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

  // Helper function to ensure payroll data is available for EMP201 calculation
  const ensurePayrollDataAvailable = async (selectedEmployeeId?: string): Promise<boolean> => {
    console.log('🔄 [AddReturnModal] Ensuring payroll data is available for EMP201...');
    
    try {
      // Check if payroll data exists in localStorage
      const existingPayrollData = localStorage.getItem('payrollCalculations');
      
      if (existingPayrollData) {
        const payrollArray = JSON.parse(existingPayrollData);
        
        // If filtering for specific employee, check if that employee exists in payroll data
        if (selectedEmployeeId) {
          const employeeExists = payrollArray.some((p: any) => p.employeeId === selectedEmployeeId);
          if (employeeExists) {
            console.log('✅ [AddReturnModal] Selected employee found in existing payroll data');
            return true;
          } else {
            console.warn(`⚠️ [AddReturnModal] Selected employee ${selectedEmployeeId} not found in payroll data, regenerating...`);
          }
        } else {
          console.log(`✅ [AddReturnModal] Existing payroll data found with ${payrollArray.length} employees`);
          return true;
        }
      }
      
      // Generate fresh payroll data using payroll calculation service
      console.log('🔄 [AddReturnModal] Generating fresh payroll data...');
      const currentPeriod = new Date().toISOString().slice(0, 7); // "2025-01"
      const freshPayrollData = payrollCalculationService.calculateAllEmployeesPayroll(currentPeriod);
      
      if (freshPayrollData.length === 0) {
        console.warn('⚠️ [AddReturnModal] No employees available for payroll calculation');
        return false;
      }
      
      // Cache the fresh data
      localStorage.setItem('payrollCalculations', JSON.stringify(freshPayrollData));
      
      console.log(`✅ [AddReturnModal] Generated and cached fresh payroll data for ${freshPayrollData.length} employees`);
      
      // If filtering for specific employee, verify it now exists
      if (selectedEmployeeId) {
        const employeeExists = freshPayrollData.some(p => p.employeeId === selectedEmployeeId);
        if (!employeeExists) {
          console.error(`❌ [AddReturnModal] Selected employee ${selectedEmployeeId} still not found after regenerating payroll data`);
          return false;
        }
        console.log('✅ [AddReturnModal] Selected employee now available in fresh payroll data');
      }
      
      return true;
    } catch (error) {
      console.error('❌ [AddReturnModal] Error ensuring payroll data availability:', error);
      return false;
    }
  };

  // PAYE/EMP201 Calculation Function
  const calculateEMP201Amount = async () => {
    if (formData.type !== 'PAYE_EMP201' || !formData.period) return;

    setIsCalculating(true);
    try {
      console.log(`🔗 [AddReturnModal] Starting PAYE/EMP201 calculation using HR-Accounting Link Service`);
      console.log(`📊 [AddReturnModal] Period: ${formData.period}`);
      console.log(`👥 [AddReturnModal] Selection: ${formData.calculateAllEmployees ? 'ALL EMPLOYEES' : 'SINGLE EMPLOYEE'}`);
      console.log(`🎯 [AddReturnModal] Selected Employee ID: ${formData.selectedEmployee || 'None'}`);
      
      // NEW APPROACH: Use Direct Employee Deductions Management as authoritative source
      // PAYE and UIF values come directly from Employee Deductions Management
      // This replaces the failed Payroll Details sync approach
      
      let selectedEmployeeId: string | undefined = undefined;
      if (!formData.calculateAllEmployees && formData.selectedEmployee) {
        selectedEmployeeId = formData.selectedEmployee;
      }
      
      console.log(`🔗 [AddReturnModal] Starting PAYE/EMP201 calculation with HR-Accounting data mapping`);
      console.log(`📊 [AddReturnModal] Period: ${formData.period}`);
      console.log(`👥 [AddReturnModal] Selection: ${formData.calculateAllEmployees ? 'ALL EMPLOYEES' : 'SINGLE EMPLOYEE'}`);
      console.log(`🎯 [AddReturnModal] Selected Employee ID: ${selectedEmployeeId || 'None'}`);
      
      // Get HR employee options to validate selection
      const hrEmployeeOptions = hrAccountingLinkService.getAccountingEmployeeOptions();
      
      if (hrEmployeeOptions.length === 0) {
        throw new Error('No HR Payroll data found. Please calculate payroll in HR Management first.');
      }
      
      console.log(`✅ [AddReturnModal] Found ${hrEmployeeOptions.length} employees in HR Payroll`);
      
      // Validate selected employee if specified
      if (selectedEmployeeId) {
        const selectedOption = hrEmployeeOptions.find(opt => opt.value === selectedEmployeeId);
        if (!selectedOption) {
          throw new Error(`Selected employee (${selectedEmployeeId}) not found in HR Payroll data. Please ensure payroll is calculated first.`);
        }
        
        // Get PAYE-specific data mapping for the selected employee
        const payeMapping = hrAccountingLinkService.getPAYEDataMapping(selectedEmployeeId);
        
        console.log(`🔗 [AddReturnModal] PAYE data mapping for ${payeMapping.employeeName}:`);
        console.log(`    Gross Salary (from Base Salary): R${(payeMapping.grossSalary || 0).toFixed(2)}`);
        console.log(`    Taxable Income (from Attendance Pay): R${(payeMapping.taxableIncome || 0).toFixed(2)}`);
        console.log(`    Has Valid Data: ${payeMapping.hasValidData}`);
        
        if (payeMapping.warnings.length > 0) {
          console.warn(`⚠️ [AddReturnModal] HR Data warnings for ${payeMapping.employeeName}:`);
          payeMapping.warnings.forEach(warning => console.warn(`    - ${warning}`));
        }
      }
      
      // Get filtered payroll data using HR-Accounting link service
      const filteredPayrollData = hrAccountingLinkService.getFilteredPayrollForEMP201(selectedEmployeeId);
      
      if (filteredPayrollData.length === 0) {
        throw new Error('No payroll data found for the selected employee(s). Please ensure HR payroll calculations are completed first.');
      }
      
      console.log(`✅ [AddReturnModal] Retrieved ${filteredPayrollData.length} payroll record(s) from HR with proper field mapping`);
      
      // ACCOUNTING CALCULATION: Calculate EMP201 using Accounting PAYE/UIF Calculator from Taxable Income
      console.log(`🧮 [AddReturnModal] Calculating EMP201 using Accounting PAYE/UIF Calculator from Taxable Income...`);
      const emp201Result = createEMP201FromTaxableIncome(formData.period, filteredPayrollData, selectedEmployeeId);
      
      console.log(`✅ [AddReturnModal] EMP201 calculation completed:`, {
        totalEmployees: emp201Result.totalEmployees,
        totalTaxableIncome: emp201Result.totalTaxableIncome,
        totalPAYE: emp201Result.totalPAYE,
        totalEMP201Amount: emp201Result.totalEMP201Amount,
        employeeBreakdownCount: emp201Result.employeeBreakdown?.length || 0
      });
      
      // Verify the result matches our selection
      if (selectedEmployeeId && emp201Result.employeeBreakdown) {
        const expectedCount = 1;
        const actualCount = emp201Result.employeeBreakdown.length;
        
        if (actualCount !== expectedCount) {
          console.error(`❌ [AddReturnModal] Employee count mismatch: Expected ${expectedCount}, got ${actualCount}`);
          console.error(`❌ [AddReturnModal] Employee breakdown:`, emp201Result.employeeBreakdown.map(emp => ({
            id: emp.employeeId,
            name: emp.employeeName,
            taxableIncome: emp.taxableIncome
          })));
        } else {
          const employee = emp201Result.employeeBreakdown[0];
          console.log(`✅ [AddReturnModal] Single employee verification passed:`, {
            id: employee.employeeId,
            name: employee.employeeName,
            taxableIncome: employee.taxableIncome,
            matchesSelection: employee.employeeId === selectedEmployeeId
          });
        }
      }
      
      setEmp201Data(emp201Result);
      setShowEMP201Breakdown(true);
      
      // Update form amount
      setFormData(prev => ({
        ...prev,
        amount: (emp201Result.totalEMP201Amount || 0).toFixed(2)
      }));
      
      // NEW APPROACH: Values now come directly from Employee Deductions Management (authoritative source)
      console.log('✅ [AddReturnModal] PAYE/UIF values sourced directly from Employee Deductions Management (authoritative source)');
      
      const employeeDescription = selectedEmployeeId 
        ? `(${filteredPayrollData[0]?.employeeName || 'Selected Employee'})`
        : `(${emp201Result.totalEmployees} employees)`;
      
      toast.success(`EMP201 calculated successfully ${employeeDescription}`, {
        description: `Total: R ${emp201Result.totalEMP201Amount.toLocaleString()}`
      });
    } catch (error) {
      console.error('❌ [AddReturnModal] Error calculating EMP201:', error);
      toast.error(`Failed to calculate EMP201: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setEmp201Data(null);
      setShowEMP201Breakdown(false);
    } finally {
      setIsCalculating(false);
    }
  };

  // NEW APPROACH: Direct fetch from Employee Deductions Management
  const fetchPAYEUIFFromDeductions = React.useCallback((employeeId: string): DirectPAYEUIFData => {
    console.log('🔗 [AddReturnModal] Fetching PAYE/UIF directly from Employee Deductions Management...');
    return directDeductionsLinkService.fetchPAYEUIFFromDeductions(employeeId);
  }, []);

  // ACCOUNTING PAYE/UIF CALCULATION: Calculate directly from Taxable Income using SA tax requirements
  const createEMP201FromTaxableIncome = React.useCallback((period: string, payrollData: PayrollCalculation[], selectedEmployeeId?: string): EMP201Calculation => {
    console.log('💼 [AddReturnModal] Creating EMP201 using Accounting PAYE/UIF Calculator from Taxable Income');
    
    const periodName = formatPeriodName(period);
    const employeesWithMissingData: string[] = [];
    
    // Prepare employee data for batch calculation
    const employeesForCalculation = payrollData.map(payroll => {
      const taxableIncome = payroll.attendancePay || 0; // Use attendancePay as Taxable Income
      
      // Validate taxable income
      const validation = accountingPayeUifCalculatorService.validateTaxableIncome(taxableIncome);
      if (!validation.valid) {
        employeesWithMissingData.push(payroll.employeeName);
        console.warn(`⚠️ [AddReturnModal] ${payroll.employeeName}: ${validation.message}`);
      }
      
      return {
        employeeId: payroll.employeeId,
        employeeName: payroll.employeeName,
        taxableIncome: taxableIncome
      };
    });
    
    // Calculate PAYE and UIF using Accounting calculator
    const calculationResult = accountingPayeUifCalculatorService.calculateBatch(employeesForCalculation);
    
    // Build employee breakdown
    const employeeBreakdown = calculationResult.results.map(result => {
      const payrollRecord = payrollData.find(p => p.employeeId === result.employeeId);
      const grossSalary = payrollRecord?.baseSalary || 0;
      const uifSalary = Math.min(result.taxableIncome, 17712); // UIF salary cap
      const totalDeductions = result.paye + result.uif;
      const netSalary = grossSalary - totalDeductions;
      
      // Determine PAYE bracket for display
      let payeBracket = 'R0 - R7,100 (18%)';
      if (result.taxableIncome > 64733) payeBracket = 'R64,733+ (45%)';
      else if (result.taxableIncome > 36800) payeBracket = 'R36,800 - R64,733 (41%)';
      else if (result.taxableIncome > 26183) payeBracket = 'R26,183 - R36,800 (39%)';
      else if (result.taxableIncome > 19133) payeBracket = 'R19,133 - R26,183 (36%)';
      else if (result.taxableIncome > 11600) payeBracket = 'R11,600 - R19,133 (31%)';
      else if (result.taxableIncome > 7100) payeBracket = 'R7,100 - R11,600 (26%)';
      
      return {
        employeeId: result.employeeId,
        employeeName: result.employeeName,
        grossSalary: grossSalary,
        taxableIncome: result.taxableIncome,
        paye: result.paye,
        payeBracket: payeBracket,
        uifSalary: uifSalary,
        uifEmployee: result.uif,
        uifTotal: result.uif, // Only employee UIF for accounting
        sdl: 0, // SDL disabled per user request
        totalDeductions: totalDeductions,
        netSalary: netSalary,
        // Optional warning properties
        missingBaseSalary: grossSalary === 0,
        missingAttendancePay: result.taxableIncome === 0,
        warningMessage: result.taxableIncome === 0 ? 'Taxable Income missing — cannot calculate PAYE/UIF. Please set Taxable Income in HR/Payroll.' : undefined
      };
    });
    
    // Show warning if any employees have missing taxable income data
    if (employeesWithMissingData.length > 0) {
      const warningMessage = `Taxable Income missing for ${employeesWithMissingData.length} employee(s): ${employeesWithMissingData.join(', ')}. Please set Taxable Income in HR/Payroll.`;
      console.warn(`⚠️ [AddReturnModal] ${warningMessage}`);
      toast.warning('Missing Taxable Income', {
        description: warningMessage
      });
    }
    
    const totalTaxableIncome = calculationResult.results.reduce((sum, r) => sum + r.taxableIncome, 0);
    
    const result: EMP201Calculation = {
      period,
      periodName,
      totalEmployees: payrollData.length,
      totalPAYE: calculationResult.totalPAYE,
      totalTaxableIncome: Math.round(totalTaxableIncome * 100) / 100,
      totalUIF: calculationResult.totalUIF,
      totalUIFEmployee: calculationResult.totalUIF,
      totalUIFSalaries: Math.round(payrollData.reduce((sum, p) => sum + Math.min(p.attendancePay || 0, 17712), 0) * 100) / 100,
      totalSDL: 0, // Disabled per user request
      totalSDLSalaries: 0,
      isSDLApplicable: false,
      annualPayrollEstimate: Math.round(totalTaxableIncome * 12 * 100) / 100,
      totalEMP201Amount: Math.round((calculationResult.totalPAYE + calculationResult.totalUIF) * 100) / 100,
      employeeBreakdown,
      calculatedDate: calculationResult.calculatedAt
    };
    
    console.log('✅ [AddReturnModal] EMP201 created using Accounting PAYE/UIF Calculator:', {
      totalPAYE: result.totalPAYE,
      totalUIF: result.totalUIF,
      totalEMP201Amount: result.totalEMP201Amount,
      source: 'Accounting Calculation from Taxable Income',
      employeesWithMissingData: employeesWithMissingData.length
    });
    
    return result;
  }, []);

  // Format period name for display
  const formatPeriodName = React.useCallback((period: string): string => {
    try {
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
    } catch (error) {
      return period;
    }
  }, []);

  // Handle employee selection change with HR-Accounting linking
  const handleEmployeeSelectionChange = (value: string) => {
    console.log(`🔗 [AddReturnModal] Employee selection changed:`, value);
    
    // CRITICAL: Clear all cached data to prevent employee mixing
    hrAccountingLinkService.clearCache();
    localStorage.removeItem('emp201Calculations');
    localStorage.removeItem('cachedEMP201');
    localStorage.removeItem('emp201Cache');
    
    // Clear current EMP201 data to prevent mixing
    setEmp201Data(null);
    setShowEMP201Breakdown(false);
    
    if (value === 'all_employees') {
      setFormData(prev => ({
        ...prev,
        selectedEmployee: '',
        calculateAllEmployees: true
      }));
      setSelectedEmployeeHRData(null);
      console.log(`📊 [AddReturnModal] Selected: Calculate All Employees`);
    } else {
      setFormData(prev => ({
        ...prev,
        selectedEmployee: value,
        calculateAllEmployees: false
      }));
      
      // Validate employee selection against HR data
      const isValid = hrAccountingLinkService.validateEmployeeSelection(value);
      if (!isValid) {
        console.error(`❌ [AddReturnModal] Invalid employee selection - not found in HR Payroll table`);
        toast.error('Selected employee not found in HR Payroll data. Please ensure payroll is calculated first.');
        return;
      }
      
      // Get HR data for the selected employee
      const hrData = hrAccountingLinkService.getEmployeeHRData(value);
      if (hrData) {
        console.log(`✅ [AddReturnModal] Found HR data for employee:`, {
          name: hrData.employeeName,
          baseSalary: hrData.baseSalary,
          attendancePay: hrData.attendancePay,
          grossSalary: hrData.grossSalary
        });
        setSelectedEmployeeHRData(hrData);
        
        // Check for missing HR data and show warnings
        if (!hrData.baseSalary || hrData.baseSalary === 0) {
          toast.warning(`Missing HR Payroll value: Base Salary. Please review employee payroll record.`);
        }
        if (!hrData.attendancePay || hrData.attendancePay === 0) {
          toast.warning(`Missing HR Payroll value: Attendance Pay. Please review employee payroll record.`);
        }
      } else {
        console.warn(`⚠️ [AddReturnModal] No HR data found for employee: ${value}`);
        setSelectedEmployeeHRData(null);
        toast.warning(`No HR data found for selected employee. Please ensure payroll is calculated first.`);
      }
    }
    
    // Trigger EMP201 recalculation if period is set
    if (formData.type === 'PAYE_EMP201' && formData.period) {
      setTimeout(() => {
        calculateEMP201Amount();
        loadHRLinkedValues();
      }, 100);
    }
  };



  // Auto-calculate EMP201 when type changes to PAYE_EMP201
  useEffect(() => {
    if (formData.type === 'PAYE_EMP201' && formData.period && (formData.selectedEmployee || formData.calculateAllEmployees)) {
      calculateEMP201Amount();
      loadHRLinkedValues();
    } else if (formData.type !== 'PAYE_EMP201') {
      setShowEMP201Breakdown(false);
      setEmp201Data(null);
      setHrLinkedPAYE(null);
      setHrLinkedUIF(null);
      setHrLinkedTotals(null);
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
                        <span className="text-xs text-slate-500">
                          ({hrEmployeeOptions.length > 0 ? hrEmployeeOptions.length : employees.length} employees from HR Payroll)
                        </span>
                      </div>
                    </SelectItem>
                    <SelectSeparator />
                    {/* Use HR Employee Options if available, otherwise fallback to regular employees */}
                    {hrEmployeeOptions.length > 0 ? (
                      hrEmployeeOptions.map((hrOption) => (
                        <SelectItem key={hrOption.value} value={hrOption.value}>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-mokm-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-mokm-purple-700">
                                {hrOption.hrData.employeeName.split(' ').map(n => n.charAt(0)).join('')}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{hrOption.hrData.employeeName}</span>
                              <span className="text-xs text-slate-500">
                                HR Payroll: R {(hrOption.hrData.attendancePay || 0).toFixed(2)} taxable income
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      employees.map((employee) => (
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
                      ))
                    )}
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
                    Net VAT {vat201Data.netVAT >= 0 ? 'Payable' : 'Refundable'}: R {Math.abs(vat201Data.netVAT || 0).toFixed(2)}
                  </p>
                )}
                {formData.type === 'PAYE_EMP201' && emp201Data && (
                  <p className="text-xs text-slate-600">
                    Total EMP201 Amount: R {(emp201Data.totalEMP201Amount || 0).toFixed(2)} 
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
                        R {(vat201Data.inputVAT.total || 0).toFixed(2)}
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
                        R {(vat201Data.outputVAT.total || 0).toFixed(2)}
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
                        R {Math.abs(vat201Data.netVAT || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <div className="flex justify-between items-center">
                        <span>Input VAT - Output VAT = Net VAT</span>
                        <span className="text-mokm-purple-600 font-medium">
                          <span>R{(vat201Data.inputVAT.total || 0).toFixed(2)} - R{(vat201Data.outputVAT.total || 0).toFixed(2)} = R{(vat201Data.netVAT || 0).toFixed(2)}</span>
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
                  <p>✓ <strong>PAYE & UIF:</strong> Calculated from Taxable Income using South African tax requirements</p>
                </div>
              </div>
            )}

            {/* HR Payroll Linked Values (read-only) */}
            {formData.type === 'PAYE_EMP201' && (
              <div className="space-y-3 p-4 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-slate-900">HR Payroll Linked Values (read-only)</h5>
                    <p className="text-xs text-slate-500">Source: HR Management › Payroll › Deductions Breakdown. Edit in HR Payroll only.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleRefreshFromHR} disabled={isRefreshingHR}>
                    {isRefreshingHR ? 'Refreshing…' : 'Refresh from HR'}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.calculateAllEmployees ? (
                    <>
                      <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <div className="text-xs text-slate-600 flex items-center gap-1">
                          Total PAYE (HR)
                          <span className="flex w-3 h-3 bg-mokm-purple-100 rounded-full text-[8px] text-mokm-purple-700 items-center justify-center" title="Source: HR Payroll → Deductions">i</span>
                        </div>
                        <div className="text-lg font-semibold text-slate-900">
                          R {hrLinkedTotals ? (hrLinkedTotals.paye || 0).toFixed(2) : '0.00'}
                        </div>
                        {hrLinkedTotals && hrLinkedTotals.paye !== (emp201Data?.totalPAYE || 0) && (
                          <div className="text-[10px] text-amber-700 mt-1">Payroll value differs — showing HR Payroll value.</div>
                        )}
                      </div>
                      <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <div className="text-xs text-slate-600 flex items-center gap-1">
                          Total UIF (HR)
                          <span className="flex w-3 h-3 bg-mokm-purple-100 rounded-full text-[8px] text-mokm-purple-700 items-center justify-center" title="Source: HR Payroll → Deductions">i</span>
                        </div>
                        <div className="text-lg font-semibold text-slate-900">
                          R {hrLinkedTotals ? (hrLinkedTotals.uif || 0).toFixed(2) : '0.00'}
                        </div>
                        {emp201Data && emp201Data.totalUIFSalaries < emp201Data.totalTaxableIncome && (
                          <div className="text-[10px] text-amber-700 mt-1">UIF capped at R17,712 salary per employee</div>
                        )}
                        {hrLinkedTotals && hrLinkedTotals.uif > 177.12 && (
                          <div className="text-[10px] text-amber-700 mt-1">UIF exceeds monthly cap (R177.12) — capped in calculation</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <div className="text-xs text-slate-600 flex items-center gap-1">
                          Employee PAYE (HR)
                          <span className="flex w-3 h-3 bg-mokm-purple-100 rounded-full text-[8px] text-mokm-purple-700 items-center justify-center" title="Source: HR Payroll → Deductions Breakdown">i</span>
                        </div>
                        <div className="text-lg font-semibold text-slate-900">
                          R {hrLinkedPAYE !== null ? (hrLinkedPAYE || 0).toFixed(2) : '0.00'}
                        </div>
                        {hrLinkedPAYE !== null && emp201Data?.employeeBreakdown?.[0] && hrLinkedPAYE !== emp201Data.employeeBreakdown[0].paye && (
                          <div className="text-[10px] text-amber-700 mt-1">Payroll value differs — showing HR Payroll value.</div>
                        )}
                      </div>
                      <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <div className="text-xs text-slate-600 flex items-center gap-1">
                          Employee UIF (HR)
                          <span className="flex w-3 h-3 bg-mokm-purple-100 rounded-full text-[8px] text-mokm-purple-700 items-center justify-center" title="Source: HR Payroll → Deductions Breakdown">i</span>
                        </div>
                        <div className="text-lg font-semibold text-slate-900">
                          R {hrLinkedUIF !== null ? (hrLinkedUIF || 0).toFixed(2) : '0.00'}
                        </div>
                        {(() => {
                          const b = emp201Data?.employeeBreakdown?.[0];
                          return b && b.uifSalary < b.taxableIncome ? (
                            <div className="text-[10px] text-amber-700 mt-1">UIF capped at R17,712 salary</div>
                          ) : null;
                        })()}
                        {hrLinkedUIF !== null && hrLinkedUIF > 177.12 && (
                          <div className="text-[10px] text-amber-700 mt-1">UIF exceeds monthly cap (R177.12) — capped in calculation</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="text-center pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    Last synced: {(() => {
                      try {
                        const snapshot = localStorage.getItem('accounting_hr_link_snapshot');
                        if (snapshot) {
                          const data = JSON.parse(snapshot);
                          return new Date(data.timestamp).toLocaleString();
                        }
                      } catch (e) {}
                      return 'Never';
                    })()}
                  </p>
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
                        <span 
                          className="flex w-3 h-3 bg-blue-100 rounded-full text-[8px] text-blue-700 items-center justify-center cursor-help" 
                          title="Calculated from Taxable Income (source field)"
                        >
                          ✓
                        </span>
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
                        <span 
                          className="flex w-3 h-3 bg-blue-100 rounded-full text-[8px] text-blue-700 items-center justify-center cursor-help" 
                          title="Calculated from Taxable Income (source field)"
                        >
                          ✓
                        </span>
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
                        <span>R {emp201Data?.totalUIFEmployee?.toFixed(2) || '0.00'}</span>
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
                            <React.Fragment key={employee.employeeId}>
                              <tr className={index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}>
                                <td className="px-3 py-2 font-medium text-slate-800">
                                  {employee.employeeName}
                                </td>
                                <td className="px-3 py-2 text-right text-slate-600">
                                  <div className="flex flex-col items-end">
                                    <span>R {(employee.grossSalary || 0).toFixed(2)}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-right text-slate-600">
                                  <div className="flex flex-col items-end">
                                    <span>R {(employee.taxableIncome || 0).toFixed(2)}</span>
                                    {employee.hasNegativeTaxableIncome && (
                                      <span className="text-xs text-amber-600 italic">
                                        Adjusted from R{(employee.rawTaxableIncome || 0).toFixed(2)}
                                      </span>
                                    )}
                                    {employee.taxableIncome <= 0 && (
                                      <span className="text-xs text-amber-600 italic">
                                        Attendance Pay is zero/negative — PAYE set to R0.00. Review HR payroll deductions.
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-right text-red-600 font-medium">
                                  R {(employee.paye || 0).toFixed(2)}
                                </td>
                                <td className="px-3 py-2 text-right text-blue-600 font-medium">
                                  R {(employee.uifTotal || 0).toFixed(2)}
                                </td>
                                <td className="px-3 py-2 text-right text-green-600 font-medium">
                                  R {(employee.sdl || 0).toFixed(2)}
                                </td>
                                <td className="px-3 py-2 text-right font-bold text-slate-800">
                                  R {((employee.paye || 0) + (employee.uifTotal || 0) + (employee.sdl || 0)).toFixed(2)}
                                </td>
                              </tr>
                              {employee.hasNegativeTaxableIncome && (
                                <tr className={index % 2 === 0 ? 'bg-amber-50' : 'bg-amber-25'}>
                                  <td colSpan={7} className="px-3 py-2 text-xs text-amber-700 border-l-4 border-amber-400">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">⚠️ Warning:</span>
                                      <span>Taxable income was negative (R{(employee.rawTaxableIncome || 0).toFixed(2)}) — set to R0.00. Please review HR deductions.</span>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
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
                        R{(emp201Data?.totalPAYE || 0).toFixed(2)} + R{(emp201Data?.totalUIF || 0).toFixed(2)} + R{(emp201Data?.totalSDL || 0).toFixed(2)} = R{(emp201Data?.totalEMP201Amount || 0).toFixed(2)}
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
                    <strong>Calculated from Taxable Income (source field).</strong> PAYE uses SARS 2025/2026 tax brackets. UIF is 1% of Taxable Income, capped at R177.12 monthly.
                  </p>
                  {emp201Data?.employeeBreakdown?.some(emp => emp.warningMessage) && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Some employees have missing Taxable Income — please set Taxable Income in HR/Payroll.
                    </p>
                  )}
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