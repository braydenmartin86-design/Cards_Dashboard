// ===== Formula engine, ported 1:1 from the user's Excel model =====

const AUD_TO_USD_APPROX = 0.65;
function tieredPsaAuCost(declaredValueAUD) {
  const usd = (declaredValueAUD || 0) * AUD_TO_USD_APPROX;
  if (usd <= 500) return 50;
  if (usd <= 1000) return 140;
  if (usd <= 1500) return 165;
  if (usd <= 2500) return 299;
  if (usd <= 5000) return 699;
  if (usd <= 10000) return 1199;
  return 2199;
}

function gradingCost(service, declaredValue = 0) {
  if (!service || service === "None" || service === "Bought Graded") return 0;
  
  if (service === "PSA via Australia") {
    return declaredValue > 500 ? 45 : 22;
  }
  if (service === "PSA via ShipMyCards") return 25;
  if (service === "SGC via Australia") return 20;
  
  return 0;
}
// Rough expected turnaround in days, used only for the Grading Tracker progress bar. PSA via
// Australia has real published tiers by declared value; ShipMyCards (US) and SGC don't have a
// specific figure on record here, so those two use a reasonable estimate — flagged as such in
// the UI rather than presented as precise.
function estimateGradingTurnaroundDays(service, declaredValueAUD) {
  if (!service) return null;
  const s = service.toLowerCase();
  if (s === "psa via australia" || s === "psa via aus") {
    const usd = (declaredValueAUD || 0) * AUD_TO_USD_APPROX;
    if (usd <= 500) return 225; // 7-8 months
    if (usd <= 1000) return 68; // 2-2.5 months
    if (usd <= 1500) return 53; // 1.5-2 months
    if (usd <= 2500) return 38; // 1-1.5 months
    if (usd <= 5000) return 13; // 7-10 business days
    return 10;
  }
  if (s === "psa via shipmycards" || s === "psa via usa") return 60; // estimate, not published here
  if (s === "sgc via australia" || s === "sgc via aus") return 30; // estimate, not published here
  return null;
}

const PSA9_GRADES = ["psa 9", "sgc 9", "bgs 9", "bgs 9.5"];
const PSA10_GRADES = ["psa 10", "sgc 10", "bgs 10"];

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
  "Facebook / local",
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
    case "Facebook / local":
      return 0;
    default:
      return null; // ShipMyCards Marketplace / Other — unknown, leave for manual entry
  }
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
  const psa9 = c.psa9Avg ?? 0;
  const psa10 = c.psa10Avg ?? c.psa9Avg ?? 0;

  const netRawSell = raw * (1 - fees);
  const netPsa9Sell = psa9 * (1 - fees);
  const netPsa10Sell = psa10 * (1 - fees);

  const declaredValue = Math.max(psa9, psa10, raw);
  const autoGradingCost = gradingCost(c.gradingService, declaredValue) || 0;

  const isSelfGraded = [
    "PSA via Australia",
    "PSA via ShipMyCards",
    "SGC via Australia"
  ].includes(c.gradingService);

  const appliedGradingCost = Number(c.gradingCostPaid) > 0 
    ? Number(c.gradingCostPaid) 
    : (isSelfGraded && (status === "At Grading" || status === "Graded") ? autoGradingCost : 0);

  const totalCost = (c.paid || 0) + (c.shipping || 0) + holdingCost + appliedGradingCost;
  const futureGCost = status === "Raw" && isSelfGraded ? autoGradingCost : 0;

  const rawGGR = isActive ? (status === "Graded" ? null : netRawSell - totalCost) : null;
  const psa9Eligible = isActive && (status === "Raw" || PSA9_GRADES.includes(grade));
  const psa9GGR = psa9Eligible ? netPsa9Sell - totalCost - futureGCost : null;

  const psa10Eligible = isActive && (status === "Raw" || PSA10_GRADES.includes(grade));
  const psa10GGR = psa10Eligible ? netPsa10Sell - totalCost - futureGCost : null;

