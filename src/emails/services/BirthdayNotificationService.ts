import { renderToStaticMarkup } from 'react-dom/server';
import { BirthdayEmail } from '../templates/BirthdayEmail';
import { emailConfig } from '../config/emailConfig';

// Local storage keys
const BIRTHDAY_NOTIFICATIONS_KEY = 'birthdayNotifications';
const EMPLOYEES_KEY = 'employees';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  position?: string;
  department?: string;
}

interface BirthdayNotification {
  employeeId: string;
  date: string;
  year: number;
  sent: boolean;
  sentAt?: string;
}

class BirthdayNotificationService {
  private companyName: string;
  private senderName: string;
  private baseUrl: string;

  constructor() {
    this.companyName = emailConfig.company.name;
    this.senderName = emailConfig.sender.name;
    this.baseUrl = window.location.origin;
  }

  // Get all employees from localStorage
  private getEmployees(): Employee[] {
    try {
      const employees = localStorage.getItem(EMPLOYEES_KEY);
      return employees ? JSON.parse(employees) : [];
    } catch (error) {
      console.error('Error loading employees:', error);
      return [];
    }
  }

  // Get birthday notifications from localStorage
  private getNotifications(): BirthdayNotification[] {
    try {
      const notifications = localStorage.getItem(BIRTHDAY_NOTIFICATIONS_KEY);
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('Error loading birthday notifications:', error);
      return [];
    }
  }

  // Save birthday notifications to localStorage
  private saveNotifications(notifications: BirthdayNotification[]): void {
    try {
      localStorage.setItem(BIRTHDAY_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving birthday notifications:', error);
    }
  }

  // Check if today is an employee's birthday
  private isBirthdayToday(dateOfBirth?: string): { isBirthday: boolean; age?: number } {
    if (!dateOfBirth) return { isBirthday: false };
    
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      
      // Check if the date is valid
      if (isNaN(birthDate.getTime())) {
        return { isBirthday: false };
      }
      
      const isSameDay = birthDate.getDate() === today.getDate();
      const isSameMonth = birthDate.getMonth() === today.getMonth();
      
      if (isSameDay && isSameMonth) {
        const age = today.getFullYear() - birthDate.getFullYear();
        return { isBirthday: true, age };
      }
      
      return { isBirthday: false };
    } catch (error) {
      console.error('Error checking birthday:', error);
      return { isBirthday: false };
    }
  }

  // Check if notification was already sent this year
  private wasNotifiedThisYear(employeeId: string, year: number): boolean {
    const notifications = this.getNotifications();
    return notifications.some(
      (n) => n.employeeId === employeeId && n.year === year && n.sent
    );
  }

  // Mark notification as sent
  private markAsSent(employeeId: string, year: number): void {
    const notifications = this.getNotifications();
    const existingIndex = notifications.findIndex(
      (n) => n.employeeId === employeeId && n.year === year
    );

    const newNotification: BirthdayNotification = {
      employeeId,
      date: new Date().toISOString(),
      year,
      sent: true,
      sentAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      notifications[existingIndex] = newNotification;
    } else {
      notifications.push(newNotification);
    }

    this.saveNotifications(notifications);
  }

  // Send birthday email (in a real app, this would send an actual email)
  private async sendBirthdayEmail(employee: Employee, age?: number): Promise<boolean> {
    try {
      const emailContent = renderToStaticMarkup(
        React.createElement(BirthdayEmail, {
          employeeName: `${employee.firstName} ${employee.lastName}`,
          age,
          companyName: this.companyName,
          senderName: this.senderName,
        })
      );

      // In a real implementation, you would send the email here
      console.log('Sending birthday email to:', employee.email);
      console.log('Email content:', emailContent);

      // For now, we'll just log it
      return true;
    } catch (error) {
      console.error('Error sending birthday email:', error);
      return false;
    }
  }

  // Check for birthdays and send notifications
  public async checkBirthdays(): Promise<{ sent: number; total: number }> {
    const employees = this.getEmployees();
    const today = new Date();
    const year = today.getFullYear();
    let sentCount = 0;
    let totalBirthdays = 0;

    for (const employee of employees) {
      if (!employee.dateOfBirth) continue;

      const { isBirthday, age } = this.isBirthdayToday(employee.dateOfBirth);
      
      if (isBirthday) {
        totalBirthdays++;
        
        // Check if we've already sent a notification this year
        if (!this.wasNotifiedThisYear(employee.id, year)) {
          const success = await this.sendBirthdayEmail(employee, age);
          
          if (success) {
            this.markAsSent(employee.id, year);
            sentCount++;
          }
        }
      }
    }

    return { sent: sentCount, total: totalBirthdays };
  }

  // Get upcoming birthdays (next 30 days)
  public getUpcomingBirthdays(daysAhead: number = 30): { employee: Employee; date: Date; daysUntil: number }[] {
    const employees = this.getEmployees();
    const today = new Date();
    const upcoming: { employee: Employee; date: Date; daysUntil: number }[] = [];
    
    for (const employee of employees) {
      if (!employee.dateOfBirth) continue;
      
      const birthDate = new Date(employee.dateOfBirth);
      if (isNaN(birthDate.getTime())) continue;
      
      // Set the year to the current year for comparison
      const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      
      // If the birthday has already passed this year, set it to next year
      if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }
      
      // Calculate days until birthday
      const timeDiff = nextBirthday.getTime() - today.getTime();
      const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (daysUntil <= daysAhead) {
        upcoming.push({
          employee,
          date: nextBirthday,
          daysUntil,
        });
      }
    }
    
    // Sort by days until birthday
    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
  }
}

// Create a singleton instance
export const birthdayNotificationService = new BirthdayNotificationService();

export default BirthdayNotificationService;
