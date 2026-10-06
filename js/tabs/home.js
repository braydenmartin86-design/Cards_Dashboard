// ===== Home / Dashboard =====

function Home({ cards, pokemonCards, targets, boxBreaks, salesItems, buyList, contentPlan, contentGoal, setTab }) {
  const allEnriched = useMemo(() => [...cards.map(computeCard), ...pokemonCards.map(computePokemonCard)], [cards, pokemonCards]);

  const portfolioTotals = useMemo(() => {
    const qty = (c) => Number(c.quantity) || 1;
    const active = allEnriched.filter((c) => c.status !== "Sold");
    const invested = active.reduce((s, c) => s + c.totalCost * qty(c), 0);
    const potentialRaw = active.reduce((s, c) => s + (c.rawGGR ?? 0) * qty(c), 0);
    const realised = allEnriched.filter((c) => c.status === "Sold").reduce((s, c) => s + (c.realisedProfit ?? 0) * qty(c), 0);
    const soldCost = allEnriched.filter((c) => c.status === "Sold").reduce((s, c) => s + c.totalCost * qty(c), 0);
    const totalInvested = invested + soldCost;
    const overallROI = totalInvested > 0 ? (potentialRaw + realised) / totalInvested : null;
    return { invested, potentialRaw, realised, overallROI, activeCount: active.length };
  }, [allEnriched]);

  const actionItems = useMemo(
    () =>
      allEnriched
        .filter((c) => ["Sell Raw First", "Grade First", "Sell PSA 9", "Sell PSA 10"].includes(c.sellDecision))
        .sort((a, b) => a.sellPriority - b.sellPriority || b.totalCost - a.totalCost)
        .slice(0, 5),
    [allEnriched]
  );

  const buyComputed = useMemo(() => buyList.map(computeBuy), [buyList]);
  const readyToBuy = buyComputed.filter((t) => t.decision === "BUY" && t.biddingStatus === "Watching");
  const bidsPlaced = buyComputed.filter((t) => t.biddingStatus === "Bid Placed");

  const boxTotalsAll = useMemo(() => {
    const all = boxBreaks.map(boxTotals);
    const totalProfit = all.reduce((s, t) => s + t.profit, 0);
    const active = boxBreaks.filter((b) => b.status !== "Completed").length;
    return { totalProfit, active };
  }, [boxBreaks]);

  const topTargets = useMemo(
    () =>
      [...targets]
        .filter((t) => t.status === "Watching")
        .sort((a, b) => computeConfidence(b) - computeConfidence(a))
        .slice(0, 3),
    [targets]
  );
  const avgConfidence = targets.length ? Math.round(targets.reduce((s, t) => s + computeConfidence(t), 0) / targets.length) : null;

  const listedItems = salesItems.filter((s) => s.status === "Listed");
  const soldItems = salesItems.filter((s) => s.status === "Sold");
  const recentRealised = soldItems.reduce((s, i) => s + (Number(i.realisedProfit) || 0), 0);

  // CardSight's AI answers best about one specific card, so the starter questions are built
  // from the most valuable cards still held.
  const cardSightSuggestions = useMemo(() => {
    const held = allEnriched
      .filter((c) => c.status !== "Sold" && c.status !== "Listed" && c.player)
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 3)
      .map((c) => `What has the ${[c.card, c.player, c.cardNum].filter(Boolean).join(" ")}${c.grade ? ` ${c.grade}` : ""} sold for recently?`);
    return held.length ? held : ["What has the 2023 Prizm Victor Wembanyama #136 sold for recently?"];
  }, [allEnriched]);

  const postedInPeriod = countPostedInPeriod(contentPlan, contentGoal.period);
  const goalHit = postedInPeriod >= contentGoal.count;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 1, background: "#2C303B", border: "1px solid #2C303B", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
        <Stat label="Invested (active)" value={fmtMoney(portfolioTotals.invested)} />
        <Stat label="Potential profit" value={`${portfolioTotals.potentialRaw >= 0 ? "+" : ""}${fmtMoney(portfolioTotals.potentialRaw)}`} color={portfolioTotals.potentialRaw >= 0 ? "#4E8B6B" : "#B4472E"} />
        <Stat label="Realised profit (all time)" value={`${portfolioTotals.realised >= 0 ? "+" : ""}${fmtMoney(portfolioTotals.realised)}`} color={portfolioTotals.realised >= 0 ? "#4E8B6B" : "#B4472E"} />
        <Stat label="Overall ROI" value={fmtPct(portfolioTotals.overallROI)} color={portfolioTotals.overallROI >= 0 ? "#4E8B6B" : "#B4472E"} />
      </div>

      <AskCardSight suggestions={cardSightSuggestions} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <DashCard title="⚡ Needs your attention" onViewAll={() => setTab("portfolio")} count={actionItems.length}>
          {actionItems.length === 0 ? (
            <EmptyRow text="Nothing flagged to sell or grade right now." />
          ) : (
            actionItems.map((c) => {
              const style = SELL_DECISION_STYLE[c.sellDecision] || SELL_DECISION_STYLE[""];
              return (
                <DashRow key={c.id} onClick={() => setTab(c.sport === "Pokémon" ? "pokemon" : "portfolio")}>
                  <span style={{ fontWeight: 600 }}>{c.player}</span>
                  <span className="mono" style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 999, background: `${style.color}22`, color: style.color }}>{style.label}</span>
                </DashRow>
              );
            })
          )}
        </DashCard>

        <DashCard title="🎯 Ready to buy" onViewAll={() => setTab("buy")} count={readyToBuy.length}>
          {readyToBuy.length === 0 ? (
            <EmptyRow text="No pending BUY calls in your watch list." />
          ) : (
            readyToBuy.slice(0, 5).map((t) => (
              <DashRow key={t.id} onClick={() => setTab("buy")}>
                <span style={{ fontWeight: 600 }}>{t.player || "Unnamed"}</span>
                <span className="mono" style={{ fontSize: 10.5, color: "#C9A227" }}>{fmtMoney(t.maxSnipeBid)} ceiling</span>
              </DashRow>
            ))
          )}
        </DashCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <DashCard title="🔨 Bids placed" onViewAll={() => setTab("buy")} count={bidsPlaced.length}>
          {bidsPlaced.length === 0 ? (
            <EmptyRow text="No active bids right now." />
          ) : (
            bidsPlaced.slice(0, 5).map((t) => (
              <DashRow key={t.id} onClick={() => setTab("buy")}>
                <span style={{ fontWeight: 600 }}>{t.player || "Unnamed"}</span>
                <span className="mono" style={{ fontSize: 10.5, color: t.alreadyOverMax ? "#B4472E" : "#4E8B6B" }}>
                  {fmtMoney(Number(t.paidAmount) || 0)} bid{t.alreadyOverMax ? " — over ceiling" : ""}
                </span>
              </DashRow>
            ))
          )}
        </DashCard>
        <DashCard title="🎯 Monthly Targets" onViewAll={() => setTab("targets")} count={targets.filter((t) => t.status === "Watching").length}>
          {avgConfidence != null && (
            <div style={{ fontSize: 11.5, color: "#8B90A0", marginBottom: 8 }}>Avg confidence: <span style={{ color: confidenceColor(avgConfidence), fontWeight: 700 }}>{avgConfidence}</span></div>
          )}
          {topTargets.length === 0 ? (
            <EmptyRow text="No targets currently being watched." />
          ) : (
            topTargets.map((t) => (
              <DashRow key={t.id} onClick={() => setTab("targets")}>
                <span style={{ fontWeight: 600 }}>{t.player}</span>
                <span className="mono" style={{ fontSize: 10.5, color: confidenceColor(computeConfidence(t)) }}>{computeConfidence(t)}</span>
              </DashRow>
            ))
          )}
        </DashCard>

        <DashCard title="📦 Box Breaks" onViewAll={() => setTab("boxbreaks")} count={boxTotalsAll.active}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <MiniStat label="Active breaks" value={boxTotalsAll.active} />
            <MiniStat label="Total profit" value={`${boxTotalsAll.totalProfit >= 0 ? "+" : ""}${fmtMoney(boxTotalsAll.totalProfit)}`} color={boxTotalsAll.totalProfit >= 0 ? "#4E8B6B" : "#B4472E"} emphasis />
          </div>
        </DashCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <DashCard title="💰 My Sales" onViewAll={() => setTab("sales")} count={listedItems.length}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <MiniStat label="Currently listed" value={listedItems.length} />
            <MiniStat label="Realised profit" value={`${recentRealised >= 0 ? "+" : ""}${fmtMoney(recentRealised)}`} color={recentRealised >= 0 ? "#4E8B6B" : "#B4472E"} emphasis />
          </div>
        </DashCard>

        <DashCard title="🎥 Content Plan" onViewAll={() => setTab("content")} count={contentPlan.length}>
          <div style={{ fontSize: 13, marginBottom: 6 }}>
            <span className="oswald" style={{ fontWeight: 700, color: goalHit ? "#4E8B6B" : "#C9A227" }}>{postedInPeriod} / {contentGoal.count}</span>
            <span style={{ color: "#8B90A0", marginLeft: 6 }}>posted this {contentGoal.period}</span>
          </div>
          <div style={{ fontSize: 11.5, color: "#6B7180" }}>{contentPlan.length} item{contentPlan.length === 1 ? "" : "s"} in the pipeline</div>
        </DashCard>
      </div>
    </div>
  );
}

function DashCard({ title, count, onViewAll, children }) {
  return (
    <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "16px 18px", background: "#191B22" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div className="oswald" style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        <button className="btnSecondary" style={{ fontSize: 11, padding: "4px 10px" }} onClick={onViewAll}>
          View all{count != null ? ` (${count})` : ""}
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{children}</div>
    </div>
  );
}

function DashRow({ children, onClick }) {
  return (
    <div onClick={onClick} className="cardRow" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", borderRadius: 6, cursor: "pointer", fontSize: 12.5 }}>
      {children}
    </div>
  );
}

function EmptyRow({ text }) {
  return <div style={{ fontSize: 12, color: "#5C6270", padding: "6px 8px" }}>{text}</div>;
}
