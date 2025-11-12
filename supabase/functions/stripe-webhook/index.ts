import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response("No signature or webhook secret", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    console.log("Webhook event received:", event.type);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const contributionId = session.metadata?.contribution_id;
      const eventId = session.metadata?.event_id;
      const organizerAmount = parseInt(session.metadata?.organizer_amount || "0");

      console.log("Processing completed checkout:", {
        contributionId,
        eventId,
        organizerAmount,
        paymentIntent: session.payment_intent,
      });

      if (contributionId && eventId) {
        // Update contribution status to succeeded
        const { error: updateError } = await supabaseClient
          .from("contributions")
          .update({
            status: "succeeded",
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .eq("id", contributionId);

        if (updateError) {
          console.error("Error updating contribution:", updateError);
        } else {
          console.log("Contribution updated successfully");
        }

        // Update event's current_amount (add the full amount before fees)
        const { data: contribution } = await supabaseClient
          .from("contributions")
          .select("amount")
          .eq("id", contributionId)
          .single();

        if (contribution) {
          const { data: currentEvent } = await supabaseClient
            .from("events")
            .select("current_amount")
            .eq("id", eventId)
            .single();

          if (currentEvent) {
            const newAmount = currentEvent.current_amount + contribution.amount;
            const { error: eventUpdateError } = await supabaseClient
              .from("events")
              .update({ current_amount: newAmount })
              .eq("id", eventId);

            if (eventUpdateError) {
              console.error("Error updating event amount:", eventUpdateError);
            } else {
              console.log(`Event amount updated to ${newAmount}`);
            }
          }
        }
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Update contribution status to failed
      const { error: updateError } = await supabaseClient
        .from("contributions")
        .update({ status: "failed" })
        .eq("stripe_payment_intent_id", paymentIntent.id);

      if (updateError) {
        console.error("Error updating failed contribution:", updateError);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});