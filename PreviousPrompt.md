- Prompt 1

Diagnose & Fix: New users NOT receiving Verification Emails (Postmark)

**Context / Goal**
New users are not receiving verification emails. The app uses **Postmark** as the email provider. Postmark appears configured but verification emails are not arriving. Your task: fully audit the verification-email flow (app → Postmark → recipient inbox), find and fix root cause(s), then verify & document the fix. All work must be done locally (Postmark test server) and produce evidence.

---

## High-level objective (single instruction)

Find and fix whatever prevents verification emails from being sent or delivered to new users. Confirm the app creates a verification token, calls Postmark, Postmark accepts the message, and the recipient receives the email (or Postmark provides a clear reason for rejection). Provide structured logs, screenshots and a remediation summary.

---

## Step-by-step checklist (run in order and record outputs)

1. **Reproduce the failure**

   * Create a new test user through the app (use a controlled test inbox you own).
   * Record: exact signup inputs, timestamp, and app response.
   * Expectation: the app should create a verification token and enqueue/send a verification email.

2. **Confirm the app attempted to send**

   * Inspect server logs around signup and mailer call.
   * Look for structured logs showing the email send call and Postmark API response (HTTP 200/201 + message-id or an error).
   * If no send log found, add immediate logging around mailer call and retry signup.
   * Save the log snippet proving the send attempt and Postmark response (or the lack thereof).

3. **Verify verification token & DB state**

   * Confirm a verification token record exists for that user (token/hash, expiry, userId, createdAt).
   * Verify token storage policy (hashed or not) and expiry time.
   * Document the DB row(s) (redact PII).

4. **Capture the exact email payload**

   * Log the payload sent to Postmark (To, From, TemplateId or HTML, variables used).
   * Important: verify the verification link generated inside the email uses the correct `APP_HOST` (not `localhost` unless tester runs locally). If `localhost` is used, note that link reachability is separate from deliverability.
   * Save a redacted copy of the exact payload as evidence.

5. **Check Postmark API response**

   * From app logs, get the full Postmark API response (status, message-id, error details).
   * If Postmark did not return success, document the error body.
   * If API returned success but Postmark dashboard shows no message, proceed to the Postmark dashboard checks.

6. **Postmark Server / Dashboard checks**

   * Log into Postmark test account and check:

     * **Messages Inbox / Activity** for the specific message-id/time.
     * **Message events** for accepted/dropped/bounced/rejected/suppressed.
     * **Suppression lists** (bounces, complaints, unsubscribes). If recipient is suppressed, Postmark will block sends.
   * Export or screenshot relevant Postmark entries and suppression records.

7. **Domain & sender identity / DNS checks**

   * Verify the sending sender identity in Postmark:

     * Sending domain/email is verified in Postmark.
     * SPF record includes Postmark sending IPs/hosts.
     * DKIM is configured for the domain and shows as verified.
     * DMARC (if present) not set to a strict policy that blocks delivery.
   * If domain not verified, Postmark may accept but deliverability is poor. Document status and needed DNS records.

8. **Local queue & worker**

   * If the app enqueues emails, confirm background worker/queue is running and processing jobs.
   * Check job queue for pending/failed jobs and worker logs for failures.
   * Restart worker if down and re-run signup test. Document queue snapshots.

9. **Template mapping & variables**

   * Ensure the app uses the correct Postmark **template ID** for verification emails and passes all required template variables.
   * Render the template with test variables to confirm the final HTML/subject are valid. Log the rendered output.

10. **Webhooks / bounce handling**

* Confirm Postmark webhooks for bounces/delivery events are configured (in dev use ngrok or make a webhook test endpoint).
* If webhooks are used, ensure the app endpoint is reachable and processes bounce events into an internal suppression/flag list.
* Document webhook settings and sample webhook payloads received (if any).

11. **Deliverability checks**

* Check recipient inbox (including spam/promotions folders). If not found, check Postmark event: delivered / deferred / bounced and the reason code.
* For Gmail/Hotmail, also check Promotions/Other tabs and spam.
* Document screenshots and Postmark status for the message.

12. **Manual/isolated send**

* From Postmark UI or using Postmark test API, manually send a verification-style email to the test recipient (bypass app).
* If manual send succeeds and inbox receives the message, the problem is in the app (configuration, payload, template, or queue).
* If manual send fails, the problem is deliverability or Postmark account settings (suppression, domain verification, account hold).
* Document manual send evidence and inbox screenshot.

