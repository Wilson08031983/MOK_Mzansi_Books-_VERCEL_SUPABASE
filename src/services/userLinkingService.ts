/**
 * User Linking Service
 * 
 * This service manages cross-table synchronization and linking between:
 * - Company Details (Primary Company User)
 * - HR Management > Employee Management Table
 * - Settings > Administrative Users Table
 * - Team Management > Team Members Table
 * 
 * Implements security constraints and presidency user protection.
 */

import { getAllTeamMembers, addNewUser, deleteUser, AuthUser } from './localAuthService';
import { getAllEmployees, addEmployee, updateEmployee, deleteEmployee, Employee, EmployeeFormData } from './employeeService';
import { ADMIN_ROLES, isAdminRole } from './permissionService';
import { companyEmployeeSyncService } from './companyEmployeeSyncService';

export interface LinkedUser {
  id: string;
  email: string;
  fullName: string;
  position: string;
  isAdmin: boolean;
  isPrimaryUser: boolean;
  source: 'company' | 'team' | 'hr';
  linkedTables: {
    teamMembers: boolean;
    employees: boolean;
    adminUsers: boolean;
  };
}

export interface UserLinkingStatus {
  totalUsers: number;
  linkedUsers: number;
  unlinkedUsers: LinkedUser[];
  primaryUser: LinkedUser | null;
  adminUsers: LinkedUser[];
  staffUsers: LinkedUser[];
}

class UserLinkingService {
  private readonly PRIMARY_USER_EMAIL = 'admin@mokmzansibooks.com';
  
  /**
   * Get the primary company user (presidency user)
   */
  getPrimaryUser(): LinkedUser | null {
    try {
      const companyDetails = companyEmployeeSyncService.getCompanyDetails();
      if (!companyDetails) return null;

      const teamMembers = getAllTeamMembers();
      const primaryTeamMember = teamMembers.find(member => 
        member.email.toLowerCase() === this.PRIMARY_USER_EMAIL.toLowerCase()
      );

      if (!primaryTeamMember) return null;

      return {
        id: primaryTeamMember.id,
        email: primaryTeamMember.email,
        fullName: `${companyDetails.ownerName} ${companyDetails.ownerSurname}`,
        position: companyDetails.ownerPosition || 'CEO',
        isAdmin: true,
        isPrimaryUser: true,
        source: 'company',
        linkedTables: this.checkUserLinking(primaryTeamMember.id)
      };
    } catch (error) {
      console.error('Error getting primary user:', error);
      return null;
    }
  }

  /**
   * Check which tables a user is linked to
   */
  private checkUserLinking(userId: string): { teamMembers: boolean; employees: boolean; adminUsers: boolean } {
    const teamMembers = getAllTeamMembers();
    const employees = getAllEmployees();
    
    const inTeamMembers = teamMembers.some(member => member.id === userId);
    const inEmployees = employees.some(emp => emp.id === userId);
    const inAdminUsers = inTeamMembers && teamMembers.find(member => member.id === userId && isAdminRole(member.role || ''));

    return {
      teamMembers: inTeamMembers,
      employees: inEmployees,
      adminUsers: !!inAdminUsers
    };
  }

  /**
   * Get all linked users across all tables
   */
  getAllLinkedUsers(): LinkedUser[] {
    try {
      const teamMembers = getAllTeamMembers();
      const employees = getAllEmployees();
      const linkedUsers: LinkedUser[] = [];

      // Process team members
      teamMembers.forEach(member => {
        const employee = employees.find(emp => emp.email?.toLowerCase() === member.email.toLowerCase());
        
        linkedUsers.push({
          id: member.id,
          email: member.email,
          fullName: member.fullName || member.email.split('@')[0],
          position: member.role || 'Staff Member',
          isAdmin: isAdminRole(member.role || ''),
          isPrimaryUser: member.email.toLowerCase() === this.PRIMARY_USER_EMAIL.toLowerCase(),
          source: 'team',
          linkedTables: this.checkUserLinking(member.id)
        });
      });

      // Process employees not in team members
      employees.forEach(employee => {
        const existingUser = linkedUsers.find(user => 
          user.email.toLowerCase() === employee.email?.toLowerCase()
        );
        
        if (!existingUser && employee.email) {
          linkedUsers.push({
            id: employee.id,
            email: employee.email,
            fullName: `${employee.firstName || ''} ${employee.surname || ''}`.trim() || employee.email.split('@')[0],
            position: employee.position || 'Staff Member',
            isAdmin: isAdminRole(employee.position || ''),
            isPrimaryUser: false,
            source: 'hr',
            linkedTables: this.checkUserLinking(employee.id)
          });
        }
      });

      return linkedUsers;
    } catch (error) {
      console.error('Error getting all linked users:', error);
      return [];
    }
  }

