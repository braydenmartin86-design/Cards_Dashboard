// Monthly Targets tab.

async function generateAiMonthlyTargets(cards = [], pokemonCards = []) {
  const sportsSummary = [...(cards || []), ...(pokemonCards || [])]
    .map(c => `${c.player || c.name || "Card"} (${c.sport || "TCG"})`)
    .slice(0, 10)
    .join(", ");

  const prompt = `
Generate EXACTLY 20 current market buy/speculative targets for a sports and trading card investor based on their current collection interest (${sportsSummary || "Various sports/Pokémon"}).

IMPORTANT SCORING & REASONING RULES:
1. 'researchScore': Number between 20 and 92. Reserve 88-92 exclusively for premier modern grails/blue-chips.
2. 'reasoning': Must be a detailed 3-part rationale covering:
   - Primary Catalyst (e.g. print status, out-of-print sealed supply, player performance momentum).
   - Key Risk Factor (e.g. population growth, off-season lull, price volatility).
   - Strategic Entry (e.g. target buy window, raw for grading vs graded spread).

Return ONLY a valid JSON array of EXACTLY 20 objects matching this exact structure:
[
  {
    "player": "Player Name",
    "sport": "NBA/NFL/MLB/Soccer/Pokémon",
    "cardToLookFor": "Specific parallel or card set",
    "tier": "Buy Now",
    "researchScore": 88,
    "performanceTrend": "Improving",
    "reasoning": "Primary Catalyst: ... Key Risk: ... Strategic Entry: ...",
    "targetPriceRaw": 45,
    "targetPriceGraded": "",
    "status": "Watching"
  }
]
Tiers allowed: "Buy Now", "Speculative".
Trends allowed: "Improving", "Stable".
`;

  try {
    const rawText = await callGeminiAi(prompt);
    if (!rawText || typeof rawText !== "string") throw new Error("Invalid AI response");
    const cleanJson = rawText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("Failed to generate AI targets:", err);
    return null;
  }
}

// ===== Monthly Targets =====

const TARGET_TIER_STYLE = {
  "Buy Now": { color: "#4E8B6B" },
  Speculative: { color: "#C9A227" },
};
const TARGET_STATUS_OPTIONS = ["Watching", "Bought", "Passed"];

// Price bands for filtering the target list by budget — activates automatically once a
// target has a price entered (raw preferred, falling back to graded if that's all that's set).
const PRICE_RANGES = [
  { key: "0-100", label: "$0 - $100", min: 0, max: 100 },
  { key: "100-200", label: "$100 - $200", min: 100, max: 200 },
  { key: "200-300", label: "$200 - $300", min: 200, max: 300 },
  { key: "300-500", label: "$300 - $500", min: 300, max: 500 },
  { key: "500-800", label: "$500 - $800", min: 500, max: 800 },
  { key: "800+", label: "$800+", min: 800, max: Infinity },
];

function getTargetPrice(t) {
  const raw = Number(t.targetPriceRaw);
  const graded = Number(t.targetPriceGraded);
  if (raw > 0) return raw;
  if (graded > 0) return graded;
  return null;
}

function getPriceRange(price) {
  if (price == null) return null;
  return PRICE_RANGES.find((r) => price >= r.min && price < r.max) || PRICE_RANGES[PRICE_RANGES.length - 1];
}

// Confidence score bands: how likely this is to make money, not a guarantee.
function confidenceColor(score) {
  const s = Number(score) || 0;
  if (s >= 70) return "#4E8B6B"; // green
  if (s >= 50) return "#C9A227"; // yellow
  if (s >= 30) return "#D08A3E"; // orange
  return "#B4472E"; // red
}

// Displayed score is never set by hand — it's the research baseline (set when a target is
// researched/refreshed) minus automatic decay for how long it's gone unrefreshed. But blind
// time-decay is a blunt instrument: a player still performing well six months on shouldn't
// look worse just because nobody revisited the page. Performance trend controls how fast
// decay applies — "Improving" (e.g. still playing at an elite level, market catching up to
// undervaluation) barely decays at all, "Declining" decays much faster, "Stable" is the
// default rate.
const CONFIDENCE_GRACE_MONTHS = 1;
const CONFIDENCE_DECAY_PER_MONTH = 5;
const CONFIDENCE_MAX_DECAY = 30;
const TREND_DECAY_MULTIPLIER = { Improving: 0.35, Stable: 1, Declining: 1.8 };
const TREND_STYLE = {
  Improving: { color: "#4E8B6B", icon: "↗" },
  Stable: { color: "#5C7A99", icon: "→" },
  Declining: { color: "#B4472E", icon: "↘" },
};

