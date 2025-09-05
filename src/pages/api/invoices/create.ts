import { NextApiResponse } from 'next';
import { trialLimitMiddleware, TrialLimitRequest } from '../../../middleware/trialLimitMiddleware';
import { supabase } from '@/integrations/supabase';

interface CreateInvoiceRequest extends TrialLimitRequest {
  body: {
    clientId: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    subtotal: number;
    vatAmount: number;
    total: number;
    notes?: string;
    terms?: string;
    status?: string;
  };
}

async function createInvoiceHandler(req: CreateInvoiceRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      clientId,
      invoiceNumber,
      issueDate,
      dueDate,
      items,
      subtotal,
      vatAmount,
      total,
      notes,
      terms,
      status = 'draft'
    } = req.body;

    // Validate required fields
    if (!clientId || !invoiceNumber || !issueDate || !dueDate || !items || items.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Client ID, invoice number, issue date, due date, and items are required'
      });
    }

    // Validate invoice number uniqueness for this user
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('user_id', req.userId)
      .eq('invoice_number', invoiceNumber)
      .single();

    if (existingInvoice) {
      return res.status(400).json({
        error: 'Duplicate invoice number',
        message: 'An invoice with this number already exists'
      });
    }

    // Validate client exists and belongs to user
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('user_id', req.userId)
      .single();

    if (clientError || !client) {
      return res.status(400).json({
        error: 'Invalid client',
        message: 'Client not found or does not belong to user'
      });
    }

    // Create invoice in database
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        user_id: req.userId,
        client_id: clientId,
        invoice_number: invoiceNumber,
        issue_date: issueDate,
        due_date: dueDate,
        items: JSON.stringify(items),
        subtotal,
        vat_amount: vatAmount,
        total,
        notes: notes || '',
        terms: terms || '',
        status,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error creating invoice:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to create invoice'
      });
    }

    // Return success response with trial limit info
    return res.status(201).json({
      success: true,
      invoice,
      trialInfo: req.trialValidation ? {
        currentCount: req.trialValidation.currentCount + 1,
        limit: req.trialValidation.limit,
        remaining: req.trialValidation.limit - (req.trialValidation.currentCount + 1)
      } : null
    });

  } catch (error) {
    console.error('Error creating invoice:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}

// Apply trial limit middleware for monthly invoice limits
export default trialLimitMiddleware.invoices(createInvoiceHandler);