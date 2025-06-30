import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const AuthDebug = () => {
  interface AuthDebugState {
  userCredentials?: unknown;
  userCredentialsError?: string;
  currentUser?: unknown;
  currentUserError?: string;
  allAuthItems?: Record<string, string | null>;
}

const [authState, setAuthState] = useState<AuthDebugState>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check all auth-related local storage items
    const checkAuthState = () => {
      const state: AuthDebugState = {};
      
      // Check user credentials
      try {
        const userCredentials = localStorage.getItem('userCredentials');
        state.userCredentials = userCredentials ? JSON.parse(userCredentials) : 'Not found';
      } catch (e) {
        state.userCredentialsError = 'Error parsing userCredentials';
      }
      
      // Check current user
      try {
        const mokUser = localStorage.getItem('mokUser');
        state.currentUser = mokUser ? JSON.parse(mokUser) : 'Not logged in';
      } catch (e) {
        state.currentUserError = 'Error parsing current user';
      }
      
      // Check any other auth-related items
      state.allAuthItems = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('auth') || key.includes('user') || key.includes('token'))) {
          try {
            state.allAuthItems[key] = localStorage.getItem(key);
          } catch (e) {
            state.allAuthItems[key] = 'Error reading item';
          }
        }
      }
      
      setAuthState(state);
    };
    
    checkAuthState();
  }, []);
  
  const handleResetAuth = () => {
    // Clear all auth-related items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key.includes('user') || key.includes('token'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    window.location.reload();
  };
  
  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to clear ALL localStorage data? This will log you out and remove all app data.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sf-pro">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Auth Debug</h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">User Credentials:</h3>
                  <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-auto">
                    {JSON.stringify(authState.userCredentials || {}, null, 2)}
                  </pre>
                  {authState.userCredentialsError && (
                    <p className="text-red-500 text-sm mt-1">{authState.userCredentialsError}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Current User:</h3>
                  <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-auto">
                    {JSON.stringify(authState.currentUser || {}, null, 2)}
                  </pre>
                  {authState.currentUserError && (
                    <p className="text-red-500 text-sm mt-1">{authState.currentUserError}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>All Auth-Related LocalStorage Items</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-auto max-h-96">
                {JSON.stringify(authState.allAuthItems || {}, null, 2)}
              </pre>
            </CardContent>
          </Card>
          
          <div className="flex space-x-4">
            <Button 
              variant="destructive" 
              onClick={handleResetAuth}
              className="bg-red-600 hover:bg-red-700"
            >
              Reset Auth State
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleResetAll}
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              Clear All LocalStorage
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="ml-auto"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;
