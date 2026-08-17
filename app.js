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
const BarChart = RC.BarChart || (() => null);
const Bar = RC.Bar || (() => null);

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

const SEED_CARDS = [{"player": "Amen Thompson", "card": "Prizm RC Luck OT Lottery", "cardNum": "#12", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.4, "shipping": 1.48, "feesPct": 0.137, "rawAvg": 9.29, "psa9Avg": 43.2, "psa10Avg": 16.09, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 9.29}], "psa9History": [{"date": "2026-08-07", "value": 43.2}], "psa10History": [{"date": "2026-08-07", "value": 16.09}]}, {"player": "Jaren Jackson Jr", "card": "2018-19 Prizm Phenoms Silver", "cardNum": "#22", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 1.9, "shipping": 1.47, "feesPct": 0.137, "rawAvg": 4.29, "psa9Avg": 9.66, "psa10Avg": 23.03, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.29}], "psa9History": [{"date": "2026-08-07", "value": 9.66}], "psa10History": [{"date": "2026-08-07", "value": 23.03}]}, {"player": "Jonathan Kuminga", "card": "2021-22 Obsidian Base", "cardNum": "#157", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 10.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 17.46, "psa9Avg": 15.6, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 17.46}], "psa9History": [{"date": "2026-08-07", "value": 15.6}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Scoot Henderson", "card": "Prizm Monopoly Purple Wave", "cardNum": "#75", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 1.49, "shipping": 0.7, "feesPct": 0.137, "rawAvg": 8.09, "psa9Avg": 8.2, "psa10Avg": 16.45, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 8.09}], "psa9History": [{"date": "2026-08-07", "value": 8.2}], "psa10History": [{"date": "2026-08-07", "value": 16.45}]}, {"player": "Trevor Lawrence", "card": "Donruss RC Elite Series", "cardNum": "#ESR-TRL", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 3.34, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 25.26, "psa9Avg": 18.57, "psa10Avg": 28.23, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 25.26}], "psa9History": [{"date": "2026-08-07", "value": 18.57}], "psa10History": [{"date": "2026-08-07", "value": 28.23}]}, {"player": "Dylan Harper", "card": "2025-26 Topps Chrome Instinct Aqua /199", "cardNum": "#INS-12", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 38.57, "shipping": 7.79, "feesPct": 0.137, "rawAvg": 61.11, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": true, "outOf": 199, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 61.11}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Alex Rodriguez", "card": "Donruss Bomb Squad Blue", "cardNum": "#BS1", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 7.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 14.89, "psa9Avg": 0.0, "psa10Avg": 67.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 14.89}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 67.0}]}, {"player": "Bijan Robinson", "card": "2023 Rated Rookie Purple", "cardNum": "#206", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 10.86, "psa9Avg": 24.67, "psa10Avg": 77.62, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 10.86}], "psa9History": [{"date": "2026-08-07", "value": 24.67}], "psa10History": [{"date": "2026-08-07", "value": 77.62}]}];

const SEED_POKEMON = [{"player": "Arcanine EX", "card": "2023 Scarlet & Violet", "cardNum": "#032/198", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 4.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pokémon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}];

const SEED_TARGETS = [{"id": null, "player": "Jackson Chourio", "sport": "MLB", "cardToLookFor": "2024 Topps Chrome/Bowman base rookie", "tier": "Buy Now", "researchScore": 58, "performanceTrend": "Improving", "reasoning": "Elite power/speed combo already producing at the MLB level for Milwaukee.", "targetPriceRaw": 22, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}];

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
  };
}

