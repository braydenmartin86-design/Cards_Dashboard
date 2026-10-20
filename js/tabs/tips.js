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

// Month-by-month plan per sport. SHIP months sit ~3 months before a SELL window, since grading
// from Australia takes about 3 months. GRADE = hold, or cards away being graded.
const SEASON_ROWS = [
  {
    sport: "Football (NFL)",
    key: "NFL",
    blocks: [
      { m: "Jan", t: "SELL" }, { m: "Feb", t: "GRADE" }, { m: "Mar", t: "BUY" }, { m: "Apr", t: "BUY" },
      { m: "May", t: "BUY" }, { m: "Jun", t: "SHIP" }, { m: "Jul", t: "GRADE" }, { m: "Aug", t: "SELL" },
      { m: "Sep", t: "SELL" }, { m: "Oct", t: "GRADE" }, { m: "Nov", t: "GRADE" }, { m: "Dec", t: "GRADE" },
    ],
    note: "Demand peaks in season — Week 1 rookie hype (Sep) and the playoffs (Jan). The off-season after the Super Bowl (Mar-May) is the cheapest stretch to buy. Careful around the draft (late Apr): drafted rookies usually jump in price, so buy them before it or well after. Ship in Jun so slabs are back for the Aug-Sep sell window.",
  },
  {
    sport: "AFL",
    key: "AFL",
    blocks: [
      { m: "Jan", t: "GRADE" }, { m: "Feb", t: "GRADE" }, { m: "Mar", t: "SELL" }, { m: "Apr", t: "GRADE" },
      { m: "May", t: "SHIP" }, { m: "Jun", t: "GRADE" }, { m: "Jul", t: "GRADE" }, { m: "Aug", t: "SELL" },
      { m: "Sep", t: "SELL" }, { m: "Oct", t: "BUY" }, { m: "Nov", t: "BUY" }, { m: "Dec", t: "SHIP" },
    ],
    note: "Finals, the Grand Final and the Brownlow (Aug-Sep) are the biggest spike by far, with a smaller one at Round 1 (Mar). The quiet stretch after the Grand Final (Oct-Nov, including the trade period and draft) is the cheapest time to buy. Ship in Dec for Mar, or in May for Aug-Sep. AFL buyers are mostly local, so check Australian groups too.",
  },
  {
    sport: "Baseball (MLB)",
    key: "MLB",
    blocks: [
      { m: "Jan", t: "GRADE" }, { m: "Feb", t: "GRADE" }, { m: "Mar", t: "SELL" }, { m: "Apr", t: "SELL" },
      { m: "May", t: "SELL" }, { m: "Jun", t: "GRADE" }, { m: "Jul", t: "GRADE" }, { m: "Aug", t: "GRADE" },
      { m: "Sep", t: "GRADE" }, { m: "Oct", t: "GRADE" }, { m: "Nov", t: "BUY" }, { m: "Dec", t: "SHIP" },
    ],
    note: "Interest builds through spring training into Opening Day (late Mar), early-season hot starts (Apr) and Bowman's release (May), when prospects get hyped — sell into that. The off-season (Nov-Dec) is the buying window; avoid buying players still in the October playoffs. Ship in Dec so slabs are back for Mar.",
  },
  {
    sport: "Basketball (NBA)",
    key: "NBA",
    blocks: [
      { m: "Jan", t: "GRADE" }, { m: "Feb", t: "SELL" }, { m: "Mar", t: "GRADE" }, { m: "Apr", t: "GRADE" },
      { m: "May", t: "GRADE" }, { m: "Jun", t: "BUY" }, { m: "Jul", t: "SHIP" }, { m: "Aug", t: "BUY" },
      { m: "Sep", t: "GRADE" }, { m: "Oct", t: "SELL" }, { m: "Nov", t: "SELL" }, { m: "Dec", t: "GRADE" },
    ],
    note: "Prices for players still in the playoffs (Apr-Jun) are at their highest, so only buy players knocked out early. The real lull is after the Finals and draft (late Jun-Aug). Ship in Jul for the season start and rookie hype (Oct-Nov); All-Star and Prizm's release (Feb) are a second window.",
  },
  {
    sport: "Basketball (WNBA)",
    key: "WNBA",
    blocks: [
      { m: "Jan", t: "BUY" }, { m: "Feb", t: "SHIP" }, { m: "Mar", t: "BUY" }, { m: "Apr", t: "GRADE" },
      { m: "May", t: "SELL" }, { m: "Jun", t: "SHIP" }, { m: "Jul", t: "SELL" }, { m: "Aug", t: "GRADE" },
      { m: "Sep", t: "SELL" }, { m: "Oct", t: "SELL" }, { m: "Nov", t: "BUY" }, { m: "Dec", t: "BUY" },
    ],
    note: "The season runs mid-May to September, with the playoffs and Finals in Sep-Oct. Demand spikes at tip-off and rookie debuts (May), All-Star (Jul) and the playoffs. The long off-season (Nov-Mar) is the cheapest time to buy. The draft is mid-April — buy draft picks before it or well after, like the NFL. Ship in Feb so slabs are back for May, or Jun for the playoffs. Buyers are mostly in the US, and star rookies drive most of the market, so a player's form matters more than the month.",
  },
  {
    sport: "WWE",
    key: "WWE",
    blocks: [
      { m: "Jan", t: "GRADE" }, { m: "Feb", t: "SELL" }, { m: "Mar", t: "SELL" }, { m: "Apr", t: "SELL" },
      { m: "May", t: "GRADE" }, { m: "Jun", t: "BUY" }, { m: "Jul", t: "BUY" }, { m: "Aug", t: "GRADE" },
      { m: "Sep", t: "GRADE" }, { m: "Oct", t: "SHIP" }, { m: "Nov", t: "GRADE" }, { m: "Dec", t: "GRADE" },
    ],
    note: "Royal Rumble (late Jan) through WrestleMania (Apr) is the biggest spike of the year — sell into it. Buy in the quiet post-Mania dip (Jun-Jul), then ship in Oct so slabs are back as the Rumble/Mania buildup starts.",
  },
  {
    sport: "Soccer",
    key: "Soccer",
    blocks: [
      { m: "Jan", t: "GRADE" }, { m: "Feb", t: "GRADE" }, { m: "Mar", t: "SELL" }, { m: "Apr", t: "SELL" },
      { m: "May", t: "BUY" }, { m: "Jun", t: "SHIP" }, { m: "Jul", t: "BUY" }, { m: "Aug", t: "GRADE" },
      { m: "Sep", t: "SELL" }, { m: "Oct", t: "GRADE" }, { m: "Nov", t: "GRADE" }, { m: "Dec", t: "SHIP" },
    ],
    note: "Normal years: the club off-season (May-Jul) is the quiet buying window; sell at the season start (Sep) and the Champions League knockouts and title run-ins (Mar-Apr). Ship in Jun for Sep, or Dec for Mar. Tournament years are different — the Euros (2028) and World Cup (2030) make Jun-Jul a big sell window instead. The Jan transfer window can also be a cheap entry for players about to join bigger clubs.",
  },
  {
    sport: "UFC / MMA",
    key: "MMA",
    blocks: [
      { m: "Jan", t: "GRADE" }, { m: "Feb", t: "BUY" }, { m: "Mar", t: "BUY" }, { m: "Apr", t: "SHIP" },
      { m: "May", t: "GRADE" }, { m: "Jun", t: "SELL" }, { m: "Jul", t: "SELL" }, { m: "Aug", t: "GRADE" },
      { m: "Sep", t: "GRADE" }, { m: "Oct", t: "GRADE" }, { m: "Nov", t: "BUY" }, { m: "Dec", t: "GRADE" },
    ],
    note: "UFC's International Fight Week (late Jun/early Jul) is its biggest annual event and the clearest sell spike. Ship in Apr for ~3 months of runway. There's no off-season, so who's fighting soon matters far more than the month — sell a fighter's cards in the build-up to a big fight.",
  },
  {
    sport: "Pokémon",
    key: "Pokémon",
    blocks: [
      { m: "Jan", t: "GRADE" }, { m: "Feb", t: "SELL" }, { m: "Mar", t: "GRADE" }, { m: "Apr", t: "GRADE" },
      { m: "May", t: "BUY" }, { m: "Jun", t: "BUY" }, { m: "Jul", t: "GRADE" }, { m: "Aug", t: "SHIP" },
      { m: "Sep", t: "GRADE" }, { m: "Oct", t: "GRADE" }, { m: "Nov", t: "SELL" }, { m: "Dec", t: "SELL" },
    ],
    note: "Weaker seasons than sports — set releases (roughly every 3 months) matter more than the month. Holiday demand (Nov-Dec) and Pokémon Day (27 Feb) are the clearest sell windows; ship in Aug so slabs are back for the holidays. New-set singles are usually priced highest at release and drop over the following weeks, so buy those once prices settle rather than on release day.",
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
