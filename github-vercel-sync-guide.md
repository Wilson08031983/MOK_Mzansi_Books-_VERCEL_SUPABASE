# GitHub-Vercel Synchronization Guide

## Overview

This guide ensures complete synchronization between the GitHub repository and Vercel project for MOK Mzansi Books, including environment variables, deployment settings, and branch protection rules.

## Current Configuration Status

### Repository Information
- **GitHub Repository**: MOK_Mzansi_Books-_VERCEL_SUPABASE
- **Primary Branch**: main (or master)
- **Vercel Project**: Connected to GitHub repository
- **Primary Domain**: www.mokmzansibooks.com

## Synchronization Checklist

### 1. Repository Settings

#### Branch Configuration
- [ ] **Default Branch**: Verify main/master branch is set as default
- [ ] **Branch Protection**: Configure protection rules for production branch
- [ ] **Auto-merge**: Configure automatic merging rules if needed

#### Branch Protection Rules
```yaml
Required Status Checks:
  - Require branches to be up to date before merging
  - Require status checks to pass before merging
  - Include administrators in restrictions

Restrictions:
  - Restrict pushes that create files larger than 100MB
  - Require pull request reviews before merging
  - Dismiss stale reviews when new commits are pushed
```

### 2. Vercel Project Configuration

#### Deployment Settings
- [ ] **Framework Preset**: Next.js (if applicable) or appropriate framework
- [ ] **Build Command**: Verify correct build command
- [ ] **Output Directory**: Confirm output directory setting
- [ ] **Install Command**: Verify package manager (npm/yarn/pnpm)

#### Git Integration
- [ ] **Repository Connected**: Verify GitHub repository is properly connected
- [ ] **Auto-Deploy**: Enable automatic deployments from main branch
- [ ] **Preview Deployments**: Configure preview deployments for pull requests

### 3. Environment Variables Synchronization

#### Production Environment Variables
All variables from `.env.local` must be configured in Vercel Production environment:

```bash
# Core Application
NEXT_PUBLIC_APP_URL=https://www.mokmzansibooks.com
NEXT_PUBLIC_SUPABASE_URL=https://ulduqjddmhnwvdeeldsb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]

# Database
DATABASE_URL=[encoded_database_url]
VITE_POSTGRES_TRANSACTION_POOLER=[pooler_url]

# Paystack
PAYSTACK_SECRET_KEY=[live_secret_key]
PAYSTACK_SECRET_KEY_TEST=[test_secret_key]
VITE_PAYSTACK_PUBLIC_KEY=[live_public_key]
VITE_PAYSTACK_PUBLIC_KEY_TEST=[test_public_key]

# Email Service
POSTMARK_SERVER_TOKEN=[server_token]
POSTMARK_SENDER_EMAIL=noreply@mokmzansibooks.com
POSTMARK_SENDER_NAME=MOK Mzansi Books

# Webhooks and Callbacks
PAYSTACK_WEBHOOK_URL=https://www.mokmzansibooks.com/api/paystack-webhook
PAYSTACK_CALLBACK_URL=https://www.mokmzansibooks.com/thank-you
```

#### Email Configuration Alignment (Postmark)
- Use a single sender address across all environments: `POSTMARK_SENDER_EMAIL=noreply@mokmzansibooks.com`
- Ensure the sender address is verified in Postmark and DKIM is configured on `mokmzansibooks.com`
- Set `POSTMARK_MESSAGE_STREAM=outbound` for production sending
- Mirror server-side and client-side names if used:
  - `POSTMARK_SENDER_EMAIL` and `VITE_POSTMARK_SENDER_EMAIL`
  - `POSTMARK_SENDER_NAME` and `VITE_POSTMARK_SENDER_NAME`
- Avoid mixing `admin@` and `noreply@`; pick one (recommended: `noreply@`)

#### GitHub → Vercel Secrets Mapping
Add these secrets in GitHub (if using Actions) and mirror them in Vercel Environment Variables:
```bash
# Postmark
POSTMARK_SERVER_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
POSTMARK_SENDER_EMAIL=noreply@mokmzansibooks.com
POSTMARK_SENDER_NAME=MOK Mzansi Books
POSTMARK_MESSAGE_STREAM=outbound

# App URLs
NEXT_PUBLIC_APP_URL=https://www.mokmzansibooks.com
APP_HOST=https://www.mokmzansibooks.com
```

Verification steps after updates:
- Trigger a redeploy on Vercel to apply new env vars
- Run `node test-email.js` locally to confirm sending works
- Send a test via the API: `POST /api/emails/send` with `type=welcome`


#### Environment-Specific Configuration
- **Production**: Use live API keys and production URLs
- **Preview**: Use test API keys and staging URLs
- **Development**: Use development/test configurations

### 4. Deployment Configuration Files

