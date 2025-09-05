import { useEffect } from 'react';
import { addNotification } from '@/services/notificationService';

const USER_FIRST_VISIT_KEY = 'mokmzansibooks_first_visit';

export const useUserTracking = (user: { email?: string; name?: string } | null) => {
  useEffect(() => {
    if (!user?.email) return;

    const storageKey = `${USER_FIRST_VISIT_KEY}_${user.email}`;
    const hasVisitedBefore = localStorage.getItem(storageKey);
    
    if (!hasVisitedBefore) {
      // Mark as visited
      localStorage.setItem(storageKey, 'true');
      
      // Send welcome email via secure API route
      (async () => {
        try {
          const res = await fetch('/api/emails/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: user.email,
              userName: user.name || 'Valued Customer',
            }),
          });
          if (res.ok) {
            console.log('Welcome email queued for sending');
          } else {
            const data = await res.json().catch(() => ({}));
            console.warn('Failed to queue welcome email', data);
          }
        } catch (err) {
          console.warn('Error calling welcome email API:', err);
        }
      })();

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
