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

// ===== UNIVERSAL GEMINI AI HELPER (Proxied via Supabase Edge Function) =====
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

// ===== 2. STORAGE ENGINE WITH TIE-BREAKING ENVELOPES =====
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

// ===== SEED DATA =====
const SEED_CARDS = [{"player": "Amen Thompson", "card": "Prizm RC Luck OT Lottery", "cardNum": "#12", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.4, "shipping": 1.48, "feesPct": 0.137, "rawAvg": 9.29, "psa9Avg": 43.2, "psa10Avg": 16.09, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 9.29}], "psa9History": [{"date": "2026-08-07", "value": 43.2}], "psa10History": [{"date": "2026-08-07", "value": 16.09}]}];
const SEED_POKEMON = [{"player": "Arcanine EX", "card": "2023 Scarlet & Violet", "cardNum": "#032/198", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 4.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pokémon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}];
const SEED_TARGETS = [{"id": "t1", "player": "Jackson Chourio", "sport": "MLB", "cardToLookFor": "2024 Topps Chrome base rookie", "tier": "Buy Now", "researchScore": 58, "performanceTrend": "Improving", "reasoning": "Elite power/speed combo.", "targetPriceRaw": 22, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}];

// ===== UTILITY HELPERS & CALCULATIONS =====
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

// ===== MAIN APP COMPONENT =====
function App() {
  const [tab, setTab] = useState("home");

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto", color: "#EDEAE1", fontFamily: "Inter, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2C303B", paddingBottom: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "Oswald, sans-serif", fontSize: 28, margin: 0, color: "#C9A227" }}>CardFlip EV Dashboard</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8B90A0" }}>AI-Powered Sports Card & Pokémon Portfolio Analyzer</p>
        </div>
        <div style={{ fontSize: 12, color: "#4E8B6B", fontWeight: 600 }}>● Supabase Cloud Sync Active</div>
      </header>

      {/* Navigation Tabs */}
      <nav style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 10, borderBottom: "1px solid #2C303B", marginBottom: 20 }}>
        {["home", "cards", "pokemon", "gradecheck", "lotscanner", "targets"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? "#C9A227" : "#191B22",
              color: tab === t ? "#14161C" : "#EDEAE1",
              border: "1px solid #333844",
              borderRadius: 6,
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: 600,
              textTransform: "capitalize"
            }}
          >
            {t === "gradecheck" ? "Grade Check (AI)" : t === "lotscanner" ? "Lot Scanner (AI)" : t}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      {tab === "home" && <HomeView setTab={setTab} />}
      {tab === "gradecheck" && <AiGradeCheckView />}
      {tab === "lotscanner" && <AiLotScannerView />}
      {tab === "cards" && <PortfolioView title="My Sports Cards" items={SEED_CARDS} />}
      {tab === "pokemon" && <PortfolioView title="Pokémon Portfolio" items={SEED_POKEMON} />}
      {tab === "targets" && <TargetsView targets={SEED_TARGETS} />}
    </div>
  );
}

// ===== VIEWS & AI COMPONENTS =====
function HomeView({ setTab }) {
  return (
    <div style={{ background: "#191B22", border: "1px solid #2C303B", borderRadius: 10, padding: 20 }}>
      <h2 style={{ fontFamily: "Oswald, sans-serif", marginTop: 0 }}>Dashboard Overview</h2>
      <p style={{ color: "#A7ADBB", fontSize: 14 }}>Welcome to your CardFlip EV manager. Use the tabs above to manage your portfolio or run AI scans.</p>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={() => setTab("gradecheck")} style={{ background: "#C9A227", border: "none", padding: "10px 18px", borderRadius: 6, cursor: "pointer", fontWeight: 700, color: "#14161C" }}>Run AI Grade Check</button>
        <button onClick={() => setTab("lotscanner")} style={{ background: "#2FA89A", border: "none", padding: "10px 18px", borderRadius: 6, cursor: "pointer", fontWeight: 700, color: "#14161C" }}>Scan Bulk Card Lot</button>
      </div>
    </div>
  );
}