function monthsSince(dateStr) {
  if (!dateStr) return 0;
  const then = new Date(dateStr);
  const now = new Date();
  if (isNaN(then.getTime())) return 0;
  const months = (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth());
  const dayFraction = (now.getDate() - then.getDate()) / 30;
  return Math.max(0, months + dayFraction);
}

function computeConfidence(target) {
  // Unknown/unresearched (no researchScore on record at all) skews low, not neutral —
  // "we don't know" shouldn't read as "medium confidence."
  const hasScore = target.researchScore != null || target.confidence != null;
  const base = hasScore ? Number(target.researchScore ?? target.confidence) || 0 : 30;
  const age = monthsSince(target.lastRefreshed || target.monthAdded);
  const trendMult = TREND_DECAY_MULTIPLIER[target.performanceTrend] ?? 1;
  const decay = Math.min(CONFIDENCE_MAX_DECAY, Math.max(0, (age - CONFIDENCE_GRACE_MONTHS) * CONFIDENCE_DECAY_PER_MONTH * trendMult));
  return Math.max(0, Math.round(base - decay));
}

function newTarget() {
  return {
    id: crypto.randomUUID(),
    player: "",
    sport: "NFL",
    cardToLookFor: "",
    tier: "Buy Now",
    researchScore: 50,
    performanceTrend: "Stable",
    reasoning: "",
    targetPriceRaw: "",
    targetPriceGraded: "",
    status: "Watching",
    monthAdded: new Date().toISOString().slice(0, 10),
    lastRefreshed: new Date().toISOString().slice(0, 10),
  };
}
function MonthlyTargets({ targets, setTargets, cards, pokemonCards }) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [justMerged, setJustMerged] = useState(null);
  const [tierFilter, setTierFilter] = useState("all");
  const [priceRangeFilter, setPriceRangeFilter] = useState("all");
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  function addTarget(t) {
    setTargets((prev) => [t, ...prev]);
    setShowAdd(false);
  }

  function updateTarget(id, updates) {
    setTargets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }

  function deleteTarget(id) {
    setTargets((prev) => prev.filter((t) => t.id !== id));
    setSelectedId(null);
  }

  // AI-powered Refresh from Research
  async function loadNewSuggestions() {
    setIsRefreshing(true);
    const today = new Date().toISOString().slice(0, 10);
    const aiTargets = await generateAiMonthlyTargets(cards, pokemonCards);

    if (aiTargets && Array.isArray(aiTargets) && aiTargets.length > 0) {
      const formatted = aiTargets.map((t) => ({
        ...t,
        id: crypto.randomUUID(),
        monthAdded: today,
        lastRefreshed: today,
      }));
      setTargets(formatted);
      setJustMerged({ added: formatted.length, updated: 0 });
    } else {
      alert("Could not fetch fresh research from AI right now. Please try again.");
    }
    setIsRefreshing(false);
    setTimeout(() => setJustMerged(null), 4000);
  }

  // Reset list directly to SEED_TARGETS
  function hardReset() {
    const today = new Date().toISOString().slice(0, 10);
    setTargets(SEED_TARGETS.map((t) => ({ ...t, id: crypto.randomUUID(), monthAdded: today, lastRefreshed: today })));
    setJustMerged({ added: SEED_TARGETS.length, updated: 0 });
    setConfirmingReset(false);
    setTimeout(() => setJustMerged(null), 4000);
  }

  const watching = (targets || []).filter((t) => t.status === "Watching").length;
  const bought = (targets || []).filter((t) => t.status === "Bought").length;
  const selected = selectedId ? (targets || []).find((t) => t.id === selectedId) : null;
  const avgConfidence = (targets || []).length
    ? Math.round((targets || []).reduce((s, t) => s + computeConfidence(t), 0) / targets.length)
    : null;

  const visible = useMemo(() => {
    let list = targets || [];
    if (tierFilter !== "all") list = list.filter((t) => t.tier === tierFilter);
    if (priceRangeFilter === "unpriced") {
      list = list.filter((t) => getTargetPrice(t) == null);
    } else if (priceRangeFilter !== "all") {
      list = list.filter((t) => getPriceRange(getTargetPrice(t))?.key === priceRangeFilter);
    }
    return [...list].sort((a, b) => computeConfidence(b) - computeConfidence(a));
  }, [targets, tierFilter, priceRangeFilter]);

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1, background: "#2C303B", border: "1px solid #2C303B", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
        <Stat label="Watching" value={watching} color="#5C7A99" />
        <Stat label="Bought" value={bought} color="#4E8B6B" />
        <Stat label="Total on list" value={(targets || []).length} />
        <Stat label="Avg confidence" value={avgConfidence != null ? avgConfidence : "—"} color={avgConfidence != null ? confidenceColor(avgConfidence) : undefined} />
      </div>

      <div style={{ fontSize: 12, color: "#8B90A0", marginBottom: 16, lineHeight: 1.6 }}>
        A running watchlist of players/cards worth researching for future investment — not a buy signal on its own. The hobby moves fast; treat anything more than a month or two old as a starting point to re-check, not current pricing.
        <span style={{ color: "#C9A227" }}> "Buy Now"</span> = already rostered/debuted with a real rookie card out.
        <span style={{ color: "#C9A227" }}> "Speculative"</span> = pre-rookie or not yet drafted — cheaper entry, real risk it doesn't pan out.
      </div>

      <AskCardSight
        title="Research a target with CardSight"
        placeholder="e.g. What's a good Cooper Flagg rookie under $100?"
        suggestions={["Best rookie cards under $100 to buy right now?", "Which rookies' card prices are rising fastest?", "Is now a good time to buy Victor Wembanyama rookies?"]}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", marginBottom: 4 }}>Tier</label>
            <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} style={{ width: "auto", minWidth: 160 }}>
              <option value="all">All tiers</option>
              <option value="Buy Now">Buy Now</option>
              <option value="Speculative">Speculative</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 4 }}>Price range</label>
            <select value={priceRangeFilter} onChange={(e) => setPriceRangeFilter(e.target.value)} style={{ width: "auto", minWidth: 160 }}>
              <option value="all">All prices</option>
              {PRICE_RANGES.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
              <option value="unpriced">No price set</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {justMerged != null && (
            <span style={{ fontSize: 12, color: "#4E8B6B" }}>
              Successfully refreshed targets from research
            </span>
          )}
          <button className="btnSecondary" onClick={loadNewSuggestions} disabled={isRefreshing}>
            <RefreshCw size={14} style={{ marginRight: 6 }} />
            {isRefreshing ? "✨ Analyzing Market..." : "Refresh from research"}
          </button>
          {!confirmingReset ? (
            <button className="btnSecondary" onClick={() => setConfirmingReset(true)} style={{ color: "#B4472E" }}>
              Reset list
            </button>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#B4472E" }}>Discard custom targets — sure?</span>
              <button className="btnSecondary" onClick={hardReset} style={{ color: "#B4472E", fontWeight: 700 }}>
                Yes, reset
              </button>
              <button className="btnSecondary" onClick={() => setConfirmingReset(false)}>
                Cancel
              </button>
            </span>
          )}
          <button className="btnPrimary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add target
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div style={{ padding: "3rem 0", textAlign: "center", color: "#5C6270", border: "1px solid #2C303B", borderRadius: 10 }}>
          {(targets || []).length === 0 ? "No targets yet." : "No targets match this filter."}
        </div>
      ) : (
        <div style={{ border: "1px solid #2C303B", borderRadius: 10, overflow: "hidden" }}>
          {visible.map((t) => (
            <TargetRow key={t.id} t={t} onClick={() => setSelectedId(t.id)} />
          ))}
        </div>
      )}

      {showAdd && <TargetModal onClose={() => setShowAdd(false)} onSave={addTarget} />}
      {selected && <TargetDetailModal target={selected} onUpdate={updateTarget} onDelete={deleteTarget} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
function cleanCardHint(text) {
  if (!text) return "";
  return text.split(/[—(,]/)[0].trim();
}

function TargetRow({ t, onClick }) {
  const tierStyle = TARGET_TIER_STYLE[t.tier] || TARGET_TIER_STYLE["Buy Now"];
  const statusColor = t.status === "Bought" ? "#4E8B6B" : t.status === "Passed" ? "#5C6270" : "#5C7A99";
  const score = computeConfidence(t);
  const confColor = confidenceColor(score);
  const [copyState, setCopyState] = useState("idle");
  const priceRange = getPriceRange(getTargetPrice(t));

  const searchText = [t.player.replace(/["\u201c\u201d]/g, "").trim(), cleanCardHint(t.cardToLookFor)].filter(Boolean).join(" ");
  const ebayUrl = `https://www.ebay.com.au/sch/i.html?_nkw=${encodeURIComponent(searchText)}`;

  async function copy(e) {
    e.stopPropagation();
    const ok = await copyToClipboard(searchText);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => setCopyState("idle"), 2000);
  }

  return (
    <div
      onClick={onClick}
      className="cardRow"
      style={{ padding: "14px 16px", borderTop: "1px solid #24272F", borderLeft: `4px solid ${confColor}`, cursor: "pointer", fontSize: 13 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            title="Confidence score — how likely this makes you money"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 10,
              background: `${confColor}1f`,
              border: `1.5px solid ${confColor}`,
              flexShrink: 0,
            }}
          >
            <span className="oswald" style={{ fontSize: 17, fontWeight: 700, color: confColor, lineHeight: 1 }}>
              {score}
            </span>
            <span className="mono" style={{ fontSize: 7.5, color: confColor, letterSpacing: "0.04em" }}>SCORE</span>
          </div>
          <div>
            <span className="oswald" style={{ fontWeight: 600, fontSize: 15 }}>{t.player}</span>
            <span className="mono" style={{ fontSize: 10, color: "#6B7180", marginLeft: 8 }}>{SPORT_EMOJI[t.sport] || "🎴"} {t.sport}</span>
            {t.performanceTrend && (
              <span className="mono" style={{ fontSize: 10, color: TREND_STYLE[t.performanceTrend]?.color || "#6B7180", marginLeft: 8 }}>
                {TREND_STYLE[t.performanceTrend]?.icon} {t.performanceTrend}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          {priceRange && (
            <span className="mono" style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: "#5C7A9922", color: "#5C7A99" }}>
              {priceRange.label}
            </span>
          )}
          <span className="mono" style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: `${tierStyle.color}22`, color: tierStyle.color }}>
            {t.tier}
          </span>
          <span className="mono" style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: `${statusColor}22`, color: statusColor }}>
            {t.status}
          </span>
          <ChevronRight size={14} style={{ color: "#5C6270" }} />
        </div>
      </div>
      {t.cardToLookFor && (
        <div style={{ fontSize: 11.5, color: "#8B90A0", marginBottom: 4 }}>{t.cardToLookFor}</div>
      )}
      <div style={{ color: "#C6CAD4", fontSize: 12.5, lineHeight: 1.6, marginBottom: 10 }}>{t.reasoning}</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button className="btnSecondary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, padding: "5px 10px" }} onClick={copy}>
          {copyState === "copied" ? <Check size={12} /> : <Copy size={12} />} {copyState === "copied" ? "Copied" : "Copy search"}
        </button>
        <a
          href={ebayUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="btnSecondary"
          style={{ display: "flex", alignItems: "center", fontSize: 11.5, padding: "5px 10px", textDecoration: "none" }}
        >
          Search eBay
        </a>
        {copyState === "failed" && <span style={{ fontSize: 11, color: "#B4472E" }}>Couldn't auto-copy — try again</span>}
      </div>
    </div>
  );
}

function TargetModal({ onClose, onSave }) {
  const [form, setForm] = useState(newTarget());

  function submit(e) {
    e.preventDefault();
    if (!form.player.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    onSave({
      ...form,
      researchScore: form.tier === "Buy Now" ? 45 : 25,
      monthAdded: today,
      lastRefreshed: today,
    });
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title="Add a target" onClose={onClose} />
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10 }}>
            <Field label="Player">
              <input value={form.player} onChange={(e) => setForm({ ...form, player: e.target.value })} required />
            </Field>
            <Field label="Sport">
              <select value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })}>
                {SPORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Card to look for">
            <input value={form.cardToLookFor} onChange={(e) => setForm({ ...form, cardToLookFor: e.target.value })} placeholder="e.g. 2026 Prizm rookie autos" />
          </Field>
          <Field label="Tier">
            <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}>
              <option>Buy Now</option>
              <option>Speculative</option>
            </select>
          </Field>
          <Field label="Why">
            <input value={form.reasoning} onChange={(e) => setForm({ ...form, reasoning: e.target.value })} placeholder="Draft capital, landing spot, production…" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Target price (raw)"><input type="number" step="0.01" value={form.targetPriceRaw} onChange={(e) => setForm({ ...form, targetPriceRaw: e.target.value })} /></Field>
            <Field label="Target price (graded)"><input type="number" step="0.01" value={form.targetPriceGraded} onChange={(e) => setForm({ ...form, targetPriceGraded: e.target.value })} /></Field>
          </div>
          <button className="btnPrimary" type="submit" style={{ justifyContent: "center", marginTop: 6 }}>
            Add to watchlist
          </button>
        </form>
      </div>
    </div>
  );
}

