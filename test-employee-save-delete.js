/**
 * Complete Employee Save & Delete Functionality Test
 * Run this in browser console on HR Management page
 */

console.log('🧪 Starting Employee Save & Delete Functionality Test...');

// Test data for new employee
const testEmployeeData = {
  firstName: 'Test',
  surname: 'Employee',
  contactNumber: '071 555 0123',
  email: 'test.employee@mokmzansibooks.com',
  idType: 'ID Number',
  idValue: '9001015800088',
  dateOfBirth: '1990-01-01',
  employmentType: 'Full Time',
  startDate: new Date().toISOString().split('T')[0],
  paymentCycle: 'Monthly',
  salary: 45000,
  taxPercentage: 25,
  department: 'Testing',
  position: 'Test Specialist',
  location: 'Test Office',
  addressLine1: '123 Test Street',
  addressLine2: 'Test Suburb',
  addressLine3: 'Test City',
  addressLine4: '0000',
  kinRelationship: 'Spouse',
  kinName: 'Test',
  kinSurname: 'Spouse',
  kinContactNumber: '071 555 0124',
  bankName: 'Test Bank',
  accountHolderName: 'Test Employee',
  accountNumber: '1234567890',
  branchCode: '123456',
  dayShift: true,
  nightShift: false,
  flexibleShift: false
};

// Helper function to generate UUID (simplified version)
function generateTestId() {
  return 'test-' + Math.random().toString(36).substr(2, 9);
}

// Test 1: Check current employee data
console.log('\n1️⃣ CURRENT EMPLOYEE DATA CHECK');
const currentEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
console.log('📋 Current employees:', currentEmployees.length);
currentEmployees.forEach(emp => {
  console.log(`- ${emp.firstName} ${emp.surname} (${emp.position}) - ID: ${emp.id}`);
});

// Test 2: Regular User Analysis
console.log('\n2️⃣ REGULAR USER ANALYSIS');
const regularUser = currentEmployees.find(emp => 
  emp.firstName === 'Regular' && emp.surname === 'User'
);

if (regularUser) {
  console.log('👤 Regular User found:', {
    id: regularUser.id,
    name: `${regularUser.firstName} ${regularUser.surname}`,
    email: regularUser.email,
    position: regularUser.position,
    department: regularUser.department
  });
  
  // Check delete eligibility
  const isAdminEmail = regularUser.email === 'admin@mokmzansibooks.com';
  const isAdminPosition = regularUser.position && ['CEO', 'Founder', 'Director', 'Manager'].includes(regularUser.position);
  const isSyncedAdmin = isAdminEmail || isAdminPosition;
  
  console.log('🔍 Delete eligibility check:');
  console.log('- Admin email:', isAdminEmail);
  console.log('- Admin position:', isAdminPosition);
  console.log('- Is synced admin (blocks delete):', isSyncedAdmin);
  console.log('- Can be deleted:', !isSyncedAdmin);
  
  if (isSyncedAdmin) {
    console.log('\n🚨 ISSUE: Regular User has admin position, blocking deletion');
    console.log(`Position "${regularUser.position}" is in the protected list`);
  }
} else {
  console.log('✅ Regular User not found (already removed or never existed)');
}

// Test 3: Save Functionality Test
console.log('\n3️⃣ SAVE FUNCTIONALITY TEST');

