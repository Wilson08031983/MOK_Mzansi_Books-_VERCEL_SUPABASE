import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addDays, parseISO, isToday, isSameDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import {
  Clock,
  Calendar,
  Search,
  Filter,
  Plus,
  Check,
  X,
  AlertCircle,
  Moon,
  Sun,
  FileText,
  Download,
  Upload,
  Info,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  ArrowUpDown,
  CalendarClock,
  Hourglass,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

import { Employee } from '@/services/employeeService';
import {
  TimeEntry,
  TimeEntryStatus,
  TimeEntryType,
  OvertimeRateType,
  WeeklyTimesheet,
  AttendanceSummary,
  isExemptFromOvertimeRules,
  calculateOvertimePay,
  calculateNightShiftAllowance,
  isNightShiftTime,
  calculateNightShiftHours
} from './TimeAttendanceTypes';
import { LeaveTypes } from './LeaveManagementTypes';
import { 
  calculateTimeEntry, 
  formatHours, 
  formatCurrency,
  type TimeCalculationResult 
} from './AutomatedCalculations';
import { isPublicHoliday, getPublicHolidayName } from './SouthAfricanHolidays';

interface TimeAttendanceProps {
  employees: Employee[];
}

const TimeAttendance: React.FC<TimeAttendanceProps> = ({ employees }) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('daily');
  
  // State for time entries
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  
  // State for weekly timesheets
  const [weeklyTimesheets, setWeeklyTimesheets] = useState<WeeklyTimesheet[]>([]);
  
  // State for attendance summaries
  const [attendanceSummaries, setAttendanceSummaries] = useState<AttendanceSummary[]>([]);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<string | { startDate: Date, endDate: Date }>(format(new Date(), 'yyyy-MM-dd'));
  const [filteredTimeEntries, setFilteredTimeEntries] = useState<TimeEntry[]>([]);
  
  // State for modals
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [isEditEntryModalOpen, setIsEditEntryModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [selectedTimesheet, setSelectedTimesheet] = useState<WeeklyTimesheet | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // State for new entry form
  const [newEntry, setNewEntry] = useState<Partial<TimeEntry>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    clockIn: '08:00',
    clockOut: '17:00',
    isNightShift: false,
    nightShiftAllowancePercentage: 10,
    overtimeRate: OvertimeRateType.Normal,
    status: TimeEntryStatus.Pending,
    type: TimeEntryType.Regular,
    isLeave: false
  });
  
  // State for real-time calculations
  const [calculationResult, setCalculationResult] = useState<TimeCalculationResult | null>(null);
  const [selectedEmployeeHourlyRate, setSelectedEmployeeHourlyRate] = useState<number>(0);
  
  // Get unique departments from employees
  const departments = [...new Set(employees.map(emp => emp.department))];
  
  // Real-time calculation effect
  useEffect(() => {
    if (newEntry.date && newEntry.clockIn && newEntry.clockOut && !newEntry.isLeave) {
      try {
        const result = calculateTimeEntry({
          date: newEntry.date,
          clockIn: newEntry.clockIn,
          clockOut: newEntry.clockOut,
          hourlyRate: selectedEmployeeHourlyRate,
          nightShiftAllowancePercentage: newEntry.nightShiftAllowancePercentage || 10
        });
        
        setCalculationResult(result);
        
        // Auto-update the newEntry with calculated values
        setNewEntry(prev => ({
          ...prev,
          totalHours: result.totalHours,
          regularHours: result.regularHours,
          overtimeHours: result.overtimeHours,
          nightShiftHours: result.nightShiftHours,
          overtimeRate: result.overtimeRate,
          type: result.entryType,
          isNightShift: result.isNightShift
        }));
      } catch (error) {
        console.error('Calculation error:', error);
        setCalculationResult(null);
      }
    } else {
      setCalculationResult(null);
    }
  }, [newEntry.date, newEntry.clockIn, newEntry.clockOut, newEntry.nightShiftAllowancePercentage, selectedEmployeeHourlyRate, newEntry.isLeave]);
  
  // Update hourly rate when employee is selected
  useEffect(() => {
    if (newEntry.employeeId) {
      const employee = employees.find(e => e.id === newEntry.employeeId);
      if (employee) {
        // Calculate hourly rate from monthly salary (assuming 160 hours per month)
        const hourlyRate = employee.salary / 160;
        setSelectedEmployeeHourlyRate(hourlyRate);
      }
    } else {
      setSelectedEmployeeHourlyRate(0);
    }
  }, [newEntry.employeeId, employees]);
  
  // Load data from localStorage on mount
  useEffect(() => {
    try {
      // Load time entries
      const savedTimeEntries = localStorage.getItem('timeEntries');
      if (savedTimeEntries) {
        const parsedEntries = JSON.parse(savedTimeEntries);
        setTimeEntries(parsedEntries);
        generateWeeklyTimesheets(parsedEntries);
      }
      
      // Load attendance summaries (shared with AllowanceManagement)
      const savedAttendanceSummaries = localStorage.getItem('attendanceSummaries');
      if (savedAttendanceSummaries) {
        const parsedSummaries = JSON.parse(savedAttendanceSummaries);
        setAttendanceSummaries(parsedSummaries);
        console.log('Loaded attendance summaries:', parsedSummaries);
      } else if (employees.length > 0) {
        // Create attendance summaries if none exist
        createDefaultAttendanceSummaries();
      }
      
      // If we have time entries but no attendance summaries loaded, generate them
      if (savedTimeEntries && !savedAttendanceSummaries && employees.length > 0) {
        const parsedEntries = JSON.parse(savedTimeEntries);
        generateAttendanceSummaries(parsedEntries);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
    
    // Initialize with sample data if no saved data and employees are available
    if (employees.length > 0 && timeEntries.length === 0) {
      generateSampleTimeEntries();
    }
  }, [employees]);
  
  // Generate sample time entries for demonstration
  const generateSampleTimeEntries = () => {
    if (employees.length === 0) return;
    
    const sampleEntries: TimeEntry[] = [];
    const today = new Date();
    
    // Generate entries for the past week
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, -i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Generate 2 entries per day (fixed)
      const entriesPerDay = 2;
      
      for (let j = 0; j < entriesPerDay; j++) {
        const employee = employees[j % employees.length]; // Cycle through employees
        
        // Fixed clock in/out times
        const clockInHour = 8; // Standard 8 AM start
        const clockInMinute = 0;
        const workHours = 8; // Standard 8 hour workday
        const clockOutHour = clockInHour + workHours;
        const clockOutMinute = 0;
        
        const clockIn = `${clockInHour.toString().padStart(2, '0')}:${clockInMinute.toString().padStart(2, '0')}`;
        const clockOut = `${clockOutHour.toString().padStart(2, '0')}:${clockOutMinute.toString().padStart(2, '0')}`;
        
        // Calculate hours
        const totalHours = workHours + (clockOutMinute - clockInMinute) / 60;
        const overtimeHours = Math.max(0, totalHours - 8); // Overtime after 8 hours
        const regularHours = totalHours - overtimeHours;
        
        // Determine if night shift
        const isNight = clockInHour >= 18 || clockOutHour <= 6 || clockOutHour >= 18;
        const nightShiftHours = isNight ? calculateNightShiftHours(clockIn, clockOut) : 0;
        
        // Determine entry type
        const dayOfWeek = date.getDay();
        let entryType = TimeEntryType.Regular;
        let overtimeRate = OvertimeRateType.Normal;
        
        if (dayOfWeek === 0) { // Sunday
          entryType = TimeEntryType.Weekend;
          overtimeRate = OvertimeRateType.Sunday;
        } else if (dayOfWeek === 6) { // Saturday
          entryType = TimeEntryType.Weekend;
        }
        
        sampleEntries.push({
          id: uuidv4(),
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.surname}`,
          employeeNumber: employee.employeeNumber,
          employeePosition: employee.position,
          date: dateStr,
          clockIn,
          clockOut,
          totalHours,
          regularHours,
          overtimeHours,
          overtimeRate,
          isNightShift: isNight,
          nightShiftHours,
          nightShiftAllowancePercentage: 10, // Default 10%
          status: TimeEntryStatus.Approved,
          type: entryType,
          isLeave: false,
          approvedBy: 'System',
          approvedDate: format(addDays(parseISO(dateStr), 1), 'yyyy-MM-dd')
        });
      }
    }
    
    setTimeEntries(sampleEntries);
    generateWeeklyTimesheets(sampleEntries);
    generateAttendanceSummaries(sampleEntries);
  };
  
  // Generate weekly timesheets from time entries
  const generateWeeklyTimesheets = (entries: TimeEntry[]) => {
    const timesheetMap = new Map<string, WeeklyTimesheet>();
    
    entries.forEach(entry => {
      const entryDate = parseISO(entry.date);
      const weekStart = format(startOfWeek(entryDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(entryDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const timesheetKey = `${entry.employeeId}-${weekStart}`;
      
      if (!timesheetMap.has(timesheetKey)) {
        timesheetMap.set(timesheetKey, {
          id: uuidv4(),
          employeeId: entry.employeeId,
          employeeName: entry.employeeName,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          timeEntries: [],
          totalRegularHours: 0,
          totalOvertimeHours: 0,
          totalNightShiftHours: 0,
          status: TimeEntryStatus.Pending,
          submittedDate: format(new Date(), 'yyyy-MM-dd')
        });
      }
      
      const timesheet = timesheetMap.get(timesheetKey)!;
      
      // Only add the entry if it's not already in the timesheet
      if (!timesheet.timeEntries.some(te => te.id === entry.id)) {
        timesheet.timeEntries.push(entry);
      }
      
      // Recalculate totals from all entries instead of incrementing
      // This ensures accuracy when entries are updated or removed
      timesheet.totalRegularHours = timesheet.timeEntries.reduce(
        (sum, te) => sum + te.regularHours, 0
      );
      timesheet.totalOvertimeHours = timesheet.timeEntries.reduce(
        (sum, te) => sum + te.overtimeHours, 0
      );
      timesheet.totalNightShiftHours = timesheet.timeEntries.reduce(
        (sum, te) => sum + te.nightShiftHours, 0
      );
      
      // Update timesheet status based on entries
      // If any entry is rejected, the timesheet is rejected
      // If any entry is pending (and none are rejected), the timesheet is pending
      // Otherwise, the timesheet is approved
      let hasRejected = false;
      let hasPending = false;
      
      timesheet.timeEntries.forEach(te => {
        if (te.status === TimeEntryStatus.Rejected) hasRejected = true;
        if (te.status === TimeEntryStatus.Pending) hasPending = true;
      });
      
      if (hasRejected) {
        timesheet.status = TimeEntryStatus.Rejected;
      } else if (hasPending) {
        timesheet.status = TimeEntryStatus.Pending;
      } else {
        timesheet.status = TimeEntryStatus.Approved;
      }
    });
    
    // Round all hour values to 2 decimal places for consistency
    const timesheets = Array.from(timesheetMap.values()).map(timesheet => ({
      ...timesheet,
      totalRegularHours: parseFloat(timesheet.totalRegularHours.toFixed(2)),
      totalOvertimeHours: parseFloat(timesheet.totalOvertimeHours.toFixed(2)),
      totalNightShiftHours: parseFloat(timesheet.totalNightShiftHours.toFixed(2))
    }));
    
    setWeeklyTimesheets(timesheets);
    return timesheets;
  };
  
  // Generate attendance summaries from time entries
  // Create default attendance summaries that match AllowanceManagement format
  const createDefaultAttendanceSummaries = () => {
    const summaries = employees.map(employee => ({
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.surname}`,
      department: employee.department,
      position: employee.position,
      currentMonthRegularHours: 160, // Standard 8 hours/day * 20 working days
      currentMonthOvertimeHours: 0, // No overtime by default
      currentMonthNightShiftHours: 0, // No night shift by default
      currentWeekOvertimeHours: 0,
      currentDayOvertimeHours: 0,
      attendanceRate: 100, // Perfect attendance by default
      punctualityRate: 100, // Perfect punctuality by default
      leaveHoursTaken: 0,
      isExemptFromOvertimeRules: isExemptFromOvertimeRules(employee.salary * 12)
    }));
    
    setAttendanceSummaries(summaries);
    localStorage.setItem('attendanceSummaries', JSON.stringify(summaries));
    console.log('Created default attendance summaries:', summaries);
  };

  const generateAttendanceSummaries = (entries: TimeEntry[]) => {
    const summaryMap = new Map<string, AttendanceSummary>();
    
    // Initialize summaries for all employees
    employees.forEach(employee => {
      summaryMap.set(employee.id, {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.surname}`,
        department: employee.department,
        position: employee.position,
        currentMonthRegularHours: 0,
        currentMonthOvertimeHours: 0,
        currentMonthNightShiftHours: 0,
        currentWeekOvertimeHours: 0,
        currentDayOvertimeHours: 0,
        attendanceRate: 100,
        punctualityRate: 100,
        leaveHoursTaken: 0,
        isExemptFromOvertimeRules: isExemptFromOvertimeRules(employee.salary * 12) // Convert monthly to annual
      });
    });
    
    // Get current date information
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    
    // Group entries by employee
    const entriesByEmployee = new Map<string, TimeEntry[]>();
    
    entries.forEach(entry => {
      if (!entriesByEmployee.has(entry.employeeId)) {
        entriesByEmployee.set(entry.employeeId, []);
      }
      entriesByEmployee.get(entry.employeeId)!.push(entry);
    });
    
    // Process each employee's entries
    entriesByEmployee.forEach((employeeEntries, employeeId) => {
      const summary = summaryMap.get(employeeId);
      if (!summary) return;
      
      // Reset counters to ensure accurate recalculation
      summary.currentMonthRegularHours = 0;
      summary.currentMonthOvertimeHours = 0;
      summary.currentMonthNightShiftHours = 0;
      summary.currentWeekOvertimeHours = 0;
      summary.currentDayOvertimeHours = 0;
      summary.leaveHoursTaken = 0;
      
      // Count scheduled workdays and attended days for attendance rate
      let scheduledWorkdays = 0;
      let attendedDays = 0;
      let onTimeDays = 0;
      
      employeeEntries.forEach(entry => {
        const entryDate = parseISO(entry.date);
        
        // Process current month entries
        if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
          if (entry.isLeave) {
            summary.leaveHoursTaken += entry.totalHours;
          } else {
            summary.currentMonthRegularHours += entry.regularHours;
            summary.currentMonthOvertimeHours += entry.overtimeHours;
            summary.currentMonthNightShiftHours += entry.nightShiftHours;
            
            // Count for attendance metrics
            scheduledWorkdays++;
            if (entry.status !== TimeEntryStatus.Rejected) {
              attendedDays++;
              
              // Check if employee was on time (within 5 minutes of scheduled time)
              const clockInHour = parseInt(entry.clockIn.split(':')[0], 10);
              const clockInMinute = parseInt(entry.clockIn.split(':')[1], 10);
              if (clockInHour < 9 || (clockInHour === 9 && clockInMinute <= 5)) {
                onTimeDays++;
              }
            }
          }
          
          // Update current week overtime if entry is from current week
          if (entryDate >= weekStart && entryDate <= weekEnd) {
            summary.currentWeekOvertimeHours += entry.overtimeHours;
          }
          
          // Update current day overtime if entry is from today
          if (isSameDay(entryDate, today)) {
            summary.currentDayOvertimeHours += entry.overtimeHours;
          }
        }
      });
      
      // Calculate attendance and punctuality rates
      if (scheduledWorkdays > 0) {
        summary.attendanceRate = parseFloat(((attendedDays / scheduledWorkdays) * 100).toFixed(1));
        summary.punctualityRate = parseFloat(((onTimeDays / attendedDays) * 100).toFixed(1));
      }
      
      // Round all hour values to 2 decimal places for consistency
      summary.currentMonthRegularHours = parseFloat(summary.currentMonthRegularHours.toFixed(2));
      summary.currentMonthOvertimeHours = parseFloat(summary.currentMonthOvertimeHours.toFixed(2));
      summary.currentMonthNightShiftHours = parseFloat(summary.currentMonthNightShiftHours.toFixed(2));
      summary.leaveHoursTaken = parseFloat(summary.leaveHoursTaken.toFixed(2));
    });
    
    const summaries = Array.from(summaryMap.values());
    setAttendanceSummaries(summaries);
    localStorage.setItem('attendanceSummaries', JSON.stringify(summaries));
    console.log('Generated and saved attendance summaries:', summaries);
    return summaries;
  };
  
  // Filter time entries based on search and filters
  useEffect(() => {
    const filtered = timeEntries.filter(entry => {
      const matchesSearch = entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = departmentFilter === 'all' || 
                               employees.find(e => e.id === entry.employeeId)?.department === departmentFilter;
      
      const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
      
      // Handle date filtering for both single date and date range
      let matchesDate = false;
      if (typeof dateFilter === 'string') {
        // Single date filter
        matchesDate = entry.date === dateFilter;
      } else {
        // Date range filter
        const entryDate = new Date(entry.date);
        matchesDate = entryDate >= dateFilter.startDate && entryDate <= dateFilter.endDate;
      }
      
      return matchesSearch && matchesDepartment && matchesStatus && matchesDate;
    });
    
    setFilteredTimeEntries(filtered);
  }, [timeEntries, searchTerm, departmentFilter, statusFilter, dateFilter, employees]);
  
  // Filter weekly timesheets
  const filteredTimesheets = weeklyTimesheets.filter(timesheet => {
    const matchesSearch = timesheet.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || 
                             employees.find(e => e.id === timesheet.employeeId)?.department === departmentFilter;
    
    const matchesStatus = statusFilter === 'all' || timesheet.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });
  
  // Filter attendance summaries
  const filteredSummaries = attendanceSummaries.filter(summary => {
    const matchesSearch = summary.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || summary.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });
  
  // Handle adding a new time entry
  const handleAddTimeEntry = () => {
    if (!newEntry.employeeId) {
      toast.error('Please select an employee');
      return;
    }
    
    const employee = employees.find(e => e.id === newEntry.employeeId);
    if (!employee) {
      toast.error('Selected employee not found');
      return;
    }
    
    // Use automated calculations if not a leave day
    let calculatedValues;
    if (!newEntry.isLeave && newEntry.date && newEntry.clockIn && newEntry.clockOut) {
      calculatedValues = calculateTimeEntry({
        date: newEntry.date,
        clockIn: newEntry.clockIn,
        clockOut: newEntry.clockOut,
        hourlyRate: selectedEmployeeHourlyRate,
        nightShiftAllowancePercentage: newEntry.nightShiftAllowancePercentage || 10
      });
      
      // Check overtime limits for non-exempt employees
      const isExempt = isExemptFromOvertimeRules(employee.salary * 12);
      const summary = attendanceSummaries.find(s => s.employeeId === newEntry.employeeId);
      
      if (!isExempt && summary && calculatedValues.overtimeHours > 0) {
        // Check daily overtime limit (3 hours)
        if (summary.currentDayOvertimeHours + calculatedValues.overtimeHours > 3) {
          toast.error('Daily overtime limit of 3 hours would be exceeded');
          return;
        }
        
        // Check weekly overtime limit (10 hours)
        if (summary.currentWeekOvertimeHours + calculatedValues.overtimeHours > 10) {
          toast.error('Weekly overtime limit of 10 hours would be exceeded');
          return;
        }
      }
    } else {
      // Default values for leave days or incomplete data
      calculatedValues = {
        totalHours: 0,
        regularHours: 0,
        overtimeHours: 0,
        nightShiftHours: 0,
        overtimeRate: OvertimeRateType.Normal,
        entryType: TimeEntryType.Regular,
        isNightShift: false
      };
    }
    
    const newTimeEntry: TimeEntry = {
      id: uuidv4(),
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.surname}`,
      employeeNumber: employee.employeeNumber,
      employeePosition: employee.position,
      date: newEntry.date || format(new Date(), 'yyyy-MM-dd'),
      clockIn: newEntry.clockIn || '08:00',
      clockOut: newEntry.clockOut || '17:00',
      totalHours: calculatedValues.totalHours,
      regularHours: calculatedValues.regularHours,
      overtimeHours: calculatedValues.overtimeHours,
      overtimeRate: calculatedValues.overtimeRate,
      isNightShift: calculatedValues.isNightShift,
      nightShiftHours: calculatedValues.nightShiftHours,
      nightShiftAllowancePercentage: newEntry.nightShiftAllowancePercentage || 10,
      status: TimeEntryStatus.Pending,
      notes: newEntry.notes,
      type: calculatedValues.entryType,
      isLeave: newEntry.isLeave || false,
      leaveType: newEntry.isLeave ? newEntry.leaveType : undefined
    };
    
    const updatedEntries = [...timeEntries, newTimeEntry];
    setTimeEntries(updatedEntries);
    generateWeeklyTimesheets(updatedEntries);
    generateAttendanceSummaries(updatedEntries);
    
    // Save to localStorage
    try {
      localStorage.setItem('timeEntries', JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Failed to save time entries to localStorage:', error);
    }
    
    setIsAddEntryModalOpen(false);
    setNewEntry({
      date: format(new Date(), 'yyyy-MM-dd'),
      clockIn: '08:00',
      clockOut: '17:00',
      isNightShift: false,
      nightShiftAllowancePercentage: 10,
      overtimeRate: OvertimeRateType.Normal,
      status: TimeEntryStatus.Pending,
      type: TimeEntryType.Regular,
      isLeave: false
    });
    
    // Reset calculation result
    setCalculationResult(null);
    setSelectedEmployeeHourlyRate(0);
    
    toast.success('Time entry added successfully with automated calculations');
  };
  
  // Handle updating a time entry
  const handleUpdateTimeEntry = () => {
    if (!selectedEntry) return;
    
    // Use automated calculations if not a leave day
    let calculatedValues;
    if (!selectedEntry.isLeave && selectedEntry.date && selectedEntry.clockIn && selectedEntry.clockOut) {
      const employee = employees.find(e => e.id === selectedEntry.employeeId);
      const hourlyRate = employee ? employee.salary / 160 : 0;
      
      calculatedValues = calculateTimeEntry({
        date: selectedEntry.date,
        clockIn: selectedEntry.clockIn,
        clockOut: selectedEntry.clockOut,
        hourlyRate: hourlyRate,
        nightShiftAllowancePercentage: selectedEntry.nightShiftAllowancePercentage || 10
      });
    } else {
      // Keep existing values for leave days
      calculatedValues = {
        totalHours: selectedEntry.totalHours,
        regularHours: selectedEntry.regularHours,
        overtimeHours: selectedEntry.overtimeHours,
        nightShiftHours: selectedEntry.nightShiftHours,
        overtimeRate: selectedEntry.overtimeRate,
        entryType: selectedEntry.type,
        isNightShift: selectedEntry.isNightShift
      };
    }
    
    // Create updated entry with recalculated hours
    const updatedSelectedEntry = {
      ...selectedEntry,
      totalHours: calculatedValues.totalHours,
      regularHours: calculatedValues.regularHours,
      overtimeHours: calculatedValues.overtimeHours,
      nightShiftHours: calculatedValues.nightShiftHours,
      overtimeRate: calculatedValues.overtimeRate,
      type: calculatedValues.entryType,
      isNightShift: calculatedValues.isNightShift
    };
    
    const updatedEntries = timeEntries.map(entry => 
      entry.id === selectedEntry.id ? updatedSelectedEntry : entry
    );
    
    setTimeEntries(updatedEntries);
    generateWeeklyTimesheets(updatedEntries);
    generateAttendanceSummaries(updatedEntries);
    
    // Save to localStorage
    try {
      localStorage.setItem('timeEntries', JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Failed to save time entries to localStorage:', error);
    }
    
    setIsEditEntryModalOpen(false);
    setSelectedEntry(null);
    
    toast.success('Time entry updated successfully with automated calculations');
  };
  
  // Handle deleting a time entry
  const handleDeleteTimeEntry = (id: string) => {
    const updatedEntries = timeEntries.filter(entry => entry.id !== id);
    setTimeEntries(updatedEntries);
    generateWeeklyTimesheets(updatedEntries);
    generateAttendanceSummaries(updatedEntries);
    
    // Save to localStorage
    try {
      localStorage.setItem('timeEntries', JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Failed to save time entries to localStorage:', error);
    }
    
    toast.success('Time entry deleted successfully');
  };
  
  // Handle approving a time entry
  const handleApproveTimeEntry = (id: string) => {
    const updatedEntries = timeEntries.map(entry => 
      entry.id === id ? {
        ...entry,
        status: TimeEntryStatus.Approved,
        approvedBy: 'Current User', // Replace with actual user
        approvedDate: format(new Date(), 'yyyy-MM-dd')
      } : entry
    );
    
    setTimeEntries(updatedEntries);
    generateWeeklyTimesheets(updatedEntries);
    generateAttendanceSummaries(updatedEntries);
    
    toast.success('Time entry approved successfully');
  };
  
  // Handle rejecting a time entry
  const handleRejectTimeEntry = (id: string, reason: string) => {
    const updatedEntries = timeEntries.map(entry => 
      entry.id === id ? {
        ...entry,
        status: TimeEntryStatus.Rejected,
        rejectedReason: reason
      } : entry
    );
    
    setTimeEntries(updatedEntries);
    generateWeeklyTimesheets(updatedEntries);
    generateAttendanceSummaries(updatedEntries);
    
    toast.success('Time entry rejected successfully');
  };
  
  // Handle approving a weekly timesheet
  const handleApproveTimesheet = (timesheetId: string) => {
    // Find the timesheet
    const timesheet = weeklyTimesheets.find(ts => ts.id === timesheetId);
    if (!timesheet) return;
    
    // Update all pending time entries in this timesheet to approved
    const updatedEntries = timeEntries.map(entry => {
      // Check if this entry belongs to the timesheet (same employee and week)
      const entryDate = parseISO(entry.date);
      const weekStart = format(startOfWeek(entryDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      
      if (entry.employeeId === timesheet.employeeId && 
          weekStart === timesheet.weekStartDate && 
          entry.status === TimeEntryStatus.Pending) {
        return {
          ...entry,
          status: TimeEntryStatus.Approved,
          approvedBy: 'Current User', // Replace with actual user
          approvedDate: format(new Date(), 'yyyy-MM-dd')
        };
      }
      return entry;
    });
    
    // Update state
    setTimeEntries(updatedEntries);
    generateWeeklyTimesheets(updatedEntries);
    generateAttendanceSummaries(updatedEntries);
    
    toast.success('Timesheet approved successfully');
  };
  
  // Handle rejecting a weekly timesheet
  const handleRejectTimesheet = (timesheetId: string, reason: string) => {
    // Find the timesheet
    const timesheet = weeklyTimesheets.find(ts => ts.id === timesheetId);
    if (!timesheet) return;
    
    // Update all pending time entries in this timesheet to rejected
    const updatedEntries = timeEntries.map(entry => {
      // Check if this entry belongs to the timesheet (same employee and week)
      const entryDate = parseISO(entry.date);
      const weekStart = format(startOfWeek(entryDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      
      if (entry.employeeId === timesheet.employeeId && 
          weekStart === timesheet.weekStartDate && 
          entry.status === TimeEntryStatus.Pending) {
        return {
          ...entry,
          status: TimeEntryStatus.Rejected,
          rejectedReason: reason
        };
      }
      return entry;
    });
    
    // Update state
    setTimeEntries(updatedEntries);
    generateWeeklyTimesheets(updatedEntries);
    generateAttendanceSummaries(updatedEntries);
    
    // Reset state
    setIsRejectModalOpen(false);
    setSelectedTimesheet(null);
    setRejectionReason('');
    
    toast.success('Timesheet rejected successfully');
  };
  
  // Handle editing a weekly timesheet
  const handleEditTimesheet = (timesheetId: string) => {
    // Find the timesheet
    const timesheet = weeklyTimesheets.find(ts => ts.id === timesheetId);
    if (!timesheet) return;
    
    // Set the active tab to daily entries
    setActiveTab('daily');
    
    // Get the start and end dates of the timesheet week
    const startDate = new Date(timesheet.weekStartDate);
    const endDate = new Date(timesheet.weekEndDate);
    
    // Set the date filter to the week of the timesheet
    setDateFilter({ startDate, endDate });
    
    // Get the time entry IDs from the timesheet's timeEntries array
    const timeEntryIds = timesheet.timeEntries.map(entry => entry.id);
    
    // Filter time entries to show only those in this timesheet
    const filteredEntries = timeEntries.filter(entry => 
      timeEntryIds.includes(entry.id)
    );
    
    // Set the filtered entries to be displayed
    setFilteredTimeEntries(filteredEntries);
    
    // Filter for this employee
    setSearchTerm(timesheet.employeeName);
    
    toast.success(`Editing timesheet for ${timesheet.employeeName} (${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')})`);
  };
  
  // Handle exporting a weekly timesheet
  const handleExportTimesheet = (timesheetId: string) => {
    // Find the timesheet
    const timesheet = weeklyTimesheets.find(ts => ts.id === timesheetId);
    if (!timesheet) return;

    // Find the employee
    const employee = employees.find(emp => emp.id === timesheet.employeeId);
    if (!employee) return;
    
    // Get the time entry IDs from the timesheet's timeEntries array
    const timeEntryIds = timesheet.timeEntries.map(entry => entry.id);
    
    // Get all time entries for this timesheet
    const timesheetEntries = timeEntries.filter(entry => 
      timeEntryIds.includes(entry.id)
    );
    
    // Format dates for display
    const startDate = new Date(timesheet.weekStartDate);
    const endDate = new Date(timesheet.weekEndDate);
    const formattedDateRange = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    
    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Add header with timesheet information
    csvContent += `Weekly Timesheet - ${timesheet.employeeName}\n`;
    csvContent += `Week: ${formattedDateRange}\n`;
    csvContent += `Status: ${timesheet.status}\n\n`;
    
    // Add column headers
    csvContent += 'Date,Day,Clock In,Clock Out,Regular Hours,Overtime Hours,Night Shift Hours,Status,Notes\n';
    
    // Sort entries by date
    const sortedEntries = [...timesheetEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Add entries
    sortedEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const row = [
        format(entryDate, 'yyyy-MM-dd'),
        format(entryDate, 'EEEE'),
        entry.clockIn,
        entry.clockOut,
        entry.regularHours.toFixed(2),
        entry.overtimeHours.toFixed(2),
        entry.nightShiftHours.toFixed(2),
        entry.status,
        entry.notes || ''
      ];
      
      // Escape any commas in the data
      const escapedRow = row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
      csvContent += escapedRow + '\n';
    });
    
    // Add summary row
    csvContent += `\n"TOTAL","","","","${timesheet.totalRegularHours.toFixed(2)}","${timesheet.totalOvertimeHours.toFixed(2)}","${timesheet.totalNightShiftHours.toFixed(2)}","",""\n`;
    csvContent += `"Total Hours: ${(timesheet.totalRegularHours + timesheet.totalOvertimeHours + timesheet.totalNightShiftHours).toFixed(2)}"\n`;
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Timesheet_${employee.firstName}_${employee.surname}_${format(startDate, 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    toast.success('Timesheet exported successfully');
  };
  
  // Handle deleting a weekly timesheet
  const handleDeleteTimesheet = (timesheetId: string) => {
    console.log('Delete timesheet called with ID:', timesheetId);
    
    // Find the timesheet
    const timesheet = weeklyTimesheets.find(ts => ts.id === timesheetId);
    if (!timesheet) {
      console.error('Timesheet not found:', timesheetId);
      return;
    }
    
    // Format dates for confirmation message
    const startDate = new Date(timesheet.weekStartDate);
    const endDate = new Date(timesheet.weekEndDate);
    const formattedDateRange = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    
    console.log('Showing confirmation dialog for:', timesheet.employeeName, formattedDateRange);
    
    // Use setTimeout to ensure the confirmation dialog appears properly
    setTimeout(() => {
      const confirmed = window.confirm(`Are you sure you want to delete this timesheet for ${timesheet.employeeName} (${formattedDateRange})?\n\nThis will remove all time entries for this week and cannot be undone.`);
      
      console.log('User confirmation result:', confirmed);
      
      if (confirmed) {
        // Get the time entry IDs from the timesheet's timeEntries array
        const timeEntryIds = timesheet.timeEntries.map(entry => entry.id);
        
        console.log('Deleting time entries:', timeEntryIds);
        
        // Filter out all time entries for this timesheet
        const updatedEntries = timeEntries.filter(entry => 
          !timeEntryIds.includes(entry.id)
        );
        
        // Update state
        setTimeEntries(updatedEntries);
        
        // Regenerate weekly timesheets and attendance summaries
        const updatedTimesheets = generateWeeklyTimesheets(updatedEntries);
        setWeeklyTimesheets(updatedTimesheets);
        
        const updatedSummaries = generateAttendanceSummaries(updatedEntries);
        setAttendanceSummaries(updatedSummaries);
        
        // Save to localStorage
        try {
          localStorage.setItem('timeEntries', JSON.stringify(updatedEntries));
          localStorage.setItem('weeklyTimesheets', JSON.stringify(updatedTimesheets));
          localStorage.setItem('attendanceSummaries', JSON.stringify(updatedSummaries));
          
          toast.success(`Timesheet for ${timesheet.employeeName} (${formattedDateRange}) deleted successfully`);
          console.log('Timesheet deleted successfully');
        } catch (error) {
          console.error('Error saving to localStorage:', error);
          toast.error('Failed to save changes. Please try again.');
        }
      }
    }, 100);
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status: TimeEntryStatus) => {
    switch (status) {
      case TimeEntryStatus.Approved:
        return 'bg-green-100 text-green-800';
      case TimeEntryStatus.Rejected:
        return 'bg-red-100 text-red-800';
      case TimeEntryStatus.Pending:
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  // Get entry type badge color
  const getEntryTypeBadgeColor = (type: TimeEntryType) => {
    switch (type) {
      case TimeEntryType.Overtime:
        return 'bg-purple-100 text-purple-800';
      case TimeEntryType.Weekend:
        return 'bg-blue-100 text-blue-800';
      case TimeEntryType.PublicHoliday:
        return 'bg-pink-100 text-pink-800';
      case TimeEntryType.Regular:
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sf-pro">Time & Attendance</h2>
          <p className="text-slate-600 font-sf-pro">Track employee hours, manage timesheets, and monitor attendance patterns</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setIsAddEntryModalOpen(true)}
            className="bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Time Entry
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Search employees..."
                className="pl-8 bg-white/80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px] bg-white/80">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-white/80">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={TimeEntryStatus.Pending}>Pending</SelectItem>
                <SelectItem value={TimeEntryStatus.Approved}>Approved</SelectItem>
                <SelectItem value={TimeEntryStatus.Rejected}>Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="date-filter" className="whitespace-nowrap">Date:</Label>
              {typeof dateFilter === 'string' ? (
                <Input
                  id="date-filter"
                  type="date"
                  className="bg-white/80"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="date-filter-start"
                    type="date"
                    className="bg-white/80"
                    value={format(dateFilter.startDate, 'yyyy-MM-dd')}
                    onChange={(e) => setDateFilter({
                      startDate: new Date(e.target.value),
                      endDate: dateFilter.endDate
                    })}
                  />
                  <span>to</span>
                  <Input
                    id="date-filter-end"
                    type="date"
                    className="bg-white/80"
                    value={format(dateFilter.endDate, 'yyyy-MM-dd')}
                    onChange={(e) => setDateFilter({
                      startDate: dateFilter.startDate,
                      endDate: new Date(e.target.value)
                    })}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDateFilter(format(new Date(), 'yyyy-MM-dd'))}
                  >
                    Reset
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="daily">Daily Entries</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Timesheets</TabsTrigger>
          <TabsTrigger value="summary">Attendance Summary</TabsTrigger>
        </TabsList>
        
        {/* Daily Entries Tab */}
        <TabsContent value="daily" className="space-y-4">
          <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
            <CardHeader className="pb-2">
              <CardTitle>Daily Time Entries</CardTitle>
              <CardDescription>
                {typeof dateFilter === 'string' 
                  ? `Time entries for ${format(parseISO(dateFilter), 'MMMM d, yyyy')}`
                  : `Time entries for ${format(dateFilter.startDate, 'MMM d')} - ${format(dateFilter.endDate, 'MMM d, yyyy')}`
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {filteredTimeEntries.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Clock In</TableHead>
                        <TableHead>Clock Out</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTimeEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div className="font-medium">{entry.employeeName}</div>
                            <div className="text-sm text-slate-500">{entry.employeePosition}</div>
                          </TableCell>
                          <TableCell>
                            {entry.isLeave ? (
                              <div className="flex items-center text-yellow-600">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span className="text-sm font-medium">On Leave</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-slate-500" />
                                {entry.clockIn}
                                {entry.isNightShift && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Moon className="h-4 w-4 ml-1 text-indigo-500" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Night Shift</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {entry.isLeave ? (
                              <div className="flex items-center text-yellow-600">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span className="text-sm font-medium">On Leave</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-slate-500" />
                                {entry.clockOut}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {entry.isLeave ? (
                              <div className="flex items-center">
                                <Badge className="bg-yellow-100 text-yellow-800 rounded-full px-2 py-1">
                                  0h (Leave)
                                </Badge>
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                <span>{entry.totalHours.toFixed(2)} total</span>
                                {entry.overtimeHours > 0 && (
                                  <span className="text-sm text-purple-600">
                                    {entry.overtimeHours.toFixed(2)} overtime
                                  </span>
                                )}
                                {entry.nightShiftHours > 0 && (
                                  <span className="text-sm text-indigo-600">
                                    {entry.nightShiftHours.toFixed(2)} night hrs
                                  </span>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getEntryTypeBadgeColor(entry.type)}>
                              {entry.isLeave ? entry.leaveType : entry.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(entry.status)}>
                              {entry.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setSelectedEntry(entry);
                                        setIsViewDetailsModalOpen(true);
                                      }}
                                    >
                                      <Info className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View Details</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setSelectedEntry(entry);
                                        setIsEditEntryModalOpen(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit Entry</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteTimeEntry(entry.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete Entry</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              {entry.status === TimeEntryStatus.Pending && (
                                <>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleApproveTimeEntry(entry.id)}
                                        >
                                          <Check className="h-4 w-4 text-green-500" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Approve Entry</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            // Open rejection dialog
                                            setSelectedEntry(entry);
                                            // Implement rejection dialog
                                          }}
                                        >
                                          <X className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Reject Entry</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarClock className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No time entries found</h3>
                  <p className="text-slate-500 mb-4">No time entries for the selected date and filters.</p>
                  <Button
                    onClick={() => setIsAddEntryModalOpen(true)}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Time Entry
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Weekly Timesheets Tab */}
        <TabsContent value="weekly" className="space-y-4">
          <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
            <CardHeader className="pb-2">
              <CardTitle>Weekly Timesheets</CardTitle>
              <CardDescription>
                Employee weekly time summaries
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {filteredTimesheets.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Week Period</TableHead>
                        <TableHead>Regular Hours</TableHead>
                        <TableHead>Overtime Hours</TableHead>
                        <TableHead>Night Shift Hours</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTimesheets.map((timesheet) => (
                        <TableRow key={timesheet.id}>
                          <TableCell>
                            <div className="font-medium">{timesheet.employeeName}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-slate-500" />
                              {format(parseISO(timesheet.weekStartDate), 'MMM d')} - {format(parseISO(timesheet.weekEndDate), 'MMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>{timesheet.totalRegularHours.toFixed(2)}</TableCell>
                          <TableCell>{timesheet.totalOvertimeHours.toFixed(2)}</TableCell>
                          <TableCell>{timesheet.totalNightShiftHours.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(timesheet.status)}>
                              {timesheet.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {/* Edit Button */}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditTimesheet(timesheet.id)}
                                    >
                                      <Edit className="h-4 w-4 text-blue-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit Timesheet</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              {/* Export Button */}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleExportTimesheet(timesheet.id)}
                                    >
                                      <Download className="h-4 w-4 text-slate-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Export Timesheet</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              {/* Delete Button */}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeleteTimesheet(timesheet.id);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete Timesheet</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              {/* Approve/Reject Buttons (only for pending timesheets) */}
                              {timesheet.status === TimeEntryStatus.Pending && (
                                <>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleApproveTimesheet(timesheet.id)}
                                        >
                                          <Check className="h-4 w-4 text-green-500" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Approve Timesheet</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            setSelectedTimesheet(timesheet);
                                            setSelectedEntry(null); // Clear any selected entry
                                            setIsRejectModalOpen(true);
                                          }}
                                        >
                                          <X className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Reject Timesheet</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No timesheets found</h3>
                  <p className="text-slate-500 mb-4">No weekly timesheets match your current filters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Attendance Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Attendance Summary</CardTitle>
                <CardDescription>
                  Monthly attendance statistics for employees
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  const savedSummaries = localStorage.getItem('attendanceSummaries');
                  if (savedSummaries) {
                    const parsedSummaries = JSON.parse(savedSummaries);
                    setAttendanceSummaries(parsedSummaries);
                    toast.success('Attendance summaries refreshed successfully');
                  } else {
                    createDefaultAttendanceSummaries();
                    toast.info('Created new attendance summaries');
                  }
                }}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </CardHeader>
            
            <CardContent>
              {filteredSummaries.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Regular Hours</TableHead>
                        <TableHead>Overtime Hours</TableHead>
                        <TableHead>Night Shift Hours</TableHead>
                        <TableHead>Leave Hours</TableHead>
                        <TableHead>Overtime Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSummaries.map((summary) => (
                        <TableRow key={summary.employeeId}>
                          <TableCell>
                            <div className="font-medium">{summary.employeeName}</div>
                            <div className="text-sm text-slate-500">{summary.position}</div>
                          </TableCell>
                          <TableCell>{summary.department}</TableCell>
                          <TableCell>{summary.currentMonthRegularHours.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {summary.currentMonthOvertimeHours.toFixed(2)}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="ml-1">
                                      <Hourglass className="h-4 w-4 text-purple-500" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Weekly: {summary.currentWeekOvertimeHours.toFixed(2)} / 10 hours</p>
                                    <p>Daily: {summary.currentDayOvertimeHours.toFixed(2)} / 3 hours</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {summary.currentMonthNightShiftHours.toFixed(2)}
                              <Moon className="h-4 w-4 ml-1 text-indigo-500" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {summary.leaveHoursTaken > 0 ? (
                                <>
                                  <Badge className="bg-yellow-100 text-yellow-800 rounded-full px-2 py-1 mr-1">
                                    {summary.leaveHoursTaken.toFixed(2)}h
                                  </Badge>
                                  <Calendar className="h-4 w-4 text-yellow-600" />
                                </>
                              ) : (
                                <span className="text-slate-500">0.00</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {summary.isExemptFromOvertimeRules ? (
                              <Badge className="bg-blue-100 text-blue-800">Exempt</Badge>
                            ) : (
                              <Badge className="bg-purple-100 text-purple-800">Standard</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No attendance data found</h3>
                  <p className="text-slate-500 mb-4">No attendance summaries match your current filters.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* South African Labor Law Information */}
          <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2 text-mokm-blue-500" />
                South African Labor Law Information
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Overtime Regulations</h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>Normal overtime rate: 1.5x normal hourly wage</li>
                    <li>Sunday and public holiday overtime rate: 2x normal hourly wage</li>
                    <li>Maximum overtime: 10 hours per week, 3 hours per day</li>
                    <li>Employees earning above R241,110.59 annually are exempt from overtime provisions</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Night Shift Allowance</h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>Night shift defined as work between 18:00 and 06:00</li>
                    <li>Standard allowance: 10% of hourly wage for night shift hours</li>
                    <li>Transportation must be available for employees between residence and workplace</li>
                    <li>Regular night workers entitled to health and safety information</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Leave Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Paid Leave</h4>
                      <ul className="list-disc pl-5 space-y-1 text-slate-700">
                        <li>Annual Leave</li>
                        <li>Sick Leave</li>
                        <li>Family Responsibility Leave</li>
                        <li>Public Holidays</li>
                        <li>Maternity Leave</li>
                        <li>Adoption Leave</li>
                        <li>Commissioning Parental Leave</li>
                        <li>Parental Leave</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Unpaid Leave</h4>
                      <p className="text-slate-700">Unpaid leave can be taken by agreement between employer and employee, but is not mandated by law.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Time Entry Modal */}
      <Dialog open={isAddEntryModalOpen} onOpenChange={setIsAddEntryModalOpen}>
        <DialogContent className="sm:max-w-[620px] max-w-[95vw] rounded-2xl shadow-md bg-white transition-opacity ease-in-out duration-300">
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle className="text-sm md:text-base font-medium text-gray-800 flex items-center gap-2">
              <Clock className="h-5 w-5 text-mokm-blue-500" />
              Add Time Entry
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Record a new time entry for an employee.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee" className="text-sm font-medium text-gray-800">
                    Employee
                  </Label>
                  <Select 
                    value={newEntry.employeeId} 
                    onValueChange={(value) => setNewEntry({...newEntry, employeeId: value})}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.surname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium text-gray-800">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    className="rounded-lg"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                  />
                </div>
                
                {!newEntry.isLeave && (
                  <div className="space-y-2">
                    <Label htmlFor="clock-in" className="text-sm font-medium text-gray-800">
                      Clock In
                    </Label>
                    <Input
                      id="clock-in"
                      type="time"
                      className="rounded-lg"
                      value={newEntry.clockIn}
                      onChange={(e) => setNewEntry({...newEntry, clockIn: e.target.value})}
                    />
                  </div>
                )}
              </div>
              
              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-800">
                    Entry Type
                  </Label>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border">
                    <Checkbox
                      id="is-leave"
                      checked={newEntry.isLeave}
                      onCheckedChange={(checked) => 
                        setNewEntry({...newEntry, isLeave: checked as boolean})
                      }
                    />
                    <Label htmlFor="is-leave" className="text-sm text-gray-700">Leave Day</Label>
                  </div>
                </div>
                
                {newEntry.isLeave ? (
                  <div className="space-y-2">
                    <Label htmlFor="leave-type" className="text-sm font-medium text-gray-800">
                      Leave Type
                    </Label>
                    <Select 
                      value={newEntry.leaveType} 
                      onValueChange={(value) => setNewEntry({...newEntry, leaveType: value})}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(LeaveTypes).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="clock-out" className="text-sm font-medium text-gray-800">
                      Clock Out
                    </Label>
                    <Input
                      id="clock-out"
                      type="time"
                      className="rounded-lg"
                      value={newEntry.clockOut}
                      onChange={(e) => setNewEntry({...newEntry, clockOut: e.target.value})}
                    />
                  </div>
                )}
                
                {!newEntry.isLeave && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-800">
                      Night Shift
                    </Label>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border">
                      <Switch
                        id="night-shift"
                        checked={newEntry.isNightShift}
                        onCheckedChange={(checked) => 
                          setNewEntry({...newEntry, isNightShift: checked})
                        }
                      />
                      <Label htmlFor="night-shift" className="text-sm text-gray-700">Night Shift (18:00-06:00)</Label>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Night Allowance Percentage (Full Width) */}
            {!newEntry.isLeave && calculationResult?.isNightShift && (
              <div className="space-y-2">
                <Label htmlFor="night-allowance" className="text-sm font-medium text-gray-800">
                  Night Allowance Percentage
                </Label>
                <Input
                  id="night-allowance"
                  type="number"
                  min="0"
                  max="100"
                  className="rounded-lg w-full md:w-48"
                  value={newEntry.nightShiftAllowancePercentage}
                  onChange={(e) => setNewEntry({
                    ...newEntry, 
                    nightShiftAllowancePercentage: parseInt(e.target.value) || 10
                  })}
                />
              </div>
            )}
            
            {/* Notes Section (Full Width) */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-800">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes here..."
                className="rounded-lg h-24 resize-none"
                value={newEntry.notes || ''}
                onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
              />
            </div>
            
            {/* Separator */}
            {!newEntry.isLeave && calculationResult && (
              <hr className="border-gray-200 my-4" />
            )}
            
            {/* Automated Calculation Breakdown */}
            {!newEntry.isLeave && calculationResult && (
              <div className="mt-4">
                <Card className="bg-slate-50/80 rounded-2xl border border-slate-200/60 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm md:text-base font-medium text-gray-800 flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-mokm-blue-500" />
                      Automated Calculation Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Date Information */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700">Date Type:</span>
                      <div className="flex items-center gap-2">
                        {isPublicHoliday(newEntry.date || '') && (
                          <Badge variant="destructive" className="text-xs rounded-full">
                            {getPublicHolidayName(newEntry.date || '')}
                          </Badge>
                        )}
                        {calculationResult.entryType === 'weekend' && (
                          <Badge variant="secondary" className="text-xs rounded-full">
                            Weekend
                          </Badge>
                        )}
                        {calculationResult.entryType === 'regular' && (
                          <Badge variant="default" className="text-xs rounded-full">
                            Weekday
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Hours Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800 mb-2">Hours Breakdown</h4>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Hours:</span>
                          <span className="font-medium">{formatHours(calculationResult.totalHours)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Regular Hours:</span>
                          <span className="font-medium">{formatHours(calculationResult.regularHours)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Overtime Hours:</span>
                          <span className="font-medium text-orange-600">{formatHours(calculationResult.overtimeHours)}</span>
                        </div>
                        {calculationResult.nightShiftHours > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Night Shift Hours:</span>
                            <span className="font-medium text-blue-600">{formatHours(calculationResult.nightShiftHours)}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Pay Breakdown */}
                      {selectedEmployeeHourlyRate > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-800 mb-2">Pay Breakdown</h4>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Regular Pay:</span>
                            <span className="font-medium">{formatCurrency(calculationResult.breakdown.regularPay)}</span>
                          </div>
                          {calculationResult.breakdown.overtimePay > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Overtime Pay:</span>
                              <span className="font-medium text-orange-600">{formatCurrency(calculationResult.breakdown.overtimePay)}</span>
                            </div>
                          )}
                          {calculationResult.breakdown.nightShiftAllowance > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Night Allowance:</span>
                              <span className="font-medium text-blue-600">{formatCurrency(calculationResult.breakdown.nightShiftAllowance)}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="font-semibold text-gray-800">Total Pay:</span>
                            <span className="font-semibold text-green-600">{formatCurrency(calculationResult.breakdown.totalPay)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Overtime Rate Information */}
                    <div className="flex justify-between items-center text-sm pt-2 border-t">
                      <span className="font-medium text-gray-700">Overtime Rate:</span>
                      <Badge variant={calculationResult.overtimeRate === 'Normal' ? 'default' : 'destructive'} className="text-xs rounded-full">
                        {calculationResult.overtimeRate === 'Normal' ? '1.5x' : '2.0x'} 
                        ({calculationResult.overtimeRate})
                      </Badge>
                    </div>
                    
                    {/* Warnings */}
                    {calculationResult.warnings.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex items-center gap-2 text-amber-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium text-sm">Compliance Notices:</span>
                        </div>
                        <div className="space-y-2">
                          {calculationResult.warnings.map((warning, index) => (
                            <div key={index} className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400">
                              {warning}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-end space-x-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsAddEntryModalOpen(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button onClick={handleAddTimeEntry} className="rounded-lg bg-mokm-blue-500 hover:bg-mokm-blue-600">
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Time Entry Modal */}
      {selectedEntry && (
        <Dialog open={isEditEntryModalOpen} onOpenChange={setIsEditEntryModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Time Entry</DialogTitle>
              <DialogDescription>
                Update time entry for {selectedEntry.employeeName}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-date" className="text-right">
                  Date
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-date"
                    type="date"
                    value={selectedEntry.date}
                    onChange={(e) => setSelectedEntry({...selectedEntry, date: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Entry Type
                </Label>
                <div className="col-span-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-is-leave"
                      checked={selectedEntry.isLeave}
                      onCheckedChange={(checked) => 
                        setSelectedEntry({...selectedEntry, isLeave: checked as boolean})
                      }
                    />
                    <Label htmlFor="edit-is-leave">Leave Day</Label>
                  </div>
                </div>
              </div>
              
              {selectedEntry.isLeave ? (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-leave-type" className="text-right">
                    Leave Type
                  </Label>
                  <div className="col-span-3">
                    <Select 
                      value={selectedEntry.leaveType} 
                      onValueChange={(value) => setSelectedEntry({...selectedEntry, leaveType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(LeaveTypes).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-clock-in" className="text-right">
                      Clock In
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="edit-clock-in"
                        type="time"
                        value={selectedEntry.clockIn}
                        onChange={(e) => setSelectedEntry({...selectedEntry, clockIn: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-clock-out" className="text-right">
                      Clock Out
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="edit-clock-out"
                        type="time"
                        value={selectedEntry.clockOut}
                        onChange={(e) => setSelectedEntry({...selectedEntry, clockOut: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                      Night Shift
                    </Label>
                    <div className="col-span-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="edit-night-shift"
                          checked={selectedEntry.isNightShift}
                          onCheckedChange={(checked) => 
                            setSelectedEntry({...selectedEntry, isNightShift: checked})
                          }
                        />
                        <Label htmlFor="edit-night-shift">Night Shift (18:00-06:00)</Label>
                      </div>
                    </div>
                  </div>
                  
                  {selectedEntry.isNightShift && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-night-allowance" className="text-right">
                        Night Allowance %
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id="edit-night-allowance"
                          type="number"
                          min="0"
                          max="100"
                          value={selectedEntry.nightShiftAllowancePercentage}
                          onChange={(e) => setSelectedEntry({
                            ...selectedEntry, 
                            nightShiftAllowancePercentage: parseInt(e.target.value) || 10
                          })}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-overtime-rate" className="text-right">
                      Overtime Rate
                    </Label>
                    <div className="col-span-3">
                      <Select 
                        value={selectedEntry.overtimeRate} 
                        onValueChange={(value) => 
                          setSelectedEntry({...selectedEntry, overtimeRate: value as OvertimeRateType})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select overtime rate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={OvertimeRateType.Normal}>Normal (1.5x)</SelectItem>
                          <SelectItem value={OvertimeRateType.Sunday}>Sunday (2x)</SelectItem>
                          <SelectItem value={OvertimeRateType.PublicHoliday}>Public Holiday (2x)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-notes" className="text-right">
                  Notes
                </Label>
                <div className="col-span-3">
                  <Textarea
                    id="edit-notes"
                    placeholder="Add any additional notes here..."
                    value={selectedEntry.notes || ''}
                    onChange={(e) => setSelectedEntry({...selectedEntry, notes: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditEntryModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTimeEntry}>
                Update Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* View Details Modal */}
      {selectedEntry && (
        <Dialog open={isViewDetailsModalOpen} onOpenChange={setIsViewDetailsModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Time Entry Details</DialogTitle>
              <DialogDescription>
                Details for {selectedEntry.employeeName} on {format(parseISO(selectedEntry.date), 'MMMM d, yyyy')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Employee</h4>
                  <p className="text-base">{selectedEntry.employeeName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Employee Number</h4>
                  <p className="text-base">{selectedEntry.employeeNumber}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Position</h4>
                  <p className="text-base">{selectedEntry.employeePosition}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Date</h4>
                  <p className="text-base">{format(parseISO(selectedEntry.date), 'MMMM d, yyyy')}</p>
                </div>
              </div>
              
              {selectedEntry.isLeave ? (
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Leave Type</h4>
                  <Badge className="mt-1">{selectedEntry.leaveType}</Badge>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-500">Clock In</h4>
                      <p className="text-base">{selectedEntry.clockIn}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-500">Clock Out</h4>
                      <p className="text-base">{selectedEntry.clockOut}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-500">Total Hours</h4>
                      <p className="text-base">{selectedEntry.totalHours.toFixed(2)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-500">Regular Hours</h4>
                      <p className="text-base">{selectedEntry.regularHours.toFixed(2)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-500">Overtime Hours</h4>
                      <p className="text-base">{selectedEntry.overtimeHours.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-500">Entry Type</h4>
                      <Badge className={getEntryTypeBadgeColor(selectedEntry.type) + " mt-1"}>
                        {selectedEntry.type}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-500">Overtime Rate</h4>
                      <Badge className="bg-purple-100 text-purple-800 mt-1">
                        {selectedEntry.overtimeRate === OvertimeRateType.Normal ? '1.5x' : 
                         selectedEntry.overtimeRate === OvertimeRateType.Sunday ? '2x (Sunday)' : 
                         '2x (Public Holiday)'}
                      </Badge>
                    </div>
                  </div>
                  
                  {selectedEntry.isNightShift && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-slate-500">Night Shift Hours</h4>
                        <p className="text-base">{selectedEntry.nightShiftHours.toFixed(2)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-500">Night Shift Allowance</h4>
                        <p className="text-base">{selectedEntry.nightShiftAllowancePercentage}%</p>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-slate-500">Status</h4>
                <Badge className={getStatusBadgeColor(selectedEntry.status) + " mt-1"}>
                  {selectedEntry.status}
                </Badge>
              </div>
              
              {selectedEntry.status === TimeEntryStatus.Approved && selectedEntry.approvedBy && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Approved By</h4>
                    <p className="text-base">{selectedEntry.approvedBy}</p>
                  </div>
                  {selectedEntry.approvedDate && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-500">Approved Date</h4>
                      <p className="text-base">{format(parseISO(selectedEntry.approvedDate), 'MMMM d, yyyy')}</p>
                    </div>
                  )}
                </div>
              )}
              
              {selectedEntry.status === TimeEntryStatus.Rejected && selectedEntry.rejectedReason && (
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Rejection Reason</h4>
                  <p className="text-base">{selectedEntry.rejectedReason}</p>
                </div>
              )}
              
              {selectedEntry.notes && (
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Notes</h4>
                  <p className="text-base">{selectedEntry.notes}</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDetailsModalOpen(false)}>
                Close
              </Button>
              {selectedEntry.status === TimeEntryStatus.Pending && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="border-green-500 text-green-500 hover:bg-green-50"
                    onClick={() => {
                      handleApproveTimeEntry(selectedEntry.id);
                      setIsViewDetailsModalOpen(false);
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => {
                      setSelectedEntry(selectedEntry);
                      setIsViewDetailsModalOpen(false);
                      setIsRejectModalOpen(true);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Rejection Dialog */}
      {isRejectModalOpen && (
        <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject {selectedTimesheet ? 'Timesheet' : 'Time Entry'}</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejection.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection"
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsRejectModalOpen(false);
                setRejectionReason('');
              }}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (selectedTimesheet) {
                    handleRejectTimesheet(selectedTimesheet.id, rejectionReason);
                  } else if (selectedEntry) {
                    handleRejectTimeEntry(selectedEntry.id, rejectionReason);
                  }
                  setIsRejectModalOpen(false);
                  setRejectionReason('');
                }}
                disabled={!rejectionReason.trim()}
              >
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TimeAttendance;