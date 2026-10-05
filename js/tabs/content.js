// ===== Content Creation =====

const CONTENT_PILLARS = ["Pack & Box Openings", "Budget-Friendly Investing", "Rookie Card Spotlights", "Sell/Flip Update", "Grading & Raw Tips", "Behind the Scenes"];
const CONTENT_PLATFORMS = ["YouTube (long-form)", "YouTube Shorts", "TikTok", "Instagram", "Multiple"];
const CONTENT_STATUS = ["Idea", "Scripted", "Filmed", "Edited", "Posted"];
const CONTENT_STATUS_COLOR = { Idea: "#5C7A99", Scripted: "#C9A227", Filmed: "#8B6FD6", Edited: "#2FA89A", Posted: "#4E8B6B" };

function newContentItem(idea) {
  return {
    id: crypto.randomUUID(),
    title: idea?.title || "",
    platform: idea?.platform || "YouTube (long-form)",
    pillar: idea?.pillar || "Budget-Friendly Investing",
    status: "Idea",
    hook: idea?.hook || "",
    notes: idea?.outline ? idea.outline.join("\n") : "",
    dateAdded: new Date().toISOString().slice(0, 10),
  };
}

function generateContentIdeas(cards, pokemonCards, targets, boxBreaks, salesItems) {
  const ideas = [];
  const allActive = [...(cards || []).map(computeCard), ...(pokemonCards || []).map(computePokemonCard)];
  const currentMonthIdx = new Date().getMonth();

  function calendarSaysNow(sport, wantedAction) {
    if (typeof seasonActionForMonth !== "function") return true;
    const action = seasonActionForMonth(sport, currentMonthIdx);
    if (action == null) return true;
    return action === wantedAction;
  }

  const actionable = allActive
    .filter((c) => ["Sell Raw First", "Grade First", "Sell PSA 9", "Sell PSA 10"].includes(c.sellDecision))
    .sort((a, b) => b.totalCost - a.totalCost);

  const sellableNow = actionable.filter((c) => calendarSaysNow(c.sport, "SELL"));
  if (sellableNow.length > 0) {
    const c = sellableNow[0];
    ideas.push({
      title: `Time to Sell: My ${c.player} ${c.card} — Here's My Exact Math`,
      pillar: "Sell/Flip Update",
      platform: "YouTube Shorts",
      hook: `"I bought this for $${c.totalCost.toFixed(2)} — here's exactly why it's time to sell."`,
      source: `Pulled from My Cards, and the timing lines up — your seasonal calendar shows ${c.sport} is in its Sell window right now.`,
      outline: [
        `Hook (say it in the first 2 seconds): show the card, state what you paid`,
        `Context: how you found it / why you bought it`,
        `The math: current value vs cost, why the numbers say sell now`,
        `Close: what you're doing next, remind viewers to check their own cards`,
      ],
    });
  } else if (actionable.length > 0) {
    const c = actionable[0];
    const currentAction = typeof seasonActionForMonth === "function" ? seasonActionForMonth(c.sport, currentMonthIdx) : null;
    ideas.push({
      title: `Why I'm Holding My ${c.player} ${c.card} (Even Though It's Profitable to Sell)`,
      pillar: "Sell/Flip Update",
      platform: "YouTube Shorts",
      hook: `"This card is sitting on real profit right now — here's why I'm not selling it yet."`,
      source: `Pulled from My Cards — flagged to sell, but your seasonal calendar shows ${c.sport} is a${currentAction ? ` ${currentAction.toLowerCase()}` : ""} month right now, not the Sell window`,
      outline: [
        `Hook: show the card, state the profit it's sitting on right now`,
        `The reasoning: why timing matters more than a quick sale — explain the seasonal pattern for this sport`,
        `What you're doing instead: grading it, holding, or just waiting`,
        `Close: when you'll actually sell, and why patience pays in this hobby`,
      ],
    });
  }

  const buyNowTargets = [...(targets || [])].filter((t) => t.tier === "Buy Now").sort((a, b) => (typeof computeConfidence === "function" ? computeConfidence(b) - computeConfidence(a) : 0));
  const buyNowNow = buyNowTargets.filter((t) => calendarSaysNow(t.sport, "BUY"));
  const bestBuyTarget = buyNowNow[0] || buyNowTargets[0];
  if (bestBuyTarget) {
    const t = bestBuyTarget;
    const aligned = buyNowNow.length > 0;
    ideas.push({
      title: `Why I'm Watching ${t.player} Right Now`,
      pillar: "Rookie Card Spotlights",
      platform: "YouTube (long-form)",
      hook: `"This is the card I'm watching right now, and here's why — not financial advice, just my own homework."`,
      source: aligned
        ? `Pulled from Monthly Targets, and it lines up — your seasonal calendar shows ${t.sport} is in its Buy window right now.`
        : "Pulled from Monthly Targets — your highest-confidence current pick",
      outline: [
        `Hook: show the card or a picture of the player`,
        `The reasoning: why this player, why now (use your own notes on the target)`,
        `What to look for: ${t.cardToLookFor || "which card/set to chase"}`,
        `Close: this isn't financial advice, just your own research — invite comments`,
      ],
    });
  }

  const budgetTargets = (targets || []).filter((t) => {
    const v = Number(t.targetPriceRaw) || Number(t.targetPriceGraded);
    return v && v <= 50;
  });
  if (budgetTargets.length > 0) {
    ideas.push({
      title: "Budget Picks Under $50 Right Now",
      pillar: "Budget-Friendly Investing",
      platform: "YouTube (long-form)",
      hook: `"You don't need thousands of dollars to start — here's what I'm watching under $50 right now."`,
      source: `Pulled from Monthly Targets — ${budgetTargets.length} target${budgetTargets.length === 1 ? "" : "s"} under $50`,
      outline: [
        `Hook: "You don't need thousands to start" — set the budget angle up front`,
        `Walk through each pick: player, why, roughly what to pay`,
        `Show your own math for one of them (paid vs expected value)`,
        `Close: ask viewers what budget picks they're watching`,
      ],
    });
  }

  const completedBoxes = (boxBreaks || []).filter((b) => b.status === "Completed");
  if (completedBoxes.length > 0) {
    const box = completedBoxes[0];
    const t = typeof boxTotals === "function" ? boxTotals(box) : { cost: 0, revenue: 0, profit: 0 };
    ideas.push({
      title: `Box Break Recap: Was My ${box.name} Worth It?`,
      pillar: "Pack & Box Openings",
      platform: "TikTok",
      hook: `"This box cost me $${t.cost.toFixed(2)} — did it actually pay off? Let's find out."`,
      source: "Pulled from Box Breaks — your most recent completed break",
      outline: [
        `Hook: show the empty box, state what it cost`,
        `Recap the spots/pulls — best moment first`,
        `The numbers: revenue $${t.revenue.toFixed(2)}, profit ${t.profit >= 0 ? "+" : ""}$${t.profit.toFixed(2)}`,
        `Close: would you run this box again? Why or why not`,
      ],
    });
  }

  const recentSold = (salesItems || []).filter((s) => s.status === "Sold");
  if (recentSold.length > 0) {
    const totalProfit = recentSold.reduce((s, i) => s + (Number(i.realisedProfit) || 0), 0);
    ideas.push({
      title: "What I Sold This Month (And Why)",
      pillar: "Sell/Flip Update",
      platform: "Multiple",
      hook: `"I sold ${recentSold.length} cards this month for a total of ${typeof fmtMoney === "function" ? fmtMoney(totalProfit) : "$" + totalProfit} profit — here's the breakdown."`,
      source: `Pulled from My Sales — ${recentSold.length} card${recentSold.length === 1 ? "" : "s"} sold. Aggregating small flips into one total is usually a stronger video than posting each one alone.`,
      outline: [
        `Hook: total realised profit for the month, upfront — say the number, not each flip`,
        `Walk through 2-3 sales — what it was, what it sold for, why`,
        `Any surprises — sold above or below what you expected?`,
        `Close: what's queued up to sell next`,
      ],
    });
  }

  ideas.push({
    title: "Quick Tip: When Is It Actually Worth Grading a Card?",
    pillar: "Grading & Raw Tips",
    platform: "TikTok",
    hook: `"Don't grade this card — here's the rule I actually use."`,
    source: "Evergreen — built from your own grading cost tiers already in Tips & Tricks",
    outline: [
      `Hook (first line, on screen too): "Don't grade this card" — show a raw card as the example`,
      `The rule: PSA 10 GGR needs to clear the grading cost + fees, not just look nice`,
      `Quick maths on screen — cost to grade vs expected payoff`,
      `Close: "Check the app before you submit anything"`,
    ],
  });
  ideas.push({
    title: "Raw vs Graded: The Real Cost Nobody Tells You About",
    pillar: "Grading & Raw Tips",
    platform: "YouTube Shorts",
    hook: `"This card cost me way more to sell than I expected — here's why."`,
    source: "Evergreen — pulled from your Selling Playbook fee comparisons",
    outline: [
      `Hook: "This card cost me $X more to sell than I expected"`,
      `Break down the real fees — platform + shipping + grading, stacked up`,
      `The lesson: know your total cost before you ever list it`,
      `Close: quick call to action, ask what platform they use`,
    ],
  });

  return ideas.slice(0, 8);
}

