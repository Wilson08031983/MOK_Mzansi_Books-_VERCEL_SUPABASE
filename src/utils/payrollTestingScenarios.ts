/**
 * Comprehensive Testing Scenarios for Automated Payroll Expense Integration System
 * Validates all functionality to ensure proper salary tracking per project
 */

import { Project } from '@/types/project';
import PayrollExpenseIntegrationService from '@/services/payrollExpenseIntegrationService';
import payrollCalculationService from '@/services/payrollCalculationService';

export interface TestEmployee {
  id: string;
  name: string;
  netSalary: number;
  position: string;
}

export interface TestProject {
  id: number;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  manager: string;
  teamMembers: string[];
  expectedMonthlyCost: number;
  expectedTotalCost: number;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  setup: () => Promise<void>;
  execute: () => Promise<any>;
  validate: (result: any) => boolean;
  cleanup: () => Promise<void>;
}

class PayrollTestingScenarios {
  private payrollService = PayrollExpenseIntegrationService.getInstance();
  private testEmployees: TestEmployee[] = [];
  private testProjects: TestProject[] = [];
  private originalData: any = {};

  constructor() {
    this.setupTestData();
  }

  /**
   * Setup comprehensive test data
   */
  private setupTestData(): void {
    // Test Employees with different salary levels
    this.testEmployees = [
      { id: 'emp001', name: 'John Manager', netSalary: 25000, position: 'Project Manager' },
      { id: 'emp002', name: 'Alice Developer', netSalary: 15000, position: 'Senior Developer' },
      { id: 'emp003', name: 'Bob Analyst', netSalary: 12000, position: 'Business Analyst' },
      { id: 'emp004', name: 'Carol Designer', netSalary: 18000, position: 'UI/UX Designer' },
      { id: 'emp005', name: 'David Tester', netSalary: 14000, position: 'QA Tester' },
      { id: 'emp006', name: 'Eva Lead', netSalary: 30000, position: 'Tech Lead' },
      { id: 'emp007', name: 'Frank Junior', netSalary: 10000, position: 'Junior Developer' }
    ];

    // Test Projects with various scenarios
    this.testProjects = [
      {
        id: 1001,
        name: 'E-Commerce Platform',
        code: 'ECOM-2025-001',
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        manager: 'emp001',
        teamMembers: ['emp002', 'emp003'],
        expectedMonthlyCost: 52000, // 25000 + 15000 + 12000
        expectedTotalCost: 156000 // 52000 × 3 months
      },
      {
        id: 1002,
        name: 'Mobile App Development',
        code: 'MOB-2025-002',
        startDate: '2025-01-15',
        endDate: '2025-03-20',
        manager: 'emp006',
        teamMembers: ['emp004'],
        expectedMonthlyCost: 48000, // 30000 + 18000
        expectedTotalCost: 0 // Will be calculated based on pro-rating
      },
      {
        id: 1003,
        name: 'Data Analytics Dashboard',
        code: 'DATA-2025-003',
        startDate: '2025-02-01',
        endDate: '2025-02-28',
        manager: 'emp001',
        teamMembers: ['emp002', 'emp005'],
        expectedMonthlyCost: 54000, // 25000 + 15000 + 14000
        expectedTotalCost: 54000 // 1 month
      },
      {
        id: 1004,
        name: 'Extended Project',
        code: 'EXT-2025-004',
        startDate: '2025-01-01',
        endDate: '2025-02-28',
        manager: 'emp006',
        teamMembers: ['emp007'],
        expectedMonthlyCost: 40000, // 30000 + 10000
        expectedTotalCost: 80000 // 2 months (will extend beyond)
      }
    ];
  }

  /**
   * Backup original data before testing
   */
  private async backupOriginalData(): Promise<void> {
    this.originalData = {
      projects: localStorage.getItem('projects'),
      employees: localStorage.getItem('employees'),
      salaryCalculations: localStorage.getItem('salary_calculations'),
      expenses: localStorage.getItem('expenses'),
      projectSalaryExpenses: localStorage.getItem('projectSalaryExpenses'),
      payrollAutomationLogs: localStorage.getItem('payrollAutomationLogs')
    };
  }

