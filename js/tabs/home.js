// ===== Home / Dashboard =====

function Home({ cards, pokemonCards, targets, boxBreaks, salesItems, buyList, contentPlan, contentGoal, setTab, onUpdateCard }) {
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

      <TargetAlertsBanner targets={targets} setTab={setTab} />

      <ListingCheckup cards={cards} pokemonCards={pokemonCards} setTab={setTab} onUpdateCard={onUpdateCard} />

      <PriceMoves cards={cards} pokemonCards={pokemonCards} setTab={setTab} />

      <AgingStock cards={cards} pokemonCards={pokemonCards} setTab={setTab} />

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

// ===== Aging stock =====
// Cards that have sat unsold the longest, how much money they tie up, and what to do with them.

const AGE_BUCKETS = [
  { label: "Under 30 days", min: 0, max: 30, color: "#4E8B6B" },
  { label: "30–60 days", min: 30, max: 60, color: "#5C7A99" },
  { label: "60–90 days", min: 60, max: 90, color: "#C9A227" },
  { label: "90+ days", min: 90, max: Infinity, color: "#B4472E" },
];
const AGING_DAYS = 60;

function daysHeld(card) {
  if (!card.datePurchased) return null;
  const d = new Date(card.datePurchased);
  return isNaN(d.getTime()) ? null : Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}

// Today's market value for the version of the card you hold.
function currentMarketValue(card) {
  const g = String(card.grade || "").toLowerCase();
  if (card.status === "Graded" || card.grade) {
    if (PSA10_GRADES.includes(g)) return card.psa10Avg ?? null;
    if (PSA9_GRADES.includes(g)) return card.psa9Avg ?? null;
    return null;
  }
  return card.rawAvg ?? null;
}

function agingAdvice(card) {
  const value = currentMarketValue(card);
  const fees = card.feesPct || 0.13;
  const breakEven = card.totalCost / (1 - fees);
  const trend = card.priceTrend ? trendChangePct(card.priceTrend.points) : null;
  const falling = trend != null && trend <= -0.05;
  if (card.status === "Listed") return { text: "Already listed — see the Listing check-up for what to do next", color: "#5C7A99" };
  if (value == null) return { text: "No market value — update its comps to decide", color: "#6B7180" };
  const profit = value * (1 - fees) - card.totalCost;
  if (profit > 0) {
    return { text: `Sell now at ~${fmtMoney(value)} — still ${fmtMoney(profit)} profit${falling ? ", and prices are falling" : ""}`, color: "#4E8B6B" };
  }
  if (falling) return { text: `Prices falling — cut it: list near ${fmtMoney(value)} (break-even ${fmtMoney(breakEven)})`, color: "#B4472E" };
  return { text: `Below break-even (${fmtMoney(breakEven)}) — bundle it or move it at a card show`, color: "#C9A227" };
}

function AgingStock({ cards, pokemonCards, setTab }) {
  const held = useMemo(
    () =>
      [...cards.map(computeCard), ...pokemonCards.map(computePokemonCard)]
        .filter((c) => c.status === "Raw" || c.status === "Graded" || c.status === "Listed")
        .map((c) => ({ ...c, _days: daysHeld(c) })),
    [cards, pokemonCards]
  );
  const qty = (c) => Number(c.quantity) || 1;
  const dated = held.filter((c) => c._days != null);
  if (!dated.length) return null;

  const buckets = AGE_BUCKETS.map((b) => {
    const inBucket = dated.filter((c) => c._days >= b.min && c._days < b.max);
    return { ...b, count: inBucket.reduce((s, c) => s + qty(c), 0), capital: inBucket.reduce((s, c) => s + c.totalCost * qty(c), 0) };
  });
  const old = dated.filter((c) => c._days >= AGING_DAYS).sort((a, b) => b._days - a._days);
  const tiedUp = old.reduce((s, c) => s + c.totalCost * qty(c), 0);

  return (
    <div style={{ marginBottom: 16 }}>
      <DashCard title="⏳ Aging stock" onViewAll={() => setTab("portfolio")} count={old.length}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 6 }}>
          {buckets.map((b) => (
            <MiniStat key={b.label} label={`${b.label} · ${b.count}`} value={fmtMoney(b.capital)} color={b.count ? b.color : undefined} />
          ))}
        </div>
        {old.length === 0 ? (
          <EmptyRow text={`Nothing held longer than ${AGING_DAYS} days — stock is turning over well.`} />
        ) : (
          <>
            <div style={{ fontSize: 11.5, color: "#8B90A0", margin: "2px 0 4px" }}>
              {fmtMoney(tiedUp)} tied up in {old.length} card{old.length === 1 ? "" : "s"} held {AGING_DAYS}+ days. Oldest first:
            </div>
            {old.slice(0, 6).map((c) => {
              const advice = agingAdvice(c);
              return (
                <DashRow key={c.id} onClick={() => setTab(c.sport === "Pokémon" ? "pokemon" : "portfolio")}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ fontWeight: 600 }}>{c.player}</span>
                    <span style={{ color: "#6B7180", marginLeft: 6 }}>
                      {c._days}d · cost {fmtMoney(c.totalCost)}
                      {c.status === "Listed" ? " · listed" : ""}
                    </span>
                    <div style={{ fontSize: 11, color: advice.color }}>{advice.text}</div>
                  </span>
                </DashRow>
              );
            })}
          </>
        )}
      </DashCard>
    </div>
  );
}