// Universal AI content generator (Set default batch to 6)
async function generateAiContentIdea(cards = [], targets = [], count = 1) {
  const sellCards = (cards || []).filter((c) => ["Sell Raw First", "Grade First", "Sell PSA 9", "Sell PSA 10"].includes(c.sellDecision));
  const topProfit = [...(cards || [])].sort((a, b) => (b.expectedListProfit || 0) - (a.expectedListProfit || 0)).slice(0, 3);

  const prompt = `
Generate ${count} unique, high-engagement short-form video content idea(s) for a sports card collector based on this data:
- Cards ready for action: ${sellCards.map(c => `${c.player} (${c.sport})`).join(", ") || "Various"}
- Top profit cards: ${topProfit.map(c => `${c.player} ($${c.expectedListProfit || 0})`).join(", ")}
- High confidence targets: ${(targets || []).slice(0, 3).map(t => t.player).join(", ")}

Return ONLY a raw JSON ${count > 1 ? "ARRAY of objects" : "SINGLE object"} matching this structure:
${count > 1 ? "[" : ""}{
  "title": "Headline",
  "pillar": "Rookie Card Spotlights", 
  "platform": "YouTube Shorts",
  "hook": "\\"First 2 seconds quote\\"",
  "source": "Generated via AI from your portfolio",
  "outline": ["Hook line", "Context line", "Math line", "Call to action"]
}${count > 1 ? "]" : ""}

Allowed Pillars: "Pack & Box Openings", "Budget-Friendly Investing", "Rookie Card Spotlights", "Sell/Flip Update", "Grading & Raw Tips", "Behind the Scenes".
Allowed Platforms: "YouTube (long-form)", "YouTube Shorts", "TikTok", "Instagram", "Multiple".
`;

  try {
    const rawText = await callGeminiAi(prompt);

    if (!rawText || typeof rawText !== "string") {
      throw new Error("Invalid response string from Gemini Edge Function");
    }

    const cleanJson = rawText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("AI Idea generation error:", err);
    return null;
  }
}

