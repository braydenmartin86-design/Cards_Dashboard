// ===== Lot Scanner (AI bulk card identification) =====

const LOT_SCANNER_PROMPT = `You are an expert sports card identification assistant and pricing analyst.

Analyze the image provided and identify every sports card visible in the lot with maximum detail.

Instructions:
1. Identify EVERY card present in the image individually.
2. IGNORE background elements like sticky notes, handwritten timestamps, coin tags, top loaders, magnetic cases, or tabletop textures.
3. Inspect fine visual details carefully: parallel patterns (e.g., Orange Basketball/Geometric, Refractor, Silver Prizm, Cracked Ice, Holo), serial numbering, card numbers, RC logos, autographs, and set years.
4. Read the player's name from the text printed on the card (or the grading label). Never infer the player from the team, jersey or photo — two players on the same team are easy to confuse. If the printed name is only a surname (e.g. "YAO"), use the player it belongs to. If you can't read a name, give your best guess and set "value_confidence" to "Low".
5. Only fill "card_number" if the number is actually visible in the photo (usually only on grading labels, since raw cards print it on the back). Otherwise use null — never guess a card number.
6. Identify the set from what is printed on the card, not from the player or design style: read the manufacturer and product logo on the card face (e.g., "Topps Chrome", "Panini Prizm", "Donruss", "Select", "Mosaic", "Hoops", "Upper Deck"). Topps and Panini are different manufacturers — never call a Topps card "Panini" or vice versa. Never use a generic set name like "Panini Basketball".
7. For graded slabs, copy the year, set, card number, parallel and grade exactly as printed on the grading label — the label is more reliable than the card design.
8. If a serial number is visible (e.g., "11/50"), include the print run in the parallel (e.g., "Gold /50").
9. If you can't read the set or year with confidence, give your best guess and set "value_confidence" to "Low".
10. For each detected card, return an object in a JSON array with the following fields:
   - "player_name": Full name of the athlete
   - "sport": e.g., "NFL", "NBA", "MLB", "AFL", "WWE", "Soccer", "MMA"
   - "year": Release year of the card set (e.g., "2025-26")
   - "set_name": Brand and product set name (e.g., "Topps Chrome", "Panini Prizm")
   - "card_number": Card number sequence if visible (e.g., "#338" or null)
   - "parallel_or_variant": Exact variant/parallel (e.g., "Orange Basketball Parallel", "Refractor", "Base", "Silver Prizm")
   - "is_graded": true or false
   - "grading_company": e.g., "PSA", "BGS", "SGC", or null
   - "grade": Grade number string (e.g., "PSA 10") or null
   - "ebay_search_query": Clean eBay search query (e.g., "2025-26 Topps Chrome Cooper Flagg Orange Basketball RC")
   - "estimated_value_aud": Estimated market value in AUD as a number
   - "value_confidence": "Low", "Medium", or "High"

IMPORTANT: Return ONLY the raw JSON array. Do not include markdown code blocks like \`\`\`json or any conversational intro/outro text.`;

