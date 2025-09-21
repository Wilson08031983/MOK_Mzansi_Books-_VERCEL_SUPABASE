import { Employee, getAllEmployees, getEmployeeById as getEmployeeByIdFromService } from '@/services/employeeService';
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

    let weightedScoreSum = 0;
    let weightTotal = 0;

    const employeeName = getEmployeeName(employeeId);

    employeeProjects.forEach(project => {
      // Compute planned duration
      const hasTimeline = !!project.startDate && !!project.endDate;
      const startDate = project.startDate ? new Date(project.startDate) : null;
      const endDate = project.endDate ? new Date(project.endDate) : null;
      const today = new Date();

      let projectSpeedComponent = 50; // neutral baseline per project

      if (hasTimeline && startDate && endDate) {
        const plannedDuration = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

        if (project.status === 'Completed') {
          // Use project planned vs actual duration (no explicit completionDate, use endDate)
          const completionDate = endDate;
          const actualDuration = Math.max(1, Math.ceil((completionDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

          if (actualDuration <= plannedDuration) {
            const efficiencyRatio = plannedDuration / actualDuration; // >= 1 when early/on time
            projectSpeedComponent = Math.min(100, 75 + ((efficiencyRatio - 1) * 25));
          } else {
            const delayRatio = actualDuration / plannedDuration; // > 1 when late
            projectSpeedComponent = Math.max(30, 75 - ((delayRatio - 1) * 30));
          }
        } else {
          // In-flight projects: evaluate schedule adherence using progress vs expected by today
          // Expected progress = elapsedDays / plannedDuration (clamped 0..1)
          const elapsedMs = Math.min(Math.max(today.getTime() - startDate.getTime(), 0), Math.max(endDate.getTime() - startDate.getTime(), 0));
          const elapsedDays = Math.ceil(elapsedMs / (1000 * 60 * 60 * 24));
          const expectedProgress = Math.max(0, Math.min(1, elapsedDays / plannedDuration));
          const actualProgress = Math.max(0, Math.min(1, (project.progress || 0) / 100));
          const adherence = actualProgress - expectedProgress; // positive if ahead of schedule

          // Map adherence (-1..1 approx) to score around 75 baseline
          projectSpeedComponent = 75 + (adherence * 50); // +/- 50 swing at extremes
          projectSpeedComponent = Math.min(100, Math.max(30, projectSpeedComponent));
        }
      }

      // Task-level signal: completion vs expected from tasks (if available)
      if (Array.isArray(project.tasks) && project.tasks.length > 0 && hasTimeline && startDate && endDate) {
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter(t => t.completed).length;
        const tasksCompletionRatio = completedTasks / totalTasks;

        // Expected completion by today mirrors expectedProgress
        const plannedDuration = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const elapsedMs = Math.min(Math.max(today.getTime() - startDate.getTime(), 0), Math.max(endDate.getTime() - startDate.getTime(), 0));
        const elapsedDays = Math.ceil(elapsedMs / (1000 * 60 * 60 * 24));
        const expectedTasksRatio = Math.max(0, Math.min(1, elapsedDays / plannedDuration));

        const tasksAdherence = tasksCompletionRatio - expectedTasksRatio;
        // Blend into project component with modest weight (20%) to avoid double counting
        const tasksInfluence = 75 + (tasksAdherence * 50); // centered at 75
        projectSpeedComponent = (projectSpeedComponent * 0.8) + (Math.min(100, Math.max(30, tasksInfluence)) * 0.2);
      }

      // Role and allocation weighting for this employee within the project
      const assignment = project.assignedEmployees?.find(emp => emp.employeeId === employeeId);
      const isManager = project.manager && employeeName && project.manager.trim().toLowerCase() === employeeName.trim().toLowerCase();
      const isLeadByRole = typeof assignment?.role === 'string' && /lead|leader|manager|supervisor/i.test(assignment.role);
      const roleWeight = isManager || isLeadByRole ? 1.15 : 1.0; // team leaders/managers have higher influence

      // Allocation weight scales contribution from 0.5 (very low allocation) to 1.0 (100%)
      const allocationPct = typeof assignment?.allocation === 'number' ? Math.max(0, Math.min(100, assignment.allocation)) : 100;
      const allocationWeight = 0.5 + (allocationPct / 200); // 0.5..1.0

      const combinedWeight = roleWeight * allocationWeight;

      weightedScoreSum += projectSpeedComponent * combinedWeight;
      weightTotal += combinedWeight;
    });

    const finalScore = weightTotal > 0 ? Math.round(weightedScoreSum / weightTotal) : 50;
    return Math.min(100, Math.max(1, finalScore));
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

    // Prefer explicit attendance rate if available (0-100)
    let attendanceRatio: number | null = null;
    if (typeof employeeAttendance.attendanceRate === 'number' && employeeAttendance.attendanceRate >= 0) {
      attendanceRatio = Math.max(0, Math.min(1, employeeAttendance.attendanceRate / 100));
    }

    // If day-based metrics exist, compute from daysPresent/totalWorkingDays
    if (
      attendanceRatio === null &&
      typeof employeeAttendance.daysPresent === 'number' &&
      typeof employeeAttendance.totalWorkingDays === 'number' &&
      employeeAttendance.totalWorkingDays > 0
    ) {
      attendanceRatio = Math.max(0, Math.min(1, employeeAttendance.daysPresent / employeeAttendance.totalWorkingDays));
    }

    // Fallback: use hours-based ratio (regular hours vs expected monthly hours)
    if (attendanceRatio === null) {
      const regularHours = employeeAttendance.currentMonthRegularHours || employeeAttendance.regularHours || 0;
      const expectedHours = 173.33; // Approx standard monthly hours
      attendanceRatio = expectedHours > 0 ? regularHours / expectedHours : 0;
    }

    // Score mapping using the existing bands
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

    // Additional explicit penalty for absenteeism (excludes leave)
    // If daysAbsent and totalWorkingDays are provided, apply a scaled penalty up to 30 points
    if (
      typeof (employeeAttendance as any).daysAbsent === 'number' &&
      typeof (employeeAttendance as any).totalWorkingDays === 'number' &&
      (employeeAttendance as any).totalWorkingDays > 0
    ) {
      const daysAbsent = Math.max(0, (employeeAttendance as any).daysAbsent);
      const totalWorkingDays = Math.max(1, (employeeAttendance as any).totalWorkingDays);
      const absenceRatio = Math.min(1, daysAbsent / totalWorkingDays);
      const absencePenalty = absenceRatio * 30; // up to 30-point penalty for full-month absence
      attendanceScore = attendanceScore - absencePenalty;
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
    // Pull employee qualifications (each may include nqfLevel)
    const qualificationsRaw = localStorage.getItem('employeeQualifications');
    if (!qualificationsRaw) return 0;

    const qualifications = JSON.parse(qualificationsRaw);
    const employeeQualifications = qualifications.filter((qual: any) => qual.employeeId === employeeId);

    if (employeeQualifications.length === 0) return 0;

    // Sum all NQF levels (handle legacy entries that may miss nqfLevel)
    const totalNqf: number = employeeQualifications.reduce((sum: number, qual: any) => {
      const lvlRaw = (qual?.nqfLevel ?? qual?.nqf_level ?? 0);
      const lvl = Number(lvlRaw);
      return sum + (Number.isFinite(lvl) ? Math.max(0, Math.min(10, lvl)) : 0);
    }, 0);

    // 1 NQF = 2.5 points; cap at 100
    const score = totalNqf * 2.5;
    return Math.min(100, Math.max(0, Math.round(score)));
  } catch (error) {
    console.error('Error calculating training score:', error);
    return 0;
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

    // Behavior starts at 100 and is reduced by disciplinary actions
    let baseScore = 100;

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

    // Calculate final score (no clean-record bonus; 100 is the clean baseline)
    const finalScore = baseScore - disciplinaryDeduction;
    return Math.min(100, Math.max(20, Math.round(finalScore)));
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
    // Helper to map positions to hierarchy influence score (1-100)
    const getPositionInfluenceScore = (positionRaw: string | undefined): number => {
      if (!positionRaw) return 60;
      const position = positionRaw.toLowerCase();

      // 1) Ownership / Shareholders
      if (/(owner|shareholder|share holder|investor|board|chair|non[- ]?exec director)/.test(position)) return 100;

      // 2) Executive Leadership
      if (/(chief executive officer|ceo|managing director|md)/.test(position)) return 95;
      if (/(chief operating officer|coo)/.test(position)) return 90;
      if (/(chief financial officer|cfo)/.test(position)) return 88;
      if (/(chief technology officer|cto|chief information officer|cio)/.test(position)) return 85;
      if (/(chief marketing officer|cmo)/.test(position)) return 82;
      if (/(chief human resources officer|chro|chief people officer|cpo)/.test(position)) return 80;

      // 3) Senior Management
      if (/vice president|vp/.test(position)) return 78;
      if (/director/.test(position)) return 75;
      if (/general manager|gm/.test(position)) return 72;

      // 4) Middle Management
      if (/(department head|head of|department manager)/.test(position)) return 62;
      if (/manager/.test(position)) return 60;

      // 5) Supervisory / Team Leaders
      if (/(supervisor|team lead|team leader|coordinator)/.test(position)) return 45;

      // 6) Operational Level
      if (/(engineer|developer|analyst|specialist|consultant i|staff|employee|technician|operator)/.test(position)) return 30;

      // 7) Support Roles
      if (/(clerk|administrative|admin assistant|receptionist|office|support)/.test(position)) return 20;

      // 8) External Advisory
      if (/(consultant|legal|attorney|lawyer|auditor)/.test(position)) return 65; // varies 50–80

      return 60; // sensible default
    };

    const employee = getEmployeeById(employeeId);
    if (!employee) return 60;

    // Base from hierarchy influence
    let score = getPositionInfluenceScore(employee.position);

    // Add small bonuses for actual promotions if any exist
    const promotionHistoryRaw = localStorage.getItem('promotionHistory');
    if (promotionHistoryRaw) {
      const promotionHistory = JSON.parse(promotionHistoryRaw);
      const employeePromotions = promotionHistory.filter((promo: any) => promo.employeeId === employeeId);
      if (employeePromotions.length > 0) {
        // Light-touch bonus to avoid overpowering hierarchy base
        score += Math.min(15, employeePromotions.length * 5); // up to +15

        // Recency bonus (last 2 years)
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        const recentCount = employeePromotions.filter((p: any) => new Date(p.effectiveDate) >= twoYearsAgo).length;
        if (recentCount > 0) score += Math.min(10, recentCount * 5); // up to +10
      }
    }

    // Minor tenure adjustment if no promotions and mid/low roles
    if (score <= 75) {
      const startDate = new Date(employee.startDate);
      const currentDate = new Date();
      const tenureYears = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (!Number.isNaN(tenureYears) && tenureYears > 1) {
        score += Math.min(5, Math.floor(tenureYears)); // up to +5
      }
    }

    return Math.min(100, Math.max(10, Math.round(score)));
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
    const employees: Employee[] = getAllEmployees();
    if (!employees || employees.length === 0) return [];
    
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
    return getEmployeeByIdFromService(employeeId);
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
