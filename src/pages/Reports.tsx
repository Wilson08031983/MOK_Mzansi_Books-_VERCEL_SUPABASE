import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  FileBarChart,
  Clock,
  Star,
  BarChart,
  Calendar,
  ArrowLeft,
  Grid,
  List,
  Download,
  Plus,
  Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import ReportsGrid from '@/components/reports/ReportsGrid';
import ReportsList from '@/components/reports/ReportsList';
import ReportCategorySidebar from '@/components/reports/ReportCategorySidebar';
import { Badge } from '@/components/ui/badge';

// Report types and data structures
export interface Report {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  lastRun?: string;
  createdAt: string;
  createdBy: string;
  isFavorite: boolean;
  tags: string[];
}

export type ReportCategory =
  | 'financial'
  | 'sales'
  | 'client'
  | 'invoice'
  | 'expense'
  | 'project'
  | 'hr'
  | 'document'
  | 'system'
  | 'custom';

// Mock data for demonstration
const mockReports: Report[] = [
  {
    id: '1',
    name: 'Profit & Loss Statement',
    description: 'Comprehensive P&L statement showing income, expenses, and net profit',
    category: 'financial',
    lastRun: '2025-06-01',
    createdAt: '2025-01-15',
    createdBy: 'System',
    isFavorite: true,
    tags: ['financial', 'monthly', 'core']
  },
  {
    id: '2',
    name: 'Balance Sheet',
    description: 'Current financial position showing assets, liabilities, and equity',
    category: 'financial',
    lastRun: '2025-06-02',
    createdAt: '2025-01-15',
    createdBy: 'System',
    isFavorite: false,
    tags: ['financial', 'quarterly', 'core']
  },
  {
    id: '3',
    name: 'Cash Flow Statement',
    description: 'Cash inflow and outflow over a specified period',
    category: 'financial',
    lastRun: '2025-05-30',
    createdAt: '2025-01-15',
    createdBy: 'System',
    isFavorite: true,
    tags: ['financial', 'monthly', 'core']
  },
  {
    id: '4',
    name: 'Accounts Receivable Aging',
    description: 'Outstanding customer invoices categorized by age',
    category: 'financial',
    lastRun: '2025-06-04',
    createdAt: '2025-01-15',
    createdBy: 'System',
    isFavorite: false,
    tags: ['financial', 'daily', 'accounts']
  },
  {
    id: '5',
    name: 'Sales by Client',
    description: 'Breakdown of sales figures by client',
    category: 'sales',
    lastRun: '2025-06-01',
    createdAt: '2025-01-15',
    createdBy: 'System',
    isFavorite: false,
    tags: ['sales', 'monthly', 'client']
  },
  {
    id: '6',
    name: 'Quotation Conversion Rate',
    description: 'Analysis of quotations converted to sales',
    category: 'sales',
    lastRun: '2025-05-15',
    createdAt: '2025-01-15',
    createdBy: 'System',
    isFavorite: false,
    tags: ['sales', 'quotation', 'performance']
  },
  {
    id: '7',
    name: 'Client Profitability',
    description: 'Profit margin analysis by client',
    category: 'client',
    lastRun: '2025-05-30',
    createdAt: '2025-01-15',
    createdBy: 'System',
    isFavorite: true,
    tags: ['client', 'profitability', 'analysis']
  },
  {
    id: '8',
    name: 'Outstanding Invoices',
    description: 'Summary of all unpaid invoices',
    category: 'invoice',
    lastRun: '2025-06-05',
    createdAt: '2025-01-15',
    createdBy: 'System',
    isFavorite: true,
    tags: ['invoice', 'daily', 'essential']
  },
  {
    id: '9',
    name: 'Expense by Category',
    description: 'Breakdown of expenses by category',
    category: 'expense',
    lastRun: '2025-06-01',
    createdAt: '2025-01-15',
    createdBy: 'System',
    isFavorite: false,
    tags: ['expense', 'monthly', 'budget']
  },
  {
    id: '10',
    name: 'Project Profitability',
    description: 'Profit analysis by project',
    category: 'project',
    lastRun: '2025-05-28',
    createdAt: '2025-01-15',
    createdBy: 'System',
    isFavorite: false,
    tags: ['project', 'profitability', 'management']
  },
  {
    id: '11',
    name: 'Employee Attendance Summary',
    description: 'Summary of employee attendance records',
    category: 'hr',
    lastRun: '2025-06-01',
    createdAt: '2025-01-15',
    createdBy: 'System',
    isFavorite: false,
    tags: ['hr', 'attendance', 'monthly']
  },
  {
    id: '12',
    name: 'Document Usage Statistics',
    description: 'Access and usage data for documents',
    category: 'document',
    lastRun: '2025-05-15',
    createdAt: '2025-01-15',
    createdBy: 'System',
    isFavorite: false,
    tags: ['document', 'usage', 'statistics']
  }
];

