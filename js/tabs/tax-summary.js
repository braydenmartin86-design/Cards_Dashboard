// ===== Business & Tax Summary =====
function currentFYLabel(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  return m >= 7 ? `${y}-${String(y + 1).slice(2)}` : `${y - 1}-${String(y).slice(2)}`;
}

function fyBounds(fyLabel) {
  const startYear = Number(fyLabel.split("-")[0]);
  return { start: `${startYear}-07-01`, end: `${startYear + 1}-06-30` };
}

function fyOptions() {
  return [currentFYLabel()];
}

function inRange(dateStr, start, end) {
  if (!dateStr) return false;
  return dateStr >= start && dateStr <= end;
}

function BusinessSummary({ cards, pokemonCards, boxBreaks, manualExpenses, setManualExpenses }) {
  const [period, setPeriod] = useState(currentFYLabel());
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ date: new Date().toISOString().slice(0, 10), description: "", amount: "" });

  const { start, end } = useMemo(() => {
    if (period === "all") return { start: "0000-01-01", end: "9999-12-31" };
    if (period === "custom") return { start: customStart || "0000-01-01", end: customEnd || "9999-12-31" };
    return fyBounds(period);
  }, [period, customStart, customEnd]);

  const ledger = useMemo(() => {
    const allCards = [...cards.map((c) => computeCard(c)), ...pokemonCards.map((c) => computePokemonCard(c))];

    const cardRows = allCards
      .filter((c) => c.status === "Sold" && inRange(c.dateSold, start, end))
      .map((c) => {
        const qty = Number(c.quantity) || 1;
        return {
          date: c.dateSold,
          type: "Card sale",
          description: `${c.player} ${c.card}`.trim(),
          revenue: (c.actualSellPrice || 0) * qty,
          cost: c.totalCost * qty,
          fees: c.actualSellPrice != null && c.netSale != null ? (c.actualSellPrice - c.netSale) * qty : 0,
          profit: (c.realisedProfit || 0) * qty,
        };
      });

    // Purchase and grading spend only logged here for cards NOT YET sold — once a card sells,
    // its full cost (acquisition + any grading fee, since both roll into totalCost) is already
    // captured in the Card sale row above. Logging it again here would double-count the spend.
    const purchaseRows = allCards
      .filter((c) => c.status !== "Sold" && c.datePurchased && inRange(c.datePurchased, start, end))
      .map((c) => {
        const qty = Number(c.quantity) || 1;
        const acquisitionCost = (Number(c.paid) || 0) + (Number(c.shipping) || 0) + (c.holdingCost || 0);
        return {
          date: c.datePurchased,
          type: "Card purchase",
          description: `${c.player} ${c.card}`.trim(),
          revenue: 0,
          cost: acquisitionCost * qty,
          fees: 0,
          profit: -acquisitionCost * qty,
        };
      });

    const gradingRows = allCards
      .filter((c) => c.status !== "Sold" && c.gradingSentDate && Number(c.gradingCostPaid) > 0 && inRange(c.gradingSentDate, start, end))
      .map((c) => {
        const qty = Number(c.quantity) || 1;
        return {
          date: c.gradingSentDate,
          type: "Grading sent",
          description: `${c.player} ${c.card}`.trim(),
          revenue: 0,
          cost: Number(c.gradingCostPaid) * qty,
          fees: 0,
          profit: -Number(c.gradingCostPaid) * qty,
        };
      });

    const boxRows = boxBreaks
      .filter((b) => inRange(b.date, start, end))
      .map((b) => {
        const t = boxTotals(b);
        return {
          date: b.date,
          type: "Box break",
          description: b.name || "Unnamed box",
          revenue: t.revenue,
          cost: t.cost,
          fees: 0,
          profit: t.profit,
        };
      });

    const expenseRows = manualExpenses
      .filter((ex) => inRange(ex.date, start, end))
      .map((ex) => ({
        date: ex.date,
        type: "Manual expense",
        description: ex.description || "Expense",
        revenue: 0,
        cost: Number(ex.amount) || 0,
        fees: 0,
        profit: -(Number(ex.amount) || 0),
      }));

    return [...cardRows, ...purchaseRows, ...gradingRows, ...boxRows, ...expenseRows].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  }, [cards, pokemonCards, boxBreaks, manualExpenses, start, end]);

  const totals = useMemo(() => {
    const revenue = ledger.reduce((s, r) => s + r.revenue, 0);
    const cost = ledger.reduce((s, r) => s + r.cost, 0);
    const fees = ledger.reduce((s, r) => s + r.fees, 0);
    const profit = ledger.reduce((s, r) => s + r.profit, 0);
    return { revenue, cost, fees, profit };
  }, [ledger]);

  function addExpense(e) {
    e.preventDefault();
    if (!expenseForm.amount) return;
    setManualExpenses((prev) => [{ id: crypto.randomUUID(), ...expenseForm, amount: Number(expenseForm.amount) }, ...prev]);
    setExpenseForm({ date: new Date().toISOString().slice(0, 10), description: "", amount: "" });
    setShowAddExpense(false);
  }
  function removeExpense(id) {
    setManualExpenses((prev) => prev.filter((ex) => ex.id !== id));
  }

  function exportCSV() {
    const header = "Date,Type,Description,Revenue,Cost,Fees,Profit";
    const rows = ledger.map((r) =>
      [r.date, r.type, `"${r.description.replace(/"/g, '""')}"`, r.revenue.toFixed(2), r.cost.toFixed(2), r.fees.toFixed(2), r.profit.toFixed(2)].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cardflip-ev-ledger-${period}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontSize: 13, color: "#8B90A0", marginBottom: 16, lineHeight: 1.6 }}>
        A rollup of spend and realised profit — card purchases, sales, grading costs, box breaks, and anything you log manually — for a given period. Useful for your own records or handing to an accountant.
        <span style={{ color: "#C9A227" }}> This isn't tax advice</span> — it's a summary of what's tracked in the app, not a substitute for proper bookkeeping.
        Marking a card Won in Buy Evaluator or adding one yourself logs its purchase cost automatically; sending it to grading logs that cost too. Once a card is actually Sold, its full cost is folded into that sale's line instead of counted twice.
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", marginBottom: 4 }}>Period</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ width: "auto", minWidth: 160 }}>
              {fyOptions().map((fy) => (
                <option key={fy} value={fy}>FY {fy}{fy === currentFYLabel() ? " (current)" : ""}</option>
              ))}
              <option value="all">All time</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
          {period === "custom" && (
            <>
              <Field label="From"><input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} /></Field>
              <Field label="To"><input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} /></Field>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btnSecondary" onClick={() => setShowAddExpense((v) => !v)}>
            <Plus size={14} style={{ marginRight: 6 }} /> Add expense
          </button>
          <button className="btnSecondary" onClick={exportCSV} disabled={ledger.length === 0} style={{ opacity: ledger.length === 0 ? 0.5 : 1 }}>
            <span style={{ marginRight: 6 }}>⬇️</span> Export CSV
          </button>
        </div>
      </div>

      {showAddExpense && (
        <form onSubmit={addExpense} style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 20, border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22", flexWrap: "wrap" }}>
          <Field label="Date"><input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} /></Field>
          <Field label="Description"><input value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="e.g. ShipMyCards shipment home, grading fee" style={{ minWidth: 220 }} /></Field>
          <Field label="Amount"><input type="number" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} required /></Field>
          <button className="btnPrimary" type="submit">Add</button>
        </form>
      )}

      {manualExpenses.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionTitle>Manual expenses on record ({manualExpenses.length})</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {manualExpenses.map((ex) => (
              <div key={ex.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #2C303B", borderRadius: 8, padding: "8px 12px", fontSize: 12.5 }}>
                <div><span className="mono" style={{ color: "#6B7180", marginRight: 10 }}>{ex.date}</span>{ex.description || "Expense"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#B4472E", fontWeight: 600 }}>{fmtMoney(Number(ex.amount))}</span>
                  <X size={13} style={{ cursor: "pointer", color: "#6B7180" }} onClick={() => removeExpense(ex.id)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1, background: "#2C303B", border: "1px solid #2C303B", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
        <Stat label="Revenue" value={fmtMoney(totals.revenue)} />
        <Stat label="Cost basis" value={fmtMoney(totals.cost)} />
        <Stat label="Fees paid" value={fmtMoney(totals.fees)} />
        <Stat label="Net profit" value={`${totals.profit >= 0 ? "+" : ""}${fmtMoney(totals.profit)}`} color={totals.profit >= 0 ? "#4E8B6B" : "#B4472E"} />
      </div>

      <SectionTitle>Transaction ledger ({ledger.length})</SectionTitle>
      {ledger.length === 0 ? (
        <div style={{ padding: "3rem 0", textAlign: "center", color: "#5C6270", border: "1px solid #2C303B", borderRadius: 10 }}>
          No spend or income recorded in this period.
        </div>
      ) : (
        <div style={{ border: "1px solid #2C303B", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "90px 90px 1.6fr 90px 90px 90px", padding: "10px 14px", background: "#1D2028", fontSize: 11, color: "#8B90A0", textTransform: "uppercase" }}>
            <div>Date</div>
            <div>Type</div>
            <div>Description</div>
            <div>Revenue</div>
            <div>Cost</div>
            <div>Profit</div>
          </div>
          {ledger.map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 90px 1.6fr 90px 90px 90px", padding: "8px 14px", borderTop: "1px solid #24272F", fontSize: 12.5, alignItems: "center" }}>
              <div className="mono" style={{ color: "#6B7180" }}>{r.date}</div>
              <div style={{ color: "#8B90A0" }}>{r.type}</div>
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.description}</div>
              <div>{fmtMoney(r.revenue)}</div>
              <div style={{ color: "#8B90A0" }}>{fmtMoney(r.cost)}</div>
              <div style={{ color: r.profit >= 0 ? "#4E8B6B" : "#B4472E", fontWeight: 600 }}>{r.profit >= 0 ? "+" : ""}{fmtMoney(r.profit)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
