import { PayrollCalculation } from '@/services/payrollCalculationService';

/**
 * Create sample payroll data for EMP201 testing
 * This creates realistic South African payroll data with proper tax calculations
 */
export const createSamplePayrollData = (): PayrollCalculation[] => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Create period string (YYYY-MM format)
  const period = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  
  const samplePayroll: PayrollCalculation[] = [
    {
      employeeId: 'emp-001',
      employeeName: 'Sarah Johnson',
      period,
      
      // Base Information
      baseSalary: 25000,
      hourlyRate: 144.23, // R25,000 / 173.33 hours
      
      // Hours Breakdown
      regularHours: 173.33,
      overtimeHours: 8,
      nightShiftHours: 0,
      leaveHours: 0,
      
      // Pay Calculations
      regularPay: 25000,
      overtimePay: 1730.76, // 8 hours × R144.23 × 1.5
      nightShiftPay: 0,
      leavePay: 0,
      attendancePay: 26730.76,
      
      // Allowances
      allowances: {
        thirteenthMonthBonus: 0,
        housingAllowance: 2000,
        medicalAidAllowance: 1500,
        motorVehicleAllowance: 3000,
        retirementPlan: 0,
        otherAllowances: 0,
        totalAllowances: 6500
      },
      
      // Gross Salary (attendance + allowances)
      grossSalary: 33230.76,
      
      // Deductions
      deductions: {
        tax: 4200, // PAYE calculated
        uif: 177.12, // Capped at R17,712 × 1%
        medicalAid: 1500,
        retirementFund: 2000,
        salaryAdvance: 0,
        otherDeductions: 0,
        totalDeductions: 7877.12
      },
      
      // Net Salary
      netSalary: 25353.64,
      
      // Status
      status: 'approved',
      calculatedDate: new Date().toISOString()
    },
    {
      employeeId: 'emp-002',
      employeeName: 'Michael Ndlovu',
      period,
      
      // Base Information
      baseSalary: 18000,
      hourlyRate: 103.85, // R18,000 / 173.33 hours
      
      // Hours Breakdown
      regularHours: 173.33,
      overtimeHours: 12,
      nightShiftHours: 16,
      leaveHours: 0,
      
      // Pay Calculations
      regularPay: 18000,
      overtimePay: 1869.30, // 12 hours × R103.85 × 1.5
      nightShiftPay: 1829.28, // 16 hours × R103.85 × 1.1
      leavePay: 0,
      attendancePay: 21698.58,
      
      // Allowances
      allowances: {
        thirteenthMonthBonus: 0,
        housingAllowance: 1000,
        medicalAidAllowance: 800,
        motorVehicleAllowance: 1500,
        retirementPlan: 0,
        otherAllowances: 0,
        totalAllowances: 3300
      },
      
      // Gross Salary
      grossSalary: 24998.58,
      
      // Deductions
      deductions: {
        tax: 2800, // PAYE calculated
        uif: 177.12, // Capped at R17,712 × 1%
        medicalAid: 800,
        retirementFund: 1500,
        salaryAdvance: 0,
        otherDeductions: 0,
        totalDeductions: 5277.12
      },
      
      // Net Salary
      netSalary: 19721.46,
      
      // Status
      status: 'approved',
      calculatedDate: new Date().toISOString()
    },
    {
      employeeId: 'emp-003',
      employeeName: 'Thandiwe Mthembu',
      period,
      
      // Base Information
      baseSalary: 45000,
      hourlyRate: 259.62, // R45,000 / 173.33 hours
      
      // Hours Breakdown
      regularHours: 173.33,
      overtimeHours: 5,
      nightShiftHours: 0,
      leaveHours: 8,
      
      // Pay Calculations
      regularPay: 45000,
      overtimePay: 1948.65, // 5 hours × R259.62 × 1.5
      nightShiftPay: 0,
      leavePay: 2076.96, // 8 hours × R259.62
      attendancePay: 49025.61,
      
      // Allowances
      allowances: {
        thirteenthMonthBonus: 0,
        housingAllowance: 3500,
        medicalAidAllowance: 2000,
        motorVehicleAllowance: 4000,
        retirementPlan: 0,
        otherAllowances: 500,
        totalAllowances: 10000
      },
      
      // Gross Salary
      grossSalary: 59025.61,
      
      // Deductions
      deductions: {
        tax: 12500, // PAYE calculated
        uif: 177.12, // Capped at R17,712 × 1%
        medicalAid: 2000,
        retirementFund: 4500,
        salaryAdvance: 0,
        otherDeductions: 0,
        totalDeductions: 19177.12
      },
      
      // Net Salary
      netSalary: 39848.49,
      
      // Status
      status: 'approved',
      calculatedDate: new Date().toISOString()
    },
    {
      employeeId: 'emp-004',
      employeeName: 'David van der Merwe',
      period,
      
      // Base Information
      baseSalary: 15000,
      hourlyRate: 86.54, // R15,000 / 173.33 hours
      
      // Hours Breakdown
      regularHours: 173.33,
      overtimeHours: 0,
      nightShiftHours: 0,
      leaveHours: 0,
      
      // Pay Calculations
      regularPay: 15000,
      overtimePay: 0,
      nightShiftPay: 0,
      leavePay: 0,
      attendancePay: 15000,
      
      // Allowances
      allowances: {
        thirteenthMonthBonus: 0,
        housingAllowance: 500,
        medicalAidAllowance: 0,
        motorVehicleAllowance: 800,
        retirementPlan: 0,
        otherAllowances: 0,
        totalAllowances: 1300
      },
      
      // Gross Salary
      grossSalary: 16300,
      
      // Deductions
      deductions: {
        tax: 1200, // PAYE calculated
        uif: 163.00, // R16,300 × 1% (under cap)
        medicalAid: 0,
        retirementFund: 800,
        salaryAdvance: 0,
        otherDeductions: 0,
        totalDeductions: 2163.00
      },
      
      // Net Salary
      netSalary: 14137.00,
      
      // Status
      status: 'approved',
      calculatedDate: new Date().toISOString()
    }
  ];
  
  return samplePayroll;
};

