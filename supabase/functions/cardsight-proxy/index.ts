import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Forwards requests from the dashboard to the CardSight AI API, keeping the CardSight key
// server-side. Two request shapes are accepted:
//   - multipart/form-data with `file` (the photo) and `endpoint` = "/identify/card"
//   - JSON { endpoint: "/pricing/search", method: "GET", query: { ... } }
// Only the endpoints in ALLOWED are forwarded, since anyone can call this function with the
// public anon key and it would otherwise relay any request on your CardSight account.

const CARDSIGHT_BASE = "https://api.cardsight.ai/v1";
const ALLOWED = [
  /^\/identify\/card$/, // backup card identification when Gemini is unavailable
  /^\/pricing\/search$/, // sold-listing search used by "Verify Price"
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("CARDSIGHT_API_KEY");
    if (!apiKey) {
      return json({ error: "CARDSIGHT_API_KEY is missing in Supabase Secrets." }, 500);
    }

    const contentType = req.headers.get("content-type") || "";
    let endpoint = "";
    let upstream: Response;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      endpoint = String(form.get("endpoint") || "/identify/card");
      if (!ALLOWED.some((re) => re.test(endpoint))) return json({ error: `Endpoint not allowed: ${endpoint}` }, 400);
      const file = form.get("file") || form.get("image");
      if (!(file instanceof File)) return json({ error: "No image file was sent." }, 400);

      const out = new FormData();
      out.append("image", file, file.name || "card.jpg");
      upstream = await fetch(`${CARDSIGHT_BASE}${endpoint}`, {
        method: "POST",
        headers: { "X-API-Key": apiKey },
        body: out,
      });
    } else {
      const body = await req.json();
      endpoint = String(body.endpoint || "");
      if (!ALLOWED.some((re) => re.test(endpoint))) return json({ error: `Endpoint not allowed: ${endpoint}` }, 400);
      if ((body.method || "GET").toUpperCase() !== "GET") return json({ error: "Only GET is supported for JSON requests." }, 400);

      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(body.query || {})) {
        if (v !== undefined && v !== null) qs.set(k, String(v));
      }
      const url = `${CARDSIGHT_BASE}${endpoint}${qs.toString() ? `?${qs}` : ""}`;
      upstream = await fetch(url, { headers: { "X-API-Key": apiKey } });
    }

    const text = await upstream.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text.slice(0, 500) || `CardSight returned status ${upstream.status}` };
    }
    // Pass CardSight's status through (e.g. 404 = card not found, 429 = rate limited).
    return json(data, upstream.status);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
