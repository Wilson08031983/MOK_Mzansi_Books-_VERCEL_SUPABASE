
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  type: string;
  name: string;
  email: string;
  contactNumber: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, name, email, contactNumber, message }: ContactEmailRequest = await req.json();

    // Send email to your email address
    const adminEmailResponse = await resend.emails.send({
      from: "MOKMzansiBooks <onboarding@resend.dev>",
      to: ["mokgethwamoabelo@gmail.com"],
      subject: `New ${type} from ${name}`,
      html: `
        <h2>New ${type} Received</h2>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Contact Number:</strong> ${contactNumber}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    // Send auto-response to user
    const userEmailResponse = await resend.emails.send({
      from: "MOKMzansiBooks <onboarding@resend.dev>",
      to: [email],
      subject: "Thank you for contacting MOKMzansiBooks",
      html: `
        <h1>Thank you for contacting us, ${name}!</h1>
        <p>We have received your ${type.toLowerCase()} and will get back to you as soon as possible.</p>
        <p>Here's a copy of what you sent us:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
        <p>Best regards,<br>The MOKMzansiBooks Team</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          If you need immediate assistance, you can also contact us at:<br>
          Email: mokgethwamoabelo@gmail.com<br>
          WhatsApp: 064 550 4029
        </p>
      `,
    });

    console.log("Emails sent successfully:", { adminEmailResponse, userEmailResponse });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
