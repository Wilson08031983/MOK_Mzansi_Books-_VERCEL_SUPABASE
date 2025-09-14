import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

interface PostmarkWebhookEvent {
  RecordType: 'Delivery' | 'Bounce' | 'SpamComplaint' | 'Open' | 'Click';
  MessageID: string;
  DeliveredAt?: string;
  BouncedAt?: string;
  Email?: string;
  From?: string;
  Subject?: string;
  Tag?: string;
  Details?: string;
  Description?: string;
  Type?: string;
  TypeCode?: number;
  Name?: string;
  MessageStream?: string;
  Metadata?: Record<string, any>;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature if POSTMARK_WEBHOOK_SECRET is set
    const webhookSecret = process.env.POSTMARK_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['x-postmark-signature'] as string;
      if (!signature) {
        return res.status(401).json({ error: 'Missing webhook signature' });
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('base64');

      if (signature !== expectedSignature) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    const event: PostmarkWebhookEvent = req.body;
    
    console.log('Received Postmark webhook event:', {
      type: event.RecordType,
      messageId: event.MessageID,
      email: event.Email,
      timestamp: event.DeliveredAt || event.BouncedAt || new Date().toISOString()
    });

    // Handle different event types
    switch (event.RecordType) {
      case 'Delivery':
        console.log(`Email delivered successfully to ${event.Email}`);
        // Add your delivery handling logic here
        break;
        
      case 'Bounce':
        console.log(`Email bounced for ${event.Email}: ${event.Description}`);
        // Add your bounce handling logic here
        break;
        
      case 'SpamComplaint':
        console.log(`Spam complaint received for ${event.Email}`);
        // Add your spam complaint handling logic here
        break;
        
      case 'Open':
        console.log(`Email opened by ${event.Email}`);
        // Add your open tracking logic here
        break;
        
      case 'Click':
        console.log(`Link clicked by ${event.Email}`);
        // Add your click tracking logic here
        break;
        
      default:
        console.log('Unknown event type:', event.RecordType);
    }

    // Respond with success
    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully',
      eventType: event.RecordType,
      messageId: event.MessageID
    });
    
  } catch (error) {
    console.error('Error processing Postmark webhook:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}