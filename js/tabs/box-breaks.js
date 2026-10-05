// ===== Box Breaks =====

function newBoxBreak() {
  return {
    id: crypto.randomUUID(),
    name: "",
    league: "NFL",
    boxCost: "",
    date: new Date().toISOString().slice(0, 10),
    status: "Planned",
    spots: LEAGUE_TEAMS.NFL.map((team) => ({ team, soldPrice: null, buyer: "" })),
  };
}

function boxTotals(box) {
  const cost = Number(box.boxCost) || 0;
  const numSpots = box.spots.length;
  const pricePerSpot = numSpots > 0 ? cost / numSpots : 0;
  const spotsSold = box.spots.filter((s) => s.soldPrice != null && s.soldPrice !== "");
  const revenue = spotsSold.reduce((s, spot) => s + Number(spot.soldPrice), 0);
  const profit = revenue - cost;
  return { cost, numSpots, pricePerSpot, spotsSoldCount: spotsSold.length, revenue, profit };
}

function BoxBreaks({ boxBreaks, setBoxBreaks }) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const totals = useMemo(() => {
    const allTotals = boxBreaks.map(boxTotals);
    const totalSpent = allTotals.reduce((s, t) => s + t.cost, 0);
    const totalRevenue = allTotals.reduce((s, t) => s + t.revenue, 0);
    const totalProfit = totalRevenue - totalSpent;
    const activeBoxes = boxBreaks.filter((b) => b.status !== "Completed").length;
    return { totalSpent, totalRevenue, totalProfit, activeBoxes };
  }, [boxBreaks]);

  function addBox(box) {
    setBoxBreaks((prev) => [box, ...prev]);
    setShowAdd(false);
  }
  function updateBox(id, updates) {
    setBoxBreaks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  }
  function deleteBox(id) {
    setBoxBreaks((prev) => prev.filter((b) => b.id !== id));
    setSelectedId(null);
  }

  const selectedBox = selectedId ? boxBreaks.find((b) => b.id === selectedId) : null;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1, background: "#2C303B", border: "1px solid #2C303B", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        <Stat label="Active breaks" value={totals.activeBoxes} />
        <Stat label="Total spent" value={fmtMoney(totals.totalSpent)} />
        <Stat label="Total revenue" value={fmtMoney(totals.totalRevenue)} />
        <Stat label="Total profit" value={`${totals.totalProfit >= 0 ? "+" : ""}${fmtMoney(totals.totalProfit)}`} color={totals.totalProfit >= 0 ? "#4E8B6B" : "#B4472E"} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "#8B90A0" }}>
          Spend on a box, split the cost across every team, sell spots on Whatnot/eBay Live — auction prices above the split cover your profit.
        </div>
        <button className="btnPrimary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> New box
        </button>
      </div>

      {boxBreaks.length === 0 ? (
        <div style={{ padding: "3rem 0", textAlign: "center", color: "#5C6270", border: "1px solid #2C303B", borderRadius: 10 }}>
          No box breaks logged yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {boxBreaks.map((box) => (
            <BoxRow key={box.id} box={box} onClick={() => setSelectedId(box.id)} />
          ))}
        </div>
      )}

      {showAdd && <BoxAddModal onClose={() => setShowAdd(false)} onSave={addBox} />}
      {selectedBox && <BoxDetailModal box={selectedBox} onClose={() => setSelectedId(null)} onUpdate={updateBox} onDelete={deleteBox} />}
    </div>
  );
}

function BoxRow({ box, onClick }) {
  const t = boxTotals(box);
  const statusColor = box.status === "Completed" ? "#4E8B6B" : box.status === "Live" ? "#B4472E" : "#5C7A99";

  return (
    <div
      onClick={onClick}
      className="cardRow"
      style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22", cursor: "pointer" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div className="oswald" style={{ fontSize: 16, fontWeight: 600 }}>{box.name || "Unnamed box"}</div>
          <div style={{ fontSize: 12, color: "#6B7180" }}>{box.league} · {t.numSpots} spots · {box.date}</div>
        </div>
        <span className="mono" style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: `${statusColor}22`, color: statusColor, fontWeight: 600 }}>
          {box.status}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        <MiniStat label="Box cost" value={fmtMoney(t.cost)} />
        <MiniStat label="Price / spot" value={fmtMoney(t.pricePerSpot)} color="#C9A227" />
        <MiniStat label={`Sold (${t.spotsSoldCount}/${t.numSpots})`} value={fmtMoney(t.revenue)} />
        <MiniStat label="Profit" value={`${t.profit >= 0 ? "+" : ""}${fmtMoney(t.profit)}`} color={t.profit >= 0 ? "#4E8B6B" : "#B4472E"} emphasis />
      </div>
    </div>
  );
}

