
import React, { useState } from 'react';
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
  FileText,
  Plus,
  Upload,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  startDate: string;
  status: 'active' | 'on-leave' | 'terminated';
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  avatar?: string;
}

interface EmployeeManagementProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ employees, setEmployees }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // Get unique departments
  const departments = Array.from(new Set(employees.map(emp => emp.department)));

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

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
    if (selectedEmployee === id) {
      setSelectedEmployee(null);
    } else {
      setSelectedEmployee(id);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sf-pro">Employee Management</h2>
          <p className="text-slate-600 font-sf-pro">Manage your company workforce</p>
        </div>
        
        <Button className="bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 font-sf-pro">
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
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map(employee => (
            <Card key={employee.id} className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/70 transition-colors"
                  onClick={() => toggleEmployeeDetails(employee.id)}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white flex items-center justify-center font-medium font-sf-pro">
                      {employee.avatar ? (
                        <img src={employee.avatar} alt={employee.name} className="h-10 w-10 rounded-full" />
                      ) : (
                        getInitials(employee.name)
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-slate-900 font-sf-pro">{employee.name}</div>
                      <div className="text-sm text-slate-600 font-sf-pro">{employee.position}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-sf-pro ${getStatusBadgeColor(employee.status)}`}>
                    {employee.status === 'on-leave' ? 'On Leave' : employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                  </span>
                </div>
                
                {selectedEmployee === employee.id && (
                  <div className="p-4 bg-white/30 border-t border-white/20">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-slate-400 mr-2" />
                        <div>
                          <div className="text-xs text-slate-500 font-sf-pro">Email</div>
                          <div className="text-sm text-slate-900 font-sf-pro">{employee.email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-slate-400 mr-2" />
                        <div>
                          <div className="text-xs text-slate-500 font-sf-pro">Phone</div>
                          <div className="text-sm text-slate-900 font-sf-pro">{employee.phone}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Building className="h-5 w-5 text-slate-400 mr-2" />
                        <div>
                          <div className="text-xs text-slate-500 font-sf-pro">Department</div>
                          <div className="text-sm text-slate-900 font-sf-pro">{employee.department}</div>
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
                        <Button variant="outline" size="sm" className="flex-1 font-sf-pro">
                          <FileText className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        
                        <Button variant="outline" size="sm" className="px-3 font-sf-pro">
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button variant="outline" size="sm" className="px-3 text-red-600 hover:text-red-700 font-sf-pro">
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                  <Button className="bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 font-sf-pro">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Employee actions */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="text-slate-900 font-sf-pro">Employee Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center justify-center space-x-2 py-3 font-sf-pro">
              <Upload className="h-5 w-5" />
              <span>Import Employees</span>
            </Button>
            
            <Button variant="outline" className="flex items-center justify-center space-x-2 py-3 font-sf-pro">
              <Download className="h-5 w-5" />
              <span>Export Employee Data</span>
            </Button>
            
            <Button variant="outline" className="flex items-center justify-center space-x-2 py-3 font-sf-pro">
              <FileText className="h-5 w-5" />
              <span>Employee Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeManagement;
