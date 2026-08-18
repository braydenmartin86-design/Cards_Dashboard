const { useState, useEffect, useMemo } = React;

// Safe Icon Proxy for Browser CDN
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

// Safe Recharts Proxy
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
  if (!supabaseClient) throw new Error("Supabase client is not initialized.");
  let cleanBase64 = imageBase64;
  if (cleanBase64 && cleanBase64.includes(",")) {
    cleanBase64 = cleanBase64.split(",")[1];
  }
  const { data, error } = await supabaseClient.functions.invoke("analyze-card", {
    body: { prompt: promptText, imageBase64: cleanBase64, mimeType: "image/jpeg" }
  });
  if (error) throw error;
  return data;
}

const SEED_CARDS = [
  {"player": "Amen Thompson", "card": "Prizm RC Luck OT Lottery", "cardNum": "#12", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.4, "shipping": 1.48, "feesPct": 0.137, "rawAvg": 9.29, "psa9Avg": 43.2, "psa10Avg": 16.09, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 9.29}], "psa9History": [{"date": "2026-08-07", "value": 43.2}], "psa10History": [{"date": "2026-08-07", "value": 16.09}]},
  {"player": "Jaren Jackson Jr", "card": "2018-19 Prizm Phenoms Silver", "cardNum": "#22", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 1.9, "shipping": 1.47, "feesPct": 0.137, "rawAvg": 4.29, "psa9Avg": 9.66, "psa10Avg": 23.03, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.29}], "psa9History": [{"date": "2026-08-07", "value": 9.66}], "psa10History": [{"date": "2026-08-07", "value": 23.03}]},
  {"player": "Jonathan Kuminga", "card": "2021-22 Obsidian Base", "cardNum": "#157", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 10.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 17.46, "psa9Avg": 15.6, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 17.46}], "psa9History": [{"date": "2026-08-07", "value": 15.6}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]},
  {"player": "Scoot Henderson", "card": "Prizm Monopoly Purple Wave", "cardNum": "#75", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 1.49, "shipping": 0.7, "feesPct": 0.137, "rawAvg": 8.09, "psa9Avg": 8.2, "psa10Avg": 16.45, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 8.09}], "psa9History": [{"date": "2026-08-07", "value": 8.2}], "psa10History": [{"date": "2026-08-07", "value": 16.45}]},
  {"player": "Trevor Lawrence", "card": "Donruss RC Elite Series", "cardNum": "#ESR-TRL", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 3.34, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 25.26, "psa9Avg": 18.57, "psa10Avg": 28.23, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 25.26}], "psa9History": [{"date": "2026-08-07", "value": 18.57}], "psa10History": [{"date": "2026-08-07", "value": 28.23}]}
];

const SEED_POKEMON = [
  {"player": "Arcanine EX", "card": "2023 Scarlet & Violet", "cardNum": "#032/198", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 4.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 8.50, "psa9Avg": 22.0, "psa10Avg": 45.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pokémon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}
];

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

