
We Once Done a Correction on Isolation of Account (Please See Previous Prompts PreviousPrompt.md For More Details), But is See that All the Accounts are Still Saving Under One Account, Previously All this Account were Saving Under admin@mokmzansibooks and Created another Account ruben@gmail.com and i still Get all the previous Accounts That Are in

1. company Page div > Team Management Tab button div , Team Members div ,

2. hr-management Page div > Employees Tab button div , Employee Management div

This shows that Isolation is Not Correctly Done If All this Companies 'New Users Are Still Visible on a New Acccount i Created ruben@gmail.com and the Same Accounts Were visible on admin@mokmzansibooks.com and Again this is Separate Accounts But Saved In two different Accounts, Please Remove them and Do a Complete Clean Up

Here’s a single copy-and-paste prompt you can use directly in your AI development environment:

---

**Prompt:**

We need to correct the account isolation logic across the entire project. Currently, data from one company/user account is leaking into another, which means isolation between tenants is not functioning as intended.

**Observed Problems:**

1. On the **Company Page → Team Management Tab**, team members from other accounts are still visible when creating or switching to a new user/company.

2. On the **HR Management Page → Employees Tab**, employees from other accounts are still showing under newly created accounts (e.g., creating a new account [ruben@gmail.com](mailto:ruben@gmail.com) shows all employees and team members that also appear under [admin@mokmzansibooks.com](mailto:admin@mokmzansibooks.com)).

**Required Fixes:**

* Completely remove any shared or global storage of accounts, users, team members, or employees across tenants.

* Ensure each **company account** and its **users** (team members, employees, clients, projects, invoices, quotations, etc.) are strictly isolated and cannot be seen by another account.

* Implement proper **tenant isolation** using `companyId` or `userId` as a scoping key for all records across all modules (Team Management, Employees, Quotations, Invoices, Projects, etc.).

* Perform a **full cleanup** of the backend database:

* Delete all existing user/company data, including [admin@mokmzansibooks.com](mailto:admin@mokmzansibooks.com), [ruben@gmail.com](mailto:ruben@gmail.com), and any seeded/mock/default data.

* Reset every page/module (Company, HR Management, Invoices, Quotations, Projects, etc.) to a clean state with no preloaded accounts, employees, or team members.

* After cleanup, enforce isolation so that:

* When a **new company signs up**, only that company’s users and employees are visible within their own scope.

* Switching accounts (e.g., from [admin@mokmzansibooks.com](mailto:admin@mokmzansibooks.com) to [ruben@gmail.com](mailto:ruben@gmail.com)) shows only that account’s data, with no overlap.

**Goal:**

Achieve true multi-company separation (tenant isolation), so each company and its users manage only their own data in a secure, isolated environment.

At the end of this task, please confirm isolation by creating at least two separate accounts and verifying that data (team members, employees, invoices, projects, etc.) remains isolated per account with no crossover.

Prompt 1:

Multi-Company Data Isolation and Clean Signup Flow

Prompt for Multi-Company SaaS Data Isolation

Our application is a multi-tenant SaaS (serving many different companies, each with separate users). Each new signup must create an entirely new company tenant with its own clean dataset. Currently, new users are inheriting data from the default admin account (admin@mokmzansibooks.com), which should not happen. In a proper multi-tenant design, every user is associated with a unique company (tenant) ID, and all data queries must be filtered by that ID so a user sees only their company’s data
softwareengineering.stackexchange.com
. Likewise, there should be no pre-selected default data for a new company. For example, one best-practice tutorial explains that a multi-tenant app should have “no default data source available when the application starts” – instead, the correct (empty) database is chosen when a user logs in with tenant info
blog.v2stech.com
. Also, many frameworks auto-seed initial data (like a default admin user) when creating a tenant
abp.io
; we specifically want to disable all such seeding. In summary, each new company must start with blank pages (no clients, quotes, invoices, etc.) and all user/company records must be isolated by a companyId
softwareengineering.stackexchange.com
abp.io
.

Key Requirements

