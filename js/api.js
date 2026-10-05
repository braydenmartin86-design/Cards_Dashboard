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
const USD_TO_AUD_RATE = 1.44; // Central USD to AUD conversion multiplier

// Central Currency Converter
function convertUsdToAud(usdAmount) {
  if (usdAmount == null || isNaN(usdAmount)) return null;
  return Math.round(Number(usdAmount) * USD_TO_AUD_RATE * 100) / 100;
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

async function callCardSightProxy(body) {
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
    throw new Error("Rate limit reached. Please wait a few seconds before retrying.");
  }
  let wrapper = null;
  try {
    wrapper = await response.json();
  } catch (e) {}
  if (!response.ok) {
    const detail = wrapper && (wrapper.error || wrapper.message);
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

// Market value from sold listings: average of the 3 most recent, or the most recent if fewer.
function summarizeSales(sales, label, pricedAs) {
  const used = sales.slice(0, sales.length >= 3 ? 3 : 1);
  const priceUsd = Math.round((used.reduce((s, r) => s + Number(r.price), 0) / used.length) * 100) / 100;
  const lastDate = new Date(used[0].date).toLocaleDateString();
  return {
    success: true,
    priceUsd,
    priceAud: convertUsdToAud(priceUsd),
    source: used.length === 3 ? `${label} · avg of last 3 sales` : `${label} · last sale ${lastDate}`,
    confidence: "Sold comps",
    pricedAs,
    sales: used.map((r) => ({ date: r.date, priceUsd: Number(r.price), title: r.title, url: r.url })),
  };
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Search queries for a card, most specific first. The broader one only widens which listings
// come back; every result still has to pass the same strict filter.
function cardSearchQueries(card) {
  const grade = wantedGrade(card);
  const variant = String(card.parallel_or_variant || "").trim();
  const isBase = !variant || /^base( card)?$/i.test(variant);
  const number = String(card.card_number || "").replace(/^#/, "").trim();
  const year = String(card.year || "").slice(0, 4);
  const join = (parts) => parts.join(" ").replace(/\s+/g, " ").trim();
  const full = join([
    year,
    card.set_name,
    card.player_name,
    number ? `#${number}` : "",
    isBase ? "" : variant,
    grade ? `${grade.company || ""} ${grade.value}` : "",
  ]);
  const broad = join([year, card.set_name, card.player_name, isBase ? "" : variant]);
  return [...new Set([full, broad])];
}

// Fuzzy-search sold listing titles, then keep only listings that clearly are this card —
// same player, year, card number, parallel and grade.
async function searchSoldListingsByTitle(card, q) {
  const grade = wantedGrade(card);
  const variant = String(card.parallel_or_variant || "").trim();
  const isBase = !variant || /^base( card)?$/i.test(variant);
  const number = String(card.card_number || "").replace(/^#/, "").trim();
  const year = String(card.year || "").slice(0, 4);

  const data = await callCardSightProxy({
    endpoint: "/pricing/search",
    method: "GET",
    query: { q, listing_type: "auction", limit: 100 },
  });

  const nameTokens = normalizeCardText(card.player_name).split(" ").filter((t) => t.length > 1);
  const variantTokens = normalizeCardText(variant).split(" ").filter((t) => t.length > 2);
  const gradeInTitle = grade
    ? new RegExp(`\\b${grade.company ? escapeRegExp(grade.company) + "\\s*(?:gem\\s*(?:mint|mt)\\s*)?" : ""}${escapeRegExp(grade.value)}\\b`, "i")
    : null;

  const sales = (data.results || []).filter((r) => {
    if (!r || !(Number(r.price) > 0) || !r.date || r.listing_type === "fixed") return false;
    const rawTitle = r.title || "";
    const title = normalizeCardText(rawTitle);
    if (!nameTokens.length || !nameTokens.every((t) => title.includes(t))) return false;

    const matchedYear = String((r.matched_card && r.matched_card.set && r.matched_card.set.year) || "");
    if (year && !title.includes(year) && !matchedYear.includes(year)) return false;

    if (number) {
      const m = rawTitle.match(/#\s*([A-Za-z0-9-]+)/);
      if (m && normalizeCardText(m[1]) !== normalizeCardText(number)) return false;
    }

    const slabGrade = r.grade && r.grade.grade_value;
    const looksSlabbed = slabGrade || /\b(psa|bgs|sgc|cgc|beckett|tag)\s*\d/i.test(rawTitle);
    if (!grade) {
      if (looksSlabbed) return false;
    } else if (slabGrade) {
      if (String(r.grade.grade_value) !== grade.value) return false;
      if (grade.company && normalizeCardText(r.grade.company_name) !== normalizeCardText(grade.company)) return false;
    } else if (!gradeInTitle.test(rawTitle)) {
      return false;
    }

    if (isBase) {
      // Base cards aren't serial-numbered; "/99"-style titles are parallels.
      if (r.parallel_name || /\/\s*\d{1,4}\b/.test(rawTitle)) return false;
    } else {
      const hay = `${normalizeCardText(r.parallel_name)} ${title}`;
      if (!variantTokens.every((t) => hay.includes(t))) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  return { q, sales };
}

async function verifyPriceWithCardSight(card) {
  try {
    if (!card.player_name || card.player_name === "Unknown Player") {
      throw new Error("This card hasn't been identified yet, so there's nothing to search for. Rescan the photo first.");
    }

    // 1. Search CardSight's sold listings using the details Gemini read off the card.
    const queries = cardSearchQueries(card);
    let noSalesReason = null;
    for (const q of queries) {
      const search = await searchSoldListingsByTitle(card, q);
      if (search.sales.length > 0) return summarizeSales(search.sales, "CardSight", queries[0]);
    }
    noSalesReason = `CardSight has no sold listings matching "${queries[0]}".`;

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

// Universal AI Call Proxy with exponential backoff retries & safe string parsing
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
      const { data, error } = await supabaseClient.functions.invoke("analyze-card", {
        body: {
          prompt: promptText,
          imageBase64: cleanBase64,
          mimeType: mimeType
        }
      });

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
