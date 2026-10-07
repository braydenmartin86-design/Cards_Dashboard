// ===== Grade Check (AI photo assessment) =====

function fileToBase64(file, maxDimension = 1200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
        resolve(compressedDataUrl.split(",")[1]);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const GRADE_CHECK_PROMPT = `You are an experienced trading card grader. Examine the uploaded photo(s) of a single sports or Pokémon card the way a professional grader would: centering (front, and back if visible), all four corners, all four edges, and surface (scratches, print lines, staining, whitening).

The card may be photographed inside a toploader or penny sleeve rather than raw — this is common when cards are held remotely (e.g. a storage/forwarding vault) and photographed for the owner rather than shot loose. Toploaders add their own glare, reflection, and slight warping distinct from ordinary lighting issues, which can both hide real surface flaws and create false ones. If a sticker (inventory label, ID tag, etc.) is stuck to the toploader over any part of the card, you cannot assess whatever it's covering — say so explicitly rather than guessing at what's underneath, name which area is blocked (e.g. "top-right corner obscured by a sticker"), and treat that as a reason to lower confidence rather than skip past it.

Photo-based estimates run optimistic compared to real professional grading generally — lighting hides surface flaws, glare hides scratches, and print defects are often invisible at photo resolution. Be conservative and say so where relevant.

Respond with ONLY valid JSON, no markdown fences, no commentary outside the JSON, in exactly this shape:
{"centering":"short assessment","corners":"short assessment","edges":"short assessment","surface":"short assessment","predictedGradeLow":number,"predictedGradeHigh":number,"psa10Prob":number,"psa9Prob":number,"belowProb":number,"confidence":"Low"|"Medium"|"High","keyIssues":["short phrase", "short phrase"],"obstruction":"none, or what's blocked and by what (toploader glare, sticker, etc.)","summary":"one or two sentences"}
psa10Prob + psa9Prob + belowProb must sum to 1. predictedGradeLow/High are PSA-scale numbers (1-10). If a sticker or heavy glare blocks meaningful assessment of any area, confidence must be "Low" regardless of how clean the visible parts look.`;

const TREND_PROJECTION_CAP = 0.2;

function GradeCheck({ cards, pokemonCards, onUpdateCardIn }) {
  const [images, setImages] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [savedToCard, setSavedToCard] = useState(false);

  const [linkedId, setLinkedId] = useState("");
  const [form, setForm] = useState({
    player: "",
    card: "",
    paid: "",
    shipping: "",
    feesPct: 0.137,
    gradingService: "PSA via Australia",
    rawAvg: "",
    psa9Avg: "",
    psa10Avg: "",
    belowAvg: "",
  });

  // Cards you still hold. Listed and sold cards belong to My Sales, so they're left out.
  const allCards = useMemo(() => {
    const held = (c) => c.status !== "Sold" && c.status !== "Listed";
    const combined = [
      ...cards.filter(held).map((c) => ({ ...c, _src: "cards" })),
      ...pokemonCards.filter(held).map((c) => ({ ...c, _src: "pokemon" })),
    ];
    return combined.sort((a, b) => (a.player || "").localeCompare(b.player || ""));
  }, [cards, pokemonCards]);

  function linkCard(id) {
    setLinkedId(id);
    if (!id) return;
    const c = allCards.find((x) => x.id === id);
    if (!c) return;
    setForm((f) => ({
      ...f,
      player: c.player,
      card: c.card,
      paid: c.paid ?? f.paid,
      shipping: c.shipping ?? f.shipping,
      feesPct: c.feesPct ?? f.feesPct,
      gradingService: c.gradingService || f.gradingService,
      rawAvg: c.rawAvg ?? "",
      psa9Avg: c.psa9Avg ?? "",
      psa10Avg: c.psa10Avg ?? "",
    }));
  }

  const linkedCard = linkedId ? allCards.find((c) => c.id === linkedId) : null;
  const compsAge = linkedCard ? compsAgeDays(linkedCard) : null;

  // Comps found from CardSight fill the form, and are saved to the linked card too.
  function applyComps({ values, details, trend }) {
    setForm((f) => ({
      ...f,
      rawAvg: values.raw ?? f.rawAvg,
      psa9Avg: values.psa9 ?? f.psa9Avg,
      psa10Avg: values.psa10 ?? f.psa10Avg,
    }));
    if (linkedCard && onUpdateCardIn) {
      const { _src, ...card } = linkedCard;
      const updated = cardWithCompValues(card, values, details, trend);
      onUpdateCardIn(_src, card.id, updated);
    }
  }

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
    setResult(null);
    setSavedToCard(false);
    try {
      const firstImage = images[0];
      const rawAiResponse = await callGeminiAi(
        GRADE_CHECK_PROMPT, 
        firstImage ? firstImage.base64 : null, 
        firstImage ? firstImage.mediaType : "image/jpeg"
      );

      let parsed = rawAiResponse;
      if (typeof rawAiResponse === "string") {
        const cleanJsonText = rawAiResponse.replaceAll("```json", "").replaceAll("```", "").trim();
        parsed = JSON.parse(cleanJsonText);
      }

      setResult(parsed);
    } catch (e) {
      console.error(e);
      setError("Couldn't analyze the photo(s) — try again, or with clearer/brighter images.");
    } finally {
      setAnalyzing(false);
    }
  }

  const ev = useMemo(() => {
    if (!result) return null;
    const paid = Number(form.paid) || 0;
    const shipping = Number(form.shipping) || 0;
    const fees = Number(form.feesPct) || 0;
    const rawAvg = form.rawAvg === "" ? null : Number(form.rawAvg);
    const psa9Avg = form.psa9Avg === "" ? null : Number(form.psa9Avg);
    const psa10Avg = form.psa10Avg === "" ? null : Number(form.psa10Avg);
    const gCost = gradingCost(form.gradingService, Math.max(psa9Avg ?? 0, psa10Avg ?? 0));
    const belowAvg = form.belowAvg === "" ? rawAvg : Number(form.belowAvg);

    const totalCostRaw = paid + shipping;
    const totalCostGraded = paid + shipping + gCost;

    const rawProfit = rawAvg != null ? rawAvg * (1 - fees) - totalCostRaw : null;

    const haveGradedComps = psa9Avg != null || psa10Avg != null;
    let gradedProfit = null;
    let expectedRevenue = null;
    if (haveGradedComps) {
      expectedRevenue =
        (psa10Avg ?? 0) * (1 - fees) * result.psa10Prob +
        (psa9Avg ?? 0) * (1 - fees) * result.psa9Prob +
        (belowAvg ?? 0) * (1 - fees) * result.belowProb;
      gradedProfit = expectedRevenue - totalCostGraded;
    }

    const recommend = (graded) => {
      if (graded == null) return "Not enough data";
      if (graded <= 0) return "Don't grade";
      if (rawProfit != null && rawProfit >= graded) return "Sell raw instead";
      return "Worth grading";
    };
    const recommendation = recommend(gradedProfit);

    // Grading takes months. If the card's price trend keeps going the way it has over the last
    // 12 weeks, the graded sale happens at a different price than today's comps.
    const waitDays = estimateGradingTurnaroundDays(form.gradingService, Math.max(psa9Avg ?? 0, psa10Avg ?? 0, rawAvg ?? 0));
    const trendPoints = linkedCard && linkedCard.priceTrend && linkedCard.priceTrend.points;
    const trendPct = trendChangePct(trendPoints);
    let trendAdjusted = null;
    if (trendPct != null && waitDays && expectedRevenue != null) {
      const perDay = trendPct / (trendPoints.length * 7);
      // Stretching 12 weeks of trend over many months gets unrealistic fast, so it's capped.
      const projected = perDay * waitDays;
      const moveByThen = Math.max(-TREND_PROJECTION_CAP, Math.min(TREND_PROJECTION_CAP, projected));
      const profit = expectedRevenue * (1 + moveByThen) - totalCostGraded;
      trendAdjusted = { moveByThen, capped: moveByThen !== projected, profit, recommendation: recommend(profit) };
    }

    return { rawProfit, gradedProfit, expectedRevenue, gCost, totalCostGraded, recommendation, waitDays, trendAdjusted };
  }, [result, form, linkedCard]);

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontSize: 13, color: "#8B90A0", marginBottom: 16, lineHeight: 1.6 }}>
        Upload front/back photos and AI will assess condition the way a grader would, then run the same profit math as the rest of the app against your comps.
      </div>

      <SectionTitle>1. Photos (up to 4 — front, back, close-ups)</SectionTitle>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        {images.map((img, i) => (
          <div key={i} style={{ position: "relative", width: 84, height: 84, borderRadius: 8, overflow: "hidden", border: "1px solid #2C303B" }}>
            <img src={img.previewUrl} alt={img.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div onClick={() => removeImage(i)} style={{ position: "absolute", top: 2, right: 2, background: "#14161Cdd", borderRadius: 999, padding: 2, cursor: "pointer" }}>
              <X size={12} color="#EDEAE1" />
            </div>
          </div>
        ))}
        {images.length < 4 && (
          <label style={{ width: 84, height: 84, borderRadius: 8, border: "1px dashed #333844", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B7180" }}>
            <Plus size={20} />
            <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
          </label>
        )}
      </div>

      <SectionTitle>2. Card &amp; cost details</SectionTitle>
      {allCards.length > 0 && (
        <Field label="Link to an existing card (optional — auto-fills comps)">
          <select value={linkedId} onChange={(e) => linkCard(e.target.value)}>
            <option value="">— enter manually —</option>
            {allCards.map((c) => (
              <option key={c.id} value={c.id}>{c.player} — {c.card}</option>
            ))}
          </select>
        </Field>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        <Field label="Player"><input value={form.player} onChange={(e) => setForm({ ...form, player: e.target.value })} /></Field>
        <Field label="Card / set"><input value={form.card} onChange={(e) => setForm({ ...form, card: e.target.value })} /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
        <Field label="Paid"><input type="number" step="0.01" value={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.value })} /></Field>
        <Field label="Shipping"><input type="number" step="0.01" value={form.shipping} onChange={(e) => setForm({ ...form, shipping: e.target.value })} /></Field>
        <Field label="Fees %"><input type="number" step="0.001" value={form.feesPct} onChange={(e) => setForm({ ...form, feesPct: Number(e.target.value) })} /></Field>
      </div>
      <div style={{ marginTop: 10 }}>
        <Field label="Grading service">
          <select value={form.gradingService} onChange={(e) => setForm({ ...form, gradingService: e.target.value })}>
            {GRADING_SERVICE_OPTIONS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ fontSize: 11.5, color: "#6B7180", marginTop: 10, marginBottom: 4 }}>
        Market comps (leave blank if unknown)
        {linkedCard && (
          <span style={{ marginLeft: 8, color: compsAge == null || compsAge >= STALE_COMPS_DAYS ? "#C9A227" : "#4E8B6B" }}>
            {compsAge == null
              ? "· these values were never updated from recent sales — refresh them below before deciding"
              : compsAge >= STALE_COMPS_DAYS
              ? `· ⏱ updated ${compsAge} days ago — worth refreshing below`
              : `· updated ${compsAge === 0 ? "today" : `${compsAge} day${compsAge === 1 ? "" : "s"} ago`}`}
          </span>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
        <Field label="Raw avg"><input type="number" step="0.01" value={form.rawAvg} onChange={(e) => setForm({ ...form, rawAvg: e.target.value })} /></Field>
        <Field label="PSA 9 avg"><input type="number" step="0.01" value={form.psa9Avg} onChange={(e) => setForm({ ...form, psa9Avg: e.target.value })} /></Field>
        <Field label="PSA 10 avg"><input type="number" step="0.01" value={form.psa10Avg} onChange={(e) => setForm({ ...form, psa10Avg: e.target.value })} /></Field>
        <Field label="PSA 8-or-below avg"><input type="number" step="0.01" placeholder="≈ raw" value={form.belowAvg} onChange={(e) => setForm({ ...form, belowAvg: e.target.value })} /></Field>
      </div>
      {form.player.trim() && (
        <CompFinder
          card={linkedCard || { id: "gradecheck", player: form.player, card: form.card, cardNum: "", sport: "" }}
          grade={null}
          title="🔄 Update Comps"
          savedTrend={linkedCard && linkedCard.priceTrend}
          updatedAt={linkedCard && linkedCard.compsUpdatedAt}
          onApply={applyComps}
        />
      )}

      <button className="btnPrimary" onClick={analyze} disabled={images.length === 0 || analyzing} style={{ opacity: images.length === 0 || analyzing ? 0.5 : 1 }}>
        {analyzing ? "Analyzing…" : "Analyze grade"}
      </button>

      {error && <div style={{ fontSize: 12, color: "#B4472E", marginTop: 12 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 22 }}>
          <SectionTitle>Assessment</SectionTitle>
          <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "16px 18px", background: "#191B22", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div className="oswald" style={{ fontSize: 22, fontWeight: 700, color: "#C9A227" }}>
                PSA {result.predictedGradeLow}–{result.predictedGradeHigh}
              </div>
              <span className="mono" style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: "#5C7A9922", color: "#5C7A99" }}>
                {result.confidence} confidence
              </span>
            </div>
            <div style={{ fontSize: 13, color: "#C6CAD4", marginBottom: 12 }}>{result.summary}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <MiniStat label="Centering" value={result.centering} />
              <MiniStat label="Surface" value={result.surface} />
              <MiniStat label="Corners" value={result.corners} />
              <MiniStat label="Edges" value={result.edges} />
            </div>
            {result.obstruction && result.obstruction.toLowerCase() !== "none" && (
              <div style={{ fontSize: 12, color: "#C9A227", marginBottom: 12, background: "#C9A22715", border: "1px solid #C9A22740", borderRadius: 6, padding: "8px 10px" }}>
                ⚠️ <span style={{ fontWeight: 600 }}>Obstructed: </span>{result.obstruction}
              </div>
            )}
            {result.keyIssues && result.keyIssues.length > 0 && (
              <div style={{ fontSize: 12, color: "#A7ADBB", marginBottom: 12 }}>
                <span style={{ color: "#6B7180" }}>Flagged: </span>{result.keyIssues.join(" · ")}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <MiniStat label="PSA 10 chance" value={fmtPct(result.psa10Prob)} />
              <MiniStat label="PSA 9 chance" value={fmtPct(result.psa9Prob)} />
              <MiniStat label="PSA 8-or-below chance" value={fmtPct(result.belowProb)} />
            </div>
            {linkedId && onUpdateCardIn && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #24272F", display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  className="btnSecondary"
                  style={{ fontSize: 12, padding: "6px 12px" }}
                  onClick={() => {
                    const linked = allCards.find((c) => c.id === linkedId);
                    if (!linked) return;
                    onUpdateCardIn(linked._src, linked.id, { gradeAnalysis: result });
                    setSavedToCard(true);
                  }}
                >
                  💾 Save this assessment to the card
                </button>
                {savedToCard && <span style={{ fontSize: 11.5, color: "#4E8B6B" }}>Saved — Graded EV on this card now uses these actual probabilities.</span>}
              </div>
            )}
          </div>

          {ev && (
            <>
              <SectionTitle>Worth grading?</SectionTitle>
              <div
                style={{
                  border: `1px solid ${ev.recommendation === "Worth grading" ? "#4E8B6B55" : ev.recommendation === "Don't grade" ? "#B4472E55" : "#C9A22755"}`,
                  borderRadius: 10,
                  padding: "16px 18px",
                  background: ev.recommendation === "Worth grading" ? "#4E8B6B0f" : ev.recommendation === "Don't grade" ? "#B4472E0f" : "#14161C",
                }}
              >
                <div
                  className="oswald"
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 12,
                    color: ev.recommendation === "Worth grading" ? "#4E8B6B" : ev.recommendation === "Don't grade" ? "#B4472E" : "#C9A227",
                  }}
                >
                  {ev.recommendation}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                  <MiniStat label="Grading cost" value={fmtMoney(ev.gCost)} />
                  <MiniStat label="Sell raw now" value={ev.rawProfit != null ? fmtMoney(ev.rawProfit) : "—"} color={ev.rawProfit != null ? (ev.rawProfit >= 0 ? "#4E8B6B" : "#B4472E") : undefined} />
                  <MiniStat label="Expected profit if graded" value={ev.gradedProfit != null ? fmtMoney(ev.gradedProfit) : "—"} color={ev.gradedProfit != null ? (ev.gradedProfit >= 0 ? "#4E8B6B" : "#B4472E") : undefined} emphasis />
                </div>
                <div style={{ fontSize: 12, color: "#A7ADBB", lineHeight: 1.7 }}>
                  {ev.waitDays ? (
                    <div>
                      ⏳ Expected wait with {form.gradingService}: about {ev.waitDays >= 60 ? `${Math.round(ev.waitDays / 30)} months` : `${ev.waitDays} days`} before you can sell graded — selling raw gets you paid now.
                    </div>
                  ) : null}
                  {ev.trendAdjusted ? (
                    <div>
                      📈 Price trend: {trendChangeText(linkedCard.priceTrend.points).replace(/^ · /, "")}. If it keeps moving like that, prices would be about{" "}
                      {ev.trendAdjusted.moveByThen >= 0 ? "+" : "−"}
                      {Math.round(Math.abs(ev.trendAdjusted.moveByThen) * 100)}%{ev.trendAdjusted.capped ? " (capped)" : ""} by the time it's graded →{" "}
                      <span style={{ fontWeight: 700, color: ev.trendAdjusted.profit >= 0 ? "#4E8B6B" : "#B4472E" }}>{fmtMoney(ev.trendAdjusted.profit)}</span> expected profit if graded.
                      {ev.trendAdjusted.recommendation !== ev.recommendation && (
                        <span style={{ color: "#C9A227" }}> With the trend, the call becomes "{ev.trendAdjusted.recommendation}".</span>
                      )}
                      <div style={{ fontSize: 11, color: "#6B7180" }}>Trends don't always continue — treat this as a warning sign, not a forecast.</div>
                    </div>
                  ) : linkedCard ? (
                    <div style={{ fontSize: 11, color: "#6B7180" }}>No price trend saved for this card yet — "Update Comps" → "CardSight Comps" above fetches one when CardSight can match the card.</div>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Zero-Cost Local "Card Magic" Enhancer for eBay / Instagram photos
function processCardMagicImage(file, brightness = 1.08, contrast = 1.12) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        // Apply photo enhancements
        ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(1.05)`;
        ctx.drawImage(img, 0, 0);

        resolve(canvas.toDataURL("image/jpeg", 0.90));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