function LotScanner({ setTargets, setBuyList, savedScans, setSavedScans }) {
  const [images, setImages] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [addedState, setAddedState] = useState({});
  const [lotCost, setLotCost] = useState("");
  const [lotShipping, setLotShipping] = useState("");
  const [loadedScanId, setLoadedScanId] = useState(null);
  const [showSavedList, setShowSavedList] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [lotLink, setLotLink] = useState("");
  const [verifyingIndex, setVerifyingIndex] = useState(null);

  function saveScan() {
    if (!results || results.length === 0) return;
    const name = saveName.trim() || `Lot scan ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short" })}`;
    const scan = {
      id: loadedScanId || crypto.randomUUID(),
      name,
      dateSaved: new Date().toISOString().slice(0, 10),
      link: lotLink.trim() || null,
      results,
      lotCost,
      lotShipping,
    };
    setSavedScans((prev) => {
      const exists = prev.some((s) => s.id === scan.id);
      return exists ? prev.map((s) => (s.id === scan.id ? scan : s)) : [scan, ...prev];
    });
    setLoadedScanId(scan.id);
    setSaveName(name);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2500);
  }

  function loadScan(scan) {
    setResults(scan.results);
    setLotCost(scan.lotCost ?? "");
    setLotShipping(scan.lotShipping ?? "");
    setLoadedScanId(scan.id);
    setSaveName(scan.name || "");
    setLotLink(scan.link || "");
    setAddedState({});
    setImages([]);
    setShowSavedList(false);
  }

  function deleteScan(targetScan) {
    const targetId = typeof targetScan === "object" ? targetScan.id : targetScan;
    const targetName = typeof targetScan === "object" ? targetScan.name : null;

    if (!window.confirm("Are you sure you want to delete this saved scan?")) return;

    setSavedScans((prev) => {
      const updated = prev.filter((s) => {
        if (targetId && s.id) return s.id !== targetId;
        if (targetName && s.name) return s.name !== targetName;
        return s !== targetScan;
      });

      try {
        localStorage.setItem("lotScans", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to update localStorage", err);
      }
      return updated;
    });

    if (loadedScanId === targetId) setLoadedScanId(null);
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

 async function scanLot() {
  if (images.length === 0) return;
  setLoadedScanId(null);
  setSaveName("");
  setLotLink("");
  setScanning(true);
  setError(null);
  setResults(null);
  setAddedState({});

  try {
    const firstImage = images[0];
    const engineResponse = await callDualEngineIdentify(
      firstImage.base64, 
      firstImage.mediaType, 
      LOT_SCANNER_PROMPT
    );

    // Store the base image source on each card for targeted CardSight re-verification
    const taggedCards = engineResponse.cards.map((c) => ({
      ...c,
      player_name: c.player_name || c.player || "Unknown Player",
      _rawBase64: firstImage.base64,
      _engineSource: engineResponse.source,
    }));

    setResults(taggedCards);
  } catch (e) {
    console.error(e);
    setError("Couldn't identify the cards in that photo — try a clearer shot.");
  } finally {
    setScanning(false);
  }
}

  // Corrections to what Gemini read. The old verified price no longer applies, and the eBay
  // search text is rebuilt from the corrected details.
  function updateCardDetails(idx, patch) {
    setResults((prev) =>
      prev.map((c, i) => {
        if (i !== idx) return c;
        const next = { ...c, ...patch, _priceSource: null, _pricedAs: null, _sales: null, _priceNote: null };
        if ("grade" in patch) {
          const grade = String(patch.grade || "").trim();
          next.grade = grade || null;
          next.is_graded = Boolean(grade);
          next.grading_company = grade ? grade.split(/\s+/)[0].toUpperCase() : null;
        }
        next.ebay_search_query = [next.year, next.set_name, next.player_name, next.card_number ? `#${String(next.card_number).replace(/^#/, "")}` : "", /^base$/i.test(next.parallel_or_variant || "") ? "" : next.parallel_or_variant, next.grade]
          .filter(Boolean)
          .join(" ");
        return next;
      })
    );
  }

  function updateCardValue(idx, newValue) {
    setResults((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, estimated_value_aud: newValue === "" ? null : Number(newValue), value_confidence: "Manual" } : c))
    );
  }

  async function handleVerifyCard(index, card) {
    setVerifyingIndex(index);

    const res = await verifyPriceWithCardSight(card);

    if (res.success && res.priceAud) {
      setResults((prevResults) => {
        const updated = [...prevResults];
        updated[index] = {
          ...updated[index],
          estimated_value_aud: res.priceAud,
          _priceSource: res.source,
          _pricedAs: res.pricedAs || null,
          _sales: res.sales || null,
          _priceNote: res.note || null,
          value_confidence: res.confidence || "Verified",
        };
        return updated;
      });
    } else {
      alert(`CardSight Valuation: ${res.error || "Could not find live comp price."}`);
    }

    setVerifyingIndex(null);
  }

  function addToBuyEvaluator(card, idx) {
    const target = {
      ...newBuyTarget(),
      player: card.player_name || "",
      sport: SPORT_OPTIONS.includes(card.sport) ? card.sport : "Other",
      card: [card.year, card.set_name, card.parallel_or_variant].filter(Boolean).join(" "),
      cardNum: (card.card_number || "").toString().replace(/^#/, ""),
      rawGraded: card.is_graded ? "Graded" : "Raw",
      psaLevel: card.is_graded ? card.grade || "" : "",
      gradingService: card.is_graded ? "None" : "PSA via Australia",
    };
    setBuyList((prev) => [target, ...prev]);
    setAddedState((prev) => ({ ...prev, [idx]: "buy" }));
  }

  function addToMonthlyTargets(card, idx) {
    const target = {
      ...newTarget(),
      player: card.player_name || "",
      sport: SPORT_OPTIONS.includes(card.sport) ? card.sport : "Other",
      cardToLookFor: [card.year, card.set_name, card.parallel_or_variant].filter(Boolean).join(" "),
      reasoning: "Identified via Lot Scanner — worth researching before deciding.",
      tier: "Speculative",
    };
    setTargets((prev) => [target, ...prev]);
    setAddedState((prev) => ({ ...prev, [idx]: "targets" }));
  }

  const totalGrossValue = useMemo(() => (results || []).reduce((s, c) => s + (Number(c.estimated_value_aud) || 0), 0), [results]);
  const potentialProfit = lotCost !== "" ? totalGrossValue - Number(lotCost) - (Number(lotShipping) || 0) : null;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontSize: 13, color: "#8B90A0", marginBottom: 16, lineHeight: 1.6 }}>
        Upload a photo of a lot or box of cards and AI identifies each one — player, set, parallel, card number, and whether it's graded — plus a ready-made eBay search and a rough value estimate for each.
        <span style={{ color: "#C9A227" }}> These are AI best-guesses from a photo, not verified</span> — double-check anything before relying on it, especially card numbers and parallels.
      </div>

      {savedScans.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <button className="btnSecondary" onClick={() => setShowSavedList((v) => !v)} style={{ marginBottom: showSavedList ? 10 : 0 }}>
            📁 Saved scans ({savedScans.length}) {showSavedList ? "▲" : "▼"}
          </button>
          {showSavedList && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {savedScans.map((scan) => {
                const scanTotal = (scan.results || []).reduce((s, c) => s + (Number(c.estimated_value_aud) || 0), 0);
                return (
                  <div key={scan.id || scan.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #2C303B", borderRadius: 8, padding: "10px 14px", background: "#191B22" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{scan.name}</div>
                      <div style={{ fontSize: 11.5, color: "#6B7180" }}>
                        {scan.dateSaved} · {(scan.results || []).length} card{(scan.results || []).length === 1 ? "" : "s"} · {fmtMoney(scanTotal)} est. value
                      </div>
                      {scan.link && (
                        <a href={scan.link} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#5C7A99" }} onClick={(e) => e.stopPropagation()}>
                          Open listing ↗
                        </a>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button className="btnSecondary" style={{ fontSize: 11.5, padding: "5px 10px" }} onClick={() => loadScan(scan)}>
                        View
                      </button>
                      <button
                        type="button"
                        title="Delete scan"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteScan(scan);
                        }}
                        style={{
                          background: "transparent",
                          border: "1px solid #3A2329",
                          borderRadius: 6,
                          color: "#EF4444",
                          cursor: "pointer",
                          padding: "5px 8px",
                          fontSize: 12,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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

      <button className="btnPrimary" onClick={scanLot} disabled={images.length === 0 || scanning} style={{ opacity: images.length === 0 || scanning ? 0.5 : 1 }}>
        {scanning ? "Scanning…" : "Scan lot"}
      </button>

      {error && <div style={{ fontSize: 12, color: "#B4472E", marginTop: 12 }}>{error}</div>}

      {results && (
        <div style={{ marginTop: 22 }}>
          <SectionTitle>{results.length} card{results.length === 1 ? "" : "s"} identified</SectionTitle>

          <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", marginBottom: 16, background: "#191B22" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <Field label="Name this scan">
                <input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder={`Lot scan ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short" })}`} />
              </Field>
              <Field label="Listing link (optional)">
                <input value={lotLink} onChange={(e) => setLotLink(e.target.value)} placeholder="Paste the Facebook Marketplace/eBay link" />
              </Field>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="btnPrimary" type="button" onClick={saveScan}>
                💾 {loadedScanId ? "Update saved scan" : "Save this scan"}
              </button>
              {saveFlash && <span style={{ fontSize: 12, color: "#4E8B6B" }}>Saved ✓</span>}
            </div>
          </div>

          {results.length > 0 && (
            <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "16px 18px", marginBottom: 16, background: "#191B22" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12, alignItems: "end" }}>
                <MiniStat label="Est. gross value" value={fmtMoney(totalGrossValue)} />
                <Field label="What will you pay for the lot?">
                  <input type="number" step="0.01" placeholder="0.00" value={lotCost} onChange={(e) => setLotCost(e.target.value)} />
                </Field>
                <Field label="Shipping (Facebook Marketplace)">
                  <input type="number" step="0.01" placeholder="e.g. 7.50" value={lotShipping} onChange={(e) => setLotShipping(e.target.value)} />
                </Field>
                <MiniStat
                  label="Potential profit"
                  value={lotCost !== "" ? fmtMoney(potentialProfit) : "—"}
                  color={lotCost !== "" ? (potentialProfit >= 0 ? "#4E8B6B" : "#B4472E") : undefined}
                  emphasis
                />
              </div>
              <div style={{ fontSize: 11, color: "#C9A227", lineHeight: 1.6 }}>
                ⚠️ These values are AI best-guesses from general hobby knowledge, not live sold prices. Verify anything expensive via search links before committing to buy.
              </div>
            </div>
          )}

          {results.length === 0 ? (
            <div style={{ padding: "2rem 0", textAlign: "center", color: "#5C6270", border: "1px solid #2C303B", borderRadius: 10 }}>
              No cards recognized in that photo — try a clearer shot.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {results.map((card, i) => (
                <LotScannerCard
                  key={i}
                  card={card}
                  added={addedState[i]}
                  isVerifying={verifyingIndex === i}
                  onVerify={() => handleVerifyCard(i, card)}
                  onAddBuy={() => addToBuyEvaluator(card, i)}
                  onAddTarget={() => addToMonthlyTargets(card, i)}
                  onValueChange={(v) => updateCardValue(i, v)}
                  onDetailsChange={(patch) => updateCardDetails(i, patch)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Search text built from the card's details rather than Gemini's free-form phrase, so it names
// the exact card: year, set, player, card number, parallel and grade. eBay only shows listings
// containing every word, so a long parallel name (worded differently by many sellers) is
// dropped when the card number already pins the card down. `exclusions` adds eBay's "-word"
// filters to hide graded copies of a raw card, autographs and patches.
function cardSearchText(card, exclusions) {
  const p = cardProfile(card);
  if (!card.player_name) return card.ebay_search_query || "";
  const variantWords = p.number && p.variant.split(" ").length > 2 ? "" : p.variant;
  const words = [
    p.year,
    card.set_name,
    card.player_name,
    p.number,
    variantWords,
    p.isAuto && !/\bauto\b/.test(variantWords) ? "auto" : "",
    p.grade ? `${p.grade.company || ""} ${p.grade.value}` : "",
  ];
  if (exclusions) {
    if (!p.grade) words.push("-psa -bgs -sgc -cgc");
    if (!p.isAuto) words.push("-auto");
    if (!p.isRelic) words.push("-patch");
  }
  return words.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

function LotScannerCard({ card, added, isVerifying, onVerify, onAddBuy, onAddTarget, onValueChange, onDetailsChange }) {
  const [copyState, setCopyState] = useState("idle");
  const [editing, setEditing] = useState(false);
  const ebaySearch = cardSearchText(card, true);
  const plainSearch = cardSearchText(card, false);
  // Opens sold listings (not current ones), for checking comps by hand.
  const ebayUrl = ebaySearch ? `https://www.ebay.com.au/sch/i.html?_nkw=${encodeURIComponent(ebaySearch)}&LH_Sold=1&LH_Complete=1` : null;
  const point130Url = plainSearch ? `https://130point.com/sales/?search=${encodeURIComponent(plainSearch)}` : null;

  async function copy() {
    const ok = await copyToClipboard(ebaySearch);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => setCopyState("idle"), 2000);
  }

  return (
    <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22" }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
        {card._engineSource && (
          <span
            className="mono"
            style={{
              fontSize: 9.5,
              padding: "2px 6px",
              borderRadius: 4,
              background: card._engineSource.includes("CardSight") ? "#2FA89A22" : "#C9A22722",
              color: card._engineSource.includes("CardSight") ? "#2FA89A" : "#C9A227",
              border: `1px solid ${card._engineSource.includes("CardSight") ? "#2FA89A40" : "#C9A22740"}`,
              display: "inline-block",
            }}
          >
            ⚡ Powered by {card._engineSource}
          </span>
        )}
        {card._priceSource && (
          <span
            className="mono"
            style={{
              fontSize: 9.5,
              padding: "2px 6px",
              borderRadius: 4,
              background: card._priceSource.startsWith("Gemini") ? "#C9A22722" : "#4E8B6B22",
              color: card._priceSource.startsWith("Gemini") ? "#C9A227" : "#4E8B6B",
              border: `1px solid ${card._priceSource.startsWith("Gemini") ? "#C9A22740" : "#4E8B6B40"}`,
              display: "inline-block",
            }}
          >
            {card._priceSource.startsWith("Gemini") ? "≈" : "✓"} {card._priceSource}
          </span>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div className="oswald" style={{ fontSize: 15, fontWeight: 600 }}>
            {card.player_name || "Unknown player"}
            <span className="mono" style={{ fontSize: 10, color: "#6B7180", marginLeft: 8 }}>{SPORT_EMOJI[card.sport] || "🎴"} {card.sport}</span>
          </div>
          <div style={{ fontSize: 12, color: "#6B7180" }}>
            {[card.year, card.set_name, card.parallel_or_variant].filter(Boolean).join(" ")}
            {card.card_number ? ` · ${card.card_number}` : ""}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {card.is_graded && (
            <span className="mono" style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: "#8B6FD622", color: "#8B6FD6", display: "inline-block", marginBottom: 6 }}>
              {card.grading_company} {card.grade}
            </span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
            <span style={{ color: "#C9A227", fontSize: 15, fontWeight: 700 }}>$</span>
            <input
              type="number"
              step="0.01"
              value={card.estimated_value_aud ?? ""}
              onChange={(e) => onValueChange(e.target.value)}
              placeholder="0.00"
              title="Edit if the AI estimate looks off"
              style={{ width: 78, padding: "3px 6px", fontSize: 15, fontWeight: 700, color: "#C9A227", textAlign: "right", background: "#14161C", border: "1px solid #333844", borderRadius: 5 }}
            />
          </div>
          <div className="mono" style={{ fontSize: 9, color: "#6B7180", marginTop: 3 }}>{card.value_confidence || "Low"} confidence</div>
        </div>
      </div>

      {editing && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, background: "#14161C", border: "1px solid #2C303B", borderRadius: 6, padding: 10, marginBottom: 10 }}>
          {[
            ["player_name", "Player"],
            ["year", "Year (e.g. 2022-23)"],
            ["set_name", "Set (e.g. Topps Chrome)"],
            ["card_number", "Card #"],
            ["parallel_or_variant", "Parallel (Base if none)"],
            ["grade", "Grade (blank if raw)"],
          ].map(([field, label]) => (
            <div key={field}>
              <label style={{ fontSize: 10.5 }}>{label}</label>
              <input
                value={card[field] ?? ""}
                onChange={(e) => onDetailsChange({ [field]: e.target.value })}
                placeholder={field === "grade" ? "e.g. PSA 10" : ""}
                style={{ padding: "5px 8px", fontSize: 12.5 }}
              />
            </div>
          ))}
          <div style={{ gridColumn: "1 / -1", fontSize: 11, color: "#6B7180" }}>
            Fix anything Gemini read wrong, then Verify Price and the eBay link use these details. For raw cards the card # is
            usually on the back — adding it gives the most exact matches.
          </div>
        </div>
      )}

      {(card._sales || card._priceNote) && (
        <div style={{ fontSize: 11, color: "#8B90A0", background: "#14161C", border: "1px solid #2C303B", borderRadius: 6, padding: "8px 10px", marginBottom: 10, lineHeight: 1.6 }}>
          {card._pricedAs && <div style={{ color: "#A7ADBB", marginBottom: 2 }}>Priced as: {card._pricedAs}</div>}
          {card._sales &&
            card._sales.map((s, i) => (
              <div key={i}>
                {new Date(s.date).toLocaleDateString()} · US${s.priceUsd.toFixed(2)} (≈ A${convertUsdToAud(s.priceUsd).toFixed(2)})
                {s.title && <span style={{ color: "#6B7180" }}> · {s.title.length > 70 ? s.title.slice(0, 70) + "…" : s.title}</span>}
                {s.url && (
                  <a href={s.url} target="_blank" rel="noreferrer" style={{ color: "#2FA89A", marginLeft: 6 }}>
                    listing
                  </a>
                )}
              </div>
            ))}
          {card._priceNote && <div>{card._priceNote}</div>}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button
          className="btnSecondary"
          style={{ fontSize: 11.5, padding: "5px 10px", borderColor: "#2FA89A66", color: "#2FA89A" }}
          onClick={onVerify}
          disabled={isVerifying}
        >
          {isVerifying ? "Verifying..." : "⚡ Verify Price (CardSight)"}
        </button>
        <button className="btnSecondary" style={{ fontSize: 11.5, padding: "5px 10px" }} onClick={() => setEditing((v) => !v)}>
          {editing ? "Done editing" : "✏️ Edit details"}
        </button>

        <button className="btnSecondary" style={{ fontSize: 11.5, padding: "5px 10px", display: "flex", alignItems: "center", gap: 6 }} onClick={copy}>
          {copyState === "copied" ? <Check size={12} /> : <Copy size={12} />} {copyState === "copied" ? "Copied" : "Copy search"}
        </button>
        {ebayUrl && (
          <a href={ebayUrl} target="_blank" rel="noreferrer" className="btnSecondary" style={{ fontSize: 11.5, padding: "5px 10px", textDecoration: "none" }}>
            eBay sold
          </a>
        )}
        {point130Url && (
          <a href={point130Url} target="_blank" rel="noreferrer" className="btnSecondary" style={{ fontSize: 11.5, padding: "5px 10px", textDecoration: "none" }}>
            Search 130 Point
          </a>
        )}
        <button className="btnSecondary" style={{ fontSize: 11.5, padding: "5px 10px" }} onClick={onAddBuy} disabled={added === "buy"}>
          {added === "buy" ? "Added ✓" : "+ Buy Evaluator"}
        </button>
        <button className="btnSecondary" style={{ fontSize: 11.5, padding: "5px 10px" }} onClick={onAddTarget} disabled={added === "targets"}>
          {added === "targets" ? "Added ✓" : "+ Monthly Targets"}
        </button>
      </div>
    </div>
  );
}
