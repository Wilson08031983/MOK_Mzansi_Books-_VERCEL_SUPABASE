# Postmark Email Monitoring Setup

This guide explains how to set up production monitoring and alerts for email delivery using Postmark webhooks.

## 🔧 Configuration

### 1. Environment Variables

Ensure these variables are set in your production environment:

```bash
# Required for webhook security
POSTMARK_WEBHOOK_SECRET="your-secure-webhook-secret-here"

# Already configured
POSTMARK_SERVER_TOKEN="1d8c2f0c-3a66-4693-8374-9c1052879d9d"
POSTMARK_SENDER_EMAIL="noreply@mokmzansibooks.com"
```

### 2. Postmark Webhook Configuration

#### Step 1: Access Postmark Dashboard
1. Go to [Postmark Dashboard](https://postmarkapp.com)
2. Navigate to your server: **MOK Mzansi Books Email Server**
3. Go to **Settings** → **Webhooks**

#### Step 2: Configure Webhook URL
Set up webhook URL pointing to your production domain:
```
https://your-domain.vercel.app/api/webhooks/postmark
```

#### Step 3: Select Event Types
Enable these webhook events:
- ✅ **Delivery** - Track successful email deliveries
- ✅ **Bounce** - Monitor email bounces (hard/soft)
- ✅ **Spam Complaint** - Alert on spam reports
- ✅ **Open** - Track email opens (optional)
- ✅ **Click** - Track link clicks (optional)

#### Step 4: Set Webhook Secret
Use the same secret as `POSTMARK_WEBHOOK_SECRET` environment variable.

## 📊 Monitoring Endpoints

### Email Statistics Dashboard
```
GET /api/monitoring/email-stats
```

**Response Example:**
```json
{
  "deliveryStats": {
    "delivered": 150,
    "bounced": 2,
    "spam": 0,
    "opened": 89,
    "clicked": 23
  },
  "deliveryRate": 98.68,
  "bounceRate": 1.32,
  "spamRate": 0,
  "openRate": 59.33,
  "clickRate": 25.84,
  "serverStatus": {
    "isActive": true,
    "serverName": "MOK Mzansi Books Email Server",
    "serverId": 1
  },
  "health": {
    "overall": "healthy",
    "issues": []
  },
  "lastChecked": "2024-01-15T10:30:00.000Z"
}
```

### Health Status Indicators

| Status | Condition | Action Required |
|--------|-----------|----------------|
| 🟢 **Healthy** | Bounce rate < 5%, No spam complaints | None |
| 🟡 **Warning** | Bounce rate 5-10%, Spam rate > 0.1% | Monitor closely |
| 🔴 **Critical** | Bounce rate > 10%, Server inactive | Immediate action |

## 🚨 Alert Configuration

### Current Alert Triggers

1. **Hard Bounce Alert**
   - Triggered on any hard bounce
   - Logged to console with recipient details

2. **Spam Complaint Alert**
   - Immediate alert on any spam complaint
   - Includes complainant email address

3. **High Bounce Rate Alert**
   - Warning when bounce rate > 5%
   - Critical when bounce rate > 10%

### Extending Alerts (Production Setup)

To enhance monitoring, consider integrating:

#### Slack Notifications
```javascript
// Add to EmailMonitoringService.sendAlert()
const slackWebhook = process.env.SLACK_WEBHOOK_URL;
if (slackWebhook) {
  await fetch(slackWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 ${subject}: ${message}`,
      channel: '#email-alerts'
    })
  });
}
```

#### Email Alerts to Admin
```javascript
// Send critical alerts via email
if (severity === 'critical') {
  await postmarkService.sendEmail({
    to: 'admin@mokmzansibooks.com',
    subject: `🚨 Critical Email Alert: ${subject}`,
    htmlBody: `<p><strong>Alert:</strong> ${message}</p>`,
    tag: 'system-alert'
  });
}
```

## 📈 Monitoring Best Practices

### 1. Regular Health Checks
- Monitor delivery rates daily
- Set up automated alerts for bounce rates > 5%
- Review spam complaints immediately

### 2. Performance Metrics
- **Delivery Rate**: Should be > 95%
- **Bounce Rate**: Should be < 5%
- **Spam Rate**: Should be < 0.1%
- **Open Rate**: Industry average 15-25%

### 3. Bounce Management
- **Soft Bounces**: Temporary issues, retry automatically
- **Hard Bounces**: Remove from mailing list immediately
- **Spam Complaints**: Investigate sender reputation

## 🔍 Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**
   - Verify webhook URL is accessible
   - Check webhook secret configuration
   - Ensure HTTPS is used in production

2. **High Bounce Rates**
   - Validate email addresses before sending
   - Clean up mailing lists regularly
   - Check sender reputation

3. **Spam Complaints**
   - Review email content and formatting
   - Ensure proper unsubscribe links
   - Verify sender domain authentication

### Debug Commands

```bash
# Test webhook endpoint
curl -X POST https://your-domain.vercel.app/api/webhooks/postmark \
  -H "Content-Type: application/json" \
  -H "X-Postmark-Signature: test-signature" \
  -d '{"RecordType":"Delivery","MessageID":"test","Recipient":"test@example.com"}'

# Check email statistics
curl https://your-domain.vercel.app/api/monitoring/email-stats
```

## 📋 Maintenance Tasks

### Daily
- [ ] Check email delivery statistics
- [ ] Review any bounce or spam alerts

### Weekly
- [ ] Analyze email performance trends
- [ ] Clean up bounced email addresses
- [ ] Review webhook logs

### Monthly
- [ ] Audit email templates and content
- [ ] Review sender reputation metrics
- [ ] Update monitoring thresholds if needed

## 🔗 Useful Links

- [Postmark Dashboard](https://postmarkapp.com)
- [Postmark API Documentation](https://postmarkapp.com/developer)
- [Email Deliverability Best Practices](https://postmarkapp.com/guides/email-deliverability)
- [Webhook Event Reference](https://postmarkapp.com/developer/webhooks/webhooks-overview)

---

**Note**: This monitoring setup provides comprehensive email delivery tracking and alerting. Customize alert thresholds and notification methods based on your specific requirements.