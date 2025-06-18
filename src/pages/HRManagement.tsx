
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  UserPlus,
  Target,
  DollarSign,
  FileText,
  Check,
  Plus,
  Search
} from 'lucide-react';
import HRDashboard from '@/components/hr/HRDashboard';
import EmployeeManagement from '@/components/hr/EmployeeManagement';
import EmployeeDirectory from '@/components/hr/EmployeeDirectory';
import LeaveManagement from '@/components/hr/LeaveManagement';
import PayrollManagement from '@/components/hr/PayrollManagement';
import ModulePlaceholder from '@/components/hr/ModulePlaceholder';

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

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePosition: string;
  leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'personal' | 'emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  managerId?: string;
  managerName?: string;
  approvedDate?: string;
  rejectedReason?: string;
}

interface LeaveBalance {
  employeeId: string;
  employeeName: string;
  department: string;
  annual: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  personal: { total: number; used: number; remaining: number };
}

const HRManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'directory' | 'leave' | 'attendance' | 'recruitment' | 'performance' | 'payroll'>('dashboard');

  // Sample data
  const hrMetrics = {
    totalEmployees: 127,
    newHires: 8,
    onLeaveToday: 5,
    upcomingBirthdays: 3,
    openPositions: 12,
    turnoverRate: 2.3
  };

  // Updated employees data structure
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 'EMP001',
      name: 'Sarah Parker',
      email: 'sarah.parker@mokbooks.co.za',
      phone: '071 234 5678',
      position: 'Senior Developer',
      department: 'Development',
      startDate: '2023-03-15',
      status: 'active',
      location: 'Johannesburg',
      employmentType: 'full-time'
    },
    {
      id: 'EMP002',
      name: 'Michael Johnson',
      email: 'michael.johnson@mokbooks.co.za',
      phone: '082 345 6789',
      position: 'UX Designer',
      department: 'Design',
      startDate: '2023-05-20',
      status: 'active',
      location: 'Cape Town',
      employmentType: 'full-time'
    },
    {
      id: 'EMP003',
      name: 'Lisa Williams',
      email: 'lisa.williams@mokbooks.co.za',
      phone: '073 456 7890',
      position: 'Project Manager',
      department: 'Management',
      startDate: '2022-11-10',
      status: 'on-leave',
      location: 'Durban',
      employmentType: 'full-time'
    },
    {
      id: 'EMP004',
      name: 'David Brown',
      email: 'david.brown@mokbooks.co.za',
      phone: '061 567 8901',
      position: 'Finance Officer',
      department: 'Finance',
      startDate: '2024-01-05',
      status: 'active',
      location: 'Johannesburg',
      employmentType: 'full-time'
    },
    {
      id: 'EMP005',
      name: 'Emma Wilson',
      email: 'emma.wilson@mokbooks.co.za',
      phone: '084 678 9012',
      position: 'Marketing Specialist',
      department: 'Marketing',
      startDate: '2023-08-12',
      status: 'terminated',
      location: 'Cape Town',
      employmentType: 'part-time'
    }
  ]);

  // Sample leave requests
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: 'LR001',
      employeeId: 'EMP001',
      employeeName: 'Sarah Parker',
      employeePosition: 'Senior Developer',
      leaveType: 'annual',
      startDate: '2024-03-15',
      endDate: '2024-03-22',
      days: 6,
      reason: 'Family vacation',
      status: 'pending',
      requestDate: '2024-02-20',
      managerId: 'MGR001',
      managerName: 'John Smith'
    },
    {
      id: 'LR002',
      employeeId: 'EMP002',
      employeeName: 'Michael Johnson',
      employeePosition: 'UX Designer',
      leaveType: 'sick',
      startDate: '2024-02-28',
      endDate: '2024-03-01',
      days: 2,
      reason: 'Flu symptoms',
      status: 'approved',
      requestDate: '2024-02-27',
      managerId: 'MGR002',
      managerName: 'Jane Doe',
      approvedDate: '2024-02-27'
    },
    {
      id: 'LR003',
      employeeId: 'EMP003',
      employeeName: 'Lisa Williams',
      employeePosition: 'Project Manager',
      leaveType: 'maternity',
      startDate: '2024-04-01',
      endDate: '2024-07-01',
      days: 90,
      reason: 'Maternity leave',
      status: 'approved',
      requestDate: '2024-01-15',
      managerId: 'MGR001',
      managerName: 'John Smith',
      approvedDate: '2024-01-16'
    },
    {
      id: 'LR004',
      employeeId: 'EMP004',
      employeeName: 'David Brown',
      employeePosition: 'Finance Officer',
      leaveType: 'personal',
      startDate: '2024-03-10',
      endDate: '2024-03-12',
      days: 3,
      reason: 'Personal matters',
      status: 'rejected',
      requestDate: '2024-03-05',
      managerId: 'MGR003',
      managerName: 'Robert Johnson',
      rejectedReason: 'Critical project deadline'
    }
  ]);

  // Sample leave balances
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([
    {
      employeeId: 'EMP001',
      employeeName: 'Sarah Parker',
      department: 'Development',
      annual: { total: 21, used: 5, remaining: 16 },
      sick: { total: 10, used: 2, remaining: 8 },
      personal: { total: 5, used: 1, remaining: 4 }
    },
    {
      employeeId: 'EMP002',
      employeeName: 'Michael Johnson',
      department: 'Design',
      annual: { total: 21, used: 8, remaining: 13 },
      sick: { total: 10, used: 4, remaining: 6 },
      personal: { total: 5, used: 0, remaining: 5 }
    },
    {
      employeeId: 'EMP003',
      employeeName: 'Lisa Williams',
      department: 'Management',
      annual: { total: 25, used: 12, remaining: 13 },
      sick: { total: 15, used: 3, remaining: 12 },
      personal: { total: 7, used: 2, remaining: 5 }
    },
    {
      employeeId: 'EMP004',
      employeeName: 'David Brown',
      department: 'Finance',
      annual: { total: 21, used: 3, remaining: 18 },
      sick: { total: 10, used: 1, remaining: 9 },
      personal: { total: 5, used: 0, remaining: 5 }
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-mokm-blue-50 via-mokm-purple-50 to-mokm-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-lg transition-colors font-sf-pro"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 font-sf-pro">HR Management</h1>
              <p className="text-slate-600 font-sf-pro">Manage employees, payroll, and human resources</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <Users className="h-4 w-4" /> },
            { id: 'employees', label: 'Employees', icon: <Users className="h-4 w-4" /> },
            { id: 'directory', label: 'Employee Directory', icon: <Users className="h-4 w-4" /> },
            { id: 'leave', label: 'Leave Management', icon: <Calendar className="h-4 w-4" /> },
            { id: 'attendance', label: 'Time & Attendance', icon: <Clock className="h-4 w-4" /> },
            { id: 'recruitment', label: 'Recruitment', icon: <UserPlus className="h-4 w-4" /> },
            { id: 'performance', label: 'Performance', icon: <Target className="h-4 w-4" /> },
            { id: 'payroll', label: 'Payroll', icon: <DollarSign className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-sf-pro ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white shadow-colored'
                  : 'glass backdrop-blur-sm bg-white/50 border border-white/20 text-slate-700 hover:bg-white/70'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'dashboard' && <HRDashboard metrics={hrMetrics} />}
          {activeTab === 'employees' && <EmployeeManagement employees={employees} setEmployees={setEmployees} />}
          {activeTab === 'directory' && <EmployeeDirectory />}
          {activeTab === 'leave' && (
            <LeaveManagement 
              leaveRequests={leaveRequests} 
              setLeaveRequests={setLeaveRequests}
              leaveBalances={leaveBalances}
              hrMetrics={hrMetrics}
            />
          )}
          {activeTab === 'attendance' && (
            <ModulePlaceholder
              title="Time & Attendance"
              description="Track employee hours, manage timesheets, and monitor attendance patterns."
              icon={<Clock className="h-8 w-8 text-white" />}
            />
          )}
          {activeTab === 'recruitment' && (
            <ModulePlaceholder
              title="Recruitment"
              description="Manage job postings, track candidates, and streamline the hiring process."
              icon={<UserPlus className="h-8 w-8 text-white" />}
            />
          )}
          {activeTab === 'performance' && (
            <ModulePlaceholder
              title="Performance Management"
              description="Set goals, conduct reviews, and track employee performance metrics."
              icon={<Target className="h-8 w-8 text-white" />}
            />
          )}
          {activeTab === 'payroll' && <PayrollManagement />}
        </div>
      </div>
    </div>
  );
};

export default HRManagement;