// ===== Price moves =====
// Cards whose value moved 10%+ between their last two comps updates, with where that leaves you
// against break-even and the 12-week trend when one was saved. A "have a look" list, not a sell
// signal — a dip can recover, a lasting slide usually doesn't.

const PRICE_MOVE_PCT = 0.1;
const PRICE_MOVE_MAX_AGE_DAYS = 60;

// The value history for the version of the card you hold.
function heldTier(c) {
  const g = String(c.grade || "").toLowerCase();
  if (c.status === "Graded" || c.grade) {
    if (PSA10_GRADES.includes(g)) return { label: c.grade, history: c.psa10History, breakEven: c.psa10BE };
    if (PSA9_GRADES.includes(g)) return { label: c.grade, history: c.psa9History, breakEven: c.psa9BE };
    return null;
  }
  return { label: "Raw", history: c.rawHistory, breakEven: c.rawBE };
}

function priceMoveFor(c) {
  const tier = heldTier(c);
  const points = ((tier && tier.history) || []).filter((p) => p && Number(p.value) > 0);
  if (points.length < 2) return null;
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const age = (Date.now() - new Date(last.date).getTime()) / 86400000;
  if (!(age <= PRICE_MOVE_MAX_AGE_DAYS)) return null;
  const change = (last.value - prev.value) / prev.value;
  if (Math.abs(change) < PRICE_MOVE_PCT) return null;
  const fees = c.feesPct || 0.13;
  const profit = last.value * (1 - fees) - c.totalCost;
  const trend = c.priceTrend && c.priceTrend.points ? trendChangePct(c.priceTrend.points) : null;
  return { card: c, tier, last, prev, change, profit, trend };
}

function priceMoveAdvice(m) {
  const { change, profit, trend } = m;
  const trendSays = trend == null ? null : trend <= -0.05 ? "down" : trend >= 0.05 ? "up" : "flat";
  if (change > 0) {
    if (profit > 0) return { color: "#4E8B6B", text: `Now ${fmtMoney(profit)} profit if sold${trendSays === "up" ? " and still climbing" : ""} — a good time to list.` };
    return { color: "#8B90A0", text: `Recovering — still ${fmtMoney(-profit)} below break-even (${fmtMoney(m.tier.breakEven)}).` };
  }
  const where = profit >= 0 ? `still ${fmtMoney(profit)} above break-even` : `now ${fmtMoney(-profit)} below break-even (${fmtMoney(m.tier.breakEven)})`;
  if (trendSays === "down") return { color: "#B4472E", text: `${where[0].toUpperCase()}${where.slice(1)}. The 12-week trend is down too — looks like a lasting slide, not a one-off dip.` };
  if (trendSays === "up" || trendSays === "flat") return { color: "#C9A227", text: `${where[0].toUpperCase()}${where.slice(1)}. The 12-week trend is ${trendSays}, so this may just be a dip.` };
  return { color: "#C9A227", text: `${where[0].toUpperCase()}${where.slice(1)}. Check recent sales to see if it's a dip or a slide.` };
}

