// Supabase client + Gemini / CardSight edge-function calls.

// Supabase URL and anon key are set once, in index.html.
let supabaseClient = null;
try {
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn("Supabase init fallback:", e);
}

// 1. Helper function for AI Content Generation
async function generateContentIdeasFromPortfolio(cards, currentIdeasCount = 4) {
  const sellNowCards = cards.filter(c => ["Sell PSA 10", "Sell PSA 9", "Sell Raw First"].includes(c.sellDecision));
  const topProfits = [...cards].sort((a, b) => (b.expectedListProfit || 0) - (a.expectedListProfit || 0)).slice(0, 5);
  
  const prompt = `
Generate ${currentIdeasCount} short, high-engagement social media content ideas for a sports card trader based on this portfolio data:
- Cards ready to sell now: ${sellNowCards.map(c => `${c.player} (${c.sport})`).join(", ") || "Various"}
- High profit cards: ${topProfits.map(c => `${c.player} (Est Profit:$${c.expectedListProfit})`).join(", ")}

Return ONLY a valid JSON array of objects with keys: "id" (unique string), "title", "angle", "suggestedCard".
`;

  try {
    const response = await callGeminiAi(prompt);
    const cleanJson = response.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("Failed to generate ideas:", err);
    return null;
  }
}

// ===== Dual-Engine API Configuration =====
const SUPABASE_URL = window.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
// ===== USD → AUD exchange rate =====
// CardSight prices are in US$. The live rate is fetched once a day (no API key needed) and
// cached in this browser; until it arrives — or if both sources are down — the last cached
// rate is used, and failing that the fixed fallback.
const USD_TO_AUD_FALLBACK = 1.44;
const EXCHANGE_RATE_CACHE_KEY = "cardflip_ev_usd_aud_v1";
const EXCHANGE_RATE_SOURCES = [
  { name: "European Central Bank (Frankfurter)", url: "https://api.frankfurter.dev/v1/latest?base=USD&symbols=AUD", read: (j) => j.rates && j.rates.AUD, date: (j) => j.date },
  { name: "open.er-api.com", url: "https://open.er-api.com/v6/latest/USD", read: (j) => j.rates && j.rates.AUD, date: (j) => j.time_last_update_unix && new Date(j.time_last_update_unix * 1000).toISOString().slice(0, 10) },
];

let exchangeRate = (() => {
  try {
    const cached = JSON.parse(localStorage.getItem(EXCHANGE_RATE_CACHE_KEY) || "null");
    if (cached && cached.rate > 1 && cached.rate < 2.5) return { ...cached, status: "cached" };
  } catch (e) {}
  return { rate: USD_TO_AUD_FALLBACK, date: null, source: "fixed fallback", status: "fallback" };
})();
const exchangeRateListeners = new Set();

function currentUsdToAudRate() {
  return exchangeRate.rate;
}

function onExchangeRateChange(listener) {
  exchangeRateListeners.add(listener);
  return () => exchangeRateListeners.delete(listener);
}

async function loadLiveExchangeRate() {
  const today = new Date().toISOString().slice(0, 10);
  if (exchangeRate.status === "cached" && exchangeRate.fetchedOn === today) {
    exchangeRate = { ...exchangeRate, status: "live" };
    exchangeRateListeners.forEach((l) => l(exchangeRate));
    return;
  }
  for (const source of EXCHANGE_RATE_SOURCES) {
    try {
      const res = await fetch(source.url);
      if (!res.ok) continue;
      const json = await res.json();
      const rate = Number(source.read(json));
      if (!(rate > 1 && rate < 2.5)) continue;
      exchangeRate = { rate, date: source.date(json) || today, source: source.name, fetchedOn: today, status: "live" };
      try {
        localStorage.setItem(EXCHANGE_RATE_CACHE_KEY, JSON.stringify(exchangeRate));
      } catch (e) {}
      exchangeRateListeners.forEach((l) => l(exchangeRate));
      return;
    } catch (e) {
      console.warn(`Exchange rate from ${source.name} unavailable:`, e.message || e);
    }
  }
}
loadLiveExchangeRate();

// Central Currency Converter
function convertUsdToAud(usdAmount) {
  if (usdAmount == null || isNaN(usdAmount)) return null;
  return Math.round(Number(usdAmount) * currentUsdToAudRate() * 100) / 100;
}

// Reliable Client-Side Image Compression (Keeps payloads under 300KB to prevent Supabase 413 errors)
function compressImageForApi(base64Image, maxDimension = 900, quality = 0.65) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      const src = base64Image.includes(",") ? base64Image : `data:image/jpeg;base64,${base64Image}`;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        // Fill background white in case image has transparency
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };

      img.onerror = (err) => {
        console.warn("Compression image load failed, using raw fallback:", err);
        resolve(base64Image);
      };

      img.src = src;
    } catch (e) {
      console.warn("Canvas compression exception, using raw fallback:", e);
      resolve(base64Image);
    }
  });
}

