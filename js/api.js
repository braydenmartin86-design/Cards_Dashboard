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
      const compressedDataUrl = await compressImageForApi(base64Image, 800, 0.60);
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
// 1. /identify/card on the photo -> CardSight's catalog id for the card (plus slab grade, if any).
// 2. /pricing/{card_id} -> completed auction sales for that card, grade and parallel.
// 3. Market value = average of the 3 most recent sales, or the most recent sale if fewer exist.
// Identification alone never includes prices, so step 2 is what actually finds sold comps.

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

// A lot photo can contain several cards; pick the detection that matches the row clicked.
function pickCardSightDetection(detections, card) {
  if (detections.length === 1) return detections[0];
  const nameTokens = normalizeCardText(card.player_name).split(" ").filter((t) => t.length > 1);
  const wantNumber = normalizeCardText(card.card_number).replace(/^no /, "");
  let best = null;
  let bestScore = 0;
  for (const d of detections) {
    const name = normalizeCardText(d.card.name);
    const nameScore = nameTokens.length ? nameTokens.filter((t) => name.includes(t)).length / nameTokens.length : 0;
    if (nameScore === 0) continue;
    let score = nameScore;
    if (wantNumber && normalizeCardText(d.card.number) === wantNumber) score += 0.3;
    if (card.year && String(d.card.year || "").includes(String(card.year).slice(0, 4))) score += 0.2;
    if (score > bestScore) {
      best = d;
      bestScore = score;
    }
  }
  return best;
}

// Graded cards: the slab detected by CardSight wins; otherwise fall back to the scanned row's grade.
function wantedGrade(detection, card) {
  const g = detection.grading;
  if (g && g.grade && g.grade.value) {
    return { company: g.company && g.company.name, value: String(g.grade.value), gradeId: g.grade.id || null };
  }
  if (card.is_graded && card.grade) {
    const parts = String(card.grade).trim().split(/\s+/);
    const value = parts[parts.length - 1];
    const company = card.grading_company || (parts.length > 1 ? parts[0] : null);
    return { company, value, gradeId: null };
  }
  return null;
}

async function verifyPriceWithCardSight(card) {
  try {
    const imageSource = card._rawBase64 || card.previewUrl;

    if (!imageSource) {
      throw new Error("No image data available on this card row to verify.");
    }

    // 1. Identify. Compress to ~800px to keep the upload small.
    const compressedDataUrl = await compressImageForApi(imageSource, 800, 0.65);
    const imageBlob = base64ToBlob(compressedDataUrl, "image/jpeg");

    const formData = new FormData();
    formData.append("file", imageBlob, "verify_card.jpg");
    formData.append("endpoint", "/identify/card");

    const identified = await callCardSightProxy(formData);
    const detections = (identified.detections || []).filter((d) => d && d.card && d.card.id);
    const detection = detections.length ? pickCardSightDetection(detections, card) : null;

    let noSalesReason = null;
    if (!detection) {
      noSalesReason = detections.length
        ? `CardSight found ${detections.length} cards in the photo but none matched "${card.player_name}". Scan this card on its own for an exact match.`
        : "CardSight couldn't match this card to an exact catalog entry.";
    } else {
      // 2. Completed auction sales for this card.
      const grade = wantedGrade(detection, card);
      const variant = String(card.parallel_or_variant || "").trim();
      const isBase = !variant || /^base( card)?$/i.test(variant);
      const suggestion = isBase
        ? null
        : (detection.card.parallelSuggestions || []).find((p) => {
            const a = normalizeCardText(p.name);
            const b = normalizeCardText(variant);
            return a && b && (a.includes(b) || b.includes(a));
          });

      const query = { listing_type: "auction" };
      if (isBase) query.parallel_id = "null";
      else if (suggestion) query.parallel_id = suggestion.id;
      if (!grade) query.grade_id = "null";
      else if (grade.gradeId) query.grade_id = grade.gradeId;

      let pricing = {};
      try {
        pricing = await callCardSightProxy({ endpoint: `/pricing/${detection.card.id}`, method: "GET", query });
      } catch (e) {
        // 404 = CardSight has no price history for this card; treat it as "no sales".
        if (!/status 404/.test(e.message || "")) throw e;
      }

      let records = [];
      if (!grade) {
        records = (pricing.raw && pricing.raw.records) || [];
      } else {
        for (const company of pricing.graded || []) {
          if (grade.company && normalizeCardText(company.company_name) !== normalizeCardText(grade.company)) continue;
          for (const g of company.grades || []) {
            if (!grade.gradeId && String(g.grade_value) !== grade.value) continue;
            records.push(...(g.records || []));
          }
        }
      }
      // Parallel named on the row but not in CardSight's suggestions: match on listing data instead.
      if (!isBase && !suggestion) {
        const want = normalizeCardText(variant);
        records = records.filter((r) => {
          const p = normalizeCardText(r.parallel_name);
          return p && (p.includes(want) || want.includes(p));
        });
      }

      const sales = records
        .filter((r) => r && Number(r.price) > 0 && r.date && (r.listing_type || "auction") === "auction")
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      const pricedAs = [
        detection.card.year,
        detection.card.releaseName,
        detection.card.name,
        isBase ? "Base" : (suggestion && suggestion.name) || variant,
        grade ? `${grade.company || ""} ${grade.value}`.trim() : "Raw",
      ].filter(Boolean).join(" ");

      if (sales.length > 0) {
        const used = sales.slice(0, sales.length >= 3 ? 3 : 1);
        const priceUsd = Math.round((used.reduce((s, r) => s + Number(r.price), 0) / used.length) * 100) / 100;
        const lastDate = new Date(used[0].date).toLocaleDateString();
        return {
          success: true,
          priceUsd,
          priceAud: convertUsdToAud(priceUsd),
          source: used.length === 3 ? "CardSight · avg of last 3 sales" : `CardSight · last sale ${lastDate}`,
          confidence: "Sold comps",
          pricedAs,
          sales: used.map((r) => ({ date: r.date, priceUsd: Number(r.price), title: r.title, url: r.url })),
        };
      }
      noSalesReason = `CardSight has no recent sold listings for ${pricedAs}.`;
    }

    // 3. Fallback: no sold comps, so ask Gemini AI for an estimate (labelled as such).
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
      error: "CardSight identified the card but has no active price comps in its database.",
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
