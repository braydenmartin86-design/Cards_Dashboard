// ===== Formula engine, ported 1:1 from the user's Excel model =====

// PSA's declared-value tiers are in US$, so AUD values are converted at the current rate.
function audToUsd(aud) {
  return (aud || 0) / currentUsdToAudRate();
}
function tieredPsaAuCost(declaredValueAUD) {
  const usd = audToUsd(declaredValueAUD);
  if (usd <= 500) return 50;
  if (usd <= 1000) return 140;
  if (usd <= 1500) return 165;
  if (usd <= 2500) return 299;
  if (usd <= 5000) return 699;
  if (usd <= 10000) return 1199;
  return 2199;
}

// ===== Australian grading price list (from the user's screenshots, Oct 2026) =====
// Prices are A$ per card. `maxUsd` / `maxAud` is the highest declared (graded) value the tier
// covers. `returnIncluded`: true = freight both ways is in the price; false = return shipping is
// extra; null = not stated (treated as extra, and flagged). PSA has suspended its under-US$300/500
// tiers, so PSA from Australia currently starts at A$110 (The Hobby).
const GRADING_PRICE_LIST = [
  // PSA
  { company: "The Hobby", grader: "PSA", tier: "C1000", price: 110, maxUsd: 1000, days: 165, time: "5–6 months", returnIncluded: true },
  { company: "The Hobby", grader: "PSA", tier: "C1500", price: 165, maxUsd: 1500, days: 53, time: "1.5–2 months", returnIncluded: true },
  { company: "The Hobby", grader: "PSA", tier: "C2500", price: 350, maxUsd: 2500, days: 38, time: "1–1.5 months", returnIncluded: true },
  { company: "The Hobby", grader: "PSA", tier: "C5000", price: 699, maxUsd: 5000, days: 13, time: "7–10 business days", returnIncluded: true },
  { company: "Slabbys", grader: "PSA", tier: "Standard", price: 130, maxUsd: 1000, days: 135, time: "90–100 business days", returnIncluded: false },
  { company: "Slabbys", grader: "PSA", tier: "Priority", price: 200, maxUsd: 1500, days: 105, time: "70–80 business days", returnIncluded: false },
  { company: "Slabbys", grader: "PSA", tier: "Express", price: 399, maxUsd: 2500, days: 35, time: "20–30 business days", returnIncluded: false },
  // Slabd's prices include A$2 handling + A$2 data entry per card (Quick Submit).
  { company: "Slabd", grader: "PSA", tier: "Standard Bulk", price: 93.95, maxAud: 499, days: 140, time: "~100 business days", returnIncluded: false, minCards: 15 },
  { company: "Slabd", grader: "PSA", tier: "Standard", price: 113.95, maxAud: 999, days: 140, time: "~100 business days", returnIncluded: false },
  { company: "Slabd", grader: "PSA", tier: "Regular", price: 153.95, maxAud: 1499, days: 112, time: "~80 business days", returnIncluded: false },
  { company: "Cherry", grader: "PSA", tier: "Regular", price: 160, maxUsd: 1499, days: 60, time: "~2 months", returnIncluded: false },
  { company: "Cherry", grader: "PSA", tier: "Express", price: 375, maxUsd: 2499, days: 45, time: "1–2 months", returnIncluded: false },
  { company: "Cherry", grader: "PSA", tier: "Super Express", price: 650, maxUsd: 4999, days: 23, time: "20–25 days", returnIncluded: false },
  // Beckett (BGS)
  { company: "Slabd", grader: "BGS", tier: "Base", price: 53.95, maxAud: 400, days: 168, time: "~120 business days", returnIncluded: false },
  { company: "Slabd", grader: "BGS", tier: "Standard", price: 123.95, maxAud: 999, days: 84, time: "~60 business days", returnIncluded: false },
  { company: "Slabd", grader: "BGS", tier: "Express", price: 303.95, maxAud: 2495, days: 56, time: "~40 business days", returnIncluded: false },
  { company: "Slabbys", grader: "BGS", tier: "Base", price: 75, maxUsd: 500, days: 135, time: "95+ business days", returnIncluded: false },
  { company: "Slabbys", grader: "BGS", tier: "Express", price: 249, maxUsd: 2500, days: 30, time: "20+ business days", returnIncluded: false },
  { company: "Cherry", grader: "BGS", tier: "Base", price: 40, maxUsd: 2000, days: 120, time: "unavailable right now", returnIncluded: false, unavailable: true },
  { company: "Cherry", grader: "BGS", tier: "Standard", price: 80, maxUsd: 10000, days: 90, time: "unavailable right now", returnIncluded: false, unavailable: true },
  { company: "Cherry", grader: "BGS", tier: "Priority", price: 300, maxUsd: 50000, days: 25, time: "3–4 weeks", returnIncluded: false },
  // CGC
  { company: "The Hobby", grader: "CGC", tier: "Under US$1000", price: 40, maxUsd: 1000, days: 90, time: "~3 months", returnIncluded: true },
  // SGC and CGA through a Queensland store (the only Australian SGC pricing found, Oct 2026).
  // Max covered value and return postage aren't stated.
  { company: "QLD store", grader: "SGC", tier: "Standard", price: 89.95, maxAud: Infinity, days: 85, time: "60+ business days", returnIncluded: false },
  { company: "QLD store", grader: "SGC", tier: "Immediate", price: 299.95, maxAud: Infinity, days: 28, time: "20+ business days", returnIncluded: false },
  { company: "QLD store", grader: "CGA", tier: "Standard", price: 24.95, maxAud: Infinity, days: 52, time: "25–50 business days", returnIncluded: false, pokemonOnly: true },
  { company: "QLD store", grader: "CGA", tier: "Collector Bulk", price: 19.95, maxAud: Infinity, days: 52, time: "25–50 business days", returnIncluded: false, pokemonOnly: true, minCards: 20 },
  // PSA through ShipMyCards (US) — only for cards already in the SMC vault: no postage either way,
  // and the slab comes back to the vault ready to sell from there. US$26 per card was the user's
  // last fee (Oct 2026). The higher tier is an estimate — check SMC's current PSA pricing.
  { company: "ShipMyCards", grader: "PSA", tier: "Value", priceUsd: 26, maxUsd: 499, days: 100, time: "~2–4 months (PSA US)", returnIncluded: true, vaultOnly: true },
  { company: "ShipMyCards", grader: "PSA", tier: "Regular (estimate)", priceUsd: 75, maxUsd: 1499, days: 75, time: "~2–3 months (PSA US)", returnIncluded: true, vaultOnly: true, estimate: true },
  // TCG Grading (Sydney) — Pokémon only; a local slab sells for far less than PSA.
  { company: "TCG Grading", grader: "TCG", tier: "Routine", price: 16, maxAud: Infinity, days: 60, time: "not stated", returnIncluded: false, pokemonOnly: true },
  { company: "TCG Grading", grader: "TCG", tier: "6-card package", price: 95 / 6, maxAud: Infinity, days: 60, time: "not stated", returnIncluded: false, pokemonOnly: true, minCards: 6 },
];
// Postage from Clyde North VIC to each company, and back when the return isn't included.
// The Hobby (Point Cook) and Cherry (Melbourne) are about an hour's drive — dropping off saves the
// postage out, and Cherry's in-store pickup is A$10 instead of A$20 delivered.
const GRADING_POSTAGE = {
  "The Hobby": { out: 13, back: 0, note: "post ~A$13 or drop off (~1 hr drive); return included" },
  Cherry: { out: 13, back: 20, note: "post ~A$13 or drop off; return A$20 tracked, or A$10 to collect in store" },
  Slabd: { out: 10, back: 15, note: "A$10 Sendle home pickup; return postage a guess (not stated)" },
  Slabbys: { out: 13, back: 15, note: "post ~A$13 to NSW or drop off at Swap It; return postage a guess (charged separately)" },
  "TCG Grading": { out: 13, back: 19, note: "post ~A$13 to Sydney; return ~A$19 Express Post" },
  "QLD store": { out: 13, back: 15, note: "post ~A$13 to Queensland; return postage a guess (not stated)" },
  ShipMyCards: { out: 0, back: 0, note: "already in the vault — no postage; the slab comes back to the vault" },
};
const VAULT = "ShipMyCards Vault";
// A card in the ShipMyCards vault is graded from there: "PSA via Australia" (the default) means
// PSA via ShipMyCards for it — no shipping it home and back.
function effectiveGradingService(c) {
  const s = c && c.gradingService;
  return c && c.location === VAULT && (!s || s === "PSA via Australia") ? "PSA via ShipMyCards" : s;
}
const GRADING_POSTAGE_DEFAULT = { out: 13, back: 15 };
const postageFor = (company) => GRADING_POSTAGE[company] || GRADING_POSTAGE_DEFAULT;
// What a slab from each grader resells for compared with the same grade from PSA — rough guides,
// since buyers pay a premium for PSA. CGC holds up better for Pokémon than for sports cards.
function graderResaleFactor(grader, sport) {
  const pokemon = sport === "Pokémon";
  if (grader === "PSA") return 1;
  if (grader === "BGS") return 0.85;
  if (grader === "CGC") return pokemon ? 0.85 : 0.65;
  // SGC slabs sell for about the same as TCG Grading's, in the user's experience.
  if (grader === "TCG" || grader === "SGC" || grader === "CGA") return pokemon ? 0.4 : 0.25;
  return 0.8;
}
// The resale factor for a raw card's chosen grading service (PSA = 1).
function serviceResaleFactor(service, sport) {
  const grader = { "BGS via Australia": "BGS", "CGC via Australia": "CGC", "TCG Grading (AU)": "TCG", "SGC via Australia": "SGC", "CGA via Australia": "CGA" }[service];
  return grader ? graderResaleFactor(grader, sport) : 1;
}
function gradingTierFits(t, declaredAud) {
  if (t.maxAud != null) return declaredAud <= t.maxAud;
  return audToUsd(declaredAud) <= t.maxUsd;
}
// All-in cost of one option for a single card: the fee plus that company's postage there, and back
// when the return isn't included.
function gradingOptionCost(t) {
  const p = postageFor(t.company);
  return feeAud(t) + p.out + (t.returnIncluded ? 0 : p.back);
}
// US$-priced tiers (ShipMyCards) convert at the live rate.
const feeAud = (t) => (t.priceUsd != null ? t.priceUsd * currentUsdToAudRate() : t.price);
// Every option a single card can go through, cheapest first (no bulk minimums or paused tiers).
// Cards in the ShipMyCards vault are graded from there; cards in hand from Australia.
function gradingOptionsFor(declaredAud, sport, { graders, location } = {}) {
  const inVault = location === VAULT;
  return GRADING_PRICE_LIST.filter((t) => !t.unavailable && !(t.minCards > 1) && Boolean(t.vaultOnly) === inVault && (!t.pokemonOnly || sport === "Pokémon") && (!graders || graders.includes(t.grader)) && gradingTierFits(t, declaredAud))
    .map((t) => ({ ...t, price: feeAud(t), total: gradingOptionCost(t) }))
    .sort((a, b) => a.total - b.total);
}

