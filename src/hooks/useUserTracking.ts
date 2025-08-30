import { useEffect } from 'react';
import EmailService from '../emails/services/EmailService';

const USER_FIRST_VISIT_KEY = 'mokmzansibooks_first_visit';

export const useUserTracking = (user: { email?: string; name?: string } | null) => {
  useEffect(() => {
    if (!user?.email) return;

    const hasVisitedBefore = localStorage.getItem(`${USER_FIRST_VISIT_KEY}_${user.email}`);
    
    if (!hasVisitedBefore) {
      // Mark as visited
      localStorage.setItem(`${USER_FIRST_VISIT_KEY}_${user.email}`, 'true');
      
      // Send welcome email
      if (user.email) {
        EmailService.sendWelcomeEmail(
          user.email,
          user.name || 'Valued Customer'
        ).then(success => {
          if (success) {
            console.log('Welcome email queued for sending');
          } else {
            console.warn('Failed to queue welcome email');
          }
        });
      }
    }
  }, [user]);
};

export default useUserTracking;