13. **Rate limits / account status**

* Check Postmark account for any limits, holds, or policy violations preventing deliveries.
* If account is suspended or limited, document and resolve with Postmark support.

14. **Common root-cause checks to perform explicitly**

* Wrong Postmark API key or wrong environment variable (e.g., using production key in dev or empty value).
* Wrong template ID mapping or missing template variables.
* Email being queued but worker not running.
* Recipient on suppression list (bounce/complain/unsubscribe).
* Domain/sender not verified — SPF/DKIM missing.
* Postmark account throttled or suspended.
* App logs showing success but Postmark showing reject (inspect API response).
* Link is `localhost` — recipients receive email but cannot open link externally (UI vs delivery separate).

15. **Fix & re-test**

* Apply the appropriate fix depending on root cause (env var update, restart worker, correct template ID, remove suppression, verify domain/SPF/DKIM, webhook handling).
* Re-run the signup test and produce full evidence: server log, Postmark activity entry, and inbox screenshot. All three must be present.

---

## Recommended fixes for common outcomes (do these when you find the matching symptom)

* **Symptom: No mailer call in app logs**

  * Action: ensure signup flow calls mailer; add logging; fix early-exit/bad try/catch swallowing errors. Re-run.

* **Symptom: App shows success but Postmark dashboard shows nothing**

  * Action: check Postmark API key env var (POSTMARK\_API\_KEY or similar). Confirm app uses correct key and endpoint. Re-run.

* **Symptom: Postmark accepted but message bounced**

  * Action: check bounce reason, fix recipient address or domain policy problems. Remove suppression only after verifying root cause.

* **Symptom: Message suppressed (on suppression list)**

  * Action: inspect suppression reason; if safe, remove suppression and re-send only after fixing root cause (e.g., corrected email, validated domain).

* **Symptom: Template render errors**

  * Action: ensure all required variables passed; correct template ID; render template locally to verify.

* **Symptom: Worker queue backlog**

  * Action: start/repair worker, process jobs, ensure jobs mark success/fail correctly; add retry/backoff.

* **Symptom: Link uses `localhost`**

  * Action: for dev testing either run app locally, or set `APP_HOST` to a reachable dev URL or use ngrok and update verification link generation to use `APP_HOST`. Document decision.

* **Symptom: DKIM/SPF missing**

  * Action: add DNS records per Postmark instructions and wait for propagation. Use Postmark to verify. Re-run manual send.

* **Symptom: Postmark account holds/limits**

  * Action: contact Postmark support; document ticket and follow up.

---

## Acceptance criteria (must be TRUE)

1. After fixes, creating a new user triggers a single verification email that is:

   * Accepted by Postmark (message-id recorded in Postmark).
   * Delivered to the recipient’s inbox (or Spam/Promotions) within 60 seconds.
   * Evidence: (a) server log showing the send and Postmark response, (b) Postmark dashboard activity showing message accepted/delivered, (c) screenshot of recipient inbox showing message.
2. Verification token present in DB and the link in the received email activates the account (or you document how to test activation locally).
3. No unhandled exceptions or silent errors during the send; failures are logged and retried where appropriate.
4. If recipient was previously suppressed, remediation documented and suppression cleared only after root cause fixed.

---

## Required deliverables (produce ALL)

1. `postmark_debug_report.md` — narrative of findings, root cause(s), steps taken, final status.
2. `server_logs/` — redacted server logs showing send call(s) and Postmark API response(s).
3. `postmark_activity_screenshots.zip` — Postmark dashboard screenshots showing the message(s) and any suppression or bounce entries.
4. `inbox_screenshots.zip` — screenshot(s) of test recipient inbox (show From, Subject, timestamp). If message landed in Spam/Promotions, include that screenshot and explanation.
5. `db_token_snapshot.json` — redacted row(s) showing verification token(s).
6. `fix_summary.md` — files/config changed (env var names, template IDs, worker commands) and exact edits made.
7. `final_verification.md` — clear step-by-step instructions to reproduce the successful signup → verification email flow and how to test again.

---

## Logging format (use these structured JSON log messages)

When you add or capture logs, use these shapes for traceability:

* Mail send attempt:

