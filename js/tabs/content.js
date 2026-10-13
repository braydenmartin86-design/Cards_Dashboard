// ===== Content Creation =====
// Built for faceless short-form video (YouTube Shorts first): ideas come from what's actually
// happening in the app — a slab coming back, a good flip, a show haul — each with a ready-to-film
// kit (hook, beats, on-screen text, hands-only shot list, caption + hashtags). Plus a plan with
// post-by dates, a privacy check before posting, and a channel tracker.

const CONTENT_PILLARS = ["Flip Breakdowns", "Grading Reveals", "Pickups & Hauls", "Is It Worth Grading?", "Budget Picks", "Market Moves", "Box Breaks", "Behind the Scenes"];
const CONTENT_PLATFORMS = ["YouTube Shorts", "YouTube (long-form)", "TikTok", "Instagram Reels", "Multiple"];
const CONTENT_STATUS = ["Idea", "Scripted", "Filmed", "Edited", "Posted"];
const CONTENT_STATUS_COLOR = { Idea: "#5C7A99", Scripted: "#C9A227", Filmed: "#8B6FD6", Edited: "#2FA89A", Posted: "#4E8B6B" };
const CHANNEL_STORAGE_KEY = "cardflip_ev_channel_log_v1";

// Before posting: nothing that identifies you.
const PRIVACY_CHECKS = [
  { key: "face", label: "No face or reflections (screens, glass, toploader glare)" },
  { key: "name", label: "No name — mail, PSA/BGS submission forms, eBay or PayPal usernames" },
  { key: "address", label: "No address — shipping labels, packages, house or street outside" },
  { key: "voice", label: "Happy with the voice (or used captions / text-to-speech)" },
  { key: "location", label: "No location tags, school or work in the background" },
];

const FACELESS_SHOTS = [
  "Overhead, plain dark mat: hands bring the card into frame",
  "Close-up: front of the card, slow tilt for the shine, then flip to the back",
  "Screen recording: the sold listing or the app showing the numbers (crop or blur any usernames)",
  "End shot: the card in a toploader/slab with the key number as on-screen text",
];

const SPORT_TAGS = {
  NBA: "#nba #nbacards #basketballcards",
  WNBA: "#wnba #basketballcards",
  NFL: "#nfl #footballcards",
  MLB: "#mlb #baseballcards",
  AFL: "#afl #footycards",
  Soccer: "#football #soccercards",
  MMA: "#ufc #mmacards",
  WWE: "#wwe #wrestlingcards",
  "Pokémon": "#pokemon #pokemontcg #pokemoncards",
};
// For cards you don't own: your screen and your own cards as B-roll, never someone else's photos or videos.
const MARKET_SHOTS = [
  "Screen recording: eBay sold listings or a price chart — blur or crop usernames and seller names",
  "B-roll: a card you own from the same set or sport, or flicking through a binder",
  "Simple text slides with the prices (YouTube editor or CapCut)",
  "End shot: hands on cards with the key number as on-screen text",
];
const NFA = "Not financial advice.";

function hashtagsFor(sport) {
  return `#shorts #sportscards #thehobby #cardcollector ${SPORT_TAGS[sport] || ""}`.trim();
}

function newContentItem(idea) {
  return {
    id: crypto.randomUUID(),
    title: idea?.title || "",
    platform: idea?.platform || "YouTube Shorts",
    pillar: idea?.pillar || "Flip Breakdowns",
    status: "Idea",
    hook: idea?.hook || "",
    notes: idea?.beats ? idea.beats.map((b) => `• ${b}`).join("\n") : idea?.outline ? idea.outline.join("\n") : "",
    onScreen: idea?.onScreen ? idea.onScreen.join("\n") : "",
    shots: (idea?.shots || FACELESS_SHOTS).map((s) => `• ${s}`).join("\n"),
    caption: idea?.caption || "",
    plannedFor: "",
    privacy: {},
    dateAdded: new Date().toISOString().slice(0, 10),
  };
}

function daysAgo(dateStr) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  return isNaN(d) ? Infinity : (Date.now() - d.getTime()) / 86400000;
}
const money0 = (n) => `$${Math.round(Number(n) || 0)}`;

