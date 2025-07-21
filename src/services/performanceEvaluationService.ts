import { Employee } from '@/services/employeeService';
import { Project } from '@/types/project';

/**
 * Comprehensive Performance Evaluation Service
 * Calculates employee performance scores from 1-100 based on multiple metrics
 */

export interface PerformanceMetrics {
  projectSpeed: number; // How fast projects are completed (1-100)
  costSavings: number; // How much money saved on projects (1-100)
  attendance: number; // Time & attendance score (1-100)
  training: number; // Training completion and effectiveness (1-100)
  behavior: number; // Professional behavior and teamwork (1-100)
  promotions: number; // Career progression and achievements (1-100)
  overall: number; // Overall performance score (1-100)
}

export interface EmployeePerformance {
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  metrics: PerformanceMetrics;
  lastEvaluated: string;
  evaluationPeriod: string; // e.g., "Q1 2025", "2024 Annual"
  strengths: string[];
  improvementAreas: string[];
  goals: string[];
  achievements: string[];
}

export interface ProjectPerformanceData {
  projectId: number;
  projectName: string;
  employeeId: string;
  plannedDuration: number; // in days
  actualDuration: number; // in days
  plannedBudget: number;
  actualExpenses: number;
  completionDate: string;
  status: string;
  role: string; // employee's role in the project
}

/**
 * Calculate project speed performance score
 * Measures how efficiently an employee completes projects
 */
export const calculateProjectSpeedScore = (employeeId: string): number => {
  try {
    const projectsRaw = localStorage.getItem('projects');
    if (!projectsRaw) return 50; // Default score if no projects

    const projects: Project[] = JSON.parse(projectsRaw);
    const employeeProjects = projects.filter(project => 
      project.assignedEmployees?.some(emp => emp.employeeId === employeeId) ||
      project.team.includes(getEmployeeName(employeeId))
    );

    if (employeeProjects.length === 0) return 50; // Default score if no projects

    let totalSpeedScore = 0;
    let completedProjects = 0;

    employeeProjects.forEach(project => {
      if (project.status === 'Completed') {
        const startDate = new Date(project.startDate);
        const endDate = new Date(project.endDate);
        const plannedDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Estimate actual completion time based on progress and current date
        const actualDuration = plannedDuration; // Simplified for demo
        
        // Calculate speed score: faster completion = higher score
        let speedScore = 100;
        if (actualDuration > plannedDuration) {
          const delayRatio = actualDuration / plannedDuration;
          speedScore = Math.max(20, 100 - ((delayRatio - 1) * 50));
        } else if (actualDuration < plannedDuration) {
          const efficiencyRatio = plannedDuration / actualDuration;
          speedScore = Math.min(100, 80 + ((efficiencyRatio - 1) * 20));
        }
        
        totalSpeedScore += speedScore;
        completedProjects++;
      }
    });

    return completedProjects > 0 ? Math.round(totalSpeedScore / completedProjects) : 50;
  } catch (error) {
    console.error('Error calculating project speed score:', error);
    return 50;
  }
};

/**
 * Calculate cost savings performance score
 * Measures how well an employee manages project budgets
 */
export const calculateCostSavingsScore = (employeeId: string): number => {
  try {
    const projectsRaw = localStorage.getItem('projects');
    if (!projectsRaw) return 50;

    const projects: Project[] = JSON.parse(projectsRaw);
    const employeeProjects = projects.filter(project => 
      project.assignedEmployees?.some(emp => emp.employeeId === employeeId) ||
      project.team.includes(getEmployeeName(employeeId))
    );

    if (employeeProjects.length === 0) return 50;

    let totalSavingsScore = 0;
    let projectsWithBudget = 0;

    employeeProjects.forEach(project => {
      if (project.budget > 0) {
        const budgetUtilization = project.expenses / project.budget;
        
        // Calculate savings score: under budget = higher score
        let savingsScore = 50;
        if (budgetUtilization < 0.8) {
          // Significant savings
          savingsScore = 90 + (0.8 - budgetUtilization) * 50;
        } else if (budgetUtilization < 1.0) {
          // Some savings
          savingsScore = 70 + (1.0 - budgetUtilization) * 100;
        } else if (budgetUtilization <= 1.1) {
          // Slightly over budget
          savingsScore = 50 - (budgetUtilization - 1.0) * 200;
        } else {
          // Significantly over budget
          savingsScore = Math.max(10, 30 - (budgetUtilization - 1.1) * 100);
        }
        
        totalSavingsScore += Math.min(100, Math.max(10, savingsScore));
        projectsWithBudget++;
      }
    });

    return projectsWithBudget > 0 ? Math.round(totalSavingsScore / projectsWithBudget) : 50;
  } catch (error) {
    console.error('Error calculating cost savings score:', error);
    return 50;
  }
};