```json
{
  "event":"email.send_attempt",
  "type":"verification",
  "toMasked":"j***@example.com",
  "companyId":"c_123",
  "templateId":"postmark-template-id",
  "payloadSummary":{"hasToken":true,"linkHost":"http://localhost:8080"},
  "timestamp":"2025-09-XXTYY:ZZ:00Z"
}
```

* Postmark response:

```json
{
  "event":"postmark.response",
  "messageId":"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "status":"Success"|"Error",
  "httpStatus":200,
  "responseBody":"...raw response...",
  "timestamp":"2025-09-XXTYY:ZZ:01Z"
}
```

* Postmark webhook (bounce/suppression):

```json
{
  "event":"postmark.webhook.bounce",
  "messageId":"...",
  "toMasked":"j***@example.com",
  "bounceType":"HardBounce"|"SoftBounce"|"SpamComplaint",
  "timestamp":"..."
}
```

---

## Extra developer notes

* **Do not expose Postmark secret keys** in screenshots or logs. Mask them.
* If verification link must be accessible externally for QA, use ngrok or set `APP_HOST` env var to a reachable dev domain before generating the email link.
* If you implement temporary extra logging to debug, remove or reduce verbose logs after fix and keep only structured events.
* If using multiple environments, ensure Postmark keys and template IDs are environment-specific and not mixed.


Prompt 2 

Verification Email Flow (Start → Finish)

**Objective:** Implement, test and document a secure, tenant-aware verification email flow so that when a *new user* signs up (creating a new company), they receive a single-use verification email. When they click the verification link the server validates the token, marks the user as verified, invalidates the token, and redirects the user to the Login page to sign in for the first time. All actions are logged with structured JSON and scoped to the company (tenant). Do everything local-only.

---

## Environment & Global Rules (READ FIRST)

* Work local only. Use Postmark test server keys in development (do not use live keys).
* Use `APP_HOST` environment variable for all generated links (e.g., `http://localhost:8081` or an ngrok URL for external testing).
* Each signup must create a **new company** (tenant) and set `user.companyId`.
* Tokens must be cryptographically secure, URL-safe, ≥32 bytes, stored **hashed** (SHA256), single-use, configurable expiry (default 24 hours).
* Do **not** auto-login users after verification — redirect to `/auth/login`.
* Log every major event with structured JSON (see Logging section).
* Avoid user enumeration in public UI messages.
* Rate-limit resend attempts (e.g., 1 per 2 minutes) and signup attempts per IP/email.

---

## Data model (ensure these exist or map to your schema)

* **users**: `id`, `companyId`, `email`, `firstName`, `surname`, `position`, `passwordHash`, `verified` (bool, default false), `verifiedAt`, `createdAt`.
* **companies**: `id`, `name`, `ownerUserId`, `contactEmail`, `createdAt`.
* **verification\_tokens**: `id`, `userId`, `tokenHash`, `expiresAt`, `purpose` (`email_verification`), `usedAt`, `createdAt`.
* **email\_logs**: `id`, `event`, `userId`, `companyId`, `templateId`, `postmarkMessageId`, `status`, `meta`, `timestamp`.
* **audit\_logs**: for all critical events.

---

## Endpoints to implement/verify

* `POST /api/signup` — create company + user + send verification email.
* `POST /api/verify-email` — accept `token` and `uid` (or `token` only if token embeds uid); validate and mark verified.
* `POST /api/resend-verification` — resend logic with rate-limit.
* Optional: `GET /auth/verify-email?token=...&uid=...` that performs server-side verification and redirects to login (or frontend route that posts to `/api/verify-email`).

---

## Full flow (step-by-step)

### A. Client: Signup form

1. Page: `Signup / Create Account`.
2. Fields: `First name`, `Surname`, `Company Name`, `Email`, `Position` (dropdown), `Password`, `Confirm password`.
3. Client-side validations: email format, password strength, password match.
4. On submit: POST payload to `/api/signup`.
5. UX: show spinner + success message: **"Signup successful — check your email for a verification link (check spam). If you don't receive it, use 'Resend verification'."** (mask email on UI: `m***@domain.com`).

### B. Server: Signup handler (`POST /api/signup`)

1. Validate payload server-side; canonicalize email (lowercase, trim).
2. Check email uniqueness:

   * If exists and `verified=true` → return 409 / user-visible "Email already used. Please login."
   * If exists and `verified=false` → allow option to resend (return 200 with info or prompt to resend).
