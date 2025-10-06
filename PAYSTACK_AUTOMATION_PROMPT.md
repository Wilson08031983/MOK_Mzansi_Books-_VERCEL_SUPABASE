# PAYSTACK SUBSCRIPTION AUTOMATION - COMPREHENSIVE IMPLEMENTATION PROMPT

## CONTEXT & GOAL

Implement a fully automated Paystack subscription system for MOK Mzansi Books that handles monthly/annual billing cycles without requiring manual user payments. The system must automatically charge customers based on their selected plan and manage the complete subscription lifecycle from trial to active to grace to locked states.

## PAYSTACK CONFIGURATION (DEVELOPMENT)

**CRITICAL: Use Test Keys Only During Development**

- **Test Secret Key:** `sk_test_[YOUR_PAYSTACK_TEST_SECRET_KEY]`
- **Test Public Key:** `pk_test_[YOUR_PAYSTACK_TEST_PUBLIC_KEY]`
- **Live Secret Key:** `sk_live_[YOUR_PAYSTACK_LIVE_SECRET_KEY]` (PRODUCTION ONLY)
- **Live Public Key:** `pk_live_[YOUR_PAYSTACK_LIVE_PUBLIC_KEY]` (PRODUCTION ONLY)

**Environment Variables to Update:**

```bash
# Update .env.local with test keys
# Server-only secret key (do NOT prefix with VITE/NEXT_PUBLIC)
PAYSTACK_SECRET_KEY_TEST="sk_test_[YOUR_TEST_SECRET_KEY]"

# Client-safe public key (used in frontend, ok to prefix)
VITE_PAYSTACK_PUBLIC_KEY_TEST="pk_test_[YOUR_TEST_PUBLIC_KEY]"
```

Note: Never use `VITE_` or `NEXT_PUBLIC_` prefixes for secrets. Public prefixes embed values into the client bundle.

## SUBSCRIPTION LIFECYCLE & BUSINESS RULES

### 1. CANONICAL SUBSCRIPTION OBJECT

Maintain single authoritative subscription record per user/company:

```typescript
interface SubscriptionRecord {
  companyId: string;
  userId: string;
  plan: "trial" | "monthly" | "annual" | "none";
  state: "trial" | "active" | "grace" | "locked" | "canceled";
  trialStartDate: Date;
  trialEndDate: Date;
  startDate: Date;
  nextBillingDate: Date;
  scheduledCancel: boolean;
  cancelEffectiveDate: Date | null;
  scheduledPlanChange: { newPlan: string; effectiveDate: Date } | null;
  graceStartDate: Date | null;
  graceRetryCount: number;
  paymentHistory: PaymentRecord[];
  providerCustomerRef: string; // Paystack customer ID
  providerAuthorizationRef: string; // Payment method authorization
  providerSubscriptionRef: string; // Paystack subscription ID
}
```

### 2. TRIAL BEHAVIOR (30 Days)

- **New users start in `trial` state with 30-day countdown**
- **Cancel button DISABLED/HIDDEN during trial**
  - Show tooltip: "Cancel not available during free trial"
  - Log attempt: `{"event":"subscription.cancel_attempt","user":"email","state":"trial","timestamp":"..."}`
- **Payment during trial:**
  - SUCCESS: Immediately convert to `active`, set `startDate = paymentDate`, `nextBillingDate = startDate + interval`
  - FAILURE: Remain in `trial`, continue normal countdown

### 3. ACTIVE SUBSCRIPTION AUTO-RENEWAL

- **On `nextBillingDate`, automatically attempt charge using stored authorization**
- **SUCCESS:** Update `paymentHistory`, set `nextBillingDate += interval`, log `subscription.renewed`
- **FAILURE:** Transition to `grace` state, set `graceStartDate = today`, `graceRetryCount = 0`

### 4. GRACE PERIOD (5 Days)

- **Daily auto-retry for up to 5 attempts**
- **Show banner:** "Payment not successful. We'll retry automatically for X days"
- **Daily email:** "Payment retry failed – Update card or pay now"
- **SUCCESS during grace:** Convert to `active`, clear `graceStartDate`, update `nextBillingDate`
- **5 failures:** Transition to `locked` state

### 5. LOCKED STATE

- **Disable features:** My Company, Clients, Quotations, Invoices, Projects, Inventory, HR, Accounting
- **Show padlock icons and banner:** "Please upgrade to access all pages – Upgrade Now"
- **Allow immediate payment to restore access**

