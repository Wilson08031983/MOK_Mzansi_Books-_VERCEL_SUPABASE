```
LOCATION:
accounting & billing flows — Settings Page > Billing (settings?tab=billing), Dashboard page top bar, Signup/Verification flows, Notification system, Payment History, and subscription background worker (local only).

GOAL (single copy-and-paste instruction for AI / dev environment):
Implement and fully verify the complete subscription lifecycle and edge-case behavior described below. This must be done locally (local backend / localStorage or local DB) until development is complete. Reference existing code before changing anything; avoid duplicating files, functions, or backends. Match the site theme and keep all UX consistent.

GENERAL RULES (read before executing):
- ALWAYS inspect existing implementations first. Update only if required. Do not duplicate files/functions or create parallel backends.
- Keep all changes local-only for now. We will migrate to Supabase later.
- Avoid hard-coded values unless explicitly listed below. Use config/constants that can be adjusted.
- Log all key events to console (@web-context:console-logs) with structured messages for debugging.
- Preserve theme and styling; do not change UX patterns unless needed for this feature.

CONFIG / CONSTANTS (use as reference, but keep configurable):
- Trial length = 30 days (countdown 30 → 0)
- Grace period length = 5 days (countdown 5 → 0)
- Monthly billing cycle = 31 days (R60.00)
- Annual billing cycle = 365 days (R684.00; 5% discount)
- Payment retries: once per day during grace period (5 attempts)
- Payment provider (test keys only for now): Paystack public test key provided in previous docs — use test environment for all dev testing.

FEATURE SPEC — subscription & decline handling (detailed)

1) Immediate behavior when user pays during trial
- If user on Free 30-Day Trial initiates payment and the payment AUTHENTICATES & CONFIRMS success from Paystack:
  - Immediately:
    - Cancel/stop trial countdown banner and strip on Dashboard TopBar.
    - Update user's subscription state to `active` with fields: planType (`monthly` or `annual`), startDate = paymentDate, nextBillingDate = startDate + cycleDays (31 or 365).
    - Update UI everywhere: TopBar status, Settings > Billing Overview, Current Plan, Billing Cycle, Payment History.
    - Remove trial feature limits immediately and grant full paid feature access (unlimited items, invoices, etc.).
    - Create a Payment History record (local) with {id, userId, amount, currency, date, providerRef, planType, status: "successful"}.
    - Redirect flow: Payment success → ThankYou.tsx → auto-redirect to Dashboard (or button) and confirm unlocked features.
    - Send Confirmation Email (Payment Receipt) and Dashboard notification (Bell).
  - If any step fails (e.g., missing confirmation or mismatch), rollback UI state to trial and surface a clear error and log console.

- If the payment ATTEMPT fails (declined) while on trial:
  - Keep the user on trial state (do NOT convert to subscriber).
  - Do NOT decrement or change trial days except the normal daily countdown.
  - If the trial would end with no successful payment, the next phase below applies (grace).

2) Trial end → grace period behavior
- When trial countdown reaches 0 (trial end) and there is NO successful payment:
  - Transition user to `grace` state for 5 days. Record graceStartDate.
  - During grace:
    - Try to re-charge / re-initiate payment once per day automatically (attempt up to 5 times).
    - Send an email on each retry attempt if it fails, and also show a Dashboard bell notification with “Payment retry failed — Update card or pay now” and a link to Billing → Overview → Payment Method.
    - Show the Dashboard top strip message changed from trial text to: `"The payment was not successful. We'll retry automatically for the next X days."` where X is remaining grace days.
    - Allow user to manually retry payment via a prominent "Pay Now" / "Update Card" CTA.
  - If payment succeeds during grace:
    - Immediately convert to active subscriber (monthly/annual); unlock features; stop retries; record payment history; send success email; remove padlocks/banners.
  - If grace period expires (after 5 failed attempts):
    - Transition user to `locked` state:
      - Lock navigation items: My Company, Clients, Quotations, Invoices, Projects, Inventory, HR Management, Accounting — show padlock icon and disable interactions (still visible).
      - Only Dashboard remains accessible (view-only) with a top banner: `"Please upgrade to access all pages — Upgrade Now"` and a notification bell entry: `"Update Card Details"` linking to Settings → Billing → Overview → Payment Method → Update.
      - Stop automated retries and stop reminder emails (unless user re-initiates payment).
      - Record final failure in Payment History and log console.

3) Payment declines for existing subscribers at renewal time
- If user is an active subscriber (monthly or annual) and scheduled auto-renewal attempt fails on billing date:
  - Put user into grace state for 5 days, same retry policy (once per day).
  - Show banner and bell notifications as above.
  - If payment succeeds during grace, restore normal active state and extend nextBillingDate accordingly.
  - If payment fails after grace, move to `locked` state as described.

4) Changing plans mid-cycle
- If active subscriber requests plan change (monthly ↔ annual) mid-cycle:
  - Do NOT switch immediately.
  - Schedule plan change to take effect at nextBillingDate (end of current paid period).
  - Show UI feedback: `"Plan change scheduled — New plan will start on [nextBillingDate]"`.
  - If user cancels scheduled change before nextBillingDate, allow cancellation.
  - Do NOT prorate or immediately charge unless explicitly requested; for now, implement schedule-at-next-billing behavior.

5) Prevent re-entry to trial after subscription
- Users who have been paid subscribers (ever) must not be allowed to re-enter the Free 30-Day Trial again. Enforce at signup/login flows.

6) UI & Dashboard visuals / status rules
- TopBar statuses MUST reflect exact state:
  - Trial: `Free | 30 Days` (countdown)
  - Active monthly: `Paid | Monthly`
  - Active annual: `Paid | Annual`
  - Grace: `Payment retry: X days left` (or similar)
  - Canceled: `Canceled | Monthly` (and show active until date)
  - Locked: show padlocks and banner message instructing payment
- Dashboard trial/strip behavior:
  - While trial active: `"X days left in your trial — Upgrade Now"` (with CTA to pay)
  - During grace: `"Payment was not successful. We'll retry automatically for the next X days."`
  - Locked: `"Please upgrade to access all the pages — Upgrade Now"` (with CTA)
- Settings → Billing Overview must always show:
  - Current Plan (Trial/Monthly/Annual/Canceled/Locked)
  - Billing Cycle (Trial/Monthly/Annual)
  - Next Billing Date (calculated)
  - Payment Method (card last4; update button)
  - Payment History (list)
- Payment History: each transaction logged locally including failures and retries.

7) Feature access control rules
- Trial users: enforce limits (5 invoices, 5 quotations, 5 clients, 5 projects, 5 inventory items, 5 suppliers, 5 storage locations).
- Paid users (monthly/annual): remove limits immediately upon activation; grant full features and optional premium perks (priority support, analytics, 5% discount on certain items if applicable).
- Canceled but still within paid period: continue paid access until end of paid cycle. Only after end of cycle and failed renewal (or user chosen cancel immediate) revert to trial/locked behavior.
- Locked users: navigation items disabled but visible. Show information on how to restore via payment.

8) Email & Notification templates (must be created and used)
- 5 Days Left Trial Reminder (email + dashboard bell):
  - Include company logo, signature block (Wilson Mokgethwa Moabelo ... contact details), payment CTA link to payment page.
- 5-Day Grace Period Reminder (daily during grace) — failure notification + link to update card / pay now.
- Payment Success Receipt (after successful charge) — include invoice/receipt, plan, amount, date, next billing date.
- Payment Failed / Final Lock Notice (at end of grace) — instructions to restore access.
- All templates must reuse the same design and branding (fonts, logo, signature) as existing Welcome/Invoice templates.
- Log every email send to console with structured message.

9) Data persistence & local processes
- Store subscription state and counters in local DB/localStorage keyed to company/user (do not share across users).
- Store trialStartDate, trialEndDate, subscription records, paymentHistory, graceStartDate, scheduledPlanChange.
- Implement a local background worker or scheduled job (dev environment) that:
  - Updates day-based countdowns (trial & grace) once per day (or simulate fast-forward time in tests).
  - Attempts auto-charge each morning of grace.
  - Updates nextBillingDate when successful charges occur.
  - Ensures no cross-user data contamination.

10) Logging & debugging
- Every state change should log to console: `{"event":"subscription.change","user":"<email>","companyId":"<id>","from":"<oldState>","to":"<newState>","timestamp":...}`.
- Every payment attempt should log: `{"event":"payment.attempt","user":"<email>","amount":X,"plan":"monthly/annual","providerRef":"...", "status":"success|failed", "timestamp":...}`.
- Every retry attempt during grace must be logged.

11) Testing & acceptance criteria (run these after implementation)
- Test A: User on trial pays mid-trial and payment SUCCESS → immediately unlocked; Payment History shows transaction; trial banner gone; Settings shows Paid/Monthly (or Annual); features unlimited.
- Test B: User on trial pays mid-trial and payment FAILS → user remains on trial; trial countdown continues; if payment not retried successfully before trial end → enters grace; retries daily.
- Test C: Trial ends with no payment → user enters grace; retries happen daily; emails sent; if success during grace → unlock; if fail after 5 retries → locked state with padlocks and notice.
- Test D: Active monthly user changes plan to annual mid-cycle → UI shows scheduled change; plan switch occurs only on nextBillingDate.
- Test E: Renewal attempt for active subscriber fails → enters grace; behavior as above.
- Test F: Locked user updates card and pays → immediate unlock; payment history records success and nextBillingDate set correctly.
- For each test, verify console logs, Payment History entries, Settings → Billing UI, Dashboard top strip, Notification Bell messages, and actual feature access (create invoices beyond trial limits etc.).

12) Edge cases & additional rules
- Do not allow purchase actions that would produce duplicate subscriptions. If user clicks pay multiple times, handle idempotency via provider reference and record only one successful transaction.
- When scheduling plan changes, surface both previous and next plan in UI with exact effective date.
- If user cancels and then re-subscribes during the same paid period, reconcile dates correctly (extend subscription based on new payment).
- Provide admin dev-only override (local only) to simulate payment success/failure for testing.

13) Implementation notes for devs (non-invasive)
- Inspect existing subscription/trial code paths and update the state machine to include states: `trial`, `active`, `grace`, `locked`, `canceled`, `scheduled-change`.
- Use a single canonical subscription record per company stored locally; UI reads from that authoritative source.
- Ensure notifications and company details are scoped per user/company only (no cross-company leakage).

DELIVERABLE (what to return)
- Implement the full flow locally and run acceptance tests A–F.  
- Provide a short debug summary with:
  - Sample console logs for 3 events: payment success, payment failure, grace retry.
  - Payment History snapshot for test user(s).
  - The checklist of Acceptance Criteria with ✓/✗ for each.
  - Any edge cases found and how you resolved them.

---

IMPORTANT: Before executing any changes, open and inspect the related files referenced by previous prompts to avoid duplication. Make changes only where needed and preserve the existing theme and UX. Local backend only until we complete development.
```
LOCATION:
Entire app (local dev) — Billing/Subscriptions logic and UI:
- Dashboard (top bar & trial strip)
- Settings > Billing (settings?tab=billing) Overview & Plans/Payment pages
- Notification Bell (dashboard)
- Payment History panel
- Navigation menu (padlock UI)
- Local backend storage (localStorage / local DB)
- Paystack integration (test keys)

