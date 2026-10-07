import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Looks up one eBay listing for the Buy Evaluator through eBay's official Browse API, so a
// pasted listing link can fill in the form. Request: JSON { url } (any eBay item link, including
// ebay.us short links). Reply: the listing's title, prices, bids, shipping and item specifics.
// Needs EBAY_CLIENT_ID and EBAY_CLIENT_SECRET (eBay developer "Production" keyset) in
// Supabase Secrets.

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

// Application tokens last about 2 hours; reuse one while this function instance is warm.
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAppToken(clientId: string, clientSecret: string): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;
  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({ grant_type: "client_credentials", scope: "https://api.ebay.com/oauth/api_scope" }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`eBay sign-in failed: ${data.error_description || data.error || res.status}. Check EBAY_CLIENT_ID / EBAY_CLIENT_SECRET.`);
  }
  cachedToken = { token: data.access_token, expiresAt: Date.now() + Number(data.expires_in || 7200) * 1000 };
  return cachedToken.token;
}

// Only eBay links are followed, so this can't be used to fetch arbitrary sites.
const EBAY_HOST = /(^|\.)ebay\.(com|com\.au|co\.uk|ca|de|fr|it|es|ie|at|ch|nl|be|pl|com\.hk|com\.sg|com\.my|ph|in|us)$/i;

async function resolveItemId(raw: string): Promise<string | null> {
  const direct = (s: string) => {
    const m = s.match(/\/itm\/(?:[^/?#]*\/)?(\d{9,15})/) || s.match(/[?&](?:item|itemId|nid)=(\d{9,15})/i);
    return m ? m[1] : null;
  };
  const text = raw.trim();
  if (/^\d{9,15}$/.test(text)) return text;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (!EBAY_HOST.test(url.hostname)) return null;
  const id = direct(url.href);
  if (id) return id;
  // Short links (ebay.us/xxxx) and share links redirect to the item page.
  let next = url.href;
  for (let i = 0; i < 5; i++) {
    const res = await fetch(next, { redirect: "manual" });
    const location = res.headers.get("location");
    await res.body?.cancel();
    if (!location) break;
    next = new URL(location, next).href;
    const found = direct(next);
    if (found) return found;
    if (!EBAY_HOST.test(new URL(next).hostname)) break;
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const clientId = Deno.env.get("EBAY_CLIENT_ID");
    const clientSecret = Deno.env.get("EBAY_CLIENT_SECRET");
    if (!clientId || !clientSecret) {
      return json({ error: "EBAY_CLIENT_ID / EBAY_CLIENT_SECRET are missing in Supabase Secrets." }, 500);
    }

    const { url } = await req.json();
    const itemId = await resolveItemId(String(url || ""));
    if (!itemId) return json({ error: "That doesn't look like an eBay listing link." }, 400);

    const token = await getAppToken(clientId, clientSecret);
    const res = await fetch(`https://api.ebay.com/buy/browse/v1/item/get_item_by_legacy_id?legacy_item_id=${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        // Prices in AUD where eBay can convert, and shipping costed to Australia.
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_AU",
        "X-EBAY-C-ENDUSERCTX": "contextualLocation=country=AU",
      },
    });
    const item = await res.json();
    if (!res.ok) {
      const e = (item.errors || [])[0] || {};
      const msg =
        e.errorId === 11006
          ? "This listing has several variations (multi-card listing) — add it by hand."
          : e.errorId === 11001 || res.status === 404
          ? "eBay couldn't find that listing — it may have ended or been removed."
          : e.longMessage || e.message || `eBay returned status ${res.status}`;
      return json({ error: msg }, res.status === 404 ? 404 : 400);
    }

    const ship = (item.shippingOptions || [])[0];
    return json({
      itemId,
      title: item.title,
      url: item.itemWebUrl,
      image: item.image && item.image.imageUrl,
      buyingOptions: item.buyingOptions || [],
      price: item.price || null,
      currentBidPrice: item.currentBidPrice || null,
      bidCount: item.bidCount ?? null,
      endDate: item.itemEndDate || null,
      shippingCost: ship && ship.shippingCost ? ship.shippingCost : null,
      condition: item.condition || null,
      conditionDescriptors: (item.conditionDescriptors || []).map((d: { name: string; values?: { content: string }[] }) => ({
        name: d.name,
        value: (d.values || []).map((v) => v.content).join(", "),
      })),
      aspects: (item.localizedAspects || []).map((a: { name: string; value: string }) => ({ name: a.name, value: a.value })),
      seller: item.seller && item.seller.username,
    });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
