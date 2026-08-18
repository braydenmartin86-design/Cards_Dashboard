// Extract React hooks directly from window.React
const React = window.React;
const useState = React.useState;
const useEffect = React.useEffect;
const useMemo = React.useMemo;

// Safe icon proxy for browser CDN
const IconProxy = new Proxy({}, {
  get: (target, name) => {
    if (window.lucide && window.lucide.icons && window.lucide.icons[name]) {
      const IconComp = window.lucide.icons[name];
      return (props) => React.createElement(IconComp, props);
    }
    return () => null;
  }
});
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

// Safe Recharts proxy
const RC = window.Recharts || {};
const LineChart = RC.LineChart || (() => null);
const Line = RC.Line || (() => null);
const ResponsiveContainer = RC.ResponsiveContainer || (({ children }) => children);
const YAxis = RC.YAxis || (() => null);

// Supabase Init
let supabaseClient = null;
try {
  if (window.supabase && window.SUPABASE_URL && window.SUPABASE_URL !== "https://your-supabase-url.supabase.co") {
    supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn("Supabase init fallback:", e);
}

// Universal AI Call Proxy
async function callGeminiAi(promptText, imageBase64 = null, mimeType = "image/jpeg") {
  if (!supabaseClient) {
    throw new Error("Supabase client is not initialized.");
  }

  let cleanBase64 = imageBase64;
  if (cleanBase64 && cleanBase64.includes(",")) {
    cleanBase64 = cleanBase64.split(",")[1];
  }

  const { data, error } = await supabaseClient.functions.invoke("analyze-card", {
    body: {
      prompt: promptText,
      imageBase64: cleanBase64,
      mimeType: "image/jpeg"
    }
  });

  if (error) {
    console.error("Supabase Functions Error:", error);
    throw error;
  }

  return data;
}

const SEED_CARDS = [{"player": "Amen Thompson", "card": "Prizm RC Luck OT Lottery", "cardNum": "#12", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.4, "shipping": 1.48, "feesPct": 0.137, "rawAvg": 9.29, "psa9Avg": 43.2, "psa10Avg": 16.09, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 9.29}], "psa9History": [{"date": "2026-08-07", "value": 43.2}], "psa10History": [{"date": "2026-08-07", "value": 16.09}]}, {"player": "Jaren Jackson Jr", "card": "2018-19 Prizm Phenoms Silver", "cardNum": "#22", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 1.9, "shipping": 1.47, "feesPct": 0.137, "rawAvg": 4.29, "psa9Avg": 9.66, "psa10Avg": 23.03, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.29}], "psa9History": [{"date": "2026-08-07", "value": 9.66}], "psa10History": [{"date": "2026-08-07", "value": 23.03}]}, {"player": "Jonathan Kuminga", "card": "2021-22 Obsidian Base", "cardNum": "#157", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 10.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 17.46, "psa9Avg": 15.6, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 17.46}], "psa9History": [{"date": "2026-08-07", "value": 15.6}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Scoot Henderson", "card": "Prizm Monopoly Purple Wave", "cardNum": "#75", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 1.49, "shipping": 0.7, "feesPct": 0.137, "rawAvg": 8.09, "psa9Avg": 8.2, "psa10Avg": 16.45, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 8.09}], "psa9History": [{"date": "2026-08-07", "value": 8.2}], "psa10History": [{"date": "2026-08-07", "value": 16.45}]}, {"player": "Trevor Lawrence", "card": "Donruss RC Elite Series", "cardNum": "#ESR-TRL", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 3.34, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 25.26, "psa9Avg": 18.57, "psa10Avg": 28.23, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 25.26}], "psa9History": [{"date": "2026-08-07", "value": 18.57}], "psa10History": [{"date": "2026-08-07", "value": 28.23}]}];

const SEED_POKEMON = [{"player": "Arcanine EX", "card": "2023 Scarlet & Violet", "cardNum": "#032/198", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 4.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pokémon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}];

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

function computeCard(c) {
  const holdingCost = (c.shipMyCards || "").toLowerCase() === "yes" ? 4.5 : 0;
  const totalCost = c.paid + c.shipping + holdingCost + (c.gradingCostPaid || 0);
  const fees = c.feesPct;
  const raw = c.rawAvg ?? 0;
  const psa9 = c.psa9Avg ?? 0;
  const psa10 = c.psa10Avg ?? c.psa9Avg ?? 0;

  const rawGGR = raw * (1 - fees) - totalCost;
  const psa9GGR = psa9 * (1 - fees) - totalCost - gradingCost(c.gradingService, Math.max(psa9, psa10));
  const psa10GGR = psa10 * (1 - fees) - totalCost - gradingCost(c.gradingService, Math.max(psa9, psa10));

  let sellDecision = "Hold";
  if (psa10GGR >= 20 && psa9GGR >= 0) sellDecision = "Grade First";
  else if (rawGGR >= 5) sellDecision = "Sell Raw First";

  return { ...c, totalCost, rawGGR, psa9GGR, psa10GGR, sellDecision };
}

function computePokemonCard(c) {
  return computeCard(c);
}

const STORAGE_KEY = "cardflip_ev_portfolio_v1";
const POKEMON_STORAGE_KEY = "cardflip_ev_pokemon_v1";

function App() {
  const [dataLoaded, setDataLoaded] = useState(true);
  const [cards, setCards] = useState(SEED_CARDS);
  const [pokemonCards, setPokemonCards] = useState(SEED_POKEMON);
  const [tab, setTab] = useState("portfolio");

  const isPokemon = tab === "pokemon";
  const activeCards = isPokemon ? pokemonCards : cards;
  const computeFn = isPokemon ? computePokemonCard : computeCard;

  const enriched = useMemo(() => activeCards.map(computeFn), [activeCards, computeFn]);
  const filtered = enriched;

  const totals = useMemo(() => {
    const invested = enriched.reduce((s, c) => s + c.totalCost, 0);
    const potentialRaw = enriched.reduce((s, c) => s + (c.rawGGR || 0), 0);
    return { invested, potentialRaw, count: enriched.length, realised: 0, overallROI: 0, actionable: 0 };
  }, [enriched]);

  return (
    <div style={styles.app}>
      <GlobalStyle />
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <Header tab={tab} setTab={setTab} />
        {(tab === "portfolio" || tab === "pokemon") && (
          <>
            <StatBar totals={totals} />
            <CardTable cards={filtered} playerLabel={isPokemon ? "Pokémon / Card Name" : "Player"} />
          </>
        )}
      </div>
    </div>
  );
}
function Header({ tab, setTab }) {
  return (
    <div style={{ display: "flex", gap: 12, borderBottom: "1px solid #2C303B", paddingBottom: 12 }}>
      <button className={`filterBtn ${tab === "portfolio" ? "active" : ""}`} onClick={() => setTab("portfolio")}>My Cards</button>
      <button className={`filterBtn ${tab === "pokemon" ? "active" : ""}`} onClick={() => setTab("pokemon")}>Pokémon</button>
    </div>
  );
}

function StatBar({ totals }) {
  return (
    <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
      <div style={{ background: "#191B22", padding: 14, borderRadius: 8 }}>
        <div style={{ fontSize: 11, color: "#8B90A0" }}>ACTIVE CARDS</div>
        <div className="oswald" style={{ fontSize: 20 }}>{totals.count}</div>
      </div>
      <div style={{ background: "#191B22", padding: 14, borderRadius: 8 }}>
        <div style={{ fontSize: 11, color: "#8B90A0" }}>INVESTED</div>
        <div className="oswald" style={{ fontSize: 20 }}>${totals.invested.toFixed(2)}</div>
      </div>
    </div>
  );
}

function CardTable({ cards, playerLabel }) {
  return (
    <div style={{ marginTop: 20, border: "1px solid #2C303B", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "10px 14px", background: "#1D2028", fontSize: 11, color: "#8B90A0" }}>
        <div>{playerLabel}</div>
        <div>STATUS</div>
        <div>COST</div>
        <div>DECISION</div>
      </div>
      {cards.map((c, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 14px", borderTop: "1px solid #24272F", fontSize: 13 }}>
          <div>{c.player} - {c.card}</div>
          <div>{c.status}</div>
          <div>${c.totalCost.toFixed(2)}</div>
          <div style={{ color: "#C9A227" }}>{c.sellDecision}</div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    width: "100%",
    background: "#14161C",
    color: "#EDEAE1",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
};

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; }
      .oswald { font-family: 'Oswald', sans-serif; }
      .filterBtn { background: transparent; border: 1px solid #333844; color: #A7ADBB; padding: 6px 14px; border-radius: 999px; font-size: 13px; cursor: pointer; }
      .filterBtn.active { background: #EDEAE1; color: #14161C; font-weight: 600; }
    `}</style>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.render(React.createElement(App), rootElement);
}