New Tenant Isolation: Treat each signup as a new company/tenant. Do not link new users to the existing admin@mokmzansibooks account or data. Each company should have its own unique tenant ID (companyId) and only its data should be visible
softwareengineering.stackexchange.com
.

Signup Field Mapping: On the signup page, take the user-entered fields and populate the new company’s details. For example: Name → Company Details (Name), Surname → Company Details (Surname), Company Name → Company Details (Company Name), Email → Company Details (Email), Position → Company Details (Position). In short, the signup form fields should create the company profile fields.

Empty Default Pages: For a new company, all module pages (Clients, Quotations, Invoices, Projects, Inventory, HR Management – both Employees tab and other HR tabs, Accounting Income tab, and Settings) must appear empty. There should be no pre-populated records. In other words, remove or disable any hard-coded or seeded example data so that the new user must manually add all entries. This ensures each tenant starts from a blank slate (as recommended for multi-tenant setups
blog.v2stech.com
abp.io
).

Data Filtering by Company ID: Ensure the backend uses the existing tenant logic: every user and record has a companyId (or tenantId) that scopes the data. All database queries should include this filter so users see only data for their own company
softwareengineering.stackexchange.com
. This means, for example, when fetching clients, quotations, invoices, etc., filter by the current user’s companyId.

Remove Seed/Mock Data: Explicitly remove any default or mock records that may have been created by the system. For instance, disable or delete any initial “example” clients, inventory items, or admin users. As one multitenancy guide notes, avoid auto-seeding an admin on tenant creation
abp.io
. Our requirement is that new companies have no leftover data from any other tenant.

Settings Isolation: Each company’s Settings page and configurations must be independent. On creation, a new company’s settings should also start empty or default to generic (not copying from admin). New users should configure their own settings rather than inheriting any existing ones.

Backend (Database) Logic: Assume user accounts and data live in a backend database (not localStorage). The AI prompt should instruct the solution to operate on the database (e.g. using ORM or SQL queries) with the tenant separation in mind. Make it clear that the system is already multi-tenant capable (using a companyId on user profiles), and we want to correct the logic so new sign-ups get a fresh, isolated database context
softwareengineering.stackexchange.com
.

Clean Startup: Instruct the AI to remove any code that assumes a single global admin or reuses global data for new users. For example, exclude any “DataSourceAutoConfiguration” or default context as suggested in some guides
blog.v2stech.com
, so that each user’s company is treated separately.

Example AI Prompt

Use the following instructions as a single prompt in your AI development environment. It asks the AI to implement all the above requirements for multi-tenant data isolation:

You are a backend developer for a multi-tenant SaaS application. Each company has its own users and data. Implement the following changes:

New Company per Signup: Treat every signup as creating a new company tenant. Do not associate new users with the existing admin or its data.

Field Mapping: On the signup form, save the submitted Name, Surname, Company Name, Email, and Position into the new company’s Company Details record (map each field to the corresponding field in the Company Details tab).

Empty Module Pages: Ensure that after signup, pages like Clients, Quotations, Invoices, Projects, Inventory, HR (Employees and other tabs), Accounting (Income), and Settings show no existing data. Remove any default records so the user sees empty lists and must add their own data.

Tenant Filter: Use the tenant/companyId in every data query. All user profiles and company records should include a companyId that is the same as the new company. When fetching data (clients, quotes, etc.), filter by this companyId so only the company’s own data is accessed.

Remove Seed Data: Delete or disable any code that seeds initial data for a new tenant. Do not auto-create an admin or sample entries for the new company. The new company’s database tables should be blank (as per multi-tenant best practices
abp.io
).

Settings Isolation: Ensure each company has its own Settings configuration. On company creation, the Settings page should not inherit values from the admin or any other tenant.

Database Persistence: All accounts and company data are stored in the backend database (not in localStorage). Use the existing tenant-based logic and database schema to implement these changes.

Clarifications: Accounts are managed in the database and each user already has a companyId (tenantId) for scoping. Remove any code that ties data to the global admin user. Every piece of data should be scoped by the new user’s company.

