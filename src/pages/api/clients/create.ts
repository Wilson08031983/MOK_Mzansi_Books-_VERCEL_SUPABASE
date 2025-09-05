import { NextApiResponse } from 'next';
import { trialLimitMiddleware, TrialLimitRequest } from '../../../middleware/trialLimitMiddleware';
import { supabase } from '@/integrations/supabase';

interface CreateClientRequest extends TrialLimitRequest {
  body: {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    website?: string;
    websiteNotApplicable?: boolean;
    taxNumber?: string;
    registrationNumber?: string;
    vatNumber?: string;
    vatNumberNotApplicable?: boolean;
    billingStreet?: string;
    billingCity?: string;
    billingState?: string;
    billingPostal?: string;
    billingCountry?: string;
    sameAsBilling?: boolean;
    shippingStreet?: string;
    shippingCity?: string;
    shippingState?: string;
    shippingPostal?: string;
    shippingCountry?: string;
    paymentTerms?: string;
    currency?: string;
    creditLimit?: string;
    discountRate?: string;
    preferredPaymentMethod?: string;
    notes?: string;
    tags?: string;
    referralSource?: string;
    clientType: string;
  };
}

async function createClientHandler(req: CreateClientRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      website,
      websiteNotApplicable,
      taxNumber,
      registrationNumber,
      vatNumber,
      vatNumberNotApplicable,
      billingStreet,
      billingCity,
      billingState,
      billingPostal,
      billingCountry,
      sameAsBilling,
      shippingStreet,
      shippingCity,
      shippingState,
      shippingPostal,
      shippingCountry,
      paymentTerms,
      currency,
      creditLimit,
      discountRate,
      preferredPaymentMethod,
      notes,
      tags,
      referralSource,
      clientType,
    } = req.body;

    // Validate required fields
    if (!companyName || !contactPerson || !email || !clientType) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Company name, contact person, email, and client type are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Create client in database
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        user_id: req.userId,
        company_name: companyName,
        contact_person: contactPerson,
        email,
        phone: phone || '',
        website: websiteNotApplicable ? '' : (website || ''),
        website_not_applicable: websiteNotApplicable || false,
        tax_number: taxNumber || '',
        registration_number: registrationNumber || '',
        vat_number: vatNumberNotApplicable ? '' : (vatNumber || ''),
        vat_number_not_applicable: vatNumberNotApplicable || false,
        billing_street: billingStreet || '',
        billing_city: billingCity || '',
        billing_state: billingState || '',
        billing_postal: billingPostal || '',
        billing_country: billingCountry || '',
        same_as_billing: sameAsBilling || false,
        shipping_street: sameAsBilling ? billingStreet : (shippingStreet || ''),
        shipping_city: sameAsBilling ? billingCity : (shippingCity || ''),
        shipping_state: sameAsBilling ? billingState : (shippingState || ''),
        shipping_postal: sameAsBilling ? billingPostal : (shippingPostal || ''),
        shipping_country: sameAsBilling ? billingCountry : (shippingCountry || ''),
        payment_terms: paymentTerms || '',
        currency: currency || 'ZAR',
        credit_limit: creditLimit || '0',
        discount_rate: discountRate || '0',
        preferred_payment_method: preferredPaymentMethod || '',
        notes: notes || '',
        tags: tags || '',
        referral_source: referralSource || '',
        client_type: clientType,
        status: 'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error creating client:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to create client'
      });
    }

    // Return success response with trial limit info
    return res.status(201).json({
      success: true,
      client,
      trialInfo: req.trialValidation ? {
        currentCount: req.trialValidation.currentCount + 1, // Include the newly created client
        limit: req.trialValidation.limit,
        remaining: req.trialValidation.limit - (req.trialValidation.currentCount + 1)
      } : null
    });

  } catch (error) {
    console.error('Error creating client:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}

// Apply trial limit middleware
export default trialLimitMiddleware.clients(createClientHandler);