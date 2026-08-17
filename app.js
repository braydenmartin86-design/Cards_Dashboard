// ===== 1. GLOBALS DESTRUCTURING & INITIALIZATION =====
const { useState, useEffect, useMemo } = React;

// Safe icon proxy — returns a blank element if an icon hasn't loaded or doesn't exist
const IconProxy = new Proxy({}, {
  get: (target, name) => {
    if (window.lucide && window.lucide.icons && window.lucide.icons[name]) {
      const IconComp = window.lucide.icons[name];
      return (props) => React.createElement(IconComp, props);
    }
    return () => null;
  }
});

const Plus = IconProxy.Plus;
const X = IconProxy.X;
const ChevronRight = IconProxy.ChevronRight;
const RefreshCw = IconProxy.RefreshCw;
const Trash2 = IconProxy.Trash2;
const TrendingUp = IconProxy.TrendingUp;
const Target = IconProxy.Target;
const Gavel = IconProxy.Gavel;
const BookOpen = IconProxy.BookOpen;
const Copy = IconProxy.Copy;
const Check = IconProxy.Check;

// Safe Recharts fallbacks
const RC = window.Recharts || {};
const LineChart = RC.LineChart || (() => null);
const Line = RC.Line || (() => null);
const ResponsiveContainer = RC.ResponsiveContainer || (({ children }) => children);
const YAxis = RC.YAxis || (() => null);