Make sure the AI’s output respects multi-tenancy: each new company starts fresh and isolated, and no old user’s data appears in a new account. The above instructions summarize all needed changes.

Sources: Multi-tenant best practices suggest using a company/tenant ID to filter data
softwareengineering.stackexchange.com
 and avoiding any default seed data on new tenant creation
blog.v2stech.com
abp.io
. These requirements are applied here to ensure each new user/company has an empty, separate workspace.


**audit** whether the multi-company / multi-tenant isolation requirements were implemented correctly. It is intentionally comprehensive and structured so the auditor can run manual and automated checks, inspect backend data, and produce the deliverables you need.

---

**AUDIT PROMPT — Multi-Company SaaS Data Isolation**

LOCATION: local development environment (backend + frontend) — signup flow, tenant creation, company details, session/auth logic, DB/ORM layer, all pages: Clients, Quotations, Invoices, Projects, Inventory, HR Management, Accounting > Income, Settings, Notifications, and background workers.

GOAL (single instruction):
Perform a complete, non-destructive audit verifying that every **new signup** creates a **fresh, isolated company tenant** with no data carried over from any existing tenants (especially [admin@mokmzansibooks.com](mailto:admin@mokmzansibooks.com)). Confirm that signup fields map to company details, no seeded/mock data is visible to new tenants, all queries are scoped by companyId/tenantId, and settings / notification / session logic are tenant-isolated. Produce a detailed audit report, evidence (logs, DB snapshots, screenshots), remediation steps for any failures, and an acceptance checklist.

GENERAL RULES FOR THE AUDITOR
• Work local only. Do not modify production.
• Inspect existing code before changing anything. Do not duplicate files.
• Use test accounts; redact PII in exported artifacts.
• Log all verification steps and outputs to console / audit log.
• If you change anything for testing, revert and document changes.

AUDIT SCOPE (what to verify)

A. Signup → Company Creation & Field Mapping (Critical)

1. Create a brand-new test user using the signup form (use a unique email not seen before). Record the exact input values:

   * Name, Surname, Company Name, Email, Position, Password.
2. Verify the verification-email step (if implemented): after clicking verification link, that user is activated and redirected to login.
3. After login, open Company Page → Company Details and confirm the following fields are populated from the signup values exactly: Name, Surname, Company Name, Email, Position.
4. Confirm the company record in the database is created and contains a unique `companyId` (tenantId) tied to the new user (i.e., user.companyId === company.id).
5. Verify that this new company has a fresh company record (no inherited fields from admin user) and that any default settings are generic, not copied from admin.

B. Tenant Isolation — Per-page Data (Critical)
For the new test user (fresh tenant), visit each of the following pages and verify **no existing company data is visible** (should be empty lists or appropriate “no data” UI):
• Clients Page
• Quotations Page
• Invoices Page
• Projects Page
• Inventory Page
• HR Management (Employees and other HR tabs)
• Accounting → Income tab
• Settings Page (company configuration pages)

Actions to perform and evidence to collect:
• Take screenshots of each page (showing empty state).
• Confirm backend responses for each fetch request return zero records for that companyId. Log the API response.
• Capture the database query results for each table filtered by the new companyId (export or screenshot). Redact PII.

C. Data Scoping & Query Filter Verification (Critical)

1. Inspect server/API code that fetches tenant data (controllers/services/ORM queries). Identify how the companyId is obtained (session token, JWT claim, request header, cookie). Document the code paths and file names where scoping occurs.
2. For representative endpoints (clients list, invoices list, employees list), confirm that database queries include a filter based on companyId. Record the code file/line references and sample query structure (in plain English).
3. Test negative case: attempt to fetch a record from another tenant by manipulating parameters; confirm the API denies access or returns 404/empty.
4. Ensure session/auth tokens include companyId and that the frontend attaches the token properly on each request.

D. Seeded / Mock Data Removal (High)

1. Search startup scripts, database seeders, or tenant-creation routines for any hardcoded seed data that auto-creates example clients, admin data, or sample invoices. Provide a list of files found.
2. If seed data exists, confirm it is disabled for new tenants and that seeding does not run automatically for each new signup. Document whether sample data remains present for preexisting tenants and how to remove it safely.
3. Verify that the admin account ([admin@mokmzansibooks.com](mailto:admin@mokmzansibooks.com)) data is not used as a template for new tenants.