function countPostedInPeriod(contentPlan, period) {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - (period === "week" ? 7 : 30));
  return (contentPlan || []).filter((c) => c.status === "Posted" && c.datePosted && new Date(c.datePosted) >= cutoff).length;
}

function ContentCreation({ cards, pokemonCards, targets, boxBreaks, salesItems, contentPlan, setContentPlan, contentGoal, setContentGoal }) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);

  const initialIdeas = useMemo(
    () => generateContentIdeas(cards, pokemonCards, targets, boxBreaks, salesItems),
    [cards, pokemonCards, targets, boxBreaks, salesItems]
  );

  const [dynamicIdeas, setDynamicIdeas] = useState(initialIdeas);

  useEffect(() => {
    setDynamicIdeas(initialIdeas);
  }, [initialIdeas]);

// Bulk Re-generate Ideas - Requests 6 ideas in 1 single API call
  async function handleRegenerateAll() {
    setIsGenerating(true);
    
    // Request 6 distinct ideas in 1 prompt
    const newIdeas = await generateAiContentIdea(cards, targets, 6);

    if (newIdeas && Array.isArray(newIdeas) && newIdeas.length > 0) {
      setDynamicIdeas(newIdeas);
    } else {
      console.warn("Could not fetch new bulk ideas, keeping active set.");
    }
    
    setIsGenerating(false);
  }

  async function addFromIdea(idea, index) {
    setContentPlan((prev) => [newContentItem(idea), ...prev]);

    setDynamicIdeas((prev) =>
      prev.map((item, i) => (i === index ? { ...item, loading: true } : item))
    );

    const replacement = await generateAiContentIdea(cards, targets);

    if (replacement) {
      setDynamicIdeas((prev) =>
        prev.map((item, i) => (i === index ? replacement : item))
      );
    } else {
      setDynamicIdeas((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function addItem(item) {
    setContentPlan((prev) => [item, ...prev]);
    setShowAdd(false);
  }

  function updateItem(id, updates) {
    setContentPlan((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next = { ...c, ...updates };
        if (updates.status === "Posted" && c.status !== "Posted") {
          next.datePosted = new Date().toISOString().slice(0, 10);
        }
        return next;
      })
    );
  }

  function deleteItem(id) {
    setContentPlan((prev) => prev.filter((c) => c.id !== id));
    setSelectedId(null);
  }

  const visible = statusFilter === "all" ? contentPlan : contentPlan.filter((c) => c.status === statusFilter);
  const selected = selectedId ? contentPlan.find((c) => c.id === selectedId) : null;
  const postedCount = contentPlan.filter((c) => c.status === "Posted").length;
  const postedInPeriod = countPostedInPeriod(contentPlan, contentGoal.period);
  const goalHit = postedInPeriod >= contentGoal.count;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "16px 18px", marginBottom: 24, background: "#191B22" }}>
        <div style={{ fontSize: 13, color: "#C6CAD4", lineHeight: 1.7 }}>
          Every idea below is pulled straight from data you've already tracked in this app — you're not performing or improvising, you're just explaining numbers and decisions you already worked out. That's a much easier thing to say out loud than "content." Budget Card Collector is a good angle to keep leaning into, since it's specific and it's already working — the "eventually more expensive collections" pivot can happen gradually as your own collection grows, no need to force it early.
        </div>
      </div>

      <SectionTitle>Your goal</SectionTitle>
      <div style={{ border: `1px solid ${goalHit ? "#4E8B6B55" : "#2C303B"}`, borderRadius: 10, padding: "16px 18px", marginBottom: 24, background: goalHit ? "#4E8B6B0f" : "#191B22" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#8B90A0" }}>Post</span>
            <input
              type="number"
              min="1"
              value={contentGoal.count}
              onChange={(e) => setContentGoal({ ...contentGoal, count: Math.max(1, Number(e.target.value) || 1) })}
              style={{ width: 60, padding: "6px 8px", textAlign: "center" }}
            />
            <select
              value={contentGoal.period}
              onChange={(e) => setContentGoal({ ...contentGoal, period: e.target.value })}
              style={{ width: "auto" }}
            >
              <option value="week">per week</option>
              <option value="month">per month</option>
            </select>
          </div>
          <div className="oswald" style={{ fontSize: 18, fontWeight: 700, color: goalHit ? "#4E8B6B" : "#C9A227" }}>
            {postedInPeriod} / {contentGoal.count} posted this {contentGoal.period}
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#8B90A0", lineHeight: 1.6 }}>
          {goalHit
            ? "Goal hit for this period — anything extra is a bonus, not a requirement."
            : "Set this to something you can actually hit most weeks, even a low number. One consistent post beats a burst of five followed by a month of nothing."}
          {" "}Research backs this up directly: 2-3 Shorts/TikToks a week is the minimum that actually moves an algorithm, but even below that, consistency matters more than volume — showing up regularly is what the algorithm and an audience both respond to.
        </div>
        <div style={{ fontSize: 11.5, color: "#6B7180", marginTop: 10, paddingTop: 10, borderTop: "1px solid #24272F" }}>
          <span style={{ color: "#C9A227", fontWeight: 600 }}>Repurpose instead of reinventing:</span> one filming session can cover more than one goal. Film a card recap once, then cut it into a Short/TikTok, use the same footage in a monthly recap video, and grab a still for Instagram. That's three posts toward your goal from one sitting.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1, background: "#2C303B", border: "1px solid #2C303B", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
        <Stat label="In the pipeline" value={contentPlan.length} />
        <Stat label="Posted" value={postedCount} color="#4E8B6B" />
        <Stat label="Fresh ideas ready" value={dynamicIdeas.length} color="#C9A227" />
      </div>

      <SectionTitle>Format &amp; platform strategy</SectionTitle>
      <div style={{ border: "1px solid #C9A22755", borderRadius: 10, padding: "16px 18px", marginBottom: 28, background: "#C9A2270f" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#C9A227", marginBottom: 6 }}>📱 TikTok &amp; YouTube Shorts</div>
            <div style={{ fontSize: 12, color: "#C6CAD4", lineHeight: 1.7 }}>
              Both currently favor small/new creators — TikTok is leaning on content discovery over follower count right now, and the smallest YouTube channels are seeing the fastest growth of any size bracket. Every video gets tested fresh against a small audience regardless of your subscriber count, so there's no real barrier to starting.
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#C9A227", marginBottom: 6 }}>⏱️ The hook is everything</div>
            <div style={{ fontSize: 12, color: "#C6CAD4", lineHeight: 1.7 }}>
              Average watch time on a Short is now around 16 seconds — Shorts need roughly 65% retention (sub-30s) or 50% (30-60s) to get pushed wider. Say the most interesting thing in your first sentence, not your third. Every idea below now has a suggested hook line for exactly this reason.
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#C6CAD4", lineHeight: 1.7, borderTop: "1px solid #C9A22733", paddingTop: 12 }}>
          <span style={{ color: "#4E8B6B", fontWeight: 600 }}>On small flips specifically:</span> don't post them one at a time — a single $3-5 flip can feel too small to bother with, but five of them add up to a real number worth sharing. That's why "What I Sold This Month" is built as one aggregated recap instead of five separate videos.
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <SectionTitle>Ideas, pulled from your own data</SectionTitle>
        <button
          className="btnSecondary"
          onClick={handleRegenerateAll}
          disabled={isGenerating}
          style={{
            fontSize: 12,
            padding: "6px 14px",
            background: "#C9A22722",
            color: "#C9A227",
            border: "1px solid #C9A22755",
            cursor: isGenerating ? "wait" : "pointer",
            fontWeight: 600,
          }}
        >
          {isGenerating ? "✨ Generating..." : "⚡ Re-generate AI Ideas"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, marginBottom: 28 }}>
        {dynamicIdeas.map((idea, i) => (
          <div key={i} style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22", opacity: idea.loading ? 0.5 : 1 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              <span className="mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "#C9A22722", color: "#C9A227" }}>{idea.pillar}</span>
              <span className="mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "#5C7A9922", color: "#5C7A99" }}>{idea.platform}</span>
            </div>
            <div className="oswald" style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 6 }}>{idea.title}</div>
            {idea.hook && (
              <div style={{ fontSize: 11.5, color: "#C9A227", fontStyle: "italic", marginBottom: 8, lineHeight: 1.5 }}>
                Suggested hook: {idea.hook}
              </div>
            )}
            <div style={{ fontSize: 11, color: "#6B7180", marginBottom: 10 }}>{idea.source}</div>
            <button
              className="btnSecondary"
              style={{ fontSize: 12, padding: "6px 12px" }}
              disabled={idea.loading}
              onClick={() => addFromIdea(idea, i)}
            >
              <Plus size={12} style={{ marginRight: 4 }} />
              {idea.loading ? "Replacing..." : "Add to plan"}
            </button>
          </div>
        ))}
      </div>

      <SectionTitle>Your content plan</SectionTitle>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className={`filterBtn ${statusFilter === "all" ? "active" : ""}`} onClick={() => setStatusFilter("all")}>All</button>
          {CONTENT_STATUS.map((s) => (
            <button key={s} className={`filterBtn ${statusFilter === s ? "active" : ""}`} onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
        <button className="btnPrimary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add manually
        </button>
      </div>

      {visible.length === 0 ? (
        <div style={{ padding: "3rem 0", textAlign: "center", color: "#5C6270", border: "1px solid #2C303B", borderRadius: 10 }}>
          Nothing here yet — add an idea above, or add one manually.
        </div>
      ) : (
        <div style={{ border: "1px solid #2C303B", borderRadius: 10, overflow: "hidden" }}>
          {visible.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="cardRow"
              style={{ display: "grid", gridTemplateColumns: "2fr 110px 120px 90px", padding: "10px 14px", borderTop: "1px solid #24272F", cursor: "pointer", alignItems: "center", fontSize: 13 }}
            >
              <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
              <div style={{ fontSize: 11.5, color: "#8B90A0" }}>{c.pillar}</div>
              <div style={{ fontSize: 11.5, color: "#8B90A0" }}>{c.platform}</div>
              <span className="mono" style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: `${CONTENT_STATUS_COLOR[c.status]}22`, color: CONTENT_STATUS_COLOR[c.status], justifySelf: "start" }}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {showAdd && <ContentAddModal onClose={() => setShowAdd(false)} onSave={addItem} />}
      {selected && <ContentDetailModal item={selected} onUpdate={updateItem} onDelete={deleteItem} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

function ContentAddModal({ onClose, onSave }) {
  const [form, setForm] = useState(newContentItem());

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title="Add content idea" onClose={onClose} />
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Title">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Platform">
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                {CONTENT_PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Pillar">
              <select value={form.pillar} onChange={(e) => setForm({ ...form, pillar: e.target.value })}>
                {CONTENT_PILLARS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Hook (your first line — say it before anything else)">
            <input value={form.hook} onChange={(e) => setForm({ ...form, hook: e.target.value })} placeholder='e.g. "This card cost me $X more to sell than I expected"' />
          </Field>
          <Field label="Talking points / outline">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={4}
              style={{ background: "#14161C", border: "1px solid #333844", color: "#EDEAE1", borderRadius: 6, padding: "9px 11px", fontSize: 14, fontFamily: "'Inter', sans-serif", width: "100%", resize: "vertical" }}
              placeholder="Hook / context / the numbers / close — bullet points are fine, this isn't a script"
            />
          </Field>
          <button className="btnPrimary" type="submit" style={{ justifyContent: "center", marginTop: 6 }}>
            Add to plan
          </button>
        </form>
      </div>
    </div>
  );
}

function ContentDetailModal({ item, onUpdate, onDelete, onClose }) {
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title={item.title} onClose={onClose} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Platform">
              <select value={item.platform} onChange={(e) => onUpdate(item.id, { platform: e.target.value })}>
                {CONTENT_PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Pillar">
              <select value={item.pillar} onChange={(e) => onUpdate(item.id, { pillar: e.target.value })}>
                {CONTENT_PILLARS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Status">
            <select value={item.status} onChange={(e) => onUpdate(item.id, { status: e.target.value })}>
              {CONTENT_STATUS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Hook (your first line)">
            <input value={item.hook || ""} onChange={(e) => onUpdate(item.id, { hook: e.target.value })} placeholder='e.g. "This card cost me $X more to sell than I expected"' />
          </Field>
          <Field label="Talking points / outline">
            <textarea
              value={item.notes}
              onChange={(e) => onUpdate(item.id, { notes: e.target.value })}
              rows={6}
              style={{ background: "#14161C", border: "1px solid #333844", color: "#EDEAE1", borderRadius: 6, padding: "9px 11px", fontSize: 14, fontFamily: "'Inter', sans-serif", width: "100%", resize: "vertical" }}
            />
          </Field>
          <button
            onClick={() => { onDelete(item.id); onClose(); }}
            style={{ background: "transparent", border: "1px solid #4a2a24", color: "#B4472E", borderRadius: 8, padding: "9px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}
          >
            <Trash2 size={14} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}