const Reports = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>(mockReports);

  // Filter reports based on active tab, search query, and selected category
  const filteredReports = reports.filter(report => {
    // Filter by tab
    if (activeTab === 'favorites' && !report.isFavorite) return false;
    if (activeTab === 'recent' && !report.lastRun) return false;
    if (activeTab === 'scheduled') return false; // No scheduled reports in mock data

    // Filter by search query
    if (
      searchQuery &&
      !report.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !report.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !report.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
      return false;

    // Filter by category
    if (selectedCategory && report.category !== selectedCategory) return false;

    return true;
  });

  // Toggle favorite status for a report
  const toggleFavorite = (reportId: string) => {
    setReports(
      reports.map(report =>
        report.id === reportId ? { ...report, isFavorite: !report.isFavorite } : report
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent mb-4 font-sf-pro">
                Reports
              </h1>
              <p className="text-xl text-slate-600 font-sf-pro">
                Access, generate, and customize business reports
              </p>
            </div>
            <Link to="/dashboard">
              <Button variant="outline" className="flex items-center gap-2 hover:bg-slate-100 shadow-business hover:shadow-business-lg transition-all duration-300">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ReportCategorySidebar 
              selectedCategory={selectedCategory} 
              onSelectCategory={setSelectedCategory} 
            />
          </div>

          {/* Reports area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-between items-center">
              <div className="flex flex-wrap gap-3">
                <Button className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white shadow-business hover:shadow-business-lg transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" /> New Report
                </Button>
                <Button variant="outline" className="shadow-business hover:shadow-business-lg transition-all duration-300">
                  <Calendar className="h-4 w-4 mr-2" /> Schedule Report
                </Button>
                <Button variant="outline" className="shadow-business hover:shadow-business-lg transition-all duration-300">
                  <Download className="h-4 w-4 mr-2" /> Export All
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  className="h-9 w-9 shadow-business hover:shadow-business-lg transition-all duration-300"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  className="h-9 w-9 shadow-business hover:shadow-business-lg transition-all duration-300"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search and tabs */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search reports by name, keyword, or description"
                    className="pl-10 shadow-business hover:shadow-business-lg transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="shadow-business hover:shadow-business-lg transition-all duration-300">
                  <Filter className="h-4 w-4 mr-2" /> Filters
                </Button>
              </div>

              <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 md:flex md:space-x-1 bg-gray-100 rounded-lg p-1">
                  <TabsTrigger value="all" className="flex items-center">
                    <FileBarChart className="h-4 w-4 mr-2" /> All Reports
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="flex items-center">
                    <Star className="h-4 w-4 mr-2" /> Favorites
                  </TabsTrigger>
                  <TabsTrigger value="recent" className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" /> Recently Viewed
                  </TabsTrigger>
                  <TabsTrigger value="scheduled" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" /> Scheduled
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-6">
                  {viewMode === 'grid' ? (
                    <ReportsGrid reports={filteredReports} onToggleFavorite={toggleFavorite} />
                  ) : (
                    <ReportsList reports={filteredReports} onToggleFavorite={toggleFavorite} />
                  )}
                </TabsContent>
                
                <TabsContent value="favorites" className="mt-6">
                  {viewMode === 'grid' ? (
                    <ReportsGrid reports={filteredReports} onToggleFavorite={toggleFavorite} />
                  ) : (
                    <ReportsList reports={filteredReports} onToggleFavorite={toggleFavorite} />
                  )}
                </TabsContent>
                
                <TabsContent value="recent" className="mt-6">
                  {viewMode === 'grid' ? (
                    <ReportsGrid reports={filteredReports} onToggleFavorite={toggleFavorite} />
                  ) : (
                    <ReportsList reports={filteredReports} onToggleFavorite={toggleFavorite} />
                  )}
                </TabsContent>
                
                <TabsContent value="scheduled" className="mt-6">
                  {filteredReports.length > 0 ? (
                    viewMode === 'grid' ? (
                      <ReportsGrid reports={filteredReports} onToggleFavorite={toggleFavorite} />
                    ) : (
                      <ReportsList reports={filteredReports} onToggleFavorite={toggleFavorite} />
                    )
                  ) : (
                    <div className="text-center p-10 bg-white rounded-lg shadow-business">
                      <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Scheduled Reports</h3>
                      <p className="text-gray-600 mb-6">
                        You haven't scheduled any reports yet. Schedule a report to receive it automatically on a regular basis.
                      </p>
                      <Button className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white shadow-business hover:shadow-business-lg transition-all duration-300">
                        <Calendar className="h-4 w-4 mr-2" /> Schedule Your First Report
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
