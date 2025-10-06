# PostMark Email Templates Setup Guide

## Overview

This guide explains how to set up PostMark email templates with Vercel Blob storage integration for MOK Mzansi Books. The implementation includes automated email sending with professional templates that use your uploaded assets (logo, signature, social media icons).

## 🚀 Quick Start

### 1. PostMark Account Setup

1. **Create PostMark Account**
   - Visit [PostMark](https://postmarkapp.com) and create an account
   - Create a new server for your application
   - Note down your **Server API Token**

2. **Configure Sender Signature**
   - Add and verify your sending domain (`mokmzansibooks.com`)
   - Set up DKIM authentication for better deliverability
   - Configure your sender signature

### 2. Environment Variables

Add these variables to your `.env` file:

```env
# PostMark Configuration
POSTMARK_API_TOKEN="your-postmark-server-api-token"
POSTMARK_FROM_EMAIL="MOK Mzansi Books <no-reply@mokmzansibooks.com>"
POSTMARK_REPLY_TO="support@mokmzansibooks.com"

# Company Information
COMPANY_NAME="MOK Mzansi Books"
COMPANY_EMAIL="info@mokmzansibooks.com"
COMPANY_PHONE="+27 (0) 11 123 4567"
COMPANY_ADDRESS="123 Literary Lane, Johannesburg, South Africa"
COMPANY_WEBSITE="https://www.mokmzansibooks.com"

# Blob Storage Assets (automatically configured)
EMAIL_ASSETS_BASE_URL="https://mok-mzansi-books-vercel-sup-blob.vercel-storage.com"

# Test Email (for testing purposes)
TEST_EMAIL="your-test-email@example.com"
```

### 3. Blob Storage Assets

Your uploaded assets are automatically integrated:

- **Logo**: `logo.png` - Used in email headers
- **Signature**: `signature.png` - Used in email footers
- **Social Icons**: `twitter.png`, `facebook.png`, `tiktok.png` - Used in social media sections

## 📧 Available Email Templates

### 1. Welcome Email
```typescript
import { postmarkService } from '@/services/postmarkService';

const result = await postmarkService.sendWelcomeEmail(
  'user@example.com',
  'John Doe',
  'https://www.mokmzansibooks.com/login'
);
```

### 2. Invoice Email
```typescript
const result = await postmarkService.sendInvoiceEmail(
  'client@example.com',
  {
    invoiceNumber: 'INV-2024-001',
    clientName: 'Jane Smith',
    dueDate: '2024-02-15',
    total: 'R 1,250.00',
    items: [
      {
        description: 'African Literature Collection',
        quantity: 1,
        unitPrice: 'R 800.00',
        amount: 'R 800.00'
      }
    ]
  }
);
```

### 3. Quotation Email
```typescript
const result = await postmarkService.sendQuotationEmail(
  'prospect@example.com',
  {
    quotationNumber: 'QUO-2024-001',
    clientName: 'ABC Publishing',
    validUntil: '2024-02-28',
    total: 'R 5,500.00',
    items: [/* quotation items */]
  }
);
```

### 4. Password Reset Email
```typescript
const result = await postmarkService.sendPasswordResetEmail(
  'user@example.com',
  'https://www.mokmzansibooks.com/reset-password?token=abc123',
  'John Doe'
);
```

### 5. Team Invitation Email
```typescript
const result = await postmarkService.sendTeamInvitationEmail(
  'newteam@example.com',
  'Sarah Johnson',
  'MOK Mzansi Books',
  'https://www.mokmzansibooks.com/invite?token=inv123'
);
```

### 6. Low Stock Alert
```typescript
const result = await postmarkService.sendLowStockAlert(
  'admin@example.com',
  [
    {
      name: 'Things Fall Apart',
      currentStock: 2,
      minimumStock: 10,
      sku: 'TFA-001'
    }
  ]
);
```

## 🔌 API Integration

### Send Email via API

**Endpoint**: `POST /api/emails/send`

**Example Request**:
```json
{
  "type": "welcome",
  "to": "user@example.com",
  "data": {
    "userName": "John Doe",
    "loginLink": "https://www.mokmzansibooks.com/login"
  },
  "options": {
    "tag": "welcome-email",
    "metadata": {
      "user_id": "123",
      "signup_source": "website"
    }
  }
}
```

**Example Response**:
```json
{
  "success": true,
  "messageId": "b7bc2f4a-e38e-4336-af7d-aeeabeaed37d",
  "to": "user@example.com",
  "submittedAt": "2024-01-15T10:30:00Z",
  "type": "welcome"
}
```

### Get Email Statistics

**Endpoint**: `GET /api/emails/send?action=stats`

**Example Response**:
```json
{
  "success": true,
  "data": {
    "Sent": 1250,
    "Bounced": 12,
    "SpamComplaints": 2,
    "Tracked": 1180,
    "WithClientRecorded": 890
  }
}
```

## 🧪 Testing

### Run Email Tests

1. **Set up test email**:
   ```bash
   export TEST_EMAIL="your-email@example.com"
   ```

2. **Run test script**:
   ```bash
   npx tsx src/scripts/test-postmark-emails.ts
   ```

3. **Check your inbox** for test emails with:
   - Welcome message
   - Sample invoice
   - Sample quotation
   - Password reset link
   - Team invitation
   - Low stock alert
   - Custom HTML email

### Manual Testing via API

```bash
# Test welcome email
curl -X POST http://localhost:3000/api/emails/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "to": "test@example.com",
    "data": {
      "userName": "Test User",
      "loginLink": "https://www.mokmzansibooks.com/login"
    }
  }'
```

## 🎨 Template Customization

### HTML Templates Location
- `src/emails/templates/postmark/welcome-email.html`
- `src/emails/templates/postmark/invoice-email.html`
- `src/emails/templates/postmark/quotation-email.html`

### Template Variables
All templates support these variables:
- `{{company_logo}}` - Your uploaded logo
- `{{signature_image}}` - Your uploaded signature
- `{{twitter_icon}}`, `{{facebook_icon}}`, `{{tiktok_icon}}` - Social media icons
- `{{company_name}}`, `{{company_email}}`, `{{company_phone}}` - Company info
- Template-specific variables (see individual templates)

### Styling Guidelines
- Mobile-responsive design
- Professional color scheme
- Consistent branding
- Accessible typography
- Cross-client compatibility

## 🔧 Advanced Configuration

### Custom Email Templates

```typescript
// Send custom template email
const result = await postmarkService.sendEmailWithTemplate({
  to: 'user@example.com',
  templateAlias: 'my-custom-template',
  templateModel: {
    custom_variable: 'Custom Value',
    user_name: 'John Doe'
  }
});
```

### Webhook Integration

Set up webhooks in PostMark dashboard:
- **Bounce webhook**: `/api/webhooks/postmark/bounce`
- **Delivery webhook**: `/api/webhooks/postmark/delivery`
- **Open tracking**: `/api/webhooks/postmark/open`
- **Click tracking**: `/api/webhooks/postmark/click`

### Email Analytics

```typescript
// Get email statistics
const stats = await postmarkService.getEmailStats('welcome', '2024-01-01', '2024-01-31');

// Get bounced emails
const bounces = await postmarkService.getBouncedEmails(50, 0);
```

## 🚨 Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check `POSTMARK_SERVER_TOKEN` is correct
   - Verify token has send permissions

2. **422 Unprocessable Entity**
   - Verify sender signature is configured
   - Check email addresses are valid

3. **Assets not loading**
   - Verify blob storage URLs are accessible
   - Check CORS settings on blob storage

4. **Template not found**
   - Ensure template alias matches PostMark dashboard
   - Check template is active and published

### Debug Mode

```bash
# Enable debug logging
DEBUG=true npm run dev
```

### Health Check

```bash
# Test PostMark connection
curl -X GET "http://localhost:3000/api/emails/send?action=stats"
```

## 📚 Resources

- [PostMark Documentation](https://postmarkapp.com/developer)
- [PostMark Templates Guide](https://postmarkapp.com/developer/user-guide/template-quickstart)
- [Email Best Practices](https://postmarkapp.com/guides)
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit API tokens to version control
   - Use different tokens for development/production
   - Rotate tokens regularly

2. **Email Validation**
   - Validate all email addresses
   - Sanitize template variables
   - Rate limit email sending

3. **Content Security**
   - Use HTTPS for all assets
   - Validate template content
   - Monitor for spam complaints

## 📈 Monitoring

### Key Metrics to Track
- Email delivery rate
- Open rates
- Click-through rates
- Bounce rates
- Spam complaints
- Unsubscribe rates

### Alerts Setup
- High bounce rate alerts
- Spam complaint notifications
- API error monitoring
- Template rendering failures

---

**Need Help?** Contact the development team or check the PostMark support documentation for additional assistance.