/**
 * Calculate attendance performance score
 * Based on time & attendance data
 */
export const calculateAttendanceScore = (employeeId: string): number => {
  try {
    const attendanceSummariesRaw = localStorage.getItem('attendanceSummaries');
    if (!attendanceSummariesRaw) return 75; // Default good score

    const attendanceSummaries = JSON.parse(attendanceSummariesRaw);
    const employeeAttendance = attendanceSummaries.find((summary: any) => summary.employeeId === employeeId);
    
    if (!employeeAttendance) return 75;

    const regularHours = employeeAttendance.currentMonthRegularHours || 0;
    const expectedHours = 173.33; // Standard monthly hours
    
    // Calculate attendance score based on hours worked
    const attendanceRatio = regularHours / expectedHours;
    let attendanceScore = 50;
    
    if (attendanceRatio >= 0.95) {
      attendanceScore = 90 + (attendanceRatio - 0.95) * 200; // Excellent attendance
    } else if (attendanceRatio >= 0.85) {
      attendanceScore = 70 + (attendanceRatio - 0.85) * 200; // Good attendance
    } else if (attendanceRatio >= 0.75) {
      attendanceScore = 50 + (attendanceRatio - 0.75) * 200; // Average attendance
    } else {
      attendanceScore = Math.max(20, attendanceRatio * 66.67); // Poor attendance
    }

    return Math.min(100, Math.max(20, Math.round(attendanceScore)));
  } catch (error) {
    console.error('Error calculating attendance score:', error);
    return 75;
  }
};

/**
 * Calculate training performance score
 * Based on training completion and effectiveness
 */
export const calculateTrainingScore = (employeeId: string): number => {
  try {
    // For demo purposes, generate realistic training scores
    // In a real system, this would be based on actual training data
    const trainingData = localStorage.getItem(`training_${employeeId}`);
    
    if (trainingData) {
      const training = JSON.parse(trainingData);
      return training.score || 75;
    }

    // Generate realistic training score based on employee role and tenure
    const employee = getEmployeeById(employeeId);
    if (!employee) return 75;

    let baseScore = 70;
    
    // Management positions typically have higher training scores
    if (['CEO', 'Manager', 'Director', 'Founder'].includes(employee.position)) {
      baseScore = 85;
    } else if (['Team Leader', 'Senior', 'Lead'].some(title => employee.position.includes(title))) {
      baseScore = 80;
    }

    // Add some randomization for realism
    const variation = (Math.random() - 0.5) * 20;
    return Math.min(100, Math.max(50, Math.round(baseScore + variation)));
  } catch (error) {
    console.error('Error calculating training score:', error);
    return 75;
  }
};

/**
 * Calculate behavior performance score
 * Based on professional behavior, teamwork, and disciplinary record
 */
export const calculateBehaviorScore = (employeeId: string): number => {
  try {
    // Check for existing behavior data
    const behaviorData = localStorage.getItem(`behavior_${employeeId}`);
    
    if (behaviorData) {
      const behavior = JSON.parse(behaviorData);
      return behavior.score || 80;
    }

    // Get employee information
    const employee = getEmployeeById(employeeId);
    if (!employee) return 80;

    // Base score based on position
    let baseScore = 75;
    if (['CEO', 'Manager', 'Director', 'Founder'].includes(employee.position)) {
      baseScore = 85;
    } else if (['Team Leader', 'Senior', 'Lead'].some(title => employee.position.includes(title))) {
      baseScore = 80;
    }

    // Check disciplinary record and adjust score
    const disciplinaryActions = getDisciplinaryActions(employeeId);
    let disciplinaryDeduction = 0;

    disciplinaryActions.forEach(action => {
      if (action.status === 'active') {
        // Deduct points based on action type and severity
        switch (action.actionType) {
          case 'verbal_warning':
            disciplinaryDeduction += action.severity === 'gross' ? 15 : action.severity === 'serious' ? 10 : 5;
            break;
          case 'written_warning':
            disciplinaryDeduction += action.severity === 'gross' ? 25 : action.severity === 'serious' ? 20 : 10;
            break;
          case 'final_warning':
            disciplinaryDeduction += action.severity === 'gross' ? 40 : action.severity === 'serious' ? 30 : 20;
            break;
          case 'suspension':
            disciplinaryDeduction += 35;
            break;
        }
      } else if (action.status === 'expired') {
        // Expired warnings have reduced impact but still affect score
        const expiredImpact = 0.3; // 30% of original impact
        switch (action.actionType) {
          case 'verbal_warning':
            disciplinaryDeduction += (action.severity === 'gross' ? 15 : action.severity === 'serious' ? 10 : 5) * expiredImpact;
            break;
          case 'written_warning':
            disciplinaryDeduction += (action.severity === 'gross' ? 25 : action.severity === 'serious' ? 20 : 10) * expiredImpact;
            break;
          case 'final_warning':
            disciplinaryDeduction += (action.severity === 'gross' ? 40 : action.severity === 'serious' ? 30 : 20) * expiredImpact;
            break;
        }
      }
    });

    // Calculate final score
    const finalScore = baseScore - disciplinaryDeduction;
    
    // Add some positive variation for employees with clean records
    let variation = 0;
    if (disciplinaryActions.length === 0) {
      variation = Math.random() * 10; // Up to 10 bonus points for clean record
    } else {
      variation = (Math.random() - 0.5) * 5; // Smaller variation for those with records
    }

    return Math.min(100, Math.max(20, Math.round(finalScore + variation)));
  } catch (error) {
    console.error('Error calculating behavior score:', error);
    return 80;
  }
};