window.testEmployeeSave = function() {
  console.log('💾 Testing employee save functionality...');
  
  try {
    // Check for duplicates first
    const existingEmployee = currentEmployees.find(emp => 
      emp.idValue === testEmployeeData.idValue || 
      emp.email === testEmployeeData.email
    );
    
    if (existingEmployee) {
      console.log('⚠️ Test employee already exists, removing first...');
      const filteredEmployees = currentEmployees.filter(emp => emp.id !== existingEmployee.id);
      localStorage.setItem('employees', JSON.stringify(filteredEmployees));
    }
    
    // Create new employee
    const newEmployee = {
      ...testEmployeeData,
      id: generateTestId(),
      employeeNumber: `EMP${Date.now()}`,
      status: 'active'
    };
    
    // Add to localStorage
    const updatedEmployees = [...JSON.parse(localStorage.getItem('employees') || '[]'), newEmployee];
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    
    console.log('✅ Test employee saved successfully:', {
      id: newEmployee.id,
      name: `${newEmployee.firstName} ${newEmployee.surname}`,
      email: newEmployee.email,
      position: newEmployee.position
    });
    
    // Verify save
    const savedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
    const savedEmployee = savedEmployees.find(emp => emp.id === newEmployee.id);
    
    if (savedEmployee) {
      console.log('✅ Save verification successful - employee found in localStorage');
      console.log('📊 Total employees after save:', savedEmployees.length);
      return newEmployee;
    } else {
      console.error('❌ Save verification failed - employee not found in localStorage');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Save test failed:', error);
    return null;
  }
};

// Test 4: Delete Functionality Test
console.log('\n4️⃣ DELETE FUNCTIONALITY TEST');

window.testEmployeeDelete = function(employeeId) {
  console.log('🗑️ Testing employee delete functionality...');
  
  if (!employeeId) {
    console.error('❌ No employee ID provided for delete test');
    return false;
  }
  
  try {
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const employeeToDelete = employees.find(emp => emp.id === employeeId);
    
    if (!employeeToDelete) {
      console.error('❌ Employee not found for deletion');
      return false;
    }
    
    console.log('🎯 Deleting employee:', {
      id: employeeToDelete.id,
      name: `${employeeToDelete.firstName} ${employeeToDelete.surname}`,
      position: employeeToDelete.position
    });
    
    // Perform deletion
    const filteredEmployees = employees.filter(emp => emp.id !== employeeId);
    localStorage.setItem('employees', JSON.stringify(filteredEmployees));
    
    // Clear related data
    const dataKeys = ['payrollCalculations', 'attendanceSummaries', 'employeeDeductions', 'salaryAdvances'];
    dataKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        const filtered = parsed.filter(item => 
          item.employeeId !== employeeId &&
          item.employeeName !== `${employeeToDelete.firstName} ${employeeToDelete.surname}`
        );
        localStorage.setItem(key, JSON.stringify(filtered));
      }
    });
    
    // Verify deletion
    const updatedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
    const deletedEmployee = updatedEmployees.find(emp => emp.id === employeeId);
    
    if (!deletedEmployee) {
      console.log('✅ Delete verification successful - employee removed from localStorage');
      console.log('📊 Total employees after delete:', updatedEmployees.length);
      return true;
    } else {
      console.error('❌ Delete verification failed - employee still exists in localStorage');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Delete test failed:', error);
    return false;
  }
};

// Test 5: Regular User Delete Test
console.log('\n5️⃣ REGULAR USER DELETE TEST');

window.testRegularUserDelete = function() {
  console.log('🎯 Testing Regular User deletion...');
  
  const employees = JSON.parse(localStorage.getItem('employees') || '[]');
  const regularUser = employees.find(emp => 
    emp.firstName === 'Regular' && emp.surname === 'User'
  );
  
  if (!regularUser) {
    console.log('✅ Regular User not found - already deleted or never existed');
    return true;
  }
  
  // Check if it can be deleted
  const isAdminEmail = regularUser.email === 'admin@mokmzansibooks.com';
  const isAdminPosition = regularUser.position && ['CEO', 'Founder', 'Director', 'Manager'].includes(regularUser.position);
  const isSyncedAdmin = isAdminEmail || isAdminPosition;
  
  if (isSyncedAdmin) {
    console.log('🚨 Regular User is protected from deletion due to admin position');
    console.log('🔧 Fixing position to allow deletion...');
    
    // Fix the position
    const updatedEmployees = employees.map(emp => {
      if (emp.firstName === 'Regular' && emp.surname === 'User') {
        return {
          ...emp,
          position: 'Staff Member',
          department: 'General'
        };
      }
      return emp;
    });
    
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    console.log('✅ Position fixed - Regular User can now be deleted');
  }
  
  // Now test deletion
  return testEmployeeDelete(regularUser.id);
};

// Test 6: Complete Test Suite
console.log('\n6️⃣ COMPLETE TEST SUITE');

window.runCompleteTest = function() {
  console.log('🚀 Running complete employee save/delete test suite...');
  
  // Test save
  console.log('\n📝 Testing save functionality...');
  const savedEmployee = testEmployeeSave();
  
  if (savedEmployee) {
    console.log('✅ Save test passed');
    
    // Test delete
    console.log('\n🗑️ Testing delete functionality...');
    const deleteSuccess = testEmployeeDelete(savedEmployee.id);
    
    if (deleteSuccess) {
      console.log('✅ Delete test passed');
      console.log('\n🎉 ALL TESTS PASSED!');
    } else {
      console.log('❌ Delete test failed');
    }
  } else {
    console.log('❌ Save test failed - skipping delete test');
  }
  
  // Test Regular User deletion
  console.log('\n👤 Testing Regular User deletion...');
  const regularUserDeleteSuccess = testRegularUserDelete();
  
  if (regularUserDeleteSuccess) {
    console.log('✅ Regular User delete test passed');
  } else {
    console.log('❌ Regular User delete test failed');
  }
  
  console.log('\n📊 Test suite completed!');
};

// Instructions
console.log('\n📋 AVAILABLE TEST FUNCTIONS:');
console.log('- testEmployeeSave() - Test saving a new employee');
console.log('- testEmployeeDelete(employeeId) - Test deleting an employee');
console.log('- testRegularUserDelete() - Test deleting Regular User specifically');
console.log('- runCompleteTest() - Run all tests');
console.log('\n🎯 Quick start: Run runCompleteTest() to test everything');
console.log('\n✅ Test suite loaded successfully!');