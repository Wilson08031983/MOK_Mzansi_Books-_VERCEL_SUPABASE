
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProviderSelector } from "@/hooks/useAuthProvider";
import { ensureWilsonHasCEOAccess } from "@/services/localAuthService";
import AccessGuard from "@/components/AccessGuard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
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
import InvitedSignup from "./pages/InvitedSignup";
import Dashboard from "./pages/Dashboard";
import Quotations from "./pages/Quotations";
import QuotationDetail from "./pages/QuotationDetail";
import Clients from "./pages/Clients";
import Company from "./pages/Company";
import Payment from "./pages/Payment";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";
import ClientList from "./pages/ClientList";
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

const queryClient = new QueryClient();

// Ensure Wilson's CEO account exists with full admin permissions
ensureWilsonHasCEOAccess();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <AuthProviderSelector>
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
              <Route path="/clients-list" element={<ClientList />} />
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
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