// Ideas from what's happening right now, most timely first. Each is a full filming kit.
function momentIdeas({ cards, pokemonCards, targets, boxBreaks, showPlan }) {
  const all = [...(cards || []).map((c) => ({ ...computeCard(c), _raw: c })), ...(pokemonCards || []).map((c) => ({ ...computePokemonCard(c), _raw: c, sport: "Pokémon" }))];
  const ideas = [];
  const name = (c) => [c.player, c.card].filter(Boolean).join(" ");

  // 1. A slab just came back.
  const results = typeof gradingResultsFrom === "function" ? gradingResultsFrom(cards || [], pokemonCards || []).filter((r) => daysAgo(r.returnedAt) <= 21) : [];
  if (results.length) {
    const r = results[0];
    const e = r.expected;
    ideas.push({
      key: `reveal-${r.card.id}`,
      when: "Slab just came back",
      title: `Grading reveal: ${name(r.card)}`,
      pillar: "Grading Reveals",
      hook: e ? `"The odds said ${Math.round(e.p10 * 100)}% chance of a 10. Here's what PSA actually gave it."` : `"I sent this off three months ago. Here's the grade."`,
      beats: ["Show the slab face-down (or the label covered)", `Quick context: what you paid (${money0(r.card.totalCost)} all in) and what a 10 is worth`, "Reveal the grade — pause a beat before", `Verdict: ${r.bucket === 10 ? "the payoff maths" : "was it still worth grading?"}`, "Ask: what would you have guessed?"],
      onScreen: ["Expected: ?", "Paid: " + money0(r.card.totalCost), "Grade: " + r.grade],
      shots: ["Overhead: slab face-down on a dark mat, hand covering the label", "Slow reveal: slide your hand away / flip the slab", "Close-up on the grade label", FACELESS_SHOTS[3]],
      caption: `Grading reveal — ${name(r.card)} came back ${r.grade}. ${hashtagsFor(r.card.sport)} #psa #gradingreveal`,
      source: `From your grading results — returned ${r.returnedAt}.`,
    });
  }
  const atGrading = all.filter((c) => c.status === "At Grading");
  if (!results.length && atGrading.length) {
    const c = atGrading[0];
    ideas.push({
      key: `predict-${c.id}`,
      when: "Cards away at grading",
      title: `Predict the grade: ${name(c)}`,
      pillar: "Grading Reveals",
      hook: `"Comment what grade you think this gets. I'll post the result when it's back."`,
      beats: ["Show the raw card close-up: corners, centering, surface", "Point out one strength and one flaw", "Say your own guess", "Promise the reveal — it brings people back for part 2"],
      onScreen: ["Your guess?", "Reveal coming soon"],
      shots: ["Close-up of each corner with a phone light raking across", FACELESS_SHOTS[1], "Text overlay with your guess"],
      caption: `Guess the grade 👀 Reveal when it's back. ${hashtagsFor(c.sport)} #psa`,
      source: `From the Grading Tracker — ${atGrading.length} card${atGrading.length === 1 ? "" : "s"} away. Film this before it comes back.`,
    });
  }

  // 2. A good flip in the last 30 days.
  const sold = all.filter((c) => c.status === "Sold" && daysAgo(c.dateSold) <= 30 && c.realisedProfit != null).sort((a, b) => b.realisedProfit - a.realisedProfit);
  if (sold.length && sold[0].realisedProfit > 0) {
    const c = sold[0];
    ideas.push({
      key: `flip-${c.id}`,
      when: "Good flip this month",
      title: `Paid ${money0(c.totalCost)}, sold for ${money0(c.actualSellPrice)}: ${name(c)}`,
      pillar: "Flip Breakdowns",
      hook: `"I paid ${money0(c.totalCost)} for this. It sold for ${money0(c.actualSellPrice)}. Here's what I actually kept."`,
      beats: ["Show the card and say what you paid", "Why you bought it — the one reason", `The sale: ${money0(c.actualSellPrice)}, minus fees and postage`, `What you kept: ${money0(c.realisedProfit)} profit`, "One lesson for someone starting out"],
      onScreen: [`Paid: ${money0(c.totalCost)}`, `Sold: ${money0(c.actualSellPrice)}`, `Profit after fees: ${money0(c.realisedProfit)}`],
      caption: `Small flips add up. Paid ${money0(c.totalCost)} → sold ${money0(c.actualSellPrice)}. ${hashtagsFor(c.sport)} #cardflipping`,
      source: `From My Sales — sold ${c.dateSold}.`,
    });
  }

  // 3. This month's sales recap (only this calendar month).
  const month = new Date().toISOString().slice(0, 7);
  const soldThisMonth = all.filter((c) => c.status === "Sold" && String(c.dateSold || "").startsWith(month));
  if (soldThisMonth.length >= 2) {
    const profit = soldThisMonth.reduce((s, c) => s + (c.realisedProfit || 0) * (Number(c.quantity) || 1), 0);
    ideas.push({
      key: `recap-${month}`,
      when: "Monthly recap",
      title: `Everything I sold this month (${soldThisMonth.length} cards)`,
      pillar: "Flip Breakdowns",
      hook: `"I sold ${soldThisMonth.length} cards this month and made ${money0(profit)}. Here's every one."`,
      beats: ["Total profit first — the number is the hook", "Rapid-fire each card: paid → sold (1–2 seconds each)", "Best and worst flip", "What you're reinvesting in next"],
      onScreen: soldThisMonth.slice(0, 6).map((c) => `${c.player}: ${money0(c.totalCost)} → ${money0(c.actualSellPrice)}`),
      caption: `${soldThisMonth.length} sales, ${money0(profit)} profit this month. ${hashtagsFor(soldThisMonth[0].sport)} #cardflipping`,
      source: "From My Sales — this month only. Lots of small flips make one strong video.",
    });
  }

  // 4. A card show coming up or just done.
  if (showPlan && showPlan.date) {
    const d = daysAgo(showPlan.date);
    const showName = showPlan.name || "the card show";
    if (d >= -14 && d <= 0) {
      ideas.push({
        key: `show-pre-${showPlan.date}`,
        when: "Card show coming up",
        title: `My budget and hit list for ${showName}`,
        pillar: "Pickups & Hauls",
        hook: `"I'm taking ${showPlan.budget ? money0(showPlan.budget) : "a set budget"} to ${showName}. Here's exactly what I'm hunting."`,
        beats: ["The budget on screen", "Your top 3 targets and the most you'll pay", "What you're bringing to sell or trade", "Tell people to follow for the haul video"],
        onScreen: [`Budget: ${showPlan.budget ? money0(showPlan.budget) : "?"}`, ...(showPlan.wants || []).slice(0, 3).map((w) => `${w.label}${w.maxRaw ? ` — max ${money0(w.maxRaw)}` : ""}`)],
        caption: `Card show game plan 🎯 ${hashtagsFor()} #cardshow`,
        source: `From your Card Show plan — ${showPlan.date}.`,
      });
    } else if (d > 0 && d <= 10) {
      const got = (showPlan.wants || []).filter((w) => w.gotPaid != null);
      ideas.push({
        key: `show-post-${showPlan.date}`,
        when: "Card show haul",
        title: `${showName} haul: what I got and what I paid`,
        pillar: "Pickups & Hauls",
        hook: `"I spent ${money0(got.reduce((s, w) => s + Number(w.gotPaid), 0))} at ${showName}. Did I overpay?"`,
        beats: ["Lay everything out — one overhead shot", "Each card: what you paid vs what it's worth", "Best deal of the day", "What you sold or traded"],
        onScreen: got.slice(0, 6).map((w) => `${w.player || w.label}: ${money0(w.gotPaid)}`),
        caption: `Card show haul 🛍️ ${hashtagsFor()} #cardshow #pickups`,
        source: `From your Card Show plan — ${got.length} card${got.length === 1 ? "" : "s"} bought.`,
      });
    }
  }

  // 5. Recent pickups (last 14 days).
  const pickups = all.filter((c) => daysAgo(c.datePurchased) <= 14 && c.status !== "Sold");
  if (pickups.length) {
    const c = [...pickups].sort((a, b) => b.totalCost - a.totalCost)[0];
    ideas.push({
      key: `pickups-${pickups.map((p) => p.id).join("").slice(0, 20)}`,
      when: "New pickups",
      title: pickups.length > 1 ? `This week's pickups (${pickups.length} cards)` : `New pickup: ${name(c)}`,
      pillar: "Pickups & Hauls",
      hook: `"${money0(c.totalCost)} for this ${c.player}. Steal or mistake?"`,
      beats: ["Card on screen immediately", "What you paid and where", "Why you think it's worth more (comps)", "Your plan: grade, hold or flip"],
      onScreen: pickups.slice(0, 5).map((p) => `${p.player}: ${money0(p.totalCost)}`),
      caption: `Steal or mistake? 🤔 ${hashtagsFor(c.sport)} #pickups`,
      source: `From My Cards — bought in the last 2 weeks.`,
    });
  }

  // 6. A big price move.
  if (typeof priceMoveFor === "function") {
    const moves = all.filter((c) => c.status === "Raw" || c.status === "Graded").map(priceMoveFor).filter(Boolean).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    if (moves.length) {
      const m = moves[0];
      const up = m.change > 0;
      ideas.push({
        key: `move-${m.card.id}-${m.last.date}`,
        when: "Price just moved",
        title: `This card just ${up ? "jumped" : "dropped"} ${Math.round(Math.abs(m.change) * 100)}%`,
        pillar: "Market Moves",
        hook: `"This ${m.card.player} card just ${up ? "jumped" : "dropped"} ${Math.round(Math.abs(m.change) * 100)}%. Here's why — and what I'm doing."`,
        beats: ["The card and the two prices", "Why it moved (game, injury, news, hype)", `Your move: ${up ? "sell into it or hold?" : "buy the dip or wait?"}`, "Ask what they'd do"],
        onScreen: [`${m.tier.label}: ${money0(m.prev.value)} → ${money0(m.last.value)}`],
        caption: `${up ? "📈" : "📉"} ${m.card.player} ${up ? "up" : "down"} ${Math.round(Math.abs(m.change) * 100)}% ${hashtagsFor(m.card.sport)}`,
        source: "From Price moves on Home.",
      });
    }
  }

  // 7. Is it worth grading? (a raw card the maths says to grade)
  const gradeCandidate = all.filter((c) => c.status === "Raw" && c.sellDecision === "Grade First").sort((a, b) => (b.gradedEV || 0) - (a.gradedEV || 0))[0];
  if (gradeCandidate) {
    const c = gradeCandidate;
    ideas.push({
      key: `worthgrading-${c.id}`,
      when: "Grading decision",
      title: `Is this ${c.player} worth grading? The real maths`,
      pillar: "Is It Worth Grading?",
      hook: `"Grading this costs about ${money0(c.gradingCostValue || gradingCost(c.gradingService && c.gradingService !== "None" ? c.gradingService : "PSA via Australia", Math.max(Number(c.psa10Avg) || 0, Number(c.rawAvg) || 0)) || 0)}. Here's whether it's actually worth it."`,
      beats: ["Raw value vs PSA 9 vs PSA 10 on screen", "Grading cost and wait time (about 3 months from Australia)", "The odds of a 10 — be honest about centering and corners", "Your decision"],
      onScreen: [`Raw: ${money0(c.rawAvg)}`, `PSA 9: ${money0(c.psa9Avg)}`, `PSA 10: ${money0(c.psa10Avg)}`],
      caption: `Grade it or sell it raw? ${hashtagsFor(c.sport)} #psa #grading`,
      source: "From My Cards — flagged Grade First.",
    });
  }

  // 8. A listing that won't sell.
  if (typeof listingsNeedingAction === "function") {
    const stale = listingsNeedingAction(all.filter((c) => c.status === "Listed")).filter((k) => k.totalDays >= 21)[0];
    if (stale) {
      ideas.push({
        key: `stale-${stale.card.id}`,
        when: "Listing won't sell",
        title: `Why isn't this card selling?`,
        pillar: "Behind the Scenes",
        hook: `"This card's been listed ${stale.totalDays} days with no sale. Here's what I'm changing."`,
        beats: ["The card and the price", "What comps say it's worth", "The fix: lower it, relist, or take it to a show", "Ask: what would you do?"],
        onScreen: [`Listed ${stale.totalDays} days`, stale.price ? `Price: ${money0(stale.price)}` : ""].filter(Boolean),
        caption: `Not every flip is a win. ${hashtagsFor(stale.card.sport)}`,
        source: "From the Listing check-up on My Sales.",
      });
    }
  }

  // 9. A buy-window target.
  const month0 = new Date().getMonth();
  const target = (targets || [])
    .filter((t) => t.status === "Watching" && t.tier === "Buy Now" && (typeof seasonActionForMonth !== "function" || seasonActionForMonth(t.sport, month0) === "BUY"))
    .sort((a, b) => (typeof computeConfidence === "function" ? computeConfidence(b) - computeConfidence(a) : 0))[0];
  if (target) {
    ideas.push({
      key: `target-${target.id}`,
      when: "Buy window open",
      title: `The ${target.player} card I'm buying right now`,
      pillar: "Budget Picks",
      hook: `"Now's the cheapest time of year to buy ${target.player}. Here's the exact card."`,
      beats: ["Why now — the season timing", `The card: ${target.cardToLookFor || "which version"}`, target.targetPriceRaw ? `The most you'd pay: ${money0(target.targetPriceRaw)}` : "What you'd pay", "Not advice — just your homework"],
      onScreen: [target.cardToLookFor || target.player, target.targetPriceRaw ? `Max: ${money0(target.targetPriceRaw)}` : ""].filter(Boolean),
      caption: `Buy-window pick 🎯 ${hashtagsFor(target.sport)}`,
      source: "From Monthly Targets — and your season calendar says buy.",
    });
  }

  // 9b. Cards you don't own: off-season buy lists, a sell window about to open, your watchlist.
  if (typeof SEASON_ROWS !== "undefined") {
    const monthName = new Date().toLocaleString("en-AU", { month: "long" });
    SEASON_ROWS.filter((r) => r.blocks[month0]?.t === "BUY").slice(0, 2).forEach((r) => {
      const picks = (targets || []).filter((t) => t.status === "Watching" && t.sport === r.key).slice(0, 3);
      const sellMonths = r.blocks.filter((b) => b.t === "SELL").map((b) => b.m).join(", ");
      ideas.push({
        key: `offseason-${r.key}-${month}`,
        when: "Off-season buying",
        title: `${r.sport} cards I'd buy in the off-season`,
        pillar: "Budget Picks",
        hook: `"${r.sport} cards are at their cheapest right now. Here's what I'd be buying."`,
        beats: ["Why prices dip now — no games, less hype, fewer buyers", picks.length ? `Your picks: ${picks.map((t) => t.player).join(", ")}` : "2–3 players you'd buy — a rookie, a steady star, a sleeper", "Today's sold price for each (screen recording)", `When they usually peak: ${sellMonths}`, "Say it's your homework, not advice"],
        onScreen: [...picks.map((t) => `${t.player}${t.targetPriceRaw ? ` — under ${money0(t.targetPriceRaw)}` : ""}`), `Prices peak: ${sellMonths}`],
        shots: MARKET_SHOTS,
        caption: `Off-season buys 🛒 ${NFA} ${hashtagsFor(r.key)}`,
        source: `From your season calendar — ${monthName} is a BUY month for ${r.sport}. ${picks.length ? "Picks from Monthly Targets." : "Add Monthly Targets for this sport to fill in the picks."}`,
      });
    });
    const next = (month0 + 1) % 12;
    const heating = SEASON_ROWS.find((r) => r.blocks[month0]?.t !== "SELL" && r.blocks[next]?.t === "SELL");
    if (heating) {
      ideas.push({
        key: `heating-${heating.key}-${month}`,
        when: "Prices about to rise",
        title: `Why ${heating.sport} card prices go up next month`,
        pillar: "Market Moves",
        hook: `"If you want ${heating.sport} cards, you've got about a month before prices jump."`,
        beats: ["What happens next month (season start, finals, playoffs)", "Show a card's price last year: quiet month vs peak month", "Buyers: get in now. Sellers: wait for the peak", "Ask who they're watching"],
        onScreen: [`Peak: ${heating.blocks[next].m}`, "Buy before · sell during"],
        shots: MARKET_SHOTS,
        caption: `Timing is everything in cards ⏰ ${NFA} ${hashtagsFor(heating.key)}`,
        source: `From your season calendar — ${heating.sport} turns to SELL next month. ${heating.note.split(". ")[0]}.`,
      });
    }
  }
  const watching = (targets || []).filter((t) => t.status === "Watching");
  if (watching.length >= 3) {
    const top = [...watching].sort((a, b) => (typeof computeConfidence === "function" ? computeConfidence(b) - computeConfidence(a) : 0)).slice(0, 3);
    ideas.push({
      key: `watchlist-${month}`,
      when: "Your watchlist",
      title: "3 cards I'm watching (I don't own them yet)",
      pillar: "Market Moves",
      hook: `"I don't own any of these yet. Here's the price I'm waiting for on each."`,
      beats: top.map((t) => `${t.player}${t.cardToLookFor ? ` (${t.cardToLookFor})` : ""} — ${t.reasoning ? t.reasoning.split(".")[0] : "why you like them"}${t.targetPriceRaw ? `, waiting for ${money0(t.targetPriceRaw)}` : ""}`).concat(["Follow to see if I get them"]),
      onScreen: top.map((t) => `${t.player}${t.targetPriceRaw ? `: under ${money0(t.targetPriceRaw)}` : ""}`),
      shots: MARKET_SHOTS,
      caption: `My watchlist 👀 ${NFA} ${hashtagsFor(top[0].sport)}`,
      source: `From Monthly Targets — ${watching.length} cards on watch. Do a follow-up when you buy one.`,
    });
  }

  // 10. Most recent completed box break.
  const box = [...(boxBreaks || [])].filter((b) => b.status === "Completed").sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))[0];
  if (box && typeof boxTotals === "function") {
    const t = boxTotals(box);
    ideas.push({
      key: `box-${box.id || box.name}`,
      when: "Box break done",
      title: `Was this ${box.name || "box"} worth it?`,
      pillar: "Box Breaks",
      hook: `"This box cost ${money0(t.cost)}. Did it pay off?"`,
      beats: ["Sealed box and the cost", "Best pull first", `The numbers: in ${money0(t.revenue)}, profit ${money0(t.profit)}`, "Would you run it again?"],
      onScreen: [`Cost: ${money0(t.cost)}`, `Profit: ${money0(t.profit)}`],
      caption: `Box break results 📦 ${hashtagsFor()}`,
      source: "From Box Breaks — your most recent completed break.",
    });
  }

  // Evergreen ideas that always work.
  ideas.push({
    key: "evergreen-fees",
    when: "Evergreen",
    title: "The fees nobody tells you about when selling cards",
    pillar: "Behind the Scenes",
    hook: `"This card sold for $50. I only kept $36. Here's where the rest went."`,
    beats: ["Sale price on screen", "Take off eBay fees", "Take off postage and supplies", "What's left — and how to price for it"],
    onScreen: ["Sold: $50", "eBay fees: -$7", "Postage: -$7", "Kept: $36"],
    caption: `Know your real profit before you list. ${hashtagsFor()} #ebayseller`,
    source: "Evergreen — use your real numbers from My Sales.",
  });
  ideas.push({
    key: "evergreen-dontgrade",
    when: "Evergreen",
    title: "Don't grade this card (here's my rule)",
    pillar: "Is It Worth Grading?",
    hook: `"Don't grade this card. Here's the rule I use before I send anything."`,
    beats: ["A raw card that's not worth grading", "The rule: a 10 has to clear grading + fees with room to spare", "The quick maths on screen", "What you do instead"],
    onScreen: ["Raw: $20", "PSA 10: $45", "Grading + fees: $35", "Verdict: sell raw"],
    caption: `Not every card should be graded. ${hashtagsFor()} #psa`,
    source: "Evergreen — swap in a real card from My Cards.",
  });
  return ideas;
}