### 6. CANCEL/RESUME (SCHEDULED)

- **Cancel for `active` users is SCHEDULED, not immediate:**
  - Set `scheduledCancel = true`, `cancelEffectiveDate = nextBillingDate`
  - Keep access until `cancelEffectiveDate`
  - Show: "Canceled (effective [date])"
  - Log: `subscription.canceled_scheduled`
- **Resume before effective date:**
  - Clear `scheduledCancel` and `cancelEffectiveDate`
  - Keep `nextBillingDate` unchanged
  - Log: `subscription.resumed`

### 7. PLAN CHANGES (SCHEDULED)

- **Mid-cycle plan changes are scheduled for `nextBillingDate`**
- **Set `scheduledPlanChange = { newPlan, effectiveDate: nextBillingDate }`**
- **Show:** "Plan change scheduled – New plan starts [date]"
- **On effective date:** Change `plan`, update `nextBillingDate`, apply new pricing

## PAYSTACK INTEGRATION REQUIREMENTS

### 1. PAYSTACK PLANS SETUP

```typescript
// Create or verify Paystack plans
const PAYSTACK_PLANS = {
  monthly: {
    plan_code: "PLN_monthly_mok",
    name: "Monthly Subscription",
    amount: 6000, // R60.00 in kobo
    interval: "monthly",
  },
  annual: {
    plan_code: "PLN_annual_mok",
    name: "Annual Subscription",
    amount: 68400, // R684.00 in kobo (5% discount)
    interval: "annually",
  },
};
```

### 2. SUBSCRIPTION CREATION FLOW

```typescript
// On initial payment success:
1. Create Paystack customer if not exists
2. Save authorization code from payment
3. Create Paystack subscription using plan_code
4. Store providerCustomerRef, providerAuthorizationRef, providerSubscriptionRef
5. Update local subscription record to 'active'
```

### 3. AUTO-RENEWAL IMPLEMENTATION

```typescript
// Background worker (daily job):
1. Find subscriptions with nextBillingDate = today
2. For each subscription:
   - Use stored authorization to charge via Paystack
   - Verify payment with Paystack verify endpoint
   - Update subscription record based on result
   - Handle grace period logic for failures
```

### 4. PAYSTACK API CALLS

```typescript
// All API calls must include:
headers: {
  'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json'
}

// Key endpoints:
- POST /customer - Create customer
- POST /subscription - Create subscription
- POST /transaction/charge_authorization - Charge saved card
- GET /transaction/verify/:reference - Verify payment
- POST /subscription/:code/manage/link - Get management link
```

## IMPLEMENTATION TASKS

### 1. UPDATE ENVIRONMENT CONFIGURATION

- Switch to Paystack test keys in `.env.local`
- Update `src/lib/paystack.ts` to use test configuration
- Ensure no live keys in development

### 2. ENHANCE PAYSTACK SERVICE

- Extend `src/services/paystackService.ts` with:
  - Customer creation
  - Subscription management
  - Authorization charging
  - Payment verification
  - Webhook handling

### 3. IMPLEMENT BACKGROUND WORKER

- Create/enhance `src/jobs/billingJobs.ts`:
  - Daily billing cycle checks
  - Auto-renewal attempts
  - Grace period retries
  - State transitions
  - Email notifications

### 4. UPDATE SUBSCRIPTION HOOK

- Enhance `src/hooks/useSubscription.ts`:
  - Add scheduled cancellation logic
  - Add plan change scheduling
  - Add grace period handling
  - Add proper state management

### 5. UPDATE BILLING UI

- Modify `src/components/settings/BillingSubscriptionTab.tsx`:
  - Add cancel/resume confirmation modals
  - Show scheduled cancellation status
  - Display grace period warnings
  - Add plan change scheduling UI
  - Implement feature locking indicators

### 6. IMPLEMENT EMAIL TEMPLATES

- Create email templates in `src/emails/templates/`:
  - Trial reminder (5 days left)
  - Grace period retry notices
  - Payment success receipts
  - Final lock notices
  - Cancellation confirmations

### 7. ADD WEBHOOK HANDLING

- Enhance `src/pages/api/paystack-webhook.ts`:
  - Handle subscription events
  - Process payment failures
  - Update subscription states
  - Trigger email notifications

## CONFIGURATION CONSTANTS

