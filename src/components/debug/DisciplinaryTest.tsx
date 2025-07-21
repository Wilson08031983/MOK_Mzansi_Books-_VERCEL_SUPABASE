import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { calculateBehaviorScore } from '@/services/performanceEvaluationService';
import { getAllEmployees } from '@/services/employeeService';
import { toast } from 'sonner';

const DisciplinaryTest: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [behaviorScores, setBehaviorScores] = useState<{[key: string]: number}>({});
  const [disciplinaryActions, setDisciplinaryActions] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load employees
    const allEmployees = getAllEmployees();
    setEmployees(allEmployees);

    // Load disciplinary actions
    const actionsRaw = localStorage.getItem('disciplinaryActions');
    const actions = actionsRaw ? JSON.parse(actionsRaw) : [];
    setDisciplinaryActions(actions);

    // Calculate behavior scores
    const scores: {[key: string]: number} = {};
    allEmployees.forEach(employee => {
      scores[employee.id] = calculateBehaviorScore(employee.id);
    });
    setBehaviorScores(scores);
  };

  const addTestDisciplinaryAction = () => {
    if (employees.length === 0) {
      toast.error('No employees found');
      return;
    }

    const testEmployee = employees[0];
    const newAction = {
      id: Date.now().toString(),
      employeeId: testEmployee.id,
      employeeName: `${testEmployee.firstName} ${testEmployee.surname}`,
      actionType: 'written_warning',
      misconduct: 'Test Misconduct',
      description: 'Test disciplinary action for behavior score testing',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months
      issuedBy: 'Test Manager',
      status: 'active',
      severity: 'serious',
      followUpRequired: false,
      documents: [],
      notes: 'Test action to verify disciplinary integration'
    };

    const updatedActions = [...disciplinaryActions, newAction];
    localStorage.setItem('disciplinaryActions', JSON.stringify(updatedActions));
    
    toast.success('Test disciplinary action added');
    loadData(); // Reload data to see the updated scores
  };

  const clearDisciplinaryActions = () => {
    localStorage.removeItem('disciplinaryActions');
    toast.success('All disciplinary actions cleared');
    loadData();
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Disciplinary Integration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={addTestDisciplinaryAction}>
              Add Test Disciplinary Action
            </Button>
            <Button onClick={clearDisciplinaryActions} variant="outline">
              Clear All Actions
            </Button>
            <Button onClick={loadData} variant="outline">
              Refresh Data
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Employees ({employees.length})</h3>
            <div className="space-y-2">
              {employees.map(employee => (
                <div key={employee.id} className="p-2 border rounded">
                  <div className="flex justify-between">
                    <span>{employee.firstName} {employee.surname} ({employee.position})</span>
                    <span className="font-mono">Behavior Score: {behaviorScores[employee.id] || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Disciplinary Actions ({disciplinaryActions.length})</h3>
            <div className="space-y-2">
              {disciplinaryActions.map(action => (
                <div key={action.id} className="p-2 border rounded text-sm">
                  <div><strong>{action.employeeName}</strong> - {action.actionType}</div>
                  <div>Misconduct: {action.misconduct} | Severity: {action.severity} | Status: {action.status}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DisciplinaryTest;
