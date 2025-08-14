import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Download, 
  Eye, 
  FileText, 
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { emp201Service, EMP201Calculation, EMP201EmployeeBreakdown } from '@/services/emp201Service';

const EMP201Management: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [currentCalculation, setCurrentCalculation] = useState<EMP201Calculation | null>(null);
  const [savedCalculations, setSavedCalculations] = useState<EMP201Calculation[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showEmployeeBreakdown, setShowEmployeeBreakdown] = useState(false);

  useEffect(() => {
    loadAvailablePeriods();
    loadSavedCalculations();
  }, []);

  const loadAvailablePeriods = () => {
    const periods = emp201Service.getAvailablePeriods();
    setAvailablePeriods(periods);
    if (periods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(periods[0]); // Select most recent period
    }
  };

  const loadSavedCalculations = () => {
    const calculations = emp201Service.getSavedEMP201Calculations();
    setSavedCalculations(calculations);
  };

  const handleCalculateEMP201 = async () => {
    if (!selectedPeriod) {
      toast.error('Please select a period');
      return;
    }

    setIsCalculating(true);
    try {
      console.log(`🧮 [EMP201Management] Starting EMP201 calculation for period: ${selectedPeriod}`);
      
      const calculation = emp201Service.calculateEMP201(selectedPeriod);
      setCurrentCalculation(calculation);
      
      // Save the calculation
      emp201Service.saveEMP201Calculation(calculation);
      loadSavedCalculations();
      
      toast.success(`EMP201 calculated successfully for ${calculation.periodName}`);
      console.log(`✅ [EMP201Management] EMP201 calculation completed:`, calculation);
      
    } catch (error) {
      console.error('Error calculating EMP201:', error);
      toast.error('Failed to calculate EMP201. Please check your payroll data.');
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPeriodName = (period: string) => {
    try {
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
    } catch (error) {
      return period;
    }
  };

  const exportToPDF = () => {
    if (!currentCalculation) return;
    
    // Create a simple HTML report for printing
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>EMP201 Return - ${currentCalculation.periodName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f5f5f5; }
          .total-row { font-weight: bold; background-color: #f9f9f9; }
          .currency { text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>EMP201 - Monthly Employer Declaration</h1>
          <h2>${currentCalculation.periodName}</h2>
          <p>Calculated: ${new Date(currentCalculation.calculatedDate).toLocaleDateString('en-ZA')}</p>
        </div>
        
        <div class="section">
          <h3>Summary</h3>
          <table class="table">
            <tr><td>Total Employees</td><td class="currency">${currentCalculation.totalEmployees}</td></tr>
            <tr><td>Total Taxable Income</td><td class="currency">${formatCurrency(currentCalculation.totalTaxableIncome)}</td></tr>
            <tr><td>Annual Payroll Estimate</td><td class="currency">${formatCurrency(currentCalculation.annualPayrollEstimate)}</td></tr>
          </table>
        </div>
        
        <div class="section">
          <h3>EMP201 Breakdown</h3>
          <table class="table">
            <tr><th>Component</th><th>Amount</th></tr>
            <tr><td>PAYE (Pay-As-You-Earn)</td><td class="currency">${formatCurrency(currentCalculation.totalPAYE)}</td></tr>
            <tr><td>UIF Employee (1% of Taxable Income)</td><td class="currency">${formatCurrency(currentCalculation.totalUIFEmployee)}</td></tr>
            <tr><td>UIF Total</td><td class="currency">${formatCurrency(currentCalculation.totalUIF)}</td></tr>
            <tr><td>SDL (Skills Development Levy) ${currentCalculation.isSDLApplicable ? '(1%)' : '(Not Applicable)'}</td><td class="currency">${formatCurrency(currentCalculation.totalSDL)}</td></tr>
            <tr class="total-row"><td><strong>Total EMP201 Amount</strong></td><td class="currency"><strong>${formatCurrency(currentCalculation.totalEMP201Amount)}</strong></td></tr>
          </table>
        </div>
        
        <div class="section">
          <h3>Employee Breakdown</h3>
          <table class="table">
            <tr>
              <th>Employee</th>
              <th>Gross Salary</th>
              <th>Taxable Income</th>
              <th>PAYE</th>
              <th>UIF Employee (1%)</th>
              <th>SDL</th>
              <th>Net Salary</th>
            </tr>
            ${currentCalculation.employeeBreakdown.map(emp => `
              <tr>
                <td>${emp.employeeName}</td>
                <td class="currency">${formatCurrency(emp.grossSalary)}</td>
                <td class="currency">${formatCurrency(emp.taxableIncome)}</td>
                <td class="currency">${formatCurrency(emp.paye)}</td>
                <td class="currency">${formatCurrency(emp.uifEmployee)}</td>
                <td class="currency">${formatCurrency(emp.sdl)}</td>
                <td class="currency">${formatCurrency(emp.netSalary)}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      </body>
      </html>
    `;

    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
    reportWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">EMP201 Management</h2>
          <p className="text-slate-600">Monthly Employer Declaration (PAYE, UIF, SDL)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={loadAvailablePeriods}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Period Selection and Calculation */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Calculate EMP201 Return
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Period
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a period" />
                </SelectTrigger>
                <SelectContent>
                  {availablePeriods.map(period => (
                    <SelectItem key={period} value={period}>
                      {formatPeriodName(period)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleCalculateEMP201}
                disabled={!selectedPeriod || isCalculating}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {isCalculating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate EMP201
                  </>
                )}
              </Button>
            </div>
          </div>

          {availablePeriods.length === 0 && (
            <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <p className="text-amber-800">
                No payroll data found. Please process payroll first in the Payroll Management section.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Calculation Results */}
      {currentCalculation && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total PAYE</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(currentCalculation.totalPAYE)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total UIF</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(currentCalculation.totalUIF)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total SDL</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(currentCalculation.totalSDL)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">EMP201 Total</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency(currentCalculation.totalEMP201Amount)}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-slate-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-600" />
                  EMP201 Breakdown - {currentCalculation.periodName}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowEmployeeBreakdown(!showEmployeeBreakdown)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showEmployeeBreakdown ? 'Hide' : 'Show'} Employee Details
                  </Button>
                  <Button
                    onClick={exportToPDF}
                    variant="outline"
                    size="sm"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="breakdown">Component Breakdown</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-900">Period Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Period:</span>
                          <span className="font-medium">{currentCalculation.periodName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Total Employees:</span>
                          <span className="font-medium">{currentCalculation.totalEmployees}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Total Taxable Income:</span>
                          <span className="font-medium">{formatCurrency(currentCalculation.totalTaxableIncome)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Annual Payroll Estimate:</span>
                          <span className="font-medium">{formatCurrency(currentCalculation.annualPayrollEstimate)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-900">SDL Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">SDL Applicable:</span>
                          <Badge variant={currentCalculation.isSDLApplicable ? "default" : "secondary"}>
                            {currentCalculation.isSDLApplicable ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">SDL Threshold:</span>
                          <span className="font-medium">R 500,000/year</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">SDL Rate:</span>
                          <span className="font-medium">1%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="breakdown" className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left p-3 font-medium text-slate-700">Component</th>
                          <th className="text-right p-3 font-medium text-slate-700">Rate</th>
                          <th className="text-right p-3 font-medium text-slate-700">Base Amount</th>
                          <th className="text-right p-3 font-medium text-slate-700">Amount Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="p-3">PAYE (Pay-As-You-Earn)</td>
                          <td className="p-3 text-right">Variable</td>
                          <td className="p-3 text-right">{formatCurrency(currentCalculation.totalTaxableIncome)}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(currentCalculation.totalPAYE)}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="p-3">UIF Employee (1% of Taxable Income)</td>
                          <td className="p-3 text-right">1%</td>
                          <td className="p-3 text-right">{formatCurrency(currentCalculation.totalUIFSalaries)}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(currentCalculation.totalUIFEmployee)}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="p-3">SDL (Skills Development Levy)</td>
                          <td className="p-3 text-right">{currentCalculation.isSDLApplicable ? '1%' : 'N/A'}</td>
                          <td className="p-3 text-right">{formatCurrency(currentCalculation.totalSDLSalaries)}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(currentCalculation.totalSDL)}</td>
                        </tr>
                        <tr className="border-t-2 border-slate-300 bg-slate-50">
                          <td className="p-3 font-bold">Total EMP201 Amount</td>
                          <td className="p-3"></td>
                          <td className="p-3"></td>
                          <td className="p-3 text-right font-bold text-lg">{formatCurrency(currentCalculation.totalEMP201Amount)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Employee Breakdown */}
              {showEmployeeBreakdown && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-semibold text-slate-900">Employee Breakdown</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left p-3 font-medium text-slate-700">Employee</th>
                          <th className="text-right p-3 font-medium text-slate-700">Gross Salary</th>
                          <th className="text-right p-3 font-medium text-slate-700">Taxable Income</th>
                          <th className="text-right p-3 font-medium text-slate-700">PAYE</th>
                          <th className="text-right p-3 font-medium text-slate-700">UIF Employee (1%)</th>
                          <th className="text-right p-3 font-medium text-slate-700">SDL</th>
                          <th className="text-right p-3 font-medium text-slate-700">Net Salary</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentCalculation.employeeBreakdown.map((employee, index) => (
                          <tr key={employee.employeeId} className="border-b border-slate-100">
                            <td className="p-3">{employee.employeeName}</td>
                            <td className="p-3 text-right">{formatCurrency(employee.grossSalary)}</td>
                            <td className="p-3 text-right">{formatCurrency(employee.taxableIncome)}</td>
                            <td className="p-3 text-right">{formatCurrency(employee.paye)}</td>
                            <td className="p-3 text-right">{formatCurrency(employee.uifEmployee)}</td>
                            <td className="p-3 text-right">{formatCurrency(employee.sdl)}</td>
                            <td className="p-3 text-right font-medium">{formatCurrency(employee.netSalary)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Saved Calculations History */}
      {savedCalculations.length > 0 && (
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-600" />
              EMP201 History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedCalculations.slice(0, 5).map((calc, index) => (
                <div
                  key={`${calc.period}-${index}`}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => setCurrentCalculation(calc)}
                >
                  <div>
                    <p className="font-medium text-slate-900">{calc.periodName}</p>
                    <p className="text-sm text-slate-600">
                      {calc.totalEmployees} employees • Calculated {new Date(calc.calculatedDate).toLocaleDateString('en-ZA')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(calc.totalEMP201Amount)}</p>
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Calculated
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EMP201Management;
