// App shell: state, persistence wiring, header and tab routing.

function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [cards, setCards] = useState([]);
  const [pokemonCards, setPokemonCards] = useState([]);
  const [buyList, setBuyList] = useState([]);
  const [boxBreaks, setBoxBreaks] = useState([]);
  const [targets, setTargets] = useState([]);
  const [contentPlan, setContentPlan] = useState([]);
  const [contentGoal, setContentGoal] = useState(DEFAULT_CONTENT_GOAL);
  const [backupStatus, setBackupStatus] = useState(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [manualExpenses, setManualExpenses] = useState([]);
  const [savedScans, setSavedScans] = useState([]);
  const [tab, setTab] = useState("home");
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [decisionFilter, setDecisionFilter] = useState("all");
  const [sportFilter, setSportFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  // Re-render when the live USD→AUD rate arrives, so on-screen conversions use it.
  const [, setFxTick] = useState(0);
  useEffect(() => onExchangeRateChange(() => setFxTick((t) => t + 1)), []);

  // Prevent the mouse scroll wheel from silently changing a focused number input's value —
  // a common browser default that causes accidental edits while scrolling past a field.
  useEffect(() => {
    function blurNumberInputOnWheel() {
      if (document.activeElement && document.activeElement.tagName === "INPUT" && document.activeElement.type === "number") {
        document.activeElement.blur();
      }
    }
    document.addEventListener("wheel", blurNumberInputOnWheel, { passive: true });
    return () => document.removeEventListener("wheel", blurNumberInputOnWheel);
  }, []);

  // Loads everything once on mount, from Claude.ai's per-user persistent storage when running
  // as an artifact (syncs automatically across every device/session on the same account), or
  // from localStorage if hosted standalone. Nothing is saved until this finishes, so a fresh
  // device never has a chance to overwrite real synced data with empty defaults.
  // Re-runs on sign-in/out and whenever this tab regains focus, so a device that was left open
  // picks up changes made on another device. Unchanged data isn't re-saved (see storageSet).
  useEffect(() => {
    let cancelled = false;
    let loading = false;
    async function loadAll() {
      if (loading) return;
      loading = true;
      try {
        await loadAllOnce();
      } finally {
        loading = false;
      }
    }
    async function loadAllOnce() {
      const [
        loadedCards, loadedPokemon, loadedBuyList, loadedBoxBreaks,
        loadedTargets, loadedContentPlan, loadedContentGoal,
        loadedManualExpenses, loadedSavedScans,
      ] = await Promise.all([
        storageGet(STORAGE_KEY),
        storageGet(POKEMON_STORAGE_KEY),
        storageGet(BUY_STORAGE_KEY),
        storageGet(BOX_STORAGE_KEY),
        storageGet(TARGETS_STORAGE_KEY),
        storageGet(CONTENT_STORAGE_KEY),
        storageGet(CONTENT_GOAL_STORAGE_KEY),
        storageGet(MANUAL_EXPENSES_STORAGE_KEY),
        storageGet(SAVED_SCANS_STORAGE_KEY),
      ]);
      if (cancelled) return;
      setCards(loadedCards ?? DEFAULT_CARDS());
      setPokemonCards(loadedPokemon ?? DEFAULT_POKEMON());
      setBuyList(loadedBuyList ?? []);
      setBoxBreaks(loadedBoxBreaks ?? []);
      setTargets(loadedTargets ?? DEFAULT_TARGETS());
      setContentPlan(loadedContentPlan ?? []);
      setContentGoal(loadedContentGoal ?? DEFAULT_CONTENT_GOAL);
      setManualExpenses(loadedManualExpenses ?? []);
      setSavedScans(loadedSavedScans ?? []);
      setDataLoaded(true);
      await markCloudSynced();
    }
    loadAll();

    function onVisible() {
      if (document.visibilityState === "visible") loadAll();
    }
    document.addEventListener("visibilitychange", onVisible);

    let authSub = null;
    if (supabaseClient) {
      const { data } = supabaseClient.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
          if (event === "SIGNED_OUT") setCloudSyncStatus({ state: "off" });
          // Deferred: Supabase can deadlock if its own calls run inside this callback.
          setTimeout(loadAll, 0);
        }
      });
      authSub = data?.subscription;
    }

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      if (authSub) authSub.unsubscribe();
    };
  }, []);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  // Every save effect is gated on dataLoaded — without this, the initial empty-array state
  // would fire a save on first render, overwriting real synced data with nothing before the
  // actual load even finishes.
  useEffect(() => {
    if (dataLoaded) storageSet(STORAGE_KEY, cards);
  }, [cards, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) storageSet(POKEMON_STORAGE_KEY, pokemonCards);
  }, [pokemonCards, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) storageSet(BUY_STORAGE_KEY, buyList);
  }, [buyList, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) storageSet(BOX_STORAGE_KEY, boxBreaks);
  }, [boxBreaks, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) storageSet(TARGETS_STORAGE_KEY, targets);
  }, [targets, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) storageSet(CONTENT_STORAGE_KEY, contentPlan);
  }, [contentPlan, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) storageSet(CONTENT_GOAL_STORAGE_KEY, contentGoal);
  }, [contentGoal, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) storageSet(MANUAL_EXPENSES_STORAGE_KEY, manualExpenses);
  }, [manualExpenses, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) storageSet(SAVED_SCANS_STORAGE_KEY, savedScans);
  }, [savedScans, dataLoaded]);

  // Switches dataset automatically based on the selected tab
