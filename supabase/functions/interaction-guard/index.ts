
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
    const { letterId, action, emoji } = await req.json();

    // Minimal parameter check only
    if (!letterId || !["comment", "reaction", "like"].includes(action)) {
      console.log("[interaction-guard] Invalid params", { ip, letterId, action, emoji });
      return new Response(JSON.stringify({ error: "Invalid params" }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    // For reactions, require emoji param
    if (action === "reaction" && (!emoji || typeof emoji !== "string")) {
      console.log("[interaction-guard] REACTION MISSING EMOJI", { ip, letterId });
      return new Response(JSON.stringify({ error: "Missing emoji for reaction" }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    // Log EVERY interaction without any spam/block checks
    const logInsert: Record<string, any> = {
      ip,
      letter_id: letterId,
      action,
    };
    if (action === "reaction" && emoji) logInsert.emoji = emoji;

    await supabase.from("anon_interaction_logs").insert(logInsert);

    console.log("[interaction-guard] ALL INTERACTIONS ALLOWED", { ip, letterId, action, emoji });
    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders, status: 200 });
  } catch (e) {
    console.log("[interaction-guard] ERROR", { message: e.message, stack: e.stack });
    return new Response(JSON.stringify({ error: e.message }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});
