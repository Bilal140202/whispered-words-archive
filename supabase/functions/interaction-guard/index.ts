
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

    // --- SPAM PROTECTION AND UNDO LOGIC START ---

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
      // (continue normal comment process – only allow one)
    }

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
      // (continue normal like process – only allow one)
    }

    if (action === "reaction") {
      // UNDO LOGIC: Check if a reaction log exists for this IP+letter+emoji
      let { data: logs, count, error } = await supabase
        .from("anon_interaction_logs")
        .select("*", { count: "exact" })
        .eq("ip", ip)
        .eq("letter_id", letterId)
        .eq("action", "reaction")
        .eq("emoji", emoji);

      if (error) {
        console.log("[edge] REACTION check error", { ip, letterId, emoji, error });
        return new Response(JSON.stringify({ error: "Failed to check reaction quota." }), {
          headers: corsHeaders,
          status: 500,
        });
      }

      if ((count ?? 0) > 0) {
        // UNDO the reaction: delete from both anon_interaction_logs and letter_reactions *BY IP*
        const { error: delLogErr } = await supabase
          .from("anon_interaction_logs")
          .delete()
          .eq("ip", ip)
          .eq("letter_id", letterId)
          .eq("action", "reaction")
          .eq("emoji", emoji);
        const { error: delReactErr } = await supabase
          .from("letter_reactions")
          .delete()
          .eq("letter_id", letterId)
          .eq("emoji", emoji)
          .eq("ip", ip);

        if (delLogErr || delReactErr) {
          console.log("[edge] REACTION UNDO DELETE ERROR", { ip, letterId, emoji, delLogErr, delReactErr });
          return new Response(JSON.stringify({ error: "Failed to undo reaction" }), {
            headers: corsHeaders,
            status: 500,
          });
        }
        console.log("[edge] REACTION UNDO SUCCESS", { ip, letterId, emoji });
        return new Response(JSON.stringify({ ok: true, undone: true }), { headers: corsHeaders, status: 200 });
      }

      // otherwise check for any reaction for this post (other emojis, by same IP)
      let { count: anyReactionCount, error: anyReactionError } = await supabase
        .from("anon_interaction_logs")
        .select("*", { count: "exact", head: true })
        .eq("ip", ip)
        .eq("letter_id", letterId)
        .eq("action", "reaction");

      if (anyReactionError) {
        console.log("[edge] REACTION check error (any emoji)", { ip, letterId, anyReactionError });
        return new Response(JSON.stringify({ error: "Failed to check reaction quota." }), {
          headers: corsHeaders,
          status: 500,
        });
      }
      if ((anyReactionCount ?? 0) > 0) {
        console.log("[edge] DENIED: already reacted (other emoji)", { ip, letterId });
        return new Response(JSON.stringify({ reason: "You have already reacted to this letter." }), {
          headers: corsHeaders,
          status: 429,
        });
      }
      // (continue normal reaction insert)
    }

    // --- SPAM PROTECTION AND UNDO LOGIC END ---

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

    // Insert into letter_reactions (needs to include IP!)
    if (action === "reaction" && emoji) {
      // Ensure exactly 1 reaction per (letter, emoji, ip)
      const { error: reactionInsertError } = await supabase
        .from("letter_reactions")
        .insert({
          letter_id: letterId,
          emoji: emoji,
          ip: ip,
        });
      if (reactionInsertError) {
        // Race condition: already exists? Ignore for now, rely on logs
        console.log("[edge] ALREADY EXISTS or insert err (possibly fine)", { ip, letterId, emoji, reactionInsertError });
      }
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