function AiGradeCheckView() {
  const [image, setImage] = useState(null);
  const [base64, setBase64] = useState("");
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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
    setResult(null);

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
      setResult(data);
    } catch (err) {
      alert("AI Scan Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#191B22", border: "1px solid #2C303B", borderRadius: 10, padding: 20 }}>
      <h2 style={{ fontFamily: "Oswald, sans-serif", marginTop: 0, color: "#C9A227" }}>⚡ Gemini AI Grade Check</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <input type="file" accept="image/*" onChange={handleUpload} style={{ marginBottom: 16 }} />
          {image && <img src={image} alt="Preview" style={{ width: "100%", maxHeight: 300, objectFit: "contain", borderRadius: 8, border: "1px solid #333844" }} />}
          {image && (
            <button onClick={runCheck} disabled={loading} style={{ width: "100%", marginTop: 16, background: "#4E8B6B", border: "none", padding: 12, borderRadius: 6, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
              {loading ? "Gemini 1.5 Flash Scanning..." : "Run AI Condition Assessment"}
            </button>
          )}
        </div>
        <div style={{ background: "#14161C", padding: 16, borderRadius: 8, border: "1px solid #2C303B" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Scan Analysis</h3>
          {loading && <p style={{ color: "#C9A227" }}>Reading centering, surface, and corners...</p>}
          {result && (
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              <p><strong>Identified Card:</strong> {result.cardName}</p>
              <p><strong>Predicted Grade:</strong> <span style={{ color: "#4E8B6B", fontWeight: 700 }}>{result.estimatedGrade}</span></p>
              <p><strong>Centering:</strong> {result.centeringScore}</p>
              <p><strong>Corners:</strong> {result.cornerCondition}</p>
              <p><strong>Surface:</strong> {result.surfaceCondition}</p>
              <p><strong>Notes:</strong> {result.notes}</p>
            </div>
          )}
          {!result && !loading && <p style={{ color: "#6B7180" }}>Upload a card image to calculate condition scores.</p>}
        </div>
      </div>
    </div>
  );
}

function AiLotScannerView() {
  return (
    <div style={{ background: "#191B22", border: "1px solid #2C303B", borderRadius: 10, padding: 20 }}>
      <h2 style={{ fontFamily: "Oswald, sans-serif", marginTop: 0, color: "#2FA89A" }}>🗃️ Gemini Multi-Card Lot Scanner</h2>
      <p style={{ color: "#A7ADBB" }}>Upload a bulk lot photo to detect players, sets, and market value estimates.</p>
    </div>
  );
}

function PortfolioView({ title, items }) {
  return (
    <div style={{ background: "#191B22", border: "1px solid #2C303B", borderRadius: 10, padding: 20 }}>
      <h2 style={{ fontFamily: "Oswald, sans-serif", marginTop: 0 }}>{title}</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #333844", color: "#8B90A0" }}>
            <th style={{ padding: 8 }}>Player</th>
            <th>Card / Set</th>
            <th>Status</th>
            <th>Paid</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: "1px solid #24272F" }}>
              <td style={{ padding: 8, fontWeight: 600 }}>{item.player}</td>
              <td>{item.card}</td>
              <td>{item.status}</td>
              <td>{fmtMoney(item.paid)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TargetsView({ targets }) {
  return (
    <div style={{ background: "#191B22", border: "1px solid #2C303B", borderRadius: 10, padding: 20 }}>
      <h2 style={{ fontFamily: "Oswald, sans-serif", marginTop: 0, color: "#C9A227" }}>🎯 Monthly Target Watchlist</h2>
      {targets.map((t, idx) => (
        <div key={idx} style={{ borderBottom: "1px solid #24272F", padding: "10px 0" }}>
          <strong>{t.player}</strong> ({t.sport}) — {t.cardToLookFor}
        </div>
      ))}
    </div>
  );
}

// ===== MOUNT REACT APPLICATION =====
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.render(React.createElement(App), rootElement);
}
