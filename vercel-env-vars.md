# Vercel Environment Variables Configuration

This document provides the complete list of environment variables that need to be configured in Vercel to match the local `.env.local` file.

## Required Environment Variables for Vercel

### 1. Supabase Core Configuration
```
VITE_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_PROJECT_ID=your_project_id_here
VITE_SUPABASE_ACCESS_TOKENS=your_supabase_access_token_here
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
DATABASE_URL=postgresql://postgres.your-project-id:your_password@aws-0-region.pooler.supabase.com:6543/postgres
VITE_POSTGRES_TRANSACTION_POOLER=postgresql://postgres.your-project-id:your_password@aws-0-region.pooler.supabase.com:6543/postgres
VITE_POSTGRES_SESSON_POOLER=postgresql://postgres.your-project-id:your_password@aws-0-region.pooler.supabase.com:5432/postgres
VITE_POSTGRES_DIRECT_CONNECTION=postgresql://postgres:your_password@db.your-project-id.supabase.co:5432/postgres
VITE_POSTGRES_DATABASE=postgres
VITE_POSTGRES_USER=postgres
VITE_POSTGRES_PASSWORD=your_database_password_here
VITE_POSTGRES_HOST=db.your-project-id.supabase.co
```

### 4. Supabase Extended Configuration
```
VITE_SUPABASE_USERNAME=your_supabase_username
VITE_ORGANIZATION_SLUG=your_organization_slug_here
VITE_SUPABASE_JWT_SECRET=your_jwt_secret_here
VITE_SUPABASE_STORAGE_S3_SECRET_ACCESS_KEY=your_s3_secret_access_key_here
VITE_SUPABASE_STORAGE_S3_ACCESS_KEY_ID=your_s3_access_key_id_here
VITE_SUPABASE_STORAGE_S3_ENDPOINT=https://your-project-id.storage.supabase.co/storage/v1/s3
VITE_SUPABASE_STORAGE_S3_REGION=your-region
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_ORGANIZATION_NAME=MOKMzansiBooks
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
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