// Convert Base64 data string to a binary Blob
function base64ToBlob(base64Data, mimeType = "image/jpeg") {
  const cleanBase64 = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
  const byteCharacters = atob(cleanBase64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}

async function callDualEngineIdentify(base64Image, mediaType = "image/jpeg", fallbackPrompt = "") {
  // 1. Primary Engine: Gemini AI (Fast, accurate OCR reading for single cards & lot photos)
  try {
    const compressedForGemini = await compressImageForApi(base64Image, 1000, 0.70);
    const cleanGeminiBase64 = compressedForGemini.includes(",") ? compressedForGemini.split(",")[1] : compressedForGemini;

    const rawGeminiText = await callGeminiAi(fallbackPrompt || LOT_SCANNER_PROMPT, cleanGeminiBase64, mediaType);
    let parsedGemini = [];

    try {
      const cleanJson = String(rawGeminiText).replaceAll("```json", "").replaceAll("```", "").trim();
      parsedGemini = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Gemini primary parsing error:", e);
    }

    const cardsArray = Array.isArray(parsedGemini) ? parsedGemini : [parsedGemini];

    // Ensure valid cards were extracted
    const validCards = cardsArray.filter(c => c && (c.player_name || c.player || c.title));
    if (validCards.length > 0) {
      return { 
        source: "Gemini AI", 
        cards: validCards.map(c => ({
          player_name: c.player_name || c.player || c.title || "Unknown Card",
          printed_name: c.printed_name || null,
          sport: c.sport || "NBA",
          year: c.year || "",
          set_name: c.set_name || c.set || "",
          card_number: c.card_number || c.cardNumber || "",
          parallel_or_variant: c.parallel_or_variant || c.parallel || "Base",
          is_graded: Boolean(c.is_graded || c.grade),
          grade: c.grade || null,
          grading_company: c.grading_company || (c.grade ? String(c.grade).split(" ")[0] : null),
          ebay_search_query: c.ebay_search_query || `${c.player_name || c.player || ''} ${c.set_name || c.set || ''}`,
          estimated_value_aud: c.estimated_value_aud || convertUsdToAud(c.estimated_value || c.price),
          value_confidence: "High"
        }))
      };
    }
    throw new Error("Gemini returned no valid card details.");
  } catch (geminiErr) {
    console.warn("Gemini AI Primary scan failed/timed out. Switching to CardSight AI Backup...", geminiErr);

    // 2. Secondary Engine Backup: CardSight Proxy
    try {
      const anonKey = window.SUPABASE_ANON_KEY;
      const compressedDataUrl = await compressImageForApi(base64Image, 1200, 0.85);
      const imageBlob = base64ToBlob(compressedDataUrl, "image/jpeg");

      const formData = new FormData();
      formData.append("file", imageBlob, "scan.jpg");
      formData.append("endpoint", "/identify/card");

      const response = await fetch(`${SUPABASE_URL}/functions/v1/cardsight-proxy`, {
        method: "POST",
        headers: {
          "apikey": anonKey,
          "Authorization": `Bearer ${anonKey}`,
        },
        body: formData,
      });

      const wrapper = await response.json();
      const data = wrapper.raw || wrapper;

      function findCardObject(obj) {
        if (!obj || typeof obj !== "object") return null;
        const playerCandidate = obj.player_name || obj.player || obj.name || obj.title || null;
        const set = obj.set_name || obj.set || null;
        const price = obj.estimated_value || obj.market_price || obj.price || null;

        if (playerCandidate && !["PSA", "BGS", "SGC"].includes(String(playerCandidate).toUpperCase())) {
          return {
            player_name: playerCandidate,
            sport: obj.sport || "NBA",
            year: obj.year || "",
            set_name: set || "",
            card_number: obj.card_number || "",
            parallel_or_variant: obj.parallel || "Base",
            is_graded: Boolean(obj.grade),
            grade: obj.grade || null,
            grading_company: obj.grading_company || null,
            ebay_search_query: `${playerCandidate} ${set || ''}`.trim(),
            estimated_value_aud: convertUsdToAud(price),
            value_confidence: "High",
          };
        }

        for (const key of Object.keys(obj)) {
          if (typeof obj[key] === "object" && obj[key] !== null) {
            const res = findCardObject(obj[key]);
            if (res) return res;
          }
        }
        return null;
      }

      const backupCard = findCardObject(data);
      if (backupCard) {
        return { source: "CardSight AI (Backup)", cards: [backupCard] };
      }
      throw new Error("CardSight backup also returned no card details.");
    } catch (cardSightErr) {
      console.error("Both engines failed to identify the card photo:", cardSightErr);
      throw new Error("Rate limit reached or clear card features not detected. Please wait 10 seconds and try again.");
    }
  }
}

// ===== CardSight price verification =====
// Gemini identifies the card from the photo (player, year, set, number, parallel, grade). That
// text is searched against CardSight's sold-listing data (/pricing/search) — no image goes to
// CardSight. Only completed auctions that clearly match the same card are kept, and the market
// value is the average of the 3 most recent sales, or the most recent sale if fewer exist.

// ===== eBay listing lookup =====
// A pasted eBay link → the listing's details, via the `ebay-item` Supabase function (eBay's
// official Browse API). Doesn't use any CardSight calls.
async function fetchEbayListing(url) {
  const anonKey = window.SUPABASE_ANON_KEY;
  let response;
  try {
    response = await fetch(`${SUPABASE_URL}/functions/v1/ebay-item`, {
      method: "POST",
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch (e) {
    // A function that doesn't exist yet fails the browser's CORS check, which surfaces as a
    // bare network error.
    throw new Error("Couldn't reach the eBay lookup. If you haven't deployed the ebay-item function in Supabase yet, do that first; otherwise check your connection.");
  }
  let data = null;
  try {
    data = await response.json();
  } catch (e) {}
  if (response.status === 404 && !(data && data.error)) {
    throw new Error("The eBay lookup isn't set up yet — deploy the ebay-item function in Supabase.");
  }
  if (!response.ok || !data || data.error) throw new Error((data && data.error) || `eBay lookup failed (status ${response.status}).`);
  return data;
}

// ===== Pokémon prices (PokemonPriceTracker) =====
// Raw market price (TCGplayer), eBay graded averages (PSA 9 / PSA 10…) and PSA gem rates for
// Pokémon cards, via the `pokemon-prices` Supabase function. The free plan has 100 credits a
// day (1 per card returned, +1 for eBay data), so: search the card's set for its name (no eBay
// data), pick the exact card by number, then fetch just that card with eBay data. The card's ID
// is remembered so later checks skip the search. Answers are reused for 7 days.
const PPT_CACHE_KEY = "cardflip_ev_ppt_cache_v1";
const PPT_CACHE_DAYS = 7;
let pptCreditsLeft = null;

async function pptGet(path, query, maxAgeDays = PPT_CACHE_DAYS) {
  const key = `${path}?${Object.keys(query).sort().map((k) => `${k}=${query[k]}`).join("&")}`;
  let cache = {};
  try {
    cache = JSON.parse(localStorage.getItem(PPT_CACHE_KEY) || "{}");
  } catch (e) {}
  const hit = cache[key];
  if (hit && (Date.now() - hit.t) / 86400000 < maxAgeDays) return { ...hit.data, _fromCache: true };

  const anonKey = window.SUPABASE_ANON_KEY;
  let response;
  try {
    response = await fetch(`${SUPABASE_URL}/functions/v1/pokemon-prices`, {
      method: "POST",
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ path, query }),
    });
  } catch (e) {
    throw new Error("Couldn't reach the Pokémon price lookup. If you haven't deployed the pokemon-prices function in Supabase yet, do that first.");
  }
  let data = null;
  try {
    data = await response.json();
  } catch (e) {}
  if (data && data._meta && data._meta.dailyRemaining != null) pptCreditsLeft = Number(data._meta.dailyRemaining);
  if (!response.ok || !data || (data.error && !data.data)) {
    const msg = (data && (data.error || data.message)) || `status ${response.status}`;
    if (response.status === 429 || /limit|credits/i.test(String(msg))) throw new Error("PokemonPriceTracker's 100 free daily credits are used up — try again tomorrow.");
    throw new Error(`PokemonPriceTracker: ${msg}`);
  }
  cache[key] = { t: Date.now(), data };
  const entries = Object.entries(cache).sort((a, b) => b[1].t - a[1].t).slice(0, 40);
  try {
    localStorage.setItem(PPT_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch (e) {}
  return data;
}

// The list of cards in a reply, whatever it's wrapped in.
function pptCards(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (data.data && typeof data.data === "object") return [data.data];
  if (Array.isArray(data.cards)) return data.cards;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

function pptNum(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Finds a grade's average price (and sale count) anywhere in the card's eBay / graded data:
// e.g. ebay.psa10.avg, gradedPrices.psa10, ebay.salesByGrade.psa10.averagePrice.
function pptGradeStats(card, grade) {
  const wanted = normalizeCardText(grade).replace(/ /g, ""); // "psa10"
  let found = null;
  (function walk(obj, depth) {
    if (!obj || typeof obj !== "object" || depth > 5 || found) return;
    for (const [k, v] of Object.entries(obj)) {
      if (found) return;
      if (normalizeCardText(k).replace(/ /g, "") === wanted) {
        if (typeof v === "number" || typeof v === "string") found = { avg: pptNum(v), count: null };
        else if (v && typeof v === "object") {
          const avg = pptNum(v.avg ?? v.average ?? v.averagePrice ?? v.avgPrice ?? v.median ?? v.medianPrice ?? v.price ?? v.market);
          found = { avg, count: v.count ?? v.salesCount ?? v.sales ?? null };
        }
      } else if (v && typeof v === "object") walk(v, depth + 1);
    }
  })(card.ebay || card.gradedPrices || card.graded || card, 0);
  return found && found.avg ? found : null;
}

function pptCardInfo(c) {
  const prices = c.prices || {};
  const tcg = c.tcgplayer || prices.tcgplayer || {};
  return {
    id: c.tcgPlayerId ?? c.tcgplayerId ?? c.id ?? null,
    name: c.name || c.cardName || "",
    number: String(c.number ?? c.cardNumber ?? c.card_number ?? ""),
    set: (c.set && (c.set.name || c.set)) || c.setName || c.set_name || "",
    rawUsd: pptNum(prices.market ?? tcg.market ?? prices.mid ?? tcg.mid ?? c.marketPrice),
    psa9: pptGradeStats(c, "PSA 9"),
    psa10: pptGradeStats(c, "PSA 10"),
  };
}

// details: { player_name, set_name, card_number, year, parallel_or_variant, pptId? }
async function fetchPokemonPrices(details) {
  const language = /japanese|\bjp\b/i.test(`${details.set_name} ${details.parallel_or_variant}`) ? "japanese" : "english";
  let id = details.pptId || null;
  let searched = null;
  if (!id) {
    const query = { search: details.player_name, limit: 10, language };
    if (details.set_name) query.set = details.set_name;
    let data = await pptGet("/cards", query);
    let list = pptCards(data).map(pptCardInfo);
    if (!list.length && details.set_name) {
      // The set name may be worded differently; retry on the name alone.
      data = await pptGet("/cards", { search: `${details.player_name} ${details.set_name}`, limit: 10, language });
      list = pptCards(data).map(pptCardInfo);
    }
    const number = cardNumberKey(details.card_number);
    const match = number ? list.find((c) => cardNumberKey(c.number) === number) : list.length === 1 ? list[0] : null;
    if (!match) {
      return {
        matched: false,
        candidates: list.slice(0, 6),
        reason: !list.length ? "PokemonPriceTracker found no cards for that name and set." : number ? `None of the ${list.length} cards found has number ${details.card_number}.` : "Add the card # so the right card can be picked.",
      };
    }
    id = match.id;
    searched = match;
  }
  const full = pptCards(await pptGet("/cards", { tcgPlayerId: id, includeEbay: true, language }))[0];
  if (!full) throw new Error("PokemonPriceTracker returned no data for that card.");
  const info = pptCardInfo(full);
  let gem = null;
  try {
    const pop = await pptGet("/population", { tcgPlayerId: id }, 30);
    const p = (pptCards(pop)[0] || pop || {}).populationByGrader || (pop && pop.populationByGrader);
    if (p && p.PSA && p.PSA.gemRate != null) {
      const psa = p.PSA;
      gem = { rate: Number(psa.gemRate), graded: ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8", "g9", "g10"].reduce((s, g) => s + (Number(psa[g]) || 0), 0) || null };
    }
  } catch (e) {}
  return {
    matched: true,
    id,
    name: info.name || (searched && searched.name),
    number: info.number || (searched && searched.number),
    set: info.set || (searched && searched.set),
    rawAud: info.rawUsd != null ? convertUsdToAud(info.rawUsd) : null,
    psa9: info.psa9 ? { aud: convertUsdToAud(info.psa9.avg), count: info.psa9.count } : null,
    psa10: info.psa10 ? { aud: convertUsdToAud(info.psa10.avg), count: info.psa10.count } : null,
    gem,
    creditsLeft: pptCreditsLeft,
  };
}

// ===== CardSight quota =====
// When the account's monthly API calls run out, CardSight answers every request with an
// "account is inactive" error. Once that's seen, CardSight calls are paused (for this browser,
// until tomorrow or until "Check again") so bulk updates and target checks stop straight away
// instead of failing card by card.
const CARDSIGHT_QUOTA_KEY = "cardflip_ev_cardsight_quota_v1";
const CARDSIGHT_QUOTA_PATTERN = /inactive|run out of monthly|monthly api calls|quota|subscription/i;
const QUOTA_ERROR_CODE = "CARDSIGHT_QUOTA";

let cardSightQuota = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem(CARDSIGHT_QUOTA_KEY) || "null");
    if (saved && saved.date === new Date().toISOString().slice(0, 10)) return saved;
  } catch (e) {}
  return null;
})();
const cardSightQuotaListeners = new Set();

function onCardSightQuotaChange(listener) {
  cardSightQuotaListeners.add(listener);
  return () => cardSightQuotaListeners.delete(listener);
}

function setCardSightQuota(value) {
  cardSightQuota = value;
  try {
    if (value) localStorage.setItem(CARDSIGHT_QUOTA_KEY, JSON.stringify(value));
    else localStorage.removeItem(CARDSIGHT_QUOTA_KEY);
  } catch (e) {}
  cardSightQuotaListeners.forEach((l) => l(value));
}

function quotaError() {
  const err = new Error("CardSight's monthly API calls are used up, so CardSight lookups are paused until your quota resets.");
  err.code = QUOTA_ERROR_CODE;
  return err;
}

function isQuotaError(e) {
  return Boolean(e && e.code === QUOTA_ERROR_CODE);
}

// Clears the pause and makes one cheap call to see if the quota is back.
async function recheckCardSightQuota() {
  setCardSightQuota(null);
  try {
    await callCardSightProxy({ endpoint: "/pricing/search", method: "GET", query: { q: "Michael Jordan", limit: 1 } });
    return true;
  } catch (e) {
    return !isQuotaError(e);
  }
}

async function callCardSightProxy(body, attempt = 0) {
  if (cardSightQuota) throw quotaError();
  const anonKey = window.SUPABASE_ANON_KEY;
  const isForm = body instanceof FormData;
  const response = await fetch(`${SUPABASE_URL}/functions/v1/cardsight-proxy`, {
    method: "POST",
    headers: {
      "apikey": anonKey,
      "Authorization": `Bearer ${anonKey}`,
      ...(isForm ? {} : { "Content-Type": "application/json" }),
    },
    body: isForm ? body : JSON.stringify(body),
  });

  if (response.status === 429) {
    // CardSight is asking us to slow down: wait 2s, then 4s, before giving up.
    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
      return callCardSightProxy(body, attempt + 1);
    }
    throw new Error("CardSight's rate limit was reached. Please wait a few seconds before retrying.");
  }
  let wrapper = null;
  try {
    wrapper = await response.json();
  } catch (e) {}
  if (!response.ok) {
    const detail = wrapper && (wrapper.error || wrapper.message);
    if ((response.status === 402 || response.status === 403) && CARDSIGHT_QUOTA_PATTERN.test(String(detail || ""))) {
      setCardSightQuota({ date: new Date().toISOString().slice(0, 10), message: String(detail) });
      throw quotaError();
    }
    throw new Error(`CardSight returned status ${response.status}${detail ? `: ${detail}` : ""}`);
  }
  // Older proxy versions wrapped identify replies as { raw: ... }. Pricing replies have their
  // own `raw` section (raw-card sales), so only unwrap when it really is a wrapped identify reply.
  const data = (wrapper && wrapper.raw && wrapper.raw.detections ? wrapper.raw : wrapper) || {};
  if (data.error && !data.detections && !data.raw && !data.graded) throw new Error(String(data.error));
  return data;
}

function normalizeCardText(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

// The grade Gemini read off the slab, e.g. "PSA 10" -> { company: "PSA", value: "10" }.
function wantedGrade(card) {
  if (card.is_graded && card.grade) {
    const parts = String(card.grade).trim().split(/\s+/);
    const value = parts[parts.length - 1];
    const company = card.grading_company || (parts.length > 1 ? parts[0] : null);
    return { company, value };
  }
  return null;
}

// Market value from sold listings: average of the 5 most recent (or of however many exist).
const COMPS_TO_AVERAGE = 5;
function summarizeSales(sales, label, pricedAs, count = COMPS_TO_AVERAGE) {
  const used = sales.slice(0, count);
  const priceUsd = Math.round((used.reduce((s, r) => s + Number(r.price), 0) / used.length) * 100) / 100;
  const lastDate = new Date(used[0].date).toLocaleDateString();
  return {
    success: true,
    priceUsd,
    priceAud: convertUsdToAud(priceUsd),
    source: used.length === 1 ? `${label} · last sale ${lastDate}` : `${label} · avg of last ${used.length} sales`,
    confidence: "Sold comps",
    pricedAs,
    sales: used.map((r) => ({ date: r.date, priceUsd: Number(r.price), title: r.title, url: r.url })),
  };
}

// Sellers often list many copies of one card at once. CardSight doesn't say who sold what, so
// sales on the same day with near-identical titles are treated as one seller's batch, and only
// the first is counted.
function onePerSellerPerDay(sales) {
  const kept = [];
  for (const sale of sales) {
    const day = String(sale.date).slice(0, 10);
    const tokens = new Set(normalizeCardText(sale.title).split(" ").filter(Boolean));
    const sameBatch = kept.some((k) => {
      if (k.day !== day) return false;
      const shared = [...tokens].filter((t) => k.tokens.has(t)).length;
      return shared / (tokens.size + k.tokens.size - shared) >= 0.8;
    });
    if (!sameBatch) kept.push({ day, tokens, sale });
  }
  return kept.map((k) => k.sale);
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const AUTO_WORDS = /\b(auto|autos|autograph|autographs|autographed|au|signature|signatures|sig|signed|rpa)\b/;
const RELIC_WORDS = /\b(patch|patches|relic|relics|jersey|jerseys|jumbo|memorabilia|materials|swatch|swatches|game worn|player worn|rpa)\b/;
const JUNK_WORDS = /\b(lot|lots|bundle|reprint|reprints|rp|custom|facsimile|proxy)\b/;
const PARALLEL_WORDS = /\b(silver|gold|red|blue|green|orange|purple|pink|black|white|bronze|teal|aqua|yellow|holo|refractor|shimmer|wave|mojo|cracked ice|ice|disco|hyper|neon|pulsar|scope|velocity|tie dye|camo|sparkle|lazer|laser|foil|rainbow|xfractor|sapphire|ruby|emerald|variation|variations|ssp|short print|case hit)\b/;
// Product lines sold under the same brand as their parent set (e.g. "Topps Chrome Update" vs
// "Topps Chrome"). A listing naming one that the card's set doesn't is a different card.
const SUB_PRODUCT_WORDS = ["update", "sapphire", "cosmic", "black", "cactus jack", "draft picks", "platinum", "overtime", "logofractor"];
// Words that describe a card's general finish or rarity rather than naming a specific parallel,
// so they don't count as "extra" when matching a parallel.
const GENERIC_FINISH_WORDS = new Set(["refractor", "holo", "foil", "prizm", "variation", "variations", "ssp", "short print", "case hit"]);
const TEAM_COLOUR_NAMES =/\b(red sox|red wings|white sox|blue jays|blue jackets|green bay|golden state|black hawks)\b/g;
const SET_FILLER_WORDS =new Set(["panini", "nba", "nfl", "mlb", "basketball", "football", "baseball", "soccer", "trading", "card", "cards", "pokemon", "tcg", "english", "auto", "autograph", "rookie"]);
// Pokémon rarity words: sellers abbreviate them ("SIR", "Alt Art") or leave them out, so they
// don't count towards matching the set — the card number does that job.
const POKEMON_RARITY_WORDS = new Set(["special", "illustration", "rare", "alternate", "alt", "art", "full", "secret", "ultra", "hyper", "holo", "promo", "double", "sir", "ir"]);
const FOREIGN_LANGUAGE_WORDS = /\b(japanese|japan|jp|jpn|chinese|korean|kor|german|french|italian|spanish|portuguese|thai|indonesian)\b/;

function isPokemonCard(card) {
  return /pok[eé]mon/i.test(String(card.sport || ""));
}

// "#223/197" -> "223", "032" -> "32", "#FP-GWI" -> "fp gwi". Pokémon numbers carry the set size
// after the slash, which sellers often leave off.
function cardNumberKey(s) {
  const n = normalizeCardText(String(s || "").replace(/^\s*#/, "").replace(/\s*\/\s*\d+\s*$/, ""));
  return /^\d+$/.test(n) ? String(Number(n)) : n;
}

// What to match listings against, from the details Gemini read off the card.
function cardProfile(card) {
  // Gemini sometimes describes base cards as "Rookie Card Base" — that isn't a parallel name.
  const variant = normalizeCardText(card.parallel_or_variant)
    .replace(/\b(rookie card|rookie|rc|base card|base|card|parallel|variant)\b/g, " ")
    .replace(/\b\d+\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const describing = normalizeCardText([card.set_name, card.parallel_or_variant].join(" "));
  const printRun = (String(card.parallel_or_variant || "").match(/\/\s*(\d{1,4})\b/) || [])[1] || "";
  const pokemon = isPokemonCard(card);
  return {
    pokemon,
    printRun,
    describing,
    grade: wantedGrade(card),
    variant,
    // A serial-numbered card with no parallel name still isn't a base card.
    isBase: !variant && !printRun,
    variantTokens: variant.split(" ").filter((t) => t.length > 2),
    nameTokens: normalizeCardText(card.player_name).split(" ").filter((t) => t.length > 1),
    setTokens: normalizeCardText(card.set_name)
      .split(" ")
      .filter((t) => t.length > 2 && !/^\d+$/.test(t) && !SET_FILLER_WORDS.has(t) && !(pokemon && POKEMON_RARITY_WORDS.has(t))),
    number: cardNumberKey(card.card_number),
    year: String(card.year || "").slice(0, 4),
    isAuto: AUTO_WORDS.test(describing),
    isRelic: RELIC_WORDS.test(describing),
  };
}

// Search queries. CardSight's title search only returns listings containing every word, and at
// most 100 of them ranked by relevance. So several searches run together and their results are
// merged: narrow ones (adding the grade or parallel words) surface the exact card when a broad
// search's top 100 is crowded out by other versions, while the broad one catches sellers who
// worded the grade or parallel differently. The strict filter then decides what counts.
// `fallback` runs only if nothing matched (e.g. Gemini's year is off by a season).
function cardSearchQueries(card) {
  const p = cardProfile(card);
  const join = (parts) => parts.join(" ").replace(/\s+/g, " ").trim();
  // "RC"/"Rookie" are often left out of titles, and every query word has to appear.
  const setText = String(card.set_name || "").replace(/\b(rc|rookie cards?|rookie)\b/gi, " ");
  const base = join([p.year, setText, card.player_name]);
  const primary = [base];
  if (p.grade) primary.unshift(join([base, p.grade.company, p.grade.value]));
  // As printed ("FP-GWI"), minus a Pokémon set size ("/197").
  const numberText = String(card.card_number || "").replace(/^\s*#/, "").replace(/\s*\/\s*\d+\s*$/, "").trim();
  if (p.number) primary.unshift(join([base, `#${numberText}`]));
  if (!p.isBase) primary.unshift(join([base, p.variant]));
  // Pokémon titles rarely spell out the rarity, so also search by name and number alone.
  if (p.pokemon && p.number) primary.push(join([card.player_name, numberText]));
  const label = join([base, p.number ? `#${p.number}` : "", p.variant, p.grade ? `${p.grade.company || ""} ${p.grade.value}` : "Raw"]);
  return { primary: [...new Set(primary)], fallback: join([setText, card.player_name]), label };
}

// ===== CardSight search cache =====
// Identical CardSight searches within a few days reuse the saved answer instead of spending
// another API call (e.g. verifying a lot, then updating comps on the same cards). Kept short-term
// and small, as CardSight's terms allow: only the fields the app uses, at most 40 searches, in
// this browser only.
const CARDSIGHT_CACHE_KEY = "cardflip_ev_cardsight_cache_v1";
const CARDSIGHT_CACHE_DAYS = 7;
const CARDSIGHT_CACHE_MAX = 40;

function readCardSightCache() {
  try {
    return JSON.parse(localStorage.getItem(CARDSIGHT_CACHE_KEY) || "{}");
  } catch (e) {
    return {};
  }
}

function writeCardSightCache(cache) {
  let entries = Object.entries(cache).sort((a, b) => b[1].t - a[1].t).slice(0, CARDSIGHT_CACHE_MAX);
  // If browser storage is full, keep dropping the oldest searches until it fits.
  while (entries.length) {
    try {
      localStorage.setItem(CARDSIGHT_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
      return;
    } catch (e) {
      entries = entries.slice(0, Math.floor(entries.length / 2));
    }
  }
}

// Just the fields the comp matching uses, to keep the cache small.
function slimPricingResults(data) {
  return {
    results: (data.results || []).map((r) => ({
      title: r.title,
      price: r.price,
      date: r.date,
      listing_type: r.listing_type,
      url: r.url,
      parallel_id: r.parallel_id,
      parallel_name: r.parallel_name,
      matched_card: r.matched_card
        ? { card_id: r.matched_card.card_id, number: r.matched_card.number, set: r.matched_card.set && { year: r.matched_card.set.year, release: r.matched_card.set.release, name: r.matched_card.set.name } }
        : null,
      grade: r.grade ? { company_name: r.grade.company_name, grade_value: r.grade.grade_value, grade_id: r.grade.grade_id } : null,
    })),
  };
}

// A CardSight GET that reuses an identical request from the last `maxAgeDays` days.
// `stats` (optional) counts { fresh, cached, oldestCachedDays } for "reused" notes in the UI.
async function cardSightGetCached(endpoint, query, maxAgeDays = CARDSIGHT_CACHE_DAYS, stats) {
  const key = `${endpoint}?${Object.keys(query).sort().map((k) => `${k}=${query[k]}`).join("&")}`;
  const cache = readCardSightCache();
  const hit = cache[key];
  const ageDays = hit ? (Date.now() - hit.t) / 86400000 : Infinity;
  if (hit && ageDays < maxAgeDays) {
    if (stats) {
      stats.cached += 1;
      stats.oldestCachedDays = Math.max(stats.oldestCachedDays || 0, Math.floor(ageDays));
    }
    return hit.data;
  }
  const data = await callCardSightProxy({ endpoint, method: "GET", query });
  if (stats) stats.fresh += 1;
  cache[key] = { t: Date.now(), data: endpoint === "/pricing/search" ? slimPricingResults(data) : data };
  writeCardSightCache(cache);
  return data;
}

// Runs the searches one after another (firing them at once trips CardSight's rate limit) and
// merges their results, skipping listings already in `existing`. Searches made in the last
// 7 days are reused unless `fresh` is set.
async function fetchSoldListings(queries, existing = [], { fresh = false, stats } = {}) {
  const responses = [];
  for (const q of queries) {
    responses.push(await cardSightGetCached("/pricing/search", { q, listing_type: "auction", limit: 100 }, fresh ? 0 : CARDSIGHT_CACHE_DAYS, stats));
  }
  const keyOf = (r) => `${r.url || r.title}|${r.date}|${r.price}`;
  const seen = new Set(existing.map(keyOf));
  const results = [...existing];
  for (const data of responses) {
    for (const r of data.results || []) {
      const key = keyOf(r);
      if (!seen.has(key)) {
        seen.add(key);
        results.push(r);
      }
    }
  }
  return results;
}

function listingCardNumber(r) {
  const m = String(r.title || "").match(/#\s*([A-Za-z0-9-]+)/);
  if (m) return cardNumberKey(m[1]);
  return r.matched_card && r.matched_card.number ? cardNumberKey(r.matched_card.number) : "";
}

// Keep only sold listings that clearly are this card — same player, year, set, card number,
// parallel, grade, and auto/relic status.
function filterSoldListings(card, results, q) {
  const p = cardProfile(card);
  const gradeInTitle = p.grade
    ? new RegExp(`\\b${p.grade.company ? escapeRegExp(p.grade.company) + "\\s*(?:gem\\s*(?:mint|mt)\\s*)?" : ""}${escapeRegExp(p.grade.value)}\\b`, "i")
    : null;
  const mostOf = (tokens, hay) => tokens.filter((t) => hay.includes(t)).length >= Math.ceil((tokens.length * 2) / 3);

  // Why listings were rejected, so a "no sales" result can say whether CardSight had nothing
  // or the filter ruled everything out.
  const rejected = {};
  const reject = (reason) => {
    rejected[reason] = (rejected[reason] || 0) + 1;
    return false;
  };

  // Same player, year and set — the pool used to work out the card number when it's unknown.
  const sameCardFamily = results.filter((r) => {
    if (!r || !(Number(r.price) > 0) || !r.date || r.listing_type === "fixed") return reject("not a completed sale");
    const title = normalizeCardText(r.title);
    if (!p.nameTokens.length || !p.nameTokens.every((t) => title.includes(t))) return reject("a different player");
    const set = (r.matched_card && r.matched_card.set) || {};
    if (p.pokemon) {
      // Pokémon titles often skip the year, so only a different year rules a listing out.
      const years = title.match(/\b(199\d|20[0-3]\d)\b/g) || [];
      if (p.year && years.length && !years.includes(p.year)) return reject("a different year");
      if (FOREIGN_LANGUAGE_WORDS.test(title) && !FOREIGN_LANGUAGE_WORDS.test(p.describing)) return reject("a different language");
    } else if (p.year && !title.includes(p.year) && !String(set.year || "").includes(p.year)) return reject("a different year");
    if (p.setTokens.length && !mostOf(p.setTokens, `${title} ${normalizeCardText(set.release)} ${normalizeCardText(set.name)}`)) return reject("a different set");
    return true;
  });

  // Gemini can't see the number on the front of a raw card. Inserts and autographs from the
  // same set have their own numbers, so lock onto the number most of this card's sales share.
  let number = p.number;
  if (!number) {
    const counts = {};
    for (const r of sameCardFamily) {
      const n = listingCardNumber(r);
      if (n) counts[n] = (counts[n] || 0) + 1;
    }
    number = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || "";
  }

  const sales = sameCardFamily.filter((r) => {
    const rawTitle = r.title || "";
    const title = normalizeCardText(rawTitle);
    if (JUNK_WORDS.test(title)) return reject("a lot or reprint");
    if (AUTO_WORDS.test(title) !== p.isAuto) return reject(p.isAuto ? "not autographed" : "an autograph");
    if (RELIC_WORDS.test(title) !== p.isRelic) return reject(p.isRelic ? "not a patch/relic" : "a patch/relic");

    // Inserts and multi-player cards from the same set often skip the "#"; if the listing gives
    // no number, the card's number still has to appear in the title.
    const n = listingCardNumber(r);
    if (number && n && n !== number) return reject("a different card number");
    // Only when the number was read off the card; a number worked out from sales is a guess.
    if (p.number && !n && !` ${title} `.replace(/ 0+(\d)/g, " $1").includes(` ${p.number} `)) return reject("no card number to confirm");

    const slabGrade = r.grade && r.grade.grade_value;
    const looksSlabbed =
      slabGrade || /\b(psa|bgs|sgc|cgc|beckett|tag)\s*\d/i.test(rawTitle) || /\b(graded|slabbed|black label|black 10|pristine 10|gem mint 10)\b/i.test(rawTitle);
    if (!p.grade) {
      if (looksSlabbed) return reject("graded (yours is raw)");
    } else if (slabGrade) {
      if (String(r.grade.grade_value) !== p.grade.value) return reject("a different grade");
      if (p.grade.company && normalizeCardText(r.grade.company_name) !== normalizeCardText(p.grade.company)) return reject("a different grading company");
    } else if (!gradeInTitle.test(rawTitle)) {
      return reject(looksSlabbed ? "a different grade" : `raw or not ${p.grade.company || ""} ${p.grade.value}`.replace(/\s+/g, " "));
    }

    // A sub-product line (e.g. "Update", "Sapphire") the card's own set name doesn't include.
    const subProduct = !p.pokemon && SUB_PRODUCT_WORDS.find((w) => new RegExp(`\\b${w}\\b`).test(title) && !p.describing.includes(w));
    if (subProduct) return reject(`a different product line ("${subProduct}")`);

    // Team names and the card's own set/player words are removed first, so a "Red Sox" base
    // card or a "Gold Standard" set isn't mistaken for a coloured parallel.
    const ownWords = new Set([...p.setTokens, ...p.nameTokens, ...p.variantTokens]);
    const otherWords = title.replace(TEAM_COLOUR_NAMES, " ").split(" ").filter((t) => !ownWords.has(t)).join(" ");

    if (p.pokemon) {
      // Pokémon "/197" is the set size, not a print run, and holo/full-art words describe the
      // card itself — the number already pins it down. Only a reverse holo is a different version.
      const reverse = /\breverse\b/.test(title) && !p.describing.includes("reverse");
      if (reverse) return reject("a reverse holo");
      if (!p.isBase && !mostOf(p.variantTokens, title)) return reject(`not the "${p.variant}" version`);
    } else if (p.isBase) {
      // Base cards aren't serial-numbered ("/99" titles are parallels), and unnumbered parallels
      // like Silver Prizm show up as colour/finish words.
      if (r.parallel_name || /\/\s*\d{1,4}\b/.test(rawTitle) || PARALLEL_WORDS.test(otherWords)) {
        return reject("a parallel (yours is base)");
      }
    } else {
      if (!mostOf(p.variantTokens, `${normalizeCardText(r.parallel_name)} ${title}`)) {
        return reject(`not the "${p.variant}" parallel`);
      }
      // Extra finish words mean a different parallel ("Gold Wave" isn't "Gold").
      const extra = (otherWords.match(new RegExp(PARALLEL_WORDS.source, "g")) || []).filter((w) => !GENERIC_FINISH_WORDS.has(w));
      if (extra.length) return reject(`a different parallel ("${extra[0]}")`);
      const listingRun = (rawTitle.match(/\/\s*(\d{1,4})\b/) || [])[1];
      if (p.printRun && listingRun && listingRun !== p.printRun) return reject("a different print run");
    }
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const unique = onePerSellerPerDay(sales);
  return { q, sales: unique, diag: { total: results.length, rejected } };
}

// Plain-English explanation of a search that found no usable sales.
function describeNoSales(searches) {
  const best = searches.reduce((a, b) => (b.diag.total > a.diag.total ? b : a), searches[0]);
  if (!best || best.diag.total === 0) {
    return `CardSight returned no sold listings at all for "${searches[0].q}" — it most likely doesn't have sales data for this card.`;
  }
  const reasons = Object.entries(best.diag.rejected)
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => `${count} ${reason}`)
    .join(", ");
  return `CardSight returned ${best.diag.total} sold listing${best.diag.total === 1 ? "" : "s"} for "${best.q}", but none matched this card (${reasons}).`;
}

async function verifyPriceWithCardSight(card) {
  try {
    if (!card.player_name || card.player_name === "Unknown Player") {
      throw new Error("This card hasn't been identified yet, so there's nothing to search for. Rescan the photo first.");
    }

    // 1. Search CardSight's sold listings using the details Gemini read off the card.
    let noSalesReason;
    try {
      const queries = cardSearchQueries(card);
      let results = await fetchSoldListings(queries.primary);
      let search = filterSoldListings(card, results, queries.primary[queries.primary.length - 1]);
      if (search.sales.length === 0 && queries.fallback && !queries.primary.includes(queries.fallback)) {
        results = await fetchSoldListings([queries.fallback], results);
        search = filterSoldListings(card, results, queries.fallback);
      }
      if (search.sales.length > 0) return summarizeSales(search.sales, "CardSight", queries.label);
      noSalesReason = describeNoSales([search]);
    } catch (e) {
      if (!isQuotaError(e)) throw e;
      noSalesReason = "CardSight's monthly API calls are used up.";
    }

    // 2. Last resort: no sold comps, so ask Gemini AI for an estimate (labelled as such).
    console.info(`${noSalesReason} Falling back to a Gemini valuation estimate...`);
    const pricePrompt = `Estimate the realistic market value in AUD for this card: ${card.year || ''} ${card.set_name || ''} ${card.player_name || ''} ${card.parallel_or_variant || ''} ${card.grade ? 'Grade: ' + card.grade : 'Raw'}. Return ONLY a JSON object: {"estimated_value_aud": 120.00}`;

    let geminiPriceText;
    try {
      geminiPriceText = await callGeminiAi(pricePrompt);
    } catch (geminiErr) {
      return { success: false, error: `${noSalesReason} A Gemini estimate wasn't available either (${geminiErr.message || geminiErr}).` };
    }
    let parsedPrice = null;
    try {
      const cleanJson = String(geminiPriceText).replaceAll("```json", "").replaceAll("```", "").trim();
      parsedPrice = JSON.parse(cleanJson);
    } catch (e) {
      const numericMatch = String(geminiPriceText).match(/\d+(\.\d+)?/);
      if (numericMatch) parsedPrice = { estimated_value_aud: parseFloat(numericMatch[0]) };
    }

    if (parsedPrice && parsedPrice.estimated_value_aud) {
      return {
        success: true,
        priceAud: parsedPrice.estimated_value_aud,
        source: "Gemini estimate · no sold comps",
        confidence: "AI estimate",
        note: noSalesReason,
      };
    }

    return {
      success: false,
      error: `${noSalesReason} Gemini couldn't give an estimate either.`,
    };
  } catch (err) {
    console.warn("CardSight price verification notice:", err.message || err);
    return { success: false, error: err.message || "Price verification unavailable." };
  }
}

// ===== Comp updates for My Cards / Pokémon =====
// Looks up the last 3 sales for each requested grade tier of one card (raw / PSA 9 / PSA 10,
// or just the card's own grade). One merged set of searches serves every tier.
// `details`: { player_name, year, set_name, card_number, parallel_or_variant }
// `tiers`:   [{ key: "raw" | "psa9" | "psa10", grade: null | "PSA 9" | "SGC 10" | ... }]
const COMPS_PER_TIER = 3;

function mostCommon(values) {
  const counts = {};
  for (const v of values) if (v) counts[v] = (counts[v] || 0) + 1;
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || null;
}

function compTierCard(details, grade) {
  return {
    ...details,
    is_graded: Boolean(grade),
    grade: grade || null,
    grading_company: grade ? String(grade).split(/\s+/)[0] : null,
  };
}

// `options.fresh` skips the 7-day search cache. The returned array carries `.cache` =
// { fresh, cached, oldestCachedDays } so the UI can say when saved searches were reused.
async function findCompsForTiers(details, tiers, options = {}) {
  const stats = { fresh: 0, cached: 0, oldestCachedDays: 0 };
  const fetchOpts = { fresh: Boolean(options.fresh), stats };
  const queries = [...new Set(tiers.flatMap((t) => cardSearchQueries(compTierCard(details, t.grade)).primary))];
  let results = await fetchSoldListings(queries, [], fetchOpts);
  let perTier = tiers.map((t) => ({ tier: t, search: filterSoldListings(compTierCard(details, t.grade), results, queries[queries.length - 1]) }));
  const fallback = cardSearchQueries(compTierCard(details, null)).fallback;
  if (perTier.some((x) => x.search.sales.length === 0) && fallback && !queries.includes(fallback)) {
    results = await fetchSoldListings([fallback], results, fetchOpts);
    perTier = tiers.map((t) => ({ tier: t, search: filterSoldListings(compTierCard(details, t.grade), results, fallback) }));
  }
  const out = summarizeTierComps(details, perTier, "CardSight");
  out.cache = stats;
  return out;
}

// Comps from sales you pasted (e.g. an eBay sold search page), run through the same matching
// rules as CardSight's sales. `sales`: [{ title, price (US$), date }].
function compsFromPastedSales(details, tiers, sales) {
  const perTier = tiers.map((t) => ({ tier: t, search: filterSoldListings(compTierCard(details, t.grade), sales, "your pasted sales") }));
  return summarizeTierComps(details, perTier, "Pasted sales").map((r) => ({
    ...r,
    note: r.note
      ? r.note
          .replace(/^CardSight returned no sold listings at all for "your pasted sales".*$/, "No sales could be read from your paste.")
          .replace(/^CardSight returned (\d+) sold listings? for "your pasted sales", but/, "Your paste had $1 sales, but")
      : r.note,
  }));
}

// Reads sold listings out of text copied from a sold-results page (eBay sold search with
// Ctrl+A / Ctrl+C, 130 Point, CardHedger…) using Gemini — no CardSight calls. Returns
// [{ title, price (US$), date, listing_type, url: null }] ready for the comp matching, plus
// how many rows were skipped for an unknown currency.
const PASTED_SALES_PROMPT = `The text below was copied from a web page of SOLD trading card listings (an eBay sold search, 130 Point, CardHedger or similar). Extract every individual sold listing.

Rules:
- Only completed sales with a sold price. Ignore active listings, ads, "Shop on eBay" placeholders, navigation, filters and recommendations.
- On eBay, stop at the heading "Results matching fewer words" — listings after it are not good matches.
- "price" is the final sold price of the item as a number (no shipping). For "Best offer accepted" use the price shown. If a price range is shown, skip that row.
- "currency": "AUD" for AU $ / A$, "USD" for US $ / $ on US sites / "USD", otherwise the ISO code.
- "date": the sold date as YYYY-MM-DD. If the year is missing, use ${new Date().getFullYear()} (or the previous year if that date would be in the future).
- "title": the listing title exactly as shown.

Return ONLY a JSON array, no markdown: [{"title":"","price":0,"currency":"AUD","date":"YYYY-MM-DD"}]`;

async function readSoldListingsFromText(text) {
  const clipped = String(text || "").slice(0, 60000);
  const raw = await callGeminiAi(`${PASTED_SALES_PROMPT}\n\nCopied page text:\n${clipped}`);
  const cleaned = String(raw).replace(/```json|```/g, "").trim();
  const rows = JSON.parse(cleaned.slice(cleaned.indexOf("["), cleaned.lastIndexOf("]") + 1));
  const rate = currentUsdToAudRate();
  let skipped = 0;
  const sales = [];
  for (const r of Array.isArray(rows) ? rows : []) {
    const price = Number(r.price);
    const date = /^\d{4}-\d{2}-\d{2}/.test(String(r.date || "")) ? String(r.date).slice(0, 10) : null;
    if (!(price > 0) || !r.title || !date) continue;
    const currency = String(r.currency || "").toUpperCase();
    // The comp matching works in US$ like CardSight, so AUD is converted at the live rate.
    const usd = currency === "USD" ? price : currency === "AUD" ? price / rate : null;
    if (usd == null) {
      skipped += 1;
      continue;
    }
    sales.push({ title: String(r.title), price: Math.round(usd * 100) / 100, date: `${date}T12:00:00Z`, listing_type: "auction", url: null });
  }
  return { sales, skipped };
}

function summarizeTierComps(details, perTier, sourceLabel) {
  const numberKnown = Boolean(cardProfile(details).number);
  return perTier.map(({ tier, search }) => {
    const sales = search.sales;
    const used = sales.slice(0, COMPS_PER_TIER);
    const catalogIds = [...new Set(used.map((r) => r.matched_card && r.matched_card.card_id).filter(Boolean))];
    // "High confidence" = safe to write into the card automatically: the card number is known
    // (so every accepted sale had to show it), at least 2 sales from different sellers, and
    // CardSight links them all to the same catalogue card.
    const reasons = [];
    if (!numberKnown) reasons.push("no card number to match on");
    if (used.length < 2) reasons.push(used.length === 0 ? "no matching sales" : "only 1 matching sale");
    if (catalogIds.length > 1) reasons.push("sales matched to different catalogue cards");
    const summary = used.length ? summarizeSales(sales, sourceLabel, null, COMPS_PER_TIER) : null;
    return {
      key: tier.key,
      grade: tier.grade,
      priceUsd: summary ? summary.priceUsd : null,
      priceAud: summary ? summary.priceAud : null,
      sales: summary ? summary.sales : [],
      highConfidence: reasons.length === 0,
      reasons,
      note: used.length ? null : describeNoSales([search]),
      cardId: mostCommon(sales.map((r) => r.matched_card && r.matched_card.card_id)),
      parallelId: mostCommon(sales.map((r) => r.parallel_id)),
      gradeId: mostCommon(sales.map((r) => r.grade && r.grade.grade_id)),
    };
  });
}

// Weekly median sold price over the last 12 weeks for one card (and grade/parallel), as
// [{ date, value }] in AUD — the same shape the card's own price history uses.
async function fetchPriceTrend(cardId, { parallelId, gradeId, graded } = {}) {
  const query = { interval: "weekly", periods: 12, listing_type: "auction" };
  query.parallel_id = parallelId || "null";
  if (!graded) query.grade_id = "null";
  else if (gradeId) query.grade_id = gradeId;
  const data = await cardSightGetCached(`/pricing/${cardId}/timeseries`, query);

  let candles = (data.raw && data.raw.candles) || [];
  if (graded) {
    const series = (data.graded || []).flatMap((c) => c.grades || []);
    const match = series.find((g) => g.grade_id === gradeId) || series[0];
    candles = (match && match.candles) || [];
  }
  return candles
    .map((c) => {
      const types = c.types || {};
      const stats = types.auction || types.both || Object.values(types)[0] || {};
      const usd = stats.median ?? stats.mean;
      return usd != null && (stats.count == null || stats.count > 0) ? { date: c.period_start, value: convertUsdToAud(usd) } : null;
    })
    .filter(Boolean);
}

// Plain-English question to CardSight's AI, with earlier turns for follow-ups.
async function askCardSight(question, history = []) {
  // CardSight's AI is unreliable on "what has X sold for" questions (it often gives up or can't
  // find the card), so those are answered straight from its sold listings when possible.
  // A follow-up like "What about PSA 10?" after a price question is a price question too.
  const followUpOnPrice = /\b(psa|bgs|sgc|cgc|tag|raw|graded|ungraded|gem)\b/i.test(question) && history.some((t) => t.role === "user" && PRICE_QUESTION.test(t.content));
  const isPriceQuestion = PRICE_QUESTION.test(question) || followUpOnPrice;
  if (isPriceQuestion) {
    try {
      const comps = await answerFromSoldComps(question, history);
      if (comps && comps.foundSales) return comps.text;
    } catch (e) {
      if (isQuotaError(e)) throw e;
      console.warn("Sold-comps answer failed, asking CardSight's AI:", e.message || e);
    }
  }
  const data = await callCardSightProxy({
    endpoint: "/ai/query",
    method: "POST",
    body: { query: question, conversationHistory: history },
  });
  if (!data.answer) throw new Error(data.error || "CardSight didn't return an answer.");
  if (!CARDSIGHT_AI_GAVE_UP.test(data.answer)) return data.answer;
  // CardSight's AI often runs out of steps on grade-specific questions. If the question is
  // about one card, answer it from CardSight's sold listings instead.
  if (!isPriceQuestion) {
    try {
      const fallback = await answerFromSoldComps(question, history);
      if (fallback) return fallback.text;
    } catch (e) {
      console.warn("Sold-comps fallback failed:", e.message || e);
    }
  }
  return data.answer;
}

// eBay's sold-listings search. Used for each sale CardSight reports, because its link goes to the
// original listing, and eBay replaces ended listings with a generic product page that doesn't show
// what the card sold for.
function ebaySoldUrl(text) {
  return `https://www.ebay.com.au/sch/i.html?_nkw=${encodeURIComponent(String(text || "").replace(/\s+/g, " ").trim())}&LH_Sold=1&LH_Complete=1`;
}

// Card Hedge's free price guide search (Raw / PSA 9 / PSA 10 prices per parallel, from eBay,
// Fanatics, Heritage and Goldin sales). Grades and eBay "-word" exclusions are left out because
// its results already show every grade.
function cardHedgerUrl(text) {
  const q = String(text || "")
    .replace(/\s-\w+/g, " ")
    .replace(/\b(PSA|BGS|SGC|CGC|TAG)\s*\d+(\.5)?\b/gi, " ")
    .replace(/#/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return `https://ai.cardhedger.com/price-guide?query=${encodeURIComponent(q)}&queryTags=${encodeURIComponent(JSON.stringify([q]))}`;
}

const CARDSIGHT_AI_GAVE_UP = /more iterations|try a more specific|technical difficult|currently unavailable/i;
const PRICE_QUESTION = /\b(sold|sell|sells|selling|price|prices|priced|worth|value|comps?|going for|cost)\b/i;

// Answers a question about one card from CardSight's sold listings. Returns null when the
// question isn't about a specific card, else { text, foundSales }.
async function answerFromSoldComps(question, history = []) {
  const earlier = history.filter((t) => t.role === "user").slice(-2).map((t) => t.content);
  const context = earlier.length ? `Earlier questions in this conversation (for follow-ups like "what about PSA 10?"): ${earlier.map((q) => `"${q}"`).join(", ")}\n` : "";
  const prompt = `${context}Extract the trading card this question is about. Question: "${question}"
Return ONLY JSON: {"is_specific_card": true|false, "player_name": "", "year": "", "set_name": "", "parallel_or_variant": "Base", "card_number": "", "grade": "" , "sport": ""}
- set_name without the year or brand words like "Panini" (e.g. "Prizm", "Obsidian Flames").
- grade like "PSA 10" or "SGC 9.5", empty if not mentioned. sport "Pokémon" for Pokémon cards.
- is_specific_card is false for general market questions.`;
  const text = String(await callGeminiAi(prompt)).replace(/```json|```/g, "").trim();
  const card = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  if (!card.is_specific_card || !card.player_name) return null;

  const tiers = card.grade
    ? [{ key: "own", grade: card.grade }]
    : [{ key: "raw", grade: null }, { key: "psa9", grade: "PSA 9" }, { key: "psa10", grade: "PSA 10" }];
  const results = await findCompsForTiers(card, tiers);
  const name = [card.year, card.set_name, card.player_name, /^base$/i.test(card.parallel_or_variant || "") ? "" : card.parallel_or_variant, card.card_number ? `#${String(card.card_number).replace(/^#/, "")}` : ""]
    .filter(Boolean)
    .join(" ");
  const lines = [`Most recent sold comps from CardSight's sales data for ${name}:`, ""];
  for (const r of results) {
    lines.push(`${r.grade || "Raw"}: ${r.priceAud != null ? `avg A$${r.priceAud.toFixed(2)} from the last ${r.sales.length} sale${r.sales.length === 1 ? "" : "s"}` : "no matching sales found"}${r.priceAud != null && !r.highConfidence ? ` (low confidence — ${r.reasons.join(", ")})` : ""}`);
    for (const s of r.sales) {
      const links = [s.url ? `[listing](${s.url})` : "", `[eBay sold](${ebaySoldUrl(s.title)})`].filter(Boolean).join(" · ");
      lines.push(`  • ${new Date(s.date).toLocaleDateString()} · A$${convertUsdToAud(s.priceUsd).toFixed(2)} · ${s.title} · ${links}`);
    }
    const search = `${name} ${r.grade || "-psa -bgs -sgc -cgc"}`.replace(/#/g, "");
    lines.push(`  [Search all ${r.grade || "raw"} sold on eBay](${ebaySoldUrl(search)})`, "");
  }
  return { text: lines.join("\n"), foundSales: results.some((r) => r.sales.length > 0) };
}

// Universal AI Call Proxy with exponential backoff retries & safe string parsing
const GEMINI_TIMEOUT_MS = 60000;

async function callGeminiAi(promptText, imageBase64 = null, mimeType = "image/jpeg", retries = 2, delay = 3000) {
  if (!supabaseClient) {
    throw new Error("Supabase client is not initialized.");
  }

  let cleanBase64 = imageBase64;
  if (cleanBase64 && cleanBase64.includes(",")) {
    cleanBase64 = cleanBase64.split(",")[1];
  }

  for (let i = 0; i < retries; i++) {
    try {
      // A request that never answers would otherwise leave the app spinning forever.
      const { data, error } = await Promise.race([
        supabaseClient.functions.invoke("analyze-card", {
          body: {
            prompt: promptText,
            imageBase64: cleanBase64,
            mimeType: mimeType
          }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Gemini took too long to answer.")), GEMINI_TIMEOUT_MS)),
      ]);

      if (error) throw error;
      if (data && data.error) throw new Error(data.error);

      const output = typeof data === "string" ? data : data?.text || data?.result || JSON.stringify(data);
      if (!output || output === "{}") throw new Error("Empty response payload from Gemini Edge Function.");

      return output;
    } catch (err) {
      console.warn(`Supabase AI Function attempt ${i + 1} failed:`, err.message || err);
      
      if (i === retries - 1) throw err;
      
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}