GOAL (single copy-and-paste instruction for AI / dev environment):
Implement complete, robust subscription & trial state machine and UI behavior for 3 plans (30-day free trial, Monthly R60, Annual R684) with precise handling for: successful payments, declined payments during trial, declined payments during billing, 5-day grace period retries, scheduled plan changes (take effect next billing date), lockout after grace, immediate feature unlocking after payment, persistence (local only), email + in-app notifications, and detailed console logging for debugging. Do not duplicate existing functions/files — inspect current implementation and update only where required. All work must be local-only; later this will be copied to Supabase.

IMPORTANT RULES BEFORE EXECUTION:
1. Inspect existing billing/subscription files and flows. Update or extend; DO NOT create duplicate endpoints or services. 
2. Keep backend local (localStorage / local DB). Use a single subscription record per company/user.
3. Keep UI theme (Apple Sequoia style). Avoid hard-coded values; use centralized config for plan prices and intervals.
4. Make all behavior reversible in tests—provide a checklist of completed tasks and console logs.
5. Do full testing at the end of implementation (see acceptance tests).

CORE DATA MODEL (persist locally per company / user):
Store a `subscription` object keyed to the company (e.g., `subscription.<companyId>`) with:
{
  id: string,
  userEmail: string,
  companyId: string,
  plan: "trial" | "monthly" | "annual",
  planId: string, // e.g., "trial-30", "monthly-31", "annual-365"
  price: number,
  currency: "ZAR",
  status: "trial" | "active" | "grace" | "locked" | "canceled" | "pending_change",
  trialStartAt: ISODate | null,
  trialEndsAt: ISODate | null,
  startAt: ISODate | null, // date when paid subscription became active
  nextBillingAt: ISODate | null,
  billingCycleDays: number, // 31 or 365
  pendingPlanChange: { plan:"monthly"|"annual", effectiveAt: ISODate } | null,
  graceEndsAt: ISODate | null,
  paymentAttempts: number, // daily attempts during grace
  lastPaymentAttemptAt: ISODate | null,
  paymentHistory: [ { id, amount, currency, plan, date, status, method, reference } ],
  cancelAtPeriodEnd: boolean // if user canceled
}

