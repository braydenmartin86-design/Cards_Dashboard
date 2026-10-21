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
    subscriptions: [],
  };
}

// Added for budgets saved before subscriptions existed.
const STARTER_SUBSCRIPTIONS = [{ id: "market-movers", name: "Market Movers", amount: 11, day: 28, startDate: "2026-10-15", endDate: "" }];

// A monthly bill's date in a month — day 29–31 falls back to the month's last day.
function billDate(year, monthIdx, day) {
  const last = new Date(year, monthIdx + 1, 0).getDate();
  return isoLocal(new Date(year, monthIdx, Math.min(Number(day) || 1, last)));
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
    for (const sub of b.subscriptions || []) {
      const bd = billDate(y, m, sub.day);
      if (bd >= b.startDate && bd >= (sub.startDate || "") && (!sub.endDate || bd <= sub.endDate) && bd <= until) {
        out.push({ key: `sub-${sub.id}-${y}-${String(m + 1).padStart(2, "0")}`, date: bd, kind: "subscription", label: `${sub.name} subscription`, expected: Number(sub.amount) || null, out: true });
      }
    }
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

function BudgetCalendar({ cards, pokemonCards, boxBreaks, manualExpenses, setManualExpenses, targets = [], buyList = [] }) {
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
      setB({ ...defaultBudget(), ...(data || {}), subscriptions: data && data.subscriptions ? data.subscriptions : STARTER_SUBSCRIPTIONS });
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
      // Ticked subscriptions are already in the tally from the schedule.
      if (ex.subKey) continue;
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
    // Subscriptions also go into Business Summary's expenses, so they count for tax.
    if (s.kind === "subscription") setManualExpenses((prev) => [{ id: s.key, subKey: s.key, date: s.date, description: s.label, amount: amt, category: "Subscriptions" }, ...prev.filter((x) => x.id !== s.key)]);
  }
  function untick(s) {
    const next = { ...b.checks };
    delete next[s.key];
    update({ checks: next });
    if (s.kind === "subscription") setManualExpenses((prev) => prev.filter((x) => x.id !== s.key));
  }
  function updateSub(id, patch) {
    update({ subscriptions: b.subscriptions.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  }

  // ----- Running tally -----
  const tally = [
    ...schedule.filter((s) => b.checks[s.key]).map((s) => ({ date: s.date, item: s.label, amount: (s.out ? -1 : 1) * (Number(b.checks[s.key].amount) || 0), source: "schedule" })),
    ...b.entries.filter((e) => e.date >= b.startDate).map((e) => ({ date: e.date, item: `${BUDGET_ENTRY_TYPES[e.type].label}${e.description ? `: ${e.description}` : ""}`, amount: BUDGET_ENTRY_TYPES[e.type].sign * (Number(e.amount) || 0), source: "entry", entryId: e.id })),
    ...(b.income || []).filter((e) => e.toCardSpace && e.date >= b.startDate).map((e) => ({ date: e.date, item: `${e.stream} income${e.description ? `: ${e.description}` : ""}`, amount: Number(e.amount) || 0, source: "income", incomeId: e.id })),
    ...appRows,
  ].sort((a, c) => a.date.localeCompare(c.date) || c.amount - a.amount);
  let running = Number(b.openingBalance) || 0;
  const withBalance = tally.map((r) => ({ ...r, balance: (running += r.amount) }));
  const balance = running;
  const sum = (f) => tally.filter(f).reduce((s, r) => s + r.amount, 0);
  const deposited = sum((r) => (r.source === "schedule" || r.source === "entry") && r.amount > 0);
  const withdrawn = 0 - sum((r) => r.source === "entry" && r.item.startsWith("Withdrawal"));
  const cardProfit = appRows.filter((r) => r.profit != null).reduce((s, r) => s + r.profit, 0);
  const expenses = 0 - sum((r) => r.source === "expense" || (r.source === "schedule" && r.amount < 0));
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
          {fmtMoney(Number(b.fortnightAmount) || 0)} every second Thursday from {b.anchor} · volunteer payment on the last working day
          {(b.subscriptions || []).filter((x) => !x.endDate || x.endDate >= today).map((x) => ` · ${x.name} ${fmtMoney(Number(x.amount) || 0)} on the ${x.day}${[11, 12, 13].includes(x.day % 100) ? "th" : ({ 1: "st", 2: "nd", 3: "rd" })[x.day % 10] || "th"}`).join("")} · tally from {b.startDate}
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
            <div className="oswald" style={{ fontSize: 13.5, fontWeight: 600, margin: "14px 0 6px" }}>Monthly subscriptions</div>
            {(b.subscriptions || []).map((x) => (
              <div key={x.id} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 6 }}>
                <Field label="Name"><input value={x.name} onChange={(e) => updateSub(x.id, { name: e.target.value })} style={{ width: 140 }} /></Field>
                <Field label="Amount (A$)"><input type="number" step="0.01" min="0" value={x.amount} onChange={(e) => updateSub(x.id, { amount: e.target.value })} style={{ width: 90 }} /></Field>
                <Field label="Billed on day"><input type="number" min="1" max="31" value={x.day} onChange={(e) => updateSub(x.id, { day: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })} style={{ width: 70 }} /></Field>
                <Field label="From"><input type="date" value={x.startDate} onChange={(e) => updateSub(x.id, { startDate: e.target.value })} /></Field>
                <Field label="Cancelled on (optional)"><input type="date" value={x.endDate} onChange={(e) => updateSub(x.id, { endDate: e.target.value })} /></Field>
                <button type="button" className="btnSecondary" style={{ ...small, marginBottom: 6 }} onClick={() => update({ subscriptions: b.subscriptions.filter((y) => y.id !== x.id) })}>Remove</button>
              </div>
            ))}
            <button type="button" className="btnSecondary" style={small} onClick={() => update({ subscriptions: [...(b.subscriptions || []), { id: crypto.randomUUID(), name: "", amount: "", day: new Date().getDate(), startDate: today, endDate: "" }] })}>
              + Add subscription
            </button>
            <div style={{ fontSize: 11, color: "#6B7180", marginTop: 6, lineHeight: 1.6 }}>
              Bills show on the calendar as money out. Charged in US$? Type what your bank actually took when you tick it — it's saved to Business Summary expenses for tax. Set "Cancelled on" rather than removing, so past months stay in the tally.
            </div>
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
                    <span style={{ color: s.out ? "#B4472E" : "#4E8B6B", fontWeight: 600 }}>{s.out ? "-" : ""}{fmtMoney(done.amount)}</span>
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
          <div style={{ fontSize: 10.5, color: "#6B7180", marginTop: 6 }}>Tick each one once it's in (or out of) the account; type the amount first if it was different. The last working day ignores public holidays.</div>
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

      <MoneyPlanner balance={balance} b={b} update={update} cards={cards} pokemonCards={pokemonCards} targets={targets} buyList={buyList} />

      <IncomeStreams b={b} update={update} cards={cards} pokemonCards={pokemonCards} boxBreaks={boxBreaks} />
    </div>
  );
}

