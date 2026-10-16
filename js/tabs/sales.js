// ===== My Sales =====

function SalesRow({ item, onClick }) {
  const isListed = item.status === "Listed";
  const statusColor = isListed ? "#2FA89A" : "#4E8B6B";
  const priceValue = isListed ? Number(item.listedPrice) || 0 : Number(item.actualSellPrice) || 0;
  const hasActualFees = item.actualFeesPaid != null && item.actualFeesPaid !== "";
  const suggestedFee = estimateSellingFee(item.sellingMethod, priceValue);
  const feeUsed = hasActualFees ? Number(item.actualFeesPaid) : suggestedFee != null ? suggestedFee : priceValue * item.feesPct;
  const profit = isListed
    ? item.listedPrice
      ? priceValue - feeUsed - (Number(item.consignmentShipping) || 0) - item.totalCost
      : null
    : item.realisedProfit;

  return (
    <div
      onClick={onClick}
      className="cardRow"
      style={{ display: "grid", gridTemplateColumns: "2fr 80px 80px 80px 90px 90px 24px", padding: "8px 14px", borderTop: "1px solid #24272F", cursor: "pointer", alignItems: "center", fontSize: 12.5 }}
    >
      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        <span style={{ fontWeight: 600 }}>{item.player}</span>
        <span style={{ color: "#6B7180", marginLeft: 6 }}>{item.card}{item.cardNum ? ` ${item.cardNum}` : ""}</span>
        {item.sport && <span className="mono" style={{ fontSize: 9.5, color: "#6B7180", marginLeft: 6 }}>{SPORT_EMOJI[item.sport] || "🎴"}</span>}
        {item.sellingMethod && <span className="mono" style={{ fontSize: 9.5, color: "#5C7A99", marginLeft: 6 }}>via {item.sellingMethod}</span>}
        {isListed && daysSince(item.dateListed) != null && <ListingDaysBox days={daysSince(item.dateListed)} />}
        {item.listingUrl && (
          <a
            href={item.listingUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ fontSize: 10, color: "#2FA89A", marginLeft: 8, textDecoration: "none" }}
          >
            Link ↗
          </a>
        )}
      </div>
      <span className="mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: `${statusColor}22`, color: statusColor, fontWeight: 600, justifySelf: "start" }}>
        {item.status}
      </span>
      <div style={{ color: "#8B90A0" }}>{fmtMoney(item.totalCost)}</div>
      <div style={{ color: "#2FA89A" }}>{item.listedPrice ? fmtMoney(item.listedPrice) : "—"}</div>
      <div>{isListed ? "—" : priceValue ? fmtMoney(priceValue) : "—"}</div>
      <div style={{ color: profit == null ? "#6B7180" : profit >= 0 ? "#4E8B6B" : "#B4472E", fontWeight: 600 }}>
        {profit != null ? fmtMoney(profit) : "—"}
      </div>
      <ChevronRight size={14} style={{ color: "#5C6270" }} />
    </div>
  );
}

