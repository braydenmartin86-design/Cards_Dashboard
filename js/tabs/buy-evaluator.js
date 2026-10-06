// ===== Buy Evaluator =====

function newBuyTarget() {
  return {
    id: crypto.randomUUID(),
    player: "",
    card: "",
    cardNum: "",
    sport: "NFL",
    rookie: false,
    numbered: false,
    outOf: "",
    bidders: 0,
    watchers: 0,
    rawGraded: "Raw",
    psaLevel: "",
    isPokemonInsert: false,
    rawSale1: "",
    rawSale2: "",
    psa9Sale1: "",
    psa9Sale2: "",
    psa10Sale1: "",
    psa10Sale2: "",
    gradingService: "PSA via Australia",
    psa10Prob: 0.35,
    psa9Prob: 0.45,
    feesPct: 0.13,
    shipping: 0,
    shipMyCards: "None",
    currentBid: "",
    maxBudget: 50,
    biddingStatus: "Watching",
    quantity: 1,
    paidAmount: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
  };
}

// Comp values from CompFinder written into a buy target's sale boxes (one average per grade).
function buyCompPatch(values, details) {
  const patch = { compSearch: details, compsUpdatedAt: new Date().toISOString().slice(0, 10) };
  const boxes = { raw: ["rawSale1", "rawSale2"], psa9: ["psa9Sale1", "psa9Sale2"], psa10: ["psa10Sale1", "psa10Sale2"] };
  for (const [key, value] of Object.entries(values)) {
    if (!boxes[key]) continue;
    patch[boxes[key][0]] = String(value);
    patch[boxes[key][1]] = "";
  }
  return patch;
}

function buyGrade(t) {
  return t.rawGraded === "Graded" && t.psaLevel ? t.psaLevel : null;
}

const GAP_ZONE_STYLE = {
  "AUTO-BUY": { color: "#4E8B6B", label: "🟢 Auto-buy zone" },
  CONDITIONAL: { color: "#C9A227", label: "🟡 Conditional zone" },
  "NO-BUY": { color: "#B4472E", label: "🔴 No-buy zone" },
};

const BID_STATUS_OPTIONS = ["Watching", "Bid Placed", "Won", "Lost"];
const BID_STATUS_COLOR = {
  Watching: "#5C7A99",
  "Bid Placed": "#C9A227",
  Won: "#4E8B6B",
  Lost: "#B4472E",
};

