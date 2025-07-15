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
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // State for modals
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [isEditEntryModalOpen, setIsEditEntryModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  
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
  
  // Get unique departments from employees
  const departments = [...new Set(employees.map(emp => emp.department))];
  
  // Initialize with sample data
  useEffect(() => {
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
      
      // Generate 2-3 entries per day
      const entriesPerDay = Math.floor(Math.random() * 2) + 2;
      
      for (let j = 0; j < entriesPerDay; j++) {
        const employee = employees[Math.floor(Math.random() * employees.length)];
        
        // Randomize clock in/out times
        const clockInHour = 7 + Math.floor(Math.random() * 2);
        const clockInMinute = Math.floor(Math.random() * 60);
        const workHours = 8 + Math.floor(Math.random() * 3); // 8-10 hours
        const clockOutHour = clockInHour + workHours;
        const clockOutMinute = Math.floor(Math.random() * 60);
        
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
      timesheet.timeEntries.push(entry);
      timesheet.totalRegularHours += entry.regularHours;
      timesheet.totalOvertimeHours += entry.overtimeHours;
      timesheet.totalNightShiftHours += entry.nightShiftHours;
      
      // Update timesheet status based on entries
      if (entry.status === TimeEntryStatus.Rejected) {
        timesheet.status = TimeEntryStatus.Rejected;
      } else if (timesheet.status !== TimeEntryStatus.Rejected && 
                entry.status === TimeEntryStatus.Pending) {
        timesheet.status = TimeEntryStatus.Pending;
      } else if (timesheet.status !== TimeEntryStatus.Rejected && 
                timesheet.status !== TimeEntryStatus.Pending) {
        timesheet.status = TimeEntryStatus.Approved;
      }
    });
    
    setWeeklyTimesheets(Array.from(timesheetMap.values()));
  };
  
  // Generate attendance summaries from time entries
  const generateAttendanceSummaries = (entries: TimeEntry[]) => {
    const summaryMap = new Map<string, AttendanceSummary>();
    
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
    
    // Current month entries
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    entries.forEach(entry => {
      const entryDate = parseISO(entry.date);
      if (entryDate.getMonth() !== currentMonth || entryDate.getFullYear() !== currentYear) {
        return; // Skip entries not in current month
      }
      
      const summary = summaryMap.get(entry.employeeId);
      if (!summary) return;
      
      if (entry.isLeave) {
        summary.leaveHoursTaken += entry.totalHours;
      } else {
        summary.currentMonthRegularHours += entry.regularHours;
        summary.currentMonthOvertimeHours += entry.overtimeHours;
        summary.currentMonthNightShiftHours += entry.nightShiftHours;
        
        // Update current week overtime if entry is from current week
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
        
        if (entryDate >= weekStart && entryDate <= weekEnd) {
          summary.currentWeekOvertimeHours += entry.overtimeHours;
        }
        
        // Update current day overtime if entry is from today
        if (isSameDay(entryDate, today)) {
          summary.currentDayOvertimeHours += entry.overtimeHours;
        }
      }
    });
    
    setAttendanceSummaries(Array.from(summaryMap.values()));
  };
  
  // Filter time entries based on search and filters
  const filteredTimeEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || 
                             employees.find(e => e.id === entry.employeeId)?.department === departmentFilter;
    
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    
    const matchesDate = entry.date === dateFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus && matchesDate;
  });
  
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
    
    // Calculate hours
    const clockInHour = parseInt(newEntry.clockIn?.split(':')[0] || '0', 10);
    const clockInMinute = parseInt(newEntry.clockIn?.split(':')[1] || '0', 10);
    const clockOutHour = parseInt(newEntry.clockOut?.split(':')[0] || '0', 10);
    const clockOutMinute = parseInt(newEntry.clockOut?.split(':')[1] || '0', 10);
    
    let totalHours = clockOutHour - clockInHour + (clockOutMinute - clockInMinute) / 60;
    if (totalHours < 0) totalHours += 24; // Handle overnight shifts
    
    const regularHours = Math.min(totalHours, 8); // Regular hours capped at 8
    const overtimeHours = Math.max(0, totalHours - 8); // Overtime after 8 hours
    
    // Check overtime limits
    const isExempt = isExemptFromOvertimeRules(employee.salary * 12);
    const summary = attendanceSummaries.find(s => s.employeeId === newEntry.employeeId);
    
    if (!isExempt && summary) {
      // Check daily overtime limit (3 hours)
      if (summary.currentDayOvertimeHours + overtimeHours > 3) {
        toast.error('Daily overtime limit of 3 hours would be exceeded');
        return;
      }
      
      // Check weekly overtime limit (10 hours)
      if (summary.currentWeekOvertimeHours + overtimeHours > 10) {
        toast.error('Weekly overtime limit of 10 hours would be exceeded');
        return;
      }
    }
    
    // Calculate night shift hours if applicable
    const isNightShift = newEntry.isNightShift || false;
    const nightShiftHours = isNightShift ? 
      calculateNightShiftHours(newEntry.clockIn || '00:00', newEntry.clockOut || '00:00') : 0;
    
    const newTimeEntry: TimeEntry = {
      id: uuidv4(),
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.surname}`,
      employeeNumber: employee.employeeNumber,
      employeePosition: employee.position,
      date: newEntry.date || format(new Date(), 'yyyy-MM-dd'),
      clockIn: newEntry.clockIn || '08:00',
      clockOut: newEntry.clockOut || '17:00',
      totalHours,
      regularHours,
      overtimeHours,
      overtimeRate: newEntry.overtimeRate || OvertimeRateType.Normal,
      isNightShift,
      nightShiftHours,
      nightShiftAllowancePercentage: newEntry.nightShiftAllowancePercentage || 10,
      status: TimeEntryStatus.Pending,
      notes: newEntry.notes,
      type: newEntry.type || TimeEntryType.Regular,
      isLeave: newEntry.isLeave || false,
      leaveType: newEntry.isLeave ? newEntry.leaveType : undefined
    };
    
    const updatedEntries = [...timeEntries, newTimeEntry];
    setTimeEntries(updatedEntries);
    generateWeeklyTimesheets(updatedEntries);
    generateAttendanceSummaries(updatedEntries);
    
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
    
    toast.success('Time entry added successfully');
  };
  
  // Handle updating a time entry
  const handleUpdateTimeEntry = () => {
    if (!selectedEntry) return;
    
    const updatedEntries = timeEntries.map(entry => 
      entry.id === selectedEntry.id ? selectedEntry : entry
    );
    
    setTimeEntries(updatedEntries);
    generateWeeklyTimesheets(updatedEntries);
    generateAttendanceSummaries(updatedEntries);
    
    setIsEditEntryModalOpen(false);
    setSelectedEntry(null);
    
    toast.success('Time entry updated successfully');
  };
  
  // Handle deleting a time entry
  const handleDeleteTimeEntry = (id: string) => {
    const updatedEntries = timeEntries.filter(entry => entry.id !== id);
    setTimeEntries(updatedEntries);
    generateWeeklyTimesheets(updatedEntries);
    generateAttendanceSummaries(updatedEntries);
    
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
    
    toast.success('Time entry rejected successfully');
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
              <Input
                id="date-filter"
                type="date"
                className="bg-white/80"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
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
                Time entries for {format(parseISO(dateFilter), 'MMMM d, yyyy')}
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
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-slate-500" />
                              {entry.clockOut}
                            </div>
                          </TableCell>
                          <TableCell>
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
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        // View timesheet details
                                      }}
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View Timesheet</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Download Timesheet</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              {timesheet.status === TimeEntryStatus.Pending && (
                                <>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
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
            <CardHeader className="pb-2">
              <CardTitle>Attendance Summary</CardTitle>
              <CardDescription>
                Monthly attendance statistics for employees
              </CardDescription>
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
                          <TableCell>{summary.leaveHoursTaken.toFixed(2)}</TableCell>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Time Entry</DialogTitle>
            <DialogDescription>
              Record a new time entry for an employee.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employee" className="text-right">
                Employee
              </Label>
              <div className="col-span-3">
                <Select 
                  value={newEntry.employeeId} 
                  onValueChange={(value) => setNewEntry({...newEntry, employeeId: value})}
                >
                  <SelectTrigger>
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
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <Input
                  id="date"
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
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
                    id="is-leave"
                    checked={newEntry.isLeave}
                    onCheckedChange={(checked) => 
                      setNewEntry({...newEntry, isLeave: checked as boolean})
                    }
                  />
                  <Label htmlFor="is-leave">Leave Day</Label>
                </div>
              </div>
            </div>
            
            {newEntry.isLeave ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="leave-type" className="text-right">
                  Leave Type
                </Label>
                <div className="col-span-3">
                  <Select 
                    value={newEntry.leaveType} 
                    onValueChange={(value) => setNewEntry({...newEntry, leaveType: value})}
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
                  <Label htmlFor="clock-in" className="text-right">
                    Clock In
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="clock-in"
                      type="time"
                      value={newEntry.clockIn}
                      onChange={(e) => setNewEntry({...newEntry, clockIn: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="clock-out" className="text-right">
                    Clock Out
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="clock-out"
                      type="time"
                      value={newEntry.clockOut}
                      onChange={(e) => setNewEntry({...newEntry, clockOut: e.target.value})}
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
                        id="night-shift"
                        checked={newEntry.isNightShift}
                        onCheckedChange={(checked) => 
                          setNewEntry({...newEntry, isNightShift: checked})
                        }
                      />
                      <Label htmlFor="night-shift">Night Shift (18:00-06:00)</Label>
                    </div>
                  </div>
                </div>
                
                {newEntry.isNightShift && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="night-allowance" className="text-right">
                      Night Allowance %
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="night-allowance"
                        type="number"
                        min="0"
                        max="100"
                        value={newEntry.nightShiftAllowancePercentage}
                        onChange={(e) => setNewEntry({
                          ...newEntry, 
                          nightShiftAllowancePercentage: parseInt(e.target.value) || 10
                        })}
                      />
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="overtime-rate" className="text-right">
                    Overtime Rate
                  </Label>
                  <div className="col-span-3">
                    <Select 
                      value={newEntry.overtimeRate} 
                      onValueChange={(value) => 
                        setNewEntry({...newEntry, overtimeRate: value as OvertimeRateType})
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
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes here..."
                  value={newEntry.notes || ''}
                  onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEntryModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTimeEntry}>
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
                      // Open rejection dialog
                      setIsViewDetailsModalOpen(false);
                      // Implement rejection dialog
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
    </div>
  );
};

export default TimeAttendance;