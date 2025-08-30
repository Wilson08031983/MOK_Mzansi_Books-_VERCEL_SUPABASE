import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { birthdayNotificationService } from '@/emails/services/BirthdayNotificationService';

export const useBirthdayNotifications = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<{
    employee: any;
    date: Date;
    daysUntil: number;
  }[]>([]);
  const [todayBirthdays, setTodayBirthdays] = useState<any[]>([]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Check for birthdays and send notifications
  const checkBirthdays = useCallback(async () => {
    setIsChecking(true);
    try {
      // Check for birthdays and send notifications
      const result = await birthdayNotificationService.checkBirthdays();
      
      // Update upcoming birthdays
      const upcoming = birthdayNotificationService.getUpcomingBirthdays(30);
      setUpcomingBirthdays(upcoming);
      
      // Set today's birthdays
      const today = new Date();
      const todaysBdays = upcoming.filter(bday => bday.daysUntil === 0);
      setTodayBirthdays(todaysBdays.map(bday => bday.employee));
      
      // Show toast if there are birthdays today
      if (todaysBdays.length > 0) {
        const names = todaysBdays.map(b => 
          `${b.employee.firstName} ${b.employee.lastName}`
        ).join(', ');
        
        toast.success(
          `🎉 Happy Birthday ${names}!`,
          {
            duration: 10000,
            description: 'Wishing them a wonderful day!',
          }
        );
      }
      
      setLastChecked(new Date());
      return result;
    } catch (error) {
      console.error('Error checking birthdays:', error);
      toast.error('Failed to check for birthdays');
      return { sent: 0, total: 0 };
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Load upcoming birthdays
  const loadUpcomingBirthdays = useCallback(() => {
    try {
      const upcoming = birthdayNotificationService.getUpcomingBirthdays(30);
      setUpcomingBirthdays(upcoming);
      
      // Set today's birthdays
      const todaysBdays = upcoming.filter(bday => bday.daysUntil === 0);
      setTodayBirthdays(todaysBdays.map(bday => bday.employee));
      
      return upcoming;
    } catch (error) {
      console.error('Error loading upcoming birthdays:', error);
      return [];
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadUpcomingBirthdays();
    
    // Check for birthdays on mount and then every hour
    checkBirthdays();
    const intervalId = setInterval(checkBirthdays, 60 * 60 * 1000); // Every hour
    
    return () => clearInterval(intervalId);
  }, [checkBirthdays, loadUpcomingBirthdays]);

  return {
    isChecking,
    upcomingBirthdays,
    todayBirthdays,
    lastChecked,
    checkBirthdays,
    loadUpcomingBirthdays,
  };
};

export default useBirthdayNotifications;
