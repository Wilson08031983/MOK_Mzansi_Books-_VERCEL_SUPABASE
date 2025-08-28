
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  CreditCard, 
  Check, 
  AlertTriangle, 
  Clock, 
  X, 
  ArrowRight, 
  Shield 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLocalization } from '@/hooks/useLocalization';
import { auditService } from '@/services/auditService';

const BillingSubscriptionTab = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { t, formatCurrency } = useLocalization();

  // Mock subscription data for demonstration
  const mockSubscription = {
    status: 'active',
    tier: 'premium',
    trialDaysLeft: null,
    startDate: '2025-01-01',
    currentPeriodEnd: '2025-07-01',
    paymentDeclinedDate: null
  };

  const currentSubscription = mockSubscription;

  // Format date from ISO string
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get subscription status badge
  const getStatusBadge = () => {
    switch (currentSubscription.status) {
      case 'trial':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">{t('settings.billing.status.trial')}</Badge>;
      case 'active':
        return <Badge className="bg-blue-500 hover:bg-blue-600">{t('settings.billing.status.active')}</Badge>;
      case 'payment_failed':
        return <Badge className="bg-amber-500 hover:bg-amber-600">{t('settings.billing.status.paymentIssue')}</Badge>;
      case 'expired':
        return <Badge className="bg-red-500 hover:bg-red-600">{t('settings.billing.status.expired')}</Badge>;
      case 'canceled':
        return <Badge className="bg-gray-500 hover:bg-gray-600">{t('settings.billing.status.canceled')}</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">{t('settings.billing.tiers.free')}</Badge>;
    }
  };

  // Get tier badge
  const getTierBadge = () => {
    switch (currentSubscription.tier) {
      case 'free':
        return <Badge variant="outline" className="border-gray-400 text-gray-600">{t('settings.billing.tiers.free')}</Badge>;
      case 'basic':
        return <Badge variant="outline" className="border-blue-400 text-blue-600">{t('settings.billing.tiers.basic')}</Badge>;
      case 'premium':
        return <Badge variant="outline" className="border-purple-400 text-purple-600">{t('settings.billing.tiers.premium')}</Badge>;
      case 'enterprise':
        return <Badge variant="outline" className="border-amber-400 text-amber-600">{t('settings.billing.tiers.enterprise')}</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-400 text-gray-600">{t('settings.billing.tiers.free')}</Badge>;
    }
  };

  // Mock payment history
  const paymentHistory = [
    {
      date: '2025-05-01',
      amount: 299,
      status: 'succeeded',
      description: t('settings.billing.planFeatureDescription', { tier: t('settings.billing.tiers.premium') })
    },
    {
      date: '2025-04-01',
      amount: 299,
      status: 'succeeded',
      description: t('settings.billing.planFeatureDescription', { tier: t('settings.billing.tiers.premium') })
    },
    {
      date: '2025-03-01',
      amount: 299,
      status: 'failed',
      description: t('settings.billing.planFeatureDescription', { tier: t('settings.billing.tiers.premium') })
    }
  ];

  // Mock plan details
  const plans = [
    {
      id: 'free',
      name: t('settings.billing.tiers.free'),
      price: `${formatCurrency(0)} / ${t('settings.billing.monthly')}`,
      description: t('settings.billing.planDescriptions.free'),
      features: [
        t('settings.billing.features.free.basicInvoicing'),
        t('settings.billing.features.free.upToClients'),
        t('settings.billing.features.free.upToDocuments')
      ],
      isCurrent: currentSubscription.tier === 'free'
    },
    {
      id: 'basic',
      name: t('settings.billing.tiers.basic'),
      price: `${formatCurrency(149)} / ${t('settings.billing.monthly')}`,
      description: t('settings.billing.planDescriptions.basic'),
      features: [
        t('settings.billing.features.basic.unlimitedInvoices'),
        t('settings.billing.features.basic.upToClients'),
        t('settings.billing.features.basic.upToDocuments'),
        t('settings.billing.features.basic.exportReports'),
        t('settings.billing.features.basic.bulkInvoicing')
      ],
      isCurrent: currentSubscription.tier === 'basic'
    },
    {
      id: 'premium',
      name: t('settings.billing.tiers.premium'),
      price: `${formatCurrency(299)} / ${t('settings.billing.monthly')}`,
      description: t('settings.billing.planDescriptions.premium'),
      features: [
        t('settings.billing.features.premium.everythingInBasic'),
        t('settings.billing.features.premium.unlimitedClients'),
        t('settings.billing.features.premium.unlimitedDocuments'),
        t('settings.billing.features.premium.advancedReporting'),
        t('settings.billing.features.premium.customBranding'),
        t('settings.billing.features.premium.teamMembersUpTo3')
      ],
      isCurrent: currentSubscription.tier === 'premium'
    },
    {
      id: 'enterprise',
      name: t('settings.billing.tiers.enterprise'),
      price: `${formatCurrency(599)} / ${t('settings.billing.monthly')}`,
      description: t('settings.billing.planDescriptions.enterprise'),
      features: [
        t('settings.billing.features.enterprise.everythingInPremium'),
        t('settings.billing.features.enterprise.apiAccess'),
        t('settings.billing.features.enterprise.unlimitedTeamMembers'),
        t('settings.billing.features.enterprise.prioritySupport'),
        t('settings.billing.features.enterprise.customIntegrations')
      ],
      isCurrent: currentSubscription.tier === 'enterprise'
    }
  ];

  const handleUpgrade = (tier: string) => {
    toast({
      title: t('settings.billing.toasts.upgradeRequestedTitle'),
      description: t('settings.billing.toasts.upgradeRequestedDesc', { tier }),
    });
    setIsPaymentModalOpen(true);
    try {
      auditService.logAudit({
        category: 'financial',
        action: 'Subscription Upgrade Requested',
        page: 'Settings',
        section: 'Billing > Plans',
        entityType: 'subscription',
        changeType: 'update',
        oldValues: { tier: currentSubscription.tier },
        newValues: { tier },
        description: `User requested upgrade to ${tier} plan`,
      });
    } catch {/* noop */}
  };

  const handleCancelSubscription = () => {
    toast({
      title: t('settings.billing.toasts.canceledTitle'),
      description: t('settings.billing.toasts.canceledDesc'),
    });
    try {
      auditService.logAudit({
        category: 'financial',
        action: 'Subscription Cancellation Requested',
        page: 'Settings',
        section: 'Billing > Overview',
        entityType: 'subscription',
        changeType: 'delete',
        oldValues: { status: currentSubscription.status, tier: currentSubscription.tier },
        description: 'User requested to cancel the current subscription',
      });
    } catch {/* noop */}
  };

  const handleRetryPayment = () => {
    toast({
      title: t('settings.billing.toasts.retryTitle'),
      description: t('settings.billing.toasts.retryDesc'),
    });
    setIsPaymentModalOpen(true);
    try {
      auditService.logAudit({
        category: 'financial',
        action: 'Payment Method Update Requested',
        page: 'Settings',
        section: 'Billing > Overview',
        entityType: 'payment_method',
        changeType: 'update',
        description: 'User initiated payment method update from payment issue banner',
      });
    } catch {/* noop */}
  };

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
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="overview">{t('settings.billing.tabs.overview')}</TabsTrigger>
              <TabsTrigger value="plans">{t('settings.billing.tabs.plans')}</TabsTrigger>
              <TabsTrigger value="billing">{t('settings.billing.tabs.billing')}</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
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
                  {currentSubscription.status === 'trial' && currentSubscription.trialDaysLeft && (
                    <div className="rounded-md p-4 flex items-start bg-emerald-900/20 border border-emerald-800/40">
                      <Clock className="h-5 w-5 text-emerald-300 mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-emerald-200">{t('settings.billing.trialPeriod')}</h3>
                        <p className="text-emerald-300">
                          {t('settings.billing.trialDaysLeft', { days: currentSubscription.trialDaysLeft })}
                          {currentSubscription.trialDaysLeft <= 3 && 
                            ` ${t('settings.billing.trialEndingSoon')}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {currentSubscription.status === 'payment_failed' && (
                    <div className="rounded-md p-4 flex items-start bg-amber-900/20 border border-amber-800/40">
                      <AlertTriangle className="h-5 w-5 text-amber-300 mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-200">{t('settings.billing.paymentIssue')}</h3>
                        <p className="text-amber-300">
                          {t('settings.billing.paymentIssueDesc')}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 border-white/10 text-slate-100 hover:bg-white/10"
                          onClick={handleRetryPayment}
                        >
                          {t('settings.billing.updatePaymentMethod')}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">{t('settings.billing.currentPlan')}</h3>
                      <p className="text-lg font-semibold capitalize text-slate-100">
                        {t(`settings.billing.tiers.${currentSubscription.tier}` as any)}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-slate-400">{t('settings.billing.billingCycle')}</h3>
                      <p className="text-lg font-semibold text-slate-100">{t('settings.billing.monthly')}</p>
                    </div>

                    {currentSubscription.startDate && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-400">{t('settings.billing.startDate')}</h3>
                        <p className="text-lg font-semibold text-slate-100">{formatDate(currentSubscription.startDate)}</p>
                      </div>
                    )}

                    {currentSubscription.currentPeriodEnd && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-400">{t('settings.billing.nextBillingDate')}</h3>
                        <p className="text-lg font-semibold text-slate-100">{formatDate(currentSubscription.currentPeriodEnd)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  {currentSubscription.status !== 'canceled' && (
                    <Button 
                      variant="outline" 
                      className="text-red-300 border-red-800/40 hover:bg-red-900/20"
                      onClick={handleCancelSubscription}
                    >
                      <X className="h-4 w-4 mr-2" />
                      {t('settings.billing.cancelSubscription')}
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
                  {currentSubscription.tier !== 'free' ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-slate-800/60 p-2 rounded-md mr-4 border border-white/10">
                          <CreditCard className="h-6 w-6 text-slate-300" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-100">{t('settings.billing.cardMasked', { last4: '4242' })}</p>
                          <p className="text-sm text-slate-400">{t('settings.billing.cardExpires', { expiry: '12/25' })}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-white/10 text-slate-100 hover:bg-white/10" onClick={() => { setIsPaymentModalOpen(true); try { auditService.logAudit({ category: 'financial', action: 'Open Payment Method Modal', page: 'Settings', section: 'Billing > Overview', entityType: 'payment_method', changeType: 'read', description: 'User opened payment method modal from Payment Method card', }); } catch {/* noop */} }}>
                        {t('settings.billing.update')}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-400 mb-4">{t('settings.billing.noPaymentMethod')}</p>
                      <Button onClick={() => { setIsPaymentModalOpen(true); try { auditService.logAudit({ category: 'financial', action: 'Open Payment Method Modal', page: 'Settings', section: 'Billing > Overview', entityType: 'payment_method', changeType: 'read', description: 'User opened payment method modal to add a new payment method', }); } catch {/* noop */} }}>
                        {t('settings.billing.addPaymentMethod')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plans Tab */}
            <TabsContent value="plans" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((plan) => (
                  <Card key={plan.id} className={`relative glass bg-slate-900/40 border-white/10 ${plan.isCurrent ? 'border-mokm-orange-500 ring-2 ring-mokm-orange-200' : ''}`}>
                    {plan.isCurrent && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-mokm-orange-500 text-white text-xs py-1 px-3 rounded-full">
                        {t('settings.billing.currentPlanBadge')}
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-slate-100">{plan.name}</CardTitle>
                      <CardDescription className="text-lg font-bold text-slate-300">{plan.price}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4 text-slate-400">{plan.description}</p>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-100">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className={`w-full ${plan.isCurrent ? 'bg-gray-300 hover:bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600'}`}
                        disabled={plan.isCurrent}
                        onClick={() => handleUpgrade(plan.id)}
                      >
                        {plan.isCurrent ? t('settings.billing.currentPlanBadge') : t('settings.billing.selectPlan')}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <Card className="glass bg-slate-900/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-slate-100">{t('settings.billing.paymentHistory')}</CardTitle>
                  <CardDescription className="text-slate-400">{t('settings.billing.viewRecentPayments')}</CardDescription>
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
                              <td className="py-3 px-4 text-slate-100">{payment.description}</td>
                              <td className="py-3 px-4 font-medium text-slate-100">{formatCurrency(payment.amount)}</td>
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

              <Card className="glass bg-slate-900/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-slate-100">{t('settings.billing.billingInfo')}</CardTitle>
                  <CardDescription className="text-slate-400">{t('settings.billing.manageBilling')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-2 text-slate-100">{t('settings.billing.companyInfo')}</h3>
                      <address className="not-italic text-sm text-slate-400">
                        <p>MOK Mzansi Books (Pty) Ltd</p>
                        <p>VAT: ZA123456789</p>
                        <p>123 Main Street</p>
                        <p>Johannesburg, Gauteng 2000</p>
                        <p>South Africa</p>
                      </address>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2 text-slate-100">{t('settings.billing.billingContact')}</h3>
                      <div className="text-sm text-slate-400">
                        <p>Wilson Moabelo</p>
                        <p>admin@mokmzansibooks.co.za</p>
                        <p>+27 12 345 6789</p>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2 border-white/10 text-slate-100 hover:bg-white/10">
                        {t('settings.billing.updateContact')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Mock Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900/80 border border-white/10 rounded-lg p-6 max-w-md w-full mx-4 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-100">{t('settings.billing.updatePaymentMethod')}</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsPaymentModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-100">{t('settings.billing.cardNumber')}</label>
                <input 
                  type="text" 
                  placeholder="4242 4242 4242 4242" 
                  className="w-full p-2 border rounded-md bg-slate-800/60 border-white/10 text-slate-100 placeholder-slate-400"
                  defaultValue="4242 4242 4242 4242"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-100">{t('settings.billing.expiryDate')}</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    className="w-full p-2 border rounded-md bg-slate-800/60 border-white/10 text-slate-100 placeholder-slate-400"
                    defaultValue="12/25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-100">{t('settings.billing.cvc')}</label>
                  <input 
                    type="text" 
                    placeholder="123" 
                    className="w-full p-2 border rounded-md bg-slate-800/60 border-white/10 text-slate-100 placeholder-slate-400"
                    defaultValue="123"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-100">{t('settings.billing.nameOnCard')}</label>
                <input 
                  type="text" 
                  placeholder="Wilson Moabelo" 
                  className="w-full p-2 border rounded-md bg-slate-800/60 border-white/10 text-slate-100 placeholder-slate-400"
                  defaultValue="Wilson Moabelo"
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  className="w-full bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600" 
                  onClick={() => {
                    toast({
                      title: t('settings.billing.toasts.paymentUpdatedTitle'),
                      description: t('settings.billing.toasts.paymentUpdatedDesc'),
                    });
                    setIsPaymentModalOpen(false);
                    try {
                      auditService.logAudit({
                        category: 'financial',
                        action: 'Payment Method Updated',
                        page: 'Settings',
                        section: 'Billing > Payment Modal',
                        entityType: 'payment_method',
                        changeType: 'update',
                        description: 'User saved/updated payment method in modal',
                      });
                    } catch {/* noop */}
                  }}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {t('settings.billing.savePaymentMethod')}
                </Button>
              </div>
              
              <p className="text-xs text-slate-400 text-center">
                {t('settings.billing.paymentSecurityNote')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingSubscriptionTab;