EVENTS AND BUSINESS RULES (implement exact flows):

A. Trial signup
- On verified signup (email verified), create subscription record:
  - plan = "trial"
  - trialStartAt = now
  - trialEndsAt = trialStartAt + 30 days
  - status = "trial"
  - billingCycleDays = null until paid
- Dashboard: show Trial Strip: “30 days left in your trial — Upgrade Now”
- TopBar: show `❌ Free | 30 Days` (computed from trialDaysLeft)
- Feature limits enforced (5 per category). Enforce checks on create actions server-side / local-backend.

B. User chooses to pay during trial (immediate purchase flow)
- When user initiates payment (Paystack) and payment is **successful**:
  - Create payment record and append to `paymentHistory`.
  - Set `plan` = "monthly" or "annual" per selection.
  - Set `price` to plan price (R60 or R684).
  - Set `startAt` = now.
  - billingCycleDays = 31 or 365.
  - nextBillingAt = startAt + billingCycleDays.
  - status = "active"
  - Remove trial banner & trial countdown.
  - Unlock all features immediately (remove restrictions).
  - Update UI badges: `✅ Paid | Monthly` or `✅ Paid | Annual`.
  - Add entry in Payment History UI.
  - Redirect user to `ThankYou.tsx` then automatically to Dashboard (ensure payment validation confirmed by Paystack before redirect).
  - Send Welcome/Subscription Confirmation email (use same email template style).
