
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocalizationProvider } from "@/contexts/LocalizationContext";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProUpgradePage from './pages/ProUpgrade';
import { AuthProviderSelector } from "@/hooks/useAuthProvider";
import { ensureWilsonHasCEOAccess, initializeDefaultUsers, updatePrimaryUserInTeamMembers } from "@/services/localAuthService";
import { teamEmployeeSyncService } from "@/services/teamEmployeeSyncService";
import { companyEmployeeSyncService } from "@/services/companyEmployeeSyncService";
import { useProjectAttendanceSync } from "@/hooks/useProjectAttendanceSync";
import AccessGuard from "@/components/AccessGuard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { safeExecute } from "@/utils/safeAccess";
import { setupGlobalErrorHandlers } from "@/utils/crashPrevention";
import AuditProvider from "@/components/common/AuditProvider";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Contact from "./pages/Contact";
import ContactSales from "./pages/ContactSales";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Demo from "./pages/Demo";
import ThankYou from "./pages/ThankYou";
import Features from "./pages/Features";
import Integrations from "./pages/Integrations";
import AcceptInvitation from "./pages/AcceptInvitation";
import DisciplinaryTest from "./components/debug/DisciplinaryTest";
import InvitedSignup from "./pages/InvitedSignup";
import Dashboard from "./pages/Dashboard";
import Quotations from "./pages/Quotations";
import QuotationDetail from "./pages/QuotationDetail";
import Clients from "./pages/Clients";
import Company from "./pages/Company";
import Payment from "./pages/Payment";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";

import HRManagement from "./pages/HRManagement";
import Accounting from "./pages/Accounting";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Reports from './pages/Reports';
import Inventory from './pages/Inventory';
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import WelcomeBack from "./pages/WelcomeBack";
import AuthReset from "./pages/AuthReset";
import AuthDebug from "./pages/AuthDebug";
import ServiceTestPanel from "./components/ServiceTestPanel";
// TwoFactorVerify removed
import SessionTimeoutWatcher from "@/components/auth/SessionTimeoutWatcher";

// Initialize global error handlers
safeExecute(() => {
  setupGlobalErrorHandlers();
}, undefined, 'Global error handlers setup');

// Ensure Wilson's CEO account is created
safeExecute(() => {
  ensureWilsonHasCEOAccess();
}, undefined, 'CEO access initialization');

