import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Forwards Pokémon price lookups from the dashboard to PokemonPriceTracker's API, keeping the
// key server-side. Request: JSON { path: "/cards" | "/population", query: { ... } }.
// Reply: PokemonPriceTracker's JSON plus `_meta` with the daily credits left.
// Needs POKEMON_PRICE_TRACKER_API_KEY in Supabase Secrets.

const BASE = "https://www.pokemonpricetracker.com/api/v2";
// Only read endpoints the app uses, since anyone with the public anon key can call this.
const ALLOWED = ["/cards", "/population"];

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
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("POKEMON_PRICE_TRACKER_API_KEY");
    if (!apiKey) return json({ error: "POKEMON_PRICE_TRACKER_API_KEY is missing in Supabase Secrets." }, 500);

    const { path, query } = await req.json();
    if (!ALLOWED.includes(String(path))) return json({ error: `Endpoint not allowed: ${path}` }, 400);

    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query || {})) {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    }
    const upstream = await fetch(`${BASE}${path}?${qs}`, { headers: { Authorization: `Bearer ${apiKey}` } });
    const text = await upstream.text();
    let data: Record<string, unknown>;
    try {
      const parsed = JSON.parse(text);
      data = Array.isArray(parsed) ? { data: parsed } : parsed;
    } catch {
      data = { error: text.slice(0, 500) || `PokemonPriceTracker returned status ${upstream.status}` };
    }
    data._meta = {
      status: upstream.status,
      creditsUsed: upstream.headers.get("X-API-Calls-Consumed"),
      dailyRemaining: upstream.headers.get("X-RateLimit-Daily-Remaining"),
    };
    return json(data, upstream.status);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
