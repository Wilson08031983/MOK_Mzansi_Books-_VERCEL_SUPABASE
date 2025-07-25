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
        
        // Use actual completion date vs planned end date for real calculation
        // For completed projects, use endDate as completion date (projects don't have separate completionDate)
        const completionDate = endDate;
        const actualDuration = Math.ceil((completionDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate speed score: faster completion = higher score
        let speedScore = 75; // Base score for completion
        
        if (actualDuration <= plannedDuration) {
          // Completed on time or early
          const efficiencyRatio = plannedDuration / actualDuration;
          speedScore = Math.min(100, 75 + ((efficiencyRatio - 1) * 25));
        } else {
          // Completed late
          const delayRatio = actualDuration / plannedDuration;
          speedScore = Math.max(30, 75 - ((delayRatio - 1) * 30));
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
      if (project.budget > 0 && project.status === 'Completed') {
        const budgetUtilization = project.expenses / project.budget;
        
        // Calculate savings score: under budget = higher score
        let savingsScore = 60; // Base score for staying within reasonable budget
        
        if (budgetUtilization <= 0.8) {
          // Significant savings (20% or more under budget)
          savingsScore = 85 + Math.min(15, (0.8 - budgetUtilization) * 75);
        } else if (budgetUtilization <= 0.95) {
          // Good budget management (5-20% under budget)
          savingsScore = 75 + ((0.95 - budgetUtilization) / 0.15) * 10;
        } else if (budgetUtilization <= 1.05) {
          // Acceptable budget management (within 5% of budget)
          savingsScore = 65 + ((1.05 - budgetUtilization) / 0.1) * 10;
        } else if (budgetUtilization <= 1.15) {
          // Over budget but manageable (5-15% over)
          savingsScore = 45 - ((budgetUtilization - 1.05) / 0.1) * 15;
        } else {
          // Significantly over budget (15%+ over)
          savingsScore = Math.max(20, 30 - ((budgetUtilization - 1.15) * 50));
        }
        
        totalSavingsScore += Math.min(100, Math.max(20, savingsScore));
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
 * Based on actual training qualifications and completion
 */
export const calculateTrainingScore = (employeeId: string): number => {
  try {
    // Get actual training qualifications from localStorage
    const qualificationsRaw = localStorage.getItem('employeeQualifications');
    if (!qualificationsRaw) return 50; // No training data = low score

    const qualifications = JSON.parse(qualificationsRaw);
    const employeeQualifications = qualifications.filter((qual: any) => qual.employeeId === employeeId);
    
    // If no qualifications, return low score
    if (employeeQualifications.length === 0) {
      return 50;
    }

    // Calculate score based on number and recency of qualifications
    let baseScore = 60; // Base score for having any training
    
    // Add points for each qualification (max 5 qualifications counted)
    const qualificationBonus = Math.min(employeeQualifications.length * 8, 40);
    baseScore += qualificationBonus;
    
    // Add bonus for recent training (within last 2 years)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    const recentTraining = employeeQualifications.filter((qual: any) => {
      const endDate = new Date(qual.endDate);
      return endDate >= twoYearsAgo;
    });
    
    if (recentTraining.length > 0) {
      baseScore += Math.min(recentTraining.length * 5, 15); // Up to 15 bonus points
    }

    return Math.min(100, Math.max(50, Math.round(baseScore)));
  } catch (error) {
    console.error('Error calculating training score:', error);
    return 50;
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
          case 'dismissal':
            disciplinaryDeduction += 50;
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
    
    // Clean record bonus (no random variation)
    let cleanRecordBonus = 0;
    if (disciplinaryActions.length === 0) {
      cleanRecordBonus = 10; // Fixed 10 point bonus for clean record
    }

    return Math.min(100, Math.max(20, Math.round(finalScore + cleanRecordBonus)));
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
 * Based on actual career progression and position changes
 */
export const calculatePromotionsScore = (employeeId: string): number => {
  try {
    // Get actual promotion history from localStorage
    const promotionHistoryRaw = localStorage.getItem('promotionHistory');
    
    if (promotionHistoryRaw) {
      const promotionHistory = JSON.parse(promotionHistoryRaw);
      const employeePromotions = promotionHistory.filter((promo: any) => promo.employeeId === employeeId);
      
      if (employeePromotions.length > 0) {
        // Calculate score based on actual promotions
        let score = 60; // Base score
        score += employeePromotions.length * 15; // 15 points per promotion
        
        // Bonus for recent promotions (within last 2 years)
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        
        const recentPromotions = employeePromotions.filter((promo: any) => {
          const promoDate = new Date(promo.effectiveDate);
          return promoDate >= twoYearsAgo;
        });
        
        if (recentPromotions.length > 0) {
          score += recentPromotions.length * 10; // 10 bonus points per recent promotion
        }
        
        return Math.min(100, Math.max(60, Math.round(score)));
      }
    }

    // If no promotion history exists, base score on tenure and current position
    const employee = getEmployeeById(employeeId);
    if (!employee) return 60;

    // Calculate tenure in years
    const startDate = new Date(employee.startDate);
    const currentDate = new Date();
    const tenureYears = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    let baseScore = 60; // Base score for no promotions
    
    // Slight bonus for longer tenure without promotions (up to 5 points)
    if (tenureYears > 1) {
      baseScore += Math.min(tenureYears * 2, 5);
    }
    
    // Slight penalty for very long tenure without promotions
    if (tenureYears > 5) {
      baseScore -= Math.min((tenureYears - 5) * 2, 10);
    }

    return Math.min(100, Math.max(50, Math.round(baseScore)));
  } catch (error) {
    console.error('Error calculating promotions score:', error);
    return 60;
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