// Which company and tier to grade a raw card through — or whether to grade at all. For each option
// that covers the card's value: expected profit after the all-in cost and that grader's resale
// discount, compared with selling raw now. Uses the card's grading chances (photo check, set gem
// rate, or your/default rates); below a 9 the card is treated as worth about what it was raw.
const GRADER_SERVICE = { PSA: "PSA via Australia", BGS: "BGS via Australia", CGC: "CGC via Australia", TCG: "TCG Grading (AU)", SGC: "SGC via Australia", CGA: "CGA via Australia" };
function bestGradingChoices(card, computed) {
  const v10 = Number(card.psa10Avg) || 0;
  const v9 = Number(card.psa9Avg) > 0 ? Number(card.psa9Avg) : Number(computed.psa9Estimate) || 0;
  const raw = Number(card.rawAvg) || 0;
  if (!v10 && !v9) return null;
  const sport = card.sport;
  const fees = card.feesPct || 0.13;
  const exp = gradingExpectationFor(card);
  const p10 = exp.p10;
  const p9 = exp.p9;
  const pBelow = Math.max(0, 1 - p10 - p9);
  const cost = Number(computed.totalCost) || 0;
  const sellRaw = raw * (1 - fees) - cost;
  const declared = Math.max(v10, v9, raw);
  const options = gradingOptionsFor(declared, sport, { location: card.location })
    .map((o) => {
      const m = graderResaleFactor(o.grader, sport);
      const profit = (p10 * v10 * m + p9 * v9 * m + pBelow * raw) * (1 - fees) - cost - o.total;
      // What each result would mean in profit, so the risk is visible, not just the average.
      const outcome = (v) => v * (1 - fees) - cost - o.total;
      return { ...o, factor: m, profit, gain: profit - sellRaw, service: o.vaultOnly ? "PSA via ShipMyCards" : GRADER_SERVICE[o.grader], if10: outcome(v10 * m), if9: outcome(v9 * m), ifLower: outcome(raw) };
    })
    .sort((a, b) => b.gain - a.gain);
  return { options, sellRaw, p10, p9, source: exp.source, declared };
}

// Services where you send the card yourself, so the fee is a cost on the card.
const SELF_GRADED_SERVICES = ["PSA via Australia", "BGS via Australia", "CGC via Australia", "TCG Grading (AU)", "SGC via Australia", "CGA via Australia", "PSA via ShipMyCards"];

function gradingCost(service, declaredValue = 0) {
  if (!service || service === "None" || service === "Bought Graded") return 0;

  // From Australia: the cheapest tier that covers the card's declared value, all in.
  const grader = { "PSA via Australia": "PSA", "BGS via Australia": "BGS", "CGC via Australia": "CGC", "TCG Grading (AU)": "TCG", "SGC via Australia": "SGC", "CGA via Australia": "CGA" }[service];
  if (grader) {
    const opt = gradingOptionsFor(declaredValue, grader === "TCG" || grader === "CGA" ? "Pokémon" : null, { graders: [grader] })[0];
    return opt ? Math.round(opt.total * 100) / 100 : 0;
  }
  if (service === "PSA via ShipMyCards") {
    const opt = gradingOptionsFor(declaredValue, null, { graders: ["PSA"], location: VAULT })[0];
    // Above the tiers on record, assume PSA's ~US$150 express-level pricing until SMC's is checked.
    return Math.round((opt ? opt.total : 150 * currentUsdToAudRate()) * 100) / 100;
  }

  return 0;
}
// Rough expected turnaround in days, used only for the Grading Tracker progress bar. PSA via
// Australia has real published tiers by declared value; ShipMyCards (US) and SGC don't have a
// specific figure on record here, so those two use a reasonable estimate — flagged as such in
// the UI rather than presented as precise.
function estimateGradingTurnaroundDays(service, declaredValueAUD) {
  if (!service) return null;
  const s = service.toLowerCase();
  const grader = { "psa via australia": "PSA", "psa via aus": "PSA", "bgs via australia": "BGS", "cgc via australia": "CGC", "tcg grading (au)": "TCG", "sgc via australia": "SGC", "sgc via aus": "SGC", "cga via australia": "CGA" }[s];
  if (grader) {
    const opt = gradingOptionsFor(declaredValueAUD || 0, grader === "TCG" || grader === "CGA" ? "Pokémon" : null, { graders: [grader] })[0];
    return opt ? opt.days : null;
  }
  if (s === "psa via shipmycards" || s === "psa via usa") {
    const opt = gradingOptionsFor(declaredValueAUD || 0, null, { graders: ["PSA"], location: VAULT })[0];
    return opt ? opt.days : 60;
  }
  return null;
}

// ===== Grading chances =====
// The PSA 10 / PSA 9 chances used when a raw card has no Grade Check photo or set gem rate.
// The app swaps in your own results (blended toward these defaults) when you turn that on in the
// Grading Tracker.
const DEFAULT_GRADE_RATES = { p10: 0.35, p9: 0.45, mine: false };
let PERSONAL_GRADE_RATES = null;
function defaultGradeRates() {
  return PERSONAL_GRADE_RATES || DEFAULT_GRADE_RATES;
}