3. Create a **company** record (empty defaults) with fields mapped:

   * `companies.name = Company Name`
   * `companies.contactEmail = Email`
   * `companies.ownerUserId = userId` (after user creation)
   * Persist owner contact fields to company details (firstName, surname, position as owner meta).
4. Create **user** record with `companyId`, `verified=false`, hashed password (bcrypt/argon2), `createdAt`.
5. Generate verification token (see Token Generation) and store token hash.
6. Enqueue/email verification message (see Send Email).
7. Respond HTTP 201 with message `"Signup successful — check your email to verify your account."`
8. Log `{"event":"signup.complete","userMasked":"m***@...","userId":"u_xxx","companyId":"c_xxx","timestamp":...}` to audit logs and `email.send_attempt` to email\_logs.

### C. Token generation & storage (server)

1. Generate secure random token (≥32 bytes URL-safe). Example: use crypto.randomBytes(32).toString('base64url').
2. Compute `tokenHash = SHA256(rawToken)` and store only the hash in DB.
3. Insert `verification_tokens`:

   * `userId`, `tokenHash`, `purpose='email_verification'`, `expiresAt = now + VERIFICATION_TOKEN_EXPIRY (default 24h)`, `createdAt`.
4. Log `{"event":"token.created","userId":"u_xxx","companyId":"c_xxx","expiresAt":"YYYY-MM-DDT...Z"}`.

### D. Build verification URL

* Pattern: `${APP_HOST}/auth/verify-email?token=<rawToken>&uid=<userIdEncoded>`

  * Suggestion: encode `userId` (base64 or signed short id) to avoid exposing raw DB ids. Alternatively use token that encodes user info (but still validate server-side).
* Example: `https://dev.mokmzansibooks.local/auth/verify-email?token=abc123...&uid=Zm9v...`

### E. Compose & send Postmark verification email

1. Use Postmark test server template `postmark-verification` (or create one).
2. Template variables: `firstName`, `companyName`, `verifyUrl`, `supportEmail`, `supportPhone`, `signatureBlock`.
3. Subject: `Verify your MOK Mzansi Books account`
4. From: `MOK Mzansi Books <noreply@mokmzansibooks.com>`
5. Include `companyId` and `userId` as metadata in the send call for audit.
6. Enqueue via job queue or send directly in request handler (prefer queue to avoid user-facing delay).
7. Log send attempt:
   `{"event":"email.send_attempt","type":"verification","toMasked":"m***@...","userId":"u_xxx","companyId":"c_xxx","templateId":"postmark-verification","timestamp":...}`
8. Capture Postmark response and log:
   `{"event":"postmark.response","messageId":"...", "status":"Success|Error","httpStatus":200,"timestamp":...}`.
9. If Postmark rejects/suppresses the address, log and surface a friendly message to UI.

### F. User clicks link (frontend route)

1. Link opens frontend route `/auth/verify-email?token=...&uid=...`.
2. Frontend shows a "Verifying..." screen and posts `token` + `uid` to `POST /api/verify-email` (preferred over GET).
3. Option: support server-side redirect (GET) that validates server-side and returns a redirect to `/auth/login` with flash.

### G. Server: Verify endpoint (`POST /api/verify-email`)

1. Receive `token` and `uid`.
2. Validate `uid` -> fetch `user` and associated `verification_tokens` filtered by `purpose='email_verification'`.
3. Compute `SHA256(token)` and perform constant-time comparison with stored `tokenHash`.
4. Validate:

   * token exists and matches,
   * `expiresAt > now`,
   * `usedAt == null`.
5. If invalid/expired/used:

   * Return 400 with generic message: `"Verification link is invalid or expired. Request a new verification email."` (do not reveal whether user exists).
   * Log `{"event":"token.invalid","reason":"expired|not_found|used","userMasked":"m***@...","timestamp":...}`.
6. If valid:

   * Update `users.verified = true`, `users.verifiedAt = now`.
   * Update `verification_tokens.usedAt = now`.
   * Optionally delete/invalidate other outstanding tokens for this user.
   * Log `{"event":"token.consumed","userId":"u_xxx","companyId":"c_xxx","timestamp":...}`.
   * Return success (HTTP 200) and instruct frontend to redirect to `/auth/login?verified=1` or return redirect (HTTP 303) to login with flash message.

