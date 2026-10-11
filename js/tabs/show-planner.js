// ===== Card Show planner =====
// One show at a time: a budget, a buy list (from Monthly Targets or typed in) with the most to
// pay for each, a sell/trade box of in-hand cards worth moving (aging stock, sell calls, stale
// listings), and a running total of what was spent and sold. Saved like everything else, so it
// syncs to your phone for the day.

const SHOW_STORAGE_KEY = "cardflip_ev_show_plan_v1";
const SHOW_SELL_AGE_DAYS = 60;

function emptyShowPlan() {
  return { name: "", date: "", budget: "", wants: [], box: [], extras: [], sold: [] };
}

// Dealers usually offer well under comps in cash (they need their own margin); trade credit
// tends to be higher. A rough guide only.
const DEALER_CASH_RANGE = [0.7, 0.8];

function showCardLabel(c) {
  return [c.player, c.grade, c.card].filter(Boolean).join(" · ");
}

// Why a held card is worth bringing to a show, or null if it isn't.
function showSellReason(c) {
  if (["Sell Raw First", "Sell PSA 9", "Sell PSA 10"].includes(c.sellDecision)) return sellDecisionLabel(c, c.sellDecision);
  const held = daysHeld(c);
  if (held != null && held >= SHOW_SELL_AGE_DAYS) return `Held ${held} days`;
  if (c.status === "Listed" && typeof listingCheck === "function") {
    const k = listingCheck(c);
    if (LISTING_ACTION_STAGES.includes(k.stage) && k.stage !== "noDate") return `Listed ${k.totalDays} days, unsold`;
  }
  return null;
}