// What a card was expected to grade when it was sent — kept so results can be compared later.
function gradingExpectationFor(c) {
  const a = c.gradeAnalysis;
  if (a && a.psa10Prob != null) {
    return { p10: Number(a.psa10Prob) || 0, p9: Number(a.psa9Prob) || 0, source: "Grade Check photo", low: a.predictedGradeLow ?? null, high: a.predictedGradeHigh ?? null };
  }
  const gem = c.setGemRate !== "" && c.setGemRate != null && !Number.isNaN(Number(c.setGemRate)) ? Math.max(0, Math.min(1, Number(c.setGemRate) / 100)) : null;
  if (gem != null) return { p10: gem, p9: Math.min(1 - gem, 0.4), source: "Set gem rate" };
  const d = defaultGradeRates();
  return { p10: d.p10, p9: d.p9, source: d.mine ? "Your rate" : "Default" };
}

// The bookkeeping that goes with a status change, wherever it's made: sale and listing dates,
// the grading fee and send date, what the card was expected to grade, and the grade it got.
function applyStatusTransitions(prev, next) {
  if (!prev || prev.status === next.status) return next;
  const today = new Date().toISOString().slice(0, 10);
  const out = { ...next };
  if (out.status === "Sold" && (!out.dateSold || out.dateSold === prev.dateSold)) out.dateSold = today;
  if (out.status === "Listed" && (!out.dateListed || out.dateListed === prev.dateListed)) {
    Object.assign(out, { dateListed: today, listingActions: [], lastListingActionAt: null });
  }
  if (out.status === "At Grading") {
    // Sending a card locks in the fee at that moment (declared value from current comps) —
    // unless the caller already set it (the submission planner does).
    if (!out.gradingSentDate || out.gradingSentDate === prev.gradingSentDate) {
      const declaredValue = Math.max(Number(prev.psa9Avg) || 0, Number(prev.psa10Avg) || 0, Number(prev.rawAvg) || 0);
      out.gradingCostPaid = gradingCost(effectiveGradingService({ ...prev, ...out, gradingService: out.gradingService || prev.gradingService }), declaredValue);
      out.gradingSentDate = today;
    }
    out.gradingExpectation = gradingExpectationFor(prev);
    out.gradingResult = null;
  }
  if (prev.status === "At Grading" && out.status !== "At Grading" && out.status !== "Raw" && out.grade) {
    out.gradingResult = { grade: out.grade, returnedAt: today, expected: prev.gradingExpectation || gradingExpectationFor(prev) };
  }
  return out;
}

// Grade groups for the engine's two graded value slots (psa9Avg / psa10Avg). The slot only says
// where a graded card's value lives — the value itself comes from comps for the card's own grade
// (a BGS 9.5 card stores BGS 9.5 sales in the "9" slot, not PSA 9 prices).
const PSA9_GRADES = ["psa 9", "sgc 9", "sgc 9.5", "bgs 9", "bgs 9.5", "cgc 9", "cgc 9.5", "tag 9"];
const PSA10_GRADES = ["psa 10", "sgc 10", "bgs 10", "cgc 10", "tag 10"];

// Which value slot a graded card's own-grade price lives in: 10s (any grader) in "psa10", every
// other grade — 9s, 9.5s, and 8-or-lower slabs too — in "psa9". Slot names are storage only; the
// price itself is always for the card's own grade (see compsGradeMismatch).
function valueSlotForGrade(grade) {
  const g = String(grade || "").toLowerCase().trim();
  if (!g) return null;
  return PSA10_GRADES.includes(g) ? "psa10" : "psa9";
}

// The label for a value slot on a specific card: a graded card's own grade ("BGS 9.5") for the
// slot it lives in, otherwise the generic PSA name used for raw cards' grading estimates.
function gradeSlotLabel(card, slot) {
  const generic = slot === "psa10" ? "PSA 10" : slot === "psa9" ? "PSA 9" : "Raw";
  const g = String((card && card.grade) || "").toLowerCase();
  if (!g || slot === "raw") return generic;
  return valueSlotForGrade(g) === slot ? card.grade : generic;
}

// A PSA 9 estimate for a raw card with no PSA 9 comp (or one saved as $0): about 35% of the PSA 10
// price, which is typical for modern cards, but never under 15% above raw and never over 60% of the
// PSA 10. Rough — a real PSA 9 comp always replaces it.
function estimatePsa9(c) {
  if (Number(c.psa9Avg) > 0) return null;
  const p10 = Number(c.psa10Avg) || 0;
  if (!p10) return null;
  const raw = Number(c.rawAvg) || 0;
  const est = Math.min(Math.max(p10 * 0.35, raw * 1.15), p10 * 0.6);
  return Math.round(est * 100) / 100;
}

// Your own call to hold a card (a player you believe in) beats the model's decision until its
// review date, then the model's call comes back with a prompt to review.
function applyManualHold(c, decision) {
  const active = c.status === "Raw" || c.status === "Graded";
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const manualHold = active && Boolean(c.holdManual) && (!c.holdUntil || c.holdUntil >= today);
  return {
    modelDecision: decision,
    manualHold,
    holdReviewDue: active && Boolean(c.holdManual) && Boolean(c.holdUntil) && c.holdUntil < today,
    decision: manualHold ? "Hold" : decision,
  };
}

// The sell-decision badge text, naming the card's own grade ("Sell BGS 9.5", not "Sell PSA 9").
function sellDecisionLabel(card, decision) {
  if (card && card.manualHold && decision === "Hold") return "📌 Holding";
  const label = (SELL_DECISION_STYLE[decision] || SELL_DECISION_STYLE[""]).label;
  if ((decision === "Sell PSA 9" || decision === "Sell PSA 10") && card && card.grade) return `Sell ${card.grade}`;
  return label;
}

// True when a graded card's saved value may be for a different grade than the one it holds —
// e.g. PSA 9 prices saved before it came back BGS 9.5. Comps saved since this was tracked
// record their grade in `compsGrade`.
function compsGradeMismatch(card) {
  const g = String((card && card.grade) || "").toLowerCase().trim();
  // PSA 9 and PSA 10 are the slots' native grades, so their prices are always right.
  if (!g || g === "psa 9" || g === "psa 10") return false;
  const slot = valueSlotForGrade(g) === "psa10" ? "psa10Avg" : "psa9Avg";
  if (card[slot] == null) return false;
  return String(card.compsGrade || "").toLowerCase().trim() !== g;
}

// Sell decision for a slab, judged only on prices for its own grade. No trustworthy own-grade
// price (missing, or maybe a PSA price on an SGC/BGS slab) → "Check Comps" instead of a guess.
function gradedSellDecision(c, psa9GGR, psa10GGR) {
  if (ownGradeValue(c) == null) return "Check Comps";
  const slot = valueSlotForGrade(c.grade);
  if (slot === "psa10" && (psa10GGR ?? 0) >= 20) return "Sell PSA 10";
  if (slot === "psa9" && (psa9GGR ?? 0) >= 0) return "Sell PSA 9";
  return "Hold";
}

// A graded card's value for its own grade, or null when there isn't one you can trust yet
// (missing, or possibly saved for a different grade).
function ownGradeValue(card) {
  const slot = valueSlotForGrade(card && card.grade);
  if (!slot) return null;
  const v = slot === "psa10" ? card.psa10Avg : card.psa9Avg;
  return v == null || compsGradeMismatch(card) ? null : v;
}

// ===== Selling method fee estimator =====
// Each platform's real fee structure, so My Sales can suggest a realistic number instead of
// forcing the generic Fees % (built for a flat eBay-style percentage) onto every sale.
const SELLING_METHOD_OPTIONS = [
  "eBay",
  "eBay Live",
  "Whatnot",
  "Whatnot (AU promo hours)",
  "DCSports87",
  "Fanatics Collect (PWCC)",
  "ShipMyCards Marketplace",
  "SMC → PC Sportscards (eBay)",
  "SMC → Fanatics Collect auction",
  "SMC → Fanatics Collect Buy Now",
  "SMC card show",
  "SMC Purchase Program",
  "Facebook / local",
  "Card show (in person)",
  "Other",
];

function dcsports87Fee(price) {
  const p = price || 0;
  if (p < 10) return p * 0.2 + 0.75;
  if (p < 25) return p * 0.2 + 0.5;
  if (p < 1000) return p * 0.15 + 0.5;
  if (p < 5000) return p * 0.1;
  return p * 0.03 + 300;
}

