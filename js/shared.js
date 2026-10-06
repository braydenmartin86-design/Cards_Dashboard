// Shared UI helpers and components used across tabs.

// Sandboxed iframes (like this artifact preview) often block the async Clipboard API
// outright. Try it first, but always fall back to the old-school hidden-textarea +
// execCommand trick, which works in far more embedded contexts.
function copyToClipboard(text) {
  return new Promise((resolve) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => resolve(true))
        .catch(() => resolve(fallbackCopy(text)));
    } else {
      resolve(fallbackCopy(text));
    }
  });
}

function fallbackCopy(text) {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch (e) {
    return false;
  }
}

function selectAllText(e) {
  const range = document.createRange();
  range.selectNodeContents(e.currentTarget);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

// ===== Shared bits =====

function ModalHeader({ title, onClose }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
      <h2 className="oswald" style={{ margin: 0, fontSize: 20 }}>{title}</h2>
      <X size={20} style={{ cursor: "pointer", color: "#8B90A0" }} onClick={onClose} />
    </div>
  );
}

// "Ask CardSight": plain-English questions to CardSight's AI, with follow-ups. `suggestions`
// are one-click starter questions.
function AskCardSight({ title = "Ask CardSight", suggestions = [], placeholder = "Ask anything about cards, prices or players…" }) {
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState([]); // [{ role: "user" | "assistant", content }]
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);

  async function ask(text) {
    const q = String(text || question).trim();
    if (!q || asking) return;
    setAsking(true);
    setError(null);
    setQuestion("");
    const history = turns;
    setTurns([...history, { role: "user", content: q }]);
    try {
      const answer = await askCardSight(q, history);
      setTurns((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (e) {
      setError(e.message || String(e));
      setTurns(history);
      setQuestion(q);
    } finally {
      setAsking(false);
    }
  }

  return (
    <div style={{ border: "1px solid #2FA89A44", borderRadius: 10, padding: "14px 16px", background: "#191B22", marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div className="oswald" style={{ fontSize: 15, fontWeight: 600, color: "#2FA89A" }}>✨ {title}</div>
        {turns.length > 0 && (
          <button className="btnSecondary" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setTurns([])}>
            New question
          </button>
        )}
      </div>
      {turns.map((t, i) => (
        <div key={i} style={{ fontSize: 12.5, lineHeight: 1.6, whiteSpace: "pre-wrap", marginBottom: 8, color: t.role === "user" ? "#EDEAE1" : "#C6CAD4", fontWeight: t.role === "user" ? 600 : 400 }}>
          {t.role === "user" ? "You: " : ""}
          {t.content}
        </div>
      ))}
      {asking && <div style={{ fontSize: 12, color: "#8B90A0", marginBottom: 8 }}>Thinking…</div>}
      {error && <div style={{ fontSize: 12, color: "#B4472E", marginBottom: 8 }}>{error}</div>}
      {turns.length === 0 && suggestions.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {suggestions.map((s) => (
            <button key={s} className="filterBtn" style={{ fontSize: 11.5, padding: "4px 10px" }} onClick={() => ask(s)} disabled={asking}>
              {s}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") ask();
          }}
          placeholder={turns.length ? "Ask a follow-up…" : placeholder}
        />
        <button className="btnPrimary" onClick={() => ask()} disabled={asking || !question.trim()} style={{ whiteSpace: "nowrap" }}>
          Ask
        </button>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ fontSize: 11, color: "#6B7180", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, marginTop: 4 }}>{children}</div>;
}

function Field({ label, children }) {
  return (
    <div>
      <label>{label}</label>
      {children}
    </div>
  );
}

// Two quick "most recent sale" inputs instead of manually averaging 5 sales.
// Second sale is optional; leaving both blank means N/A (no data for this tier).
function TierPriceInput({ label, sale1, sale2, onChange1, onChange2 }) {
  const avg = avgOfSales(sale1, sale2);
  return (
    <div>
      <label>{label}</label>
      <div style={{ display: "flex", gap: 6 }}>
        <input type="number" step="0.01" placeholder="N/A" value={sale1} onChange={(e) => onChange1(e.target.value)} />
        <input type="number" step="0.01" placeholder="2nd (opt.)" value={sale2} onChange={(e) => onChange2(e.target.value)} />
      </div>
      <div style={{ fontSize: 10.5, color: "#6B7180", marginTop: 3 }}>
        {avg != null ? `→ ${avg.toFixed(2)}` : "no data"}
      </div>
    </div>
  );
}

// Rookie + Numbered/print-run fields, shared across My Cards and Buy Evaluator forms
function RookieNumberedFields({ form, setForm }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: form.numbered ? "1fr 1fr 1fr" : "1fr 1fr", gap: 10 }}>
      <Field label="Rookie?">
        <select value={form.rookie ? "Yes" : "No"} onChange={(e) => setForm({ ...form, rookie: e.target.value === "Yes" })}>
          <option>No</option>
          <option>Yes</option>
        </select>
      </Field>
      <Field label="Numbered?">
        <select
          value={form.numbered ? "Yes" : "No"}
          onChange={(e) => {
            const isNumbered = e.target.value === "Yes";
            setForm({ ...form, numbered: isNumbered, outOf: isNumbered ? form.outOf : "" });
          }}
        >
          <option>No</option>
          <option>Yes</option>
        </select>
      </Field>
      {form.numbered && (
        <Field label="Out of #">
          <input type="number" min="1" step="1" placeholder="e.g. 175" value={form.outOf ?? ""} onChange={(e) => setForm({ ...form, outOf: e.target.value })} />
        </Field>
      )}
    </div>
  );
}

function MiniStat({ label, value, color, emphasis }) {
  return (
    <div style={{ background: "#14161C", border: emphasis ? "1px solid #C9A22755" : "1px solid #24272F", borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ fontSize: 10, color: "#6B7180", marginBottom: 3, textTransform: "uppercase" }}>{label}</div>
      <div className="oswald" style={{ fontSize: emphasis ? 17 : 15, fontWeight: 600, color: color || "#EDEAE1" }}>{value}</div>
    </div>
  );
}

// Compact trend chart of a tier's value history — deliberately small (this is a glance,
// not an analysis tool). Falls back to a plain message until there are at least 2 points.
function TrendSparkline({ history, color }) {
  const points = history || [];
  const label = points.length ? null : null;

  if (points.length < 2) {
    return (
      <div style={{ background: "#14161C", border: "1px solid #24272F", borderRadius: 8, padding: "8px 10px", height: 62, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 10.5, color: "#5C6270", textAlign: "center" }}>
          {points.length === 1 ? "Only 1 data point yet" : "No history yet"}
        </span>
      </div>
    );
  }

  return (
    <div style={{ background: "#14161C", border: "1px solid #24272F", borderRadius: 8, padding: "6px 8px 4px" }}>
      <div style={{ height: 46 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points}>
            <YAxis domain={["dataMin", "dataMax"]} hide />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 2, fill: color }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ fontSize: 9.5, color: "#6B7180", textAlign: "center", marginTop: 2 }}>
        {points[0].date} → {points[points.length - 1].date}
      </div>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    width: "100%",
    background: "#14161C",
    backgroundImage: "radial-gradient(circle at 15% 10%, rgba(201,162,39,0.06), transparent 40%), radial-gradient(circle at 85% 90%, rgba(139,111,214,0.06), transparent 45%)",
    color: "#EDEAE1",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
};

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
      * { box-sizing: border-box; }
      .oswald { font-family: 'Oswald', sans-serif; }
      .mono { font-family: 'JetBrains Mono', monospace; }
      .filterBtn { background: transparent; border: 1px solid #333844; color: #A7ADBB; padding: 6px 14px; border-radius: 999px; font-size: 13px; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.15s ease; }
      .filterBtn.active { background: #EDEAE1; color: #14161C; border-color: #EDEAE1; font-weight: 600; }
      .btnPrimary { background: #C9A227; color: #14161C; border: none; border-radius: 8px; padding: 10px 18px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
      .btnPrimary:hover { background: #DCB539; }
      .btnSecondary { background: transparent; border: 1px solid #333844; color: #EDEAE1; border-radius: 8px; padding: 9px 16px; font-size: 13px; cursor: pointer; }
      .cardRow:hover { background: #1D2028; }
      input, select { background: #14161C; border: 1px solid #333844; color: #EDEAE1; border-radius: 6px; padding: 9px 11px; font-size: 14px; font-family: 'Inter', sans-serif; width: 100%; }
      input:focus, select:focus { outline: 2px solid #C9A227; outline-offset: 1px; }
      label { font-size: 12px; color: #8B90A0; margin-bottom: 4px; display: block; }
      .modalOverlay { position: fixed; inset: 0; background: rgba(10,11,15,0.72); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
      .modalBox { background: #191B22; border: 1px solid #2C303B; border-radius: 14px; max-width: 480px; width: 100%; max-height: 88vh; overflow-y: auto; padding: 24px; }
    `}</style>
  );
}