// ----- Market kit maker: a filming kit for any card, owned or not -----
const MARKET_FORMATS = [
  { key: "move", label: "📈 How this card's price moved", a: "Price then (A$)", b: "Price now (A$)", extra: "Over how long? (e.g. in 3 months)" },
  { key: "offseason", label: "🗓️ Buy it in the off-season", a: "Price now (A$)", b: "Typical in-season price (A$)" },
  { key: "guess", label: "🤔 Guess what it sold for", a: "Sold price (A$)", extra: "Where / when it sold (e.g. eBay, last week)" },
  { key: "gap", label: "💎 Raw vs PSA 10 — worth grading?", a: "Raw price (A$)", b: "PSA 10 price (A$)" },
  { key: "vs", label: "⚖️ This or that?", a: "Card 1 price (A$)", b: "Card 2 price (A$)", other: "Card 2" },
  { key: "budget", label: "💵 What $X gets you right now", a: "Budget (A$)", extra: "The cards it gets you (one per line)" },
];

function buildMarketIdea(f) {
  const card = f.card.trim() || "this card";
  const a = Number(f.a) || 0;
  const b = Number(f.b) || 0;
  const tags = hashtagsFor(f.sport);
  const base = { key: `market-${crypto.randomUUID()}`, when: "Market kit", shots: MARKET_SHOTS, source: "From the market kit maker — you don't need to own the card. Use your own screen recordings, not other people's photos." };
  if (f.fmt === "move") {
    const pct = a > 0 ? Math.round(((b - a) / a) * 100) : 0;
    const up = b >= a;
    const span = f.extra.trim() || "recently";
    return { ...base, pillar: "Market Moves", title: `${card}: ${money0(a)} → ${money0(b)} ${span}`, hook: `"${card} was ${money0(a)}. Now it's ${money0(b)}. Here's what happened."`, beats: [`The price then: ${money0(a)}`, `The price now: ${money0(b)} (${up ? "+" : ""}${pct}% ${span})`, "Why it moved — games, injury, news, a new release, hype", up ? "Sell into it, or is there more to come?" : "Buy the dip or stay away?", "Ask what they think happens next"], onScreen: [`Then: ${money0(a)}`, `Now: ${money0(b)}`, `${up ? "📈 +" : "📉 "}${pct}%`], caption: `${up ? "📈" : "📉"} ${card} ${up ? "up" : "down"} ${Math.abs(pct)}% ${span}. ${NFA} ${tags}` };
  }
  if (f.fmt === "offseason") {
    const pct = a > 0 && b > a ? Math.round(((b - a) / a) * 100) : null;
    return { ...base, pillar: "Budget Picks", title: `Why I'd buy ${card} now, not in season`, hook: `"${card} is ${money0(a)} right now.${b ? ` In season it goes for ${money0(b)}.` : ""}"`, beats: ["The card and today's sold price", b ? `What it sold for at last season's peak: ${money0(b)}${pct ? ` (${pct}% more)` : ""}` : "What it sold for at last season's peak", "Why the off-season is cheaper — less hype, fewer buyers", "What could go wrong (injury, trade, a bad season)", "Say it's your homework, not advice"], onScreen: [`Now: ${money0(a)}`, b ? `In season: ${money0(b)}` : "", pct ? `+${pct}% in season` : ""].filter(Boolean), caption: `Buy the off-season 🛒 ${NFA} ${tags}` };
  }
  if (f.fmt === "guess") {
    return { ...base, pillar: "Market Moves", title: `Guess what this ${card} sold for`, hook: `"Guess what this sold for. Answer at the end."`, beats: ["Show the card (screen recording, price hidden)", "Clues: year, grade, why the player matters", "Count down 3… 2… 1", `Reveal: ${money0(a)}${f.extra.trim() ? ` (${f.extra.trim()})` : ""}`, "Ask: were you close? Comment your guess first"], onScreen: ["Guess the price 👇", "3… 2… 1…", `Sold: ${money0(a)}`], caption: `Guess the price before the end 👀 ${tags}` };
  }
  if (f.fmt === "gap") {
    const fee = typeof gradingCost === "function" ? gradingCost("PSA via Australia", b) || 0 : 0;
    const if10 = b * 0.87 - a - fee;
    return { ...base, pillar: "Is It Worth Grading?", title: `Is ${card} worth grading?`, hook: `"Raw it's ${money0(a)}. A PSA 10 is ${money0(b)}. Is that gap worth chasing?"`, beats: [`Raw: ${money0(a)} · PSA 10: ${money0(b)}`, `Grading from Australia: about ${money0(fee)} and 3 months`, `If it gets a 10, after fees you're about ${money0(if10)} ${if10 >= 0 ? "ahead" : "behind"}`, "But most cards don't get a 10 — a 9 often barely beats raw", "Your rule: only grade near-perfect copies"], onScreen: [`Raw: ${money0(a)}`, `PSA 10: ${money0(b)}`, `Grading: ~${money0(fee)}`, `If 10: ${if10 >= 0 ? "+" : ""}${money0(if10)}`], caption: `Grade it or sell it raw? ${tags} #psa #grading` };
  }
  if (f.fmt === "vs") {
    const other = f.other.trim() || "this one";
    return { ...base, pillar: "Market Moves", title: `${card} or ${other}?`, hook: `"${money0(a)} for ${card} or ${money0(b)} for ${other}. Which are you buying?"`, beats: [`Card 1: ${card} — ${money0(a)}`, `Card 2: ${other} — ${money0(b)}`, "One reason for each", "Your pick and why", "Ask them to comment 1 or 2"], onScreen: [`1️⃣ ${card}: ${money0(a)}`, `2️⃣ ${other}: ${money0(b)}`, "Comment 1 or 2 👇"], caption: `Which one? Comment 1 or 2 👇 ${NFA} ${tags}` };
  }
  const items = f.extra.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
  const theme = f.card.trim() || f.sport;
  return { ...base, pillar: "Budget Picks", title: `What ${money0(a)} gets you in ${theme} cards right now`, hook: `"I've got ${money0(a)}. Here are the best ${theme} cards it buys right now."`, beats: ["The budget on screen", ...(items.length ? items.map((s) => s) : ["3–4 cards at or under budget, cheapest to best"]), "Which one you'd actually buy", "Ask what they'd pick"], onScreen: [`Budget: ${money0(a)}`, ...items.slice(0, 4)], caption: `${money0(a)} budget picks 💵 ${NFA} ${tags}` };
}

