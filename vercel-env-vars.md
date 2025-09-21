# Vercel Environment Variables Configuration

This document provides the complete list of environment variables that need to be configured in Vercel to match the local `.env.local` file.

## Required Environment Variables for Vercel

### 1. Supabase Core Configuration
```
VITE_PUBLIC_SUPABASE_URL=https://ulduqjddmhnwvdeeldsb.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://ulduqjddmhnwvdeeldsb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZHVxamRkbWhud3ZkZWVsZHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTg1NzEsImV4cCI6MjA3MjU3NDU3MX0.CRjFvK8kNrLD7m1n2qJsXwK0TnYuzYxxHl_YxIK1M6c
VITE_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZHVxamRkbWhud3ZkZWVsZHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTg1NzEsImV4cCI6MjA3MjU3NDU3MX0.CRjFvK8kNrLD7m1n2qJsXwK0TnYuzYxxHl_YxIK1M6c
VITE_PROJECT_ID=prj_5KwO5Oc5osKcgQnarIpZB7sBeDEz
VITE_SUPABASE_ACCESS_TOKENS=sbp_521aac1c7d990a0f61c42dafb54698ff2bd3aac1
```

### 2. Paystack Configuration
```
VITE_PAYSTACK_LIVE_PUBLIC_KEY=pk_live_your_live_public_key_here
VITE_PAYSTACK_LIVE_SECRET_KEY=sk_live_your_live_secret_key_here
VITE_PAYSTACK_TEST_PUBLIC_KEY=pk_test_your_test_public_key_here
VITE_PAYSTACK_TEST_SECRET_KEY=sk_test_your_test_secret_key_here
VITE_PAYSTACK_PUBLIC_KEY_TEST=pk_test_your_test_public_key_here
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key_here
PAYSTACK_SECRET_KEY_TEST=sk_test_your_test_secret_key_here
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key_here
```

### 3. Database Configuration
```
DATABASE_URL=postgresql://postgres.ulduqjddmhnwvdeeldsb:Ka%21gi%23so123J@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
VITE_POSTGRES_TRANSACTION_POOLER=postgresql://postgres.ulduqjddmhnwvdeeldsb:[Ka!gi#so123J]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
VITE_POSTGRES_SESSON_POOLER=postgresql://postgres.zjvfyarwezepxzepyxte:[Ka!gi#so123J]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
VITE_POSTGRES_DIRECT_CONNECTION=postgresql://postgres:[Ka!gi#so]@db.ulduqjddmhnwvdeeldsb.supabase.co:5432/postgres
VITE_POSTGRES_DATABASE=postgres
VITE_POSTGRES_USER=postgres
VITE_POSTGRES_PASSWORD=Ka!gi#so123J
VITE_POSTGRES_HOST=db.ulduqjddmhnwvdeeldsb.supabase.co
```

### 4. Supabase Extended Configuration
```
VITE_SUPABASE_USERNAME=Wilson08031983
VITE_ORGANIZATION_SLUG=EGM4FSC9DdTXa3NQsUFGSxYP
VITE_SUPABASE_JWT_SECRET=gn+RXwSsVHKjcukg3NsCcC7xh10vd+61lFlFntOhyOe5RcJUdHkM/pAsLQlBcZJLNogx3KGqERt/tmrlnTZg1g==
VITE_SUPABASE_STORAGE_S3_SECRET_ACCESS_KEY=489cd173cc448b9532723a5c5b2dc8396fa24778089e1be85aca06ef44019808
VITE_SUPABASE_STORAGE_S3_ACCESS_KEY_ID=9359cd45d37c918e0e4838d5af4f0e4e
VITE_SUPABASE_STORAGE_S3_ENDPOINT=https://ulduqjddmhnwvdeeldsb.storage.supabase.co/storage/v1/s3
VITE_SUPABASE_STORAGE_S3_REGION=sa-east-1
VITE_SUPABASE_PROJECT_ID=ulduqjddmhnwvdeeldsb
VITE_ORGANIZATION_NAME=MOKMzansiBooks
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkY2h2eXljY2l6dXNpZ3Z6cnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTUzNjI0NiwiZXhwIjoyMDY1MTEyMjQ2fQ.9zZWtUjh1G9m3VgIrr3tAwLA6jrUmwOIivzOMNbDK0U
```

### 5. Application URLs
```
NEXT_PUBLIC_APP_URL=https://www.mokmzansibooks.com
PAYSTACK_SUCCESS_REDIRECT=https://www.mokmzansibooks.com/thank-you
PAYSTACK_WEBHOOK_ENDPOINT=https://www.mokmzansibooks.com/api/paystack-webhook
PAYSTACK_CALLBACK_URL=https://www.mokmzansibooks.com/thank-you
PAYSTACK_WEBHOOK_URL=https://www.mokmzansibooks.com/api/paystack-webhook
WEBHOOK_URL=https://www.mokmzansibooks.com/api/paystack-webhook
```

### 6. Postmark Email Configuration
```
POSTMARK_SERVER_TOKEN=1d8c2f0c-3a66-4693-8374-9c1052879d9d
POSTMARK_ACCOUNT_TOKEN=1e46da79-7267-48a2-a17f-35d5053c099c
POSTMARK_SENDER_EMAIL=noreply@mokmzansibooks.com
POSTMARK_SENDER_NAME=MOK Mzansi Books
POSTMARK_MESSAGE_STREAM=outbound
POSTMARK_WEBHOOK_SECRET=your-postmark-webhook-secret-here
POSTMARK_SANDBOX_MODE=false
POSTMARK_SMTP_HOST=smtp.postmarkapp.com
POSTMARK_SMTP_PORT=587
POSTMARK_SMTP_USERNAME=1d8c2f0c-3a66-4693-8374-9c1052879d9d
POSTMARK_SMTP_PASSWORD=1d8c2f0c-3a66-4693-8374-9c1052879d9d
VITE_POSTMARK_SENDER_EMAIL=noreply@mokmzansibooks.com
VITE_POSTMARK_SENDER_NAME=MOK Mzansi Books
```

## Instructions for Setting Up in Vercel

1. **Access Vercel Dashboard**: Go to your project in Vercel dashboard
2. **Navigate to Settings**: Click on "Settings" tab
3. **Environment Variables**: Click on "Environment Variables" in the sidebar
4. **Add Variables**: For each variable above:
   - Click "Add New"
   - Enter the variable name (e.g., `NEXT_PUBLIC_APP_URL`)
   - Enter the value (e.g., `https://www.mokmzansibooks.com`)
   - Select appropriate environments (Production, Preview, Development)
   - Click "Save"

## Critical Notes

- **NEXT_PUBLIC_APP_URL**: Must be set to `https://www.mokmzansibooks.com` for proper email functionality
- **Database URLs**: Contain special characters that may need URL encoding
- **Paystack Keys**: Ensure live keys are used for production environment
- **Postmark Configuration**: Required for email functionality
- **Domain Configuration**: All callback URLs and webhook endpoints use the primary domain

## Post-Configuration Steps

1. **Redeploy**: After adding all environment variables, trigger a new deployment
2. **Verify Domain**: Ensure www.mokmzansibooks.com is properly configured as the primary domain
3. **Test Functionality**: Verify email sending, payment processing, and database connections
4. **SSL Certificate**: Confirm SSL certificate is active for the custom domain

## Security Considerations

- Never commit sensitive keys to version control
- Use different keys for development, preview, and production environments
- Regularly rotate API keys and tokens
- Monitor usage of API keys through respective service dashboards