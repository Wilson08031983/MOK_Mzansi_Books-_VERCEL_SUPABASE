Diagnose & fix missing verification emails (full flow + bypass removal)

**Goal (one sentence):** Find why new signups show “Account created — check your email” but never receive the verification email; remove any intentional bypass that auto-verifies accounts; re-enable the secure verification flow (token generation → Postmark send → token validation); permanently delete two bad unverified accounts; produce logs, evidence, and acceptance report. Work local-only and do not commit secrets.

---

## High-level checklist (do these steps, in order)

1. Search codebase for any “bypass” or “skip verification” flags and disable them (do not delete — comment and document).
2. Verify verification-token generation + storage (token created, hashed, expiresAt, stored).
3. Verify mail send call is executed and logged (email.send\_attempt) and Postmark API response recorded.
4. Check Postmark for suppression/bounce/rejection of the email addresses.
5. Check message queue / background worker responsible for sending emails.
6. Check resend flow and rate limits.
7. Permanently delete specified unverified accounts from DB ([mokgethwamoabelo@gmail.com](mailto:mokgethwamoabelo@gmail.com) and [mokgethwamoabelo@icloud.com](mailto:mokgethwamoabelo@icloud.com)).
8. Run end-to-end test signup → receive email → click verification → redirected to login.
9. Produce deliverables (logs, screenshots, postmortem).

**Important rules before editing**

* Work local only (local DB). Do not change production data.
* Inspect code before changing anything. Avoid duplicating files or handlers.
* Do not commit environment secrets to Git — use env files locally and keep secrets out of commits.
* Log everything in structured JSON to console/email\_logs for the audit.

---

## Step A — Find & disable the bypass (very likely root cause)

Search the repo (frontend + backend) for the following keywords (case-insensitive):

* `bypass`, `skipVerification`, `autoVerify`, `forceVerified`, `VERIFY_BYPASS`, `SKIP_EMAIL_VERIFICATION`, `AUTO_VERIFY`, `mockEmail`, `DEV_SKIP_VERIFY`, `testOnlyVerify`
  For each match:

1. Identify where the flag is set (env var, test helper, seed script).
2. If flag is `true` or code path auto-sets `user.verified = true`, temporarily disable it and document the exact file & lines changed.
3. If the bypass was added as a temporary patch, revert to the original verification code path: ensure user remains `verified = false` after signup and the mailer is invoked.
4. Add/or update a TODO comment explaining why bypass existed and how to re-enable only for safe local testing.

Log a structured note:
`{"event":"bypass.disabled","file":"<filepath>","oldValue":"true","newValue":"false","timestamp":...}`

---

## Step B — Verify server-side signup/verification code paths

Open and inspect these endpoints / modules (or their equivalents in your codebase):

* `POST /api/signup` (or `api/auth/signup`, `api/users/create`)
* `POST /api/verify-email` or `api/auth/verify`
* `POST /api/resend-verification`
* mailer service / `services/mailer` / `services/email` / `src/services/postmark*`
* queue/worker that flushes email jobs (e.g., `jobs/emailWorker`, `worker.js`, `bull`, `agenda`)

Confirm:

1. Signup creates `company` and `user` with `verified=false`.
2. Signup creates a verification token record: token (random), tokenHash (SHA256 stored), expiresAt, purpose.
3. Signup enqueues or immediately calls mailer with `to`, `templateId`, `verifyUrl` and logs `email.send_attempt`.
4. `verify-email` endpoint validates tokenHash (constant-time compare), `expiresAt`, `usedAt` and sets `user.verified = true`, `verifiedAt` and marks token `usedAt`.
5. Resend handler invalidates old tokens and creates+sends a new one, with rate limit.

If any of these steps are missing or short-circuited because of bypass, re-enable the full flow and log what you changed.

Log example:
`{"event":"signup.flow.checked","signupEndpoint":"/api/signup","tokenCreated":true,"mailerCalled":true,"timestamp":...}`

---

## Step C — Check verification token generation & persistence

Run a local signup (use a test email you can check). Immediately inspect DB:

* Confirm a `verification_tokens` table/collection/document exists for that user.
* Fields to check: `tokenHash`, `expiresAt`, `purpose='email_verification'`, `usedAt=null`.
* Ensure only the **hash** is in DB — raw token should not be stored.

If token is not created:

* Look for early returns in signup code or errors swallowed by try/catch.
* Re-enable token generation and add console logs at token create point:
  `console.log(JSON.stringify({event:"token.created","userId":..., "companyId":..., "expiresAt":...}))`

---

## Step D — Confirm mailer is invoked and Postmark interaction

1. At token creation, the server should call mailer: `mailer.sendVerification({to, firstName, company, verifyUrl, templateId})`.
2. Ensure mailer logs both send attempt and Postmark response:

   * `email.send_attempt` (before call)
   * `postmark.response` (after call: success|rejected|error|bounce)
3. If a job queue is used: confirm job is enqueued and worker is running. If job remains queued but worker not processing, start worker and confirm job runs.
4. If mailer is stubbed for local dev (mockEmailService), either:

   * Unstub it to use Postmark test server OR
   * Ensure the mock writes an `email.send_attempt` log and a simulated `postmark.response` so the flow behaves like a real send.

