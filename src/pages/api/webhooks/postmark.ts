import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// Postmark webhook event types
interface PostmarkWebhookEvent {
  RecordType: 'Delivery' | 'Bounce' | 'SpamComplaint' | 'Open' | 'Click';
  MessageID: string;
  Recipient: string;
  DeliveredAt?: string;
  BouncedAt?: string;
  Type?: string;
  Description?: string;
  Details?: string;
  Email?: string;
  Name?: string;
  Tag?: string;
  Metadata?: Record<string, any>;
}

// Email delivery monitoring service
class EmailMonitoringService {
  private static instance: EmailMonitoringService;
  private deliveryStats = {
    delivered: 0,
    bounced: 0,
    spam: 0,
    opened: 0,
    clicked: 0
  };

  static getInstance(): EmailMonitoringService {
    if (!EmailMonitoringService.instance) {
      EmailMonitoringService.instance = new EmailMonitoringService();
    }
    return EmailMonitoringService.instance;
  }

  async handleDelivery(event: PostmarkWebhookEvent) {
    this.deliveryStats.delivered++;
    console.log(`✅ Email delivered to ${event.Recipient} at ${event.DeliveredAt}`);
    
    // Log successful delivery
    await this.logEvent('delivery', {
      messageId: event.MessageID,
      recipient: event.Recipient,
      deliveredAt: event.DeliveredAt,
      metadata: event.Metadata
    });
  }

  async handleBounce(event: PostmarkWebhookEvent) {
    this.deliveryStats.bounced++;
    console.error(`❌ Email bounced for ${event.Recipient}: ${event.Description}`);
    
    // Log bounce with details
    await this.logEvent('bounce', {
      messageId: event.MessageID,
      recipient: event.Recipient,
      bouncedAt: event.BouncedAt,
      type: event.Type,
      description: event.Description,
      details: event.Details
    });

    // Send alert for hard bounces
    if (event.Type === 'HardBounce') {
      await this.sendAlert('Hard Bounce Alert', `Email to ${event.Recipient} hard bounced: ${event.Description}`);
    }
  }

  async handleSpamComplaint(event: PostmarkWebhookEvent) {
    this.deliveryStats.spam++;
    console.warn(`⚠️ Spam complaint from ${event.Email}: ${event.Description}`);
    
    // Log spam complaint
    await this.logEvent('spam', {
      messageId: event.MessageID,
      email: event.Email,
      name: event.Name,
      description: event.Description
    });

    // Send immediate alert for spam complaints
    await this.sendAlert('Spam Complaint Alert', `Spam complaint received from ${event.Email}`);
  }

  async handleOpen(event: PostmarkWebhookEvent) {
    this.deliveryStats.opened++;
    console.log(`👁️ Email opened by ${event.Recipient}`);
    
    await this.logEvent('open', {
      messageId: event.MessageID,
      recipient: event.Recipient,
      tag: event.Tag,
      metadata: event.Metadata
    });
  }

  async handleClick(event: PostmarkWebhookEvent) {
    this.deliveryStats.clicked++;
    console.log(`🖱️ Link clicked by ${event.Recipient}`);
    
    await this.logEvent('click', {
      messageId: event.MessageID,
      recipient: event.Recipient,
      tag: event.Tag,
      metadata: event.Metadata
    });
  }

  private async logEvent(type: string, data: any) {
    // In production, you might want to store this in a database
    // For now, we'll use console logging with structured data
    console.log(`[EMAIL_MONITORING] ${type.toUpperCase()}:`, {
      timestamp: new Date().toISOString(),
      type,
      ...data
    });
  }

  private async sendAlert(subject: string, message: string) {
    // In production, you might want to send alerts via:
    // - Slack webhook
    // - Email to admin
    // - SMS notification
    // - Push notification to monitoring dashboard
    console.error(`[ALERT] ${subject}: ${message}`);
  }

  getStats() {
    return { ...this.deliveryStats };
  }

  resetStats() {
    this.deliveryStats = {
      delivered: 0,
      bounced: 0,
      spam: 0,
      opened: 0,
      clicked: 0
    };
  }
}

// Verify webhook signature
function verifyWebhookSignature(body: string, signature: string): boolean {
  const webhookSecret = process.env.POSTMARK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('POSTMARK_WEBHOOK_SECRET not configured');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  return signature === expectedSignature;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signature = req.headers['x-postmark-signature'] as string;
    const body = JSON.stringify(req.body);

    // Verify webhook signature for security
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const event: PostmarkWebhookEvent = req.body;
    const monitoring = EmailMonitoringService.getInstance();

    // Handle different event types
    switch (event.RecordType) {
      case 'Delivery':
        await monitoring.handleDelivery(event);
        break;
      case 'Bounce':
        await monitoring.handleBounce(event);
        break;
      case 'SpamComplaint':
        await monitoring.handleSpamComplaint(event);
        break;
      case 'Open':
        await monitoring.handleOpen(event);
        break;
      case 'Click':
        await monitoring.handleClick(event);
        break;
      default:
        console.log(`Unknown event type: ${event.RecordType}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Export monitoring service for use in other parts of the application
export { EmailMonitoringService };