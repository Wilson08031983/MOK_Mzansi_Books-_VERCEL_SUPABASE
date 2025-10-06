Permanently remove three specific unverified test users from your local development database, remove any related data (companies, tokens, jobs, notifications, email logs), and remove or unblock their addresses in Postmark where possible. It also instructs how to handle any API keys that may be tied to these records and how to produce evidence and an audit trail. Read it all before executing.

---

# PROMPT — Full Cleanup: permanently remove test users + Postmark cleanup + API-key housekeeping

**Goal (one sentence):** Permanently remove the following user accounts and all associated tenant data from the local development system, remove/unblock those email addresses from Postmark (suppression lists) if present, revoke any API keys that are tied to those users/sampled tenants, and produce a complete audit with logs and deliverables so the addresses can be safely re-used for sign-up/testing.

**Accounts to remove (exact):**

* `mokgethamoabelo@yahoo.com`
* `cindyramatladi@gmail.com`
* `wilsonmoabelo1@yahoo.com`

**Environment & rules**

* Work **local-only** (local DB / dev Postmark/test server). Do **not** touch production.
* Before deleting anything, create a full DB backup (dump) and export Postmark activity/suppression lists that include the addresses (store backups securely).
* Do not remove or affect the dedicated developer test admin account used for development unless explicitly requested.
* All destructive actions must be logged with structured JSON entries and saved in `cleanup_audit/` (or similar) in the local dev environment. Do **not** commit secrets to Git.
* If any API keys are found to be tied to the removed users or their resources, **revoke and rotate** them. Document the rotation and update local secrets as needed.
* If Postmark objects cannot be removed (activity cannot be deleted), remove addresses from suppression lists and document what was removed and why.

---

## Step 1 — Pre-cleanup safety & evidence (MUST do)

1. Take a full local DB export (dump) and save to `backups/db-before-cleanup-YYYYMMDD.sql` or similar.
2. Export Postmark activity for the three email addresses and the server: save JSON/CSV to `backups/postmark-activity-before-cleanup-YYYYMMDD.json`.
3. Take screenshots of the accounts/pages where these users currently appear (company/team lists, hr-management employees, notification logs). Save to `backups/screenshots-before/`.
4. Create a local `cleanup_audit/README.md` that will hold all logs and deliverables.

Log actions (structured JSON) into `cleanup_audit/logs.json`:

```
{"event":"pre_cleanup_backup","db_dump":"backups/db-before-cleanup-YYYYMMDD.sql","postmark_export":"backups/postmark-activity-before-cleanup-YYYYMMDD.json","timestamp":"..."}
```

---

## Step 2 — Identify all records to delete (discover)

For each email address:

1. Query the database for any records linked to the user or the company created by that user:

   * `users` table (or collection)
   * `companies` table (company record created on signup)
   * `verification_tokens` / `email_tokens`
   * `invoices`, `quotations`, `clients`, `projects`, `inventory`, `employees`, `notifications`, `email_logs` (filter by `companyId` or `userId`)
   * `subscriptions`, `billing records`, `payment_history`
   * any background job records where `userId` or `companyId` is referenced (email jobs, queued tasks)
2. Produce a list of found records with their DB ids and counts saved to `cleanup_audit/records-to-delete-<masked-email>.json` (mask email in filename if desired).

Log each discovery:

```
{"event":"discovery","emailMasked":"m***@yahoo.com","userId":"u_xxx","companyId":"c_xxx","tablesFound":{"users":1,"companies":1,"tokens":1,"invoices":0,...},"timestamp":"..."}
```

---

## Step 3 — Delete local DB records (safe, auditable deletion)

For each email address and its discovered records:

1. Delete in the following safe order (transaction if possible):

   * Delete `verification_tokens` for that user.
   * Delete `email_logs` and queued email jobs for that user/company.
   * Delete `notifications` referencing that user/company.
   * Delete child records that depend on company (invoices, clients, projects, employees, inventory, etc.).
   * Delete the `company` record (if it was created by that user and is not shared).
   * Delete the `user` record itself last.
2. After deletion, immediately query those tables to confirm zero rows remain for that `userId` / `companyId`. Save results to `cleanup_audit/post_delete_checks-<masked-email>.json`.
3. If any records cannot be deleted because of foreign key constraints or other errors, stop and record the error in `cleanup_audit/errors.json` and escalate rather than force an inconsistent state.

Add a deletion log entry per user:

```
{"event":"deleted_user_data","emailMasked":"m***@yahoo.com","userId":"u_xxx","companyId":"c_xxx","deletedTables":["tokens","email_logs","notifications","invoices","companies","users"],"timestamp":"..."}
```

**Important:** If any of these users are linked to shared company resources that must remain (e.g., they were added incorrectly to an admin company that should stay), **do not delete the shared company** — instead remove the user record and detach references. Log your decision.

---

## Step 4 — Postmark cleanup (remove or unblock addresses where possible)

1. Using Postmark test server/dashboard/API, search for the three email addresses:

   * Export any activity rows (already done in pre-cleanup).
   * Check if the addresses are on Postmark suppression lists (bounces, complaints, unsubscribes).
2. If addresses are present on suppression lists and you want them reusable:

   * Remove them from the suppression lists (Postmark provides suppression management). Document the action.
   * If they are bounces or permanent failures due to invalid addresses, DO NOT attempt to force-send — note the finding and advise using a different address OR correct the cause.