function newContentItem(idea) {
  return {
    id: crypto.randomUUID(),
    title: idea?.title || "",
    platform: idea?.platform || "YouTube (long-form)",
    pillar: idea?.pillar || "Budget-Friendly Investing",
    status: "Idea",
    hook: idea?.hook || "",
    notes: idea?.outline ? idea.outline.join("\n") : "",
    dateAdded: new Date().toISOString().slice(0, 10),
  };
}
function App() {
  const [dataLoaded, setDataLoaded] = useState(true);
  const [cards, setCards] = useState(SEED_CARDS);
  const [pokemonCards, setPokemonCards] = useState(SEED_POKEMON);
  const [tab, setTab] = useState("portfolio");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sportFilter, setSportFilter] = useState("All");

  const isPokemon = tab === "pokemon";
  const activeCards = isPokemon ? pokemonCards : cards;

  const enriched = useMemo(() => activeCards.map(computeCard), [activeCards]);
  
  const filtered = useMemo(() => {
    return enriched.filter(c => {
      if (statusFilter !== "All" && c.status !== statusFilter) return false;
      if (sportFilter !== "All" && c.sport !== sportFilter) return false;
      return true;
    });
  }, [enriched, statusFilter, sportFilter]);

  const totals = useMemo(() => {
    const invested = enriched.reduce((s, c) => s + c.totalCost, 0);
    const potentialRaw = enriched.reduce((s, c) => s + (c.rawGGR || 0), 0);
    return { invested, potentialRaw, count: enriched.length, realised: 0, overallROI: 0, actionable: 0 };
  }, [enriched]);

  return (
    <div style={styles.app}>
      <GlobalStyle />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Header Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid #2C303B", paddingBottom: "1rem" }}>
          <div>
            <span className="oswald" style={{ fontSize: 26, fontWeight: 700, color: "#C9A227", letterSpacing: "0.5px" }}>CardFlip EV</span>
            <span style={{ fontSize: 12, color: "#6B7180", marginLeft: 10 }}>v2.5 Portfolio Engine</span>
          </div>
          <Navigation tab={tab} setTab={setTab} />
        </div>

        {/* Dynamic Views */}
        {(tab === "portfolio" || tab === "pokemon") && (
          <>
            <StatBar totals={totals} />
            <FilterRow 
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              sportFilter={sportFilter} setSportFilter={setSportFilter}
              isPokemon={isPokemon}
            />
            <CardTable cards={filtered} playerLabel={isPokemon ? "Pokémon / Card Name" : "Player"} />
          </>
        )}

        {tab === "sales" && <SalesView cards={enriched} />}
        {tab === "content" && <ContentView />}
        {tab === "analytics" && <AnalyticsView cards={enriched} />}
      </div>
    </div>
  );
}