E. Settings Isolation (High)

1. Create a second test tenant (different signup email). Change a setting (e.g., company name, timezone, currency) in tenant A, then verify tenant B does not reflect that change.
2. Document settings stored per company in the DB and the table/field names. Confirm the Settings page reads/writes company-scoped settings only.

F. Notification & Bell Isolation (High)

1. Log in as new tenant and verify Notification Bell is empty (except system messages intended for all tenants). Confirm notifications created for tenant A do not appear for tenant B.
2. Verify scheduled emails (trial reminders, payment notices) include the correct company context and links.

G. Authentication & Session Hygiene (High)

1. Confirm logout invalidates session tokens. Open a new browser or incognito and verify old sessions do not leak data.
2. Test switching users in same browser: login as tenant A, logout, login as tenant B — confirm no prior company data is visible.

H. Database & Persistence Checks (Critical)

1. For the new test tenant, query the canonical tables (users, companies, clients, invoices, projects, inventory, employees, settings) with a filter on that companyId and confirm row counts are zero (except for company and the initial user record).
2. Export small, redacted CSV snapshots of these tables for evidence.

I. Edge Cases & Race Conditions (Medium)

1. Simultaneous signup attempts: simulate two signups at the same time; verify unique companyIds created and no cross-contamination.
2. Multi-tab behavior: login as tenant A in one tab, open tenant B in another — ensure auth tokens, cookies, and local caches don’t mix.

J. Files & Code Paths to Inspect (Required list returned by auditor)
Ask the auditor to list the exact files they inspected (frontend API calls, server routes, auth middleware, tenant resolver, seed scripts, DB migrations, and any background workers that create company data).

DELIVERABLES (what to return)

1. **audit\_report.md** — narrative report with findings, categorized by severity (Critical / High / Medium / Low), including exact reproduction steps for any issue.
2. **acceptance\_checklist.md** — checklist with each verification step and PASS / FAIL + short notes.
3. **evidence.zip** (redacted) — screenshots of each page for each test tenant, API response logs, DB query snapshots (CSV), and structured console logs.
4. **files\_inspected.txt** — absolute file paths and brief notes on what was checked in each file.
5. **remediation\_plan.md** — for every failed item provide clear code pointers (file names & suggested fix approach in plain English), priority, and estimated risk.
6. **final\_verification\_steps.md** — exact steps to re-run to confirm fixes (smoke tests and acceptance tests).

ACCEPTANCE CRITERIA (must be TRUE to pass)
• New signup creates a company record and a unique companyId tied to that user.
• Company Details populated from signup fields after verification.
• All module pages for a new company show empty states (no clients, quotes, invoices, projects, inventory, HR entries, or accounting income rows).
• All API queries and DB operations filter by companyId — no cross-tenant data returned.
• No seeded/mock data is visible to new tenants. Any seeding is explicitly controlled and disabled at tenant creation time.
• Settings are per-company and changes in one company do not affect others.
• Notifications are scoped per company.
• Session tokens and auth include company scoping; sign out clears session data.
• Audit produces the six deliverables above.

TEST CASES (run these, include expected results & evidence)

1. **Signup & mapping** — create user A: expect company details match signup; evidence: screenshot + DB row.
2. **Empty pages** — login user A and view Clients/Invoices/Projects/Inventory/HR/Accounting/Settings: expect empty state; evidence: screenshots.
3. **Cross-tenant fetch** — attempt to access tenant B’s client ID while logged in as tenant A: expect 404/empty; evidence: API response log.
4. **Settings isolation** — modify setting in tenant A and verify tenant B unaffected; evidence: screenshots + DB diff.
5. **Seed validation** — check seed scripts are disabled or guarded; evidence: file list and seed config.
6. **Race condition** — concurrent signups produce unique companyIds; evidence: DB snapshots.
7. **Notification isolation** — create notification for tenant A; check tenant B’s bell empty; evidence: screenshots + DB notification rows.
8. **Logout hygiene** — login, logout, login another user — previous user’s data not present; evidence: sequence logs.