function BuyEvaluator({ buyList, setBuyList, onWin }) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const computed = useMemo(() => buyList.map(computeBuy), [buyList]);

  const monthSpend = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return computed
      .filter((t) => t.biddingStatus === "Won" && t.paidAmount && (t.purchaseDate || "").startsWith(ym))
      .reduce((s, t) => s + Number(t.paidAmount) * (Number(t.quantity) || 1), 0);
  }, [computed]);

  function addTarget(t) {
    setBuyList((prev) => [t, ...prev]);
    setShowAdd(false);
  }
  function updateTarget(id, updates) {
    setBuyList((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }
  function removeTarget(id) {
    setBuyList((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontSize: 13, color: "#A7ADBB", marginBottom: 16 }}>
        This month's spend on won auctions:{" "}
        <span className="oswald" style={{ fontWeight: 600, color: "#4E8B6B", fontSize: 15 }}>
          {fmtMoney(monthSpend)}
        </span>
        <span style={{ color: "#6B7180", marginLeft: 8 }}>— resets automatically each month. Full history lives in Business Summary.</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "#8B90A0" }}>
          Log an auction you're watching. Same buy/pass logic as your spreadsheet — adjusted market value, snipe bid, and grade recommendation.
        </div>
        <button className="btnPrimary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> New target
        </button>
      </div>

      {computed.length === 0 ? (
        <div style={{ padding: "3rem 0", textAlign: "center", color: "#5C6270", border: "1px solid #2C303B", borderRadius: 10 }}>
          No auctions logged yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {computed.map((t) => (
            <BuyRow key={t.id} t={t} onClick={() => setSelectedId(t.id)} />
          ))}
        </div>
      )}

      {showAdd && <BuyModal onClose={() => setShowAdd(false)} onSave={addTarget} />}
      {selectedId && (
        <BuyDetailModal
          t={computed.find((c) => c.id === selectedId)}
          onUpdate={updateTarget}
          onRemove={(id) => {
            removeTarget(id);
            setSelectedId(null);
          }}
          onWin={onWin}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

// Compact inline version of the standalone Grade Check tool, scoped to a single buy target.
// Images stay local to this component (never persisted) — only the numeric result is saved
// onto the target, which then drives the real probability-weighted grading math above.
function BuyGradePhotoCheck({ target, onUpdate }) {
  const [images, setImages] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  async function handleFiles(fileList) {
    const files = Array.from(fileList).slice(0, 4 - images.length);
    for (const file of files) {
      const base64 = await fileToBase64(file);
      setImages((prev) => [...prev, { name: file.name, base64, mediaType: file.type || "image/jpeg", previewUrl: URL.createObjectURL(file) }]);
    }
  }

  function removeImage(i) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function analyze() {
    if (images.length === 0) return;
    setAnalyzing(true);
    setError(null);
    try {
      const content = [
        ...images.map((img) => ({ type: "image", source: { type: "base64", media_type: img.mediaType, data: img.base64 } })),
        { type: "text", text: GRADE_CHECK_PROMPT },
      ];
     const firstImage = images[0];
      const parsed = await callGeminiAi(GRADE_CHECK_PROMPT, firstImage.base64, firstImage.mediaType);
      onUpdate(target.id, { gradeAnalysis: parsed });
      setImages([]);
    } catch (e) {
      console.error(e);
      setError("Couldn't analyze the photo(s) — try again, or with clearer/brighter images.");
    } finally {
      setAnalyzing(false);
    }
  }

  const analysis = target.gradeAnalysis;

  if (!expanded && !analysis) {
    return (
      <button className="btnSecondary" style={{ fontSize: 12, padding: "6px 12px", marginBottom: 10 }} onClick={() => setExpanded(true)}>
        📸 Check grade from photos
      </button>
    );
  }

  return (
    <div style={{ border: "1px solid #2C303B", borderRadius: 8, padding: "10px 12px", marginBottom: 10, background: "#14161C" }}>
      {analysis && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: expanded ? 10 : 0 }}>
          <div>
            <span className="oswald" style={{ fontSize: 15, fontWeight: 700, color: "#C9A227" }}>
              Predicted PSA {analysis.predictedGradeLow}–{analysis.predictedGradeHigh}
            </span>
            <span className="mono" style={{ fontSize: 10, color: "#6B7180", marginLeft: 8 }}>{analysis.confidence} confidence</span>
          </div>
          <button className="btnSecondary" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Hide" : "Re-check"}
          </button>
        </div>
      )}

      {expanded && (
        <div style={{ marginTop: analysis ? 10 : 0 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: "relative", width: 56, height: 56, borderRadius: 6, overflow: "hidden", border: "1px solid #2C303B" }}>
                <img src={img.previewUrl} alt={img.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div onClick={() => removeImage(i)} style={{ position: "absolute", top: 1, right: 1, background: "#14161Cdd", borderRadius: 999, padding: 1, cursor: "pointer" }}>
                  <X size={10} color="#EDEAE1" />
                </div>
              </div>
            ))}
            {images.length < 4 && (
              <label style={{ width: 56, height: 56, borderRadius: 6, border: "1px dashed #333844", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B7180" }}>
                <Plus size={16} />
                <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
              </label>
            )}
          </div>
          <button className="btnPrimary" onClick={analyze} disabled={images.length === 0 || analyzing} style={{ fontSize: 12, padding: "6px 12px", opacity: images.length === 0 || analyzing ? 0.5 : 1 }}>
            {analyzing ? "Analyzing…" : "Analyze grade"}
          </button>
          {error && <div style={{ fontSize: 11, color: "#B4472E", marginTop: 8 }}>{error}</div>}
          {analysis && analysis.obstruction && analysis.obstruction.toLowerCase() !== "none" && (
            <div style={{ fontSize: 11, color: "#C9A227", marginTop: 8, background: "#C9A22715", border: "1px solid #C9A22740", borderRadius: 6, padding: "6px 9px" }}>
              ⚠️ Obstructed: {analysis.obstruction}
            </div>
          )}
          {analysis && (
            <div style={{ fontSize: 11, color: "#8B90A0", marginTop: 10, lineHeight: 1.6 }}>
              {analysis.summary} Chances: PSA 10 {fmtPct(analysis.psa10Prob)} · PSA 9 {fmtPct(analysis.psa9Prob)} · below {fmtPct(analysis.belowProb)}.
              {analysis.keyIssues?.length > 0 && <> Flagged: {analysis.keyIssues.join(" · ")}.</>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BuyRow({ t, onClick }) {
  const decisionColor = t.decision === "BUY" ? "#4E8B6B" : t.decision === "PASS" ? "#B4472E" : "#5C6270";
  const heatColor = t.auctionHeat === "Hot" ? "#B4472E" : t.auctionHeat === "Mid" ? "#C9A227" : "#5C7A99";
  const gapStyle = t.gapZone && t.decision !== "PASS" ? GAP_ZONE_STYLE[t.gapZone] : null;
  const statusColor = BID_STATUS_COLOR[t.biddingStatus] || "#5C7A99";
  const hasActual = t.actualProfit != null;

  return (
    <div
      onClick={onClick}
      className="cardRow"
      style={{ border: t.overCap ? "1px solid #B4472E88" : "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22", cursor: "pointer" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div className="oswald" style={{ fontSize: 16, fontWeight: 600 }}>
            {t.player || "Unnamed"}
            {t.sport && <span className="mono" style={{ fontSize: 10, color: "#6B7180", marginLeft: 8 }}>{SPORT_EMOJI[t.sport] || "🎴"} {t.sport}</span>}
          </div>
          <div style={{ fontSize: 12, color: "#6B7180" }}>{t.card}{t.cardNum ? ` ${t.cardNum}` : ""}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span className="mono" style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: `${statusColor}22`, color: statusColor }}>{t.biddingStatus}</span>
          <span className="mono" style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: `${heatColor}22`, color: heatColor }}>{t.auctionHeat}</span>
          {gapStyle && (
            <span className="mono" style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: `${gapStyle.color}22`, color: gapStyle.color }}>{gapStyle.label}</span>
          )}
          {t.decision && (
            <span className="mono" style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: `${decisionColor}22`, color: decisionColor, fontWeight: 700 }}>{t.decision}</span>
          )}
          <ChevronRight size={14} style={{ color: "#5C6270" }} />
        </div>
      </div>

      {t.marketPrice > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          <MiniStat label="Market price" value={fmtMoney(t.marketPrice)} />
          <MiniStat label="Max snipe bid (ceiling)" value={fmtMoney(t.maxSnipeBid)} color="#C9A227" emphasis />
          <MiniStat label={hasActual ? "Actual profit" : "Est. profit"} value={fmtMoney(hasActual ? t.actualProfit : t.estProfit)} color={(hasActual ? t.actualProfit : t.estProfit) >= 0 ? "#4E8B6B" : "#B4472E"} />
          <MiniStat label={hasActual ? "Actual ROI %" : "ROI %"} value={fmtPct(hasActual ? t.actualROIPct : t.roiPct)} color={(hasActual ? t.actualProfit : t.estProfit) >= 0 ? "#4E8B6B" : "#B4472E"} />
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#6B7180" }}>Add sale prices to calculate your max bid — click to open.</div>
      )}
    </div>
  );
}