// PC Sportscards' eBay consignment, sent from the ShipMyCards vault: their payout tiers (83% under
// US$50, 87% to US$999, 92% to US$5,000, 95% above) plus a US$1 listing fee per single and
// ShipMyCards' 1%. Tiers are in US$, so the A$ price is converted at today's rate.
function pcSportscardsViaSmcFee(priceAud) {
  const usd = audToUsd(priceAud);
  const cut = usd < 50 ? 0.17 : usd < 1000 ? 0.13 : usd < 5000 ? 0.08 : 0.05;
  return priceAud * (cut + 0.01) + currentUsdToAudRate();
}

function estimateSellingFee(method, price) {
  const p = Number(price) || 0;
  switch (method) {
    case "eBay":
      return p * 0.1325 + 0.3;
    case "eBay Live":
      return p * 0.089 + 0.3;
    case "Whatnot":
      return p * (0.08 + 0.029) + 0.3;
    case "Whatnot (AU promo hours)":
      return p * (0.04 + 0.029) + 0.3;
    case "DCSports87":
      return dcsports87Fee(p);
    case "Fanatics Collect (PWCC)":
      return p * 0.06;
    case "ShipMyCards Marketplace":
      return p * 0.01;
    case "SMC → PC Sportscards (eBay)":
      return pcSportscardsViaSmcFee(p);
    // Enter the hammer price as the sale price. Fanatics charges the seller nothing at auction (the
    // buyer pays a premium on top); ShipMyCards takes 1% plus a US$3 per-card fee (per SMC's
    // consignment form, Oct 2026).
    case "SMC → Fanatics Collect auction":
      return p * 0.01 + 3 * currentUsdToAudRate();
    case "SMC → Fanatics Collect Buy Now":
      return p * 0.07 + 3 * currentUsdToAudRate();
    case "SMC card show":
      return p * 0.02 + 10 * currentUsdToAudRate();
    case "SMC Purchase Program":
    case "Facebook / local":
    case "Card show (in person)":
      return 0;
    default:
      return null; // Other — unknown, leave for manual entry
  }
}

// What a sale actually put in your pocket. Uses the fees you entered; otherwise the selling
// platform's own fee formula (e.g. no fees on Facebook / local); otherwise the card's flat fee %.
function netSaleProceeds(c, fees) {
  if (c.actualSellPrice == null) return null;
  const price = Number(c.actualSellPrice);
  const shipping = Number(c.consignmentShipping) || 0;
  if (c.actualFeesPaid != null && c.actualFeesPaid !== "") return price - Number(c.actualFeesPaid) - shipping;
  const platformFee = c.sellingMethod ? estimateSellingFee(c.sellingMethod, price) : null;
  if (platformFee != null) return price - platformFee - shipping;
  return price * (1 - fees);
}

// The fee a sale used, by the same rules as netSaleProceeds.
function saleFeesUsed(c, fees) {
  const price = Number(c.actualSellPrice) || 0;
  if (c.actualFeesPaid != null && c.actualFeesPaid !== "") return { amount: Number(c.actualFeesPaid), source: "actual" };
  const platformFee = c.sellingMethod ? estimateSellingFee(c.sellingMethod, price) : null;
  if (platformFee != null) return { amount: platformFee, source: "platform" };
  return { amount: price * (fees || 0.13), source: "flat" };
}

