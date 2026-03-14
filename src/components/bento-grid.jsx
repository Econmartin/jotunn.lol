import { useState, useEffect } from "react";

const SERVICES = [
  {
    id: "funnel", label: "01", title: "Full-Funnel Revenue",
    tagline: "End-to-end GTM system ownership from positioning to pipeline.",
    description: "Get complete ownership of the GTM system. From positioning and campaign execution — ads, content, and all demand gen channels — to qualification and handoffs, we ensure pipeline is built, measured, and trusted across marketing and sales.",
    features: ["Demand Gen", "Campaigns", "Pipeline", "Conversion"],
    accent: "#E8FF5A", accentDark: "#1a1d00", row: 0,
  },
  {
    id: "abm", label: "02", title: "Account-Based Revenue",
    tagline: "Precision-targeted engagement for enterprise buyers.",
    description: "Move beyond spray and pray. Execute ABM the way enterprise buyers actually buy. Orchestrate targeted accounts, buying-group messaging, and multi-channel execution to create real engagement.",
    features: ["Target Accounts", "Buying Groups", "Multi-Channel", "Intent Signals"],
    accent: "#5AFFE8", accentDark: "#002d2a", row: 0,
  },
  {
    id: "revops", label: "03", title: "RevOps & Tech Stack",
    tagline: "Systems architecture that scales with your ambition.",
    description: "Work with a technical team that knows the entire ecosystem — handling complex CRM implementations, attribution models, and tool integrations aligned with GTM strategy.",
    features: ["CRM Architecture", "Attribution", "Automation", "Reporting"],
    accent: "#C49AFF", accentDark: "#1a0033", row: 1,
  },
  {
    id: "creative", label: "04", title: "Creative & Content",
    tagline: "Performance content that converts at every stage.",
    description: "High-velocity content production paired with strategic distribution. From thought leadership to ad creatives and sales collateral — everything tied to pipeline impact.",
    features: ["Thought Leadership", "Ad Creative", "Collateral", "Distribution"],
    accent: "#FF8C5A", accentDark: "#331a00", row: 1,
  },
  {
    id: "analytics", label: "05", title: "Analytics & Intelligence",
    tagline: "Turn data chaos into strategic clarity.",
    description: "Unified dashboards, custom attribution models, and predictive analytics that tell you what's working, what's not, and where to double down.",
    features: ["Dashboards", "Predictive", "Cohort Analysis", "ROI Modeling"],
    accent: "#FF5A8C", accentDark: "#33001a", row: 1,
  },
];