/**
 * Initialize sample payroll data in localStorage for EMP201 testing
 */
export const initializeSamplePayrollData = (): void => {
  try {
    const existingData = localStorage.getItem('payrollCalculations');
    if (!existingData) {
      const sampleData = createSamplePayrollData();
      localStorage.setItem('payrollCalculations', JSON.stringify(sampleData));
      console.log('✅ [EMP201TestData] Sample payroll data initialized for EMP201 testing');
      console.log(`📊 [EMP201TestData] Created ${sampleData.length} employee payroll records for period ${sampleData[0].period}`);
    } else {
      console.log('📋 [EMP201TestData] Payroll data already exists in localStorage');
    }
  } catch (error) {
    console.error('❌ [EMP201TestData] Error initializing sample payroll data:', error);
  }
};

/**
 * Get expected EMP201 totals for validation
 */
export const getExpectedEMP201Totals = () => {
  const sampleData = createSamplePayrollData();
  
  // Calculate expected totals
  const totalGrossSalary = sampleData.reduce((sum, emp) => sum + emp.grossSalary, 0);
  const totalPAYE = sampleData.reduce((sum, emp) => sum + emp.deductions.tax, 0);
  const totalUIFEmployee = sampleData.reduce((sum, emp) => sum + emp.deductions.uif, 0);
  const totalUIFEmployer = totalUIFEmployee; // Same as employee contribution
  const totalUIF = totalUIFEmployee + totalUIFEmployer;
  
  // SDL calculation (1% of total gross if annual payroll > R500,000)
  const annualPayrollEstimate = totalGrossSalary * 12;
  const isSDLApplicable = annualPayrollEstimate > 500000;
  const totalSDL = isSDLApplicable ? totalGrossSalary * 0.01 : 0;
  
  const totalEMP201 = totalPAYE + totalUIF + totalSDL;
  
  return {
    totalEmployees: sampleData.length,
    totalGrossSalary: Math.round(totalGrossSalary * 100) / 100,
    totalPAYE: Math.round(totalPAYE * 100) / 100,
    totalUIFEmployee: Math.round(totalUIFEmployee * 100) / 100,
    totalUIFEmployer: Math.round(totalUIFEmployer * 100) / 100,
    totalUIF: Math.round(totalUIF * 100) / 100,
    totalSDL: Math.round(totalSDL * 100) / 100,
    totalEMP201: Math.round(totalEMP201 * 100) / 100,
    annualPayrollEstimate: Math.round(annualPayrollEstimate * 100) / 100,
    isSDLApplicable,
    period: sampleData[0].period
  };
};