function computeCard(c) {
  // If c is null/undefined, return early instead of recursing
  if (!c) return {};

  const holdingCost = (c.shipMyCards || "").toLowerCase() === "yes" ? 4.5 : 0;
  const fees = c.feesPct || 0.13;
  const grade = (c.grade || "").toLowerCase();
  const status = c.status;

  const isActive = status === "Raw" || status === "Graded";

  const raw = c.rawAvg ?? 0;
  // No PSA 9 price (missing, or saved as $0) on a raw card: estimate one, so grading isn't judged
  // as if a 9 were worthless. Flagged as an estimate wherever it shows.
  const psa9Est = status === "Raw" ? estimatePsa9(c) : null;
  const psa9 = psa9Est ?? c.psa9Avg ?? 0;
  // A raw card with no PSA 10 price yet borrows the PSA 9 one for its estimates; a slab never does.
  const psa10 = c.psa10Avg ?? (status === "Graded" ? null : c.psa9Avg) ?? 0;

  // A raw card's graded values are PSA prices; grading through BGS/CGC/TCG resells for less.
  const resale = status === "Raw" ? serviceResaleFactor(effectiveGradingService(c), c.sport) : 1;
  const netRawSell = raw * (1 - fees);
  const netPsa9Sell = psa9 * resale * (1 - fees);
  const netPsa10Sell = psa10 * resale * (1 - fees);

  const declaredValue = Math.max(psa9, psa10, raw);
  const autoGradingCost = gradingCost(effectiveGradingService(c), declaredValue) || 0;

  const isSelfGraded = SELF_GRADED_SERVICES.includes(effectiveGradingService(c));

  const appliedGradingCost = Number(c.gradingCostPaid) > 0
    ? Number(c.gradingCostPaid)
    : (isSelfGraded && (status === "At Grading" || status === "Graded") ? autoGradingCost : 0);

  const totalCost = (c.paid || 0) + (c.shipping || 0) + holdingCost + appliedGradingCost;
  const futureGCost = status === "Raw" && isSelfGraded ? autoGradingCost : 0;

  const rawGGR = isActive ? (status === "Graded" ? null : netRawSell - totalCost) : null;
  const psa9Eligible = isActive && (status === "Raw" || valueSlotForGrade(grade) === "psa9");
  const psa9GGR = psa9Eligible ? netPsa9Sell - totalCost - futureGCost : null;

  const psa10Eligible = isActive && (status === "Raw" || valueSlotForGrade(grade) === "psa10");
  const psa10GGR = psa10Eligible ? netPsa10Sell - totalCost - futureGCost : null;

// 1. Calculate Graded EV (with PSA 8/below penalty on setGemRate)
  let gradedEV = null;
  if (isActive && status !== "Graded") {
    const analysis = c.gradeAnalysis;
    const gemRate = c.setGemRate !== "" && c.setGemRate != null ? Math.max(0, Math.min(1, Number(c.setGemRate) / 100)) : null;
    if (analysis) {
      const belowValue = raw ?? 0;
      const expectedRevenue = psa10 * resale * (1 - fees) * analysis.psa10Prob + psa9 * resale * (1 - fees) * analysis.psa9Prob + belowValue * (1 - fees) * analysis.belowProb;
      gradedEV = expectedRevenue - totalCost - futureGCost;
    } else if (gemRate != null) {
      const p10 = gemRate;
      const p9 = Math.min(1 - p10, 0.40);
      const pBelow = Math.max(0, 1 - p10 - p9); // Captures floor loss on PSA 8/7

      gradedEV = p10 * (netPsa10Sell - totalCost - futureGCost) +
                 p9 * (netPsa9Sell - totalCost - futureGCost) +
                 pBelow * (netRawSell - totalCost - futureGCost);
    } else {
      // Below a 9, the fee is paid and the card's worth about what it was raw.
      const { p10: p10Prob, p9: p9Prob } = defaultGradeRates();
      const pBelow = Math.max(0, 1 - p10Prob - p9Prob);
      gradedEV = p10Prob * (netPsa10Sell - totalCost - futureGCost) + p9Prob * (netPsa9Sell - totalCost - futureGCost) + pBelow * (netRawSell - totalCost - futureGCost);
    }
  }

  // 2. Gem Rate Floor Check (<25% gets demoted)
  const gemRateVal = c.setGemRate !== "" && c.setGemRate != null ? Number(c.setGemRate) : null;
  const passesGemFloor = gemRateVal == null || gemRateVal >= 25.0;

  // 3. Strict Grade Worth It Bar
  let gradeWorthIt = "NO";
  if ((psa10GGR ?? 0) >= 20 && (psa9GGR ?? 0) >= 0 && (gradedEV ?? -Infinity) >= (rawGGR ?? -Infinity) && passesGemFloor) {
    gradeWorthIt = "YES";
  } else if ((psa10GGR ?? 0) >= 20 && (psa9GGR ?? 0) >= -10 && (psa9GGR ?? 0) < 0 && (gradedEV ?? -Infinity) >= (rawGGR ?? -Infinity)) {
    gradeWorthIt = "HIGH RISK";
  } else if ((psa10GGR ?? 0) >= 20 && !passesGemFloor && (gradedEV ?? -Infinity) >= (rawGGR ?? -Infinity)) {
    gradeWorthIt = "HIGH RISK"; // Demotes low gem rate cards (<25%) to HIGH RISK
  }

let sellDecision = "";
  if (!c.player) {
    sellDecision = "";
  } else if (status === "Sold") {
    sellDecision = "Sold";
  } else if (status === "Listed") {
    sellDecision = "Listed";
  } else if (status === "At Grading") {
    sellDecision = "At Grading";
  } else if (status === "Graded") {
    sellDecision = gradedSellDecision(c, psa9GGR, psa10GGR);
  } else {
    const minRoiThreshold = 0.20;
    const minDollarProfit = 3.00;

    const rawRoi = totalCost > 0 ? (rawGGR ?? 0) / totalCost : 0;
    const sellRawFirst = (rawGGR ?? 0) >= minDollarProfit && rawRoi >= minRoiThreshold;

    const gradeFirst = gradeWorthIt !== "NO" && (psa10GGR ?? 0) >= 20;

    if (sellRawFirst && (rawGGR ?? 0) >= (psa10GGR ?? 0)) {
      sellDecision = "Sell Raw First";
    } else if (gradeFirst && (psa10GGR ?? 0) > (rawGGR ?? -Infinity)) {
      sellDecision = "Grade First";
    } else if (sellRawFirst) {
      sellDecision = "Sell Raw First";
    } else {
      sellDecision = "Hold";
    }
  }

  const { modelDecision, manualHold, holdReviewDue, decision: heldDecision } = applyManualHold(c, sellDecision);
  sellDecision = heldDecision;

  const gradeCall = status !== "Raw" || modelDecision === "Sell Raw First" ? "NO" : gradeWorthIt;

  let sellPriority = 9;
  if (sellDecision === "") sellPriority = 9;
  else if (sellDecision === "Sell PSA 9" || sellDecision === "Sell PSA 10") sellPriority = 1;
  else if (sellDecision === "Sell Raw First") sellPriority = 2;
  else if (sellDecision === "Check Comps") sellPriority = 2.5;
  else if (gradeCall === "YES" && sellDecision === "Grade First") sellPriority = 3;
  else if (gradeCall === "HIGH RISK" && sellDecision === "Grade First") sellPriority = 4;
  else if (gradeCall === "NO" && sellDecision === "Grade First") sellPriority = 5;
  else if (sellDecision === "Hold") sellPriority = 6;
  else if (sellDecision === "Listed") sellPriority = 7;
  else if (sellDecision === "Sold") sellPriority = 8;
  else if (sellDecision === "At Grading") sellPriority = 6.5;
  else sellPriority = 9;

  const rawBE = totalCost / (1 - fees);
  const psa9BE = (totalCost + futureGCost) / (1 - fees);
  const psa10BE = (totalCost + futureGCost) / (1 - fees);

  const netSale = netSaleProceeds(c, fees);
  const realisedProfit = netSale != null ? netSale - totalCost : null;

  let projectedNetSell = null;
  if (valueSlotForGrade(grade) === "psa10") projectedNetSell = c.psa10Avg != null ? netPsa10Sell : null;
  else if (valueSlotForGrade(grade) === "psa9") projectedNetSell = c.psa9Avg != null ? netPsa9Sell : null;
  else if (c.rawAvg != null) projectedNetSell = netRawSell;
  const saleVariance = netSale != null && projectedNetSell != null ? netSale - projectedNetSell : null;
  const saleVariancePct = saleVariance != null && projectedNetSell > 0 ? saleVariance / projectedNetSell : null;

  let gradingTurnaroundDays = null, gradingDaysElapsed = null, gradingProgressPct = null;
  if (status === "At Grading" && c.gradingSentDate) {
    gradingTurnaroundDays = estimateGradingTurnaroundDays(effectiveGradingService(c), declaredValue);
    const sent = new Date(c.gradingSentDate);
    const now = new Date();
    gradingDaysElapsed = Math.max(0, Math.round((now - sent) / 86400000));
    if (gradingTurnaroundDays) gradingProgressPct = Math.min(100, Math.round((gradingDaysElapsed / gradingTurnaroundDays) * 100));
  }

  // Pure data return — NEVER call computeCard inside here!
  return {
    ...c,
    holdingCost,
    totalCost,
    gradingTurnaroundDays,
    gradingDaysElapsed,
    gradingProgressPct,
    netRawSell,
    netPsa9Sell,
    netPsa10Sell,
    gradingCostValue: status === "Graded" ? 0 : autoGradingCost,
    rawGGR,
    psa9GGR,
    psa10GGR,
    gradedEV,
    psa9Estimate: psa9Est,
    modelDecision,
    manualHold,
    holdReviewDue,
    gradeCall,
    sellDecision,
    sellPriority,
    rawBE,
    psa9BE,
    psa10BE,
    netSale,
    realisedProfit,
    projectedNetSell,
    saleVariance,
    saleVariancePct,
  };
}
// Pokemon sheet decision engine
function computePokemonCard(c) {
  const holdingCost = (c.shipMyCards || "").toLowerCase() === "yes" ? 4.5 : 0;
  const fees = c.feesPct || 0.13;
  const status = c.status;
  const isActive = status === "Raw" || status === "Graded";

  const raw = c.rawAvg ?? 0;
  // No PSA 9 price (missing, or saved as $0) on a raw card: estimate one, so grading isn't judged
  // as if a 9 were worthless. Flagged as an estimate wherever it shows.
  const psa9Est = status === "Raw" ? estimatePsa9(c) : null;
  const psa9 = psa9Est ?? c.psa9Avg ?? 0;
  // A raw card with no PSA 10 price yet borrows the PSA 9 one for its estimates; a slab never does.
  const psa10 = c.psa10Avg ?? (status === "Graded" ? null : c.psa9Avg) ?? 0;

  // Graded values are PSA prices; CGC/TCG slabs resell for less (CGC holds up better for Pokémon).
  const resale = status === "Raw" ? serviceResaleFactor(effectiveGradingService(c), "Pokémon") : 1;
  const netRawSell = raw * (1 - fees);
  const netPsa9Sell = psa9 * resale * (1 - fees);
  const netPsa10Sell = psa10 * resale * (1 - fees);

  const declaredValue = Math.max(psa9, psa10, raw);
  const autoGradingCost = gradingCost(effectiveGradingService(c), declaredValue) || 0;

  const isSelfGraded = SELF_GRADED_SERVICES.includes(effectiveGradingService(c));

  const appliedGradingCost = Number(c.gradingCostPaid) > 0
    ? Number(c.gradingCostPaid)
    : (isSelfGraded && (status === "At Grading" || status === "Graded") ? autoGradingCost : 0);

  const totalCost = (c.paid || 0) + (c.shipping || 0) + holdingCost + appliedGradingCost;
  const futureGCost = status === "Raw" && isSelfGraded ? autoGradingCost : 0;

  const rawGGR = isActive ? (status === "Graded" ? null : netRawSell - totalCost) : null;
  const psa9GGR = isActive ? netPsa9Sell - totalCost - futureGCost : null;
  const psa10GGR = isActive ? netPsa10Sell - totalCost - futureGCost : null;

// 1. Calculate Graded EV (with PSA 8/below penalty on setGemRate)
  let gradedEV = null;
  if (isActive && status !== "Graded") {
    const analysis = c.gradeAnalysis;
    const gemRate = c.setGemRate !== "" && c.setGemRate != null ? Math.max(0, Math.min(1, Number(c.setGemRate) / 100)) : null;
    if (analysis) {
      const belowValue = raw ?? 0;
      const expectedRevenue = psa10 * resale * (1 - fees) * analysis.psa10Prob + psa9 * resale * (1 - fees) * analysis.psa9Prob + belowValue * (1 - fees) * analysis.belowProb;
      gradedEV = expectedRevenue - totalCost - futureGCost;
    } else if (gemRate != null) {
      const p10 = gemRate;
      const p9 = Math.min(1 - p10, 0.40);
      const pBelow = Math.max(0, 1 - p10 - p9); // Captures floor loss on PSA 8/7

      gradedEV = p10 * (netPsa10Sell - totalCost - futureGCost) +
                 p9 * (netPsa9Sell - totalCost - futureGCost) +
                 pBelow * (netRawSell - totalCost - futureGCost);
    } else {
      // Below a 9, the fee is paid and the card's worth about what it was raw.
      const { p10: p10Prob, p9: p9Prob } = defaultGradeRates();
      const pBelow = Math.max(0, 1 - p10Prob - p9Prob);
      gradedEV = p10Prob * (netPsa10Sell - totalCost - futureGCost) + p9Prob * (netPsa9Sell - totalCost - futureGCost) + pBelow * (netRawSell - totalCost - futureGCost);
    }
  }

  // 2. Gem Rate Floor Check (<25% gets demoted)
  const gemRateVal = c.setGemRate !== "" && c.setGemRate != null ? Number(c.setGemRate) : null;
  const passesGemFloor = gemRateVal == null || gemRateVal >= 25.0;

  // 3. Strict Grade Worth It Bar
  let gradeWorthIt = "NO";
  if ((psa10GGR ?? 0) >= 20 && (psa9GGR ?? 0) >= 0 && (gradedEV ?? -Infinity) >= (rawGGR ?? -Infinity) && passesGemFloor) {
    gradeWorthIt = "YES";
  } else if ((psa10GGR ?? 0) >= 20 && (psa9GGR ?? 0) >= -10 && (psa9GGR ?? 0) < 0 && (gradedEV ?? -Infinity) >= (rawGGR ?? -Infinity)) {
    gradeWorthIt = "HIGH RISK";
  } else if ((psa10GGR ?? 0) >= 20 && !passesGemFloor && (gradedEV ?? -Infinity) >= (rawGGR ?? -Infinity)) {
    gradeWorthIt = "HIGH RISK"; // Demotes low gem rate cards (<25%) to HIGH RISK
  }

// 1. Define gradeCall
  const gradeCall = status === "Raw" ? gradeWorthIt : "";

  // 2. Sell Decision Tree
 let sellDecision = "";
  if (!c.player) {
    sellDecision = "";
  } else if (status === "Sold") {
    sellDecision = "Sold";
  } else if (status === "Listed") {
    sellDecision = "Listed";
  } else if (status === "At Grading") {
    sellDecision = "At Grading";
  } else if (status === "Graded") {
    sellDecision = gradedSellDecision(c, psa9GGR, psa10GGR);
  } else {
    const minRoiThreshold = 0.20;
    const minDollarProfit = 3.00;

    const rawRoi = totalCost > 0 ? (rawGGR ?? 0) / totalCost : 0;
    const sellRawFirst = (rawGGR ?? 0) >= minDollarProfit && rawRoi >= minRoiThreshold;

    const gradeFirst = gradeWorthIt !== "NO" && (psa10GGR ?? 0) >= 20;

    if (sellRawFirst && (rawGGR ?? 0) >= (psa10GGR ?? 0)) {
      sellDecision = "Sell Raw First";
    } else if (gradeFirst && (psa10GGR ?? 0) > (rawGGR ?? -Infinity)) {
      sellDecision = "Grade First";
    } else if (sellRawFirst) {
      sellDecision = "Sell Raw First";
    } else {
      sellDecision = "Hold";
    }
  }

  const { modelDecision, manualHold, holdReviewDue, decision: heldDecision } = applyManualHold(c, sellDecision);
  sellDecision = heldDecision;

  // 3. Priority Mapping (Reads gradeCall safely now)
  let sellPriority = 9;
  if (sellDecision === "") sellPriority = 9;
  else if (sellDecision === "Sell PSA 9" || sellDecision === "Sell PSA 10") sellPriority = 1;
  else if (sellDecision === "Sell Raw First") sellPriority = 2;
  else if (sellDecision === "Check Comps") sellPriority = 2.5;
  else if (gradeCall === "YES" && sellDecision === "Grade First") sellPriority = 3;
  else if (gradeCall === "HIGH RISK" && sellDecision === "Grade First") sellPriority = 4;
  else if (gradeCall === "NO" && sellDecision === "Grade First") sellPriority = 5;
  else if (sellDecision === "Hold") sellPriority = 6;
  else if (sellDecision === "Listed") sellPriority = 7;
  else if (sellDecision === "Sold") sellPriority = 8;
  else if (status === "At Grading") sellPriority = 6.5;
  else sellPriority = 9;
  const rawBE = totalCost / (1 - fees);
  const psa9BE = (totalCost + futureGCost) / (1 - fees);
  const psa10BE = (totalCost + futureGCost) / (1 - fees);

  const netSale = netSaleProceeds(c, fees);
  const realisedProfit = netSale != null ? netSale - totalCost : null;

  const pkmnGrade = (c.grade || "").toLowerCase();
  let projectedNetSell = null;
  if (valueSlotForGrade(pkmnGrade) === "psa10") projectedNetSell = c.psa10Avg != null ? netPsa10Sell : null;
  else if (valueSlotForGrade(pkmnGrade) === "psa9") projectedNetSell = c.psa9Avg != null ? netPsa9Sell : null;
  else if (c.rawAvg != null) projectedNetSell = netRawSell;
  const saleVariance = netSale != null && projectedNetSell != null ? netSale - projectedNetSell : null;
  const saleVariancePct = saleVariance != null && projectedNetSell > 0 ? saleVariance / projectedNetSell : null;

  let gradingTurnaroundDays = null, gradingDaysElapsed = null, gradingProgressPct = null;
  if (status === "At Grading" && c.gradingSentDate) {
    gradingTurnaroundDays = estimateGradingTurnaroundDays(effectiveGradingService(c), declaredValue);
    const sent = new Date(c.gradingSentDate);
    const now = new Date();
    gradingDaysElapsed = Math.max(0, Math.round((now - sent) / 86400000));
    if (gradingTurnaroundDays) gradingProgressPct = Math.min(100, Math.round((gradingDaysElapsed / gradingTurnaroundDays) * 100));
  }

  return {
    ...c,
    holdingCost,
    totalCost,
    gradingTurnaroundDays,
    gradingDaysElapsed,
    gradingProgressPct,
    netRawSell,
    netPsa9Sell,
    netPsa10Sell,
    gradingCostValue: status === "Graded" ? 0 : autoGradingCost,
    rawGGR,
    psa9GGR,
    psa10GGR,
    gradedEV,
    psa9Estimate: psa9Est,
    modelDecision,
    manualHold,
    holdReviewDue,
    gradeCall,
    sellDecision,
    sellPriority,
    rawBE,
    psa9BE,
    psa10BE,
    netSale,
    realisedProfit,
    projectedNetSell,
    saleVariance,
    saleVariancePct,
  };
}
// ===== Buy Evaluator engine =====

