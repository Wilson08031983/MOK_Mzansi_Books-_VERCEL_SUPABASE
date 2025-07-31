/**
 * Payroll Test Runner Component
 * Provides UI interface for executing comprehensive payroll expense integration tests
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  TestTube,
  AlertTriangle,
  Download
} from 'lucide-react';
import PayrollTestingScenarios, { TestScenario } from '@/utils/payrollTestingScenarios';

interface TestResult {
  scenario: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

interface TestSummary {
  passed: number;
  failed: number;
  results: TestResult[];
  totalDuration?: number;
}

const PayrollTestRunner: React.FC = () => {
  const [testRunner] = useState(() => new PayrollTestingScenarios());
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [testResults, setTestResults] = useState<TestSummary | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<string>('');

  const testScenarios = testRunner.getAllTestScenarios();

  /**
   * Run all test scenarios
   */
  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setTestResults(null);
    
    try {
      const startTime = Date.now();
      const scenarios = testRunner.getAllTestScenarios();
      
      // Run tests with progress tracking
      const results: TestResult[] = [];
      let passed = 0;
      let failed = 0;
      
      for (let i = 0; i < scenarios.length; i++) {
        const scenario = scenarios[i];
        setCurrentTest(scenario.name);
        setProgress(((i + 1) / scenarios.length) * 100);
        
        try {
          const testStartTime = Date.now();
          const isValid = await testRunner.runTest(scenario.id);
          const duration = Date.now() - testStartTime;
          
          if (isValid) {
            passed++;
            results.push({ scenario: scenario.name, passed: true, duration });
          } else {
            failed++;
            results.push({ scenario: scenario.name, passed: false, error: 'Validation failed', duration });
          }
        } catch (error) {
          failed++;
          results.push({ scenario: scenario.name, passed: false, error: String(error) });
        }
      }
      
      const totalDuration = Date.now() - startTime;
      setTestResults({ passed, failed, results, totalDuration });
      
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
      setProgress(0);
    }
  };

  /**
   * Run a specific test scenario
   */
  const runSingleTest = async (testId: string) => {
    setIsRunning(true);
    setCurrentTest(testScenarios.find(s => s.id === testId)?.name || '');
    
    try {
      const startTime = Date.now();
      const isValid = await testRunner.runTest(testId);
      const duration = Date.now() - startTime;
      
      const scenario = testScenarios.find(s => s.id === testId);
      const result: TestResult = {
        scenario: scenario?.name || testId,
        passed: isValid,
        duration,
        error: isValid ? undefined : 'Validation failed'
      };
      
      setTestResults({
        passed: isValid ? 1 : 0,
        failed: isValid ? 0 : 1,
        results: [result],
        totalDuration: duration
      });
      
    } catch (error) {
      const scenario = testScenarios.find(s => s.id === testId);
      setTestResults({
        passed: 0,
        failed: 1,
        results: [{
          scenario: scenario?.name || testId,
          passed: false,
          error: String(error)
        }]
      });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  /**
   * Download test report
   */
  const downloadReport = () => {
    if (!testResults) return;
    
    const report = testRunner.generateTestReport(testResults);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-test-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Get status icon for test result
   */
  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  /**
   * Get status badge for test result
   */
  const getStatusBadge = (passed: boolean) => {
    return (
      <Badge variant={passed ? "default" : "destructive"}>
        {passed ? 'PASSED' : 'FAILED'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payroll Integration Testing</h2>
          <p className="text-gray-600 mt-1">
            Comprehensive test suite for automated payroll expense integration system
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Run All Tests
          </Button>
          {testResults && (
            <Button
              onClick={downloadReport}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500 animate-spin" />
                <span className="text-sm font-medium">Running Tests...</span>
              </div>
              <Progress value={progress} className="w-full" />
              {currentTest && (
                <p className="text-sm text-gray-600">Current: {currentTest}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results Summary */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Test Results Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {testResults.passed + testResults.failed}
                </div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {testResults.passed}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {testResults.failed}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
            
            {testResults.totalDuration && (
              <div className="text-sm text-gray-600 text-center">
                Total execution time: {(testResults.totalDuration / 1000).toFixed(2)}s
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Scenarios and Results */}
      <Tabs defaultValue="scenarios" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
          <TabsTrigger value="results">Detailed Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid gap-4">
            {testScenarios.map((scenario) => (
              <Card key={scenario.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {scenario.description}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => runSingleTest(scenario.id)}
                      disabled={isRunning}
                      variant="outline"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run Test
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          {testResults ? (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {testResults.results.map((result, index) => (
                  <Card key={index} className={`border-l-4 ${
                    result.passed ? 'border-l-green-500' : 'border-l-red-500'
                  }`}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.passed)}
                          <div>
                            <h4 className="font-medium">{result.scenario}</h4>
                            {result.duration && (
                              <p className="text-sm text-gray-600">
                                Duration: {(result.duration / 1000).toFixed(2)}s
                              </p>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(result.passed)}
                      </div>
                      
                      {result.error && (
                        <Alert className="mt-3">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Error:</strong> {result.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No test results yet. Run tests to see detailed results here.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollTestRunner;