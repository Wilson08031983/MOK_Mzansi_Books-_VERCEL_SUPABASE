Full Verification Email Flow (Signup → Verify → Redirect to Login)

**Goal:** Implement, document, and test the entire verification flow so that when a *new user* signs up (each signup creates a new company tenant), they immediately receive a verification email and, after clicking the link, are redirected to the Login page to sign in for the first time. The workflow must be secure, tenant-aware, single-use, and fully logged.

---

## High-level summary (one sentence)

When a new user signs up, create a new company tenant and an unverified user record, generate a single-use hashed verification token, send a branded Postmark verification email containing a tokenized URL, and when the user clicks the link validate the token, mark the user verified, delete the token, then redirect the user to the Login page with a success message.

---

## Requirements & constraints

* Work **local only**; use Postmark test server and local DB.
* Company = tenant: every signup creates a new `company` and `user.companyId` must be set.
* Do **not** auto-login the user after verification; redirect to Login page to sign in for the first time.
* Use environment variable `APP_HOST` (e.g., `https://dev.mokmzansibooks.local` or `http://localhost:8081`) for links — don’t hardcode `localhost`. For external QA use `ngrok` and set `APP_HOST` accordingly.
* Tokens must be single-use, short-lived (configurable, default 24h), and stored hashed.
* Use Postmark templates with company branding (Apple Sequoia theme).
* Log structured JSON events for all major steps (send attempt, postmark response, token created, token consumed).
* Provide acceptance tests and evidence artifacts.

---

## Data model (fields to check/create)

(Names are suggestions — map to your schema)

**Users table**

* id
* companyId
* email
* name, surname, position
* passwordHash
* verified (boolean default false)
* verifiedAt (timestamp nullable)
* createdAt, updatedAt

**Companies table**

* id
* name
* ownerUserId
* email (company owner/contact)
* createdAt, updatedAt

**VerificationTokens table**

* id
* userId
* tokenHash (store hashed token)
* expiresAt (timestamp)
* createdAt
* purpose (e.g., `email_verification`)
* usedAt (nullable timestamp)
* createdBy (system)

**Audit / Email logs**

* id
* event (email.send\_attempt, postmark.response, token.created, token.consumed)
* userId / companyId
* templateId
* postmarkMessageId (if present)
* status
* timestamp
* meta (JSON)

---

## Detailed step-by-step flow

### 1) Signup form (frontend)

* Page: `Signup / Create Account`.
* Fields required (map these to Company Details on creation): `First name`, `Surname`, `Company Name`, `Email`, `Position` (dropdown), `Password`, `Confirm password`.
* Client validation (email format, password strength).
* On submit: POST to `/api/signup` with all fields and `APP_HOST` will be used for generating verification URL server-side.
* UX: show "Creating your company..." spinner, then "Check your email: a verification link has been sent to <masked email>" on success. Do **not** assume verification complete — show instructions.

### 2) Backend: Signup handler (`/api/signup`)

* Validate payload server-side.
* Check `email` uniqueness across users (if exists and verified: return "Email already used. Please login"; if exists and unverified, allow or return option to resend verification).
* Create new **company** record with `companyName` and initial default settings (empty lists). Set `company.ownerUserId` to the user to be created.
* Create **user** record with `companyId`, `verified=false`, store hashed password (bcrypt/argon2).
* Create one **verification token** (see next step).
* Enqueue/send verification email.
* Return HTTP 201 + UI message: `"Signup successful — check your email to verify your account."`

> IMPORTANT: map signup fields to company fields (Name → Company Details Name; Surname → Company Details Surname; Email → Company Details Email; Position → Company Details Position) and persist them on the `companies` table as owner details.

### 3) Token generation & storage (server)

* Generate a cryptographically secure random token (e.g., 32+ byte base64 or urlsafe).
* Hash token using a secure hash (SHA256) before storing: `tokenHash = sha256(token)`.
* Create `VerificationTokens` row:

  * userId = new user id
  * tokenHash
  * expiresAt = now + `VERIFICATION_TOKEN_EXPIRY` (default 24 hours)
  * purpose = `email_verification`
* Log event: `{"event":"token.created","userId":..., "companyId":..., "timestamp":...}`.
* **Important:** Do not store plain token in DB — only the hash.