// ===== Buy Evaluator engine =====

function computeBuy(b) {
  const usingSMC = b.shipMyCards === "ShipMyCards";
  const targetROI = usingSMC ? 0.5 : 0.4;
  const holdingFee = usingSMC ? 4.5 : 0;
  const fees = b.feesPct || 0.13; // Default 13% eBay/platform fees if not passed

  const gradeLevel = (b.psaLevel || "").toLowerCase();
  let riskAdjust = 0;
  if (b.rawGraded === "Raw") riskAdjust = -0.1;
  else if (gradeLevel.includes("9")) riskAdjust = 0;
  else if (gradeLevel.includes("10")) riskAdjust = 0.1;

  // Raw/PSA 9/PSA 10 averages from up to 2 logged sales each
  const rawAvg = avgOfSales(b.rawSale1, b.rawSale2);
  const psa9Avg = avgOfSales(b.psa9Sale1, b.psa9Sale2);
  const psa10Avg = avgOfSales(b.psa10Sale1, b.psa10Sale2);

  // Market price for the buy math itself:
  // If graded, dynamically match the grade level (or fallback to whichever graded comps exist)
  let marketPrice = 0;
  if (b.rawGraded === "Graded") {
    if (gradeLevel.includes("10")) {
      marketPrice = psa10Avg ?? psa9Avg ?? rawAvg ?? 0;
    } else if (gradeLevel.includes("9")) {
      marketPrice = psa9Avg ?? rawAvg ?? 0;
    } else {
      // Fallback: pick the highest available comp tier
      marketPrice = psa10Avg ?? psa9Avg ?? rawAvg ?? 0;
    }
  } else {
    // Raw card baseline
    marketPrice = rawAvg ?? 0;
  }

  const adjMarketValue = marketPrice * (1 - riskAdjust);

  const auctionHeat =
    (b.bidders || 0) >= 7 || (b.watchers || 0) >= 7 ? "Hot" : (b.bidders || 0) >= 3 || (b.watchers || 0) >= 4 ? "Mid" : "Cold";

  const heatMult = auctionHeat === "Cold" ? 1.08 : auctionHeat === "Hot" ? 0.95 : 1;
  const valueMult = adjMarketValue >= 80 ? 1.1 : adjMarketValue >= 50 ? 1.05 : 1;

  const feeDollar = adjMarketValue * fees;
  const shipping = Number(b.shipping) || 0;
  const breakevenBid = adjMarketValue - feeDollar - holdingFee - shipping;
  const effectiveMult = Math.min(heatMult * valueMult, 1);
  const maxSnipeBid = Math.max(0, breakevenBid * effectiveMult);

  const currentBid = Number(b.currentBid) || 0;
  const referenceBid = currentBid > 0 ? currentBid : maxSnipeBid;

  const estProfit = adjMarketValue - (referenceBid + feeDollar + holdingFee + shipping);
  const roiPct = referenceBid > 0 ? estProfit / referenceBid : null;

// Target ROI threshold: 20% minimum (0.20)
  const MIN_ROI_THRESHOLD = 0.20;

  const decision =
    marketPrice <= 0
      ? null
      : currentBid > 0
      ? estProfit <= 0 || (roiPct != null && roiPct < MIN_ROI_THRESHOLD)
        ? "PASS"
        : referenceBid <= (b.maxBudget ?? Infinity)
        ? "BUY"
        : "PASS"
      : maxSnipeBid > 0 && roiPct >= MIN_ROI_THRESHOLD && maxSnipeBid <= (b.maxBudget ?? Infinity)
      ? "BUY"
      : "PASS";

  // Worth grading after buying? ONLY calculated for RAW cards
  let rawGGRBuy = null, psa9GGRBuy = null, psa10GGRBuy = null, gradedEVBuy = null, gradeCallBuy = null;
  const gCost = gradingCost(b.gradingService, Math.max(psa9Avg || 0, psa10Avg || 0));

  if (b.rawGraded === "Raw" && b.gradingService !== "None") {
    const costBasis = maxSnipeBid + shipping + holdingFee;
    rawGGRBuy = rawAvg != null ? rawAvg * (1 - fees) - costBasis : null;
    psa9GGRBuy = psa9Avg != null ? psa9Avg * (1 - fees) - costBasis - gCost : null;
    psa10GGRBuy = psa10Avg != null ? psa10Avg * (1 - fees) - costBasis - gCost : null;

    if (psa9GGRBuy != null || psa10GGRBuy != null) {
      const analysis = b.gradeAnalysis;
      if (analysis) {
        const totalCostGraded = costBasis + gCost;
        const belowValue = rawAvg ?? 0;
        const expectedRevenue =
          (psa10Avg ?? 0) * (1 - fees) * analysis.psa10Prob +
          (psa9Avg ?? 0) * (1 - fees) * analysis.psa9Prob +
          belowValue * (1 - fees) * analysis.belowProb;
        gradedEVBuy = expectedRevenue - totalCostGraded;
      } else {
        gradedEVBuy = defaultGradeRates().p10 * (psa10GGRBuy ?? 0) + defaultGradeRates().p9 * (psa9GGRBuy ?? 0);
      }
      if (psa10GGRBuy >= 20 && psa9GGRBuy >= 0 && gradedEVBuy >= (rawGGRBuy ?? -Infinity)) gradeCallBuy = "YES";
      else if (psa10GGRBuy >= 20 && psa9GGRBuy >= -10 && psa9GGRBuy < 0 && gradedEVBuy >= (rawGGRBuy ?? -Infinity)) gradeCallBuy = "HIGH RISK";
      else gradeCallBuy = "NO";
    }
  }

  const gradeDecision =
    b.rawGraded === "Raw"
      ? referenceBid > 0 && (adjMarketValue - shipping - 20) / referenceBid >= 0.5
        ? "Grade Recommended"
        : "Hold / Sell Raw"
      : "No Grade";

  const percentGap = marketPrice > 0 && currentBid > 0 ? (marketPrice - currentBid) / marketPrice : null;
  const gapZone =
    percentGap == null ? null : percentGap >= 0.3 ? "AUTO-BUY" : percentGap >= 0.2 ? "CONDITIONAL" : "NO-BUY";

  let budgetCap = b.isPokemonInsert ? 25 : b.rawGraded === "Raw" ? 50 : 100;
  const overCap = referenceBid > budgetCap;

  const bidRoom = currentBid > 0 ? maxSnipeBid - currentBid : null;
  const alreadyOverMax = currentBid > 0 && currentBid > maxSnipeBid;

  const paidAmount = Number(b.paidAmount) || 0;
  let actualProfit = null;
  let actualROIPct = null;
  if (paidAmount > 0 && marketPrice > 0) {
    actualProfit = adjMarketValue - (paidAmount + feeDollar + holdingFee + shipping);
    actualROIPct = actualProfit / paidAmount;
  }

  return {
    ...b,
    targetROI,
    holdingFee,
    riskAdjust,
    marketPrice,
    rawAvg,
    psa9Avg,
    psa10Avg,
    adjMarketValue,
    auctionHeat,
    maxSnipeBid,
    estProfit,
    roiPct,
    decision,
    gradeDecision,
    rawGGRBuy,
    psa9GGRBuy,
    psa10GGRBuy,
    gradedEVBuy,
    gradeCallBuy,
    percentGap,
    gapZone,
    budgetCap,
    overCap,
    bidRoom,
    alreadyOverMax,
    actualProfit,
    actualROIPct,
  };
}

