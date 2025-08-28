import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart2,
  Briefcase,
  DollarSign,
  FileText,
  Layers,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuditLogger from '@/hooks/useAuditLogger';
import { getInvoices } from '@/services/invoiceService';
import { getQuotations } from '@/services/quotationService';
import { getClients } from '@/services/clientService';
import { financialSummaryService } from '@/services/financialSummaryService';

const WelcomeBack: React.FC = () => {
  const navigate = useNavigate();
  const { logNavigation, logSystem } = useAuditLogger();

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Raw data
  const [invoices, setInvoices] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [revenueGrowth, setRevenueGrowth] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load from services used by detailed pages to ensure alignment
        const [inv, quo, cli] = await Promise.all([
          Promise.resolve(getInvoices()),
          Promise.resolve(getQuotations()),
          Promise.resolve(getClients()),
        ]);

        setInvoices(inv || []);
        setQuotations(quo || []);
        setClients(cli || []);

        // Revenue growth via accounting summary service
        const summary = financialSummaryService.getFinancialSummary();
        setRevenueGrowth(summary?.monthlyComparison?.revenueChange ?? 0);
      } catch (e: any) {
        console.error('WelcomeBack: Failed to load metrics', e);
        setError('Failed to load metrics');
        setInvoices([]);
        setQuotations([]);
        setClients([]);
        setRevenueGrowth(0);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Derived metrics matching detailed page logic
  const pendingInvoicesCount = useMemo(() => {
    // Invoices not paid or cancelled with positive balance
    try {
      return (invoices || []).filter((inv) => inv && inv.status !== 'paid' && inv.status !== 'cancelled' && (inv.balance ?? Math.max(0, (inv.amount || 0) - (inv.paidAmount || 0))) > 0).length;
    } catch {
      return 0;
    }
  }, [invoices]);

  const draftQuotationsCount = useMemo(() => {
    try {
      return (quotations || []).filter((q) => q?.status === 'draft').length;
    } catch {
      return 0;
    }
  }, [quotations]);

  const newClientsCount = useMemo(() => {
    try {
      const now = new Date();
      const days30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return (clients || []).filter((c) => {
        const created = c?.createdAt ? new Date(c.createdAt) : null;
        return created ? created >= days30Ago : false;
      }).length;
    } catch {
      return 0;
    }
  }, [clients]);

  const handleGoToDashboard = () => {
    try {
      logNavigation('WelcomeBack:GoToDashboard');
      logSystem('Navigate', 'User clicked Go to Dashboard from Welcome Back');
    } catch (e) {
      // non-blocking
      console.warn('Audit log failed for Go to Dashboard:', e);
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      {/* Decorative gradients */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-10 h-72 w-72 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl opacity-40" />
        <div className="absolute top-10 -right-10 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-blue-400/20 dark:from-indigo-600/20 dark:to-blue-600/20 blur-3xl opacity-40" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/20 to-green-400/20 dark:from-emerald-600/20 dark:to-green-600/20 blur-3xl opacity-30" />
      </div>

      <div className="relative">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Welcome back to MOK Mzansi Books
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Quick actions and insights to help you pick up right where you left off.
            </p>
            <div className="mt-6 flex items-center justify-end">
              <Button onClick={handleGoToDashboard} className="inline-flex items-center gap-2 bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-600 to-mokm-purple-700 hover:from-mokm-orange-600 hover:via-mokm-pink-700 hover:to-mokm-purple-800 text-white px-5 py-2 rounded-lg shadow">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/invoices"
              className="group glass border border-border rounded-xl p-6 block focus:outline-none focus:ring-2 focus:ring-primary/50 hover:shadow-lg transition"
              aria-label="View Pending Invoices"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Invoices</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {loading ? '—' : pendingInvoicesCount}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-2 w-full bg-muted/30 rounded-full">
                <div className="h-2 rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 w-2/3 group-hover:w-3/4 transition-all" />
              </div>
            </Link>

            <Link
              to="/quotations"
              className="group glass border border-border rounded-xl p-6 block focus:outline-none focus:ring-2 focus:ring-primary/50 hover:shadow-lg transition"
              aria-label="View Draft Quotations"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Draft Quotations</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {loading ? '—' : draftQuotationsCount}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-2 w-full bg-muted/30 rounded-full">
                <div className="h-2 rounded-full bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-600 w-1/3 group-hover:w-1/2 transition-all" />
              </div>
            </Link>

            <Link
              to="/clients"
              className="group glass border border-border rounded-xl p-6 block focus:outline-none focus:ring-2 focus:ring-primary/50 hover:shadow-lg transition"
              aria-label="View New Clients"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-emerald-500/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">New Clients</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {loading ? '—' : newClientsCount}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-2 w-full bg-muted/30 rounded-full">
                <div className="h-2 rounded-full bg-gradient-to-r from-blue-400 via-emerald-500 to-green-600 w-1/2 group-hover:w-2/3 transition-all" />
              </div>
            </Link>

            <Link
              to="/accounting"
              className="group glass border border-border rounded-xl p-6 block focus:outline-none focus:ring-2 focus:ring-primary/50 hover:shadow-lg transition"
              aria-label="View Revenue Growth in Accounting"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <BarChart2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Growth</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {loading ? '—' : `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-2 w-full bg-muted/30 rounded-full">
                <div className="h-2 rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 w-3/4 group-hover:w-full transition-all" />
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="glass-soft rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Manage Projects</h3>
                  <p className="text-sm text-muted-foreground">Track progress and team performance</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Link to="/projects" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors">
                  Go to Projects <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="glass-soft rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary/10 text-secondary-foreground flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Sales Pipeline</h3>
                  <p className="text-sm text-muted-foreground">Quotations and conversions</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Link to="/quotations" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors">
                  View Quotations <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="glass-soft rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Compliance</h3>
                  <p className="text-sm text-muted-foreground">Data security and permissions</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Link to="/settings" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors">
                  Review Settings <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Get Started CTA */}
          <div className="mt-16">
            <div className="glass rounded-2xl p-8 border border-border">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Boost your productivity</h2>
                  <p className="mt-1 text-muted-foreground">Explore features, watch guides, and get quick support</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 via-pink-600 to-purple-700 px-4 py-2 font-medium text-white shadow hover:from-orange-600 hover:via-pink-700 hover:to-purple-800 transition-colors">
                    <PlayCircle className="h-5 w-5" /> Watch Guides
                  </button>
                  <Link to="/pricing" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-medium text-foreground hover:bg-accent/10 transition-colors">
                    <Sparkles className="h-5 w-5" /> Explore Features
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WelcomeBack;
