//const { useState, useEffect, useMemo } = React;

// Safe icon proxy for browser CDN
const IconProxy = new Proxy({}, {
  get: (target, name) => {
    if (window.lucide && window.lucide.icons && window.lucide.icons[name]) {
      const IconComp = window.lucide.icons[name];
      return (props) => React.createElement(IconComp, props);
    }
    return () => null;
  }
});

const Plus = IconProxy.Plus;
const X = IconProxy.X;
const ChevronRight = IconProxy.ChevronRight;
const RefreshCw = IconProxy.RefreshCw;
const Trash2 = IconProxy.Trash2;
const TrendingUp = IconProxy.TrendingUp;
const Target = IconProxy.Target;
const Gavel = IconProxy.Gavel;
const BookOpen = IconProxy.BookOpen;
const Copy = IconProxy.Copy;
const Check = IconProxy.Check;

// Safe Recharts proxy
const RC = window.Recharts || {};
const LineChart = RC.LineChart || (() => null);
const Line = RC.Line || (() => null);
const ResponsiveContainer = RC.ResponsiveContainer || (({ children }) => children);
const YAxis = RC.YAxis || (() => null);

// Supabase Init
let supabaseClient = null;
try {
  if (window.supabase && window.SUPABASE_URL && window.SUPABASE_URL !== "https://your-supabase-url.supabase.co") {
    supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn("Supabase init fallback:", e);
}

// Universal AI Call Proxy
async function callGeminiAi(promptText, imageBase64 = null, mimeType = "image/jpeg") {
  if (!supabaseClient) {
    throw new Error("Supabase client is not initialized.");
  }

  let cleanBase64 = imageBase64;
  if (cleanBase64 && cleanBase64.includes(",")) {
    cleanBase64 = cleanBase64.split(",")[1];
  }

  const { data, error } = await supabaseClient.functions.invoke("analyze-card", {
    body: {
      prompt: promptText,
      imageBase64: cleanBase64,
      mimeType: "image/jpeg"
    }
  });

  if (error) {
    console.error("Supabase Functions Error:", error);
    throw error;
  }

  return data;
}

const SEED_CARDS = [{"player": "Amen Thompson", "card": "Prizm RC Luck OT Lottery", "cardNum": "#12", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.4, "shipping": 1.48, "feesPct": 0.137, "rawAvg": 9.29, "psa9Avg": 43.2, "psa10Avg": 16.09, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 9.29}], "psa9History": [{"date": "2026-08-07", "value": 43.2}], "psa10History": [{"date": "2026-08-07", "value": 16.09}]}, {"player": "Jaren Jackson Jr", "card": "2018-19 Prizm Phenoms Silver", "cardNum": "#22", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 1.9, "shipping": 1.47, "feesPct": 0.137, "rawAvg": 4.29, "psa9Avg": 9.66, "psa10Avg": 23.03, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.29}], "psa9History": [{"date": "2026-08-07", "value": 9.66}], "psa10History": [{"date": "2026-08-07", "value": 23.03}]}, {"player": "Jonathan Kuminga", "card": "2021-22 Obsidian Base", "cardNum": "#157", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 10.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 17.46, "psa9Avg": 15.6, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 17.46}], "psa9History": [{"date": "2026-08-07", "value": 15.6}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Scoot Henderson", "card": "Prizm Monopoly Purple Wave", "cardNum": "#75", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 1.49, "shipping": 0.7, "feesPct": 0.137, "rawAvg": 8.09, "psa9Avg": 8.2, "psa10Avg": 16.45, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 8.09}], "psa9History": [{"date": "2026-08-07", "value": 8.2}], "psa10History": [{"date": "2026-08-07", "value": 16.45}]}, {"player": "Trevor Lawrence", "card": "Donruss RC Elite Series", "cardNum": "#ESR-TRL", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 3.34, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 25.26, "psa9Avg": 18.57, "psa10Avg": 28.23, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 25.26}], "psa9History": [{"date": "2026-08-07", "value": 18.57}], "psa10History": [{"date": "2026-08-07", "value": 28.23}]}, {"player": "Dylan Harper", "card": "2025-26 Topps Chrome Instinct Aqua /199", "cardNum": "#INS-12", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 38.57, "shipping": 7.79, "feesPct": 0.137, "rawAvg": 61.11, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": true, "outOf": 199, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 61.11}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Alex Rodriguez", "card": "Donruss Bomb Squad Blue", "cardNum": "#BS1", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 7.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 14.89, "psa9Avg": 0.0, "psa10Avg": 67.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 14.89}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 67.0}]}, {"player": "Bijan Robinson", "card": "2023 Rated Rookie Purple", "cardNum": "#206", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 10.86, "psa9Avg": 24.67, "psa10Avg": 77.62, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 10.86}], "psa9History": [{"date": "2026-08-07", "value": 24.67}], "psa10History": [{"date": "2026-08-07", "value": 77.62}]}, {"player": "Bijan Robinson", "card": "2023 Pheonix Contours", "cardNum": "#CON-18", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 7.43, "psa9Avg": 20.1, "psa10Avg": 67.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 7.43}], "psa9History": [{"date": "2026-08-07", "value": 20.1}], "psa10History": [{"date": "2026-08-07", "value": 67.0}]}, {"player": "Jarrett Allen", "card": "2017 Prizm Hyper Silver", "cardNum": "#154", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 4.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 8.94, "psa9Avg": 15.02, "psa10Avg": 77.49, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 8.94}], "psa9History": [{"date": "2026-08-07", "value": 15.02}], "psa10History": [{"date": "2026-08-07", "value": 77.49}]}, {"player": "James Wood", "card": "2025 Topps Cosmic Chrome - Nucleus Refractor", "cardNum": "#1", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 12.45, "shipping": 10.91, "feesPct": 0.137, "rawAvg": 39.97, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 39.97}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Jahmyr Gibbs", "card": "2023 Pheonix Contours", "cardNum": "#CON-08", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 16.33, "psa9Avg": 44.57, "psa10Avg": 72.8, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 16.33}], "psa9History": [{"date": "2026-08-07", "value": 44.57}], "psa10History": [{"date": "2026-08-07", "value": 72.8}]}, {"player": "Cade Cunningham", "card": "2020-21 Spectra Asia Red", "cardNum": "#102", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 20.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 23.02, "psa9Avg": 46.06, "psa10Avg": 98.04, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 23.02}], "psa9History": [{"date": "2026-08-07", "value": 46.06}], "psa10History": [{"date": "2026-08-07", "value": 98.04}]}, {"player": "Will Levis", "card": "2023 Spectra Infrared /50", "cardNum": "#I-WL", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 10.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 11.87, "psa9Avg": 32.69, "psa10Avg": 89.14, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": true, "outOf": 50, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 11.87}], "psa9History": [{"date": "2026-08-07", "value": 32.69}], "psa10History": [{"date": "2026-08-07", "value": 89.14}]}, {"player": "Jabari Smith Jr.", "card": "2022-23 Optic Purple Shock", "cardNum": "#240", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 2.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 4.44, "psa9Avg": 52.0, "psa10Avg": 74.29, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.44}], "psa9History": [{"date": "2026-08-07", "value": 52.0}], "psa10History": [{"date": "2026-08-07", "value": 74.29}]}, {"player": "Ja Morant", "card": "2019-20 (Young Dolph) RC", "cardNum": "#116", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 54.78, "psa9Avg": 115.0, "psa10Avg": 304.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 54.78}], "psa9History": [{"date": "2026-08-07", "value": 115.0}], "psa10History": [{"date": "2026-08-07", "value": 304.0}]}, {"player": "Shai Gilgeous-Alexander", "card": "2019-20 Optic Uniformity Red", "cardNum": "#9", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 23.03, "psa9Avg": 50.0, "psa10Avg": 177.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 23.03}], "psa9History": [{"date": "2026-08-07", "value": 50.0}], "psa10History": [{"date": "2026-08-07", "value": 177.0}]}, {"player": "O'Neil Cruz", "card": "2022 Bowman Chrome Sapphire Orange /75", "cardNum": "#Q4359", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 27.59, "shipping": 1.1, "feesPct": 0.137, "rawAvg": 28.689999999999998, "psa9Avg": 100.0, "psa10Avg": 174.0, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": true, "outOf": 75, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 28.689999999999998}], "psa9History": [{"date": "2026-08-07", "value": 100.0}], "psa10History": [{"date": "2026-08-07", "value": 174.0}]}, {"player": "Michael Jordan", "card": "1991-92 Upper Deck Base", "cardNum": "#44", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 1.47, "shipping": 1.85, "feesPct": 0.137, "rawAvg": 2.97, "psa9Avg": 52.0, "psa10Avg": 131.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.97}], "psa9History": [{"date": "2026-08-07", "value": 52.0}], "psa10History": [{"date": "2026-08-07", "value": 131.0}]}, {"player": "Jayson Tatum", "card": "2017-18 Status Base", "cardNum": "#128", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 8.99, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 14.53, "psa9Avg": 43.21, "psa10Avg": 109.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 14.53}], "psa9History": [{"date": "2026-08-07", "value": 43.21}], "psa10History": [{"date": "2026-08-07", "value": 109.0}]}, {"player": "Jalen Williams", "card": "2022-23 Optic Purple Shock", "cardNum": "#235", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 2.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 14.86, "psa9Avg": 23.77, "psa10Avg": 98.06, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 14.86}], "psa9History": [{"date": "2026-08-07", "value": 23.77}], "psa10History": [{"date": "2026-08-07", "value": 98.06}]}, {"player": "Paul Skenes", "card": "Bowman Chrome Mojo", "cardNum": "#BCP-125", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 13.38, "shipping": 1.85, "feesPct": 0.137, "rawAvg": 15.22, "psa9Avg": 50.31, "psa10Avg": 125.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 15.22}], "psa9History": [{"date": "2026-08-07", "value": 50.31}], "psa10History": [{"date": "2026-08-07", "value": 125.0}]}, {"player": "Tom Aspinall", "card": "2022 Prizm Silver", "cardNum": "#134", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 35.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 4.83, "psa9Avg": 43.09, "psa10Avg": 197.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MMA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.83}], "psa9History": [{"date": "2026-08-07", "value": 43.09}], "psa10History": [{"date": "2026-08-07", "value": 197.0}]}, {"player": "Aaron Judge", "card": "2022 Topps Now", "cardNum": "", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 8.41, "shipping": 4.44, "feesPct": 0.137, "rawAvg": 13.33, "psa9Avg": 26.06, "psa10Avg": 107.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 13.33}], "psa9History": [{"date": "2026-08-07", "value": 26.06}], "psa10History": [{"date": "2026-08-07", "value": 107.0}]}, {"player": "Bobby Witt Jr.", "card": "Topps Chrome Debut", "cardNum": "#USC176", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 6.99, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 5.4, "psa9Avg": 21.92, "psa10Avg": 92.61, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 5.4}], "psa9History": [{"date": "2026-08-07", "value": 21.92}], "psa10History": [{"date": "2026-08-07", "value": 92.61}]}, {"player": "Jalen Duren", "card": "NBA Hoops Purple", "cardNum": "#243", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 2.5, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 1.48, "psa9Avg": 0.0, "psa10Avg": 86.43, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.48}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 86.43}]}, {"player": "Josh Giddey", "card": "Prizm RC Fast Break", "cardNum": "#301", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 4.5, "feesPct": 0.137, "rawAvg": 8.46, "psa9Avg": 23.84, "psa10Avg": 81.96, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 8.46}], "psa9History": [{"date": "2026-08-07", "value": 23.84}], "psa10History": [{"date": "2026-08-07", "value": 81.96}]}, {"player": "Lebron & Bronny Jr", "card": "2024-25 Topps NOW Father Son Debut", "cardNum": "#10", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 18.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 4.09, "psa9Avg": 29.71, "psa10Avg": 89.14, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.09}], "psa9History": [{"date": "2026-08-07", "value": 29.71}], "psa10History": [{"date": "2026-08-07", "value": 89.14}]}, {"player": "Bo Bichette", "card": "2020 Bowman Chrome", "cardNum": "#50", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 9", "paid": 9.73, "shipping": 7.47, "feesPct": 0.137, "rawAvg": null, "psa9Avg": 14.11, "psa10Avg": null, "gradingService": null, "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [{"date": "2026-08-07", "value": 14.11}], "psa10History": []}, {"player": "Chris Paul", "card": "Topps Draft Night", "cardNum": "#224", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 9", "paid": 8.9, "shipping": 2.23, "feesPct": 0.137, "rawAvg": null, "psa9Avg": 26.58, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [{"date": "2026-08-07", "value": 26.58}], "psa10History": []}, {"player": "Magic Johnson", "card": "2019-20 Green Prizm", "cardNum": "", "rookie": false, "shipMyCards": "No", "status": "Graded", "grade": "SGC 9", "paid": 30.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": 21.36, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [{"date": "2026-08-07", "value": 21.36}], "psa10History": []}, {"player": "Paige Buekcers", "card": "Bowman Chrome U 1st", "cardNum": "#90", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 9", "paid": 8.42, "shipping": 6.8, "feesPct": 0.137, "rawAvg": null, "psa9Avg": 47.7, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "WNBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [{"date": "2026-08-07", "value": 47.7}], "psa10History": []}, {"player": "Ronald Acuna Jr", "card": "2018 Topps Debut", "cardNum": "#US250", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "BGS 9.5", "paid": 12.2, "shipping": 8.9, "feesPct": 0.137, "rawAvg": null, "psa9Avg": 25.39, "psa10Avg": 56.7, "gradingService": null, "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [{"date": "2026-08-07", "value": 25.39}], "psa10History": [{"date": "2026-08-07", "value": 56.7}]}, {"player": "Brock Purdy", "card": "2022 Prizm Base", "cardNum": "#353", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "SGC 10", "paid": 67.0, "shipping": 8.89, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": 98.36, "gradingService": null, "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": [{"date": "2026-08-07", "value": 98.36}]}, {"player": "DeAndre Ayton", "card": "2018-19 Panini Prizm", "cardNum": "", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 10", "paid": 11.91, "shipping": 7.4, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": 10.93, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": [{"date": "2026-08-07", "value": 10.93}]}, {"player": "Elly De La Cruz", "card": "2024 Topps Heritage", "cardNum": "#473", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 10", "paid": 37.0, "shipping": 7.4, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": 70.4, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": [{"date": "2026-08-07", "value": 70.4}]}, {"player": "Joe Burrow", "card": "2020 Select Concourse Base", "cardNum": "#46", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 10", "paid": 42.97, "shipping": 8.89, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": 50.06, "gradingService": null, "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": [{"date": "2026-08-07", "value": 50.06}]}, {"player": "Justin Jefferson", "card": "2020 Mosiac Base", "cardNum": "#209", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 10", "paid": 63.0, "shipping": 7.4, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": 61.83, "gradingService": null, "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": [{"date": "2026-08-07", "value": 61.83}]}, {"player": "Lonzo Ball", "card": "2017-18 Optic Rated Rookie", "cardNum": "", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 10", "paid": 14.86, "shipping": 7.42, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": 22.21, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": [{"date": "2026-08-07", "value": 22.21}]}, {"player": "OG Anunoby", "card": "2017 Optic Rated Rookie Holo", "cardNum": "#178", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 10", "paid": 36.25, "shipping": 12.69, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": 70.94, "gradingService": null, "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": [{"date": "2026-08-07", "value": 70.94}]}, {"player": "Darius Garland", "card": "2019-20 Rookies & Stars", "cardNum": "#687", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 1.47, "psa9Avg": 0.0, "psa10Avg": 14.86, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.47}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 14.86}]}, {"player": "Derek Lively", "card": "Prizm Base", "cardNum": "#163", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 4.36, "psa9Avg": 13.09, "psa10Avg": 19.17, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.36}], "psa9History": [{"date": "2026-08-07", "value": 13.09}], "psa10History": [{"date": "2026-08-07", "value": 19.17}]}, {"player": "Ian Garry", "card": "2023 Prizm On The Horizon", "cardNum": "#OTH-IG", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 55.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 59.55, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MMA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 59.55}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Ja Morant", "card": "2019-20 Essentials", "cardNum": "#230", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 2.96, "psa9Avg": 10.46, "psa10Avg": 25.26, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.96}], "psa9History": [{"date": "2026-08-07", "value": 10.46}], "psa10History": [{"date": "2026-08-07", "value": 25.26}]}, {"player": "Ja Morant", "card": "2019-20 XR", "cardNum": "#272", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 2.23, "psa9Avg": 9.2, "psa10Avg": 30.46, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.23}], "psa9History": [{"date": "2026-08-07", "value": 9.2}], "psa10History": [{"date": "2026-08-07", "value": 30.46}]}, {"player": "Jalen Green", "card": "2021 Prizm Base", "cardNum": "#306", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 4.16, "psa9Avg": 13.89, "psa10Avg": 21.46, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.16}], "psa9History": [{"date": "2026-08-07", "value": 13.89}], "psa10History": [{"date": "2026-08-07", "value": 21.46}]}, {"player": "Jalen Green", "card": "2021 Select Concourse Blue", "cardNum": "#7", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 1.48, "psa9Avg": 16.39, "psa10Avg": 25.08, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.48}], "psa9History": [{"date": "2026-08-07", "value": 16.39}], "psa10History": [{"date": "2026-08-07", "value": 25.08}]}, {"player": "Paolo Banchero", "card": "2024-25 Revolution Signatures AUTO", "cardNum": "#RS-PBR", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 120.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 132.0, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 132.0}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Ronald Acuna Jr", "card": "Topps 1953 Living Set", "cardNum": "#19", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 12.2, "shipping": 1.41, "feesPct": 0.137, "rawAvg": 19.26, "psa9Avg": 0.0, "psa10Avg": 59.5, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 19.26}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 59.5}]}, {"player": "Tyrese Haliburton", "card": "2020 Draft Class Contenders", "cardNum": "#21", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 2.66, "psa9Avg": 0.0, "psa10Avg": 20.06, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.66}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 20.06}]}, {"player": "Victor Wembanyama", "card": "2024 Top Class", "cardNum": "#179", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 1.86, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.86}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Brock Purdy", "card": "2023 Wild Card Alumination Comix /50", "cardNum": "#AC-BP", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 24.0, "shipping": 6.69, "feesPct": 0.137, "rawAvg": 37.14, "psa9Avg": null, "psa10Avg": 81.26, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": true, "outOf": 50, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 37.14}], "psa9History": [], "psa10History": [{"date": "2026-08-07", "value": 81.26}]}, {"player": "Cameron Brinks", "card": "2024 Select Concourse", "cardNum": "#56", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 3.0, "shipping": 1.85, "feesPct": 0.137, "rawAvg": 3.28, "psa9Avg": 13.45, "psa10Avg": 64.62, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "WNBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 3.28}], "psa9History": [{"date": "2026-08-07", "value": 13.45}], "psa10History": [{"date": "2026-08-07", "value": 64.62}]}, {"player": "Dyson Daniels", "card": "2022 Donruss Optic", "cardNum": "#250", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 2.18, "psa9Avg": 74.27, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.18}], "psa9History": [{"date": "2026-08-07", "value": 74.27}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Francis Ngannou", "card": "Select Scope SP", "cardNum": "#120", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 9.7, "shipping": 6.0, "feesPct": 0.137, "rawAvg": 11.91, "psa9Avg": null, "psa10Avg": 74.51, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MMA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 11.91}], "psa9History": [], "psa10History": [{"date": "2026-08-07", "value": 74.51}]}, {"player": "Jalen Hurts", "card": "2020 Select Concourse Silver", "cardNum": "#50", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 9", "paid": 76.3, "shipping": 13.74, "feesPct": 0.137, "rawAvg": null, "psa9Avg": 31.94, "psa10Avg": null, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [{"date": "2026-08-07", "value": 31.94}], "psa10History": []}, {"player": "Ja'Marr Chase", "card": "2021 Select Diecut Silver", "cardNum": "#47", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 15.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 11.33, "psa9Avg": 22.29, "psa10Avg": 74.21, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 11.33}], "psa9History": [{"date": "2026-08-07", "value": 22.29}], "psa10History": [{"date": "2026-08-07", "value": 74.21}]}, {"player": "Jaxon Smith-Njigba", "card": "Silver RC Prizm Patch", "cardNum": "#RG-JS", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 7.35, "shipping": 1.47, "feesPct": 0.137, "rawAvg": 12.24, "psa9Avg": 29.8, "psa10Avg": 74.51, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 12.24}], "psa9History": [{"date": "2026-08-07", "value": 29.8}], "psa10History": [{"date": "2026-08-07", "value": 74.51}]}, {"player": "Mike Trout", "card": "2022 Donruss Bomb Squad", "cardNum": "#BS-8", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 7.43, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 6.69, "psa9Avg": 26.0, "psa10Avg": 68.34, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 6.69}], "psa9History": [{"date": "2026-08-07", "value": 26.0}], "psa10History": [{"date": "2026-08-07", "value": 68.34}]}, {"player": "Rashee Rice", "card": "2023 Prizm Silver", "cardNum": "#350", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 4.8, "shipping": 5.96, "feesPct": 0.137, "rawAvg": 11.45, "psa9Avg": 21.61, "psa10Avg": 74.51, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 11.45}], "psa9History": [{"date": "2026-08-07", "value": 21.61}], "psa10History": [{"date": "2026-08-07", "value": 74.51}]}, {"player": "Victor Wembanyama", "card": "Select Concourse Blue", "cardNum": "#87", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 30.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 8.95, "psa9Avg": 30.01, "psa10Avg": 83.64, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 8.95}], "psa9History": [{"date": "2026-08-07", "value": 30.01}], "psa10History": [{"date": "2026-08-07", "value": 83.64}]}, {"player": "Alexander Volkanovski", "card": "2025 1955 Green Geo /75", "cardNum": "", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 11.92, "shipping": 2.23, "feesPct": 0.137, "rawAvg": 14.84, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MMA", "location": "In Hand", "numbered": true, "outOf": 75, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 14.84}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Anthony Richardson", "card": "Prizm Break Silver", "cardNum": "", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 5.95, "shipping": 1.85, "feesPct": 0.137, "rawAvg": 1.47, "psa9Avg": 8.17, "psa10Avg": 22.29, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.47}], "psa9History": [{"date": "2026-08-07", "value": 8.17}], "psa10History": [{"date": "2026-08-07", "value": 22.29}]}, {"player": "Anthony Richardson", "card": "Rookies & Stars Airbourne Silver", "cardNum": "", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 4.8, "shipping": 3.13, "feesPct": 0.137, "rawAvg": 8.91, "psa9Avg": 14.87, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 8.91}], "psa9History": [{"date": "2026-08-07", "value": 14.87}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Bam Adebayo", "card": "2017-18 Rated Rookie", "cardNum": "", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 26.0, "shipping": 3.3, "feesPct": 0.137, "rawAvg": 5.78, "psa9Avg": 8.17, "psa10Avg": 11.24, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 5.78}], "psa9History": [{"date": "2026-08-07", "value": 8.17}], "psa10History": [{"date": "2026-08-07", "value": 11.24}]}, {"player": "Bryce Young", "card": "Prizm Break Green", "cardNum": "#PB-3", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 3.55, "shipping": 1.85, "feesPct": 0.137, "rawAvg": 4.26, "psa9Avg": 19.31, "psa10Avg": 28.97, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.26}], "psa9History": [{"date": "2026-08-07", "value": 19.31}], "psa10History": [{"date": "2026-08-07", "value": 28.97}]}, {"player": "Cam Reddish", "card": "2019 Draft Lottery Ticket", "cardNum": "#10", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 3.0, "shipping": 4.4, "feesPct": 0.137, "rawAvg": 2.96, "psa9Avg": 0.0, "psa10Avg": 8.91, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.96}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 8.91}]}, {"player": "Cameron Thomas", "card": "Rated Rookie Purple", "cardNum": "#153", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 1.47, "psa9Avg": 26.74, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.47}], "psa9History": [{"date": "2026-08-07", "value": 26.74}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Chet Holmegren", "card": "Select Concourse Silver", "cardNum": "#83", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 13.5, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 4.47, "psa9Avg": 28.33, "psa10Avg": 49.17, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.47}], "psa9History": [{"date": "2026-08-07", "value": 28.33}], "psa10History": [{"date": "2026-08-07", "value": 49.17}]}, {"player": "CJ McCollum", "card": "2021-22 Revolution AUTO", "cardNum": "#AG-CJM", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 75.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 7.41, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 7.41}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "CJ Stroud", "card": "Select RC Retail Blue", "cardNum": "#2", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 3.7, "shipping": 1.85, "feesPct": 0.137, "rawAvg": 2.48, "psa9Avg": 29.79, "psa10Avg": 30.76, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.48}], "psa9History": [{"date": "2026-08-07", "value": 29.79}], "psa10History": [{"date": "2026-08-07", "value": 30.76}]}, {"player": "Giannis Antetokounmpo", "card": "2021-22 Prizm Cracked Ice", "cardNum": "#1", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 2.9, "shipping": 1.02, "feesPct": 0.137, "rawAvg": 5.94, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 5.94}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Grant Williams", "card": "2020 Fresh Paint AUTO RC", "cardNum": "#FP-GWI", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 25.0, "shipping": 6.6, "feesPct": 0.137, "rawAvg": 11.18, "psa9Avg": 24.34, "psa10Avg": 41.6, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 11.18}], "psa9History": [{"date": "2026-08-07", "value": 24.34}], "psa10History": [{"date": "2026-08-07", "value": 41.6}]}, {"player": "Islam Makhachev", "card": "2022 Select Swatches Silver Prizm", "cardNum": "#SS-IMK", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 22.34, "shipping": 5.96, "feesPct": 0.137, "rawAvg": 22.27, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MMA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 22.27}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Jaden Ivey", "card": "Luck of the Lottery Silver", "cardNum": "#5", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 1.48, "psa9Avg": 22.34, "psa10Avg": 18.18, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.48}], "psa9History": [{"date": "2026-08-07", "value": 22.34}], "psa10History": [{"date": "2026-08-07", "value": 18.18}]}, {"player": "James Cook", "card": "2022 NFL Debut Silver", "cardNum": "#285", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 2.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 6.21, "psa9Avg": 26.73, "psa10Avg": 43.09, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 6.21}], "psa9History": [{"date": "2026-08-07", "value": 26.73}], "psa10History": [{"date": "2026-08-07", "value": 43.09}]}, {"player": "Jaren Jackson Jr", "card": "Select Die-Cut Premier Level", "cardNum": "#132", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 15.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 10.4, "psa9Avg": 29.0, "psa10Avg": 56.46, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 10.4}], "psa9History": [{"date": "2026-08-07", "value": 29.0}], "psa10History": [{"date": "2026-08-07", "value": 56.46}]}, {"player": "Jarrod Goff", "card": "2023 Donruss Elite Orange /399", "cardNum": "#48", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 2.97, "shipping": 1.96, "feesPct": 0.137, "rawAvg": 2.96, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": true, "outOf": 399, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.96}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Kyle Filipowski", "card": "Bowman 1st RC", "cardNum": "", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 1.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 0.0, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 0.0}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Lamelo Ball", "card": "Prizm Base RC", "cardNum": "#278", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 8.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 3.45, "psa9Avg": 13.25, "psa10Avg": 37.38, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 3.45}], "psa9History": [{"date": "2026-08-07", "value": 13.25}], "psa10History": [{"date": "2026-08-07", "value": 37.38}]}, {"player": "Lonzo Ball", "card": "2017-18 Status Base", "cardNum": "", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 2.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 1.47, "psa9Avg": 13.37, "psa10Avg": 22.29, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.47}], "psa9History": [{"date": "2026-08-07", "value": 13.37}], "psa10History": [{"date": "2026-08-07", "value": 22.29}]}, {"player": "Malik Willis", "card": "Silver RC Prizm Patch", "cardNum": "#RG-MW", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 8.6, "shipping": 1.85, "feesPct": 0.137, "rawAvg": 1.46, "psa9Avg": 4.46, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.46}], "psa9History": [{"date": "2026-08-07", "value": 4.46}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Micah Parsons", "card": "2024 Prizm White Patch /75", "cardNum": "#SMPS", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 30.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 7.43, "psa9Avg": 30.46, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": true, "outOf": 75, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 7.43}], "psa9History": [{"date": "2026-08-07", "value": 30.46}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Mikal Bridges", "card": "2018-19 Status RC", "cardNum": "#144", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 2.96, "psa9Avg": 0.0, "psa10Avg": 44.56, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.96}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 44.56}]}, {"player": "Pablo Guerrero", "card": "2024 1st Bowman Chrome Auto", "cardNum": "#CPA-PG", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 13.79, "shipping": 0.8, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Paolo Banchero", "card": "2022-23 Optic Rated Rookie (x2)", "cardNum": "#221", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 3.73, "psa9Avg": 17.88, "psa10Avg": 44.63, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 3.73}], "psa9History": [{"date": "2026-08-07", "value": 17.88}], "psa10History": [{"date": "2026-08-07", "value": 44.63}]}, {"player": "Scoot Henderson", "card": "2023 Prizm Emergent Silver", "cardNum": "", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 1.67, "shipping": 1.85, "feesPct": 0.137, "rawAvg": 2.5, "psa9Avg": 8.17, "psa10Avg": 13.37, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.5}], "psa9History": [{"date": "2026-08-07", "value": 8.17}], "psa10History": [{"date": "2026-08-07", "value": 13.37}]}, {"player": "Scoot Henderson", "card": "Prizm Monopoly Base", "cardNum": "#75", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 1.45, "shipping": 0.7, "feesPct": 0.137, "rawAvg": 1.07, "psa9Avg": 1.47, "psa10Avg": 15.72, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.07}], "psa9History": [{"date": "2026-08-07", "value": 1.47}], "psa10History": [{"date": "2026-08-07", "value": 15.72}]}, {"player": "Stephen Curry", "card": "2023-24 Revolution Groove", "cardNum": "#65", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 2.61, "shipping": 1.25, "feesPct": 0.137, "rawAvg": 4.46, "psa9Avg": 36.24, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.46}], "psa9History": [{"date": "2026-08-07", "value": 36.24}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Travis Kelce", "card": "2020 Limited /75", "cardNum": "#3", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 10.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 6.76, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": true, "outOf": 75, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 6.76}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Tyrese Maxey", "card": "2020 Mosaic Debut Silver", "cardNum": "#203", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 6.9, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 6.47, "psa9Avg": 19.44, "psa10Avg": 37.24, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 6.47}], "psa9History": [{"date": "2026-08-07", "value": 19.44}], "psa10History": [{"date": "2026-08-07", "value": 37.24}]}, {"player": "Victor Wembanyama", "card": "Topps Now ROTY (x2)", "cardNum": "#VW-1", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 16.31, "shipping": 7.4, "feesPct": 0.137, "rawAvg": 20.79, "psa9Avg": 30.46, "psa10Avg": 63.89, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 20.79}], "psa9History": [{"date": "2026-08-07", "value": 30.46}], "psa10History": [{"date": "2026-08-07", "value": 63.89}]}, {"player": "Vladi Guerrero", "card": "2024 Bowman Chrome 1st Mojo", "cardNum": "#BCP-212", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 1.25, "shipping": 1.04, "feesPct": 0.137, "rawAvg": 2.66, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.66}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Will Levis", "card": "2023 Origins Orange /125", "cardNum": "#94", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 2.24, "psa9Avg": 19.31, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": true, "outOf": 125, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.24}], "psa9History": [{"date": "2026-08-07", "value": 19.31}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Alperen Sengun", "card": "Mosiac Fast Break RC", "cardNum": "", "rookie": true, "shipMyCards": "Yes", "status": "Sold", "grade": null, "paid": 1.9, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": null, "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": 8.0, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Joe Flacco", "card": "2018 Certified Mirror Blue /50", "cardNum": "", "rookie": false, "shipMyCards": "No", "status": "Sold", "grade": null, "paid": 3.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": null, "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": 7.0, "sport": "NFL", "location": "In Hand", "numbered": true, "outOf": 50, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Paul Pierce", "card": "Upper Deck UD Glass Patch", "cardNum": "", "rookie": false, "shipMyCards": "No", "status": "Sold", "grade": null, "paid": 1.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": null, "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": 10.0, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}]
;

const SEED_POKEMON = [{"player": "Arcanine EX", "card": "2023 Scarlet & Violet", "cardNum": "#032/198", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 4.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pokémon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Mewtwo EX", "card": "2024 Scarlet & Violet: Paradox Rift", "cardNum": "#058/182", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 4.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pokémon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Lapras VMAX", "card": "2020 Sword & Shield", "cardNum": "#203/202", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 14.39, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pokémon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Charmander (x2)", "card": "2025 Mega Evo Phantasmal Flames", "cardNum": "#011/094", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pokémon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Charmeleon", "card": "2025 Mega Evo Phantasmal Flames", "cardNum": "#012/094", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pokémon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Reshiram R-Holo", "card": "2025 Mega Evo Phantasmal Flames", "cardNum": "#017/094", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pokémon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Charcadet R-Holo", "card": "2025 Mega Evo Phantasmal Flames", "cardNum": "#019/094", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pokémon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Mismagius EX", "card": "2025 Mega Evo Phantasmal Flames", "cardNum": "#036/094", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pokémon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Mega Heracross EX", "card": "2025 Mega Evo Phantasmal Flames", "cardNum": "#004/094", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pokémon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Wigglytuff (Illustration Rare)", "card": "2025 Mega Evo Phantasmal Flames", "cardNum": "#105/094", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pokémon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}];

const SEED_TARGETS = [{"id": null, "player": "Jackson Chourio", "sport": "MLB", "cardToLookFor": "2024 Topps Chrome/Bowman base rookie", "tier": "Buy Now", "researchScore": 58, "performanceTrend": "Improving", "reasoning": "Elite power/speed combo already producing at the MLB level for Milwaukee. Base rookies remain cheap for the production level.", "targetPriceRaw": 22, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Ausar Thompson", "sport": "NBA", "cardToLookFor": "2023-24 Prizm Silver, PSA 9", "tier": "Buy Now", "researchScore": 52, "performanceTrend": "Improving", "reasoning": "Defensive win shares climbing, PSA 9 Silver copies trading in the low $40s — cheap entry on a legitimate two-way piece.", "targetPriceRaw": "", "targetPriceGraded": 63, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Keyonte George", "sport": "NBA", "cardToLookFor": "2023-24 Optic Purple Shock /149", "tier": "Buy Now", "researchScore": 46, "performanceTrend": "Stable", "reasoning": "Numbered parallel with a stabilizing assist-to-turnover ratio — primary guard role on a rebuilding roster gives him a real usage floor.", "targetPriceRaw": 51, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "GG Jackson II", "sport": "NBA", "cardToLookFor": "2023-24 Donruss Choice Red/Green", "tier": "Speculative", "researchScore": 38, "performanceTrend": "Stable", "reasoning": "One of the youngest high-volume scorers in the league. Cheap parallel, real speculative upside if usage keeps climbing.", "targetPriceRaw": 42, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Tre Johnson", "sport": "NBA", "cardToLookFor": "2025-26 Prizm rookie", "tier": "Speculative", "researchScore": 40, "performanceTrend": "Stable", "reasoning": "Efficient 19.9 PPG freshman season translated into draft buzz. Rookie cards still cheap pre-breakout.", "targetPriceRaw": 45, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Ethan Salas", "sport": "MLB", "cardToLookFor": "Bowman Chrome prospect card", "tier": "Speculative", "researchScore": 32, "performanceTrend": "Stable", "reasoning": "Top catching prospect, still developing at Double A. Cheap lottery-ticket entry on a well-regarded prospect pedigree.", "targetPriceRaw": 15, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Walker Jenkins", "sport": "MLB", "cardToLookFor": "Bowman Draft rookie", "tier": "Speculative", "researchScore": 34, "performanceTrend": "Stable", "reasoning": "Power/speed tools prospect, trades cheap raw. Same profile as Jackson Chourio pre-breakout.", "targetPriceRaw": 20, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Drake Maye", "sport": "NFL", "cardToLookFor": "Opti Chrome insert", "tier": "Buy Now", "researchScore": 44, "performanceTrend": "Stable", "reasoning": "Cheap insert pricing ahead of a full season as starter — training camp buzz historically moves these before kickoff.", "targetPriceRaw": 25, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "AJ Dybantsa", "sport": "NBA", "cardToLookFor": "Bowman U NOW (pre-rookie)", "tier": "Speculative", "researchScore": 32, "performanceTrend": "Stable", "reasoning": "Consensus top prospect for next year's draft class. No real rookie card exists yet — cheap, high-risk early entry.", "targetPriceRaw": 45, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Darryn Peterson", "sport": "NBA", "cardToLookFor": "Bowman U NOW (pre-rookie)", "tier": "Speculative", "researchScore": 27, "performanceTrend": "Stable", "reasoning": "Alongside Dybantsa, one of the two best names in next year's class. Same pre-rookie caveat.", "targetPriceRaw": 35, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Willem Duursma", "sport": "AFL", "cardToLookFor": "2026 Select rookie card", "tier": "Speculative", "researchScore": 28, "performanceTrend": "Improving", "reasoning": "West Coast's No.1 pick in the 2025 AFL Draft, already praised for footy smarts early. Thin dedicated card-market data for AFL.", "targetPriceRaw": 30, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Anthony Edwards", "sport": "NBA", "cardToLookFor": "2020-21 Prizm base rookie, PSA 9", "tier": "Buy Now", "researchScore": 56, "performanceTrend": "Improving", "reasoning": "MVP conversations, All-Star, growing global fanbase. PSA 9 copies sit well under the PSA 10 blue-chip price for similar collector cachet.", "targetPriceRaw": "", "targetPriceGraded": 150, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Justin Herbert", "sport": "NFL", "cardToLookFor": "2020 Prizm rookie, PSA 9", "tier": "Buy Now", "researchScore": 48, "performanceTrend": "Stable", "reasoning": "PSA 9 copies trade $80-120 USD (~$120-180 AUD) versus $300-400 for PSA 10 — same recognizable rookie at a fraction of the premium-grade cost.", "targetPriceRaw": "", "targetPriceGraded": 150, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Nick Daicos", "sport": "AFL", "cardToLookFor": "Select rookie signatures, numbered parallels", "tier": "Buy Now", "researchScore": 55, "performanceTrend": "Stable", "reasoning": "Established, decorated star — one of the safest holds in the AFL market. Thin dedicated AFL card-market data compared to US sports.", "targetPriceRaw": 130, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Konnor Griffin", "sport": "MLB", "cardToLookFor": "2026 Bowman / Topps Chrome first-year cards", "tier": "Speculative", "researchScore": 42, "performanceTrend": "Stable", "reasoning": "Headlines this year's Bowman and Topps Chrome checklists as one of the most sought-after prospects in the product, still in the minors.", "targetPriceRaw": 150, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Carnell Tate", "sport": "NFL", "cardToLookFor": "2026 Prizm / Optic rookie autos", "tier": "Buy Now", "researchScore": 50, "performanceTrend": "Stable", "reasoning": "First WR off the board, landing opposite an ascending young QB. Strong, reliable college production.", "targetPriceRaw": 140, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Jeremiyah Love", "sport": "NFL", "cardToLookFor": "2026 Prizm / Optic rookie autos", "tier": "Buy Now", "researchScore": 36, "performanceTrend": "Stable", "reasoning": "Top RB in the class. RBs carry more bust/workload risk than QBs and WRs — size smaller than the QB/WR targets.", "targetPriceRaw": 130, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Bianca Belair", "sport": "WWE", "cardToLookFor": "2026 Topps Chrome WWE autos", "tier": "Buy Now", "researchScore": 58, "performanceTrend": "Improving", "reasoning": "Flagged in June 2026 market coverage as a genuine buying opportunity — trading soft for a multi-time champion, real room to correct upward.", "targetPriceRaw": "", "targetPriceGraded": 130, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Islam Makhachev", "sport": "MMA", "cardToLookFor": "Topps/Panini Select autographed cards", "tier": "Buy Now", "researchScore": 48, "performanceTrend": "Stable", "reasoning": "Reigning lightweight champion, one of the sport's most dominant current fighters — proven titleholder, not speculative.", "targetPriceRaw": "", "targetPriceGraded": 160, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Fernando Mendoza", "sport": "NFL", "cardToLookFor": "2026 Prizm / Donruss Optic rookie autos", "tier": "Buy Now", "researchScore": 62, "performanceTrend": "Stable", "reasoning": "No.1 overall pick with a confirmed starting job. QB is the position with the biggest hobby premium.", "targetPriceRaw": 240, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Cooper Flagg", "sport": "NBA", "cardToLookFor": "2025-26 Prizm / Topps Chrome rookie", "tier": "Buy Now", "researchScore": 50, "performanceTrend": "Improving", "reasoning": "The class's foundational prospect, now in his rookie NBA season. Already priced accordingly — an 'own the blue chip' hold, not a sleeper.", "targetPriceRaw": 260, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Gunther", "sport": "WWE", "cardToLookFor": "2026 Topps Royalty WWE, WrestleMania patch autos", "tier": "Buy Now", "researchScore": 40, "performanceTrend": "Stable", "reasoning": "One of the hottest chases in the product — his 1/1 WrestleMania patch auto sold for over $18,000. Standard autos still land in reach.", "targetPriceRaw": "", "targetPriceGraded": 260, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Jude Bellingham", "sport": "Soccer", "cardToLookFor": "Topps Chrome UCL, Match Attax rookie-era cards", "tier": "Buy Now", "researchScore": 52, "performanceTrend": "Stable", "reasoning": "Established Real Madrid/England star, cited as a benchmark long-term soccer card hold. Steadier than a rising rookie pick.", "targetPriceRaw": 220, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Victor Wembanyama", "sport": "NBA", "cardToLookFor": "Recon Future Legends insert (premium tier, lower entry than base Prizm)", "tier": "Buy Now", "researchScore": 60, "performanceTrend": "Improving", "reasoning": "Insert-tier entry point on a card whose base rookie has already sold privately for $5.11M. Premium tier still carries real collector cachet at a fraction of the cost.", "targetPriceRaw": "", "targetPriceGraded": 300, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Justin Herbert (PSA 10)", "sport": "NFL", "cardToLookFor": "2020 Prizm base rookie, PSA 10", "tier": "Buy Now", "researchScore": 44, "performanceTrend": "Stable", "reasoning": "PSA 10 copies trade $300-400 USD (~$450-600 AUD) — established, recognizable rookie with a long track record as a top-tier arm.", "targetPriceRaw": "", "targetPriceGraded": 480, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Roman Anthony (PSA 9)", "sport": "MLB", "cardToLookFor": "2026 Topps Chrome / Bowman Chrome, PSA 9", "tier": "Buy Now", "researchScore": 48, "performanceTrend": "Improving", "reasoning": "Elite outfield prospect already producing at the MLB level, elite plate discipline. Prices have moved fast — this is more 'own at least one' than a bargain now.", "targetPriceRaw": "", "targetPriceGraded": 380, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Lamine Yamal", "sport": "Soccer", "cardToLookFor": "Topps Match Attax Red Hot / Golden Moment inserts", "tier": "Buy Now", "researchScore": 55, "performanceTrend": "Improving", "reasoning": "Teenage sensation driving current Match Attax pull rates. Global star with the 2026 World Cup as a major demand catalyst for the whole category.", "targetPriceRaw": 350, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Anthony Edwards (PSA 10)", "sport": "NBA", "cardToLookFor": "2020-21 Prizm base rookie, PSA 10", "tier": "Buy Now", "researchScore": 58, "performanceTrend": "Improving", "reasoning": "Considered a blue-chip modern hobby card — Prizm brand credibility, MVP-conversation trajectory, growing global fanbase.", "targetPriceRaw": "", "targetPriceGraded": 700, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Lamine Yamal (PSA 10)", "sport": "Soccer", "cardToLookFor": "Base Chrome rookie, PSA 10", "tier": "Buy Now", "researchScore": 53, "performanceTrend": "Improving", "reasoning": "PSA 10 base Chrome copies trading $500-1,500 USD and rising, per current market coverage — World Cup year adds further upside.", "targetPriceRaw": "", "targetPriceGraded": 750, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Umbreon VMAX Alt Art (\"Moonbreon\")", "sport": "Pokémon", "cardToLookFor": "Evolving Skies Umbreon VMAX Alt Art, near-mint raw", "tier": "Buy Now", "researchScore": 62, "performanceTrend": "Stable", "reasoning": "The poster child for modern Pokémon investing — went from ~$200 to $700+ within two years of release. Raw near-mint sits below the PSA 10 premium.", "targetPriceRaw": 650, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Erling Haaland", "sport": "Soccer", "cardToLookFor": "Base rookie, PSA 10", "tier": "Buy Now", "researchScore": 54, "performanceTrend": "Stable", "reasoning": "Incredible scoring record makes his rookies among the most sought-after modern soccer cards. PSA 10 base copies trade $1,000-2,500 USD (~$1,500-3,700 AUD).", "targetPriceRaw": "", "targetPriceGraded": 1600, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Victor Wembanyama (PSA 10)", "sport": "NBA", "cardToLookFor": "2023-24 Prizm base rookie, PSA 10", "tier": "Buy Now", "researchScore": 66, "performanceTrend": "Improving", "reasoning": "Defensive Player of the Year, MVP-level Year 3 numbers. One of his rookie cards sold privately for $5.11M — the base PSA 10 is the safest liquid entry into that same market.", "targetPriceRaw": "", "targetPriceGraded": 900, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Umbreon VMAX Alt Art (\"Moonbreon\") — PSA 10", "sport": "Pokémon", "cardToLookFor": "Evolving Skies Umbreon VMAX Alt Art, PSA 10", "tier": "Buy Now", "researchScore": 60, "performanceTrend": "Stable", "reasoning": "PSA 10 copies average roughly $3,500. Eeveelution demand plus a rotating set keeps supply tightening.", "targetPriceRaw": "", "targetPriceGraded": 5200, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Charizard (Base Set, 1st Edition)", "sport": "Pokémon", "cardToLookFor": "1999 Base Set 1st Edition Charizard, any grade", "tier": "Buy Now", "researchScore": 58, "performanceTrend": "Stable", "reasoning": "The blue-chip of the entire hobby, vintage or modern. PSA 10 copies trade near $168,000-$170,000 USD with a $550,000 sale on record — obviously the top of the market, included for completeness.", "targetPriceRaw": "", "targetPriceGraded": 250000, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Conor McGregor", "sport": "MMA", "cardToLookFor": "Topps Chrome UFC rookie-era autos, PSA 10", "tier": "Buy Now", "researchScore": 50, "performanceTrend": "Stable", "reasoning": "Still described as 'the king' of UFC card collector interest — best cards trade in four figures regardless of active fight status. Safest, most liquid MMA card rather than the highest-upside.", "targetPriceRaw": "", "targetPriceGraded": 1800, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}];

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

function gradingCost(service, declaredValueAUD) {
  if (!service) return 0;
  const s = service.toLowerCase();
  if (s === "psa via australia" || s === "psa via aus") return tieredPsaAuCost(declaredValueAUD);
  if (s === "psa via shipmycards" || s === "psa via usa") return 38.9;
  if (s === "sgc via australia" || s === "sgc via aus") return 39.95;
  return 0;
}

function estimateGradingTurnaroundDays(service, declaredValueAUD) {
  if (!service) return null;
  const s = service.toLowerCase();
  if (s === "psa via australia" || s === "psa via aus") {
    const usd = (declaredValueAUD || 0) * AUD_TO_USD_APPROX;
    if (usd <= 500) return 225;
    if (usd <= 1000) return 68;
    if (usd <= 1500) return 53;
    if (usd <= 2500) return 38;
    if (usd <= 5000) return 13;
    return 10;
  }
  if (s === "psa via shipmycards" || s === "psa via usa") return 60;
  if (s === "sgc via australia" || s === "sgc via aus") return 30;
  return null;
}

const PSA9_GRADES = ["psa 9", "sgc 9", "bgs 9", "bgs 9.5"];
const PSA10_GRADES = ["psa 10", "sgc 10", "bgs 10"];

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
      return null;
  }
}

function computeCard(c) {
  const holdingCost = (c.shipMyCards || "").toLowerCase() === "yes" ? 4.5 : 0;
  const totalCost = c.paid + c.shipping + holdingCost + (c.gradingCostPaid || 0);
  const fees = c.feesPct;
  const grade = (c.grade || "").toLowerCase();
  const status = c.status;
  const isActive = status === "Raw" || status === "Graded";

  const raw = c.rawAvg ?? 0;
  const psa9 = c.psa9Avg ?? 0;
  const psa10 = c.psa10Avg ?? c.psa9Avg ?? 0;

  const netRawSell = raw * (1 - fees);
  const netPsa9Sell = psa9 * (1 - fees);
  const netPsa10Sell = psa10 * (1 - fees);

  const declaredValue = Math.max(psa9, psa10);
  const gCost = gradingCost(c.gradingService, declaredValue);

  const rawGGR = isActive ? (status === "Graded" ? null : raw - totalCost) : null;

  const psa9Eligible = isActive && (status === "Raw" || PSA9_GRADES.includes(grade));
  const psa9GGR = psa9Eligible ? psa9 * (1 - fees) - totalCost - gCost : null;

  const psa10Eligible = isActive && (status === "Raw" || PSA10_GRADES.includes(grade));
  const psa10GGR = psa10Eligible ? psa10 * (1 - fees) - totalCost - gCost : null;

  let gradedEV = null;
  if (isActive && status !== "Graded") {
    const analysis = c.gradeAnalysis;
    const gemRate = c.setGemRate !== "" && c.setGemRate != null ? Math.max(0, Math.min(1, Number(c.setGemRate) / 100)) : null;
    if (analysis) {
      const belowValue = raw ?? 0;
      const expectedRevenue = psa10 * (1 - fees) * analysis.psa10Prob + psa9 * (1 - fees) * analysis.psa9Prob + belowValue * (1 - fees) * analysis.belowProb;
      gradedEV = expectedRevenue - totalCost - gCost;
    } else if (gemRate != null) {
      const p10 = gemRate;
      const p9 = Math.min(1 - p10, 0.5);
      gradedEV = p10 * (psa10 * (1 - fees) - totalCost - gCost) + p9 * (psa9 * (1 - fees) - totalCost - gCost);
    } else {
      gradedEV = c.psa10Prob * (psa10 * (1 - fees) - totalCost - gCost) + c.psa9Prob * (psa9 * (1 - fees) - totalCost - gCost);
    }
  }

  let gradeWorthIt = "NO";
  if (psa10GGR >= 20 && psa9GGR >= 0 && gradedEV >= rawGGR) gradeWorthIt = "YES";
  else if (psa10GGR >= 20 && psa9GGR >= -10 && psa9GGR < 0 && gradedEV >= rawGGR) gradeWorthIt = "HIGH RISK";

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
    if (grade === "psa 10" && psa10GGR >= 20) sellDecision = "Sell PSA 10";
    else if (PSA9_GRADES.includes(grade) && psa9GGR >= 5) sellDecision = "Sell PSA 9";
    else sellDecision = "Hold";
  } else {
    const gradeFirst = gradeWorthIt !== "NO" && psa10GGR > rawGGR;
    if (gradeFirst) {
      sellDecision = "Grade First";
    } else {
      const threshAbs = totalCost <= 30 ? Math.max(5, totalCost * 0.15) : Math.max(20, totalCost * 0.2);
      const threshPct = totalCost <= 30 ? 0.15 : 0.2;
      const sellRawFirst = rawGGR >= threshAbs || (totalCost > 0 && rawGGR / totalCost >= threshPct);
      sellDecision = sellRawFirst ? "Sell Raw First" : "Hold";
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
  const psa9BE = (totalCost + gCost) / (1 - fees);
  const psa10BE = (totalCost + gCost) / (1 - fees);

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
    const declaredValue = Math.max(psa9, psa10, raw);
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
    gradingCostValue: gCost,
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

function computePokemonCard(c) {
  const holdingCost = (c.shipMyCards || "").toLowerCase() === "yes" ? 4.5 : 0;
  const totalCost = c.paid + c.shipping + holdingCost + (c.gradingCostPaid || 0);
  const fees = c.feesPct;
  const status = c.status;
  const isActive = status === "Raw" || status === "Graded";

  const raw = c.rawAvg ?? 0;
  const psa9 = c.psa9Avg ?? 0;
  const psa10 = c.psa10Avg ?? c.psa9Avg ?? 0;

  const netRawSell = raw * (1 - fees);
  const netPsa9Sell = psa9 * (1 - fees);
  const netPsa10Sell = psa10 * (1 - fees);

  const declaredValue = Math.max(psa9, psa10);
  const gCost = gradingCost(c.gradingService, declaredValue);

  const rawGGR = isActive ? (status === "Graded" ? null : raw - totalCost) : null;
  const psa9GGR = isActive ? psa9 * (1 - fees) - totalCost - gCost : null;
  const psa10GGR = isActive ? psa10 * (1 - fees) - totalCost - gCost : null;

  let gradedEV = null;
  if (isActive && status !== "Graded") {
    const analysis = c.gradeAnalysis;
    const gemRate = c.setGemRate !== "" && c.setGemRate != null ? Math.max(0, Math.min(1, Number(c.setGemRate) / 100)) : null;
    if (analysis) {
      const belowValue = raw ?? 0;
      const expectedRevenue = psa10 * (1 - fees) * analysis.psa10Prob + psa9 * (1 - fees) * analysis.psa9Prob + belowValue * (1 - fees) * analysis.belowProb;
      gradedEV = expectedRevenue - totalCost - gCost;
    } else if (gemRate != null) {
      const p10 = gemRate;
      const p9 = Math.min(1 - p10, 0.5);
      gradedEV = p10 * (psa10 * (1 - fees) - totalCost - gCost) + p9 * (psa9 * (1 - fees) - totalCost - gCost);
    } else {
      gradedEV = c.psa10Prob * (psa10 * (1 - fees) - totalCost - gCost) + c.psa9Prob * (psa9 * (1 - fees) - totalCost - gCost);
    }
  }

  let gradeWorthIt = "NO";
  if (psa10GGR >= 40 && psa9GGR < 0 && psa9GGR >= -20) gradeWorthIt = "HIGH RISK";
  else if (psa10GGR >= 20 && psa9GGR >= 0) gradeWorthIt = "YES";

  const gradeCall = status === "Raw" ? gradeWorthIt : "";

  let sellDecision = "";
  if (status === "Sold") {
    sellDecision = "Sold";
  } else if (status === "Listed") {
    sellDecision = "Listed";
  } else if (status === "At Grading") {
    sellDecision = "At Grading";
  } else if (status === "Graded") {
    const pkmnGradeCheck = (c.grade || "").toLowerCase();
    if (PSA10_GRADES.includes(pkmnGradeCheck) && psa10GGR >= 20) sellDecision = "Sell PSA 10";
    else if (PSA9_GRADES.includes(pkmnGradeCheck) && psa9GGR >= 5) sellDecision = "Sell PSA 9";
    else sellDecision = "Hold";
  } else {
    const best = Math.max(psa9GGR, psa10GGR);
    if (rawGGR > 0 && rawGGR >= best) sellDecision = "Sell Raw First";
    else if (gradeWorthIt !== "NO" && best > 0 && best > rawGGR) sellDecision = "Grade First";
    else sellDecision = "Hold";
  }

  let sellPriority = 6;
  if (sellDecision === "Sell PSA 9" || sellDecision === "Sell PSA 10") sellPriority = 1;
  else if (sellDecision === "Sell Raw First") sellPriority = 2;
  else if (sellDecision === "Grade First" && gradeCall === "YES") sellPriority = 3;
  else if (sellDecision === "Grade First" && gradeCall === "HIGH RISK") sellPriority = 4;
  else if (sellDecision === "Hold" || sellDecision === "") sellPriority = 6;
  else if (status === "Listed") sellPriority = 7;
  else if (status === "Sold") sellPriority = 8;
  else if (status === "At Grading") sellPriority = 7.5;
  else sellPriority = 6;

  const rawBE = totalCost / (1 - fees);
  const psa9BE = (totalCost + gCost) / (1 - fees);
  const psa10BE = (totalCost + gCost) / (1 - fees);

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
    const declaredForTurnaround = Math.max(psa9, psa10, raw);
    gradingTurnaroundDays = estimateGradingTurnaroundDays(c.gradingService, declaredForTurnaround);
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
    gradingCostValue: gCost,
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

const SELL_DECISION_STYLE = {
  "Sell Raw First": { color: "#C9A227", label: "Sell Raw First" },
  "Grade First": { color: "#8B6FD6", label: "Grade First" },
  "Sell PSA 10": { color: "#4E8BC9", label: "Sell PSA 10" },
  "Sell PSA 9": { color: "#4E8BC9", label: "Sell PSA 9" },
  Hold: { color: "#5C7A99", label: "Hold" },
  Listed: { color: "#2FA89A", label: "Listed" },
  Sold: { color: "#4E8B6B", label: "Sold" },
  "": { color: "#4A4F5C", label: "—" },
};

function computeBuy(b) {
  const usingSMC = b.shipMyCards === "ShipMyCards";
  const targetROI = usingSMC ? 0.5 : 0.4;
  const holdingFee = usingSMC ? 4.5 : 0;
  const fees = b.feesPct;

  const gradeLevel = (b.psaLevel || "").toLowerCase();
  let riskAdjust;
  if (b.rawGraded === "Raw") riskAdjust = -0.1;
  else if (PSA9_GRADES.includes(gradeLevel)) riskAdjust = 0;
  else if (PSA10_GRADES.includes(gradeLevel)) riskAdjust = 0.1;
  else riskAdjust = 0;

  const rawAvg = avgOfSales(b.rawSale1, b.rawSale2);
  const psa9Avg = avgOfSales(b.psa9Sale1, b.psa9Sale2);
  const psa10Avg = avgOfSales(b.psa10Sale1, b.psa10Sale2);

  let marketPrice;
  if (b.rawGraded === "Raw") marketPrice = rawAvg ?? 0;
  else if (PSA9_GRADES.includes(gradeLevel)) marketPrice = psa9Avg ?? 0;
  else if (PSA10_GRADES.includes(gradeLevel)) marketPrice = psa10Avg ?? 0;
  else marketPrice = rawAvg ?? 0;

  const adjMarketValue = marketPrice * (1 - riskAdjust);

  const auctionHeat =
    b.bidders >= 7 || b.watchers >= 7 ? "Hot" : b.bidders >= 3 || b.watchers >= 4 ? "Mid" : "Cold";

  const heatMult = auctionHeat === "Cold" ? 1.08 : auctionHeat === "Hot" ? 0.95 : 1;
  const valueMult = adjMarketValue >= 80 ? 1.1 : adjMarketValue >= 50 ? 1.05 : 1;

  const feeDollar = adjMarketValue * fees;
  const breakevenBid = adjMarketValue - feeDollar - holdingFee - b.shipping;
  const effectiveMult = Math.min(heatMult * valueMult, 1);
  const maxSnipeBid = Math.max(0, breakevenBid * effectiveMult);

  const currentBid = Number(b.currentBid) || 0;
  const referenceBid = currentBid > 0 ? currentBid : maxSnipeBid;

  const estProfit = adjMarketValue - (referenceBid + feeDollar + holdingFee + b.shipping);
  const roiPct = referenceBid > 0 ? estProfit / referenceBid : null;

  const decision =
    marketPrice <= 0
      ? null
      : currentBid > 0
      ? estProfit <= 0
        ? "PASS"
        : referenceBid <= (b.maxBudget ?? 0)
        ? "BUY"
        : "PASS"
      : maxSnipeBid > 0 && maxSnipeBid <= (b.maxBudget ?? 0)
      ? "BUY"
      : "PASS";

  let rawGGRBuy = null, psa9GGRBuy = null, psa10GGRBuy = null, gradedEVBuy = null, gradeCallBuy = null;
  const gCost = gradingCost(b.gradingService, Math.max(psa9Avg || 0, psa10Avg || 0));
  if (b.rawGraded === "Raw") {
    const costBasis = maxSnipeBid + b.shipping + holdingFee;
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
      ? referenceBid > 0 && (adjMarketValue - b.shipping - 20) / referenceBid >= 0.5
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
    actualProfit = adjMarketValue - (paidAmount + feeDollar + holdingFee + b.shipping);
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

const STATUS_OPTIONS = ["Raw", "At Grading", "Graded", "Listed", "Sold"];
const GRADE_OPTIONS = ["PSA 9", "PSA 10", "SGC 9", "SGC 10", "BGS 9", "BGS 9.5", "BGS 10"];
const GRADING_SERVICE_OPTIONS = ["PSA via Australia", "PSA via ShipMyCards", "SGC via Australia", "None"];
const SPORT_OPTIONS = ["NFL", "NBA", "WNBA", "MLB", "AFL", "Soccer", "MMA", "WWE", "Pokémon", "Other"];

const LEAGUE_TEAMS = {
  NFL: ["Cardinals", "Falcons", "Ravens", "Bills", "Panthers", "Bears", "Bengals", "Browns", "Cowboys", "Broncos", "Lions", "Packers", "Texans", "Colts", "Jaguars", "Chiefs", "Raiders", "Chargers", "Rams", "Dolphins", "Vikings", "Patriots", "Saints", "Giants", "Jets", "Eagles", "Steelers", "49ers", "Seahawks", "Buccaneers", "Titans", "Commanders"],
  NBA: ["Hawks", "Celtics", "Nets", "Hornets", "Bulls", "Cavaliers", "Mavericks", "Nuggets", "Pistons", "Warriors", "Rockets", "Pacers", "Clippers", "Lakers", "Grizzlies", "Heat", "Bucks", "Timberwolves", "Pelicans", "Knicks", "Thunder", "Magic", "76ers", "Suns", "Trail Blazers", "Kings", "Spurs", "Raptors", "Jazz", "Wizards"],
  MLB: ["Diamondbacks", "Braves", "Orioles", "Red Sox", "Cubs", "White Sox", "Reds", "Guardians", "Rockies", "Tigers", "Astros", "Royals", "Angels", "Dodgers", "Marlins", "Brewers", "Twins", "Mets", "Yankees", "Athletics", "Phillies", "Pirates", "Padres", "Giants", "Mariners", "Cardinals", "Rays", "Rangers", "Blue Jays", "Nationals"],
  WNBA: ["Dream", "Sky", "Sun", "Wings", "Fever", "Aces", "Sparks", "Mercury", "Storm", "Mystics", "Liberty", "Lynx", "Valkyries"],
  AFL: ["Adelaide", "Brisbane", "Carlton", "Collingwood", "Essendon", "Fremantle", "Geelong", "Gold Coast", "GWS", "Hawthorn", "Melbourne", "North Melbourne", "Port Adelaide", "Richmond", "St Kilda", "Sydney", "West Coast", "Western Bulldogs"],
};
const BOX_LEAGUE_OPTIONS = ["NFL", "NBA", "MLB", "WNBA", "AFL", "Custom"];

const LOCATION_OPTIONS = ["In Hand", "ShipMyCards Vault", "eBay Vault", "At Grading", "In Transit"];
const LOCATION_STYLE = {
  "In Hand": { color: "#4E8B6B" },
  "ShipMyCards Vault": { color: "#C9A227" },
  "eBay Vault": { color: "#C9A227" },
  "At Grading": { color: "#8B6FD6" },
  "In Transit": { color: "#5C7A99" },
};

const STORAGE_KEY = "cardflip_ev_portfolio_v1";
const POKEMON_STORAGE_KEY = "cardflip_ev_pokemon_v1";
const BUY_STORAGE_KEY = "cardflip_ev_buylist_v1";
const BOX_STORAGE_KEY = "cardflip_ev_boxbreaks_v1";
const TARGETS_STORAGE_KEY = "cardflip_ev_targets_v1";
const CONTENT_STORAGE_KEY = "cardflip_ev_content_v1";
const CONTENT_GOAL_STORAGE_KEY = "cardflip_ev_content_goal_v1";
const MANUAL_EXPENSES_STORAGE_KEY = "cardflip_ev_manual_expenses_v1";
const SAVED_SCANS_STORAGE_KEY = "cardflip_ev_saved_scans_v1";

function copyToClipboard(text) {
  return new Promise((resolve) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => resolve(true))
        .catch(() => resolve(fallbackCopy(text)));
    } else {
      resolve(fallbackCopy(text));
    }
  });
}

function fallbackCopy(text) {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch (e) {
    return false;
  }
}

function selectAllText(e) {
  const range = document.createRange();
  range.selectNodeContents(e.currentTarget);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function avgOfSales(a, b) {
  const va = a === "" || a == null ? null : Number(a);
  const vb = b === "" || b == null ? null : Number(b);
  if (va == null && vb == null) return null;
  if (va == null) return vb;
  if (vb == null) return va;
  return (va + vb) / 2;
}

function appendHistoryIfChanged(history, oldVal, newVal, dateStr) {
  const h = history || [];
  if (newVal == null) return h;
  if (oldVal === newVal) return h;
  return [...h, { date: dateStr, value: newVal }];
}

function recommendedListing(card) {
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

const hasArtifactStorage = typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";
const _writeQueues = {};

function unwrapEnvelope(parsed) {
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && "data" in parsed && "savedAt" in parsed) {
    return { data: parsed.data, savedAt: Number(parsed.savedAt) || 0 };
  }
  return { data: parsed, savedAt: 0 };
}

async function storageGet(key) {
  let artifactEnv = null;
  let localEnv = null;

  if (hasArtifactStorage) {
    try {
      const result = await window.storage.get(key, false);
      if (result && result.value != null) artifactEnv = unwrapEnvelope(JSON.parse(result.value));
    } catch (e) {}
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw) localEnv = unwrapEnvelope(JSON.parse(raw));
  } catch (e) {
    console.error("localStorage read failed for", key, e);
  }

  if (artifactEnv && localEnv) {
    return artifactEnv.savedAt >= localEnv.savedAt ? artifactEnv.data : localEnv.data;
  }
  if (artifactEnv) return artifactEnv.data;
  if (localEnv) return localEnv.data;
  return null;
}

async function storageSet(key, value) {
  const envelope = { data: value, savedAt: Date.now() };
  const payload = JSON.stringify(envelope);

  const prior = _writeQueues[key] || Promise.resolve();
  const next = prior
    .catch(() => {})
    .then(async () => {
      try {
        localStorage.setItem(key, payload);
      } catch (e) {
        console.error("localStorage write failed for", key, e);
      }
      if (hasArtifactStorage) {
        try {
          await window.storage.set(key, payload, false);
        } catch (e) {}
      }
    });
  _writeQueues[key] = next;
  await next;
  return true;
}

const DEFAULT_CARDS = () => SEED_CARDS.map((c, i) => ({ id: `seed-${i}`, ...c }));
const DEFAULT_POKEMON = () => SEED_POKEMON.map((c, i) => ({ id: `pkmn-seed-${i}`, ...c }));
const DEFAULT_TARGETS = () => SEED_TARGETS.map((t) => ({ ...t, id: crypto.randomUUID() }));
const DEFAULT_CONTENT_GOAL = { count: 1, period: "week" };

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

  useEffect(() => {
    function blurNumberInputOnWheel() {
      if (document.activeElement && document.activeElement.tagName === "INPUT" && document.activeElement.type === "number") {
        document.activeElement.blur();
      }
    }
    document.addEventListener("wheel", blurNumberInputOnWheel, { passive: true });
    return () => document.removeEventListener("wheel", blurNumberInputOnWheel);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
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
    }
    loadAll();
    return () => {
      cancelled = true;
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

  const enriched = useMemo(
    () =>
      activeCards.map((c) => {
        const computed = computeFn(c);
        const listing = recommendedListing(computed);
        const expectedListProfit = listing ? listing.listPrice * (1 - computed.feesPct) - computed.totalCost : null;
        return { ...computed, expectedListProfit };
      }),
    [activeCards, computeFn]
  );

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

  const totals = useMemo(() => {
    const qty = (c) => Number(c.quantity) || 1;
    const active = enriched.filter((c) => c.status !== "Sold");
    const invested = active.reduce((s, c) => s + c.totalCost * qty(c), 0);
    const potentialRaw = active.reduce((s, c) => s + (c.rawGGR ?? 0) * qty(c), 0);
    const realised = enriched.filter((c) => c.status === "Sold").reduce((s, c) => s + (c.realisedProfit ?? 0) * qty(c), 0);
    const soldCost = enriched.filter((c) => c.status === "Sold").reduce((s, c) => s + c.totalCost * qty(c), 0);
    const actionable = enriched.filter((c) =>
      ["Sell Raw First", "Grade First", "Sell PSA 9", "Sell PSA 10"].includes(c.sellDecision)
    ).length;
    const totalInvested = invested + soldCost;
    const overallROI = totalInvested > 0 ? (potentialRaw + realised) / totalInvested : null;
    return { invested, potentialRaw, realised, actionable, count: active.length, overallROI };
  }, [enriched]);

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
      gradeAnalysis: target.gradeAnalysis || null,
      actualSellPrice: null,
      datePurchased: target.purchaseDate || new Date().toISOString().slice(0, 10),
    };
    if (isPkmn) {
      setPokemonCards((prev) => [newCard, ...prev]);
    } else {
      setCards((prev) => [newCard, ...prev]);
    }
  }

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
    <StatBar totals={totals} />
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
      enriched={enriched}
    />
    <CardTable
      cards={filtered}
      onSelect={setSelected}
      playerLabel={isPokemon ? "Pokémon / Card Name" : "Player"}
      sortKey={sortKey}
      sortDir={sortDir}
      onSort={handleSort}
      isPokemon={isPokemon}
    />
  </>
)}

        {tab === "sales" && <MySales items={salesItems} onUpdate={updateCardIn} onDelete={deleteCardIn} />}
        {tab === "boxbreaks" && <BoxBreaks boxBreaks={boxBreaks} setBoxBreaks={setBoxBreaks} />}
        {tab === "gradecheck" && <GradeCheck cards={cards} pokemonCards={pokemonCards} onUpdateCardIn={updateCardIn} />}
        {tab === "gradingtracker" && <GradingTracker cards={cards} pokemonCards={pokemonCards} onUpdateCardIn={updateCardIn} />}
        {tab === "lotscanner" && <LotScanner setTargets={setTargets} setBuyList={setBuyList} savedScans={savedScans} setSavedScans={setSavedScans} />}
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
        <AddCardModal onClose={() => setShowAdd(false)} onSave={addCard} playerLabel={isPokemon ? "Pokémon" : "Player"} defaultSport={isPokemon ? "Pokémon" : "NFL"} />
      )}
      {selectedCard && (
        <DetailModal card={selectedCard} onClose={() => setSelected(null)} onUpdate={updateCard} onDelete={deleteCard} playerLabel={isPokemon ? "Pokémon" : "Player"} />
      )}
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
          <button className="btnSecondary" onClick={onExport} title="Download a backup of everything">
            <span style={{ marginRight: 6 }}>⬇️</span> Export
          </button>
          <label className="btnSecondary" style={{ cursor: "pointer" }} title="Restore from backup">
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

function StatBar({ totals }) {
  return (
    <div style={{ marginTop: 26, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1, background: "#2C303B", border: "1px solid #2C303B", borderRadius: 12, overflow: "hidden" }}>
      <Stat label="Active cards" value={totals.count} />
      <Stat label="Invested" value={fmtMoney(totals.invested)} />
      <Stat
        label="Potential raw profit"
        value={`${totals.potentialRaw >= 0 ? "+" : ""}${fmtMoney(totals.potentialRaw)}`}
        color={totals.potentialRaw >= 0 ? "#4E8B6B" : "#B4472E"}
      />
      <Stat label="Realised profit" value={`${totals.realised >= 0 ? "+" : ""}${fmtMoney(totals.realised)}`} color={totals.realised >= 0 ? "#4E8B6B" : "#B4472E"} />
      <Stat label="Overall ROI" value={fmtPct(totals.overallROI)} color={totals.overallROI >= 0 ? "#4E8B6B" : "#B4472E"} />
      <Stat label="Needs action" value={totals.actionable} color="#C9A227" />
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ background: "#191B22", padding: "14px 18px" }}>
      <div style={{ fontSize: 11, color: "#8B90A0", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div className="oswald" style={{ fontSize: 21, fontWeight: 600, color: color || "#EDEAE1" }}>{value}</div>
    </div>
  );
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "action", label: "Needs action" },
  { key: "Raw", label: "Raw" },
  { key: "Graded", label: "Graded" },
];

