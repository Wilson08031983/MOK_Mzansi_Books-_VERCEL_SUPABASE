
import React, { useState } from 'react';
import { 
  Search,
  Filter,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  MapPin,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Employee } from '@/services/employeeService';
import { useAuth } from '@/contexts/AuthContext';
import { logEmployeeStatusChange } from '@/services/hrAuditService';
import { format } from 'date-fns';

interface EmployeeDirectoryProps {
  employees: Employee[];
  onViewProfile?: (employee: Employee) => void;
}

const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({ employees, onViewProfile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();

  // Get unique departments for filtering
  const departments = Array.from(new Set(employees.map(emp => emp.department)));

  const filteredEmployees = employees.filter(employee => {
    if (!employee) return false;
    
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${employee.firstName || ''} ${employee.surname || ''}`.trim().toLowerCase();
    const position = employee.position?.toLowerCase() || '';
    const email = employee.email?.toLowerCase() || '';
    
    const matchesSearch = 
      fullName.includes(searchLower) ||
      position.includes(searchLower) ||
      email.includes(searchLower);
    
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status?: string) => {
    // Theme-aware badge styles (good contrast in light and dark)
    if (!status) return 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-white/10';
    
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'active':
        return 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/40';
      case 'on-leave':
      case 'on_leave':
        return 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/40';
      case 'terminated':
        return 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/40';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-white/10';
    }
  };
  
  const getEmploymentTypeColor = (employmentType?: string) => {
    // Theme-aware badge styles
    if (!employmentType) return 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-white/10';
    
    const typeLower = employmentType.toLowerCase();
    if (typeLower.includes('full') || typeLower === 'fulltime' || typeLower === 'full-time') {
      return 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/40';
    } else if (typeLower.includes('part') || typeLower === 'parttime' || typeLower === 'part-time') {
      return 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/40';
    } else if (typeLower.includes('contract') || typeLower === 'contractor') {
      return 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/40';
    }
    return 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-white/10';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="glass backdrop-blur-sm bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-business">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass backdrop-blur-sm bg-white dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/40 focus:border-slate-300 dark:focus:border-mokm-purple-500/40 transition-all duration-300 font-sf-pro"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 glass backdrop-blur-sm bg-white dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/40 focus:border-slate-300 dark:focus:border-mokm-purple-500/40 transition-all duration-300 font-sf-pro"
              >
                <option value="all">All Departments</option>
                <option value="Marketing">Marketing</option>
                <option value="IT">IT</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 glass backdrop-blur-sm bg-white dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/40 focus:border-slate-300 dark:focus:border-mokm-purple-500/40 transition-all duration-300 font-sf-pro"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="on-leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map(employee => (
          <Card key={employee.id} className="glass backdrop-blur-sm bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-business hover:shadow-business-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white flex items-center justify-center font-medium font-sf-pro">
                  {employee.avatar ? (
                    <img src={employee.avatar} alt={`${employee.firstName} ${employee.surname}`} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    `${employee.firstName[0]}${employee.surname[0]}`
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 font-sf-pro">
                    {employee.firstName} {employee.surname}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-sf-pro">{employee.position}</p>
                </div>
                <button className="text-slate-400 hover:text-slate-300">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-900 dark:text-slate-300">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-900 dark:text-slate-300">{employee.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-900 dark:text-slate-300">{employee.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-900 dark:text-slate-300">Started: {new Date(employee.startDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-sf-pro ${getStatusColor(employee.status)}`}>
                    {employee.status ? 
                      (employee.status.charAt(0).toUpperCase() + employee.status.slice(1).replace(/[_-]/g, ' ')) : 
                      'Unknown'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full font-sf-pro ${getEmploymentTypeColor(employee.employmentType)}`}>
                    {employee.employmentType || 'Unknown'}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="font-sf-pro border-slate-300 text-slate-700 dark:border-white/20 dark:text-slate-200" 
                  onClick={() => onViewProfile && onViewProfile(employee)}
                >
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmployeeDirectory;
