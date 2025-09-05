Option A — Trial-only messaging (if the button cancels the free trial)

- VERY IMPORTANT: THE BACK-END SHOULD BE DONE LOCALLY

# Subscription Cancellation and Days Remaining — Local Backend Build Prompt

This document is the single source of truth for implementing subscription cancellation flows, banner messaging, and correct “days remaining” logic across the app. It assumes a local backend in this repository and aligns with your current stack (React/Vite frontend, Prisma/Postgres, Supabase auth, Paystack integration).

## Objectives
- Server is the source of truth for subscription state and date math.
- Unified banner/copy for canceled subscriptions (trial or paid).
- Correct timezone handling (Africa/Johannesburg) and no unrealistic “days left” values.
- Secure, idempotent webhook processing and auditable state changes.
- Small, well-defined HTTP surface area + daily cron for transitions.

## Assumptions and Environment
- Backend runs locally in this repo:
  - Database: Postgres (docker-compose, prisma/schema.prisma).
  - ORM: Prisma; migrations managed locally.
  - Auth: Supabase JWT (validate user_id for protected endpoints).
  - Paystack webhook: signature validation + idempotency (webhook_events).
- Frontend: React/Vite, fetches from local API routes during development.
- File structure references:
  - Prisma schema: prisma/schema.prisma
  - DB client: src/lib/db.ts
  - Paystack config: src/lib/paystack.ts
  - Local API handlers: src/pages/api/*
  - Daily job: src/jobs/billingJobs.ts

## UI Messaging Options
Recommended: Unified messaging for any canceled plan (trial/monthly/annual).

- Trigger
  - User cancels their trial or paid plan from Settings > Billing > Overview by clicking “Cancel Subscription.”
- Dashboard banner (red)
  - Title: “Subscription canceled.”
  - Body:
    - If remainingDays >= 1: “Access ends in X days (until {EndDate}).”
    - If remainingDays <= 0: “Access ended on {EndDate}.”
    - If end date is invalid/sentinel: omit the body line (no “X days left”).
- Acceptance criteria
  - Banner appears when status is canceled or cancel_at_period_end is true within current/grace period.
  - Pluralization: “1 day left” vs “X days left.”
  - Timezone: Africa/Johannesburg.
  - No unrealistic values (e.g., “27146 days”).
  - If no valid end date, show only the title + CTA (“View plans”/“Resubscribe”).

Alternative: Trial-only messaging
- Use similar rules but with trial-specific copy (“You canceled the trial”). Unified messaging is preferred to avoid confusion.

## Timezone and Date Rules (Server-side only)
- Timezone: Africa/Johannesburg for calculations (end-of-day behavior).
- remainingDays = ceil(endOfDay(current_period_end in ZA) - now in ZA).
- Sentinel date filtering:
  - If current_period_end is invalid or a sentinel (e.g., year >= 2099), return days_remaining = null and flags.show_days_left = false.
- After the end date passes:
  - Return days_remaining <= 0 and a valid end date; UI shows “Access ended on {date}.”

## Backend Architecture (Local)
Source of truth and domain logic live on the server. Frontend renders what it gets.

- HTTP/API handlers (local dev)
  - src/pages/api/billing/me.ts (GET)
  - src/pages/api/billing/cancel.ts (POST)
  - src/pages/api/billing/subscribe.ts (POST) [optional now]
  - src/pages/api/billing/history.ts (GET) [optional now]
  - src/pages/api/paystack-webhook.ts (POST)
    - Note: For production/serverless, consider relocating to api/webhooks/paystack.ts.
- Scheduled job (daily)
  - src/jobs/billingJobs.ts (export job function)
  - Hook via a dev script or Supabase cron in production.

### Endpoints

#### GET /api/billing/me
Returns a subscription snapshot for the authenticated user.

Response:
{
  status: 'trial' | 'active' | 'past_due' | 'canceled',
  plan: { code: 'trial' | 'monthly' | 'annual', price_minor: number, currency: 'ZAR', duration_days: number } | null,
  current_period_start: ISO | null,
  current_period_end: ISO | null,
  cancel_at_period_end: boolean,
  canceled_at: ISO | null,
  grace_end: ISO | null,
  days_remaining: number | null,
  flags: {
    is_trial: boolean,
    is_canceled: boolean,
    is_in_grace: boolean,
    show_days_left: boolean
  }
}

Rules:
- Compute days_remaining server-side using ZA timezone and sentinel filtering.
- show_days_left = true only if:
  - current_period_end is valid (not sentinel), and
  - days_remaining >= 1.

#### POST /api/billing/cancel
Marks cancel_at_period_end = true for the current subscription.
- Idempotent if already canceled or already set to cancel at period end.
- Status stays trial/active until current_period_end passes; daily job flips it to canceled.

Request: {}
Response: { ok: true } or { ok: true, already_canceled: true }

#### POST /api/webhooks/paystack
- Verify signature.
- Enforce idempotency via webhook_events (unique [provider,event_id]).
- Map events to subscription/payment updates and write audit logs.
- Typical events:
  - charge.success → mark subscription active, set current_period_end by plan duration, create payment row.
  - invoice.payment_failed → set status past_due.
  - subscription.disable → eventually reflect canceled when applicable.

### Daily Cron (src/jobs/billingJobs.ts)
Run daily (UTC schedule, ZA zone logic):
- If cancel_at_period_end && now >= current_period_end:
  - status = canceled, canceled_at = now.
- If past_due beyond threshold → restrict access, send reminders.
- Recompute any derived fields if you cache them; otherwise compute on read in /api/billing/me.

## Data Model (Prisma/Postgres)
Keep money in minor units (kobo/cents).

- plans
  - id, code ('trial'|'monthly'|'annual'), price_minor int, currency 'ZAR', duration_days int, features_json jsonb
- subscriptions
  - id, user_id (unique per user)
  - status: enum('trial','active','past_due','canceled')
  - current_period_start timestamptz nullable
  - current_period_end timestamptz
  - cancel_at_period_end boolean
  - canceled_at timestamptz nullable
  - grace_end timestamptz nullable
  - provider_customer_id, provider_subscription_id nullable
  - meta jsonb
  - indexes: (status), (current_period_end)
- payments
  - id, user_id, subscription_id nullable
  - amount_minor int, currency, status, reference unique, provider_payment_id nullable, created_at
- audit_logs
  - id, user_id nullable, action string, payload jsonb, created_at
- webhook_events
  - id, provider, event_type, event_id, payload jsonb, processed_at nullable, created_at
  - unique (provider, event_id)

Note: Your prisma/schema.prisma already contains Subscription.cancelAtPeriodEnd, canceledAt, graceEnd, Payment links, AuditLog, and WebhookEvent models — align endpoint logic with it.

## Security and Auth
- Supabase JWT auth for all /api/billing/* endpoints.
- Webhook unauthenticated but must:
  - Validate Paystack signature (test key in non-prod if present).
  - Be idempotent using webhook_events unique index.
- Rate-limit sensitive endpoints (cancel/subscribe).

## Frontend Contract
- Never compute “days left” on the client.
- Fetch /api/billing/me on Dashboard and Settings and render:
  - Title: “Subscription canceled” (or trial-specific if you opt for Option A).
  - If flags.show_days_left:
    - “Access ends in X days (until {date}).”
  - Else if days_remaining <= 0 and end date exists:
    - “Access ended on {date}.”
  - Hide days-left line for invalid/sentinel end dates.
- Keep localStorage as an optional cache only, not a source of truth.

## Copy and Localization
- US English spelling recommended: “Subscription canceled.”
- Body:
  - Future: “Access ends in X days (until {Aug 16, 2025}).”
  - Past/now: “Access ended on {Aug 16, 2025}.”
- CTA: “View plans” or “Resubscribe.”
- Pluralization: “1 day left” vs “2 days left.”
- Dates: Render with Africa/Johannesburg context in the UI.

## Testing and QA
Unit tests (SubscriptionService date math):
- ZA timezone correctness.
- Month ends and leap years (DST not applicable to ZA).
- Sentinel/invalid end dates return null days_remaining.

Integration tests:
- /api/billing/cancel sets cancel_at_period_end idempotently.
- /api/billing/me returns accurate snapshot before/after cron.

E2E:
- Cancel during trial → correct banner and days remaining.
- Cancel monthly/annual → same.
- After end date → “Access ended on {date}.”
- No absurd “days left” (e.g., 27146).
- Payment history visible after cancel; payment method hidden when canceled.

## Implementation Order (Suggested)
1) Align DB schema (already in place) and ensure .env DATABASE_URL is set for local Postgres.
2) Implement server-side ZA date helpers and days_remaining computation used by /api/billing/me.
3) Implement /api/billing/me (GET) to return the exact snapshot contract.
4) Implement /api/billing/cancel (POST) idempotently.
5) Harden /api/paystack-webhook with signature + idempotency + audit logs.
6) Implement daily cron in src/jobs/billingJobs.ts and a small runner to invoke it locally.
7) Update Dashboard and Settings to use /api/billing/me and remove client-side days math.

## Migration Notes
- For local development, keep handlers under src/pages/api/* to match your current setup.
- For production/serverless deployment (e.g., Vercel), relocate to api/* serverless routes as needed.
- Move any existing client-side days-left logic to server; UI should only format server-provided values.

## Acceptance Criteria Summary
- Unified canceled banner shows consistently on Dashboard/Settings.
- ZA timezone used everywhere for days_remaining.
- Sentinel/invalid dates never show “days left.”
- /api/billing/me is the single source of truth; frontend does no date math.
- Webhook is secure and idempotent; state changes are audited.
- Daily cron flips cancel_at_period_end subscriptions to canceled at/after end.
- Pluralization and copy are correct; currency stays ZAR with minor units in the DB.

- Trigger
  - When the user cancels their free trial from Settings > Billing > Overview by clicking “Cancel Subscription.”
- Dashboard behavior
  - Show a red banner at the top of the Dashboard.
  - Banner title: “You canceled the trial” (or “Trial canceled”).
  - Banner body: “X days left” or “Access ends in X days (until {EndDate}).”
- Days remaining logic
  - remainingDays = ceil(currentPeriodEnd at 23:59:59 - now) in Africa/Johannesburg timezone.
  - Only show the “X days left” line if remainingDays >= 1 and currentPeriodEnd is a real date (ignore far-future sentinel dates like 2099-12-31).
  - If remainingDays <= 0, show “Access ended on {EndDate}.”
- Example
  - Trial started: 15 July
  - Current period end (trial end/next billing): 16 August
  - Trial canceled on: 12 August
  - Banner body: “4 days left” (12 → 16 August)
- Acceptance criteria
  - The banner appears only when status is canceled and the user is still within the trial or grace period.
  - Pluralization is correct: “1 day left” vs “X days left.”
  - Date/time uses Africa/Johannesburg (ZAR locale).
  - No unrealistic values (e.g., 27146 days) — sentinel/invalid dates are not displayed.
  - If no valid end date is available, do not render the “days left” line; show only the title and a “View plans”/“Resubscribe” CTA.
Option B — Unified messaging (recommended for any canceled plan: trial, monthly, or annual)

- Trigger
  - When the user cancels their plan (trial or paid) from Settings > Billing > Overview by clicking “Cancel Subscription.”
- Dashboard behavior
  - Show a red banner at the top of the Dashboard.
  - Banner title: “Subscription canceled.”
  - Banner body:
    - If remainingDays >= 1: “Access ends in X days (until {EndDate}).”
    - If remainingDays <= 0: “Access ended on {EndDate}.”
    - If end date is unknown/invalid: omit the body line and show only the title.
- Days remaining logic
  - Same as Option A (ceil to whole days, ZAR timezone, ignore sentinel/invalid dates).
- Example
  - Monthly plan period: 15 July → 16 August
  - Canceled on: 12 August
  - Banner body: “Access ends in 4 days (until 16 Aug).”
- Acceptance criteria
  - Same as Option A, applied to all canceled plan types (trial, monthly, annual).
  - Keeps copy consistent across the app and avoids confusion between trial vs paid.
Copy and style notes

- Capitalization and spelling: pick one standard and keep it consistent across the app. US English: “Canceled.” British English: “Cancelled.”
- Recommended microcopy (US):
  - Title: “Subscription canceled” or “You canceled the trial”
  - Body when future date exists: “Access ends in X days (until {Aug 16, 2025}).”
  - Body when past/now: “Access ended on {Aug 16, 2025}.”
- CTA: “View plans” or “Resubscribe.”
QA checklist

- Cancel during trial → shows trial/canceled banner with correct remaining days.
- Cancel paid monthly/annual → shows canceled banner with correct remaining days.
- Sentinel/invalid end date → no “days left” line (no huge numbers).
- After the end date passes → “Access ended on {date}.”
- Timezone consistency: Africa/Johannesburg.
- Pluralization: “1 day left” vs “2 days left.”

current stack (React/Vite frontend, Supabase/Postgres, Paystack, serverless-friendly layout), here’s a pragmatic backend structure that keeps things clean, testable, and reliable while fixing the “days left” class of bugs at the source.

Goals
- Single source of truth on the server for subscription state and date math
- Clear separation of domain logic from HTTP endpoints
- Safe, idempotent webhooks with auditability
- Predictable time handling (Africa/Johannesburg)
- Minimal but robust surface area: a few HTTP endpoints + scheduled jobs

Recommended backend architecture
- HTTP/API layer (serverless handlers)
  - /api/billing/me
    - GET: returns current subscription snapshot for the authenticated user
    - Includes: status, plan, current_period_start, current_period_end, cancel_at_period_end, canceled_at, grace_end, days_remaining, and a flags object (is_trial, is_canceled, is_in_grace, show_days_left)
  - /api/billing/cancel
    - POST: sets cancel_at_period_end with an ends_at/current_period_end updated if needed
  - /api/billing/subscribe
    - POST: starts a subscription (trial/monthly/annual) and returns the initial snapshot
  - /api/billing/history
    - GET: returns invoices/payments for the authenticated user
  - /api/webhooks/paystack
    - POST: verifies signature, processes events, updates subscription/payment state, and records audit logs
- Scheduled jobs (cron)
  - /api/cron/billing-daily (or Supabase cron job)
    - Daily UTC run with Africa/Johannesburg zone logic
    - Transitions:
      - If cancel_at_period_end && now >= current_period_end => status=canceled, set canceled_at
      - If past_due for X days => enforce restrictions, send reminders
      - Send pre-expiry notices (e.g., 3-day/1-day emails)
    - Recomputes derived fields: days_remaining, grace_end, display flags
- Domain/application layers
  - domain/
    - entities: Subscription, Plan, Payment, Invoice, AuditLog
    - value objects: Money (ZAR minor units), PlanDuration (days), DateRange, SubscriptionStatus
    - services: SubscriptionService (state machine + date math), BillingService (proration/plan changes), PaymentService (Paystack adapter), AuditService
  - application/
    - use-cases: CancelSubscription, StartSubscription, RefreshSubscriptionFromWebhook, GetSubscriptionSnapshot, GenerateInvoice, SendPreExpiryEmails
  - infrastructure/
    - repositories: SubscriptionRepository, PaymentRepository, InvoiceRepository, AuditLogRepository
    - adapters: PaystackClient, EmailClient (Resend/Nodemailer), Prisma/Supabase client, Clock/DateProvider
  - interfaces/
    - http handlers (serverless functions) calling use-cases
    - webhook handlers

Where to put things in your repo
- api/ (serverless handlers)
  - api/webhooks/paystack.ts
  - api/billing/me.ts
  - api/billing/cancel.ts
  - api/billing/subscribe.ts
  - api/billing/history.ts
  - api/cron/billing-daily.ts
- src/server/
  - domain/
  - application/
  - infrastructure/
  - interfaces/http/
- src/jobs/ can either be folded into application/cron or stay as a thin wrapper calling application logic
- Keep your existing frontend files as they are, but fetch subscription state from /api/billing/me; use localStorage only as a cache, never a source of truth

Core data model (Postgres via Prisma or SQL)
- plans
  - id, code (trial/monthly/annual), price_minor (int), currency, duration_days, features_json
- subscriptions
  - id, user_id, plan_id
  - status: enum [trial, active, past_due, canceled]
  - current_period_start timestamptz
  - current_period_end timestamptz
  - cancel_at_period_end boolean
  - canceled_at timestamptz nullable
  - grace_end timestamptz nullable
  - provider_customer_id (Paystack)
  - provider_subscription_id (Paystack) nullable
  - meta jsonb
  - indexes on (user_id), (status), (current_period_end)
- payments
  - id, user_id, subscription_id, invoice_id nullable
  - amount_minor int, currency, status, provider_payment_id, created_at
- invoices
  - id, user_id, subscription_id, period_start, period_end, amount_minor, status, created_at
- audit_logs
  - id, user_id, action, payload jsonb, created_at
- webhook_events
  - id, provider, event_type, event_id, payload jsonb, processed_at, created_at, unique (provider, event_id) for idempotency

State machine and date rules
- States: trial → active → past_due → canceled; with cancel_at_period_end flag while still active
- On POST /api/billing/cancel:
  - If status in [trial, active]: set cancel_at_period_end = true, keep status unchanged until end of current period; set current_period_end if missing
  - If already canceled: no-op idempotently
- Daily job:
  - If cancel_at_period_end and now >= current_period_end: set status=canceled, canceled_at=now
  - If past_due and beyond threshold: restrict access and email reminders
- Days remaining calculation (server-side only):
  - Use Africa/Johannesburg timezone
  - days_remaining = ceil(end_of_day(current_period_end, ZA) - now(ZA))
  - If year >= 2099 or invalid => do not compute, return null
  - If status is canceled but end is in the past => days_remaining <= 0; let UI show “Access ended on …”
- Response snapshot contract (from /api/billing/me):
  {
    status: 'trial' | 'active' | 'past_due' | 'canceled',
    plan: { code: 'monthly' | 'annual' | 'trial', price_minor, currency, duration_days },
    current_period_start: ISO,
    current_period_end: ISO | null,
    cancel_at_period_end: boolean,
    canceled_at: ISO | null,
    grace_end: ISO | null,
    days_remaining: number | null,
    flags: {
      is_trial: boolean,
      is_canceled: boolean,
      is_in_grace: boolean,
      show_days_left: boolean // computed server-side with sentinel/validity checks
    }
  }

Webhook safety
- Validate Paystack signature
- Enforce idempotency via webhook_events table (unique provider/event_id)
- Map Paystack events to use-cases:
  - charge.success, subscription.create, subscription.disable, invoice.create, invoice.payment_succeeded, invoice.payment_failed
- Do not trust client for state flips; only webhooks and internal endpoints update subscription state
- Every mutation writes an audit log

Security and auth
- Auth via Supabase JWT; protect all /api/billing/* endpoints
- Webhook is unauthenticated but signature-verified
- Rate-limit sensitive endpoints (cancel/subscribe)
- Prefer minor units (kobo) for all money fields

Timezone correctness
- Centralize time through a DateProvider (infrastructure/clock) that defaults to Africa/Johannesburg for all calculations and formatting inputs; persist timestamptz in UTC in DB but convert for calculations

Testing
- Unit tests for SubscriptionService date math (edge cases: month end, leap year, DST not applicable in ZA, sentinel dates)
- Integration tests for /api/billing/cancel and webhook flows with a mocked Paystack client
- End-to-end smoke: cancel at period end should reflect on /api/billing/me with consistent days_remaining

Migration plan from current code
- Move the logic currently living in frontend (localStorage-driven subscription and daysLeft) to /api/billing/me
- Keep localStorage as a short-lived cache or remove it entirely for subscription state
- Relocate src/pages/api/paystack-webhook.ts to api/webhooks/paystack.ts (serverless), and adapt to your deploy target (Vercel/Supabase Functions)
- Extract date math into server-side SubscriptionService; UI only renders what API returns (prevents “27146 days left” forever)

Frontend contract simplification
- Dashboard and Settings screens should:
  - Fetch /api/billing/me
  - Render:
    - Title: “Subscription canceled” or “Trial ends in…”
    - If flags.show_days_left is true: show “X days left” or “Access ends in X days (until {date})”
    - If days_remaining <= 0: show “Access ended on {date}”
  - Never compute days on the client; only format what server returns

If you want, I can:
- Scaffold the /api/billing/me and /api/billing/cancel handlers
- Extract the date math to a SubscriptionService and wire it from your existing billingJobs.ts
- Move the Paystack webhook to api/webhooks/paystack.ts and add signature verification and idempotency
- Update the frontend to consume the new API contract and delete the old client-side daysLeft logic where appropriate
          
Absolutely. Here’s a single, copy-ready build prompt you can use. It combines product requirements, technical specs (frontend and backend), data model, copy, timezone handling, and acceptance criteria.

You can paste this into your project docs (e.g., NextPrompt.md) and build directly against it.

Plain-English Build Prompt: Subscription Cancellation and Days Remaining

Objective
- Implement a consistent, correct, and user-friendly experience for canceled subscriptions across the app (Dashboard and Settings).
- Ensure “days left” is accurate, avoids unrealistic values, respects Africa/Johannesburg timezone, and is calculated on the backend as the source of truth.

Scope
- Frontend: Dashboard and Settings screens (banners, badges, status text)
- Backend: Subscription state, date calculations, webhooks, daily cron transitions
- Localization: Consistent copy for canceled vs trial
- Data: Single source of truth, avoid client-side drift and sentinel dates

User Story
- As a user, when I cancel my trial or paid plan, I should see a clear “Subscription canceled” message on the Dashboard. If there’s still time left in my current period, I should see how many days remain. When the period ends, I should see the end date.
- Example: Subscription period 15 July → 16 August. If I cancel on 12 August, I should see: “Access ends in 4 days (until 16 Aug)” or “4 days left.”

Copy and UI Behavior
- Dashboard banner (red)
  - Title:
    - Recommended unified copy: “Subscription canceled”
    - Alternative for trial-only: “You canceled the trial” or “Trial canceled”
  - Body:
    - If remainingDays >= 1: “Access ends in X days (until {EndDate}).”
    - If remainingDays <= 0: “Access ended on {EndDate}.”
    - If the end date is invalid or unknown: omit the body line (no “X days left”).
  - CTA: “View plans” or “Resubscribe”
- Settings > Billing > Overview > Subscription Status
  - Show a canceled badge and the same body rules as Dashboard

Localization
- Enforce pluralization: “1 day left” vs “X days left”
- Unified keys (recommended):
  - settings.billing.toasts.canceledTitle → “Subscription canceled”
  - settings.billing.daysLeft (pluralized) → “{{count}} day left” / “{{count}} days left”
  - settings.billing.accessEndsOn → “Access ended on {{date}}”
  - settings.billing.accessEndsIn → “Access ends in {{count}} days (until {{date}})”
- Avoid using trial-specific “trialCanceledDaysLeft” for non-trial cancellations.

Timezone and Date Rules
- Timezone: Africa/Johannesburg for all remaining-days calculations and date formatting in UI.
- Calculation:
  - remainingDays = ceil(endOfDay(current_period_end in ZA) - now in ZA)
  - If current_period_end is missing or sentinel (e.g., year >= 2099) or invalid → remainingDays = null, do not display “days left.”
- After the period end:
  - Show: “Access ended on {EndDate}” (formatted in ZA locale)

Backend Architecture (source of truth)
- Endpoints
  - GET /api/billing/me
    - Returns the current subscription snapshot for the authenticated user:
    {
      status: 'trial' | 'active' | 'past_due' | 'canceled',
      plan: { code: 'trial' | 'monthly' | 'annual', price_minor, currency, duration_days },
      current_period_start: ISO | null,
      current_period_end: ISO | null,
      cancel_at_period_end: boolean,
      canceled_at: ISO | null,
      grace_end: ISO | null,
      days_remaining: number | null,
      flags: {
        is_trial: boolean,
        is_canceled: boolean,
        is_in_grace: boolean,
        show_days_left: boolean // server-computed: true only when end date is valid and days_remaining >= 1
      }
    }
  - POST /api/billing/cancel
    - Marks cancel_at_period_end = true for the current subscription; keeps status unchanged until current_period_end
  - POST /api/billing/subscribe
    - Starts a subscription (trial, monthly, annual)
  - GET /api/billing/history
    - Lists invoices and payments for the user
  - POST /api/webhooks/paystack
    - Validates signature, idempotent, maps events to updates (subscription create/disable, invoice events, charge.success)
- Cron/Schedule (daily)
  - /api/cron/billing-daily
  - Transitions:
    - If cancel_at_period_end && now >= current_period_end: status = canceled, set canceled_at
    - If status is past_due beyond threshold: restrict access, send reminders
  - Recomputes days_remaining and flags.show_days_left

Data Model (Postgres)
- plans
  - id, code ('trial'|'monthly'|'annual'), price_minor (int), currency (ZAR), duration_days, features_json
- subscriptions
  - id, user_id, plan_id
  - status: enum('trial','active','past_due','canceled')
  - current_period_start timestamptz
  - current_period_end timestamptz
  - cancel_at_period_end boolean
  - canceled_at timestamptz nullable
  - grace_end timestamptz nullable
  - provider_customer_id, provider_subscription_id nullable
  - meta jsonb
  - indexes: (user_id), (status), (current_period_end)
- payments
  - id, user_id, subscription_id, invoice_id nullable
  - amount_minor int, currency, status, provider_payment_id, created_at
- invoices
  - id, user_id, subscription_id, period_start, period_end, amount_minor, status, created_at
- audit_logs
  - id, user_id, action, payload jsonb, created_at
- webhook_events
  - id, provider, event_type, event_id, payload jsonb, processed_at, created_at
  - unique (provider, event_id) for idempotency

Backend Rules and State Machine
- States: trial → active → past_due → canceled
- Cancel at period end:
  - POST /api/billing/cancel sets cancel_at_period_end = true
  - Status remains trial/active until current_period_end; then cron flips to canceled
- Days remaining is computed server-side only and returned via /api/billing/me
  - If invalid/sentinel end date → days_remaining = null; flags.show_days_left = false

Security
- Secure endpoints with Supabase JWT; user_id from token
- Webhook: signature verification + idempotent processing using webhook_events table
- Rate-limit cancel/subscribe endpoints
- Use minor units (kobo) everywhere for money

Frontend Changes
- Source of data:
  - Replace any client-side days-left calculation with /api/billing/me response
  - Treat localStorage only as a cache (optional), not a source of truth
- Dashboard (InfoBanner)
  - Title: “Subscription canceled”
  - If flags.show_days_left: show “Access ends in X days (until {EndDate})”
  - If days_remaining <= 0 and end date exists: show “Access ended on {EndDate}”
  - Do not display unrealistic values; if end date invalid/sentinel → hide days-left line
- Settings > Billing > Overview
  - Mirror the same rules as the Dashboard for title/body
  - Hide payment method section and cancel button when status = canceled
- Dashboard header (thin strip)
  - Align copy and guard logic to match InfoBanner (no unrealistic day counts)

Event Handling and Logging
- Log all state transitions to audit_logs (cancel, payment success/failure, webhook events processed)
- Emit toast/notifications on meaningful state changes

Testing and QA
- Unit tests (SubscriptionService):
  - Correct remainingDays calculation in ZA timezone
  - Cancel at period end → days remaining correct on any day before the end
  - Sentinel/invalid dates → days_remaining = null
- Integration tests:
  - /api/billing/cancel sets cancel_at_period_end
  - /api/billing/me returns correct snapshot before/after cron
- E2E scenarios:
  - Trial cancellation shows correct banner and days
  - Monthly/annual cancellation shows correct banner and days
  - After end date, shows “Access ended on {date}”
  - No large/absurd days values (e.g., 27146)
  - Payment history remains visible after cancel
  - Payment method hidden when canceled
- Example acceptance case:
  - Period: 15 July → 16 August
  - Canceled: 12 August
  - Should show: “Access ends in 4 days (until 16 Aug)”

Deliverables Checklist
- Backend:
  - /api/billing/me with correct snapshot contract and days_remaining logic
  - /api/billing/cancel to set cancel_at_period_end
  - /api/webhooks/paystack with signature verification and idempotent processing
  - /api/cron/billing-daily to flip states and recompute derived values
  - Data model (tables/indexes) and migrations
  - Unit/integration tests for date math and transitions
- Frontend:
  - Dashboard banner and Settings > Billing banner aligned to unified copy rules
  - Use /api/billing/me; remove client-only days-left calculations
  - Guard against invalid/sentinel dates; hide days-left line when invalid
  - Correct pluralization and ZA date format
- Docs:
  - Copywriting guide (US vs UK spelling consistency)
  - Timezone handling notes
  - Test cases and how to reproduce the July 15 → Aug 16, canceled Aug 12 example

Definition of Done
- The Dashboard and Settings show consistent “Subscription canceled” messaging with correct, reasonable days-left logic.
- No occurrences of unrealistic day numbers (e.g., 27146).
- Server is the source of truth for days_remaining; UI only formats.
- Webhooks and cron ensure status transitions happen on time and are logged.
- Tests pass for the main date/calculation paths and API endpoints.
