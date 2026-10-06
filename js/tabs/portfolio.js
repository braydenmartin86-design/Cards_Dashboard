// Portfolio + Pokémon tabs (same components, different data).

function StatBar({ totals }) {
  return (
    <div style={{ marginTop: 26, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1, background: "#2C303B", border: "1px solid #2C303B", borderRadius: 12, overflow: "hidden" }}>
      <Stat label="Active cards" value={totals.count} />
      <Stat label="Invested" value={fmtMoney(totals.invested)} />
      <Stat
        label="Potential raw profit"
        value={`${totals.potentialRaw >= 0 ? "+" : ""}${fmtMoney(totals.potentialRaw)}`}
        color={totals.potentialRaw >= 0 ? "#4E8B6B" : "#B4472E"}
      />
      <Stat label="Realised profit" value={`${totals.realised >= 0 ? "+" : ""}${fmtMoney(totals.realised)}`} color={totals.realised >= 0 ? "#4E8B6B" : "#B4472E"} />
      <Stat label="Overall ROI" value={fmtPct(totals.overallROI)} color={totals.overallROI >= 0 ? "#4E8B6B" : "#B4472E"} />
      <Stat label="Needs action" value={totals.actionable} color="#C9A227" />
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ background: "#191B22", padding: "14px 18px" }}>
      <div style={{ fontSize: 11, color: "#8B90A0", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div className="oswald" style={{ fontSize: 21, fontWeight: 600, color: color || "#EDEAE1" }}>{value}</div>
    </div>
  );
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "action", label: "Needs action" },
  { key: "Raw", label: "Raw" },
  { key: "Graded", label: "Graded" },
];

const DECISION_FILTERS = ["Sell Raw First", "Grade First", "Sell PSA 9", "Sell PSA 10", "Hold"];

