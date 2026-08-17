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

// ===== 2. STORAGE ENGINE WITH TIE-BREAKING ENVELOPES =====
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

// Global Supabase AI Call Helper
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
const SEED_CARDS = [{"player": "Amen Thompson", "card": "Prizm RC Luck OT Lottery", "cardNum": "#12", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.4, "shipping": 1.48, "feesPct": 0.137, "rawAvg": 9.29, "psa9Avg": 43.2, "psa10Avg": 16.09, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 9.29}], "psa9History": [{"date": "2026-08-07", "value": 43.2}], "psa10History": [{"date": "2026-08-07", "value": 16.09}]}];
const SEED_POKEMON = [{"player": "Arcanine EX", "card": "2023 Scarlet & Violet", "cardNum": "#032/198", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 4.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pokémon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}];
const SEED_TARGETS = [{"id": "t1", "player": "Jackson Chourio", "sport": "MLB", "cardToLookFor": "2024 Topps Chrome base rookie", "tier": "Buy Now", "researchScore": 58, "performanceTrend": "Improving", "reasoning": "Elite power/speed combo.", "targetPriceRaw": 22, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}];

// ===== RENDER COMPONENT ENTRY POINT =====
function App() {
  return (
    <div style={{ padding: 20, textAlign: "center", color: "#EDEAE1", background: "#14161C", minHeight: "100vh" }}>
      <h1 style={{ fontFamily: "Oswald, sans-serif" }}>CardFlip EV Dashboard</h1>
      <p style={{ color: "#4E8B6B" }}>Connected cleanly to Supabase & Gemini AI Proxy.</p>
    </div>
  );
}

// Mount React Root
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.render(React.createElement(App), rootElement);
}
