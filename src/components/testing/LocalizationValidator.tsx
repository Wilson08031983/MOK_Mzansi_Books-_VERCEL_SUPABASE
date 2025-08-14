import React, { useState, useEffect } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface PageValidation {
  pageName: string;
  route: string;
  hasLocalizationHook: boolean;
  hasTitleUpdate: boolean;
  hasLocalizedElements: boolean;
  status: 'complete' | 'partial' | 'pending';
}

const LocalizationValidator: React.FC = () => {
  const { t, currentLanguage, changeLanguage } = useLocalization();
  const [validationResults, setValidationResults] = useState<PageValidation[]>([]);

  const REQUIRED_PAGES: PageValidation[] = [
    {
      pageName: 'Dashboard',
      route: '/dashboard',
      hasLocalizationHook: false,
      hasTitleUpdate: false,
      hasLocalizedElements: false,
      status: 'pending'
    },
    {
      pageName: 'Company',
      route: '/company',
      hasLocalizationHook: true,
      hasTitleUpdate: true,
      hasLocalizedElements: true,
      status: 'complete'
    },
    {
      pageName: 'Clients',
      route: '/clients',
      hasLocalizationHook: true,
      hasTitleUpdate: true,
      hasLocalizedElements: true,
      status: 'complete'
    },
    {
      pageName: 'Quotations',
      route: '/quotations',
      hasLocalizationHook: true,
      hasTitleUpdate: true,
      hasLocalizedElements: false,
      status: 'partial'
    },
    {
      pageName: 'Invoices',
      route: '/invoices',
      hasLocalizationHook: true,
      hasTitleUpdate: true,
      hasLocalizedElements: false,
      status: 'partial'
    },
    {
      pageName: 'Projects',
      route: '/projects',
      hasLocalizationHook: false,
      hasTitleUpdate: false,
      hasLocalizedElements: false,
      status: 'pending'
    },
    {
      pageName: 'Inventory',
      route: '/inventory',
      hasLocalizationHook: false,
      hasTitleUpdate: false,
      hasLocalizedElements: false,
      status: 'pending'
    },
    {
      pageName: 'HR Management',
      route: '/hr',
      hasLocalizationHook: false,
      hasTitleUpdate: false,
      hasLocalizedElements: false,
      status: 'pending'
    },
    {
      pageName: 'Accounting',
      route: '/accounting',
      hasLocalizationHook: false,
      hasTitleUpdate: false,
      hasLocalizedElements: false,
      status: 'pending'
    },
    {
      pageName: 'Settings',
      route: '/settings',
      hasLocalizationHook: true,
      hasTitleUpdate: true,
      hasLocalizedElements: true,
      status: 'complete'
    }
  ];

  useEffect(() => {
    setValidationResults(REQUIRED_PAGES);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'text-green-600 bg-green-50';
      case 'partial':
        return 'text-yellow-600 bg-yellow-50';
      case 'pending':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const completedPages = validationResults.filter(page => page.status === 'complete').length;
  const partialPages = validationResults.filter(page => page.status === 'partial').length;
  const totalPages = validationResults.length;
  const completionPercentage = Math.round(((completedPages + partialPages * 0.5) / totalPages) * 100);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {t('settings.localization.title')} Validation
        </h1>
        <p className="text-slate-600">
          Current Language: <span className="font-semibold">{currentLanguage.toUpperCase()}</span>
        </p>
      </div>

      {/* Language Switcher */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Language Switching</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {['en', 'af', 'zu', 'xh'].map((lang) => (
              <Button
                key={lang}
                variant={currentLanguage === lang ? 'default' : 'outline'}
                onClick={() => changeLanguage(lang)}
                className="min-w-[80px]"
              >
                {lang.toUpperCase()}
              </Button>
            ))}
          </div>
          <p className="text-sm text-slate-600 mt-3">
            Click any language to test the Default Language selector functionality across all pages.
          </p>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Localization Integration Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedPages}</div>
              <div className="text-sm text-slate-600">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{partialPages}</div>
              <div className="text-sm text-slate-600">Partial</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{totalPages - completedPages - partialPages}</div>
              <div className="text-sm text-slate-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
              <div className="text-sm text-slate-600">Overall</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Page-by-Page Validation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {validationResults.map((page, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getStatusColor(page.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(page.status)}
                    <div>
                      <h3 className="font-semibold">{page.pageName}</h3>
                      <p className="text-sm opacity-75">{page.route}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium capitalize">{page.status}</div>
                    <div className="text-xs opacity-75">
                      {page.hasLocalizationHook ? '✓' : '✗'} Hook |{' '}
                      {page.hasTitleUpdate ? '✓' : '✗'} Title |{' '}
                      {page.hasLocalizedElements ? '✓' : '✗'} Elements
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Test Default Language Selector</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to Settings → General → Localization section</li>
            <li>Change the Default Language selector to any language (EN, AF, ZU, XH)</li>
            <li>Navigate to any of the completed pages (Company, Clients, Settings)</li>
            <li>Observe that page titles, navigation, and UI elements change language</li>
            <li>Check that browser tab title updates automatically</li>
            <li>Open multiple tabs - language changes sync across all tabs</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalizationValidator;