LOGGING & OUTPUT FORMAT
• All logs should be structured JSON and include fields: event, userEmail (masked), companyId, endpoint, query, resultCount, timestamp. Example fields requested in logs: `{"event":"api.fetch.clients","user":"m*****@example.com","companyId":"c_123","resultCount":0,"timestamp":...}`.
• Provide a short summary table in the audit\_report.md with PASS/FAIL per acceptance criterion.

TIMING & NOTES
• If any critical failures are found (cross-tenant exposure, seeded admin data visible to new tenants), stop further tests and escalate immediately with reproduction steps and exact DB record IDs involved.
• If fixes are made, re-run the acceptance checklist and provide a delta report showing which checks changed from FAIL → PASS.

Prompt 2:

Here is a single, comprehensive prompt written for direct copy-paste into an AI development environment. It is structured in a clear step-by-step sequence, contains explicit rules to avoid duplication or misconfiguration, and includes all required functionality from **A through F**.

---

### 📌 Full Development Prompt (Copy-Paste Ready)

This is a **very long, connected prompt** and it is important not to miss any steps. Each instruction builds on the previous, so the execution must be done carefully to ensure full functionality.

---

#### **A. Important References and Requirements**

1. For every action, always **refer back to the task for advanced understanding** before executing. Do not assume — check first.
2. These functions and prompts have been implemented before in parts. Therefore:

   * Update only when required.
   * Investigate files before making changes.
   * Avoid file duplication.
   * Avoid function duplication.
   * Avoid backend duplication.
3. Backend must remain **local only** until development is complete. Later, it will be copied to Supabase.
4. All new changes must **match the theme of the website** (Apple Sequoia inspired).
5. **Avoid hard-coded changes**. All updates must remain dynamic and reusable.
6. After all tasks are implemented, conduct **full testing** to confirm end-to-end functionality.

---

#### **B. User Reset for Development**

* Remove all previously created users from the `signup` page.
* Keep only the testing account:

  * **Email:** [admin@mokmzansibooks.com](mailto:admin@mokmzansibooks.com)
  * **Password:** admin123
* This testing account will be removed in production, but it must remain available during development.

---

#### **C. Multi-User and Company Setup**

1. Each new signup represents a **completely independent company, organization, or individual**. No data between users should overlap.

2. The **email address** used during signup must act as the unique identifier linking the user to their company.

3. Add the following fields to the `signup` page → Create Account form:

   * **Company Name**
   * **Position** (dropdown with options: CEO, Managing Director, Director, Founder, General Manager, Operations Manager, Finance Manager / CFO, Bookkeeper)

4. After creating an account, the user must receive a **verification email** with a link that returns them to the login page.

5. Prevent duplicate signups:

   * An email address already used must redirect to login.
   * A company name already used must redirect to login.

6. Create a **verification email template** styled like the existing welcome and invoice templates. It must include the MOKMzansiBooks logo, signature, design, and this information:

   ```
   Wilson Mokgethwa Moabelo  
   Founder & CEO  
   MOK Mzansi Books  
   support@mokmzansibooks.com  
   +27 64 550 4029  
   81 Monokane Street  
   Atteridgeville x17  
   Pretoria, Gauteng 0006
   ```

7. After verification, link the signup fields (email, company name, position, etc.) directly to the **Company Page → Company Details Tab**.

---

#### **D. Role and Employee Management**

1. The first verified user is the **Company Owner (New User)**. This person’s data becomes the official company profile.

   * Their information can only be edited in **Company Page → Company Details Tab**.
   * It cannot be deleted elsewhere in the system.
2. The New User can expand their team by:

   * **Inviting team members** → Company Page → Team Management Tab → Invite Team Member.
   * **Adding employees directly** → HR Management Page → Employees Tab → Add Employee.