function FilterRow({ statusFilter, setStatusFilter, decisionFilter, setDecisionFilter, sportFilter, setSportFilter, locationFilter, setLocationFilter, setSortKey, enriched }) {
  const sports = useMemo(() => {
    const set = new Set(enriched.map((c) => c.sport).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [enriched]);

  function handleStatusClick(key) {
    setStatusFilter(key);
    if (key === "all") setSortKey(null);
  }

  return (
    <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <button key={f.key} className={`filterBtn ${statusFilter === f.key ? "active" : ""}`} onClick={() => handleStatusClick(f.key)}>
            {f.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", marginBottom: 4 }}>Decision</label>
          <select value={decisionFilter} onChange={(e) => setDecisionFilter(e.target.value)} style={{ width: "auto", minWidth: 170 }}>
            <option value="all">Any decision</option>
            {DECISION_FILTERS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        {sports.length > 2 && (
          <div>
            <label style={{ display: "block", marginBottom: 4 }}>Sport</label>
            <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)} style={{ width: "auto", minWidth: 140 }}>
              <option value="all">All sports</option>
              {sports.filter((s) => s !== "all").map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        <div>
          <label style={{ display: "block", marginBottom: 4 }}>Location</label>
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} style={{ width: "auto", minWidth: 160 }}>
            <option value="all">All locations</option>
            <option value="not-in-hand">Not in hand</option>
            {LOCATION_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

// Within a tied priority tier, group by decision type before breaking ties on cost —
// otherwise decision types interleave by dollar amount instead of clustering together.
const DECISION_SORT_ORDER = {
  "Sell PSA 10": 0,
  "Sell PSA 9": 1,
  "Sell Raw First": 2,
  "Grade First": 3,
  Hold: 4,
  Listed: 5,
  Sold: 6,
  "": 7,
};

const COLUMNS = [
  { key: "player", label: null, width: "2fr" },
  { key: "status", label: "Status", width: "90px" },
  { key: "totalCost", label: "Cost", width: "90px" },
  { key: "rawGGR", label: "Raw GGR", width: "90px" },
  { key: "gradedEV", label: "Graded EV", width: "90px" },
  { key: "expectedListProfit", label: "Exp. Sell Profit", width: "110px" },
  { key: "sellDecision", label: "Decision", width: "130px", sortable: true },
  { key: "timing", label: "Timing", width: "110px", sortable: false }, // <-- ADD THIS LINE
];
// Helper to render compact Seasonal Timing for Sell decisions
// Renders dynamic Seasonal Timing for Sell decisions (powered by your calendar)
// Single Seasonal Timing declaration (Sells)
function renderSeasonalTiming(card) {
  const decision = card.sellDecision || card.decision || "";
  const isSellDecision = ["Sell PSA 10", "Sell PSA 9", "Sell Raw First"].includes(decision);
  
  if (!isSellDecision || !card.sport || typeof seasonalSellCheck !== "function") return null;

  const check = seasonalSellCheck(card.sport);
  
  if (check && check.isGoodTiming) {
    return (
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          padding: "2px 6px",
          borderRadius: 4,
          textTransform: "uppercase",
          letterSpacing: "0.3px",
          background: "#1E3A2B",
          color: "#4E8B6B",
          border: "1px solid #2E5940",
          whiteSpace: "nowrap",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
        title={`Seasonal Timing (${card.sport}): ${check.monthName} is a Sell month`}
      >
        ✅ Good Timing
      </span>
    );
  }

  return null;
}

// Single Grade Timing declaration (Grading)
function renderGradeTiming(card) {
  const decision = card.sellDecision || card.decision || "";
  const isGradeDecision = ["Grade First", "Grade PSA", "Grade BGS", "Consider Grading"].includes(decision);

  if (!isGradeDecision || !card.sport || typeof seasonalSellCheck !== "function") return null;

  const check = seasonalSellCheck(card.sport);

  if (check && check.currentAction === "GRADE") {
    return (
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          padding: "2px 6px",
          borderRadius: 4,
          textTransform: "uppercase",
          letterSpacing: "0.3px",
          background: "#3A2E1E",
          color: "#C9A227",
          border: "1px solid #59462E",
          whiteSpace: "nowrap",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
        title={`Grade Timing (${card.sport}): ${check.monthName} is an ideal grading window`}
      >
        💎 {check.monthName} Grade
      </span>
    );
  }

  return null;
}
function CardTable({ cards, onSelect, playerLabel, sortKey, sortDir, onSort }) {
  const gridCols = COLUMNS.map((c) => c.width).join(" ") + " 32px";

  const sorted = useMemo(() => {
    if (!sortKey) return cards;
    const dir = sortDir === "asc" ? 1 : -1;

    return [...cards].sort((a, b) => {
      if (sortKey === "sellPriority" || sortKey === "priority" || sortKey === "sellDecision") {
        const prioA = a.sellPriority ?? 99;
        const prioB = b.sellPriority ?? 99;
        if (prioA !== prioB) return (prioA - prioB) * dir;

        const decA = DECISION_SORT_ORDER[a.sellDecision] ?? 99;
        const decB = DECISION_SORT_ORDER[b.sellDecision] ?? 99;
        if (decA !== decB) return (decA - decB) * dir;
      }

      let av = a[sortKey];
      let bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string") return av.localeCompare(bv) * dir;
      return (av - bv) * dir;
    });
  }, [cards, sortKey, sortDir]);

  return (
    <div style={{ marginTop: 18, border: "1px solid #2C303B", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: gridCols, padding: "10px 14px", background: "#1D2028", fontSize: 11, color: "#8B90A0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {COLUMNS.map((c) => (
          <div
            key={c.key}
            onClick={() => onSort(c.key)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 3, userSelect: "none" }}
          >
            {c.key === "player" ? playerLabel || "Card" : c.label}
            {sortKey === c.key && <span style={{ color: "#C9A227" }}>{sortDir === "asc" ? "▲" : "▼"}</span>}
          </div>
        ))}
        <div />
      </div>
      {sorted.length === 0 ? (
        <div style={{ padding: "3rem 0", textAlign: "center", color: "#5C6270" }}>No cards match this filter.</div>
      ) : (
        sorted.map((c) => <CardRow key={c.id} card={c} onClick={() => onSelect(c.id)} gridCols={gridCols} />)
      )}
    </div>
  );
}

function CardRow({ card, onClick, gridCols }) {
  // 1. Force live evaluation through engine based on sport
  const computed = card.sport === "Pokémon" ? computePokemonCard(card) : computeCard(card);
  const decision = computed.sellDecision;
  const style = SELL_DECISION_STYLE[decision] || SELL_DECISION_STYLE[""];

  const isTopAction = computed.sellPriority === 1;
  const isRawSell = decision === "Sell Raw First";
  const isGradeAction = computed.sellPriority >= 3 && computed.sellPriority <= 5 && decision === "Grade First";
  
  // 2. High Risk Check
  const isHighRisk = decision === "Grade First" && computed.gradeCall === "HIGH RISK";

  return (
    <div
      onClick={onClick}
      className="cardRow"
      style={{
        display: "grid",
        gridTemplateColumns: gridCols,
        padding: "12px 14px",
        borderTop: "1px solid #24272F",
        borderLeft: isTopAction ? `4px solid ${style.color}` : isRawSell ? `3px solid ${style.color}80` : isGradeAction ? `4px solid ${style.color}` : "4px solid transparent",
        background: isTopAction ? `${style.color}14` : isRawSell ? `${style.color}08` : "transparent",
        cursor: "pointer",
        alignItems: "center",
        fontSize: 13,
      }}
    >
      <div>
        <div style={{ fontWeight: 600 }}>
          {card.player}
          {card.rookie && (
            <span className="mono" style={{ fontSize: 9.5, color: "#C9A227", border: "1px solid #C9A22755", borderRadius: 4, padding: "1px 5px", marginLeft: 6 }}>RC</span>
          )}
          {card.sport && <span className="mono" style={{ fontSize: 10, color: "#6B7180", marginLeft: 8 }}>{SPORT_EMOJI[card.sport] || "🎴"} {card.sport}</span>}
        </div>
        <div style={{ fontSize: 12, color: "#6B7180" }}>
          {card.card}{card.cardNum ? ` ${card.cardNum}` : ""}
          {card.numbered && card.outOf ? ` /${card.outOf}` : ""}
          {card.location && card.location !== "In Hand" && (
            <span className="mono" style={{ fontSize: 10, color: (LOCATION_STYLE[card.location] || {}).color || "#8B90A0", marginLeft: 8 }}>
              📍 {card.location}
            </span>
          )}
        </div>
      </div>
      <div style={{ color: "#A7ADBB" }}>{card.status}{card.grade ? ` · ${card.grade}` : ""}</div>
      <div>{fmtMoney(computed.totalCost)}</div>
      <div style={{ color: computed.rawGGR >= 0 ? "#4E8B6B" : "#B4472E" }}>{computed.rawGGR != null ? fmtMoney(computed.rawGGR) : "—"}</div>
      <div style={{ color: computed.gradedEV >= 0 ? "#4E8B6B" : "#B4472E" }}>{computed.gradedEV != null ? fmtMoney(computed.gradedEV) : "—"}</div>
      <div style={{ color: card.expectedListProfit >= 0 ? "#4E8B6B" : card.expectedListProfit != null ? "#B4472E" : "#5C6270", fontWeight: card.expectedListProfit != null ? 600 : 400 }}>
        {card.expectedListProfit != null ? fmtMoney(card.expectedListProfit) : "—"}
      </div>

      {/* Decision Badge + High Risk Warning */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          className="mono"
          style={{
            fontSize: isTopAction ? 11.5 : 10.5,
            fontWeight: isTopAction ? 700 : 500,
            padding: isTopAction ? "4px 11px" : "3px 9px",
            borderRadius: 999,
            background: isTopAction ? style.color : `${style.color}22`,
            color: isTopAction ? "#14161C" : style.color,
          }}
        >
          {isTopAction ? "⚡ " : ""}{style.label}
        </span>

        {isHighRisk && (
          <span
            title="High Risk: PSA 10 profit is positive, but a PSA 9 or lower results in a loss."
            style={{ fontSize: 13, cursor: "help" }}
          >
            ⚠️
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        {renderSeasonalTiming(card)}
        {renderGradeTiming(card)}
      </div>

      <div style={{ color: "#5C6270", display: "flex", justifyContent: "flex-end" }}>
        <ChevronRight size={16} />
      </div>
    </div>
  );
}
function AddCardModal({ onClose, onSave, playerLabel }) {
  const [form, setForm] = useState({
    player: "",
    card: "",
    cardNum: "",
    sport: "NFL",
    location: "In Hand",
    rookie: false,
    numbered: false,
    outOf: "",
    quantity: 1,
    shipMyCards: "No",
    status: "Raw",
    grade: null,
    paid: "",
    shipping: "",
    feesPct: 0.137,
    rawSale1: "",
    rawSale2: "",
    psa9Sale1: "",
    psa9Sale2: "",
    psa10Sale1: "",
    psa10Sale2: "",
    gradingService: "PSA via Australia",
    setGemRate: "",
    psa10Prob: 0.35,
    psa9Prob: 0.45,
    actualSellPrice: "",
  });

  function submit(e) {
    e.preventDefault();
    if (!form.player) return;
    const today = new Date().toISOString().slice(0, 10);
    const rawAvg = avgOfSales(form.rawSale1, form.rawSale2);
    const psa9Avg = avgOfSales(form.psa9Sale1, form.psa9Sale2);
    const psa10Avg = avgOfSales(form.psa10Sale1, form.psa10Sale2);
    onSave({
      ...form,
      paid: Number(form.paid) || 0,
      shipping: Number(form.shipping) || 0,
      rawAvg,
      psa9Avg,
      psa10Avg,
      rawHistory: rawAvg != null ? [{ date: today, value: rawAvg }] : [],
      psa9History: psa9Avg != null ? [{ date: today, value: psa9Avg }] : [],
      psa10History: psa10Avg != null ? [{ date: today, value: psa10Avg }] : [],
      outOf: form.numbered && form.outOf !== "" ? Number(form.outOf) : null,
      quantity: Number(form.quantity) || 1,
      actualSellPrice: form.actualSellPrice === "" ? null : Number(form.actualSellPrice),
      datePurchased: today,
    });
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title="Add a card" onClose={onClose} />
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 10 }}>
            <Field label={playerLabel || "Player"}>
              <input value={form.player} onChange={(e) => setForm({ ...form, player: e.target.value })} required />
            </Field>
            <Field label="Sport">
              <select value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })}>
                {SPORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 10 }}>
            <Field label="Card / set">
              <input value={form.card} onChange={(e) => setForm({ ...form, card: e.target.value })} />
            </Field>
            <Field label="Card #">
              <input value={form.cardNum} onChange={(e) => setForm({ ...form, cardNum: e.target.value })} />
            </Field>
          </div>
          <Field label="Location">
            <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
              {LOCATION_OPTIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </Field>
          <RookieNumberedFields form={form} setForm={setForm} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Grade (if graded)">
              <select value={form.grade || ""} onChange={(e) => setForm({ ...form, grade: e.target.value || null })}>
                <option value="">—</option>
                {GRADE_OPTIONS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="ShipMyCards?">
              <select value={form.shipMyCards} onChange={(e) => setForm({ ...form, shipMyCards: e.target.value })}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 90px", gap: 10 }}>
            <Field label="Paid (AUD)">
              <input type="number" step="0.01" value={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.value })} required />
            </Field>
            <Field label="Shipping">
              <input type="number" step="0.01" value={form.shipping} onChange={(e) => setForm({ ...form, shipping: e.target.value })} />
            </Field>
            <Field label="Fees %">
              <input type="number" step="0.001" value={form.feesPct} onChange={(e) => setForm({ ...form, feesPct: Number(e.target.value) })} />
            </Field>
            <Field label="Qty">
              <input type="number" min="1" step="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </Field>
          </div>
          <div style={{ fontSize: 12, color: "#6B7180", marginTop: 2 }}>Most recent sale price(s) — 2nd sale optional, leave both blank for N/A</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <TierPriceInput
              label="Raw"
              sale1={form.rawSale1}
              sale2={form.rawSale2}
              onChange1={(v) => setForm({ ...form, rawSale1: v })}
              onChange2={(v) => setForm({ ...form, rawSale2: v })}
            />
            <TierPriceInput
              label="PSA 9"
              sale1={form.psa9Sale1}
              sale2={form.psa9Sale2}
              onChange1={(v) => setForm({ ...form, psa9Sale1: v })}
              onChange2={(v) => setForm({ ...form, psa9Sale2: v })}
            />
            <TierPriceInput
              label="PSA 10"
              sale1={form.psa10Sale1}
              sale2={form.psa10Sale2}
              onChange1={(v) => setForm({ ...form, psa10Sale1: v })}
              onChange2={(v) => setForm({ ...form, psa10Sale2: v })}
            />
          </div>
          <Field label="Grading service (if you'd grade it)">
            <select value={form.gradingService} onChange={(e) => setForm({ ...form, gradingService: e.target.value })}>
              {GRADING_SERVICE_OPTIONS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
          {form.gradingService === "PSA via Australia" && (
            <div style={{ fontSize: 11, color: "#6B7180", marginTop: -6 }}>
              Priced by declared value, not flat — cards not produced in the USA (Japanese Pokémon, One Piece, Lorcana, Yu-Gi-Oh, Dragon Ball, etc.) route via PSA Hong Kong and add 1-2 months to turnaround.
            </div>
          )}
          <Field label="Set gem rate % (optional — from GemRate)">
            <input type="number" step="0.1" min="0" max="100" placeholder="e.g. 22.5" value={form.setGemRate} onChange={(e) => setForm({ ...form, setGemRate: e.target.value })} />
          </Field>
          <div style={{ fontSize: 11, color: "#6B7180", marginTop: -6, display: "flex", alignItems: "center", gap: 8 }}>
            <a href="https://www.gemrate.com/universal-search" target="_blank" rel="noreferrer" style={{ color: "#5C7A99" }}>Search GemRate ↗</a>
            <span>What % of this set's submissions actually come back PSA 10 — a real base rate, better than a guess, especially before you've run a photo check.</span>
          </div>
          <button className="btnPrimary" type="submit" style={{ justifyContent: "center", marginTop: 6 }}>
            Add to portfolio
          </button>
        </form>
      </div>
    </div>
  );
}

const SPORT_EMOJI = {
  NFL: "🏈",
  NBA: "🏀",
  WNBA: "🏀",
  MLB: "⚾",
  AFL: "🏉",
  Soccer: "⚽",
  MMA: "🥊",
  WWE: "🤼",
  "Pokémon": "🧬",
  Other: "🎴",
};

function SearchCopyBlock({ card }) {
  const [copyState, setCopyState] = useState("idle"); // idle | copied | failed
  const searchText = [card.player, card.card, card.cardNum].filter(Boolean).join(" ").trim();

  async function copy() {
    const ok = await copyToClipboard(searchText);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => setCopyState("idle"), 2000);
  }

  const point130Url = `https://130point.com/sales/?search=${encodeURIComponent(searchText)}`;
  const ebayUrl = `https://www.ebay.com.au/sch/i.html?_nkw=${encodeURIComponent(searchText)}&LH_Sold=1&LH_Complete=1`;

  return (
    <div style={{ border: "1px solid #2C303B", borderRadius: 8, padding: "10px 12px", marginBottom: 16, background: "#14161C" }}>
      <div
        className="mono"
        onClick={selectAllText}
        title="Click to select the text if Copy doesn't work"
        style={{ fontSize: 12, color: "#C9A227", wordBreak: "break-word", marginBottom: 8, cursor: "text", userSelect: "all" }}
      >
        {searchText}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button className="btnSecondary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "6px 12px" }} onClick={copy}>
          {copyState === "copied" ? <Check size={13} /> : <Copy size={13} />} {copyState === "copied" ? "Copied" : "Copy"}
        </button>
        <a href={point130Url} target="_blank" rel="noreferrer" className="btnSecondary" style={{ display: "flex", alignItems: "center", fontSize: 12, padding: "6px 12px", textDecoration: "none" }}>
          Search 130 Point
        </a>
        <a href={ebayUrl} target="_blank" rel="noreferrer" className="btnSecondary" style={{ display: "flex", alignItems: "center", fontSize: 12, padding: "6px 12px", textDecoration: "none" }}>
          Search eBay sold
        </a>
        {copyState === "failed" && (
          <span style={{ fontSize: 11, color: "#B4472E" }}>Couldn't auto-copy — click the text above to select it, then Ctrl/Cmd+C</span>
        )}
      </div>
    </div>
  );
}

// ===== Comp updates from CardSight =====

// Starting point for the comp search, split out of the card's free-text "Card / set" field
// (e.g. "2024 Prizm Silver" -> year 2024, set Prizm, parallel Silver). Once corrected and
// saved, the card's own `compSearch` is used instead.
function compSearchDefaults(card) {
  const player_name = card.player || card.name || "";
  if (card.compSearch) return { ...card.compSearch, player_name: card.compSearch.player_name || player_name };
  const text = String(card.card || "");
  const yearMatch = text.match(/\b(19|20)\d{2}(?:[-/]\d{2,4})?\b/);
  const rest = (yearMatch ? text.replace(yearMatch[0], " ") : text).replace(/\s+/g, " ").trim();
  const words = rest.split(" ");
  const firstParallelWord = words.findIndex((w) => PARALLEL_WORDS.test(normalizeCardText(w)));
  let set_name = rest;
  let parallel = "Base";
  if (firstParallelWord > 0) {
    set_name = words.slice(0, firstParallelWord).join(" ");
    parallel = words.slice(firstParallelWord).join(" ");
  }
  if (card.numbered && card.outOf && !/\/\s*\d/.test(parallel)) {
    parallel = `${parallel === "Base" ? "" : parallel} /${card.outOf}`.trim();
  }
  return { player_name, year: yearMatch ? yearMatch[0] : "", set_name, parallel_or_variant: parallel, card_number: card.cardNum || "" };
}

// Which market-value column a grade feeds (same grade groups the formula engine uses).
function tierKeyForGrade(grade) {
  const g = String(grade || "").toLowerCase();
  if (PSA10_GRADES.includes(g)) return "psa10";
  if (PSA9_GRADES.includes(g)) return "psa9";
  return null;
}

// eBay sold / 130point search text for one tier, for when CardSight has no confident comps.
// Raw searches exclude slabbed copies.
function tierSearchText(details, grade) {
  const parallel = /^base$/i.test(String(details.parallel_or_variant || "").trim()) ? "" : details.parallel_or_variant;
  // eBay needs every word to match, so leave out ones sellers often skip ("RC", "#", a Pokémon set size).
  const number = String(details.card_number || "").replace(/^\s*#/, "").replace(/\s*\/\s*\d+\s*$/, "").trim();
  const setName = String(details.set_name || "").replace(/\b(rc|rookie cards?|rookie)\b/gi, " ");
  const parts = [details.year, setName, details.player_name, parallel, number];
  const text = parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  return grade ? `${text} ${grade}` : `${text} -psa -bgs -sgc -cgc`;
}

function TierSearchLinks({ details, grade }) {
  const text = tierSearchText(details, grade);
  const linkStyle = { color: "#2FA89A", fontSize: 11, marginRight: 10 };
  return (
    <div style={{ fontSize: 11, marginTop: 4 }}>
      <span style={{ color: "#6B7180", marginRight: 6 }}>Check manually:</span>
      <a href={`https://www.ebay.com.au/sch/i.html?_nkw=${encodeURIComponent(text)}&LH_Sold=1&LH_Complete=1`} target="_blank" rel="noreferrer" style={linkStyle}>
        eBay sold ↗
      </a>
      <a href={`https://130point.com/sales/?search=${encodeURIComponent(text.replace(/ -\w+/g, ""))}`} target="_blank" rel="noreferrer" style={linkStyle}>
        130 Point ↗
      </a>
    </div>
  );
}

const TIER_FIELDS = {
  raw: { avg: "rawAvg", history: "rawHistory", label: "Raw" },
  psa9: { avg: "psa9Avg", history: "psa9History", label: "PSA 9" },
  psa10: { avg: "psa10Avg", history: "psa10History", label: "PSA 10" },
};

function CompUpdater({ card, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(() => compSearchDefaults(card));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [found, setFound] = useState(null);
  const [trend, setTrend] = useState(null);
  const [trendNote, setTrendNote] = useState(null);
  const [applied, setApplied] = useState(false);
  // Per tier: { use, ticked: [bool per sale], manual: "" }. High-confidence tiers start ticked;
  // the rest can be ticked after checking the listings, or given a value typed in by hand.
  const [choices, setChoices] = useState({});

  useEffect(() => {
    setDetails(compSearchDefaults(card));
    setChoices({});
    setFound(null);
    setTrend(null);
    setApplied(false);
  }, [card.id]);

  // Graded cards only look up their own grade; raw cards get Raw, PSA 9 and PSA 10.
  const tiers = card.grade
    ? [{ key: tierKeyForGrade(card.grade) || "own", grade: card.grade }]
    : [{ key: "raw", grade: null }, { key: "psa9", grade: "PSA 9" }, { key: "psa10", grade: "PSA 10" }];

  async function lookUp() {
    setLoading(true);
    setError(null);
    setFound(null);
    setTrend(null);
    setTrendNote(null);
    setApplied(false);
    try {
      const results = await findCompsForTiers({ ...details, sport: card.sport }, tiers);
      setFound(results);
      setChoices(Object.fromEntries(results.map((r) => [r.key, { use: r.highConfidence, ticked: r.sales.map(() => true), manual: ["", "", ""] }])));
      // Price trend for the tier this card is actually in.
      const trendTier = results.find((r) => (card.grade ? r.grade === card.grade : r.key === "raw")) || results[0];
      const cardId = trendTier.cardId || results.map((r) => r.cardId).find(Boolean);
      if (cardId) {
        try {
          const points = await fetchPriceTrend(cardId, { parallelId: trendTier.parallelId, gradeId: trendTier.gradeId, graded: Boolean(card.grade) });
          setTrend({ points, cardId, label: card.grade || "Raw" });
          if (points.length < 2) setTrendNote("Not enough recent sales for a trend line.");
        } catch (e) {
          setTrendNote(`Price trend unavailable: ${e.message}`);
        }
      } else {
        setTrendNote("CardSight couldn't link these sales to a catalogue card, so there's no price trend.");
      }
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  // The value a tier would apply: typed-in sales win (averaged over however many are filled in),
  // otherwise the average of ticked sales.
  function tierValue(r) {
    const c = choices[r.key] || {};
    const manual = (c.manual || []).map(Number).filter((n) => n > 0);
    if (manual.length) {
      return { aud: Math.round((manual.reduce((s, n) => s + n, 0) / manual.length) * 100) / 100, manual: true, count: manual.length };
    }
    const picked = r.sales.filter((_, i) => (c.ticked || [])[i]);
    if (!picked.length) return null;
    const usd = picked.reduce((s, x) => s + x.priceUsd, 0) / picked.length;
    return { aud: convertUsdToAud(Math.round(usd * 100) / 100), manual: false, count: picked.length };
  }

  function updateChoice(key, patch) {
    setApplied(false);
    setChoices((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), ...patch } }));
  }

  const applicable = (found || []).filter((r) => TIER_FIELDS[r.key] && (choices[r.key] || {}).use && tierValue(r));

  function apply() {
    const today = new Date().toISOString().slice(0, 10);
    const patch = { compSearch: details, compsUpdatedAt: today };
    for (const r of applicable) {
      const f = TIER_FIELDS[r.key];
      const value = tierValue(r).aud;
      patch[f.avg] = value;
      patch[f.history] = appendHistoryIfChanged(card[f.history], card[f.avg], value, today);
    }
    if (trend && trend.points.length >= 2) patch.priceTrend = { ...trend, fetchedAt: today };
    onUpdate({ ...card, ...patch, id: card.id });
    setApplied(true);
  }

  const savedTrend = card.priceTrend && card.priceTrend.points && card.priceTrend.points.length >= 2 ? card.priceTrend : null;
  const shownTrend = trend && trend.points.length >= 2 ? trend : savedTrend;

  return (
    <div style={{ border: "1px solid #2C303B", borderRadius: 8, padding: "10px 12px", marginBottom: 16, background: "#14161C" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <button className="btnSecondary" style={{ fontSize: 12, padding: "6px 12px", borderColor: "#2FA89A66", color: "#2FA89A" }} onClick={() => setOpen((v) => !v)}>
          🔄 Update comps from CardSight {open ? "▲" : "▼"}
        </button>
        {card.compsUpdatedAt && <span style={{ fontSize: 11, color: "#6B7180" }}>Last updated {card.compsUpdatedAt}</span>}
      </div>

      {shownTrend && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, color: "#8B90A0", marginBottom: 4 }}>
            CardSight price trend · {shownTrend.label} · weekly median sold price (A$)
          </div>
          <TrendSparkline history={shownTrend.points} color="#2FA89A" />
        </div>
      )}

      {open && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 8 }}>
            {[
              ["player_name", "Player / name"],
              ["year", "Year"],
              ["set_name", "Set (e.g. Prizm)"],
              ["parallel_or_variant", "Parallel (Base if none)"],
              ["card_number", "Card #"],
            ].map(([field, label]) => (
              <div key={field}>
                <label style={{ fontSize: 10.5 }}>{label}</label>
                <input value={details[field] ?? ""} onChange={(e) => setDetails({ ...details, [field]: e.target.value })} style={{ padding: "5px 8px", fontSize: 12.5 }} />
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#6B7180", marginBottom: 8, lineHeight: 1.5 }}>
            Searches the last {COMPS_PER_TIER} sales for {card.grade ? card.grade : "Raw, PSA 9 and PSA 10"}. High-confidence results are ticked for you (that needs the card #, so add it from the back of the card). Low-confidence ones can be ticked after checking the listings, or you can type in a value.
          </div>
          <button className="btnPrimary" style={{ fontSize: 12.5, padding: "7px 14px" }} onClick={lookUp} disabled={loading || !details.player_name}>
            {loading ? "Searching sold listings…" : "Find recent comps"}
          </button>
          {error && <div style={{ fontSize: 12, color: "#B4472E", marginTop: 8 }}>{error}</div>}

          {found && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {found.map((r) => {
                const c = choices[r.key] || {};
                const value = tierValue(r);
                const canApply = Boolean(TIER_FIELDS[r.key]);
                return (
                <div key={r.key + (r.grade || "")} style={{ border: `1px solid ${c.use && value ? "#4E8B6B55" : "#2C303B"}`, borderRadius: 6, padding: "8px 10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <label style={{ fontWeight: 600, fontSize: 12.5, color: "#EDEAE1", display: "flex", alignItems: "center", gap: 6, margin: 0, cursor: canApply ? "pointer" : "default" }}>
                      {canApply && (
                        <input type="checkbox" checked={Boolean(c.use)} onChange={(e) => updateChoice(r.key, { use: e.target.checked })} style={{ width: "auto", margin: 0 }} />
                      )}
                      {r.grade || "Raw"}
                      {r.grade && TIER_FIELDS[r.key] && TIER_FIELDS[r.key].label !== r.grade ? ` → ${TIER_FIELDS[r.key].label} column` : ""}
                    </label>
                    <span style={{ fontWeight: 700, color: "#C9A227" }}>{value ? fmtMoney(value.aud) : "—"}</span>
                  </div>
                  <div style={{ fontSize: 11, color: r.highConfidence ? "#4E8B6B" : "#C9A227", margin: "2px 0 4px" }}>
                    {r.highConfidence ? `✓ High confidence` : `⚠️ Low confidence — ${r.reasons.join(", ")}. Check the listings before using it.`}
                    {value && (value.manual ? ` · avg of your ${value.count} sale${value.count === 1 ? "" : "s"}` : ` · avg of ${value.count} ticked sale${value.count === 1 ? "" : "s"}`)}
                    {!canApply && " · this grade has no market-value column"}
                  </div>
                  {r.sales.map((s, i) => (
                    <div key={i} style={{ fontSize: 11, color: "#8B90A0", lineHeight: 1.6, display: "flex", gap: 6, alignItems: "baseline" }}>
                      <input
                        type="checkbox"
                        checked={Boolean((c.ticked || [])[i])}
                        onChange={(e) => {
                          const ticked = [...(c.ticked || r.sales.map(() => true))];
                          ticked[i] = e.target.checked;
                          updateChoice(r.key, { ticked });
                        }}
                        title="Count this sale in the average"
                        style={{ width: "auto", margin: 0, flexShrink: 0 }}
                      />
                      <span>
                      {new Date(s.date).toLocaleDateString()} · A${convertUsdToAud(s.priceUsd).toFixed(2)}
                      {s.title && <span style={{ color: "#6B7180" }}> · {s.title.length > 70 ? s.title.slice(0, 70) + "…" : s.title}</span>}
                      {s.url && (
                        <a href={s.url} target="_blank" rel="noreferrer" style={{ color: "#2FA89A", marginLeft: 6 }}>
                          listing
                        </a>
                      )}
                      {s.title && (
                        <a href={ebaySoldUrl(s.title)} target="_blank" rel="noreferrer" title="eBay sold search for this title (shows the sold price)" style={{ color: "#2FA89A", marginLeft: 6 }}>
                          eBay sold
                        </a>
                      )}
                      </span>
                    </div>
                  ))}
                  {r.note && <div style={{ fontSize: 11, color: "#6B7180" }}>{r.note}</div>}
                  {!r.highConfidence && <TierSearchLinks details={details} grade={r.grade} />}
                  {canApply && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 11, color: "#8B90A0", flexWrap: "wrap" }}>
                      <span>Or enter the last 3 sold prices yourself (A$):</span>
                      {[0, 1, 2].map((i) => (
                        <input
                          key={i}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={i === 0 ? "Latest" : i === 1 ? "2nd" : "3rd"}
                          value={(c.manual || [])[i] || ""}
                          onChange={(e) => {
                            const manual = [...(c.manual || ["", "", ""])];
                            manual[i] = e.target.value;
                            updateChoice(r.key, { manual, use: manual.some((v) => Number(v) > 0) ? true : c.use });
                          }}
                          style={{ width: 80, padding: "4px 7px", fontSize: 12 }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                );
              })}
              {trendNote && <div style={{ fontSize: 11, color: "#6B7180" }}>{trendNote}</div>}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <button className="btnPrimary" style={{ fontSize: 12.5, padding: "7px 14px" }} onClick={apply} disabled={applicable.length === 0 || applied}>
                  {applied ? "Applied ✓" : `Apply ${applicable.length} value${applicable.length === 1 ? "" : "s"}`}
                </button>
                {applicable.length === 0 && <span style={{ fontSize: 11, color: "#6B7180" }}>Tick a grade to use its sales, or type in a value from eBay sold.</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailModal({ card, onClose, onUpdate, onDelete, playerLabel = "Player" }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(card);

  useEffect(() => setForm(card), [card.id]);

  const isPkmn = card.sport === "Pokémon" || playerLabel.includes("Pokémon");
  const computed = isPkmn ? computePokemonCard(card) : computeCard(card);

  function startEdit() {
    setForm({
      ...card,
      rawSale1: card.rawAvg != null ? String(card.rawAvg) : "",
      rawSale2: "",
      psa9Sale1: card.psa9Avg != null ? String(card.psa9Avg) : "",
      psa9Sale2: "",
      psa10Sale1: card.psa10Avg != null ? String(card.psa10Avg) : "",
      psa10Sale2: "",
    });
    setEdit(true);
  }

function save() {
    const today = new Date().toISOString().slice(0, 10);
    const newRawAvg = avgOfSales(form.rawSale1, form.rawSale2);
    const newPsa9Avg = avgOfSales(form.psa9Sale1, form.psa9Sale2);
    const newPsa10Avg = avgOfSales(form.psa10Sale1, form.psa10Sale2);
    
    // Pass a single unified object containing the id and all updated properties
    onUpdate({
      ...card,
      ...form,
      id: card.id,
      paid: Number(form.paid) || 0,
      shipping: Number(form.shipping) || 0,
      rawAvg: newRawAvg,
      psa9Avg: newPsa9Avg,
      psa10Avg: newPsa10Avg,
      rawHistory: appendHistoryIfChanged(card.rawHistory, card.rawAvg, newRawAvg, today),
      psa9History: appendHistoryIfChanged(card.psa9History, card.psa9Avg, newPsa9Avg, today),
      psa10History: appendHistoryIfChanged(card.psa10History, card.psa10Avg, newPsa10Avg, today),
      outOf: form.numbered && form.outOf !== "" && form.outOf != null ? Number(form.outOf) : null,
      quantity: Number(form.quantity) || 1,
      actualSellPrice: form.actualSellPrice === "" || form.actualSellPrice == null ? null : Number(form.actualSellPrice),
    });
    setEdit(false);
  }

  const style = SELL_DECISION_STYLE[computed.sellDecision] || SELL_DECISION_STYLE[""];
  const listing = recommendedListing(computed);
  const sellMethod = listing ? suggestedSellingMethod(computed, listing) : null;
  const timingCheck = !isPkmn && listing ? seasonalSellCheck(card.sport) : null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 12, color: "#8B90A0" }}>
              {card.sport && <span style={{ marginRight: 6 }}>{SPORT_EMOJI[card.sport] || "🎴"}</span>}
              {card.card} {card.cardNum}
              {card.numbered && card.outOf ? ` /${card.outOf}` : ""}
            </div>
            <h2 className="oswald" style={{ margin: "2px 0 0", fontSize: 21 }}>
              {card.player || card.name || "Unnamed Card"}
              {card.rookie && (
                <span className="mono" style={{ fontSize: 11, color: "#C9A227", border: "1px solid #C9A22755", borderRadius: 4, padding: "1px 6px", marginLeft: 8, verticalAlign: "middle" }}>
                  RC
                </span>
              )}
            </h2>
          </div>
          <X size={20} style={{ cursor: "pointer", color: "#8B90A0" }} onClick={onClose} />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0 12px" }}>
          <span className="mono" style={{ display: "inline-block", fontSize: 11, padding: "3px 10px", borderRadius: 999, background: `${style.color}22`, color: style.color }}>
            {style.label} · priority {computed.sellPriority}
          </span>
          {card.location && (
            <span className="mono" style={{ display: "inline-block", fontSize: 11, padding: "3px 10px", borderRadius: 999, background: `${(LOCATION_STYLE[card.location] || {}).color || "#8B90A0"}22`, color: (LOCATION_STYLE[card.location] || {}).color || "#8B90A0" }}>
              📍 {card.location}
            </span>
          )}
        </div>

        {card.location && card.location !== "In Hand" && ["Sell Raw First", "Sell PSA 9", "Sell PSA 10"].includes(computed.sellDecision) && (
          <div style={{ fontSize: 12, color: "#C9A227", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            ⚠️ Time to sell, but this card isn't in hand — list it through {card.location} instead of shipping it yourself.
          </div>
        )}

        {listing && (
          <div style={{ border: "1px solid #4E8B6B55", borderRadius: 8, padding: "12px 14px", marginBottom: 16, background: "#4E8B6B0f" }}>
            <div style={{ fontSize: 11, color: "#8B90A0", textTransform: "uppercase", marginBottom: 8 }}>Recommended listing ({listing.label})</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <MiniStat label="List at" value={fmtMoney(listing.listPrice)} color="#4E8B6B" emphasis />
              <MiniStat label="Don't go below" value={fmtMoney(listing.floor)} color="#B4472E" />
            </div>
            <div style={{ fontSize: 11, color: "#6B7180", marginTop: 8 }}>
              {listing.markupPct}% above the {listing.label.toLowerCase()} average
              {listing.label === "Raw" ? " — raw condition varies, so a modest premium is normal." : " — graded cards are a known quantity with public comps, so only a small premium sticks."}{" "}
              The floor is your break-even; anything below that and you're paying to sell.
            </div>
            {listing.lowConfidence && (
              <div style={{ fontSize: 11, color: "#C9A227", marginTop: 6 }}>
                ⚠️ Based on limited sale data — double-check the very latest sold listings before pricing this one.
              </div>
            )}
            {sellMethod && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #4E8B6B33" }}>
                <div style={{ fontSize: 11, color: "#8B90A0", textTransform: "uppercase", marginBottom: 4 }}>Suggested method</div>
                <div className="oswald" style={{ fontSize: 14.5, fontWeight: 600, color: "#4E8B6B", marginBottom: 4 }}>{sellMethod.method}</div>
                <div style={{ fontSize: 11, color: "#6B7180", lineHeight: 1.6 }}>{sellMethod.why}</div>
              </div>
            )}
            {timingCheck && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #4E8B6B33" }}>
                <div style={{ fontSize: 11, color: "#8B90A0", textTransform: "uppercase", marginBottom: 4 }}>Seasonal timing check ({timingCheck.sportLabel})</div>
                {timingCheck.isGoodTiming ? (
                  <div style={{ fontSize: 12.5, color: "#4E8B6B", fontWeight: 600 }}>✅ Good timing — {timingCheck.monthName} is a Sell month on the calendar.</div>
                ) : (
                  <div style={{ fontSize: 12.5, color: "#C9A227", fontWeight: 600 }}>
                    ⏳ {timingCheck.monthName} is a {timingCheck.currentAction || "quiet"} month on the calendar, not a Sell month
                    {timingCheck.nextSellMonth ? ` — next Sell window is ${timingCheck.nextSellMonth}` : ""}.
                  </div>
                )}
                <div style={{ fontSize: 10.5, color: "#6B7180", marginTop: 4, lineHeight: 1.5 }}>
                  The profit math still says sell — this is only about timing, not whether it's profitable. {timingCheck.note}
                </div>
              </div>
            )}
          </div>
        )}

        {card.status === "At Grading" && (
          <div style={{ border: "1px solid #C9A22755", borderRadius: 8, padding: "12px 14px", marginBottom: 16, background: "#C9A2270f" }}>
            <div style={{ fontSize: 11, color: "#C9A227", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>🏷️ At grading</div>
            <div style={{ fontSize: 12.5, color: "#C6CAD4", lineHeight: 1.7 }}>
              Sent {card.gradingSentDate} via {card.gradingService}. Grading cost of <b>{fmtMoney(card.gradingCostPaid)}</b> is already added to this card's total cost.
              {card.gradingTurnaroundDays && ` Estimated ${card.gradingDaysElapsed}/${card.gradingTurnaroundDays} days elapsed.`}
              {" "}Full progress tracking is in the Grading Tracker tab.
            </div>
          </div>
        )}

        <SearchCopyBlock card={card} />
        <CompUpdater card={card} onUpdate={onUpdate} />

        {!edit ? (
          <>
            <SectionTitle>Cost basis</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              <MiniStat label="Paid" value={fmtMoney(card.paid)} />
              <MiniStat label="Shipping + holding" value={fmtMoney((card.shipping || 0) + (card.holdingCost || 0))} />
              <MiniStat label="Total cost" value={fmtMoney(computed.totalCost)} />
            </div>

            <SectionTitle>Market values (60d avg)</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
              <MiniStat label="Raw" value={computed.rawAvg != null ? fmtMoney(computed.rawAvg) : "—"} />
              <MiniStat label="PSA 9" value={computed.psa9Avg != null ? fmtMoney(computed.psa9Avg) : "—"} />
              <MiniStat label="PSA 10" value={computed.psa10Avg != null ? fmtMoney(computed.psa10Avg) : "—"} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              <TrendSparkline history={card.rawHistory} color="#5C7A99" />
              <TrendSparkline history={card.psa9History} color="#8B6FD6" />
              <TrendSparkline history={card.psa10History} color="#C9A227" />
            </div>

            <SectionTitle>Profitability (GGR = gross gain after cost)</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
              <MiniStat label="Raw GGR" value={computed.rawGGR != null ? fmtMoney(computed.rawGGR) : "—"} color={computed.rawGGR >= 0 ? "#4E8B6B" : "#B4472E"} />
              <MiniStat label="PSA 9 GGR" value={computed.psa9GGR != null ? fmtMoney(computed.psa9GGR) : "—"} color={computed.psa9GGR >= 0 ? "#4E8B6B" : "#B4472E"} />
              <MiniStat label="PSA 10 GGR" value={computed.psa10GGR != null ? fmtMoney(computed.psa10GGR) : "—"} color={computed.psa10GGR >= 0 ? "#4E8B6B" : "#B4472E"} />
            </div>
            {computed.psa10Avg == null && computed.psa9Avg != null && (
              <div style={{ fontSize: 10.5, color: "#C9A227", marginBottom: 8 }}>
                ⚠️ No PSA 10 comp on record — figures above assume it's worth at least the PSA 9 price, not $0. If pop is genuinely low/zero, a real PSA 10 could be worth meaningfully more than shown.
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <MiniStat label="Graded EV (prob-weighted)" value={computed.gradedEV != null ? fmtMoney(computed.gradedEV) : "—"} color={computed.gradedEV >= 0 ? "#4E8B6B" : "#B4472E"} emphasis />
              <MiniStat label="Grade call" value={computed.gradeCall} color={computed.gradeCall === "YES" ? "#4E8B6B" : computed.gradeCall === "HIGH RISK" ? "#C9A227" : "#8B90A0"} emphasis />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btnSecondary" onClick={startEdit}>Edit values</button>
              <button
                onClick={() => onDelete(card.id)}
                style={{ background: "transparent", border: "1px solid #4a2a24", color: "#B4472E", borderRadius: 8, padding: "9px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </>
        ) : (
          <EditForm form={form} setForm={setForm} onSave={save} onCancel={() => { setForm(card); setEdit(false); }} playerLabel={playerLabel} />
        )}
      </div>
    </div>
  );
}

function EditForm({ form, setForm, onSave, onCancel, playerLabel }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 10 }}>
        <Field label={playerLabel || "Player"}>
          <input value={form.player} onChange={(e) => setForm({ ...form, player: e.target.value })} />
        </Field>
        <Field label="Card #">
          <input value={form.cardNum || ""} onChange={(e) => setForm({ ...form, cardNum: e.target.value })} />
        </Field>
      </div>
      <Field label="Card / set">
        <input value={form.card || ""} onChange={(e) => setForm({ ...form, card: e.target.value })} />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Sport">
          <select value={form.sport || "Other"} onChange={(e) => setForm({ ...form, sport: e.target.value })}>
            {SPORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Location">
          <select value={form.location || "In Hand"} onChange={(e) => setForm({ ...form, location: e.target.value })}>
            {LOCATION_OPTIONS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </Field>
      </div>
      <RookieNumberedFields form={form} setForm={setForm} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Status">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Grade (if graded)">
          <select value={form.grade || ""} onChange={(e) => setForm({ ...form, grade: e.target.value || null })}>
            <option value="">—</option>
            {GRADE_OPTIONS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px", gap: 10 }}>
        <Field label="Paid"><input type="number" step="0.01" value={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.value })} /></Field>
        <Field label="Shipping"><input type="number" step="0.01" value={form.shipping} onChange={(e) => setForm({ ...form, shipping: e.target.value })} /></Field>
        <Field label="Qty"><input type="number" min="1" step="1" value={form.quantity ?? 1} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <TierPriceInput
          label="Raw"
          sale1={form.rawSale1 ?? ""}
          sale2={form.rawSale2 ?? ""}
          onChange1={(v) => setForm({ ...form, rawSale1: v })}
          onChange2={(v) => setForm({ ...form, rawSale2: v })}
        />
        <TierPriceInput
          label="PSA 9"
          sale1={form.psa9Sale1 ?? ""}
          sale2={form.psa9Sale2 ?? ""}
          onChange1={(v) => setForm({ ...form, psa9Sale1: v })}
          onChange2={(v) => setForm({ ...form, psa9Sale2: v })}
        />
        <TierPriceInput
          label="PSA 10"
          sale1={form.psa10Sale1 ?? ""}
          sale2={form.psa10Sale2 ?? ""}
          onChange1={(v) => setForm({ ...form, psa10Sale1: v })}
          onChange2={(v) => setForm({ ...form, psa10Sale2: v })}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Grading service">
          <select value={form.gradingService || "PSA via Australia"} onChange={(e) => setForm({ ...form, gradingService: e.target.value })}>
            {GRADING_SERVICE_OPTIONS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Set gem rate % (from GemRate)">
          <input type="number" step="0.1" min="0" max="100" placeholder="e.g. 22.5" value={form.setGemRate ?? ""} onChange={(e) => setForm({ ...form, setGemRate: e.target.value })} />
        </Field>
      </div>
      <div style={{ fontSize: 11, color: "#6B7180", marginTop: -6 }}>
        <a href="https://www.gemrate.com/universal-search" target="_blank" rel="noreferrer" style={{ color: "#5C7A99" }}>Search GemRate ↗</a> — real population-report data on what % of this set's submissions actually come back PSA 10. Used as the base rate for Graded EV whenever there's no photo check saved.
      </div>
      <Field label="Actual sell price (if sold)">
        <input type="number" step="0.01" value={form.actualSellPrice ?? ""} onChange={(e) => setForm({ ...form, actualSellPrice: e.target.value })} />
      </Field>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button className="btnPrimary" onClick={onSave}>Save changes</button>
        <button className="btnSecondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
