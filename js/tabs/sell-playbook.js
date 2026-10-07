// ===== Selling Playbook =====

const FEE_COMPARISON = [
  { platform: "eBay Live", fee: "~8.9% + $0.30", note: "Cheaper than standard eBay, but needs an approved account + enough volume/following to fill a stream" },
  { platform: "COMC Direct 2 eBay Live", fee: "$5 + 8% (5% on $1,000+)", note: "Gets eBay Live's audience without you needing your own following — send cards in, they stream them" },
  { platform: "Whatnot (AU promo hours)", fee: "~7% all-in", note: "2am-4pm AEST/AEDT daily, through Dec 31 2026 — same following/volume caveat as eBay Live" },
  { platform: "Whatnot (standard)", fee: "~10.9% + $0.30", note: "8% commission + processing, outside promo hours" },
  { platform: "Standard eBay", fee: "~13.25% + $0.30", note: "No Store subscription, always available, no approval gate" },
  { platform: "ShipMyCards Marketplace", fee: "1%", note: "Cheapest way to sell a vault card — smaller buyer pool, so slower" },
  { platform: "Fanatics Collect auction (via SMC)", fee: "1% (buyer pays 20% premium)", note: "Graded only, US$50+ minimum" },
  { platform: "PC Sportscards eBay (via SMC)", fee: "~14% + US$1 (18% under US$50)", note: "Fastest ShipMyCards option, eBay's full audience" },
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
            "Start on the ShipMyCards Marketplace (1%, no minimum) priced at comps — vault buyers can take it with no shipping",
            "Graded and US$50+? If it hasn't sold in 2–3 weeks, consign it to Fanatics Collect's weekly auction through SMC (you keep the hammer minus 1%)",
            "Raw US$50+, or a slab without much demand? Send it to PC Sportscards' eBay consignment through SMC (~14% + US$1 under US$1,000) — fastest payout",
            "Under US$50? Don't consign — keep it on the Marketplace, or batch cheap cards into one shipment home and sell them as team lots",
            "Need cash now? The SMC Purchase Program pays 70–85% of conservative value instantly — usually a worse deal than waiting a week for PC Sportscards",
            "Payouts come back as SMC store credit — confirm how you cash it out",
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
            "Is it still in the ShipMyCards vault and you don't want to keep it? → Don't ship it home. Marketplace first, then Fanatics (graded) or PC Sportscards (see below).",
            "Is it worth $1,000+? → Look at Fanatics Collect (formerly PWCC) or a specialist high-value consignor for better exposure, not a generic listing",
            "Is it AFL or otherwise Australia-specific? → Check local groups before defaulting to eBay's global audience",
            "Do you have eBay Live access or the ability to go live on Whatnot during AU promo hours? → Use whichever is cheaper for that item",
            "None of the above? → Standard eBay is the reliable, always-available fallback",
          ]}
        />
      </div>

      <div style={{ height: 12 }} />
      <SectionTitle>Selling from the ShipMyCards vault — which option</SectionTitle>
      <div style={{ border: "1px solid #4E8B6B55", borderRadius: 10, padding: "16px 18px", background: "#4E8B6B0f", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#4E8B6B", marginBottom: 10 }}>💰 My suggested approach (US$ values)</div>
        <ol style={{ margin: "0 0 12px", paddingLeft: 20, fontSize: 13, color: "#C6CAD4", lineHeight: 1.75 }}>
          <li style={{ marginBottom: 6 }}>
            <b style={{ color: "#EDEAE1" }}>List on the Marketplace first, priced at comps.</b> At 1% it's by far the cheapest, and the buyer can keep the card in their own vault with no shipping.
          </li>
          <li style={{ marginBottom: 6 }}>
            <b style={{ color: "#EDEAE1" }}>If it hasn't sold after about 3 weeks:</b>
            <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
              <li><b style={{ color: "#C9A227" }}>Graded, US$50+, strong demand</b> (e.g. a PSA 10 of a key rookie): Fanatics weekly auction.</li>
              <li><b style={{ color: "#C9A227" }}>Everything else over US$50:</b> PC Sportscards. Their auctions start at 99c, so ask for fixed price with an auto-decline at your break-even; they allow that on cards US$50+.</li>
            </ul>
          </li>
          <li>
            <b style={{ color: "#EDEAE1" }}>Under US$50:</b> don't consign; 18% + US$1 is too much. Leave it on the Marketplace, or ship your cheap cards home together in one box and sell them as team lots like your Bulls lot.
          </li>
        </ol>
        <div style={{ fontSize: 11.5, color: "#6B7180", lineHeight: 1.7 }}>
          The Marketplace-first habit pairs with the Listing check-up on My Sales: set the selling method to ShipMyCards Marketplace, and when it's 3 weeks unsold the check-up tells you to move it to PC Sportscards. Payouts from Fanatics and PC Sportscards come back as <b>ShipMyCards store credit</b> — check with SMC how and at what cost you can cash that out before relying on it for anything other than grading, shipping or buying.
        </div>
      </div>

      <div style={{ border: "1px solid #2C303B", borderRadius: 10, overflow: "hidden", marginBottom: 28 }}>
        <table style={{ width: "100%", fontSize: 12, color: "#C6CAD4", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1D2028", textAlign: "left" }}>
              <th style={{ padding: "8px 12px", fontWeight: 500, color: "#8B90A0" }}>ShipMyCards option</th>
              <th style={{ padding: "8px 12px", fontWeight: 500, color: "#8B90A0" }}>What it costs you</th>
              <th style={{ padding: "8px 12px", fontWeight: 500, color: "#8B90A0" }}>Use it for</th>
            </tr>
          </thead>
          <tbody>
            {SMC_OPTIONS.map((c, i) => (
              <tr key={i} style={{ borderTop: "1px solid #24272F" }}>
                <td style={{ padding: "8px 12px", fontWeight: 600, color: "#EDEAE1" }}>{c.name}</td>
                <td style={{ padding: "8px 12px", color: "#C9A227" }} className="mono">{c.fee}</td>
                <td style={{ padding: "8px 12px", color: "#6B7180" }}>{c.bestFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionTitle>Cards in hand — consignors you'd ship to yourself</SectionTitle>
      <div style={{ fontSize: 12.5, color: "#8B90A0", marginBottom: 14, lineHeight: 1.6 }}>
        Only worth it for cards already in Australia when you don't want to list them yourself — you pay the international shipping to get them there.
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

const SMC_OPTIONS = [
  { name: "ShipMyCards Marketplace", fee: "1%", bestFor: "Default first try — any card, no minimum. Smaller buyer pool, so slower" },
  { name: "Fanatics Collect auction (via SMC)", fee: "0% + 1% SMC (buyer pays 20% premium)", bestFor: "Graded only, $50+ minimum. High-demand slabs; weekly auctions run ~10 days" },
  { name: "Fanatics Collect Buy Now (via SMC)", fee: "6% + 1% SMC", bestFor: "Graded $50+ when you'd rather set the price than auction it" },
  { name: "PC Sportscards eBay (via SMC)", fee: "13–17% + US$1 + 1% (8% at $1k+, 5% at $5k+)", bestFor: "Raw $50+, or slabs without much Fanatics demand. Fastest turnaround" },
  { name: "Card Show Consignment", fee: "US$10/card + 2% if sold", bestFor: "Only $200+ cards where $10 is small, and you can wait for a show (~6 a year)" },
  { name: "Purchase Program", fee: "Paid 70–85% of conservative value", bestFor: "Only when you need the money now — $50–$5,000, raw or graded, instant store credit" },
];

const CONSIGNMENT_COMPARISON = [
  { name: "DCSports87", fee: "~15-20%", bestFor: "Everyday mixed-value cards, no minimum — not offered as a ShipMyCards option, so only for cards you ship yourself" },
  { name: "Fanatics Collect (direct)", fee: "6% Buy Now, or 0% + buyer premium at auction", bestFor: "Graded $1,000+ singles" },
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