3. If the Postmark server has message copies tied to these addresses, note that Activity cannot be fully erased via Postmark (activity is an audit trail). Document what Postmark allows you to change vs what is immutable.
4. Record Postmark responses and save to `cleanup_audit/postmark-changes.json`.

Log Postmark actions:

```
{"event":"postmark_cleanup","emailMasked":"m***@gmail.com","action":"removed_from_suppression|no_action_needed|bounce_recorded","postmark_detail":"...","timestamp":"..."}
```

---

## Step 5 — API keys & secrets housekeeping

1. Search your local envs and secrets manager for any API keys that are specifically tied to the deleted test tenants or user-owned resources (rare, but check `email` servers, webhook tokens, per-tenant API keys).
2. If you find any API keys created under those user accounts:

   * Revoke the key immediately and log the revoke event.
   * Rotate the key(s) if they are used in dev workflows. Update local dev `.env`/secret store accordingly.
   * If keys were accidentally committed, remove them from Git history (BFG/git filter-branch) **locally**, rotate keys in providers, and document the rotation.
3. For Postmark: if any server tokens or senders were created exclusively for those accounts, decide whether to keep them (if used elsewhere) or delete them. Document the change.
4. Save `cleanup_audit/api_key_rotation.json` listing keys revoked and new keys created (mask actual values).

Log API key actions:

```
{"event":"api_key_revoked","provider":"postmark|paystack|github", "keyId":"pm_***","reason":"account_cleanup","timestamp":"..."}
```

---

## Step 6 — Webhooks & background jobs

1. Remove or reassign any webhook endpoints, scheduled jobs, or background workers that were pinned to the deleted user/company.
2. If there were scheduled retry jobs (payment retries, email retries) for those users, cancel them and log job cancellations to `cleanup_audit/job_cancellations.json`.

Log job cancellations:

```
{"event":"job_cancelled","jobId":"j_xxx","reason":"cleanup_deleted_user","timestamp":"..."}
```

---

## Step 7 — Post-clean checks & validation (MUST do)

1. Confirm `users` table has no rows for the three emails (query & save result).
2. Confirm `companies` table has no rows for the deleted companyIds (or if shared, that the user references were removed).
3. Confirm `verification_tokens` removed.
4. Confirm `email_logs` & `notifications` removed for those users.
5. Confirm Postmark suppression list entries removed (if action taken).
6. Confirm any local stored API keys that were revoked are no longer present in `.env` or local secret store.

Record all checks to `cleanup_audit/post_cleanup_checks.json` with pass/fail flags.

Example log:

```
{"event":"post_cleanup_check","emailMasked":"m***@yahoo.com","usersRemaining":0,"companiesRemaining":0,"tokensRemaining":0,"emailLogsRemaining":0,"postmarkSuppressionPresent":false,"timestamp":"..."}
```

---

## Step 8 — Deliverables & evidence (what to return)

Put all artifacts under `cleanup_audit/` and provide the following deliverables:

1. `cleanup_audit/final_report.md` — explanation of root cause (why these addresses existed), steps performed, and summary of results.
2. `cleanup_audit/logs.json` — structured log of events (pre_backup, discovery, deletes, postmark changes, API key revocations, errors).
3. `cleanup_audit/backups/` — DB dump and Postmark activity export (pre-cleanup).
4. `cleanup_audit/screenshots-before/` and `cleanup_audit/screenshots-after/` — showing UI before & after (team lists, hr-management, notifications).
5. `cleanup_audit/records-to-delete-*.json` — record lists that were removed for each address.
6. `cleanup_audit/post_cleanup_checks.json` — pass/fail checks for each record type.
7. `cleanup_audit/api_key_rotation.json` — list of API keys revoked/rotated (masked).
8. `cleanup_audit/files_touched.txt` — any code/config files changed (note: prefer no code change; this should be data cleanup).

Final log entry example:

```
{"event":"cleanup_complete","emails":["m***@yahoo.com","c***@gmail.com","w***@yahoo.com"],"auditPath":"cleanup_audit/","timestamp":"..."}
```

---

## Safety & rollback

* If any delete step fails or produces unexpected results, immediately revert using DB backup and log the rollback attempt.
* Keep a copy of the DB backup offline for at least 7 days after cleanup, then archive or delete per your retention policy.
* If a deletion inadvertently removed shared data, restore from backup and escalate.

---

## Notes about Postmark limitations

* Postmark **Activity** (sent messages) is an audit log and typically cannot be permanently deleted by the user. You can export and archive it, and you can remove email addresses from **suppression** lists so they are again deliverable. Document what Postmark allows and what it does not.
* If an email is permanently bounced at Postmark due to a real bounce, re-using the email address may still fail until the underlying cause (mailbox) is resolved. If Postmark shows a "permanent bounce", recommend using a different testing address or resolving the mailbox with the recipient provider.

---

## Quick acceptance criteria (all must be true)

* The three email addresses have no user or company records remaining in the local DB.
* `verification_tokens`, `email_logs`, and queued email jobs for those addresses are removed.
* Postmark suppression entries for those addresses are removed (if applicable) or documented why not possible.
* Any API keys tied specifically to those accounts were revoked and rotated (documented).
* All steps and evidence are saved under `cleanup_audit/` and logs show the deletion events.
* A rollback plan and DB backup exist.

---
Execute exactly as stated, produce the deliverables, and share `cleanup_audit/final_report.md` plus the `cleanup_audit/logs.json` once done.