function BuyDetailModal({ t, onUpdate, onRemove, onWin, onClose }) {
  const decisionColor = t.decision === "BUY" ? "#4E8B6B" : t.decision === "PASS" ? "#B4472E" : "#5C6270";
  const statusColor = BID_STATUS_COLOR[t.biddingStatus] || "#5C7A99";
  const [justPromoted, setJustPromoted] = useState(false);
  const paidLabel = t.biddingStatus === "Bid Placed" ? "Bid amount" : "Paid amount";

  // Promotion to My Cards can be triggered by either field, whichever gets filled in second —
  // marking "Won" before typing the paid amount used to promote immediately with $0 and never
  // get a second chance to pick up the real figure once it was typed in afterward.
  function handleFieldUpdate(updates) {
    const next = { ...t, ...updates };
    onUpdate(t.id, updates);
    const shouldPromote = !t.promoted && next.biddingStatus === "Won" && Number(next.paidAmount) > 0;
    if (shouldPromote) {
      onWin(next);
      onUpdate(t.id, { promoted: true });
      setJustPromoted(true);
      setTimeout(() => setJustPromoted(false), 2500);
    }
  }

  function handleStatusChange(newStatus) {
    handleFieldUpdate({ biddingStatus: newStatus });
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 12, color: "#8B90A0" }}>{t.sport && `${SPORT_EMOJI[t.sport] || "🎴"} ${t.sport}`}</div>
            <h2 className="oswald" style={{ margin: "2px 0 0", fontSize: 20 }}>{t.player || "Unnamed"}</h2>
            <div style={{ fontSize: 12, color: "#6B7180" }}>{t.card}{t.cardNum ? ` ${t.cardNum}` : ""}</div>
          </div>
          <X size={20} style={{ cursor: "pointer", color: "#8B90A0" }} onClick={onClose} />
        </div>

        {t.decision && (
          <span className="mono" style={{ display: "inline-block", fontSize: 12, padding: "4px 12px", borderRadius: 999, background: `${decisionColor}22`, color: decisionColor, fontWeight: 700, margin: "10px 0" }}>
            {t.decision}
          </span>
        )}

        {justPromoted && (
          <div style={{ fontSize: 12, color: "#4E8B6B", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={13} /> Added to {t.sport === "Pokémon" ? "Pokémon" : "My Cards"}
          </div>
        )}

        {t.marketPrice > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 6 }}>
            <MiniStat label="Market price" value={fmtMoney(t.marketPrice)} />
            <MiniStat label="Max snipe bid (ceiling)" value={fmtMoney(t.maxSnipeBid)} color="#C9A227" emphasis />
            <MiniStat label="Est. profit" value={fmtMoney(t.estProfit)} color={t.estProfit >= 0 ? "#4E8B6B" : "#B4472E"} />
            <MiniStat label="ROI %" value={fmtPct(t.roiPct)} color={t.estProfit >= 0 ? "#4E8B6B" : "#B4472E"} />
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "#6B7180", marginBottom: 10 }}>Add sale prices below to calculate your max bid.</div>
        )}
        {t.marketPrice > 0 && (
          <div style={{ fontSize: 11, color: "#6B7180", marginBottom: 10 }}>
            {Number(t.currentBid) > 0
              ? `Profit/ROI based on your current bid of ${fmtMoney(Number(t.currentBid))}.`
              : "No current bid logged — profit/ROI assumes you pay the full ceiling."}
          </div>
        )}
        {t.alreadyOverMax && (
          <div style={{ fontSize: 12, color: "#B4472E", marginBottom: 10 }}>
            ⚠️ Current bid ({fmtMoney(Number(t.currentBid))}) is already above your max snipe bid — pass.
          </div>
        )}
        {t.decision === "PASS" && !t.alreadyOverMax && t.percentGap != null && t.percentGap >= 0.3 && (
          <div style={{ fontSize: 12, color: "#C9A227", marginBottom: 10 }}>
            ⚠️ Your bid looks like a big discount vs market price, but it's still a PASS — shipping/holding costs are eating the margin on a card this cheap. Worth checking if this is one to skip or bundle into a bigger shipment.
          </div>
        )}

        <CompFinder
          card={t}
          grade={buyGrade(t)}
          title="🔄 Get comps from CardSight"
          applyNoun="price"
          defaultOpen={t.marketPrice <= 0}
          updatedAt={t.compsUpdatedAt}
          onApply={({ values, details }) => onUpdate(t.id, buyCompPatch(values, details))}
        />

        <div style={{ fontSize: 11.5, color: "#6B7180", marginBottom: 6 }}>Recent sales — up to 2 each, average is used automatically</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
          <TierPriceInput label="Raw" sale1={t.rawSale1} sale2={t.rawSale2} onChange1={(v) => onUpdate(t.id, { rawSale1: v })} onChange2={(v) => onUpdate(t.id, { rawSale2: v })} />
          <TierPriceInput label="PSA 9" sale1={t.psa9Sale1} sale2={t.psa9Sale2} onChange1={(v) => onUpdate(t.id, { psa9Sale1: v })} onChange2={(v) => onUpdate(t.id, { psa9Sale2: v })} />
          <TierPriceInput label="PSA 10" sale1={t.psa10Sale1} sale2={t.psa10Sale2} onChange1={(v) => onUpdate(t.id, { psa10Sale1: v })} onChange2={(v) => onUpdate(t.id, { psa10Sale2: v })} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, alignItems: "end", marginBottom: 10 }}>
          <Field label="Current bid (optional)">
            <input type="number" step="0.01" value={t.currentBid} onChange={(e) => onUpdate(t.id, { currentBid: e.target.value })} />
          </Field>
          <Field label="Max budget">
            <input type="number" step="0.01" value={t.maxBudget} onChange={(e) => onUpdate(t.id, { maxBudget: e.target.value === "" ? "" : Number(e.target.value) })} />
          </Field>
          <Field label="Grading service">
            <select value={t.gradingService} onChange={(e) => onUpdate(t.id, { gradingService: e.target.value })}>
              {GRADING_SERVICE_OPTIONS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
        </div>

        {t.rawGraded === "Raw" && <BuyGradePhotoCheck target={t} onUpdate={onUpdate} />}

        {t.rawGraded === "Raw" && (t.rawAvg != null || t.psa9Avg != null || t.psa10Avg != null) ? (
          <div style={{ border: "1px solid #8B6FD655", borderRadius: 8, padding: "10px 12px", marginBottom: 10, background: "#8B6FD60f" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "#8B90A0", textTransform: "uppercase" }}>Worth grading after buying?</span>
              {t.gradeCallBuy && (
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 9px",
                    borderRadius: 999,
                    background: `${t.gradeCallBuy === "YES" ? "#4E8B6B" : t.gradeCallBuy === "HIGH RISK" ? "#C9A227" : "#5C6270"}22`,
                    color: t.gradeCallBuy === "YES" ? "#4E8B6B" : t.gradeCallBuy === "HIGH RISK" ? "#C9A227" : "#5C6270",
                  }}
                >
                  {t.gradeCallBuy}
                </span>
              )}
            </div>
            <div style={{ fontSize: 10.5, color: "#6B7180", marginBottom: 8 }}>
              Costed against your Max Snipe Bid ceiling ({fmtMoney(t.maxSnipeBid)}), not the current bid — the worst-case price you'd actually pay, since bids climb before close.
            </div>
            {t.gradeAnalysis && (
              <div style={{ fontSize: 10.5, color: "#8B6FD6", marginBottom: 8 }}>
                Using your photo check's actual grade probabilities, not the flat default.
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              <MiniStat label="Raw GGR" value={t.rawGGRBuy != null ? fmtMoney(t.rawGGRBuy) : "—"} color={t.rawGGRBuy >= 0 ? "#4E8B6B" : "#B4472E"} />
              <MiniStat label="PSA 9 GGR" value={t.psa9GGRBuy != null ? fmtMoney(t.psa9GGRBuy) : "—"} color={t.psa9GGRBuy >= 0 ? "#4E8B6B" : "#B4472E"} />
              <MiniStat label="PSA 10 GGR" value={t.psa10GGRBuy != null ? fmtMoney(t.psa10GGRBuy) : "—"} color={t.psa10GGRBuy >= 0 ? "#4E8B6B" : "#B4472E"} />
              <MiniStat label="Graded EV" value={t.gradedEVBuy != null ? fmtMoney(t.gradedEVBuy) : "—"} color={t.gradedEVBuy >= 0 ? "#4E8B6B" : "#B4472E"} emphasis />
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "#8B90A0", marginBottom: 10 }}>
            Grading: <span style={{ fontWeight: 600, color: t.gradeDecision === "Grade Recommended" ? "#8B6FD6" : "#A7ADBB" }}>{t.gradeDecision}</span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, alignItems: "end", borderTop: "1px solid #24272F", paddingTop: 10 }}>
          <Field label="Status">
            <select value={t.biddingStatus} onChange={(e) => handleStatusChange(e.target.value)} style={{ color: statusColor, fontWeight: 600 }}>
              {BID_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Quantity">
            <input type="number" min="1" step="1" value={t.quantity} onChange={(e) => onUpdate(t.id, { quantity: e.target.value })} />
          </Field>
          <Field label={paidLabel}>
            <input type="number" step="0.01" value={t.paidAmount} onChange={(e) => handleFieldUpdate({ paidAmount: e.target.value })} />
          </Field>
          <Field label="Date">
            <input type="date" value={t.purchaseDate} onChange={(e) => onUpdate(t.id, { purchaseDate: e.target.value })} />
          </Field>
        </div>

        {t.actualProfit != null && (
          <div style={{ marginTop: 10, border: "1px solid #4E8B6B55", borderRadius: 8, padding: "10px 12px", background: "#4E8B6B0f" }}>
            <div style={{ fontSize: 11, color: "#8B90A0", textTransform: "uppercase", marginBottom: 8 }}>Recalculated from what you {t.biddingStatus === "Won" ? "paid" : "bid"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <MiniStat label="Actual est. profit" value={fmtMoney(t.actualProfit)} color={t.actualProfit >= 0 ? "#4E8B6B" : "#B4472E"} emphasis />
              <MiniStat label="Actual ROI %" value={fmtPct(t.actualROIPct)} color={t.actualProfit >= 0 ? "#4E8B6B" : "#B4472E"} emphasis />
            </div>
          </div>
        )}

        <button
          onClick={() => {
            onRemove(t.id);
            onClose();
          }}
          style={{ background: "transparent", border: "1px solid #4a2a24", color: "#B4472E", borderRadius: 8, padding: "9px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginTop: 14 }}
        >
          <Trash2 size={14} /> Remove
        </button>
      </div>
    </div>
  );
}

// Paste-and-extract for a New Target — since the app can't fetch an eBay URL directly (no
// backend, browsers block cross-site fetches), the workaround is: you copy the visible listing
// text yourself (title, price, bids, watchers, shipping — all right there on the page) and this
// sends that text to Claude to pull out structured fields. One extra step versus a true "paste
// Escaped internal quotes inside prompt string to fix GitHub/IDE syntax highlighting
const LISTING_EXTRACT_PROMPT = `You are extracting structured data from a pasted eBay trading card listing — the user copied the visible text from the listing page (title, price, bid/watcher counts, shipping) and pasted it here.

Identify: player (athlete/character name), sport (one of NFL, NBA, WNBA, MLB, AFL, Soccer, MMA, WWE, Pokémon, Other — best guess), cardNum (card number if shown, e.g. "#258"), card (set/product name plus parallel or insert, e.g. "2020-21 Panini Prizm Silver"), rookie (true if "RC" or "rookie" mentioned), numbered (true if a print run like "/99" appears), outOf (the print run denominator if numbered, else null), bidders (number of bids if it's an auction, else null), watchers (number watching if shown, else null), currentBidAUD (the current price, converted to AUD if the listing wasn't already in AUD — use approximate rates: 1 USD ≈ 1.5 AUD, 1 GBP ≈ 1.9 AUD, 1 EUR ≈ 1.6 AUD), originalCurrency (whatever currency the pasted text was actually in, e.g. "USD", "AUD", "GBP"), shippingAUD (shipping cost converted to AUD the same way, 0 if free, null if not mentioned).

Respond with ONLY valid JSON, no markdown fences, no commentary, in exactly this shape:
{"player":"","sport":"","cardNum":"","card":"","rookie":false,"numbered":false,"outOf":null,"bidders":null,"watchers":null,"currentBidAUD":null,"originalCurrency":"","shippingAUD":null,"confidence":"Low","notes":""}`;

// Quick local regex parser to handle basic copy-pastes instantly without hitting AI limits
function parseListingLocally(text) {
  if (!text) return null;

  const priceMatch = text.match(/(?:AU|US|EUR|GBP)?\s*\$\s*([\d,]+(?:\.\d{2})?)/i);
  const bidsMatch = text.match(/(\d+)\s*bids?/i);
  const watchersMatch = text.match(/(\d+)\s*watchers?/i);
  const shippingMatch = text.match(/\+\s*(?:US|AU)?\s*\$?\s*([\d,]+(?:\.\d{2})?)\s*shipping/i);
  const cardNumMatch = text.match(/#(\d+|[A-Z0-9-]+)/i);

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const rawTitle = lines[0] || text;

  if (!priceMatch && !rawTitle) return null;

  // Extract candidate player name (first 2-3 capitalized words in title)
  const playerMatch = rawTitle.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b/);
  const extractedPlayer = playerMatch ? playerMatch[1] : rawTitle.slice(0, 25);

  // eBay shows "US $42.00" on US listings; those amounts are converted at the live rate.
  const isUsd = /\bUS\s*\$/i.test(text) && !/\bAU\s*\$/i.test(text);
  const toAud = (n) => (n == null ? n : isUsd ? convertUsdToAud(n) : n);

  return {
    player: extractedPlayer,
    sport: "NFL", // Default fallback
    cardNum: cardNumMatch ? `#${cardNumMatch[1]}` : "",
    card: rawTitle,
    rookie: /\b(RC|Rookie)\b/i.test(text),
    numbered: /\/\d+/.test(text),
    outOf: text.match(/\/(\d+)/)?.[1] ? parseInt(text.match(/\/(\d+)/)[1], 10) : null,
    bidders: bidsMatch ? parseInt(bidsMatch[1], 10) : null,
    watchers: watchersMatch ? parseInt(watchersMatch[1], 10) : null,
    currentBidAUD: priceMatch ? toAud(parseFloat(priceMatch[1].replace(",", ""))) : null,
    originalCurrency: isUsd ? "USD" : "AUD",
    shippingAUD: shippingMatch ? toAud(parseFloat(shippingMatch[1].replace(",", ""))) : 0,
    confidence: "Medium",
    notes: isUsd ? `Extracted via instant local parser · converted from US$ at ${currentUsdToAudRate().toFixed(4)}` : "Extracted via instant local parser",
  };
}

function ListingPasteExtractor({ onExtracted }) {
  const [expanded, setExpanded] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function extract() {
    if (!pasteText.trim()) return;
    setExtracting(true);
    setError(null);
    setResult(null);

    // Step 1: Try local regex parsing first (Instant & bypasses API limits)
    const localParsed = parseListingLocally(pasteText);
    if (localParsed && localParsed.currentBidAUD !== null) {
      setResult(localParsed);
      onExtracted(localParsed);
      setExtracting(false);
      return;
    }

    // Step 2: Fall back to AI extraction if text is unstructured
    try {
      const liveRate = currentUsdToAudRate().toFixed(2);
      const promptText = `${LISTING_EXTRACT_PROMPT.replace("1 USD ≈ 1.5 AUD", `1 USD ≈ ${liveRate} AUD`)}\n\nPasted listing:\n${pasteText}`;
      const rawResponse = await callGeminiAi(promptText);

      let parsed = null;
      if (typeof rawResponse === "object" && rawResponse !== null) {
        parsed = rawResponse;
      } else if (typeof rawResponse === "string") {
        const cleanJson = rawResponse.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(cleanJson);
      }

      if (parsed && typeof parsed === "object") {
        setResult(parsed);
        onExtracted(parsed);
      } else {
        throw new Error("Could not parse JSON structure");
      }
    } catch (e) {
      console.error("Listing extract failed:", e);
      if (localParsed) {
        setResult(localParsed);
        onExtracted(localParsed);
      } else {
        setError("Couldn't parse that automatically. Please fill in the fields manually below.");
      }
    } finally {
      setExtracting(false);
    }
  }

  if (!expanded) {
    return (
      <button type="button" className="btnSecondary" onClick={() => setExpanded(true)} style={{ marginBottom: 4 }}>
        📋 Paste an eBay listing to auto-fill this form
      </button>
    );
  }

  return (
    <div style={{ border: "1px solid #2C303B", borderRadius: 8, padding: "12px 14px", background: "#14161C" }}>
      <div style={{ fontSize: 11, color: "#8B90A0", textTransform: "uppercase", marginBottom: 6 }}>Paste listing details</div>
      <div style={{ fontSize: 11.5, color: "#6B7180", marginBottom: 8 }}>
        On the eBay listing, select and copy the title, price, bid/watcher counts, and shipping cost, then paste that block here.
      </div>
      <textarea
        value={pasteText}
        onChange={(e) => setPasteText(e.target.value)}
        rows={5}
        placeholder="e.g. 2023 Panini Prizm Ausar Thompson #178 Prizms Blue Seismic /99 RC PSA 10&#10;AU $42.47&#10;9 bids"
        style={{ background: "#0F1015", border: "1px solid #333844", color: "#EDEAE1", borderRadius: 6, padding: "9px 11px", fontSize: 13, fontFamily: "'Inter', sans-serif", width: "100%", resize: "vertical", marginBottom: 10 }}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button type="button" className="btnPrimary" onClick={extract} disabled={!pasteText.trim() || extracting} style={{ opacity: !pasteText.trim() || extracting ? 0.5 : 1 }}>
          {extracting ? "Extracting…" : "Extract details"}
        </button>
        <button type="button" className="btnSecondary" onClick={() => setExpanded(false)}>
          Hide
        </button>
      </div>
      {error && <div style={{ fontSize: 11.5, color: "#B4472E", marginTop: 8 }}>{error}</div>}
      {result && (
        <div style={{ fontSize: 11.5, color: "#4E8B6B", marginTop: 10 }}>
          Filled in below — {(result.confidence || "Medium").toLowerCase()} confidence. {result.notes && <span style={{ color: "#C9A227" }}> ({result.notes})</span>}
        </div>
      )}
    </div>
  );
}

function BuyModal({ onClose, onSave }) {
  const [form, setForm] = useState(newBuyTarget());

  const preview = useMemo(() => {
    return computeBuy({
      ...form,
      bidders: Number(form.bidders) || 0,
      watchers: Number(form.watchers) || 0,
      shipping: Number(form.shipping) || 0,
      currentBid: Number(form.currentBid) || 0,
      maxBudget: Number(form.maxBudget) || 0,
    });
  }, [form]);

  function submit(e) {
    if (e && e.preventDefault) e.preventDefault();
    onSave({
      ...form,
      player: form.player.trim() || "Unnamed card",
      bidders: Number(form.bidders) || 0,
      watchers: Number(form.watchers) || 0,
      shipping: Number(form.shipping) || 0,
      currentBid: form.currentBid === "" ? "" : Number(form.currentBid),
      maxBudget: Number(form.maxBudget) || 0,
      quantity: Number(form.quantity) || 1,
      outOf: form.numbered && form.outOf !== "" ? Number(form.outOf) : null,
    });
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title="New auction target" onClose={onClose} />
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <ListingPasteExtractor
            onExtracted={(parsed) =>
              setForm((f) => ({
                ...f,
                player: parsed.player || f.player,
                sport: SPORT_OPTIONS.includes(parsed.sport) ? parsed.sport : f.sport,
                cardNum: parsed.cardNum || f.cardNum,
                card: parsed.card || f.card,
                rookie: parsed.rookie ?? f.rookie,
                numbered: parsed.numbered ?? f.numbered,
                outOf: parsed.outOf ?? f.outOf,
                bidders: parsed.bidders ?? f.bidders,
                watchers: parsed.watchers ?? f.watchers,
                currentBid: parsed.currentBidAUD ?? f.currentBid,
                shipping: parsed.shippingAUD ?? f.shipping,
              }))
            }
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 10 }}>
            <Field label="Player">
              <input value={form.player} onChange={(e) => setForm({ ...form, player: e.target.value })} placeholder="e.g. Nick Daicos" />
            </Field>
            <Field label="Card #">
              <input value={form.cardNum} onChange={(e) => setForm({ ...form, cardNum: e.target.value })} />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 10 }}>
            <Field label="Card / set">
              <input value={form.card} onChange={(e) => setForm({ ...form, card: e.target.value })} />
            </Field>
            <Field label="Category">
              <select value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value, isPokemonInsert: e.target.value === "Pokémon" })}>
                {SPORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <RookieNumberedFields form={form} setForm={setForm} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Bidders"><input type="number" value={form.bidders} onChange={(e) => setForm({ ...form, bidders: e.target.value })} /></Field>
            <Field label="Watchers"><input type="number" value={form.watchers} onChange={(e) => setForm({ ...form, watchers: e.target.value })} /></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Raw or Graded">
              <select
                value={form.rawGraded}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({ ...form, rawGraded: val, gradingService: val === "Graded" ? "None" : "PSA via Australia" });
                }}
              >
                <option>Raw</option>
                <option>Graded</option>
              </select>
            </Field>
            <Field label="Grade Level (if graded)">
              <select value={form.psaLevel} onChange={(e) => setForm({ ...form, psaLevel: e.target.value })}>
                <option value="">—</option>
                {GRADE_OPTIONS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#A7ADBB" }}>
            <input type="checkbox" checked={form.isPokemonInsert} onChange={(e) => setForm({ ...form, isPokemonInsert: e.target.checked })} style={{ width: "auto" }} />
            Pokémon / insert (caps your budget at $25)
          </label>
          {form.player.trim() && (
            <CompFinder
              card={form}
              grade={buyGrade(form)}
              title="🔄 Get comps from CardSight"
              applyNoun="price"
              onApply={({ values, details }) => setForm((f) => ({ ...f, ...buyCompPatch(values, details) }))}
            />
          )}
          <div style={{ fontSize: 11.5, color: "#6B7180", marginTop: -6, marginBottom: -2 }}>
            Recent sales — up to 2 each, average used automatically. Fill in whichever tiers you have comps for, or get them from CardSight above.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <TierPriceInput label="Raw" sale1={form.rawSale1} sale2={form.rawSale2} onChange1={(v) => setForm({ ...form, rawSale1: v })} onChange2={(v) => setForm({ ...form, rawSale2: v })} />
            <TierPriceInput label="PSA 9" sale1={form.psa9Sale1} sale2={form.psa9Sale2} onChange1={(v) => setForm({ ...form, psa9Sale1: v })} onChange2={(v) => setForm({ ...form, psa9Sale2: v })} />
            <TierPriceInput label="PSA 10" sale1={form.psa10Sale1} sale2={form.psa10Sale2} onChange1={(v) => setForm({ ...form, psa10Sale1: v })} onChange2={(v) => setForm({ ...form, psa10Sale2: v })} />
          </div>
          {form.rawGraded === "Raw" ? (
            <Field label="Grading service (if you grade it after buying)">
              <select value={form.gradingService} onChange={(e) => setForm({ ...form, gradingService: e.target.value })}>
                {GRADING_SERVICE_OPTIONS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
          ) : (
            <div style={{ fontSize: 11.5, color: "#6B7180" }}>
              Already graded — no grading service or fee applies, set to None automatically.
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Shipping"><input type="number" step="0.01" value={form.shipping} onChange={(e) => setForm({ ...form, shipping: e.target.value })} /></Field>
            <Field label="Use ShipMyCards?">
              <select value={form.shipMyCards} onChange={(e) => setForm({ ...form, shipMyCards: e.target.value })}>
                <option value="None">No</option>
                <option value="ShipMyCards">Yes</option>
              </select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Current bid (optional)"><input type="number" step="0.01" value={form.currentBid} onChange={(e) => setForm({ ...form, currentBid: e.target.value })} /></Field>
            <Field label="Max budget for this card"><input type="number" step="0.01" value={form.maxBudget} onChange={(e) => setForm({ ...form, maxBudget: e.target.value })} /></Field>
          </div>

          <div style={{ border: "1px solid #C9A22755", borderRadius: 8, padding: "12px 14px", background: "#14161C" }}>
            <div style={{ fontSize: 11, color: "#8B90A0", textTransform: "uppercase", marginBottom: 8 }}>Calculated live</div>
            {preview.marketPrice > 0 ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <MiniStat label="Max snipe bid (ceiling)" value={fmtMoney(preview.maxSnipeBid)} color="#C9A227" emphasis />
                  <MiniStat label="Decision" value={preview.decision || "—"} color={preview.decision === "BUY" ? "#4E8B6B" : "#B4472E"} emphasis />
                </div>
                {form.rawGraded === "Raw" && (preview.rawGGRBuy != null || preview.gradedEVBuy != null) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                    <MiniStat label="Potential Raw GGR" value={preview.rawGGRBuy != null ? fmtMoney(preview.rawGGRBuy) : "—"} color={preview.rawGGRBuy >= 0 ? "#4E8B6B" : "#B4472E"} />
                    <MiniStat label="Potential Grading EV" value={preview.gradedEVBuy != null ? fmtMoney(preview.gradedEVBuy) : "—"} color={preview.gradedEVBuy >= 0 ? "#4E8B6B" : "#B4472E"} />
                  </div>
                )}
                <div style={{ fontSize: 11.5, color: "#6B7180" }}>
                  {form.currentBid
                    ? `Based on your current bid of ${fmtMoney(Number(form.currentBid))} — est. profit ${fmtMoney(preview.estProfit)}, ROI ${fmtPct(preview.roiPct)}.`
                    : "Add a current bid to see profit/ROI at that price — otherwise this assumes you pay the full ceiling."}
                  {form.rawGraded === "Raw" && (preview.rawGGRBuy != null || preview.gradedEVBuy != null) && " Grading EV already includes the selected grading service's fee."}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12, color: "#6B7180" }}>Enter a last eBay or 130 Point sale price to see your max bid.</div>
            )}
          </div>

          <button type="button" className="btnPrimary" onClick={submit} style={{ justifyContent: "center", marginTop: 6 }}>
            Add target
          </button>
        </form>
      </div>
    </div>
  );
}