const DECISION_FILTERS = ["Sell Raw First", "Grade First", "Sell PSA 9", "Sell PSA 10", "Hold"];

function FilterRow({ statusFilter, setStatusFilter, decisionFilter, setDecisionFilter, sportFilter, setSportFilter, locationFilter, setLocationFilter, setSortKey, enriched }) {
  const sports = useMemo(() => {
    const set = new Set(enriched.map((c) => c.sport).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [enriched]);

  function handleStatusClick(key) {
    setStatusFilter(key);
    if (key === "all") setSortKey(null);
  }

  return (
    <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <button key={f.key} className={`filterBtn ${statusFilter === f.key ? "active" : ""}`} onClick={() => handleStatusClick(f.key)}>
            {f.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", marginBottom: 4 }}>Decision</label>
          <select value={decisionFilter} onChange={(e) => setDecisionFilter(e.target.value)} style={{ width: "auto", minWidth: 170 }}>
            <option value="all">Any decision</option>
            {DECISION_FILTERS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        {sports.length > 2 && (
          <div>
            <label style={{ display: "block", marginBottom: 4 }}>Sport / Category</label>
            <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)} style={{ width: "auto", minWidth: 140 }}>
              <option value="all">All categories</option>
              {sports.filter((s) => s !== "all").map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        <div>
          <label style={{ display: "block", marginBottom: 4 }}>Location</label>
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} style={{ width: "auto", minWidth: 160 }}>
            <option value="all">All locations</option>
            <option value="not-in-hand">Not in hand</option>
            {LOCATION_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

const DECISION_SORT_ORDER = {
  "Sell Raw First": 0,
  "Sell PSA 10": 1,
  "Sell PSA 9": 2,
  "Grade First": 3,
  Hold: 4,
  Listed: 5,
  Sold: 6,
  "": 7,
};

const COLUMNS = [
  { key: "player", label: null, width: "2fr" },
  { key: "status", label: "Status", width: "90px" },
  { key: "totalCost", label: "Cost", width: "90px" },
  { key: "rawGGR", label: "Raw GGR", width: "90px" },
  { key: "gradedEV", label: "Graded EV", width: "90px" },
  { key: "expectedListProfit", label: "Exp. Sell Profit", width: "110px" },
  { key: "sellDecision", label: "Decision", width: "1fr" },
];

function CardTable({ cards, onSelect, playerLabel, sortKey, sortDir, onSort }) {
  const gridCols = COLUMNS.map((c) => c.width).join(" ") + " 32px";

  const sorted = useMemo(() => {
    if (!sortKey) return cards;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...cards].sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string") return av.localeCompare(bv) * dir;
      return (av - bv) * dir;
    });
  }, [cards, sortKey, sortDir]);

  return (
    <div style={{ marginTop: 18, border: "1px solid #2C303B", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: gridCols, padding: "10px 14px", background: "#1D2028", fontSize: 11, color: "#8B90A0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {COLUMNS.map((c) => (
          <div
            key={c.key}
            onClick={() => onSort(c.key)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 3, userSelect: "none" }}
          >
            {c.key === "player" ? playerLabel || "Card" : c.label}
            {sortKey === c.key && <span style={{ color: "#C9A227" }}>{sortDir === "asc" ? "▲" : "▼"}</span>}
          </div>
        ))}
        <div />
      </div>
      {sorted.length === 0 ? (
        <div style={{ padding: "3rem 0", textAlign: "center", color: "#5C6270" }}>No cards match this filter.</div>
      ) : (
        sorted.map((c) => <CardRow key={c.id} card={c} onClick={() => onSelect(c.id)} gridCols={gridCols} />)
      )}
    </div>
  );
}

function CardRow({ card, onClick, gridCols }) {
  const style = SELL_DECISION_STYLE[card.sellDecision] || SELL_DECISION_STYLE[""];
  const isTopAction = card.sellPriority === 1;
  const isRawSell = card.sellDecision === "Sell Raw First";
  const isGradeAction = card.sellPriority >= 3 && card.sellPriority <= 5 && card.sellDecision === "Grade First";

  return (
    <div
      onClick={onClick}
      className="cardRow"
      style={{
        display: "grid",
        gridTemplateColumns: gridCols,
        padding: "12px 14px",
        borderTop: "1px solid #24272F",
        borderLeft: isTopAction ? `4px solid ${style.color}` : isRawSell ? `3px solid ${style.color}80` : isGradeAction ? `4px solid ${style.color}` : "4px solid transparent",
        background: isTopAction ? `${style.color}14` : isRawSell ? `${style.color}08` : "transparent",
        cursor: "pointer",
        alignItems: "center",
        fontSize: 13,
      }}
    >
      <div>
        <div style={{ fontWeight: 600 }}>
          {card.player}
          {card.rookie && (
            <span className="mono" style={{ fontSize: 9.5, color: "#C9A227", border: "1px solid #C9A22755", borderRadius: 4, padding: "1px 5px", marginLeft: 6 }}>RC</span>
          )}
          {card.sport && <span className="mono" style={{ fontSize: 10, color: "#6B7180", marginLeft: 8 }}>{SPORT_EMOJI[card.sport] || "🎴"} {card.sport}</span>}
        </div>
        <div style={{ fontSize: 12, color: "#6B7180" }}>
          {card.card}{card.cardNum ? ` ${card.cardNum}` : ""}
          {card.numbered && card.outOf ? ` /${card.outOf}` : ""}
          {card.location && card.location !== "In Hand" && (
            <span className="mono" style={{ fontSize: 10, color: (LOCATION_STYLE[card.location] || {}).color || "#8B90A0", marginLeft: 8 }}>
              📍 {card.location}
            </span>
          )}
        </div>
      </div>
      <div style={{ color: "#A7ADBB" }}>{card.status}{card.grade ? ` · ${card.grade}` : ""}</div>
      <div>{fmtMoney(card.totalCost)}</div>
      <div style={{ color: card.rawGGR >= 0 ? "#4E8B6B" : "#B4472E" }}>{card.rawGGR != null ? fmtMoney(card.rawGGR) : "—"}</div>
      <div style={{ color: card.gradedEV >= 0 ? "#4E8B6B" : "#B4472E" }}>{card.gradedEV != null ? fmtMoney(card.gradedEV) : "—"}</div>
      <div style={{ color: card.expectedListProfit >= 0 ? "#4E8B6B" : card.expectedListProfit != null ? "#B4472E" : "#5C6270", fontWeight: card.expectedListProfit != null ? 600 : 400 }}>
        {card.expectedListProfit != null ? fmtMoney(card.expectedListProfit) : "—"}
      </div>
      <div>
        <span
          className="mono"
          style={{
            fontSize: isTopAction ? 11.5 : 10.5,
            fontWeight: isTopAction ? 700 : 500,
            padding: isTopAction ? "4px 11px" : "3px 9px",
            borderRadius: 999,
            background: isTopAction ? style.color : `${style.color}22`,
            color: isTopAction ? "#14161C" : style.color,
          }}
        >
          {isTopAction ? "⚡ " : ""}{style.label}
        </span>
      </div>
      <div style={{ color: "#5C6270", display: "flex", justifyContent: "flex-end" }}>
        <ChevronRight size={16} />
      </div>
    </div>
  );
}

function AddCardModal({ onClose, onSave, playerLabel, defaultSport }) {
  const [form, setForm] = useState({
    player: "",
    card: "",
    cardNum: "",
    sport: defaultSport || "NFL",
    location: "In Hand",
    rookie: false,
    numbered: false,
    outOf: "",
    quantity: 1,
    shipMyCards: "No",
    status: "Raw",
    grade: null,
    paid: "",
    shipping: "",
    feesPct: 0.137,
    rawSale1: "",
    rawSale2: "",
    psa9Sale1: "",
    psa9Sale2: "",
    psa10Sale1: "",
    psa10Sale2: "",
    gradingService: "PSA via Australia",
    setGemRate: "",
    psa10Prob: 0.35,
    psa9Prob: 0.45,
    actualSellPrice: "",
  });

  function submit(e) {
    e.preventDefault();
    if (!form.player) return;
    const today = new Date().toISOString().slice(0, 10);
    const rawAvg = avgOfSales(form.rawSale1, form.rawSale2);
    const psa9Avg = avgOfSales(form.psa9Sale1, form.psa9Sale2);
    const psa10Avg = avgOfSales(form.psa10Sale1, form.psa10Sale2);
    onSave({
      ...form,
      paid: Number(form.paid) || 0,
      shipping: Number(form.shipping) || 0,
      rawAvg,
      psa9Avg,
      psa10Avg,
      rawHistory: rawAvg != null ? [{ date: today, value: rawAvg }] : [],
      psa9History: psa9Avg != null ? [{ date: today, value: psa9Avg }] : [],
      psa10History: psa10Avg != null ? [{ date: today, value: psa10Avg }] : [],
      outOf: form.numbered && form.outOf !== "" ? Number(form.outOf) : null,
      quantity: Number(form.quantity) || 1,
      actualSellPrice: form.actualSellPrice === "" ? null : Number(form.actualSellPrice),
      datePurchased: today,
    });
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title={`Add a ${playerLabel || "card"}`} onClose={onClose} />
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 10 }}>
            <Field label={playerLabel || "Player"}>
              <input value={form.player} onChange={(e) => setForm({ ...form, player: e.target.value })} required />
            </Field>
            <Field label="Category">
              <select value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })}>
                {SPORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 10 }}>
            <Field label="Card / set">
              <input value={form.card} onChange={(e) => setForm({ ...form, card: e.target.value })} />
            </Field>
            <Field label="Card #">
              <input value={form.cardNum} onChange={(e) => setForm({ ...form, cardNum: e.target.value })} />
            </Field>
          </div>
          <Field label="Location">
            <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
              {LOCATION_OPTIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </Field>
          <RookieNumberedFields form={form} setForm={setForm} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Grade (if graded)">
              <select value={form.grade || ""} onChange={(e) => setForm({ ...form, grade: e.target.value || null })}>
                <option value="">—</option>
                {GRADE_OPTIONS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="ShipMyCards?">
              <select value={form.shipMyCards} onChange={(e) => setForm({ ...form, shipMyCards: e.target.value })}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 90px", gap: 10 }}>
            <Field label="Paid (AUD)">
              <input type="number" step="0.01" value={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.value })} required />
            </Field>
            <Field label="Shipping">
              <input type="number" step="0.01" value={form.shipping} onChange={(e) => setForm({ ...form, shipping: e.target.value })} />
            </Field>
            <Field label="Fees %">
              <input type="number" step="0.001" value={form.feesPct} onChange={(e) => setForm({ ...form, feesPct: Number(e.target.value) })} />
            </Field>
            <Field label="Qty">
              <input type="number" min="1" step="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </Field>
          </div>
          <div style={{ fontSize: 12, color: "#6B7180", marginTop: 2 }}>Most recent sale price(s) — 2nd sale optional, leave both blank for N/A</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <TierPriceInput
              label="Raw"
              sale1={form.rawSale1}
              sale2={form.rawSale2}
              onChange1={(v) => setForm({ ...form, rawSale1: v })}
              onChange2={(v) => setForm({ ...form, rawSale2: v })}
            />
            <TierPriceInput
              label="PSA 9"
              sale1={form.psa9Sale1}
              sale2={form.psa9Sale2}
              onChange1={(v) => setForm({ ...form, psa9Sale1: v })}
              onChange2={(v) => setForm({ ...form, psa9Sale2: v })}
            />
            <TierPriceInput
              label="PSA 10"
              sale1={form.psa10Sale1}
              sale2={form.psa10Sale2}
              onChange1={(v) => setForm({ ...form, psa10Sale1: v })}
              onChange2={(v) => setForm({ ...form, psa10Sale2: v })}
            />
          </div>
          <Field label="Grading service (if you'd grade it)">
            <select value={form.gradingService} onChange={(e) => setForm({ ...form, gradingService: e.target.value })}>
              {GRADING_SERVICE_OPTIONS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
          {form.gradingService === "PSA via Australia" && (
            <div style={{ fontSize: 11, color: "#6B7180", marginTop: -6 }}>
              Priced by declared value, not flat — cards not produced in the USA (Japanese Pokémon, One Piece, Lorcana, etc.) route via PSA Hong Kong and add 1-2 months to turnaround.
            </div>
          )}
          <Field label="Set gem rate % (optional — from GemRate)">
            <input type="number" step="0.1" min="0" max="100" placeholder="e.g. 22.5" value={form.setGemRate} onChange={(e) => setForm({ ...form, setGemRate: e.target.value })} />
          </Field>
          <button className="btnPrimary" type="submit" style={{ justifyContent: "center", marginTop: 6 }}>
            Add to collection
          </button>
        </form>
      </div>
    </div>
  );
}

