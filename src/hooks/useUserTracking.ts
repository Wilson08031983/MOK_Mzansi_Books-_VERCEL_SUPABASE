import { useEffect } from 'react';
import EmailService from '../emails/services/EmailService';
import { addNotification } from '@/services/notificationService';

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

      // Add a welcome in-app notification
      try {
        addNotification({
          title: 'Welcome to MOK Mzansi Books',
          message: 'Thanks for joining! Explore your dashboard, create your first invoice or quotation, and set up your company details in Settings.',
          type: 'system',
        });
      } catch (e) {
        console.warn('Failed to add welcome notification:', e);
      }
    }
  }, [user]);
};

export default useUserTracking;
