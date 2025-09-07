
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  // Calendar, 
  CreditCard, 
  Check, 
  AlertTriangle, 
  Clock, 
  X, 
  ArrowRight, 
  // Shield 
  Trash2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLocalization } from '@/hooks/useLocalization';
import { auditService } from '@/services/auditService';
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/paystack';
import { usePayment } from '@/hooks/usePayment';
import PaymentModal from '@/components/PaymentModal';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { paymentsStorageService, SavedPaymentMethod } from '@/services/paymentsStorageService';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// Removed test payment imports as they are no longer needed

const BillingSubscriptionTab = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { t } = useLocalization();
  const {
    selectedPlan,
    showPaymentModal,
    isProcessing,
    handleSelectPlan,
    initiatePayment,
    setShowPaymentModal,
    openPaymentModalForPlan,
    openPaymentModalForCardManagement,
    modalMode,
  } = usePayment();



  const { subscription, loading, fetchPaymentHistory, cancelSubscriptionAtPeriodEnd, refreshSubscription, resumeSubscription } = useSubscription();
  const [paymentHistory, setPaymentHistory] = useState<Array<{ date: string | Date; amount: number; status: string; description?: string }>>([]);
  const { user } = useAuth();
  const [savedCards, setSavedCards] = useState<SavedPaymentMethod[]>([]);
  const savedCard = (savedCards.find(c => c.isDefault) || savedCards[0]) || null;
  const [chargingDefault, setChargingDefault] = useState(false);

  useEffect(() => {
    if (!loading && activeTab !== 'overview') {
      fetchPaymentHistory().then(setPaymentHistory).catch(() => setPaymentHistory([]));
    }
  }, [loading, activeTab, fetchPaymentHistory]);
  
  // Refresh payment history and subscription data when tab becomes active
  // Using a ref to prevent unnecessary refreshes that might cause flickering
  const refreshedRef = React.useRef(false);
  useEffect(() => {
    if (activeTab === 'overview' && !loading) {
      // Only refresh if we haven't already done so
      if (!refreshedRef.current) {
        fetchPaymentHistory().then(setPaymentHistory).catch(() => setPaymentHistory([]));
        // Removed proactive refreshSubscription call here to avoid a second loading cycle that caused UI flicker
        refreshedRef.current = true;
      }
    } else if (activeTab !== 'overview') {
      // Reset the ref when switching away from overview tab
      refreshedRef.current = false;
    }
  }, [activeTab, loading, fetchPaymentHistory]);

  const refreshSavedCards = () => {
    const key = (user?.id || user?.email || '') as string;
    if (!key) {
      setSavedCards([]);
      return;
    }
    setSavedCards(paymentsStorageService.getAll(key));
  };

  useEffect(() => {
    refreshSavedCards();
  }, [user]);
  
  // Refresh saved cards when tab becomes active
  useEffect(() => {
    if (activeTab === 'overview') {
      refreshSavedCards();
    }
  }, [activeTab]);

  const currentSubscription = subscription || { tier: 'trial', status: 'trial', currentPeriodEnd: new Date() } as any;
  const isCancelScheduled = Boolean((currentSubscription as any)?.cancelAtPeriodEnd);

  // Format date from ISO string or Date
  const formatDate = (dateInput: string | Date | null) => {
    if (!dateInput) return 'N/A';
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // --- Next billing date helpers ---
  const safeDate = (val: any): Date | null => {
    if (!val) return null;
    const d = val instanceof Date ? val : new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const addDays = (date: Date, days: number): Date => {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  };

  const isFarFutureSentinel = (date: Date | null): boolean => {
    if (!date) return false;
    // Treat dates in 2099 or beyond as special admin/sentinel values
    // This prevents showing 2099-12-31 as the cancellation date for admin users
    return date.getFullYear() >= 2099;
  };

  const getPlanDurationDays = (tier: string): number => {
    const key = (tier || '').toLowerCase() as keyof typeof SUBSCRIPTION_PLANS;
    const plan = SUBSCRIPTION_PLANS[key as keyof typeof SUBSCRIPTION_PLANS];
    if (plan?.duration) return plan.duration;
    // sensible defaults
    if (key === 'annual') return 365;
    return 31;
  };

  const computeNextBillingDate = (sub: any): Date | null => {
    const now = new Date();
    const status = (sub?.status || '').toString().toLowerCase();
    const tier = (sub?.tier || 'monthly').toString().toLowerCase();
    const duration = getPlanDurationDays(tier);

    const end = safeDate(sub?.currentPeriodEnd);

    // If canceled: show end of access if valid and not a sentinel; otherwise no next billing
    if (status === 'canceled') {
      if (end && !isFarFutureSentinel(end)) return end;
      return null;
    }

    // If we have a valid, reasonable future end date, use it directly
    if (end && !isFarFutureSentinel(end)) {
      if (end > now) return end;
      // If end date is in the past, roll forward by whole periods until in the future
      let rolled = end;
      // Prevent infinite loops with a hard cap of 48 cycles
      let guard = 0;
      while (rolled <= now && guard < 48) {
        rolled = addDays(rolled, duration);
        guard++;
      }
      return rolled > now ? rolled : addDays(now, duration);
    }

    // Otherwise compute from createdAt (or now) using plan duration
    const created = safeDate(sub?.createdAt) || now;
    let next = created;
    let guard = 0;
    while (next <= now && guard < 48) {
      next = addDays(next, duration);
      guard++;
    }
    return next > now ? next : addDays(now, duration);
  };

  const nextBillingDate = computeNextBillingDate(currentSubscription);

  const handleSetDefault = (cardId: string) => {
    const key = (user?.id || user?.email || '') as string;
    if (!key) return;
    paymentsStorageService.setDefault(key, cardId);
    refreshSavedCards();
  };

  const handleRemoveCard = (card: SavedPaymentMethod) => {
    try {
      const key = (user?.id || user?.email || '') as string;
      if (!key) return;
      const confirmMsg = `Remove card •••• ${card.last4}?`;
      if (!window.confirm(confirmMsg)) return;
      paymentsStorageService.remove(key, card.id);
      refreshSavedCards();
      try {
        auditService.logAudit({
          category: 'financial',
          action: 'Remove Payment Method',
          page: 'Settings',
          section: 'Billing > Overview',
          entityType: 'payment_method',
          changeType: 'delete',
          description: `Removed card ending ${card.last4}${card.isDefault ? ' (was default)' : ''}`,
        });
      } catch { /* noop */ }
      toast({ title: 'Card removed', description: `The card ending ${card.last4} has been removed.` });
    } catch (e) {
      toast({ title: 'Failed to remove card', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const daysLeft = (() => {
    const end = safeDate(currentSubscription?.currentPeriodEnd);
    if (!end || isFarFutureSentinel(end)) return null;
    const ms = end.getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  })();

  // Get subscription status badge
  const getStatusBadge = () => {
    const status = (currentSubscription?.status || '').toString().toLowerCase();
    if (status === 'trial' || status === 'trialing') {
      return <Badge className="bg-emerald-500 hover:bg-emerald-600">{t('settings.billing.status.trial')}</Badge>;
    }
    if (status === 'active') {
      return <Badge className="bg-blue-500 hover:bg-blue-600">{t('settings.billing.status.active')}</Badge>;
    }
    if (status === 'past_due' || status === 'unpaid' || status === 'incomplete') {
      return <Badge className="bg-amber-500 hover:bg-amber-600">{t('settings.billing.status.paymentIssue')}</Badge>;
    }
    if (status === 'canceled') {
      return <Badge className="bg-gray-500 hover:bg-gray-600">{t('settings.billing.status.canceled')}</Badge>;
    }
    return <Badge className="bg-gray-500 hover:bg-gray-600">{t('settings.billing.tiers.free')}</Badge>;
  };

  // Get tier badge
  const getTierBadge = () => {
    const tier = (currentSubscription?.tier || '').toString().toLowerCase();
    if (tier === 'trial') {
      return <Badge variant="outline" className="border-emerald-400 text-emerald-500">{SUBSCRIPTION_PLANS.trial.name}</Badge>;
    }
    if (tier === 'monthly') {
      return <Badge variant="outline" className="border-blue-400 text-blue-600">{SUBSCRIPTION_PLANS.monthly.name}</Badge>;
    }
    if (tier === 'annual') {
      return <Badge variant="outline" className="border-purple-400 text-purple-600">{SUBSCRIPTION_PLANS.annual.name}</Badge>;
    }
    return <Badge variant="outline" className="border-gray-400 text-gray-600">{t('settings.billing.tiers.free')}</Badge>;
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscriptionAtPeriodEnd();
      toast({
        title: t('settings.billing.toasts.canceledTitle'),
        description: t('settings.billing.toasts.canceledDesc'),
      });
      await refreshSubscription?.();
      // Refresh saved cards to maintain visibility after cancellation
      refreshSavedCards();
    } catch (e: any) {
      toast({ title: t('common.error'), description: e?.message || 'Failed to cancel subscription' });
    }
  };

  // New: allow user to resume/uncancel if already scheduled
  const handleResumeSubscription = async () => {
    try {
      await resumeSubscription?.();
      toast({
        title: t('settings.billing.toasts.resumedTitle'),
        description: t('settings.billing.toasts.resumedDesc'),
      });
      try {
        auditService.logAudit({
          category: 'financial',
          action: t('settings.billing.resumeSubscription'),
          page: 'Settings',
          section: 'Billing > Overview',
          entityType: 'subscription',
          changeType: 'update',
          description: 'User rescinded scheduled cancellation',
        });
      } catch { /* noop */ }
      await refreshSubscription?.();
      // Refresh saved cards to maintain visibility after resuming
      refreshSavedCards();
    } catch (e: any) {
      toast({ title: t('common.error'), description: e?.message || 'Failed to resume subscription' });
    }
  };

  const handleRetryPayment = () => {
    toast({
      title: t('settings.billing.toasts.retryTitle'),
      description: t('settings.billing.toasts.retryDesc'),
    });
    setShowPaymentModal(true);
    // Refresh saved cards to ensure they're visible
    refreshSavedCards();
    try {
      auditService.logAudit({
        category: 'financial',
        action: 'Retry Payment',
        page: 'Settings',
        section: 'Billing > Overview',
        entityType: 'subscription',
        changeType: 'update',
        description: 'User initiated retry payment from billing overview',
      });
    } catch {/* noop */}
  };

  const handleChargeDefault = async () => {
    if (!user?.id) {
      toast({ title: 'Not signed in', description: 'Please sign in to continue.', variant: 'destructive' });
      return;
    }
    if (!savedCards || savedCards.length === 0) {
      toast({ title: 'No saved card', description: 'Please add a card first.', variant: 'destructive' });
      return;
    }
    setChargingDefault(true);
    try {
      const tier = (currentSubscription?.tier as string) || 'monthly';
      const res = await fetch('/api/billing/charge-default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Charge failed');

      toast({ title: 'Payment succeeded', description: 'Your subscription has been updated.' });
      try {
        auditService.logAudit({
          category: 'financial',
          action: 'Charge Default Card',
          page: 'Settings',
          section: 'Billing > Overview',
          entityType: 'payment',
          changeType: 'create',
          description: `Manual charge via default card${savedCard?.last4 ? ' •••• ' + savedCard.last4 : ''}`,
        });
      } catch { /* noop */ }
      await refreshSubscription?.();
      fetchPaymentHistory().then(setPaymentHistory).catch(() => {});
    } catch (e: any) {
      toast({ title: 'Payment failed', description: e?.message || 'We could not charge your default card.', variant: 'destructive' });
      try {
        auditService.logAudit({
          category: 'financial',
          action: 'Charge Default Card Failed',
          page: 'Settings',
          section: 'Billing > Overview',
          entityType: 'payment',
          changeType: 'none',
          description: String(e?.message || e),
        });
      } catch { /* noop */ }
    } finally {
      setChargingDefault(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
          <CardHeader>
            <CardTitle className="flex items-center font-sf-pro text-slate-100">
              <CreditCard className="h-5 w-5 mr-2" />
              {t('settings.billing.title')}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {t('settings.billing.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <div className="text-slate-400">Loading subscription information...</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro text-slate-100">
            <CreditCard className="h-5 w-5 mr-2" />
            {t('settings.billing.title')}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {t('settings.billing.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md bg-slate-800/40 border border-white/10 p-1 rounded-md">
              <TabsTrigger 
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-orange-500 data-[state=active]:via-mokm-pink-500 data-[state=active]:to-mokm-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
              >
                {t('settings.billing.tabs.overview')}
              </TabsTrigger>
              <TabsTrigger 
                value="plans"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-mokm-orange-500 data-[state=active]:via-mokm-pink-500 data-[state=active]:to-mokm-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
              >
                {t('settings.billing.tabs.plans')}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
              <Card className="glass bg-slate-900/40 border-white/10">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-slate-100">{t('settings.billing.subscriptionStatus')}</CardTitle>
                      <CardDescription className="text-slate-400">{t('settings.billing.subscriptionDetails')}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      {getStatusBadge()}
                      {getTierBadge()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(currentSubscription.status === 'trial' || currentSubscription.status === 'trialing') && daysLeft !== null && (
                    <div className="rounded-md p-4 flex items-start bg-emerald-900/20 border border-emerald-800/40">
                      <Clock className="h-5 w-5 text-emerald-300 mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-emerald-200">{t('settings.billing.trialPeriod')}</h3>
                        <p className="text-emerald-300">
                          {t('settings.billing.trialDaysLeft', { days: daysLeft || 0 })}
                          {!!daysLeft && daysLeft <= 3 && ` ${t('settings.billing.trialEndingSoon')}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {(currentSubscription.status === 'past_due' || currentSubscription.status === 'unpaid' || currentSubscription.status === 'incomplete') && (
                    <div className="rounded-md p-4 flex items-start bg-amber-900/20 border border-amber-800/40">
                      <AlertTriangle className="h-5 w-5 text-amber-300 mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-200">{t('settings.billing.paymentIssue')}</h3>
                        <p className="text-amber-300">
                          {t('settings.billing.paymentIssueDesc')}
                        </p>
                        <div className="flex gap-2 flex-wrap mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-white/10 text-slate-100 hover:bg-white/10"
                            onClick={handleRetryPayment}
                          >
                            {t('settings.billing.updatePaymentMethod')}
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleChargeDefault}
                            disabled={chargingDefault || !savedCards || savedCards.length === 0}
                          >
                            {chargingDefault ? 'Charging…' : 'Charge default card'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSubscription.status === 'canceled' && daysLeft !== null && daysLeft > 0 && (
                    <div className="rounded-md p-4 flex items-start bg-red-900/20 border border-red-800/40">
                      <AlertTriangle className="h-5 w-5 text-red-300 mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-red-200">{t('settings.billing.toasts.canceledTitle')}</h3>
                        <p className="text-red-300">
                          {t('settings.billing.trialCanceledDaysLeft', { days: daysLeft })}
                        </p>
                      </div>
                    </div>
                  )}

                  {isCancelScheduled && currentSubscription.status !== 'canceled' && (
                    <div className="rounded-md p-4 flex items-start bg-amber-900/20 border border-amber-800/40">
                      <Clock className="h-5 w-5 text-amber-300 mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-200">{t('settings.billing.cancellationScheduled')}</h3>
                        <p className="text-amber-300">
                          {nextBillingDate && !isFarFutureSentinel(nextBillingDate)
                            ? t('settings.billing.cancellationScheduledDesc', { date: formatDate(nextBillingDate) })
                            : t('settings.billing.cancellationScheduledNoDate')}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">{t('settings.billing.currentPlan')}</h3>
                      <p className="text-lg font-semibold capitalize text-slate-100">
                        {SUBSCRIPTION_PLANS[(currentSubscription.tier as keyof typeof SUBSCRIPTION_PLANS)]?.name || (currentSubscription.tier as string)}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-slate-400">{t('settings.billing.billingCycle')}</h3>
                      <p className="text-lg font-semibold text-slate-100">{currentSubscription.tier === 'annual' ? 'Annual' : 'Monthly'}</p>
                    </div>

                    {(currentSubscription as any).createdAt && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-400">{t('settings.billing.startDate')}</h3>
                        <p className="text-lg font-semibold text-slate-100">{formatDate((currentSubscription as any).createdAt as any)}</p>
                      </div>
                    )}

                    {nextBillingDate && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-400">{t('settings.billing.nextBillingDate')}</h3>
                        <p className="text-lg font-semibold text-slate-100">{formatDate(nextBillingDate)}</p>
                      </div>
                    )}
                    {isCancelScheduled && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-400">End of access</h3>
                        <p className="text-lg font-semibold text-slate-100">{formatDate(currentSubscription.currentPeriodEnd)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  {currentSubscription.status !== 'canceled' && (
                    <Button 
                      variant="outline" 
                      className={`border-red-300 hover:bg-red-50 dark:border-red-800/40 dark:hover:bg-red-900/20 ${isCancelScheduled ? 'opacity-60 cursor-not-allowed text-slate-400' : 'text-red-600 dark:text-red-300'}`}
                      onClick={!isCancelScheduled ? handleCancelSubscription : undefined}
                      disabled={isCancelScheduled}
                    >
                      <X className="h-4 w-4 mr-2" />
                      {isCancelScheduled ? t('settings.billing.cancellationScheduled') : t('settings.billing.cancelSubscription')}
                    </Button>
                  )}
                  {isCancelScheduled && currentSubscription.status !== 'canceled' && (
                    <Button 
                      variant="outline"
                      className="border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800/40 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300"
                      onClick={handleResumeSubscription}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {t('settings.billing.resumeSubscription')}
                    </Button>
                  )}
                  <Button onClick={() => setActiveTab('plans')}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {t('settings.billing.viewPlans')}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="glass bg-slate-900/40 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-slate-100">{t('settings.billing.paymentMethod')}</CardTitle>
                    <CardDescription className="text-slate-400">{t('settings.billing.managePayment')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {true ? (
                      <div className="space-y-4">
                        {savedCards && savedCards.length > 0 ? (
                          <div className="space-y-3">
                            <RadioGroup
                              value={(savedCards.find(c => c.isDefault)?.id) || (savedCards[0]?.id ?? '')}
                              onValueChange={(val) => {
                                if (!val) return;
                                handleSetDefault(val);
                              }}
                            >
                              {savedCards.map((card) => (
                                <label key={card.id} className="flex items-center justify-between w-full p-3 rounded-lg border border-white/10 bg-slate-800/40 hover:bg-slate-800/60 transition">
                                  <div className="flex items-center gap-3">
                                    <RadioGroupItem value={card.id} id={`card-${card.id}`} />
                                    <div className="bg-slate-800/60 p-2 rounded-md border border-white/10">
                                      <CreditCard className="h-5 w-5 text-slate-300" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-100">
                                        {card.brand ? `${card.brand} • ` : ''}•••• •••• •••• {card.last4}
                                      </p>
                                      <p className="text-sm text-slate-400">{card.expMonth && card.expYear ? `Exp ${card.expMonth}/${String(card.expYear).slice(-2)}` : ''}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {card.isDefault && (
                                      <Badge variant="secondary" className="bg-emerald-600/20 text-emerald-300 border-emerald-600/30">Default</Badge>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="hover:bg-red-900/20"
                                      aria-label="Remove card"
                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveCard(card); }}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-400" />
                                    </Button>
                                  </div>
                                </label>
                              ))}
                            </RadioGroup>

                            <Button
                              size="sm"
                              onClick={handleChargeDefault}
                              disabled={chargingDefault || savedCards.length === 0}
                              className="border-emerald-700/40 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300"
                            >
                              {chargingDefault ? 'Charging…' : 'Charge default card'}
                            </Button>

                            <div className="flex items-center justify-between">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                                onClick={() => {
                                  openPaymentModalForCardManagement();
                                  try {
                                    auditService.logAudit({
                                      category: 'financial',
                                      action: 'Open Payment Method Modal',
                                      page: 'Settings',
                                      section: 'Billing > Overview',
                                      entityType: 'payment_method',
                                      changeType: 'read',
                                      description: 'User opened payment method modal to manage saved cards',
                                    });
                                  } catch { /* noop */ }
                                }}
                              >
                                {t('settings.billing.update')}
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                disabled={savedCards.length >= 3}
                                className="border-border text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                                onClick={() => {
                                  if (savedCards.length >= 3) return;
                                  openPaymentModalForCardManagement();
                                  try {
                                    auditService.logAudit({
                                      category: 'financial',
                                      action: 'Open Payment Method Modal',
                                      page: 'Settings',
                                      section: 'Billing > Overview',
                                      entityType: 'payment_method',
                                      changeType: 'create',
                                      description: 'User clicked Add Card button',
                                    });
                                  } catch { /* noop */ }
                                }}
                              >
                                Add Card
                              </Button>
                            </div>
                            {savedCards.length >= 3 && (
                              <p className="text-xs text-slate-400">You can store up to 3 cards. Remove one to add another.</p>
                            )}
                          </div>
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-slate-400 mb-4">{t('settings.billing.noPaymentMethod')}</p>
                              <Button onClick={() => {
                                openPaymentModalForCardManagement();
                                try {
                                  auditService.logAudit({
                                    category: 'financial',
                                    action: 'Open Payment Method Modal',
                                    page: 'Settings',
                                    section: 'Billing > Overview',
                                    entityType: 'payment_method',
                                    changeType: 'read',
                                    description: 'User opened payment method modal to add a new payment method',
                                  });
                                } catch { /* noop */ }
                              }}
                              >
                                {t('settings.billing.addPaymentMethod')}
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-slate-400 mb-4">{t('settings.billing.noPaymentMethod')}</p>
                          <Button onClick={() => {
                            openPaymentModalForCardManagement();
                            try {
                              auditService.logAudit({
                                category: 'financial',
                                action: 'Open Payment Method Modal',
                                page: 'Settings',
                                section: 'Billing > Overview',
                                entityType: 'payment_method',
                                changeType: 'read',
                                description: 'User opened payment method modal to add a new payment method',
                              });
                            } catch { /* noop */ }
                          }}
                          >
                            {t('settings.billing.addPaymentMethod')}
                          </Button>
                        </div>
                      )}
                  </CardContent>
                </Card>

              <Card className="glass bg-slate-900/40 border-white/10">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-slate-100">{t('settings.billing.paymentHistory')}</CardTitle>
                      <CardDescription className="text-slate-400">{t('settings.billing.viewRecentPayments')}</CardDescription>
                    </div>

                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 font-medium text-slate-400">{t('settings.billing.table.date')}</th>
                          <th className="text-left py-3 px-4 font-medium text-slate-400">{t('settings.billing.table.description')}</th>
                          <th className="text-left py-3 px-4 font-medium text-slate-400">{t('settings.billing.table.amount')}</th>
                          <th className="text-left py-3 px-4 font-medium text-slate-400">{t('settings.billing.table.status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.length > 0 ? (
                          paymentHistory.map((payment, index) => (
                            <tr key={index} className="border-b border-white/10 last:border-0">
                              <td className="py-3 px-4 text-slate-100">{formatDate(payment.date)}</td>
                              <td className="py-3 px-4 text-slate-100">{payment.description || 'Subscription payment'}</td>
                              <td className="py-3 px-4 font-medium text-slate-100">{formatPrice(payment.amount)}</td>
                              <td className="py-3 px-4">
                                {payment.status === 'succeeded' ? (
                                  <span className="inline-flex items-center text-green-400 text-sm">
                                    <Check className="h-4 w-4 mr-1" /> {t('settings.billing.paid')}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-red-400 text-sm">
                                    <X className="h-4 w-4 mr-1" /> {t('settings.billing.failed')}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-slate-400">
                              {t('settings.billing.noPaymentHistory')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plans Tab */}
            <TabsContent value="plans" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-100 mb-4">
                  Choose Your Plan
                </h2>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                  Select the perfect plan for your South African business
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
                  const isPopular = key === 'monthly';
                  const isCurrent = (currentSubscription.tier as string) === key;

                  return (
                    <Card
                      key={key}
                      className={`relative transition-all duration-300 hover:shadow-xl cursor-pointer ${
                        isPopular
                          ? 'border-purple-500 bg-gradient-to-br from-purple-900/20 to-blue-900/20 shadow-lg scale-105'
                          : isCurrent
                          ? 'border-emerald-500 bg-gradient-to-br from-emerald-900/20 to-teal-900/20'
                          : 'glass bg-slate-900/40 border-white/10 hover:border-purple-200/30'
                      }`}
                      onClick={() => !isCurrent && handleSelectPlan(key)}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      {isCurrent && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                            Current Plan
                          </span>
                        </div>
                      )}
                      
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-slate-100">
                          {plan.name}
                        </CardTitle>
                        <div className="mt-4">
                          <span className="text-4xl font-bold text-slate-100">
                            {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-slate-400">
                              /{key === 'annual' ? 'year' : 'month'}
                            </span>
                          )}
                        </div>
                        {key === 'annual' && (
                          <div className="text-sm text-green-400 font-semibold">
                            Save 5% annually
                          </div>
                        )}
                      </CardHeader>

                      <CardContent>
                        <ul className="space-y-3 mb-8">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <Check className="h-5 w-5 text-green-400 mr-3" />
                              <span className="text-slate-300">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {key === 'trial' && (
                          <div className="mb-6 text-xs text-slate-400 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3 flex items-start">
                            <AlertTriangle className="h-4 w-4 text-amber-400 mr-2 mt-0.5" />
                            <span>
                              Trial includes limited usage: invoices and quotations are capped monthly; clients, projects, inventory items, suppliers, and storage locations are capped in total. Upgrade anytime to remove limits.
                            </span>
                          </div>
                        )}

                        <Button
                          className={`w-full h-12 font-semibold transition-all duration-300 ${
                            isCurrent
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-default'
                              : isPopular
                              ? 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white'
                              : 'bg-slate-700 text-slate-100 hover:bg-slate-600 border-white/10'
                          }`}
                          disabled={isCurrent}
                          onClick={() => !isCurrent && handleSelectPlan(key)}
                        >
                          {isCurrent ? 'Current Plan' : plan.price === 0 ? 'Start Free Trial' : 'Choose Plan'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          try {
            refreshSavedCards();
          } catch {}
        }}
        selectedPlan={selectedPlan}
        onPayment={initiatePayment}
        isProcessing={isProcessing}
        modalMode={modalMode}
        onCardSaved={refreshSavedCards}
      />
    </div>
  );
};

export default BillingSubscriptionTab;
