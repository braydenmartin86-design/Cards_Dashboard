const { useState, useEffect, useMemo } = React;

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

const SEED_CARDS = [{"player": "Amen Thompson", "card": "Prizm RC Luck OT Lottery", "cardNum": "#12", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.4, "shipping": 1.48, "feesPct": 0.137, "rawAvg": 9.29, "psa9Avg": 43.2, "psa10Avg": 16.09, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 9.29}], "psa9History": [{"date": "2026-08-07", "value": 43.2}], "psa10History": [{"date": "2026-08-07", "value": 16.09}]}, {"player": "Jaren Jackson Jr", "card": "2018-19 Prizm Phenoms Silver", "cardNum": "#22", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 1.9, "shipping": 1.47, "feesPct": 0.137, "rawAvg": 4.29, "psa9Avg": 9.66, "psa10Avg": 23.03, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.29}], "psa9History": [{"date": "2026-08-07", "value": 9.66}], "psa10History": [{"date": "2026-08-07", "value": 23.03}]}, {"player": "Jonathan Kuminga", "card": "2021-22 Obsidian Base", "cardNum": "#157", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 10.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 17.46, "psa9Avg": 15.6, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 17.46}], "psa9History": [{"date": "2026-08-07", "value": 15.6}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Scoot Henderson", "card": "Prizm Monopoly Purple Wave", "cardNum": "#75", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 1.49, "shipping": 0.7, "feesPct": 0.137, "rawAvg": 8.09, "psa9Avg": 8.2, "psa10Avg": 16.45, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 8.09}], "psa9History": [{"date": "2026-08-07", "value": 8.2}], "psa10History": [{"date": "2026-08-07", "value": 16.45}]}, {"player": "Trevor Lawrence", "card": "Donruss RC Elite Series", "cardNum": "#ESR-TRL", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 3.34, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 25.26, "psa9Avg": 18.57, "psa10Avg": 28.23, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 25.26}], "psa9History": [{"date": "2026-08-07", "value": 18.57}], "psa10History": [{"date": "2026-08-07", "value": 28.23}]}, {"player": "Dylan Harper", "card": "2025-26 Topps Chrome Instinct Aqua /199", "cardNum": "#INS-12", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 38.57, "shipping": 7.79, "feesPct": 0.137, "rawAvg": 61.11, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": true, "outOf": 199, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 61.11}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Alex Rodriguez", "card": "Donruss Bomb Squad Blue", "cardNum": "#BS1", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 7.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 14.89, "psa9Avg": 0.0, "psa10Avg": 67.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 14.89}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 67.0}]}, {"player": "Bijan Robinson", "card": "2023 Rated Rookie Purple", "cardNum": "#206", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 10.86, "psa9Avg": 24.67, "psa10Avg": 77.62, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 10.86}], "psa9History": [{"date": "2026-08-07", "value": 24.67}], "psa10History": [{"date": "2026-08-07", "value": 77.62}]}, {"player": "Bijan Robinson", "card": "2023 Pheonix Contours", "cardNum": "#CON-18", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 7.43, "psa9Avg": 20.1, "psa10Avg": 67.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 7.43}], "psa9History": [{"date": "2026-08-07", "value": 20.1}], "psa10History": [{"date": "2026-08-07", "value": 67.0}]}, {"player": "Jarrett Allen", "card": "2017 Prizm Hyper Silver", "cardNum": "#154", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 4.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 8.94, "psa9Avg": 15.02, "psa10Avg": 77.49, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 8.94}], "psa9History": [{"date": "2026-08-07", "value": 15.02}], "psa10History": [{"date": "2026-08-07", "value": 77.49}]}, {"player": "James Wood", "card": "2025 Topps Cosmic Chrome - Nucleus Refractor", "cardNum": "#1", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 12.45, "shipping": 10.91, "feesPct": 0.137, "rawAvg": 39.97, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 39.97}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Jahmyr Gibbs", "card": "2023 Pheonix Contours", "cardNum": "#CON-08", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 16.33, "psa9Avg": 44.57, "psa10Avg": 72.8, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 16.33}], "psa9History": [{"date": "2026-08-07", "value": 44.57}], "psa10History": [{"date": "2026-08-07", "value": 72.8}]}, {"player": "Cade Cunningham", "card": "2020-21 Spectra Asia Red", "cardNum": "#102", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 20.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 23.02, "psa9Avg": 46.06, "psa10Avg": 98.04, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 23.02}], "psa9History": [{"date": "2026-08-07", "value": 46.06}], "psa10History": [{"date": "2026-08-07", "value": 98.04}]}, {"player": "Will Levis", "card": "2023 Spectra Infrared  /50", "cardNum": "#I-WL", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 10.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 11.87, "psa9Avg": 32.69, "psa10Avg": 89.14, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": true, "outOf": 50, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 11.87}], "psa9History": [{"date": "2026-08-07", "value": 32.69}], "psa10History": [{"date": "2026-08-07", "value": 89.14}]}, {"player": "Jabari Smith Jr.", "card": "2022-23 Optic Purple Shock", "cardNum": "#240", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 2.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 4.44, "psa9Avg": 52.0, "psa10Avg": 74.29, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.44}], "psa9History": [{"date": "2026-08-07", "value": 52.0}], "psa10History": [{"date": "2026-08-07", "value": 74.29}]}, {"player": "Ja Morant", "card": "2019-20 (Young Dolph) RC", "cardNum": "#116", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 54.78, "psa9Avg": 115.0, "psa10Avg": 304.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 54.78}], "psa9History": [{"date": "2026-08-07", "value": 115.0}], "psa10History": [{"date": "2026-08-07", "value": 304.0}]}, {"player": "Shai Gilgeous-Alexander", "card": "2019-20 Optic Uniformity Red", "cardNum": "#9", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 23.03, "psa9Avg": 50.0, "psa10Avg": 177.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 23.03}], "psa9History": [{"date": "2026-08-07", "value": 50.0}], "psa10History": [{"date": "2026-08-07", "value": 177.0}]}, {"player": "O'Neil Cruz", "card": "2022 Bowman Chrome Sapphire Orange /75", "cardNum": "#Q4359", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 27.59, "shipping": 1.1, "feesPct": 0.137, "rawAvg": 28.689999999999998, "psa9Avg": 100.0, "psa10Avg": 174.0, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": true, "outOf": 75, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 28.689999999999998}], "psa9History": [{"date": "2026-08-07", "value": 100.0}], "psa10History": [{"date": "2026-08-07", "value": 174.0}]}, {"player": "Michael Jordan", "card": "1991-92 Upper Deck Base", "cardNum": "#44", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 1.47, "shipping": 1.85, "feesPct": 0.137, "rawAvg": 2.97, "psa9Avg": 52.0, "psa10Avg": 131.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.97}], "psa9History": [{"date": "2026-08-07", "value": 52.0}], "psa10History": [{"date": "2026-08-07", "value": 131.0}]}, {"player": "Jayson Tatum", "card": "2017-18 Status Base", "cardNum": "#128", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 8.99, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 14.53, "psa9Avg": 43.21, "psa10Avg": 109.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 14.53}], "psa9History": [{"date": "2026-08-07", "value": 43.21}], "psa10History": [{"date": "2026-08-07", "value": 109.0}]}, {"player": "Jalen Williams", "card": "2022-23 Optic Purple Shock", "cardNum": "#235", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 2.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 14.86, "psa9Avg": 23.77, "psa10Avg": 98.06, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 14.86}], "psa9History": [{"date": "2026-08-07", "value": 23.77}], "psa10History": [{"date": "2026-08-07", "value": 98.06}]}, {"player": "Paul Skenes", "card": "Bowman Chrome Mojo", "cardNum": "#BCP-125", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 13.38, "shipping": 1.85, "feesPct": 0.137, "rawAvg": 15.22, "psa9Avg": 50.31, "psa10Avg": 125.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 15.22}], "psa9History": [{"date": "2026-08-07", "value": 50.31}], "psa10History": [{"date": "2026-08-07", "value": 125.0}]}, {"player": "Tom Aspinall", "card": "2022 Prizm Silver", "cardNum": "#134", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 35.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 4.83, "psa9Avg": 43.09, "psa10Avg": 197.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MMA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.83}], "psa9History": [{"date": "2026-08-07", "value": 43.09}], "psa10History": [{"date": "2026-08-07", "value": 197.0}]}, {"player": "Aaron Judge", "card": "2022 Topps Now", "cardNum": "", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 8.41, "shipping": 4.44, "feesPct": 0.137, "rawAvg": 13.33, "psa9Avg": 26.06, "psa10Avg": 107.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 13.33}], "psa9History": [{"date": "2026-08-07", "value": 26.06}], "psa10History": [{"date": "2026-08-07", "value": 107.0}]}, {"player": "Bobby Witt Jr.", "card": "Topps Chrome Debut", "cardNum": "#USC176", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 6.99, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 5.4, "psa9Avg": 21.92, "psa10Avg": 92.61, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 5.4}], "psa9History": [{"date": "2026-08-07", "value": 21.92}], "psa10History": [{"date": "2026-08-07", "value": 92.61}]}, {"player": "Jalen Duren", "card": "NBA Hoops Purple", "cardNum": "#243", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 2.5, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 1.48, "psa9Avg": 0.0, "psa10Avg": 86.43, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.48}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 86.43}]}, {"player": "Josh Giddey", "card": "Prizm RC Fast Break", "cardNum": "#301", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 4.5, "feesPct": 0.137, "rawAvg": 8.46, "psa9Avg": 23.84, "psa10Avg": 81.96, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 8.46}], "psa9History": [{"date": "2026-08-07", "value": 23.84}], "psa10History": [{"date": "2026-08-07", "value": 81.96}]}, {"player": "Lebron & Bronny Jr", "card": "2024-25 Topps NOW Father Son Debut", "cardNum": "#10", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 18.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 4.09, "psa9Avg": 29.71, "psa10Avg": 89.14, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.09}], "psa9History": [{"date": "2026-08-07", "value": 29.71}], "psa10History": [{"date": "2026-08-07", "value": 89.14}]}, {"player": "Bo Bichette", "card": "2020 Bowman Chrome", "cardNum": "#50", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 9", "paid": 9.73, "shipping": 7.47, "feesPct": 0.137, "rawAvg": null, "psa9Avg": 14.11, "psa10Avg": null, "gradingService": null, "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [{"date": "2026-08-07", "value": 14.11}], "psa10History": []}, {"player": "Chris Paul", "card": "Topps Draft Night", "cardNum": "#224", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 9", "paid": 8.9, "shipping": 2.23, "feesPct": 0.137, "rawAvg": null, "psa9Avg": 26.58, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [{"date": "2026-08-07", "value": 26.58}], "psa10History": []}, {"player": "Magic Johnson", "card": "2019-20 Green Prizm", "cardNum": "", "rookie": false, "shipMyCards": "No", "status": "Graded", "grade": "SGC 9", "paid": 30.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": 21.36, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [{"date": "2026-08-07", "value": 21.36}], "psa10History": []}, {"player": "Paige Buekcers", "card": "Bowman Chrome U 1st", "cardNum": "#90", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 9", "paid": 8.42, "shipping": 6.8, "feesPct": 0.137, "rawAvg": null, "psa9Avg": 47.7, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "WNBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [{"date": "2026-08-07", "value": 47.7}], "psa10History": []}, {"player": "Ronald Acuna Jr", "card": "2018 Topps Debut", "cardNum": "#US250", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "BGS 9.5", "paid": 12.2, "shipping": 8.9, "feesPct": 0.137, "rawAvg": null, "psa9Avg": 25.39, "psa10Avg": 56.7, "gradingService": null, "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [{"date": "2026-08-07", "value": 25.39}], "psa10History": [{"date": "2026-08-07", "value": 56.7}]}, {"player": "Brock Purdy", "card": "2022 Prizm Base", "cardNum": "#353", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "SGC 10", "paid": 67.0, "shipping": 8.89, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": 98.36, "gradingService": null, "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": [{"date": "2026-08-07", "value": 98.36}]}, {"player": "DeAndre Ayton", "card": "2018-19 Panini Prizm", "cardNum": "", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 10", "paid": 11.91, "shipping": 7.4, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": 10.93, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": [{"date": "2026-08-07", "value": 10.93}]}, {"player": "Elly De La Cruz", "card": "2024 Topps Heritage", "cardNum": "#473", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 10", "paid": 37.0, "shipping": 7.4, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": 70.4, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": [{"date": "2026-08-07", "value": 70.4}]}, {"player": "Joe Burrow", "card": "2020 Select Concourse Base", "cardNum": "#46", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 10", "paid": 42.97, "shipping": 8.89, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": 50.06, "gradingService": null, "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": [{"date": "2026-08-07", "value": 50.06}]}, {"player": "Justin Jefferson", "card": "2020 Mosiac Base", "cardNum": "#209", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 10", "paid": 63.0, "shipping": 7.4, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": 61.83, "gradingService": null, "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": [{"date": "2026-08-07", "value": 61.83}]}, {"player": "Lonzo Ball", "card": "2017-18 Optic Rated Rookie", "cardNum": "", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 10", "paid": 14.86, "shipping": 7.42, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": 22.21, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": [{"date": "2026-08-07", "value": 22.21}]}, {"player": "OG Anunoby", "card": "2017 Optic Rated Rookie Holo", "cardNum": "#178", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 10", "paid": 36.25, "shipping": 12.69, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": 70.94, "gradingService": null, "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": [{"date": "2026-08-07", "value": 70.94}]}, {"player": "Darius Garland", "card": "2019-20 Rookies & Stars", "cardNum": "#687", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 1.47, "psa9Avg": 0.0, "psa10Avg": 14.86, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.47}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 14.86}]}, {"player": "Derek Lively", "card": "Prizm Base", "cardNum": "#163", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 4.36, "psa9Avg": 13.09, "psa10Avg": 19.17, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.36}], "psa9History": [{"date": "2026-08-07", "value": 13.09}], "psa10History": [{"date": "2026-08-07", "value": 19.17}]}, {"player": "Ian Garry", "card": "2023 Prizm On The Horizon", "cardNum": "#OTH-IG", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 55.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 59.55, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MMA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 59.55}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Ja Morant", "card": "2019-20 Essentials", "cardNum": "#230", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 2.96, "psa9Avg": 10.46, "psa10Avg": 25.26, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.96}], "psa9History": [{"date": "2026-08-07", "value": 10.46}], "psa10History": [{"date": "2026-08-07", "value": 25.26}]}, {"player": "Ja Morant", "card": "2019-20 XR", "cardNum": "#272", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 2.23, "psa9Avg": 9.2, "psa10Avg": 30.46, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.23}], "psa9History": [{"date": "2026-08-07", "value": 9.2}], "psa10History": [{"date": "2026-08-07", "value": 30.46}]}, {"player": "Jalen Green", "card": "2021 Prizm Base", "cardNum": "#306", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 4.16, "psa9Avg": 13.89, "psa10Avg": 21.46, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.16}], "psa9History": [{"date": "2026-08-07", "value": 13.89}], "psa10History": [{"date": "2026-08-07", "value": 21.46}]}, {"player": "Jalen Green", "card": "2021 Select Concourse Blue", "cardNum": "#7", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 1.48, "psa9Avg": 16.39, "psa10Avg": 25.08, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.48}], "psa9History": [{"date": "2026-08-07", "value": 16.39}], "psa10History": [{"date": "2026-08-07", "value": 25.08}]}, {"player": "Paolo Banchero", "card": "2024-25 Revolution Signatures AUTO", "cardNum": "#RS-PBR", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 120.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 132.0, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 132.0}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Ronald Acuna Jr", "card": "Topps 1953 Living Set", "cardNum": "#19", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 12.2, "shipping": 1.41, "feesPct": 0.137, "rawAvg": 19.26, "psa9Avg": 0.0, "psa10Avg": 59.5, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 19.26}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 59.5}]}, {"player": "Tyrese Haliburton", "card": "2020 Draft Class Contenders", "cardNum": "#21", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 2.66, "psa9Avg": 0.0, "psa10Avg": 20.06, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.66}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 20.06}]}, {"player": "Victor Wembanyama", "card": "2024 Top Class", "cardNum": "#179", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 1.86, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.86}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Brock Purdy", "card": "2023 Wild Card Alumination Comix /50", "cardNum": "#AC-BP", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 24.0, "shipping": 6.69, "feesPct": 0.137, "rawAvg": 37.14, "psa9Avg": null, "psa10Avg": 81.26, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": true, "outOf": 50, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 37.14}], "psa9History": [], "psa10History": [{"date": "2026-08-07", "value": 81.26}]}, {"player": "Cameron Brinks", "card": "2024 Select Concourse", "cardNum": "#56", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 3.0, "shipping": 1.85, "feesPct": 0.137, "rawAvg": 3.28, "psa9Avg": 13.45, "psa10Avg": 64.62, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "WNBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 3.28}], "psa9History": [{"date": "2026-08-07", "value": 13.45}], "psa10History": [{"date": "2026-08-07", "value": 64.62}]}, {"player": "Dyson Daniels", "card": "2022 Donruss Optic", "cardNum": "#250", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 2.18, "psa9Avg": 74.27, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.18}], "psa9History": [{"date": "2026-08-07", "value": 74.27}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Francis Ngannou", "card": "Select Scope SP", "cardNum": "#120", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 9.7, "shipping": 6.0, "feesPct": 0.137, "rawAvg": 11.91, "psa9Avg": null, "psa10Avg": 74.51, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MMA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 11.91}], "psa9History": [], "psa10History": [{"date": "2026-08-07", "value": 74.51}]}, {"player": "Jalen Hurts", "card": "2020 Select Concourse Silver", "cardNum": "#50", "rookie": true, "shipMyCards": "Yes", "status": "Graded", "grade": "PSA 9", "paid": 76.3, "shipping": 13.74, "feesPct": 0.137, "rawAvg": null, "psa9Avg": 31.94, "psa10Avg": null, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [{"date": "2026-08-07", "value": 31.94}], "psa10History": []}, {"player": "Ja'Marr Chase", "card": "2021 Select Diecut Silver", "cardNum": "#47", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 15.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 11.33, "psa9Avg": 22.29, "psa10Avg": 74.21, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 11.33}], "psa9History": [{"date": "2026-08-07", "value": 22.29}], "psa10History": [{"date": "2026-08-07", "value": 74.21}]}, {"player": "Jaxon Smith-Njigba", "card": "Silver RC Prizm Patch", "cardNum": "#RG-JS", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 7.35, "shipping": 1.47, "feesPct": 0.137, "rawAvg": 12.24, "psa9Avg": 29.8, "psa10Avg": 74.51, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 12.24}], "psa9History": [{"date": "2026-08-07", "value": 29.8}], "psa10History": [{"date": "2026-08-07", "value": 74.51}]}, {"player": "Mike Trout", "card": "2022 Donruss Bomb Squad", "cardNum": "#BS-8", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 7.43, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 6.69, "psa9Avg": 26.0, "psa10Avg": 68.34, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 6.69}], "psa9History": [{"date": "2026-08-07", "value": 26.0}], "psa10History": [{"date": "2026-08-07", "value": 68.34}]}, {"player": "Rashee Rice", "card": "2023 Prizm Silver", "cardNum": "#350", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 4.8, "shipping": 5.96, "feesPct": 0.137, "rawAvg": 11.45, "psa9Avg": 21.61, "psa10Avg": 74.51, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 11.45}], "psa9History": [{"date": "2026-08-07", "value": 21.61}], "psa10History": [{"date": "2026-08-07", "value": 74.51}]}, {"player": "Victor Wembanyama", "card": "Select Concourse Blue", "cardNum": "#87", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 30.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 8.95, "psa9Avg": 30.01, "psa10Avg": 83.64, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 8.95}], "psa9History": [{"date": "2026-08-07", "value": 30.01}], "psa10History": [{"date": "2026-08-07", "value": 83.64}]}, {"player": "Alexander Volkanovski", "card": "2025 1955 Green Geo /75", "cardNum": "", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 11.92, "shipping": 2.23, "feesPct": 0.137, "rawAvg": 14.84, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MMA", "location": "In Hand", "numbered": true, "outOf": 75, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 14.84}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Anthony Richardson", "card": "Prizm Break Silver", "cardNum": "", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 5.95, "shipping": 1.85, "feesPct": 0.137, "rawAvg": 1.47, "psa9Avg": 8.17, "psa10Avg": 22.29, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.47}], "psa9History": [{"date": "2026-08-07", "value": 8.17}], "psa10History": [{"date": "2026-08-07", "value": 22.29}]}, {"player": "Anthony Richardson", "card": "Rookies & Stars Airbourne Silver", "cardNum": "", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 4.8, "shipping": 3.13, "feesPct": 0.137, "rawAvg": 8.91, "psa9Avg": 14.87, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 8.91}], "psa9History": [{"date": "2026-08-07", "value": 14.87}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Bam Adebayo", "card": "2017-18 Rated Rookie", "cardNum": "", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 26.0, "shipping": 3.3, "feesPct": 0.137, "rawAvg": 5.78, "psa9Avg": 8.17, "psa10Avg": 11.24, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 5.78}], "psa9History": [{"date": "2026-08-07", "value": 8.17}], "psa10History": [{"date": "2026-08-07", "value": 11.24}]}, {"player": "Bryce Young", "card": "Prizm Break Green", "cardNum": "#PB-3", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 3.55, "shipping": 1.85, "feesPct": 0.137, "rawAvg": 4.26, "psa9Avg": 19.31, "psa10Avg": 28.97, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.26}], "psa9History": [{"date": "2026-08-07", "value": 19.31}], "psa10History": [{"date": "2026-08-07", "value": 28.97}]}, {"player": "Cam Reddish", "card": "2019 Draft Lottery Ticket", "cardNum": "#10", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 3.0, "shipping": 4.4, "feesPct": 0.137, "rawAvg": 2.96, "psa9Avg": 0.0, "psa10Avg": 8.91, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.96}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 8.91}]}, {"player": "Cameron Thomas", "card": "Rated Rookie Purple", "cardNum": "#153", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 1.47, "psa9Avg": 26.74, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.47}], "psa9History": [{"date": "2026-08-07", "value": 26.74}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Chet Holmegren", "card": "Select Concourse Silver", "cardNum": "#83", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 13.5, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 4.47, "psa9Avg": 28.33, "psa10Avg": 49.17, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.47}], "psa9History": [{"date": "2026-08-07", "value": 28.33}], "psa10History": [{"date": "2026-08-07", "value": 49.17}]}, {"player": "CJ McCollum", "card": "2021-22 Revolution AUTO", "cardNum": "#AG-CJM", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 75.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 7.41, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 7.41}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "CJ Stroud", "card": "Select RC Retail Blue", "cardNum": "#2", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 3.7, "shipping": 1.85, "feesPct": 0.137, "rawAvg": 2.48, "psa9Avg": 29.79, "psa10Avg": 30.76, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.48}], "psa9History": [{"date": "2026-08-07", "value": 29.79}], "psa10History": [{"date": "2026-08-07", "value": 30.76}]}, {"player": "Giannis Antetokounmpo", "card": "2021-22 Prizm Cracked Ice", "cardNum": "#1", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 2.9, "shipping": 1.02, "feesPct": 0.137, "rawAvg": 5.94, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 5.94}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Grant Williams", "card": "2020 Fresh Paint AUTO RC", "cardNum": "#FP-GWI", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 25.0, "shipping": 6.6, "feesPct": 0.137, "rawAvg": 11.18, "psa9Avg": 24.34, "psa10Avg": 41.6, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 11.18}], "psa9History": [{"date": "2026-08-07", "value": 24.34}], "psa10History": [{"date": "2026-08-07", "value": 41.6}]}, {"player": "Islam Makhachev", "card": "2022 Select Swatches Silver Prizm", "cardNum": "#SS-IMK", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 22.34, "shipping": 5.96, "feesPct": 0.137, "rawAvg": 22.27, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MMA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 22.27}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Jaden Ivey", "card": "Luck of the Lottery Silver", "cardNum": "#5", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 0.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 1.48, "psa9Avg": 22.34, "psa10Avg": 18.18, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.48}], "psa9History": [{"date": "2026-08-07", "value": 22.34}], "psa10History": [{"date": "2026-08-07", "value": 18.18}]}, {"player": "James Cook", "card": "2022 NFL Debut Silver", "cardNum": "#285", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 2.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 6.21, "psa9Avg": 26.73, "psa10Avg": 43.09, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 6.21}], "psa9History": [{"date": "2026-08-07", "value": 26.73}], "psa10History": [{"date": "2026-08-07", "value": 43.09}]}, {"player": "Jaren Jackson Jr", "card": "Select Die-Cut Premier Level", "cardNum": "#132", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 15.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 10.4, "psa9Avg": 29.0, "psa10Avg": 56.46, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 10.4}], "psa9History": [{"date": "2026-08-07", "value": 29.0}], "psa10History": [{"date": "2026-08-07", "value": 56.46}]}, {"player": "Jarrod Goff", "card": "2023 Donruss Elite Orange /399", "cardNum": "#48", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 2.97, "shipping": 1.96, "feesPct": 0.137, "rawAvg": 2.96, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": true, "outOf": 399, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.96}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Kyle Filipowski", "card": "Bowman 1st RC", "cardNum": "", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 1.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 0.0, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 0.0}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Lamelo Ball", "card": "Prizm Base RC", "cardNum": "#278", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 8.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 3.45, "psa9Avg": 13.25, "psa10Avg": 37.38, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 3.45}], "psa9History": [{"date": "2026-08-07", "value": 13.25}], "psa10History": [{"date": "2026-08-07", "value": 37.38}]}, {"player": "Lonzo Ball", "card": "2017-18 Status Base", "cardNum": "", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 2.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 1.47, "psa9Avg": 13.37, "psa10Avg": 22.29, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.47}], "psa9History": [{"date": "2026-08-07", "value": 13.37}], "psa10History": [{"date": "2026-08-07", "value": 22.29}]}, {"player": "Malik Willis", "card": "Silver RC Prizm Patch", "cardNum": "#RG-MW", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 8.6, "shipping": 1.85, "feesPct": 0.137, "rawAvg": 1.46, "psa9Avg": 4.46, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.46}], "psa9History": [{"date": "2026-08-07", "value": 4.46}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Micah Parsons", "card": "2024 Prizm White Patch /75", "cardNum": "#SMPS", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 30.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 7.43, "psa9Avg": 30.46, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": true, "outOf": 75, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 7.43}], "psa9History": [{"date": "2026-08-07", "value": 30.46}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Mikal Bridges", "card": "2018-19 Status RC", "cardNum": "#144", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 2.96, "psa9Avg": 0.0, "psa10Avg": 44.56, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.96}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 44.56}]}, {"player": "Pablo Guerrero", "card": "2024 1st Bowman Chrome Auto", "cardNum": "#CPA-PG", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 13.79, "shipping": 0.8, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Paolo Banchero", "card": "2022-23 Optic Rated Rookie (x2)", "cardNum": "#221", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 3.73, "psa9Avg": 17.88, "psa10Avg": 44.63, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 3.73}], "psa9History": [{"date": "2026-08-07", "value": 17.88}], "psa10History": [{"date": "2026-08-07", "value": 44.63}]}, {"player": "Scoot Henderson", "card": "2023 Prizm Emergent Silver", "cardNum": "", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 1.67, "shipping": 1.85, "feesPct": 0.137, "rawAvg": 2.5, "psa9Avg": 8.17, "psa10Avg": 13.37, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.5}], "psa9History": [{"date": "2026-08-07", "value": 8.17}], "psa10History": [{"date": "2026-08-07", "value": 13.37}]}, {"player": "Scoot Henderson", "card": "Prizm Monopoly Base", "cardNum": "#75", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 1.45, "shipping": 0.7, "feesPct": 0.137, "rawAvg": 1.07, "psa9Avg": 1.47, "psa10Avg": 15.72, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 1.07}], "psa9History": [{"date": "2026-08-07", "value": 1.47}], "psa10History": [{"date": "2026-08-07", "value": 15.72}]}, {"player": "Stephen Curry", "card": "2023-24 Revolution Groove", "cardNum": "#65", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 2.61, "shipping": 1.25, "feesPct": 0.137, "rawAvg": 4.46, "psa9Avg": 36.24, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 4.46}], "psa9History": [{"date": "2026-08-07", "value": 36.24}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Travis Kelce", "card": "2020 Limited /75", "cardNum": "#3", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 10.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 6.76, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": true, "outOf": 75, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 6.76}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Tyrese Maxey", "card": "2020 Mosaic Debut Silver", "cardNum": "#203", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 6.9, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 6.47, "psa9Avg": 19.44, "psa10Avg": 37.24, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 6.47}], "psa9History": [{"date": "2026-08-07", "value": 19.44}], "psa10History": [{"date": "2026-08-07", "value": 37.24}]}, {"player": "Victor Wembanyama", "card": "Topps Now ROTY (x2)", "cardNum": "#VW-1", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 16.31, "shipping": 7.4, "feesPct": 0.137, "rawAvg": 20.79, "psa9Avg": 30.46, "psa10Avg": 63.89, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 20.79}], "psa9History": [{"date": "2026-08-07", "value": 30.46}], "psa10History": [{"date": "2026-08-07", "value": 63.89}]}, {"player": "Vladi Guerrero", "card": "2024 Bowman Chrome 1st Mojo", "cardNum": "#BCP-212", "rookie": true, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 1.25, "shipping": 1.04, "feesPct": 0.137, "rawAvg": 2.66, "psa9Avg": 0.0, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "MLB", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.66}], "psa9History": [{"date": "2026-08-07", "value": 0.0}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Will Levis", "card": "2023 Origins Orange /125", "cardNum": "#94", "rookie": true, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 5.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": 2.24, "psa9Avg": 19.31, "psa10Avg": 0.0, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "NFL", "location": "In Hand", "numbered": true, "outOf": 125, "quantity": 1, "rawHistory": [{"date": "2026-08-07", "value": 2.24}], "psa9History": [{"date": "2026-08-07", "value": 19.31}], "psa10History": [{"date": "2026-08-07", "value": 0.0}]}, {"player": "Alperen Sengun", "card": "Mosiac Fast Break RC", "cardNum": "", "rookie": true, "shipMyCards": "Yes", "status": "Sold", "grade": null, "paid": 1.9, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": null, "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": 8.0, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Joe Flacco", "card": "2018 Certified Mirror Blue /50", "cardNum": "", "rookie": false, "shipMyCards": "No", "status": "Sold", "grade": null, "paid": 3.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": null, "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": 7.0, "sport": "NFL", "location": "In Hand", "numbered": true, "outOf": 50, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Paul Pierce", "card": "Upper Deck UD Glass Patch", "cardNum": "", "rookie": false, "shipMyCards": "No", "status": "Sold", "grade": null, "paid": 1.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": null, "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": 10.0, "sport": "NBA", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}]
;

const SEED_POKEMON = [{"player": "Arcanine EX", "card": "2023 Scarlet & Violet", "cardNum": "#032/198", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 4.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pok\u00e9mon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Mewtwo EX", "card": "2024 Scarlet & Violet: Paradox Rift", "cardNum": "#058/182", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 4.0, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pok\u00e9mon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Lapras VMAX", "card": "2020 Sword & Shield", "cardNum": "#203/202", "rookie": false, "shipMyCards": "Yes", "status": "Raw", "grade": null, "paid": 14.39, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via ShipMyCards", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pok\u00e9mon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Charmander (x2)", "card": "2025 Mega Evo Phantasmal Flames", "cardNum": "#011/094", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pok\u00e9mon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Charmeleon", "card": "2025 Mega Evo Phantasmal Flames", "cardNum": "#012/094", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pok\u00e9mon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Reshiram R-Holo", "card": "2025 Mega Evo Phantasmal Flames", "cardNum": "#017/094", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pok\u00e9mon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Charcadet R-Holo", "card": "2025 Mega Evo Phantasmal Flames", "cardNum": "#019/094", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pok\u00e9mon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Mismagius EX", "card": "2025 Mega Evo Phantasmal Flames", "cardNum": "#036/094", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pok\u00e9mon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Mega Heracross EX", "card": "2025 Mega Evo Phantasmal Flames", "cardNum": "#004/094", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pok\u00e9mon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}, {"player": "Wigglytuff (Illustration Rare)", "card": "2025 Mega Evo Phantasmal Flames", "cardNum": "#105/094", "rookie": false, "shipMyCards": "No", "status": "Raw", "grade": null, "paid": 0.8, "shipping": 0.0, "feesPct": 0.137, "rawAvg": null, "psa9Avg": null, "psa10Avg": null, "gradingService": "PSA via Australia", "psa10Prob": 0.35, "psa9Prob": 0.45, "actualSellPrice": null, "sport": "Pok\u00e9mon", "location": "In Hand", "numbered": false, "outOf": null, "quantity": 1, "rawHistory": [], "psa9History": [], "psa10History": []}];

const SEED_TARGETS = [{"id": null, "player": "Jackson Chourio", "sport": "MLB", "cardToLookFor": "2024 Topps Chrome/Bowman base rookie", "tier": "Buy Now", "researchScore": 58, "performanceTrend": "Improving", "reasoning": "Elite power/speed combo already producing at the MLB level for Milwaukee. Base rookies remain cheap for the production level.", "targetPriceRaw": 22, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Ausar Thompson", "sport": "NBA", "cardToLookFor": "2023-24 Prizm Silver, PSA 9", "tier": "Buy Now", "researchScore": 52, "performanceTrend": "Improving", "reasoning": "Defensive win shares climbing, PSA 9 Silver copies trading in the low $40s \u2014 cheap entry on a legitimate two-way piece.", "targetPriceRaw": "", "targetPriceGraded": 63, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Keyonte George", "sport": "NBA", "cardToLookFor": "2023-24 Optic Purple Shock /149", "tier": "Buy Now", "researchScore": 46, "performanceTrend": "Stable", "reasoning": "Numbered parallel with a stabilizing assist-to-turnover ratio \u2014 primary guard role on a rebuilding roster gives him a real usage floor.", "targetPriceRaw": 51, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "GG Jackson II", "sport": "NBA", "cardToLookFor": "2023-24 Donruss Choice Red/Green", "tier": "Speculative", "researchScore": 38, "performanceTrend": "Stable", "reasoning": "One of the youngest high-volume scorers in the league. Cheap parallel, real speculative upside if usage keeps climbing.", "targetPriceRaw": 42, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Tre Johnson", "sport": "NBA", "cardToLookFor": "2025-26 Prizm rookie", "tier": "Speculative", "researchScore": 40, "performanceTrend": "Stable", "reasoning": "Efficient 19.9 PPG freshman season translated into draft buzz. Rookie cards still cheap pre-breakout.", "targetPriceRaw": 45, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Ethan Salas", "sport": "MLB", "cardToLookFor": "Bowman Chrome prospect card", "tier": "Speculative", "researchScore": 32, "performanceTrend": "Stable", "reasoning": "Top catching prospect, still developing at Double A. Cheap lottery-ticket entry on a well-regarded prospect pedigree.", "targetPriceRaw": 15, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Walker Jenkins", "sport": "MLB", "cardToLookFor": "Bowman Draft rookie", "tier": "Speculative", "researchScore": 34, "performanceTrend": "Stable", "reasoning": "Power/speed tools prospect, trades cheap raw. Same profile as Jackson Chourio pre-breakout.", "targetPriceRaw": 20, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Drake Maye", "sport": "NFL", "cardToLookFor": "Opti Chrome insert", "tier": "Buy Now", "researchScore": 44, "performanceTrend": "Stable", "reasoning": "Cheap insert pricing ahead of a full season as starter \u2014 training camp buzz historically moves these before kickoff.", "targetPriceRaw": 25, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "AJ Dybantsa", "sport": "NBA", "cardToLookFor": "Bowman U NOW (pre-rookie)", "tier": "Speculative", "researchScore": 32, "performanceTrend": "Stable", "reasoning": "Consensus top prospect for next year's draft class. No real rookie card exists yet \u2014 cheap, high-risk early entry.", "targetPriceRaw": 45, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Darryn Peterson", "sport": "NBA", "cardToLookFor": "Bowman U NOW (pre-rookie)", "tier": "Speculative", "researchScore": 27, "performanceTrend": "Stable", "reasoning": "Alongside Dybantsa, one of the two best names in next year's class. Same pre-rookie caveat.", "targetPriceRaw": 35, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Willem Duursma", "sport": "AFL", "cardToLookFor": "2026 Select rookie card", "tier": "Speculative", "researchScore": 28, "performanceTrend": "Improving", "reasoning": "West Coast's No.1 pick in the 2025 AFL Draft, already praised for footy smarts early. Thin dedicated card-market data for AFL.", "targetPriceRaw": 30, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Anthony Edwards", "sport": "NBA", "cardToLookFor": "2020-21 Prizm base rookie, PSA 9", "tier": "Buy Now", "researchScore": 56, "performanceTrend": "Improving", "reasoning": "MVP conversations, All-Star, growing global fanbase. PSA 9 copies sit well under the PSA 10 blue-chip price for similar collector cachet.", "targetPriceRaw": "", "targetPriceGraded": 150, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Justin Herbert", "sport": "NFL", "cardToLookFor": "2020 Prizm rookie, PSA 9", "tier": "Buy Now", "researchScore": 48, "performanceTrend": "Stable", "reasoning": "PSA 9 copies trade $80-120 USD (~$120-180 AUD) versus $300-400 for PSA 10 \u2014 same recognizable rookie at a fraction of the premium-grade cost.", "targetPriceRaw": "", "targetPriceGraded": 150, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Nick Daicos", "sport": "AFL", "cardToLookFor": "Select rookie signatures, numbered parallels", "tier": "Buy Now", "researchScore": 55, "performanceTrend": "Stable", "reasoning": "Established, decorated star \u2014 one of the safest holds in the AFL market. Thin dedicated AFL card-market data compared to US sports.", "targetPriceRaw": 130, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Konnor Griffin", "sport": "MLB", "cardToLookFor": "2026 Bowman / Topps Chrome first-year cards", "tier": "Speculative", "researchScore": 42, "performanceTrend": "Stable", "reasoning": "Headlines this year's Bowman and Topps Chrome checklists as one of the most sought-after prospects in the product, still in the minors.", "targetPriceRaw": 150, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Carnell Tate", "sport": "NFL", "cardToLookFor": "2026 Prizm / Optic rookie autos", "tier": "Buy Now", "researchScore": 50, "performanceTrend": "Stable", "reasoning": "First WR off the board, landing opposite an ascending young QB. Strong, reliable college production.", "targetPriceRaw": 140, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Jeremiyah Love", "sport": "NFL", "cardToLookFor": "2026 Prizm / Optic rookie autos", "tier": "Buy Now", "researchScore": 36, "performanceTrend": "Stable", "reasoning": "Top RB in the class. RBs carry more bust/workload risk than QBs and WRs \u2014 size smaller than the QB/WR targets.", "targetPriceRaw": 130, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Bianca Belair", "sport": "WWE", "cardToLookFor": "2026 Topps Chrome WWE autos", "tier": "Buy Now", "researchScore": 58, "performanceTrend": "Improving", "reasoning": "Flagged in June 2026 market coverage as a genuine buying opportunity \u2014 trading soft for a multi-time champion, real room to correct upward.", "targetPriceRaw": "", "targetPriceGraded": 130, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Islam Makhachev", "sport": "MMA", "cardToLookFor": "Topps/Panini Select autographed cards", "tier": "Buy Now", "researchScore": 48, "performanceTrend": "Stable", "reasoning": "Reigning lightweight champion, one of the sport's most dominant current fighters \u2014 proven titleholder, not speculative.", "targetPriceRaw": "", "targetPriceGraded": 160, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Fernando Mendoza", "sport": "NFL", "cardToLookFor": "2026 Prizm / Donruss Optic rookie autos", "tier": "Buy Now", "researchScore": 62, "performanceTrend": "Stable", "reasoning": "No.1 overall pick with a confirmed starting job. QB is the position with the biggest hobby premium.", "targetPriceRaw": 240, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Cooper Flagg", "sport": "NBA", "cardToLookFor": "2025-26 Prizm / Topps Chrome rookie", "tier": "Buy Now", "researchScore": 50, "performanceTrend": "Improving", "reasoning": "The class's foundational prospect, now in his rookie NBA season. Already priced accordingly \u2014 an 'own the blue chip' hold, not a sleeper.", "targetPriceRaw": 260, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Gunther", "sport": "WWE", "cardToLookFor": "2026 Topps Royalty WWE, WrestleMania patch autos", "tier": "Buy Now", "researchScore": 40, "performanceTrend": "Stable", "reasoning": "One of the hottest chases in the product \u2014 his 1/1 WrestleMania patch auto sold for over $18,000. Standard autos still land in reach.", "targetPriceRaw": "", "targetPriceGraded": 260, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Jude Bellingham", "sport": "Soccer", "cardToLookFor": "Topps Chrome UCL, Match Attax rookie-era cards", "tier": "Buy Now", "researchScore": 52, "performanceTrend": "Stable", "reasoning": "Established Real Madrid/England star, cited as a benchmark long-term soccer card hold. Steadier than a rising rookie pick.", "targetPriceRaw": 220, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Victor Wembanyama", "sport": "NBA", "cardToLookFor": "Recon Future Legends insert (premium tier, lower entry than base Prizm)", "tier": "Buy Now", "researchScore": 60, "performanceTrend": "Improving", "reasoning": "Insert-tier entry point on a card whose base rookie has already sold privately for $5.11M. Premium tier still carries real collector cachet at a fraction of the cost.", "targetPriceRaw": "", "targetPriceGraded": 300, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Justin Herbert (PSA 10)", "sport": "NFL", "cardToLookFor": "2020 Prizm base rookie, PSA 10", "tier": "Buy Now", "researchScore": 44, "performanceTrend": "Stable", "reasoning": "PSA 10 copies trade $300-400 USD (~$450-600 AUD) \u2014 established, recognizable rookie with a long track record as a top-tier arm.", "targetPriceRaw": "", "targetPriceGraded": 480, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Roman Anthony (PSA 9)", "sport": "MLB", "cardToLookFor": "2026 Topps Chrome / Bowman Chrome, PSA 9", "tier": "Buy Now", "researchScore": 48, "performanceTrend": "Improving", "reasoning": "Elite outfield prospect already producing at the MLB level, elite plate discipline. Prices have moved fast \u2014 this is more 'own at least one' than a bargain now.", "targetPriceRaw": "", "targetPriceGraded": 380, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Lamine Yamal", "sport": "Soccer", "cardToLookFor": "Topps Match Attax Red Hot / Golden Moment inserts", "tier": "Buy Now", "researchScore": 55, "performanceTrend": "Improving", "reasoning": "Teenage sensation driving current Match Attax pull rates. Global star with the 2026 World Cup as a major demand catalyst for the whole category.", "targetPriceRaw": 350, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Anthony Edwards (PSA 10)", "sport": "NBA", "cardToLookFor": "2020-21 Prizm base rookie, PSA 10", "tier": "Buy Now", "researchScore": 58, "performanceTrend": "Improving", "reasoning": "Considered a blue-chip modern hobby card \u2014 Prizm brand credibility, MVP-conversation trajectory, growing global fanbase.", "targetPriceRaw": "", "targetPriceGraded": 700, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Lamine Yamal (PSA 10)", "sport": "Soccer", "cardToLookFor": "Base Chrome rookie, PSA 10", "tier": "Buy Now", "researchScore": 53, "performanceTrend": "Improving", "reasoning": "PSA 10 base Chrome copies trading $500-1,500 USD and rising, per current market coverage \u2014 World Cup year adds further upside.", "targetPriceRaw": "", "targetPriceGraded": 750, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Umbreon VMAX Alt Art (\"Moonbreon\")", "sport": "Pok\u00e9mon", "cardToLookFor": "Evolving Skies Umbreon VMAX Alt Art, near-mint raw", "tier": "Buy Now", "researchScore": 62, "performanceTrend": "Stable", "reasoning": "The poster child for modern Pok\u00e9mon investing \u2014 went from ~$200 to $700+ within two years of release. Raw near-mint sits below the PSA 10 premium.", "targetPriceRaw": 650, "targetPriceGraded": "", "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Erling Haaland", "sport": "Soccer", "cardToLookFor": "Base rookie, PSA 10", "tier": "Buy Now", "researchScore": 54, "performanceTrend": "Stable", "reasoning": "Incredible scoring record makes his rookies among the most sought-after modern soccer cards. PSA 10 base copies trade $1,000-2,500 USD (~$1,500-3,700 AUD).", "targetPriceRaw": "", "targetPriceGraded": 1600, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Victor Wembanyama (PSA 10)", "sport": "NBA", "cardToLookFor": "2023-24 Prizm base rookie, PSA 10", "tier": "Buy Now", "researchScore": 66, "performanceTrend": "Improving", "reasoning": "Defensive Player of the Year, MVP-level Year 3 numbers. One of his rookie cards sold privately for $5.11M \u2014 the base PSA 10 is the safest liquid entry into that same market.", "targetPriceRaw": "", "targetPriceGraded": 900, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Umbreon VMAX Alt Art (\"Moonbreon\") \u2014 PSA 10", "sport": "Pok\u00e9mon", "cardToLookFor": "Evolving Skies Umbreon VMAX Alt Art, PSA 10", "tier": "Buy Now", "researchScore": 60, "performanceTrend": "Stable", "reasoning": "PSA 10 copies average roughly $3,500. Eeveelution demand plus a rotating set keeps supply tightening.", "targetPriceRaw": "", "targetPriceGraded": 5200, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Charizard (Base Set, 1st Edition)", "sport": "Pok\u00e9mon", "cardToLookFor": "1999 Base Set 1st Edition Charizard, any grade", "tier": "Buy Now", "researchScore": 58, "performanceTrend": "Stable", "reasoning": "The blue-chip of the entire hobby, vintage or modern. PSA 10 copies trade near $168,000-$170,000 USD with a $550,000 sale on record \u2014 obviously the top of the market, included for completeness.", "targetPriceRaw": "", "targetPriceGraded": 250000, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}, {"id": null, "player": "Conor McGregor", "sport": "MMA", "cardToLookFor": "Topps Chrome UFC rookie-era autos, PSA 10", "tier": "Buy Now", "researchScore": 50, "performanceTrend": "Stable", "reasoning": "Still described as 'the king' of UFC card collector interest \u2014 best cards trade in four figures regardless of active fight status. Safest, most liquid MMA card rather than the highest-upside.", "targetPriceRaw": "", "targetPriceGraded": 1800, "status": "Watching", "monthAdded": "2026-08-11", "lastRefreshed": "2026-08-11"}];

// ===== Formula engine, ported 1:1 from the user's Excel model =====

// PSA-via-Australia (local shop, e.g. The Hobby) prices by declared card value in USD,
// not a flat fee. Tiers below are the standard card-only tier (not vintage/faster-service/
// jumbo/autograph sub-tiers — those run higher, adjust manually if your card falls there).
// Declared value is assumed in AUD and roughly converted to USD for the tier lookup, since
// PSA denominates its tiers in USD but you're paying the AU shop in AUD.
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
  // Accept both current and pre-rename labels — cards saved before the rename are still
  // holding the old strings in browser storage and would otherwise silently price at $0.
  if (s === "psa via australia" || s === "psa via aus") return tieredPsaAuCost(declaredValueAUD);
  if (s === "psa via shipmycards" || s === "psa via usa") return 38.9;
  if (s === "sgc via australia" || s === "sgc via aus") return 39.95;
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
  const holdingCost = (c.shipMyCards || "").toLowerCase() === "yes" ? 4.5 : 0;
  // Total cost includes the grading fee once a card has actually been sent — computed and
  // locked in at the moment it's sent (gradingCostPaid), not recalculated later even if
  // market prices or the grading service's fee schedule changes.
  const totalCost = c.paid + c.shipping + holdingCost + (c.gradingCostPaid || 0);
  const fees = c.feesPct;
  const grade = (c.grade || "").toLowerCase();
  const status = c.status; // 'Raw' | 'At Grading' | 'Graded' | 'Listed' | 'Sold'
  // A card away being graded isn't actionable — you can't sell it raw (it's not in hand) and
  // it isn't graded yet, so it's excluded from GGR/sell-decision math the same way Sold/Listed
  // cards are, until it comes back and its status is updated to Graded.
  const isActive = status === "Raw" || status === "Graded";

  const raw = c.rawAvg ?? 0;
  const psa9 = c.psa9Avg ?? 0;
  // No PSA 10 comp on record (often because none exist yet — a genuinely low/zero population)
  // is NOT the same as "PSA 10 sells for $0." Defaulting to zero was treating a rare, likely
  // more valuable grade as worthless, which killed the grade call on exactly the cards where
  // an unpopulated PSA 10 would probably be worth the most. Floor it at the PSA 9 price instead
  // — a PSA 10 should never realistically sell for less than a 9 of the same card.
  const psa10 = c.psa10Avg ?? c.psa9Avg ?? 0;

  const netRawSell = raw * (1 - fees);
  const netPsa9Sell = psa9 * (1 - fees);
  const netPsa10Sell = psa10 * (1 - fees);

  // Declared value for PSA-via-Australia's value-tiered pricing: the higher of your expected
  // PSA 9/10 comps, since that's what you'd realistically declare when submitting.
  const declaredValue = Math.max(psa9, psa10);
  const gCost = gradingCost(c.gradingService, declaredValue);

  // GGR/EV only mean anything for cards still in active inventory — once Listed or Sold,
  // they're out of the decision pipeline entirely, so these are nulled rather than showing
  // stale or nonsensical negative figures.
  const rawGGR = isActive ? (status === "Graded" ? null : raw - totalCost) : null;

  const psa9Eligible = isActive && (status === "Raw" || PSA9_GRADES.includes(grade));
  const psa9GGR = psa9Eligible ? psa9 * (1 - fees) - totalCost - gCost : null;

  const psa10Eligible = isActive && (status === "Raw" || PSA10_GRADES.includes(grade));
  const psa10GGR = psa10Eligible ? psa10 * (1 - fees) - totalCost - gCost : null;

  // Graded EV = probability-weighted expected value of actually grading — must include the
  // grading fee and sale fee (same figures used in psa9GGR/psa10GGR above), not just the raw
  // market price. Priority order for which probability to use:
  // 1) A saved photo grade check — condition-specific to this exact copy, the strongest signal.
  // 2) GemRate's set gem rate — a real population-report base rate for this set/product,
  //    far better than a flat guess even without a photo check.
  // 3) The flat 35%/45% default — only when neither of the above is available.
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

  // Grade? bar — computed once, independently of sellDecision, then used consistently for
  // BOTH the sell-decision label and the Grade? call. Previously "Grade First" had its own
  // separate, looser trigger (a straight psa10GGR >= 50 escape hatch that ignored psa9GGR
  // entirely), which meant a card could show "Grade First" while its own Grade? call said
  // NO — a real contradiction, not intentional nuance.
  let gradeWorthIt = "NO";
  if (psa10GGR >= 20 && psa9GGR >= 0 && gradedEV >= rawGGR) gradeWorthIt = "YES";
  else if (psa10GGR >= 20 && psa9GGR >= -10 && psa9GGR < 0 && gradedEV >= rawGGR) gradeWorthIt = "HIGH RISK";

  // Sell Decision (AC)
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
    // Raw — Grade First now requires the SAME bar as a YES/HIGH RISK Grade? call, plus still
    // needing to beat the raw sell price outright.
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

  // Grade? (AB) — reads the same gradeWorthIt bar computed above, so it can never disagree
  // with a "Grade First" sell decision again.
  const gradeCall = status !== "Raw" || sellDecision === "Sell Raw First" ? "NO" : gradeWorthIt;

  // Sell Priority (AD) — cards ready to sell right now always come first, and a graded sale
  // (a known, liquid, fungible quantity — real cert lookup, real recent comps) ranks above a
  // raw sale (real condition variance a buyer can't fully verify from photos) since it's the
  // more certain, faster-to-close win.
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

  // Once actually sold, use the real fees/consignment shipping paid if logged — the generic
  // Fees % assumption (built for eBay-style flat percentages) is wrong for DCSports87's tiered
  // payouts, Fanatics Collect's Buy Now/auction split, or Whatnot's commission. Falls back to
  // the Fees % estimate only when no actual figures have been entered.
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

  // Grading Tracker progress bar inputs — only meaningful while a card is actually away.
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

// Pokemon sheet uses a simpler decision engine than the main Own sheet
function computePokemonCard(c) {
  const holdingCost = (c.shipMyCards || "").toLowerCase() === "yes" ? 4.5 : 0;
  const totalCost = c.paid + c.shipping + holdingCost + (c.gradingCostPaid || 0);
  const fees = c.feesPct;
  const status = c.status;
  const isActive = status === "Raw" || status === "Graded";

  const raw = c.rawAvg ?? 0;
  const psa9 = c.psa9Avg ?? 0;
  // No PSA 10 comp on record (often because none exist yet — a genuinely low/zero population)
  // is NOT the same as "PSA 10 sells for $0." Defaulting to zero was treating a rare, likely
  // more valuable grade as worthless, which killed the grade call on exactly the cards where
  // an unpopulated PSA 10 would probably be worth the most. Floor it at the PSA 9 price instead
  // — a PSA 10 should never realistically sell for less than a 9 of the same card.
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

  // Same fix as the main engine: compute the grade-worth-it bar once, use it for both the
  // sell decision and the Grade? call so they can't contradict each other.
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

// ===== Buy Evaluator engine =====

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

  // Raw/PSA 9/PSA 10 averages from up to 2 logged sales each — same pattern as My Cards, so
  // buying and grading decisions use the same real comps instead of a single stale price.
  const rawAvg = avgOfSales(b.rawSale1, b.rawSale2);
  const psa9Avg = avgOfSales(b.psa9Sale1, b.psa9Sale2);
  const psa10Avg = avgOfSales(b.psa10Sale1, b.psa10Sale2);

  // Market price for the buy math itself: whichever tier matches the card's current state —
  // raw comps if buying it raw, the matching graded comps if buying an already-graded card.
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

  // Max Snipe Bid — the ceiling you should ever bid. Low competition (Cold) or high card value
  // earns you room to bid closer to true breakeven, but the combined multiplier is capped at 1.0
  // so the ceiling itself can never sit above breakeven — a "no one else wants it" bonus should
  // never justify a bid that's mathematically guaranteed to lose money.
  const feeDollar = adjMarketValue * fees;
  const breakevenBid = adjMarketValue - feeDollar - holdingFee - b.shipping;
  const effectiveMult = Math.min(heatMult * valueMult, 1);
  const maxSnipeBid = Math.max(0, breakevenBid * effectiveMult);

  // Profit/ROI/decision are judged against what you'd realistically pay — your logged Current Bid
  // if you have one, otherwise the Max Snipe Bid ceiling as a fallback estimate. Judging every card
  // against the full ceiling made cheap, low-competition auctions look like PASS even when the
  // price you'd actually pay was clearly profitable.
  const currentBid = Number(b.currentBid) || 0;
  const referenceBid = currentBid > 0 ? currentBid : maxSnipeBid;

  const estProfit = adjMarketValue - (referenceBid + feeDollar + holdingFee + b.shipping);
  const roiPct = referenceBid > 0 ? estProfit / referenceBid : null;

  // Decision: with a logged current bid, judge the real numbers at that price (unchanged).
  // Without one, judging profit against the ceiling itself was broken by construction — Max
  // Snipe Bid is deliberately set at breakeven, so estProfit there lands at ~$0 for most cards
  // and "estProfit <= 0" was flipping that to PASS almost every time no bid was logged yet.
  // Without a bid, the real question is just "is there a legitimate, budget-fitting ceiling
  // worth watching this for" — not whether paying the absolute max would still turn a profit.
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

  // Worth grading after buying? Only meaningful for raw cards, using the same probability-
  // weighted logic as My Cards' Grade? call. Cost basis here is the Max Snipe Bid ceiling —
  // the worst-case price you're actually willing to pay — not the current bid, which is likely
  // still climbing before the auction closes. Judging this against a live, rising bid made the
  // grading call look rosier than it'll actually be once the price settles near your ceiling.
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

  // % Gap rule: (Market Price - what you'd actually pay) / Market Price, based on your current bid.
  const percentGap = marketPrice > 0 && currentBid > 0 ? (marketPrice - currentBid) / marketPrice : null;
  const gapZone =
    percentGap == null ? null : percentGap >= 0.3 ? "AUTO-BUY" : percentGap >= 0.2 ? "CONDITIONAL" : "NO-BUY";

  // Golden-rule per-card budget cap, checked against what you'd actually pay
  let budgetCap = b.isPokemonInsert ? 25 : b.rawGraded === "Raw" ? 50 : 100;
  const overCap = referenceBid > budgetCap;

  // Current bid vs your ceiling — a live safety check while an auction is running
  const bidRoom = currentBid > 0 ? maxSnipeBid - currentBid : null;
  const alreadyOverMax = currentBid > 0 && currentBid > maxSnipeBid;

  // Recalculated from what you actually paid, once logged — the real numbers, not the projection
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

// Team rosters for Box Breaks — pre-filled so you're not typing 32 team names every time.
// Editable per spot in case of trades/relocations/name changes.
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

// Sandboxed iframes (like this artifact preview) often block the async Clipboard API
// outright. Try it first, but always fall back to the old-school hidden-textarea +
// execCommand trick, which works in far more embedded contexts.
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

// ===== Storage abstraction: Claude.ai artifact persistent storage when available (syncs
// per-user across every device/session automatically, no backend needed), falling back to
// plain localStorage if this file is ever downloaded and hosted as a standalone webpage —
// or, per Anthropic's own docs, while viewing an unpublished artifact in chat, since
// "storage operations will not succeed until the artifact is published."
//
// Every value is wrapped with a savedAt timestamp. This matters: without it, a read simply
// preferred whichever source answered (usually window.storage), even if that copy was older
// than what's in localStorage — e.g. a stale cloud snapshot from before a field existed, or
// an in-flight write that completed after a newer one. That's what caused avg fields and
// newly-won cards to silently revert. Now a read always keeps whichever copy has the newer
// timestamp, regardless of which source it came from or which write finished first.
//
// Writes to the same key are also serialized through a per-key queue, so two overlapping
// saves (e.g. winning a card, then immediately navigating away) can never resolve out of
// order and clobber each other.
const hasArtifactStorage = typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";
const _writeQueues = {};

function unwrapEnvelope(parsed) {
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && "data" in parsed && "savedAt" in parsed) {
    return { data: parsed.data, savedAt: Number(parsed.savedAt) || 0 };
  }
  // Legacy value saved before this envelope existed — still usable, just always loses a
  // recency tie-break against anything saved after this fix, which is the safe default.
  return { data: parsed, savedAt: 0 };
}

async function storageGet(key) {
  let artifactEnv = null;
  let localEnv = null;

  if (hasArtifactStorage) {
    try {
      const result = await window.storage.get(key, false);
      if (result && result.value != null) artifactEnv = unwrapEnvelope(JSON.parse(result.value));
    } catch (e) {
      // Expected while unpublished/testing in chat, or on a plan without persistent storage.
    }
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

  // Chain onto any write already in flight for this exact key, so writes complete strictly
  // in the order they were started rather than racing over the network.
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
        } catch (e) {
          // Expected while unpublished/testing — the localStorage write above still covers it.
        }
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

  const enrichedPokemonCards = useMemo(
    () =>
      pokemonCards.map((c) => {
        const computed = computePokemonCard(c);
        const listing = recommendedListing(computed);
        const expectedListProfit = listing ? listing.listPrice * (1 - computed.feesPct) - computed.totalCost : null;
        return { ...computed, expectedListProfit };
      }),
    [pokemonCards]
  );

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
            <label style={{ display: "block", marginBottom: 4 }}>Sport</label>
            <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)} style={{ width: "auto", minWidth: 140 }}>
              <option value="all">All sports</option>
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

// Within a tied priority tier, group by decision type before breaking ties on cost —
// otherwise Sell Raw First and Sell PSA 9/10 (both priority 1) interleave by dollar
// amount instead of clustering together, which looks like sorting is broken.
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
  const isTopAction = card.sellPriority === 1; // Sell PSA 9 / Sell PSA 10 — strongest highlight
  const isRawSell = card.sellDecision === "Sell Raw First"; // still flagged, just quieter than a graded sell
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

function AddCardModal({ onClose, onSave, playerLabel }) {
  const [form, setForm] = useState({
    player: "",
    card: "",
    cardNum: "",
    sport: "NFL",
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
        <ModalHeader title="Add a card" onClose={onClose} />
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 10 }}>
            <Field label={playerLabel || "Player"}>
              <input value={form.player} onChange={(e) => setForm({ ...form, player: e.target.value })} required />
            </Field>
            <Field label="Sport">
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
              Priced by declared value, not flat — cards not produced in the USA (Japanese Pokémon, One Piece, Lorcana, Yu-Gi-Oh, Dragon Ball, etc.) route via PSA Hong Kong and add 1-2 months to turnaround.
            </div>
          )}
          <Field label="Set gem rate % (optional — from GemRate)">
            <input type="number" step="0.1" min="0" max="100" placeholder="e.g. 22.5" value={form.setGemRate} onChange={(e) => setForm({ ...form, setGemRate: e.target.value })} />
          </Field>
          <div style={{ fontSize: 11, color: "#6B7180", marginTop: -6, display: "flex", alignItems: "center", gap: 8 }}>
            <a href="https://www.gemrate.com/universal-search" target="_blank" rel="noreferrer" style={{ color: "#5C7A99" }}>Search GemRate ↗</a>
            <span>What % of this set's submissions actually come back PSA 10 — a real base rate, better than a guess, especially before you've run a photo check.</span>
          </div>
          <button className="btnPrimary" type="submit" style={{ justifyContent: "center", marginTop: 6 }}>
            Add to portfolio
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
  const [copyState, setCopyState] = useState("idle"); // idle | copied | failed
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
        {copyState === "failed" && (
          <span style={{ fontSize: 11, color: "#B4472E" }}>Couldn't auto-copy — click the text above to select it, then Ctrl/Cmd+C</span>
        )}
      </div>
    </div>
  );
}

function DetailModal({ card, onClose, onUpdate, onDelete, playerLabel = "Player" }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(card);

  useEffect(() => setForm(card), [card.id]);

  const isPkmn = card.sport === "Pokémon" || playerLabel.includes("Pokémon");
  const computed = isPkmn ? computePokemonCard(card) : computeCard(card);

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
   onUpdate({
      ...card,
      ...form,
      id: card.id,
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

  const style = SELL_DECISION_STYLE[computed.sellDecision] || SELL_DECISION_STYLE[""];
  const listing = recommendedListing(computed);
  const sellMethod = listing ? suggestedSellingMethod(computed, listing) : null;
  const timingCheck = !isPkmn && listing ? seasonalSellCheck(card.sport) : null;

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
              {card.player || card.name || "Unnamed Card"}
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
            {style.label} · priority {computed.sellPriority}
          </span>
          {card.location && (
            <span className="mono" style={{ display: "inline-block", fontSize: 11, padding: "3px 10px", borderRadius: 999, background: `${(LOCATION_STYLE[card.location] || {}).color || "#8B90A0"}22`, color: (LOCATION_STYLE[card.location] || {}).color || "#8B90A0" }}>
              📍 {card.location}
            </span>
          )}
        </div>

        {card.location && card.location !== "In Hand" && ["Sell Raw First", "Sell PSA 9", "Sell PSA 10"].includes(computed.sellDecision) && (
          <div style={{ fontSize: 12, color: "#C9A227", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            ⚠️ Time to sell, but this card isn't in hand — list it through {card.location} instead of shipping it yourself.
          </div>
        )}

        {listing && (
          <div style={{ border: "1px solid #4E8B6B55", borderRadius: 8, padding: "12px 14px", marginBottom: 16, background: "#4E8B6B0f" }}>
            <div style={{ fontSize: 11, color: "#8B90A0", textTransform: "uppercase", marginBottom: 8 }}>Recommended listing ({listing.label})</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <MiniStat label="List at" value={fmtMoney(listing.listPrice)} color="#4E8B6B" emphasis />
              <MiniStat label="Don't go below" value={fmtMoney(listing.floor)} color="#B4472E" />
            </div>
            <div style={{ fontSize: 11, color: "#6B7180", marginTop: 8 }}>
              {listing.markupPct}% above the {listing.label.toLowerCase()} average
              {listing.label === "Raw" ? " — raw condition varies, so a modest premium is normal." : " — graded cards are a known quantity with public comps, so only a small premium sticks."}{" "}
              The floor is your break-even; anything below that and you're paying to sell.
            </div>
            {listing.lowConfidence && (
              <div style={{ fontSize: 11, color: "#C9A227", marginTop: 6 }}>
                ⚠️ Based on limited sale data — double-check the very latest sold listings before pricing this one.
              </div>
            )}
            {sellMethod && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #4E8B6B33" }}>
                <div style={{ fontSize: 11, color: "#8B90A0", textTransform: "uppercase", marginBottom: 4 }}>Suggested method</div>
                <div className="oswald" style={{ fontSize: 14.5, fontWeight: 600, color: "#4E8B6B", marginBottom: 4 }}>{sellMethod.method}</div>
                <div style={{ fontSize: 11, color: "#6B7180", lineHeight: 1.6 }}>{sellMethod.why}</div>
              </div>
            )}
            {timingCheck && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #4E8B6B33" }}>
                <div style={{ fontSize: 11, color: "#8B90A0", textTransform: "uppercase", marginBottom: 4 }}>Seasonal timing check ({timingCheck.sportLabel})</div>
                {timingCheck.isGoodTiming ? (
                  <div style={{ fontSize: 12.5, color: "#4E8B6B", fontWeight: 600 }}>✅ Good timing — {timingCheck.monthName} is a Sell month on the calendar.</div>
                ) : (
                  <div style={{ fontSize: 12.5, color: "#C9A227", fontWeight: 600 }}>
                    ⏳ {timingCheck.monthName} is a {timingCheck.currentAction || "quiet"} month on the calendar, not a Sell month
                    {timingCheck.nextSellMonth ? ` — next Sell window is ${timingCheck.nextSellMonth}` : ""}.
                  </div>
                )}
                <div style={{ fontSize: 10.5, color: "#6B7180", marginTop: 4, lineHeight: 1.5 }}>
                  The profit math still says sell — this is only about timing, not whether it's profitable. {timingCheck.note}
                </div>
              </div>
            )}
          </div>
        )}

        {card.status === "At Grading" && (
          <div style={{ border: "1px solid #C9A22755", borderRadius: 8, padding: "12px 14px", marginBottom: 16, background: "#C9A2270f" }}>
            <div style={{ fontSize: 11, color: "#C9A227", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>🏷️ At grading</div>
            <div style={{ fontSize: 12.5, color: "#C6CAD4", lineHeight: 1.7 }}>
              Sent {card.gradingSentDate} via {card.gradingService}. Grading cost of <b>{fmtMoney(card.gradingCostPaid)}</b> is already added to this card's total cost.
              {card.gradingTurnaroundDays && ` Estimated ${card.gradingDaysElapsed}/${card.gradingTurnaroundDays} days elapsed.`}
              {" "}Full progress tracking is in the Grading Tracker tab.
            </div>
          </div>
        )}

        <SearchCopyBlock card={card} />

        {!edit ? (
          <>
            <SectionTitle>Cost basis</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              <MiniStat label="Paid" value={fmtMoney(card.paid)} />
              <MiniStat label="Shipping + holding" value={fmtMoney((card.shipping || 0) + (card.holdingCost || 0))} />
              <MiniStat label="Total cost" value={fmtMoney(computed.totalCost)} />
            </div>

            <SectionTitle>Market values (60d avg)</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
              <MiniStat label="Raw" value={computed.rawAvg != null ? fmtMoney(computed.rawAvg) : "—"} />
              <MiniStat label="PSA 9" value={computed.psa9Avg != null ? fmtMoney(computed.psa9Avg) : "—"} />
              <MiniStat label="PSA 10" value={computed.psa10Avg != null ? fmtMoney(computed.psa10Avg) : "—"} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              <TrendSparkline history={card.rawHistory} color="#5C7A99" />
              <TrendSparkline history={card.psa9History} color="#8B6FD6" />
              <TrendSparkline history={card.psa10History} color="#C9A227" />
            </div>

            <SectionTitle>Profitability (GGR = gross gain after cost)</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
              <MiniStat label="Raw GGR" value={computed.rawGGR != null ? fmtMoney(computed.rawGGR) : "—"} color={computed.rawGGR >= 0 ? "#4E8B6B" : "#B4472E"} />
              <MiniStat label="PSA 9 GGR" value={computed.psa9GGR != null ? fmtMoney(computed.psa9GGR) : "—"} color={computed.psa9GGR >= 0 ? "#4E8B6B" : "#B4472E"} />
              <MiniStat label="PSA 10 GGR" value={computed.psa10GGR != null ? fmtMoney(computed.psa10GGR) : "—"} color={computed.psa10GGR >= 0 ? "#4E8B6B" : "#B4472E"} />
            </div>
            {computed.psa10Avg == null && computed.psa9Avg != null && (
              <div style={{ fontSize: 10.5, color: "#C9A227", marginBottom: 8 }}>
                ⚠️ No PSA 10 comp on record — figures above assume it's worth at least the PSA 9 price, not $0. If pop is genuinely low/zero, a real PSA 10 could be worth meaningfully more than shown.
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <MiniStat label="Graded EV (prob-weighted)" value={computed.gradedEV != null ? fmtMoney(computed.gradedEV) : "—"} color={computed.gradedEV >= 0 ? "#4E8B6B" : "#B4472E"} emphasis />
              <MiniStat label="Grade call" value={computed.gradeCall} color={computed.gradeCall === "YES" ? "#4E8B6B" : computed.gradeCall === "HIGH RISK" ? "#C9A227" : "#8B90A0"} emphasis />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
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
        <Field label="Sport">
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Grading service">
          <select value={form.gradingService || "PSA via Australia"} onChange={(e) => setForm({ ...form, gradingService: e.target.value })}>
            {GRADING_SERVICE_OPTIONS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Set gem rate % (from GemRate)">
          <input type="number" step="0.1" min="0" max="100" placeholder="e.g. 22.5" value={form.setGemRate ?? ""} onChange={(e) => setForm({ ...form, setGemRate: e.target.value })} />
        </Field>
      </div>
      <div style={{ fontSize: 11, color: "#6B7180", marginTop: -6 }}>
        <a href="https://www.gemrate.com/universal-search" target="_blank" rel="noreferrer" style={{ color: "#5C7A99" }}>Search GemRate ↗</a> — real population-report data on what % of this set's submissions actually come back PSA 10. Used as the base rate for Graded EV whenever there's no photo check saved.
      </div>
      <Field label="Actual sell price (if sold)">
        <input type="number" step="0.01" value={form.actualSellPrice ?? ""} onChange={(e) => setForm({ ...form, actualSellPrice: e.target.value })} />
      </Field>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button className="btnPrimary" onClick={onSave}>Save changes</button>
        <button className="btnSecondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ===== Buy Evaluator =====

// ===== Monthly Targets =====

const TARGET_TIER_STYLE = {
  "Buy Now": { color: "#4E8B6B" },
  Speculative: { color: "#C9A227" },
};
const TARGET_STATUS_OPTIONS = ["Watching", "Bought", "Passed"];

// Price bands for filtering the target list by budget — activates automatically once a
// target has a price entered (raw preferred, falling back to graded if that's all that's set).
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

// Confidence score bands: how likely this is to make money, not a guarantee.
function confidenceColor(score) {
  const s = Number(score) || 0;
  if (s >= 70) return "#4E8B6B"; // green
  if (s >= 50) return "#C9A227"; // yellow
  if (s >= 30) return "#D08A3E"; // orange
  return "#B4472E"; // red
}

// Displayed score is never set by hand — it's the research baseline (set when a target is
// researched/refreshed) minus automatic decay for how long it's gone unrefreshed. But blind
// time-decay is a blunt instrument: a player still performing well six months on shouldn't
// look worse just because nobody revisited the page. Performance trend controls how fast
// decay applies — "Improving" (e.g. still playing at an elite level, market catching up to
// undervaluation) barely decays at all, "Declining" decays much faster, "Stable" is the
// default rate.
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
  // Unknown/unresearched (no researchScore on record at all) skews low, not neutral —
  // "we don't know" shouldn't read as "medium confidence."
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

    // If a specific price range is selected, only add/update targets whose researched price
    // falls in that range — leaves everything else on the list untouched. "All prices" or
    // "No price set" pulls from the full research set as before.
    const scoped =
      priceRangeFilter === "all" || priceRangeFilter === "unpriced"
        ? SEED_TARGETS
        : SEED_TARGETS.filter((s) => getPriceRange(getTargetPrice(s))?.key === priceRangeFilter);

    // Refresh anything already on the list that matches a researched target — pulls in the
    // latest research baseline, reasoning, and card info without touching status or your own
    // price targets, and resets the decay clock. Anything not in the research set (your own
    // custom adds) is left alone.
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

  // Most-confident-first, tier + price range filters applied on top
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

      <div style={{ fontSize: 12, color: "#8B90A0", marginBottom: 16, lineHeight: 1.6 }}>
        A running watchlist of players/cards worth researching for future investment — not a buy signal on its own. The hobby moves fast; treat anything more than a month or two old as a starting point to re-check, not current pricing.
        <span style={{ color: "#C9A227" }}> "Buy Now"</span> = already rostered/debuted with a real rookie card out.
        <span style={{ color: "#C9A227" }}> "Speculative"</span> = pre-rookie or not yet drafted — cheaper entry, real risk it doesn't pan out.
        <span style={{ color: "#EDEAE1" }}> Score</span> is calculated, not set by hand — a research baseline that decays the longer it goes without a refresh, slowed way down for players still trending up (↗ Improving) and sped up for anyone trending down (↘ Declining), so a still-elite player doesn't get penalized just for going unrefreshed. Sorted highest first.
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
          {justMerged != null && (
            <span style={{ fontSize: 12, color: justMerged.added > 0 || justMerged.updated > 0 ? "#4E8B6B" : "#6B7180" }}>
              {justMerged.added === 0 && justMerged.updated === 0
                ? "Already up to date"
                : [
                    justMerged.added > 0 ? `Added ${justMerged.added}` : null,
                    justMerged.updated > 0 ? `updated ${justMerged.updated}` : null,
                  ]
                    .filter(Boolean)
                    .join(", ")}
            </span>
          )}
          <button className="btnSecondary" onClick={loadNewSuggestions}>
            <RefreshCw size={14} style={{ marginRight: 6 }} />
            Refresh from research{priceRangeFilter !== "all" && priceRangeFilter !== "unpriced" ? ` (${PRICE_RANGES.find((r) => r.key === priceRangeFilter)?.label})` : ""}
          </button>
          {!confirmingReset ? (
            <button className="btnSecondary" onClick={() => setConfirmingReset(true)} style={{ color: "#B4472E" }}>
              Reset list
            </button>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#B4472E" }}>Discards custom targets & notes — sure?</span>
              <button className="btnSecondary" onClick={hardReset} style={{ color: "#B4472E", fontWeight: 700 }}>
                Yes, reset
              </button>
              <button className="btnSecondary" onClick={() => setConfirmingReset(false)}>
                Cancel
              </button>
            </span>
          )}
          <button className="btnPrimary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add target
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div style={{ padding: "3rem 0", textAlign: "center", color: "#5C6270", border: "1px solid #2C303B", borderRadius: 10 }}>
          {targets.length === 0 ? "No targets yet." : "No targets match this filter."}
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
            title="Confidence score — how likely this makes you money"
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
            {t.performanceTrend && (
              <span className="mono" style={{ fontSize: 10, color: TREND_STYLE[t.performanceTrend]?.color || "#6B7180", marginLeft: 8 }}>
                {TREND_STYLE[t.performanceTrend]?.icon} {t.performanceTrend}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          {priceRange && (
            <span className="mono" style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: "#5C7A9922", color: "#5C7A99" }}>
              {priceRange.label}
            </span>
          )}
          <span className="mono" style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: `${tierStyle.color}22`, color: tierStyle.color }}>
            {t.tier}
          </span>
          <span className="mono" style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: `${statusColor}22`, color: statusColor }}>
            {t.status}
          </span>
          <ChevronRight size={14} style={{ color: "#5C6270" }} />
        </div>
      </div>
      {t.cardToLookFor && (
        <div style={{ fontSize: 11.5, color: "#8B90A0", marginBottom: 4 }}>{t.cardToLookFor}</div>
      )}
      <div style={{ color: "#C6CAD4", fontSize: 12.5, lineHeight: 1.6, marginBottom: 10 }}>{t.reasoning}</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button className="btnSecondary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, padding: "5px 10px" }} onClick={copy}>
          {copyState === "copied" ? <Check size={12} /> : <Copy size={12} />} {copyState === "copied" ? "Copied" : "Copy search"}
        </button>
        <a
          href={ebayUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="btnSecondary"
          style={{ display: "flex", alignItems: "center", fontSize: 11.5, padding: "5px 10px", textDecoration: "none" }}
        >
          Search eBay
        </a>
        {copyState === "failed" && <span style={{ fontSize: 11, color: "#B4472E" }}>Couldn't auto-copy — try again</span>}
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
            <Field label="Sport">
              <select value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })}>
                {SPORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Card to look for">
            <input value={form.cardToLookFor} onChange={(e) => setForm({ ...form, cardToLookFor: e.target.value })} placeholder="e.g. 2026 Prizm rookie autos" />
          </Field>
          <Field label="Tier">
            <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}>
              <option>Buy Now</option>
              <option>Speculative</option>
            </select>
          </Field>
          <div style={{ fontSize: 11, color: "#6B7180" }}>
            No score to set — it starts at a neutral baseline for the tier you picked and only moves if it gets researched (via Refresh from research) or left to age.
          </div>
          <Field label="Why">
            <input value={form.reasoning} onChange={(e) => setForm({ ...form, reasoning: e.target.value })} placeholder="Draft capital, landing spot, production…" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Target price (raw)"><input type="number" step="0.01" value={form.targetPriceRaw} onChange={(e) => setForm({ ...form, targetPriceRaw: e.target.value })} /></Field>
            <Field label="Target price (graded)"><input type="number" step="0.01" value={form.targetPriceGraded} onChange={(e) => setForm({ ...form, targetPriceGraded: e.target.value })} /></Field>
          </div>
          <button className="btnPrimary" type="submit" style={{ justifyContent: "center", marginTop: 6 }}>
            Add to watchlist
          </button>
        </form>
      </div>
    </div>
  );
}

function TargetDetailModal({ target, onUpdate, onDelete, onClose }) {
  const tierStyle = TARGET_TIER_STYLE[target.tier] || TARGET_TIER_STYLE["Buy Now"];
  const score = computeConfidence(target);
  const confColor = confidenceColor(score);
  const age = monthsSince(target.lastRefreshed || target.monthAdded);
  const trendMult = TREND_DECAY_MULTIPLIER[target.performanceTrend] ?? 1;
  const decay = Math.min(CONFIDENCE_MAX_DECAY, Math.max(0, (age - CONFIDENCE_GRACE_MONTHS) * CONFIDENCE_DECAY_PER_MONTH * trendMult));

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 12, color: "#8B90A0" }}>{SPORT_EMOJI[target.sport] || "🎴"} {target.sport} · added {target.monthAdded}</div>
            <h2 className="oswald" style={{ margin: "2px 0 0", fontSize: 21 }}>{target.player}</h2>
          </div>
          <X size={20} style={{ cursor: "pointer", color: "#8B90A0" }} onClick={onClose} />
        </div>

        <div style={{ display: "flex", gap: 8, margin: "8px 0 10px" }}>
          <span className="mono" style={{ display: "inline-block", fontSize: 11, padding: "3px 10px", borderRadius: 999, background: `${tierStyle.color}22`, color: tierStyle.color }}>
            {target.tier}
          </span>
          <span className="mono" style={{ display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: `${confColor}22`, color: confColor, border: `1px solid ${confColor}55` }}>
            Score: {score}
          </span>
        </div>

        <div style={{ fontSize: 11, color: "#6B7180", marginBottom: 16, lineHeight: 1.6 }}>
          Auto-calculated, not set by hand: research baseline {target.researchScore ?? 50}
          {decay > 0
            ? ` − ${Math.round(decay)} for going ${Math.floor(age)} month${Math.floor(age) === 1 ? "" : "s"} without a refresh (${target.performanceTrend || "Stable"} trend ${trendMult < 1 ? "slows this down" : trendMult > 1 ? "speeds this up" : "at normal rate"})`
            : " (refreshed recently, no decay yet)"}
          . Hit "Refresh from research" on the main page to reset it against the latest research.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Status">
            <select value={target.status} onChange={(e) => onUpdate(target.id, { status: e.target.value })}>
              {TARGET_STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Tier">
            <select value={target.tier} onChange={(e) => onUpdate(target.id, { tier: e.target.value })}>
              <option>Buy Now</option>
              <option>Speculative</option>
            </select>
          </Field>
          <Field label="Performance trend">
            <select value={target.performanceTrend || "Stable"} onChange={(e) => onUpdate(target.id, { performanceTrend: e.target.value })}>
              <option>Improving</option>
              <option>Stable</option>
              <option>Declining</option>
            </select>
          </Field>
          <div style={{ fontSize: 10.5, color: "#6B7180", marginTop: -6 }}>
            Improving barely decays over time (still performing = still a good pick even unrefreshed). Declining decays fast. This is the honest signal to update if you're tracking the player/team yourself.
          </div>
          <Field label="Card to look for">
            <input value={target.cardToLookFor} onChange={(e) => onUpdate(target.id, { cardToLookFor: e.target.value })} />
          </Field>
          <Field label="Why">
            <input value={target.reasoning} onChange={(e) => onUpdate(target.id, { reasoning: e.target.value })} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Target price (raw)"><input type="number" step="0.01" value={target.targetPriceRaw ?? ""} onChange={(e) => onUpdate(target.id, { targetPriceRaw: e.target.value })} /></Field>
            <Field label="Target price (graded)"><input type="number" step="0.01" value={target.targetPriceGraded ?? ""} onChange={(e) => onUpdate(target.id, { targetPriceGraded: e.target.value })} /></Field>
          </div>

          <button
            onClick={() => { onDelete(target.id); onClose(); }}
            style={{ background: "transparent", border: "1px solid #4a2a24", color: "#B4472E", borderRadius: 8, padding: "9px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}
          >
            <Trash2 size={14} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Selling Playbook =====

const FEE_COMPARISON = [
  { platform: "eBay Live", fee: "~8.9% + $0.30", note: "Cheaper than standard eBay, but needs an approved account + enough volume/following to fill a stream" },
  { platform: "COMC Direct 2 eBay Live", fee: "$5 + 8% (5% on $1,000+)", note: "Gets eBay Live's audience without you needing your own following — send cards in, they stream them" },
  { platform: "Whatnot (AU promo hours)", fee: "~7% all-in", note: "2am-4pm AEST/AEDT daily, through Dec 31 2026 — same following/volume caveat as eBay Live" },
  { platform: "Whatnot (standard)", fee: "~10.9% + $0.30", note: "8% commission + processing, outside promo hours" },
  { platform: "Standard eBay", fee: "~13.25% + $0.30", note: "No Store subscription, always available, no approval gate" },
  { platform: "DCSports87 consignment", fee: "~15-20% effective", note: "Full walkthrough + alternatives below — not always the cheapest" },
  { platform: "ShipMyCards Marketplace", fee: "Low, unconfirmed exact %", note: "Check their current fee page before relying on a number" },
  { platform: "Facebook Marketplace/groups", fee: "0%", note: "No platform fee, but no buyer protection either" },
];

function SellingPlaybook() {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontSize: 13, color: "#8B90A0", marginBottom: 20, lineHeight: 1.6 }}>
        Where to sell depends less on the card and more on <span style={{ color: "#C9A227" }}>where it physically is right now</span>. The single biggest lever isn't platform fees — it's avoiding paying for international shipping twice.
      </div>

      <div style={{ border: "1px solid #C9A22755", borderRadius: 10, padding: "14px 16px", marginBottom: 24, background: "#C9A2270f" }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: "#C9A227", marginBottom: 8 }}>🧠 Golden rule</div>
        <div style={{ fontSize: 13, color: "#EDEAE1", lineHeight: 1.6 }}>
          If a card is sitting in a US vault (ShipMyCards) and you have no interest in keeping it, <b>don't ship it home first</b>. Bringing it to Australia costs shipping once to get it here, then again to send it back overseas to whoever buys it — you're paying for two international legs instead of one domestic US one.
        </div>
      </div>

      <SectionTitle>Fee comparison, quick reference</SectionTitle>
      <div style={{ border: "1px solid #2C303B", borderRadius: 10, overflow: "hidden", marginBottom: 28 }}>
        <table style={{ width: "100%", fontSize: 12.5, color: "#C6CAD4", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1D2028", textAlign: "left" }}>
              <th style={{ padding: "8px 12px", fontWeight: 500, color: "#8B90A0" }}>Platform</th>
              <th style={{ padding: "8px 12px", fontWeight: 500, color: "#8B90A0" }}>Approx. fee</th>
              <th style={{ padding: "8px 12px", fontWeight: 500, color: "#8B90A0" }}>Note</th>
            </tr>
          </thead>
          <tbody>
            {FEE_COMPARISON.map((f, i) => (
              <tr key={i} style={{ borderTop: "1px solid #24272F" }}>
                <td style={{ padding: "8px 12px", fontWeight: 600, color: "#EDEAE1" }}>{f.platform}</td>
                <td style={{ padding: "8px 12px", color: "#C9A227" }} className="mono">{f.fee}</td>
                <td style={{ padding: "8px 12px", color: "#6B7180" }}>{f.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionTitle>Pick your scenario</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <ScenarioCard
          icon="📦"
          title="Card is in the ShipMyCards vault, no interest in keeping it"
          color="#4E8B6B"
          body="Never bring it home first — see the golden rule above. Sell it while it's still in the US so you only pay one domestic shipping leg, not two international ones."
          steps={[
            "First choice for most cards: DCSports87 consignment (~15-20% effective cut, but they handle photography, listing, and shipping, and their established eBay account sells for more than a brand-new listing would)",
            "Sign up at dcsports87.com, then from your ShipMyCards dashboard request a shipment addressed to DCSports87's submission address — not to yourself",
            "Check eligibility first: singles (raw or graded) or sealed boxes/cases only — no lots, no loose packs, no reprints/customs",
            "Include their printed submission form in the package, pick standard or Premium ($5/card, 1-business-day listing) service tier",
            "Alternative: ShipMyCards Marketplace for a lower fee if you're comfortable managing your own listing inside their ecosystem",
            "Alternative for high-value graded cards: PWCC consignment through ShipMyCards, for more exposure on expensive singles",
          ]}
        />
        <ScenarioCard
          icon="🏦"
          title="Cards you're holding for future investment (Monthly Targets)"
          color="#5C7A99"
          body="Not a selling decision yet — a storage decision. If it's US-sourced and you're not planning to touch it for a while, leaving it in the ShipMyCards vault is usually cheaper than paying to ship it home and then out again later. If it's something you want to physically hold or protect yourself, bring it in hand."
          steps={[
            "US-sourced, long hold, not fussed about having it physically: leave it in the ShipMyCards vault — saves the round-trip shipping cost until you're actually ready to sell",
            "Something you want to enjoy owning, or a local AFL/Australian card: bring it in hand",
            "When it's time to actually sell, come back to this page and pick the scenario that matches where it is then",
          ]}
        />
        <ScenarioCard
          icon="✋"
          title="Cards already in hand (Australia)"
          color="#C9A227"
          body="Live-platform fees only apply once you're actually live, which needs seller approval plus enough volume or a following to fill a stream. Not worth building for one card — factor that in before chasing the cheapest number on paper."
          steps={[
            "Standard eBay is the realistic default for a single card or small batch with no existing following — ~13.25% + $0.30, always available, no approval gate",
            "eBay Live if you have an approved account and enough cards to fill a stream, or an existing following — ~8.9% + $0.30, genuinely cheaper than standard eBay",
            "Whatnot during Australian promo hours (2am-4pm AEST/AEDT, through Dec 2026) — ~7% all-in, same following/volume caveat applies",
            "Want eBay Live's cheaper fee without building a following? COMC's \"Direct 2 eBay Live\" service runs your card through their established stream for $5 + 8% (5% on $1,000+ sales)",
            "Facebook Marketplace/local groups for a quick no-fee sale if you're not fussed about buyer protection and can meet locally",
          ]}
        />
        <ScenarioCard
          icon="🇦🇺"
          title="Cards bought from Australia (AFL, local shows, AU sellers)"
          color="#8B6FD6"
          body="Same in-hand logic applies, but local content often has a smaller, more Australia-specific buyer pool. Worth checking local demand before defaulting to the global eBay audience."
          steps={[
            "Check Australian-specific Facebook groups and forums (OzCardTrader, AFL-specific groups) first for genuinely local content like AFL — buyers there often pay fair value faster than waiting on global eBay traffic",
            "If it's a crossover card with US demand (an AFL star with global name recognition, or anything with international appeal), standard eBay or eBay Live still reach the widest pool",
            "Otherwise, same ranking as the general in-hand scenario above",
          ]}
        />
        <ScenarioCard
          icon="🔀"
          title="Any other scenario — quick decision flow"
          color="#B4472E"
          body="If none of the above quite fits, work through these in order."
          steps={[
            "Is it still in a US vault and you don't want to keep it? → Don't ship it home. Consign or sell it from there.",
            "Is it worth $1,000+? → Look at Fanatics Collect (formerly PWCC) or a specialist high-value consignor for better exposure, not a generic listing",
            "Is it AFL or otherwise Australia-specific? → Check local groups before defaulting to eBay's global audience",
            "Do you have eBay Live access or the ability to go live on Whatnot during AU promo hours? → Use whichever is cheaper for that item",
            "None of the above? → Standard eBay is the reliable, always-available fallback",
          ]}
        />
      </div>

      <div style={{ height: 12 }} />
      <SectionTitle>DCSports87, step by step</SectionTitle>
      <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "18px 20px", background: "#191B22", marginBottom: 28 }}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#C6CAD4", lineHeight: 2 }}>
          <li>Sign up for a consignor account at <span className="mono" style={{ color: "#C9A227" }}>dcsports87.com</span>.</li>
          <li>Sort what you're sending — they take singles (raw or graded, any sport/TCG) and sealed boxes/cases. They <b>don't</b> take lots, loose packs, or altered/custom/reprint cards.</li>
          <li>Decide service tier: standard, or Premium (+$5/card) for 1-business-day listing turnaround if you want it moving fast.</li>
          <li>Don't ship from Australia — route it through ShipMyCards. From your SMC dashboard, request a shipment addressed to DCSports87's submission address instead of to yourself, so it's one domestic US leg instead of two international ones.</li>
          <li>Include their printed submission form in the package, noting your chosen service tier.</li>
          <li>Track it on your DCSports87 dashboard — a notification fires once the package arrives (usually same day, sometimes next business day) with an estimated listing date.</li>
          <li>They photograph, title, and list each card individually on their established eBay account. Payouts go out multiple times a day, including Sundays, once something sells.</li>
        </ol>
        <div style={{ marginTop: 14, fontSize: 11.5, color: "#6B7180" }}>
          Payout tiers: $1-9.99 → 80% minus 75¢ · $10-24.99 → 80% minus 50¢ · $25-999.99 → 85% minus 50¢ · $1,000-4,999.99 → 90% · $5,000+ → 97% minus $300. That's roughly 15-20% effective on typical mid-value cards.
        </div>
      </div>

      <SectionTitle>Is DCSports87 actually the best option?</SectionTitle>
      <div style={{ border: "1px solid #4E8B6B55", borderRadius: 10, padding: "16px 18px", background: "#4E8B6B0f", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#4E8B6B", marginBottom: 12 }}>💰 The value-based rule</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div style={{ background: "#14161C", border: "1px solid #24272F", borderRadius: 8, padding: "12px 14px" }}>
            <div className="oswald" style={{ fontSize: 15, fontWeight: 700, color: "#C9A227", marginBottom: 4 }}>Under $1,000</div>
            <div style={{ fontSize: 12.5, color: "#C6CAD4" }}>→ DCSports87. Raw or graded, no minimum, they take everyday mixed-value cards Fanatics won't bother with.</div>
          </div>
          <div style={{ background: "#14161C", border: "1px solid #4E8B6B55", borderRadius: 8, padding: "12px 14px" }}>
            <div className="oswald" style={{ fontSize: 15, fontWeight: 700, color: "#4E8B6B", marginBottom: 4 }}>$1,000+ (especially graded)</div>
            <div style={{ fontSize: 12.5, color: "#C6CAD4" }}>→ Fanatics Collect (PWCC), <span style={{ color: "#4E8B6B" }}>already available through ShipMyCards</span> — no new account needed.</div>
          </div>
        </div>
        <div style={{ fontSize: 11.5, color: "#6B7180", lineHeight: 1.7 }}>
          Full honesty on the number: this isn't a fee-math crossover — Fanatics Collect's 6% Buy Now fee is actually cheaper than DCSports87 at nearly every value tier, only catching up around $10,000+ where DCSports87's top payout tier (97% minus $300) pulls back ahead. $1,000 is a <b>practical fit</b> line instead: it's where Fanatics Collect's own stated audience starts — <span style={{ fontStyle: "italic" }}>"PSA 9 or 10 of a major player, vintage material worth $1,000+"</span> is literally how they describe who they're for — and where DCSports87's no-minimum convenience stops being worth the extra ~5-10% you're leaving on the table. Below $1,000, DCSports87 wins on practicality even though it's not the cheaper option on paper.
        </div>
      </div>

      <div style={{ fontSize: 12.5, color: "#8B90A0", marginBottom: 14, lineHeight: 1.6 }}>
        Full comparison, for anything that doesn't fit neatly into those two buckets:
      </div>
      <div style={{ border: "1px solid #2C303B", borderRadius: 10, overflow: "hidden", marginBottom: 28 }}>
        <table style={{ width: "100%", fontSize: 12, color: "#C6CAD4", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1D2028", textAlign: "left" }}>
              <th style={{ padding: "8px 12px", fontWeight: 500, color: "#8B90A0" }}>Consignor</th>
              <th style={{ padding: "8px 12px", fontWeight: 500, color: "#8B90A0" }}>Effective fee</th>
              <th style={{ padding: "8px 12px", fontWeight: 500, color: "#8B90A0" }}>Best for</th>
            </tr>
          </thead>
          <tbody>
            {CONSIGNMENT_COMPARISON.map((c, i) => (
              <tr key={i} style={{ borderTop: "1px solid #24272F" }}>
                <td style={{ padding: "8px 12px", fontWeight: 600, color: "#EDEAE1" }}>{c.name}</td>
                <td style={{ padding: "8px 12px", color: "#C9A227" }} className="mono">{c.fee}</td>
                <td style={{ padding: "8px 12px", color: "#6B7180" }}>{c.bestFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const CONSIGNMENT_COMPARISON = [
  { name: "DCSports87", fee: "~15-20%", bestFor: "Everyday mixed-value cards, no minimum, fully hands-off" },
  { name: "Fanatics Collect (PWCC)", fee: "6% Buy Now, or 0%+20% buyer premium at auction", bestFor: "Graded $1,000+ singles — already accessible via ShipMyCards" },
  { name: "Probstein / P123", fee: "~8-12%", bestFor: "High-value cards, no public rate card — confirm directly first" },
  { name: "COMC", fee: "~5% + per-card ingestion fee", bestFor: "Large raw collections (100+ cards), patient sellers — slow (up to 16 wks)" },
  { name: "MySlabs", fee: "~4-5%", bestFor: "Graded cards, cheapest fees — but you list and manage it yourself" },
];

function ScenarioCard({ icon, title, color, body, steps }) {
  return (
    <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "16px 18px", background: "#191B22" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div>
          <div className="oswald" style={{ fontSize: 16, fontWeight: 600, color }}>{title}</div>
          <div style={{ fontSize: 12.5, color: "#A7ADBB", marginTop: 4, lineHeight: 1.6 }}>{body}</div>
        </div>
      </div>
      <ol style={{ margin: "10px 0 0", paddingLeft: 20, fontSize: 12.5, color: "#C6CAD4", lineHeight: 1.9 }}>
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  );
}

// ===== Content Creation =====

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

// Turns what's already tracked in the app into concrete video/post ideas, so the starting
// point is never a blank page — every idea below is something already worked out in numbers.
function generateContentIdeas(cards, pokemonCards, targets, boxBreaks, salesItems) {
  const ideas = [];
  const allActive = [...cards.map(computeCard), ...pokemonCards.map(computePokemonCard)];
  const currentMonthIdx = new Date().getMonth();

  // No calendar entry (Pokémon, WNBA, Other) never blocks an idea — only sports actually on
  // the seasonal calendar get checked against it.
  function calendarSaysNow(sport, wantedAction) {
    const action = seasonActionForMonth(sport, currentMonthIdx);
    if (action == null) return true;
    return action === wantedAction;
  }

  const actionable = allActive
    .filter((c) => ["Sell Raw First", "Grade First", "Sell PSA 9", "Sell PSA 10"].includes(c.sellDecision))
    .sort((a, b) => b.totalCost - a.totalCost);

  const sellableNow = actionable.filter((c) => calendarSaysNow(c.sport, "SELL"));
  if (sellableNow.length > 0) {
    const c = sellableNow[0];
    ideas.push({
      title: `Time to Sell: My ${c.player} ${c.card} — Here's My Exact Math`,
      pillar: "Sell/Flip Update",
      platform: "YouTube Shorts",
      hook: `"I bought this for $${c.totalCost.toFixed(2)} — here's exactly why it's time to sell."`,
      source: `Pulled from My Cards, and the timing lines up — your seasonal calendar shows ${c.sport} is in its Sell window right now.`,
      outline: [
        `Hook (say it in the first 2 seconds): show the card, state what you paid`,
        `Context: how you found it / why you bought it`,
        `The math: current value vs cost, why the numbers say sell now`,
        `Close: what you're doing next, remind viewers to check their own cards`,
      ],
    });
  } else if (actionable.length > 0) {
    // Flagged to sell, but the calendar says this sport's audience isn't in buying mode right
    // now — a "why I'm holding" angle is more honest content than pretending it's sell time
    // when it isn't.
    const c = actionable[0];
    const currentAction = seasonActionForMonth(c.sport, currentMonthIdx);
    ideas.push({
      title: `Why I'm Holding My ${c.player} ${c.card} (Even Though It's Profitable to Sell)`,
      pillar: "Sell/Flip Update",
      platform: "YouTube Shorts",
      hook: `"This card is sitting on real profit right now — here's why I'm not selling it yet."`,
      source: `Pulled from My Cards — flagged to sell, but your seasonal calendar shows ${c.sport} is a${currentAction ? ` ${currentAction.toLowerCase()}` : ""} month right now, not the Sell window`,
      outline: [
        `Hook: show the card, state the profit it's sitting on right now`,
        `The reasoning: why timing matters more than a quick sale — explain the seasonal pattern for this sport`,
        `What you're doing instead: grading it, holding, or just waiting`,
        `Close: when you'll actually sell, and why patience pays in this hobby`,
      ],
    });
  }

  const buyNowTargets = [...targets].filter((t) => t.tier === "Buy Now").sort((a, b) => computeConfidence(b) - computeConfidence(a));
  const buyNowNow = buyNowTargets.filter((t) => calendarSaysNow(t.sport, "BUY"));
  const bestBuyTarget = buyNowNow[0] || buyNowTargets[0];
  if (bestBuyTarget) {
    const t = bestBuyTarget;
    const aligned = buyNowNow.length > 0;
    ideas.push({
      title: `Why I'm Watching ${t.player} Right Now`,
      pillar: "Rookie Card Spotlights",
      platform: "YouTube (long-form)",
      hook: `"This is the card I'm watching right now, and here's why — not financial advice, just my own homework."`,
      source: aligned
        ? `Pulled from Monthly Targets, and it lines up — your seasonal calendar shows ${t.sport} is in its Buy window right now.`
        : "Pulled from Monthly Targets — your highest-confidence current pick",
      outline: [
        `Hook: show the card or a picture of the player`,
        `The reasoning: why this player, why now (use your own notes on the target)`,
        `What to look for: ${t.cardToLookFor || "which card/set to chase"}`,
        `Close: this isn't financial advice, just your own research — invite comments`,
      ],
    });
  }

  const budgetTargets = targets.filter((t) => {
    const v = Number(t.targetPriceRaw) || Number(t.targetPriceGraded);
    return v && v <= 50;
  });
  if (budgetTargets.length > 0) {
    ideas.push({
      title: "Budget Picks Under $50 Right Now",
      pillar: "Budget-Friendly Investing",
      platform: "YouTube (long-form)",
      hook: `"You don't need thousands of dollars to start — here's what I'm watching under $50 right now."`,
      source: `Pulled from Monthly Targets — ${budgetTargets.length} target${budgetTargets.length === 1 ? "" : "s"} under $50`,
      outline: [
        `Hook: "You don't need thousands to start" — set the budget angle up front`,
        `Walk through each pick: player, why, roughly what to pay`,
        `Show your own math for one of them (paid vs expected value)`,
        `Close: ask viewers what budget picks they're watching`,
      ],
    });
  }

  const completedBoxes = boxBreaks.filter((b) => b.status === "Completed");
  if (completedBoxes.length > 0) {
    const box = completedBoxes[0];
    const t = boxTotals(box);
    ideas.push({
      title: `Box Break Recap: Was My ${box.name} Worth It?`,
      pillar: "Pack & Box Openings",
      platform: "TikTok",
      hook: `"This box cost me $${t.cost.toFixed(2)} — did it actually pay off? Let's find out."`,
      source: "Pulled from Box Breaks — your most recent completed break",
      outline: [
        `Hook: show the empty box, state what it cost`,
        `Recap the spots/pulls — best moment first`,
        `The numbers: revenue $${t.revenue.toFixed(2)}, profit ${t.profit >= 0 ? "+" : ""}$${t.profit.toFixed(2)}`,
        `Close: would you run this box again? Why or why not`,
      ],
    });
  }

  // Deliberately aggregated, not a single-flip video — five $3-5 flips read as one solid
  // number and one solid story instead of five videos that each feel "too small" to post.
  const recentSold = salesItems.filter((s) => s.status === "Sold");
  if (recentSold.length > 0) {
    const totalProfit = recentSold.reduce((s, i) => s + (Number(i.realisedProfit) || 0), 0);
    ideas.push({
      title: "What I Sold This Month (And Why)",
      pillar: "Sell/Flip Update",
      platform: "Multiple",
      hook: `"I sold ${recentSold.length} cards this month for a total of ${fmtMoney(totalProfit)} profit — here's the breakdown."`,
      source: `Pulled from My Sales — ${recentSold.length} card${recentSold.length === 1 ? "" : "s"} sold. Aggregating small flips into one total is usually a stronger video than posting each one alone.`,
      outline: [
        `Hook: total realised profit for the month, upfront — say the number, not each flip`,
        `Walk through 2-3 sales — what it was, what it sold for, why`,
        `Any surprises — sold above or below what you expected?`,
        `Close: what's queued up to sell next`,
      ],
    });
  }

  // Evergreen ideas — always available, good fit for short-form on TikTok/Shorts specifically
  ideas.push({
    title: "Quick Tip: When Is It Actually Worth Grading a Card?",
    pillar: "Grading & Raw Tips",
    platform: "TikTok",
    hook: `"Don't grade this card — here's the rule I actually use."`,
    source: "Evergreen — built from your own grading cost tiers already in Tips & Tricks",
    outline: [
      `Hook (first line, on screen too): "Don't grade this card" — show a raw card as the example`,
      `The rule: PSA 10 GGR needs to clear the grading cost + fees, not just look nice`,
      `Quick maths on screen — cost to grade vs expected payoff`,
      `Close: "Check the app before you submit anything"`,
    ],
  });
  ideas.push({
    title: "Raw vs Graded: The Real Cost Nobody Tells You About",
    pillar: "Grading & Raw Tips",
    platform: "YouTube Shorts",
    hook: `"This card cost me way more to sell than I expected — here's why."`,
    source: "Evergreen — pulled from your Selling Playbook fee comparisons",
    outline: [
      `Hook: "This card cost me $X more to sell than I expected"`,
      `Break down the real fees — platform + shipping + grading, stacked up`,
      `The lesson: know your total cost before you ever list it`,
      `Close: quick call to action, ask what platform they use`,
    ],
  });

  return ideas.slice(0, 8);
}

function countPostedInPeriod(contentPlan, period) {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - (period === "week" ? 7 : 30));
  return contentPlan.filter((c) => c.status === "Posted" && c.datePosted && new Date(c.datePosted) >= cutoff).length;
}

function ContentCreation({ cards, pokemonCards, targets, boxBreaks, salesItems, contentPlan, setContentPlan, contentGoal, setContentGoal }) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const ideas = useMemo(
    () => generateContentIdeas(cards, pokemonCards, targets, boxBreaks, salesItems),
    [cards, pokemonCards, targets, boxBreaks, salesItems]
  );

  function addFromIdea(idea) {
    setContentPlan((prev) => [newContentItem(idea), ...prev]);
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
        if (updates.status === "Posted" && c.status !== "Posted") {
          next.datePosted = new Date().toISOString().slice(0, 10);
        }
        return next;
      })
    );
  }
  function deleteItem(id) {
    setContentPlan((prev) => prev.filter((c) => c.id !== id));
    setSelectedId(null);
  }

  const visible = statusFilter === "all" ? contentPlan : contentPlan.filter((c) => c.status === statusFilter);
  const selected = selectedId ? contentPlan.find((c) => c.id === selectedId) : null;
  const postedCount = contentPlan.filter((c) => c.status === "Posted").length;
  const postedInPeriod = countPostedInPeriod(contentPlan, contentGoal.period);
  const goalHit = postedInPeriod >= contentGoal.count;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "16px 18px", marginBottom: 24, background: "#191B22" }}>
        <div style={{ fontSize: 13, color: "#C6CAD4", lineHeight: 1.7 }}>
          Every idea below is pulled straight from data you've already tracked in this app — you're not performing or improvising, you're just explaining numbers and decisions you already worked out. That's a much easier thing to say out loud than "content." Budget Card Collector is a good angle to keep leaning into, since it's specific and it's already working — the "eventually more expensive collections" pivot can happen gradually as your own collection grows, no need to force it early.
        </div>
      </div>

      <SectionTitle>Your goal</SectionTitle>
      <div style={{ border: `1px solid ${goalHit ? "#4E8B6B55" : "#2C303B"}`, borderRadius: 10, padding: "16px 18px", marginBottom: 24, background: goalHit ? "#4E8B6B0f" : "#191B22" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#8B90A0" }}>Post</span>
            <input
              type="number"
              min="1"
              value={contentGoal.count}
              onChange={(e) => setContentGoal({ ...contentGoal, count: Math.max(1, Number(e.target.value) || 1) })}
              style={{ width: 60, padding: "6px 8px", textAlign: "center" }}
            />
            <select
              value={contentGoal.period}
              onChange={(e) => setContentGoal({ ...contentGoal, period: e.target.value })}
              style={{ width: "auto" }}
            >
              <option value="week">per week</option>
              <option value="month">per month</option>
            </select>
          </div>
          <div className="oswald" style={{ fontSize: 18, fontWeight: 700, color: goalHit ? "#4E8B6B" : "#C9A227" }}>
            {postedInPeriod} / {contentGoal.count} posted this {contentGoal.period}
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#8B90A0", lineHeight: 1.6 }}>
          {goalHit
            ? "Goal hit for this period — anything extra is a bonus, not a requirement."
            : "Set this to something you can actually hit most weeks, even a low number. One consistent post beats a burst of five followed by a month of nothing."}
          {" "}Research backs this up directly: 2-3 Shorts/TikToks a week is the minimum that actually moves an algorithm, but even below that, consistency matters more than volume — showing up regularly is what the algorithm and an audience both respond to.
        </div>
        <div style={{ fontSize: 11.5, color: "#6B7180", marginTop: 10, paddingTop: 10, borderTop: "1px solid #24272F" }}>
          <span style={{ color: "#C9A227", fontWeight: 600 }}>Repurpose instead of reinventing:</span> one filming session can cover more than one goal. Film a card recap once, then cut it into a Short/TikTok, use the same footage in a monthly recap video, and grab a still for Instagram. That's three posts toward your goal from one sitting.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1, background: "#2C303B", border: "1px solid #2C303B", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
        <Stat label="In the pipeline" value={contentPlan.length} />
        <Stat label="Posted" value={postedCount} color="#4E8B6B" />
        <Stat label="Fresh ideas ready" value={ideas.length} color="#C9A227" />
      </div>

      <SectionTitle>Format &amp; platform strategy</SectionTitle>
      <div style={{ border: "1px solid #C9A22755", borderRadius: 10, padding: "16px 18px", marginBottom: 28, background: "#C9A2270f" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#C9A227", marginBottom: 6 }}>📱 TikTok &amp; YouTube Shorts</div>
            <div style={{ fontSize: 12, color: "#C6CAD4", lineHeight: 1.7 }}>
              Both currently favor small/new creators — TikTok is leaning on content discovery over follower count right now, and the smallest YouTube channels are seeing the fastest growth of any size bracket. Every video gets tested fresh against a small audience regardless of your subscriber count, so there's no real barrier to starting.
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#C9A227", marginBottom: 6 }}>⏱️ The hook is everything</div>
            <div style={{ fontSize: 12, color: "#C6CAD4", lineHeight: 1.7 }}>
              Average watch time on a Short is now around 16 seconds — Shorts need roughly 65% retention (sub-30s) or 50% (30-60s) to get pushed wider. Say the most interesting thing in your first sentence, not your third. Every idea below now has a suggested hook line for exactly this reason.
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#C6CAD4", lineHeight: 1.7, borderTop: "1px solid #C9A22733", paddingTop: 12 }}>
          <span style={{ color: "#4E8B6B", fontWeight: 600 }}>On small flips specifically:</span> don't post them one at a time — a single $3-5 flip can feel too small to bother with, but five of them add up to a real number worth sharing. That's why "What I Sold This Month" is built as one aggregated recap instead of five separate videos.
        </div>
      </div>

      <SectionTitle>Ideas, pulled from your own data</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, marginBottom: 28 }}>
        {ideas.map((idea, i) => (
          <div key={i} style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              <span className="mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "#C9A22722", color: "#C9A227" }}>{idea.pillar}</span>
              <span className="mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "#5C7A9922", color: "#5C7A99" }}>{idea.platform}</span>
            </div>
            <div className="oswald" style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 6 }}>{idea.title}</div>
            {idea.hook && (
              <div style={{ fontSize: 11.5, color: "#C9A227", fontStyle: "italic", marginBottom: 8, lineHeight: 1.5 }}>
                Suggested hook: {idea.hook}
              </div>
            )}
            <div style={{ fontSize: 11, color: "#6B7180", marginBottom: 10 }}>{idea.source}</div>
            <button className="btnSecondary" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => addFromIdea(idea)}>
              <Plus size={12} style={{ marginRight: 4 }} /> Add to plan
            </button>
          </div>
        ))}
      </div>

      <SectionTitle>Your content plan</SectionTitle>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className={`filterBtn ${statusFilter === "all" ? "active" : ""}`} onClick={() => setStatusFilter("all")}>All</button>
          {CONTENT_STATUS.map((s) => (
            <button key={s} className={`filterBtn ${statusFilter === s ? "active" : ""}`} onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
        <button className="btnPrimary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add manually
        </button>
      </div>

      {visible.length === 0 ? (
        <div style={{ padding: "3rem 0", textAlign: "center", color: "#5C6270", border: "1px solid #2C303B", borderRadius: 10 }}>
          Nothing here yet — add an idea above, or add one manually.
        </div>
      ) : (
        <div style={{ border: "1px solid #2C303B", borderRadius: 10, overflow: "hidden" }}>
          {visible.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="cardRow"
              style={{ display: "grid", gridTemplateColumns: "2fr 110px 120px 90px", padding: "10px 14px", borderTop: "1px solid #24272F", cursor: "pointer", alignItems: "center", fontSize: 13 }}
            >
              <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
              <div style={{ fontSize: 11.5, color: "#8B90A0" }}>{c.pillar}</div>
              <div style={{ fontSize: 11.5, color: "#8B90A0" }}>{c.platform}</div>
              <span className="mono" style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: `${CONTENT_STATUS_COLOR[c.status]}22`, color: CONTENT_STATUS_COLOR[c.status], justifySelf: "start" }}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {showAdd && <ContentAddModal onClose={() => setShowAdd(false)} onSave={addItem} />}
      {selected && <ContentDetailModal item={selected} onUpdate={updateItem} onDelete={deleteItem} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

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
        <ModalHeader title="Add content idea" onClose={onClose} />
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
            <Field label="Pillar">
              <select value={form.pillar} onChange={(e) => setForm({ ...form, pillar: e.target.value })}>
                {CONTENT_PILLARS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Hook (your first line — say it before anything else)">
            <input value={form.hook} onChange={(e) => setForm({ ...form, hook: e.target.value })} placeholder='e.g. "This card cost me $X more to sell than I expected"' />
          </Field>
          <Field label="Talking points / outline">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={4}
              style={{ background: "#14161C", border: "1px solid #333844", color: "#EDEAE1", borderRadius: 6, padding: "9px 11px", fontSize: 14, fontFamily: "'Inter', sans-serif", width: "100%", resize: "vertical" }}
              placeholder="Hook / context / the numbers / close — bullet points are fine, this isn't a script"
            />
          </Field>
          <button className="btnPrimary" type="submit" style={{ justifyContent: "center", marginTop: 6 }}>
            Add to plan
          </button>
        </form>
      </div>
    </div>
  );
}

function ContentDetailModal({ item, onUpdate, onDelete, onClose }) {
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title={item.title} onClose={onClose} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Platform">
              <select value={item.platform} onChange={(e) => onUpdate(item.id, { platform: e.target.value })}>
                {CONTENT_PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Pillar">
              <select value={item.pillar} onChange={(e) => onUpdate(item.id, { pillar: e.target.value })}>
                {CONTENT_PILLARS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Status">
            <select value={item.status} onChange={(e) => onUpdate(item.id, { status: e.target.value })}>
              {CONTENT_STATUS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Hook (your first line)">
            <input value={item.hook || ""} onChange={(e) => onUpdate(item.id, { hook: e.target.value })} placeholder='e.g. "This card cost me $X more to sell than I expected"' />
          </Field>
          <Field label="Talking points / outline">
            <textarea
              value={item.notes}
              onChange={(e) => onUpdate(item.id, { notes: e.target.value })}
              rows={6}
              style={{ background: "#14161C", border: "1px solid #333844", color: "#EDEAE1", borderRadius: 6, padding: "9px 11px", fontSize: 14, fontFamily: "'Inter', sans-serif", width: "100%", resize: "vertical" }}
            />
          </Field>
          <button
            onClick={() => { onDelete(item.id); onClose(); }}
            style={{ background: "transparent", border: "1px solid #4a2a24", color: "#B4472E", borderRadius: 8, padding: "9px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}
          >
            <Trash2 size={14} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Lot Scanner (AI bulk card identification) =====

// ===== Lot Scanner (AI bulk card identification) =====

const LOT_SCANNER_PROMPT = `You are an expert sports card identification assistant and pricing analyst.

Analyze the image provided and identify every sports card visible in the lot with maximum detail.

Instructions:
1. Identify EVERY card present in the image individually.
2. IGNORE background elements like sticky notes, handwritten timestamps, coin tags, top loaders, magnetic cases, or tabletop textures.
3. Inspect fine visual details carefully: parallel patterns (e.g., Orange Basketball/Geometric, Refractor, Silver Prizm, Cracked Ice, Holo), serial numbering, card numbers, RC logos, autographs, and set years.
4. For each detected card, return an object in a JSON array with the following fields:
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

  // Always-visible inline fields, plain onClick, no native browser dialogs — artifacts run in
  // a sandboxed iframe that blocks window.prompt/alert/confirm (they silently do nothing or
  // return instantly), which was the actual cause of the button appearing to do nothing.
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

  function deleteScan(id) {
    setSavedScans((prev) => prev.filter((s) => s.id !== id));
    if (loadedScanId === id) setLoadedScanId(null);
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
      const content = [
        ...images.map((img) => ({ type: "image", source: { type: "base64", media_type: img.mediaType, data: img.base64 } })),
        { type: "text", text: LOT_SCANNER_PROMPT },
      ];
     const firstImage = images[0];
      const parsed = await callGeminiAi(LOT_SCANNER_PROMPT, firstImage.base64, firstImage.mediaType);
      if (!Array.isArray(parsed)) throw new Error("Unexpected response shape");
      setResults(parsed);
    } catch (e) {
      console.error(e);
      setError("Couldn't identify the cards in that photo — try a clearer or better-lit shot, fewer cards per photo, or make sure each card is fully visible.");
    } finally {
      setScanning(false);
    }
  }

  function updateCardValue(idx, newValue) {
    setResults((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, estimated_value_aud: newValue === "" ? null : Number(newValue), value_confidence: "Manual" } : c))
    );
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
        Upload a photo of a lot or box of cards and Claude identifies each one — player, set, parallel, card number, and whether it's graded — plus a ready-made eBay search and a rough value estimate for each.
        <span style={{ color: "#C9A227" }}> These are AI best-guesses from a photo, not verified</span> — double-check anything before relying on it, especially card numbers and parallels, which can look near-identical across different years or sets.
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
                  <div key={scan.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #2C303B", borderRadius: 8, padding: "10px 14px", background: "#191B22" }}>
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
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btnSecondary" style={{ fontSize: 11.5, padding: "5px 10px" }} onClick={() => loadScan(scan)}>
                        View
                      </button>
                      <Trash2 size={15} style={{ cursor: "pointer", color: "#6B7180", alignSelf: "center" }} onClick={() => deleteScan(scan.id)} />
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
                ⚠️ These values are AI best-guesses from general hobby knowledge, not live sold prices — reliable-ish for common cards, shakier for anything niche or high-value. Verify anything expensive via the search links on each card before you commit to buying the lot.
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
                  onAddBuy={() => addToBuyEvaluator(card, i)}
                  onAddTarget={() => addToMonthlyTargets(card, i)}
                  onValueChange={(v) => updateCardValue(i, v)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LotScannerCard({ card, added, onAddBuy, onAddTarget, onValueChange }) {
  const [copyState, setCopyState] = useState("idle");
  const ebayUrl = card.ebay_search_query ? `https://www.ebay.com.au/sch/i.html?_nkw=${encodeURIComponent(card.ebay_search_query)}` : null;
  const point130Url = card.ebay_search_query ? `https://130point.com/sales/?search=${encodeURIComponent(card.ebay_search_query)}` : null;

  async function copy() {
    const ok = await copyToClipboard(card.ebay_search_query || "");
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => setCopyState("idle"), 2000);
  }

  return (
    <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22" }}>
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

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btnSecondary" style={{ fontSize: 11.5, padding: "5px 10px", display: "flex", alignItems: "center", gap: 6 }} onClick={copy}>
          {copyState === "copied" ? <Check size={12} /> : <Copy size={12} />} {copyState === "copied" ? "Copied" : "Copy search"}
        </button>
        {ebayUrl && (
          <a href={ebayUrl} target="_blank" rel="noreferrer" className="btnSecondary" style={{ fontSize: 11.5, padding: "5px 10px", textDecoration: "none" }}>
            Search eBay
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


// ===== Grade Check (AI photo assessment) =====

// Updated fileToBase64 with higher clarity (2048px max dimension)
function fileToBase64(file, maxDimension = 2048) {
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

        // Render high-clarity JPEG at 85% quality
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
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

function GradeCheck({ cards, pokemonCards, onUpdateCardIn }) {
  const [images, setImages] = useState([]); // [{name, base64, mediaType, previewUrl}]
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

  const allCards = useMemo(
    () => [...cards.map((c) => ({ ...c, _src: "cards" })), ...pokemonCards.map((c) => ({ ...c, _src: "pokemon" }))],
    [cards, pokemonCards]
  );

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
      const content = [
        ...images.map((img) => ({ type: "image", source: { type: "base64", media_type: img.mediaType, data: img.base64 } })),
        { type: "text", text: GRADE_CHECK_PROMPT },
      ];
      const firstImage = images[0];
      const parsed = await callGeminiAi(GRADE_CHECK_PROMPT, firstImage ? firstImage.base64 : null, firstImage ? firstImage.mediaType : "image/jpeg");
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

    let recommendation = "Not enough data";
    if (gradedProfit != null) {
      if (gradedProfit <= 0) recommendation = "Don't grade";
      else if (rawProfit != null && rawProfit >= gradedProfit) recommendation = "Sell raw instead";
      else recommendation = "Worth grading";
    }

    return { rawProfit, gradedProfit, expectedRevenue, gCost, totalCostGraded, recommendation };
  }, [result, form]);

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontSize: 13, color: "#8B90A0", marginBottom: 16, lineHeight: 1.6 }}>
        Upload front/back photos and Claude will assess condition the way a grader would, then run the same profit math as the rest of the app against your comps.
        <span style={{ color: "#C9A227" }}> This is a photo-based estimate, not a real grade</span> — lighting and resolution hide flaws a grader would catch in hand, so treat it as directional, not a promise.
        Photos through a toploader (common for ShipMyCards-held cards) or with a sticker over any part of the card get flagged automatically — check for an "Obstructed" warning under the result, and try a different angle if one shows up.
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
      <div style={{ fontSize: 11.5, color: "#6B7180", marginTop: 10, marginBottom: 4 }}>Market comps (leave blank if unknown)</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
        <Field label="Raw avg"><input type="number" step="0.01" value={form.rawAvg} onChange={(e) => setForm({ ...form, rawAvg: e.target.value })} /></Field>
        <Field label="PSA 9 avg"><input type="number" step="0.01" value={form.psa9Avg} onChange={(e) => setForm({ ...form, psa9Avg: e.target.value })} /></Field>
        <Field label="PSA 10 avg"><input type="number" step="0.01" value={form.psa10Avg} onChange={(e) => setForm({ ...form, psa10Avg: e.target.value })} /></Field>
        <Field label="PSA 8-or-below avg"><input type="number" step="0.01" placeholder="≈ raw" value={form.belowAvg} onChange={(e) => setForm({ ...form, belowAvg: e.target.value })} /></Field>
      </div>

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
                <div style={{ fontSize: 11.5, color: "#6B7180" }}>
                  Expected profit if graded is probability-weighted across the PSA 10/9/8-or-below chances above, net of fees, minus what grading actually costs. Add PSA 9/10 comps if this looks empty.
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ===== Business & Tax Summary =====

function currentFYLabel(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  return m >= 7 ? `${y}-${String(y + 1).slice(2)}` : `${y - 1}-${String(y).slice(2)}`;
}

function fyBounds(fyLabel) {
  const startYear = Number(fyLabel.split("-")[0]);
  return { start: `${startYear}-07-01`, end: `${startYear + 1}-06-30` };
}

function fyOptions() {
  return [currentFYLabel()];
}

function inRange(dateStr, start, end) {
  if (!dateStr) return false;
  return dateStr >= start && dateStr <= end;
}

function BusinessSummary({ cards, pokemonCards, boxBreaks, manualExpenses, setManualExpenses }) {
  const [period, setPeriod] = useState(currentFYLabel());
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ date: new Date().toISOString().slice(0, 10), description: "", amount: "" });

  const { start, end } = useMemo(() => {
    if (period === "all") return { start: "0000-01-01", end: "9999-12-31" };
    if (period === "custom") return { start: customStart || "0000-01-01", end: customEnd || "9999-12-31" };
    return fyBounds(period);
  }, [period, customStart, customEnd]);

  const ledger = useMemo(() => {
    const allCards = [...cards.map((c) => computeCard(c)), ...pokemonCards.map((c) => computePokemonCard(c))];

    const cardRows = allCards
      .filter((c) => c.status === "Sold" && inRange(c.dateSold, start, end))
      .map((c) => {
        const qty = Number(c.quantity) || 1;
        return {
          date: c.dateSold,
          type: "Card sale",
          description: `${c.player} ${c.card}`.trim(),
          revenue: (c.actualSellPrice || 0) * qty,
          cost: c.totalCost * qty,
          fees: c.actualSellPrice != null && c.netSale != null ? (c.actualSellPrice - c.netSale) * qty : 0,
          profit: (c.realisedProfit || 0) * qty,
        };
      });

    // Purchase and grading spend only logged here for cards NOT YET sold — once a card sells,
    // its full cost (acquisition + any grading fee, since both roll into totalCost) is already
    // captured in the Card sale row above. Logging it again here would double-count the spend.
    const purchaseRows = allCards
      .filter((c) => c.status !== "Sold" && c.datePurchased && inRange(c.datePurchased, start, end))
      .map((c) => {
        const qty = Number(c.quantity) || 1;
        const acquisitionCost = (Number(c.paid) || 0) + (Number(c.shipping) || 0) + (c.holdingCost || 0);
        return {
          date: c.datePurchased,
          type: "Card purchase",
          description: `${c.player} ${c.card}`.trim(),
          revenue: 0,
          cost: acquisitionCost * qty,
          fees: 0,
          profit: -acquisitionCost * qty,
        };
      });

    const gradingRows = allCards
      .filter((c) => c.status !== "Sold" && c.gradingSentDate && Number(c.gradingCostPaid) > 0 && inRange(c.gradingSentDate, start, end))
      .map((c) => {
        const qty = Number(c.quantity) || 1;
        return {
          date: c.gradingSentDate,
          type: "Grading sent",
          description: `${c.player} ${c.card}`.trim(),
          revenue: 0,
          cost: Number(c.gradingCostPaid) * qty,
          fees: 0,
          profit: -Number(c.gradingCostPaid) * qty,
        };
      });

    const boxRows = boxBreaks
      .filter((b) => inRange(b.date, start, end))
      .map((b) => {
        const t = boxTotals(b);
        return {
          date: b.date,
          type: "Box break",
          description: b.name || "Unnamed box",
          revenue: t.revenue,
          cost: t.cost,
          fees: 0,
          profit: t.profit,
        };
      });

    const expenseRows = manualExpenses
      .filter((ex) => inRange(ex.date, start, end))
      .map((ex) => ({
        date: ex.date,
        type: "Manual expense",
        description: ex.description || "Expense",
        revenue: 0,
        cost: Number(ex.amount) || 0,
        fees: 0,
        profit: -(Number(ex.amount) || 0),
      }));

    return [...cardRows, ...purchaseRows, ...gradingRows, ...boxRows, ...expenseRows].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  }, [cards, pokemonCards, boxBreaks, manualExpenses, start, end]);

  const totals = useMemo(() => {
    const revenue = ledger.reduce((s, r) => s + r.revenue, 0);
    const cost = ledger.reduce((s, r) => s + r.cost, 0);
    const fees = ledger.reduce((s, r) => s + r.fees, 0);
    const profit = ledger.reduce((s, r) => s + r.profit, 0);
    return { revenue, cost, fees, profit };
  }, [ledger]);

  function addExpense(e) {
    e.preventDefault();
    if (!expenseForm.amount) return;
    setManualExpenses((prev) => [{ id: crypto.randomUUID(), ...expenseForm, amount: Number(expenseForm.amount) }, ...prev]);
    setExpenseForm({ date: new Date().toISOString().slice(0, 10), description: "", amount: "" });
    setShowAddExpense(false);
  }
  function removeExpense(id) {
    setManualExpenses((prev) => prev.filter((ex) => ex.id !== id));
  }

  function exportCSV() {
    const header = "Date,Type,Description,Revenue,Cost,Fees,Profit";
    const rows = ledger.map((r) =>
      [r.date, r.type, `"${r.description.replace(/"/g, '""')}"`, r.revenue.toFixed(2), r.cost.toFixed(2), r.fees.toFixed(2), r.profit.toFixed(2)].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cardflip-ev-ledger-${period}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontSize: 13, color: "#8B90A0", marginBottom: 16, lineHeight: 1.6 }}>
        A rollup of spend and realised profit — card purchases, sales, grading costs, box breaks, and anything you log manually — for a given period. Useful for your own records or handing to an accountant.
        <span style={{ color: "#C9A227" }}> This isn't tax advice</span> — it's a summary of what's tracked in the app, not a substitute for proper bookkeeping.
        Marking a card Won in Buy Evaluator or adding one yourself logs its purchase cost automatically; sending it to grading logs that cost too. Once a card is actually Sold, its full cost is folded into that sale's line instead of counted twice.
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", marginBottom: 4 }}>Period</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ width: "auto", minWidth: 160 }}>
              {fyOptions().map((fy) => (
                <option key={fy} value={fy}>FY {fy}{fy === currentFYLabel() ? " (current)" : ""}</option>
              ))}
              <option value="all">All time</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
          {period === "custom" && (
            <>
              <Field label="From"><input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} /></Field>
              <Field label="To"><input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} /></Field>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btnSecondary" onClick={() => setShowAddExpense((v) => !v)}>
            <Plus size={14} style={{ marginRight: 6 }} /> Add expense
          </button>
          <button className="btnSecondary" onClick={exportCSV} disabled={ledger.length === 0} style={{ opacity: ledger.length === 0 ? 0.5 : 1 }}>
            <span style={{ marginRight: 6 }}>⬇️</span> Export CSV
          </button>
        </div>
      </div>

      {showAddExpense && (
        <form onSubmit={addExpense} style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 20, border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22", flexWrap: "wrap" }}>
          <Field label="Date"><input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} /></Field>
          <Field label="Description"><input value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="e.g. ShipMyCards shipment home, grading fee" style={{ minWidth: 220 }} /></Field>
          <Field label="Amount"><input type="number" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} required /></Field>
          <button className="btnPrimary" type="submit">Add</button>
        </form>
      )}

      {manualExpenses.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionTitle>Manual expenses on record ({manualExpenses.length})</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {manualExpenses.map((ex) => (
              <div key={ex.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #2C303B", borderRadius: 8, padding: "8px 12px", fontSize: 12.5 }}>
                <div><span className="mono" style={{ color: "#6B7180", marginRight: 10 }}>{ex.date}</span>{ex.description || "Expense"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#B4472E", fontWeight: 600 }}>{fmtMoney(Number(ex.amount))}</span>
                  <X size={13} style={{ cursor: "pointer", color: "#6B7180" }} onClick={() => removeExpense(ex.id)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1, background: "#2C303B", border: "1px solid #2C303B", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
        <Stat label="Revenue" value={fmtMoney(totals.revenue)} />
        <Stat label="Cost basis" value={fmtMoney(totals.cost)} />
        <Stat label="Fees paid" value={fmtMoney(totals.fees)} />
        <Stat label="Net profit" value={`${totals.profit >= 0 ? "+" : ""}${fmtMoney(totals.profit)}`} color={totals.profit >= 0 ? "#4E8B6B" : "#B4472E"} />
      </div>

      <SectionTitle>Transaction ledger ({ledger.length})</SectionTitle>
      {ledger.length === 0 ? (
        <div style={{ padding: "3rem 0", textAlign: "center", color: "#5C6270", border: "1px solid #2C303B", borderRadius: 10 }}>
          No spend or income recorded in this period.
        </div>
      ) : (
        <div style={{ border: "1px solid #2C303B", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "90px 90px 1.6fr 90px 90px 90px", padding: "10px 14px", background: "#1D2028", fontSize: 11, color: "#8B90A0", textTransform: "uppercase" }}>
            <div>Date</div>
            <div>Type</div>
            <div>Description</div>
            <div>Revenue</div>
            <div>Cost</div>
            <div>Profit</div>
          </div>
          {ledger.map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 90px 1.6fr 90px 90px 90px", padding: "8px 14px", borderTop: "1px solid #24272F", fontSize: 12.5, alignItems: "center" }}>
              <div className="mono" style={{ color: "#6B7180" }}>{r.date}</div>
              <div style={{ color: "#8B90A0" }}>{r.type}</div>
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.description}</div>
              <div>{fmtMoney(r.revenue)}</div>
              <div style={{ color: "#8B90A0" }}>{fmtMoney(r.cost)}</div>
              <div style={{ color: r.profit >= 0 ? "#4E8B6B" : "#B4472E", fontWeight: 600 }}>{r.profit >= 0 ? "+" : ""}{fmtMoney(r.profit)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Grading Tracker =====

function GradingTracker({ cards, pokemonCards, onUpdateCardIn }) {
  const atGrading = useMemo(() => {
    const own = cards.map((c) => ({ ...computeCard(c), _src: "cards" }));
    const pkmn = pokemonCards.map((c) => ({ ...computePokemonCard(c), _src: "pokemon" }));
    return [...own, ...pkmn].filter((c) => c.status === "At Grading").sort((a, b) => (b.gradingProgressPct || 0) - (a.gradingProgressPct || 0));
  }, [cards, pokemonCards]);

  const totalTiedUp = atGrading.reduce((s, c) => s + c.totalCost * (Number(c.quantity) || 1), 0);

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1, background: "#2C303B", border: "1px solid #2C303B", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        <Stat label="Cards at grading" value={atGrading.length} />
        <Stat label="Capital tied up" value={fmtMoney(totalTiedUp)} color="#C9A227" />
      </div>

      <div style={{ fontSize: 12.5, color: "#8B90A0", marginBottom: 20, lineHeight: 1.6 }}>
        Send a card to grading from its detail view in My Cards or Pokémon (set Status to "At Grading") and it shows up here automatically, with the grading cost already added to its total cost. Bars are estimated from PSA's published Australia turnaround tiers where the service is PSA via Australia — ShipMyCards and SGC don't have a specific published figure here, so those use a rough estimate, not a guarantee.
      </div>

      {atGrading.length === 0 ? (
        <div style={{ padding: "3rem 0", textAlign: "center", color: "#5C6270", border: "1px solid #2C303B", borderRadius: 10 }}>
          Nothing at grading right now.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {atGrading.map((c) => (
            <GradingTrackerRow key={`${c._src}-${c.id}`} card={c} onUpdateCardIn={onUpdateCardIn} />
          ))}
        </div>
      )}
    </div>
  );
}

function GradingTrackerRow({ card, onUpdateCardIn }) {
  const [returning, setReturning] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("PSA 10");

  const pct = card.gradingProgressPct;
  const overdue = pct != null && pct >= 100;
  const barColor = overdue ? "#B4472E" : pct >= 75 ? "#C9A227" : "#4E8B6B";

  let etaText = "No turnaround estimate for this service";
  if (card.gradingTurnaroundDays) {
    const sent = new Date(card.gradingSentDate);
    const eta = new Date(sent.getTime() + card.gradingTurnaroundDays * 86400000);
    etaText = overdue
      ? `Estimated turnaround passed ${eta.toLocaleDateString()} — check status directly`
      : `Est. return ~${eta.toLocaleDateString()} (${card.gradingDaysElapsed}/${card.gradingTurnaroundDays} days)`;
  }

  function confirmReturn() {
    onUpdateCardIn(card._src, card.id, { status: "Graded", grade: selectedGrade });
    setReturning(false);
  }

  return (
    <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div className="oswald" style={{ fontSize: 15, fontWeight: 600 }}>
            {card.player}
            <span className="mono" style={{ fontSize: 10, color: "#6B7180", marginLeft: 8 }}>{SPORT_EMOJI[card.sport] || "🎴"} {card.sport}</span>
          </div>
          <div style={{ fontSize: 12, color: "#6B7180" }}>{card.card} · {card.gradingService} · sent {card.gradingSentDate}</div>
        </div>
        <button className="btnSecondary" style={{ fontSize: 11.5, padding: "5px 10px" }} onClick={() => setReturning((v) => !v)}>
          {returning ? "Cancel" : "Mark as returned"}
        </button>
      </div>

      <div style={{ height: 8, borderRadius: 999, background: "#14161C", overflow: "hidden", marginBottom: 6 }}>
        <div style={{ height: "100%", width: `${pct ?? 0}%`, background: barColor, transition: "width 0.3s" }} />
      </div>
      <div style={{ fontSize: 11, color: overdue ? "#C9A227" : "#6B7180" }}>{etaText}</div>

      {returning && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #24272F", display: "flex", alignItems: "end", gap: 10 }}>
          <Field label="Grade received">
            <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
              {GRADE_OPTIONS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
          <button className="btnPrimary" onClick={confirmReturn} style={{ padding: "8px 14px" }}>
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}

// ===== Home / Dashboard =====

function Home({ cards, pokemonCards, targets, boxBreaks, salesItems, buyList, contentPlan, contentGoal, setTab }) {
  const allEnriched = useMemo(() => [...cards.map(computeCard), ...pokemonCards.map(computePokemonCard)], [cards, pokemonCards]);

  const portfolioTotals = useMemo(() => {
    const qty = (c) => Number(c.quantity) || 1;
    const active = allEnriched.filter((c) => c.status !== "Sold");
    const invested = active.reduce((s, c) => s + c.totalCost * qty(c), 0);
    const potentialRaw = active.reduce((s, c) => s + (c.rawGGR ?? 0) * qty(c), 0);
    const realised = allEnriched.filter((c) => c.status === "Sold").reduce((s, c) => s + (c.realisedProfit ?? 0) * qty(c), 0);
    const soldCost = allEnriched.filter((c) => c.status === "Sold").reduce((s, c) => s + c.totalCost * qty(c), 0);
    const totalInvested = invested + soldCost;
    const overallROI = totalInvested > 0 ? (potentialRaw + realised) / totalInvested : null;
    return { invested, potentialRaw, realised, overallROI, activeCount: active.length };
  }, [allEnriched]);

  const actionItems = useMemo(
    () =>
      allEnriched
        .filter((c) => ["Sell Raw First", "Grade First", "Sell PSA 9", "Sell PSA 10"].includes(c.sellDecision))
        .sort((a, b) => a.sellPriority - b.sellPriority || b.totalCost - a.totalCost)
        .slice(0, 5),
    [allEnriched]
  );

  const buyComputed = useMemo(() => buyList.map(computeBuy), [buyList]);
  const readyToBuy = buyComputed.filter((t) => t.decision === "BUY" && t.biddingStatus === "Watching");
  const bidsPlaced = buyComputed.filter((t) => t.biddingStatus === "Bid Placed");

  const boxTotalsAll = useMemo(() => {
    const all = boxBreaks.map(boxTotals);
    const totalProfit = all.reduce((s, t) => s + t.profit, 0);
    const active = boxBreaks.filter((b) => b.status !== "Completed").length;
    return { totalProfit, active };
  }, [boxBreaks]);

  const topTargets = useMemo(
    () =>
      [...targets]
        .filter((t) => t.status === "Watching")
        .sort((a, b) => computeConfidence(b) - computeConfidence(a))
        .slice(0, 3),
    [targets]
  );
  const avgConfidence = targets.length ? Math.round(targets.reduce((s, t) => s + computeConfidence(t), 0) / targets.length) : null;

  const listedItems = salesItems.filter((s) => s.status === "Listed");
  const soldItems = salesItems.filter((s) => s.status === "Sold");
  const recentRealised = soldItems.reduce((s, i) => s + (Number(i.realisedProfit) || 0), 0);

  const postedInPeriod = countPostedInPeriod(contentPlan, contentGoal.period);
  const goalHit = postedInPeriod >= contentGoal.count;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 1, background: "#2C303B", border: "1px solid #2C303B", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
        <Stat label="Invested (active)" value={fmtMoney(portfolioTotals.invested)} />
        <Stat label="Potential profit" value={`${portfolioTotals.potentialRaw >= 0 ? "+" : ""}${fmtMoney(portfolioTotals.potentialRaw)}`} color={portfolioTotals.potentialRaw >= 0 ? "#4E8B6B" : "#B4472E"} />
        <Stat label="Realised profit (all time)" value={`${portfolioTotals.realised >= 0 ? "+" : ""}${fmtMoney(portfolioTotals.realised)}`} color={portfolioTotals.realised >= 0 ? "#4E8B6B" : "#B4472E"} />
        <Stat label="Overall ROI" value={fmtPct(portfolioTotals.overallROI)} color={portfolioTotals.overallROI >= 0 ? "#4E8B6B" : "#B4472E"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <DashCard title="⚡ Needs your attention" onViewAll={() => setTab("portfolio")} count={actionItems.length}>
          {actionItems.length === 0 ? (
            <EmptyRow text="Nothing flagged to sell or grade right now." />
          ) : (
            actionItems.map((c) => {
              const style = SELL_DECISION_STYLE[c.sellDecision] || SELL_DECISION_STYLE[""];
              return (
                <DashRow key={c.id} onClick={() => setTab(c.sport === "Pokémon" ? "pokemon" : "portfolio")}>
                  <span style={{ fontWeight: 600 }}>{c.player}</span>
                  <span className="mono" style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 999, background: `${style.color}22`, color: style.color }}>{style.label}</span>
                </DashRow>
              );
            })
          )}
        </DashCard>

        <DashCard title="🎯 Ready to buy" onViewAll={() => setTab("buy")} count={readyToBuy.length}>
          {readyToBuy.length === 0 ? (
            <EmptyRow text="No pending BUY calls in your watch list." />
          ) : (
            readyToBuy.slice(0, 5).map((t) => (
              <DashRow key={t.id} onClick={() => setTab("buy")}>
                <span style={{ fontWeight: 600 }}>{t.player || "Unnamed"}</span>
                <span className="mono" style={{ fontSize: 10.5, color: "#C9A227" }}>{fmtMoney(t.maxSnipeBid)} ceiling</span>
              </DashRow>
            ))
          )}
        </DashCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <DashCard title="🔨 Bids placed" onViewAll={() => setTab("buy")} count={bidsPlaced.length}>
          {bidsPlaced.length === 0 ? (
            <EmptyRow text="No active bids right now." />
          ) : (
            bidsPlaced.slice(0, 5).map((t) => (
              <DashRow key={t.id} onClick={() => setTab("buy")}>
                <span style={{ fontWeight: 600 }}>{t.player || "Unnamed"}</span>
                <span className="mono" style={{ fontSize: 10.5, color: t.alreadyOverMax ? "#B4472E" : "#4E8B6B" }}>
                  {fmtMoney(Number(t.paidAmount) || 0)} bid{t.alreadyOverMax ? " — over ceiling" : ""}
                </span>
              </DashRow>
            ))
          )}
        </DashCard>
        <DashCard title="🎯 Monthly Targets" onViewAll={() => setTab("targets")} count={targets.filter((t) => t.status === "Watching").length}>
          {avgConfidence != null && (
            <div style={{ fontSize: 11.5, color: "#8B90A0", marginBottom: 8 }}>Avg confidence: <span style={{ color: confidenceColor(avgConfidence), fontWeight: 700 }}>{avgConfidence}</span></div>
          )}
          {topTargets.length === 0 ? (
            <EmptyRow text="No targets currently being watched." />
          ) : (
            topTargets.map((t) => (
              <DashRow key={t.id} onClick={() => setTab("targets")}>
                <span style={{ fontWeight: 600 }}>{t.player}</span>
                <span className="mono" style={{ fontSize: 10.5, color: confidenceColor(computeConfidence(t)) }}>{computeConfidence(t)}</span>
              </DashRow>
            ))
          )}
        </DashCard>

        <DashCard title="📦 Box Breaks" onViewAll={() => setTab("boxbreaks")} count={boxTotalsAll.active}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <MiniStat label="Active breaks" value={boxTotalsAll.active} />
            <MiniStat label="Total profit" value={`${boxTotalsAll.totalProfit >= 0 ? "+" : ""}${fmtMoney(boxTotalsAll.totalProfit)}`} color={boxTotalsAll.totalProfit >= 0 ? "#4E8B6B" : "#B4472E"} emphasis />
          </div>
        </DashCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <DashCard title="💰 My Sales" onViewAll={() => setTab("sales")} count={listedItems.length}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <MiniStat label="Currently listed" value={listedItems.length} />
            <MiniStat label="Realised profit" value={`${recentRealised >= 0 ? "+" : ""}${fmtMoney(recentRealised)}`} color={recentRealised >= 0 ? "#4E8B6B" : "#B4472E"} emphasis />
          </div>
        </DashCard>

        <DashCard title="🎥 Content Plan" onViewAll={() => setTab("content")} count={contentPlan.length}>
          <div style={{ fontSize: 13, marginBottom: 6 }}>
            <span className="oswald" style={{ fontWeight: 700, color: goalHit ? "#4E8B6B" : "#C9A227" }}>{postedInPeriod} / {contentGoal.count}</span>
            <span style={{ color: "#8B90A0", marginLeft: 6 }}>posted this {contentGoal.period}</span>
          </div>
          <div style={{ fontSize: 11.5, color: "#6B7180" }}>{contentPlan.length} item{contentPlan.length === 1 ? "" : "s"} in the pipeline</div>
        </DashCard>
      </div>
    </div>
  );
}

function DashCard({ title, count, onViewAll, children }) {
  return (
    <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "16px 18px", background: "#191B22" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div className="oswald" style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        <button className="btnSecondary" style={{ fontSize: 11, padding: "4px 10px" }} onClick={onViewAll}>
          View all{count != null ? ` (${count})` : ""}
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{children}</div>
    </div>
  );
}

function DashRow({ children, onClick }) {
  return (
    <div onClick={onClick} className="cardRow" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", borderRadius: 6, cursor: "pointer", fontSize: 12.5 }}>
      {children}
    </div>
  );
}

function EmptyRow({ text }) {
  return <div style={{ fontSize: 12, color: "#5C6270", padding: "6px 8px" }}>{text}</div>;
}

// ===== Box Breaks =====

function newBoxBreak() {
  return {
    id: crypto.randomUUID(),
    name: "",
    league: "NFL",
    boxCost: "",
    date: new Date().toISOString().slice(0, 10),
    status: "Planned",
    spots: LEAGUE_TEAMS.NFL.map((team) => ({ team, soldPrice: null, buyer: "" })),
  };
}

function boxTotals(box) {
  const cost = Number(box.boxCost) || 0;
  const numSpots = box.spots.length;
  const pricePerSpot = numSpots > 0 ? cost / numSpots : 0;
  const spotsSold = box.spots.filter((s) => s.soldPrice != null && s.soldPrice !== "");
  const revenue = spotsSold.reduce((s, spot) => s + Number(spot.soldPrice), 0);
  const profit = revenue - cost;
  return { cost, numSpots, pricePerSpot, spotsSoldCount: spotsSold.length, revenue, profit };
}

function BoxBreaks({ boxBreaks, setBoxBreaks }) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const totals = useMemo(() => {
    const allTotals = boxBreaks.map(boxTotals);
    const totalSpent = allTotals.reduce((s, t) => s + t.cost, 0);
    const totalRevenue = allTotals.reduce((s, t) => s + t.revenue, 0);
    const totalProfit = totalRevenue - totalSpent;
    const activeBoxes = boxBreaks.filter((b) => b.status !== "Completed").length;
    return { totalSpent, totalRevenue, totalProfit, activeBoxes };
  }, [boxBreaks]);

  function addBox(box) {
    setBoxBreaks((prev) => [box, ...prev]);
    setShowAdd(false);
  }
  function updateBox(id, updates) {
    setBoxBreaks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  }
  function deleteBox(id) {
    setBoxBreaks((prev) => prev.filter((b) => b.id !== id));
    setSelectedId(null);
  }

  const selectedBox = selectedId ? boxBreaks.find((b) => b.id === selectedId) : null;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1, background: "#2C303B", border: "1px solid #2C303B", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        <Stat label="Active breaks" value={totals.activeBoxes} />
        <Stat label="Total spent" value={fmtMoney(totals.totalSpent)} />
        <Stat label="Total revenue" value={fmtMoney(totals.totalRevenue)} />
        <Stat label="Total profit" value={`${totals.totalProfit >= 0 ? "+" : ""}${fmtMoney(totals.totalProfit)}`} color={totals.totalProfit >= 0 ? "#4E8B6B" : "#B4472E"} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "#8B90A0" }}>
          Spend on a box, split the cost across every team, sell spots on Whatnot/eBay Live — auction prices above the split cover your profit.
        </div>
        <button className="btnPrimary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> New box
        </button>
      </div>

      {boxBreaks.length === 0 ? (
        <div style={{ padding: "3rem 0", textAlign: "center", color: "#5C6270", border: "1px solid #2C303B", borderRadius: 10 }}>
          No box breaks logged yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {boxBreaks.map((box) => (
            <BoxRow key={box.id} box={box} onClick={() => setSelectedId(box.id)} />
          ))}
        </div>
      )}

      {showAdd && <BoxAddModal onClose={() => setShowAdd(false)} onSave={addBox} />}
      {selectedBox && <BoxDetailModal box={selectedBox} onClose={() => setSelectedId(null)} onUpdate={updateBox} onDelete={deleteBox} />}
    </div>
  );
}

function BoxRow({ box, onClick }) {
  const t = boxTotals(box);
  const statusColor = box.status === "Completed" ? "#4E8B6B" : box.status === "Live" ? "#B4472E" : "#5C7A99";

  return (
    <div
      onClick={onClick}
      className="cardRow"
      style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22", cursor: "pointer" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div className="oswald" style={{ fontSize: 16, fontWeight: 600 }}>{box.name || "Unnamed box"}</div>
          <div style={{ fontSize: 12, color: "#6B7180" }}>{box.league} · {t.numSpots} spots · {box.date}</div>
        </div>
        <span className="mono" style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: `${statusColor}22`, color: statusColor, fontWeight: 600 }}>
          {box.status}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        <MiniStat label="Box cost" value={fmtMoney(t.cost)} />
        <MiniStat label="Price / spot" value={fmtMoney(t.pricePerSpot)} color="#C9A227" />
        <MiniStat label={`Sold (${t.spotsSoldCount}/${t.numSpots})`} value={fmtMoney(t.revenue)} />
        <MiniStat label="Profit" value={`${t.profit >= 0 ? "+" : ""}${fmtMoney(t.profit)}`} color={t.profit >= 0 ? "#4E8B6B" : "#B4472E"} emphasis />
      </div>
    </div>
  );
}

function BoxAddModal({ onClose, onSave }) {
  const [form, setForm] = useState(newBoxBreak());
  const [customTeams, setCustomTeams] = useState("");

  function handleLeagueChange(league) {
    if (league === "Custom") {
      setForm({ ...form, league, spots: [] });
    } else {
      setForm({ ...form, league, spots: LEAGUE_TEAMS[league].map((team) => ({ team, soldPrice: null, buyer: "" })) });
    }
  }

  function applyCustomTeams() {
    const teams = customTeams.split(",").map((t) => t.trim()).filter(Boolean);
    setForm({ ...form, spots: teams.map((team) => ({ team, soldPrice: null, buyer: "" })) });
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || form.spots.length === 0) return;
    onSave({ ...form, boxCost: Number(form.boxCost) || 0 });
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <ModalHeader title="New box break" onClose={onClose} />
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Box name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. 2025 Prizm NFL Hobby Box" required />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="League">
              <select value={form.league} onChange={(e) => handleLeagueChange(e.target.value)}>
                {BOX_LEAGUE_OPTIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Box cost (AUD)">
              <input type="number" step="0.01" value={form.boxCost} onChange={(e) => setForm({ ...form, boxCost: e.target.value })} required />
            </Field>
          </div>
          <Field label="Date">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>

          {form.league === "Custom" ? (
            <Field label="Teams / spots (comma separated)">
              <input value={customTeams} onChange={(e) => setCustomTeams(e.target.value)} onBlur={applyCustomTeams} placeholder="Team A, Team B, Team C…" />
            </Field>
          ) : (
            <div style={{ fontSize: 11.5, color: "#6B7180" }}>{form.spots.length} team spots pre-filled for {form.league} — you can rename any of them after creating the box.</div>
          )}

          {form.boxCost && form.spots.length > 0 && (
            <div style={{ border: "1px solid #C9A22755", borderRadius: 8, padding: "10px 12px", background: "#14161C" }}>
              <div style={{ fontSize: 11, color: "#8B90A0", textTransform: "uppercase", marginBottom: 4 }}>Suggested price per spot</div>
              <div className="oswald" style={{ fontSize: 18, fontWeight: 600, color: "#C9A227" }}>{fmtMoney((Number(form.boxCost) || 0) / form.spots.length)}</div>
            </div>
          )}

          <button className="btnPrimary" type="submit" style={{ justifyContent: "center", marginTop: 6 }}>
            Create box
          </button>
        </form>
      </div>
    </div>
  );
}

function BoxDetailModal({ box, onClose, onUpdate, onDelete }) {
  const t = boxTotals(box);

  function updateSpot(index, updates) {
    const spots = box.spots.map((s, i) => (i === index ? { ...s, ...updates } : s));
    onUpdate(box.id, { spots });
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 12, color: "#8B90A0" }}>{box.league} · {box.date}</div>
            <h2 className="oswald" style={{ margin: "2px 0 0", fontSize: 21 }}>{box.name}</h2>
          </div>
          <X size={20} style={{ cursor: "pointer", color: "#8B90A0" }} onClick={onClose} />
        </div>

        <div style={{ margin: "10px 0 16px" }}>
          <Field label="Status">
            <select value={box.status} onChange={(e) => onUpdate(box.id, { status: e.target.value })}>
              <option>Planned</option>
              <option>Live</option>
              <option>Completed</option>
            </select>
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
          <MiniStat label="Box cost" value={fmtMoney(t.cost)} />
          <MiniStat label="Price / spot" value={fmtMoney(t.pricePerSpot)} color="#C9A227" />
          <MiniStat label="Revenue" value={fmtMoney(t.revenue)} />
          <MiniStat label="Profit" value={`${t.profit >= 0 ? "+" : ""}${fmtMoney(t.profit)}`} color={t.profit >= 0 ? "#4E8B6B" : "#B4472E"} emphasis />
        </div>

        <SectionTitle>Team spots — {t.spotsSoldCount}/{t.numSpots} sold</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto", marginBottom: 16 }}>
          {box.spots.map((spot, i) => {
            const sold = spot.soldPrice != null && spot.soldPrice !== "";
            const delta = sold ? Number(spot.soldPrice) - t.pricePerSpot : null;
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 24px", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: "1px solid #24272F" }}>
                <input
                  value={spot.team}
                  onChange={(e) => updateSpot(i, { team: e.target.value })}
                  style={{ padding: "6px 8px", fontSize: 12.5 }}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder={`~${t.pricePerSpot.toFixed(0)}`}
                  value={spot.soldPrice ?? ""}
                  onChange={(e) => updateSpot(i, { soldPrice: e.target.value === "" ? null : Number(e.target.value) })}
                  style={{ padding: "6px 8px", fontSize: 12.5 }}
                />
                <div style={{ fontSize: 11.5, color: delta == null ? "#5C6270" : delta >= 0 ? "#4E8B6B" : "#B4472E" }}>
                  {delta != null ? `${delta >= 0 ? "+" : ""}${fmtMoney(delta)}` : "unsold"}
                </div>
                <X
                  size={14}
                  style={{ cursor: "pointer", color: "#6B7180" }}
                  onClick={() => onUpdate(box.id, { spots: box.spots.filter((_, si) => si !== i) })}
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            onDelete(box.id);
            onClose();
          }}
          style={{ background: "transparent", border: "1px solid #4a2a24", color: "#B4472E", borderRadius: 8, padding: "9px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        >
          <Trash2 size={14} /> Remove box
        </button>
      </div>
    </div>
  );
}

// ===== My Sales =====

function MySales({ items, onUpdate, onDelete }) {
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(50);
  const [editingItem, setEditingItem] = useState(null);

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

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by player or card…"
        style={{ marginBottom: 14 }}
      />

      {searched.length === 0 ? (
        <div style={{ padding: "3rem 0", textAlign: "center", color: "#5C6270", border: "1px solid #2C303B", borderRadius: 10 }}>
          {items.length === 0
            ? "Nothing listed or sold yet — set a card's status to Listed or Sold from My Cards or Pokémon, and it'll show up here."
            : "No matches for that search."}
        </div>
      ) : (
        <>
          <div style={{ border: "1px solid #2C303B", borderRadius: 10, overflow: "hidden" }}>
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
    </div>
  );
}

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
      style={{ display: "grid", gridTemplateColumns: "2fr 90px 90px 90px 100px 24px", padding: "8px 14px", borderTop: "1px solid #24272F", cursor: "pointer", alignItems: "center", fontSize: 12.5 }}
    >
      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        <span style={{ fontWeight: 600 }}>{item.player}</span>
        <span style={{ color: "#6B7180", marginLeft: 6 }}>{item.card}{item.cardNum ? ` ${item.cardNum}` : ""}</span>
        {item.sport && <span className="mono" style={{ fontSize: 9.5, color: "#6B7180", marginLeft: 6 }}>{SPORT_EMOJI[item.sport] || "🎴"}</span>}
        {item.sellingMethod && <span className="mono" style={{ fontSize: 9.5, color: "#5C7A99", marginLeft: 6 }}>via {item.sellingMethod}</span>}
      </div>
      <span className="mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: `${statusColor}22`, color: statusColor, fontWeight: 600, justifySelf: "start" }}>
        {item.status}
      </span>
      <div style={{ color: "#8B90A0" }}>{fmtMoney(item.totalCost)}</div>
      <div>{priceValue ? fmtMoney(priceValue) : "—"}</div>
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
        <ModalHeader title={item.player} onClose={onClose} />
        <div style={{ fontSize: 12, color: "#8B90A0", marginBottom: 16 }}>
          {item.sport && <span style={{ marginRight: 6 }}>{SPORT_EMOJI[item.sport] || "🎴"}</span>}
          {item.card} {item.cardNum}{item.grade ? ` · ${item.grade}` : ""}
          {(item.quantity ?? 1) > 1 && <span> · Qty {item.quantity}</span>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Status">
            <select value={item.status} onChange={(e) => onUpdate(item._source, item.id, { status: e.target.value })}>
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
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
            <div style={{ fontSize: 10.5, color: "#6B7180", marginTop: 4 }}>
              {hasActualFees
                ? "Realised profit now uses these actual figures instead of the card's generic Fees %."
                : "Not entered yet — realised profit is still using the card's generic Fees % estimate (built for flat eBay-style fees, not DCSports87/Fanatics/Whatnot's real structures)."}
            </div>
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
// a link" flow, but it actually works within what a client-side-only app can do.
const LISTING_EXTRACT_PROMPT = `You are extracting structured data from a pasted eBay trading card listing — the user copied the visible text from the listing page (title, price, bid/watcher counts, shipping) and pasted it here.

Identify: player (athlete/character name), sport (one of NFL, NBA, WNBA, MLB, AFL, Soccer, MMA, WWE, Pokémon, Other — best guess), cardNum (card number if shown, e.g. "#258"), card (set/product name plus parallel or insert, e.g. "2020-21 Panini Prizm Silver"), rookie (true if "RC" or "rookie" mentioned), numbered (true if a print run like "/99" appears), outOf (the print run denominator if numbered, else null), bidders (number of bids if it's an auction, else null), watchers (number watching if shown, else null), currentBidAUD (the current price, converted to AUD if the listing wasn't already in AUD — use approximate rates: 1 USD ≈ 1.5 AUD, 1 GBP ≈ 1.9 AUD, 1 EUR ≈ 1.6 AUD), originalCurrency (whatever currency the pasted text was actually in, e.g. "USD", "AUD", "GBP"), shippingAUD (shipping cost converted to AUD the same way, 0 if free, null if not mentioned).

Respond with ONLY valid JSON, no markdown fences, no commentary, in exactly this shape:
{"player":"","sport":"","cardNum":"","card":"","rookie":false,"numbered":false,"outOf":null,"bidders":null,"watchers":null,"currentBidAUD":null,"originalCurrency":"","shippingAUD":null,"confidence":"Low"|"Medium"|"High","notes":"anything ambiguous, missing, or converted from another currency"}`;

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
    try {
     const promptText = `${LISTING_EXTRACT_PROMPT}\n\nPasted listing:\n${pasteText}`;
      const parsed = await callGeminiAi(promptText);
      setResult(parsed);
      onExtracted(parsed);
    } catch (e) {
      console.error(e);
      setError("Couldn't parse that — try pasting more of the listing text (title, price, bids/watchers, shipping), or just fill the fields in manually below.");
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
        On the eBay listing, select and copy the title, price, bid/watcher counts, and shipping cost, then paste that block here. This app can't fetch the link itself — no backend, and browsers block that kind of cross-site request.
      </div>
      <textarea
        value={pasteText}
        onChange={(e) => setPasteText(e.target.value)}
        rows={5}
        placeholder="e.g. 2020-21 Panini Prizm Anthony Edwards Silver RC #258&#10;US $179.00 · 4 bids · 12 watchers&#10;+ $8.50 shipping"
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
          Filled in below — {result.confidence.toLowerCase()} confidence. {result.notes && <span style={{ color: "#C9A227" }}>{result.notes}</span>}
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
                  // Already-graded cards have no grading cost to add — force it to None so the
                  // math doesn't double up a fee that isn't actually coming.
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
          <div style={{ fontSize: 11.5, color: "#6B7180", marginTop: -6, marginBottom: -2 }}>
            Recent sales — up to 2 each, average used automatically. Fill in whichever tiers you have comps for.
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

// ===== Tips & Tricks =====

const SEARCH_LIBRARY = [
  {
    group: "🏀 NBA — Raw Flip (max volume)",
    query: "NBA rookie card",
    filters: "Auction · Max $50 · Ungraded · Worldwide",
    note: "No exclusions on purpose — every operator character (-, (), \"\") turns off eBay's automatic keyword expansion and shrinks your results. Plain and broad = most listings.",
  },
  {
    group: "🏀 NBA — Raw Flip (filtered)",
    query: "NBA rookie card -reprint -digital",
    filters: "Auction · Max $50 · Ungraded · Worldwide",
    note: "Use this once the broad version above is too noisy — fewer results, cleaner.",
  },
  {
    group: "🏀 NBA — Graded Value",
    query: "NBA rookie (PSA,SGC,BGS)",
    filters: "Auction · Max $100 · Graded 9/10",
    note: "Comma inside the parentheses is what makes it an OR — no comma means eBay doesn't treat it as either/or at all.",
  },
  {
    group: "🏀 WNBA — Raw & Graded",
    query: "WNBA rookie card",
    filters: "Auction · Max $60 · Worldwide",
    note: "Smaller market, less competition per listing than NBA.",
  },
  {
    group: "🧬 Pokémon — Raw Flip",
    query: "Pokemon card (holo,ex,gx,v,vmax)",
    filters: "Auction · Max $50 · Ungraded · Worldwide",
  },
  {
    group: "🧬 Pokémon — Graded",
    query: "Pokemon card (PSA 9,PSA 10)",
    filters: "Auction · Max $100 · Graded 9/10",
  },
  {
    group: "🏈 NFL — Raw Flip (max volume)",
    query: "NFL rookie card",
    filters: "Auction · Max $50 · Ungraded · Worldwide",
    note: "NFL auctions are criminally undervalued mid-season — start broad here.",
  },
  {
    group: "🏈 NFL — Graded Under $100",
    query: "NFL rookie (PSA,SGC)",
    filters: "Auction · Max $100 · Graded 9/10",
  },
  {
    group: "⚾ MLB — Slow Burn Value",
    query: "MLB rookie auto refractor",
    filters: "Auction · Max $50 raw / $100 graded",
    note: "MLB is where you get insane ROI, but patience required.",
  },
  {
    group: "🤼 WWE — Low Pop Snipe",
    query: "WWE auto rookie card",
    filters: "Auction · Max $100 · Worldwide",
    note: "WWE cards often have tiny populations = sneaky holds.",
  },
  {
    group: "🥊 MMA/UFC — Low Pop Snipe",
    query: "UFC rookie autograph card",
    filters: "Auction · Max $100 · Worldwide",
    note: "Thin market, same low-pop logic as WWE.",
  },
  {
    group: "🏉 AFL — Australia Edge",
    query: "AFL Select rookie signature",
    filters: "Auction · Max $100 · Australia only",
    note: "Home-market advantage here — dropped the parentheses that weren't forming a real OR group before.",
  },
];

function TipsAndTricks() {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontSize: 13, color: "#8B90A0", marginBottom: 20 }}>
        Your saved eBay search library and flip-vs-hold playbook, pulled straight from the spreadsheet.
      </div>

      <SectionTitle>Seasonal calendar — when to buy, grade, ship, sell</SectionTitle>
      <SeasonCalendar />

      <div style={{ height: 8 }} />
      <SectionTitle>Gixen / EzSniper playbook</SectionTitle>
      <GixenPlaybook />

      <div style={{ height: 8 }} />
      <SectionTitle>Saved searches</SectionTitle>
      <div style={{ fontSize: 12, color: "#8B90A0", marginBottom: 14, lineHeight: 1.6 }}>
        eBay's search rules, for when you want to build your own: plain words are always AND'd together — <span className="mono" style={{ color: "#C9A227" }}>NBA rookie</span> requires both. Parentheses only create an OR when there's a <b>comma</b> inside — <span className="mono" style={{ color: "#C9A227" }}>(PSA,SGC)</span> works, <span className="mono" style={{ color: "#B4472E" }}>(PSA SGC)</span> doesn't. And any operator character — quotes, parentheses, minus signs — turns off eBay's automatic keyword expansion, which is why a plain broad query often returns more listings than a heavily filtered one.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, marginBottom: 28 }}>
        {SEARCH_LIBRARY.map((s, i) => (
          <SearchCard key={i} s={s} />
        ))}
      </div>

      <SectionTitle>Flip vs hold decision rule</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
        <PlaybookCard title="Flip immediately if" color="#4E8B6B" items={["Market hype (draft, debut, playoff run)", "Easy comps + high sale volume", "You can list within 24 hours"]} />
        <PlaybookCard title="Hold if" color="#5C7A99" items={["Population count under 500", "Cross-sport appeal (WWE / Pokémon)", "Injury dip or off-season lull"]} />
      </div>

      <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", marginBottom: 28, fontSize: 13, color: "#A7ADBB" }}>
        <span style={{ color: "#C9A227", fontWeight: 600 }}>Ideal monthly split — </span>
        1 graded card around $80–$100, plus 1–2 raw cards around $25–$35 each.
      </div>

      <SectionTitle>High-ROI targets by sport</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        <TargetCard sport="🏀 NBA" items={["PSA 9 rookies of secondary stars (not Wemby-tier hype)", "Players returning from injury", "Avoid raw unless clearly clean"]} />
        <TargetCard sport="🏈 NFL" items={["PSA 9 QBs in off-season dips", "Raw defensive stars — less hype, cheaper"]} />
        <TargetCard sport="⚾ MLB" items={["Raw autos or refractors under $30", "Hold through season start"]} />
        <TargetCard sport="🤼 WWE" items={["Graded autos are very strong long-term holds"]} />
        <TargetCard sport="🧬 Pokémon" items={["PSA 9 vintage commons/uncommons", "Raw modern only if pack-fresh"]} />
      </div>
    </div>
  );
}

const SEASON_ROWS = [
  {
    sport: "Football (NFL)",
    key: "NFL",
    blocks: [
      { m: "Jan", t: "GRADE" }, { m: "Feb", t: "BUY" }, { m: "Mar", t: "BUY" }, { m: "Apr", t: "SHIP" },
      { m: "May", t: "GRADE" }, { m: "Jun", t: "GRADE" }, { m: "Jul", t: "SELL" }, { m: "Aug", t: "SELL" },
      { m: "Sep", t: "GRADE" }, { m: "Oct", t: "GRADE" }, { m: "Nov", t: "GRADE" }, { m: "Dec", t: "GRADE" },
    ],
    note: "Draft (Apr) is the cheapest buying window before rookie hype builds; training camp/preseason (Jul-Aug) is peak hype before results matter, and the best sell window because nobody's been exposed as a bust yet. Ship right after buying (Apr) — that's ~3 months of grading runway before the Jul-Aug sell window opens.",
  },
  {
    sport: "AFL",
    key: "AFL",
    blocks: [
      { m: "Jan", t: "GRADE" }, { m: "Feb", t: "BUY" }, { m: "Mar", t: "BUY" }, { m: "Apr", t: "GRADE" },
      { m: "May", t: "SHIP" }, { m: "Jun", t: "GRADE" }, { m: "Jul", t: "GRADE" }, { m: "Aug", t: "SELL" },
      { m: "Sep", t: "SELL" }, { m: "Oct", t: "GRADE" }, { m: "Nov", t: "BUY" }, { m: "Dec", t: "GRADE" },
    ],
    note: "Finals + Grand Final (Aug-Sep) plus the Brownlow Medal announcement are the year's biggest attention spike — best sell window by far. Ship in May, ~3 months ahead of the Aug sell window, not right before it. Draft/trade period (Nov) often creates buying gaps as attention shifts to incoming talent.",
  },
  {
    sport: "Baseball (MLB)",
    key: "MLB",
    blocks: [
      { m: "Jan", t: "GRADE" }, { m: "Feb", t: "SELL" }, { m: "Mar", t: "SELL" }, { m: "Apr", t: "GRADE" },
      { m: "May", t: "GRADE" }, { m: "Jun", t: "GRADE" }, { m: "Jul", t: "GRADE" }, { m: "Aug", t: "GRADE" },
      { m: "Sep", t: "GRADE" }, { m: "Oct", t: "BUY" }, { m: "Nov", t: "BUY" }, { m: "Dec", t: "SHIP" },
    ],
    note: "Spring training (Feb-Mar) is peak hype before a full season of stats can disappoint — sell into that story. Buy right after the postseason (Oct-Nov) when attention drops off, then ship in Dec — that's the ~3 months of runway needed to have graded cards back in hand for the Feb-Mar sell window, not shipping in the same month you're trying to sell.",
  },
  {
    sport: "Basketball (NBA)",
    key: "NBA",
    blocks: [
      { m: "Jan", t: "GRADE" }, { m: "Feb", t: "GRADE" }, { m: "Mar", t: "GRADE" }, { m: "Apr", t: "GRADE" },
      { m: "May", t: "BUY" }, { m: "Jun", t: "BUY" }, { m: "Jul", t: "SHIP" }, { m: "Aug", t: "GRADE" },
      { m: "Sep", t: "SELL" }, { m: "Oct", t: "SELL" }, { m: "Nov", t: "GRADE" }, { m: "Dec", t: "GRADE" },
    ],
    note: "Playoffs/Finals run through May-Jun, which is when a deep run or breakout series creates real buying dips for anyone eliminated early. Ship in Jul, right after buying — ~3 months ahead of the Sep tip-off sell spike, not the month before it.",
  },
  {
    sport: "WWE",
    key: "WWE",
    blocks: [
      { m: "Jan", t: "GRADE" }, { m: "Feb", t: "SELL" }, { m: "Mar", t: "SELL" }, { m: "Apr", t: "SELL" },
      { m: "May", t: "GRADE" }, { m: "Jun", t: "BUY" }, { m: "Jul", t: "BUY" }, { m: "Aug", t: "GRADE" },
      { m: "Sep", t: "GRADE" }, { m: "Oct", t: "SHIP" }, { m: "Nov", t: "GRADE" }, { m: "Dec", t: "GRADE" },
    ],
    note: "WrestleMania season (Feb-Apr, the show itself early April) is easily the single biggest spike of the year for the whole hobby — sell into it. Buy in the quiet post-Mania dip (Jun-Jul), then ship in Oct — that's ~3-4 months of grading runway to have cards back in hand right as the next WrestleMania buildup starts in Feb.",
  },
  {
    sport: "Soccer",
    key: "Soccer",
    blocks: [
      { m: "Jan", t: "GRADE" }, { m: "Feb", t: "BUY" }, { m: "Mar", t: "GRADE" }, { m: "Apr", t: "SHIP" },
      { m: "May", t: "GRADE" }, { m: "Jun", t: "SELL" }, { m: "Jul", t: "SELL" }, { m: "Aug", t: "SELL" },
      { m: "Sep", t: "GRADE" }, { m: "Oct", t: "BUY" }, { m: "Nov", t: "BUY" }, { m: "Dec", t: "GRADE" },
    ],
    note: "European season runs Aug-May; season kickoff (Aug) and a June-July major tournament (World Cup/Euros, when one's on — 2026 is a World Cup year) are massive spikes. Ship in Apr, ~3 months ahead of the Jun sell window, using the Jan transfer-window buy. Jan transfer window creates cheap entry points on players about to move to bigger clubs.",
  },
  {
    sport: "MMA",
    key: "MMA",
    blocks: [
      { m: "Jan", t: "GRADE" }, { m: "Feb", t: "BUY" }, { m: "Mar", t: "BUY" }, { m: "Apr", t: "SHIP" },
      { m: "May", t: "GRADE" }, { m: "Jun", t: "SELL" }, { m: "Jul", t: "SELL" }, { m: "Aug", t: "GRADE" },
      { m: "Sep", t: "GRADE" }, { m: "Oct", t: "GRADE" }, { m: "Nov", t: "BUY" }, { m: "Dec", t: "GRADE" },
    ],
    note: "International Fight Week (late Jun/early Jul) is the promotion's biggest annual event and the clearest sell spike. Ship in Apr, right after buying, for ~3 months of runway before it. No off-season means quieter months are more about the absence of a big card than a calendar rule — always check who's actually fighting soon.",
  },
];

const SEASON_COLORS = {
  BUY: { bg: "#4E8B6B33", text: "#7FC69B" },
  SELL: { bg: "#B4472E33", text: "#E38A73" },
  GRADE: { bg: "#C9A22733", text: "#DCB539" },
  SHIP: { bg: "#5C6270", text: "#D5D8DE" },
};

// Looks up what the calendar recommends for a given sport this month — used both in the
// static Tips & Tricks table and to cross-check a card's Sell decision against timing.
function seasonActionForMonth(sportKey, monthIndex) {
  const row = SEASON_ROWS.find((r) => r.key === sportKey);
  if (!row) return null;
  return row.blocks[monthIndex]?.t || null;
}

// Cross-checks a Sell decision against the seasonal calendar for that sport — used in the
// My Cards detail view so a "sell now" call also tells you whether now is actually a good
// time by the calendar, not just profitable in isolation.
function seasonalSellCheck(sport) {
  const row = SEASON_ROWS.find((r) => r.key === sport);
  if (!row) return null;
  const monthIndex = new Date().getMonth();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentAction = row.blocks[monthIndex]?.t;
  let nextSellMonth = null;
  for (let i = 1; i <= 12; i++) {
    const idx = (monthIndex + i) % 12;
    if (row.blocks[idx]?.t === "SELL") {
      nextSellMonth = row.blocks[idx].m;
      break;
    }
  }
  return {
    isGoodTiming: currentAction === "SELL",
    currentAction,
    monthName: monthNames[monthIndex],
    nextSellMonth,
    sportLabel: row.sport,
    note: row.note,
  };
}

function SeasonCalendar() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", gap: 14, marginBottom: 10, flexWrap: "wrap" }}>
        {Object.entries(SEASON_COLORS).map(([k, c]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: c.bg, border: `1px solid ${c.text}` }} />
            <span style={{ color: c.text, fontWeight: 600 }}>{k}</span>
          </div>
        ))}
      </div>
      <div style={{ border: "1px solid #2C303B", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "130px repeat(12, 1fr)" }}>
          <div style={{ background: "#1D2028", padding: "8px 10px" }} />
          {months.map((m) => (
            <div key={m} className="mono" style={{ background: "#1D2028", padding: "8px 4px", fontSize: 10.5, color: "#8B90A0", textAlign: "center", borderLeft: "1px solid #2C303B" }}>
              {m}
            </div>
          ))}
        </div>
        {SEASON_ROWS.map((row) => (
          <div key={row.sport}>
          <div style={{ display: "grid", gridTemplateColumns: "130px repeat(12, 1fr)", borderTop: "1px solid #2C303B" }}>
            <div style={{ padding: "10px", fontSize: 12.5, fontWeight: 600, color: "#EDEAE1", display: "flex", alignItems: "center" }}>{row.sport}</div>
            {row.blocks.map((b, i) => {
              const c = SEASON_COLORS[b.t];
              return (
                <div key={i} style={{ background: c.bg, color: c.text, borderLeft: "1px solid #14161C", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 2px", fontSize: 10, fontWeight: 700, letterSpacing: "0.02em" }}>
                  {b.t}
                </div>
              );
            })}
          </div>
          <div style={{ padding: "6px 10px 10px", fontSize: 10.5, color: "#6B7180", lineHeight: 1.5, background: "#14161C" }}>{row.note}</div>
        </div>
        ))}
      </div>
    </div>
  );
}

function GixenPlaybook() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
      <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22" }}>
        <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 13.5, color: "#C9A227" }}>🎯 How to use this with Gixen</div>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "#C6CAD4", lineHeight: 1.8 }}>
          <li>Look up <b>Avg Market Price (60d)</b> → paste into the evaluator</li>
          <li>Enter shipping cost: AU → $7, ShipMyCards → $20–25</li>
          <li>Select Auction Heat: Cold / Mid / Hot</li>
          <li>Read the <b>Max Snipe Bid</b> → paste that number into Gixen's max bid field</li>
          <li>Only bid if the decision reads <b>BUY</b></li>
        </ol>
      </div>

      <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22" }}>
        <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 13.5, color: "#C9A227" }}>🇺🇸 ShipMyCards best practice</div>
        <div style={{ fontSize: 12.5, color: "#C6CAD4", lineHeight: 1.7, marginBottom: 8 }}>
          Postcode: 85340. When using ShipMyCards, set shipping to $20–25 and keep everything else the same — this automatically tightens your max bid.
        </div>
        <div style={{ fontSize: 12, color: "#8B90A0", fontStyle: "italic" }}>Stops "US bargain → AU loss" situations.</div>
      </div>

      <div style={{ border: "1px solid #C9A22755", borderRadius: 10, padding: "14px 16px", background: "#191B22" }}>
        <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13.5, color: "#C9A227" }}>🧠 Golden rule</div>
        <div style={{ fontSize: 13, color: "#EDEAE1", marginBottom: 10 }}>Never bid above the Max Snipe Bid — even if it "feels" cheap.</div>
        <div style={{ fontSize: 11, color: "#6B7180", textTransform: "uppercase", marginBottom: 4 }}>Per-card budget cap</div>
        <div style={{ fontSize: 12.5, color: "#C6CAD4", lineHeight: 1.7 }}>
          Raw: $50 · PSA 9: $100 · Pokémon / inserts: $25
        </div>
      </div>

      <div style={{ gridColumn: "1 / -1", border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22" }}>
        <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 13.5, color: "#C9A227" }}>💵 Grading cost reference</div>
        <table style={{ width: "100%", fontSize: 12, color: "#C6CAD4", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#8B90A0", textAlign: "left" }}>
              <th style={{ fontWeight: 500, paddingBottom: 6 }}>Service</th>
              <th style={{ fontWeight: 500 }}>Cost</th>
              <th style={{ fontWeight: 500 }}>Turnaround</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ padding: "3px 0" }}>SGC via Australia (Slabd)</td><td>$39.95</td><td>—</td></tr>
            <tr><td style={{ padding: "3px 0" }}>PSA via ShipMyCards (US)</td><td>~$38.90</td><td>—</td></tr>
            <tr><td style={{ padding: "3px 0" }}>PSA via Australia (The Hobby) — under $500 declared value</td><td>$50</td><td>7-8 months</td></tr>
            <tr><td style={{ padding: "3px 0" }}>PSA via Australia — under $1,000</td><td>$140</td><td>2-2.5 months</td></tr>
            <tr><td style={{ padding: "3px 0" }}>PSA via Australia — under $1,500</td><td>$165</td><td>1.5-2 months</td></tr>
            <tr><td style={{ padding: "3px 0" }}>PSA via Australia — under $2,500</td><td>$299</td><td>1-1.5 months</td></tr>
            <tr><td style={{ padding: "3px 0" }}>PSA via Australia — under $5,000</td><td>$699</td><td>7-10 business days</td></tr>
          </tbody>
        </table>
        <div style={{ fontSize: 11, color: "#6B7180", marginTop: 10 }}>
          PSA via Australia is value-tiered, not flat — the app calculates this automatically off your PSA 9/10 comps. Declared values are in USD; non-US-produced cards (Japanese Pokémon, One Piece, Lorcana, Yu-Gi-Oh, Dragon Ball) route via PSA Hong Kong and add 1-2 months. Card+auto grading and vintage/faster-service tiers run higher — check current pricing before submitting anything unusual.
        </div>
      </div>

      <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22" }}>
        <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 13.5, color: "#C9A227" }}>🔥 Auction heat signals</div>
        <table style={{ width: "100%", fontSize: 12, color: "#C6CAD4", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#8B90A0", textAlign: "left" }}>
              <th style={{ fontWeight: 500, paddingBottom: 6 }}>Signal</th>
              <th style={{ fontWeight: 500 }}>Cold</th>
              <th style={{ fontWeight: 500 }}>Mid</th>
              <th style={{ fontWeight: 500 }}>Hot</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "3px 0" }}>Bids</td>
              <td style={{ color: "#4E8B6B" }}>0–2</td>
              <td style={{ color: "#C9A227" }}>3–6</td>
              <td style={{ color: "#B4472E" }}>7+</td>
            </tr>
            <tr>
              <td style={{ padding: "3px 0" }}>Watchers</td>
              <td style={{ color: "#4E8B6B" }}>0–3</td>
              <td style={{ color: "#C9A227" }}>4–8</td>
              <td style={{ color: "#B4472E" }}>9+</td>
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: 11.5, color: "#6B7180", marginTop: 8 }}>Watchers + bids together matter more than either alone — 3 bids + 10 watchers is Hot even though bids alone read Mid.</div>
      </div>

      <div style={{ gridColumn: "1 / -1", border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22" }}>
        <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 13.5, color: "#C9A227" }}>📊 % Gap rule — (Market Price − Target Buy) ÷ Market Price</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          <div style={{ background: "#4E8B6B18", border: "1px solid #4E8B6B55", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ color: "#4E8B6B", fontWeight: 700, fontSize: 12.5, marginBottom: 4 }}>🟢 Auto-buy — 30%+ below average</div>
            <div style={{ fontSize: 12, color: "#C6CAD4" }}>Strong outlier, bad auction or lazy seller. Buy immediately if liquidity is there.</div>
          </div>
          <div style={{ background: "#C9A22718", border: "1px solid #C9A22755", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ color: "#C9A227", fontWeight: 700, fontSize: 12.5, marginBottom: 4 }}>🟡 Conditional — 20–30% below average</div>
            <div style={{ fontSize: 12, color: "#C6CAD4" }}>Buy only if 5+ sales in 30 days AND you can still net 20% after fees.</div>
          </div>
          <div style={{ background: "#B4472E18", border: "1px solid #B4472E55", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ color: "#B4472E", fontWeight: 700, fontSize: 12.5, marginBottom: 4 }}>🔴 No-buy — under 20% below average</div>
            <div style={{ fontSize: 12, color: "#C6CAD4" }}>Fees eat you alive, no buffer if the market softens. Skip it.</div>
          </div>
        </div>
        <div style={{ fontSize: 11.5, color: "#6B7180", marginTop: 10 }}>
          Sell-side rule of thumb (ShipMyCards value to make profit): Raw $60–70 · PSA 9 $100+ · PSA 10 $180+.
        </div>
      </div>
    </div>
  );
}

function SearchCard({ s }) {
  const [copyState, setCopyState] = useState("idle");
  const ebayUrl = `https://www.ebay.com.au/sch/i.html?_nkw=${encodeURIComponent(s.query)}&LH_Auction=1`;

  async function copy() {
    const ok = await copyToClipboard(s.query);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => setCopyState("idle"), 2000);
  }

  return (
    <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22" }}>
      <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 8 }}>{s.group}</div>
      <div
        className="mono"
        onClick={selectAllText}
        title="Click to select the text if Copy doesn't work"
        style={{ fontSize: 12, color: "#C9A227", background: "#14161C", border: "1px solid #24272F", borderRadius: 6, padding: "8px 10px", marginBottom: 8, wordBreak: "break-word", cursor: "text", userSelect: "all" }}
      >
        {s.query}
      </div>
      <div style={{ fontSize: 11.5, color: "#6B7180", marginBottom: s.note ? 6 : 10 }}>{s.filters}</div>
      {s.note && <div style={{ fontSize: 12, color: "#A7ADBB", marginBottom: 10, fontStyle: "italic" }}>{s.note}</div>}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btnSecondary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "6px 12px" }} onClick={copy}>
          {copyState === "copied" ? <Check size={13} /> : <Copy size={13} />} {copyState === "copied" ? "Copied" : "Copy"}
        </button>
        <a href={ebayUrl} target="_blank" rel="noreferrer" className="btnSecondary" style={{ display: "flex", alignItems: "center", fontSize: 12, padding: "6px 12px", textDecoration: "none" }}>
          Search eBay AU
        </a>
        {copyState === "failed" && <span style={{ fontSize: 11, color: "#B4472E" }}>Couldn't auto-copy — click the text to select it</span>}
      </div>
    </div>
  );
}

function PlaybookCard({ title, color, items }) {
  return (
    <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "14px 16px", background: "#191B22" }}>
      <div style={{ fontWeight: 600, color, marginBottom: 10, fontSize: 13.5 }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#C6CAD4", lineHeight: 1.7 }}>
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}

function TargetCard({ sport, items }) {
  return (
    <div style={{ border: "1px solid #2C303B", borderRadius: 10, padding: "12px 14px", background: "#191B22" }}>
      <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13.5 }}>{sport}</div>
      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: "#A7ADBB", lineHeight: 1.6 }}>
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}