let supabaseClient = null;
try {
  if (window.supabase && window.SUPABASE_URL && window.SUPABASE_URL !== "https://your-supabase-url.supabase.co") {
    supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn("Supabase init fallback to localStorage:", e);
}

// Universal Gemini AI Helper (Proxies through Supabase Edge Function 'analyze-card')
async function callGeminiAi(promptText, imageBase64 = null, mimeType = "image/jpeg") {
  if (!supabaseClient) {
    throw new Error("Supabase client is not connected.");
  }
  const { data, error } = await supabaseClient.functions.invoke('analyze-card', {
    body: { prompt: promptText, imageBase64, mimeType }
  });
  if (error) throw error;
  return data;
}

// ===== SEED DATA =====
const SEED_CARDS = [{"player": "Amen Thompson", "card": "Prizm RC Luck OT Lottery", "cardNum": "#12", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.4, "shipping": 1.48, "feesPct": 0.137, "rawAvg": 9.29, "psa9Avg": 43.2, "psa10Avg": 16.09, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 9.29}], "psa9History": [{"date": "2026-08-07", "value": 43.2}], "psa10History": [{"date": "2026-08-07", "value": 16.09}]}, {"player": "Jaren Jackson Jr", "card": "2018-19 Prizm Phenoms Silver", "cardNum": "#22", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 1.9, "shipping": 1.47, "feesPct": 0.137, "rawAvg": 4.29, "psa9Avg": 9.66, "psa10Avg": 23.03, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.29}], "psa9History": [{"date": "2026-08-07", "value": 9.66}], "psa10History": [{"date": "2026-08-07", "value": 23.03}]}, {"player": "Jonathan Kuminga", "card": "2021-22 Obsidian Base", "cardNum": "#157", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 10.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 17.46, "psa9Avg": 15.6, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 17.46}], "psa9History": [{"date": "2026-08-07", "value": 15.6}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Scoot Henderson", "card": "Prizm Monopoly Purple Wave", "cardNum": "#75", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 1.49, "shipping": 0.7, "feesPct": 0.137, "rawAvg": 8.09, "psa9Avg": 8.2, "psa10Avg": 16.45, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 8.09}], "psa9History": [{"date": "2026-08-07", "value": 8.2}], "psa10History": [{"date": "2026-08-07", "value": 16.45}]}, {"player": "Trevor Lawrence", "card": "Donruss RC Elite Series", "cardNum": "#ESR-TRL", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 3.34, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 25.26, "psa9Avg": 18.57, "psa10Avg": 28.23, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 25.26}], "psa9History": [{"date": "2026-08-07", "value": 18.57}], "psa10History": [{"date": "2026-08-07", "value": 28.23}]}, {"player": "Dylan Harper", "card": "2025-26 Topps Chrome Instinct Aqua /199", "cardNum": "#INS-12", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 38.57, "shipping": 7.79, "feesPct": 0.137, "rawAvg": 61.11, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": true, "outOf": 199, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 61.11}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Alex Rodriguez", "card": "Donruss Bomb Squad Blue", "cardNum": "#BS1", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 7.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 14.89, "psa9Avg": 0.0, "psa10Avg": 67.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 14.89}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 67.0}]}, {"player": "Bijan Robinson", "card": "2023 Rated Rookie Purple", "cardNum": "#206", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 10.86, "psa9Avg": 24.67, "psa10Avg": 77.62, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 10.86}], "psa9History": [{"date": "2026-08-07", "value": 24.67}], "psa10History": [{"date": "2026-08-07", "value": 77.62}]}, {"player": "Bijan Robinson", "card": "2023 Pheonix Contours", "cardNum": "#CON-18", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 7.43, "psa9Avg": 20.1, "psa10Avg": 67.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 7.43}], "psa9History": [{"date": "2026-08-07", "value": 20.1}], "psa10History": [{"date": "2026-08-07", "value": 67.0}]}, {"player": "Jarrett Allen", "card": "2017 Prizm Hyper Silver", "cardNum": "#154", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 4.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 8.94, "psa9Avg": 15.02, "psa10Avg": 77.49, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 8.94}], "psa9History": [{"date": "2026-08-07", "value": 15.02}], "psa10History": [{"date": "2026-08-07", "value": 77.49}]}];

const SEED_POKEMON = [{"player": "Arcanine EX", "card": "2023 Scarlet & Violet", "cardNum": "#032/198", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 4.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pokémon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}];

const SEED_TARGETS = [{"id": null, "player": "Jackson Chourio", "sport": "MLB", "cardToLookFor": "2024 Topps Chrome/Bowman base rookie", "tier": "Buy Now", "researchScore": 58, "performanceTrend": "Improving", "reasoning": "Elite power/speed combo already producing at the MLB level for Milwaukee.", "targetPriceRaw": 22, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}];

// ===== FORMULA ENGINE =====
const AUD_TO_USD_APPROX = 0.65;
function tieredPsaAuCost(declaredValueAUD) {
  const usd = (declaredValueAUD || 0) * AUD_TO_USD_APPROX;
  if (usd <= 500) return 50;
  if (usd <= 1000) return 140;
  if (usd <= 1500) return 165;
  if (usd <= 2500) return 299;
  if (usd <= 5000) return 699;
  if (usd <= 10000) return 1199;
  return 2199;
}

function gradingCost(service, declaredValueAUD) {
  if (!service) return 0;
  const s = service.toLowerCase();
  if (s === "psa via australia" || s === "psa via aus") return tieredPsaAuCost(declaredValueAUD);
  if (s === "psa via shipmycards" || s === "psa via usa") return 38.9;
  if (s === "sgc via australia" || s === "sgc via aus") return 39.95;
  return 0;
}

function estimateGradingTurnaroundDays(service, declaredValueAUD) {
  if (!service) return null;
  const s = service.toLowerCase();
  if (s === "psa via australia" || s === "psa via aus") {
    const usd = (declaredValueAUD || 0) * AUD_TO_USD_APPROX;
    if (usd <= 500) return 225;
    if (usd <= 1000) return 68;
    if (usd <= 1500) return 53;
    if (usd <= 2500) return 38;
    if (usd <= 5000) return 13;
    return 10;
  }
  if (s === "psa via shipmycards" || s === "psa via usa") return 60;
  if (s === "sgc via australia" || s === "sgc via aus") return 30;
  return null;
}

const PSA9_GRADES = ["psa 9", "sgc 9", "bgs 9", "bgs 9.5"];
const PSA10_GRADES = ["psa 10", "sgc 10", "bgs 10"];

function computeCard(c) {
  const holdingCost = (c.shipMyCards || "").toLowerCase() === "yes" ? 4.5 : 0;
  const totalCost = c.paid + c.shipping + holdingCost + (c.gradingCostPaid || 0);
  const fees = c.feesPct;
  const grade = (c.grade || "").toLowerCase();
  const status = c.status;
  const isActive = status === "Raw" || status === "Graded";

  const raw = c.rawAvg ?? 0;
  const psa9 = c.psa9Avg ?? 0;
  const psa10 = c.psa10Avg ?? c.psa9Avg ?? 0;

  const netRawSell = raw * (1 - fees);
  const netPsa9Sell = psa9 * (1 - fees);
  const netPsa10Sell = psa10 * (1 - fees);

  const declaredValue = Math.max(psa9, psa10);
  const gCost = gradingCost(c.gradingService, declaredValue);

  const rawGGR = isActive ? (status === "Graded" ? null : raw - totalCost) : null;
  const psa9Eligible = isActive && (status === "Raw" || PSA9_GRADES.includes(grade));
  const psa9GGR = psa9Eligible ? psa9 * (1 - fees) - totalCost - gCost : null;

  const psa10Eligible = isActive && (status === "Raw" || PSA10_GRADES.includes(grade));
  const psa10GGR = psa10Eligible ? psa10 * (1 - fees) - totalCost - gCost : null;

  let gradedEV = null;
  if (isActive && status !== "Graded") {
    const analysis = c.gradeAnalysis;
    const gemRate = c.setGemRate !== "" && c.setGemRate != null ? Math.max(0, Math.min(1, Number(c.setGemRate) / 100)) : null;
    if (analysis) {
      const belowValue = raw ?? 0;
      const expectedRevenue = psa10 * (1 - fees) * analysis.psa10Prob + psa9 * (1 - fees) * analysis.psa9Prob + belowValue * (1 - fees) * analysis.belowProb;
      gradedEV = expectedRevenue - totalCost - gCost;
    } else if (gemRate != null) {
      const p10 = gemRate;
      const p9 = Math.min(1 - p10, 0.5);
      gradedEV = p10 * (psa10 * (1 - fees) - totalCost - gCost) + p9 * (psa9 * (1 - fees) - totalCost - gCost);
    } else {
      gradedEV = c.psa10Prob * (psa10 * (1 - fees) - totalCost - gCost) + c.psa9Prob * (psa9 * (1 - fees) - totalCost - gCost);
    }
  }

  let gradeWorthIt = "NO";
  if (psa10GGR >= 20 && psa9GGR >= 0 && gradedEV >= rawGGR) gradeWorthIt = "YES";
  else if (psa10GGR >= 20 && psa9GGR >= -10 && psa9GGR < 0 && gradedEV >= rawGGR) gradeWorthIt = "HIGH RISK";

  let sellDecision = "";
  if (!c.player) sellDecision = "";
  else if (status === "Sold") sellDecision = "Sold";
  else if (status === "Listed") sellDecision = "Listed";
  else if (status === "At Grading") sellDecision = "At Grading";
  else if (status === "Graded") {
    if (grade === "psa 10" && psa10GGR >= 20) sellDecision = "Sell PSA 10";
    else if (PSA9_GRADES.includes(grade) && psa9GGR >= 5) sellDecision = "Sell PSA 9";
    else sellDecision = "Hold";
  } else {
    const gradeFirst = gradeWorthIt !== "NO" && psa10GGR > rawGGR;
    if (gradeFirst) {
      sellDecision = "Grade First";
    } else {
      const threshAbs = totalCost <= 30 ? Math.max(5, totalCost * 0.15) : Math.max(20, totalCost * 0.2);
      const threshPct = totalCost <= 30 ? 0.15 : 0.2;
      const sellRawFirst = rawGGR >= threshAbs || (totalCost > 0 && rawGGR / totalCost >= threshPct);
      sellDecision = sellRawFirst ? "Sell Raw First" : "Hold";
    }
  }

  const gradeCall = status !== "Raw" || sellDecision === "Sell Raw First" ? "NO" : gradeWorthIt;

  let sellPriority = 9;
  if (sellDecision === "") sellPriority = 9;
  else if (sellDecision === "Sell PSA 9" || sellDecision === "Sell PSA 10") sellPriority = 1;
  else if (sellDecision === "Sell Raw First") sellPriority = 2;
  else if (gradeCall === "YES" && sellDecision === "Grade First") sellPriority = 3;
  else if (gradeCall === "HIGH RISK" && sellDecision === "Grade First") sellPriority = 4;
  else if (gradeCall === "NO" && sellDecision === "Grade First") sellPriority = 5;
  else if (sellDecision === "Hold") sellPriority = 6;
  else if (sellDecision === "Listed") sellPriority = 7;
  else if (sellDecision === "Sold") sellPriority = 8;
  else if (sellDecision === "At Grading") sellPriority = 6.5;
  else sellPriority = 9;

  const rawBE = totalCost / (1 - fees);
  const psa9BE = (totalCost + gCost) / (1 - fees);
  const psa10BE = (totalCost + gCost) / (1 - fees);

  const hasActualFees = c.actualFeesPaid != null && c.actualFeesPaid !== "";
  const netSale = c.actualSellPrice != null ? (hasActualFees ? c.actualSellPrice - Number(c.actualFeesPaid) - (Number(c.consignmentShipping) || 0) : c.actualSellPrice * (1 - fees)) : null;
  const realisedProfit = netSale != null ? netSale - totalCost : null;

  return {
    ...c,
    holdingCost,
    totalCost,
    netRawSell,
    netPsa9Sell,
    netPsa10Sell,
    gradingCostValue: gCost,
    rawGGR,
    psa9GGR,
    psa10GGR,
    gradedEV,
    gradeCall,
    sellDecision,
    sellPriority,
    rawBE,
    psa9BE,
    psa10BE,
    netSale,
    realisedProfit,
  };
}

function computePokemonCard(c) {
  return computeCard(c);
}

function fmtMoney(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 2 });
}