function PriceMoves({ cards, pokemonCards, setTab }) {
  const moves = useMemo(
    () =>
      [...cards.map((c) => ({ ...computeCard(c), _tab: "portfolio" })), ...pokemonCards.map((c) => ({ ...computePokemonCard(c), _tab: "pokemon" }))]
        .filter((c) => c.status === "Raw" || c.status === "Graded")
        .map(priceMoveFor)
        .filter(Boolean)
        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change)),
    [cards, pokemonCards]
  );
  const ups = moves.filter((m) => m.change > 0).length;

  return (
    <div style={{ marginBottom: 16 }}>
      <DashCard title="📊 Price moves" onViewAll={() => setTab("portfolio")} count={moves.length}>
        <div style={{ fontSize: 11, color: "#6B7180", marginBottom: 2 }}>
          Cards whose value moved {Math.round(PRICE_MOVE_PCT * 100)}%+ between their last two comps updates (last {PRICE_MOVE_MAX_AGE_DAYS} days).
          {moves.length > 0 && ` ${ups} up · ${moves.length - ups} down.`} Something to review, not an automatic sell.
        </div>
        {moves.length === 0 ? (
          <EmptyRow text="No big moves. Keep comps fresh with Update all comps (the coloured day tags show which cards are behind)." />
        ) : (
          moves.slice(0, 8).map((m) => {
            const advice = priceMoveAdvice(m);
            const up = m.change > 0;
            return (
              <DashRow key={`${m.card._tab}-${m.card.id}`} onClick={() => setTab(m.card._tab)}>
                <span style={{ minWidth: 0 }}>
                  <span style={{ fontWeight: 600 }}>{m.card.player}</span>
                  <span style={{ color: "#6B7180", marginLeft: 6 }}>
                    {m.tier.label} · {fmtMoney(m.prev.value)} → {fmtMoney(m.last.value)}
                  </span>
                  <span className="mono" style={{ marginLeft: 6, fontWeight: 700, color: up ? "#4E8B6B" : "#B4472E" }}>
                    {up ? "▲" : "▼"} {Math.round(Math.abs(m.change) * 100)}%
                  </span>
                  <div style={{ fontSize: 11, color: advice.color }}>{advice.text}</div>
                </span>
              </DashRow>
            );
          })
        )}
      </DashCard>
    </div>
  );
}

// ===== Listing check-up =====
// What to do with listings that haven't sold, by days since listing (or since the last price
// cut / relist): check comps at 14 days, cut 5–10% at 21, relist at 30, and stop cutting once
// the price reaches break-even. Price cuts are kept so you can see how far cards came down.

const LISTING_STEPS = { check: 14, cut: 21, relist: 30, stop: 45 };
const LISTING_CUT_PCT = 0.07;
const LISTING_OVERPRICED_PCT = 0.1;
const CHEAP_CARD_COST = 15;

function daysSince(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}

// Whole dollars from $20 up, 50c steps below — rounded up, so a price never lands under break-even.
function niceListPrice(v) {
  return v >= 20 ? Math.ceil(v) : Math.ceil(v * 2) / 2;
}

