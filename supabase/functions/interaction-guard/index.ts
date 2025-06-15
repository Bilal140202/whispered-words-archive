
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ??
      req.headers.get("x-real-ip") ??
      "unknown";
    let letterId, action, emoji;
    try {
      const body = await req.json();
      letterId = body.letterId;
      action = body.action;
      emoji = body.emoji;
      console.log("[edge] Incoming req", { ip, body });
    } catch (parseErr) {
      console.log("[edge] Malformed JSON", { ip });
      return new Response(JSON.stringify({ error: "Malformed JSON body" }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    // Minimal parameter check only (log always)
    if (!letterId || !["comment", "reaction", "like"].includes(action)) {
      console.log("[edge] Invalid params", { ip, letterId, action, emoji });
      return new Response(JSON.stringify({ error: "Invalid params" }), {
        headers: corsHeaders,
        status: 400,
      });
    }
    if (action === "reaction" && (!emoji || typeof emoji !== "string")) {
      console.log("[edge] REACTION MISSING EMOJI", { ip, letterId });
      return new Response(JSON.stringify({ error: "Missing emoji for reaction" }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    // Log EVERY interaction
    const logInsert: Record<string, any> = {
      ip,
      letter_id: letterId,
      action,
    };
    if (action === "reaction" && emoji) logInsert.emoji = emoji;

    const { error: logError } = await supabase.from("anon_interaction_logs").insert(logInsert);

    if (logError) {
      console.log("[edge] DB INSERT ERROR", { ip, letterId, action, emoji, logError });
      return new Response(JSON.stringify({ error: "DB insert failed", logError }), {
        headers: corsHeaders,
        status: 500,
      });
    }

    console.log("[edge] ALLOWED", { ip, letterId, action, emoji });
    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders, status: 200 });
  } catch (e) {
    console.log("[edge] ERROR", { message: e.message, stack: e.stack });
    return new Response(JSON.stringify({ error: String(e) }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});
