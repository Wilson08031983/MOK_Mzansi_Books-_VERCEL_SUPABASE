import { NextRequest, NextResponse } from 'next/server';
import { postmarkService } from '@/services/postmarkService';
import { z } from 'zod';

// Validation schemas
const emailItemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.string(),
  amount: z.string()
});

const sendEmailSchema = z.object({
  type: z.enum(['welcome', 'invoice', 'quotation', 'password-reset', 'team-invitation', 'low-stock-alert', 'custom']),
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().optional(),
  data: z.object({
    // Welcome email data
    userName: z.string().optional(),
    loginLink: z.string().url().optional(),
    
    // Invoice email data
    invoiceNumber: z.string().optional(),
    clientName: z.string().optional(),
    dueDate: z.string().optional(),
    total: z.string().optional(),
    items: z.array(emailItemSchema).optional(),
    
    // Quotation email data
    quotationNumber: z.string().optional(),
    validUntil: z.string().optional(),
    
    // Password reset data
    resetLink: z.string().url().optional(),
    
    // Team invitation data
    inviterName: z.string().optional(),
    companyName: z.string().optional(),
    invitationLink: z.string().url().optional(),
    
    // Low stock alert data
    lowStockItems: z.array(z.object({
      name: z.string(),
      currentStock: z.number(),
      minimumStock: z.number(),
      sku: z.string().optional()
    })).optional(),
    
    // Custom email data
    htmlBody: z.string().optional(),
    textBody: z.string().optional(),
    templateAlias: z.string().optional(),
    templateModel: z.record(z.any()).optional()
  }).optional(),
  options: z.object({
    from: z.string().optional(),
    replyTo: z.string().optional(),
    cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
    bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
    tag: z.string().optional(),
    metadata: z.record(z.string()).optional(),
    attachments: z.array(z.object({
      name: z.string(),
      content: z.string(),
      contentType: z.string()
    })).optional()
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = sendEmailSchema.parse(body);
    
    const { type, to, subject, data = {}, options = {} } = validatedData;
    
    // Check if PostMark is configured
    if (!process.env.POSTMARK_API_TOKEN) {
      return NextResponse.json(
        { error: 'PostMark API token not configured' },
        { status: 500 }
      );
    }
    
    let result;
    
    // Route to appropriate email sending method based on type
    switch (type) {
      case 'welcome':
        if (!data.userName) {
          return NextResponse.json(
            { error: 'userName is required for welcome emails' },
            { status: 400 }
          );
        }
        result = await postmarkService.sendWelcomeEmail(
          Array.isArray(to) ? to[0] : to,
          data.userName,
          data.loginLink
        );
        break;
        
      case 'invoice':
        if (!data.invoiceNumber || !data.clientName || !data.dueDate || !data.total || !data.items) {
          return NextResponse.json(
            { error: 'Invoice data is incomplete. Required: invoiceNumber, clientName, dueDate, total, items' },
            { status: 400 }
          );
        }
        result = await postmarkService.sendInvoiceEmail(
          Array.isArray(to) ? to[0] : to,
          {
            invoiceNumber: data.invoiceNumber,
            clientName: data.clientName,
            dueDate: data.dueDate,
            total: data.total,
            items: data.items as Array<{ description: string; quantity: number; unitPrice: string; amount: string }>
          }
        );
        break;
        
      case 'quotation':
        if (!data.quotationNumber || !data.clientName || !data.validUntil || !data.total || !data.items) {
          return NextResponse.json(
            { error: 'Quotation data is incomplete. Required: quotationNumber, clientName, validUntil, total, items' },
            { status: 400 }
          );
        }
        result = await postmarkService.sendQuotationEmail(
          Array.isArray(to) ? to[0] : to,
          {
            quotationNumber: data.quotationNumber,
            clientName: data.clientName,
            validUntil: data.validUntil,
            total: data.total,
            items: data.items as Array<{ description: string; quantity: number; unitPrice: string; amount: string }>
          }
        );
        break;
        
      case 'password-reset':
        if (!data.resetLink) {
          return NextResponse.json(
            { error: 'resetLink is required for password reset emails' },
            { status: 400 }
          );
        }
        result = await postmarkService.sendPasswordResetEmail(
          Array.isArray(to) ? to[0] : to,
          data.resetLink,
          data.userName
        );
        break;
        
      case 'team-invitation':
        if (!data.inviterName || !data.companyName || !data.invitationLink) {
          return NextResponse.json(
            { error: 'Team invitation data is incomplete. Required: inviterName, companyName, invitationLink' },
            { status: 400 }
          );
        }
        result = await postmarkService.sendTeamInvitationEmail(
          Array.isArray(to) ? to[0] : to,
          data.inviterName,
          data.companyName,
          data.invitationLink
        );
        break;
        
      case 'low-stock-alert':
        if (!data.lowStockItems || data.lowStockItems.length === 0) {
          return NextResponse.json(
            { error: 'lowStockItems array is required for low stock alerts' },
            { status: 400 }
          );
        }
        result = await postmarkService.sendLowStockAlert(
          Array.isArray(to) ? to[0] : to,
          data.lowStockItems as Array<{
            name: string;
            currentStock: number;
            minimumStock: number;
            sku?: string;
          }>
        );
        break;
        
      case 'custom':
        if (data.templateAlias) {
          // Send using PostMark template
          result = await postmarkService.sendEmailWithTemplate({
            to,
            subject: subject || `Email from ${process.env.COMPANY_NAME || 'MOK Mzansi Books'}`,
            templateAlias: data.templateAlias,
            templateModel: data.templateModel || {},
            ...options,
            attachments: options.attachments as Array<{
              name: string;
              content: string;
              contentType: string;
            }> | undefined
          });
        } else if (data.htmlBody || data.textBody) {
          // Send custom HTML/text email
          if (!subject) {
            return NextResponse.json(
              { error: 'subject is required for custom emails' },
              { status: 400 }
            );
          }
          result = await postmarkService.sendEmail({
            to,
            subject,
            htmlBody: data.htmlBody,
            textBody: data.textBody,
            ...options,
            attachments: options.attachments as Array<{
              name: string;
              content: string;
              contentType: string;
            }> | undefined
          });
        } else {
          return NextResponse.json(
            { error: 'Either templateAlias or htmlBody/textBody is required for custom emails' },
            { status: 400 }
          );
        }
        break;
        
      default:
        return NextResponse.json(
          { error: `Unsupported email type: ${type}` },
          { status: 400 }
        );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      to: result.to,
      submittedAt: result.submittedAt,
      type
    });
    
  } catch (error) {
    console.error('Email sending error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }
    
    // Handle PostMark API errors
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

// GET endpoint for email statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag') || undefined;
    const fromDate = searchParams.get('fromDate') || undefined;
    const toDate = searchParams.get('toDate') || undefined;
    const action = searchParams.get('action');
    
    if (!process.env.POSTMARK_API_TOKEN) {
      return NextResponse.json(
        { error: 'PostMark API token not configured' },
        { status: 500 }
      );
    }
    
    let result;
    
    switch (action) {
      case 'stats':
        result = await postmarkService.getEmailStats(tag, fromDate, toDate);
        break;
        
      case 'bounces':
        const count = parseInt(searchParams.get('count') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');
        result = await postmarkService.getBouncedEmails(count, offset);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use ?action=stats or ?action=bounces' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Email stats error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch email statistics' },
      { status: 500 }
    );
  }
}