Log expected actions:
`{"event":"email.send_attempt","toMasked":"m***@...","userId":"u_xxx","companyId":"c_xxx","template":"verification","timestamp":...}`
then
`{"event":"postmark.response","messageId":"pm_xxx","status":"Success","httpStatus":200,"timestamp":...}`

---

## Step E — Inspect Postmark (developer checklist)

Locally, verify env variables reference Postmark test settings (do **not** paste secrets into code). In Postmark dashboard:

1. Check Postmark Activity for the test email addresses — was the message accepted, bounced, or suppressed?
2. If suppressed/bounced, investigate suppression reason and remove the address or fix content causing bounce.
3. If Postmark shows message accepted but you don’t see it in your inbox:

   * Check spam/junk.
   * Confirm `From` address is the same as sender configured in Postmark (must match verified sender).
4. If Postmark rejects because of invalid template ID: confirm the `POSTMARK_TEMPLATE_VERIFICATION_ID` in env matches the template in Postmark.
5. If anything in Postmark settings is misconfigured (sender, domain verification, message stream), correct in dashboard and re-test.

Log example from Postmark:
`{"event":"postmark.inspect","messageStatus":"Accepted|Bounced|Suppressed","detail":"...","timestamp":...}`

---

## Step F — Worker / Job queue health

If your mailer uses a job queue:

* Check the queue engine (Redis/Bull/Agenda) is running locally.
* Confirm jobs are dequeued and processed.
* If jobs persist, start the worker and re-run the signup test.
* Add logging at job start and completion.

Log example:
`{"event":"email.job.process","jobId":"j_xxx","status":"started|completed|failed","timestamp":...}`

---

## Step G — Resend verification & rate-limit checks

Test the resend endpoint:

1. Trigger `/api/resend-verification` for the test user.
2. Confirm new token created, old tokens invalidated, and mailer invoked.
3. Confirm rate-limit (e.g., second attempt within 2 minutes is throttled).

Log example:
`{"event":"verification.resend","userMasked":"m***@...","result":"sent|rate_limited","timestamp":...}`

---

## Step H — Delete problematic unverified accounts (requested)

Permanently remove these unverified accounts and associated tokens from local DB:

* `mokgethwamoabelo@gmail.com`
* `mokgethwamoabelo@icloud.com`

Procedure:

1. Confirm accounts exist and are `verified=false`.
2. Delete user record(s), company record(s) created alongside them, and any `verification_tokens` entries.
3. Log deletion with masked emails and DB ids:
   `{"event":"account.deleted","userMasked":"m***@...","userId":"u_xxx","companyId":"c_xxx","reason":"cleanup-unverified","timestamp":...}`

**Warning:** Only delete these accounts in local DB for this dev cycle. Do not delete in production unless you are certain.

---

## Step I — End-to-end test (must pass)

After bypass removal and mailer fixes, run this E2E locally:

1. Clear local DB test data or create a fresh DB snapshot.
2. On signup page: Fill signup form with a test email you control (or Postmark test inbox).
3. Submit and confirm:

   * Response shows “Account created — check your email”.
   * `verification_tokens` row exists (DB).
   * `email.send_attempt` log exists (console + email\_logs).
   * Postmark shows accepted message (or mock service wrote success).
4. Receive email and confirm `verifyUrl` contains token UID; click the link.
5. Server validates token, sets `users.verified = true`, sets token `usedAt` and returns success.
6. Frontend redirects to `/auth/login` and shows success message.
7. Confirm `email_logs` show send and `token.consumed` is logged.

Capture these artifacts:

* Console logs (structured JSON) for token creation, email send attempt, Postmark response, token consumed.
* DB snapshots (redacted) showing user record before/after verification and token row with `usedAt`.
* Email screenshot showing verify link.

---

## Acceptance criteria (all must be true to close ticket)

* Bypass/auto-verify flag is disabled and documented.
* On signup, a verification token is created and stored hashed.
* Mailer is invoked; an `email.send_attempt` log is present and Postmark (or mock) responded OK.
* Test verification email is received (or Postmark accepted send) and clicking link marks the account verified.
* The two specified unverified accounts are removed from local DB.
* All steps have structured logs and artifacts attached to deliverables.

---

## Deliverables (attach when done)

1. `fix_report.md` — one-page summary of root cause, changes made (file paths + brief diff description), and how bypass was disabled.
2. `evidence.zip` — console/log screenshot(s), Postmark activity screenshot, DB snapshots (redacted), email screenshot (verification email), and final login screenshot.
3. `files_touched.txt` — file paths changed with short description of change.
4. `audit_logs.json` — structured JSON logs for events listed above.
5. `run_instructions.md` — how to re-run tests locally (env var list, start worker, test email address).

---

## Quick debug checklist (if still not receiving)

* Are you using a mock mailer that doesn’t actually call Postmark? If so, switch to Postmark test sender for this full test.
* Is the Postmark template ID in env correct? (typo will silently cause rejections)
* Is the sender address verified in Postmark and matches `From`? (unverified sender can block mails)
* Is the worker processing the email jobs? (if queue is used)
* Are the test emails on Postmark suppression list? (remove if needed)
* Is the verification link correctly built (APP\_HOST env)? If using ngrok for external click, set `APP_HOST` to ngrok URL.