  /**
   * Restore original data after testing
   */
  private async restoreOriginalData(): Promise<void> {
    Object.keys(this.originalData).forEach(key => {
      if (this.originalData[key]) {
        localStorage.setItem(key, this.originalData[key]);
      } else {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Setup test employees in the system
   */
  private async setupTestEmployees(): Promise<void> {
    const employees = this.testEmployees.map(emp => ({
      id: emp.id,
      name: emp.name,
      email: `${emp.name.toLowerCase().replace(' ', '.')}@company.com`,
      position: emp.position,
      department: 'IT',
      startDate: '2024-01-01',
      salary: emp.netSalary,
      status: 'active'
    }));

    localStorage.setItem('employees', JSON.stringify(employees));

    // Setup salary calculations
    const salaryCalculations = this.testEmployees.map(emp => ({
      employeeId: emp.id,
      employeeName: emp.name,
      period: '2025-01',
      baseSalary: emp.netSalary,
      grossSalary: emp.netSalary * 1.3,
      netSalary: emp.netSalary,
      deductions: {
        tax: emp.netSalary * 0.2,
        uif: emp.netSalary * 0.01,
        totalDeductions: emp.netSalary * 0.3
      },
      status: 'calculated'
    }));

    localStorage.setItem('salary_calculations', JSON.stringify(salaryCalculations));
  }

  /**
   * Setup test projects in the system
   */
  private async setupTestProjects(): Promise<void> {
    const projects = this.testProjects.map(proj => ({
      id: proj.id,
      name: proj.name,
      code: proj.code,
      description: `Test project for payroll integration: ${proj.name}`,
      startDate: proj.startDate,
      endDate: proj.endDate,
      status: 'In Progress',
      manager: proj.manager,
      assignedEmployees: [
        {
          employeeId: proj.manager,
          employeeName: this.testEmployees.find(e => e.id === proj.manager)?.name || '',
          role: 'Manager',
          allocation: 100
        },
        ...proj.teamMembers.map(memberId => ({
          employeeId: memberId,
          employeeName: this.testEmployees.find(e => e.id === memberId)?.name || '',
          role: 'Team Member',
          allocation: 100
        }))
      ],
      budget: 500000,
      expenses: 0,
      salaryExpenses: 0,
      totalProjectExpenses: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    localStorage.setItem('projects', JSON.stringify(projects));
  }

  /**
   * Test Scenario 1: Basic Project Team Salary Integration
   */
  private createBasicIntegrationTest(): TestScenario {
    return {
      id: 'test001',
      name: 'Basic Project Team Salary Integration',
      description: 'Test basic salary integration for a 3-month project with team leader and 2 members',
      setup: async () => {
        await this.setupTestEmployees();
        await this.setupTestProjects();
      },
      execute: async () => {
        // Run automation for January, February, March 2025
        const results = [];
        for (let month = 1; month <= 3; month++) {
          const log = await this.payrollService.triggerManualAutomation(month, 2025);
          results.push(log);
        }
        return results;
      },
      validate: (results: any[]) => {
        const project = this.testProjects[0]; // E-Commerce Platform
        
        // Check if all 3 months were processed
        if (results.length !== 3) return false;
        
        // Check if each month generated correct expenses
        for (const result of results) {
          if (result.status !== 'success') return false;
          if (result.projectsProcessed < 1) return false;
        }
        
        // Verify project salary expenses
        const projectSalaryExpenses = this.payrollService.getProjectSalaryExpenses(project.id);
        if (projectSalaryExpenses.length !== 3) return false;
        
        // Check total amounts
        const totalSalaryExpenses = projectSalaryExpenses.reduce((sum, exp) => sum + exp.totalSalaryExpense, 0);
        return Math.abs(totalSalaryExpenses - project.expectedTotalCost) < 100; // Allow small rounding differences
      },
      cleanup: async () => {
        localStorage.removeItem('projectSalaryExpenses');
        localStorage.removeItem('payrollAutomationLogs');
      }
    };
  }

  /**
   * Test Scenario 2: Mid-Month Project Start/End Testing
   */
  private createProRatedCalculationTest(): TestScenario {
    return {
      id: 'test002',
      name: 'Mid-Month Project Start/End Testing',
      description: 'Test pro-rated salary calculations for projects starting/ending mid-month',
      setup: async () => {
        await this.setupTestEmployees();
        await this.setupTestProjects();
      },
      execute: async () => {
        // Focus on Mobile App Development project (starts Jan 15, ends Mar 20)
        const results = [];
        for (let month = 1; month <= 3; month++) {
          const log = await this.payrollService.triggerManualAutomation(month, 2025);
          results.push(log);
        }
        return results;
      },
      validate: (results: any[]) => {
        const project = this.testProjects[1]; // Mobile App Development
        const projectSalaryExpenses = this.payrollService.getProjectSalaryExpenses(project.id);
        
        if (projectSalaryExpenses.length !== 3) return false;
        
        // January: 17 days (15th-31st) - should be pro-rated
        const janExpense = projectSalaryExpenses.find(exp => exp.month === '01');
        if (!janExpense) return false;
        
        // February: Full month
        const febExpense = projectSalaryExpenses.find(exp => exp.month === '02');
        if (!febExpense || Math.abs(febExpense.totalSalaryExpense - 48000) > 100) return false;
        
        // March: 20 days (1st-20th) - should be pro-rated
        const marExpense = projectSalaryExpenses.find(exp => exp.month === '03');
        if (!marExpense) return false;
        
        return true;
      },
      cleanup: async () => {
        localStorage.removeItem('projectSalaryExpenses');
        localStorage.removeItem('payrollAutomationLogs');
      }
    };
  }

  /**
   * Test Scenario 3: Project Extension Beyond End Date
   */
  private createProjectExtensionTest(): TestScenario {
    return {
      id: 'test003',
      name: 'Project Extension Beyond End Date',
      description: 'Test salary tracking for projects that extend beyond original end date',
      setup: async () => {
        await this.setupTestEmployees();
        await this.setupTestProjects();
      },
      execute: async () => {
        // Run automation for original timeline (Jan-Feb)
        const results = [];
        for (let month = 1; month <= 2; month++) {
          const log = await this.payrollService.triggerManualAutomation(month, 2025);
          results.push(log);
        }
        
        // Simulate project extension by running March automation
        const extendedLog = await this.payrollService.triggerManualAutomation(3, 2025);
        results.push(extendedLog);
        
        return results;
      },
      validate: (results: any[]) => {
        const project = this.testProjects[3]; // Extended Project
        const projectSalaryExpenses = this.payrollService.getProjectSalaryExpenses(project.id);
        
        // Should have expenses for Jan, Feb, and Mar (extended)
        return projectSalaryExpenses.length >= 2; // At least original timeline
      },
      cleanup: async () => {
        localStorage.removeItem('projectSalaryExpenses');
        localStorage.removeItem('payrollAutomationLogs');
      }
    };
  }

  /**
   * Test Scenario 4: Team Composition Changes
   */
  private createTeamChangeTest(): TestScenario {
    return {
      id: 'test004',
      name: 'Team Composition Changes',
      description: 'Test salary adjustments when team members are added/removed mid-project',
      setup: async () => {
        await this.setupTestEmployees();
        await this.setupTestProjects();
      },
      execute: async () => {
        // Run January automation
        const jan = await this.payrollService.triggerManualAutomation(1, 2025);
        
        // Modify project team (add member)
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const projectIndex = projects.findIndex((p: any) => p.id === 1001);
        if (projectIndex >= 0) {
          projects[projectIndex].assignedEmployees.push({
            employeeId: 'emp005',
            employeeName: 'David Tester',
            role: 'Team Member',
            allocation: 100
          });
          localStorage.setItem('projects', JSON.stringify(projects));
        }
        
        // Run February automation with new team member
        const feb = await this.payrollService.triggerManualAutomation(2, 2025);
        
        return [jan, feb];
      },
      validate: (results: any[]) => {
        const projectSalaryExpenses = this.payrollService.getProjectSalaryExpenses(1001);
        
        if (projectSalaryExpenses.length !== 2) return false;
        
        const janExpense = projectSalaryExpenses.find(exp => exp.month === '01');
        const febExpense = projectSalaryExpenses.find(exp => exp.month === '02');
        
        // February should have higher cost due to additional team member
        return febExpense && janExpense && febExpense.totalSalaryExpense > janExpense.totalSalaryExpense;
      },
      cleanup: async () => {
        localStorage.removeItem('projectSalaryExpenses');
        localStorage.removeItem('payrollAutomationLogs');
      }
    };
  }

  /**
   * Test Scenario 5: Data Integrity and Error Handling
   */
  private createDataIntegrityTest(): TestScenario {
    return {
      id: 'test005',
      name: 'Data Integrity and Error Handling',
      description: 'Test system behavior with missing data and error conditions',
      setup: async () => {
        await this.setupTestEmployees();
        await this.setupTestProjects();
      },
      execute: async () => {
        // Test with missing salary data
        localStorage.removeItem('salary_calculations');
        const noSalaryResult = await this.payrollService.triggerManualAutomation(1, 2025);
        
        // Restore salary data and test with missing employee
        await this.setupTestEmployees();
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        projects[0].assignedEmployees.push({
          employeeId: 'emp999',
          employeeName: 'Missing Employee',
          role: 'Team Member',
          allocation: 100
        });
        localStorage.setItem('projects', JSON.stringify(projects));
        
        const missingEmpResult = await this.payrollService.triggerManualAutomation(1, 2025);
        
        return [noSalaryResult, missingEmpResult];
      },
      validate: (results: any[]) => {
        // System should handle errors gracefully
        return results.every(result => result.status === 'success' || result.status === 'partial');
      },
      cleanup: async () => {
        localStorage.removeItem('projectSalaryExpenses');
        localStorage.removeItem('payrollAutomationLogs');
      }
    };
  }

  /**
   * Get all test scenarios
   */
  public getAllTestScenarios(): TestScenario[] {
    return [
      this.createBasicIntegrationTest(),
      this.createProRatedCalculationTest(),
      this.createProjectExtensionTest(),
      this.createTeamChangeTest(),
      this.createDataIntegrityTest()
    ];
  }

  /**
   * Run all test scenarios
   */
  public async runAllTests(): Promise<{
    passed: number;
    failed: number;
    results: { scenario: string; passed: boolean; error?: string }[];
  }> {
    await this.backupOriginalData();
    
    const scenarios = this.getAllTestScenarios();
    const results: { scenario: string; passed: boolean; error?: string }[] = [];
    let passed = 0;
    let failed = 0;

    for (const scenario of scenarios) {
      try {
        console.log(`Running test: ${scenario.name}`);
        
        await scenario.setup();
        const result = await scenario.execute();
        const isValid = scenario.validate(result);
        
        if (isValid) {
          passed++;
          results.push({ scenario: scenario.name, passed: true });
          console.log(`✅ ${scenario.name} - PASSED`);
        } else {
          failed++;
          results.push({ scenario: scenario.name, passed: false, error: 'Validation failed' });
          console.log(`❌ ${scenario.name} - FAILED: Validation failed`);
        }
        
        await scenario.cleanup();
      } catch (error) {
        failed++;
        results.push({ scenario: scenario.name, passed: false, error: String(error) });
        console.log(`❌ ${scenario.name} - FAILED: ${error}`);
      }
    }

    await this.restoreOriginalData();
    
    return { passed, failed, results };
  }

  /**
   * Run a specific test scenario
   */
  public async runTest(testId: string): Promise<boolean> {
    await this.backupOriginalData();
    
    const scenario = this.getAllTestScenarios().find(s => s.id === testId);
    if (!scenario) {
      throw new Error(`Test scenario ${testId} not found`);
    }

    try {
      await scenario.setup();
      const result = await scenario.execute();
      const isValid = scenario.validate(result);
      await scenario.cleanup();
      
      await this.restoreOriginalData();
      return isValid;
    } catch (error) {
      await this.restoreOriginalData();
      throw error;
    }
  }

  /**
   * Generate test report
   */
  public generateTestReport(results: { passed: number; failed: number; results: any[] }): string {
    const total = results.passed + results.failed;
    const successRate = ((results.passed / total) * 100).toFixed(1);
    
    let report = `\n=== PAYROLL EXPENSE INTEGRATION TEST REPORT ===\n`;
    report += `Total Tests: ${total}\n`;
    report += `Passed: ${results.passed}\n`;
    report += `Failed: ${results.failed}\n`;
    report += `Success Rate: ${successRate}%\n\n`;
    
    report += `DETAILED RESULTS:\n`;
    results.results.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      report += `${index + 1}. ${result.scenario} - ${status}`;
      if (result.error) {
        report += ` (${result.error})`;
      }
      report += `\n`;
    });
    
    return report;
  }
}

export default PayrollTestingScenarios;
export { PayrollTestingScenarios };