// ===== Where should my money go? =====
// Weighs the options for spare money against each other — grading the cards the maths says to
// grade, Buy Evaluator buys, bringing cheap cards home from the ShipMyCards vault, and Monthly
// Targets in their buy window — keeping a cash buffer. Graded and bought cards are ranked by
// expected profit per dollar per month (grading ties money up ~4 months, a flip ~1.5), so quick,
// cheap wins come first. Estimates only: they come from your comps.
// Ship-home default: ShipMyCards has no flat rate — it's carrier postage. Their FAQ (Oct 2026)
// estimates ePacket (Australia is eligible, cheapest for small boxes) at about US$22–31 for a 2 lb
// box, so A$40 is a fair guess for a box of cards. Replace it with SMC's real quote.
const PLANNER_DEFAULTS = { reservePct: 15, shipHomeCost: 40, override: "" };
const PLAN_KIND = {
  ship: { icon: "📦", color: "#5C7A99" },
  grade: { icon: "💎", color: "#8B6FD6" },
  buy: { icon: "🔎", color: "#4E8B6B" },
  shop: { icon: "🛒", color: "#4E8B6B" },
};
// Buying is a budget to go shopping with, not a fixed list: the Buy Evaluator aims for at least
// 20% profit on a buy, and a flip takes about 1.5 months — so grading only beats shopping when its
// return per dollar per month is better than that.
const SHOP_RETURN = 0.2;
const SHOP_MONTHS = 1.5;
const SHOP_RATE = SHOP_RETURN / SHOP_MONTHS;
const MIN_SHOP = 15;
const SHIP_MIN_CARDS = 6;
const SHIP_MAX_SHARE = 0.15; // shipping should be under ~15% of what the cards are worth