function CardShowPlanner({ cards, pokemonCards, targets, setTargets, onUpdateCardIn, onAddToCollection, setTab }) {
  const [plan, setPlan] = useState(null);
  const [wantForm, setWantForm] = useState({ label: "", max: "" });
  const [extraForm, setExtraForm] = useState({ desc: "", amount: "" });
  const [pickCard, setPickCard] = useState("");
  const [confirmNew, setConfirmNew] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    storageGet(SHOW_STORAGE_KEY).then((data) => alive && setPlan({ ...emptyShowPlan(), ...(data || {}) }));
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (plan) storageSet(SHOW_STORAGE_KEY, plan);
  }, [plan]);

  // In-hand cards you still hold (vault cards can't come to a show), computed once.
  const held = useMemo(
    () =>
      [...cards.map((c) => ({ ...computeCard(c), _source: "cards" })), ...pokemonCards.map((c) => ({ ...computePokemonCard(c), _source: "pokemon" }))].filter(
        (c) => ["Raw", "Graded", "Listed"].includes(c.status) && (!c.location || c.location === "In Hand")
      ),
    [cards, pokemonCards]
  );

  if (!plan) return <div style={{ marginTop: 24, color: "#6B7180", fontSize: 13 }}>Loading your show plan…</div>;

  const update = (patch) => setPlan((p) => ({ ...p, ...patch }));
  const today = new Date().toISOString().slice(0, 10);
  const num = (v) => Number(v) || 0;

  const spentCards = plan.wants.reduce((s, w) => s + (w.gotPaid != null ? num(w.gotPaid) : 0), 0);
  const spentOther = plan.extras.reduce((s, e) => s + num(e.amount), 0);
  const spent = spentCards + spentOther;
  const budget = num(plan.budget);
  const left = budget - spent;
  const soldTotal = plan.sold.reduce((s, x) => s + num(x.price), 0);
  const soldProfit = plan.sold.reduce((s, x) => s + num(x.price) - num(x.cost), 0);

  // ----- Buy list -----
  const watching = targets.filter((t) => t.status === "Watching" && !plan.wants.some((w) => w.targetId === t.id));
  function addTarget(id) {
    const t = targets.find((x) => x.id === id);
    if (!t) return;
    update({
      wants: [
        ...plan.wants,
        {
          id: crypto.randomUUID(),
          targetId: t.id,
          label: [t.player, t.cardToLookFor].filter(Boolean).join(" — "),
          player: t.player,
          card: t.cardToLookFor || "",
          sport: t.sport,
          maxRaw: num(t.targetPriceRaw) || null,
          maxGraded: num(t.targetPriceGraded) || null,
          gotPaid: null,
        },
      ],
    });
  }
  function addWant() {
    if (!wantForm.label.trim()) return;
    update({ wants: [...plan.wants, { id: crypto.randomUUID(), label: wantForm.label.trim(), player: wantForm.label.trim(), card: "", sport: "Other", maxRaw: num(wantForm.max) || null, maxGraded: null, gotPaid: null }] });
    setWantForm({ label: "", max: "" });
  }
  const setWant = (id, patch) => update({ wants: plan.wants.map((w) => (w.id === id ? { ...w, ...patch } : w)) });
  function gotIt(w, paid, grade) {
    setWant(w.id, { gotPaid: num(paid), gotGrade: grade || null, gotAt: today });
    if (w.targetId) setTargets((prev) => prev.map((t) => (t.id === w.targetId ? { ...t, status: "Bought" } : t)));
  }
  function undoGot(w) {
    setWant(w.id, { gotPaid: null, gotGrade: null, addedToCards: false });
    if (w.targetId) setTargets((prev) => prev.map((t) => (t.id === w.targetId ? { ...t, status: "Watching" } : t)));
  }
  function addToCards(w) {
    const grade = w.gotGrade || null;
    onAddToCollection([
      {
        id: crypto.randomUUID(),
        player: w.player || w.label,
        card: w.card || "",
        cardNum: "",
        sport: SPORT_OPTIONS.includes(w.sport) ? w.sport : "Other",
        location: "In Hand",
        rookie: /\b(rc|rookie)\b/i.test(w.card || ""),
        quantity: 1,
        shipMyCards: "No",
        status: grade ? "Graded" : "Raw",
        grade,
        paid: num(w.gotPaid),
        shipping: 0,
        feesPct: 0.137,
        gradingService: grade ? "Bought Graded" : "PSA via Australia",
        psa10Prob: 0.35,
        psa9Prob: 0.45,
        datePurchased: w.gotAt || today,
        notes: plan.name ? `Bought at ${plan.name}` : "Bought at a card show",
      },
    ]);
    setWant(w.id, { addedToCards: true });
  }

  // ----- Sell / trade box -----
  const inBox = (c) => plan.box.some((b) => b.source === c._source && b.id === c.id);
  const suggestions = held
    .filter((c) => !inBox(c))
    .map((c) => ({ c, reason: showSellReason(c) }))
    .filter((x) => x.reason)
    .sort((a, b) => b.c.totalCost - a.c.totalCost);
  const boxCards = plan.box.map((b) => ({ b, c: held.find((c) => c._source === b.source && c.id === b.id) })).filter((x) => x.c);
  const addToBox = (c) => {
    const value = currentMarketValue(c);
    update({ box: [...plan.box, { source: c._source, id: c.id, ask: value != null ? Math.ceil(value) : "" }] });
  };
  const setBox = (b, patch) => update({ box: plan.box.map((x) => (x === b ? { ...x, ...patch } : x)) });
  const removeFromBox = (b) => update({ box: plan.box.filter((x) => x !== b) });
  function soldAtShow(b, c, price) {
    const p = num(price);
    if (!(p > 0)) return;
    onUpdateCardIn(b.source, c.id, { status: "Sold", actualSellPrice: p, sellingMethod: "Card show (in person)", actualFeesPaid: 0 });
    update({ box: plan.box.filter((x) => x !== b), sold: [...plan.sold, { label: showCardLabel(c), price: p, cost: c.totalCost, date: today }] });
  }

  async function copyBox() {
    const lines = boxCards.map(({ b, c }) => `${showCardLabel(c)} — ask $${num(b.ask) || "?"} (lowest $${Math.ceil(c.totalCost)})`);
    const wants = plan.wants.filter((w) => w.gotPaid == null).map((w) => `WANT: ${w.label} — max ${w.maxRaw ? `$${w.maxRaw} raw` : ""}${w.maxRaw && w.maxGraded ? " / " : ""}${w.maxGraded ? `$${w.maxGraded} graded` : ""}`);
    const ok = await copyToClipboard([plan.name || "Card show", ...wants, "", "SELLING:", ...lines].join("\n"));
    setCopied(ok);
    setTimeout(() => setCopied(false), 1800);
  }

  // ----- Other costs -----
  function addExtra() {
    if (!(num(extraForm.amount) > 0)) return;
    update({ extras: [...plan.extras, { id: crypto.randomUUID(), desc: extraForm.desc.trim() || "Other", amount: num(extraForm.amount) }] });
    setExtraForm({ desc: "", amount: "" });
  }

  const box = { border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22", marginBottom: 16 };
  const small = { fontSize: 11, padding: "3px 9px" };
  const pct = budget > 0 ? Math.min(1, spent / budget) : 0;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontSize: 13, color: "#8B90A0", marginBottom: 16, lineHeight: 1.6 }}>
        Plan a show before you go: what you're hunting and the most to pay, what you're bringing to sell or trade, and a budget. It saves as you go and syncs to your phone. Check any card on the spot with{" "}
        <button type="button" className="btnSecondary" style={small} onClick={() => setTab("quickscan")}>📷 Quick Scan</button>.
      </div>

      {/* ----- Show + budget ----- */}
      <div style={box}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="Show">
            <input value={plan.name} placeholder="e.g. Brisbane Card Show" onChange={(e) => update({ name: e.target.value })} style={{ minWidth: 200 }} />
          </Field>
          <Field label="Date">
            <input type="date" value={plan.date} onChange={(e) => update({ date: e.target.value })} />
          </Field>
          <Field label="Budget (A$)">
            <input type="number" step="1" min="0" value={plan.budget} placeholder="e.g. 500" onChange={(e) => update({ budget: e.target.value })} style={{ width: 110 }} />
          </Field>
          <div style={{ marginLeft: "auto" }}>
            {confirmNew ? (
              <span style={{ fontSize: 12, color: "#C9A227" }}>
                Clear this plan?{" "}
                <button type="button" className="btnSecondary" style={small} onClick={() => { setPlan(emptyShowPlan()); setConfirmNew(false); }}>Yes, start fresh</button>{" "}
                <button type="button" className="btnSecondary" style={small} onClick={() => setConfirmNew(false)}>Cancel</button>
              </span>
            ) : (
              <button type="button" className="btnSecondary" style={small} onClick={() => setConfirmNew(true)}>Start a new show</button>
            )}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginTop: 12 }}>
          <MiniStat label="Spent" value={fmtMoney(spent)} />
          <MiniStat label="Left" value={budget > 0 ? fmtMoney(left) : "—"} color={budget > 0 ? (left >= 0 ? "#4E8B6B" : "#B4472E") : undefined} />
          <MiniStat label="Sold at show" value={fmtMoney(soldTotal)} color={soldTotal > 0 ? "#4E8B6B" : undefined} />
          <MiniStat label="Profit on sales" value={plan.sold.length ? fmtMoney(soldProfit) : "—"} color={soldProfit >= 0 ? "#4E8B6B" : "#B4472E"} />
        </div>
        {budget > 0 && (
          <div style={{ height: 6, background: "#24272F", borderRadius: 999, marginTop: 10, overflow: "hidden" }}>
            <div style={{ width: `${pct * 100}%`, height: "100%", background: left >= 0 ? "#4E8B6B" : "#B4472E" }} />
          </div>
        )}
        {budget > 0 && left < 0 && <div style={{ fontSize: 11.5, color: "#B4472E", marginTop: 6 }}>Over budget by {fmtMoney(-left)}.</div>}
      </div>

      {/* ----- Buy list ----- */}
      <SectionTitle>🛒 Buy list</SectionTitle>
      <div style={box}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
          <select value="" onChange={(e) => e.target.value && addTarget(e.target.value)} style={{ width: "auto", minWidth: 220 }} disabled={!watching.length}>
            <option value="">{watching.length ? `+ Add from Monthly Targets (${watching.length})` : "No watched targets to add"}</option>
            {watching.map((t) => (
              <option key={t.id} value={t.id}>
                {[t.player, t.cardToLookFor].filter(Boolean).join(" — ")}
                {num(t.targetPriceRaw) ? ` · raw $${t.targetPriceRaw}` : ""}
                {num(t.targetPriceGraded) ? ` · graded $${t.targetPriceGraded}` : ""}
              </option>
            ))}
          </select>
          <span style={{ fontSize: 11.5, color: "#6B7180" }}>or</span>
          <input value={wantForm.label} placeholder="Card you're after" onChange={(e) => setWantForm({ ...wantForm, label: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addWant()} style={{ minWidth: 180, flex: 1 }} />
          <input type="number" step="1" min="0" value={wantForm.max} placeholder="Max A$" onChange={(e) => setWantForm({ ...wantForm, max: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addWant()} style={{ width: 90 }} />
          <button type="button" className="btnSecondary" style={small} onClick={addWant} disabled={!wantForm.label.trim()}>Add</button>
        </div>
        {plan.wants.length === 0 ? (
          <div style={{ fontSize: 12, color: "#5C6270" }}>Nothing on the list yet. Add cards from Monthly Targets (their target prices become your max) or type one in.</div>
        ) : (
          plan.wants.map((w) => <ShowWantRow key={w.id} w={w} onSet={(patch) => setWant(w.id, patch)} onGot={gotIt} onUndo={undoGot} onAddToCards={addToCards} onRemove={() => update({ wants: plan.wants.filter((x) => x.id !== w.id) })} />)
        )}
      </div>

      {/* ----- Sell / trade box ----- */}
      <SectionTitle>📦 Sell / trade box</SectionTitle>
      <div style={box}>
        <div style={{ fontSize: 11.5, color: "#6B7180", marginBottom: 10, lineHeight: 1.6 }}>
          Cards in hand worth moving. Selling at a show has no fees or postage, so anything above your cost is profit — dealers usually offer about {DEALER_CASH_RANGE[0] * 100}–{DEALER_CASH_RANGE[1] * 100}% of comps in cash, often more in trade. For a trade, enter the trade value as the price, then add the card you got from the buy list. Listed cards: end the online listing before you sell them here.
        </div>

        {suggestions.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "#8B90A0", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Suggested to bring</div>
            {suggestions.slice(0, 8).map(({ c, reason }) => (
              <div key={`${c._source}-${c.id}`} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 12.5, padding: "4px 0" }}>
                <button type="button" className="btnSecondary" style={small} onClick={() => addToBox(c)}>+ Add</button>
                <span style={{ fontWeight: 600 }}>{c.player}</span>
                <span style={{ color: "#6B7180" }}>{[c.grade, c.card].filter(Boolean).join(" · ")}</span>
                <span className="mono" style={{ fontSize: 10, color: "#C9A227", border: "1px solid #C9A22755", borderRadius: 4, padding: "0 5px" }}>{reason}</span>
              </div>
            ))}
            {suggestions.length > 8 && <div style={{ fontSize: 11, color: "#6B7180" }}>+ {suggestions.length - 8} more — add them below.</div>}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
          <select value={pickCard} onChange={(e) => setPickCard(e.target.value)} style={{ width: "auto", minWidth: 220, flex: 1 }}>
            <option value="">Add any card in hand…</option>
            {held.filter((c) => !inBox(c)).map((c) => (
              <option key={`${c._source}-${c.id}`} value={`${c._source}|${c.id}`}>{showCardLabel(c)}</option>
            ))}
          </select>
          <button
            type="button"
            className="btnSecondary"
            style={small}
            disabled={!pickCard}
            onClick={() => {
              const [source, id] = pickCard.split("|");
              const c = held.find((x) => x._source === source && String(x.id) === id);
              if (c) addToBox(c);
              setPickCard("");
            }}
          >
            Add
          </button>
        </div>

        {boxCards.length === 0 ? (
          <div style={{ fontSize: 12, color: "#5C6270" }}>The box is empty.</div>
        ) : (
          boxCards.map(({ b, c }) => <ShowBoxRow key={`${b.source}-${b.id}`} b={b} c={c} onSet={(patch) => setBox(b, patch)} onSold={(price) => soldAtShow(b, c, price)} onRemove={() => removeFromBox(b)} />)
        )}

        {(boxCards.length > 0 || plan.wants.length > 0) && (
          <button type="button" className="btnSecondary" style={{ ...small, marginTop: 10 }} onClick={copyBox}>
            {copied ? "Copied ✓" : "📋 Copy lists for your phone notes"}
          </button>
        )}

        {plan.sold.length > 0 && (
          <div style={{ marginTop: 12, borderTop: "1px solid #24272F", paddingTop: 8 }}>
            <div style={{ fontSize: 11, color: "#8B90A0", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Sold at this show</div>
            {plan.sold.map((s, i) => (
              <div key={i} style={{ fontSize: 12, color: "#A7ADBB", padding: "2px 0" }}>
                {s.label} — {fmtMoney(s.price)} <span style={{ color: s.price - s.cost >= 0 ? "#4E8B6B" : "#B4472E" }}>({s.price - s.cost >= 0 ? "+" : ""}{fmtMoney(s.price - s.cost)})</span>
              </div>
            ))}
            <div style={{ fontSize: 11, color: "#6B7180", marginTop: 2 }}>These are marked Sold in My Sales with no fees.</div>
          </div>
        )}
      </div>

      {/* ----- Other costs ----- */}
      <SectionTitle>🎟️ Other costs</SectionTitle>
      <div style={box}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input value={extraForm.desc} placeholder="Entry, parking, fuel…" onChange={(e) => setExtraForm({ ...extraForm, desc: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addExtra()} style={{ minWidth: 180, flex: 1 }} />
          <input type="number" step="0.01" min="0" value={extraForm.amount} placeholder="A$" onChange={(e) => setExtraForm({ ...extraForm, amount: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addExtra()} style={{ width: 90 }} />
          <button type="button" className="btnSecondary" style={small} onClick={addExtra} disabled={!(num(extraForm.amount) > 0)}>Add</button>
        </div>
        {plan.extras.map((e) => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "4px 0", color: "#A7ADBB" }}>
            <span>{e.desc}</span>
            <span>
              {fmtMoney(e.amount)}{" "}
              <button type="button" onClick={() => update({ extras: plan.extras.filter((x) => x.id !== e.id) })} style={{ background: "none", border: "none", color: "#6B7180", cursor: "pointer" }} title="Remove">×</button>
            </span>
          </div>
        ))}
        {plan.extras.length > 0 && <div style={{ fontSize: 11, color: "#6B7180", marginTop: 4 }}>Counted in Spent. Log them in Business Summary as expenses too if you claim them.</div>}
      </div>
    </div>
  );
}

function ShowWantRow({ w, onSet, onGot, onUndo, onAddToCards, onRemove }) {
  const [paid, setPaid] = useState("");
  const [grade, setGrade] = useState("");
  const small = { fontSize: 11, padding: "3px 9px" };
  const got = w.gotPaid != null;
  const max = grade ? w.maxGraded || w.maxRaw : w.maxRaw || w.maxGraded;
  const over = !got && Number(paid) > 0 && max && Number(paid) > max;
  const gotMax = w.gotGrade ? w.maxGraded || w.maxRaw : w.maxRaw || w.maxGraded;

  return (
    <div className="cardRow" style={{ padding: "8px", borderRadius: 6, fontSize: 12.5, borderTop: "1px solid #24272F" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
        <span style={{ fontWeight: 600, textDecoration: got ? "line-through" : "none", color: got ? "#6B7180" : "#EDEAE1" }}>{w.label}</span>
        <span style={{ fontSize: 11.5, color: "#8B90A0" }}>
          Max{" "}
          <input type="number" step="1" min="0" value={w.maxRaw ?? ""} placeholder="raw" onChange={(e) => onSet({ maxRaw: Number(e.target.value) || null })} style={{ width: 70, fontSize: 11.5, padding: "2px 5px" }} title="Most to pay, raw (A$)" />{" "}
          <input type="number" step="1" min="0" value={w.maxGraded ?? ""} placeholder="graded" onChange={(e) => onSet({ maxGraded: Number(e.target.value) || null })} style={{ width: 70, fontSize: 11.5, padding: "2px 5px" }} title="Most to pay, graded (A$)" />
          <button type="button" onClick={onRemove} style={{ background: "none", border: "none", color: "#6B7180", cursor: "pointer", marginLeft: 4 }} title="Remove">×</button>
        </span>
      </div>
      {!got ? (
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
          <select value={grade} onChange={(e) => setGrade(e.target.value)} style={{ width: "auto", fontSize: 11.5, padding: "3px 6px" }}>
            <option value="">Raw</option>
            {GRADE_OPTIONS.map((g) => <option key={g}>{g}</option>)}
          </select>
          <input type="number" step="0.01" min="0" value={paid} placeholder="Paid A$" onChange={(e) => setPaid(e.target.value)} style={{ width: 90, fontSize: 11.5, padding: "3px 6px" }} />
          <button type="button" className="btnSecondary" style={{ ...small, borderColor: "#4E8B6B66", color: "#4E8B6B" }} disabled={!(Number(paid) > 0)} onClick={() => onGot(w, paid, grade)}>Got it ✓</button>
          {over && <span style={{ fontSize: 11, color: "#B4472E" }}>Over your max ({fmtMoney(max)})</span>}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4, flexWrap: "wrap", fontSize: 12 }}>
          <span style={{ color: "#4E8B6B" }}>
            Got it{w.gotGrade ? ` (${w.gotGrade})` : ""} for {fmtMoney(w.gotPaid)}
            {gotMax ? ` — ${w.gotPaid <= gotMax ? `${fmtMoney(gotMax - w.gotPaid)} under` : `${fmtMoney(w.gotPaid - gotMax)} over`} your max` : ""}
          </span>
          {w.addedToCards ? (
            <span style={{ fontSize: 11, color: "#6B7180" }}>Added to your cards ✓</span>
          ) : (
            <button type="button" className="btnSecondary" style={small} onClick={() => onAddToCards(w)}>+ Add to my cards</button>
          )}
          {!w.addedToCards && <button type="button" className="btnSecondary" style={small} onClick={() => onUndo(w)}>Undo</button>}
        </div>
      )}
    </div>
  );
}

function ShowBoxRow({ b, c, onSet, onSold, onRemove }) {
  const [selling, setSelling] = useState(false);
  const [price, setPrice] = useState("");
  const small = { fontSize: 11, padding: "3px 9px" };
  const value = currentMarketValue(c);
  const cost = c.totalCost;
  const below = Number(price) > 0 && Number(price) < cost;

  return (
    <div className="cardRow" style={{ padding: "8px", borderRadius: 6, fontSize: 12.5, borderTop: "1px solid #24272F" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
        <span>
          <span style={{ fontWeight: 600 }}>{c.player}</span>
          <span style={{ color: "#6B7180", marginLeft: 6 }}>{[c.grade, c.card].filter(Boolean).join(" · ")}</span>
          {c.status === "Listed" && <span style={{ fontSize: 10.5, color: "#2FA89A", marginLeft: 6 }}>listed online</span>}
        </span>
        <span style={{ fontSize: 11.5, color: "#8B90A0" }}>
          Ask A${" "}
          <input type="number" step="1" min="0" value={b.ask} onChange={(e) => onSet({ ask: e.target.value })} style={{ width: 70, fontSize: 11.5, padding: "2px 5px" }} />
          <button type="button" onClick={onRemove} style={{ background: "none", border: "none", color: "#6B7180", cursor: "pointer", marginLeft: 4 }} title="Take out of the box">×</button>
        </span>
      </div>
      <div style={{ fontSize: 11.5, color: "#8B90A0", marginTop: 2 }}>
        Comps {value != null ? fmtMoney(value) : "—"} · your cost <span style={{ color: "#C9A227" }}>{fmtMoney(cost)}</span>
        {value != null && ` · typical dealer cash ${fmtMoney(value * DEALER_CASH_RANGE[0])}–${fmtMoney(value * DEALER_CASH_RANGE[1])}`}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
        {selling ? (
          <>
            <input type="number" step="0.01" min="0" autoFocus value={price} placeholder="Sold for A$" onChange={(e) => setPrice(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSold(price)} style={{ width: 100, fontSize: 11.5, padding: "3px 6px" }} />
            <button type="button" className="btnSecondary" style={{ ...small, borderColor: "#4E8B6B66", color: "#4E8B6B" }} disabled={!(Number(price) > 0)} onClick={() => onSold(price)}>Save sale</button>
            <button type="button" className="btnSecondary" style={small} onClick={() => setSelling(false)}>Cancel</button>
            {below && <span style={{ fontSize: 11, color: "#B4472E" }}>Below your cost — a loss of {fmtMoney(cost - Number(price))}.</span>}
          </>
        ) : (
          <button type="button" className="btnSecondary" style={small} onClick={() => setSelling(true)}>Sold / traded</button>
        )}
      </div>
    </div>
  );
}
