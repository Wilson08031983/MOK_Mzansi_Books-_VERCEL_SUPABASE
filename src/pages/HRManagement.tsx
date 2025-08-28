
import React, { useState, useEffect } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  ChevronLeft,
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
import DashboardBackground from '@/components/dashboard/DashboardBackground';
import { addNotification, getNotifications } from '@/services/notificationService';

import { Employee, getAllEmployees, cleanupDuplicateEmployees, resetAndInitializeEmployees, forceCleanupDuplicates } from '@/services/employeeService';
import { syncTeamMembersToEmployees } from '@/services/teamEmployeeSyncService';
import { cleanupAllSampleData } from '@/services/cleanupSampleData';
import { LeaveRequest, LeaveBalance, LeaveTypes } from '@/components/hr/LeaveManagementTypes';
import { createSampleEmployeesWithData } from '@/services/sampleDataGenerator';

// Using shared types from LeaveManagementTypes

const HRManagement: React.FC = () => {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'directory' | 'leave' | 'attendance' | 'training' | 'performance' | 'disciplinary' | 'allowance' | 'payroll'>('dashboard');
  const [viewingProfile, setViewingProfile] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Initialize employees state
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Helper to identify the seeded Regular User account globally
  const isDefaultRegularUser = (emp: Employee): boolean => {
    const byEmail = (emp.email || '').toLowerCase() === 'user@mokmzansibooks.com';
    const byName = (emp.firstName?.trim() === 'Regular' && emp.surname?.trim() === 'User');
    return byEmail || byName;
  };

  // Employees to pass into child tabs/components (exclude the default Regular User)
  const filteredEmployees = employees.filter(emp => !isDefaultRegularUser(emp));

  // State for HR metrics that updates when employees change
  const [hrMetrics, setHrMetrics] = useState({
    totalEmployees: 0,
    newHires: 0,
    onLeaveToday: 0,
    upcomingBirthdays: 0,
    openPositions: 5,
    turnoverRate: 0
  });

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
      annual: { total: 21, used: 21, remaining: 16, accrued: 21 },
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

  // Update metrics when employees data changes
  useEffect(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Total active employees (excluding default Regular User to match Employee tab display)
    const activeEmployees = employees.filter(emp => {
      // Only count active employees
      if (emp.status !== 'active') return false;
      
      // Exclude the default Regular User (same logic as EmployeeManagement component)
      const isDefaultRegularUser = (emp.email || '').toLowerCase() === 'user@mokmzansibooks.com' ||
                                  (emp.firstName?.trim() === 'Regular' && emp.surname?.trim() === 'User');
      
      return !isDefaultRegularUser;
    });
    const totalEmployees = activeEmployees.length;
    
    // Debug logging to show which employees are being counted
    console.log('🔍 [HRMetrics] Active employees being counted (excluding Regular User):', activeEmployees.map(emp => ({
      id: emp.id,
      name: `${emp.firstName} ${emp.surname}`,
      email: emp.email,
      status: emp.status,
      position: emp.position
    })));
    console.log(`📊 [HRMetrics] Total active employees displayed: ${totalEmployees}`);
    
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

  // Sample data creation handler
  const handleCreateSampleData = () => {
    try {
      console.log('🚀 Creating sample employees with Time & Attendance and Allowances...');
      const result = createSampleEmployeesWithData();
      
      if (result.success) {
        console.log(`✅ Successfully created ${result.employeesCreated} employees with complete data`);
        // Refresh employees list
        const updatedEmployees = getAllEmployees();
        setEmployees(updatedEmployees);
      } else {
        console.error('❌ Some errors occurred during sample data creation:', result.errors);
      }
    } catch (error) {
      console.error('❌ Failed to create sample data:', error);
    }
  };

  // Make sample data creation available globally for console access
  useEffect(() => {
    (window as any).createSampleEmployeesWithData = handleCreateSampleData;
    console.log('📝 Sample data creation available. Run createSampleEmployeesWithData() in console to create employees.');
  }, []);

  // Load employees from localStorage on component mount
  useEffect(() => {
    // Always force cleanup duplicates to ensure clean state
    forceCleanupDuplicates();
    
    // Remove all sample employees and related data, preserving only Admin
    const cleanupResult = cleanupAllSampleData();
    console.log('🧹 [HR] Cleanup result:', cleanupResult);
    
    // Sync Team Members into Employees so HR reflects Company > Team as source of truth
    const syncResult = syncTeamMembersToEmployees();
    console.log('🔗 [HR] Team-to-Employee sync result:', syncResult);
    
    // Remove any legacy statically-seeded Admin User if present (pre-linkage artifact)
    try {
      const stored = getAllEmployees();
      const before = stored.length;
      const filtered = stored.filter(e => !(
        e.firstName === 'Admin' &&
        e.surname === 'User' &&
        (e.position === 'Software Developer' || e.email?.toLowerCase() === 'admin.user@mokmzansibooks.com')
      ));
      if (filtered.length !== before) {
        localStorage.setItem('employees', JSON.stringify(filtered));
        console.log('🗑️ [HR] Removed legacy seeded Admin User from employees');
      }
    } catch (err) {
      console.warn('⚠️ [HR] Failed legacy Admin cleanup (safe to ignore):', err);
    }
    
    // Load employees from localStorage
    const storedEmployees = getAllEmployees();
    console.log('Loaded employees:', storedEmployees.length, storedEmployees.map(e => `${e.firstName} ${e.surname} (ID: ${e.id})`));
    setEmployees(storedEmployees);
  }, []);

  // HR notifications listener and de-duplication
  useEffect(() => {
    const isDuplicate = (title: string, message: string, withinMinutes: number) => {
      const notifications = getNotifications();
      const now = Date.now();
      const windowMs = withinMinutes * 60 * 1000;
      return notifications.some(n => {
        const ts = new Date(n.date).getTime();
        return n.title === title && n.message === message && (now - ts) < windowMs;
      });
    };

    const handler = (e: Event) => {
      const event = e as CustomEvent;
      const detail = event.detail || {};
      if (detail?.entity !== 'employee') return;

      // Always refresh employees on HR update
      try {
        const updatedEmployees = getAllEmployees();
        setEmployees(updatedEmployees);
      } catch {}

      const emp = detail.employee;
      const fullName = emp ? `${emp.firstName} ${emp.surname}` : 'Employee';
      let title = 'HR Update';
      let message = `${fullName} updated`;

      switch (detail.action) {
        case 'created':
          title = 'New Employee Added';
          message = `${fullName} (${emp?.position || 'Staff'}) joined. Employee No: ${emp?.employeeNumber}`;
          break;
        case 'updated':
          title = 'Employee Updated';
          message = `Profile updated for ${fullName}.`;
          break;
        case 'on-leave':
          title = 'Employee On Leave';
          message = `${fullName} is now on leave.`;
          break;
        case 'returned-from-leave':
          title = 'Employee Returned From Leave';
          message = `${fullName} has returned from leave.`;
          break;
        case 'terminated':
          title = 'Employee Terminated';
          message = `${fullName} is no longer working at the company.`;
          break;
        case 'deleted':
          title = 'Employee Deleted';
          message = `${fullName} profile has been deleted.`;
          break;
        case 'status-changed':
          title = 'Employee Status Changed';
          message = `${fullName} status changed to ${detail.newStatus}.`;
          break;
      }

      if (!isDuplicate(title, message, 5)) {
        addNotification({ title, message, type: 'system' });
      }
    };

    window.addEventListener('hr-updated', handler as EventListener);
    return () => window.removeEventListener('hr-updated', handler as EventListener);
  }, []);

  // Daily leave reminders: notify once per day while employee is on approved leave
  useEffect(() => {
    const isDuplicate = (title: string, message: string, withinMinutes: number) => {
      const notifications = getNotifications();
      const now = Date.now();
      const windowMs = withinMinutes * 60 * 1000;
      return notifications.some(n => {
        const ts = new Date(n.date).getTime();
        return n.title === title && n.message === message && (now - ts) < windowMs;
      });
    };

    const checkLeaveReminders = () => {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

      // Approved leave requests covering today
      leaveRequests
        .filter(lr => lr.status === 'approved')
        .forEach(lr => {
          const start = new Date(lr.startDate);
          const end = new Date(lr.endDate);
          if (start <= endOfToday && end >= startOfToday) {
            const remainingDays = Math.max(0, Math.ceil((end.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)) + 1);
            const title = `Leave Reminder: ${lr.employeeName}`;
            const message = `${lr.employeeName} is on ${lr.leaveType} leave (${lr.startDate} to ${lr.endDate}). ${remainingDays} day(s) remaining.`;
            // De-dupe within 24 hours
            if (!isDuplicate(title, message, 24 * 60)) {
              addNotification({ title, message, type: 'system' });
            }
          }
        });
    };

    // Run immediately and then periodically (hourly)
    checkLeaveReminders();
    const id = setInterval(checkLeaveReminders, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [leaveRequests]);

  // Listen for custom event to switch to payroll tab
  useEffect(() => {
    const handleSwitchToPayroll = (event: CustomEvent) => {
      setActiveTab('payroll');
      console.log('Switched to payroll tab for employee:', event.detail?.employeeId);
    };

    window.addEventListener('switchToPayrollTab', handleSwitchToPayroll as EventListener);
    
    return () => {
      window.removeEventListener('switchToPayrollTab', handleSwitchToPayroll as EventListener);
    };
  }, []);

  

  // After employees load/change, drop any leave data that references non-existing employees
  useEffect(() => {
    const ids = new Set(employees.map(e => e.id));
    setLeaveRequests(prev => prev.filter(item => ids.has(item.employeeId)));
    setLeaveBalances(prev => prev.filter(item => ids.has(item.employeeId)));
  }, [employees]);

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black p-6 relative">
      <DashboardBackground />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col gap-4">
            <Link 
              to="/dashboard"
              className="inline-flex items-center mb-6 px-4 py-2 text-sm font-medium glass backdrop-blur-md bg-slate-100/80 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/10 shadow-business hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors animate-fade-in"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t('common.backToDashboard')}
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent font-sf-pro">{t('hr.title')}</h1>
              <p className="text-slate-600 dark:text-slate-300 font-sf-pro">{t('hr.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'dashboard', label: t('hr.hrmDashboard'), icon: <Users className="h-4 w-4" /> },
            { id: 'employees', label: t('hr.employees'), icon: <Users className="h-4 w-4" /> },
            { id: 'directory', label: t('hr.employeeDirectory'), icon: <Users className="h-4 w-4" /> },
            { id: 'leave', label: t('hr.leaveManagement'), icon: <Calendar className="h-4 w-4" /> },
            { id: 'attendance', label: t('hr.timeAndAttendance'), icon: <Clock className="h-4 w-4" /> },
            { id: 'training', label: t('hr.training'), icon: <GraduationCap className="h-4 w-4" /> },
            { id: 'performance', label: t('hr.performance'), icon: <Target className="h-4 w-4" /> },
            { id: 'disciplinary', label: t('hr.disciplinary'), icon: <AlertTriangle className="h-4 w-4" /> },
            { id: 'allowance', label: t('hr.allowance'), icon: <PiggyBank className="h-4 w-4" /> },
            { id: 'payroll', label: t('hr.payroll'), icon: <DollarSign className="h-4 w-4" /> },

          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "dashboard" | "employees" | "directory" | "leave" | "attendance" | "training" | "performance" | "disciplinary" | "allowance" | "payroll")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-sf-pro ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white shadow-colored'
                  : 'glass backdrop-blur-sm bg-slate-200/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-white/15'
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
          {activeTab === 'employees' && <EmployeeManagement employees={filteredEmployees} setEmployees={setEmployees} />}
          {activeTab === 'directory' && !viewingProfile && (
            <EmployeeDirectory 
              employees={filteredEmployees} 
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
              employees={filteredEmployees}
            />
          )}
          {activeTab === 'attendance' && (
            <TimeAttendance
              employees={filteredEmployees}
            />
          )}
          {activeTab === 'training' && (
            <TrainingManagement
              employees={filteredEmployees}
              setEmployees={setEmployees}
            />
          )}
          {activeTab === 'performance' && (
            <PerformanceManagement
              employees={filteredEmployees}
            />
          )}
          {activeTab === 'disciplinary' && (
            <DisciplinaryManagement
              employees={filteredEmployees}
            />
          )}
          {activeTab === 'allowance' && (
            <AllowanceManagement
              employees={filteredEmployees}
            />
          )}
          {activeTab === 'payroll' && <PayrollManagement />}

        </div>
      </div>
    </div>
  );
};

export default HRManagement;