const SPORT_EMOJI = {
  NFL: "🏈",
  NBA: "🏀",
  WNBA: "🏀",
  MLB: "⚾",
  AFL: "🏉",
  Soccer: "⚽",
  MMA: "🥊",
  WWE: "🤼",
  "Pokémon": "🧬",
  Other: "🎴",
};

function SearchCopyBlock({ card }) {
  const [copyState, setCopyState] = useState("idle");
  const searchText = [card.player, card.card, card.cardNum].filter(Boolean).join(" ").trim();

  async function copy() {
    const ok = await copyToClipboard(searchText);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => setCopyState("idle"), 2000);
  }

  const point130Url = `https://130point.com/sales/?search=${encodeURIComponent(searchText)}`;
  const ebayUrl = `https://www.ebay.com.au/sch/i.html?_nkw=${encodeURIComponent(searchText)}&LH_Sold=1&LH_Complete=1`;

  return (
    <div style={{ border: "1px solid #2C303B", borderRadius: 8, padding: "10px 12px", marginBottom: 16, background: "#14161C" }}>
      <div
        className="mono"
        onClick={selectAllText}
        title="Click to select the text if Copy doesn't work"
        style={{ fontSize: 12, color: "#C9A227", wordBreak: "break-word", marginBottom: 8, cursor: "text", userSelect: "all" }}
      >
        {searchText}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button className="btnSecondary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "6px 12px" }} onClick={copy}>
          {copyState === "copied" ? <Check size={13} /> : <Copy size={13} />} {copyState === "copied" ? "Copied" : "Copy"}
        </button>
        <a href={point130Url} target="_blank" rel="noreferrer" className="btnSecondary" style={{ display: "flex", alignItems: "center", fontSize: 12, padding: "6px 12px", textDecoration: "none" }}>
          Search 130 Point
        </a>
        <a href={ebayUrl} target="_blank" rel="noreferrer" className="btnSecondary" style={{ display: "flex", alignItems: "center", fontSize: 12, padding: "6px 12px", textDecoration: "none" }}>
          Search eBay sold
        </a>
      </div>
    </div>
  );
}