function TargetDetailModal({ target, onUpdate, onDelete, onClose }) {
  const tierStyle = TARGET_TIER_STYLE[target.tier] || TARGET_TIER_STYLE["Buy Now"];
  const score = computeConfidence(target);
  const confColor = confidenceColor(score);
  const age = monthsSince(target.lastRefreshed || target.monthAdded);
  const trendMult = TREND_DECAY_MULTIPLIER[target.performanceTrend] ?? 1;
  const decay = Math.min(CONFIDENCE_MAX_DECAY, Math.max(0, (age - CONFIDENCE_GRACE_MONTHS) * CONFIDENCE_DECAY_PER_MONTH * trendMult));

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 12, color: "#8B90A0" }}>{SPORT_EMOJI[target.sport] || "🎴"} {target.sport} · added {target.monthAdded}</div>
            <h2 className="oswald" style={{ margin: "2px 0 0", fontSize: 21 }}>{target.player}</h2>
          </div>
          <X size={20} style={{ cursor: "pointer", color: "#8B90A0" }} onClick={onClose} />
        </div>

        <div style={{ display: "flex", gap: 8, margin: "8px 0 10px" }}>
          <span className="mono" style={{ display: "inline-block", fontSize: 11, padding: "3px 10px", borderRadius: 999, background: `${tierStyle.color}22`, color: tierStyle.color }}>
            {target.tier}
          </span>
          <span className="mono" style={{ display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: `${confColor}22`, color: confColor, border: `1px solid ${confColor}55` }}>
            Score: {score}
          </span>
        </div>

        <div style={{ fontSize: 11, color: "#6B7180", marginBottom: 16, lineHeight: 1.6 }}>
          Auto-calculated, not set by hand: research baseline {target.researchScore ?? 50}
          {decay > 0
            ? ` − ${Math.round(decay)} for going ${Math.floor(age)} month${Math.floor(age) === 1 ? "" : "s"} without a refresh (${target.performanceTrend || "Stable"} trend ${trendMult < 1 ? "slows this down" : trendMult > 1 ? "speeds this up" : "at normal rate"})`
            : " (refreshed recently, no decay yet)"}
          . Hit "Refresh from research" on the main page to reset it against the latest research.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Status">
            <select value={target.status} onChange={(e) => onUpdate(target.id, { status: e.target.value })}>
              {TARGET_STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Tier">
            <select value={target.tier} onChange={(e) => onUpdate(target.id, { tier: e.target.value })}>
              <option>Buy Now</option>
              <option>Speculative</option>
            </select>
          </Field>
          <Field label="Performance trend">
            <select value={target.performanceTrend || "Stable"} onChange={(e) => onUpdate(target.id, { performanceTrend: e.target.value })}>
              <option>Improving</option>
              <option>Stable</option>
              <option>Declining</option>
            </select>
          </Field>
          <div style={{ fontSize: 10.5, color: "#6B7180", marginTop: -6 }}>
            Improving barely decays over time (still performing = still a good pick even unrefreshed). Declining decays fast. This is the honest signal to update if you're tracking the player/team yourself.
          </div>
          <Field label="Card to look for">
            <input value={target.cardToLookFor} onChange={(e) => onUpdate(target.id, { cardToLookFor: e.target.value })} />
          </Field>
          <Field label="Why">
            <input value={target.reasoning} onChange={(e) => onUpdate(target.id, { reasoning: e.target.value })} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Target price (raw)"><input type="number" step="0.01" value={target.targetPriceRaw ?? ""} onChange={(e) => onUpdate(target.id, { targetPriceRaw: e.target.value })} /></Field>
            <Field label="Target price (graded)"><input type="number" step="0.01" value={target.targetPriceGraded ?? ""} onChange={(e) => onUpdate(target.id, { targetPriceGraded: e.target.value })} /></Field>
          </div>

          <button
            onClick={() => { onDelete(target.id); onClose(); }}
            style={{ background: "transparent", border: "1px solid #4a2a24", color: "#B4472E", borderRadius: 8, padding: "9px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}
          >
            <Trash2 size={14} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}
