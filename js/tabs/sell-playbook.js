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
