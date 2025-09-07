import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { env } from '@/env.mjs';
import { db } from '@/lib/db';

// Mailjet webhook event types
type MailjetEventType = 'sent' | 'open' | 'click' | 'bounce' | 'blocked' | 'spam' | 'unsub';

interface MailjetEvent {
  event: MailjetEventType;
  time: number;
  MessageID: number;
  Message_GUID?: string;
  email: string;
  mj_campaign_id: number;
  mj_contact_id: number;
  customcampaign?: string;
  CustomID?: string;
  Payload?: string;
  // Event-specific properties
  mj_message_id?: string;
  smtp_reply?: string;
  ip?: string;
  geo?: string;
  agent?: string;
  url?: string;
  blocked?: boolean;
  hard_bounce?: boolean;
  error_related_to?: string;
  error?: string;
  comment?: string;
  source?: string;
  mj_list_id?: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Basic authentication check (optional but recommended)
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const [type, credentials] = authHeader.split(' ');
      if (type === 'Basic') {
        const decoded = Buffer.from(credentials, 'base64').toString('utf-8');
        const [username, password] = decoded.split(':');
        
        // Verify credentials against environment variables
        const expectedUsername = process.env.MAILJET_WEBHOOK_USERNAME;
        const expectedPassword = process.env.MAILJET_WEBHOOK_PASSWORD;
        
        if (expectedUsername && expectedPassword) {
          if (username !== expectedUsername || password !== expectedPassword) {
            return res.status(401).json({ message: 'Unauthorized' });
          }
        }
      }
    }

    // Parse events (Mailjet sends an array of events)
    const events: MailjetEvent[] = Array.isArray(req.body) ? req.body : [req.body];
    
    if (!events || events.length === 0) {
      return res.status(400).json({ message: 'No events received' });
    }

    // Process each event
    for (const event of events) {
      await processMailjetEvent(event);
    }

    // Return 200 OK to acknowledge receipt
    return res.status(200).json({ 
      message: 'Events processed successfully',
      processed: events.length 
    });

  } catch (error) {
    console.error('Mailjet webhook processing error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

async function processMailjetEvent(event: MailjetEvent) {
  try {
    // Create idempotency key using MessageID and event type
    const provider = 'mailjet';
    const eventType = event.event;
    const eventId = `${event.MessageID}-${event.event}-${event.time}`;

    // Check if event already processed (idempotency)
    const existing = await db.webhookEvent.findUnique({
      where: {
        provider_eventId: {
          provider,
          eventId
        }
      }
    });

    if (existing && existing.processedAt) {
      console.log(`Event ${eventId} already processed, skipping`);
      return;
    }

    // Record the webhook event
    const recorded = existing ?? await db.webhookEvent.create({
      data: {
        provider,
        eventType,
        eventId,
        payload: event
      }
    });

    // Process based on event type
    switch (event.event) {
      case 'sent':
        await handleSentEvent(event);
        break;
      case 'open':
        await handleOpenEvent(event);
        break;
      case 'click':
        await handleClickEvent(event);
        break;
      case 'bounce':
        await handleBounceEvent(event);
        break;
      case 'blocked':
        await handleBlockedEvent(event);
        break;
      case 'spam':
        await handleSpamEvent(event);
        break;
      case 'unsub':
        await handleUnsubEvent(event);
        break;
      default:
        console.log(`Unknown event type: ${event.event}`);
    }

    // Mark as processed
    await db.webhookEvent.update({
      where: { id: recorded.id },
      data: { processedAt: new Date() }
    });

    console.log(`Successfully processed ${event.event} event for ${event.email}`);

  } catch (error) {
    console.error(`Error processing event ${event.event} for ${event.email}:`, error);
    throw error;
  }
}

// Event handlers
async function handleSentEvent(event: MailjetEvent) {
  // Log successful delivery
  console.log(`Email sent successfully to ${event.email}, MessageID: ${event.MessageID}`);
  
  // TODO: Update email status in database if tracking individual emails
  // await updateEmailStatus(event.MessageID, 'sent');
}

async function handleOpenEvent(event: MailjetEvent) {
  console.log(`Email opened by ${event.email} from ${event.geo} (${event.ip})`);
  
  // TODO: Track email opens for analytics
  // await trackEmailOpen(event.MessageID, event.email, event.ip, event.geo);
}

async function handleClickEvent(event: MailjetEvent) {
  console.log(`Link clicked by ${event.email}: ${event.url}`);
  
  // TODO: Track link clicks for analytics
  // await trackEmailClick(event.MessageID, event.email, event.url);
}

async function handleBounceEvent(event: MailjetEvent) {
  console.log(`Email bounced for ${event.email}, hard_bounce: ${event.hard_bounce}`);
  
  if (event.hard_bounce) {
    // Mark email as invalid for hard bounces
    console.log(`Marking ${event.email} as invalid due to hard bounce`);
    // TODO: Update user email status or add to blacklist
    // await markEmailAsInvalid(event.email, event.error, event.comment);
  }
}

async function handleBlockedEvent(event: MailjetEvent) {
  console.log(`Email blocked for ${event.email}, reason: ${event.error}`);
  
  // TODO: Handle blocked emails based on error type
  // Some blocks are temporary (greylisted), others permanent (blacklisted)
}

async function handleSpamEvent(event: MailjetEvent) {
  console.log(`Spam complaint from ${event.email}, source: ${event.source}`);
  
  // TODO: Handle spam complaints - may need to unsubscribe user
  // await handleSpamComplaint(event.email, event.source);
}

async function handleUnsubEvent(event: MailjetEvent) {
  console.log(`Unsubscribe request from ${event.email}`);
  
  // TODO: Process unsubscribe request
  // await unsubscribeUser(event.email, event.mj_list_id);
}

export default handler;

// Export types for use in other files
export type { MailjetEvent, MailjetEventType };