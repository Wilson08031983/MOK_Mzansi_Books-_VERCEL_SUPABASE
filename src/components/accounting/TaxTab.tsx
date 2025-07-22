import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Calculator,
  FileText, 
  Calendar, 
  Upload, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaxRecord {
  id: string;
  period: string;
  type: 'VAT' | 'PAYE' | 'Income Tax' | 'UIF' | 'SDL';
  amount: number;
  status: 'pending' | 'submitted' | 'paid' | 'overdue';
  dueDate: string;
  submittedDate?: string;
  paidDate?: string;
  reference?: string;
  notes?: string;
}

const TaxTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTax, setSelectedTax] = useState<string | null>(null);

  // Sample tax records data based on South African tax requirements
  const [taxRecords] = useState<TaxRecord[]>([
    {
      id: 'TAX001',
      period: 'June 2025',
      type: 'VAT',
      amount: 15420.00,
      status: 'pending',
      dueDate: '2025-07-07',
      reference: 'VAT-2025-06',
      notes: 'Monthly VAT return - 15% standard rate'
    },
    {
      id: 'TAX002',
      period: 'May 2025',
      type: 'VAT',
      amount: 12850.00,
      status: 'paid',
      dueDate: '2025-06-07',
      submittedDate: '2025-06-05',
      paidDate: '2025-06-06',
      reference: 'VAT-2025-05'
    },
    {
      id: 'TAX003',
      period: 'May 2025',
      type: 'PAYE',
      amount: 28500.00,
      status: 'submitted',
      dueDate: '2025-06-07',
      submittedDate: '2025-06-01',
      reference: 'PAYE-2025-05',
      notes: 'Employee tax deductions - Due 7th of following month'
    },
    {
      id: 'TAX004',
      period: 'Q1 2025',
      type: 'Income Tax',
      amount: 45000.00,
      status: 'overdue',
      dueDate: '2025-04-30',
      reference: 'INC-2025-Q1',
      notes: 'Provisional tax payment - 27% company rate'
    },
    {
      id: 'TAX005',
      period: 'May 2025',
      type: 'UIF',
      amount: 1250.00,
      status: 'paid',
      dueDate: '2025-06-07',
      submittedDate: '2025-06-01',
      paidDate: '2025-06-02',
      reference: 'UIF-2025-05',
      notes: '2% of remuneration (1% employer + 1% employee) - Max R17,712/month'
    },
    {
      id: 'TAX006',
      period: 'May 2025',
      type: 'SDL',
      amount: 850.00,
      status: 'paid',
      dueDate: '2025-06-07',
      submittedDate: '2025-06-01',
      paidDate: '2025-06-02',
      reference: 'SDL-2025-05',
      notes: '1% of payroll - Skills Development Levy (payroll > R500,000/year)'
    }
  ]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'submitted':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-slate-600" />;
    }
  };

  const filteredTaxRecords = taxRecords.filter(record => {
    const matchesSearch = record.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalTaxLiability = taxRecords
    .filter(record => record.status === 'pending' || record.status === 'overdue')
    .reduce((sum, record) => sum + record.amount, 0);

  const overdueTaxes = taxRecords.filter(record => record.status === 'overdue').length;
  const pendingTaxes = taxRecords.filter(record => record.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* South African Tax Information Banner */}
      <Card className="glass backdrop-blur-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-business">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">South African Tax Compliance 2025</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-700">
                <div>
                  <p className="font-medium text-blue-700">PAYE Tax</p>
                  <p>Due: 7th of following month</p>
                  <p>Rates: 18% - 45% (individual)</p>
                </div>
                <div>
                  <p className="font-medium text-green-700">UIF Contributions</p>
                  <p>Rate: 2% (1% employer + 1% employee)</p>
                  <p>Max: R17,712/month per employee</p>
                </div>
                <div>
                  <p className="font-medium text-purple-700">SDL (Skills Development)</p>
                  <p>Rate: 1% of total payroll</p>
                  <p>Threshold: R500,000/year</p>
                </div>
                <div>
                  <p className="font-medium text-orange-700">VAT</p>
                  <p>Standard Rate: 15%</p>
                  <p>Due: 25th of following month</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Tax Liability</p>
                <p className="text-2xl font-bold text-slate-900">R{totalTaxLiability.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Overdue Returns</p>
                <p className="text-2xl font-bold text-red-600">{overdueTaxes}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Returns</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingTaxes}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Management Section */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl font-semibold text-slate-900 font-sf-pro">Tax Returns & Compliance</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-slate-200 hover:bg-slate-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button 
                size="sm"
                className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white hover:shadow-colored-lg transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Return
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search tax returns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-mokm-purple-500"
                />
              </div>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tax Type</label>
                  <select 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-md focus:border-mokm-purple-500 focus:outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="VAT">VAT</option>
                    <option value="PAYE">PAYE</option>
                    <option value="Income Tax">Income Tax</option>
                    <option value="UIF">UIF</option>
                    <option value="SDL">SDL</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-md focus:border-mokm-purple-500 focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="submitted">Submitted</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Tax Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Period</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Due Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTaxRecords.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900">{record.period}</p>
                        {record.reference && (
                          <p className="text-sm text-slate-600">{record.reference}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {record.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900">R{record.amount.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-slate-700">{record.dueDate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getStatusIcon(record.status)}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTaxRecords.length === 0 && (
            <div className="text-center py-8">
              <Calculator className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No tax records found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxTab;