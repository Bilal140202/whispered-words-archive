
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

    // Basic param check only (log always)
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

    // --- SPAM PROTECTION LOGIC START ---

    // Only allow one comment per (ip, letter_id)
    if (action === "comment") {
      let { count, error } = await supabase
        .from("anon_interaction_logs")
        .select("*", { count: "exact", head: true })
        .eq("ip", ip)
        .eq("letter_id", letterId)
        .eq("action", "comment");

      if (error) {
        console.log("[edge] COMMENT check error", { ip, letterId, error });
        return new Response(JSON.stringify({ error: "Failed to check comment quota." }), {
          headers: corsHeaders,
          status: 500,
        });
      }
      if ((count ?? 0) > 0) {
        console.log("[edge] DENIED: already commented", { ip, letterId });
        return new Response(JSON.stringify({ reason: "You have already commented on this letter." }), {
          headers: corsHeaders,
          status: 429,
        });
      }
    }

    // Only allow one like per (ip, letter_id)
    if (action === "like") {
      let { count, error } = await supabase
        .from("anon_interaction_logs")
        .select("*", { count: "exact", head: true })
        .eq("ip", ip)
        .eq("letter_id", letterId)
        .eq("action", "like");

      if (error) {
        console.log("[edge] LIKE check error", { ip, letterId, error });
        return new Response(JSON.stringify({ error: "Failed to check like quota." }), {
          headers: corsHeaders,
          status: 500,
        });
      }
      if ((count ?? 0) > 0) {
        console.log("[edge] DENIED: already liked", { ip, letterId });
        return new Response(JSON.stringify({ reason: "You have already liked this letter." }), {
          headers: corsHeaders,
          status: 429,
        });
      }
    }

    // Only allow one reaction per (ip, letter_id)
    if (action === "reaction") {
      let { count, error } = await supabase
        .from("anon_interaction_logs")
        .select("*", { count: "exact", head: true })
        .eq("ip", ip)
        .eq("letter_id", letterId)
        .eq("action", "reaction");

      if (error) {
        console.log("[edge] REACTION check error", { ip, letterId, error });
        return new Response(JSON.stringify({ error: "Failed to check reaction quota." }), {
          headers: corsHeaders,
          status: 500,
        });
      }
      if ((count ?? 0) > 0) {
        console.log("[edge] DENIED: already reacted (any emoji)", { ip, letterId });
        return new Response(JSON.stringify({ reason: "You have already reacted to this letter." }), {
          headers: corsHeaders,
          status: 429,
        });
      }
    }

    // --- SPAM PROTECTION LOGIC END ---

    // Log EVERY allowed interaction
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