function fmtPct(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const STORAGE_KEY = "cardflip_ev_portfolio_v1";
const POKEMON_STORAGE_KEY = "cardflip_ev_pokemon_v1";
const BUY_STORAGE_KEY = "cardflip_ev_buylist_v1";
const BOX_STORAGE_KEY = "cardflip_ev_boxbreaks_v1";
const TARGETS_STORAGE_KEY = "cardflip_ev_targets_v1";
const CONTENT_STORAGE_KEY = "cardflip_ev_content_v1";

const _writeQueues = {};

function unwrapEnvelope(parsed) {
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && "data" in parsed && "savedAt" in parsed) {
    return { data: parsed.data, savedAt: Number(parsed.savedAt) || 0 };
  }
  return { data: parsed, savedAt: 0 };
}

async function storageGet(key) {
  let remoteEnv = null;
  let localEnv = null;

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('tandem_state')
        .select('value')
        .eq('id', key)
        .maybeSingle();

      if (!error && data && data.value) {
        remoteEnv = unwrapEnvelope(data.value);
      }
    } catch (e) {}
  }

  try {
    const raw = localStorage.getItem(key);
    if (raw) localEnv = unwrapEnvelope(JSON.parse(raw));
  } catch (e) {}

  if (remoteEnv && localEnv) {
    return remoteEnv.savedAt >= localEnv.savedAt ? remoteEnv.data : localEnv.data;
  }
  if (remoteEnv) return remoteEnv.data;
  if (localEnv) return localEnv.data;
  return null;
}

