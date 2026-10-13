// ===== NAB Card Space budget =====
// Shown at the top of Business Summary. A calendar + checklist of the regular deposits into the
// card account — a fixed transfer every second Thursday, and volunteer payments on the last
// working day of each month — plus a running tally of the account: those deposits, any other
// deposits or withdrawals, supplies bought, and (optionally) the card buys, sales, grading, box
// breaks and expenses the app already tracks, all from a start date.

const BUDGET_STORAGE_KEY = "cardflip_ev_budget_v1";
const BUDGET_DEFAULT_FORTNIGHT = 35.92;

// Local-date helpers (strings as YYYY-MM-DD, built from local dates so time zones never shift a day).
function isoLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function parseLocal(s) {
  const [y, m, d] = String(s).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
function addDays(s, n) {
  const d = parseLocal(s);
  d.setDate(d.getDate() + n);
  return isoLocal(d);
}
// Most recent Thursday on or before today.
function lastThursday() {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() - 4 + 7) % 7));
  return isoLocal(d);
}
// Last Monday–Friday of a month (public holidays aren't known, so adjust the date if one falls there).
function lastWorkingDay(year, monthIdx) {
  const d = new Date(year, monthIdx + 1, 0);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  return isoLocal(d);
}

function defaultBudget() {
  const anchor = lastThursday();
  return {
    fortnightAmount: BUDGET_DEFAULT_FORTNIGHT,
    anchor,
    volunteerAmount: "",
    startDate: anchor,
    openingBalance: 0,
    includeApp: true,
    checks: {},
    entries: [],
    income: [],
  };
}

// Every scheduled deposit from the start date up to `until` (inclusive).
function scheduledDeposits(b, until) {
  const out = [];
  if (b.anchor) {
    // Step back from the anchor to the first fortnight on/after the start date, then forward.
    let d = b.anchor;
    while (d > b.startDate) d = addDays(d, -14);
    while (d < b.startDate) d = addDays(d, 14);
    for (; d <= until; d = addDays(d, 14)) out.push({ key: `fortnight-${d}`, date: d, kind: "fortnight", label: "Fortnightly transfer", expected: Number(b.fortnightAmount) || 0 });
  }
  const s = parseLocal(b.startDate);
  const u = parseLocal(until);
  for (let y = s.getFullYear(), m = s.getMonth(); y < u.getFullYear() || (y === u.getFullYear() && m <= u.getMonth()); m === 11 ? (y++, (m = 0)) : m++) {
    const d = lastWorkingDay(y, m);
    if (d >= b.startDate && d <= until) out.push({ key: `volunteer-${y}-${String(m + 1).padStart(2, "0")}`, date: d, kind: "volunteer", label: "Volunteer payment", expected: Number(b.volunteerAmount) || null });
  }
  return out.sort((a, c) => a.date.localeCompare(c.date));
}

// Income you log yourself; card flipping and box breaks are worked out from the app.
const INCOME_STREAMS = ["YouTube", "TikTok", "Sponsorship", "Whatnot", "Other"];
const AUTO_STREAMS = ["Card flipping", "Box breaks"];
const INCOME_MONTHS = 6;

const BUDGET_ENTRY_TYPES = {
  deposit: { label: "Deposit", sign: 1 },
  withdrawal: { label: "Withdrawal", sign: -1 },
  supplies: { label: "Supplies / expense", sign: -1 },
};