// 1. Calculate Graded EV (with PSA 8/below penalty on setGemRate)
  let gradedEV = null;
  if (isActive && status !== "Graded") {
    const analysis = c.gradeAnalysis;
    const gemRate = c.setGemRate !== "" && c.setGemRate != null ? Math.max(0, Math.min(1, Number(c.setGemRate) / 100)) : null;
    if (analysis) {
      const belowValue = raw ?? 0;
      const expectedRevenue = psa10 * (1 - fees) * analysis.psa10Prob + psa9 * (1 - fees) * analysis.psa9Prob + belowValue * (1 - fees) * analysis.belowProb;
      gradedEV = expectedRevenue - totalCost - futureGCost;
    } else if (gemRate != null) {
      const p10 = gemRate;
      const p9 = Math.min(1 - p10, 0.40);
      const pBelow = Math.max(0, 1 - p10 - p9); // Captures floor loss on PSA 8/7
      
      gradedEV = p10 * (netPsa10Sell - totalCost - futureGCost) + 
                 p9 * (netPsa9Sell - totalCost - futureGCost) + 
                 pBelow * (netRawSell - totalCost - futureGCost);
    } else {
      const p10Prob = c.psa10Prob ?? 0.35;
      const p9Prob = c.psa9Prob ?? 0.45;
      gradedEV = p10Prob * (netPsa10Sell - totalCost - futureGCost) + p9Prob * (netPsa9Sell - totalCost - futureGCost);
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
    if (PSA10_GRADES.includes(grade) && (psa10GGR ?? 0) >= 20) sellDecision = "Sell PSA 10";
    else if (PSA9_GRADES.includes(grade) && (psa9GGR ?? 0) >= 0) sellDecision = "Sell PSA 9";
    else sellDecision = "Hold";
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

  const gradeCall = status !== "Raw" || sellDecision === "Sell Raw First" ? "NO" : gradeWorthIt;

  let sellPriority = 9;
  if (sellDecision === "") sellPriority = 9;
  else if (sellDecision === "Sell PSA 9" || sellDecision === "Sell PSA 10") sellPriority = 1;
  else if (sellDecision === "Sell Raw First") sellPriority = 2;
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

  const hasActualFees = c.actualFeesPaid != null && c.actualFeesPaid !== "";
  const netSale =
    c.actualSellPrice != null
      ? hasActualFees
        ? c.actualSellPrice - Number(c.actualFeesPaid) - (Number(c.consignmentShipping) || 0)
        : c.actualSellPrice * (1 - fees)
      : null;
  const realisedProfit = netSale != null ? netSale - totalCost : null;

  let projectedNetSell = null;
  if (PSA10_GRADES.includes(grade)) projectedNetSell = c.psa10Avg != null ? netPsa10Sell : null;
  else if (PSA9_GRADES.includes(grade)) projectedNetSell = c.psa9Avg != null ? netPsa9Sell : null;
  else if (c.rawAvg != null) projectedNetSell = netRawSell;
  const saleVariance = netSale != null && projectedNetSell != null ? netSale - projectedNetSell : null;
  const saleVariancePct = saleVariance != null && projectedNetSell > 0 ? saleVariance / projectedNetSell : null;

  let gradingTurnaroundDays = null, gradingDaysElapsed = null, gradingProgressPct = null;
  if (status === "At Grading" && c.gradingSentDate) {
    gradingTurnaroundDays = estimateGradingTurnaroundDays(c.gradingService, declaredValue);
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
  const psa9 = c.psa9Avg ?? 0;
  const psa10 = c.psa10Avg ?? c.psa9Avg ?? 0;

  const netRawSell = raw * (1 - fees);
  const netPsa9Sell = psa9 * (1 - fees);
  const netPsa10Sell = psa10 * (1 - fees);

  const declaredValue = Math.max(psa9, psa10, raw);
  const autoGradingCost = gradingCost(c.gradingService, declaredValue) || 0;

  const isSelfGraded = [
    "PSA via Australia", 
    "PSA via ShipMyCards", 
    "SGC via Australia"
  ].includes(c.gradingService);

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
      const expectedRevenue = psa10 * (1 - fees) * analysis.psa10Prob + psa9 * (1 - fees) * analysis.psa9Prob + belowValue * (1 - fees) * analysis.belowProb;
      gradedEV = expectedRevenue - totalCost - futureGCost;
    } else if (gemRate != null) {
      const p10 = gemRate;
      const p9 = Math.min(1 - p10, 0.40);
      const pBelow = Math.max(0, 1 - p10 - p9); // Captures floor loss on PSA 8/7
      
      gradedEV = p10 * (netPsa10Sell - totalCost - futureGCost) + 
                 p9 * (netPsa9Sell - totalCost - futureGCost) + 
                 pBelow * (netRawSell - totalCost - futureGCost);
    } else {
      const p10Prob = c.psa10Prob ?? 0.35;
      const p9Prob = c.psa9Prob ?? 0.45;
      gradedEV = p10Prob * (netPsa10Sell - totalCost - futureGCost) + p9Prob * (netPsa9Sell - totalCost - futureGCost);
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
    if (PSA10_GRADES.includes(grade) && (psa10GGR ?? 0) >= 20) sellDecision = "Sell PSA 10";
    else if (PSA9_GRADES.includes(grade) && (psa9GGR ?? 0) >= 0) sellDecision = "Sell PSA 9";
    else sellDecision = "Hold";
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

  // 3. Priority Mapping (Reads gradeCall safely now)
  let sellPriority = 9;
  if (sellDecision === "") sellPriority = 9;
  else if (sellDecision === "Sell PSA 9" || sellDecision === "Sell PSA 10") sellPriority = 1;
  else if (sellDecision === "Sell Raw First") sellPriority = 2;
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

  const hasActualFees = c.actualFeesPaid != null && c.actualFeesPaid !== "";
  const netSale =
    c.actualSellPrice != null
      ? hasActualFees
        ? c.actualSellPrice - Number(c.actualFeesPaid) - (Number(c.consignmentShipping) || 0)
        : c.actualSellPrice * (1 - fees)
      : null;
  const realisedProfit = netSale != null ? netSale - totalCost : null;

  const pkmnGrade = (c.grade || "").toLowerCase();
  let projectedNetSell = null;
  if (PSA10_GRADES.includes(pkmnGrade)) projectedNetSell = c.psa10Avg != null ? netPsa10Sell : null;
  else if (PSA9_GRADES.includes(pkmnGrade)) projectedNetSell = c.psa9Avg != null ? netPsa9Sell : null;
  else if (c.rawAvg != null) projectedNetSell = netRawSell;
  const saleVariance = netSale != null && projectedNetSell != null ? netSale - projectedNetSell : null;
  const saleVariancePct = saleVariance != null && projectedNetSell > 0 ? saleVariance / projectedNetSell : null;

  let gradingTurnaroundDays = null, gradingDaysElapsed = null, gradingProgressPct = null;
  if (status === "At Grading" && c.gradingSentDate) {
    gradingTurnaroundDays = estimateGradingTurnaroundDays(c.gradingService, declaredValue);
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
        gradedEVBuy = (b.psa10Prob ?? 0.35) * (psa10GGRBuy ?? 0) + (b.psa9Prob ?? 0.45) * (psa9GGRBuy ?? 0);
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
function recommendedListing(card) {
  // Raw cards have real condition/centering variance buyers can't fully verify from photos,
  // so a modest premium over average is normal. Graded cards are a known, fungible quantity —
  // the exact population and recent comps are public (PSA cert lookup, 130 Point), so buyers
  // won't pay a meaningful premium over what the card has actually been trading at.
  const basisMap = {
    "Sell Raw First": { avg: card.rawAvg, be: card.rawBE, label: "Raw", markup: 1.08, history: card.rawHistory },
    "Sell PSA 9": { avg: card.psa9Avg, be: card.psa9BE, label: "PSA 9", markup: 1.03, history: card.psa9History },
    "Sell PSA 10": { avg: card.psa10Avg, be: card.psa10BE, label: "PSA 10", markup: 1.03, history: card.psa10History },
  };
  const basis = basisMap[card.sellDecision];
  if (!basis || basis.avg == null) return null;
  return {
    listPrice: basis.avg * basis.markup,
    floor: basis.be,
    label: basis.label,
    markupPct: Math.round((basis.markup - 1) * 100),
    lowConfidence: (basis.history || []).length <= 1,
  };
}

// Which route to actually sell through, using the same value-based rule and location logic
// as the Selling Playbook — not in hand + under $1,000 = DCSports87, not in hand + $1,000+
// (especially graded) = Fanatics Collect/PWCC, already in hand = self-list.
function suggestedSellingMethod(card, listing) {
  if (!listing) return null;
  const value = listing.listPrice;
  const inVault = card.location && card.location !== "In Hand";
  const isGraded = card.status === "Graded";

  if (inVault) {
    if (value >= 1000) {
      return {
        method: "Fanatics Collect (PWCC)",
        why: `Already available via ${card.location} — no new account needed. Their 6% Buy Now fee beats DCSports87 at this value, and it's the platform built for ${isGraded ? "graded singles like this" : "cards worth this much"}.`,
      };
    }
    return {
      method: "DCSports87",
      why: `Ship it from ${card.location} to DCSports87 directly — don't bring it home first, that's paying for international shipping twice. No minimum, handles everyday value like this well.`,
    };
  }

  return {
    method: "Standard eBay",
    why: "eBay Live and Whatnot's cheaper fees only kick in when you actually go live, which needs an approved seller account plus enough volume or a following to fill a stream — not worth building for a single card. Standard eBay works without any of that. If you specifically want eBay Live's lower fee without the following, COMC's \"Direct 2 eBay Live\" service runs your card through their own established stream for a flat $5 + 8% (5% on $1,000+ sales).",
  };
}