function listingCheck(c) {
  const totalDays = daysSince(c.dateListed);
  if (totalDays == null) return { card: c, stage: "noDate", priority: 1, color: "#8B90A0", text: "No listing date saved — enter when you listed it." };
  const stepDays = daysSince(c.lastListingActionAt) ?? totalDays;
  const fees = c.feesPct || 0.13;
  const tier = heldTier(c);
  const breakEven = tier && tier.breakEven != null ? tier.breakEven : c.totalCost / (1 - fees);
  const price = Number(c.listedPrice) || null;
  const value = currentMarketValue(c);
  const compsAge = compsAgeDays(c);
  const trend = c.priceTrend && c.priceTrend.points ? trendChangePct(c.priceTrend.points) : null;
  const falling = trend != null && trend <= -0.05;
  const ebay = !c.sellingMethod || /ebay/i.test(c.sellingMethod);
  const atFloor = price != null && price <= breakEven * 1.02;
  const base = { card: c, totalDays, stepDays, price, value, breakEven, compsAge };
  const step = (stage, priority, color, text, suggested) => ({ ...base, stage, priority, color, text, suggested: suggested != null && suggested < price ? suggested : null });

  if (stepDays < LISTING_STEPS.check) return { ...base, stage: "fresh", priority: 9 };
  if (price == null) return step("noPrice", 2, "#C9A227", "Add the price it's listed at so the check-up can suggest cuts.");
  if (value == null || compsAge == null || compsAge >= STALE_COMPS_DAYS) {
    return step("comps", 3, "#C9A227", `Update its comps before changing the price — ${compsAge == null ? "it has none saved" : `they're ${compsAge} days old`}.`);
  }

  const floorPrice = niceListPrice(breakEven);
  if (price > value * (1 + LISTING_OVERPRICED_PCT) && !atFloor) {
    const target = Math.max(niceListPrice(value), floorPrice);
    const pct = Math.round((price / value - 1) * 100);
    return step("over", 2, "#B4472E", `Listed ${pct}% above comps (${fmtMoney(value)}). Lower it to ${fmtMoney(target)}${target > value ? " — your break-even, the lowest to go" : ""}.`, target);
  }

  if (atFloor) {
    if (totalDays >= LISTING_STEPS.stop) {
      if (falling && c.totalCost < CHEAP_CARD_COST) {
        return step("stop", 2, "#B4472E", `At break-even after ${totalDays} days and prices are falling. It's a cheap card — fine to drop to ${fmtMoney(value)} to get the cash back, or add it to a lot.`, niceListPrice(value));
      }
      return step("stop", 3, "#B4472E", `At break-even after ${totalDays} days — stop cutting. Take it down and hold, add it to a team lot, or try ${ebay ? "Facebook or Instagram" : "eBay"}.`);
    }
    if (stepDays >= LISTING_STEPS.relist) {
      return step("relist", 4, "#5C7A99", ebay ? `At break-even with no room to cut — end it and relist with Sell similar for a fresh run in search.` : `At break-even with no room to cut — repost or bump it.`);
    }
    return step("hold", 6, "#8B90A0", `Already at break-even (${fmtMoney(breakEven)}) — leave the price. Relist at ${LISTING_STEPS.relist} days if it hasn't sold.`);
  }

  if (stepDays >= LISTING_STEPS.relist) {
    return step("relist", 4, "#5C7A99", ebay ? `Up ${stepDays} days at a fair price — end it and relist with Sell similar. New listings get more search visibility.` : `Up ${stepDays} days at a fair price — repost or bump it.`);
  }
  if (stepDays >= LISTING_STEPS.cut) {
    const target = Math.max(niceListPrice(price * (1 - LISTING_CUT_PCT)), floorPrice);
    return step("cut", 3, "#C9A227", `Priced near comps (${fmtMoney(value)}) but no sale in ${stepDays} days — lower to ${fmtMoney(target)}${ebay ? ", or send watchers an offer at that price" : ""}.`, target);
  }
  return step("watch", 5, "#4E8B6B", `Priced at market (comps ${fmtMoney(value)}). Give it until day ${LISTING_STEPS.cut}${ebay ? " — if it has watchers, send them an offer" : ""}.`);
}

function listingCutSummary(c) {
  const cuts = (c.listingActions || []).filter((a) => a.type === "cut");
  if (!cuts.length) return null;
  const first = Number(cuts[0].from);
  const now = Number(c.listedPrice);
  if (!(first > 0) || !(now > 0)) return null;
  return `Cut ${cuts.length}× from ${fmtMoney(first)} (−${Math.round((1 - now / first) * 100)}%)`;
}

// How your sales compare with the price you first listed at.
function firstListPriceStats(soldCards) {
  const rows = soldCards
    .filter((c) => Number(c.actualSellPrice) > 0 && Number(c.listedPrice) > 0 && c.dateListed && c.dateSold)
    .map((c) => {
      const firstCut = (c.listingActions || []).find((a) => a.type === "cut");
      const first = Number(firstCut ? firstCut.from : c.listedPrice);
      const days = (new Date(c.dateSold) - new Date(c.dateListed)) / 86400000;
      return { date: c.dateSold, ratio: Number(c.actualSellPrice) / first, days };
    })
    .filter((r) => r.ratio > 0 && r.days >= 0)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 10);
  if (rows.length < 3) return null;
  return {
    count: rows.length,
    ratio: rows.reduce((s, r) => s + r.ratio, 0) / rows.length,
    days: Math.round(rows.reduce((s, r) => s + r.days, 0) / rows.length),
  };
}

