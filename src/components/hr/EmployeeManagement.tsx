
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddEmployeeModal from '@/components/hr/AddEmployeeModal';
import EditEmployeeModal from '@/components/hr/EditEmployeeModal';
import EmployeeDetailsModal from '@/components/hr/EmployeeDetailsModal';
import { deleteEmployee, Employee } from '@/services/employeeService';
import { userLinkingService } from '@/services/userLinkingService';
import { toast } from 'sonner';
import { 
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  Building,
  Calendar,
  Edit,
  Trash2,
  Plus,
  FileText,
  Calculator
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';



interface EmployeeManagementProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ employees, setEmployees }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  
  // Helper function to check if this is the synced admin user
  const isSyncedAdminUser = (emp: Employee): boolean => {
    const isAdminEmail = emp.email === 'admin@mokmzansibooks.com';
    const isAdminPosition = emp.position && ['CEO', 'Founder', 'Director', 'Manager'].includes(emp.position);
    const result = isAdminEmail || isAdminPosition;
    
    // Debug logging for Regular User specifically
    if (emp.firstName === 'Regular' && emp.surname === 'User') {
      console.log(`🔍 [isSyncedAdminUser] Regular User check:`, {
        employee: `${emp.firstName} ${emp.surname}`,
        email: emp.email,
        position: emp.position,
        isAdminEmail,
        isAdminPosition,
        isSyncedAdmin: result,
        deleteButtonVisible: !result
      });
    }
    
    return result;
  };

  // Get unique departments
  const departments = Array.from(new Set(employees.map(emp => emp.department)));

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    // Get display name from firstName + surname
    const displayName = (employee.firstName && employee.surname ? 
        `${employee.firstName} ${employee.surname}` : 
        employee.firstName || employee.surname || '');
    
    const matchesSearch = searchQuery === '' || (
      displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (employee.position?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (employee.id?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
    
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Helper to identify the seeded Regular User account
  const isDefaultRegularUser = (emp: Employee): boolean => {
    const byEmail = (emp.email || '').toLowerCase() === 'user@mokmzansibooks.com';
    const byName = (emp.firstName?.trim() === 'Regular' && emp.surname?.trim() === 'User');
    return byEmail || byName;
  };

  // Employees to display (exclude the default Regular User card)
  const displayEmployees = filteredEmployees.filter(emp => !isDefaultRegularUser(emp));

  // Function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on-leave':
        return 'bg-blue-100 text-blue-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Toggle employee details
  const toggleEmployeeDetails = (id: string) => {
    try {
      if (!id) {
        console.warn('Employee ID is missing');
        return;
      }
      if (selectedEmployee === id) {
        setSelectedEmployee(null);
      } else {
        setSelectedEmployee(id);
      }
    } catch (error) {
      console.error('Error toggling employee details:', error);
      toast.error('Error displaying employee details');
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get initials from name
  const getInitials = (name?: string) => {
    if (!name) return 'UN';
    return name.split(' ')
      .filter(n => n && n.trim().length > 0)
      .map(n => n.trim()[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 2) || 'UN';
  };

  // Handle edit employee
  const handleEditEmployee = (employee: Employee) => {
    // Check if user can be edited (presidency user protection)
    const editCheck = userLinkingService.canEditUser(employee.id);
    if (!editCheck.canEdit) {
      toast.error(editCheck.reason || 'Cannot edit this user');
      return;
    }
    
    setEditingEmployee(employee);
    setIsEditEmployeeModalOpen(true);
  };

  // Handle delete employee
  const handleDeleteEmployee = (employee: Employee) => {
    const displayName = (employee.firstName && employee.surname ? 
        `${employee.firstName} ${employee.surname}` : 
        employee.firstName || employee.surname || 'Unknown Employee');
    
    console.log(`🗑️ [EmployeeManagement] Attempting to delete employee:`, {
      id: employee.id,
      name: displayName,
      firstName: employee.firstName,
      surname: employee.surname,
      email: employee.email,
      role: employee.position,
      isRegularUser: employee.firstName === 'Regular' && employee.surname === 'User'
    });
    
    // Check if user can be deleted (presidency user protection)
    const deleteCheck = userLinkingService.canDeleteUser(employee.id);
    if (!deleteCheck.canDelete) {
      toast.error(deleteCheck.reason || 'Cannot delete this user');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${displayName}? This action cannot be undone.`)) {
      try {
        console.log(`🔄 [EmployeeManagement] User confirmed deletion, calling deleteEmployee service...`);
        
        const success = deleteEmployee(employee.id);
        
        console.log(`📊 [EmployeeManagement] Delete service result:`, { success });
        
        if (success) {
          console.log(`✅ [EmployeeManagement] Delete successful, updating UI state...`);
          
          // Update the employees list by removing the deleted employee
          setEmployees(prevEmployees => {
            const filteredEmployees = prevEmployees.filter(emp => emp.id !== employee.id);
            console.log(`📋 [EmployeeManagement] Updated employees list:`, {
              before: prevEmployees.length,
              after: filteredEmployees.length,
              removedEmployee: displayName
            });
            return filteredEmployees;
          });
          
          toast.success(`${displayName} has been deleted successfully.`);
          console.log(`🎉 [EmployeeManagement] Delete operation completed successfully for ${displayName}`);
        } else {
          console.error(`❌ [EmployeeManagement] Delete service returned false for ${displayName}`);
          toast.error(`Failed to delete ${displayName}. The employee may have linked records that must be removed first.`);
        }
      } catch (error) {
        console.error(`💥 [EmployeeManagement] Exception during delete operation:`, {
          employee: displayName,
          error: error,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        
        toast.error(`Error deleting ${displayName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      console.log(`❌ [EmployeeManagement] User cancelled deletion of ${displayName}`);
    }
  };

  // Handle employee updated
  const handleEmployeeUpdated = (updatedEmployee: Employee) => {
    setEmployees(prevEmployees => 
      prevEmployees.map(emp => 
        emp.id === updatedEmployee.id ? updatedEmployee : emp
      )
    );
    setIsEditEmployeeModalOpen(false);
    setEditingEmployee(null);
  };

  // Handle employee added
  const handleEmployeeAdded = (newEmployee: Employee) => {
    setEmployees(prevEmployees => [...prevEmployees, newEmployee]);
    setIsAddEmployeeModalOpen(false);
  };
  
  // Get full name from employee
  const getFullName = (employee: Employee) => {
    return (employee.firstName && employee.surname ? 
        `${employee.firstName} ${employee.surname}` : 
        employee.firstName || employee.surname || 'Unknown');
  };

  // Handle calculate tax navigation
  const handleCalculateTax = (employee: Employee) => {
    // Navigate to accounting page with tax tab active and employee pre-selected
    navigate('/accounting', {
      state: {
        activeTab: 'tax',
        selectedEmployee: employee,
        taxSubTab: 'employees'
      }
    });
    toast.success(`Navigating to tax calculation for ${getFullName(employee)}`);
  };



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sf-pro">Employee Management</h2>
          <p className="text-slate-600 font-sf-pro">Manage your company workforce</p>
        </div>
        
        <Button 
          className="bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 font-sf-pro"
          onClick={() => setIsAddEmployeeModalOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>
      
      {/* Filters */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 pl-10 pr-4 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-slate-500 font-sf-pro">
              <Filter className="h-4 w-4" />
              <span>Department:</span>
            </div>
            
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro text-sm"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            <div className="flex items-center space-x-1 text-sm text-slate-500 font-sf-pro">
              <Filter className="h-4 w-4" />
              <span>Status:</span>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="on-leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </CardContent>
      </Card>
      
      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayEmployees.length > 0 ? (
          displayEmployees.map(employee => (
            <Card key={employee.id} className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/70 transition-colors"
                  onClick={() => employee?.id && toggleEmployeeDetails(employee.id)}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white flex items-center justify-center font-medium font-sf-pro">
                      {employee.avatar ? (
                        <img src={employee.avatar} alt={getFullName(employee)} className="h-10 w-10 rounded-full" />
                      ) : (
                        getInitials(getFullName(employee))
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-slate-900 font-sf-pro">{getFullName(employee)}</div>
                      <div className="text-sm text-slate-600 font-sf-pro">{employee.position || 'No position'}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-sf-pro ${getStatusBadgeColor(employee.status || '')}`}>
                    {!employee.status ? 'Unknown' : 
                     employee.status === 'on-leave' ? 'On Leave' : 
                     employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                  </span>
                </div>
                
                {selectedEmployee === employee?.id && employee && (
                  <div className="p-4 bg-white/30 border-t border-white/20">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-slate-400 mr-2" />
                        <div>
                          <div className="text-xs text-slate-500 font-sf-pro">Email</div>
                          <div className="text-sm text-slate-900 font-sf-pro">{employee.email || 'Not provided'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-slate-400 mr-2" />
                        <div>
                          <div className="text-xs text-slate-500 font-sf-pro">Phone</div>
                          <div className="text-sm text-slate-900 font-sf-pro">{employee.contactNumber || 'N/A'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Building className="h-5 w-5 text-slate-400 mr-2" />
                        <div>
                          <div className="text-xs text-slate-500 font-sf-pro">Department</div>
                          <div className="text-sm text-slate-900 font-sf-pro">{employee.department || 'Not assigned'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-slate-400 mr-2" />
                        <div>
                          <div className="text-xs text-slate-500 font-sf-pro">Start Date</div>
                          <div className="text-sm text-slate-900 font-sf-pro">{formatDate(employee.startDate)}</div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-2 pt-2 border-t border-white/20">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 font-sf-pro"
                          onClick={() => setViewingEmployee(employee)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="px-3 font-sf-pro"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="px-3 text-blue-600 hover:text-blue-700 font-sf-pro"
                          onClick={() => handleCalculateTax(employee)}
                        >
                          <Calculator className="h-4 w-4" />
                        </Button>
                        
                        {!isSyncedAdminUser(employee) && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="px-3 text-red-600 hover:text-red-700 font-sf-pro"
                            onClick={() => handleDeleteEmployee(employee)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
              <CardContent className="text-center py-12">
                <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-mokm-purple-100 to-mokm-blue-100 flex items-center justify-center">
                  <UserPlus className="h-12 w-12 text-mokm-purple-500" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-slate-500 font-sf-pro">No employees found</h3>
                <p className="mt-1 text-slate-400 font-sf-pro">
                  Add employees or adjust your filters to see employees
                </p>
                <div className="mt-6">
                  <Button 
                    className="bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 font-sf-pro"
                    onClick={() => setIsAddEmployeeModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      
      {/* Add Employee Modal */}
      <AddEmployeeModal 
        isOpen={isAddEmployeeModalOpen} 
        onClose={() => setIsAddEmployeeModalOpen(false)}
        onEmployeeAdded={handleEmployeeAdded}
      />

      {/* Edit Employee Modal */}
      <EditEmployeeModal 
        isOpen={isEditEmployeeModalOpen} 
        onClose={() => {
          setIsEditEmployeeModalOpen(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
        onEmployeeUpdated={handleEmployeeUpdated}
      />

      {/* Employee Details Modal */}
      <EmployeeDetailsModal
        isOpen={viewingEmployee !== null}
        onClose={() => setViewingEmployee(null)}
        employee={viewingEmployee}
      />
    </div>
  );
};

export default EmployeeManagement;
