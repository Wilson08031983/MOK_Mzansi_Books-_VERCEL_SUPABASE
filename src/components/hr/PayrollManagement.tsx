
import React, { useState } from 'react';
import { 
  Search, 
  DollarSign, 
  Calendar, 
  FileText,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Filter,
  User,
  Mail,
  Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  dateProcessed?: string;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  status: 'draft' | 'processed' | 'paid';
  paymentMethod?: string;
  paymentReference?: string;
  emailSent: boolean;
}

const PayrollManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>('current');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayroll, setSelectedPayroll] = useState<string | null>(null);
  const [showPayrollAction, setShowPayrollAction] = useState(false);
  
  // Current payroll period - for demonstration
  const currentPeriod = 'June 2025';
  
  // Sample payroll records
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([
    {
      id: 'PAY2025-06-001',
      employeeId: 'EMP001',
      employeeName: 'Sarah Parker',
      period: 'June 2025',
      grossAmount: 25000,
      deductions: 7500,
      netAmount: 17500,
      status: 'draft',
      emailSent: false
    },
    {
      id: 'PAY2025-06-002',
      employeeId: 'EMP002',
      employeeName: 'Michael Johnson',
      period: 'June 2025',
      grossAmount: 30000,
      deductions: 9000,
      netAmount: 21000,
      status: 'draft',
      emailSent: false
    },
    {
      id: 'PAY2025-06-003',
      employeeId: 'EMP003',
      employeeName: 'Lisa Williams',
      period: 'June 2025',
      grossAmount: 28000,
      deductions: 8400,
      netAmount: 19600,
      status: 'draft',
      emailSent: false
    },
    {
      id: 'PAY2025-05-001',
      employeeId: 'EMP001',
      employeeName: 'Sarah Parker',
      period: 'May 2025',
      dateProcessed: '2025-05-25',
      grossAmount: 25000,
      deductions: 7500,
      netAmount: 17500,
      status: 'paid',
      paymentMethod: 'Bank Transfer',
      paymentReference: 'REF123456',
      emailSent: true
    },
    {
      id: 'PAY2025-05-002',
      employeeId: 'EMP002',
      employeeName: 'Michael Johnson',
      period: 'May 2025',
      dateProcessed: '2025-05-25',
      grossAmount: 30000,
      deductions: 9000,
      netAmount: 21000,
      status: 'paid',
      paymentMethod: 'Bank Transfer',
      paymentReference: 'REF123457',
      emailSent: true
    }
  ]);

  // Filter payroll records
  const filteredRecords = payrollRecords.filter(record => {
    const matchesSearch = 
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesPeriod = periodFilter === 'all' || 
      (periodFilter === 'current' && record.period === currentPeriod) ||
      (periodFilter === 'previous' && record.period !== currentPeriod);
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  // Calculate totals
  const totalGross = filteredRecords.reduce((sum, record) => sum + record.grossAmount, 0);
  const totalNet = filteredRecords.reduce((sum, record) => sum + record.netAmount, 0);
  const totalDeductions = filteredRecords.reduce((sum, record) => sum + record.deductions, 0);

  // Function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'processed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Toggle payroll details
  const togglePayrollDetails = (id: string) => {
    if (selectedPayroll === id) {
      setSelectedPayroll(null);
    } else {
      setSelectedPayroll(id);
    }
  };

  // Process all draft payrolls
  const handleProcessPayroll = () => {
    setPayrollRecords(records => 
      records.map(record => 
        record.status === 'draft' && record.period === currentPeriod
          ? { 
              ...record, 
              status: 'processed', 
              dateProcessed: new Date().toISOString().split('T')[0]
            } 
          : record
      )
    );
    setShowPayrollAction(false);
  };
  
  // Mark processed payrolls as paid
  const handleMarkAsPaid = () => {
    setPayrollRecords(records => 
      records.map(record => 
        record.status === 'processed'
          ? { 
              ...record, 
              status: 'paid',
              paymentMethod: 'Bank Transfer',
              paymentReference: `REF${Math.floor(Math.random() * 1000000)}`
            } 
          : record
      )
    );
    setShowPayrollAction(false);
  };
  
  // Send payslips via email
  const handleSendPayslips = () => {
    setPayrollRecords(records => 
      records.map(record => 
        record.status === 'processed' || record.status === 'paid'
          ? { 
              ...record, 
              emailSent: true
            } 
          : record
      )
    );
    setShowPayrollAction(false);
    alert('Payslips sent successfully to all employees!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sf-pro">Payroll Management</h2>
          <p className="text-slate-600 font-sf-pro">Manage employee payroll and payslips</p>
        </div>
        
        <div className="relative">
          <Button
            onClick={() => setShowPayrollAction(!showPayrollAction)}
            className="bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 hover:from-mokm-purple-600 hover:to-mokm-blue-600 font-sf-pro"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Payroll Actions
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
          
          {showPayrollAction && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-business z-10 border border-white/20 overflow-hidden">
              <div className="py-1">
                <button 
                  onClick={handleProcessPayroll}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center font-sf-pro"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  Process Payroll
                </button>
                <button 
                  onClick={handleMarkAsPaid}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center font-sf-pro"
                >
                  <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                  Mark as Paid
                </button>
                <button 
                  onClick={handleSendPayslips}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center font-sf-pro"
                >
                  <Mail className="h-4 w-4 mr-2 text-purple-500" />
                  Send Payslips
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center font-sf-pro">
                  <FileText className="h-4 w-4 mr-2 text-slate-500" />
                  Payroll Reports
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Current Period</p>
                <p className="text-3xl font-bold text-slate-900 font-sf-pro">{currentPeriod}</p>
                <p className="text-xs text-slate-500 font-sf-pro mt-1">Payment scheduled for 25th</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Total Gross</p>
                <p className="text-3xl font-bold text-slate-900 font-sf-pro">R{totalGross.toLocaleString()}</p>
                <p className="text-xs text-slate-500 font-sf-pro mt-1">
                  Net: R{totalNet.toLocaleString()} • Deductions: R{totalDeductions.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-green-500 to-mokm-blue-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Status</p>
                <p className="text-3xl font-bold text-slate-900 font-sf-pro">
                  {filteredRecords.filter(r => r.period === currentPeriod && r.status === 'draft').length > 0 ? 'Pending' : 'Processed'}
                </p>
                <p className="text-xs text-slate-500 font-sf-pro mt-1">
                  {filteredRecords.filter(r => r.period === currentPeriod && r.status === 'draft').length > 0 ? 
                    'Payroll not yet processed' : 
                    'All payslips generated'
                  }
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-yellow-500 to-mokm-orange-500">
                {filteredRecords.filter(r => r.period === currentPeriod && r.status === 'draft').length > 0 ? (
                  <Clock className="h-6 w-6 text-white" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search payroll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              >
                <option value="all">All Periods</option>
                <option value="current">Current Period</option>
                <option value="previous">Previous Periods</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="processed">Processed</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Payroll Records */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <div className="overflow-x-auto">
          {filteredRecords.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-4 px-6 text-left text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    Employee
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    Period
                  </th>
                  <th className="py-4 px-6 text-right text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    Gross
                  </th>
                  <th className="py-4 px-6 text-right text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    Deductions
                  </th>
                  <th className="py-4 px-6 text-right text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    Net
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    Status
                  </th>
                  <th className="py-4 px-6 text-right text-xs font-medium text-slate-600 uppercase tracking-wider font-sf-pro">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredRecords.map(record => (
                  <React.Fragment key={record.id}>
                    <tr 
                      className={`hover:bg-white/30 cursor-pointer transition-colors duration-200 ${selectedPayroll === record.id ? 'bg-white/30' : ''}`}
                      onClick={() => togglePayrollDetails(record.id)}
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-slate-900 font-sf-pro">{record.employeeName}</div>
                            <div className="text-xs text-slate-500 font-sf-pro">{record.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-slate-900 font-sf-pro">{record.period}</div>
                        {record.dateProcessed && (
                          <div className="text-xs text-slate-500 font-sf-pro">Processed: {record.dateProcessed}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right text-sm font-sf-pro">
                        <div className="font-medium text-slate-900">R{record.grossAmount.toLocaleString()}</div>
                      </td>
                      <td className="py-4 px-6 text-right text-sm font-sf-pro">
                        <div className="text-red-600">R{record.deductions.toLocaleString()}</div>
                      </td>
                      <td className="py-4 px-6 text-right text-sm font-sf-pro">
                        <div className="font-medium text-green-600">R{record.netAmount.toLocaleString()}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 text-xs rounded-full font-sf-pro ${getStatusBadgeColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {record.status !== 'draft' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`Downloading payslip for ${record.employeeName}`);
                              }}
                              className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          <button className="text-slate-400 hover:text-slate-600 transition-colors">
                            {selectedPayroll === record.id ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {selectedPayroll === record.id && (
                      <tr>
                        <td colSpan={7} className="p-0">
                          <div className="bg-white/70 backdrop-blur-sm p-6 border-t border-b border-white/20">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-sm font-medium text-slate-700 mb-3 font-sf-pro">Payroll Details</h4>
                                <div className="glass backdrop-blur-sm bg-white/50 p-4 rounded-xl border border-white/20 text-sm font-sf-pro">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="text-slate-500">Reference:</div>
                                    <div className="text-slate-900">{record.id}</div>
                                    
                                    <div className="text-slate-500">Period:</div>
                                    <div className="text-slate-900">{record.period}</div>
                                    
                                    {record.dateProcessed && (
                                      <>
                                        <div className="text-slate-500">Date Processed:</div>
                                        <div className="text-slate-900">{record.dateProcessed}</div>
                                      </>
                                    )}
                                    
                                    {record.paymentMethod && (
                                      <>
                                        <div className="text-slate-500">Payment Method:</div>
                                        <div className="text-slate-900">{record.paymentMethod}</div>
                                      </>
                                    )}
                                    
                                    {record.paymentReference && (
                                      <>
                                        <div className="text-slate-500">Reference:</div>
                                        <div className="text-slate-900">{record.paymentReference}</div>
                                      </>
                                    )}
                                    
                                    <div className="text-slate-500">Email Sent:</div>
                                    <div>
                                      {record.emailSent ? (
                                        <span className="text-green-600 flex items-center">
                                          <CheckCircle2 className="h-4 w-4 mr-1" /> Yes
                                        </span>
                                      ) : (
                                        <span className="text-red-600 flex items-center">
                                          <AlertCircle className="h-4 w-4 mr-1" /> No
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="mt-4 pt-4 border-t border-white/20">
                                    <div className="flex justify-between items-center">
                                      <div className="text-slate-700">Basic Salary:</div>
                                      <div className="text-slate-900">R{record.grossAmount.toLocaleString()}</div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                      <div className="text-slate-700">Tax:</div>
                                      <div className="text-red-600">-R{(record.deductions * 0.7).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                      <div className="text-slate-700">Benefits:</div>
                                      <div className="text-red-600">-R{(record.deductions * 0.3).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/20 font-medium">
                                      <div className="text-slate-900">Net Salary:</div>
                                      <div className="text-green-600">R{record.netAmount.toLocaleString()}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-slate-700 mb-3 font-sf-pro">Actions</h4>
                                <div className="space-y-3">
                                  {record.status === 'draft' && (
                                    <Button 
                                      onClick={() => {
                                        setPayrollRecords(records => 
                                          records.map(r => 
                                            r.id === record.id 
                                              ? { 
                                                  ...r, 
                                                  status: 'processed', 
                                                  dateProcessed: new Date().toISOString().split('T')[0]
                                                } 
                                              : r
                                          )
                                        );
                                      }}
                                      className="w-full bg-gradient-to-r from-mokm-green-500 to-mokm-blue-500 hover:from-mokm-green-600 hover:to-mokm-blue-600 font-sf-pro"
                                    >
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Process Payslip
                                    </Button>
                                  )}
                                  
                                  {record.status === 'processed' && (
                                    <Button 
                                      onClick={() => {
                                        setPayrollRecords(records => 
                                          records.map(r => 
                                            r.id === record.id 
                                              ? { 
                                                  ...r, 
                                                  status: 'paid',
                                                  paymentMethod: 'Bank Transfer',
                                                  paymentReference: `REF${Math.floor(Math.random() * 1000000)}`
                                                } 
                                              : r
                                          )
                                        );
                                      }}
                                      className="w-full bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 font-sf-pro"
                                    >
                                      <DollarSign className="h-4 w-4 mr-2" />
                                      Mark as Paid
                                    </Button>
                                  )}
                                  
                                  {(record.status === 'processed' || record.status === 'paid') && !record.emailSent && (
                                    <Button 
                                      onClick={() => {
                                        setPayrollRecords(records => 
                                          records.map(r => 
                                            r.id === record.id 
                                              ? { ...r, emailSent: true } 
                                              : r
                                          )
                                        );
                                        alert(`Email sent to ${record.employeeName}`);
                                      }}
                                      variant="outline"
                                      className="w-full font-sf-pro"
                                    >
                                      <Mail className="h-4 w-4 mr-2" />
                                      Send Payslip
                                    </Button>
                                  )}
                                  
                                  {(record.status === 'processed' || record.status === 'paid') && (
                                    <>
                                      <Button variant="outline" className="w-full font-sf-pro">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Payslip
                                      </Button>
                                      
                                      <Button variant="outline" className="w-full font-sf-pro">
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print Payslip
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 flex items-center justify-center">
                <DollarSign className="h-12 w-12 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-slate-500 font-sf-pro">No payroll records found</h3>
              <p className="mt-1 text-slate-400 font-sf-pro">
                Adjust your filters or process a new payroll
              </p>
              <div className="mt-6">
                <Button 
                  onClick={handleProcessPayroll}
                  className="bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 hover:from-mokm-purple-600 hover:to-mokm-blue-600 font-sf-pro"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Process Payroll
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PayrollManagement;
