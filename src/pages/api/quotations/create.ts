import { NextApiResponse } from 'next';
import { trialLimitMiddleware, TrialLimitRequest } from '../../../middleware/trialLimitMiddleware';
import { supabase } from '@/integrations/supabase';

interface CreateQuotationRequest extends TrialLimitRequest {
  body: {
    clientId: string;
    quotationNumber: string;
    issueDate: string;
    validUntil: string;
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

async function createQuotationHandler(req: CreateQuotationRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      clientId,
      quotationNumber,
      issueDate,
      validUntil,
      items,
      subtotal,
      vatAmount,
      total,
      notes,
      terms,
      status = 'draft'
    } = req.body;

    // Validate required fields
    if (!clientId || !quotationNumber || !issueDate || !validUntil || !items || items.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Client ID, quotation number, issue date, valid until date, and items are required'
      });
    }

    // Validate quotation number uniqueness for this user
    const { data: existingQuotation } = await supabase
      .from('quotations')
      .select('id')
      .eq('user_id', req.userId)
      .eq('quotation_number', quotationNumber)
      .single();

    if (existingQuotation) {
      return res.status(400).json({
        error: 'Duplicate quotation number',
        message: 'A quotation with this number already exists'
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

    // Create quotation in database
    const { data: quotation, error } = await supabase
      .from('quotations')
      .insert({
        user_id: req.userId,
        client_id: clientId,
        quotation_number: quotationNumber,
        issue_date: issueDate,
        valid_until: validUntil,
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
      console.error('Database error creating quotation:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to create quotation'
      });
    }

    // Return success response with trial limit info
    return res.status(201).json({
      success: true,
      quotation,
      trialInfo: req.trialValidation ? {
        currentCount: req.trialValidation.currentCount + 1,
        limit: req.trialValidation.limit,
        remaining: req.trialValidation.limit - (req.trialValidation.currentCount + 1)
      } : null
    });

  } catch (error) {
    console.error('Error creating quotation:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}

// Apply trial limit middleware for monthly quotation limits
export default trialLimitMiddleware.quotations(createQuotationHandler);