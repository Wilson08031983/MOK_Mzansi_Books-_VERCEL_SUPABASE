# Environment Hardening Guide

This guide outlines how to safely configure environment variables across development and Vercel deployments while preventing secret leakage to the client.

## Golden Rules

- Do not define secrets with `NEXT_PUBLIC_` or `VITE_` prefixes. These values are embedded into the client bundle and exposed to browsers.
- Keep all secrets server-only (no public prefix). Access them in server code or API routes only.
- Treat the following as secrets: service-role keys, JWT secrets, SMTP passwords, API secret keys (e.g., Paystack), database passwords/URLs, S3 access keys.

## Client-safe vs Server-only

- Client-safe variables:
  - `NEXT_PUBLIC_APP_URL`, `VITE_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `VITE_PUBLIC_SUPABASE_URL`, `VITE_PUBLIC_SUPABASE_ANON_KEY`
  - `VITE_PAYSTACK_PUBLIC_KEY`, `VITE_PAYSTACK_PUBLIC_KEY_TEST`
  - `VITE_POSTMARK_SENDER_EMAIL`, `VITE_POSTMARK_SENDER_NAME`

- Server-only variables:
  - `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`
  - `SUPABASE_JWT_SECRET`, `DATABASE_URL`
  - `PAYSTACK_SECRET_KEY`, `PAYSTACK_SECRET_KEY_TEST`
  - `POSTMARK_SERVER_TOKEN`, `POSTMARK_WEBHOOK_SECRET`, `POSTMARK_SMTP_*`
  - `SUPABASE_STORAGE_S3_ACCESS_KEY_ID`, `SUPABASE_STORAGE_S3_SECRET_ACCESS_KEY`

## Required Actions Implemented

- Removed usage of client-exposed secrets from tests and scripts.
- Eliminated `VITE_*` secrets from `.env.vercel` (Paystack secret keys, Postmark server token, Supabase service-role/JWT/storage secrets, database connection passwords).
- Enforced server-only verification for Paystack in the client hook.
- Updated `vercel-env-vars.md` and deployment checklist to reflect safe practices.

## How to Validate

- Build the app and inspect the bundled `process.env` (Next.js) or `import.meta.env` (Vite) exposure; ensure no secrets appear.
- Confirm API routes can read server-only variables and that client code does not reference them.
- Run payment and email flows; verify they succeed using server-side keys.

## Rotation and Monitoring

- Rotate keys after removing client exposure to mitigate any prior leakage.
- Enable dashboards and alerts in Postmark, Paystack, and Supabase for unusual activity.

## Common Pitfalls

- Using test secrets in production via `VITE_` variables.
- Copying `.env.local` keys with `VITE_` prefixes into Vercel without reviewing sensitivity.
- Client code calling provider APIs directly with secret keys. Always route through backend.