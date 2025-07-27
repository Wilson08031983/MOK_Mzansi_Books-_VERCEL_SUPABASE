import React, { useState } from 'react';
import { 
  Receipt,
  Users
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmployeeTaxManagement from './EmployeeTaxManagement';
import BusinessTaxTab from './BusinessTaxTab';

// TaxRecord interface moved to BusinessTaxTab component

interface TaxTabProps {
  selectedEmployee?: any;
  taxSubTab?: string;
  onEmployeeChange?: (employee: any) => void;
}

const TaxTab: React.FC<TaxTabProps> = ({ 
  selectedEmployee, 
  taxSubTab = 'business', 
  onEmployeeChange 
}) => {
  const [activeTab, setActiveTab] = useState<'business' | 'employees'>(taxSubTab as 'business' | 'employees');

  // All tax record handlers moved to BusinessTaxTab component

  // Sample tax records moved to BusinessTaxTab component

  // Status helpers and filtering logic moved to BusinessTaxTab component

  return (
    <div className="space-y-6">
      {/* Tax Management Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
        <TabsList className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business p-1 h-auto">
          <TabsTrigger 
            value="business" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-orange-500 data-[state=active]:via-mokm-pink-500 data-[state=active]:to-mokm-purple-500 data-[state=active]:text-white px-6 py-3 flex items-center gap-2"
          >
            <Receipt className="h-4 w-4" />
            Business Tax
          </TabsTrigger>
          <TabsTrigger 
            value="employees" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-orange-500 data-[state=active]:via-mokm-pink-500 data-[state=active]:to-mokm-purple-500 data-[state=active]:text-white px-6 py-3 flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Employee Tax
          </TabsTrigger>
        </TabsList>

        {/* Business Tax Tab */}
        <TabsContent value="business">
          <BusinessTaxTab />
        </TabsContent>

        {/* Employee Tax Tab */}
        <TabsContent value="employees">
          <EmployeeTaxManagement 
            selectedEmployee={selectedEmployee}
            onEmployeeChange={onEmployeeChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxTab;