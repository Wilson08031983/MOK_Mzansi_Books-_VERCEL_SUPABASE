import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Users, Clock, DollarSign, BookOpen, Heart, Trophy, RefreshCw } from 'lucide-react';
import { Employee } from '@/services/employeeService';
import { EmployeePerformance, getAllEmployeePerformances } from '@/services/performanceEvaluationService';
import { toast } from 'sonner';

interface PerformanceManagementProps {
  employees: Employee[];
}

const PerformanceManagement: React.FC<PerformanceManagementProps> = ({ employees }) => {
  const [performances, setPerformances] = useState<EmployeePerformance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPerformanceData();
  }, [employees]);

  // Auto-refresh when qualifications change in Training tab
  useEffect(() => {
    const handler = () => loadPerformanceData();
    window.addEventListener('employeeQualificationsUpdated', handler);
    return () => window.removeEventListener('employeeQualificationsUpdated', handler);
  }, []);

  // Auto-refresh when projects are created/edited
  useEffect(() => {
    const projectsHandler = () => loadPerformanceData();
    window.addEventListener('projectsUpdated', projectsHandler);
    return () => window.removeEventListener('projectsUpdated', projectsHandler);
  }, []);

  const loadPerformanceData = () => {
    setIsLoading(true);
    try {
      const allPerformances = getAllEmployeePerformances();
      setPerformances(allPerformances);
    } catch (error) {
      console.error('Error loading performance data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceColor = (score: number): string => {
    // Theme-aware tints for better contrast
    // Light: darker hues; Dark: soft tints
    if (score >= 90) return 'text-green-700 dark:text-green-300';
    if (score >= 80) return 'text-blue-700 dark:text-blue-300';
    if (score >= 70) return 'text-yellow-700 dark:text-yellow-300';
    if (score >= 60) return 'text-orange-700 dark:text-orange-300';
    return 'text-red-700 dark:text-red-300';
  };

  const getPerformanceLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Satisfactory';
    if (score >= 60) return 'Needs Improvement';
    return 'Poor';
  };

  const averageOverall = performances.length > 0 
    ? Math.round(performances.reduce((sum, p) => sum + p.metrics.overall, 0) / performances.length)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mokm-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-sf-pro">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-sf-pro text-slate-800 dark:text-slate-100">Performance Management</h2>
          <p className="font-sf-pro text-slate-600 dark:text-slate-400">Employee performance evaluation (1-100 scoring system)</p>
        </div>
        <Button 
          onClick={loadPerformanceData}
          disabled={isLoading}
          className="bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 hover:from-mokm-purple-600 hover:to-mokm-blue-600 text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-business">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sf-pro text-slate-800 dark:text-slate-100">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sf-pro text-slate-800 dark:text-slate-100">{performances.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-business">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sf-pro text-slate-800 dark:text-slate-100">Average Performance</CardTitle>
            <Target className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-sf-pro ${getPerformanceColor(averageOverall)}`}>
              {averageOverall}/100
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{getPerformanceLabel(averageOverall)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-business">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sf-pro text-slate-800 dark:text-slate-100">Top Performers</CardTitle>
            <Trophy className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sf-pro text-green-700 dark:text-green-300">
              {performances.filter(p => p.metrics.overall >= 90).length}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Excellent (90+)</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-business">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sf-pro text-slate-800 dark:text-slate-100">Need Development</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sf-pro text-orange-700 dark:text-orange-300">
              {performances.filter(p => p.metrics.overall < 70).length}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Below 70</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="font-sf-pro text-slate-800 dark:text-slate-100">Employee Performance Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Employee</TableHead>
                  <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Position</TableHead>
                  <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Overall Score</TableHead>
                  <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Project Speed</TableHead>
                  <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Cost Savings</TableHead>
                  <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Attendance</TableHead>
                  <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Training</TableHead>
                  <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Behavior</TableHead>
                  <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Promotions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performances.map((performance) => (
                  <TableRow key={performance.employeeId}>
                    <TableCell className="font-medium font-sf-pro text-slate-800 dark:text-slate-100">
                      {performance.employeeName}
                    </TableCell>
                    <TableCell className="font-sf-pro text-slate-800 dark:text-slate-100">{performance.position}</TableCell>
                    <TableCell className="font-sf-pro text-slate-800 dark:text-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${getPerformanceColor(performance.metrics.overall)}`}>
                          {performance.metrics.overall}
                        </span>
                        <Progress value={performance.metrics.overall} className="w-16 h-2" />
                      </div>
                    </TableCell>
                    <TableCell className={`font-sf-pro ${getPerformanceColor(performance.metrics.projectSpeed)}`}>
                      {performance.metrics.projectSpeed}
                    </TableCell>
                    <TableCell className={`font-sf-pro ${getPerformanceColor(performance.metrics.costSavings)}`}>
                      {performance.metrics.costSavings}
                    </TableCell>
                    <TableCell className={`font-sf-pro ${getPerformanceColor(performance.metrics.attendance)}`}>
                      {performance.metrics.attendance}
                    </TableCell>
                    <TableCell className={`font-sf-pro ${getPerformanceColor(performance.metrics.training)}`}>
                      {performance.metrics.training}
                    </TableCell>
                    <TableCell className={`font-sf-pro ${getPerformanceColor(performance.metrics.behavior)}`}>
                      {performance.metrics.behavior}
                    </TableCell>
                    <TableCell className={`font-sf-pro ${getPerformanceColor(performance.metrics.promotions)}`}>
                      {performance.metrics.promotions}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Info */}
      <Card className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="font-sf-pro text-slate-800 dark:text-slate-100">Performance Scoring System (1-100)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700 dark:text-slate-300">
            <div>
              <p className="font-sf-pro"><strong className="text-slate-800 dark:text-slate-200">Project Speed:</strong> How efficiently projects are completed vs planned timeline</p>
              <p className="font-sf-pro"><strong className="text-slate-800 dark:text-slate-200">Cost Savings:</strong> Budget management and cost control on projects</p>
              <p className="font-sf-pro"><strong className="text-slate-800 dark:text-slate-200">Attendance:</strong> Time & attendance reliability and punctuality</p>
            </div>
            <div>
              <p className="font-sf-pro"><strong className="text-slate-800 dark:text-slate-200">Training:</strong> Professional development and skill enhancement</p>
              <p className="font-sf-pro"><strong className="text-slate-800 dark:text-slate-200">Behavior:</strong> Professional conduct, teamwork, and collaboration</p>
              <p className="font-sf-pro"><strong className="text-slate-800 dark:text-slate-200">Promotions:</strong> Career progression and achievements</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceManagement;