3. Role hierarchy:

   * **Admin Users (unrestricted access):** CEO, Managing Director, Director, Founder, General Manager, Operations Manager, Finance Manager/CFO, Bookkeeper.
   * **Regular Users (restricted):** All other roles added by Admins.
4. Admin Users must be able to **log in with their invitation email and password**. Any Admin under the same company can make changes, and these changes must sync across all other Admins for teamwork.

---

#### **E. Dashboard Enhancements**

1. Display dynamic greetings:

   * **First login:** “Welcome, (Name)”
   * **Returning login:** “Welcome Back, (Name)”
   * The (Name) must always be the name of the Admin User currently logged in.
2. On the **Top Bar avatar**, use the **first letter of the Admin’s first name + first letter of the Admin’s surname** (not company details).
3. Show a **welcome notification popup** in the Notification Bell for every New User after first login.

---

#### **F. Payment and Billing**

1. **Settings → Billing Tab**:

   * **Overview Tab**

     * Show subscription status.
     * Make “Cancel Subscription” fully functional.
     * Payment Method section must allow updates.
     * Payment History must display transaction records.
   * **Plans Tab**

     * Must function exactly like the Payment Page (identical design & functionality).
   * **Billing Tab**

     * Remove this tab completely.
2. **Trial and Subscription System**:

   * On first login, start a **30-day free trial countdown**. Show trial days remaining in the Top Bar.
   * At 5 days left, send an email reminder to the company owner (New User).
   * Include a **Payment Link** in the email for subscription.
   * Create a professional email template for both “5 Days Left” and “5-Day Grace Period” reminders using the same style system as other templates. Include the full company signature block.
3. **Trial Limitations (Free 30 Days):**

   * Up to 5 invoices/month
   * Up to 5 quotations/month
   * Up to 5 clients
   * Up to 5 projects
   * Up to 5 inventory items
   * Up to 5 suppliers
   * Up to 5 storage locations
   * Basic support only
4. **Payment Flow:**

   * Successful payment → redirect first to `ThankYou.tsx` → then to Dashboard.
   * Remove trial countdown and unlock all features.
5. **Billing Cycles:**

   * Monthly subscription = 31 days = R60
   * Annual subscription = 365 days = R684 (5% discount)
   * Automatically bill every cycle.
6. **Grace Period Handling:**

   * If payment fails after trial or subscription renewal → grant 5-day grace period.
   * Retry debit daily for 5 days.
   * Send daily reminder emails.
   * If payment succeeds → stop retries, restore full access.
   * If payment fails after grace → lock out all pages except Dashboard.
   * Show banner at top: “Please Pay to Access Full Function.”
   * Notification Bell must show “Update Card Details” linking to Billing → Overview → Payment Method → Update.
7. **Payment Integration:**

   * Use **Paystack** as processor.

---

#### **G. Final Verification**

At the end of development, confirm completion with a **checklist of ticks (✓)** for tasks A through F. Each must show as tested and working.

---

✅ This prompt is structured for complete execution, avoids duplication, matches the theme, and enforces end-to-end subscription and user management logic.

Great, I’ll conduct a detailed audit prompt focusing on your multi-tenant SaaS project. I’ll include instructions to address all isolation issues, correct user/company scoping, and ensure complete removal of shared or default data—including `admin@mokmzansibooks.com`. I’ll also provide insights into how QuickBooks handles company isolation so your setup can align accordingly. I’ll let you know once it’s ready.

Perform a full, non-destructive **audit + cleanup + verification** of the multi-tenant SaaS app using the requirements from the previous prompts (Multi-Company Data Isolation, Signup mapping, Subscription/Billing rules, and related UX rules).
**This is a single copy-paste prompt for your AI development environment / dev team. Do not produce code here — only run the audit, make safe local fixes where specified, and produce the requested deliverables.**

---

## CONTEXT & GOAL

You are auditing a multi-tenant SaaS (local backend only for now) that must treat **every signup as a new, isolated company (tenant)**. Current problems: new users inherit data from previous accounts (especially `admin@mokmzansibooks.com`), notifications and pages show cross-tenant data, seed/mock data is leaking into new tenants, and subscription/billing state is inconsistent. Your job: verify all isolation rules are implemented correctly, wipe legacy test data (including admin account) as requested, fix any isolation violations, and produce a complete audit report + remediation plan + evidence.