function fmtMoney(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 2 });
}

// US dollars, labelled so they can't be mistaken for A$ — for ShipMyCards, which prices in USD.
function fmtUsd(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return `US$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Cards in the ShipMyCards vault are sold through SMC, which works in US dollars.
function sellsInUsd(card) {
  return card && card.location === "ShipMyCards Vault";
}

// A recommended listing converted to US$ at today's rate, with Best Offer settings worked out in US$.
function listingInUsd(listing) {
  if (!listing) return null;
  const listPrice = audToUsd(listing.listPrice);
  const floor = listing.floor != null ? audToUsd(listing.floor) : null;
  const market = listing.autoAccept != null ? audToUsd(listing.autoAccept) : null;
  return { ...listing, listPrice, floor, ...bestOfferSettings(market, floor) };
}

function fmtPct(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

// Averages 1 or 2 recent sale prices; blank fields (N/A) are ignored; both blank = null
function avgOfSales(a, b) {
  const va = a === "" || a == null ? null : Number(a);
  const vb = b === "" || b == null ? null : Number(b);
  if (va == null && vb == null) return null;
  if (va == null) return vb;
  if (vb == null) return va;
  return (va + vb) / 2;
}

// Appends a new history point only when the tier's average actually changed —
// re-saving unchanged values doesn't spam the trend with duplicate points.
function appendHistoryIfChanged(history, oldVal, newVal, dateStr) {
  const h = history || [];
  if (newVal == null) return h;
  if (oldVal === newVal) return h;
  return [...h, { date: dateStr, value: newVal }];
}

// A recommended listing price once a card is ready to sell: market average plus a
// negotiation buffer (most eBay buyers expect room to make an offer), with the
// break-even price shown as the floor you should never go below.
// Comps are already what cards actually sold for, and buyers check sold listings too, so the
// premium is kept small: just enough room for Best Offers.
const RAW_LIST_MARKUP = 1.05;
const GRADED_LIST_MARKUP = 1.02;

// eBay Best Offer settings: auto-accept anything at market value (sells straight away, no
// back-and-forth) and auto-decline anything under break-even. Accept never drops below decline.
function bestOfferSettings(marketValue, breakEven) {
  if (marketValue == null) return { autoAccept: null, autoDecline: breakEven ?? null };
  const autoDecline = breakEven != null ? Math.ceil(breakEven) : null;
  const autoAccept = Math.max(Math.ceil(marketValue), autoDecline ?? 0);
  return { autoAccept, autoDecline };
}

function recommendedListing(card) {
  // Raw cards have real condition/centering variance buyers can't fully verify from photos,
  // so a modest premium over average is normal. Graded cards are a known, fungible quantity —
  // the exact population and recent comps are public (PSA cert lookup, 130 Point), so buyers
  // won't pay a meaningful premium over what the card has actually been trading at.
  const basisMap = {
    "Sell Raw First": { avg: card.rawAvg, be: card.rawBE, label: "Raw", markup: RAW_LIST_MARKUP, history: card.rawHistory },
    "Sell PSA 9": { avg: card.psa9Avg, be: card.psa9BE, label: gradeSlotLabel(card, "psa9"), markup: GRADED_LIST_MARKUP, history: card.psa9History },
    "Sell PSA 10": { avg: card.psa10Avg, be: card.psa10BE, label: gradeSlotLabel(card, "psa10"), markup: GRADED_LIST_MARKUP, history: card.psa10History },
  };
  const basis = basisMap[card.sellDecision];
  if (!basis || basis.avg == null) return null;
  return {
    listPrice: basis.avg * basis.markup,
    floor: basis.be,
    ...bestOfferSettings(basis.avg, basis.be),
    label: basis.label,
    markupPct: Math.round((basis.markup - 1) * 100),
    lowConfidence: (basis.history || []).length <= 1,
  };
}

// Sell now, or hold for the sport's sell window? Waiting only pays when the window is close and the
// card is worth enough for the seasonal bump to beat putting the money back to work. In-season
// prices often run roughly 10–20% above the quiet months — a rough guide, not a guarantee.
const SEASON_UPLIFT = 0.15;
const SEASON_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function sellOrWait(card, listing) {
  if (!listing || typeof seasonalSellCheck !== "function") return null;
  const season = seasonalSellCheck(card.sport);
  if (!season) return null;
  const value = card.sellDecision === "Sell Raw First" ? card.rawAvg : ownGradeValue(card);
  if (value == null) return null;
  const money = (aud) => (sellsInUsd(card) ? fmtUsd(audToUsd(aud)) : fmtMoney(aud));
  const make = (verdict, label, text) => ({ verdict, label, text, season });

  if (season.isGoodTiming) return make("sell", "Sell now", `${season.monthName} is a sell month for ${season.sportLabel} — good timing.`);
  if (!season.nextSellMonth) return make("sell", "Sell now", "No sell window on the calendar for this sport — sell when the numbers work.");

  // Weeks until the start of the next sell month.
  const now = new Date();
  const idx = SEASON_MONTHS.indexOf(season.nextSellMonth);
  const target = new Date(now.getFullYear() + (idx <= now.getMonth() ? 1 : 0), idx, 1);
  const weeks = Math.max(1, Math.round((target - now) / (7 * 86400000)));
  const gain = value * SEASON_UPLIFT * (1 - (card.feesPct || 0.13));
  const trend = card.priceTrend && card.priceTrend.points && typeof trendChangePct === "function" ? trendChangePct(card.priceTrend.points) : null;
  const when = `The next ${season.sportLabel} sell window (${season.nextSellMonth}) is about ${weeks} week${weeks === 1 ? "" : "s"} away`;

  if (trend != null && trend <= -0.05) return make("sell", "Sell now", `Prices are falling (${Math.round(trend * 100)}% lately) — waiting for ${season.nextSellMonth} could mean selling lower. Take the profit now.`);
  if (value < 30 || gain < 10) return make("sell", "Sell now", `${when}, but waiting might only add about ${money(gain)}. Not worth tying the money up — sell and reinvest.`);
  if (weeks <= 6) return make("wait", `Wait · ${season.nextSellMonth}`, `${when} and could add about ${money(gain)}. Hold and list then — or list now at ${money(value * 1.1)} in case someone pays it.`);
  if (weeks <= 12 || gain >= 40) return make("listHigh", "List high now", `${when}. List now about 10% above comps (${money(value * 1.1)}) with Best Offer — if someone pays it, great; if not, it's already up when ${season.nextSellMonth} arrives and the Listing check-up brings it down over time.`);
  return make("sell", "Sell now", `${when} — too long to wait for about ${money(gain)} more. Sell now and put the money back to work.`);
}
const SELL_OR_WAIT_STYLE = {
  sell: { color: "#4E8B6B", bg: "#1E3A2B", border: "#2E5940", icon: "✅" },
  wait: { color: "#C9A227", bg: "#3A2E1E", border: "#59462E", icon: "⏳" },
  listHigh: { color: "#4E8BC9", bg: "#1E2B3A", border: "#2E4559", icon: "🏷️" },
};