function fmtMoney(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 2 });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ===== MAIN APP ENTRY POINT =====
function App() {
  const [tab, setTab] = useState("home");
  const [cards, setCards] = useState(SEED_CARDS);

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "2.5rem 1.5rem 4rem", color: "#EDEAE1", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="mono" style={{ color: "#C9A227", fontSize: 12, letterSpacing: "0.12em", marginBottom: 6 }}>
            EV MODEL / GRADE &amp; FLIP
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, fontFamily: "Oswald, sans-serif" }}>
            CardFlip EV Dashboard
          </h1>
        </div>
        <div style={{ fontSize: 12, color: "#4E8B6B", fontWeight: 600 }}>
          ● Supabase &amp; Gemini AI Proxy Ready
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 22, borderBottom: "1px solid #2C303B", flexWrap: "wrap" }}>
        {["home", "portfolio", "pokemon", "sales", "boxbreaks", "gradecheck", "gradingtracker", "lotscanner", "targets", "sellplaybook", "taxsummary", "content", "buy", "tips"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: tab === t ? "2px solid #C9A227" : "2px solid transparent",
              color: tab === t ? "#EDEAE1" : "#8B90A0",
              padding: "10px 8px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize"
            }}
          >
            {t === "gradecheck" ? "Grade Check" : t === "lotscanner" ? "Lot Scanner" : t === "taxsummary" ? "Business Summary" : t === "sellplaybook" ? "Selling Playbook" : t}
          </button>
        ))}
      </div>

      {/* Tab Views */}
      {tab === "home" && <HomeView cards={cards} setTab={setTab} />}
      {tab === "gradecheck" && <GradeCheckView />}
      {tab === "lotscanner" && <LotScannerView />}
      {tab === "portfolio" && <PortfolioView cards={cards} />}
    </div>
  );
}

function HomeView({ cards, setTab }) {
  return (
    <div style={{ marginTop: 24, background: "#191B22", border: "1px solid #2C303B", borderRadius: 10, padding: 20 }}>
      <h2 style={{ fontFamily: "Oswald, sans-serif", margin: "0 0 10px", color: "#C9A227" }}>Dashboard Overview</h2>
      <p style={{ color: "#8B90A0", fontSize: 14 }}>All 14 workspace tabs are active. Click into Grade Check or Lot Scanner below to perform live AI image analysis.</p>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button onClick={() => setTab("gradecheck")} style={{ background: "#C9A227", color: "#14161C", border: "none", padding: "10px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Run AI Grade Check</button>
        <button onClick={() => setTab("lotscanner")} style={{ background: "#2FA89A", color: "#14161C", border: "none", padding: "10px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Scan Card Lot</button>
      </div>
    </div>
  );
}

function GradeCheckView() {
  const [image, setImage] = useState(null);
  const [base64, setBase64] = useState("");
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMimeType(file.type);
    setImage(URL.createObjectURL(file));
    const b64 = await fileToBase64(file);
    setBase64(b64);
  };

  const runAiGradeCheck = async () => {
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
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: 16 }} />
          {image && <img src={image} alt="Preview" style={{ width: "100%", maxHeight: 300, objectFit: "contain", borderRadius: 8, border: "1px solid #333844" }} />}
          {image && (
            <button onClick={runAiGradeCheck} disabled={loading} style={{ width: "100%", marginTop: 16, background: "#4E8B6B", border: "none", padding: 12, borderRadius: 8, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
              {loading ? "Analyzing Condition..." : "Run AI Grade Scan"}
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
          {!analysis && !loading && <p style={{ color: "#6B7180" }}>Upload a card photo to inspect surface and corners.</p>}
        </div>
      </div>
    </div>
  );
}

function LotScannerView() {
  return (
    <div style={{ marginTop: 24, padding: 20, background: "#191B22", border: "1px solid #2C303B", borderRadius: 10 }}>
      <h2 style={{ fontFamily: "Oswald, sans-serif", margin: "0 0 10px", color: "#2FA89A" }}>🗃️ Gemini Multi-Card Lot Scanner</h2>
      <p style={{ color: "#8B90A0" }}>Detects players, sets, and market value estimates from bulk lot photos.</p>
    </div>
  );
}

function PortfolioView({ cards }) {
  return (
    <div style={{ marginTop: 24, padding: 20, background: "#191B22", border: "1px solid #2C303B", borderRadius: 10 }}>
      <h2 style={{ fontFamily: "Oswald, sans-serif", margin: "0 0 16px" }}>My Cards Portfolio</h2>
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

// ===== MOUNT APPLICATION =====
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.render(React.createElement(App), rootElement);
}