function ListingDaysBox({ days }) {
  const style = days < LISTING_STEPS.check ? COMPS_AGE_STYLE.fresh : days < LISTING_STEPS.relist ? COMPS_AGE_STYLE.aging : COMPS_AGE_STYLE.stale;
  return (
    <span style={{ ...style, fontSize: 9.5, fontWeight: 600, padding: "1px 6px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.3px", whiteSpace: "nowrap", marginLeft: 8 }}>
      {days === 0 ? "Today" : `${days} day${days === 1 ? "" : "s"}`}
    </span>
  );
}

function ListingCheckRow({ check, onUpdateCard, setTab }) {
  const c = check.card;
  const [editing, setEditing] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [listedOn, setListedOn] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const actions = c.listingActions || [];
  const btn = { fontSize: 11, padding: "3px 9px" };

  function lowerTo(p) {
    const to = Number(p);
    if (!(to > 0)) return;
    onUpdateCard(c.id, { listedPrice: to, lastListingActionAt: today, listingActions: [...actions, { date: today, type: "cut", from: check.price, to }] });
    setEditing(false);
    setNewPrice("");
  }
  function relisted() {
    onUpdateCard(c.id, { lastListingActionAt: today, listingActions: [...actions, { date: today, type: "relist", price: check.price }] });
  }
  function takeDown() {
    onUpdateCard(c.id, { status: c.grade ? "Graded" : "Raw", dateListed: null, lastListingActionAt: null, listingActions: [...actions, { date: today, type: "down", price: check.price }] });
  }

  const cutSummary = listingCutSummary(c);
  const belowFloor = check.price != null && check.breakEven != null && check.price < check.breakEven * 0.98;

  return (
    <div className="cardRow" style={{ padding: "8px", borderRadius: 6, fontSize: 12.5 }}>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <span style={{ fontWeight: 600, cursor: "pointer" }} onClick={() => setTab(c._tab)}>{c.player}</span>
        {c.grade && <span style={{ color: "#6B7180", marginLeft: 6 }}>{c.grade}</span>}
        {check.totalDays != null && <ListingDaysBox days={check.totalDays} />}
      </div>
      {check.stage !== "noDate" && (
        <div style={{ fontSize: 11.5, color: "#8B90A0", marginTop: 2 }}>
          {check.price != null ? `Listed ${fmtMoney(check.price)}` : "No list price"}
          {check.value != null && ` · comps ${fmtMoney(check.value)}`}
          {check.breakEven != null && <> · break-even <span style={{ color: belowFloor ? "#B4472E" : undefined }}>{fmtMoney(check.breakEven)}</span></>}
          {cutSummary && ` · ${cutSummary}`}
          {check.stepDays !== check.totalDays && ` · ${check.stepDays}d since last change`}
        </div>
      )}
      <div style={{ fontSize: 11.5, color: check.color, marginTop: 3 }}>{check.text}</div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6, alignItems: "center" }}>
        {check.stage === "noDate" ? (
          <>
            <input type="date" value={listedOn} max={today} onChange={(e) => setListedOn(e.target.value)} style={{ fontSize: 11.5, padding: "3px 6px", width: 140 }} />
            <button type="button" className="btnSecondary" style={btn} disabled={!listedOn} onClick={() => onUpdateCard(c.id, { dateListed: listedOn })}>Save date</button>
            <button type="button" className="btnSecondary" style={btn} onClick={() => onUpdateCard(c.id, { dateListed: today })}>Start from today</button>
          </>
        ) : (
          <>
            {check.suggested != null && (
              <button type="button" className="btnSecondary" style={{ ...btn, borderColor: "#C9A22766", color: "#C9A227" }} onClick={() => lowerTo(check.suggested)}>
                Lower to {fmtMoney(check.suggested)}
              </button>
            )}
            {editing ? (
              <>
                <input type="number" step="0.01" min="0" autoFocus placeholder="New price" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lowerTo(newPrice)} style={{ fontSize: 11.5, padding: "3px 6px", width: 90 }} />
                <button type="button" className="btnSecondary" style={btn} disabled={!(Number(newPrice) > 0)} onClick={() => lowerTo(newPrice)}>Save</button>
                <button type="button" className="btnSecondary" style={btn} onClick={() => setEditing(false)}>Cancel</button>
              </>
            ) : (
              <button type="button" className="btnSecondary" style={btn} onClick={() => setEditing(true)}>{check.price != null ? "Other price" : "Add price"}</button>
            )}
            {check.price != null && (
              <button type="button" className="btnSecondary" style={btn} title="Resets the day count for the next step" onClick={relisted}>
                {check.stage === "relist" ? "✓ " : ""}Relisted
              </button>
            )}
            <button type="button" className="btnSecondary" style={btn} title={`Moves it back to ${c.grade ? "Graded" : "Raw"}`} onClick={takeDown}>Take down</button>
          </>
        )}
      </div>
      {check.price != null && check.breakEven != null && editing && Number(newPrice) > 0 && Number(newPrice) < check.breakEven && (
        <div style={{ fontSize: 11, color: "#B4472E", marginTop: 4 }}>That's below break-even ({fmtMoney(check.breakEven)}) — you'd lose money after fees.</div>
      )}
    </div>
  );
}