#### Vercel Configuration (`vercel.json`)
Ensure the following configuration is present:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://www.mokmzansibooks.com"
  }
}
```

#### Package.json Scripts
Verify build and deployment scripts:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev",
    "lint": "next lint"
  }
}
```

### 5. Domain Configuration

#### Custom Domain Setup
- [ ] **Primary Domain**: www.mokmzansibooks.com configured
- [ ] **SSL Certificate**: Automatic SSL enabled
- [ ] **DNS Records**: Properly configured A/CNAME records
- [ ] **Redirect Rules**: Configure www and non-www redirects

#### DNS Configuration
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61 (Vercel IP)
```

### 6. Security Configuration

#### GitHub Security Settings
- [ ] **Dependency Scanning**: Enable Dependabot alerts
- [ ] **Code Scanning**: Enable CodeQL analysis
- [ ] **Secret Scanning**: Enable secret detection
- [ ] **Branch Protection**: Require signed commits (optional)

#### Vercel Security Settings
- [ ] **Environment Variables**: Ensure sensitive data is encrypted
- [ ] **Access Control**: Configure team access permissions
- [ ] **Audit Logs**: Enable audit logging for changes

### 7. Monitoring and Alerts

#### GitHub Notifications
- [ ] **Push Notifications**: Configure for important events
- [ ] **Pull Request Notifications**: Set up review notifications
- [ ] **Security Alerts**: Enable security vulnerability notifications

#### Vercel Monitoring
- [ ] **Deployment Notifications**: Configure success/failure alerts
- [ ] **Performance Monitoring**: Enable Web Vitals tracking
- [ ] **Error Tracking**: Set up error monitoring integration

### 8. Backup and Recovery

#### Repository Backup
- [ ] **Regular Commits**: Ensure regular code commits
- [ ] **Tag Releases**: Create tags for stable releases
- [ ] **Backup Strategy**: Document backup procedures

#### Deployment Rollback
- [ ] **Previous Deployments**: Verify rollback capability
- [ ] **Environment Backup**: Backup environment variables
- [ ] **Database Backup**: Ensure database backup strategy

## Synchronization Verification Steps

### 1. Code Synchronization
```bash
# Verify latest code is deployed
git log --oneline -5
# Check Vercel deployment matches latest commit
```

### 2. Environment Variables Check
- Compare `.env.local` with Vercel environment variables
- Verify all required variables are present
- Confirm values are correct for production

### 3. Deployment Testing
- [ ] **Build Success**: Verify builds complete without errors
- [ ] **Deployment Success**: Confirm deployments succeed
- [ ] **Functionality Test**: Test key application features

### 4. Domain and SSL Verification
```bash
# Test domain accessibility
curl -I https://www.mokmzansibooks.com

# Verify SSL certificate
openssl s_client -connect www.mokmzansibooks.com:443 -servername www.mokmzansibooks.com
```

## Troubleshooting Common Issues

### Build Failures
1. **Check Build Logs**: Review Vercel build logs for errors
2. **Environment Variables**: Verify all required variables are set
3. **Dependencies**: Ensure all dependencies are properly installed
4. **Build Command**: Confirm build command is correct

### Deployment Issues
1. **Git Integration**: Verify repository connection
2. **Branch Configuration**: Check default branch settings
3. **File Permissions**: Ensure proper file permissions
4. **Resource Limits**: Check if hitting Vercel limits

### Environment Variable Issues
1. **Variable Names**: Verify exact variable names match
2. **Special Characters**: Ensure proper encoding of special characters
3. **Environment Scope**: Confirm variables are set for correct environment
4. **Sensitive Data**: Verify sensitive data is properly encrypted

## Maintenance Schedule

### Weekly Tasks
- [ ] Review deployment logs for errors
- [ ] Check for security updates
- [ ] Verify backup integrity

### Monthly Tasks
- [ ] Update dependencies
- [ ] Review and rotate API keys
- [ ] Performance optimization review

### Quarterly Tasks
- [ ] Security audit
- [ ] Disaster recovery testing
- [ ] Documentation updates

## Success Criteria

### Synchronization Complete When:
- [x] GitHub repository connected to Vercel
- [ ] All environment variables properly configured
- [ ] Automatic deployments working
- [ ] Domain and SSL properly configured
- [ ] Security settings enabled
- [ ] Monitoring and alerts configured

## Contact and Support

### GitHub Support
- **Issues**: Repository issues and pull requests
- **Security**: GitHub security advisories
- **Documentation**: GitHub documentation and guides

### Vercel Support
- **Deployment Issues**: Vercel support portal
- **Domain Issues**: Vercel domain configuration help
- **Performance**: Vercel analytics and monitoring

### Emergency Contacts
- **Repository Admin**: [Admin contact information]
- **Domain Registrar**: [Domain provider support]
- **DNS Provider**: [DNS provider support]