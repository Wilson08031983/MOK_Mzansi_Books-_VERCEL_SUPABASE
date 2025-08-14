// Test script to check employee save and delete functionality

// Function to get all employees from localStorage
function getAllEmployees() {
  const employees = localStorage.getItem('employees');
  return employees ? JSON.parse(employees) : [];
}

// Function to test delete employee
function testDeleteEmployee(employeeId) {
  console.log('🧪 Testing delete employee with ID:', employeeId);
  
  const employees = getAllEmployees();
  console.log('📋 Current employees:', employees.length);
  
  const employeeToDelete = employees.find(emp => emp.id === employeeId);
  if (!employeeToDelete) {
    console.error('❌ Employee not found with ID:', employeeId);
    return false;
  }
  
  console.log('👤 Employee to delete:', {
    id: employeeToDelete.id,
    name: `${employeeToDelete.firstName} ${employeeToDelete.surname}`,
    email: employeeToDelete.email,
    position: employeeToDelete.position
  });
  
  // Simulate the delete operation
  const filteredEmployees = employees.filter(emp => emp.id !== employeeId);
  console.log('📊 Employees after delete:', filteredEmployees.length);
  
  return true;
}

// Function to find Regular User
function findRegularUser() {
  const employees = getAllEmployees();
  const regularUser = employees.find(emp => 
    emp.firstName === 'Regular' && emp.surname === 'User'
  );
  
  if (regularUser) {
    console.log('👤 Found Regular User:', {
      id: regularUser.id,
      name: `${regularUser.firstName} ${regularUser.surname}`,
      email: regularUser.email,
      position: regularUser.position
    });
    return regularUser;
  } else {
    console.log('❌ Regular User not found');
    return null;
  }
}

// Function to test save employee
function testSaveEmployee() {
  console.log('🧪 Testing save employee functionality');
  
  const testEmployee = {
    firstName: 'Test',
    surname: 'Employee',
    contactNumber: '0123456789',
    email: 'test@example.com',
    idType: 'ID Number',
    idValue: '1234567890123',
    dateOfBirth: '1990-01-01',
    employmentType: 'Full Time',
    startDate: '2024-01-01',
    paymentCycle: 'Monthly',
    salary: 25000,
    department: 'General',
    position: 'Test Position',
    location: 'Johannesburg',
    addressLine1: 'Test Address',
    addressLine2: '',
    addressLine3: '',
    addressLine4: '',
    kinRelationship: 'Spouse',
    kinName: 'Test',
    kinSurname: 'Kin',
    kinContactNumber: '0987654321',
    bankName: 'Test Bank',
    accountHolderName: 'Test Employee',
    accountNumber: '1234567890',
    branchCode: '123456',
    dayShift: true,
    nightShift: false,
    flexibleShift: false
  };
  
  console.log('📝 Test employee data:', testEmployee);
  return testEmployee;
}

// Main test function
function runTests() {
  console.log('🚀 Starting Employee Operations Tests');
  console.log('=====================================');
  
  // Test 1: Check current employees
  const employees = getAllEmployees();
  console.log('📋 Current employees count:', employees.length);
  employees.forEach((emp, index) => {
    console.log(`${index + 1}. ${emp.firstName} ${emp.surname} (${emp.id})`);
  });
  
  console.log('\n');
  
  // Test 2: Find Regular User
  const regularUser = findRegularUser();
  
  console.log('\n');
  
  // Test 3: Test delete Regular User if found
  if (regularUser) {
    testDeleteEmployee(regularUser.id);
  }
  
  console.log('\n');
  
  // Test 4: Test save functionality
  testSaveEmployee();
  
  console.log('\n🏁 Tests completed');
}

// Export functions for use in browser console
if (typeof window !== 'undefined') {
  window.employeeTests = {
    runTests,
    getAllEmployees,
    findRegularUser,
    testDeleteEmployee,
    testSaveEmployee
  };
}

// Run tests if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runTests,
    getAllEmployees,
    findRegularUser,
    testDeleteEmployee,
    testSaveEmployee
  };
}

console.log('📋 Employee test functions loaded. Run employeeTests.runTests() in browser console.');