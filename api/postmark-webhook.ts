import { VercelRequest, VercelResponse } from '@vercel/node';

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
    // Postmark doesn't use HMAC signature verification
    // They only support Basic HTTP Auth or IP filtering for webhook security
    // Parse the webhook event directly from the request body
    const event: PostmarkWebhookEvent = req.body as PostmarkWebhookEvent;
    
    console.log('Received Postmark webhook event:', {
      type: event.RecordType,
      messageId: event.MessageID,
      email: event.Email || 'undefined',
      timestamp: event.DeliveredAt || event.BouncedAt || new Date().toISOString()
    });

    // Handle different event types
    switch (event.RecordType) {
      case 'Delivery':
        console.log(`Email delivered successfully to ${event.Email || 'unknown recipient'}`);
        // Add your delivery handling logic here
        break;
        
      case 'Bounce':
        console.log(`Email bounced for ${event.Email || 'unknown recipient'}: ${event.Description}`);
        // Add your bounce handling logic here
        break;
        
      case 'SpamComplaint':
        console.log(`Spam complaint received for ${event.Email || 'unknown recipient'}`);
        // Add your spam complaint handling logic here
        break;
        
      case 'Open':
        console.log(`Email opened by ${event.Email || 'unknown recipient'}`);
        // Add your open tracking logic here
        break;
        
      case 'Click':
        console.log(`Link clicked by ${event.Email || 'unknown recipient'}`);
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