function BudgetCalendar({ cards, pokemonCards, boxBreaks, manualExpenses, setManualExpenses }) {
  const [b, setB] = useState(null);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [showSettings, setShowSettings] = useState(false);
  const [form, setForm] = useState({ date: isoLocal(new Date()), type: "deposit", description: "", amount: "" });
  const [amounts, setAmounts] = useState({});
  const [showAllTally, setShowAllTally] = useState(false);

  useEffect(() => {
    let alive = true;
    storageGet(BUDGET_STORAGE_KEY).then((data) => {
      if (!alive) return;
      const fresh = !data;
      setB({ ...defaultBudget(), ...(data || {}) });
      if (fresh) setShowSettings(true);
    });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (b) storageSet(BUDGET_STORAGE_KEY, b);
  }, [b]);

  const today = isoLocal(new Date());

  // Card activity as cash in/out of the account, from the start date.
  const appRows = useMemo(() => {
    if (!b || !b.includeApp) return [];
    const all = [...cards.map((c) => computeCard(c)), ...pokemonCards.map((c) => computePokemonCard(c))];
    const rows = [];
    for (const c of all) {
      const qty = Number(c.quantity) || 1;
      const name = `${c.player || "Card"} ${c.card || ""}`.trim();
      const buy = ((Number(c.paid) || 0) + (Number(c.shipping) || 0)) * qty;
      if (c.datePurchased && c.datePurchased >= b.startDate && buy > 0) rows.push({ date: c.datePurchased, item: `Bought: ${name}`, amount: -buy, source: "app" });
      if (c.gradingSentDate && c.gradingSentDate >= b.startDate && Number(c.gradingCostPaid) > 0) rows.push({ date: c.gradingSentDate, item: `Grading: ${name}`, amount: -Number(c.gradingCostPaid) * qty, source: "app" });
      if (c.status === "Sold" && c.dateSold && c.dateSold >= b.startDate && c.netSale != null) rows.push({ date: c.dateSold, item: `Sold: ${name}`, amount: c.netSale * qty, source: "app", profit: (c.realisedProfit || 0) * qty });
    }
    for (const box of boxBreaks) {
      if (box.date && box.date >= b.startDate) {
        const t = boxTotals(box);
        rows.push({ date: box.date, item: `Box break: ${box.name || "box"}`, amount: t.profit, source: "app" });
      }
    }
    for (const ex of manualExpenses) {
      if (ex.date && ex.date >= b.startDate) rows.push({ date: ex.date, item: ex.description || "Expense", amount: -(Number(ex.amount) || 0), source: "expense", expenseId: ex.id });
    }
    return rows;
  }, [b && b.includeApp, b && b.startDate, cards, pokemonCards, boxBreaks, manualExpenses]);

  if (!b) return null;
  const update = (patch) => setB((p) => ({ ...p, ...patch }));

  // ----- Schedule + checklist -----
  const monthEnd = isoLocal(new Date(month.y, month.m + 1, 0));
  const monthStart = isoLocal(new Date(month.y, month.m, 1));
  const schedule = scheduledDeposits(b, monthEnd > today ? monthEnd : today);
  const inMonth = schedule.filter((s) => s.date >= monthStart && s.date <= monthEnd);
  const overdue = schedule.filter((s) => s.date < monthStart && s.date <= today && !b.checks[s.key]);
  const scheduleByDate = {};
  for (const s of schedule) (scheduleByDate[s.date] = scheduleByDate[s.date] || []).push(s);

  function tick(s) {
    const amt = amounts[s.key] !== undefined ? Number(amounts[s.key]) : s.expected;
    if (!(amt > 0)) return;
    update({ checks: { ...b.checks, [s.key]: { amount: amt, doneAt: today } } });
    if (s.kind === "volunteer" && !b.volunteerAmount) update({ volunteerAmount: amt });
  }
  function untick(s) {
    const next = { ...b.checks };
    delete next[s.key];
    update({ checks: next });
  }

  // ----- Running tally -----
  const tally = [
    ...schedule.filter((s) => b.checks[s.key]).map((s) => ({ date: s.date, item: s.label, amount: Number(b.checks[s.key].amount) || 0, source: "schedule" })),
    ...b.entries.filter((e) => e.date >= b.startDate).map((e) => ({ date: e.date, item: `${BUDGET_ENTRY_TYPES[e.type].label}${e.description ? `: ${e.description}` : ""}`, amount: BUDGET_ENTRY_TYPES[e.type].sign * (Number(e.amount) || 0), source: "entry", entryId: e.id })),
    ...(b.income || []).filter((e) => e.toCardSpace && e.date >= b.startDate).map((e) => ({ date: e.date, item: `${e.stream} income${e.description ? `: ${e.description}` : ""}`, amount: Number(e.amount) || 0, source: "income", incomeId: e.id })),
    ...appRows,
  ].sort((a, c) => a.date.localeCompare(c.date) || c.amount - a.amount);
  let running = Number(b.openingBalance) || 0;
  const withBalance = tally.map((r) => ({ ...r, balance: (running += r.amount) }));
  const balance = running;
  const sum = (f) => tally.filter(f).reduce((s, r) => s + r.amount, 0);
  const deposited = sum((r) => r.source === "schedule" || (r.source === "entry" && r.amount > 0));
  const withdrawn = -sum((r) => r.source === "entry" && r.item.startsWith("Withdrawal"));
  const cardProfit = appRows.filter((r) => r.profit != null).reduce((s, r) => s + r.profit, 0);
  const expenses = -sum((r) => r.source === "expense");
  const cardCash = sum((r) => r.source === "app");

  function addEntry(e) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!(amount > 0)) return;
    if (form.type === "supplies") {
      // Supplies go into Business Summary's expenses too, so they count for tax.
      setManualExpenses((prev) => [{ id: crypto.randomUUID(), date: form.date, description: form.description || "Supplies", amount, category: "Supplies" }, ...prev]);
    } else {
      update({ entries: [...b.entries, { id: crypto.randomUUID(), date: form.date, type: form.type, description: form.description, amount }] });
    }
    setForm({ ...form, description: "", amount: "" });
  }
  function removeRow(r) {
    if (r.source === "income") update({ income: b.income.map((x) => (x.id === r.incomeId ? { ...x, toCardSpace: false } : x)) });
    if (r.source === "entry") update({ entries: b.entries.filter((x) => x.id !== r.entryId) });
    if (r.source === "expense") setManualExpenses((prev) => prev.filter((x) => x.id !== r.expenseId));
  }

  const box = { border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22", marginBottom: 14 };
  const small = { fontSize: 11, padding: "3px 9px" };
  const monthName = new Date(month.y, month.m, 1).toLocaleDateString("en-AU", { month: "long", year: "numeric" });
  const shiftMonth = (n) => setMonth(({ y, m }) => ({ y: m + n < 0 ? y - 1 : m + n > 11 ? y + 1 : y, m: (m + n + 12) % 12 }));

  // Calendar grid, Monday first.
  const firstDow = (new Date(month.y, month.m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(month.y, month.m + 1, 0).getDate();
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => isoLocal(new Date(month.y, month.m, i + 1)))];
  const dotColor = (s) => (b.checks[s.key] ? "#4E8B6B" : s.date < today ? "#B4472E" : "#C9A227");

  const rowsShown = showAllTally ? [...withBalance].reverse() : [...withBalance].reverse().slice(0, 12);

  return (
    <div style={{ marginBottom: 28 }}>
      <SectionTitle>💳 NAB Card Space — budget</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 1, background: "#2C303B", border: "1px solid #2C303B", borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
        <Stat label="Balance now" value={fmtMoney(balance)} color={balance >= 0 ? "#4E8B6B" : "#B4472E"} />
        <Stat label="Deposited" value={fmtMoney(deposited)} />
        <Stat label="Withdrawn" value={fmtMoney(withdrawn)} />
        {b.includeApp && <Stat label="Card profit" value={`${cardProfit >= 0 ? "+" : ""}${fmtMoney(cardProfit)}`} color={cardProfit >= 0 ? "#4E8B6B" : "#B4472E"} />}
        <Stat label="Supplies & expenses" value={fmtMoney(expenses)} />
      </div>

      {/* ----- Settings ----- */}
      <div style={{ ...box, padding: "10px 16px" }}>
        <button type="button" className="btnSecondary" style={small} onClick={() => setShowSettings((v) => !v)}>
          ⚙️ Budget settings {showSettings ? "▲" : "▼"}
        </button>
        <span style={{ fontSize: 11.5, color: "#6B7180", marginLeft: 10 }}>
          {fmtMoney(Number(b.fortnightAmount) || 0)} every second Thursday from {b.anchor} · volunteer payment on the last working day · tally from {b.startDate}
        </span>
        {showSettings && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              <Field label="Fortnightly transfer (A$)">
                <input type="number" step="0.01" min="0" value={b.fortnightAmount} onChange={(e) => update({ fortnightAmount: e.target.value })} style={{ width: 110 }} />
              </Field>
              <Field label="A transfer Thursday">
                <input type="date" value={b.anchor} onChange={(e) => update({ anchor: e.target.value })} />
              </Field>
              <Field label="Usual volunteer payment (A$)">
                <input type="number" step="0.01" min="0" value={b.volunteerAmount} placeholder="varies" onChange={(e) => update({ volunteerAmount: e.target.value })} style={{ width: 110 }} />
              </Field>
              <Field label="Tally starts">
                <input type="date" value={b.startDate} onChange={(e) => update({ startDate: e.target.value || today })} />
              </Field>
              <Field label="Balance on that day (A$)">
                <input type="number" step="0.01" value={b.openingBalance} onChange={(e) => update({ openingBalance: e.target.value })} style={{ width: 110 }} />
              </Field>
            </div>
            {b.anchor && parseLocal(b.anchor).getDay() !== 4 && <div style={{ fontSize: 11.5, color: "#C9A227", marginTop: 6 }}>⚠️ {b.anchor} isn't a Thursday — pick a Thursday you actually transfer on.</div>}
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#C6CAD4", marginTop: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={b.includeApp} onChange={(e) => update({ includeApp: e.target.checked })} style={{ width: "auto", margin: 0 }} />
              Include card buys, sales (after fees), grading, box breaks and expenses from the app in the tally
            </label>
            <div style={{ fontSize: 11, color: "#6B7180", marginTop: 6, lineHeight: 1.6 }}>
              Pick any Thursday you transfer on — the fortnights count forward and back from it. Turn the app activity off if you pay for cards from a different account. Only activity on or after the start date counts.
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        {/* ----- Calendar + checklist ----- */}
        <div style={box}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <button type="button" className="btnSecondary" style={small} onClick={() => shiftMonth(-1)}>‹</button>
            <div className="oswald" style={{ fontSize: 15, fontWeight: 600 }}>{monthName}</div>
            <button type="button" className="btnSecondary" style={small} onClick={() => shiftMonth(1)}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, fontSize: 11, textAlign: "center" }}>
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} style={{ color: "#6B7180", padding: "2px 0" }}>{d}</div>
            ))}
            {cells.map((d, i) => {
              const items = d ? scheduleByDate[d] || [] : [];
              return (
                <div
                  key={i}
                  title={items.map((s) => s.label).join(", ")}
                  style={{
                    minHeight: 30,
                    borderRadius: 5,
                    padding: "3px 0",
                    background: d === today ? "#2C303B" : items.length ? "#14161C" : "transparent",
                    border: items.length ? `1px solid ${dotColor(items[0])}66` : "1px solid transparent",
                    color: d ? "#C6CAD4" : "transparent",
                  }}
                >
                  {d ? Number(d.slice(8)) : ""}
                  <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 1 }}>
                    {items.map((s) => (
                      <span key={s.key} style={{ width: 5, height: 5, borderRadius: 999, background: dotColor(s) }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 10.5, color: "#6B7180", margin: "6px 0 10px" }}>
            <span style={{ color: "#4E8B6B" }}>●</span> done · <span style={{ color: "#C9A227" }}>●</span> coming up · <span style={{ color: "#B4472E" }}>●</span> missed
          </div>

          {[...overdue, ...inMonth].length === 0 ? (
            <div style={{ fontSize: 12, color: "#5C6270" }}>Nothing scheduled this month{b.startDate > monthEnd ? " — it's before your tally starts" : ""}.</div>
          ) : (
            [...overdue, ...inMonth].map((s) => {
              const done = b.checks[s.key];
              const late = !done && s.date < today;
              return (
                <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderTop: "1px solid #24272F", fontSize: 12.5, flexWrap: "wrap" }}>
                  <input type="checkbox" checked={Boolean(done)} onChange={() => (done ? untick(s) : tick(s))} disabled={!done && !((amounts[s.key] !== undefined ? Number(amounts[s.key]) : s.expected) > 0)} style={{ width: "auto", margin: 0 }} />
                  <span className="mono" style={{ color: late ? "#B4472E" : "#6B7180", minWidth: 78 }}>{parseLocal(s.date).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}</span>
                  <span style={{ flex: 1, color: done ? "#6B7180" : "#EDEAE1", textDecoration: done ? "line-through" : "none" }}>{s.label}</span>
                  {done ? (
                    <span style={{ color: "#4E8B6B", fontWeight: 600 }}>{fmtMoney(done.amount)}</span>
                  ) : (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={s.kind === "volunteer" ? "Amount" : ""}
                      value={amounts[s.key] !== undefined ? amounts[s.key] : s.expected ?? ""}
                      onChange={(e) => setAmounts({ ...amounts, [s.key]: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && tick(s)}
                      style={{ width: 80, fontSize: 12, padding: "2px 6px" }}
                    />
                  )}
                </div>
              );
            })
          )}
          <div style={{ fontSize: 10.5, color: "#6B7180", marginTop: 6 }}>Tick each one once it's in the account; type the amount first if it was different. The last working day ignores public holidays.</div>
        </div>

        {/* ----- Add an entry ----- */}
        <div style={box}>
          <div className="oswald" style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Record money in or out</div>
          <form onSubmit={addEntry} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Field label="Type">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ width: "auto" }}>
                  {Object.entries(BUDGET_ENTRY_TYPES).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
                </select>
              </Field>
              <Field label="Date"><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
              <Field label="Amount (A$)"><input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={{ width: 100 }} required /></Field>
            </div>
            <Field label="What for">
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={form.type === "supplies" ? "e.g. Toploaders, team bags, mailers" : form.type === "withdrawal" ? "e.g. Paid myself" : "e.g. Birthday money"} />
            </Field>
            <button className="btnPrimary" type="submit" style={{ alignSelf: "flex-start", fontSize: 12.5 }}>Add</button>
          </form>
          <div style={{ fontSize: 11, color: "#6B7180", marginTop: 8, lineHeight: 1.6 }}>
            Supplies and expenses are also saved to your Business Summary expenses below, so they count for tax. Card buys and sales come in automatically{b.includeApp ? "" : " when that's turned on in settings"} — no need to add them here.
          </div>
        </div>
      </div>

      {/* ----- Running tally ----- */}
      <div style={box}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div className="oswald" style={{ fontSize: 15, fontWeight: 600 }}>Running tally</div>
          <span style={{ fontSize: 11.5, color: "#6B7180" }}>Started {b.startDate} with {fmtMoney(Number(b.openingBalance) || 0)}{b.includeApp ? ` · card activity ${cardCash >= 0 ? "+" : ""}${fmtMoney(cardCash)}` : ""}</span>
        </div>
        {withBalance.length === 0 ? (
          <div style={{ fontSize: 12, color: "#5C6270" }}>Nothing recorded yet — tick a transfer or add an entry.</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "84px 1fr 90px 90px 18px", fontSize: 10.5, color: "#6B7180", textTransform: "uppercase", padding: "4px 0" }}>
              <div>Date</div>
              <div>Item</div>
              <div style={{ textAlign: "right" }}>Amount</div>
              <div style={{ textAlign: "right" }}>Balance</div>
              <div />
            </div>
            {rowsShown.map((r, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "84px 1fr 90px 90px 18px", fontSize: 12.5, padding: "4px 0", borderTop: "1px solid #24272F", alignItems: "center" }}>
                <div className="mono" style={{ color: "#6B7180", fontSize: 11.5 }}>{r.date}</div>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.item}</div>
                <div style={{ textAlign: "right", color: r.amount >= 0 ? "#4E8B6B" : "#B4472E" }}>{r.amount >= 0 ? "+" : ""}{fmtMoney(r.amount)}</div>
                <div style={{ textAlign: "right", fontWeight: 600 }}>{fmtMoney(r.balance)}</div>
                <div style={{ textAlign: "right" }}>
                  {(r.source === "entry" || r.source === "expense" || r.source === "income") && (
                    <button type="button" onClick={() => removeRow(r)} title="Delete" style={{ background: "none", border: "none", color: "#6B7180", cursor: "pointer", padding: 0 }}>×</button>
                  )}
                </div>
              </div>
            ))}
            {withBalance.length > 12 && (
              <button type="button" className="btnSecondary" style={{ ...small, marginTop: 8 }} onClick={() => setShowAllTally((v) => !v)}>
                {showAllTally ? "Show recent only" : `Show all ${withBalance.length}`}
              </button>
            )}
          </>
        )}
      </div>

      <IncomeStreams b={b} update={update} cards={cards} pokemonCards={pokemonCards} boxBreaks={boxBreaks} />
    </div>
  );
}