```typescript
export const BILLING_CONFIG = {
  TRIAL_DAYS: 30,
  GRACE_DAYS: 5,
  MONTHLY_DAYS: 31,
  ANNUAL_DAYS: 365,
  MONTHLY_PRICE: 6000, // kobo
  ANNUAL_PRICE: 68400, // kobo (5% discount)
  MAX_RETRY_ATTEMPTS: 5,
  RETRY_INTERVAL_HOURS: 24,
};
```

## LOGGING REQUIREMENTS

Log all events as structured JSON:

```typescript
// Required log events:
-subscription.cancel_attempt -
  subscription.canceled_scheduled -
  subscription.resumed -
  subscription.renewed -
  subscription.enter_grace -
  subscription.enter_locked -
  subscription.plan_change_scheduled -
  payment.attempt -
  payment.success -
  payment.failure -
  email.sent;

// Log format:
console.log(
  JSON.stringify({
    event: "subscription.renewed",
    userId: "user_123",
    companyId: "comp_456",
    plan: "monthly",
    amount: 6000,
    nextBillingDate: "2024-02-15",
    timestamp: new Date().toISOString(),
  }),
);
```

## ACCEPTANCE TESTS

Implement and verify these scenarios:

1. **Trial Payment Success:** Trial user pays → becomes Active immediately
2. **Trial Payment Failure → Grace:** Payment fails → enters Grace → daily retries → success/lock
3. **Active Renewal Success:** Auto-renewal succeeds → nextBillingDate updated
4. **Active Renewal Failure:** Auto-renewal fails → enters Grace → follows grace logic
5. **Cancel Scheduling:** Active user cancels → scheduledCancel set → access maintained until effective date
6. **Resume Subscription:** User resumes before effective date → cancellation cleared
7. **Plan Change Scheduling:** User changes plan → scheduled for nextBillingDate
8. **Locked Recovery:** Locked user pays → becomes Active → features unlocked
9. **Idempotency:** Multiple payment attempts create only one charge
10. **Persistence:** All states persist across page reloads

## SECURITY & BEST PRACTICES

- **Never expose secret keys in client-side code**
- **Use server-side API routes for all Paystack calls**
- **Implement proper error handling and logging**
- **Use Paystack idempotency keys for charge attempts**
- **Validate webhook signatures**
- **Sanitize and validate all user inputs**
- **Implement rate limiting on payment endpoints**

## DELIVERABLES

After implementation, provide:

1. **`acceptance_checklist.md`** - Test results (PASS/FAIL with notes)
2. **`console_logs_sample.json`** - 10+ structured log examples
3. **`payment_history_test.json`** - Sample payment records after tests
4. **`files_modified.txt`** - List of updated files
5. **`remediation_notes.md`** - Any issues found and fixes applied
6. **`email_templates/`** - HTML email templates
7. **`verification_steps.md`** - Instructions to re-run tests

## CRITICAL IMPLEMENTATION NOTES

1. **INSPECT EXISTING CODE FIRST** - Review current subscription logic before making changes
2. **NO DUPLICATE IMPLEMENTATIONS** - Extend existing services, don't create parallel ones
3. **LOCAL DEVELOPMENT ONLY** - Keep all changes local until production deployment
4. **PRESERVE UI/UX** - Maintain existing Apple Sequoia theme and patterns
5. **FOLLOW PAYSTACK DOCS** - Use official Paystack documentation as reference
6. **TEST THOROUGHLY** - Run all acceptance tests before marking complete

## PAYSTACK DOCUMENTATION REFERENCES

- **Main Docs:** https://paystack.com/docs/
- **API Reference:** https://paystack.com/docs/api/
- **Subscriptions:** https://paystack.com/docs/subscriptions/
- **Recurring Charges:** https://paystack.com/docs/recurring-charges/
- **Webhooks:** https://paystack.com/docs/webhooks/

---

**EXECUTE THIS IMPLEMENTATION NOW:**

1. Switch to test keys and verify Paystack configuration
2. Implement automated billing worker and subscription lifecycle
3. Update UI components with proper cancel/resume/grace handling
4. Create email templates and notification system
5. Run comprehensive acceptance tests
6. Document all changes and provide deliverables

**Remember: This is a subscription-based SaaS that must automatically charge customers without manual intervention. The system must handle the complete lifecycle from trial through active billing to cancellation with proper grace periods and recovery mechanisms.**