const ICONS = {
  funnel: (<svg viewBox="0 0 48 48" fill="none" style={{width:32,height:32}}><path d="M8 8L24 40L40 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 16H36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".5"/></svg>),
  abm: (<svg viewBox="0 0 48 48" fill="none" style={{width:32,height:32}}><circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2.5" opacity=".3"/><circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="2.5" opacity=".55"/><circle cx="24" cy="24" r="4" fill="currentColor"/></svg>),
  revops: (<svg viewBox="0 0 48 48" fill="none" style={{width:32,height:32}}><rect x="8" y="8" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="2.5"/><rect x="28" y="8" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="2.5" opacity=".5"/><rect x="8" y="28" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="2.5" opacity=".5"/><rect x="28" y="28" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="2.5" opacity=".3"/></svg>),
  creative: (<svg viewBox="0 0 48 48" fill="none" style={{width:32,height:32}}><path d="M12 36V16L24 8L36 16V36" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/><path d="M20 36V26H28V36" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" opacity=".6"/></svg>),
  analytics: (<svg viewBox="0 0 48 48" fill="none" style={{width:32,height:32}}><path d="M8 38H40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><path d="M14 38V26" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity=".3"/><path d="M22 38V18" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity=".55"/><path d="M30 38V22" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity=".75"/><path d="M38 38V12" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/></svg>),
};

const EASE = "cubic-bezier(0.4, 0, 0.12, 1)";

function FeatureTag({ text, accent }) {
  return (
    <span style={{
      display: "inline-block", padding: "4px 12px", borderRadius: 100,
      fontSize: 11, fontWeight: 500, letterSpacing: ".03em",
      border: `1px solid ${accent}30`, color: accent, background: `${accent}0A`, whiteSpace: "nowrap",
    }}>{text}</span>
  );
}

/* ─── Card inner content (shared between both variants) ─── */
function CardContent({ service, isActive, isCompressed, onClose }) {
  return (
    <>
      <div style={{
        position: "absolute", top: -70, right: -70, width: 200, height: 200, borderRadius: "50%",
        background: service.accent, opacity: isActive ? 0.1 : 0.02,
        filter: "blur(60px)", transition: "opacity 0.5s ease", pointerEvents: "none",
      }} />
      <div style={{
        padding: isActive ? "28px 32px" : isCompressed ? "20px 14px" : "20px 22px",
        flex: 1, display: "flex", flexDirection: "column",
        position: "relative", zIndex: 2, overflow: "hidden",
        transition: `padding 0.55s ${EASE}`,
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isActive ? 16 : 14, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ color: service.accent, opacity: 0.6, flexShrink: 0 }}>{ICONS[service.id]}</div>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 600,
              letterSpacing: ".18em", textTransform: "uppercase", color: service.accent, opacity: 0.45,
              whiteSpace: "nowrap", overflow: "hidden",
            }}>{service.label}</span>
          </div>
          {isActive && (
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{
              width: 30, height: 30, borderRadius: 9, border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)", color: "#888", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, transition: "all 0.2s", flexShrink: 0,
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#888"; }}
            >✕</button>
          )}
        </div>

        <h2 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: isActive ? 26 : isCompressed ? 15 : 17,
          fontWeight: 700, color: "#EDEDF0", margin: 0, lineHeight: 1.2, letterSpacing: "-0.02em",
          transition: `font-size 0.45s ${EASE}`,
          whiteSpace: isCompressed ? "nowrap" : "normal", overflow: "hidden", textOverflow: "ellipsis",
        }}>{service.title}</h2>

        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#666", margin: "6px 0 0",
          lineHeight: 1.45, opacity: isCompressed ? 0 : 1, maxHeight: isCompressed ? 0 : 60,
          overflow: "hidden", transition: `opacity 0.3s ease, max-height 0.4s ${EASE}`,
        }}>{service.tagline}</p>

        {/* Expanded */}
        <div style={{
          overflow: "hidden", maxHeight: isActive ? 400 : 0, opacity: isActive ? 1 : 0,
          transition: `max-height 0.5s ${EASE}, opacity 0.35s ease 0.08s`,
          marginTop: isActive ? 14 : 0, flexShrink: 0,
        }}>
          <div style={{ height: 1, background: `linear-gradient(90deg, ${service.accent}30, transparent 60%)`, marginBottom: 14 }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, lineHeight: 1.7, color: "#9A9AA0", margin: "0 0 16px", maxWidth: 540 }}>{service.description}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {service.features.map((f) => <FeatureTag key={f} text={f} accent={service.accent} />)}
          </div>
          <div style={{ marginTop: 20 }}>
            <button style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600,
              letterSpacing: ".05em", textTransform: "uppercase",
              color: service.accentDark, background: service.accent,
              border: "none", borderRadius: 100, padding: "10px 22px",
              cursor: "pointer", transition: "transform 0.2s, box-shadow 0.25s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 6px 20px ${service.accent}30`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >Learn More →</button>
          </div>
        </div>

        {!isActive && !isCompressed && (
          <div style={{
            marginTop: "auto", paddingTop: 10, display: "flex", alignItems: "center", gap: 5,
            color: service.accent, fontSize: 11, fontWeight: 500, opacity: 0.3,
            fontFamily: "'DM Sans', sans-serif", letterSpacing: ".04em",
          }}>
            <span>Explore</span>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        )}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   VARIANT A — Horizontal-only expand (row-locked)
   ════════════════════════════════════════════════════════════════ */
