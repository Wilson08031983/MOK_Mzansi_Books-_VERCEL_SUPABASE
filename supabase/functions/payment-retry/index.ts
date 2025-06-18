
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const resendApiKey = Deno.env.get('RESEND_API_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get all failed payments that need retry (within 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: failedPayments, error } = await supabase
      .from('payments')
      .select('*, subscriptions(*), profiles(*)')
      .eq('status', 'failed')
      .lt('retry_count', 7)
      .gte('created_at', sevenDaysAgo)
      .is('final_failure_date', null)

    if (error) {
      console.error('Error fetching failed payments:', error)
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: corsHeaders 
      })
    }

    console.log(`Found ${failedPayments?.length || 0} payments to retry`)

    for (const payment of failedPayments || []) {
      const retryCount = payment.retry_count + 1
      const now = new Date().toISOString()
      
      if (retryCount >= 7) {
        // Mark as final failure and send admin notification
        await supabase
          .from('payments')
          .update({ 
            final_failure_date: now,
            admin_notified: true,
            retry_count: retryCount 
          })
          .eq('id', payment.id)

        // Update subscription to limited access
        await supabase
          .from('subscriptions')
          .update({ access_level: 'limited' })
          .eq('id', payment.subscription_id)

        // Send admin notification
        await sendAdminNotification(payment)
        
        console.log(`Payment ${payment.id} marked as final failure after 7 retry attempts`)
      } else {
        // Update retry count and last retry date
        await supabase
          .from('payments')
          .update({ 
            retry_count: retryCount,
            last_retry_date: now 
          })
          .eq('id', payment.id)
        
        console.log(`Payment ${payment.id} retry attempt ${retryCount}`)
      }
    }

    return new Response(JSON.stringify({ 
      message: 'Payment retry process completed',
      processed: failedPayments?.length || 0 
    }), {
      headers: corsHeaders
    })

  } catch (error) {
    console.error('Error in payment retry:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

async function sendAdminNotification(payment: any) {
  try {
    const emailBody = {
      from: 'noreply@mokbooks.com',
      to: ['admin@mokbooks.com'], // Replace with your admin email
      subject: 'Payment Failed After 7 Retry Attempts - Action Required',
      html: `
        <h2>Payment Failure Notification</h2>
        <p>A payment has failed after 7 retry attempts and requires immediate attention.</p>
        
        <h3>Payment Details:</h3>
        <ul>
          <li><strong>Payment ID:</strong> ${payment.id}</li>
          <li><strong>User Email:</strong> ${payment.profiles?.email}</li>
          <li><strong>Amount:</strong> R${(payment.amount / 100).toFixed(2)}</li>
          <li><strong>Paystack Reference:</strong> ${payment.paystack_reference}</li>
          <li><strong>Subscription ID:</strong> ${payment.subscription_id}</li>
          <li><strong>Created:</strong> ${new Date(payment.created_at).toLocaleDateString()}</li>
        </ul>
        
        <h3>User Information:</h3>
        <ul>
          <li><strong>Name:</strong> ${payment.profiles?.first_name} ${payment.profiles?.last_name}</li>
          <li><strong>Email:</strong> ${payment.profiles?.email}</li>
        </ul>
        
        <p><strong>Action Required:</strong> The user has been moved to limited access. Please follow up manually.</p>
        
        <p>This is an automated notification from MOKMzansiBooks payment system.</p>
      `
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
    })

    if (!response.ok) {
      console.error('Failed to send admin notification:', await response.text())
    } else {
      console.log('Admin notification sent successfully for payment:', payment.id)
      
      // Record the notification in the database
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      await supabase
        .from('failed_payment_notifications')
        .insert({
          user_id: payment.user_id,
          payment_id: payment.id,
          subscription_id: payment.subscription_id,
          admin_email: 'admin@mokbooks.com',
          user_email: payment.profiles?.email,
          retry_attempts: payment.retry_count
        })
    }
  } catch (error) {
    console.error('Error sending admin notification:', error)
  }
}