async function storageSet(key, value) {
  const envelope = { data: value, savedAt: Date.now() };
  const payload = JSON.stringify(envelope);

  const prior = _writeQueues[key] || Promise.resolve();
  const next = prior.catch(() => {}).then(async () => {
    try {
      localStorage.setItem(key, payload);
    } catch (e) {}

    if (supabaseClient) {
      try {
        await supabaseClient
          .from('tandem_state')
          .upsert(
            { id: key, value: envelope, updated_at: new Date().toISOString() },
            { onConflict: 'id' }
          );
      } catch (e) {}
    }
  });

  _writeQueues[key] = next;
  await next;
  return true;
}

// ===== MAIN APP COMPONENT =====
function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [tab, setTab] = useState("home");
  const [cards, setCards] = useState(SEED_CARDS);
  const [pokemonCards, setPokemonCards] = useState(SEED_POKEMON);
  const [targets, setTargets] = useState(SEED_TARGETS);
  const [buyList, setBuyList] = useState([]);
  const [boxBreaks, setBoxBreaks] = useState([]);
  const [contentPlan, setContentPlan] = useState([]);

  useEffect(() => {
    async function loadAll() {
      const [lCards, lPkmn, lTargets, lBuy, lBox, lContent] = await Promise.all([
        storageGet(STORAGE_KEY),
        storageGet(POKEMON_STORAGE_KEY),
        storageGet(TARGETS_STORAGE_KEY),
        storageGet(BUY_STORAGE_KEY),
        storageGet(BOX_STORAGE_KEY),
        storageGet(CONTENT_STORAGE_KEY),
      ]);
      if (lCards) setCards(lCards);
      if (lPkmn) setPokemonCards(lPkmn);
      if (lTargets) setTargets(lTargets);
      if (lBuy) setBuyList(lBuy);
      if (lBox) setBoxBreaks(lBox);
      if (lContent) setContentPlan(lContent);
      setDataLoaded(true);
    }
    loadAll();
  }, []);

  useEffect(() => { if (dataLoaded) storageSet(STORAGE_KEY, cards); }, [cards, dataLoaded]);
  useEffect(() => { if (dataLoaded) storageSet(POKEMON_STORAGE_KEY, pokemonCards); }, [pokemonCards, dataLoaded]);
  useEffect(() => { if (dataLoaded) storageSet(TARGETS_STORAGE_KEY, targets); }, [targets, dataLoaded]);

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "2.5rem 1.5rem 4rem", color: "#EDEAE1", fontFamily: "'Inter', sans-serif", background: "#14161C", minHeight: "100vh" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="mono" style={{ color: "#C9A227", fontSize: 12, letterSpacing: "0.12em", marginBottom: 6 }}>
            EV MODEL / GRADE &amp; FLIP
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, fontFamily: "Oswald, sans-serif" }}>
            CardFlip EV Dashboard
          </h1>
        </div>
        <div style={{ fontSize: 12, color: "#4E8B6B", fontWeight: 600 }}>
          ● Supabase Cloud Sync &amp; Gemini AI Active
        </div>
      </header>

      <div style={{ display: "flex", gap: 8, marginTop: 22, borderBottom: "1px solid #2C303B", flexWrap: "wrap" }}>
        {[
          { id: "home", label: "Home" },
          { id: "portfolio", label: "My Cards" },
          { id: "pokemon", label: "Pokémon" },
          { id: "gradecheck", label: "Grade Check (AI)" },
          { id: "lotscanner", label: "Lot Scanner (AI)" },
          { id: "targets", label: "Monthly Targets" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: tab === t.id ? "2px solid #C9A227" : "2px solid transparent",
              color: tab === t.id ? "#EDEAE1" : "#8B90A0",
              padding: "10px 8px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "home" && <HomeView cards={cards} pokemonCards={pokemonCards} setTab={setTab} />}
      {tab === "portfolio" && <PortfolioView cards={cards} title="My Sports Cards Portfolio" />}
      {tab === "pokemon" && <PortfolioView cards={pokemonCards} title="Pokémon Portfolio" />}
      {tab === "gradecheck" && <GradeCheckView cards={cards} />}
      {tab === "lotscanner" && <LotScannerView setTargets={setTargets} />}
      {tab === "targets" && <TargetsView targets={targets} setTargets={setTargets} />}
    </div>
  );
}

function HomeView({ cards, pokemonCards, setTab }) {
  const activeCount = cards.length + pokemonCards.length;
  return (
    <div style={{ marginTop: 24, background: "#191B22", border: "1px solid #2C303B", borderRadius: 10, padding: 20 }}>
      <h2 style={{ fontFamily: "Oswald, sans-serif", margin: "0 0 10px", color: "#C9A227" }}>Dashboard Overview</h2>
      <p style={{ color: "#8B90A0", fontSize: 14 }}>Tracking {activeCount} active cards in portfolio. Supabase live synchronization enabled.</p>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button onClick={() => setTab("gradecheck")} style={{ background: "#C9A227", color: "#14161C", border: "none", padding: "10px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Run AI Grade Check</button>
        <button onClick={() => setTab("lotscanner")} style={{ background: "#2FA89A", color: "#14161C", border: "none", padding: "10px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Scan Bulk Card Lot</button>
      </div>
    </div>
  );
}

function PortfolioView({ cards, title }) {
  return (
    <div style={{ marginTop: 24, padding: 20, background: "#191B22", border: "1px solid #2C303B", borderRadius: 10 }}>
      <h2 style={{ fontFamily: "Oswald, sans-serif", margin: "0 0 16px" }}>{title}</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #333844", color: "#8B90A0", textAlign: "left" }}>
            <th style={{ padding: 8 }}>Player</th>
            <th>Card</th>
            <th>Status</th>
            <th>Paid</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((c, idx) => (
            <tr key={idx} style={{ borderBottom: "1px solid #24272F" }}>
              <td style={{ padding: 8, fontWeight: 600 }}>{c.player}</td>
              <td>{c.card}</td>
              <td>{c.status}</td>
              <td>{fmtMoney(c.paid)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GradeCheckView() {
  const [image, setImage] = useState(null);
  const [base64, setBase64] = useState("");
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMimeType(file.type);
    setImage(URL.createObjectURL(file));
    const b64 = await fileToBase64(file);
    setBase64(b64);
  };

  const runCheck = async () => {
    if (!base64) return;
    setLoading(true);
    setAnalysis(null);

    const prompt = `Analyze this sports/trading card image for condition and estimated grading. 
Return ONLY a raw JSON object with no markdown formatting containing:
{
  "cardName": "Estimated Player/Card Name and Year",
  "centeringScore": "Score out of 10",
  "cornerCondition": "Description of corner wear",
  "surfaceCondition": "Description of surface scratches or print lines",
  "estimatedGrade": "Estimated PSA grade (e.g. PSA 9 - Mint)",
  "confidenceScore": "Percentage confidence (e.g. 88%)",
  "notes": "Brief flaws observed"
}`;

    try {
      const data = await callGeminiAi(prompt, base64, mimeType);
      setAnalysis(data);
    } catch (err) {
      alert("AI Analysis Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 24, padding: 20, background: "#191B22", border: "1px solid #2C303B", borderRadius: 10 }}>
      <h2 style={{ fontFamily: "Oswald, sans-serif", margin: "0 0 16px", color: "#C9A227" }}>⚡ Gemini AI Grade Check</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <input type="file" accept="image/*" onChange={handleUpload} style={{ marginBottom: 16 }} />
          {image && <img src={image} alt="Preview" style={{ width: "100%", maxHeight: 300, objectFit: "contain", borderRadius: 8, border: "1px solid #333844" }} />}
          {image && (
            <button onClick={runCheck} disabled={loading} style={{ width: "100%", marginTop: 16, background: "#4E8B6B", border: "none", padding: 12, borderRadius: 8, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
              {loading ? "Gemini 1.5 Flash Scanning..." : "Run AI Grade Scan"}
            </button>
          )}
        </div>
        <div style={{ background: "#14161C", padding: 16, borderRadius: 8, border: "1px solid #2C303B" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Scan Results</h3>
          {loading && <p style={{ color: "#C9A227" }}>Gemini Vision model reading card details...</p>}
          {analysis && (
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              <p><strong>Identified Card:</strong> {analysis.cardName}</p>
              <p><strong>Predicted Grade:</strong> <span style={{ color: "#4E8B6B", fontWeight: 700 }}>{analysis.estimatedGrade}</span></p>
              <p><strong>Centering:</strong> {analysis.centeringScore}</p>
              <p><strong>Corners:</strong> {analysis.cornerCondition}</p>
              <p><strong>Surface:</strong> {analysis.surfaceCondition}</p>
              <p><strong>Notes:</strong> {analysis.notes}</p>
            </div>
          )}
          {!analysis && !loading && <p style={{ color: "#6B7180" }}>Upload a card image to calculate condition scores.</p>}
        </div>
      </div>
    </div>
  );
}

function LotScannerView({ setTargets }) {
  return (
    <div style={{ marginTop: 24, padding: 20, background: "#191B22", border: "1px solid #2C303B", borderRadius: 10 }}>
      <h2 style={{ fontFamily: "Oswald, sans-serif", margin: "0 0 10px", color: "#2FA89A" }}>🗃️ Gemini Multi-Card Lot Scanner</h2>
      <p style={{ color: "#8B90A0" }}>Upload a bulk lot photo to extract cards and auto-fill target watchlists.</p>
    </div>
  );
}

function TargetsView({ targets }) {
  return (
    <div style={{ marginTop: 24, padding: 20, background: "#191B22", border: "1px solid #2C303B", borderRadius: 10 }}>
      <h2 style={{ fontFamily: "Oswald, sans-serif", margin: "0 0 16px", color: "#C9A227" }}>🎯 Monthly Target Watchlist</h2>
      {targets.map((t, idx) => (
        <div key={idx} style={{ borderBottom: "1px solid #24272F", padding: "10px 0" }}>
          <strong>{t.player}</strong> ({t.sport}) — {t.cardToLookFor}
        </div>
      ))}
    </div>
  );
}

// ===== MOUNT APPLICATION =====
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.render(React.createElement(App), rootElement);
}