### 4) Build verification URL (server)

* URL pattern: `${APP_HOST}/auth/verify-email?token=<token>&uid=<userIdEncoded>`

  * `APP_HOST` from env.
  * Optionally encode userId (e.g., base64 or a signed short id) to keep link tidy.
* Example (dev): `https://dev.mokmzansibooks.local/auth/verify-email?token=abc123...&uid=u_abc`

### 5) Compose & send Postmark email

* Use Postmark test server / template.
* Template variables:

  * `firstName`, `companyName`, `verifyUrl`, `supportEmail`, `supportPhone`, `signature` (Wilson Mokgethwa Moabelo block).
* Subject: `Verify your MOK Mzansi Books account — Action required`
* From: `MOK Mzansi Books <noreply@mokmzansibooks.com>`
* Send call must include `companyId` or `userId` as metadata and `templateId` used.
* Log structured JSON send attempt:

  ```json
  {"event":"email.send_attempt","type":"verification","toMasked":"m***@gmail.com","userId":"u_xxx","companyId":"c_xxx","templateId":"postmark-verification","timestamp":"..."}
  ```
* If using a job queue, push job. Ensure worker processes queue.

### 6) Postmark response & logging

* Capture Postmark response (messageId, status).
* Log: `{"event":"postmark.response","messageId":"...","status":"Success","httpStatus":200,"timestamp":"..."}`.
* If Postmark response indicates rejection/suppression, capture and surface to admin log and show suggestion to user: "We couldn't send the verification email. Please contact support or try another email."

### 7) Frontend success UI

* After server returns success, show a clear page:

  * "Check your inbox — we sent a verification email to **m**\*@gmail.com\*\*. If you don't receive it in 5 minutes, check spam or click 'Resend verification email'."
  * Show `Resend verification email` button (disabled for N seconds to rate-limit).
  * Optionally show link to change email.

### 8) Clicking verification link (user flow)

* User clicks link in email (opens `/auth/verify-email?token=...&uid=...`).
* Frontend route displays "Verifying..." and POSTs token+uid to backend endpoint `/api/verify-email` (or GET allowed with server-side verification — but prefer POST for safety).
* Backend steps:

  1. Validate `uid` exists and map to `userId`.
  2. Look up verification token by `userId` and `purpose=email_verification`.
  3. Hash received token and compare with stored `tokenHash` (constant-time compare).
  4. If no match or `expiresAt < now` or `usedAt` present → return error (expired/invalid) and show UI: "Verification link expired/invalid. \[Resend verification email]" and a link to resend.
  5. If valid:

     * Update user: `verified = true`, `verifiedAt = now`.
     * Update token: `usedAt = now`.
     * Remove token row or keep with usedAt for audit.
     * Log: `{"event":"token.consumed","userId":..., "companyId":..., "timestamp":...}`.
     * Remove any "unverified account" soft-locks if present.
* IMPORTANT: token must be single-use. Subsequent uses must be rejected.

### 9) Redirect to Login page

* After successful verification, redirect user (HTTP 303 or frontend navigation) to `/auth/login` with a success flash message:

  * `"Your email is verified. You can now log in with your email and password."`
* Optionally show a “Login now” CTA button.
* Do not auto-login for security.

### 10) Resend verification flow

* Provide endpoint `/api/resend-verification`:

  * Rate-limit (e.g., once per 2 minutes per email).
  * Validate user exists and `verified=false`.
  * Invalidate old tokens (delete or mark used) and create a new token following steps 3–6.
  * Log `email.resend_attempt`.
* Show UI: "Verification email resent. Please check your inbox."

---

## Security & best practices (must implement)

* Hash stored tokens (SHA256 or better). Only the one-time raw token is sent via email.
* Tokens length: 32+ bytes URL-safe random string.
* Token expiry default: 24 hours (configurable). For security-critical cases consider shorter.
* Single-use enforced: after use, mark token `usedAt` and reject further uses.
* Rate-limit resend and signup to avoid abuse and spam.
* Use constant-time comparison to avoid timing attacks.
* Do not reveal whether a given email exists in error messages (avoid user enumeration); for internal dev you may log it but UI should remain generic.
* Mask email in UX and logs (e.g., `m***@gmail.com`) when showing to support screenshots.
* Record audit logs for each critical event: signup, token created, email send attempt, postmark response, token consumed, resend.

