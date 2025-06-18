
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('Webhook payload:', payload)
    
    if (payload.event === 'charge.success') {
      // Payment succeeded
      const { data } = payload
      
      await supabase
        .from('payments')
        .update({ 
          status: 'success',
          payment_date: new Date().toISOString()
        })
        .eq('paystack_reference', data.reference)
      
      // Update subscription to active
      const { data: payment } = await supabase
        .from('payments')
        .select('subscription_id')
        .eq('paystack_reference', data.reference)
        .single()
      
      if (payment?.subscription_id) {
        await supabase
          .from('subscriptions')
          .update({ 
            status: 'active',
            access_level: 'full'
          })
          .eq('id', payment.subscription_id)
      }
      
      console.log('Payment success processed:', data.reference)
      
    } else if (payload.event === 'charge.failed') {
      // Payment failed
      const { data } = payload
      
      await supabase
        .from('payments')
        .update({ 
          status: 'failed',
          retry_count: 0
        })
        .eq('paystack_reference', data.reference)
      
      console.log('Payment failure recorded:', data.reference)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: corsHeaders
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders
    })
  }
})