function BentoRow({ cards, activeId, setActiveId, rowHeight }) {
  const hasActive = cards.some((c) => c.id === activeId);
  return (
    <div style={{ display: "flex", gap: 12, height: rowHeight, width: "100%", overflow: "hidden" }}>
      {cards.map((service) => {
        const isActive = activeId === service.id;
        const isCompressed = hasActive && !isActive;
        const isOtherRow = activeId && !hasActive;
        let flexVal = "1 1 0%";
        if (isActive) flexVal = "6 1 0%";
        else if (isCompressed) flexVal = "0.6 1 0%";
        return (
          <div key={service.id} onClick={() => { if (!isActive) setActiveId(service.id); }}
            style={{
              flex: flexVal, minWidth: isCompressed ? 80 : 0, height: "100%",
              borderRadius: 18, position: "relative", overflow: "hidden",
              cursor: isActive ? "default" : "pointer",
              background: isActive ? "#111114" : "#15151A",
              border: isActive ? `1px solid ${service.accent}44` : "1px solid rgba(255,255,255,0.04)",
              opacity: isOtherRow ? 0.35 : 1, filter: isOtherRow ? "blur(1.5px)" : "none",
              transition: `flex 0.55s ${EASE}, min-width 0.55s ${EASE}, opacity 0.4s ease, filter 0.4s ease, border 0.3s ease, background 0.3s ease, transform 0.3s ease`,
              display: "flex", flexDirection: "column",
            }}
            onMouseEnter={(e) => { if (!isActive && !isOtherRow && !isCompressed) { e.currentTarget.style.border = `1px solid ${service.accent}28`; e.currentTarget.style.background = "#1a1a20"; e.currentTarget.style.transform = "scale(1.01)"; }}}
            onMouseLeave={(e) => { if (!isActive && !isOtherRow) { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.04)"; e.currentTarget.style.background = "#15151A"; e.currentTarget.style.transform = "scale(1)"; }}}
          >
            <CardContent service={service} isActive={isActive} isCompressed={isCompressed} onClose={() => setActiveId(null)} />
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   VARIANT B — Full grid takeover (squishes both axes)
   ════════════════════════════════════════════════════════════════ */
function BentoGridFull({ cards, activeId, setActiveId, totalHeight }) {
  const row1 = cards.filter(c => c.row === 0);
  const row2 = cards.filter(c => c.row === 1);
  const rows = [row1, row2];
  const hasActive = activeId != null;
  const activeRow = hasActive ? cards.find(c => c.id === activeId)?.row : null;

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 12,
      width: "100%", height: totalHeight, overflow: "hidden",
    }}>
      {rows.map((row, ri) => {
        const rowHasActive = row.some(c => c.id === activeId);
        const isOtherRow = hasActive && !rowHasActive;

        // Vertical: active row grows, other row squishes
        let rowFlex = "1 1 0%";
        if (rowHasActive) rowFlex = "8 1 0%";
        else if (isOtherRow) rowFlex = "0.35 1 0%";

        return (
          <div key={ri} style={{
            display: "flex", gap: 12,
            flex: rowFlex,
            minHeight: isOtherRow ? 56 : 0,
            width: "100%", overflow: "hidden",
            transition: `flex 0.55s ${EASE}, min-height 0.55s ${EASE}`,
          }}>
            {row.map((service) => {
              const isActive = activeId === service.id;
              const isCompressedH = rowHasActive && !isActive;  // same row, squished sideways
              const isCompressedV = isOtherRow;                  // other row, squished vertically

              const isCompressed = isCompressedH || isCompressedV;

              // Horizontal flex
              let flexVal = "1 1 0%";
              if (isActive) flexVal = "8 1 0%";
              else if (isCompressedH) flexVal = "0.4 1 0%";
              else if (isCompressedV) flexVal = "1 1 0%";

              return (
                <div key={service.id}
                  onClick={() => { if (!isActive) setActiveId(service.id); }}
                  style={{
                    flex: flexVal,
                    minWidth: isCompressedH ? 64 : 0,
                    height: "100%",
                    borderRadius: isCompressed ? 14 : 18,
                    position: "relative", overflow: "hidden",
                    cursor: isActive ? "default" : "pointer",
                    background: isActive ? "#111114" : "#15151A",
                    border: isActive ? `1px solid ${service.accent}44` : "1px solid rgba(255,255,255,0.04)",
                    opacity: isCompressedV ? 0.3 : isCompressedH ? 0.5 : 1,
                    transition: `flex 0.55s ${EASE}, min-width 0.55s ${EASE}, opacity 0.4s ease, border 0.3s ease, background 0.3s ease, transform 0.3s ease, border-radius 0.4s ease`,
                    display: "flex", flexDirection: "column",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && !isCompressed) {
                      e.currentTarget.style.border = `1px solid ${service.accent}28`;
                      e.currentTarget.style.background = "#1a1a20";
                      e.currentTarget.style.transform = "scale(1.01)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && !isCompressed) {
                      e.currentTarget.style.border = "1px solid rgba(255,255,255,0.04)";
                      e.currentTarget.style.background = "#15151A";
                      e.currentTarget.style.transform = "scale(1)";
                    }
                  }}
                >
                  <CardContent
                    service={service}
                    isActive={isActive}
                    isCompressed={isCompressed}
                    onClose={() => setActiveId(null)}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */
export default function ExpandableBentoGrid() {
  const [activeA, setActiveA] = useState(null);
  const [activeB, setActiveB] = useState(null);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") { setActiveA(null); setActiveB(null); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const row1 = SERVICES.filter((s) => s.row === 0);
  const row2 = SERVICES.filter((s) => s.row === 1);

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0A0D",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "50px 20px", fontFamily: "'DM Sans', sans-serif",
    }}>
      
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet" />

      {/* ── SECTION A: Horizontal-only ── */}
      <div style={{ textAlign: "center", marginBottom: 40, maxWidth: 540 }}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 600, letterSpacing: ".22em", textTransform: "uppercase", color: "#E8FF5A", opacity: 0.55, marginBottom: 14 }}>
          Variant A — Horizontal Expand
        </p>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 700, color: "#EDEDF0", margin: 0, lineHeight: 1.15, letterSpacing: "-0.03em" }}>
          Row-Locked <span style={{ color: "#555" }}>Expansion</span>
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#555", marginTop: 10 }}>Cards grow within their row — the other row dims.</p>
      </div>

      <div style={{ width: "100%", maxWidth: 1080, display: "flex", flexDirection: "column", gap: 12, marginBottom: 80 }}>
        <BentoRow cards={row1} activeId={activeA} setActiveId={setActiveA} rowHeight={260} />
        <BentoRow cards={row2} activeId={activeA} setActiveId={setActiveA} rowHeight={260} />
      </div>

      {/* ── Divider ── */}
      <div style={{ width: "100%", maxWidth: 1080, height: 1, background: "linear-gradient(90deg, transparent, #ffffff0a, transparent)", marginBottom: 80 }} />

      {/* ── SECTION B: Full grid takeover ── */}
      <div style={{ textAlign: "center", marginBottom: 40, maxWidth: 540 }}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 600, letterSpacing: ".22em", textTransform: "uppercase", color: "#FF5A8C", opacity: 0.55, marginBottom: 14 }}>
          Variant B — Full Grid Takeover
        </p>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 700, color: "#EDEDF0", margin: 0, lineHeight: 1.15, letterSpacing: "-0.03em" }}>
          Both Rows <span style={{ color: "#555" }}>Covered</span>
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#555", marginTop: 10 }}>Clicked card expands to fill the entire grid area.</p>
      </div>

      <div style={{ width: "100%", maxWidth: 1080, marginBottom: 40 }}>
        <BentoGridFull cards={SERVICES} activeId={activeB} setActiveId={setActiveB} totalHeight={532} />
      </div>

      <p style={{ marginTop: 36, fontSize: 11, color: "#2A2A2E", fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".06em" }}>
        Click a card to expand · Press Esc to close
      </p>
    </div>
  );
}
