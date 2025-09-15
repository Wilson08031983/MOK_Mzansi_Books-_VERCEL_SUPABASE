FULLY AUTOMATE SUBSCRIPTIONS (PAYSTACK) — LOCAL DEV ONLY\*\*

**Context / Goal**
This SaaS app is subscription-based (Monthly / Annual). Implement a robust, automatic subscription system that charges customers automatically based on their selected plan (monthly or annual) without requiring manual user payments during renewal or grace. Use Paystack in test mode for all development and tests. Preserve existing Cancel/Resume and plan-change UI/UX already implemented, but make them behave exactly as defined in previous prompts (trial rules, cancel scheduling, grace, locked state, etc.). Keep everything local; do not push live keys or production data during development.

**Paystack Configuration (DEV/Test)**

- **Test Secret Key (DEV only):** `sk_test_[YOUR_PAYSTACK_TEST_SECRET_KEY]`
- **Live Secret Key (production only):** `sk_live_[YOUR_PAYSTACK_LIVE_SECRET_KEY]` (do NOT use live key in dev)
- All Paystack API calls must include: `Authorization: Bearer <SECRET_KEY>` header. Do not expose secret keys in client-side bundles. Use server-side local worker or secure local server to call Paystack. Follow Paystack docs: [https://paystack.com/docs/](https://paystack.com/docs/) and [https://paystack.com/docs/api/](https://paystack.com/docs/api/) for plan/subscription/charge/verify flows.

**High-level Requirements (read carefully)**

1. Use Paystack **test** key only while developing. Simulate webhooks locally or poll verify endpoints after charge attempts. Make webhook handling optional in dev but include stub and instructions for enabling real webhooks in production.
2. Automate initial charge authorization and recurring billing:
   - On initial subscription (user enters card), obtain and store Paystack customer & authorization details (or create subscription using Paystack plans).
   - Use Paystack subscription/recurring charge flows so renewals are attempted automatically by Paystack where appropriate, otherwise schedule local auto-charge attempts using stored authorization (dev-only).

3. Implement full subscription lifecycle: `trial` → `active` → `grace` → `locked` (or `canceled` with scheduled effective date) and `scheduled-plan-change`.
4. Keep canonical subscription record per company/user in local DB/localStorage per previous prompt schema. No cross-company sharing.

**Detailed Functional Requirements**

A. **Subscription States & Canonical Object**
Maintain a single authoritative subscription object per company (example fields — store exactly these keys in a single record):

```
{
  companyId,
  userId,
  plan: "trial" | "monthly" | "annual" | "none",
  state: "trial" | "active" | "grace" | "locked" | "canceled",
  trialStartDate, trialEndDate,
  startDate,
  nextBillingDate,
  scheduledCancel: boolean,
  cancelEffectiveDate,           // when scheduled cancel will take effect
  scheduledPlanChange: { newPlan, effectiveDate } | null,
  graceStartDate,
  paymentHistory: [ { id, providerRef, amount, currency, date, status } ],
  providerCustomerRef,           // Paystack customer id
  providerAuthorizationRef,      // payment method authorization id (if stored)
  providerSubscriptionRef        // Paystack subscription id (if used)
}
```

- This object is the only authoritative source. UI and background workers read and write only this object. No duplicate caches.

B. **Trial Behavior**

- New users start in `trial` (30 days). Show topbar countdown. During trial:
  - **Cancel** must be disabled/hidden. Clicking Cancel triggers inline message: `"Cancel not available during free trial."` and console log event `subscription.cancel_attempt`.
  - If the user **pays successfully** during trial, immediately convert to `active` — set `startDate = paymentDate`, `nextBillingDate = startDate + interval`, update `paymentHistory`, unlock all paid features, close trial banners, send receipt email + dashboard notification, and redirect to `ThankYou.tsx` then dashboard.
  - If payment fails during trial, remain in `trial`. Do not convert and do not reduce trial days beyond normal countdown.

C. **Active Subscription Behavior / Auto-Renew**

- On `nextBillingDate`, automatically attempt to charge the user:
  - Where possible: use Paystack subscriptions (server-side) so Paystack handles recurring billing.
  - If Paystack subscription is not used, implement server-side (local worker) auto-charge using stored authorization and Paystack `charge` call, then `verify`.

- On **successful** charge:
  - Update `paymentHistory`, set `nextBillingDate += interval` (31 or 365 days), log `subscription.renewed` event, send receipt email, clear `graceStartDate` if any.

- On **failed** charge:
  - Transition to `grace` and set `graceStartDate = today` and `graceRetryCount = 0`. Log `subscription.payment_failure`. Show dashboard banner: `"The payment was not successful. We'll retry automatically for the next X days."`
  - Retry once per day automatically (local worker) for up to 5 retries.

D. **Grace Period**

- During `grace`:
  - Attempt auto-charge daily (respect Paystack idempotency).
  - Send daily email & dashboard notification on retry failure (email template: “Payment retry failed — update card or pay now”).
  - If a retry **succeeds** at any time: turn `state` to `active`, update `paymentHistory`, set a new `nextBillingDate`, clear `graceStartDate`, remove banners and padlocks, log `subscription.restored`.
  - If after 5 attempts still fails: set `state` to `locked`, record in `paymentHistory` the final failure, stop retries, show locked UI and notifications.

E. **Locked State**

- On `locked`:
  - Disable interaction for: My Company, Clients, Quotations, Invoices, Projects, Inventory, HR Management, Accounting pages (show padlock icons and disabled UI). Only Dashboard allowed (with view & CTA to pay/update card).
  - Show banner: `"Please upgrade to access all pages — Upgrade Now"` and bell notification `"Update Card Details"`.
  - Allow immediate manual payment or update card to restore subscription. On manual success, set `active`, set `nextBillingDate`, log and notify.

F. **Cancel / Resume**

- Cancel for `active` users must be **scheduled** (not immediate):
  - When User clicks Cancel:
    - Set `scheduledCancel = true`.
    - Set `cancelEffectiveDate = nextBillingDate`.
    - Keep access until `cancelEffectiveDate`.
    - Update UI to show `Canceled (effective <date>)`.
    - Log `subscription.canceled_scheduled`.

  - If user clicks Resume before `cancelEffectiveDate`:
    - Clear `scheduledCancel` and `cancelEffectiveDate`.
    - Do NOT change `nextBillingDate`.
    - Log `subscription.resumed`.

- Edge-race handling:
  - If renewal occurs near cancel scheduling, ensure atomic operation: if renewal went through, move `cancelEffectiveDate` to the new `nextBillingDate` and keep `scheduledCancel = true`. Avoid double charges.

G. **Plan Change**

- If user requests plan change mid-cycle:
  - Do not change immediately. Create `scheduledPlanChange = { newPlan, effectiveDate: nextBillingDate }`.
  - Show UI: `"Plan change scheduled — New plan will start on [nextBillingDate]"`.
  - Allow cancellation of scheduled change before effective date.
  - On `effectiveDate`, change `plan`, set `nextBillingDate` according to new plan cycle, log `subscription.plan_changed`.

H. **No Re-Entry to Trial**

- If a company/user has ever had `active` subscription (even if later canceled), do not allow re-entry into a Free Trial. Enforce on signup/login checks.

I. **Payment Idempotency & Race Conditions**

- Use Paystack idempotency for charge calls (providerRef or a local idempotency key) to prevent duplicate charges if multiple workers try same charge.
- Ensure local worker charges are atomic: obtain a lock per-subscription when attempting charge.

J. **Email / Notification Templates**

- Implement these templates (local dev sends via configured dev email service; log all email sends):
  - Trial reminder (5 days left) — includes CTA to billing & update card.
  - Grace daily retry notice (daily) — CTA to update card / pay now.
  - Payment success receipt — details, nextBillingDate, amount.
  - Final lock notice — final attempt failed, instructions to restore.

- All templates use company branding and signature (Wilson Mokgethwa Moabelo contact info). Log `email.sent` events.

K. **Paystack Plan & Subscription Handling**

- **Create or verify** Paystack Plans for Monthly and Annual during setup (dev step). Use Paystack API to create Plan objects or use local mapping if not necessary in dev.
- On initial subscribe:
  - Create Paystack customer if not exists.
  - Save Paystack customer id and authorization id locally (do not expose).
  - Option A (recommended): create Paystack subscription so Paystack recurs automatically.
  - Option B (if subscription API not used): save authorization and schedule local worker to call Paystack `charge` endpoint each `nextBillingDate`.

- Always verify charges with Paystack `verify` endpoint before marking a payment as successful.

L. **Background Worker (local) — responsibilities**

- Daily tasks (dev scheduler or simulated scheduler):
  - Decrement trial days and detect trial end.
  - On `nextBillingDate` for `active` plans, attempt charge (or rely on Paystack subscription webhooks).
  - During `grace`, attempt daily retries and increment retry count.
  - Apply scheduled plan changes or scheduled cancellations at their effective dates.

- Worker must write structured logs for each action.

M. **Logging**

- All important events logged to console as structured JSON (mask emails where necessary), e.g.:
  `{"event":"payment.attempt","companyId":"c_123","user":"m*****@domain.com","amount":60,"plan":"monthly","status":"failed","providerRef":"...", "timestamp":"..."}`
- Provide log entries for: payment attempts, successes, failures, subscription state transitions, scheduled cancel/resume, plan-change scheduling, email sends.

N. **Security & Local Dev**

- Never store live secret keys in client code; in dev, secure the test key in local environment variables. Do not push secret keys to remote repos.
- Make webhook handler stubs that can be toggled on during production, and provide instructions to enable real Paystack webhooks later.

O. **Acceptance Tests & Deliverables**
Implement and run the tests locally. Produce these deliverables (local files + reports):

**Acceptance Tests (must be run and evidenced):**

1. Trial user pays mid-trial and payment succeeds → becomes Active, nextBillingDate set, trial banners removed, Payment History shows success, features unlocked.
2. Trial user pays and payment fails → stays Trial; on trial end enters Grace; banner and daily retry emails happen; upon success in grace becomes Active; upon 5 failed retries becomes Locked.
3. Active user auto-renewal success → nextBillingDate updated, history logged.
4. Active user auto-renewal failure → enters Grace, follows grace logic.
5. Cancel scheduling → scheduledCancel true and cancelEffectiveDate set to nextBillingDate; access maintained until effective date.
6. Resume before effective date → scheduledCancel cleared; nextBillingDate unchanged.
7. Plan change mid-cycle → scheduledPlanChange set and effective on nextBillingDate.
8. Locked user updates card and pays → become Active immediately; nextBillingDate set; padlocks removed.
9. Idempotency: multiple payment requests for the same attempt create only 1 successful charge record.
10. Persistence: all subscription fields persist across reloads (local storage / DB).

**Evidence to deliver:**

- `acceptance_checklist.md` — each test PASS/FAIL with notes.
- `payments_history_<testuser>.json` — local payment history after tests.
- `console_logs_sample.json` — 10 sample structured logs including payment success, failure, retry.
- `files_inspected.txt` — list of files inspected/modified (server worker, subscription model, billing UI).
- `remediation_notes.md` — if anything broken or conflicting was found, describe fixes & follow-ups.
- `email_templates/` — HTML/plain templates used for test emails (local).
- Step-by-step instructions in `final_verification.md` to re-run tests (commands to run local worker, test keys to use, how to simulate webhooks).

**Important Implementation Notes / Constraints**

- **Work Local Only** — do not switch to live key or production services in this task.
- Carefully inspect existing subscription/trial code first; **do not duplicate**. If there are existing scheduled tasks or duplicate logic, consolidate into one canonical worker/service and document the change.
- Keep UI styling intact — use existing modals and confirmation dialogs. Add helper text and tooltips as specified in previous prompts.
- Use Paystack docs as canonical reference for endpoints, idempotency, subscriptions, and verifications: [https://paystack.com/docs/api/](https://paystack.com/docs/api/)
- If implementing webhooks locally, provide a test harness and instructions for ngrok or similar; otherwise implement polling/verify fallback for dev.
- For features requiring email sends, use dev email or logger (log email body + recipient to console) and save template html in `email_templates/`.

**Quick Reference — Config Constants**

- `TRIAL_DAYS = 30`
- `GRACE_DAYS = 5`
- `MONTHLY_DAYS = 31` — `MONTHLY_PRICE = 60` ZAR
- `ANNUAL_DAYS = 365` — `ANNUAL_PRICE = 684` ZAR (5% discount applied)
- `PAYSTACK_TEST_SECRET = sk_test_[YOUR_PAYSTACK_TEST_SECRET_KEY]`
- `PAYSTACK_LIVE_SECRET = sk_live_[YOUR_PAYSTACK_LIVE_SECRET_KEY]` (production only)

**Run this now (Dev steps)**

1. Inspect existing subscription code paths and previous prompt notes. Document files.
2. Wire Paystack test key in local env. Implement Paystack plan creation or verify mapping.
3. Implement/extend canonical subscription object and worker.
4. Implement charging flow + verification + retry logic.
5. Implement UI messages, cancel/resume modals, scheduled plan change UI, banners, and padlocks.
6. Implement email templates (local logging ok).
7. Run acceptance tests; record evidence and deliver files above.

**If any critical cross-tenant or double-charge exposure is found, stop and record exact reproduction steps in `remediation_notes.md` and escalate immediately.**

**Reference:** Paystack Docs — [https://paystack.com/docs/](https://paystack.com/docs/) and [https://paystack.com/docs/api/](https://paystack.com/docs/api/) — follow subscription & charge guidelines, idempotency, verification.

Subscription & Billing Integration (Paystack)
Location

Settings Page, Billing tab (Settings?tab=billing) – Overview and Payment Method sections; Dashboard topbar banner; Signup/Verification flows; Notification system (bell/alerts); Payment History page; Local background worker for scheduled billing.

Goal

Implement a complete recurring billing and subscription lifecycle for Monthly and Annual plans using Paystack’s API. We must automate charges based on the user’s selected plan (monthly or annual) without requiring manual payments. Leverage Paystack’s Subscriptions API and Recurring Charges so that after an initial payment authorization, the system automatically bills customers each cycle
paystack.com
paystack.com
. Use the provided Paystack Test Secret Key (sk*test*[YOUR_TEST_KEY]) for all development, switching to the Live key (sk*live*[YOUR_LIVE_KEY]) only for production. Ensure Paystack calls include the Bearer token header: Authorization: Bearer <SECRET_KEY>
paystack.com
.

Rules & Expectations

Existing Code Review: Inspect current subscription/trial code paths and previous prompts before making changes. Do not duplicate files, functions, or create parallel services. Update only if required and avoid breaking existing flows (Cancel/Resume, plan changes, etc. which were partially implemented).

Local-Only Implementation: All logic and data storage should remain local (e.g. localStorage or a local DB) until final migration to backend. No live billing or user account changes should be persisted externally in dev.

Theming & UI: Maintain the site’s UI theme (Apple Sequoia) and consistent UX patterns. Do not introduce unrelated styling changes. All text and buttons should match existing design.

Configuration & Constants: Use configurable constants for trial length (30 days), grace period (5 days), billing cycles (Monthly = 31 days, Annual = 365 days, annual price = R684.00 with 5% discount from monthly rate), and payment retry attempts. Avoid hard-coded strings or dates.

Logging: Log all key events to console.log (structured JSON) for debugging. For example, on cancellation attempt: {"event":"subscription.cancel_attempt","user":"<email>","state":"trial","timestamp":...}. Include user email/ID, previous state, new state, and timestamps in logs.

Referencing Documentation: Follow Paystack’s documentation for Subscriptions and Recurring Charges
paystack.com
paystack.com
. Use provided Paystack docs (https://paystack.com/docs/) for API usage, and ensure the implementation matches Paystack’s expected workflow.

Paystack API Keys

Switch to Test Mode: Set Paystack integration to Test Mode during development
support.paystack.com
. Configure environment or backend with the Test Secret Key and Public Key; this ensures all transactions are sandboxed.

Authorization Header: In all Paystack API calls (subscription creation, charge, verify, etc.), include the Secret Key in the Authorization: Bearer <SECRET_KEY> header
paystack.com
. Do not leak the keys in client-side code.

Plans & Subscriptions: Ensure Paystack plans exist for Monthly and Annual billing (interval = “monthly” or “annually”
paystack.com
) with the correct amounts. You may create or fetch plans via the Paystack API. When a user subscribes, create a Paystack subscription for the customer using their saved authorization (or create a new customer if needed)
paystack.com
.

Subscription Lifecycle & Business Rules

Free Trial (30 days): New users start in trial state with a 30-day countdown. During trial, Cancel is disabled/hidden – cancel requests should show: “Cancel not available during free trial.” Log attempts as subscription.cancel_attempt
paystack.com
. If payment is made during trial and succeeds, immediately convert to active subscription (monthly/annual) as if started today. If payment fails, remain on trial (normal countdown continues). Trial users have limited features (5 items, invoices, etc.).

Active Subscription (Paid): Once subscribed, set state = active, record plan = "monthly"|"annual", startDate = paymentDate, nextBillingDate = startDate + interval. Unlock all features. Log payment success and send receipt email/notification. Payment goes into Payment History (status “successful”).

Cancel (Scheduled): If an Active user clicks “Cancel Subscription,” do NOT cancel immediately. Set scheduledCancel=true and cancelEffectiveDate = nextBillingDate. In UI show “Canceled (effective [cancelEffectiveDate])” and a confirmation modal explaining the subscription remains active until then. Maintain full access until effective date. Log subscription.canceled_scheduled with email and effective date. If the user clicks Resume before effective date, clear scheduledCancel and cancelEffectiveDate, keep nextBillingDate unchanged, revert status to Active. Log subscription.resumed. Handle race condition where a billing charge occurs just as cancellation is scheduled: if a renewal happens, adjust cancelEffectiveDate to the new nextBillingDate (do not double-charge).

Grace Period (5 days): If trial ends without payment or an auto-renewal fails on nextBillingDate, move the user to grace state. Record graceStartDate. For 5 days, attempt to auto-charge daily. Display a dashboard banner: “Payment not successful. We’ll retry automatically for the next X days,” and a notification “Payment retry failed – Update card or pay now.” Allow a “Pay Now / Update Card” CTA at any time. Send an email each day a retry fails (e.g. “Payment attempt #2 failed”). If a retry succeeds, convert to Active subscriber (clear grace), update nextBillingDate, log success, and notify. If grace expires (5 failed attempts), transition to locked state.

Locked State: After grace failure, lock most app features (show padlocks, disable navigation for invoicing, etc.) except Dashboard. Show top-banner: “Please upgrade to access all pages – Upgrade Now” with link to billing. Add a bell notification: “Update Card Details.” Stop auto-retries. Users can still pay/update card to become Active again. Log transition to locked.

Renewals: For Active subscribers, on each nextBillingDate automatically charge via Paystack (using the saved authorization/subscription). If the charge fails, follow the Grace Period flow above. If it succeeds, update nextBillingDate (+31 or +365 days) and log subscription.renewed.

Plan Changes: If an Active user switches plans mid-cycle (Monthly ↔ Annual), do not change immediately. Set a scheduledPlanChange to take effect on current nextBillingDate. Inform the user “Plan change scheduled – New plan starts [nextBillingDate].” Allow cancellation of schedule before it triggers. Do not prorate or immediate charge. On the effective date, switch plan, update nextBillingDate, and apply new pricing.

No Re-entrance to Trial: Once a user has ever converted to paid (even if later canceled or lapsed), they cannot re-enter the free trial. Enforce in signup/login flows.

Email & Notifications: Create consistent email and bell notification templates for key events:

Trial Reminder: 5 days before trial end, email/bell: “5 days left in free trial – Upgrade Now.”

Grace Notices: Daily email/bell during grace: “Payment failed – [X] days left, update payment method.” Include branded signature and update link.

Payment Success Receipt: After any successful payment, email invoice with plan, amount, date, next billing date.

Final Lock Notice: When moving to locked after grace, email: “Subscription lapsed. Please update payment details to restore access.” Include upgrade link.
All templates use existing branding (logo, signature of Wilson Mokgethwa Moabelo, fonts). Log every email sent with payment and subscription events.

Data Persistence & Worker: Maintain a single canonical subscription record per user/company locally: e.g.

{
plan: "trial"|"monthly"|"annual"|"none",
state: "trial"|"active"|"grace"|"locked"|"canceled",
trialStartDate, trialEndDate,
startDate, nextBillingDate,
scheduledCancel: bool, cancelEffectiveDate,
scheduledPlanChange: {newPlan, effectiveDate} | null,
paymentHistory: [...],
graceStartDate
}

Read/write UI state from this object (no duplicate caches). Implement a background process (dev-only) that increments days, triggers auto-charges on nextBillingDate or daily during grace, and updates states accordingly. Ensure no cross-user data leaks.

UI / Dashboard Requirements

TopBar status badge must reflect state: e.g. Free | 30 Days, Paid | Monthly, Paid | Annual, Grace | X days left, Canceled | Monthly (active until YYYY-MM-DD), or Locked.

Billing Overview section should display: Current Plan, Billing Cycle, Next Billing Date, Scheduled Change/Cancel if any, Payment Method (card last4, with “Update” button), and Payment History. Show trial days or grace days remaining where appropriate.

Cancel/Resume Buttons: Visible only when appropriate. During Trial: disable Cancel (tooltip “Cancel not available during free trial”) and show message if clicked. For Active or Canceled (scheduled), show “Cancel” (which opens a confirmation modal) or “Resume” (to undo cancel). For Canceled but still-active (before effective date), allow Resume.

Confirmation Modals: On Cancel: “Cancel subscription? Your subscription remains active until [cancelEffectiveDate].” On Resume: “Resume subscription? Your billing schedule will continue as before.” Require explicit confirm.

Feature Locking: In locked state, overlay or disable protected pages with padlock icons. The Dashboard page should have an upgrade banner and restrict other pages.

Logging & Debugging

Log structured console events for all key actions:

subscription.cancel_attempt (trial or no sub)

subscription.canceled_scheduled (with effective date)

subscription.resumed

subscription.renewed

subscription.plan_change_scheduled

subscription.enter_grace

subscription.enter_locked

payment.attempt (status success/failed, amount, plan)

subscription.payment_success

subscription.payment_failure

email.sent (type, user)
Include user and company identifiers, old/new states, and timestamps. These logs help verify flow during tests.

Testing & Acceptance Criteria

After implementation, perform the following tests (accept ✓/✗ each):

Trial Cancellation: On Trial, Cancel is disabled; clicking shows inline message; console log of attempt.

Cancel Active Sub: Active Monthly user clicks Cancel → scheduledCancel=true, cancelEffectiveDate == nextBillingDate; UI shows “Canceled (effective …)”; access remains until that date.

Resume Sub: User clicks Resume before cancelEffectiveDate → cancellation cleared; UI returns to “Active”; nextBillingDate unchanged; console logs resume.

Mid-transaction Cancel: If renewal charge and cancel occur simultaneously, ensure only one charge and cancelEffectiveDate updates correctly.

Trial Payment Success: Trial user pays → state immediately Active; features unlocked; payment history has record; UI updates (TopBar, Billing) show new plan.

Trial Payment Failure → Grace: Trial user’s payment attempt fails → remains in trial until day 30, then enters Grace; retry banner appears; automated retries and emails occur for up to 5 days.

Grace Success: Payment eventually succeeds in grace → user becomes Active; banner clears; payment history logs success; nextBillingDate set.

Grace Expiry → Locked: After 5 failed retries, user enters Locked; padlocks appear; upgrade banner and notification exist; verify no further retries.

Renewal Failure: Active user fails auto-renew on renewal date → enters grace, similar behavior.

Plan Change Scheduling: Active user switches plan mid-cycle → UI shows scheduled change with effective date; upon reaching date, plan swaps and billing updates correctly.

No New Trial: After any paid period, ensure user cannot re-enter trial (verify signup/login checks).

Data Persistence: All states (scheduledCancel, graceStartDate, etc.) persist across page reloads/sessions in localStorage. Payment history records retries and cancellations appropriately.
Record console log snippets and payment history outputs for each test.

Deliverables

At completion, provide:

Checklist with each acceptance test marked ✓/✗ and notes.

Sample console log entries for key events (cancel attempt, cancel scheduled, payment success, payment retry, etc.).

Snippet of Payment History array after test runs (including successful and failed transactions).

Summary of updated files/code (what was inspected/modified).

Any issues found (duplicate logic, conflicts) and recommendations (do not delete existing code; adjust or refactor as needed).

References: We rely on Paystack’s official docs for recurring billing and subscriptions
paystack.com
paystack.com
, and use the standard API authentication (Bearer SECRET_KEY)
paystack.com
. All changes should align with these guidelines and the site’s existing backend patterns.