// ===== Shared bits =====

function ModalHeader({ title, onClose }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
      <h2 className="oswald" style={{ margin: 0, fontSize: 20 }}>{title}</h2>
      <X size={20} style={{ cursor: "pointer", color: "#8B90A0" }} onClick={onClose} />
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ fontSize: 11, color: "#6B7180", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, marginTop: 4 }}>{children}</div>;
}

function Field({ label, children }) {
  return (
    <div>
      <label>{label}</label>
      {children}
    </div>
  );
}

// Two quick "most recent sale" inputs instead of manually averaging 5 sales.
// Second sale is optional; leaving both blank means N/A (no data for this tier).
function TierPriceInput({ label, sale1, sale2, onChange1, onChange2 }) {
  const avg = avgOfSales(sale1, sale2);
  return (
    <div>
      <label>{label}</label>
      <div style={{ display: "flex", gap: 6 }}>
        <input type="number" step="0.01" placeholder="N/A" value={sale1} onChange={(e) => onChange1(e.target.value)} />
        <input type="number" step="0.01" placeholder="2nd (opt.)" value={sale2} onChange={(e) => onChange2(e.target.value)} />
      </div>
      <div style={{ fontSize: 10.5, color: "#6B7180", marginTop: 3 }}>
        {avg != null ? `→ ${avg.toFixed(2)}` : "no data"}
      </div>
    </div>
  );
}

