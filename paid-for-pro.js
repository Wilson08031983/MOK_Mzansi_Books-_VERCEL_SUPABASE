// Script to mark the current user as having paid for Pro
import { useSubscription } from './src/hooks/useSubscription';

// Self-executing async function
(async () => {
  try {
    // Get the subscription hook
    const { upgradeToProPlan } = useSubscription();
    
    // Upgrade the current user to Pro plan
    const subscription = await upgradeToProPlan();
    
    console.log('Successfully upgraded to Pro plan!');
    console.log('Subscription details:', subscription);
    
    // Display confirmation
    alert('Congratulations! Your account has been upgraded to Pro plan.');
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
  } catch (error) {
    console.error('Error upgrading to Pro plan:', error);
    alert('Error upgrading to Pro plan. Please try again or contact support.');
  }
})();