import React from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Calendar, 
  FileBarChart, 
  MoreHorizontal,
  PlayCircle,
  Download,
  Pencil,
  Clock,
  User
} from 'lucide-react';
import type { Report } from '@/pages/Reports';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReportsGridProps {
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

const getCategoryIcon = (category: string) => {
  switch (category) {
    default:
      return <FileBarChart className="h-5 w-5" />;
  }
};

const ReportsGrid: React.FC<ReportsGridProps> = ({ reports, onToggleFavorite }) => {
  if (reports.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-lg shadow-business">
        <FileBarChart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Reports Found</h3>
        <p className="text-gray-600 mb-6">
          No reports match your current filters. Try adjusting your search criteria.
        </p>
        <Button className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white shadow-business hover:shadow-business-lg transition-all duration-300">
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reports.map((report) => (
        <Card 
          key={report.id} 
          className="shadow-business hover:shadow-business-lg transition-all duration-300 overflow-hidden"
        >
          <CardHeader className="pb-0 pt-6 px-6 flex flex-row items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={`${getCategoryColor(report.category)}`}>
                  {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                </Badge>
                {report.lastRun && (
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Last run: {report.lastRun}
                  </div>
                )}
              </div>
              <CardTitle className="text-lg font-bold">{report.name}</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-gray-500"
              onClick={() => onToggleFavorite(report.id)}
            >
              <Star 
                className={`h-5 w-5 ${report.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} 
              />
            </Button>
          </CardHeader>
          
          <CardContent className="px-6 py-4">
            <p className="text-sm text-gray-600 h-12 overflow-hidden">
              {report.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {report.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                  {tag}
                </Badge>
              ))}
              {report.tags.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-50">
                  +{report.tags.length - 3} more
                </Badge>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="px-6 py-4 bg-gray-50 flex justify-between items-center">
            <div className="text-xs text-gray-500 flex items-center">
              <User className="h-3 w-3 mr-1" />
              {report.createdBy}
            </div>
            <div className="flex gap-2">
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
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ReportsGrid;
