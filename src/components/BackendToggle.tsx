import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuthProvider } from '@/hooks/useAuthProvider';

export function BackendToggle() {
  const { providerType, toggleProvider } = useAuthProvider();
  const [checked, setChecked] = useState(providerType === 'supabase');
  
  useEffect(() => {
    // Update state when provider type changes
    setChecked(providerType === 'supabase');
  }, [providerType]);

  const handleToggle = () => {
    // Call the toggle function from the context
    toggleProvider();
    // Update local state (will be overridden by the useEffect when the page reloads)
    setChecked(!checked);
  };

  return (
    <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50 shadow-sm">
      <Switch 
        id="backend-mode" 
        checked={checked} 
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="backend-mode" className="cursor-pointer text-sm">
        {checked ? 'Using Supabase Backend' : 'Using Mock Backend'}
      </Label>
    </div>
  );
}
