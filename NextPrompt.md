Full Email Functionalities (with Paystack Webhooks & Postmark Templates)

You are working on a **multi-tenant subscription-based business management platform (MOKMzansiBooks)**.
The objective is to **implement and fully audit all email functionalities** across the project.

All emails must be **scoped per company/user**, automated, isolated, and integrated with **Paystack subscription events**.
Development must use the **Postmark test server** until production readiness.

---

## 🔑 Requirements

### Email Provider

* Use **Postmark** with test server for dev, live server for production.
* Use **Postmark templates** only (no raw inline HTML).
* Sender: `noreply@mokmzansibooks.com`.
* Emails must display **company branding** (logo, name, theme).
* All templates styled in **Apple Sequoia theme**.

---

## 📧 Email Functionalities

### 1. **Signup & Verification**

* New user signup → send verification email with **secure one-time token link**.
* Token expiry: 24h (configurable).
* Expired token → resend option.
* Clicking link activates account → redirects to login.

### 2. **Password Reset**

* “Forgot Password” → reset email with secure link.
* Token expires after set time, invalid after use.
* Log each request (sent, opened, used, expired).

### 3. **Team Invitations**

* Admin invites user → invitation email with secure **accept link tied to companyId**.
* Invite expires in 7 days.
* Accepting invite → user joins correct company tenant.
* Reject if email exists in another company.
* Log all invite events.

### 4. **Employee Add (Optional Email)**

* When admin adds employee → option “Send login email.”
* Sends welcome/setup email with **password creation link**.
* Token rules same as signup.

### 5. **Billing & Subscription Emails (Paystack Webhooks Integrated)**

* Paystack webhook events must automatically trigger Postmark emails:

  * **Subscription Started** → Welcome to plan email.
  * **Subscription Renewed** → Confirmation + receipt.
  * **Subscription Payment Failed** → Retry notice + grace reminder.
  * **Subscription Cancelled/Paused** → Inform user + last billing details.
  * **Subscription Expired** → Final notice + renewal CTA.
* Each billing email must include:

  * Plan name (Monthly/Annual).
  * Billing cycle date.
  * Amount charged (ZAR).
  * Company details.

### 6. **Quotations & Invoices**

* On “Send via Email”:

  * Generate PDF (quotation/invoice).
  * Attach PDF to email.
  * Email + PDF must show **company branding**.
* Log each send event (doc ID, recipient, timestamp).

### 7. **Notifications & Alerts (Optional)**

* Weekly summaries, VAT reminders, payroll alerts.
* Must be **opt-in** per user.

---

## 🔒 Security & Compliance

* Tokens: single-use, tied to companyId, short expiry.
* No sensitive info in body of emails.
* Log all email activity in JSON format:

  ```json
  {
    "event": "password_reset",
    "toMasked": "w***@gmail.com",
    "companyId": "c123",
    "templateId": "password-reset",
    "status": "sent",
    "timestamp": "2025-09-20T10:00:00Z"
  }
  ```
* Ensure no cross-company leakage (QuickBooks tenant model).

---

## ✅ Verification & Acceptance Tests

1. **Signup Verification** → User receives email + valid link.
2. **Password Reset** → Reset email works, expired links blocked.
3. **Team Invite** → Invite email valid, expired blocked.
4. **Employee Add** → Welcome email delivered.
5. **Billing Emails** → Simulate Paystack events (`subscription.create`, `invoice.success`, `invoice.failed`, `subscription.cancelled`) → correct emails triggered.
6. **Quotations/Invoices** → PDF attached + correct branding.
7. **Audit Logging** → JSON log entries exist for every email event.

---

## 📂 Deliverables

* `emails_report.md` → Documentation of flows implemented.
* `emails_checklist.md` → Test results (Pass/Fail per flow).
* `evidence.zip` → Screenshots of Postmark test inbox with received emails.
* `files_updated.txt` → Backend/frontend files updated for email.

---

## 📑 Postmark Templates (All 13 Must Work)

* account-lockout-email
* birthday-email
* generic-custom-email
* grace-period-reminder
* invoice-email
* invoice-payment-reminder
* login-notification
* low-stock-alert
* overdue-invoice-email
* password-reset
* payment-reminder-email
* quotation-email
* team-invitation-email
* trial-ending-email
* welcome-email

---

## 🚨 Notes

* Use Postmark **test server** until all tests pass.
* Match Apple Sequoia branding.
* Keep company data **isolated per tenant**.
* Do not break subscription or isolation logic.

---

🔹 **Instruction for AI Dev Env:** Implement, test, and audit all above email functionalities using **Postmark test server** and **Paystack webhooks**. Ensure isolation, automation, and compliance are enforced.