/**
 * Get disciplinary actions for an employee
 */
const getDisciplinaryActions = (employeeId: string): any[] => {
  try {
    const actionsRaw = localStorage.getItem('disciplinaryActions');
    if (!actionsRaw) return [];
    
    const actions = JSON.parse(actionsRaw);
    return actions.filter((action: any) => action.employeeId === employeeId);
  } catch (error) {
    console.error('Error getting disciplinary actions:', error);
    return [];
  }
};

/**
 * Calculate promotions performance score
 * Based on career progression and achievements
 */
export const calculatePromotionsScore = (employeeId: string): number => {
  try {
    // For demo purposes, generate realistic promotion scores
    // In a real system, this would be based on actual promotion history
    const promotionData = localStorage.getItem(`promotions_${employeeId}`);
    
    if (promotionData) {
      const promotions = JSON.parse(promotionData);
      return promotions.score || 70;
    }

    const employee = getEmployeeById(employeeId);
    if (!employee) return 70;

    let baseScore = 60;
    
    // Higher positions indicate career progression
    if (['CEO', 'Founder'].includes(employee.position)) {
      baseScore = 95;
    } else if (['Director', 'Manager'].includes(employee.position)) {
      baseScore = 85;
    } else if (['Team Leader', 'Senior', 'Lead'].some(title => employee.position.includes(title))) {
      baseScore = 75;
    }

    // Add some randomization for realism
    const variation = (Math.random() - 0.5) * 10;
    return Math.min(100, Math.max(40, Math.round(baseScore + variation)));
  } catch (error) {
    console.error('Error calculating promotions score:', error);
    return 70;
  }
};

/**
 * Calculate overall performance score
 * Weighted average of all performance metrics
 */
export const calculateOverallScore = (metrics: Omit<PerformanceMetrics, 'overall'>): number => {
  const weights = {
    projectSpeed: 0.25,    // 25% - Project delivery efficiency
    costSavings: 0.20,     // 20% - Budget management
    attendance: 0.15,      // 15% - Reliability and attendance
    training: 0.15,        // 15% - Skill development
    behavior: 0.15,        // 15% - Professional conduct
    promotions: 0.10       // 10% - Career progression
  };

  const weightedScore = 
    (metrics.projectSpeed * weights.projectSpeed) +
    (metrics.costSavings * weights.costSavings) +
    (metrics.attendance * weights.attendance) +
    (metrics.training * weights.training) +
    (metrics.behavior * weights.behavior) +
    (metrics.promotions * weights.promotions);

  return Math.round(weightedScore);
};

/**
 * Generate comprehensive performance evaluation for an employee
 */
