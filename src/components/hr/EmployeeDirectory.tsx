
import React, { useState } from 'react';
import { 
  Search,
  Filter,
  Briefcase,
  Mail,
  Phone,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Employee_Legacy = {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  status: 'active' | 'on-leave' | 'terminated';
  hireDate: string;
  avatar?: string;
};

const EmployeeDirectory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Legacy sample employees for directory tab
  const sampleEmployees: Employee_Legacy[] = [
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      jobTitle: 'Marketing Manager',
      department: 'Marketing',
      email: 'sarah.johnson@mokbooks.co.za',
      phone: '011 123 4567',
      location: 'Johannesburg',
      employmentType: 'full-time',
      status: 'active',
      hireDate: '2023-01-15'
    },
    {
      id: '2',
      firstName: 'Michael',
      lastName: 'Chen',
      jobTitle: 'Software Developer',
      department: 'IT',
      email: 'michael.chen@mokbooks.co.za',
      phone: '011 234 5678',
      location: 'Cape Town',
      employmentType: 'full-time',
      status: 'active',
      hireDate: '2022-08-20'
    },
    {
      id: '3',
      firstName: 'Nomsa',
      lastName: 'Mthembu',
      jobTitle: 'HR Specialist',
      department: 'Human Resources',
      email: 'nomsa.mthembu@mokbooks.co.za',
      phone: '011 345 6789',
      location: 'Johannesburg',
      employmentType: 'full-time',
      status: 'on-leave',
      hireDate: '2023-03-10'
    }
  ];

  const filteredLegacyEmployees = sampleEmployees.filter(employee => {
    const matchesSearch = 
      `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: Employee_Legacy['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmploymentTypeColor = (type: Employee_Legacy['employmentType']) => {
    switch (type) {
      case 'full-time':
        return 'bg-blue-100 text-blue-800';
      case 'part-time':
        return 'bg-purple-100 text-purple-800';
      case 'contract':
        return 'bg-orange-100 text-orange-800';
      case 'intern':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
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
                className="px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
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
        {filteredLegacyEmployees.map((employee) => (
          <Card key={employee.id} className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 flex items-center justify-center text-white font-bold font-sf-pro">
                    {employee.firstName[0]}{employee.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 font-sf-pro">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <p className="text-sm text-slate-600 font-sf-pro">{employee.jobTitle}</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 font-sf-pro">
                  <Briefcase className="h-4 w-4" />
                  {employee.department}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 font-sf-pro">
                  <Mail className="h-4 w-4" />
                  {employee.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 font-sf-pro">
                  <Phone className="h-4 w-4" />
                  {employee.phone}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full font-sf-pro ${getStatusColor(employee.status)}`}>
                    {employee.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full font-sf-pro ${getEmploymentTypeColor(employee.employmentType)}`}>
                    {employee.employmentType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="font-sf-pro">
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