function DetailModal({ card, onClose, onUpdate, onDelete, playerLabel }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(card);

  useEffect(() => setForm(card), [card.id]);

  function startEdit() {
    setForm({
      ...card,
      rawSale1: card.rawAvg != null ? String(card.rawAvg) : "",
      rawSale2: "",
      psa9Sale1: card.psa9Avg != null ? String(card.psa9Avg) : "",
      psa9Sale2: "",
      psa10Sale1: card.psa10Avg != null ? String(card.psa10Avg) : "",
      psa10Sale2: "",
    });
    setEdit(true);
  }

  function save() {
    const today = new Date().toISOString().slice(0, 10);
    const newRawAvg = avgOfSales(form.rawSale1, form.rawSale2);
    const newPsa9Avg = avgOfSales(form.psa9Sale1, form.psa9Sale2);
    const newPsa10Avg = avgOfSales(form.psa10Sale1, form.psa10Sale2);
    onUpdate(card.id, {
      ...form,
      paid: Number(form.paid) || 0,
      shipping: Number(form.shipping) || 0,
      rawAvg: newRawAvg,
      psa9Avg: newPsa9Avg,
      psa10Avg: newPsa10Avg,
      rawHistory: appendHistoryIfChanged(card.rawHistory, card.rawAvg, newRawAvg, today),
      psa9History: appendHistoryIfChanged(card.psa9History, card.psa9Avg, newPsa9Avg, today),
      psa10History: appendHistoryIfChanged(card.psa10History, card.psa10Avg, newPsa10Avg, today),
      outOf: form.numbered && form.outOf !== "" && form.outOf != null ? Number(form.outOf) : null,
      quantity: Number(form.quantity) || 1,
      actualSellPrice: form.actualSellPrice === "" || form.actualSellPrice == null ? null : Number(form.actualSellPrice),
    });
    setEdit(false);
  }

  const style = SELL_DECISION_STYLE[card.sellDecision] || SELL_DECISION_STYLE[""];
  const listing = ["Sell Raw First", "Sell PSA 9", "Sell PSA 10"].includes(card.sellDecision) ? recommendedListing(card) : null;
  const sellMethod = listing ? suggestedSellingMethod(card, listing) : null;
  const timingCheck = listing ? seasonalSellCheck(card.sport) : null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 12, color: "#8B90A0" }}>
              {card.sport && <span style={{ marginRight: 6 }}>{SPORT_EMOJI[card.sport] || "🎴"}</span>}
              {card.card} {card.cardNum}
              {card.numbered && card.outOf ? ` /${card.outOf}` : ""}
            </div>
            <h2 className="oswald" style={{ margin: "2px 0 0", fontSize: 21 }}>
              {card.player}
              {card.rookie && (
                <span className="mono" style={{ fontSize: 11, color: "#C9A227", border: "1px solid #C9A22755", borderRadius: 4, padding: "1px 6px", marginLeft: 8, verticalAlign: "middle" }}>
                  RC
                </span>
              )}
            </h2>
          </div>
          <X size={20} style={{ cursor: "pointer", color: "#8B90A0" }} onClick={onClose} />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0 12px" }}>
          <span className="mono" style={{ display: "inline-block", fontSize: 11, padding: "3px 10px", borderRadius: 999, background: `${style.color}22`, color: style.color }}>
            {style.label} · priority {card.sellPriority}
          </span>
          {card.location && (
            <span className="mono" style={{ display: "inline-block", fontSize: 11, padding: "3px 10px", borderRadius: 999, background: `${(LOCATION_STYLE[card.location] || {}).color || "#8B90A0"}22`, color: (LOCATION_STYLE[card.location] || {}).color || "#8B90A0" }}>
              📍 {card.location}
            </span>
          )}
        </div>

        {listing && (
          <div style={{ border: "1px solid #4E8B6B55", borderRadius: 8, padding: "12px 14px", marginBottom: 16, background: "#4E8B6B0f" }}>
            <div style={{ fontSize: 11, color: "#8B90A0", textTransform: "uppercase", marginBottom: 8 }}>Recommended listing ({listing.label})</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <MiniStat label="List at" value={fmtMoney(listing.listPrice)} color="#4E8B6B" emphasis />
              <MiniStat label="Don't go below" value={fmtMoney(listing.floor)} color="#B4472E" />
            </div>
          </div>
        )}

        <SearchCopyBlock card={card} />

        {!edit ? (
          <>
            <SectionTitle>Cost basis</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              <MiniStat label="Paid" value={fmtMoney(card.paid)} />
              <MiniStat label="Shipping + holding" value={fmtMoney(card.shipping + card.holdingCost)} />
              <MiniStat label="Total cost" value={fmtMoney(card.totalCost)} />
            </div>

            <SectionTitle>Market values (60d avg)</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
              <MiniStat label="Raw" value={card.rawAvg != null ? fmtMoney(card.rawAvg) : "—"} />
              <MiniStat label="PSA 9" value={card.psa9Avg != null ? fmtMoney(card.psa9Avg) : "—"} />
              <MiniStat label="PSA 10" value={card.psa10Avg != null ? fmtMoney(card.psa10Avg) : "—"} />
            </div>

            <SectionTitle>Profitability (GGR)</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
              <MiniStat label="Raw GGR" value={card.rawGGR != null ? fmtMoney(card.rawGGR) : "—"} color={card.rawGGR >= 0 ? "#4E8B6B" : "#B4472E"} />
              <MiniStat label="PSA 9 GGR" value={card.psa9GGR != null ? fmtMoney(card.psa9GGR) : "—"} color={card.psa9GGR >= 0 ? "#4E8B6B" : "#B4472E"} />
              <MiniStat label="PSA 10 GGR" value={card.psa10GGR != null ? fmtMoney(card.psa10GGR) : "—"} color={card.psa10GGR >= 0 ? "#4E8B6B" : "#B4472E"} />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btnSecondary" onClick={startEdit}>Edit values</button>
              <button
                onClick={() => onDelete(card.id)}
                style={{ background: "transparent", border: "1px solid #4a2a24", color: "#B4472E", borderRadius: 8, padding: "9px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </>
        ) : (
          <EditForm form={form} setForm={setForm} onSave={save} onCancel={() => { setForm(card); setEdit(false); }} playerLabel={playerLabel} />
        )}
      </div>
    </div>
  );
}