---

## Multi-tenant considerations (company isolation)

* Every signup creates a **distinct company** record and sets `user.companyId` to that company.
* The verification email must be scoped to the company context (branding variables passed to template).
* Ensure no data pre-population for new company — pages must be empty until user adds data.

---

## Postmark template & copy suggestions

**Template ID**: `postmark-verification` (or your existing id).
**Subject**: `Verify your MOK Mzansi Books account`
**Template fields**:

* `{{firstName}}`
* `{{companyName}}`
* `{{verifyUrl}}`
* `{{supportEmail}}`
* `{{supportPhone}}`
* `{{signatureBlock}}` (Wilson block)

**Sample email body (short):**

> Hi {{firstName}},
> Thanks for signing up for **{{companyName}}** on MOK Mzansi Books. Please verify your email by clicking the button below:
> **Verify my email** (link = {{verifyUrl}})
> If you did not sign up, ignore this email. The link expires in 24 hours.
> — Wilson Mokgethwa Moabelo, Founder & CEO

---

## Error handling UI flows

* On expired/invalid token page: show clear message with `Resend verification email` action. Log the attempt.
* On send errors: show `"We couldn't send verification email. Please try again or contact support."` and log Postmark error.
* On suppressed/bounced addresses: surface "Email bounce detected" to admin logs and suggest trying different email.

---

## Logging / Observability (required)

Log structured events to console/files for audit and evidence. Example events:

* `email.send_attempt` (with templateId, masked email, companyId)
* `postmark.response` (messageId, httpStatus)
* `token.created` (userId, companyId, expiresAt)
* `token.consumed` (userId, companyId, usedAt)
* `verification.resend` (userId, companyId, attempt)

Store logs for debugging and attach to deliverables.

---

## Acceptance tests & checklist (run locally, provide artifacts)

For QA run these and attach logs/screenshots:

1. **Signup + Email sent**

   * Action: submit signup form with test email (use Postmark test inbox).
   * Expect: server returns success, DB has `user` with `verified=false`, `verification_token` created, Postmark activity shows message accepted.
   * Evidence: server log (send attempt), DB snapshot (user + token), Postmark activity screenshot.

2. **Receive the email**

   * Action: check test inbox / Postmark test inbox.
   * Expect: verification email received within 60s, contains `verifyUrl`.
   * Evidence: email screenshot.

3. **Click verification link**

   * Action: click link (or copy/paste to browser).
   * Expect: backend validates token, sets `user.verified=true`, token marked used, redirect to `/auth/login` with success message.
   * Evidence: server logs (token consumed), DB snapshot (verified true), screenshot of login page with success message.

4. **Invalid token handling**

   * Action: use expired token or replay used token.
   * Expect: show "expired or invalid", allow resend.
   * Evidence: logs and UI screenshot.

5. **Resend verification**

   * Action: trigger resend.
   * Expect: new token created, old token invalidated, new Postmark email sent, rate limit enforced.
   * Evidence: logs, Postmark screenshot.

6. **Multi-tenant verification**

   * Action: sign up two different users (two companies).
   * Expect: each receives an email scoped to their company branding; verifying one does not affect the other.
   * Evidence: logs and screenshots.

---

## Deliverables (attach after work)

* `verification_flow.md` — narrative of implemented flow.
* `acceptance_checklist.md` — pass/fail for each test above.
* `evidence.zip` — server logs (email.send\_attempt, postmark.response, token.created, token.consumed), DB snapshots (before and after verification), Postmark activity screenshots, inbox screenshots showing the verification email, final login page screenshot.
* `files_touched.txt` — list of files/routes/endpoints updated (server routes, mailer, templates).
* `runbook.md` — how to re-run tests locally (set APP\_HOST, start worker, use Postmark test server, ngrok if needed).

---

## Final notes & tips

* Use Postmark **test server** keys in dev env. Do not use live keys until full verification.
* If QA needs to click links from external testers, use `ngrok` and set `APP_HOST` to the ngrok URL while testing.
* Keep the verification page UX friendly and accessible (mobile-friendly button).
* Mask secrets in logs/screenshots.