function MoneyPlanner({ balance, b, update, cards, pokemonCards, targets, buyList }) {
  const p = { ...PLANNER_DEFAULTS, ...(b.planner || {}) };
  const setP = (patch) => update({ planner: { ...p, ...patch } });
  const [showSettings, setShowSettings] = useState(false);
  const all = useMemo(() => [...cards.map((c) => computeCard(c)), ...pokemonCards.map((c) => ({ ...computePokemonCard(c), sport: "Pokémon" }))], [cards, pokemonCards]);
  const name = (c) => [c.player, c.card].filter(Boolean).join(" ") || "card";

  const available = p.override !== "" && !isNaN(Number(p.override)) ? Number(p.override) : balance;
  const reserve = Math.max(0, (available * (Number(p.reservePct) || 0)) / 100);
  const spendable = Math.max(0, available - reserve);

  // 💎 Grade: raw cards flagged Grade First, gain = expected extra profit over selling raw.
  const grades = all
    .filter((c) => c.status === "Raw" && c.sellDecision === "Grade First" && c.gradeCall !== "NO" && c.gradingCostValue > 0 && c.gradedEV != null)
    .map((c) => {
      const gain = c.gradedEV - Math.max(c.rawGGR ?? 0, 0);
      return { kind: "grade", key: `g-${c.id}`, label: `Grade ${name(c)}`, cost: c.gradingCostValue, gain, months: 4, note: `${c.gradeCall === "HIGH RISK" ? "High risk · " : ""}about +${fmtMoney(gain)} more than selling raw · money back in ~4 months${c.location === "ShipMyCards Vault" ? " · grade it through ShipMyCards" : ""}` };
    })
    .filter((o) => o.gain > 0);

  // 🔎 Buy: Buy Evaluator cards it says to buy.
  const buys = (buyList || [])
    .map((x) => computeBuy(x))
    .filter((x) => x.decision === "BUY")
    .map((x) => {
      const bid = Number(x.currentBid) > 0 ? Number(x.currentBid) : x.maxSnipeBid;
      return { kind: "buy", key: `b-${x.id}`, label: `Buy ${name(x)}`, cost: bid + (Number(x.shipping) || 0), gain: x.estProfit, months: 1.5, note: `bid up to ${fmtMoney(bid)} · about +${fmtMoney(x.estProfit)} profit when it sells` };
    })
    .filter((o) => o.cost > 0 && o.gain > 0);

  // 📦 Ship home: cheap cards stuck in the vault (under US$50 isn't worth consigning) — except
  // sports that sell far better to US buyers (NFL, MLB…), which stay there and get consigned.
  const vaultCheapAll = all
    .filter((c) => c.location === "ShipMyCards Vault" && (c.status === "Raw" || c.status === "Graded"))
    .map((c) => ({ c, v: currentMarketValue(c) }))
    .filter((x) => x.v != null && audToUsd(x.v) < 50);
  const vaultCheap = vaultCheapAll.filter((x) => !sellsBestInUS(x.c));
  const stayInUS = vaultCheapAll.filter((x) => sellsBestInUS(x.c));
  const stayValue = stayInUS.reduce((s, x) => s + x.v, 0);
  const stayFees = stayInUS.reduce((s, x) => s + pcSportscardsViaSmcFee(x.v), 0);
  const vaultValue = vaultCheap.reduce((s, x) => s + x.v, 0);
  const shipCost = Number(p.shipHomeCost) || 0;
  const shipWorth = vaultCheap.length >= SHIP_MIN_CARDS && shipCost <= vaultValue * SHIP_MAX_SHARE;
  const shipOpt = vaultCheap.length
    ? { kind: "ship", key: "ship", label: `Ship ${vaultCheap.length} cheap card${vaultCheap.length === 1 ? "" : "s"} home from ShipMyCards`, cost: shipCost, note: `about ${fmtMoney(shipCost / vaultCheap.length)} a card · worth about ${fmtMoney(vaultValue)} together · sell them as team lots once they're home` }
    : null;

  // 🛒 What to look for when shopping: Monthly Targets in their buy window (best researched first),
  // and the sports whose buy season it is.
  const month0 = new Date().getMonth();
  const lookFor = (targets || [])
    .filter((t) => t.status === "Watching" && (typeof seasonActionForMonth !== "function" || seasonActionForMonth(t.sport, month0) === "BUY"))
    .sort((a, c) => (typeof computeConfidence === "function" ? computeConfidence(c) - computeConfidence(a) : 0))
    .slice(0, 4);
  const buySeason = typeof SEASON_ROWS !== "undefined" ? SEASON_ROWS.filter((r) => r.blocks[month0]?.t === "BUY").map((r) => r.sport) : [];

  // Build the plan: unstick the vault first if it's worth it, then anything that beats a typical
  // flip (grading with a strong expected return, buys already in the Buy Evaluator), then the rest
  // becomes a shopping budget.
  const ranked = [...grades, ...buys].map((o) => ({ ...o, rate: o.gain / o.cost / o.months })).sort((a, c) => c.rate - a.rate);
  let left = spendable;
  const plan = [];
  if (shipOpt && shipWorth && shipCost <= left) {
    plan.push(shipOpt);
    left -= shipCost;
  }
  for (const o of ranked) if (o.rate >= SHOP_RATE && o.cost <= left) (plan.push(o), (left -= o.cost));
  let shop = null;
  if (left >= MIN_SHOP) {
    const n = left >= 150 ? 3 : left >= 60 ? 2 : 1;
    shop = { kind: "shop", key: "shop", label: `Go shopping — up to ${fmtMoney(left)}`, cost: left, perCard: Math.floor(left / n), n };
    plan.push(shop);
    left = 0;
  }
  // Slower options (e.g. grading with a thin expected return) — worth it if you'd rather not buy.
  const notYet = ranked.filter((o) => !plan.includes(o));

  // 💵 What selling the "sell" cards would free up.
  const sellCards = all.filter((c) => ["Sell Raw First", "Sell PSA 9", "Sell PSA 10"].includes(c.sellDecision));
  const freeUp = sellCards.reduce((s, c) => s + (((c.sellDecision === "Sell Raw First" ? c.rawAvg : ownGradeValue(c)) || 0) * (1 - (c.feesPct || 0.13))) * (Number(c.quantity) || 1), 0);

  const box = { border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22", marginBottom: 14 };
  const cheapest = Math.min(...ranked.map((o) => o.cost), shipOpt && shipWorth ? shipCost : Infinity, MIN_SHOP);

  return (
    <div style={box}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <div className="oswald" style={{ fontSize: 15, fontWeight: 600 }}>💡 Where should my money go?</div>
        <button type="button" className="btnSecondary" style={{ fontSize: 11, padding: "3px 9px" }} onClick={() => setShowSettings((v) => !v)}>⚙️ {showSettings ? "Hide" : "Settings"}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 10 }}>
        <MiniStat label={p.override !== "" ? "Available (your number)" : "Available (Card Space)"} value={fmtMoney(available)} color={available >= 0 ? "#EDEAE1" : "#B4472E"} />
        <MiniStat label={`Keep spare (${p.reservePct}%)`} value={fmtMoney(reserve)} />
        <MiniStat label="To spend" value={fmtMoney(spendable)} color="#4E8B6B" />
        <MiniStat label="Could free up by selling" value={fmtMoney(freeUp)} />
      </div>

      {showSettings && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 10 }}>
          <Field label="Money available (blank = Card Space balance)">
            <input type="number" step="0.01" value={p.override} placeholder={balance.toFixed(2)} onChange={(e) => setP({ override: e.target.value })} style={{ width: 150 }} />
          </Field>
          <Field label="Keep spare (%)">
            <input type="number" min="0" max="90" value={p.reservePct} onChange={(e) => setP({ reservePct: e.target.value })} style={{ width: 80 }} />
          </Field>
          <Field label="ShipMyCards ship-home cost (A$)">
            <input type="number" min="0" step="1" value={p.shipHomeCost} onChange={(e) => setP({ shipHomeCost: e.target.value })} style={{ width: 110 }} />
          </Field>
          <div style={{ fontSize: 11, color: "#6B7180", lineHeight: 1.5, flexBasis: "100%" }}>
            Keeping some spare covers fees, postage and a good buy that turns up unexpectedly. Ship-home cost: ShipMyCards charges carrier postage for the whole box (no outtake fee). Their estimate for ePacket — the cheapest option to Australia for small boxes — is about US$22–31 for 2 lb, so A$40 is a starting guess; use their real quote when you request a shipment. Keep a box's value under A$1,000 so it doesn't need a customs broker.
          </div>
        </div>
      )}

      {plan.length === 0 ? (
        <div style={{ fontSize: 12.5, color: "#C9A227", lineHeight: 1.6 }}>
          Not enough spare money for any of the options yet (cheapest: {fmtMoney(cheapest)}).
          {freeUp > 0 ? ` Sell first — the ${sellCards.length} card${sellCards.length === 1 ? "" : "s"} marked to sell in My Cards could free up about ${fmtMoney(freeUp)}.` : " Wait for the next transfer into the Card Space."}
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, color: "#8B90A0", marginBottom: 6 }}>With {fmtMoney(spendable)} to spend, in this order:</div>
          {plan.map((o, i) => (
            <div key={o.key} style={{ display: "flex", gap: 10, padding: "6px 0", borderTop: "1px solid #24272F", fontSize: 12.5, alignItems: "flex-start" }}>
              <span className="mono" style={{ color: "#6B7180", minWidth: 16 }}>{i + 1}.</span>
              <span style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, color: PLAN_KIND[o.kind].color }}>{PLAN_KIND[o.kind].icon} {o.label}</span>
                {o.kind === "shop" ? (
                  <div style={{ fontSize: 11.5, color: "#A7ADBB", marginTop: 3, lineHeight: 1.6 }}>
                    <div>{o.n === 1 ? `One card up to ${fmtMoney(o.perCard)}.` : `${o.n} cards around ${fmtMoney(o.perCard)} each — spreading it out means one bad buy doesn't sink the lot.`}</div>
                    {lookFor.length > 0 ? (
                      <div>
                        Look for your targets in their buy window:{" "}
                        {lookFor.map((t) => `${t.player}${t.cardToLookFor ? ` ${t.cardToLookFor}` : ""}${Number(t.targetPriceRaw) > 0 ? ` (up to ${fmtMoney(Number(t.targetPriceRaw))})` : ""}`).join(" · ")}
                      </div>
                    ) : buySeason.length > 0 ? (
                      <div>In buy season now: {buySeason.join(", ")} — the cheapest time of year for those cards.</div>
                    ) : null}
                    <div style={{ color: "#8B90A0" }}>Found one? Add it to the Buy Evaluator with its comps and current price — buy only if it says BUY, at or under its max bid.</div>
                  </div>
                ) : (
                  <div style={{ fontSize: 11.5, color: "#8B90A0", marginTop: 1 }}>{o.note}</div>
                )}
              </span>
              <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{fmtMoney(o.cost)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #2C303B", paddingTop: 6, fontSize: 12.5 }}>
            <span style={{ color: "#8B90A0" }}>Left over (plus {fmtMoney(reserve)} spare)</span>
            <b>{fmtMoney(left)}</b>
          </div>
        </>
      )}

      {shipOpt && !shipWorth && (
        <div style={{ fontSize: 11.5, color: "#8B90A0", marginTop: 8, lineHeight: 1.5 }}>
          📦 Not yet worth shipping your {vaultCheap.length} cheap {[...new Set(vaultCheap.map((x) => x.c.sport).filter(Boolean))].join("/")} vault card{vaultCheap.length === 1 ? "" : "s"} home — about {fmtMoney(shipCost / vaultCheap.length)} each, and {fmtMoney(shipCost)} shipping is {Math.round((shipCost / Math.max(vaultValue, 1)) * 100)}% of the {fmtMoney(vaultValue)} they're worth. It's worth it once the box is worth about {fmtMoney(shipCost / SHIP_MAX_SHARE)}+{vaultCheap.length < SHIP_MIN_CARDS ? ` and has ${SHIP_MIN_CARDS}+ cards` : ""} — keep adding cheap pickups to the vault until then.
        </div>
      )}
      {stayInUS.length > 0 && (
        <div style={{ fontSize: 11.5, color: "#8B90A0", marginTop: 8, lineHeight: 1.5 }}>
          🇺🇸 Leave your {stayInUS.length} cheap {[...new Set(stayInUS.map((x) => x.c.sport))].join("/")} vault card{stayInUS.length === 1 ? "" : "s"} ({fmtMoney(stayValue)}) in the US — they sell far better to US buyers than in Australia. Give each a week on the ShipMyCards Marketplace, then consign to PC Sportscards: about {fmtMoney(stayFees)} in fees all up ({Math.round((stayFees / Math.max(stayValue, 1)) * 100)}%), taken from the sale, not your bankroll. Storage while they wait is close to free — the first 180 days are included, then about US$0.10 a card every 90 days.
        </div>
      )}
      {notYet.length > 0 && plan.length > 0 && (
        <div style={{ fontSize: 11.5, color: "#6B7180", marginTop: 8, lineHeight: 1.5 }}>
          Also possible, but a typical flip should beat them: {notYet.slice(0, 3).map((o) => `${PLAN_KIND[o.kind].icon} ${o.label} (${fmtMoney(o.cost)}, about +${fmtMoney(o.gain)})`).join(" · ")}
          {freeUp > 0 && ` — and selling the ${sellCards.length} card${sellCards.length === 1 ? "" : "s"} marked to sell would free up about ${fmtMoney(freeUp)}.`}
        </div>
      )}
      <div style={{ fontSize: 10.5, color: "#6B7180", marginTop: 8, lineHeight: 1.5 }}>
        Grading goes ahead of shopping only when its expected profit per dollar per month beats a typical flip (about 20% profit in 1.5 months) — grading ties money up about 4 months. Estimates from your comps, not guarantees.
      </div>
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