function SalesDetailModal({ item, onClose, onUpdate, onDelete }) {
  const isListed = item.status === "Listed";
  const isSold = item.status === "Sold";

  // Local state for editable title & description
  const [playerTitle, setPlayerTitle] = useState(item.player || "");
  const [cardDesc, setCardDesc] = useState(item.card || "");

  const suggestedFee = estimateSellingFee(item.sellingMethod, isListed ? item.listedPrice : item.actualSellPrice);
  const hasActualFees = item.actualFeesPaid != null && item.actualFeesPaid !== "";
  const listedFeeEstimate = hasActualFees ? Number(item.actualFeesPaid) : suggestedFee != null ? suggestedFee : item.listedPrice ? item.listedPrice * item.feesPct : null;
  const listedProfit = item.listedPrice
    ? item.listedPrice - (listedFeeEstimate ?? 0) - (Number(item.consignmentShipping) || 0) - item.totalCost
    : null;

  function applySuggestedFee() {
    if (suggestedFee != null) onUpdate(item._source, item.id, { actualFeesPaid: Number(suggestedFee.toFixed(2)) });
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title="Edit Sales Item Details" onClose={onClose} />

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
          {/* Editable Item Title / Player */}
          <Field label="Item Title / Player">
            <input
              value={playerTitle}
              onChange={(e) => {
                setPlayerTitle(e.target.value);
                onUpdate(item._source, item.id, { player: e.target.value });
              }}
              placeholder="e.g. Elly De La Cruz"
            />
          </Field>

          {/* Editable Card / Description */}
          <Field label="Description / Set Details">
            <input
              value={cardDesc}
              onChange={(e) => {
                setCardDesc(e.target.value);
                onUpdate(item._source, item.id, { card: e.target.value });
              }}
              placeholder="e.g. 2024 Topps Heritage #473"
            />
          </Field>

          <Field label="Status">
            <select value={item.status} onChange={(e) => onUpdate(item._source, item.id, { status: e.target.value })}>
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Listing Link (eBay / Store)">
            <input
              placeholder="https://www.ebay.com.au/itm/..."
              value={item.listingUrl || ""}
              onChange={(e) => onUpdate(item._source, item.id, { listingUrl: e.target.value })}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <MiniStat label="Cost basis" value={fmtMoney(item.totalCost)} />
            {isListed && (
              <Field label={sellsInUsd(item) ? "Listed price (A$)" : "Listed price"}>
                <input
                  type="number"
                  step="0.01"
                  value={item.listedPrice ?? ""}
                  onChange={(e) => onUpdate(item._source, item.id, { listedPrice: e.target.value === "" ? null : Number(e.target.value) })}
                />
                {sellsInUsd(item) && Number(item.listedPrice) > 0 && (
                  <div style={{ fontSize: 11, color: "#C9A227", marginTop: 4 }}>= {fmtUsd(audToUsd(item.listedPrice))} on ShipMyCards (US$)</div>
                )}
              </Field>
            )}
            {(isListed || isSold) && (
              <Field label="Date listed">
                <input
                  type="date"
                  value={item.dateListed || ""}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => onUpdate(item._source, item.id, { dateListed: e.target.value || null })}
                />
              </Field>
            )}
            {isSold && (
              <Field label="Sold price">
                <input
                  type="number"
                  step="0.01"
                  value={item.actualSellPrice ?? ""}
                  onChange={(e) => onUpdate(item._source, item.id, { actualSellPrice: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </Field>
            )}
          </div>

          <SectionTitle>How it was / will be sold</SectionTitle>

          <Field label="Selling method">
            <select value={item.sellingMethod || ""} onChange={(e) => onUpdate(item._source, item.id, { sellingMethod: e.target.value })}>
              <option value="">— not set —</option>
              {SELLING_METHOD_OPTIONS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>

          <Field label="Shipping to consignment/selling location">
            <input
              type="number"
              step="0.01"
              placeholder="e.g. SMC → PC Sportscards cost"
              value={item.consignmentShipping ?? ""}
              onChange={(e) => onUpdate(item._source, item.id, { consignmentShipping: e.target.value === "" ? "" : Number(e.target.value) })}
            />
          </Field>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <label style={{ marginBottom: 0 }}>Actual fees paid ($)</label>
              {suggestedFee != null && (
                <button
                  type="button"
                  onClick={applySuggestedFee}
                  style={{ background: "transparent", border: "none", color: "#C9A227", fontSize: 11, cursor: "pointer", padding: 0 }}
                >
                  Use estimate: {fmtMoney(suggestedFee)}
                </button>
              )}
            </div>
            <input
              type="number"
              step="0.01"
              placeholder={suggestedFee != null ? `~${suggestedFee.toFixed(2)} estimated` : "Enter actual fee"}
              value={item.actualFeesPaid ?? ""}
              onChange={(e) => onUpdate(item._source, item.id, { actualFeesPaid: e.target.value === "" ? "" : Number(e.target.value) })}
            />
          </div>

          {isListed && (
            <MiniStat
              label="Est. profit if sold"
              value={listedProfit != null ? fmtMoney(listedProfit) : "—"}
              color={listedProfit != null && listedProfit >= 0 ? "#4E8B6B" : "#B4472E"}
              emphasis
            />
          )}
          {isSold && (
            <MiniStat label="Realised profit" value={fmtMoney(item.realisedProfit)} color={item.realisedProfit >= 0 ? "#4E8B6B" : "#B4472E"} emphasis />
          )}

          <button
            onClick={() => {
              onDelete(item._source, item.id);
              onClose();
            }}
            style={{ background: "transparent", border: "1px solid #4a2a24", color: "#B4472E", borderRadius: 8, padding: "9px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}
          >
            <Trash2 size={14} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function AddManualListingModal({ onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [sport, setSport] = useState("MLB");
  const [cost, setCost] = useState("");
  const [listedPrice, setListedPrice] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [sellingMethod, setSellingMethod] = useState("eBay");

  function handleSubmit(e) {
    e.preventDefault();
    const costVal = Number(cost) || 0;
    const listVal = Number(listedPrice) || 0;

    const manualCard = {
      id: crypto.randomUUID(),
      _source: "cards",
      player: title.trim() || "Untracked Item",
      card: details.trim() || "Manual Listing",
      sport,
      status: "Listed",
      // The engine works cost out from `paid`, so the cost basis has to live there.
      paid: costVal,
      totalCost: costVal,
      listedPrice: listVal,
      listingUrl: listingUrl.trim() || null,
      sellingMethod,
      quantity: 1,
      feesPct: 0.137,
      dateListed: new Date().toISOString().slice(0, 10),
    };

    onAdd(manualCard);
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <ModalHeader title="Log Manual Listing" onClose={onClose} />
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
          <Field label="Title / Player">
            <input required placeholder="e.g. 50x Bowman Base Lot or Untracked Card" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>

          <Field label="Description / Set Details (optional)">
            <input placeholder="e.g. 2024 Topps Heritage Chrome / Refractor Lot" value={details} onChange={(e) => setDetails(e.target.value)} />
          </Field>

          <Field label="eBay / Listing Link (optional)">
            <input placeholder="https://www.ebay.com.au/itm/..." value={listingUrl} onChange={(e) => setListingUrl(e.target.value)} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Sport">
              <select value={sport} onChange={(e) => setSport(e.target.value)}>
                {SPORT_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>

            <Field label="Selling Method">
              <input placeholder="e.g. eBay, Facebook, Card Show" value={sellingMethod} onChange={(e) => setSellingMethod(e.target.value)} />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Cost Basis ($)">
              <input type="number" step="0.01" placeholder="0.00" value={cost} onChange={(e) => setCost(e.target.value)} />
            </Field>

            <Field label="Listed Price ($)">
              <input required type="number" step="0.01" placeholder="0.00" value={listedPrice} onChange={(e) => setListedPrice(e.target.value)} />
            </Field>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
            <button type="button" className="btnSecondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btnPrimary">Save Listing</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== Sales performance =====
// Where your profit actually comes from: sold cards grouped by platform or by sport, with real
// fees (where you've entered them), ROI and how long cards took to sell.

function daysBetween(from, to) {
  if (!from || !to) return null;
  const a = new Date(from);
  const b = new Date(to);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
  return Math.max(0, Math.round((b - a) / 86400000));
}

function SalesPerformance({ items }) {
  const [groupBy, setGroupBy] = useState("platform");
  const sold = items.filter((i) => i.status === "Sold" && Number(i.actualSellPrice) > 0);

  const rows = useMemo(() => {
    const groups = {};
    for (const i of sold) {
      const qty = Number(i.quantity) || 1;
      const key = groupBy === "platform" ? i.sellingMethod || "Not set" : i.sport || "Other";
      const g = (groups[key] = groups[key] || { key, count: 0, revenue: 0, fees: 0, cost: 0, profit: 0, days: [], estimatedFees: 0 });
      const price = Number(i.actualSellPrice);
      const fee = saleFeesUsed(i, i.feesPct);
      g.count += qty;
      g.revenue += price * qty;
      g.fees += fee.amount * qty;
      g.cost += (i.totalCost || 0) * qty;
      g.profit += (i.realisedProfit ?? 0) * qty;
      if (fee.source !== "actual") g.estimatedFees += 1;
      const d = daysBetween(i.datePurchased, i.dateSold);
      if (d != null) g.days.push(d);
    }
    return Object.values(groups)
      .map((g) => ({ ...g, roi: g.cost > 0 ? g.profit / g.cost : null, avgDays: g.days.length ? Math.round(g.days.reduce((s, d) => s + d, 0) / g.days.length) : null }))
      .sort((a, b) => b.profit - a.profit);
  }, [sold, groupBy]);

  if (!sold.length) return null;
  const estimated = rows.reduce((s, r) => s + r.estimatedFees, 0);
  const cols = "1.4fr 60px 90px 80px 90px 70px 80px";

  return (
    <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "12px 14px", background: "#191B22", marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <div className="oswald" style={{ fontSize: 15, fontWeight: 600 }}>📊 Sales performance</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["platform", "By platform"], ["sport", "By sport"]].map(([key, label]) => (
            <button key={key} className={`filterBtn ${groupBy === key ? "active" : ""}`} style={{ fontSize: 11.5, padding: "4px 10px" }} onClick={() => setGroupBy(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 560 }}>
          <div style={{ display: "grid", gridTemplateColumns: cols, gap: 8, fontSize: 10.5, color: "#6B7180", textTransform: "uppercase", padding: "0 0 6px" }}>
            <div>{groupBy === "platform" ? "Platform" : "Sport"}</div>
            <div>Sold</div>
            <div>Revenue</div>
            <div>Fees</div>
            <div>Profit</div>
            <div>ROI</div>
            <div>Avg days</div>
          </div>
          {rows.map((r) => (
            <div key={r.key} style={{ display: "grid", gridTemplateColumns: cols, gap: 8, fontSize: 12.5, padding: "6px 0", borderTop: "1px solid #24272F" }}>
              <div style={{ fontWeight: 600 }}>{r.key}</div>
              <div>{r.count}</div>
              <div>{fmtMoney(r.revenue)}</div>
              <div style={{ color: "#8B90A0" }}>{fmtMoney(r.fees)}</div>
              <div style={{ color: r.profit >= 0 ? "#4E8B6B" : "#B4472E", fontWeight: 600 }}>{fmtMoney(r.profit)}</div>
              <div style={{ color: r.roi == null ? "#6B7180" : r.roi >= 0 ? "#4E8B6B" : "#B4472E" }}>{fmtPct(r.roi)}</div>
              <div style={{ color: "#8B90A0" }}>{r.avgDays != null ? `${r.avgDays}d` : "—"}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#6B7180", marginTop: 8, lineHeight: 1.5 }}>
        Avg days = purchase date to sold date.
        {estimated > 0 && ` ${estimated} sale${estimated === 1 ? " uses" : "s use"} estimated fees (the platform's fee formula, or your fee % if no platform is set) — enter the actual fees paid for exact profit.`}
      </div>
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

// ShipMyCards vault cards are priced in US$ there: advice and suggested prices are worked out in US$.
function listingMoney(c) {
  const usd = sellsInUsd(c);
  return {
    usd,
    fm: (aud) => (usd ? fmtUsd(audToUsd(aud)) : fmtMoney(aud)),
    nice: (aud) => (usd ? niceListPrice(audToUsd(aud)) * currentUsdToAudRate() : niceListPrice(aud)),
  };
}

function listingCheck(c) {
  const { usd, fm, nice } = listingMoney(c);
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
  // Consigned through ShipMyCards (PC Sportscards / Fanatics): you can't relist or send offers
  // yourself — price changes go through SMC.
  const consigned = /^SMC → (PC Sportscards|Fanatics)/.test(c.sellingMethod || "");
  const ebay = !consigned && (!c.sellingMethod || /ebay/i.test(c.sellingMethod));
  const relistHow = consigned ? "ask ShipMyCards to relist it (or switch it to auction)" : ebay ? "end it and relist with Sell similar" : "repost or bump it";
  // The ShipMyCards Marketplace has very few buyers, so it only gets a week. After that: under
  // US$50 bring it home to sell in a lot; over, consign it (Fanatics for slabs, else PC Sportscards).
  const smcMarketplace = c.sellingMethod === "ShipMyCards Marketplace";
  const priceUsd = price != null ? audToUsd(price) : null;
  const smcNext =
    priceUsd != null && priceUsd < 50
      ? "bring it home with your other cheap vault cards in one shipment and sell them as a team lot"
      : c.grade
      ? "move it to Fanatics Collect's weekly auction through ShipMyCards"
      : "move it to PC Sportscards' eBay consignment through ShipMyCards";
  const atFloor = price != null && price <= breakEven * 1.02;
  const base = { card: c, totalDays, stepDays, price, value, breakEven, compsAge, ebay, consigned, relistHow, smcMarketplace, smcNext, falling };
  const viaSmc = consigned ? " (ask ShipMyCards to change the price)" : "";
  const step = (stage, priority, color, text, suggested) => ({ ...base, stage, priority, color, text, suggested: suggested != null && suggested < price ? suggested : null });

  if (smcMarketplace && stepDays >= SMC_MARKETPLACE_TRY_DAYS) {
    return step("relist", 4, "#5C7A99", `No sale in ${stepDays} days on the ShipMyCards Marketplace — it has very few buyers, so ${smcNext}.`);
  }

  if (stepDays < LISTING_STEPS.check) return { ...base, stage: "fresh", priority: 9 };
  if (price == null) return step("noPrice", 2, "#C9A227", "Add the price it's listed at so the check-up can suggest cuts.");
  if (value == null || compsAge == null || compsAge >= STALE_COMPS_DAYS) {
    return step("comps", 3, "#C9A227", `Update its comps before changing the price — ${compsAge == null ? "it has none saved" : `they're ${compsAge} days old`}.`);
  }

  const floorPrice = nice(breakEven);
  if (price > value * (1 + LISTING_OVERPRICED_PCT) && !atFloor) {
    const target = Math.max(nice(value), floorPrice);
    const pct = Math.round((price / value - 1) * 100);
    return step("over", 2, "#B4472E", `Listed ${pct}% above comps (${fm(value)}). Lower it to ${fm(target)}${floorPrice > nice(value) ? " — your break-even, the lowest to go" : ""}${viaSmc}.`, target);
  }

  if (atFloor) {
    if (totalDays >= LISTING_STEPS.stop) {
      if (falling && c.totalCost < CHEAP_CARD_COST) {
        return step("stop", 2, "#B4472E", `At break-even after ${totalDays} days and prices are falling. It's a cheap card — fine to drop to ${fm(value)} to get the cash back, or add it to a lot.`, nice(value));
      }
      return step("stop", 3, "#B4472E", consigned ? `At break-even after ${totalDays} days — stop cutting. Ask ShipMyCards to pull it back to your vault and hold it for the sell window, or bring it home for a lot.` : `At break-even after ${totalDays} days — stop cutting. Take it down and hold, add it to a team lot, or try ${ebay ? "Facebook or Instagram" : "eBay"}.`);
    }
    if (stepDays >= LISTING_STEPS.relist) {
      return step("relist", 4, "#5C7A99", `At break-even with no room to cut — ${relistHow}${ebay ? " for a fresh run in search" : ""}.`);
    }
    return step("hold", 6, "#8B90A0", `Already at break-even (${fm(breakEven)}) — leave the price. Relist at ${LISTING_STEPS.relist} days if it hasn't sold.`);
  }

  if (stepDays >= LISTING_STEPS.relist) {
    return step("relist", 4, "#5C7A99", `Up ${stepDays} days at a fair price — ${relistHow}.${ebay ? " New listings get more search visibility." : ""}`);
  }
  if (stepDays >= LISTING_STEPS.cut) {
    const target = Math.max(nice(price * (1 - LISTING_CUT_PCT)), floorPrice);
    return step("cut", 3, "#C9A227", `Priced near comps (${fm(value)}) but no sale in ${stepDays} days — lower to ${fm(target)}${ebay ? ", or send watchers an offer at that price" : viaSmc}.`, target);
  }
  return step("watch", 5, "#4E8B6B", `Priced at market (comps ${fm(value)}). Give it until day ${LISTING_STEPS.cut}${ebay ? " — if it has watchers, send them an offer" : ""}.`);
}

function listingCutSummary(c, fm = fmtMoney) {
  const cuts = (c.listingActions || []).filter((a) => a.type === "cut");
  if (!cuts.length) return null;
  const first = Number(cuts[0].from);
  const now = Number(c.listedPrice);
  if (!(first > 0) || !(now > 0)) return null;
  return `Cut ${cuts.length}× from ${fm(first)} (−${Math.round((1 - now / first) * 100)}%)`;
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

function ListingCheckRow({ check, onUpdate, onPlan }) {
  const c = check.card;
  const usd = sellsInUsd(c);
  const money = (aud) => (usd ? `${fmtUsd(audToUsd(aud))} (${fmtMoney(aud).replace("$", "A$")})` : fmtMoney(aud));
  const cutSummary = listingCutSummary(c, usd ? (aud) => fmtUsd(audToUsd(aud)) : fmtMoney);
  const belowFloor = check.price != null && check.breakEven != null && check.price < check.breakEven * 0.98;

  return (
    <div
      className="cardRow"
      style={{ padding: "8px", borderRadius: 6, fontSize: 12.5, cursor: "pointer" }}
      title="Open its plan and next steps"
      onClick={(e) => {
        // Buttons and inputs do their own thing; anywhere else opens the plan.
        if (e.target.closest("button, input, a")) return;
        onPlan(c);
      }}
    >
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <span style={{ fontWeight: 600 }}>{c.player}</span>
        {c.grade && <span style={{ color: "#6B7180", marginLeft: 6 }}>{c.grade}</span>}
        {check.totalDays != null && <ListingDaysBox days={check.totalDays} />}
        {usd && <span className="mono" title="In the ShipMyCards vault — prices shown in US dollars" style={{ fontSize: 9.5, color: "#C9A227", marginLeft: 8 }}>💵 SMC · PRICES IN US$</span>}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#2FA89A" }}>View plan ›</span>
      </div>
      {check.stage !== "noDate" && (
        <div style={{ fontSize: 11.5, color: "#8B90A0", marginTop: 2 }}>
          {check.price != null ? `Listed ${money(check.price)}` : "No list price"}
          {check.value != null && ` · comps ${money(check.value)}`}
          {check.breakEven != null && <> · break-even <span style={{ color: belowFloor ? "#B4472E" : undefined }}>{money(check.breakEven)}</span></>}
          {cutSummary && ` · ${cutSummary}`}
          {check.stepDays !== check.totalDays && ` · ${check.stepDays}d since last change`}
        </div>
      )}
      <div style={{ fontSize: 11.5, color: check.color, marginTop: 3 }}>{check.text}</div>
      <ListingCheckActions check={check} onUpdate={onUpdate} />
    </div>
  );
}

// The buttons for a listing's current step (lower, other price, relisted, take down, or set the date).
function ListingCheckActions({ check, onUpdate }) {
  const c = check.card;
  const [editing, setEditing] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [listedOn, setListedOn] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const actions = c.listingActions || [];
  const btn = { fontSize: 11, padding: "3px 9px" };
  const save = (patch) => onUpdate(c._source, c.id, patch);
  // ShipMyCards vault cards are priced in US$ there.
  const usd = sellsInUsd(c);

  // Typed prices are in US$ for vault cards; everything is stored in A$ (with the US$ kept too).
  const typedToAud = (v) => (usd ? Number(v) * currentUsdToAudRate() : Number(v));
  function lowerTo(aud) {
    const to = Math.round(Number(aud) * 100) / 100;
    if (!(to > 0)) return;
    save({ listedPrice: to, listedPriceUsd: usd ? Math.round(audToUsd(to) * 100) / 100 : null, lastListingActionAt: today, listingActions: [...actions, { date: today, type: "cut", from: check.price, to }] });
    setEditing(false);
    setNewPrice("");
  }
  function relisted() {
    save({ lastListingActionAt: today, listingActions: [...actions, { date: today, type: "relist", price: check.price }] });
  }
  function takeDown() {
    save({ status: c.grade ? "Graded" : "Raw", dateListed: null, lastListingActionAt: null, listingActions: [...actions, { date: today, type: "down", price: check.price }] });
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6, alignItems: "center" }}>
        {check.stage === "noDate" ? (
          <>
            <input type="date" value={listedOn} max={today} onChange={(e) => setListedOn(e.target.value)} style={{ fontSize: 11.5, padding: "3px 6px", width: 140 }} />
            <button type="button" className="btnSecondary" style={btn} disabled={!listedOn} onClick={() => save({ dateListed: listedOn })}>Save date</button>
            <button type="button" className="btnSecondary" style={btn} onClick={() => save({ dateListed: today })}>Start from today</button>
          </>
        ) : (
          <>
            {check.suggested != null && (
              <button type="button" className="btnSecondary" style={{ ...btn, borderColor: "#C9A22766", color: "#C9A227" }} onClick={() => lowerTo(check.suggested)}>
                Lower to {usd ? fmtUsd(audToUsd(check.suggested)) : fmtMoney(check.suggested)}
              </button>
            )}
            {editing ? (
              <>
                <input type="number" step="0.01" min="0" autoFocus placeholder={usd ? "New price US$" : "New price"} value={newPrice} onChange={(e) => setNewPrice(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lowerTo(typedToAud(newPrice))} style={{ fontSize: 11.5, padding: "3px 6px", width: 90 }} />
                <button type="button" className="btnSecondary" style={btn} disabled={!(Number(newPrice) > 0)} onClick={() => lowerTo(typedToAud(newPrice))}>Save</button>
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
      {check.price != null && check.breakEven != null && editing && Number(newPrice) > 0 && typedToAud(newPrice) < check.breakEven && (
        <div style={{ fontSize: 11, color: "#B4472E", marginTop: 4 }}>That's below break-even ({usd ? fmtUsd(audToUsd(check.breakEven)) : fmtMoney(check.breakEven)}) — you'd lose money after fees.</div>
      )}
    </div>
  );
}

// ===== One listing's plan =====
// Opened from a Listing check-up card: the card at a glance, what to do now (with the same
// buttons), the upcoming steps with dates and prices, a plan B if it never sells, and its history.
// Dates as local calendar days, so time zones never shift them by one.
function localDay(iso) {
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
function addDaysIso(dateStr, n) {
  const d = localDay(dateStr);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const shortDate = (iso) => localDay(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short" });

function listingTimeline(check) {
  const c = check.card;
  if (check.totalDays == null) return [];
  const { fm, nice } = listingMoney(c);
  const start = c.lastListingActionAt || c.dateListed;
  const floor = check.breakEven != null ? nice(check.breakEven) : null;
  const cutTo = check.price != null ? Math.max(nice(check.price * (1 - LISTING_CUT_PCT)), floor || 0) : null;
  const steps = check.smcMarketplace
    ? [{ day: SMC_MARKETPLACE_TRY_DAYS, from: start, text: `No sale yet → ${check.smcNext}` }]
    : [
        { day: LISTING_STEPS.check, from: start, text: `Check comps${check.compsAge != null && check.compsAge >= STALE_COMPS_DAYS ? " (yours are out of date)" : ""} — is the price still right?` },
        {
          day: LISTING_STEPS.cut,
          from: start,
          text:
            cutTo != null && check.price != null && cutTo < check.price
              ? `Lower about 7% to ${fm(cutTo)}${check.ebay ? " — or send watchers an offer at that price" : check.consigned ? " (ask ShipMyCards to change it)" : ""}`
              : `Price is already at break-even — don't cut, wait for the relist`,
        },
        { day: LISTING_STEPS.relist, from: start, text: check.relistHow[0].toUpperCase() + check.relistHow.slice(1) },
        { day: LISTING_STEPS.stop, from: c.dateListed, text: `Still unsold at break-even? Stop cutting — go to plan B below${floor != null ? ` (never below ${fm(floor)})` : ""}` },
      ];
  return steps.map((s) => {
    const date = addDaysIso(s.from, s.day);
    const elapsed = s.from === c.dateListed ? check.totalDays : check.stepDays;
    return { ...s, date, state: elapsed >= s.day ? "due" : "upcoming", inDays: s.day - elapsed };
  });
}

function ListingPlanModal({ card, onUpdate, onEdit, onClose }) {
  const check = listingCheck(card);
  const c = card;
  const { usd, fm } = listingMoney(c);
  const both = (aud) => (aud == null ? "—" : usd ? `${fmtUsd(audToUsd(aud))} (A${fmtMoney(aud)})` : fmtMoney(aud));
  const timeline = listingTimeline(check);
  const next = timeline.find((s) => s.state === "upcoming");
  const actions = c.listingActions || [];
  // What you'd keep if it sold at today's price.
  const methodFee = check.price != null && c.sellingMethod ? estimateSellingFee(c.sellingMethod, check.price) : null;
  const fee = check.price == null ? null : methodFee != null ? methodFee : check.price * (c.feesPct || 0.13);
  const profitNow = check.price != null && fee != null ? check.price - fee - (Number(c.totalCost) || 0) : null;
  const season = typeof seasonalSellCheck === "function" ? seasonalSellCheck(c.sport) : null;
  const cardName = [c.year, c.card, c.cardNum ? `#${String(c.cardNum).replace(/^#/, "")}` : null].filter(Boolean).join(" ");
  const box = { border: "1px solid #2C303B", borderRadius: 8, padding: "10px 12px" };
  const label = { fontSize: 10.5, color: "#6B7180", textTransform: "uppercase", letterSpacing: "0.4px" };

  const planB = check.smcMarketplace
    ? [check.smcNext[0].toUpperCase() + check.smcNext.slice(1) + "."]
    : [
        season && !season.isGoodTiming && season.nextSellMonth ? `Take it down and hold for the ${season.sportLabel} sell window (${season.nextSellMonth}) — prices are usually higher then.` : null,
        "Add it to a team or player lot with your other slow cards.",
        check.consigned ? null : check.ebay ? "Try Facebook groups or Instagram, or bring it to a card show (add it to your Card Show planner)." : "Try eBay — it has the most buyers.",
        check.consigned
          ? /Fanatics/.test(c.sellingMethod)
            ? "Ask ShipMyCards to move it to PC Sportscards' eBay consignment — eBay has more buyers."
            : `Ask ShipMyCards to ${c.grade ? "try Fanatics' weekly auction instead (graded US$50+), or " : ""}pull it back to your vault and hold.`
          : c.location === "ShipMyCards Vault"
          ? "From the vault: PC Sportscards consignment (or Fanatics for in-demand slabs)."
          : null,
      ].filter(Boolean);

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <ModalHeader title={`${c.player}${c.grade ? ` · ${c.grade}` : ""}`} onClose={onClose} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 12.5, color: "#8B90A0", marginTop: -6 }}>
            {cardName || "—"} · {c.sellingMethod || "no selling method set"}
            {check.totalDays != null && <ListingDaysBox days={check.totalDays} />}
            {usd && <span className="mono" style={{ fontSize: 9.5, color: "#C9A227", marginLeft: 8 }}>💵 SMC · PRICES IN US$</span>}
          </div>

          {/* At a glance */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8 }}>
            {[
              ["Listed at", both(check.price)],
              ["Comps", check.value != null ? `${both(check.value)}${check.compsAge != null ? ` · ${check.compsAge}d old` : ""}` : "none saved"],
              ["Break-even", both(check.breakEven)],
              ["Profit if it sells now", profitNow == null ? "—" : `${profitNow >= 0 ? "+" : ""}${fmtMoney(profitNow)}`],
            ].map(([k, v]) => (
              <div key={k} style={{ ...box, padding: "8px 10px" }}>
                <div style={label}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, color: k.startsWith("Profit") && profitNow != null ? (profitNow >= 0 ? "#4E8B6B" : "#B4472E") : "#EDEAE1" }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Now */}
          <div style={{ ...box, borderColor: `${check.color || "#4E8B6B"}66`, background: `${check.color || "#4E8B6B"}0d` }}>
            <div style={{ ...label, color: check.color || "#4E8B6B" }}>Do now</div>
            <div style={{ fontSize: 13, color: "#EDEAE1", marginTop: 3, lineHeight: 1.5 }}>
              {check.stage === "fresh" ? `Nothing yet — it's been ${check.stepDays} day${check.stepDays === 1 ? "" : "s"}.${next ? ` Next step on ${shortDate(next.date)}.` : ""}` : check.text}
            </div>
            <ListingCheckActions check={check} onUpdate={onUpdate} />
          </div>

          {/* Timeline */}
          {timeline.length > 0 && (
            <div style={box}>
              <div style={label}>Next steps</div>
              {timeline.map((s, i) => {
                const isNext = next && s === next;
                return (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", borderTop: i ? "1px solid #24272F" : "none", fontSize: 12.5, alignItems: "baseline" }}>
                    <span className="mono" style={{ minWidth: 64, color: s.state === "due" ? "#C9A227" : isNext ? "#2FA89A" : "#6B7180" }}>{shortDate(s.date)}</span>
                    <span style={{ flex: 1, color: s.state === "due" ? "#8B90A0" : "#EDEAE1" }}>{s.text}</span>
                    <span style={{ fontSize: 11, color: s.state === "due" ? "#C9A227" : isNext ? "#2FA89A" : "#6B7180", whiteSpace: "nowrap" }}>
                      {s.state === "due" ? "due" : s.inDays === 1 ? "tomorrow" : `in ${s.inDays} days`}
                    </span>
                  </div>
                );
              })}
              <div style={{ fontSize: 10.5, color: "#6B7180", marginTop: 4 }}>Cutting the price or pressing Relisted restarts the 14 / 21 / 30-day steps.</div>
            </div>
          )}

          {/* Plan B */}
          <div style={box}>
            <div style={label}>If it still won't sell</div>
            <ul style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 12.5, color: "#C6CAD4", lineHeight: 1.7 }}>{planB.map((t, i) => <li key={i}>{t}</li>)}</ul>
            {season && (
              <div style={{ fontSize: 11.5, color: season.isGoodTiming ? "#4E8B6B" : "#8B90A0", marginTop: 6 }}>
                📅 {season.monthName} is a <b>{season.currentAction}</b> month for {season.sportLabel}{season.isGoodTiming ? " — a good time to have it listed." : season.nextSellMonth ? `. Next sell window: ${season.nextSellMonth}.` : "."}
              </div>
            )}
          </div>

          {/* History */}
          {(c.dateListed || actions.length > 0) && (
            <div style={box}>
              <div style={label}>History</div>
              <div style={{ fontSize: 12, color: "#A7ADBB", marginTop: 4, lineHeight: 1.7 }}>
                {c.dateListed && <div>{shortDate(c.dateListed)} · listed{actions.find((a) => a.type === "cut") ? ` at ${fm(Number(actions.find((a) => a.type === "cut").from))}` : check.price != null ? ` at ${fm(check.price)}` : ""}</div>}
                {actions.filter((a) => a.date >= (c.dateListed || "")).map((a, i) => (
                  <div key={i}>
                    {shortDate(a.date)} · {a.type === "cut" ? `lowered ${fm(Number(a.from))} → ${fm(Number(a.to))}` : a.type === "relist" ? "relisted" : "taken down"}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btnSecondary" style={{ fontSize: 12.5 }} onClick={onEdit}>Edit sale details</button>
            <button type="button" className="btnSecondary" style={{ fontSize: 12.5 }} onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stages where something should actually be done (the rest just say "leave it for now").
const LISTING_ACTION_STAGES = ["noDate", "noPrice", "comps", "over", "cut", "relist", "stop"];

function listingsNeedingAction(cards) {
  return cards
    .filter((c) => c.status === "Listed")
    .map(listingCheck)
    .filter((k) => LISTING_ACTION_STAGES.includes(k.stage))
    .sort((a, b) => a.priority - b.priority || (b.stepDays || 0) - (a.stepDays || 0));
}

function ListingCheckup({ items, onUpdate, onOpen }) {
  const [planFor, setPlanFor] = useState(null); // { _source, id }
  const [showFresh, setShowFresh] = useState(false);
  const checks = useMemo(() => items.filter((c) => c.status === "Listed").map(listingCheck), [items]);
  const planCard = planFor ? items.find((i) => i._source === planFor._source && i.id === planFor.id) : null;
  const openPlan = (c) => setPlanFor({ _source: c._source, id: c.id });
  const stats = useMemo(() => firstListPriceStats(items.filter((c) => c.status === "Sold")), [items]);
  if (!checks.length) return null;

  const fresh = checks.filter((k) => k.stage === "fresh");
  const due = checks.filter((k) => k.stage !== "fresh").sort((a, b) => a.priority - b.priority || (b.stepDays || 0) - (a.stepDays || 0));
  const actionCount = due.filter((k) => LISTING_ACTION_STAGES.includes(k.stage)).length;

  return (
    <div style={{ marginBottom: 20 }}>
      <DashCard title={`🏷️ Listing check-up${actionCount ? ` · ${actionCount} need action` : ""}`}>
        <div style={{ fontSize: 11, color: "#6B7180", marginBottom: 2 }}>
          Check comps at {LISTING_STEPS.check} days, cut 5–10% at {LISTING_STEPS.cut}, relist at {LISTING_STEPS.relist} — never below break-even.
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
          due.slice(0, 10).map((k) => <ListingCheckRow key={`${k.card._source}-${k.card.id}`} check={k} onUpdate={onUpdate} onPlan={openPlan} />)
        )}
        {due.length > 10 && <div style={{ fontSize: 11, color: "#6B7180" }}>+ {due.length - 10} more</div>}
        {fresh.length > 0 && (
          <div style={{ fontSize: 11, color: "#5C6270", padding: "2px 8px" }}>
            {fresh.length} newer listing{fresh.length === 1 ? "" : "s"} — nothing to do yet.{" "}
            <button type="button" onClick={() => setShowFresh((v) => !v)} style={{ background: "none", border: "none", color: "#2FA89A", cursor: "pointer", padding: 0, fontSize: 11 }}>
              {showFresh ? "Hide" : "Show their plans"}
            </button>
          </div>
        )}
        {showFresh &&
          fresh.map((k) => (
            <div key={`${k.card._source}-${k.card.id}`} className="cardRow" onClick={() => openPlan(k.card)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 8px", borderRadius: 6, fontSize: 12.5, cursor: "pointer" }}>
              <span style={{ fontWeight: 600 }}>{k.card.player}</span>
              {k.card.grade && <span style={{ color: "#6B7180", marginLeft: 4 }}>{k.card.grade}</span>}
              {k.totalDays != null && <ListingDaysBox days={k.totalDays} />}
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#2FA89A" }}>View plan ›</span>
            </div>
          ))}
      </DashCard>
      {planCard && (
        <ListingPlanModal
          card={planCard}
          onUpdate={onUpdate}
          onClose={() => setPlanFor(null)}
          onEdit={() => {
            setPlanFor(null);
            onOpen(planCard);
          }}
        />
      )}
    </div>
  );
}

function MySales({ items, onUpdate, onDelete, onAddManualSale }) {
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(50);
  const [editingItem, setEditingItem] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);

  const sorted = useMemo(
    () => [...items].sort((a, b) => (a.status === b.status ? 0 : a.status === "Listed" ? -1 : 1)),
    [items]
  );

  const searched = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.trim().toLowerCase();
    return sorted.filter((i) => `${i.player} ${i.card} ${i.cardNum}`.toLowerCase().includes(q));
  }, [sorted, search]);

  useEffect(() => setVisibleCount(50), [search]);

  const visible = searched.slice(0, visibleCount);

  const totals = useMemo(() => {
    const qty = (c) => Number(c.quantity) || 1;
    const sold = items.filter((i) => i.status === "Sold");
    const listed = items.filter((i) => i.status === "Listed");
    const realised = sold.reduce((s, c) => s + (c.realisedProfit ?? 0) * qty(c), 0);
    const listedValue = listed.reduce((s, c) => s + (Number(c.listedPrice) || 0) * qty(c), 0);
    return { soldCount: sold.length, listedCount: listed.length, realised, listedValue };
  }, [items]);

  const selectedItem = editingItem ? items.find((i) => i._source === editingItem._source && i.id === editingItem.id) : null;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1, background: "#2C303B", border: "1px solid #2C303B", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        <Stat label="Listed" value={totals.listedCount} color="#2FA89A" />
        <Stat label="Sold" value={totals.soldCount} color="#4E8B6B" />
        <Stat label="Listed value" value={fmtMoney(totals.listedValue)} />
        <Stat label="Realised profit" value={`${totals.realised >= 0 ? "+" : ""}${fmtMoney(totals.realised)}`} color={totals.realised >= 0 ? "#4E8B6B" : "#B4472E"} />
      </div>

      <ListingCheckup items={items} onUpdate={onUpdate} onOpen={(item) => setEditingItem({ _source: item._source, id: item.id })} />

      <SalesPerformance items={items} />

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by player or card…"
          style={{ flex: 1 }}
        />
        <button className="btnPrimary" onClick={() => setShowManualModal(true)} style={{ whiteSpace: "nowrap", fontSize: 12.5 }}>
          + Log Manual Listing
        </button>
      </div>

      {searched.length === 0 ? (
        <div style={{ padding: "3rem 0", textAlign: "center", color: "#5C6270", border: "1px solid #2C303B", borderRadius: 10 }}>
          {items.length === 0
            ? "Nothing listed or sold yet — set a card's status to Listed or Sold, or log a manual listing above."
            : "No matches for that search."}
        </div>
      ) : (
        <>
          <div style={{ border: "1px solid #2C303B", borderRadius: 10, overflow: "hidden" }}>
            {/* Table Header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 80px 80px 80px 90px 90px 24px", padding: "8px 14px", background: "#14161C", color: "#6B7180", fontSize: 11, fontWeight: 600 }}>
              <div>ITEM</div>
              <div>STATUS</div>
              <div>COST</div>
              <div>LISTED</div>
              <div>SOLD</div>
              <div>PROFIT</div>
              <div></div>
            </div>

            {visible.map((item) => (
              <SalesRow key={`${item._source}-${item.id}`} item={item} onClick={() => setEditingItem({ _source: item._source, id: item.id })} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, fontSize: 12, color: "#6B7180" }}>
            <span>Showing {visible.length} of {searched.length}</span>
            {visibleCount < searched.length && (
              <button className="btnSecondary" onClick={() => setVisibleCount((v) => v + 50)}>
                Load 50 more
              </button>
            )}
          </div>
        </>
      )}

      {selectedItem && (
        <SalesDetailModal item={selectedItem} onClose={() => setEditingItem(null)} onUpdate={onUpdate} onDelete={onDelete} />
      )}

      {showManualModal && (
        <AddManualListingModal
          onClose={() => setShowManualModal(false)}
          onAdd={(newCard) => {
            if (onAddManualSale) onAddManualSale(newCard);
            setShowManualModal(false);
          }}
        />
      )}
    </div>
  );
}
