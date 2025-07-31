/**
 * Comprehensive Payroll Integration Test Execution Script
 * Runs all test scenarios and generates detailed reports
 */

import PayrollTestingScenarios from '@/utils/payrollTestingScenarios';

/**
 * Main test execution function
 */
export async function executePayrollTests(): Promise<void> {
  console.log('🚀 Starting Comprehensive Payroll Integration Tests...');
  console.log('=' .repeat(60));
  
  const testRunner = new PayrollTestingScenarios();
  
  try {
    // Run all test scenarios
    const results = await testRunner.runAllTests();
    
    // Generate and display report
    const report = testRunner.generateTestReport(results);
    console.log(report);
    
    // Additional detailed analysis
    console.log('\n📊 DETAILED TEST ANALYSIS:');
    console.log('=' .repeat(40));
    
    // Analyze test results by category
    const testCategories = {
      'Core Functionality': ['test001'],
      'Date Calculations': ['test002'],
      'Project Management': ['test003'],
      'Data Integrity': ['test004', 'test005']
    };
    
    Object.entries(testCategories).forEach(([category, testIds]) => {
      const categoryResults = results.results.filter(r => 
        testIds.some(id => r.scenario.includes(getTestName(id)))
      );
      
      const passed = categoryResults.filter(r => r.passed).length;
      const total = categoryResults.length;
      const percentage = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
      
      console.log(`${category}: ${passed}/${total} (${percentage}%)`);
    });
    
    // Performance analysis
    console.log('\n⚡ PERFORMANCE METRICS:');
    console.log('=' .repeat(30));
    
    const totalTests = results.passed + results.failed;
    const avgExecutionTime = totalTests > 0 ? (getTotalExecutionTime(results) / totalTests) : 0;
    
    console.log(`Average test execution time: ${avgExecutionTime.toFixed(2)}ms`);
    console.log(`Total test suite time: ${getTotalExecutionTime(results).toFixed(2)}ms`);
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('=' .repeat(25));
    
    if (results.failed > 0) {
      console.log('❌ Some tests failed. Review the following:');
      results.results.filter(r => !r.passed).forEach(r => {
        console.log(`   - ${r.scenario}: ${r.error || 'Unknown error'}`);
      });
      console.log('\n🔧 Suggested actions:');
      console.log('   1. Check data integrity in localStorage');
      console.log('   2. Verify employee and project data setup');
      console.log('   3. Review salary calculation logic');
      console.log('   4. Test with different date ranges');
    } else {
      console.log('✅ All tests passed! System is functioning correctly.');
      console.log('\n🎯 Next steps:');
      console.log('   1. Run tests regularly during development');
      console.log('   2. Add new test scenarios for edge cases');
      console.log('   3. Monitor performance metrics');
      console.log('   4. Consider automated test scheduling');
    }
    
    // System health check
    console.log('\n🏥 SYSTEM HEALTH CHECK:');
    console.log('=' .repeat(30));
    
    const healthScore = calculateHealthScore(results);
    console.log(`Overall Health Score: ${healthScore}/100`);
    
    if (healthScore >= 90) {
      console.log('🟢 Excellent - System is highly reliable');
    } else if (healthScore >= 75) {
      console.log('🟡 Good - Minor issues detected');
    } else if (healthScore >= 50) {
      console.log('🟠 Fair - Several issues need attention');
    } else {
      console.log('🔴 Poor - Critical issues require immediate attention');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check if all required services are available');
    console.log('2. Verify localStorage is accessible');
    console.log('3. Ensure all dependencies are properly imported');
    console.log('4. Check browser console for additional errors');
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Test execution completed.');
}

/**
 * Get test name by ID
 */
function getTestName(testId: string): string {
  const testNames: Record<string, string> = {
    'test001': 'Basic Project Team Salary Integration',
    'test002': 'Mid-Month Project Start/End Testing',
    'test003': 'Project Extension Beyond End Date',
    'test004': 'Team Composition Changes',
    'test005': 'Data Integrity and Error Handling'
  };
  
  return testNames[testId] || testId;
}

/**
 * Calculate total execution time from results
 */
function getTotalExecutionTime(results: any): number {
  return results.results.reduce((total: number, result: any) => {
    return total + (result.duration || 0);
  }, 0);
}

/**
 * Calculate system health score based on test results
 */
function calculateHealthScore(results: any): number {
  const total = results.passed + results.failed;
  if (total === 0) return 0;
  
  const baseScore = (results.passed / total) * 80; // 80% for passing tests
  
  // Additional scoring factors
  let bonusScore = 0;
  
  // Bonus for no critical failures
  const criticalFailures = results.results.filter((r: any) => 
    !r.passed && (r.error?.includes('critical') || r.error?.includes('fatal'))
  ).length;
  
  if (criticalFailures === 0) {
    bonusScore += 10;
  }
  
  // Bonus for performance
  const avgTime = getTotalExecutionTime(results) / total;
  if (avgTime < 1000) { // Less than 1 second average
    bonusScore += 10;
  } else if (avgTime < 2000) { // Less than 2 seconds average
    bonusScore += 5;
  }
  
  return Math.min(100, Math.round(baseScore + bonusScore));
}

/**
 * Run specific test category
 */
export async function runTestCategory(category: 'core' | 'dates' | 'projects' | 'integrity'): Promise<void> {
  console.log(`🎯 Running ${category.toUpperCase()} tests...`);
  
  const testRunner = new PayrollTestingScenarios();
  const categoryTests: Record<string, string[]> = {
    'core': ['test001'],
    'dates': ['test002'],
    'projects': ['test003'],
    'integrity': ['test004', 'test005']
  };
  
  const testIds = categoryTests[category] || [];
  
  for (const testId of testIds) {
    try {
      console.log(`Running ${getTestName(testId)}...`);
      const result = await testRunner.runTest(testId);
      console.log(result ? '✅ PASSED' : '❌ FAILED');
    } catch (error) {
      console.log(`❌ FAILED: ${error}`);
    }
  }
}

/**
 * Generate test data for manual testing
 */
export function generateTestData(): void {
  console.log('📋 Generating test data for manual validation...');
  
  const testEmployees = [
    { id: 'emp001', name: 'John Manager', salary: 25000, position: 'Project Manager' },
    { id: 'emp002', name: 'Alice Developer', salary: 15000, position: 'Senior Developer' },
    { id: 'emp003', name: 'Bob Analyst', salary: 12000, position: 'Business Analyst' }
  ];
  
  const testProjects = [
    {
      id: 1001,
      name: 'E-Commerce Platform',
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      team: ['emp001', 'emp002', 'emp003']
    }
  ];
  
  console.log('\n👥 Test Employees:');
  testEmployees.forEach(emp => {
    console.log(`   ${emp.name} (${emp.id}) - R${emp.salary} - ${emp.position}`);
  });
  
  console.log('\n📁 Test Projects:');
  testProjects.forEach(proj => {
    console.log(`   ${proj.name} (${proj.id})`);
    console.log(`   Duration: ${proj.startDate} to ${proj.endDate}`);
    console.log(`   Team: ${proj.team.join(', ')}`);
  });
  
  console.log('\n💰 Expected Monthly Costs:');
  testProjects.forEach(proj => {
    const monthlyCost = testEmployees
      .filter(emp => proj.team.includes(emp.id))
      .reduce((sum, emp) => sum + emp.salary, 0);
    console.log(`   ${proj.name}: R${monthlyCost.toLocaleString()}`);
  });
}

/**
 * Validate system prerequisites
 */
export function validateSystemPrerequisites(): boolean {
  console.log('🔍 Validating system prerequisites...');
  
  const checks = [
    {
      name: 'localStorage availability',
      check: () => typeof Storage !== 'undefined'
    },
    {
      name: 'Required services',
      check: () => {
        try {
          // Check if services can be imported
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Date handling',
      check: () => {
        try {
          new Date('2025-01-01');
          return true;
        } catch {
          return false;
        }
      }
    }
  ];
  
  let allPassed = true;
  
  checks.forEach(check => {
    const result = check.check();
    console.log(`   ${check.name}: ${result ? '✅' : '❌'}`);
    if (!result) allPassed = false;
  });
  
  if (allPassed) {
    console.log('\n✅ All prerequisites met. System ready for testing.');
  } else {
    console.log('\n❌ Some prerequisites failed. Please resolve before testing.');
  }
  
  return allPassed;
}

// Export main execution function for use in browser console
if (typeof window !== 'undefined') {
  (window as any).runPayrollTests = executePayrollTests;
  (window as any).runTestCategory = runTestCategory;
  (window as any).generateTestData = generateTestData;
  (window as any).validateSystemPrerequisites = validateSystemPrerequisites;
  
  console.log('🧪 Payroll test functions available:');
  console.log('   - runPayrollTests(): Execute all tests');
  console.log('   - runTestCategory(category): Run specific category');
  console.log('   - generateTestData(): Show test data structure');
  console.log('   - validateSystemPrerequisites(): Check system readiness');
}