// Rookie + Numbered/print-run fields, shared across My Cards and Buy Evaluator forms
function RookieNumberedFields({ form, setForm }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: form.numbered ? "1fr 1fr 1fr" : "1fr 1fr", gap: 10 }}>
      <Field label="Rookie?">
        <select value={form.rookie ? "Yes" : "No"} onChange={(e) => setForm({ ...form, rookie: e.target.value === "Yes" })}>
          <option>No</option>
          <option>Yes</option>
        </select>
      </Field>
      <Field label="Numbered?">
        <select
          value={form.numbered ? "Yes" : "No"}
          onChange={(e) => {
            const isNumbered = e.target.value === "Yes";
            setForm({ ...form, numbered: isNumbered, outOf: isNumbered ? form.outOf : "" });
          }}
        >
          <option>No</option>
          <option>Yes</option>
        </select>
      </Field>
      {form.numbered && (
        <Field label="Out of #">
          <input type="number" min="1" step="1" placeholder="e.g. 175" value={form.outOf ?? ""} onChange={(e) => setForm({ ...form, outOf: e.target.value })} />
        </Field>
      )}
    </div>
  );
}

function MiniStat({ label, value, color, emphasis }) {
  return (
    <div style={{ background: "#14161C", border: emphasis ? "1px solid #C9A22755" : "1px solid #24272F", borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ fontSize: 10, color: "#6B7180", marginBottom: 3, textTransform: "uppercase" }}>{label}</div>
      <div className="oswald" style={{ fontSize: emphasis ? 17 : 15, fontWeight: 600, color: color || "#EDEAE1" }}>{value}</div>
    </div>
  );
}

