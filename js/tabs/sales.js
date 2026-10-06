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
              <Field label="Listed price">
                <input
                  type="number"
                  step="0.01"
                  value={item.listedPrice ?? ""}
                  onChange={(e) => onUpdate(item._source, item.id, { listedPrice: e.target.value === "" ? null : Number(e.target.value) })}
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
              placeholder="e.g. SMC → DCSports87 cost"
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
