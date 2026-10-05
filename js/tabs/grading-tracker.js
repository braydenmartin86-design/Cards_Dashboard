// ===== Grading Tracker =====

function GradingTracker({ cards, pokemonCards, onUpdateCardIn }) {
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
