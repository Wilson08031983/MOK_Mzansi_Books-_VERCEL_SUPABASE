
import React from 'react';
import { 
  Users,
  UserPlus,
  Calendar,
  Gift,
  Briefcase,
  TrendingDown,
  DollarSign,
  UserCheck,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HRMetrics {
  totalEmployees: number;
  newHires: number;
  onLeaveToday: number;
  upcomingBirthdays: number;
  openPositions: number;
  turnoverRate: number;
}

interface HRDashboardProps {
  metrics: HRMetrics;
}

const HRDashboard: React.FC<HRDashboardProps> = ({ metrics }) => {
  return (
    <div className="space-y-8">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Total Employees</p>
                <p className="text-3xl font-bold text-slate-900 font-sf-pro">{metrics.totalEmployees}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">New Hires</p>
                <p className="text-3xl font-bold text-slate-900 font-sf-pro">{metrics.newHires}</p>
                <p className="text-xs text-green-600 font-sf-pro">This month</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-green-500 to-mokm-blue-500">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">On Leave Today</p>
                <p className="text-3xl font-bold text-slate-900 font-sf-pro">{metrics.onLeaveToday}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-yellow-500 to-mokm-orange-500">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Birthdays</p>
                <p className="text-3xl font-bold text-slate-900 font-sf-pro">{metrics.upcomingBirthdays}</p>
                <p className="text-xs text-mokm-pink-600 font-sf-pro">This week</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-pink-500 to-mokm-purple-500">
                <Gift className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Open Positions</p>
                <p className="text-3xl font-bold text-slate-900 font-sf-pro">{metrics.openPositions}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Turnover Rate</p>
                <p className="text-3xl font-bold text-slate-900 font-sf-pro">{metrics.turnoverRate}%</p>
                <p className="text-xs text-green-600 font-sf-pro">Below target</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="text-slate-900 font-sf-pro">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600">
              <UserPlus className="h-6 w-6" />
              <span className="font-sf-pro">Add Employee</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-mokm-green-500 to-mokm-blue-500 hover:from-mokm-green-600 hover:to-mokm-blue-600">
              <DollarSign className="h-6 w-6" />
              <span className="font-sf-pro">Process Payroll</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 hover:from-mokm-orange-600 hover:to-mokm-pink-600">
              <UserCheck className="h-6 w-6" />
              <span className="font-sf-pro">Approve Leave</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-mokm-purple-500 to-mokm-pink-500 hover:from-mokm-purple-600 hover:to-mokm-pink-600">
              <Calendar className="h-6 w-6" />
              <span className="font-sf-pro">Schedule Interview</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HRDashboard;