const isPokemon = tab === "pokemon";
const activeCards = isPokemon ? (pokemonCards || []) : (cards || []);
  const setActiveCards = isPokemon ? setPokemonCards : setCards;
  const computeFn = isPokemon ? computePokemonCard : computeCard;

// Enriched calculations for Sports & Pokémon Cards
  const enriched = useMemo(
    () =>
      cards.map((c) => {
        const computed = computeCard(c);
        const listing = recommendedListing(computed);
        const expectedListProfit = listing ? listing.listPrice * (1 - computed.feesPct) - computed.totalCost : null;
        return { ...computed, expectedListProfit };
      }),
    [cards]
  );

  const enrichedPokemonCards = useMemo(() => {
    return pokemonCards
      .map((card) => {
        const computed = computePokemonCard(card);
        return {
          ...card,
          ...computed,
        };
      })
      .sort((a, b) => {
        // 1. Main priority tier (1 = PSA 10/9, 2 = Raw, 3 = Grade First...)
        const prioA = a.sellPriority ?? 99;
        const prioB = b.sellPriority ?? 99;
        if (prioA !== prioB) return prioA - prioB;

        // 2. Tie-breaker grouping ("Sell PSA 10" -> "Sell PSA 9" -> "Sell Raw First")
        const decA = DECISION_SORT_ORDER[a.sellDecision] ?? 99;
        const decB = DECISION_SORT_ORDER[b.sellDecision] ?? 99;
        if (decA !== decB) return decA - decB;

        // 3. Dollar value tie-breaker
        return (b.totalCost || 0) - (a.totalCost || 0);
      });
  }, [pokemonCards]);

  // Filtered views
  const filtered = useMemo(() => {
    let list = enriched.filter((c) => c.status === "Raw" || c.status === "Graded");
    if (statusFilter === "action") {
      list = list.filter((c) =>
        ["Sell Raw First", "Grade First", "Sell PSA 9", "Sell PSA 10"].includes(c.sellDecision)
      );
    } else if (statusFilter !== "all") {
      list = list.filter((c) => c.status === statusFilter);
    }
    if (decisionFilter !== "all") {
      list = list.filter((c) => c.sellDecision === decisionFilter);
    }
    if (sportFilter !== "all") {
      list = list.filter((c) => c.sport === sportFilter);
    }
    if (locationFilter === "not-in-hand") {
      list = list.filter((c) => c.location && c.location !== "In Hand");
    } else if (locationFilter !== "all") {
      list = list.filter((c) => c.location === locationFilter);
    }
    if (!sortKey) {
      return [...list].sort(
        (a, b) =>
          a.sellPriority - b.sellPriority ||
          (DECISION_SORT_ORDER[a.sellDecision] ?? 7) - (DECISION_SORT_ORDER[b.sellDecision] ?? 7) ||
          b.totalCost - a.totalCost
      );
    }
    return list;
  }, [enriched, statusFilter, decisionFilter, sportFilter, locationFilter, sortKey]);

  const filteredPokemonCards = useMemo(
    () => enrichedPokemonCards.filter((c) => c.status === "Raw" || c.status === "Graded"),
    [enrichedPokemonCards]
  );

  // Single Totals Declarations
  const totals = useMemo(() => {
    const qty = (c) => Number(c.quantity) || 1;
    const active = enriched.filter((c) => c.status !== "Sold");
    const invested = active.reduce((s, c) => s + c.totalCost * qty(c), 0);
    const potentialRaw = active.reduce((s, c) => s + (c.rawGGR || 0) * qty(c), 0);
    const count = active.reduce((s, c) => s + qty(c), 0);
    return { invested, potentialRaw, count };
  }, [enriched]);

  const pokemonTotals = useMemo(() => {
    const qty = (c) => Number(c.quantity) || 1;
    const active = enrichedPokemonCards.filter((c) => c.status !== "Sold");
    const invested = active.reduce((s, c) => s + c.totalCost * qty(c), 0);
    const potentialRaw = active.reduce((s, c) => s + (c.rawGGR || 0) * qty(c), 0);
    const count = active.reduce((s, c) => s + qty(c), 0);
    return { invested, potentialRaw, count };
  }, [enrichedPokemonCards]);

  function addCard(card) {
    setActiveCards((prev) => [{ id: crypto.randomUUID(), ...card }, ...prev]);
    setShowAdd(false);
  }

  function updateCard(id, updates) {
    setActiveCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next = { ...c, ...updates };
        if (updates.status === "Sold" && c.status !== "Sold") next.dateSold = new Date().toISOString().slice(0, 10);
        // Sending a card to grading locks in the cost at that moment (declared value based on
        // current comps) and adds it to the card's total cost — recalculating later if market
        // prices move would be misleading, since you already paid a fixed fee.
        if (updates.status === "At Grading" && c.status !== "At Grading") {
          const declaredValue = Math.max(Number(c.psa9Avg) || 0, Number(c.psa10Avg) || 0, Number(c.rawAvg) || 0);
          next.gradingCostPaid = gradingCost(next.gradingService || c.gradingService, declaredValue);
          next.gradingSentDate = new Date().toISOString().slice(0, 10);
        }
        return next;
      })
    );
  }

  function deleteCard(id) {
    setActiveCards((prev) => prev.filter((c) => c.id !== id));
    setSelected(null);
  }

  function handleBuyWin(target) {
    const isPkmn = target.sport === "Pokémon";
    const grade = target.psaLevel || null;
    const gradeLower = (grade || "").toLowerCase();
    const isNineGrade = ["psa 9", "sgc 9", "bgs 9", "bgs 9.5"].includes(gradeLower);
    const isTenGrade = ["psa 10", "sgc 10", "bgs 10"].includes(gradeLower);
    const newCard = {
      id: crypto.randomUUID(),
      player: target.player || "Unnamed card",
      card: target.card || "",
      cardNum: target.cardNum || "",
      sport: target.sport || (isPkmn ? "Pokémon" : "Other"),
      location: target.shipMyCards === "ShipMyCards" ? "ShipMyCards Vault" : "In Hand",
      rookie: !!target.rookie,
      numbered: !!target.numbered,
      outOf: target.numbered && target.outOf ? Number(target.outOf) : null,
      quantity: Number(target.quantity) || 1,
      shipMyCards: target.shipMyCards === "ShipMyCards" ? "Yes" : "No",
      status: grade ? "Graded" : "Raw",
      grade,
      paid: Number(target.paidAmount) || target.maxSnipeBid || 0,
      shipping: Number(target.shipping) || 0,
      feesPct: target.feesPct ?? 0.137,
      rawAvg: grade ? null : target.rawAvg ?? target.marketPrice ?? null,
      psa9Avg: target.psa9Avg ?? (isNineGrade ? target.marketPrice : null),
      psa10Avg: target.psa10Avg ?? (isTenGrade ? target.marketPrice : null),
      gradingService: target.gradingService || "PSA via Australia",
      psa10Prob: 0.35,
      psa9Prob: 0.45,
      // Carries a photo grade check across only at this exact moment — the check might have
      // been run while just evaluating the auction, so it only becomes part of the card's
      // permanent record if the card is actually won, never before.
      gradeAnalysis: target.gradeAnalysis || null,
      compSearch: target.compSearch || undefined,
      compsUpdatedAt: target.compsUpdatedAt || undefined,
      actualSellPrice: null,
      datePurchased: target.purchaseDate || new Date().toISOString().slice(0, 10),
    };
    if (isPkmn) {
      setPokemonCards((prev) => [newCard, ...prev]);
    } else {
      setCards((prev) => [newCard, ...prev]);
    }
  }

  // My Sales combines Sold + Listed items from both collections, tagged with their source
  // so edits/deletes route back to the right underlying array.
  function updateCardIn(source, id, updates) {
    const setter = source === "pokemon" ? setPokemonCards : setCards;
    setter((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next = { ...c, ...updates };
        if (updates.status === "Sold" && c.status !== "Sold") next.dateSold = new Date().toISOString().slice(0, 10);
        return next;
      })
    );
  }

  function deleteCardIn(source, id) {
    if (source === "pokemon") {
      setPokemonCards((prev) => prev.filter((c) => c.id !== id));
    } else {
      setCards((prev) => prev.filter((c) => c.id !== id));
    }
  }

  const salesItems = useMemo(() => {
    const own = cards.map((c) => ({ ...computeCard(c), _source: "cards" }));
    const pkmn = pokemonCards.map((c) => ({ ...computePokemonCard(c), _source: "pokemon" }));
    return [...own, ...pkmn].filter((c) => c.status === "Sold" || c.status === "Listed");
  }, [cards, pokemonCards]);

  const selectedCard = selected ? enriched.find((c) => c.id === selected) : null;

  function exportAllData() {
    const bundle = {
      app: "CardFlip EV",
      exportedAt: new Date().toISOString(),
      version: 1,
      cards,
      pokemonCards,
      buyList,
      boxBreaks,
      targets,
      contentPlan,
      contentGoal,
      manualExpenses,
      savedScans,
    };
    try {
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cardflip-ev-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupStatus({ type: "success", text: "Backup downloaded." });
    } catch (e) {
      console.error(e);
      setBackupStatus({ type: "error", text: "Export failed — try again." });
    }
    setTimeout(() => setBackupStatus(null), 4000);
  }

  function importAllData(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data || typeof data !== "object" || data.app !== "CardFlip EV") {
          throw new Error("Not a CardFlip EV backup file");
        }
        setPendingImport(data);
      } catch (err) {
        console.error(err);
        setBackupStatus({ type: "error", text: "Couldn't read that file — make sure it's a CardFlip EV backup JSON." });
        setTimeout(() => setBackupStatus(null), 5000);
      }
    };
    reader.readAsText(file);
  }

  // Confirmation is a plain in-page UI, not window.confirm() — artifacts run in a sandboxed
  // iframe that blocks native browser dialogs (prompt/alert/confirm all silently fail or
  // return instantly), which was quietly making Import a no-op with no error shown.
  function confirmImport() {
    const data = pendingImport;
    if (!data) return;
    if (Array.isArray(data.cards)) setCards(data.cards);
    if (Array.isArray(data.pokemonCards)) setPokemonCards(data.pokemonCards);
    if (Array.isArray(data.buyList)) setBuyList(data.buyList);
    if (Array.isArray(data.boxBreaks)) setBoxBreaks(data.boxBreaks);
    if (Array.isArray(data.targets)) setTargets(data.targets);
    if (Array.isArray(data.contentPlan)) setContentPlan(data.contentPlan);
    if (data.contentGoal && typeof data.contentGoal === "object") setContentGoal(data.contentGoal);
    if (Array.isArray(data.manualExpenses)) setManualExpenses(data.manualExpenses);
    if (Array.isArray(data.savedScans)) setSavedScans(data.savedScans);
    setBackupStatus({ type: "success", text: `Imported backup from ${data.exportedAt ? new Date(data.exportedAt).toLocaleDateString() : "file"}.` });
    setPendingImport(null);
    setTimeout(() => setBackupStatus(null), 5000);
  }

  function cancelImport() {
    setPendingImport(null);
  }

  if (!dataLoaded) {
    return (
      <div style={styles.app}>
        <GlobalStyle />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
          <div className="oswald" style={{ fontSize: 22, fontWeight: 600, color: "#C9A227" }}>CardFlip EV</div>
          <div style={{ fontSize: 13, color: "#6B7180" }}>
            {hasArtifactStorage ? "Loading your synced data…" : "Loading…"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <GlobalStyle />
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
        <Header tab={tab} setTab={setTab} onAdd={() => setShowAdd(true)} onExport={exportAllData} onImport={importAllData} backupStatus={backupStatus} />

        {pendingImport && (
          <div className="modalOverlay" onClick={cancelImport}>
            <div className="modalBox" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
              <h2 className="oswald" style={{ margin: "0 0 12px", fontSize: 18 }}>Import this backup?</h2>
              <div style={{ fontSize: 13.5, color: "#C6CAD4", lineHeight: 1.7, marginBottom: 8 }}>
                This replaces <b>all</b> current data — every card, target, sale, box break, and content item — with what's in this backup file. Can't be undone.
              </div>
              {pendingImport.exportedAt && (
                <div style={{ fontSize: 12, color: "#8B90A0", marginBottom: 18 }}>
                  Backup date: {new Date(pendingImport.exportedAt).toLocaleDateString()} · {(pendingImport.cards || []).length} cards, {(pendingImport.pokemonCards || []).length} Pokémon
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btnPrimary" onClick={confirmImport} style={{ flex: 1, justifyContent: "center" }}>
                  Import and replace
                </button>
                <button className="btnSecondary" onClick={cancelImport} style={{ flex: 1, justifyContent: "center" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "home" && (
          <Home
            cards={cards}
            pokemonCards={pokemonCards}
            targets={targets}
            boxBreaks={boxBreaks}
            salesItems={salesItems}
            buyList={buyList}
            contentPlan={contentPlan}
            contentGoal={contentGoal}
            setTab={setTab}
          />
        )}

        {tab === "taxsummary" && (
          <BusinessSummary cards={cards} pokemonCards={pokemonCards} boxBreaks={boxBreaks} manualExpenses={manualExpenses} setManualExpenses={setManualExpenses} />
        )}

       {(tab === "portfolio" || tab === "pokemon") && (
  <>
    {/* 1. Stat Bar dynamically calculates portfolio vs. pokemon metrics */}
    <StatBar totals={isPokemon ? pokemonTotals : totals} />

    {/* 2. Filter Row allows sorting and filtering both categories identically */}
    <FilterRow
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      decisionFilter={decisionFilter}
      setDecisionFilter={setDecisionFilter}
      sportFilter={sportFilter}
      setSportFilter={setSportFilter}
      locationFilter={locationFilter}
      setLocationFilter={setLocationFilter}
      setSortKey={setSortKey}
      enriched={isPokemon ? enrichedPokemonCards : enriched}
    />

    <BulkCompRefresh key={isPokemon ? "pokemon" : "cards"} cards={activeCards} setCards={setActiveCards} />

    {/* 3. Card Table receives the specific category list with full EV & Grade Call logic */}
    <CardTable
      cards={isPokemon ? filteredPokemonCards : filtered}
      onSelect={setSelected}
      playerLabel={tab === "pokemon" ? "Pokémon / Card Name" : "Player"}
      sortKey={sortKey}
      sortDir={sortDir}
      onSort={handleSort}
      isPokemon={tab === "pokemon"}
    />
  </>
)}

       {tab === "sales" && (
  <MySales 
    items={salesItems} 
    onUpdate={updateCardIn} 
    onDelete={deleteCardIn} 
    onAddManualSale={(newCard) => setCards((prev) => [newCard, ...prev])}
  />
)}
        {tab === "boxbreaks" && <BoxBreaks boxBreaks={boxBreaks} setBoxBreaks={setBoxBreaks} />}

        {tab === "gradecheck" && <GradeCheck cards={cards} pokemonCards={pokemonCards} onUpdateCardIn={updateCardIn} />}

        {tab === "gradingtracker" && <GradingTracker cards={cards} pokemonCards={pokemonCards} onUpdateCardIn={updateCardIn} />}

        {/* Always mounted (just hidden on other tabs) so a scan in progress survives switching tabs. */}
        <div style={{ display: tab === "lotscanner" ? "block" : "none" }}>
          <LotScanner
            setTargets={setTargets}
            setBuyList={setBuyList}
            savedScans={savedScans}
            setSavedScans={setSavedScans}
            onAddToCollection={(newCards) => {
              const pkmn = newCards.filter((c) => c.sport === "Pokémon");
              const sports = newCards.filter((c) => c.sport !== "Pokémon");
              if (sports.length) setCards((prev) => [...sports, ...prev]);
              if (pkmn.length) setPokemonCards((prev) => [...pkmn, ...prev]);
            }}
          />
        </div>

        {tab === "targets" && <MonthlyTargets targets={targets} setTargets={setTargets} />}

        {tab === "sellplaybook" && <SellingPlaybook />}

        {tab === "content" && (
          <ContentCreation
            cards={cards}
            pokemonCards={pokemonCards}
            targets={targets}
            boxBreaks={boxBreaks}
            salesItems={salesItems}
            contentPlan={contentPlan}
            setContentPlan={setContentPlan}
            contentGoal={contentGoal}
            setContentGoal={setContentGoal}
          />
        )}

        {tab === "buy" && <BuyEvaluator buyList={buyList} setBuyList={setBuyList} onWin={handleBuyWin} />}
        {tab === "tips" && <TipsAndTricks />}
      </div>

      {showAdd && (
        <AddCardModal onClose={() => setShowAdd(false)} onSave={addCard} playerLabel={isPokemon ? "Pokémon" : "Player"} />
      )}
{/* Compute selectedCard dynamically from enriched list so both Sports & Pokemon cards open with full metrics */}
      {(() => {
        const activeEnriched = isPokemon ? enrichedPokemonCards : enriched;
        const selectedCard = activeEnriched.find((c) => c.id === selected) || cards.find((c) => c.id === selected) || pokemonCards.find((c) => c.id === selected);
        
        if (!selectedCard) return null;

        const handleUpdate = (updatedCard) => {
          if (isPokemon || pokemonCards.some((c) => c.id === updatedCard.id)) {
            setPokemonCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
          } else {
            setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
          }
          setSelected(null);
        };

        const handleDelete = (idToDelete) => {
          if (isPokemon || pokemonCards.some((c) => c.id === idToDelete)) {
            setPokemonCards((prev) => prev.filter((c) => c.id !== idToDelete));
          } else {
            setCards((prev) => prev.filter((c) => c.id !== idToDelete));
          }
          setSelected(null);
        };

        return (
          <DetailModal
            card={selectedCard}
            onClose={() => setSelected(null)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            playerLabel={isPokemon ? "Pokémon / Card Name" : "Player"}
          />
        );
      })()}
    </div>
  );
}

function Header({ tab, setTab, onAdd, onExport, onImport, backupStatus }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="mono" style={{ color: "#C9A227", fontSize: 12, letterSpacing: "0.12em", marginBottom: 6 }}>
            EV MODEL / GRADE &amp; FLIP
          </div>
          <h1 className="oswald" style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>
            CardFlip EV
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {backupStatus && (
            <span style={{ fontSize: 12, color: backupStatus.type === "success" ? "#4E8B6B" : "#B4472E" }}>
              {backupStatus.text}
            </span>
          )}
          <ExchangeRateBadge />
          <SyncButton />
          <button className="btnSecondary" onClick={onExport} title="Download a backup of everything — cards, targets, sales, box breaks, content plan">
            <span style={{ marginRight: 6 }}>⬇️</span> Export
          </button>
          <label className="btnSecondary" style={{ cursor: "pointer" }} title="Restore from a previously downloaded backup file">
            <span style={{ marginRight: 6 }}>⬆️</span> Import
            <input
              type="file"
              accept="application/json"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files?.[0]) onImport(e.target.files[0]);
                e.target.value = "";
              }}
            />
          </label>
          {(tab === "portfolio" || tab === "pokemon") && (
            <button className="btnPrimary" onClick={onAdd}>
              <Plus size={16} /> Add card
            </button>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 22, borderBottom: "1px solid #2C303B", flexWrap: "wrap" }}>
        <TabButton active={tab === "home"} onClick={() => setTab("home")} icon={<span style={{ fontSize: 13 }}>🏠</span>}>
          Home
        </TabButton>
        <TabButton active={tab === "portfolio"} onClick={() => setTab("portfolio")} icon={<TrendingUp size={14} />}>
          My Cards
        </TabButton>
        <TabButton active={tab === "pokemon"} onClick={() => setTab("pokemon")} icon={<span style={{ fontSize: 13 }}>🧬</span>}>
          Pokémon
        </TabButton>
        <TabButton active={tab === "sales"} onClick={() => setTab("sales")} icon={<span style={{ fontSize: 13 }}>💰</span>}>
          My Sales
        </TabButton>
        <TabButton active={tab === "boxbreaks"} onClick={() => setTab("boxbreaks")} icon={<span style={{ fontSize: 13 }}>📦</span>}>
          Box Breaks
        </TabButton>
        <TabButton active={tab === "gradecheck"} onClick={() => setTab("gradecheck")} icon={<span style={{ fontSize: 13 }}>🔍</span>}>
          Grade Check
        </TabButton>
        <TabButton active={tab === "gradingtracker"} onClick={() => setTab("gradingtracker")} icon={<span style={{ fontSize: 13 }}>🏷️</span>}>
          Grading Tracker
        </TabButton>
        <TabButton active={tab === "lotscanner"} onClick={() => setTab("lotscanner")} icon={<span style={{ fontSize: 13 }}>🗃️</span>}>
          Lot Scanner
        </TabButton>
        <TabButton active={tab === "targets"} onClick={() => setTab("targets")} icon={<span style={{ fontSize: 13 }}>🎯</span>}>
          Monthly Targets
        </TabButton>
        <TabButton active={tab === "sellplaybook"} onClick={() => setTab("sellplaybook")} icon={<span style={{ fontSize: 13 }}>📮</span>}>
          Selling Playbook
        </TabButton>
        <TabButton active={tab === "taxsummary"} onClick={() => setTab("taxsummary")} icon={<span style={{ fontSize: 13 }}>🧾</span>}>
          Business Summary
        </TabButton>
        <TabButton active={tab === "content"} onClick={() => setTab("content")} icon={<span style={{ fontSize: 13 }}>🎥</span>}>
          Content Creation
        </TabButton>
        <TabButton active={tab === "buy"} onClick={() => setTab("buy")} icon={<Gavel size={14} />}>
          Buy Evaluator
        </TabButton>
        <TabButton active={tab === "tips"} onClick={() => setTab("tips")} icon={<BookOpen size={14} />}>
          Tips &amp; Tricks
        </TabButton>
      </div>
    </>
  );
}

function TabButton({ active, onClick, children, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        border: "none",
        borderBottom: active ? "2px solid #C9A227" : "2px solid transparent",
        color: active ? "#EDEAE1" : "#8B90A0",
        padding: "10px 4px",
        marginRight: 20,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {icon} {children}
    </button>
  );
}
