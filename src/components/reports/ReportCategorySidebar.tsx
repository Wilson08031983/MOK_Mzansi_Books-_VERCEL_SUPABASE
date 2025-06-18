import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileBarChart, 
  BarChart, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  FileText, 
  Receipt, 
  FolderKanban, 
  UserCircle, 
  File, 
  Settings,
  Sparkles
} from 'lucide-react';

interface ReportCategorySidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

interface CategoryItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const ReportCategorySidebar: React.FC<ReportCategorySidebarProps> = ({ 
  selectedCategory, 
  onSelectCategory 
}) => {
  // Define categories
  const categories: CategoryItem[] = [
    { id: 'financial', name: 'Financial Reports', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'sales', name: 'Sales & Quotations', icon: <ShoppingCart className="h-4 w-4" /> },
    { id: 'client', name: 'Client Reports', icon: <Users className="h-4 w-4" /> },
    { id: 'invoice', name: 'Invoice & Payment', icon: <FileText className="h-4 w-4" /> },
    { id: 'expense', name: 'Expense Reports', icon: <Receipt className="h-4 w-4" /> },
    { id: 'project', name: 'Project Management', icon: <FolderKanban className="h-4 w-4" /> },
    { id: 'hr', name: 'HR & Payroll', icon: <UserCircle className="h-4 w-4" /> },
    { id: 'document', name: 'Document Management', icon: <File className="h-4 w-4" /> },
    { id: 'system', name: 'System & Audit', icon: <Settings className="h-4 w-4" /> },
    { id: 'custom', name: 'Custom Reports', icon: <Sparkles className="h-4 w-4" /> },
  ];

  return (
    <Card className="shadow-business hover:shadow-business-lg transition-all duration-300 bg-white">
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-4 text-slate-800">Report Categories</h3>
        
        <div className="space-y-1">
          {/* All Reports option */}
          <Button
            variant={selectedCategory === null ? "default" : "ghost"}
            className={`w-full justify-start ${
              selectedCategory === null 
                ? "bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white" 
                : "text-slate-700 hover:text-slate-900"
            }`}
            onClick={() => onSelectCategory(null)}
          >
            <FileBarChart className="mr-2 h-4 w-4" />
            All Reports
          </Button>

          {/* Category options */}
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              className={`w-full justify-start ${
                selectedCategory === category.id 
                  ? "bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white" 
                  : "text-slate-700 hover:text-slate-900"
              }`}
              onClick={() => onSelectCategory(category.id)}
            >
              {category.icon}
              <span className="ml-2">{category.name}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportCategorySidebar;