// ===== Income streams =====
// What each side of the business earns per month: card flipping (realised profit on cards sold)
// and box breaks come from the app; YouTube, TikTok, sponsorships, Whatnot and anything else are
// logged here. Logged income can also count as money into the Card Space tally.
function IncomeStreams({ b, update, cards, pokemonCards, boxBreaks }) {
  const [form, setForm] = useState({ date: isoLocal(new Date()), stream: "YouTube", description: "", amount: "", toCardSpace: true });

  const rows = useMemo(() => {
    const out = [];
    for (const c of [...cards.map((x) => computeCard(x)), ...pokemonCards.map((x) => computePokemonCard(x))]) {
      if (c.status === "Sold" && c.dateSold && c.realisedProfit != null) out.push({ date: c.dateSold, stream: "Card flipping", amount: c.realisedProfit * (Number(c.quantity) || 1) });
    }
    for (const box of boxBreaks) if (box.date) out.push({ date: box.date, stream: "Box breaks", amount: boxTotals(box).profit });
    for (const e of b.income || []) out.push({ date: e.date, stream: e.stream, amount: Number(e.amount) || 0 });
    return out;
  }, [cards, pokemonCards, boxBreaks, b.income]);

  // The last few months, newest first, plus a 12-month total per stream.
  const now = new Date();
  const months = Array.from({ length: INCOME_MONTHS }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { key: isoLocal(d).slice(0, 7), label: d.toLocaleDateString("en-AU", { month: "short", year: "2-digit" }) };
  });
  const yearStart = isoLocal(new Date(now.getFullYear(), now.getMonth() - 11, 1));
  const byMonth = (key, stream) => rows.filter((r) => r.date.slice(0, 7) === key && r.stream === stream).reduce((s, r) => s + r.amount, 0);
  const streams = [...AUTO_STREAMS, ...INCOME_STREAMS].filter((s) => rows.some((r) => r.stream === s) || AUTO_STREAMS.includes(s));
  const yearByStream = streams.map((s) => ({ s, total: rows.filter((r) => r.stream === s && r.date >= yearStart).reduce((t, r) => t + r.amount, 0) }));
  const yearTotal = yearByStream.reduce((t, x) => t + x.total, 0);
  const thisMonth = streams.reduce((t, s) => t + byMonth(months[0].key, s), 0);
  const best = [...yearByStream].sort((a, c) => c.total - a.total)[0];
  const nonCard = yearByStream.filter((x) => x.s !== "Card flipping").reduce((t, x) => t + x.total, 0);

  function addIncome(e) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!(amount > 0)) return;
    update({ income: [...(b.income || []), { id: crypto.randomUUID(), date: form.date, stream: form.stream, description: form.description, amount, toCardSpace: form.toCardSpace }] });
    setForm({ ...form, description: "", amount: "" });
  }
  const logged = [...(b.income || [])].sort((a, c) => c.date.localeCompare(a.date));
  const money = (v) => (v ? `${v < 0 ? "-" : ""}${fmtMoney(Math.abs(v))}` : "—");
  const box = { border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22", marginBottom: 14 };
  const cell = { padding: "5px 8px", textAlign: "right", whiteSpace: "nowrap" };

  return (
    <div style={box}>
      <div className="oswald" style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>💵 Income streams</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 12 }}>
        <MiniStat label="This month" value={fmtMoney(thisMonth)} color={thisMonth >= 0 ? "#4E8B6B" : "#B4472E"} />
        <MiniStat label="Last 12 months" value={fmtMoney(yearTotal)} color={yearTotal >= 0 ? "#4E8B6B" : "#B4472E"} />
        <MiniStat label="Outside card flipping" value={fmtMoney(nonCard)} />
        <MiniStat label="Biggest stream" value={best && best.total > 0 ? best.s : "—"} />
      </div>

      <div style={{ overflowX: "auto", marginBottom: 12 }}>
        <table style={{ width: "100%", fontSize: 12.5, borderCollapse: "collapse", color: "#C6CAD4" }}>
          <thead>
            <tr style={{ color: "#6B7180", fontSize: 10.5, textTransform: "uppercase" }}>
              <th style={{ ...cell, textAlign: "left" }}>Stream</th>
              {months.map((m) => <th key={m.key} style={cell}>{m.label}</th>)}
              <th style={cell}>12 mo</th>
            </tr>
          </thead>
          <tbody>
            {streams.map((s) => (
              <tr key={s} style={{ borderTop: "1px solid #24272F" }}>
                <td style={{ ...cell, textAlign: "left", fontWeight: 600 }}>{s}{AUTO_STREAMS.includes(s) && <span style={{ fontSize: 10, color: "#6B7180", fontWeight: 400 }}> · auto</span>}</td>
                {months.map((m) => {
                  const v = byMonth(m.key, s);
                  return <td key={m.key} style={{ ...cell, color: v > 0 ? "#4E8B6B" : v < 0 ? "#B4472E" : "#5C6270" }}>{money(v)}</td>;
                })}
                <td style={{ ...cell, fontWeight: 700 }}>{money(yearByStream.find((x) => x.s === s).total)}</td>
              </tr>
            ))}
            <tr style={{ borderTop: "1px solid #2C303B", fontWeight: 700 }}>
              <td style={{ ...cell, textAlign: "left" }}>Total</td>
              {months.map((m) => {
                const v = streams.reduce((t, s) => t + byMonth(m.key, s), 0);
                return <td key={m.key} style={{ ...cell, color: v >= 0 ? "#EDEAE1" : "#B4472E" }}>{money(v)}</td>;
              })}
              <td style={cell}>{money(yearTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <form onSubmit={addIncome} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Field label="Stream">
          <select value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })} style={{ width: "auto" }}>
            {INCOME_STREAMS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Date"><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
        <Field label="Amount (A$)"><input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={{ width: 100 }} required /></Field>
        <Field label="Note"><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. AdSense payout" style={{ minWidth: 150 }} /></Field>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#C6CAD4", paddingBottom: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={form.toCardSpace} onChange={(e) => setForm({ ...form, toCardSpace: e.target.checked })} style={{ width: "auto", margin: 0 }} />
          Paid into Card Space
        </label>
        <button className="btnPrimary" type="submit" style={{ fontSize: 12.5 }}>Add income</button>
      </form>

      {logged.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {logged.slice(0, 8).map((e) => (
            <div key={e.id} style={{ display: "flex", gap: 8, fontSize: 12.5, padding: "4px 0", borderTop: "1px solid #24272F", alignItems: "center" }}>
              <span className="mono" style={{ color: "#6B7180", fontSize: 11.5, minWidth: 80 }}>{e.date}</span>
              <span style={{ fontWeight: 600 }}>{e.stream}</span>
              <span style={{ color: "#6B7180", flex: 1 }}>{e.description}{e.toCardSpace ? " · in Card Space" : ""}</span>
              <span style={{ color: "#4E8B6B" }}>{fmtMoney(Number(e.amount))}</span>
              <button type="button" onClick={() => update({ income: b.income.filter((x) => x.id !== e.id) })} title="Delete" style={{ background: "none", border: "none", color: "#6B7180", cursor: "pointer", padding: 0 }}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ fontSize: 11, color: "#6B7180", marginTop: 8, lineHeight: 1.6 }}>
        Card flipping is realised profit on cards sold that month (after costs and fees); box breaks are each break's profit. Keep records of all of it — if this grows into a real second income, the ATO may treat it as a business rather than a hobby, so it's worth a chat with an accountant at that point.
      </div>
    </div>
  );
}