function EditForm({ form, setForm, onSave, onCancel, playerLabel }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 10 }}>
        <Field label={playerLabel || "Player"}>
          <input value={form.player} onChange={(e) => setForm({ ...form, player: e.target.value })} />
        </Field>
        <Field label="Card #">
          <input value={form.cardNum || ""} onChange={(e) => setForm({ ...form, cardNum: e.target.value })} />
        </Field>
      </div>
      <Field label="Card / set">
        <input value={form.card || ""} onChange={(e) => setForm({ ...form, card: e.target.value })} />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Category">
          <select value={form.sport || "Other"} onChange={(e) => setForm({ ...form, sport: e.target.value })}>
            {SPORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Location">
          <select value={form.location || "In Hand"} onChange={(e) => setForm({ ...form, location: e.target.value })}>
            {LOCATION_OPTIONS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </Field>
      </div>
      <RookieNumberedFields form={form} setForm={setForm} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Status">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Grade (if graded)">
          <select value={form.grade || ""} onChange={(e) => setForm({ ...form, grade: e.target.value || null })}>
            <option value="">—</option>
            {GRADE_OPTIONS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px", gap: 10 }}>
        <Field label="Paid"><input type="number" step="0.01" value={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.value })} /></Field>
        <Field label="Shipping"><input type="number" step="0.01" value={form.shipping} onChange={(e) => setForm({ ...form, shipping: e.target.value })} /></Field>
        <Field label="Qty"><input type="number" min="1" step="1" value={form.quantity ?? 1} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <TierPriceInput
          label="Raw"
          sale1={form.rawSale1 ?? ""}
          sale2={form.rawSale2 ?? ""}
          onChange1={(v) => setForm({ ...form, rawSale1: v })}
          onChange2={(v) => setForm({ ...form, rawSale2: v })}
        />
        <TierPriceInput
          label="PSA 9"
          sale1={form.psa9Sale1 ?? ""}
          sale2={form.psa9Sale2 ?? ""}
          onChange1={(v) => setForm({ ...form, psa9Sale1: v })}
          onChange2={(v) => setForm({ ...form, psa9Sale2: v })}
        />
        <TierPriceInput
          label="PSA 10"
          sale1={form.psa10Sale1 ?? ""}
          sale2={form.psa10Sale2 ?? ""}
          onChange1={(v) => setForm({ ...form, psa10Sale1: v })}
          onChange2={(v) => setForm({ ...form, psa10Sale2: v })}
        />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button className="btnPrimary" onClick={onSave}>Save changes</button>
        <button className="btnSecondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

const TARGET_TIER_STYLE = {
  "Buy Now": { color: "#4E8B6B" },
  Speculative: { color: "#C9A227" },
};
const TARGET_STATUS_OPTIONS = ["Watching", "Bought", "Passed"];

const PRICE_RANGES = [
  { key: "0-100", label: "$0 - $100", min: 0, max: 100 },
  { key: "100-200", label: "$100 - $200", min: 100, max: 200 },
  { key: "200-300", label: "$200 - $300", min: 200, max: 300 },
  { key: "300-500", label: "$300 - $500", min: 300, max: 500 },
  { key: "500-800", label: "$500 - $800", min: 500, max: 800 },
  { key: "800+", label: "$800+", min: 800, max: Infinity },
];

function getTargetPrice(t) {
  const raw = Number(t.targetPriceRaw);
  const graded = Number(t.targetPriceGraded);
  if (raw > 0) return raw;
  if (graded > 0) return graded;
  return null;
}

function getPriceRange(price) {
  if (price == null) return null;
  return PRICE_RANGES.find((r) => price >= r.min && price < r.max) || PRICE_RANGES[PRICE_RANGES.length - 1];
}

function confidenceColor(score) {
  const s = Number(score) || 0;
  if (s >= 70) return "#4E8B6B";
  if (s >= 50) return "#C9A227";
  if (s >= 30) return "#D08A3E";
  return "#B4472E";
}

const CONFIDENCE_GRACE_MONTHS = 1;
const CONFIDENCE_DECAY_PER_MONTH = 5;
const CONFIDENCE_MAX_DECAY = 30;
const TREND_DECAY_MULTIPLIER = { Improving: 0.35, Stable: 1, Declining: 1.8 };
const TREND_STYLE = {
  Improving: { color: "#4E8B6B", icon: "↗" },
  Stable: { color: "#5C7A99", icon: "→" },
  Declining: { color: "#B4472E", icon: "↘" },
};

function monthsSince(dateStr) {
  if (!dateStr) return 0;
  const then = new Date(dateStr);
  const now = new Date();
  if (isNaN(then.getTime())) return 0;
  const months = (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth());
  const dayFraction = (now.getDate() - then.getDate()) / 30;
  return Math.max(0, months + dayFraction);
}

function computeConfidence(target) {
  const hasScore = target.researchScore != null || target.confidence != null;
  const base = hasScore ? Number(target.researchScore ?? target.confidence) || 0 : 30;
  const age = monthsSince(target.lastRefreshed || target.monthAdded);
  const trendMult = TREND_DECAY_MULTIPLIER[target.performanceTrend] ?? 1;
  const decay = Math.min(CONFIDENCE_MAX_DECAY, Math.max(0, (age - CONFIDENCE_GRACE_MONTHS) * CONFIDENCE_DECAY_PER_MONTH * trendMult));
  return Math.max(0, Math.round(base - decay));
}

function newTarget() {
  return {
    id: crypto.randomUUID(),
    player: "",
    sport: "NFL",
    cardToLookFor: "",
    tier: "Buy Now",
    researchScore: 50,
    performanceTrend: "Stable",
    reasoning: "",
    targetPriceRaw: "",
    targetPriceGraded: "",
    status: "Watching",
    monthAdded: new Date().toISOString().slice(0, 10),
    lastRefreshed: new Date().toISOString().slice(0, 10),
  };
}

function MonthlyTargets({ targets, setTargets }) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [justMerged, setJustMerged] = useState(null);
  const [tierFilter, setTierFilter] = useState("all");
  const [priceRangeFilter, setPriceRangeFilter] = useState("all");
  const [confirmingReset, setConfirmingReset] = useState(false);

  function addTarget(t) {
    setTargets((prev) => [t, ...prev]);
    setShowAdd(false);
  }
  function updateTarget(id, updates) {
    setTargets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }
  function deleteTarget(id) {
    setTargets((prev) => prev.filter((t) => t.id !== id));
    setSelectedId(null);
  }

  function loadNewSuggestions() {
    const today = new Date().toISOString().slice(0, 10);
    const byName = new Map(targets.map((t) => [t.player.trim().toLowerCase(), t]));
    let updatedCount = 0;
    let addedCount = 0;

    const scoped =
      priceRangeFilter === "all" || priceRangeFilter === "unpriced"
        ? SEED_TARGETS
        : SEED_TARGETS.filter((s) => getPriceRange(getTargetPrice(s))?.key === priceRangeFilter);

    const refreshed = targets.map((t) => {
      const match = scoped.find((s) => s.player.trim().toLowerCase() === t.player.trim().toLowerCase());
      if (!match) return t;
      const changed =
        t.researchScore !== match.researchScore ||
        t.performanceTrend !== match.performanceTrend ||
        t.reasoning !== match.reasoning ||
        t.cardToLookFor !== match.cardToLookFor ||
        t.tier !== match.tier;
      if (!changed) return t;
      updatedCount++;
      return {
        ...t,
        researchScore: match.researchScore,
        performanceTrend: match.performanceTrend,
        reasoning: match.reasoning,
        cardToLookFor: match.cardToLookFor,
        tier: match.tier,
        sport: match.sport,
        lastRefreshed: today,
      };
    });

    const toAdd = scoped.filter((s) => !byName.has(s.player.trim().toLowerCase())).map((s) => ({
      ...s,
      id: crypto.randomUUID(),
      monthAdded: today,
      lastRefreshed: today,
    }));
    addedCount = toAdd.length;

    setTargets([...toAdd, ...refreshed]);
    setJustMerged({ added: addedCount, updated: updatedCount });
    setTimeout(() => setJustMerged(null), 4000);
  }

  function hardReset() {
    const today = new Date().toISOString().slice(0, 10);
    setTargets(SEED_TARGETS.map((t) => ({ ...t, id: crypto.randomUUID(), monthAdded: today, lastRefreshed: today })));
    setJustMerged({ added: SEED_TARGETS.length, updated: 0 });
    setConfirmingReset(false);
    setTimeout(() => setJustMerged(null), 4000);
  }

  const watching = targets.filter((t) => t.status === "Watching").length;
  const bought = targets.filter((t) => t.status === "Bought").length;
  const selected = selectedId ? targets.find((t) => t.id === selectedId) : null;
  const avgConfidence = targets.length
    ? Math.round(targets.reduce((s, t) => s + computeConfidence(t), 0) / targets.length)
    : null;

  const visible = useMemo(() => {
    let list = targets;
    if (tierFilter !== "all") list = list.filter((t) => t.tier === tierFilter);
    if (priceRangeFilter === "unpriced") {
      list = list.filter((t) => getTargetPrice(t) == null);
    } else if (priceRangeFilter !== "all") {
      list = list.filter((t) => getPriceRange(getTargetPrice(t))?.key === priceRangeFilter);
    }
    return [...list].sort((a, b) => computeConfidence(b) - computeConfidence(a));
  }, [targets, tierFilter, priceRangeFilter]);

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1, background: "#2C303B", border: "1px solid #2C303B", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
        <Stat label="Watching" value={watching} color="#5C7A99" />
        <Stat label="Bought" value={bought} color="#4E8B6B" />
        <Stat label="Total on list" value={targets.length} />
        <Stat label="Avg confidence" value={avgConfidence != null ? avgConfidence : "—"} color={avgConfidence != null ? confidenceColor(avgConfidence) : undefined} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", marginBottom: 4 }}>Tier</label>
            <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} style={{ width: "auto", minWidth: 160 }}>
              <option value="all">All tiers</option>
              <option value="Buy Now">Buy Now</option>
              <option value="Speculative">Speculative</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 4 }}>Price range</label>
            <select value={priceRangeFilter} onChange={(e) => setPriceRangeFilter(e.target.value)} style={{ width: "auto", minWidth: 160 }}>
              <option value="all">All prices</option>
              {PRICE_RANGES.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
              <option value="unpriced">No price set</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btnSecondary" onClick={loadNewSuggestions}>
            <RefreshCw size={14} style={{ marginRight: 6 }} /> Refresh research
          </button>
          <button className="btnPrimary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add target
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div style={{ padding: "3rem 0", textAlign: "center", color: "#5C6270", border: "1px solid #2C303B", borderRadius: 10 }}>
          No targets match this filter.
        </div>
      ) : (
        <div style={{ border: "1px solid #2C303B", borderRadius: 10, overflow: "hidden" }}>
          {visible.map((t) => (
            <TargetRow key={t.id} t={t} onClick={() => setSelectedId(t.id)} />
          ))}
        </div>
      )}

      {showAdd && <TargetModal onClose={() => setShowAdd(false)} onSave={addTarget} />}
      {selected && <TargetDetailModal target={selected} onUpdate={updateTarget} onDelete={deleteTarget} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

function cleanCardHint(text) {
  if (!text) return "";
  return text.split(/[—(,]/)[0].trim();
}

function TargetRow({ t, onClick }) {
  const tierStyle = TARGET_TIER_STYLE[t.tier] || TARGET_TIER_STYLE["Buy Now"];
  const statusColor = t.status === "Bought" ? "#4E8B6B" : t.status === "Passed" ? "#5C6270" : "#5C7A99";
  const score = computeConfidence(t);
  const confColor = confidenceColor(score);
  const [copyState, setCopyState] = useState("idle");
  const priceRange = getPriceRange(getTargetPrice(t));

  const searchText = [t.player.replace(/["\u201c\u201d]/g, "").trim(), cleanCardHint(t.cardToLookFor)].filter(Boolean).join(" ");
  const ebayUrl = `https://www.ebay.com.au/sch/i.html?_nkw=${encodeURIComponent(searchText)}`;

  async function copy(e) {
    e.stopPropagation();
    const ok = await copyToClipboard(searchText);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => setCopyState("idle"), 2000);
  }

  return (
    <div
      onClick={onClick}
      className="cardRow"
      style={{ padding: "14px 16px", borderTop: "1px solid #24272F", borderLeft: `4px solid ${confColor}`, cursor: "pointer", fontSize: 13 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 10,
              background: `${confColor}1f`,
              border: `1.5px solid ${confColor}`,
              flexShrink: 0,
            }}
          >
            <span className="oswald" style={{ fontSize: 17, fontWeight: 700, color: confColor, lineHeight: 1 }}>
              {score}
            </span>
            <span className="mono" style={{ fontSize: 7.5, color: confColor, letterSpacing: "0.04em" }}>SCORE</span>
          </div>
          <div>
            <span className="oswald" style={{ fontWeight: 600, fontSize: 15 }}>{t.player}</span>
            <span className="mono" style={{ fontSize: 10, color: "#6B7180", marginLeft: 8 }}>{SPORT_EMOJI[t.sport] || "🎴"} {t.sport}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <span className="mono" style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: `${tierStyle.color}22`, color: tierStyle.color }}>
            {t.tier}
          </span>
          <ChevronRight size={14} style={{ color: "#5C6270" }} />
        </div>
      </div>
    </div>
  );
}

function TargetModal({ onClose, onSave }) {
  const [form, setForm] = useState(newTarget());

  function submit(e) {
    e.preventDefault();
    if (!form.player.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    onSave({
      ...form,
      researchScore: form.tier === "Buy Now" ? 45 : 25,
      monthAdded: today,
      lastRefreshed: today,
    });
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title="Add a target" onClose={onClose} />
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10 }}>
            <Field label="Player">
              <input value={form.player} onChange={(e) => setForm({ ...form, player: e.target.value })} required />
            </Field>
            <Field label="Category">
              <select value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })}>
                {SPORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Card to look for">
            <input value={form.cardToLookFor} onChange={(e) => setForm({ ...form, cardToLookFor: e.target.value })} />
          </Field>
          <button className="btnPrimary" type="submit" style={{ justifyContent: "center", marginTop: 6 }}>
            Add to watchlist
          </button>
        </form>
      </div>
    </div>
  );
}

