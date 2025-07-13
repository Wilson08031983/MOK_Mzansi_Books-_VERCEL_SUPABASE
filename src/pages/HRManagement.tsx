
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  GraduationCap,
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
import TrainingManagement from '@/components/hr/TrainingManagement';
import ModulePlaceholder from '@/components/hr/ModulePlaceholder';
import { Employee, getAllEmployees } from '@/services/employeeService';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'directory' | 'leave' | 'attendance' | 'training' | 'performance' | 'payroll'>('dashboard');

  // Sample data
  const hrMetrics = {
    totalEmployees: 127,
    newHires: 8,
    onLeaveToday: 5,
    upcomingBirthdays: 3,
    openPositions: 12,
    turnoverRate: 2.3
  };

  // Initialize with sample employees data structure
  const [employees, setEmployees] = useState<Employee[]>([]); 
  
  // Load employees from localStorage on component mount
  useEffect(() => {
    const storedEmployees = getAllEmployees();
    if (storedEmployees && storedEmployees.length > 0) {
      setEmployees(storedEmployees);
    } else {
      // Fallback to sample data if no data in localStorage
      setEmployees([
    {
      id: 'EMP001',
      employeeNumber: 'SP0323001',
      firstName: 'Sarah',
      surname: 'Parker',
      idType: 'ID Number',
      idValue: '8801156789123',
      email: 'sarah.parker@mokbooks.co.za',
      contactNumber: '071 234 5678',
      position: 'Senior Developer',
      department: 'Development',
      startDate: '2023-03-15',
      taxPercentage: 25,
      status: 'active',
      location: 'Johannesburg',
      employmentType: 'Full Time',
      dateOfBirth: '1988-01-15',
      addressLine1: '123 Main Street',
      addressLine2: 'Sandton',
      addressLine3: 'Johannesburg, Gauteng',
      addressLine4: '2196, South Africa',
      kinName: 'James',
      kinSurname: 'Parker',
      kinRelationship: 'Spouse',
      kinContactNumber: '072 123 4567',
      dayShift: true,
      nightShift: false,
      flexibleShift: false,
      accountHolderName: 'Sarah Parker',
      salary: 45000,
      paymentCycle: 'Monthly',
      bankName: 'First National Bank',
      accountNumber: '62123456789',
      branchCode: '250655'
    },
    {
      id: 'EMP002',
      employeeNumber: 'MJ0523001',
      firstName: 'Michael',
      surname: 'Johnson',
      idType: 'ID Number',
      idValue: '9103215678912',
      email: 'michael.johnson@mokbooks.co.za',
      contactNumber: '082 345 6789',
      position: 'UX Designer',
      department: 'Design',
      startDate: '2023-05-20',
      taxPercentage: 22,
      status: 'active',
      location: 'Cape Town',
      employmentType: 'Full Time',
      dateOfBirth: '1991-03-21',
      addressLine1: '45 Beach Road',
      addressLine2: 'Sea Point',
      addressLine3: 'Cape Town, Western Cape',
      addressLine4: '8001, South Africa',
      kinName: 'Sarah',
      kinSurname: 'Johnson',
      kinRelationship: 'Wife',
      kinContactNumber: '083 987 6543',
      dayShift: true,
      nightShift: false,
      flexibleShift: true,
      accountHolderName: 'Michael Johnson',
      salary: 38000,
      paymentCycle: 'Monthly',
      bankName: 'Standard Bank',
      accountNumber: '102345678',
      branchCode: '051001'
    },
    {
      id: 'EMP003',
      employeeNumber: 'LW1122001',
      firstName: 'Lisa',
      surname: 'Williams',
      idType: 'ID Number',
      idValue: '8506128901234',
      email: 'lisa.williams@mokbooks.co.za',
      contactNumber: '073 456 7890',
      position: 'Project Manager',
      department: 'Management',
      startDate: '2022-11-10',
      taxPercentage: 28,
      status: 'on-leave',
      location: 'Durban',
      employmentType: 'Full Time',
      dateOfBirth: '1985-06-12',
      addressLine1: '78 Umhlanga Rocks Drive',
      addressLine2: 'Umhlanga',
      addressLine3: 'Durban, KwaZulu-Natal',
      addressLine4: '4320, South Africa',
      kinName: 'Robert',
      kinSurname: 'Williams',
      kinRelationship: 'Husband',
      kinContactNumber: '074 111 2222',
      dayShift: false,
      nightShift: false,
      flexibleShift: true,
      accountHolderName: 'Lisa Williams',
      salary: 52000,
      paymentCycle: 'Monthly',
      bankName: 'ABSA',
      accountNumber: '4056781234',
      branchCode: '632005'
    },
    {
      id: 'EMP004',
      employeeNumber: 'DB0124001',
      firstName: 'David',
      surname: 'Brown',
      idType: 'ID Number',
      idValue: '9012115678123',
      email: 'david.brown@mokbooks.co.za',
      contactNumber: '061 567 8901',
      position: 'Finance Officer',
      department: 'Finance',
      startDate: '2024-01-05',
      taxPercentage: 18,
      status: 'active',
      location: 'Johannesburg',
      employmentType: 'Full Time',
      dateOfBirth: '1990-12-11',
      addressLine1: '56 Oxford Road',
      addressLine2: 'Rosebank',
      addressLine3: 'Johannesburg, Gauteng',
      addressLine4: '2196, South Africa',
      kinName: 'Maria',
      kinSurname: 'Brown',
      kinRelationship: 'Mother',
      kinContactNumber: '082 333 4444',
      dayShift: true,
      nightShift: false,
      flexibleShift: false,
      accountHolderName: 'David Brown',
      salary: 35000,
      paymentCycle: 'Monthly',
      bankName: 'Nedbank',
      accountNumber: '1122334455',
      branchCode: '198765'
    },
    {
      id: 'EMP005',
      employeeNumber: 'EW0823001',
      firstName: 'Emma',
      surname: 'Wilson',
      idType: 'ID Number',
      idValue: '9204235678912',
      email: 'emma.wilson@mokbooks.co.za',
      contactNumber: '084 678 9012',
      position: 'Marketing Specialist',
      department: 'Marketing',
      startDate: '2023-08-12',
      endDate: '2024-06-30',
      taxPercentage: 15,
      status: 'terminated',
      location: 'Cape Town',
      employmentType: 'Part Time',
      dateOfBirth: '1992-04-23',
      addressLine1: '12 Long Street',
      addressLine2: 'City Centre',
      addressLine3: 'Cape Town, Western Cape',
      addressLine4: '8001, South Africa',
      kinName: 'John',
      kinSurname: 'Wilson',
      kinRelationship: 'Father',
      kinContactNumber: '083 555 6666',
      dayShift: false,
      nightShift: true,
      flexibleShift: false,
      accountHolderName: 'Emma Wilson',
      salary: 18000,
      paymentCycle: 'Monthly',
      bankName: 'Capitec',
      accountNumber: '1598753245',
      branchCode: '470010'
    }
      ]);
    }
  }, []);

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
            { id: 'dashboard', label: 'HRM Dashboard', icon: <Users className="h-4 w-4" /> },
            { id: 'employees', label: 'Employees', icon: <Users className="h-4 w-4" /> },
            { id: 'directory', label: 'Employee Directory', icon: <Users className="h-4 w-4" /> },
            { id: 'leave', label: 'Leave Management', icon: <Calendar className="h-4 w-4" /> },
            { id: 'attendance', label: 'Time & Attendance', icon: <Clock className="h-4 w-4" /> },
            { id: 'training', label: 'Training', icon: <GraduationCap className="h-4 w-4" /> },
            { id: 'performance', label: 'Performance', icon: <Target className="h-4 w-4" /> },
            { id: 'payroll', label: 'Payroll', icon: <DollarSign className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "dashboard" | "employees" | "directory" | "leave" | "attendance" | "training" | "performance" | "payroll")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-sf-pro ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white shadow-colored'
                  : 'glass backdrop-blur-sm bg-white/50 border border-white/20 text-slate-700 hover:bg-white/70'
              }`}
            >
              {tab.icon}
              <span className={tab.id === 'dashboard' ? 'text-xs' : ''}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'dashboard' && <HRDashboard metrics={hrMetrics} employees={employees} setEmployees={setEmployees} />}
          {activeTab === 'employees' && <EmployeeManagement employees={employees} setEmployees={setEmployees} />}
          {activeTab === 'directory' && <EmployeeDirectory employees={employees} />}
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
          {activeTab === 'training' && (
            <TrainingManagement
              employees={employees}
              setEmployees={setEmployees}
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