// Compact trend chart of a tier's value history — deliberately small (this is a glance,
// not an analysis tool). Falls back to a plain message until there are at least 2 points.
function TrendSparkline({ history, color }) {
  const points = history || [];
  const label = points.length ? null : null;

  if (points.length < 2) {
    return (
      <div style={{ background: "#14161C", border: "1px solid #24272F", borderRadius: 8, padding: "8px 10px", height: 62, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 10.5, color: "#5C6270", textAlign: "center" }}>
          {points.length === 1 ? "Only 1 data point yet" : "No history yet"}
        </span>
      </div>
    );
  }

  return (
    <div style={{ background: "#14161C", border: "1px solid #24272F", borderRadius: 8, padding: "6px 8px 4px" }}>
      <div style={{ height: 46 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points}>
            <YAxis domain={["dataMin", "dataMax"]} hide />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 2, fill: color }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ fontSize: 9.5, color: "#6B7180", textAlign: "center", marginTop: 2 }}>
        {points[0].date} → {points[points.length - 1].date}
      </div>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    width: "100%",
    background: "#14161C",
    backgroundImage: "radial-gradient(circle at 15% 10%, rgba(201,162,39,0.06), transparent 40%), radial-gradient(circle at 85% 90%, rgba(139,111,214,0.06), transparent 45%)",
    color: "#EDEAE1",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
};

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
      * { box-sizing: border-box; }
      .oswald { font-family: 'Oswald', sans-serif; }
      .mono { font-family: 'JetBrains Mono', monospace; }
      .filterBtn { background: transparent; border: 1px solid #333844; color: #A7ADBB; padding: 6px 14px; border-radius: 999px; font-size: 13px; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.15s ease; }
      .filterBtn.active { background: #EDEAE1; color: #14161C; border-color: #EDEAE1; font-weight: 600; }
      .btnPrimary { background: #C9A227; color: #14161C; border: none; border-radius: 8px; padding: 10px 18px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
      .btnPrimary:hover { background: #DCB539; }
      .btnSecondary { background: transparent; border: 1px solid #333844; color: #EDEAE1; border-radius: 8px; padding: 9px 16px; font-size: 13px; cursor: pointer; }
      .cardRow:hover { background: #1D2028; }
      input, select { background: #14161C; border: 1px solid #333844; color: #EDEAE1; border-radius: 6px; padding: 9px 11px; font-size: 14px; font-family: 'Inter', sans-serif; width: 100%; }
      input:focus, select:focus { outline: 2px solid #C9A227; outline-offset: 1px; }
      label { font-size: 12px; color: #8B90A0; margin-bottom: 4px; display: block; }
      .modalOverlay { position: fixed; inset: 0; background: rgba(10,11,15,0.72); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
      .modalBox { background: #191B22; border: 1px solid #2C303B; border-radius: 14px; max-width: 480px; width: 100%; max-height: 88vh; overflow-y: auto; padding: 24px; }
    `}</style>
  );
}
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.render(React.createElement(App), rootElement);
}