function TargetDetailModal({ target, onUpdate, onDelete, onClose }) {
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title={target.player} onClose={onClose} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Card to look for">
            <input value={target.cardToLookFor} onChange={(e) => onUpdate(target.id, { cardToLookFor: e.target.value })} />
          </Field>
          <button
            onClick={() => { onDelete(target.id); onClose(); }}
            style={{ background: "transparent", border: "1px solid #4a2a24", color: "#B4472E", borderRadius: 8, padding: "9px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <Trash2 size={14} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function SellingPlaybook() {
  return (
    <div style={{ marginTop: 24 }}>
      <SectionTitle>Selling Playbook</SectionTitle>
      <div style={{ color: "#8B90A0", fontSize: 13 }}>
        Review fee structures and recommended platforms for selling cards based on vault location and value.
      </div>
    </div>
  );
}

const CONTENT_PILLARS = ["Pack & Box Openings", "Budget-Friendly Investing", "Rookie Card Spotlights", "Sell/Flip Update", "Grading & Raw Tips", "Behind the Scenes"];
const CONTENT_PLATFORMS = ["YouTube (long-form)", "YouTube Shorts", "TikTok", "Instagram", "Multiple"];
const CONTENT_STATUS = ["Idea", "Scripted", "Filmed", "Edited", "Posted"];
const CONTENT_STATUS_COLOR = { Idea: "#5C7A99", Scripted: "#C9A227", Filmed: "#8B6FD6", Edited: "#2FA89A", Posted: "#4E8B6B" };

function newContentItem(idea) {
  return {
    id: crypto.randomUUID(),
    title: idea?.title || "",
    platform: idea?.platform || "YouTube (long-form)",
    pillar: idea?.pillar || "Budget-Friendly Investing",
    status: "Idea",
    hook: idea?.hook || "",
    notes: idea?.outline ? idea.outline.join("\n") : "",
    dateAdded: new Date().toISOString().slice(0, 10),
  };
}
