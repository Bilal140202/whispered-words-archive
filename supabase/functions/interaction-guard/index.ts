
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
    const { letterId, action } = await req.json();

    if (!letterId || !["comment", "reaction", "like"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid params" }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    // 1. Check blocklist
    const { data: blocked } = await supabase
      .from("blocked_ips")
      .select("*")
      .eq("ip", ip)
      .maybeSingle();

    if (blocked) {
      return new Response(JSON.stringify({ blocked: true, reason: blocked.reason ?? "" }), {
        headers: corsHeaders,
        status: 429,
      });
    }

    // 2. Only one interaction of each type per letter per IP.
    const { count } = await supabase
      .from("anon_interaction_logs")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .eq("letter_id", letterId)
      .eq("action", action);

    if ((count ?? 0) > 0) {
      return new Response(JSON.stringify({ limited: true }), {
        headers: corsHeaders,
        status: 429,
      });
    }

    // 3. Rate limit: e.g., >10 of this action in 1 hour -> block
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: hourCount } = await supabase
      .from("anon_interaction_logs")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", since);

    if ((hourCount ?? 0) > 10) {
      // Block this IP for spam
      await supabase.from("blocked_ips").upsert(
        { ip, reason: "Rate limit exceeded" },
        { onConflict: "ip" }
      );
      return new Response(JSON.stringify({ blocked: true, reason: "Rate limited, try again later." }), {
        headers: corsHeaders,
        status: 429,
      });
    }

    // 4. Log this interaction
    await supabase.from("anon_interaction_logs").insert({
      ip,
      letter_id: letterId,
      action,
    });

    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders, status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});