- If payment **fails/declines** during the trial:
  - Do NOT switch plan or status. Keep status = "trial".
  - Do NOT deduct trial days. Trial continues until trialEndsAt.
  - Record the failed attempt in `paymentHistory` with status = "failed".
  - Do not start grace period now. The grace period starts only after trial ends with no successful payment (see section D).

C. Trial end → grace & lockout
- When `now >= trialEndsAt` and there is NO successful payment:
  - Enter `grace` period:
    - status = "grace"
    - graceEndsAt = now + 5 days
    - paymentAttempts = 0
  - On entering `grace`, trigger:
    - Start automated daily debit attempts (1 per day): implement a local scheduler or a retry-on-login + daily attempt mechanism.
    - Daily email reminder (Day 1..5) with payment link (use the 5-day Grace Email Template).
    - On UI: replace Trial Strip with “Your trial has ended — Payment retry in progress. X days left to pay or account will be limited.”
- During `grace`:
  - Each scheduled attempt:
    - Attempt charge via Paystack.
    - Log attempt timestamp and outcome in `lastPaymentAttemptAt` and `paymentAttempts`.
    - If attempt **succeeds**:
      - status = "active"
      - setup subscription fields as in B (startAt=now, nextBillingAt = now + billingCycleDays)
      - stop retries and clear grace fields
      - unlock features and update UI
      - send Payment Success email
      - stop further retries
    - If attempt **fails**:
      - continue until `graceEndsAt` or until 5 attempts completed (whichever business logic prefers).
- If `now >= graceEndsAt` and still no successful payment:
  - status = "locked"
  - lock application features: apply padlock UI to navigation items: My Company, Clients, Quotations, Invoices, Projects, Inventory, HR Management, Accounting (make these visible but disabled).
  - Keep Dashboard accessible (read-only) — show banner: “Please upgrade to access all pages — Upgrade Now” with payment link.
  - Notification Bell shows “Update Card Details / Pay Now” with link to Settings → Billing → Overview → Payment Method.
  - Stop automated retries and stop reminder emails.

