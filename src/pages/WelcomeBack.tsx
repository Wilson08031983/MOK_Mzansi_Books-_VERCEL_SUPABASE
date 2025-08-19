import React from 'react';
import { Link } from 'react-router-dom';
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

const WelcomeBack: React.FC = () => {
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
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass border border-border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Invoices</p>
                  <p className="text-2xl font-semibold text-foreground">12</p>
                </div>
              </div>
              <div className="mt-4 h-2 w-full bg-muted/30 rounded-full">
                <div className="h-2 rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 w-2/3" />
              </div>
            </div>

            <div className="glass border border-border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Draft Quotations</p>
                  <p className="text-2xl font-semibold text-foreground">5</p>
                </div>
              </div>
              <div className="mt-4 h-2 w-full bg-muted/30 rounded-full">
                <div className="h-2 rounded-full bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-600 w-1/3" />
              </div>
            </div>

            <div className="glass border border-border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-emerald-500/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">New Clients</p>
                  <p className="text-2xl font-semibold text-foreground">3</p>
                </div>
              </div>
              <div className="mt-4 h-2 w-full bg-muted/30 rounded-full">
                <div className="h-2 rounded-full bg-gradient-to-r from-blue-400 via-emerald-500 to-green-600 w-1/2" />
              </div>
            </div>

            <div className="glass border border-border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <BarChart2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Growth</p>
                  <p className="text-2xl font-semibold text-foreground">+18%</p>
                </div>
              </div>
              <div className="mt-4 h-2 w-full bg-muted/30 rounded-full">
                <div className="h-2 rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 w-3/4" />
              </div>
            </div>
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