function IdeaCard({ idea, open, onToggle, onAdd }) {
  return (
    <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        <span className="mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: idea.when === "Evergreen" ? "#5C627022" : "#4E8B6B22", color: idea.when === "Evergreen" ? "#8B90A0" : "#4E8B6B" }}>{idea.when}</span>
        <span className="mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "#C9A22722", color: "#C9A227" }}>{idea.pillar}</span>
      </div>
      <div className="oswald" style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 6 }}>{idea.title}</div>
      <div style={{ fontSize: 12, color: "#C9A227", fontStyle: "italic", marginBottom: 8, lineHeight: 1.5 }}>{idea.hook}</div>
      {open && (
        <div style={{ fontSize: 11.5, color: "#A7ADBB", lineHeight: 1.6, marginBottom: 8 }}>
          <b style={{ color: "#EDEAE1" }}>Beats</b>
          <ol style={{ margin: "2px 0 6px", paddingLeft: 18 }}>{idea.beats.map((b, i) => <li key={i}>{b}</li>)}</ol>
          {idea.onScreen && idea.onScreen.length > 0 && (
            <>
              <b style={{ color: "#EDEAE1" }}>On-screen text</b>
              <div style={{ margin: "2px 0 6px" }}>{idea.onScreen.join(" · ")}</div>
            </>
          )}
          <b style={{ color: "#EDEAE1" }}>Shots (hands only)</b>
          <ul style={{ margin: "2px 0 0", paddingLeft: 18 }}>{(idea.shots || FACELESS_SHOTS).map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
      <div style={{ fontSize: 11, color: "#6B7180", marginBottom: 10, flex: 1 }}>{idea.source}</div>
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btnSecondary" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => onAdd(idea)}>
          <Plus size={12} style={{ marginRight: 4 }} /> Add to plan
        </button>
        {onToggle && (
          <button className="btnSecondary" style={{ fontSize: 12, padding: "6px 12px" }} onClick={onToggle}>
            {open ? "Hide kit" : "See the kit"}
          </button>
        )}
      </div>
    </div>
  );
}

function MarketKitMaker({ onAdd }) {
  const empty = { fmt: "move", card: "", sport: "NBA", a: "", b: "", other: "", extra: "" };
  const [f, setF] = useState(empty);
  const [preview, setPreview] = useState(null);
  const fmt = MARKET_FORMATS.find((x) => x.key === f.fmt);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setPreview(null); };
  const lbl = { fontSize: 11, color: "#8B90A0", display: "block", marginBottom: 4 };

  return (
    <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22", marginBottom: 24 }}>
      <div style={{ fontSize: 12.5, color: "#A7ADBB", lineHeight: 1.6, marginBottom: 12 }}>
        Make a kit for any card, owned or not. Look up the prices on eBay sold listings first, then type them here.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginBottom: 12 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={lbl}>Video type</label>
          <select value={f.fmt} onChange={set("fmt")}>{MARKET_FORMATS.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select>
        </div>
        <div>
          <label style={lbl}>{f.fmt === "vs" ? "Card 1" : f.fmt === "budget" ? "Theme (optional)" : "Card"}</label>
          <input value={f.card} onChange={set("card")} placeholder="e.g. Wembanyama Prizm RC PSA 10" />
        </div>
        {fmt.other && (
          <div>
            <label style={lbl}>{fmt.other}</label>
            <input value={f.other} onChange={set("other")} placeholder="e.g. Caitlin Clark Prizm RC" />
          </div>
        )}
        <div>
          <label style={lbl}>Sport</label>
          <select value={f.sport} onChange={set("sport")}>{Object.keys(SPORT_TAGS).map((s) => <option key={s}>{s}</option>)}</select>
        </div>
        <div>
          <label style={lbl}>{fmt.a}</label>
          <input type="number" min="0" value={f.a} onChange={set("a")} />
        </div>
        {fmt.b && (
          <div>
            <label style={lbl}>{fmt.b}</label>
            <input type="number" min="0" value={f.b} onChange={set("b")} />
          </div>
        )}
        {fmt.extra && (
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={lbl}>{fmt.extra}</label>
            {f.fmt === "budget" ? <textarea rows={3} value={f.extra} onChange={set("extra")} style={textareaStyle} /> : <input value={f.extra} onChange={set("extra")} />}
          </div>
        )}
      </div>
      <button className="btnPrimary" disabled={!(Number(f.a) > 0)} onClick={() => setPreview(buildMarketIdea(f))}>Make the kit</button>
      {preview && (
        <div style={{ marginTop: 12, maxWidth: 520 }}>
          <IdeaCard idea={preview} open onAdd={(idea) => { onAdd(idea); setPreview(null); setF(empty); }} />
        </div>
      )}
    </div>
  );
}

// Optional AI script writer, run only when asked (one call).
async function writeShortScript(item) {
  const prompt = `Write a faceless YouTube Short script (30-45 seconds) for a sports card channel. The creator never shows their face — hands and cards only, voiceover or on-screen captions. Australian creator, prices in AUD.
Title: ${item.title}
Hook idea: ${item.hook || "(write one)"}
Points to cover:
${item.notes || "(use the title)"}

Return ONLY JSON: {"hook":"first sentence, under 15 words, said in the first 2 seconds","beats":["4-6 short lines, each one sentence"],"onScreen":["3-5 short on-screen text overlays"],"caption":"one-line caption with 4-6 relevant hashtags including #shorts"}
Keep it honest — no hype words like "insane" or guaranteed profits, and say it's not financial advice if you mention buying.`;
  const text = await callGeminiAi(prompt);
  const json = JSON.parse(String(text).replace(/```json|```/g, "").trim());
  return json;
}

function countPostedInPeriod(contentPlan, period) {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - (period === "week" ? 7 : 30));
  return (contentPlan || []).filter((c) => c.status === "Posted" && c.datePosted && new Date(c.datePosted) >= cutoff).length;
}