D. Declined payment during an **active subscription renewal** (mid-cycle)
- If renewal (nextBillingAt) charge fails:
  - Immediately set status = "grace", graceEndsAt = now + 5 days, paymentAttempts = 0
  - Do daily retry attempts as in C.
  - During grace the user retains access until graceEndsAt (unless policy chooses to lock earlier; follow rules above).
  - If retry succeeds within grace: restore status=active and compute nextBillingAt = attemptDate + billingCycleDays.
  - If retry fails after grace: status="locked" and lock UI as above.

E. Scheduled Plan Changes (user requests plan switch mid-cycle)
- If user requests plan change from Monthly → Annual or Annual → Monthly during an active cycle:
  - Do NOT apply immediately. Save `pendingPlanChange` with `effectiveAt = nextBillingAt` and `pendingPlanChange.plan = requestedPlan`.
  - Set UI indicator: "Plan change scheduled — will take effect on [nextBillingAt]".
  - At nextBillingAt, when renewal happens:
    - If payment for pendingPlanChange succeeds, set plan to pendingPlanChange.plan, update price & billingCycleDays, set nextBillingAt = now + newCycleDays, status=active.
    - If payment fails, follow decline/retry flow.
  - Optional: show prorate note in UI (do not implement automatic prorating unless requested).

F. Cancellation & Resumption
- If user cancels:
  - Set `cancelAtPeriodEnd = true` and display: `❌ Canceled | Monthly (Active until [nextBillingAt])`
  - Do NOT revoke access immediately; allow access until nextBillingAt.
- If user resumes before period end:
  - Clear `cancelAtPeriodEnd` and keep status active.
- If user resumes after cancellation & lock:
  - Process payment to reactivate subscription; if successful set status=active and nextBillingAt accordingly.

G. Prevent returning to trial
- Once a user has been on a paid plan (monthly or annual), they MUST NOT be allowed to revert to the free trial. Implement validation: if subscription has ever been active and has paymentHistory entries with a successful payment, block trial signup for that company/email.

H. UI updates & messages (exact)
- Dashboard TopBar statuses:
  - Trial: `❌ Free | {daysLeft} Days` (countdown).
  - Active monthly: `✅ Paid | Monthly`
  - Active annual: `✅ Paid | Annual`
  - Grace: `⚠️ Payment retry — {graceDaysLeft} days left`
  - Locked: `🔒 Access limited — Please upgrade`
  - Canceled (period end): `❌ Canceled | Monthly (active until [date])`
- Dashboard Trial/Upgrade Strip:
  - On Trial: `"{n} days left in your trial — Upgrade Now"`
  - On Grace: `"Payment failed. We'll retry for {n} days — Upgrade Now"`
  - On Locked: `"Please upgrade to access all pages — Upgrade Now"`
- Settings > Billing > Overview:
  - Current Plan: show plan label and status.
  - Billing Cycle: show Monthly/Annual and nextBillingAt date.
  - Payment Method: show card details (masked) and Update button.
  - Payment History: list all payments (success/fail) with reference & date.
  - Plans tab: show same purchase UI as Payment page.
- Payment History UI must update immediately after payment attempts (success or fail).
- Lock/padlock behavior: show disabled menu items with padlock icon and tooltip linking to payment page.

I. Email templates & notifications
- Create templates (same visual style: logo, signature, fonts):
  - Welcome + Trial Started (on verification)
  - 5 Days Trial Reminder (“{5 days left}”) — link to payment page
  - Payment Success / Subscription Confirmation
  - Payment Failed (on retry) — daily during grace with payment link
  - Grace Period Entered — explain retries & final date
  - Account Locked — explain how to pay & restore access
  - Cancellation Confirmation
- Include company signature block exactly:
  Wilson Mokgethwa Moabelo  
  Founder & CEO  
  MOK Mzansi Books  
  support@mokmzansibooks.com  
  +27 64 550 4029  
  81 Monokane Street  
  Atteridgeville x17  
  Pretoria, Gauteng 0006