  /**
   * Get user linking status overview
   */
  getUserLinkingStatus(): UserLinkingStatus {
    try {
      const allUsers = this.getAllLinkedUsers();
      const primaryUser = this.getPrimaryUser();
      
      const linkedUsers = allUsers.filter(user => 
        user.linkedTables.teamMembers && user.linkedTables.employees
      );
      
      const unlinkedUsers = allUsers.filter(user => 
        !user.linkedTables.teamMembers || !user.linkedTables.employees
      );

      const adminUsers = allUsers.filter(user => user.isAdmin);
      const staffUsers = allUsers.filter(user => !user.isAdmin);

      return {
        totalUsers: allUsers.length,
        linkedUsers: linkedUsers.length,
        unlinkedUsers,
        primaryUser,
        adminUsers,
        staffUsers
      };
    } catch (error) {
      console.error('Error getting user linking status:', error);
      return {
        totalUsers: 0,
        linkedUsers: 0,
        unlinkedUsers: [],
        primaryUser: null,
        adminUsers: [],
        staffUsers: []
      };
    }
  }

  /**
   * Link a team member to HR employees table
   */
  async linkTeamMemberToEmployee(teamMemberId: string): Promise<boolean> {
    try {
      const teamMembers = getAllTeamMembers();
      const teamMember = teamMembers.find(member => member.id === teamMemberId);
      
      if (!teamMember) {
        console.error('Team member not found:', teamMemberId);
        return false;
      }

      const employees = getAllEmployees();
      const existingEmployee = employees.find(emp => 
        emp.email?.toLowerCase() === teamMember.email.toLowerCase()
      );

      if (existingEmployee) {
        // Update existing employee with team member data
        const updatedEmployee: Employee = {
          ...existingEmployee,
          position: teamMember.role || existingEmployee.position,
          status: 'active'
        };
        
        const result = updateEmployee(updatedEmployee.id, updatedEmployee);
        return result !== null;
      } else {
        // Create new employee from team member
        const newEmployeeData: EmployeeFormData = {
          firstName: teamMember.fullName?.split(' ')[0] || teamMember.email.split('@')[0],
          surname: teamMember.fullName?.split(' ').slice(1).join(' ') || '',
          contactNumber: '',
          email: teamMember.email,
          idType: 'ID Number',
          idValue: `TEMP${Date.now()}`,
          dateOfBirth: '1990-01-01',
          employmentType: 'Full Time',
          startDate: new Date().toISOString().split('T')[0],
          paymentCycle: 'Monthly',
          salary: 0,
          department: isAdminRole(teamMember.role || '') ? 'Administration' : 'General',
          position: teamMember.role || 'Staff Member',
          location: 'Main Office',
          addressLine1: '',
          addressLine2: '',
          addressLine3: '',
          addressLine4: '',
          kinRelationship: '',
          kinName: '',
          kinSurname: '',
          kinContactNumber: '',
          bankName: '',
          accountHolderName: '',
          accountNumber: '',
          branchCode: '',
          dayShift: true,
          nightShift: false,
          flexibleShift: false
        };
        
        const newEmployee = addEmployee(newEmployeeData);
        return true;
      }
    } catch (error) {
      console.error('Error linking team member to employee:', error);
      return false;
    }
  }

