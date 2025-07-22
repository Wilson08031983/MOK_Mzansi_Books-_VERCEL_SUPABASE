
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
  Search,
  PiggyBank,
  AlertTriangle
} from 'lucide-react';
import HRDashboard from '@/components/hr/HRDashboard';
import EmployeeManagement from '@/components/hr/EmployeeManagement';
import EmployeeDirectory from '@/components/hr/EmployeeDirectory';
import LeaveManagement from '@/components/hr/LeaveManagement';
import PayrollManagement from '@/components/hr/PayrollManagement';
import TrainingManagement from '@/components/hr/TrainingManagement';
import ModulePlaceholder from '@/components/hr/ModulePlaceholder';
import TimeAttendance from '@/components/hr/TimeAttendance';
import AllowanceManagement from '@/components/hr/AllowanceManagement';
import PerformanceManagement from '@/components/hr/PerformanceManagement';
import DisciplinaryManagement from '@/components/hr/DisciplinaryManagement';
import EmployeeProfile from '@/components/hr/EmployeeProfile';
import { Employee, getAllEmployees } from '@/services/employeeService';
import { LeaveRequest, LeaveBalance, LeaveTypes } from '@/components/hr/LeaveManagementTypes';

// Using shared types from LeaveManagementTypes

const HRManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'directory' | 'leave' | 'attendance' | 'training' | 'performance' | 'disciplinary' | 'allowance' | 'payroll'>('dashboard');
  const [viewingProfile, setViewingProfile] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Initialize employees state
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // State for HR metrics that updates when employees change
  const [hrMetrics, setHrMetrics] = useState({
    totalEmployees: 0,
    newHires: 0,
    onLeaveToday: 0,
    upcomingBirthdays: 0,
    openPositions: 5,
    turnoverRate: 0
  });

  // Update metrics when employees data changes
  useEffect(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Total active employees
    const totalEmployees = employees.filter(emp => emp.status === 'active').length;
    
    // New hires this month
    const newHires = employees.filter(emp => {
      const startDate = new Date(emp.startDate);
      return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
    }).length;
    
    // Employees on leave today
    const onLeaveToday = employees.filter(emp => emp.status === 'on-leave').length;
    
    // Upcoming birthdays this week
    const upcomingBirthdays = employees.filter(emp => {
      if (!emp.dateOfBirth) return false;
      const birthDate = new Date(emp.dateOfBirth);
      const thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
      return thisYearBirthday >= today && thisYearBirthday <= oneWeekFromNow;
    }).length;
    
    // Mock data for positions and turnover (would come from job postings system)
    const openPositions = 5; // This would be calculated from actual job postings
    const turnoverRate = totalEmployees > 0 ? ((employees.filter(emp => emp.status === 'terminated').length / totalEmployees) * 100).toFixed(1) : 0;
    
    setHrMetrics({
      totalEmployees,
      newHires,
      onLeaveToday,
      upcomingBirthdays,
      openPositions,
      turnoverRate: parseFloat(turnoverRate.toString())
    });
  }, [employees]);

  // Quick action handlers
  const handleAddEmployee = () => {
    setActiveTab('employees');
    // The EmployeeManagement component will handle opening the add modal
  };

  const handleApproveLeave = () => {
    setActiveTab('leave');
    // The LeaveManagement component will show pending leave requests
  };



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
    id: 'LR003',
    employeeId: employees[2]?.id || 'EMP003',
    employeeNumber: employees[2]?.employeeNumber || 'LM0323003',
    employeeName: `${employees[2]?.firstName || 'Lisa'} ${employees[2]?.surname || 'Mbatha'}`,
    employeePosition: 'HR Specialist',
    leaveType: LeaveTypes.FamilyResponsibility,
    startDate: '2025-07-29',
    endDate: '2025-07-29',
    days: 1,
    reason: 'Family matter',
    status: 'pending',
    requestDate: '2025-07-25'
  },
  {
    id: 'LR001',
    employeeId: employees[0]?.id || 'EMP001',
    employeeNumber: employees[0]?.employeeNumber || 'SP0323001',
    employeeName: `${employees[0]?.firstName || 'Sarah'} ${employees[0]?.surname || 'Parker'}`,
    employeePosition: 'Accountant',
    leaveType: LeaveTypes.Annual,
    startDate: '2025-08-10',
    endDate: '2025-08-15',
    days: 5,
    reason: 'Family vacation',
    status: 'approved',
    requestDate: '2025-07-25'
  },
  {
    id: 'LR004',
    employeeId: employees[1]?.id || 'EMP002',
    employeeNumber: employees[1]?.employeeNumber || 'JR0323002',
    employeeName: `${employees[1]?.firstName || 'John'} ${employees[1]?.surname || 'Rodriguez'}`,
    employeePosition: 'Developer',
    leaveType: LeaveTypes.Maternity,
    startDate: '2025-09-01',
    endDate: '2025-12-31',
    days: 86,
    reason: 'Maternity Leave',
    status: 'rejected',
    requestDate: '2025-07-15',
    rejectedReason: 'Please apply for paternity leave instead'
  },
  {
    id: 'LR002',
    employeeId: employees[1]?.id || 'EMP002',
    employeeNumber: employees[1]?.employeeNumber || 'JR0323002',
    employeeName: `${employees[1]?.firstName || 'John'} ${employees[1]?.surname || 'Rodriguez'}`,
    employeePosition: 'Developer',
    leaveType: LeaveTypes.Sick,
    startDate: '2025-07-18',
    endDate: '2025-07-19',
    days: 2,
    reason: 'Flu',
    status: 'approved',
    requestDate: '2025-07-17'
  },
  {
    id: 'LR005',
    employeeId: employees[3]?.id || 'EMP004',
    employeeNumber: employees[3]?.employeeNumber || 'DM0323004',
    employeeName: `${employees[3]?.firstName || 'David'} ${employees[3]?.surname || 'Mhlanga'}`,
    employeePosition: 'Marketing Specialist',
    leaveType: LeaveTypes.Religious,
    startDate: '2025-07-30',
    endDate: '2025-08-01',
    days: 3,
    reason: 'Personal matters',
    status: 'rejected',
    requestDate: '2025-07-05',
    rejectedReason: 'Critical project deadline'
  }
  ]);

  // Sample leave balances based on South African BCEA laws
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([
    {
      employeeId: employees[0]?.id || 'EMP001',
      employeeName: `${employees[0]?.firstName || 'Sarah'} ${employees[0]?.surname || 'Parker'}`,
      department: 'Development',
      // Standard leave types
      annual: { total: 21, used: 5, remaining: 16, accrued: 21 },
      sick: { total: 30, used: 2, remaining: 28 },
      familyResponsibility: { total: 3, used: 1, remaining: 2 },
      maternity: { total: 120, used: 0, remaining: 120 },
      parental: { total: 10, used: 0, remaining: 10 },
      // Additional leave types
      adoption: { total: 0, used: 0, remaining: 0 },
      commissioning: { total: 0, used: 0, remaining: 0 },
      bereavement: { total: 0, used: 0, remaining: 0 },
      religious: { total: 2, used: 0, remaining: 2 },  // Religious observance leave
      study: { total: 5, used: 0, remaining: 5 },      // Study leave
      unpaid: { days: 0 },
      // Status trackers
      onMaternityLeave: false,
      jobReserved: false,
      // Employment information
      employmentStartDate: '2023-01-01',
      employmentLengthMonths: 18,
      leaveAnniversaryDate: '2025-01-01'
    },
    {
      employeeId: 'EMP002',
      employeeName: 'Michael Johnson',
      department: 'Design',
      // Standard leave types
      annual: { total: 21, used: 8, remaining: 13, accrued: 21 },
      sick: { total: 30, used: 4, remaining: 26 },
      familyResponsibility: { total: 3, used: 0, remaining: 3 },
      maternity: { total: 0, used: 0, remaining: 0 },
      parental: { total: 10, used: 0, remaining: 10 },
      // Additional leave types
      adoption: { total: 0, used: 0, remaining: 0 },
      commissioning: { total: 0, used: 0, remaining: 0 },
      bereavement: { total: 0, used: 0, remaining: 0 },
      religious: { total: 0, used: 0, remaining: 0 },
      study: { total: 3, used: 2, remaining: 1 },      // Study leave partially used
      unpaid: { days: 0 },
      // Status trackers
      onMaternityLeave: false,
      jobReserved: false,
      // Employment information
      employmentStartDate: '2022-05-15',
      employmentLengthMonths: 26,
      leaveAnniversaryDate: '2025-05-15'
    },
    {
      employeeId: 'EMP003',
      employeeName: 'Lisa Williams',
      department: 'Management',
      // Standard leave types
      annual: { total: 25, used: 12, remaining: 13, accrued: 25 },
      sick: { total: 30, used: 3, remaining: 27 },
      familyResponsibility: { total: 3, used: 2, remaining: 1 },
      maternity: { total: 120, used: 0, remaining: 120 },
      parental: { total: 10, used: 0, remaining: 10 },
      // Additional leave types
      adoption: { total: 0, used: 0, remaining: 0 },
      commissioning: { total: 0, used: 0, remaining: 0 },
      bereavement: { total: 0, used: 0, remaining: 0 },
      religious: { total: 2, used: 1, remaining: 1 },  // Religious leave partially used
      study: { total: 0, used: 0, remaining: 0 },
      unpaid: { days: 0 },
      // Status trackers
      onMaternityLeave: false,
      jobReserved: false,
      // Employment information
      employmentStartDate: '2022-11-10',
      employmentLengthMonths: 20,
      leaveAnniversaryDate: '2025-11-10'
    },
    {
      employeeId: 'EMP004',
      employeeName: 'David Brown',
      department: 'Finance',
      // Standard leave types
      annual: { total: 21, used: 3, remaining: 18, accrued: 21 },
      sick: { total: 30, used: 1, remaining: 29 },
      familyResponsibility: { total: 3, used: 0, remaining: 3 },
      maternity: { total: 0, used: 0, remaining: 0 },
      parental: { total: 10, used: 0, remaining: 10 },
      // Additional leave types
      adoption: { total: 0, used: 0, remaining: 0 },
      commissioning: { total: 0, used: 0, remaining: 0 },
      bereavement: { total: 0, used: 0, remaining: 0 },
      religious: { total: 3, used: 0, remaining: 3 },  // Religious observance leave
      study: { total: 2, used: 0, remaining: 2 },      // Study leave
      unpaid: { days: 0 },
      // Status trackers
      onMaternityLeave: false,
      jobReserved: false,
      // Employment information
      employmentStartDate: '2023-03-01',
      employmentLengthMonths: 16,
      leaveAnniversaryDate: '2025-03-01'
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
            { id: 'disciplinary', label: 'Disciplinary', icon: <AlertTriangle className="h-4 w-4" /> },
            { id: 'allowance', label: 'Allowance', icon: <PiggyBank className="h-4 w-4" /> },
            { id: 'payroll', label: 'Payroll', icon: <DollarSign className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "dashboard" | "employees" | "directory" | "leave" | "attendance" | "training" | "performance" | "disciplinary" | "allowance" | "payroll")}
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
          {activeTab === 'dashboard' && <HRDashboard 
            metrics={hrMetrics}
            onAddEmployee={handleAddEmployee}
            onApproveLeave={handleApproveLeave}
          />}
          {activeTab === 'employees' && <EmployeeManagement employees={employees} setEmployees={setEmployees} />}
          {activeTab === 'directory' && !viewingProfile && (
            <EmployeeDirectory 
              employees={employees} 
              onViewProfile={(employee) => {
                setSelectedEmployee(employee);
                setViewingProfile(true);
              }} 
            />
          )}
          {activeTab === 'directory' && viewingProfile && (
            <EmployeeProfile 
              employee={selectedEmployee} 
              onBack={() => {
                setViewingProfile(false);
                setSelectedEmployee(null);
              }} 
            />
          )}
          {activeTab === 'leave' && (
            <LeaveManagement 
              leaveRequests={leaveRequests} 
              setLeaveRequests={setLeaveRequests}
              leaveBalances={leaveBalances}
              hrMetrics={hrMetrics}
              employees={employees}
            />
          )}
          {activeTab === 'attendance' && (
            <TimeAttendance
              employees={employees}
            />
          )}
          {activeTab === 'training' && (
            <TrainingManagement
              employees={employees}
              setEmployees={setEmployees}
            />
          )}
          {activeTab === 'performance' && (
            <PerformanceManagement
              employees={employees}
            />
          )}
          {activeTab === 'disciplinary' && (
            <DisciplinaryManagement
              employees={employees}
            />
          )}
          {activeTab === 'allowance' && (
            <AllowanceManagement
              employees={employees}
            />
          )}
          {activeTab === 'payroll' && <PayrollManagement />}
        </div>
      </div>
    </div>
  );
};

export default HRManagement;