export const generateEmployeePerformance = (employeeId: string): EmployeePerformance | null => {
  try {
    const employee = getEmployeeById(employeeId);
    if (!employee) return null;

    const metrics: Omit<PerformanceMetrics, 'overall'> = {
      projectSpeed: calculateProjectSpeedScore(employeeId),
      costSavings: calculateCostSavingsScore(employeeId),
      attendance: calculateAttendanceScore(employeeId),
      training: calculateTrainingScore(employeeId),
      behavior: calculateBehaviorScore(employeeId),
      promotions: calculatePromotionsScore(employeeId)
    };

    const overallScore = calculateOverallScore(metrics);

    // Generate strengths and improvement areas based on scores
    const strengths: string[] = [];
    const improvementAreas: string[] = [];

    if (metrics.projectSpeed >= 80) strengths.push('Excellent project delivery speed');
    else if (metrics.projectSpeed < 60) improvementAreas.push('Project completion efficiency');

    if (metrics.costSavings >= 80) strengths.push('Strong budget management skills');
    else if (metrics.costSavings < 60) improvementAreas.push('Cost control and budget adherence');

    if (metrics.attendance >= 85) strengths.push('Excellent attendance and reliability');
    else if (metrics.attendance < 70) improvementAreas.push('Attendance and punctuality');

    if (metrics.training >= 80) strengths.push('Strong commitment to learning and development');
    else if (metrics.training < 65) improvementAreas.push('Professional development and training');

    if (metrics.behavior >= 85) strengths.push('Outstanding professional behavior and teamwork');
    else if (metrics.behavior < 70) improvementAreas.push('Professional conduct and collaboration');

    if (metrics.promotions >= 80) strengths.push('Strong career progression and achievements');
    else if (metrics.promotions < 60) improvementAreas.push('Career development and goal achievement');

    // Generate goals based on improvement areas
    const goals: string[] = [];
    if (improvementAreas.includes('Project completion efficiency')) {
      goals.push('Improve project delivery timelines by 15%');
    }
    if (improvementAreas.includes('Cost control and budget adherence')) {
      goals.push('Achieve 95% budget adherence on assigned projects');
    }
    if (improvementAreas.includes('Attendance and punctuality')) {
      goals.push('Maintain 95% attendance rate');
    }

    // Generate achievements based on strengths
    const achievements: string[] = [];
    if (metrics.projectSpeed >= 90) achievements.push('Consistently delivers projects ahead of schedule');
    if (metrics.costSavings >= 90) achievements.push('Achieved significant cost savings on multiple projects');
    if (overallScore >= 85) achievements.push('Top performer in department');

    return {
      employeeId,
      employeeName: `${employee.firstName} ${employee.surname}`,
      position: employee.position,
      department: employee.department,
      metrics: { ...metrics, overall: overallScore },
      lastEvaluated: new Date().toISOString().split('T')[0],
      evaluationPeriod: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`,
      strengths,
      improvementAreas,
      goals,
      achievements
    };
  } catch (error) {
    console.error('Error generating employee performance:', error);
    return null;
  }
};

/**
 * Get all employee performance evaluations
 */
export const getAllEmployeePerformances = (): EmployeePerformance[] => {
  try {
    const employeesRaw = localStorage.getItem('employees');
    if (!employeesRaw) return [];

    const employees: Employee[] = JSON.parse(employeesRaw);
    
    // Remove duplicates based on employee ID
    const uniqueEmployees = employees.filter((employee, index, self) => 
      index === self.findIndex(e => e.id === employee.id)
    );
    
    const performances: EmployeePerformance[] = [];

    uniqueEmployees.forEach(employee => {
      const performance = generateEmployeePerformance(employee.id);
      if (performance) {
        performances.push(performance);
      }
    });

    return performances.sort((a, b) => b.metrics.overall - a.metrics.overall);
  } catch (error) {
    console.error('Error getting all employee performances:', error);
    return [];
  }
};

/**
 * Save performance evaluation to localStorage
 */
export const savePerformanceEvaluation = (performance: EmployeePerformance): void => {
  try {
    const performancesRaw = localStorage.getItem('performanceEvaluations');
    let performances: EmployeePerformance[] = performancesRaw ? JSON.parse(performancesRaw) : [];
    
    // Remove existing evaluation for the same employee and period
    performances = performances.filter(p => 
      !(p.employeeId === performance.employeeId && p.evaluationPeriod === performance.evaluationPeriod)
    );
    
    performances.push(performance);
    localStorage.setItem('performanceEvaluations', JSON.stringify(performances));
  } catch (error) {
    console.error('Error saving performance evaluation:', error);
  }
};

/**
 * Helper functions
 */
const getEmployeeById = (employeeId: string): Employee | null => {
  try {
    const employeesRaw = localStorage.getItem('employees');
    if (!employeesRaw) return null;

    const employees: Employee[] = JSON.parse(employeesRaw);
    return employees.find(emp => emp.id === employeeId) || null;
  } catch (error) {
    console.error('Error getting employee by ID:', error);
    return null;
  }
};

const getEmployeeName = (employeeId: string): string => {
  const employee = getEmployeeById(employeeId);
  return employee ? `${employee.firstName} ${employee.surname}` : '';
};

/**
 * Get performance ranking for an employee
 */
export const getEmployeeRanking = (employeeId: string): { rank: number; total: number; percentile: number } => {
  const allPerformances = getAllEmployeePerformances();
  const employeeIndex = allPerformances.findIndex(p => p.employeeId === employeeId);
  
  if (employeeIndex === -1) {
    return { rank: 0, total: allPerformances.length, percentile: 0 };
  }

  const rank = employeeIndex + 1;
  const total = allPerformances.length;
  const percentile = Math.round(((total - rank) / total) * 100);

  return { rank, total, percentile };
};
