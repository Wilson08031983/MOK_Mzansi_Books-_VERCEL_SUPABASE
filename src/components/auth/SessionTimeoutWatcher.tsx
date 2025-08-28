import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSecuritySettings, updateLastActivity, getLastActivity } from '@/services/securityService';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Watches for inactivity and enforces session timeout with a 15s countdown prior to logout
const SessionTimeoutWatcher: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const countdownRef = useRef<number | null>(null);
  const checkRef = useRef<number | null>(null);
  const warnedRef = useRef(false);

  // Activity handler - resets last activity and hides warnings
  const handleActivity = () => {
    updateLastActivity();
    if (showWarning) {
      setShowWarning(false);
      setSecondsLeft(15);
      warnedRef.current = false;
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    }
  };

  // Start 15s countdown before logout
  const startCountdown = () => {
    setSecondsLeft(15);
    setShowWarning(true);
    warnedRef.current = true;
    if (countdownRef.current) {
      window.clearInterval(countdownRef.current);
    }
    countdownRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Time's up → logout to login page
          if (countdownRef.current) {
            window.clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          setShowWarning(false);
          localStorage.removeItem('mokUser');
          // If already on login, do nothing
          if (location.pathname !== '/login') {
            navigate('/login', { replace: true });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    // Register global interaction listeners
    const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));

    // Initialize last activity on mount
    updateLastActivity();

    // Periodic check (every second) for inactivity
    checkRef.current = window.setInterval(() => {
      const settings = getSecuritySettings();
      const timeoutMs = (settings.sessionTimeoutMinutes || 30) * 60 * 1000;
      const last = getLastActivity();
      const elapsed = Date.now() - last;
      const remainingMs = timeoutMs - elapsed;

      if (remainingMs <= 0) {
        // Hard timeout reached without warning (e.g., tab hidden long time) → direct logout
        if (!showWarning) {
          localStorage.removeItem('mokUser');
          if (location.pathname !== '/login') {
            navigate('/login', { replace: true });
          }
        }
        return;
      }

      // If within 15s window and not already warned, start countdown
      if (remainingMs <= 15000 && !warnedRef.current) {
        startCountdown();
      }
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      if (countdownRef.current) window.clearInterval(countdownRef.current);
      if (checkRef.current) window.clearInterval(checkRef.current);
    };
  }, []);

  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session expiring</AlertDialogTitle>
          <AlertDialogDescription>
            No activity detected. You will be redirected to the Login page in {secondsLeft} seconds.
            Interact with the page to stay signed in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleActivity}>Stay signed in</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionTimeoutWatcher;
