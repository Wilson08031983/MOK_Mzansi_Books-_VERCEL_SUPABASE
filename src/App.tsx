
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AccessGuard from "@/components/AccessGuard";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
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
            <Route 
              path="/dashboard" 
              element={
                <AccessGuard>
                  <Dashboard />
                </AccessGuard>
              } 
            />
            <Route 
              path="/company" 
              element={
                <AccessGuard>
                  <Company />
                </AccessGuard>
              } 
            />
            <Route 
              path="/clients" 
              element={
                <AccessGuard>
                  <Clients />
                </AccessGuard>
              } 
            />
            <Route 
              path="/clients-list" 
              element={
                <AccessGuard>
                  <ClientList />
                </AccessGuard>
              } 
            />
            <Route 
              path="/hr-management" 
              element={
                <AccessGuard>
                  <HRManagement />
                </AccessGuard>
              } 
            />
            <Route 
              path="/accounting" 
              element={
                <AccessGuard>
                  <Accounting />
                </AccessGuard>
              } 
            />
            <Route 
              path="/projects" 
              element={
                <AccessGuard>
                  <Projects />
                </AccessGuard>
              } 
            />
            <Route 
              path="/projects/:id" 
              element={
                <AccessGuard>
                  <ProjectDetail />
                </AccessGuard>
              } 
            />
            <Route 
              path="/quotations" 
              element={
                <AccessGuard>
                  <Quotations />
                </AccessGuard>
              } 
            />
            <Route 
              path="/quotations/:id" 
              element={
                <AccessGuard>
                  <QuotationDetail />
                </AccessGuard>
              } 
            />
            <Route 
              path="/invoices" 
              element={
                <AccessGuard>
                  <Invoices />
                </AccessGuard>
              } 
            />
            <Route 
              path="/invoices/:id" 
              element={
                <AccessGuard>
                  <InvoiceDetail />
                </AccessGuard>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <AccessGuard>
                  <Reports />
                </AccessGuard>
              } 
            />
            <Route 
              path="/inventory" 
              element={
                <AccessGuard>
                  <Inventory />
                </AccessGuard>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <AccessGuard>
                  <Settings />
                </AccessGuard>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
