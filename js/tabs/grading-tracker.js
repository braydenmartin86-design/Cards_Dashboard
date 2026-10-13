// ===== Grading Tracker =====

// ===== Submission planner =====
// Raw cards worth grading, grouped by service and turnaround band (cards sent together come back
// together), with each card's fee, expected profit if graded vs selling raw now, and batch totals
// after postage. "Send" marks the chosen cards At Grading with their fee locked in.

function turnaroundLabel(days) {
  if (!days) return "turnaround unknown";
  return days >= 60 ? `~${Math.round(days / 30)} months` : `~${days} days`;
}

function declaredValueOf(c) {
  return Math.max(Number(c.psa9Avg) || 0, Number(c.psa10Avg) || 0, Number(c.rawAvg) || 0);
}

function SubmissionPlanner({ cards, pokemonCards, onUpdateCardIn }) {
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState(null); // Set of "src-id"
  const [postage, setPostage] = useState("");
  const [addPostageToCost, setAddPostageToCost] = useState(true);
  const [sentCount, setSentCount] = useState(null);

  const candidates = useMemo(() => {
    // Cards without a grading service are planned as PSA via Australia, and worked out with that
    // service so the grading fee is included in their expected profit.
    const withService = (c) => (c.gradingService && !["None", "Bought Graded"].includes(c.gradingService) ? c : { ...c, gradingService: "PSA via Australia" });
    const own = cards.map((c) => ({ ...computeCard(withService(c)), _src: "cards" }));
    const pkmn = pokemonCards.map((c) => ({ ...computePokemonCard(withService(c)), _src: "pokemon" }));
    return [...own, ...pkmn]
      .filter((c) => c.status === "Raw" && c.gradedEV != null && (c.psa9Avg != null || c.psa10Avg != null))
      .map((c) => {
        const service = c.gradingService;
        const declared = declaredValueOf(c);
        return {
          ...c,
          _key: `${c._src}-${c.id}`,
          _service: service,
          _fee: gradingCost(service, declared),
          _days: estimateGradingTurnaroundDays(service, declared),
          // Graded EV already has the grading fee taken off; compare it with selling raw today.
          _gain: c.gradedEV - (c.rawGGR ?? 0),
          _recommended: c.sellDecision === "Grade First",
        };
      })
      .filter((c) => showAll || c._recommended)
      .sort((a, b) => b._gain - a._gain);
  }, [cards, pokemonCards, showAll]);

  // Recommended cards start ticked.
  const chosen = selected || new Set(candidates.filter((c) => c._recommended).map((c) => c._key));
  const picked = candidates.filter((c) => chosen.has(c._key));
  const postageTotal = Number(postage) || 0;
  const totals = {
    fees: picked.reduce((s, c) => s + c._fee, 0),
    gain: picked.reduce((s, c) => s + c._gain, 0),
    gradedEV: picked.reduce((s, c) => s + c.gradedEV, 0),
  };
  const netGain = totals.gain - postageTotal;

  const groups = {};
  for (const c of candidates) {
    const key = `${c._service} · ${turnaroundLabel(c._days)}`;
    (groups[key] = groups[key] || []).push(c);
  }

  function toggle(key) {
    const next = new Set(chosen);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  }

  function send() {
    if (!picked.length) return;
    const today = new Date().toISOString().slice(0, 10);
    const postageEach = addPostageToCost && postageTotal ? Math.round((postageTotal / picked.length) * 100) / 100 : 0;
    for (const c of picked) {
      onUpdateCardIn(c._src, c.id, {
        status: "At Grading",
        gradingService: c._service,
        gradingCostPaid: c._fee,
        gradingSentDate: today,
        ...(postageEach ? { shipping: Math.round(((Number(c.shipping) || 0) + postageEach) * 100) / 100 } : {}),
      });
    }
    setSentCount(picked.length);
    setSelected(new Set());
  }

  return (
    <div style={{ border: "1px solid #8B6FD655", borderRadius: 10, padding: "14px 16px", background: "#191B22", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
        <div className="oswald" style={{ fontSize: 16, fontWeight: 600 }}>📦 Plan your next submission</div>
        <label style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 12, color: "#A7ADBB", cursor: "pointer" }}>
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} style={{ width: "auto", margin: 0 }} />
          Show all raw cards, not just "Grade First"
        </label>
      </div>
      <div style={{ fontSize: 11.5, color: "#8B90A0", marginBottom: 10, lineHeight: 1.5 }}>
        "Gain" = expected profit if graded (after the grading fee) minus the profit from selling raw today. Cards are grouped by service and turnaround — PSA's wait depends on declared value, so cards in the same band come back together.
      </div>

      {sentCount != null && (
        <div style={{ fontSize: 12.5, color: "#4E8B6B", marginBottom: 10 }}>✓ {sentCount} card{sentCount === 1 ? "" : "s"} marked as At Grading — they're now tracked below.</div>
      )}

      {candidates.length === 0 ? (
        <div style={{ fontSize: 12.5, color: "#5C6270", padding: "8px 0" }}>
          {showAll ? "No raw cards with market values yet — use 🔄 Update Comps on your cards first." : 'No cards are flagged "Grade First" right now. Tick "Show all raw cards" to plan one anyway.'}
        </div>
      ) : (
        <>
          {Object.entries(groups).map(([group, list]) => (
            <div key={group} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#8B6FD6", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{group}</div>
              <div style={{ border: "1px solid #2C303B", borderRadius: 8, overflow: "hidden" }}>
                {list.map((c, i) => (
                  <label
                    key={c._key}
                    style={{ display: "grid", gridTemplateColumns: "20px 1fr 70px 90px", gap: 8, alignItems: "center", padding: "7px 10px", borderTop: i ? "1px solid #24272F" : "none", margin: 0, fontSize: 12.5, color: "#EDEAE1", cursor: "pointer" }}
                  >
                    <input type="checkbox" checked={chosen.has(c._key)} onChange={() => toggle(c._key)} style={{ width: "auto", margin: 0 }} />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ fontWeight: 600 }}>{c.player}</span>
                      <span style={{ color: "#6B7180", marginLeft: 6 }}>{c.card} {c.cardNum}</span>
                      {c.gradeCall === "HIGH RISK" && <span style={{ color: "#C9A227", marginLeft: 6, fontSize: 11 }}>⚠️ high risk</span>}
                      {c.gradeAnalysis && <span style={{ color: "#8B6FD6", marginLeft: 6, fontSize: 11 }}>📸 PSA {c.gradeAnalysis.predictedGradeLow}–{c.gradeAnalysis.predictedGradeHigh}</span>}
                    </span>
                    <span style={{ color: "#8B90A0", textAlign: "right" }}>{fmtMoney(c._fee)} fee</span>
                    <span style={{ fontWeight: 700, textAlign: "right", color: c._gain >= 0 ? "#4E8B6B" : "#B4472E" }}>
                      {c._gain >= 0 ? "+" : ""}
                      {fmtMoney(c._gain)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, alignItems: "end", marginTop: 12 }}>
            <MiniStat label={`Cards picked`} value={picked.length} />
            <MiniStat label="Grading fees" value={fmtMoney(totals.fees)} />
            <Field label="Postage there & back (A$)">
              <input type="number" step="0.01" min="0" placeholder="e.g. 25" value={postage} onChange={(e) => setPostage(e.target.value)} />
            </Field>
            <MiniStat label="Net gain vs selling raw" value={`${netGain >= 0 ? "+" : ""}${fmtMoney(netGain)}`} color={netGain >= 0 ? "#4E8B6B" : "#B4472E"} emphasis />
          </div>
          <div style={{ fontSize: 11.5, color: netGain >= 0 ? "#8B90A0" : "#B4472E", margin: "8px 0", lineHeight: 1.5 }}>
            {picked.length === 0
              ? "Tick the cards to send."
              : netGain >= 0
              ? `Worth sending: about ${fmtMoney(netGain)} more expected profit than selling these raw, after fees${postageTotal ? " and postage" : ""}.`
              : "Not worth it as picked — postage and fees outweigh the expected gain. Add more cards or skip this batch."}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button className="btnPrimary" style={{ fontSize: 12.5, padding: "7px 14px" }} onClick={send} disabled={!picked.length}>
              Send {picked.length} to grading
            </button>
            {postageTotal > 0 && (
              <label style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, fontSize: 12, color: "#A7ADBB", cursor: "pointer" }}>
                <input type="checkbox" checked={addPostageToCost} onChange={(e) => setAddPostageToCost(e.target.checked)} style={{ width: "auto", margin: 0 }} />
                Split postage into the cards' cost ({fmtMoney(postageTotal / Math.max(1, picked.length))} each)
              </label>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ===== Grading results =====
// Every card you've had graded, the grade it came back, and what it was expected to get when it
// was sent — so you can see your real PSA 10 rate and how good your picks (and Grade Check's
// photo calls) are. Your rate can replace the default 35% / 45% in the grade-or-sell maths.

const GRADING_SETTINGS_KEY = "cardflip_ev_grading_settings_v1";
const MY_RATES_MIN_RESULTS = 5;
// Your results are blended with the defaults as if you'd already graded this many cards at the
// default rates, so a lucky first few slabs don't swing the maths.
const MY_RATES_PRIOR = 5;

function gradeBucket(grade) {
  const g = String(grade || "").toLowerCase();
  return PSA10_GRADES.includes(g) ? 10 : PSA9_GRADES.includes(g) ? 9 : "below";
}

function gradingResultsFrom(cards, pokemonCards) {
  return [...cards, ...pokemonCards]
    .filter((c) => c.gradingResult || (c.gradingSentDate && c.grade && c.status !== "At Grading" && c.gradingService !== "Bought Graded"))
    .map((c) => {
      const r = c.gradingResult || {};
      const grade = r.grade || c.grade;
      return { card: c, grade, bucket: gradeBucket(grade), returnedAt: r.returnedAt || c.gradingSentDate, expected: r.expected || null };
    })
    .sort((a, b) => String(b.returnedAt).localeCompare(String(a.returnedAt)));
}

function gradingStats(results) {
  const n = results.length;
  const count = (b) => results.filter((r) => r.bucket === b).length;
  const n10 = count(10);
  const n9 = count(9);
  const withExp = results.filter((r) => r.expected);
  const photo = withExp.filter((r) => r.expected.source === "Grade Check photo" && r.expected.low != null);
  const numeric = (g) => {
    const m = String(g).match(/(\d+(?:\.\d)?)/);
    return m ? Number(m[1]) : null;
  };
  return {
    n,
    n10,
    n9,
    nBelow: n - n10 - n9,
    expected10: withExp.reduce((s, r) => s + (Number(r.expected.p10) || 0), 0),
    actual10WithExp: withExp.filter((r) => r.bucket === 10).length,
    nWithExp: withExp.length,
    photoN: photo.length,
    photoInRange: photo.filter((r) => {
      const g = numeric(r.grade);
      return g != null && g >= r.expected.low && g <= r.expected.high;
    }).length,
    blended: {
      p10: (n10 + DEFAULT_GRADE_RATES.p10 * MY_RATES_PRIOR) / (n + MY_RATES_PRIOR),
      p9: (n9 + DEFAULT_GRADE_RATES.p9 * MY_RATES_PRIOR) / (n + MY_RATES_PRIOR),
      mine: true,
    },
  };
}

function GradingResults({ cards, pokemonCards, useMyRates, onToggleMyRates }) {
  const [showAll, setShowAll] = useState(false);
  const results = useMemo(() => gradingResultsFrom(cards, pokemonCards), [cards, pokemonCards]);
  const s = useMemo(() => gradingStats(results), [results]);
  const pct = (x) => `${Math.round(x * 100)}%`;
  const canUse = s.n >= MY_RATES_MIN_RESULTS;
  const box = { border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22", marginBottom: 20 };
  const bucketColor = (b) => (b === 10 ? "#4E8B6B" : b === 9 ? "#C9A227" : "#B4472E");

  let verdict = null;
  if (s.nWithExp >= 3) {
    const diff = s.actual10WithExp - s.expected10;
    verdict =
      Math.abs(diff) < 0.75
        ? { color: "#4E8B6B", text: `Right on track: expected about ${s.expected10.toFixed(1)} PSA 10s from these, got ${s.actual10WithExp}.` }
        : diff > 0
        ? { color: "#4E8B6B", text: `Better than expected: about ${s.expected10.toFixed(1)} PSA 10s predicted, you got ${s.actual10WithExp}. Your eye for gradeable cards is paying off.` }
        : { color: "#B4472E", text: `Worse than expected: about ${s.expected10.toFixed(1)} PSA 10s predicted, you got ${s.actual10WithExp}. Be pickier — check centering and corners closely, and run Grade Check before sending.` };
  }

  return (
    <div>
      <SectionTitle>📊 Your grading results</SectionTitle>
      {s.n === 0 ? (
        <div style={{ ...box, fontSize: 12.5, color: "#5C6270" }}>
          No results yet. When a card comes back, use <b>Mark as returned</b> above (or change its status from At Grading in its details) and pick the grade it got. Cards sent from now on also save what they were expected to grade, so you can see how your picks compare.
        </div>
      ) : (
        <div style={box}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginBottom: 10 }}>
            <MiniStat label="Cards graded" value={s.n} />
            <MiniStat label="Got a 10" value={`${s.n10} · ${pct(s.n10 / s.n)}`} color="#4E8B6B" />
            <MiniStat label="Got a 9 / 9.5" value={`${s.n9} · ${pct(s.n9 / s.n)}`} color="#C9A227" />
            <MiniStat label="8 or lower" value={`${s.nBelow} · ${pct(s.nBelow / s.n)}`} color={s.nBelow ? "#B4472E" : undefined} />
          </div>
          {verdict && <div style={{ fontSize: 12.5, color: verdict.color, marginBottom: 6 }}>{verdict.text}</div>}
          {s.photoN > 0 && (
            <div style={{ fontSize: 12, color: "#8B90A0", marginBottom: 6 }}>
              Grade Check's photo prediction was right (grade within its range) for {s.photoInRange} of {s.photoN} card{s.photoN === 1 ? "" : "s"}.
            </div>
          )}

          <div style={{ borderTop: "1px solid #24272F", paddingTop: 10, marginTop: 6 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: canUse ? "#EDEAE1" : "#6B7180", cursor: canUse ? "pointer" : "default" }}>
              <input type="checkbox" checked={useMyRates && canUse} disabled={!canUse} onChange={(e) => onToggleMyRates(e.target.checked)} style={{ width: "auto", margin: 0 }} />
              Use my real rates in the grade-or-sell maths: PSA 10 {pct(s.blended.p10)}, PSA 9 {pct(s.blended.p9)} (instead of 35% / 45%)
            </label>
            <div style={{ fontSize: 11, color: "#6B7180", marginTop: 4, lineHeight: 1.5 }}>
              {canUse
                ? `Applies to raw cards without a Grade Check photo or set gem rate. Your ${s.n} results are blended with the defaults so a lucky or unlucky few don't swing it — the more you grade, the more it's your own number.`
                : `Available once you have ${MY_RATES_MIN_RESULTS} results (${s.n} so far).`}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            {(showAll ? results : results.slice(0, 8)).map((r) => (
              <div key={r.card.id} style={{ display: "flex", gap: 8, alignItems: "baseline", fontSize: 12.5, padding: "5px 0", borderTop: "1px solid #24272F", flexWrap: "wrap" }}>
                <span className="mono" style={{ color: "#6B7180", fontSize: 11, minWidth: 78 }}>{r.returnedAt}</span>
                <span style={{ fontWeight: 600 }}>{r.card.player}</span>
                <span style={{ color: "#6B7180", flex: 1, minWidth: 100 }}>{r.card.card}</span>
                <span style={{ fontSize: 11, color: "#8B90A0" }}>
                  {r.expected
                    ? `expected ${pct(r.expected.p10)} chance of 10${r.expected.low != null ? ` (photo: ${r.expected.low}–${r.expected.high})` : ` · ${r.expected.source.toLowerCase()}`}`
                    : "no prediction saved"}
                </span>
                <span className="mono" style={{ fontWeight: 700, color: bucketColor(r.bucket), minWidth: 70, textAlign: "right" }}>{r.grade}</span>
              </div>
            ))}
            {results.length > 8 && (
              <button type="button" className="btnSecondary" style={{ fontSize: 11, padding: "3px 9px", marginTop: 6 }} onClick={() => setShowAll((v) => !v)}>
                {showAll ? "Show recent only" : `Show all ${results.length}`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GradingTracker({ cards, pokemonCards, onUpdateCardIn, useMyRates, onToggleMyRates }) {
  const atGrading = useMemo(() => {
    const own = cards.map((c) => ({ ...computeCard(c), _src: "cards" }));
    const pkmn = pokemonCards.map((c) => ({ ...computePokemonCard(c), _src: "pokemon" }));
    return [...own, ...pkmn].filter((c) => c.status === "At Grading").sort((a, b) => (b.gradingProgressPct || 0) - (a.gradingProgressPct || 0));
  }, [cards, pokemonCards]);

  const totalTiedUp = atGrading.reduce((s, c) => s + c.totalCost * (Number(c.quantity) || 1), 0);

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1, background: "#2C303B", border: "1px solid #2C303B", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        <Stat label="Cards at grading" value={atGrading.length} />
        <Stat label="Capital tied up" value={fmtMoney(totalTiedUp)} color="#C9A227" />
      </div>

      <SubmissionPlanner cards={cards} pokemonCards={pokemonCards} onUpdateCardIn={onUpdateCardIn} />

      <div style={{ fontSize: 12.5, color: "#8B90A0", marginBottom: 20, lineHeight: 1.6 }}>
        Send a card to grading from its detail view in My Cards or Pokémon (set Status to "At Grading") and it shows up here automatically, with the grading cost already added to its total cost. Bars are estimated from PSA's published Australia turnaround tiers where the service is PSA via Australia — ShipMyCards and SGC don't have a specific published figure here, so those use a rough estimate, not a guarantee.
      </div>

      {atGrading.length === 0 ? (
        <div style={{ padding: "3rem 0", textAlign: "center", color: "#5C6270", border: "1px solid #2C303B", borderRadius: 10 }}>
          Nothing at grading right now.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {atGrading.map((c) => (
            <GradingTrackerRow key={`${c._src}-${c.id}`} card={c} onUpdateCardIn={onUpdateCardIn} />
          ))}
        </div>
      )}

      <div style={{ height: 24 }} />
      <GradingResults cards={cards} pokemonCards={pokemonCards} useMyRates={useMyRates} onToggleMyRates={onToggleMyRates} />
    </div>
  );
}

function GradingTrackerRow({ card, onUpdateCardIn }) {
  const [returning, setReturning] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("PSA 10");

  const pct = card.gradingProgressPct;
  const overdue = pct != null && pct >= 100;
  const barColor = overdue ? "#B4472E" : pct >= 75 ? "#C9A227" : "#4E8B6B";

  let etaText = "No turnaround estimate for this service";
  if (card.gradingTurnaroundDays) {
    const sent = new Date(card.gradingSentDate);
    const eta = new Date(sent.getTime() + card.gradingTurnaroundDays * 86400000);
    etaText = overdue
      ? `Estimated turnaround passed ${eta.toLocaleDateString()} — check status directly`
      : `Est. return ~${eta.toLocaleDateString()} (${card.gradingDaysElapsed}/${card.gradingTurnaroundDays} days)`;
  }

  function confirmReturn() {
    onUpdateCardIn(card._src, card.id, { status: "Graded", grade: selectedGrade });
    setReturning(false);
  }

  return (
    <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div className="oswald" style={{ fontSize: 15, fontWeight: 600 }}>
            {card.player}
            <span className="mono" style={{ fontSize: 10, color: "#6B7180", marginLeft: 8 }}>{SPORT_EMOJI[card.sport] || "🎴"} {card.sport}</span>
          </div>
          <div style={{ fontSize: 12, color: "#6B7180" }}>{card.card} · {card.gradingService} · sent {card.gradingSentDate}</div>
        </div>
        <button className="btnSecondary" style={{ fontSize: 11.5, padding: "5px 10px" }} onClick={() => setReturning((v) => !v)}>
          {returning ? "Cancel" : "Mark as returned"}
        </button>
      </div>

      <div style={{ height: 8, borderRadius: 999, background: "#14161C", overflow: "hidden", marginBottom: 6 }}>
        <div style={{ height: "100%", width: `${pct ?? 0}%`, background: barColor, transition: "width 0.3s" }} />
      </div>
      <div style={{ fontSize: 11, color: overdue ? "#C9A227" : "#6B7180" }}>{etaText}</div>

      {returning && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #24272F", display: "flex", alignItems: "end", gap: 10 }}>
          <Field label="Grade received">
            <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
              {GRADE_OPTIONS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
          <button className="btnPrimary" onClick={confirmReturn} style={{ padding: "8px 14px" }}>
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}