function ListingCheckup({ cards, pokemonCards, setTab, onUpdateCard }) {
  const all = useMemo(
    () => [...cards.map((c) => ({ ...computeCard(c), _tab: "portfolio" })), ...pokemonCards.map((c) => ({ ...computePokemonCard(c), _tab: "pokemon" }))],
    [cards, pokemonCards]
  );
  const checks = useMemo(() => all.filter((c) => c.status === "Listed").map(listingCheck), [all]);
  const stats = useMemo(() => firstListPriceStats(all.filter((c) => c.status === "Sold")), [all]);
  if (!checks.length) return null;

  const fresh = checks.filter((k) => k.stage === "fresh");
  const due = checks.filter((k) => k.stage !== "fresh").sort((a, b) => a.priority - b.priority || (b.stepDays || 0) - (a.stepDays || 0));

  return (
    <div style={{ marginBottom: 16 }}>
      <DashCard title="🏷️ Listing check-up" onViewAll={() => setTab("sales")} count={checks.length}>
        <div style={{ fontSize: 11, color: "#6B7180", marginBottom: 2 }}>
          {checks.length} listed · {due.length} to look at. Check comps at {LISTING_STEPS.check} days, cut 5–10% at {LISTING_STEPS.cut}, relist at {LISTING_STEPS.relist} — never below break-even.
        </div>
        {stats && (
          <div style={{ fontSize: 11.5, color: "#8B90A0", marginBottom: 2 }}>
            Your last {stats.count} sales went for <b style={{ color: stats.ratio < 0.9 ? "#C9A227" : "#4E8B6B" }}>{Math.round(stats.ratio * 100)}%</b> of the first list price, after {stats.days} days listed on average.
            {stats.ratio < 0.9 && " First prices may be set a bit high."}
          </div>
        )}
        {due.length === 0 ? (
          <EmptyRow text={`Nothing due — all listings are under ${LISTING_STEPS.check} days since listing or the last change.`} />
        ) : (
          due.slice(0, 10).map((k) => <ListingCheckRow key={`${k.card._tab}-${k.card.id}`} check={k} onUpdateCard={onUpdateCard} setTab={setTab} />)
        )}
        {due.length > 10 && <div style={{ fontSize: 11, color: "#6B7180" }}>+ {due.length - 10} more</div>}
        {fresh.length > 0 && due.length > 0 && (
          <div style={{ fontSize: 11, color: "#5C6270", padding: "2px 8px" }}>
            {fresh.length} newer listing{fresh.length === 1 ? "" : "s"} — nothing to do yet.
          </div>
        )}
      </DashCard>
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