const App = () => {
  // Create a new QueryClient instance for each app render with basic configuration
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        retryDelay: 1000,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false
      }
    }
  }));
  
  // Initialize project attendance sync
  useProjectAttendanceSync();
  
  // Clear any previous error conditions on app init
  useEffect(() => {
    // Remove any error flags that might prevent the app from rendering
    localStorage.removeItem('mokResetErrorBoundary');
    console.log('App initialized successfully');
  }, []);
  
  // Initialize default users in a separate effect to avoid React rendering conflicts
  useEffect(() => {
    // Use setTimeout to delay initialization until after initial render
    const initTimer = setTimeout(() => {
      try {
        // Initialize default users (admin@mokmzansibooks.com and user@mokmzansibooks.com)
        initializeDefaultUsers();
        
        // Ensure Wilson has CEO access
        ensureWilsonHasCEOAccess();
        
        // If company details exist, sync them to the primary admin user so Admin list reflects the owner
        try {
          const savedCompanyDetailsRaw = localStorage.getItem('companyDetails');
          if (savedCompanyDetailsRaw) {
            const savedCompanyDetails = JSON.parse(savedCompanyDetailsRaw);
            updatePrimaryUserInTeamMembers({
              ownerName: savedCompanyDetails.ownerName || '',
              ownerSurname: savedCompanyDetails.ownerSurname || '',
              ownerPosition: savedCompanyDetails.ownerPosition || 'CEO',
              email: savedCompanyDetails.email || '',
              phone: savedCompanyDetails.phone || ''
            });
          }
        } catch (e) {
          console.warn('Could not sync saved company details to primary admin user:', e);
        }
        
        // Sync default users to HR Management
        const syncResult = teamEmployeeSyncService.syncDefaultUsers();
        if (syncResult.syncedCount > 0) {
          console.log(`Synced ${syncResult.syncedCount} default users to HR Management`);
        }
        
        // Auto-sync company details to employee records
        companyEmployeeSyncService.autoSyncCompanyEmployee();
      } catch (error) {
        console.error('Error during user initialization:', error);
      }
    }, 1000); // Delay by 1 second
    
    return () => clearTimeout(initTimer); // Clean up timer on unmount
  }, []); // Empty dependency array ensures this only runs once

  return (
    <div className="app-root bg-background text-foreground min-h-screen">
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <LocalizationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Router>
                <AuditProvider>
                  <AuthProviderSelector>
                    {/* Global session timeout watcher with 15s countdown */}
                    <SessionTimeoutWatcher />
                    <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/invited-signup" element={<InvitedSignup />} />
                    <Route path="/accept-invitation" element={<AcceptInvitation />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/contact-sales" element={<ContactSales />} />
                    <Route path="/demo" element={<Demo />} />
                    <Route path="/integrations" element={<Integrations />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/thank-you" element={<ThankYou />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/auth-reset" element={<AuthReset />} />
                    <Route path="/auth-debug" element={<AuthDebug />} />
                    <Route path="/service-test" element={<ServiceTestPanel />} />
                    {/* Two-Factor verification route removed */}
                    <Route path="/disciplinary-test" element={<DisciplinaryTest />} />
                    <Route 
                      path="/welcome-back" 
                      element={
                        <AccessGuard>
                          <WelcomeBack />
                        </AccessGuard>
                      } 
                    />
                    {/* Protected Dashboard Route - Always accessible to logged-in users */}
                    <Route element={<ProtectedRoute pageName="Dashboard" />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                    </Route>

                    {/* Protected Company Route */}
                    <Route element={<ProtectedRoute pageName="My Company" />}>
                      <Route path="/company" element={<Company />} />
                    </Route>

                    {/* Protected Clients Route */}
                    <Route element={<ProtectedRoute pageName="Clients" />}>
                      <Route path="/clients" element={<Clients />} />
                    </Route>

                    {/* Protected Quotations Route */}
                    <Route element={<ProtectedRoute pageName="Quotations" />}>
                      <Route path="/quotations" element={<Quotations />} />
                      <Route path="/quotations/:id" element={<QuotationDetail />} />
                    </Route>

                    {/* Protected Invoices Route */}
                    <Route element={<ProtectedRoute pageName="Invoices" />}>
                      <Route path="/invoices" element={<Invoices />} />
                      <Route path="/invoices/:id" element={<InvoiceDetail />} />
                    </Route>

                    {/* Protected Projects Route */}
                    <Route element={<ProtectedRoute pageName="Projects" />}>
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/projects/:id" element={<ProjectDetail />} />
                    </Route>

                    {/* Protected Inventory Route */}
                    <Route element={<ProtectedRoute pageName="Inventory" />}>
                      <Route path="/inventory" element={<Inventory />} />
                    </Route>

                    {/* Protected HR Management Route */}
                    <Route element={<ProtectedRoute pageName="HR Management" />}>
                      <Route path="/hr-management" element={<HRManagement />} />
                    </Route>

                    {/* Protected Accounting Route */}
                    <Route element={<ProtectedRoute pageName="Accounting" />}>
                      <Route path="/accounting" element={<Accounting />} />
                    </Route>

                    {/* Protected Reports Route */}
                    <Route element={<ProtectedRoute pageName="Reports" />}>
                      <Route path="/reports" element={<Reports />} />
                    </Route>

                    {/* Protected Settings Route - Admin only */}
                    <Route element={<ProtectedRoute pageName="Settings" />}>
                      <Route path="/settings" element={<Settings />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AuthProviderSelector>
                </AuditProvider>
              </Router>
            </TooltipProvider>
          </LocalizationProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
