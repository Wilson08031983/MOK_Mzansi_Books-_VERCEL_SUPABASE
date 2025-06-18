import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  MoreHorizontal,
  PlayCircle,
  Download,
  Calendar,
  Pencil,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Report } from '@/pages/Reports';

interface ReportsListProps {
  reports: Report[];
  onToggleFavorite: (reportId: string) => void;
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    financial: 'bg-blue-100 text-blue-800',
    sales: 'bg-green-100 text-green-800',
    client: 'bg-purple-100 text-purple-800',
    invoice: 'bg-yellow-100 text-yellow-800',
    expense: 'bg-red-100 text-red-800',
    project: 'bg-indigo-100 text-indigo-800',
    hr: 'bg-pink-100 text-pink-800',
    document: 'bg-slate-100 text-slate-800',
    system: 'bg-gray-100 text-gray-800',
    custom: 'bg-orange-100 text-orange-800',
  };
  
  return colors[category] || 'bg-gray-100 text-gray-800';
};

const ReportsList: React.FC<ReportsListProps> = ({ reports, onToggleFavorite }) => {
  if (reports.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-lg shadow-business">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Reports Found</h3>
        <p className="text-gray-600">
          No reports match your current filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white shadow-business overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-10"></TableHead>
            <TableHead>Report Name</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead className="hidden lg:table-cell">Last Run</TableHead>
            <TableHead className="hidden md:table-cell">Created By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full p-0"
                  onClick={() => onToggleFavorite(report.id)}
                >
                  <Star 
                    className={`h-4 w-4 ${report.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
                  />
                </Button>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{report.name}</p>
                  <p className="text-sm text-gray-500 hidden sm:block">{report.description.substring(0, 60)}...</p>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge className={`${getCategoryColor(report.category)}`}>
                  {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {report.lastRun ? (
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {report.lastRun}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">Never</span>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-gray-500">
                {report.createdBy}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    className="bg-mokm-purple-500 hover:bg-mokm-purple-600 text-white"
                  >
                    <PlayCircle className="h-4 w-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="cursor-pointer">
                        <Pencil className="h-4 w-4 mr-2" /> Edit Report
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Download className="h-4 w-4 mr-2" /> Export
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Calendar className="h-4 w-4 mr-2" /> Schedule
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-red-600">
                        Delete Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReportsList;
