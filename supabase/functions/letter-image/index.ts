
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6"
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const url = new URL(req.url);
  const letterId = url.searchParams.get("letterId");
  if (!letterId) {
    return new Response(JSON.stringify({ error: "Missing letterId" }), { status: 400, headers: corsHeaders });
  }

  // Connect to Supabase
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );
  // Get letter info
  const { data, error } = await supabase
    .from("letters")
    .select("id,text,tag,created_at")
    .eq("id", letterId)
    .single();
  if (error || !data) {
    return new Response(JSON.stringify({ error: "Letter not found" }), { status: 404, headers: corsHeaders });
  }

  // Use Plaiceholder (or fallback) to generate an SVG/PNG in-memory
  const text = data.text.length > 180 ? data.text.slice(0, 180) + "…" : data.text;
  const tag = data.tag || "";
  const date = new Date(data.created_at).toLocaleDateString();

  // SVG template as a card
  const svg = `
    <svg width="540" height="320" viewBox="0 0 540 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="540" height="320" fill="#fff5fa" rx="30"/>
      <text x="32" y="60" font-size="32" fill="#EA4CA9" font-family="Shadows Into Light, cursive">${tag}</text>
      <foreignObject x="32" y="90" width="476" height="150">
        <body xmlns="http://www.w3.org/1999/xhtml">
          <div style="color:#222;font-size:22px;line-height:1.46;font-family:Inter,sans-serif;white-space:pre-line;word-break:break-word;">
            ${text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
          </div>
        </body>
      </foreignObject>
      <text x="32" y="270" font-size="18" fill="#ad8cca">Anonymous – ${date}</text>
      <rect x="18" y="18" width="504" height="284" fill="none" stroke="#FFA6D6" rx="28" />
      <text x="420" y="290" font-size="12" fill="#e6acd7">unsentletters.app</text>
    </svg>
  `;

  // Convert SVG to PNG (using Deno runtime for ease, or deliver as SVG)
  const image = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

  return new Response(JSON.stringify({ image }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
});