// Consecutive weeks (Mon–Sun, ending last week) that hit the weekly goal.
function weeklyStreak(contentPlan, perWeek) {
  const posted = (contentPlan || []).filter((c) => c.status === "Posted" && c.datePosted).map((c) => new Date(c.datePosted));
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  let streak = 0;
  for (let w = 1; w < 104; w++) {
    const start = new Date(monday);
    start.setDate(start.getDate() - 7 * w);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    if (posted.filter((d) => d >= start && d < end).length >= perWeek) streak++;
    else break;
  }
  return streak;
}

function ContentCreation({ cards, pokemonCards, targets, boxBreaks, salesItems, contentPlan, setContentPlan, contentGoal, setContentGoal }) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("active");
  const [showPlan, setShowPlan] = useState(null);
  const [openIdea, setOpenIdea] = useState(null);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    if (typeof SHOW_STORAGE_KEY !== "undefined") storageGet(SHOW_STORAGE_KEY).then((p) => setShowPlan(p || null));
  }, []);

  const ideas = useMemo(() => momentIdeas({ cards, pokemonCards, targets, boxBreaks, showPlan }), [cards, pokemonCards, targets, boxBreaks, showPlan]);
  const plannedKeys = new Set(contentPlan.map((c) => c.ideaKey).filter(Boolean));
  const freshIdeas = ideas.filter((i) => !plannedKeys.has(i.key));

  function addFromIdea(idea) {
    const item = { ...newContentItem(idea), ideaKey: idea.key, caption: idea.caption };
    setContentPlan((prev) => [item, ...prev]);
    setSelectedId(item.id);
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
        if (updates.status === "Posted" && c.status !== "Posted") next.datePosted = new Date().toISOString().slice(0, 10);
        return next;
      })
    );
  }
  function deleteItem(id) {
    setContentPlan((prev) => prev.filter((c) => c.id !== id));
    setSelectedId(null);
  }

  const today = new Date().toISOString().slice(0, 10);
  const byDate = (a, b) => (a.plannedFor || "9999").localeCompare(b.plannedFor || "9999");
  const visible = (statusFilter === "active" ? contentPlan.filter((c) => c.status !== "Posted") : statusFilter === "all" ? contentPlan : contentPlan.filter((c) => c.status === statusFilter)).slice().sort(byDate);
  const selected = selectedId ? contentPlan.find((c) => c.id === selectedId) : null;
  const postedInPeriod = countPostedInPeriod(contentPlan, contentGoal.period);
  const goalHit = postedInPeriod >= contentGoal.count;
  const streak = contentGoal.period === "week" ? weeklyStreak(contentPlan, contentGoal.count) : null;
  const overdue = contentPlan.filter((c) => c.status !== "Posted" && c.plannedFor && c.plannedFor < today).length;
  const box = { border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22", marginBottom: 20 };

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontSize: 13, color: "#8B90A0", marginBottom: 18, lineHeight: 1.6 }}>
        Faceless Shorts, built from what's actually happening in your cards — you're explaining numbers you already worked out, not performing. Hands and cards on camera, voiceover or captions, nothing that identifies you.
      </div>

      {/* ----- Goal ----- */}
      <div style={{ ...box, border: `1px solid ${goalHit ? "#4E8B6B55" : "#2C303B"}`, background: goalHit ? "#4E8B6B0f" : "#191B22" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#8B90A0" }}>Goal: post</span>
            <input type="number" min="1" value={contentGoal.count} onChange={(e) => setContentGoal({ ...contentGoal, count: Math.max(1, Number(e.target.value) || 1) })} style={{ width: 56, padding: "5px 8px", textAlign: "center" }} />
            <select value={contentGoal.period} onChange={(e) => setContentGoal({ ...contentGoal, period: e.target.value })} style={{ width: "auto" }}>
              <option value="week">per week</option>
              <option value="month">per month</option>
            </select>
          </div>
          <div className="oswald" style={{ fontSize: 18, fontWeight: 700, color: goalHit ? "#4E8B6B" : "#C9A227" }}>
            {postedInPeriod} / {contentGoal.count} this {contentGoal.period}
            {streak != null && streak > 0 && <span style={{ fontSize: 13, color: "#4E8B6B", marginLeft: 10 }}>🔥 {streak} week{streak === 1 ? "" : "s"} in a row</span>}
          </div>
        </div>
        <div style={{ fontSize: 11.5, color: "#6B7180", marginTop: 8, lineHeight: 1.6 }}>
          Pick a number you can hit most weeks — 2–3 Shorts a week is a strong start. Batch it: film three on one afternoon, schedule them across the week.
          {overdue > 0 && <span style={{ color: "#C9A227" }}> {overdue} planned post{overdue === 1 ? " is" : "s are"} past its date.</span>}
        </div>
      </div>

      {/* ----- Ideas ----- */}
      <SectionTitle>🎬 Ready to film — from what's happening</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, marginBottom: 24 }}>
        {freshIdeas.map((idea) => (
          <IdeaCard key={idea.key} idea={idea} open={openIdea === idea.key} onToggle={() => setOpenIdea(openIdea === idea.key ? null : idea.key)} onAdd={addFromIdea} />
        ))}
      </div>

      <SectionTitle>🔭 Cards you don't own — market kit maker</SectionTitle>
      <MarketKitMaker onAdd={addFromIdea} />

      {/* ----- Plan ----- */}
      <SectionTitle>📋 Your content plan</SectionTitle>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[["active", "To do"], ["all", "All"], ...CONTENT_STATUS.map((s) => [s, s])].map(([k, label]) => (
            <button key={k} className={`filterBtn ${statusFilter === k ? "active" : ""}`} onClick={() => setStatusFilter(k)}>{label}</button>
          ))}
        </div>
        <button className="btnPrimary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add your own
        </button>
      </div>

      {visible.length === 0 ? (
        <div style={{ ...box, textAlign: "center", color: "#5C6270", padding: "2rem" }}>Nothing here — add an idea above.</div>
      ) : (
        <div style={{ border: "1px solid #2C303B", borderRadius: 10, overflow: "hidden", marginBottom: 24 }}>
          {visible.map((c) => {
            const late = c.status !== "Posted" && c.plannedFor && c.plannedFor < today;
            return (
              <div key={c.id} onClick={() => setSelectedId(c.id)} className="cardRow" style={{ display: "flex", gap: 10, padding: "10px 14px", borderTop: "1px solid #24272F", cursor: "pointer", alignItems: "center", fontSize: 13, flexWrap: "wrap" }}>
                <span className="mono" style={{ fontSize: 11, color: late ? "#B4472E" : "#6B7180", minWidth: 74 }}>{c.plannedFor || "no date"}</span>
                <span style={{ fontWeight: 600, flex: 1, minWidth: 160 }}>{c.title}</span>
                <span style={{ fontSize: 11.5, color: "#8B90A0" }}>{c.platform}</span>
                <span className="mono" style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: `${CONTENT_STATUS_COLOR[c.status]}22`, color: CONTENT_STATUS_COLOR[c.status] }}>{c.status}</span>
              </div>
            );
          })}
        </div>
      )}

      <ChannelTracker />

      {/* ----- Tips ----- */}
      <div style={box}>
        <button type="button" className="btnSecondary" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => setShowTips((v) => !v)}>
          💡 Faceless filming & privacy tips {showTips ? "▲" : "▼"}
        </button>
        {showTips && (
          <div style={{ fontSize: 12.5, color: "#C6CAD4", lineHeight: 1.7, marginTop: 10 }}>
            <b style={{ color: "#C9A227" }}>Setup:</b> phone on an overhead arm or a stack of books, a plain dark mat, one lamp at an angle (it shows corners and shine). Film vertical, 1080p, 30–45 seconds.
            <br />
            <b style={{ color: "#C9A227" }}>Hook:</b> say the most interesting thing first — the price, the grade, the profit. Put it on screen as text too; lots of people watch muted.
            <br />
            <b style={{ color: "#C9A227" }}>Voice:</b> voiceover recorded separately sounds cleaner. Prefer not to use your voice? Captions only, or text-to-speech, both work fine for card content.
            <br />
            <b style={{ color: "#C9A227" }}>Privacy:</b> use a channel name that isn't your name, a separate Google account and email. YouTube doesn't push your channel to your phone contacts. If you add TikTok later, sign up with that email (not your number), skip contact and Facebook syncing, and turn off "Suggest your account to others".
            <br />
            <b style={{ color: "#C9A227" }}>Cards you don't own:</b> film your own screen (sold listings, price charts) with usernames blurred, and use your own cards as B-roll. Don't reuse other people's card photos or videos. Add "not financial advice" to any buy idea.
            <br />
            <b style={{ color: "#C9A227" }}>Repurpose:</b> the same Short can go to TikTok and Instagram Reels later — one filming session, several posts.
          </div>
        )}
      </div>

      {showAdd && <ContentAddModal onClose={() => setShowAdd(false)} onSave={addItem} />}
      {selected && <ContentDetailModal item={selected} onUpdate={updateItem} onDelete={deleteItem} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

const textareaStyle = { background: "#14161C", border: "1px solid #333844", color: "#EDEAE1", borderRadius: 6, padding: "9px 11px", fontSize: 13.5, fontFamily: "'Inter', sans-serif", width: "100%", resize: "vertical", boxSizing: "border-box" };

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
        <ModalHeader title="Add your own idea" onClose={onClose} />
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
            <Field label="Type">
              <select value={form.pillar} onChange={(e) => setForm({ ...form, pillar: e.target.value })}>
                {CONTENT_PILLARS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Hook (your first line)">
            <input value={form.hook} onChange={(e) => setForm({ ...form, hook: e.target.value })} placeholder='e.g. "I paid $20 for this. It sold for $90."' />
          </Field>
          <Field label="Points to cover">
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} style={textareaStyle} placeholder="Bullet points are fine — or add it and use ✨ Write script" />
          </Field>
          <button className="btnPrimary" type="submit" style={{ justifyContent: "center", marginTop: 6 }}>Add to plan</button>
        </form>
      </div>
    </div>
  );
}

