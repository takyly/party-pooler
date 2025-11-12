import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { eventId, contributorName, contributorEmail, amount } = await req.json();

    if (!eventId || !contributorName || !amount) {
      throw new Error("Missing required fields");
    }

    // Get event details
    const { data: event, error: eventError } = await supabaseClient
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      throw new Error("Event not found");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create a pending contribution record
    const { data: contribution, error: contributionError } = await supabaseClient
      .from("contributions")
      .insert([
        {
          event_id: eventId,
          contributor_name: contributorName,
          contributor_email: contributorEmail || null,
          amount: amount,
          stripe_payment_intent_id: "pending_" + crypto.randomUUID(),
          status: "pending",
        },
      ])
      .select()
      .single();

    if (contributionError) {
      console.error("Error creating contribution:", contributionError);
      throw contributionError;
    }

    // Calculate amounts (10% fee, 90% to organizer)
    const platformFee = Math.round(amount * 0.1);
    const organizerAmount = amount - platformFee;

    console.log(`Amount breakdown - Total: ${amount}, Platform fee: ${platformFee}, Organizer: ${organizerAmount}`);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: {
              name: `Contribution to ${event.title}`,
              description: `Gift pool organized by ${event.organizer_name}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/event/${event.slug}?success=true`,
      cancel_url: `${req.headers.get("origin")}/event/${event.slug}?canceled=true`,
      metadata: {
        contribution_id: contribution.id,
        event_id: eventId,
        platform_fee: platformFee.toString(),
        organizer_amount: organizerAmount.toString(),
      },
    });

    // Update contribution with actual payment intent ID from session
    await supabaseClient
      .from("contributions")
      .update({
        stripe_payment_intent_id: session.payment_intent as string || session.id,
      })
      .eq("id", contribution.id);

    console.log("Checkout session created:", session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-contribution-checkout:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});