// Which route to actually sell through, using the same rules as the Selling Playbook. Cards in
// the ShipMyCards vault are sold from there (never shipped home first) using SMC's own consignment
// partner PC Sportscards (eBay consignment) for anything US$50+, graded or raw. Fanatics Collect's
// auction looks cheaper (1% + US$3) but buyers pay a ~20% premium on top, so hammer prices land
// about 17% under eBay comps — e.g. a US$100 slab nets ~US$79 at Fanatics vs ~US$85 through PC
// Sportscards. SMC's own Marketplace has very few buyers (about 24 listings when checked in
// Oct 2026), so it's only worth a short try for cards under US$50. Cards in hand = self-list.
const SMC_MARKETPLACE_TRY_DAYS = 7;

// Sports whose buyers are mostly in the US, so their cards are hard to sell in Australia: cheap
// ones stay in the vault and get consigned there rather than shipped home. Storage is close to free
// (first 180 days included, then ~10% of the US$1 intake fee per 90 days), so holding costs nothing.
const US_MARKET_SPORTS = ["NFL", "MLB", "WNBA"];
const sellsBestInUS = (card) => US_MARKET_SPORTS.includes(card && card.sport);

function suggestedSellingMethod(card, listing) {
  if (!listing) return null;
  const value = listing.listPrice;
  const usd = audToUsd(value);
  const isGraded = card.status === "Graded" || Boolean(card.grade);

  if (card.location === "ShipMyCards Vault") {
    if (usd < 50 && sellsBestInUS(card)) {
      return {
        method: "ShipMyCards Marketplace",
        why: `Give the ShipMyCards Marketplace (1%) about a week, then consign it to PC Sportscards from the vault. Under US$50 their fee is higher (~18% + US$1), but ${card.sport} cards sell far better to US buyers than in Australia, so it's usually still better than shipping it home. Storage while it waits is close to free.`,
      };
    }
    if (usd < 50) {
      return {
        method: "ShipMyCards Marketplace",
        why: `Under US$50, PC Sportscards' eBay consignment takes ~18% + US$1 — a big bite on a cheap card. Give the ShipMyCards Marketplace (1%) about a week — it has very few buyers, so don't wait longer. Then save cheap cards up and bring them home in one shipment to sell as a team lot.`,
      };
    }
    return {
      method: "SMC → PC Sportscards (eBay)",
      why: `PC Sportscards' eBay consignment through ShipMyCards — fastest payout and the biggest audience. About ${usd < 1000 ? "14%" : usd < 5000 ? "9%" : "6%"} + US$1 all in. Ask for fixed price with an auto-decline at your break-even, since their auctions start at 99c.${isGraded ? " Usually nets more than Fanatics' auction, where the buyer's ~20% premium pushes bids under eBay prices — Fanatics only wins for very in-demand slabs." : ""}`,
    };
  }

  if (card.location === "eBay Vault") {
    return { method: "eBay", why: "It's already in the eBay vault — list it straight from there; the buyer can keep it vaulted with no shipping." };
  }

  return {
    method: "Standard eBay",
    why: "eBay Live and Whatnot's cheaper fees only kick in when you actually go live, which needs an approved seller account plus enough volume or a following to fill a stream — not worth building for a single card. Standard eBay works without any of that. If you specifically want eBay Live's lower fee without the following, COMC's \"Direct 2 eBay Live\" service runs your card through their own established stream for a flat $5 + 8% (5% on $1,000+ sales).",
  };
}