function BoxAddModal({ onClose, onSave }) {
  const [form, setForm] = useState(newBoxBreak());
  const [customTeams, setCustomTeams] = useState("");

  function handleLeagueChange(league) {
    if (league === "Custom") {
      setForm({ ...form, league, spots: [] });
    } else {
      setForm({ ...form, league, spots: LEAGUE_TEAMS[league].map((team) => ({ team, soldPrice: null, buyer: "" })) });
    }
  }

  function applyCustomTeams() {
    const teams = customTeams.split(",").map((t) => t.trim()).filter(Boolean);
    setForm({ ...form, spots: teams.map((team) => ({ team, soldPrice: null, buyer: "" })) });
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || form.spots.length === 0) return;
    onSave({ ...form, boxCost: Number(form.boxCost) || 0 });
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title="New box break" onClose={onClose} />
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Box name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. 2025 Prizm NFL Hobby Box" required />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="League">
              <select value={form.league} onChange={(e) => handleLeagueChange(e.target.value)}>
                {BOX_LEAGUE_OPTIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Box cost (AUD)">
              <input type="number" step="0.01" value={form.boxCost} onChange={(e) => setForm({ ...form, boxCost: e.target.value })} required />
            </Field>
          </div>
          <Field label="Date">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>

          {form.league === "Custom" ? (
            <Field label="Teams / spots (comma separated)">
              <input value={customTeams} onChange={(e) => setCustomTeams(e.target.value)} onBlur={applyCustomTeams} placeholder="Team A, Team B, Team C…" />
            </Field>
          ) : (
            <div style={{ fontSize: 11.5, color: "#6B7180" }}>{form.spots.length} team spots pre-filled for {form.league} — you can rename any of them after creating the box.</div>
          )}

          {form.boxCost && form.spots.length > 0 && (
            <div style={{ border: "1px solid #C9A22755", borderRadius: 8, padding: "10px 12px", background: "#14161C" }}>
              <div style={{ fontSize: 11, color: "#8B90A0", textTransform: "uppercase", marginBottom: 4 }}>Suggested price per spot</div>
              <div className="oswald" style={{ fontSize: 18, fontWeight: 600, color: "#C9A227" }}>{fmtMoney((Number(form.boxCost) || 0) / form.spots.length)}</div>
            </div>
          )}

          <button className="btnPrimary" type="submit" style={{ justifyContent: "center", marginTop: 6 }}>
            Create box
          </button>
        </form>
      </div>
    </div>
  );
}

function BoxDetailModal({ box, onClose, onUpdate, onDelete }) {
  const t = boxTotals(box);

  function updateSpot(index, updates) {
    const spots = box.spots.map((s, i) => (i === index ? { ...s, ...updates } : s));
    onUpdate(box.id, { spots });
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 12, color: "#8B90A0" }}>{box.league} · {box.date}</div>
            <h2 className="oswald" style={{ margin: "2px 0 0", fontSize: 21 }}>{box.name}</h2>
          </div>
          <X size={20} style={{ cursor: "pointer", color: "#8B90A0" }} onClick={onClose} />
        </div>

        <div style={{ margin: "10px 0 16px" }}>
          <Field label="Status">
            <select value={box.status} onChange={(e) => onUpdate(box.id, { status: e.target.value })}>
              <option>Planned</option>
              <option>Live</option>
              <option>Completed</option>
            </select>
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
          <MiniStat label="Box cost" value={fmtMoney(t.cost)} />
          <MiniStat label="Price / spot" value={fmtMoney(t.pricePerSpot)} color="#C9A227" />
          <MiniStat label="Revenue" value={fmtMoney(t.revenue)} />
          <MiniStat label="Profit" value={`${t.profit >= 0 ? "+" : ""}${fmtMoney(t.profit)}`} color={t.profit >= 0 ? "#4E8B6B" : "#B4472E"} emphasis />
        </div>

        <SectionTitle>Team spots — {t.spotsSoldCount}/{t.numSpots} sold</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto", marginBottom: 16 }}>
          {box.spots.map((spot, i) => {
            const sold = spot.soldPrice != null && spot.soldPrice !== "";
            const delta = sold ? Number(spot.soldPrice) - t.pricePerSpot : null;
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 24px", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: "1px solid #24272F" }}>
                <input
                  value={spot.team}
                  onChange={(e) => updateSpot(i, { team: e.target.value })}
                  style={{ padding: "6px 8px", fontSize: 12.5 }}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder={`~${t.pricePerSpot.toFixed(0)}`}
                  value={spot.soldPrice ?? ""}
                  onChange={(e) => updateSpot(i, { soldPrice: e.target.value === "" ? null : Number(e.target.value) })}
                  style={{ padding: "6px 8px", fontSize: 12.5 }}
                />
                <div style={{ fontSize: 11.5, color: delta == null ? "#5C6270" : delta >= 0 ? "#4E8B6B" : "#B4472E" }}>
                  {delta != null ? `${delta >= 0 ? "+" : ""}${fmtMoney(delta)}` : "unsold"}
                </div>
                <X
                  size={14}
                  style={{ cursor: "pointer", color: "#6B7180" }}
                  onClick={() => onUpdate(box.id, { spots: box.spots.filter((_, si) => si !== i) })}
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            onDelete(box.id);
            onClose();
          }}
          style={{ background: "transparent", border: "1px solid #4a2a24", color: "#B4472E", borderRadius: 8, padding: "9px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        >
          <Trash2 size={14} /> Remove box
        </button>
      </div>
    </div>
  );
}