**Work locally only.** Do not push to production or live services. Reference previous prompts (signup mapping, tenant rules, subscription rules, email/Mailjet notes) while auditing.

---

## HIGH-LEVEL TASKS (in order)

1. **Inventory & inspection**

   * List files and modules to inspect (auth middleware, tenant resolver, signup flow, company creation, seeders, DB migrations, API endpoints for clients/quotations/invoices/projects/inventory/hr/accounting/notifications/settings, background workers, billing worker).
   * Document where `companyId`/tenant scoping is performed and how it is attached to sessions/JWTs.

2. **Database cleanup (local)**

   * **Wipe all existing test user & company records** (including `admin@mokmzansibooks.com`) from local DB as requested. Keep a redacted backup (export) **before** deleting — store in `evidence.zip` with PII redacted.
   * Ensure the DB is left in a clean state: no seeded clients/quotes/invoices/projects/inventory/employees/settings belonging to other companies remain.
   * Note: only perform this wipe on the local dev DB. Document the exact SQL/ORM commands used in `files_inspected.txt` and `remediation_plan.md`.

3. **Signup & company creation verification**

   * Confirm each signup creates a new `company` record and links `user.companyId === company.id`.
   * Verify the signup fields map exactly to Company Details: `Name`, `Surname`, `Company Name`, `Email`, `Position`.
   * Ensure verification email flow (if present) triggers and only after verification are company details activated/used.

4. **Tenant isolation fixes**

   * Ensure **every** API endpoint, service, and frontend fetch that reads tenant data (clients/quotations/invoices/projects/inventory/hr/accounting/notifications/settings) filters by `companyId` from authenticated session/JWT.
   * Fix any endpoint or UI that returns cross-tenant results. For each fix, record the file path and exact change required in plain English in `remediation_plan.md`.

5. **Notifications & Activity log**

   * Ensure Notification Bell and company Activity Log return records only for current `companyId`.
   * Confirm scheduled notifications (trial reminders, billing notices) generate with correct company context and are sent only to that company’s users.

6. **Per-page empty state checks**

   * For a newly created test tenant (fresh signup), verify these pages show empty states:

     * Clients, Quotations, Invoices, Projects, Inventory, HR Management (Employees & other HR tabs), Accounting → Income & Tax tabs, Settings → General
   * Capture screenshots showing empty states and API response logs showing zero records.

7. **Settings & Users tab**

   * Confirm Settings → General reads/writes the current company’s details (not admin’s).
   * Confirm Settings → Users (Administrative Users) lists only users for that company.
   * Ensure company owner/admin created at signup is editable only via Company Details and cannot be overwritten by other tenants.

8. **Session/auth hygiene**

   * Ensure session tokens (JWT/session cookie) include `companyId` and that logout invalidates tokens.
   * Test login/logout/switch users in same browser and confirm no cross-tenant cache leakage.

9. **Seeders & mocks**

   * Locate any seed or mock data scripts that auto-create sample data on startup; disable or guard them so they do NOT run per-new-signup. Document file locations and recommend how to safely re-enable for local demo (if needed) without seeding real tenants.

10. **Subscription / billing checks (summary)**

    * Confirm trial → paid conversion updates subscription state and unlocks features immediately.
    * Confirm trial expiry → 5-day grace → retries → lock behavior (as described previously). (If you find billing flaws, note them in remediation with exact steps to fix; do not change billing logic unless trivial and local.)
    * Confirm user feature limits are enforced for trial and removed for paid users.

11. **QuickBooks reference**

    * Use QuickBooks behavior as a model: companies are separate "files" — users are not shared across companies unless invited. Validate our system mirrors that isolation model.

---

## ACCEPTANCE CRITERIA (must pass)

Each criterion must be tested and reported PASS / FAIL with evidence:

1. New signup creates new `company` and unique `companyId` linked to the new user. (DB row evidence)
2. Company Details fields populated from signup fields after verification. (screenshot + DB row)
3. Clients/Quotations/Invoices/Projects/Inventory/HR/Accounting/Settings show empty state for new tenant. (screenshots + API responses)
4. All API queries filter by `companyId`. (code file list + sample queries)
5. Notifications and Activity Log scoped by `companyId`. (screenshot + DB query evidence)
6. No seeded/mock data visible to new tenants. (list of seeders and status)
7. Settings are per-company; changing settings in tenant A does not affect tenant B. (screenshot diff + DB diff)
8. Logout clears session and tokens; switching users shows no prior tenant data. (session logs)
9. Wipe of admin/test accounts completed and documented with backups. (evidence.zip contains redacted backup)
10. “Back to Dashboard” button responsiveness improved or documented if delay root cause is heavy render/load. (timing check / remediation notes)

---

## TEST SUITE (run and capture evidence)

For each test below, capture: API request/response logs (JSON), DB query results (CSV redacted), screenshots (PNG), and structured console logs (JSON). Put all into `evidence.zip`.

1. **Signup & mapping**

   * Create `tenant_A` with unique email; verify company record created and Company Details shows signup values.
2. **Empty pages**

   * Log in `tenant_A` → check Clients/Invoices/Projects/Inventory/HR/Accounting/Settings are empty.
3. **Cross-tenant access**

   * Create `tenant_B` and create a sample client. While logged in as `tenant_A`, attempt to fetch `tenant_B` client by ID — expect 403/404 or empty.
4. **Notifications isolation**

   * Create notification for `tenant_B`; verify `tenant_A` bell is empty.
5. **Settings isolation**

   * Change timezone/currency in `tenant_A`; verify `tenant_B` not affected.
6. **Session hygiene**

   * Login tenant\_A → logout → login tenant\_B in same browser; confirm no tenant\_A data visible.
7. **Seed check**

   * Start app fresh; confirm no auto seeding into new tenant on signup.
8. **Concurrency**

   * Simultaneous signups (2 processes); verify two unique companyIds and no shared data.
9. **Back to Dashboard delay**

   * Measure click-to-dashboard render time before and after any fix. Document root cause and remediation.

---

## DELIVERABLES (return these files)

Place outputs in a top-level folder and return as a package:

1. `audit_report.md` — full narrative of findings, categorized (Critical/High/Medium/Low) with reproduction steps.
2. `acceptance_checklist.md` — criteria table with PASS/FAIL and evidence references.
3. `evidence.zip` — screenshots, API logs (JSON), DB snapshots (CSV redacted), console logs (JSON).
4. `files_inspected.txt` — absolute paths and short notes of each file inspected (auth, middleware, API routes, seeders, DB models).
5. `remediation_plan.md` — for each failed item include exact file(s) to change, plain-English change instructions, risk, and priority.
6. `final_verification_steps.md` — step-by-step smoke tests to re-run after fixes.

---

## LOGGING FORMAT (all logs must follow this)

Use structured JSON (mask emails):
`{"event":"<name>","user":"m*****@domain.com","companyId":"c_XXXXX","endpoint":"/api/clients","query":"{companyId:...}","resultCount":0,"timestamp":"ISO8601","notes":"..."}`

---

## RULES & SAFETY

* **Do NOT** modify production or live keys. Work local-only.
* **Back up** the DB before any deletions and include a redacted backup in evidence.
* Avoid sweeping code deletions — prefer guarded fixes and clear remediation notes.
* Keep theme/UI unchanged unless fix requires minimal UX change; document any UI changes.

---

## Escalation

If you discover **any critical cross-tenant exposure** (private data from another tenant visible), stop other tests immediately and report: reproduction steps, exact DB record IDs, exact API endpoints returning the leaked records, and suggested immediate mitigation (e.g., take the instance offline / disable the endpoint).

---

Paste this entire prompt into your AI dev environment or hand it to the developer/tester. Run the audit, make safe local cleanups (DB wipe + seed disabling), fix tenant filtering issues where trivial, and produce the six deliverables with full evidence and remediation steps.


