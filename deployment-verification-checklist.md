# Deployment Verification Checklist

## Domain Configuration ✅

### Primary Domain Setup
- [x] **www.mokmzansibooks.com** configured as primary domain
- [x] SSL certificate active and valid
- [x] DNS records properly configured
- [x] Domain redirects working correctly

### URL Updates Completed
- [x] Updated `emailConfig.ts` to use primary domain
- [x] Updated `postmark-base-template.html` logo reference
- [x] Updated test scripts to use primary domain
- [x] Updated `.env.local` callback URLs

## Environment Variables Configuration

### Vercel Environment Variables Required
Based on `.env.local`, the following variables must be set in Vercel:

#### Core Application
- [ ] `NEXT_PUBLIC_APP_URL=https://www.mokmzansibooks.com`
- [ ] `NEXT_PUBLIC_SUPABASE_URL=https://ulduqjddmhnwvdeeldsb.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY=[key from .env.local]`

#### Database Configuration
- [ ] `DATABASE_URL=[encoded URL from .env.local]`
- [ ] `SUPABASE_SERVICE_ROLE_KEY=[service role key]` (server-only)

#### Paystack Configuration
- [ ] `PAYSTACK_SECRET_KEY=[live secret key]`
- [ ] `PAYSTACK_SECRET_KEY_TEST=[test secret key]`
- [ ] `VITE_PAYSTACK_PUBLIC_KEY=[live public key]`
- [ ] `VITE_PAYSTACK_PUBLIC_KEY_TEST=[test public key]`
- [ ] `PAYSTACK_WEBHOOK_URL=https://www.mokmzansibooks.com/api/paystack-webhook`
- [ ] `PAYSTACK_CALLBACK_URL=https://www.mokmzansibooks.com/thank-you`

#### Postmark Email Configuration
- [ ] `POSTMARK_SERVER_TOKEN=[server token]`
- [ ] `POSTMARK_SENDER_EMAIL=noreply@mokmzansibooks.com`
- [ ] `POSTMARK_SENDER_NAME=MOK Mzansi Books`
- [ ] `POSTMARK_WEBHOOK_SECRET=[secure random string]` (server-only)

## Email Functionality Verification ✅

### Email Assets Accessibility
- [x] Logo accessible at: `https://www.mokmzansibooks.com/email-assets/logo.png`
- [x] Returns HTTP 200 status
- [x] Proper content-type headers
- [x] No authentication required

### Email Templates
- [x] Templates updated to use primary domain
- [x] Asset references point to correct URLs
- [x] No hardcoded Vercel deployment URLs remaining

## API Endpoints Testing

### Critical API Routes to Test
- [ ] `/api/billing/me` - Billing information
- [ ] `/api/paystack-webhook` - Payment webhooks
- [ ] `/api/emails/welcome` - Welcome email sending
- [ ] `/api/emails/invoice` - Invoice email sending

### Expected Responses
- Authentication-protected endpoints should return 401 for unauthenticated requests
- Webhook endpoints should accept POST requests
- Email endpoints should process requests correctly

## Payment Integration Testing

### Paystack Configuration
- [ ] Live keys configured for production
- [ ] Test keys available for testing
- [ ] Webhook URL points to primary domain
- [ ] Callback URL points to primary domain
- [ ] Success redirect configured correctly

### Payment Flow Testing
- [ ] Payment initialization works
- [ ] Webhook receives payment notifications
- [ ] Success page redirects properly
- [ ] Email notifications sent on payment

## Database Connectivity

### Connection Testing
- [ ] Application connects to Supabase successfully
- [ ] Database queries execute without errors
- [ ] Authentication works properly
- [ ] Data persistence verified

## Security Verification

### SSL/TLS Configuration
- [x] SSL certificate valid and trusted
- [x] HTTPS enforced for all requests
- [x] Security headers properly configured

### Environment Security
- [ ] No sensitive data exposed in client-side code
- [ ] API keys properly secured
- [ ] Database credentials protected
- [ ] No `VITE_` or `NEXT_PUBLIC_` variables contain secrets

## Performance Testing

### Load Time Verification
- [ ] Homepage loads within acceptable time
- [ ] API responses are performant
- [ ] Email assets load quickly
- [ ] Database queries optimized

## Email Client Testing

### Email Rendering
- [ ] Welcome emails render correctly
- [ ] Invoice emails display properly
- [ ] Images load in email clients
- [ ] Links work correctly

### Email Clients to Test
- [ ] Gmail (web)
- [ ] Outlook (web)
- [ ] Apple Mail
- [ ] Mobile email clients

## Monitoring Setup

### Error Tracking
- [ ] Application errors logged properly
- [ ] Email delivery failures tracked
- [ ] Payment processing errors monitored

### Performance Monitoring
- [ ] Response times tracked
- [ ] Database performance monitored
- [ ] Email delivery rates tracked

## Rollback Plan

### If Issues Arise
1. **Immediate Actions**:
   - Revert DNS to previous configuration
   - Restore previous environment variables
   - Deploy previous working version

2. **Investigation Steps**:
   - Check Vercel deployment logs
   - Verify environment variable configuration
   - Test individual components

3. **Recovery Process**:
   - Fix identified issues
   - Test in staging environment
   - Redeploy with corrections

## Final Verification Steps

### Pre-Launch Checklist
- [ ] All environment variables configured
- [ ] Domain properly configured
- [ ] SSL certificate active
- [ ] Email functionality working
- [ ] Payment processing functional
- [ ] Database connectivity verified

### Post-Launch Monitoring
- [ ] Monitor error rates
- [ ] Check email delivery
- [ ] Verify payment processing
- [ ] Monitor performance metrics

## Success Criteria

### Deployment Successful When:
- [x] Primary domain accessible with SSL
- [ ] All environment variables properly configured
- [ ] Email functionality working end-to-end
- [ ] Payment processing functional
- [ ] No critical errors in logs
- [ ] Performance within acceptable limits

## Contact Information

### Support Contacts
- **Domain Issues**: DNS provider support
- **SSL Issues**: Vercel support
- **Email Issues**: Postmark support
- **Payment Issues**: Paystack support
- **Database Issues**: Supabase support