J. Payment integration (local test mode)
- Use Paystack test key for integration testing:
  VITE_PAYSTACK_PUBLIC_KEY_TEST="pk_test_d5c14a62cfaaa02caddf47664211e275bebc4c7a"
- Ensure server-side / local validation of Paystack success event (do not rely solely on client-side callback).
- For idempotency: store payment reference and ignore duplicate success callbacks for same reference.

K. Logging (console + local audit)
- Log structured events to console and local audit:
  console.log(JSON.stringify({
    event: "subscription.change" | "payment.attempt" | "payment.success" | "payment.failed",
    companyId, userEmail, plan, status, amount, reference?, timestamp: new Date().toISOString()
  }))
- Log transitions: trial->active, trial->grace, grace->locked, active->pending_change, pending_change->active.

L. Feature gating enforcement
- Implement centrally-check function `canPerform(action, companyId)` which checks subscription.status and plan and returns allow/deny with reason. Use for creating invoices, clients, projects, inventory, suppliers, storage locations, etc.
- On paid status -> allow all actions. On trial -> enforce 5 limit per category. On locked -> allow only dashboard read.

M. Persistence & recovery
- Ensure subscription state persists across reloads and multiple sessions:
  - localStorage keys: `subscription.<companyId>`, `paymentHistory.<companyId>`
  - On app load, validate nextBillingAt/trialEndsAt/graceEndsAt and perform scheduled transitions if required (e.g., if app was offline for days, evaluate and move state forward).

N. Acceptance Tests / QA Scenarios (run all locally)
1. New signup (verify email link) → subscription object created as trial with trialEndsAt = now+30d. TopBar shows Free 30 days. Notification bell shows welcome popup. (Log event)
2. During trial: user pays Monthly successfully:
   - Payment recorded
   - subscription.status = active; plan=monthly; nextBillingAt = now+31d
   - Trial strip removed; features unlocked
   - Payment history shows success
   - Redirect flow: Paystack success -> ThankYou.tsx -> Dashboard
   - (Log events)
3. During trial: user attempts payment but it fails:
   - subscription remains trial
   - failed payment added to paymentHistory
   - Trial continues until trialEndsAt
   - If user never pays, after trialEndsAt system enters grace
4. End of trial with no payment:
   - status -> grace, graceEndsAt = now+5d
   - daily retry attempts simulate failing for 5 days -> after graceEndsAt status->locked and UI padlocks appear, banner shown, notification bell contains payment link.
5. Active monthly subscription renewal fails on billing date:
   - status -> grace, graceEndsAt now+5d
   - daily retry attempts; if one succeeds, status->active and nextBillingAt recalculated
   - if all fail -> locked state per rules
6. Plan change mid-cycle:
   - user requests monthly->annual mid-cycle -> pendingPlanChange stored with effectiveAt = current nextBillingAt; UI indicates scheduled change; nothing about pricing or limits changes until effectiveAt
7. Cancellation:
   - user cancels -> cancelAtPeriodEnd true and UI shows canceled until nextBillingAt (with continued access)
8. Locked user pays via manual payment link:
   - payment success reactivates subscription, status -> active, nextBillingAt set accordingly, padlocks removed, log events
9. Ensure cannot re-enter trial after ever having successful paid subscription
10. Edge cases: duplicate Paystack callback (same reference) should be idempotent; stale local state recovery after reload should process pending transitions.

O. Developer notes & safety
- Do not remove or alter Admin user flows. Keep admin privileges intact.
- Avoid duplicating backend services—extend or modify existing subscription service/file.
- Keep all UI changes consistent with Apple Sequoia theme.
- Provide a final checklist (A→N) with ticks and sample console logs demonstrating each major state transition for the provided test user:
  - Test user: mokgethwamoabelo@icloud.com (use in test scenarios)

DELIVERABLE (after implementing)
1. Full subscription state machine implemented locally with persistence.  
2. All UI indicators (TopBar badge, Dashboard strip, Settings Overview, Payment History) reflect live subscription state.  
3. Email templates created and ready for local send (Resend API key wired but use local send simulation for testing).  
4. Console audit logs for events and sample logs for acceptance tests.  
5. A final ticked checklist showing each acceptance test passed and a short debug summary including paymentHistory entries for the test user.

```