function Navigation({ tab, setTab }) {
  const tabs = [
    { id: "portfolio", label: "My Sports Portfolio" },
    { id: "pokemon", label: "Pokémon Portfolio" },
    { id: "sales", label: "Sales Log" },
    { id: "content", label: "Content Planner" },
    { id: "analytics", label: "Analytics" }
  ];

  return (
    <div style={{ display: "flex", gap: 8, background: "#191B22", padding: 4, borderRadius: 8, border: "1px solid #2C303B" }}>
      {tabs.map(t => (
        <button
          key={t.id}
          className={`tabBtn ${tab === t.id ? "active" : ""}`}
          onClick={() => setTab(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function StatBar({ totals }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
      <div className="statCard">
        <div className="statLabel">ACTIVE CARDS</div>
        <div className="statVal oswald">{totals.count}</div>
      </div>
      <div className="statCard">
        <div className="statLabel">TOTAL INVESTED</div>
        <div className="statVal oswald">${totals.invested.toFixed(2)}</div>
      </div>
      <div className="statCard">
        <div className="statLabel">EST. RAW EV</div>
        <div className="statVal oswald" style={{ color: totals.potentialRaw >= 0 ? "#10B981" : "#EF4444" }}>
          ${totals.potentialRaw.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

function FilterRow({ statusFilter, setStatusFilter, sportFilter, setSportFilter, isPokemon }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: "#8B90A0", fontWeight: 600 }}>FILTERS:</span>
      <select className="selectInput" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="All">All Statuses</option>
        <option value="Raw">Raw</option>
        <option value="Graded">Graded</option>
      </select>
      {!isPokemon && (
        <select className="selectInput" value={sportFilter} onChange={e => setSportFilter(e.target.value)}>
          <option value="All">All Sports</option>
          <option value="NBA">NBA</option>
          <option value="NFL">NFL</option>
          <option value="MLB">MLB</option>
        </select>
      )}
    </div>
  );
}

function CardTable({ cards, playerLabel }) {
  return (
    <div className="tableContainer">
      <div className="tableHeader">
        <div>{playerLabel}</div>
        <div>DETAILS</div>
        <div>STATUS</div>
        <div>TOTAL COST</div>
        <div>DECISION</div>
      </div>
      {cards.length === 0 ? (
        <div style={{ padding: 20, textAlign: "center", color: "#6B7180", fontSize: 13 }}>No cards found matching current filters.</div>
      ) : (
        cards.map((c, i) => (
          <div key={i} className="tableRow">
            <div>
              <div style={{ fontWeight: 600, color: "#EDEAE1" }}>{c.player}</div>
              <div style={{ fontSize: 11, color: "#8B90A0" }}>{c.card} {c.cardNum}</div>
            </div>
            <div style={{ fontSize: 12, color: "#A7ADBB" }}>{c.sport || "Pokémon"}</div>
            <div><span className="badge">{c.status}</span></div>
            <div style={{ fontWeight: 600 }}>${c.totalCost.toFixed(2)}</div>
            <div style={{ color: "#C9A227", fontWeight: 600 }}>{c.sellDecision}</div>
          </div>
        ))
      )}
    </div>
  );
}

function SalesView({ cards }) {
  return (
    <div style={{ padding: 20, background: "#191B22", borderRadius: 8, border: "1px solid #2C303B" }}>
      <h3 className="oswald" style={{ margin: "0 0 10px 0", color: "#C9A227" }}>Sales Log & Realized P/L</h3>
      <p style={{ fontSize: 13, color: "#A7ADBB" }}>Track sold inventory, fees, and net profit margins across eBay and local deals.</p>
    </div>
  );
}

function ContentView() {
  return (
    <div style={{ padding: 20, background: "#191B22", borderRadius: 8, border: "1px solid #2C303B" }}>
      <h3 className="oswald" style={{ margin: "0 0 10px 0", color: "#C9A227" }}>Content Idea Pipeline</h3>
      <p style={{ fontSize: 13, color: "#A7ADBB" }}>Plan YouTube shorts, long-form videos, and social posts linked to your portfolio gains.</p>
    </div>
  );
}

function AnalyticsView({ cards }) {
  return (
    <div style={{ padding: 20, background: "#191B22", borderRadius: 8, border: "1px solid #2C303B" }}>
      <h3 className="oswald" style={{ margin: "0 0 10px 0", color: "#C9A227" }}>Portfolio Analytics & EV Exposure</h3>
      <p style={{ fontSize: 13, color: "#A7ADBB" }}>Breakdown of grading ROI probabilities, held assets, and sport allocation percentages.</p>
    </div>
  );
}

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; background-color: #14161C; }
      .oswald { font-family: 'Oswald', sans-serif; }
      .tabBtn { background: transparent; border: none; color: #8B90A0; padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
      .tabBtn:hover { color: #EDEAE1; }
      .tabBtn.active { background: #2C303B; color: #EDEAE1; font-weight: 600; }
      .statCard { background: #191B22; padding: 16px; borderRadius: 8px; border: 1px solid #2C303B; }
      .statLabel { fontSize: 11px; color: #8B90A0; font-weight: 600; letter-spacing: 0.5px; }
      .statVal { fontSize: 22px; margin-top: 4px; color: #EDEAE1; }
      .selectInput { background: #191B22; border: 1px solid #2C303B; color: #EDEAE1; padding: 6px 12px; border-radius: 6px; font-size: 13px; outline: none; }
      .tableContainer { border: 1px solid #2C303B; borderRadius: 8px; background: #191B22; overflow: hidden; }
      .tableHeader { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; padding: 12px 16px; background: #1D2028; font-size: 11px; color: #8B90A0; font-weight: 600; border-bottom: 1px solid #2C303B; }
      .tableRow { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; padding: 14px 16px; border-top: 1px solid #24272F; font-size: 13px; align-items: center; }
      .badge { background: #24272F; color: #A7ADBB; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
    `}</style>
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

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.render(React.createElement(App), rootElement);
}
