// ===== Quick Scan =====
// Phone-friendly single-card check for card shows and Marketplace: snap a photo, Gemini identifies
// the card, get its comps, and see the most to pay for it. Then add it to the Buy Evaluator, or
// to My Cards / Pokémon once bought.

const QUICK_SCAN_FEE_PCT = 0.13;

// A scanned card in the shape CompFinder and the rest of the app use.
function quickScanCardShape(c) {
  const parallel = /^base$/i.test(String(c.parallel_or_variant || "").trim()) ? "" : c.parallel_or_variant || "";
  return {
    id: "quickscan",
    player: c.player_name || "",
    card: [c.year, c.set_name, parallel].filter(Boolean).join(" "),
    cardNum: String(c.card_number || "").replace(/^#/, ""),
    sport: /pok[eé]mon/i.test(c.sport || "") ? "Pokémon" : c.sport || "",
    compSearch: {
      player_name: c.player_name || "",
      year: c.year || "",
      set_name: c.set_name || "",
      parallel_or_variant: c.parallel_or_variant || "Base",
      card_number: String(c.card_number || "").replace(/^#/, ""),
    },
  };
}

function QuickScan({ setBuyList, onAddToCollection }) {
  const [image, setImage] = useState(null); // { base64, mediaType, previewUrl }
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [cards, setCards] = useState(null);
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState({}); // { raw, psa9, psa10 } in A$ from comps
  const [asking, setAsking] = useState("");
  const [paid, setPaid] = useState("");
  const [done, setDone] = useState(null); // "buy" | "collection"
  const [targetProfitPct, setTargetProfitPct] = useState(() => {
    try {
      return localStorage.getItem("cardflip_ev_lot_target_profit") || "20";
    } catch (e) {
      return "20";
    }
  });

  const card = cards ? cards[index] : null;
  const grade = card && card.is_graded && card.grade ? String(card.grade).trim() : null;
  const tierKey = grade ? tierKeyForGrade(grade) : "raw";

  async function handleFile(file) {
    if (!file) return;
    setError(null);
    setCards(null);
    setValues({});
    setAsking("");
    setPaid("");
    setDone(null);
    const base64 = await fileToBase64(file);
    const img = { base64, mediaType: file.type || "image/jpeg", previewUrl: URL.createObjectURL(file) };
    setImage(img);
    setScanning(true);
    try {
      const res = await callDualEngineIdentify(img.base64, img.mediaType, LOT_SCANNER_PROMPT);
      const found = (res.cards || []).map((c) => ({ ...c, player_name: c.player_name || c.player || "Unknown Player" }));
      if (!found.length) throw new Error("No card recognised — try again closer, flat on, with less glare.");
      setCards(found);
      setIndex(0);
    } catch (e) {
      setError(e.message || "Couldn't identify the card — try a clearer photo.");
    } finally {
      setScanning(false);
    }
  }

  function updateCard(patch) {
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
    setValues({});
    setDone(null);
  }

  // What the card is worth: comps you applied, otherwise Gemini's rough estimate.
  const compValue = tierKey ? values[tierKey] : null;
  const estimate = card ? Number(card.estimated_value_aud) || null : null;
  const value = compValue ?? estimate;
  const fromComps = compValue != null;
  const profitRate = Math.max(0, Number(targetProfitPct) || 0) / 100;
  const maxOffer = value ? Math.max(0, (value * (1 - QUICK_SCAN_FEE_PCT)) / (1 + profitRate)) : null;
  const askingNum = Number(asking) || 0;

  function addToBuyEvaluator() {
    const shaped = quickScanCardShape(card);
    setBuyList((prev) => [
      {
        ...newBuyTarget(),
        player: shaped.player,
        sport: SPORT_OPTIONS.includes(shaped.sport) ? shaped.sport : "Other",
        card: shaped.card,
        cardNum: shaped.cardNum,
        rawGraded: grade ? "Graded" : "Raw",
        psaLevel: grade || "",
        gradingService: grade ? "None" : "PSA via Australia",
        currentBid: askingNum || "",
        rawSale1: values.raw != null ? String(values.raw) : "",
        psa9Sale1: values.psa9 != null ? String(values.psa9) : "",
        psa10Sale1: values.psa10 != null ? String(values.psa10) : "",
        compSearch: shaped.compSearch,
        isPokemonInsert: shaped.sport === "Pokémon",
      },
      ...prev,
    ]);
    setDone("buy");
  }

  function addToCollection() {
    // A blank "Paid" means you paid the asking price.
    const newCard = lotCardToCollectionCard(card, Number(paid) || askingNum || 0, "Quick scan");
    if (values.raw != null) newCard.rawAvg = values.raw;
    if (values.psa9 != null) newCard.psa9Avg = values.psa9;
    if (values.psa10 != null) newCard.psa10Avg = values.psa10;
    if (Object.keys(values).length) newCard.compsUpdatedAt = new Date().toISOString().slice(0, 10);
    onAddToCollection([newCard]);
    setDone("collection");
  }

  function updateTargetProfit(v) {
    setTargetProfitPct(v);
    try {
      localStorage.setItem("cardflip_ev_lot_target_profit", v);
    } catch (e) {}
  }

  const verdict =
    maxOffer == null || !askingNum
      ? null
      : askingNum <= maxOffer
      ? { color: "#4E8B6B", text: `✅ Buy — ${fmtMoney(maxOffer - askingNum)} under your max.` }
      : { color: "#B4472E", text: `❌ Too high — offer ${fmtMoney(Math.floor(maxOffer))} or walk away.` };

  return (
    <div style={{ marginTop: 20, maxWidth: 620 }}>
      <div style={{ fontSize: 12.5, color: "#8B90A0", marginBottom: 14, lineHeight: 1.6 }}>
        For card shows and Marketplace: snap one card, check its comps, and see the most you should pay. Works best on your phone — open the site there and tap below to use the camera.
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "18px 16px",
          border: "1px dashed #2FA89A88",
          borderRadius: 12,
          background: "#2FA89A10",
          color: "#2FA89A",
          fontSize: 16,
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 14,
        }}
      >
        📷 {image ? "Scan another card" : "Take or choose a photo"}
        <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files && e.target.files[0])} />
      </label>

      {image && (
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
          <img src={image.previewUrl} alt="Scanned card" style={{ width: 96, borderRadius: 8, border: "1px solid #2C303B", flexShrink: 0 }} />
          <div style={{ minWidth: 0, flex: 1 }}>
            {scanning && <div style={{ fontSize: 13, color: "#8B90A0" }}>Identifying the card…</div>}
            {error && <div style={{ fontSize: 12.5, color: "#B4472E" }}>{error}</div>}
            {card && (
              <>
                <div className="oswald" style={{ fontSize: 18, fontWeight: 600 }}>{card.player_name}</div>
                <div style={{ fontSize: 12.5, color: "#8B90A0" }}>
                  {[card.year, card.set_name, /^base$/i.test(card.parallel_or_variant || "") ? "" : card.parallel_or_variant].filter(Boolean).join(" ")}
                  {card.card_number ? ` · #${String(card.card_number).replace(/^#/, "")}` : ""}
                </div>
                {grade && (
                  <span className="mono" style={{ display: "inline-block", fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#8B6FD622", color: "#8B6FD6", marginTop: 4 }}>
                    {grade}
                  </span>
                )}
                {printedNameMismatch(card) && <div style={{ fontSize: 11.5, color: "#C9A227", marginTop: 4 }}>⚠️ The card reads "{card.printed_name}" — check the player.</div>}
                {cards.length > 1 && (
                  <div style={{ fontSize: 11.5, color: "#8B90A0", marginTop: 6 }}>
                    {cards.length} cards in the photo:{" "}
                    {cards.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setIndex(i);
                          setValues({});
                          setDone(null);
                        }}
                        style={{ background: i === index ? "#2FA89A33" : "transparent", border: "1px solid #333844", borderRadius: 999, color: "#EDEAE1", fontSize: 11, padding: "2px 8px", margin: "2px 4px 0 0", cursor: "pointer" }}
                      >
                        {c.player_name}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {card && (
        <>
          <details style={{ marginBottom: 12 }}>
            <summary style={{ fontSize: 12, color: "#8B90A0", cursor: "pointer" }}>✏️ Fix the details (add the card # from the back for exact comps)</summary>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginTop: 8 }}>
              {[
                ["player_name", "Player / name"],
                ["year", "Year"],
                ["set_name", "Set"],
                ["card_number", "Card #"],
                ["parallel_or_variant", "Parallel"],
                ["grade", "Grade (blank if raw)"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label style={{ fontSize: 10.5 }}>{label}</label>
                  <input
                    value={card[field] ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (field === "grade") {
                        const g = v.trim();
                        updateCard({ grade: g || null, is_graded: Boolean(g), grading_company: g ? g.split(/\s+/)[0].toUpperCase() : null });
                      } else updateCard({ [field]: v });
                    }}
                    style={{ padding: "6px 8px", fontSize: 13 }}
                  />
                </div>
              ))}
            </div>
          </details>

          <CompFinder
            key={`${index}-${card.player_name}-${card.card_number}-${card.set_name}-${card.grade}`}
            card={quickScanCardShape(card)}
            grade={grade}
            title="🔄 Comps"
            defaultOpen
            onApply={({ values: v }) => {
              setValues((prev) => ({ ...prev, ...v }));
              setDone(null);
            }}
          />

          <div style={{ border: "1px solid #C9A22766", borderRadius: 12, padding: "14px 16px", background: "#191B22", marginBottom: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <MiniStat label={`Value (${grade || "Raw"})`} value={value ? fmtMoney(value) : "—"} />
              <MiniStat label="Most to pay" value={maxOffer != null ? fmtMoney(maxOffer) : "—"} color="#C9A227" emphasis />
            </div>
            <div style={{ fontSize: 11, color: fromComps ? "#8B90A0" : "#C9A227", marginBottom: 10, lineHeight: 1.5 }}>
              {value == null
                ? "Get comps above (or apply prices by hand) to work out what to pay."
                : fromComps
                ? `From the comps you applied, after ${Math.round(QUICK_SCAN_FEE_PCT * 100)}% selling fees and ${Number(targetProfitPct) || 0}% profit.`
                : "⚠️ Based on Gemini's rough guess from the photo — get comps above before paying real money."}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Their asking price (A$)">
                <input type="number" inputMode="decimal" step="0.01" value={asking} onChange={(e) => setAsking(e.target.value)} placeholder="optional" />
              </Field>
              <Field label="Target profit (%)">
                <input type="number" inputMode="numeric" step="1" min="0" value={targetProfitPct} onChange={(e) => updateTargetProfit(e.target.value)} />
              </Field>
            </div>
            {verdict && <div style={{ fontSize: 14, fontWeight: 700, color: verdict.color, marginTop: 10 }}>{verdict.text}</div>}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
            <button className="btnSecondary" onClick={addToBuyEvaluator} disabled={done === "buy"}>
              {done === "buy" ? "Added ✓" : "+ Buy Evaluator"}
            </button>
            <Field label="Paid (A$)">
              <input type="number" inputMode="decimal" step="0.01" value={paid} onChange={(e) => setPaid(e.target.value)} placeholder={askingNum ? String(askingNum) : "0.00"} style={{ width: 110 }} />
            </Field>
            <button
              className="btnPrimary"
              onClick={addToCollection}
              disabled={done === "collection" || !(Number(paid) > 0 || askingNum > 0)}
            >
              {done === "collection" ? "Added ✓" : "Bought it → add to my cards"}
            </button>
          </div>
          {done === "collection" && (
            <div style={{ fontSize: 12, color: "#4E8B6B", marginTop: 8 }}>
              Added to {quickScanCardShape(card).sport === "Pokémon" ? "Pokémon" : "My Cards"}{Object.keys(values).length ? " with the comps you applied" : ""}.
            </div>
          )}
        </>
      )}
    </div>
  );
}