  /**
   * Sync primary company user across all tables
   */
  async syncPrimaryUser(): Promise<boolean> {
    try {
      const companyDetails = companyEmployeeSyncService.getCompanyDetails();
      if (!companyDetails) {
        console.error('Company details not found');
        return false;
      }

      // Ensure primary user exists in team members
      const teamMembers = getAllTeamMembers();
      let primaryTeamMember = teamMembers.find(member => 
        member.email.toLowerCase() === this.PRIMARY_USER_EMAIL.toLowerCase()
      );

      if (!primaryTeamMember) {
        // Create primary user in team members
        const newPrimaryUser: AuthUser = {
          id: `primary-${Date.now()}`,
          email: this.PRIMARY_USER_EMAIL,
          fullName: `${companyDetails.ownerName} ${companyDetails.ownerSurname}`,
          role: (companyDetails.ownerPosition as any) || 'CEO'
        };
        
        const result = addNewUser(newPrimaryUser.email, 'admin123', newPrimaryUser.role);
        const success = result.success;
        if (!success) {
          console.error('Failed to create primary user in team members');
          return false;
        }
        
        // Get the created user from team members
        const teamMembers = getAllTeamMembers();
        primaryTeamMember = teamMembers.find(member => 
          member.email.toLowerCase() === this.PRIMARY_USER_EMAIL.toLowerCase()
        );
      }

      // Link to employees table
      const linkSuccess = await this.linkTeamMemberToEmployee(primaryTeamMember.id);
      if (!linkSuccess) {
        console.error('Failed to link primary user to employees');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error syncing primary user:', error);
      return false;
    }
  }

  /**
   * Handle team invitation acceptance workflow
   */
  async handleInvitationAcceptance(invitationData: {
    email: string;
    fullName: string;
    position: string;
  }): Promise<boolean> {
    try {
      const { email, fullName, position } = invitationData;
      
      // 1. Add to Team Members table (should already exist from invitation)
      const teamMembers = getAllTeamMembers();
      const teamMember = teamMembers.find(member => 
        member.email.toLowerCase() === email.toLowerCase()
      );
      
      if (!teamMember) {
        console.error('Team member not found for invitation acceptance:', email);
        return false;
      }

      // 2. Link to HR Management > Employee Management Table
      const linkSuccess = await this.linkTeamMemberToEmployee(teamMember.id);
      if (!linkSuccess) {
        console.error('Failed to link team member to employees during invitation acceptance');
        return false;
      }

      // 3. If Admin User, ensure they're in Administrative Users Table (handled by existing logic)
      // Admin users are automatically included in Administrative Users Table via isAdminRole check
      
      return true;
    } catch (error) {
      console.error('Error handling invitation acceptance:', error);
      return false;
    }
  }

  /**
   * Check if user can be deleted (presidency user protection)
   */
  canDeleteUser(userId: string): { canDelete: boolean; reason?: string } {
    try {
      const primaryUser = this.getPrimaryUser();
      
      if (primaryUser && primaryUser.id === userId) {
        return {
          canDelete: false,
          reason: 'Cannot delete primary company user (presidency user). This user represents the company owner/representative and is protected from deletion.'
        };
      }

      return { canDelete: true };
    } catch (error) {
      console.error('Error checking if user can be deleted:', error);
      return {
        canDelete: false,
        reason: 'Error occurred while checking user deletion permissions.'
      };
    }
  }

  /**
   * Check if user can be edited (presidency user protection)
   */
  canEditUser(userId: string): { canEdit: boolean; reason?: string } {
    try {
      const primaryUser = this.getPrimaryUser();
      
      if (primaryUser && primaryUser.id === userId) {
        return {
          canEdit: false,
          reason: 'Cannot edit primary company user from this interface. Please use Company Details page to modify the primary user information.'
        };
      }

      return { canEdit: true };
    } catch (error) {
      console.error('Error checking if user can be edited:', error);
      return {
        canEdit: false,
        reason: 'Error occurred while checking user edit permissions.'
      };
    }
  }

  /**
   * Sync all unlinked users
   */
  async syncAllUsers(): Promise<{ success: boolean; syncedCount: number; errors: string[] }> {
    try {
      const status = this.getUserLinkingStatus();
      const errors: string[] = [];
      let syncedCount = 0;

      // Sync primary user first
      const primarySyncSuccess = await this.syncPrimaryUser();
      if (primarySyncSuccess) {
        syncedCount++;
      } else {
        errors.push('Failed to sync primary user');
      }

      // Sync unlinked team members
      for (const user of status.unlinkedUsers) {
        if (user.source === 'team' && !user.linkedTables.employees) {
          const linkSuccess = await this.linkTeamMemberToEmployee(user.id);
          if (linkSuccess) {
            syncedCount++;
          } else {
            errors.push(`Failed to link team member: ${user.email}`);
          }
        }
      }

      return {
        success: errors.length === 0,
        syncedCount,
        errors
      };
    } catch (error) {
      console.error('Error syncing all users:', error);
      return {
        success: false,
        syncedCount: 0,
        errors: ['Unexpected error occurred during sync']
      };
    }
  }
}

// Export singleton instance
export const userLinkingService = new UserLinkingService();

// Export types and service
export default userLinkingService;