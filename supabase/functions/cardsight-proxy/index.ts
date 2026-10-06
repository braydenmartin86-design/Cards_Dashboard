import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Forwards requests from the dashboard to the CardSight AI API, keeping the CardSight key
// server-side. Two request shapes are accepted:
//   - multipart/form-data with `file` (the photo) and `endpoint` = "/identify/card"
//   - JSON { endpoint, method: "GET", query: { ... } } for price searches and trends
//   - JSON { endpoint: "/ai/query", method: "POST", body: { ... } } for AI questions
// Only the endpoints in ALLOWED are forwarded, since anyone can call this function with the
// public anon key and it would otherwise relay any request on your CardSight account.

const CARDSIGHT_BASE = "https://api.cardsight.ai/v1";
const ALLOWED = [
  /^\/identify\/card$/, // backup card identification when Gemini is unavailable
  /^\/pricing\/search$/, // sold-listing search used by "Verify Price" and "Update comps"
  /^\/pricing\/[0-9a-f-]{36}\/timeseries$/i, // price trend for a card in My Cards / Pokémon
  /^\/ai\/query$/, // "Ask CardSight" on Home and Monthly Targets (POST)
];
const POST_ALLOWED = [/^\/ai\/query$/];

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
      const method = String(body.method || "GET").toUpperCase();

      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(body.query || {})) {
        if (v !== undefined && v !== null) qs.set(k, String(v));
      }
      const url = `${CARDSIGHT_BASE}${endpoint}${qs.toString() ? `?${qs}` : ""}`;
      if (method === "POST") {
        if (!POST_ALLOWED.some((re) => re.test(endpoint))) return json({ error: `POST not allowed for ${endpoint}` }, 400);
        upstream = await fetch(url, {
          method: "POST",
          headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
          body: JSON.stringify(body.body || {}),
        });
      } else if (method === "GET") {
        upstream = await fetch(url, { headers: { "X-API-Key": apiKey } });
      } else {
        return json({ error: `Unsupported method: ${method}` }, 400);
      }
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
