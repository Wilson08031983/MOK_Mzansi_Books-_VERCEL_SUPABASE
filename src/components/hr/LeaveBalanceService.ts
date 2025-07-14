import { LeaveRequest, LeaveTypes, LeaveBalance, LeaveBalanceItem } from './LeaveManagementTypes';
import { toast } from 'sonner';
import { calculateBusinessDaysExcludingHolidays } from './LeaveManagementTypes';

// Service for handling leave balance calculations according to South African BCEA regulations
export const LeaveBalanceService = {
  /**
   * Calculate actual working days in a leave period, excluding weekends and public holidays
   */
  calculateLeaveWorkingDays(startDate: string, endDate: string): number {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return calculateBusinessDaysExcludingHolidays(start, end);
    } catch (error) {
      console.error('Error calculating working days:', error);
      return 0;
    }
  },
  
  /**
   * Check if an employee has sufficient leave balance for the request type
   * Returns an object with isValid flag and message explaining why if invalid
   */
  validateLeaveBalance(
    leaveRequest: LeaveRequest, 
    employeeBalance: LeaveBalance
  ): { isValid: boolean; message: string } {
    // Calculate actual business days excluding public holidays
    const actualLeaveDays = this.calculateLeaveWorkingDays(
      leaveRequest.startDate,
      leaveRequest.endDate
    );
    
    if (actualLeaveDays <= 0) {
      return { 
        isValid: false, 
        message: "No working days in this leave period. All requested days are weekends or public holidays."
      };
    }
    
    // Special cases that don't need balance validation
    if (leaveRequest.leaveType === LeaveTypes.Unpaid) {
      return { isValid: true, message: "Unpaid leave doesn't require a balance check." };
    }
    
    if (leaveRequest.leaveType === LeaveTypes.Maternity) {
      // Maternity leave is approved by default (4 months unpaid per BCEA)
      return { isValid: true, message: "Maternity leave approved. Position will be reserved upon return." };
    }
    
    // Calculate employment duration for checks below
    const startDate = new Date(employeeBalance.employmentStartDate || new Date());
    const today = new Date();
    const monthsEmployed = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                          (today.getMonth() - startDate.getMonth());
    
    // Check balance based on leave type
    switch(leaveRequest.leaveType) {
      case LeaveTypes.Annual:
        if (employeeBalance.annual.remaining >= actualLeaveDays) {
          return { isValid: true, message: "Sufficient annual leave balance." };
        } else {
          return { 
            isValid: false, 
            message: `Insufficient annual leave balance. You have ${employeeBalance.annual.remaining} days remaining but requested ${actualLeaveDays} days.`
          };
        }
        
      case LeaveTypes.Sick: {
        // Check if in first 6 months of employment
        if (monthsEmployed <= 6) {
          // First 6 months: 1 day per 26 days worked
          const daysWorked = Math.floor(monthsEmployed * 21.67); // ~21.67 working days per month
          const allowedSickDays = Math.floor(daysWorked / 26);
          const remainingSickDaysInPeriod = Math.max(0, allowedSickDays - employeeBalance.sick.used);
          
          if (remainingSickDaysInPeriod >= actualLeaveDays) {
            return { isValid: true, message: "Sufficient sick leave balance." };
          } else {
            return { 
              isValid: false, 
              message: `Limited sick leave during first 6 months of employment. You have ${remainingSickDaysInPeriod} days available but requested ${actualLeaveDays} days.`
            };
          }
        } else if (employeeBalance.sick.remaining >= actualLeaveDays) {
          return { isValid: true, message: "Sufficient sick leave balance." };
        } else {
          return { 
            isValid: false, 
            message: `Insufficient sick leave balance. You have ${employeeBalance.sick.remaining} days remaining but requested ${actualLeaveDays} days.`
          };
        }
      }
        
      case LeaveTypes.FamilyResponsibility: {
        if (employeeBalance.familyResponsibility.remaining >= actualLeaveDays) {
          return { isValid: true, message: "Sufficient family responsibility leave balance." };
        } else {
          return { 
            isValid: false, 
            message: `Insufficient family responsibility leave balance. You have ${employeeBalance.familyResponsibility.remaining} days remaining but requested ${actualLeaveDays} days.`
          };
        }
      }
        
      case LeaveTypes.Parental: {
        if (employeeBalance.parental && employeeBalance.parental.remaining >= actualLeaveDays) {
          return { isValid: true, message: "Sufficient parental leave balance." };
        } else {
          return { 
            isValid: false, 
            message: `Insufficient parental leave balance. You have ${employeeBalance.parental?.remaining || 0} days remaining but requested ${actualLeaveDays} days.`
          };
        }
      }
        
      case LeaveTypes.Bereavement: {
        // Bereavement is typically deducted from family responsibility leave
        if (employeeBalance.familyResponsibility.remaining >= actualLeaveDays) {
          return { isValid: true, message: "Sufficient family responsibility leave balance for bereavement leave." };
        } else {
          return { 
            isValid: false, 
            message: `Insufficient family responsibility leave balance for bereavement. You have ${employeeBalance.familyResponsibility.remaining} days remaining but requested ${actualLeaveDays} days.`
          };
        }
      }
        
      // For other leave types that may have specific balances
      default: {
        const lowerCaseType = leaveRequest.leaveType.toLowerCase() as keyof LeaveBalance;
        if (employeeBalance[lowerCaseType] && 
            typeof employeeBalance[lowerCaseType] === 'object' &&
            'remaining' in employeeBalance[lowerCaseType] && 
            (employeeBalance[lowerCaseType] as LeaveBalanceItem).remaining >= actualLeaveDays) {
          return { isValid: true, message: `Sufficient ${leaveRequest.leaveType} leave balance.` };
        } else {
          // Default to allowing the leave request as unpaid
          return { 
            isValid: true, 
            message: `No specific balance for ${leaveRequest.leaveType} leave. Will be recorded as unpaid leave.`
          };
        }
      }
    }
  },
  
  /**
   * Update leave balances when a leave request is approved
   * Handles all leave types according to South African BCEA regulations
   */
  updateLeaveBalances(
    leaveRequest: LeaveRequest,
    employeeBalance: LeaveBalance,
    actualLeaveDays: number
  ): LeaveBalance {
    const updatedBalance = { ...employeeBalance };
    let unpaidDaysConverted = 0;
    
    // Apply balance updates based on leave type according to SA leave policy
    switch(leaveRequest.leaveType) {
      case LeaveTypes.Annual: {
        // Annual Leave: 15 working days per year (BCEA standard for 5-day work week)
        if (updatedBalance.annual.remaining >= actualLeaveDays) {
          updatedBalance.annual.used += actualLeaveDays;
          updatedBalance.annual.remaining -= actualLeaveDays;
          toast.success(`Annual leave approved: ${actualLeaveDays} days deducted from balance.`);
        } else if (updatedBalance.annual.remaining > 0) {
          // Partial paid leave + unpaid leave
          unpaidDaysConverted = actualLeaveDays - updatedBalance.annual.remaining;
          const paidDays = updatedBalance.annual.remaining;
          
          updatedBalance.annual.used += paidDays;
          updatedBalance.annual.remaining = 0;
          updatedBalance.unpaid.days += unpaidDaysConverted;
          
          toast.warning(`Insufficient annual leave balance. ${paidDays} day(s) of paid leave and ${unpaidDaysConverted} day(s) of unpaid leave approved.`);
        } else {
          // No annual leave balance, convert to unpaid
          updatedBalance.unpaid.days += actualLeaveDays;
          toast.warning(`No annual leave balance remaining. Approved as ${actualLeaveDays} day(s) of unpaid leave.`);
        }
        break;
      }
        
      case LeaveTypes.Sick: {
        // Sick Leave: 30 days per 3-year cycle (BCEA standard)
        // First 6 months: 1 day per 26 days worked limitation
        
        // Calculate employment duration in months
        const startDate = new Date(updatedBalance.employmentStartDate || new Date());
        const today = new Date();
        const monthsEmployed = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                              (today.getMonth() - startDate.getMonth());
        
        if (monthsEmployed <= 6) {
          // First 6 months: limit sick leave to 1 day per 26 days worked
          const daysWorked = Math.floor(monthsEmployed * 21.67); // ~21.67 working days per month
          const allowedSickDays = Math.floor(daysWorked / 26);
          const remainingSickDaysInPeriod = Math.max(0, allowedSickDays - updatedBalance.sick.used);
          
          if (remainingSickDaysInPeriod >= actualLeaveDays) {
            updatedBalance.sick.used += actualLeaveDays;
            updatedBalance.sick.remaining -= actualLeaveDays;
            toast.success(`Sick leave approved: ${actualLeaveDays} day(s) deducted from balance.`);
          } else if (remainingSickDaysInPeriod > 0) {
            unpaidDaysConverted = actualLeaveDays - remainingSickDaysInPeriod;
            updatedBalance.sick.used += remainingSickDaysInPeriod;
            updatedBalance.sick.remaining -= remainingSickDaysInPeriod;
            updatedBalance.unpaid.days += unpaidDaysConverted;
            toast.warning(`Limited sick leave during first 6 months: ${remainingSickDaysInPeriod} paid sick day(s) and ${unpaidDaysConverted} unpaid day(s).`);
          } else {
            updatedBalance.unpaid.days += actualLeaveDays;
            toast.warning(`Sick leave allowance for first 6 months exhausted. Approved as ${actualLeaveDays} day(s) of unpaid leave.`);
          }
        } else {
          // After 6 months: use standard sick leave allocation
          if (updatedBalance.sick.remaining >= actualLeaveDays) {
            updatedBalance.sick.used += actualLeaveDays;
            updatedBalance.sick.remaining -= actualLeaveDays;
            toast.success(`Sick leave approved: ${actualLeaveDays} day(s) deducted from balance.`);
          } else if (updatedBalance.sick.remaining > 0) {
            unpaidDaysConverted = actualLeaveDays - updatedBalance.sick.remaining;
            updatedBalance.sick.used += updatedBalance.sick.remaining;
            updatedBalance.sick.remaining = 0;
            updatedBalance.unpaid.days += unpaidDaysConverted;
            toast.warning(`Partial sick leave approved with ${unpaidDaysConverted} day(s) as unpaid leave.`);
          } else {
            updatedBalance.unpaid.days += actualLeaveDays;
            toast.warning(`No sick leave balance remaining. Approved as ${actualLeaveDays} day(s) of unpaid leave.`);
          }
        }
        break;
      }
        
      case LeaveTypes.FamilyResponsibility: {
        // Family Responsibility Leave: 3 days per year (BCEA standard)
        if (updatedBalance.familyResponsibility.remaining >= actualLeaveDays) {
          updatedBalance.familyResponsibility.used += actualLeaveDays;
          updatedBalance.familyResponsibility.remaining -= actualLeaveDays;
          toast.success(`Family responsibility leave approved: ${actualLeaveDays} day(s) deducted from balance.`);
        } else if (updatedBalance.familyResponsibility.remaining > 0) {
          // Partial approval - use remaining family responsibility then convert rest to unpaid
          const familyDays = updatedBalance.familyResponsibility.remaining;
          const unpaidDays = actualLeaveDays - familyDays;
          
          // Update family responsibility balance
          updatedBalance.familyResponsibility.used += familyDays;
          updatedBalance.familyResponsibility.remaining = 0;
          
          // Add rest to unpaid leave
          updatedBalance.unpaid.days += unpaidDays;
          
          toast.warning(`Partial family responsibility leave: ${familyDays} day(s) from family leave and ${unpaidDays} day(s) as unpaid leave.`);
        } else {
          // No family responsibility leave balance, convert to unpaid
          updatedBalance.unpaid.days += actualLeaveDays;
          toast.warning(`No family responsibility leave balance remaining. Approved as ${actualLeaveDays} day(s) of unpaid leave.`);
        }
        break;
      }
        
      case LeaveTypes.Maternity: {
        // Maternity Leave: 4 months (unpaid per BCEA unless UIF)
        if (updatedBalance.maternity.remaining >= actualLeaveDays) {
          updatedBalance.maternity.used += actualLeaveDays;
          updatedBalance.maternity.remaining -= actualLeaveDays;
          
          // Set maternity leave flag and job reservation
          updatedBalance.onMaternityLeave = true;
          updatedBalance.jobReserved = true;
          
          toast.success(`Maternity leave approved: ${actualLeaveDays} day(s). Job reserved during leave period.`);
        } else {
          toast.error(`Insufficient maternity leave balance.`);
          return updatedBalance;
        }
        break;
      }
        
      case LeaveTypes.Parental: {
        // Parental Leave: 10 days per year per BCEA
        if (updatedBalance.parental && updatedBalance.parental.remaining >= actualLeaveDays) {
          updatedBalance.parental.used += actualLeaveDays;
          updatedBalance.parental.remaining -= actualLeaveDays;
          toast.success(`Parental leave approved: ${actualLeaveDays} day(s).`);
        } else {
          toast.error(`Insufficient parental leave balance.`);
          return updatedBalance;
        }
        break;
      }
        
      case LeaveTypes.Bereavement: {
        // Bereavement is typically deducted from Family Responsibility leave per SA practice
        if (updatedBalance.familyResponsibility.remaining >= actualLeaveDays) {
          updatedBalance.familyResponsibility.used += actualLeaveDays;
          updatedBalance.familyResponsibility.remaining -= actualLeaveDays;
          toast.success(`Bereavement leave approved: ${actualLeaveDays} day(s) deducted from family responsibility balance.`);
        } else if (updatedBalance.familyResponsibility.remaining > 0) {
          unpaidDaysConverted = actualLeaveDays - updatedBalance.familyResponsibility.remaining;
          updatedBalance.familyResponsibility.used += updatedBalance.familyResponsibility.remaining;
          updatedBalance.familyResponsibility.remaining = 0;
          updatedBalance.unpaid.days += unpaidDaysConverted;
          toast.warning(`Partial bereavement leave approved with ${unpaidDaysConverted} day(s) as unpaid leave.`);
        } else {
          updatedBalance.unpaid.days += actualLeaveDays;
          toast.warning(`No family responsibility leave balance remaining. Bereavement approved as ${actualLeaveDays} day(s) of unpaid leave.`);
        }
        break;
      }
        
      // Study, Religious and other leave types are typically optional and unpaid
      case LeaveTypes.Religious:
      case LeaveTypes.Study: {
        // Just record these days - they are typically unpaid or company-specific policies
        const lowerCaseType = leaveRequest.leaveType.toLowerCase() as keyof LeaveBalance;
        if (updatedBalance[lowerCaseType] && 
            typeof updatedBalance[lowerCaseType] === 'object' &&
            'remaining' in updatedBalance[lowerCaseType] &&
            (updatedBalance[lowerCaseType] as LeaveBalanceItem).remaining >= actualLeaveDays) {
          // Cast to LeaveBalanceItem to resolve type errors
          const balanceItem = updatedBalance[lowerCaseType] as LeaveBalanceItem;
          balanceItem.used += actualLeaveDays;
          balanceItem.remaining -= actualLeaveDays;
          toast.success(`${leaveRequest.leaveType} leave approved: ${actualLeaveDays} day(s) recorded.`);
        } else {
          // Record as unpaid
          updatedBalance.unpaid.days += actualLeaveDays;
          toast.info(`${actualLeaveDays} day(s) recorded as unpaid ${leaveRequest.leaveType} leave.`);
        }
        break;
      }
        
      case LeaveTypes.Unpaid: {
        // Just record unpaid days
        updatedBalance.unpaid.days += actualLeaveDays;
        toast.info(`${actualLeaveDays} day(s) of unpaid leave recorded.`);
        break;
      }
        
      default: {
        // For any other leave types, just add to the unpaid leave count
        updatedBalance.unpaid.days += actualLeaveDays;
        toast.info(`${actualLeaveDays} day(s) recorded as ${leaveRequest.leaveType}.`);
        break;
      }
    }
    
    return updatedBalance;
  },
  
  /**
   * Restore leave balance when a leave request is rejected or deleted
   */
  restoreLeaveBalance(
    leaveRequest: LeaveRequest,
    employeeBalance: LeaveBalance
  ): LeaveBalance {
    // Only restore balance if the request was previously approved
    if (leaveRequest.status !== 'approved') {
      return employeeBalance;
    }
    
    const actualLeaveDays = this.calculateLeaveWorkingDays(
      leaveRequest.startDate,
      leaveRequest.endDate
    );
    
    if (actualLeaveDays <= 0) {
      return employeeBalance;
    }
    
    const updatedBalance = { ...employeeBalance };
    
    // Restore balance based on leave type
    switch(leaveRequest.leaveType) {
      case LeaveTypes.Annual:
        updatedBalance.annual.used = Math.max(0, updatedBalance.annual.used - actualLeaveDays);
        updatedBalance.annual.remaining += actualLeaveDays;
        toast.info(`${actualLeaveDays} day(s) restored to annual leave balance.`);
        break;
        
      case LeaveTypes.Sick:
        updatedBalance.sick.used = Math.max(0, updatedBalance.sick.used - actualLeaveDays);
        updatedBalance.sick.remaining += actualLeaveDays;
        toast.info(`${actualLeaveDays} day(s) restored to sick leave balance.`);
        break;
        
      case LeaveTypes.FamilyResponsibility:
      case LeaveTypes.Bereavement:
        updatedBalance.familyResponsibility.used = Math.max(0, updatedBalance.familyResponsibility.used - actualLeaveDays);
        updatedBalance.familyResponsibility.remaining += actualLeaveDays;
        toast.info(`${actualLeaveDays} day(s) restored to family responsibility leave balance.`);
        break;
        
      case LeaveTypes.Parental:
        if (updatedBalance.parental) {
          updatedBalance.parental.used = Math.max(0, updatedBalance.parental.used - actualLeaveDays);
          updatedBalance.parental.remaining += actualLeaveDays;
          toast.info(`${actualLeaveDays} day(s) restored to parental leave balance.`);
        }
        break;
        
      case LeaveTypes.Maternity:
        updatedBalance.onMaternityLeave = false;
        toast.info(`Maternity leave canceled. Employment status restored.`);
        break;
        
      case LeaveTypes.Unpaid:
        updatedBalance.unpaid.days = Math.max(0, updatedBalance.unpaid.days - actualLeaveDays);
        toast.info(`${actualLeaveDays} day(s) of unpaid leave removed from record.`);
        break;
        
      default: {
        // For other leave types, check if they have specific balances
        const lowerCaseType = leaveRequest.leaveType.toLowerCase() as keyof LeaveBalance;
        if (updatedBalance[lowerCaseType] && 
            typeof updatedBalance[lowerCaseType] === 'object' &&
            'remaining' in updatedBalance[lowerCaseType]) {
          // Cast to LeaveBalanceItem to resolve type errors
          const balanceItem = updatedBalance[lowerCaseType] as LeaveBalanceItem;
          balanceItem.used = Math.max(0, balanceItem.used - actualLeaveDays);
          balanceItem.remaining += actualLeaveDays;
          toast.info(`${actualLeaveDays} day(s) restored to ${leaveRequest.leaveType} balance.`);
        } else {
          // If no specific balance, it was likely recorded as unpaid
          updatedBalance.unpaid.days = Math.max(0, updatedBalance.unpaid.days - actualLeaveDays);
          toast.info(`${actualLeaveDays} day(s) of leave removed from record.`);
        }
        break;
      }
    }
    
    return updatedBalance;
  },
  
  /**
   * Accrues annual leave at a rate of 1.25 days per month
   * as per SA BCEA regulations for a 5-day work week
   */
  accrueAnnualLeave(employeeBalance: LeaveBalance): LeaveBalance {
    const updatedBalance = { ...employeeBalance };
    const today = new Date();
    
    // Use employment start date as reference if no other date available
    const leaveAnniversary = new Date(updatedBalance.employmentStartDate || new Date());
    const lastAccrualDate = new Date(updatedBalance.lastLeaveAccrualDate || updatedBalance.employmentStartDate || new Date());
    
    // Calculate months since last accrual
    const monthsSinceAccrual = (today.getFullYear() - lastAccrualDate.getFullYear()) * 12 + 
                              (today.getMonth() - lastAccrualDate.getMonth());
    
    // Only accrue if at least one month has passed
    if (monthsSinceAccrual >= 1) {
      // Standard accrual is 1.25 days per month (15 days per year)
      const newAccruedDays = monthsSinceAccrual * 1.25;
      
      // Add to balance, but don't exceed maximum annual entitlement
      const maxAnnualEntitlement = 15; // 15 working days for a 5-day work week
      const newRemaining = Math.min(
        updatedBalance.annual.remaining + newAccruedDays,
        updatedBalance.annual.total // Cannot exceed total entitlement
      );
      
      // Update accrued amount
      updatedBalance.annual.remaining = newRemaining;
      updatedBalance.annual.accrued = updatedBalance.annual.total;
      updatedBalance.lastLeaveAccrualDate = today.toISOString().split('T')[0];
      
      toast.info(`${newAccruedDays.toFixed(1)} days of annual leave accrued.`);
    }
    
    return updatedBalance;
  }
};