### H. Frontend after verification

* On success, redirect to `/auth/login` and display a success message: `"Your email is verified. Please log in."` with a prominent "Login" CTA.
* Do NOT auto-login the user.

### I. Resend verification

1. Endpoint: `POST /api/resend-verification` (accepts `email` or auth context).
2. Rate-limit (e.g., allow once per 2 minutes per email).
3. If user exists and `verified=false`, invalidate previous tokens (mark used or delete) and create new token; send email as in E.
4. Log `{"event":"email.resend_attempt","userId":"u_xxx","companyId":"c_xxx","timestamp":...}`.

---

## Security & best practices (MUST)

* **Hash tokens** (SHA256) in DB; never store raw token.
* Use **constant-time** string comparison for token checks.
* Tokens single-use: mark `usedAt` and reject reuse.
* Token expiry default 24 hours (configurable).
* Rate-limit signups and resend endpoints.
* Mask emails in log/UI (e.g., `m***@gmail.com`).
* Avoid exposing whether an email is registered to prevent enumeration; on resend return a generic message where appropriate.
* Use HTTPS for production `APP_HOST`; for local testing, ngrok can be used.

---

## Logging & observability (structured JSON)

Log these events (examples):

* `signup.attempt` / `signup.complete`
* `token.created`
* `email.send_attempt`
* `postmark.response`
* `token.consumed`
* `token.invalid`
* `verification.resend`
  Each log entry should include `event`, `userMasked`, `userId`, `companyId`, `endpoint`, `resultCount` (where relevant), `timestamp`, and `meta` JSON.

Example:

```json
{"event":"email.send_attempt","userMasked":"m***@gmail.com","userId":"u_abc123","companyId":"c_def456","templateId":"postmark-verification","timestamp":"2025-09-XXT12:00:00Z"}
```

---

## Acceptance tests (run locally and attach artifacts)

For QA run each test and attach logs/screenshots.

1. **Signup + Email sent**

   * Action: POST `/api/signup` with test email (Postmark test inbox).
   * Expect: HTTP 201; DB: `users.verified=false`; `verification_tokens` row exists; Postmark accepted send.
   * Evidence: server log, DB row snapshot (masked), Postmark activity screenshot.

2. **Email delivery**

   * Action: check Postmark test inbox.
   * Expect: verification email received within 60s with valid `verifyUrl`.
   * Evidence: email screenshot.

3. **Click link → Verify**

   * Action: click link (or POST token to `/api/verify-email`).
   * Expect: server validates, sets `users.verified=true`, token marked used; redirect to `/auth/login` with success flash.
   * Evidence: server logs, DB snapshot (verified true), login page screenshot.

4. **Invalid/Expired token**

   * Action: reuse token or use expired token.
   * Expect: server returns invalid/expired; UI shows resend option. Evidence: logs + UI screenshot.

5. **Resend verification**

   * Action: POST `/api/resend-verification`.
   * Expect: new token created, old invalidated, new email sent; rate-limit enforced.
   * Evidence: logs + Postmark screenshot.

6. **Multi-tenant isolation**

   * Action: repeat signup with second email (creates second company).
   * Expect: each tenant receives own verification email branded for their company; verifying one user does not affect the other.
   * Evidence: logs and screenshots.

---

## Deliverables (attach after work)

* `verification_flow.md` — narrative of implemented flow (short).
* `acceptance_checklist.md` — pass/fail for each test with notes.
* `evidence.zip` — server logs (JSON), DB snapshots (redacted), Postmark activity screenshots, inbox screenshots, login page screenshot after verify.
* `files_touched.txt` — list of server routes, mailer files, templates updated.
* `runbook.md` — how to run tests locally (set `APP_HOST`, Postmark test keys, run worker/queue, ngrok if needed).

---

## Troubleshooting quick checklist (if emails not delivered)

1. Confirm Postmark API key is set in env and used by the app (test vs live).
2. Confirm `templateId` exists and template variables are correct.
3. Ensure worker/queue is running (if using background jobs).
4. Check Postmark suppression/bounce lists and remove test addresses in Postmark dashboard or via API.
5. Use Postmark activity logs to see accepted vs bounced messages.
6. If external access to verification link is required, set `APP_HOST` to an ngrok URL.