function ContentDetailModal({ item, onUpdate, onDelete, onClose }) {
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const privacy = item.privacy || {};
  const allClear = PRIVACY_CHECKS.every((p) => privacy[p.key]);

  async function write() {
    setWriting(true);
    setError(null);
    try {
      const s = await writeShortScript(item);
      onUpdate(item.id, {
        hook: s.hook || item.hook,
        notes: (s.beats || []).map((b) => `• ${b}`).join("\n") || item.notes,
        onScreen: (s.onScreen || []).join("\n") || item.onScreen,
        caption: s.caption || item.caption,
        status: item.status === "Idea" ? "Scripted" : item.status,
      });
    } catch (e) {
      setError("Couldn't write a script right now — try again in a minute.");
    } finally {
      setWriting(false);
    }
  }
  async function copyCaption() {
    const ok = await copyToClipboard(item.caption || "");
    setCopied(ok);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <ModalHeader title={item.title} onClose={onClose} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Field label="Status">
              <select value={item.status} onChange={(e) => onUpdate(item.id, { status: e.target.value })}>
                {CONTENT_STATUS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Post by">
              <input type="date" value={item.plannedFor || ""} onChange={(e) => onUpdate(item.id, { plannedFor: e.target.value })} />
            </Field>
            <Field label="Platform">
              <select value={item.platform} onChange={(e) => onUpdate(item.id, { platform: e.target.value })}>
                {CONTENT_PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Hook (first 2 seconds)">
            <input value={item.hook || ""} onChange={(e) => onUpdate(item.id, { hook: e.target.value })} />
          </Field>
          <Field label="Beats / what to say">
            <textarea value={item.notes || ""} onChange={(e) => onUpdate(item.id, { notes: e.target.value })} rows={5} style={textareaStyle} />
          </Field>
          <div>
            <button type="button" className="btnSecondary" style={{ fontSize: 12, padding: "6px 12px", borderColor: "#C9A22766", color: "#C9A227" }} onClick={write} disabled={writing}>
              {writing ? "✨ Writing…" : "✨ Write script for me (AI)"}
            </button>
            <span style={{ fontSize: 11, color: "#6B7180", marginLeft: 8 }}>Rewrites the hook, beats, on-screen text and caption in a faceless Shorts style.</span>
            {error && <div style={{ fontSize: 11.5, color: "#B4472E", marginTop: 4 }}>{error}</div>}
          </div>
          <Field label="On-screen text (one per line)">
            <textarea value={item.onScreen || ""} onChange={(e) => onUpdate(item.id, { onScreen: e.target.value })} rows={3} style={textareaStyle} />
          </Field>
          <Field label="Shot list (hands only)">
            <textarea value={item.shots || ""} onChange={(e) => onUpdate(item.id, { shots: e.target.value })} rows={4} style={textareaStyle} />
          </Field>
          <Field label="Caption + hashtags">
            <textarea value={item.caption || ""} onChange={(e) => onUpdate(item.id, { caption: e.target.value })} rows={2} style={textareaStyle} />
          </Field>
          <div>
            <button type="button" className="btnSecondary" style={{ fontSize: 11.5, padding: "4px 10px" }} onClick={copyCaption} disabled={!item.caption}>{copied ? "Copied ✓" : "Copy caption"}</button>
          </div>

          <div style={{ border: `1px solid ${allClear ? "#4E8B6B55" : "#C9A22755"}`, borderRadius: 8, padding: "10px 12px", background: allClear ? "#4E8B6B0f" : "#C9A2270f" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: allClear ? "#4E8B6B" : "#C9A227", marginBottom: 6 }}>🔒 Privacy check before posting</div>
            {PRIVACY_CHECKS.map((p) => (
              <label key={p.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#C6CAD4", padding: "2px 0", cursor: "pointer" }}>
                <input type="checkbox" checked={Boolean(privacy[p.key])} onChange={(e) => onUpdate(item.id, { privacy: { ...privacy, [p.key]: e.target.checked } })} style={{ width: "auto", margin: 0 }} />
                {p.label}
              </label>
            ))}
            {item.status !== "Posted" && (
              <button type="button" className="btnPrimary" style={{ fontSize: 12, padding: "6px 12px", marginTop: 8 }} disabled={!allClear} onClick={() => onUpdate(item.id, { status: "Posted" })}>
                {allClear ? "Mark as posted" : "Tick everything to mark as posted"}
              </button>
            )}
          </div>

          <button onClick={() => { onDelete(item.id); onClose(); }} style={{ background: "transparent", border: "1px solid #4a2a24", color: "#B4472E", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
            <Trash2 size={14} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Channel tracker =====
// A monthly check-in of the channel's numbers, and progress towards YouTube's monetisation
// thresholds for Shorts (as published in 2025 — YouTube changes these, so check before relying).
const YPP_TIERS = [
  { name: "Early tier (fan funding: memberships, Super Thanks)", subs: 500, shortsViews: 3000000 },
  { name: "Full YouTube Partner Program (Shorts ad revenue)", subs: 1000, shortsViews: 10000000 },
];

function ChannelTracker() {
  const [log, setLog] = useState(null);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), subs: "", views90: "", note: "" });

  useEffect(() => {
    storageGet(CHANNEL_STORAGE_KEY).then((d) => setLog(Array.isArray(d) ? d : []));
  }, []);
  useEffect(() => {
    if (log) storageSet(CHANNEL_STORAGE_KEY, log);
  }, [log]);
  if (!log) return null;

  const sorted = [...log].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const prev = sorted[1];
  function add(e) {
    e.preventDefault();
    if (form.subs === "" && form.views90 === "") return;
    setLog([...log, { id: crypto.randomUUID(), date: form.date, subs: Number(form.subs) || 0, views90: Number(form.views90) || 0, note: form.note }]);
    setForm({ ...form, subs: "", views90: "", note: "" });
  }
  const fmtN = (n) => (n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
  const box = { border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22", marginBottom: 20 };

  return (
    <>
      <SectionTitle>📈 Channel tracker</SectionTitle>
      <div style={box}>
        {latest ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 12 }}>
              <MiniStat label="Subscribers" value={fmtN(latest.subs)} color="#4E8B6B" />
              <MiniStat label="Shorts views (90 days)" value={fmtN(latest.views90)} />
              <MiniStat label="Since last check-in" value={prev ? `${latest.subs - prev.subs >= 0 ? "+" : ""}${latest.subs - prev.subs} subs` : "—"} />
            </div>
            {YPP_TIERS.map((t) => {
              const s = Math.min(1, latest.subs / t.subs);
              const v = Math.min(1, latest.views90 / t.shortsViews);
              return (
                <div key={t.name} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: "#C6CAD4", marginBottom: 4 }}>{t.name}</div>
                  {[["Subscribers", s, `${fmtN(latest.subs)} / ${fmtN(t.subs)}`], ["Shorts views, 90 days", v, `${fmtN(latest.views90)} / ${fmtN(t.shortsViews)}`]].map(([label, p, text]) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#8B90A0", marginBottom: 3 }}>
                      <span style={{ minWidth: 130 }}>{label}</span>
                      <div style={{ flex: 1, height: 6, background: "#24272F", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ width: `${p * 100}%`, height: "100%", background: p >= 1 ? "#4E8B6B" : "#C9A227" }} />
                      </div>
                      <span className="mono" style={{ minWidth: 90, textAlign: "right" }}>{text}</span>
                    </div>
                  ))}
                </div>
              );
            })}
            <div style={{ fontSize: 10.5, color: "#6B7180", marginBottom: 10 }}>Thresholds as YouTube published them in 2025 — they change, so check YouTube Studio's Earn tab for the current numbers.</div>
          </>
        ) : (
          <div style={{ fontSize: 12.5, color: "#8B90A0", marginBottom: 10 }}>Log your numbers once a month (from YouTube Studio) to see your growth and how close you are to earning from the channel.</div>
        )}
        <form onSubmit={add} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="Date"><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Subscribers"><input type="number" min="0" value={form.subs} onChange={(e) => setForm({ ...form, subs: e.target.value })} style={{ width: 100 }} /></Field>
          <Field label="Shorts views (last 90 days)"><input type="number" min="0" value={form.views90} onChange={(e) => setForm({ ...form, views90: e.target.value })} style={{ width: 130 }} /></Field>
          <Field label="Note"><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. reveal Short took off" style={{ minWidth: 150 }} /></Field>
          <button className="btnSecondary" type="submit" style={{ fontSize: 12.5 }}>Log</button>
        </form>
        {sorted.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {sorted.slice(0, 6).map((r) => (
              <div key={r.id} style={{ display: "flex", gap: 10, fontSize: 12, color: "#A7ADBB", padding: "3px 0", borderTop: "1px solid #24272F" }}>
                <span className="mono" style={{ color: "#6B7180", minWidth: 80 }}>{r.date}</span>
                <span>{fmtN(r.subs)} subs</span>
                <span>{fmtN(r.views90)} views</span>
                <span style={{ flex: 1, color: "#6B7180" }}>{r.note}</span>
                <button type="button" onClick={() => setLog(log.filter((x) => x.id !== r.id))} style={{ background: "none", border: "none", color: "#6B7180", cursor: "pointer", padding: 0 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
