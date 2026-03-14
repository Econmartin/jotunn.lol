import { useState, useEffect, useRef, type ReactNode } from "react";
import { CardCompressedContext } from "./components/GlassCard";
import { POLL_INTERVAL_MS } from "./lib/constants";
import { useCharacter } from "./hooks/useCharacter";
import { ShadowSnake } from "./components/ShadowSnake";
import { HeroSection } from "./components/HeroSection";
import jotunnSnakeHead from "./jotunn-snake.png";
import {
  KillCounter,
  FuelGauge, ItemLedger, EventFeed,
  FuelTrend, Achievements,
  AssemblyStatus, NetworkNodeStatus, ChangeLog,
  InventorySnapshot, SpotifyPlaylist, InsuranceCompany,
  NameGraveyard, WebhookBus, SocialPosts,
  DynamicFields, AmbientSoundscape, OwnedObjects,
  TxHistory, TribeDetail,
  SolarSystemMap,
  Newspaper,
  RivalComparison, GateNetwork,
  DeathCertificates, PredictionPool, DominoTracker,
  MemeGenerator, CommentaryBot, ExtensionRegistry,
  PhysicalReactions, HardwareStatus, TimeLapseReplay,
} from "./components/cards";

// ─────────────────────────────────────────────────────────────────────────────
// Types & constants
// ─────────────────────────────────────────────────────────────────────────────

interface CardDef {
  id: string;
  baseFlex: number;   // 1 = 1×1, 2 = 2×1, 3 = full-width
  component: ReactNode;
}

const EASE   = "cubic-bezier(0.4, 0, 0.12, 1)";
const ROW_H  = 240;
const GAP    = 12;
const PAIR_H = ROW_H * 2 + GAP;  // two-row section height

// ─────────────────────────────────────────────────────────────────────────────
// Layout — all 34 cards
// Following the full layout in CARDS.md
//
//  BentoPair  → Variant B: click expands card across BOTH axes
//  BentoRow   → Variant A: click expands card horizontally within its row
//  SoloTall   → Full-width card at double height (SolarSystemMap, Newspaper)
// ─────────────────────────────────────────────────────────────────────────────

const SECTIONS: Array<
  | { type: "pair"; rows: [CardDef[], CardDef[]] }
  | { type: "pairWithTall"; tallCard: CardDef; rows: [CardDef[], CardDef[]]; tallPosition?: "left" | "right" }
  | { type: "row";  cards: CardDef[] }
  | { type: "solo"; card: CardDef }
> = [
  // ── BentoRow: kill counter, fuel, item ledger, event feed ──────────────────
  {
    type: "row",
    cards: [
      { id: "kill-counter",  baseFlex: 1, component: <KillCounter /> },
      { id: "fuel-gauge",    baseFlex: 1, component: <FuelGauge /> },
      { id: "item-ledger",   baseFlex: 1, component: <ItemLedger /> },
      { id: "event-feed",    baseFlex: 1, component: <EventFeed /> },
    ],
  },

  // ── BentoRow: fuel trend + achievements ───────────────────────────────────
  {
    type: "row",
    cards: [
      { id: "fuel-trend",   baseFlex: 2, component: <FuelTrend /> },
      { id: "achievements", baseFlex: 1, component: <Achievements /> },
    ],
  },

  // ── BentoRow: infrastructure ──────────────────────────────────────────────
  {
    type: "row",
    cards: [
      { id: "assembly-status",    baseFlex: 1, component: <AssemblyStatus /> },
      { id: "network-node-status",baseFlex: 1, component: <NetworkNodeStatus /> },
      { id: "change-log",         baseFlex: 1, component: <ChangeLog /> },
    ],
  },

  // ── BentoPairWithTall: vertical inventory + 2 rows ──────────────────────────
  {
    type: "pairWithTall",
    tallCard: { id: "inventory-snapshot", baseFlex: 1, component: <InventorySnapshot /> },
    tallPosition: "left",
    rows: [
      [
        { id: "spotify-playlist",   baseFlex: 1, component: <SpotifyPlaylist /> },
        { id: "insurance-company",  baseFlex: 1, component: <InsuranceCompany /> },
      ],
      [
        { id: "name-graveyard", baseFlex: 1, component: <NameGraveyard /> },
        { id: "webhook-bus",    baseFlex: 1, component: <WebhookBus /> },
        { id: "social-posts",   baseFlex: 1, component: <SocialPosts /> },
      ],
    ],
  },

  // ── BentoRow: developer tools ─────────────────────────────────────────────
  {
    type: "row",
    cards: [
      { id: "dynamic-fields",    baseFlex: 1, component: <DynamicFields /> },
      { id: "ambient-soundscape",baseFlex: 1, component: <AmbientSoundscape /> },
      { id: "owned-objects",     baseFlex: 1, component: <OwnedObjects /> },
    ],
  },

  // ── BentoRow: transactions ────────────────────────────────────────────────
  {
    type: "row",
    cards: [
      { id: "tx-history",   baseFlex: 2, component: <TxHistory /> },
      { id: "tribe-detail", baseFlex: 1, component: <TribeDetail /> },
    ],
  },

  // ── Solo tall: solar system map ───────────────────────────────────────────
  {
    type: "solo",
    card: { id: "solar-system-map", baseFlex: 3, component: <SolarSystemMap /> },
  },

  // ── Solo tall: newspaper ──────────────────────────────────────────────────
  {
    type: "solo",
    card: { id: "newspaper", baseFlex: 3, component: <Newspaper /> },
  },

  // ── BentoRow: rivals ──────────────────────────────────────────────────────
  {
    type: "row",
    cards: [
      { id: "rival-comparison", baseFlex: 2, component: <RivalComparison /> },
      { id: "gate-network",     baseFlex: 1, component: <GateNetwork /> },
    ],
  },

  // ── BentoPairWithTall: vertical death certs + 2 rows ───────────────────────
  {
    type: "pairWithTall",
    tallCard: { id: "death-certificates", baseFlex: 1, component: <DeathCertificates /> },
    tallPosition: "right",
    rows: [
      [
        { id: "prediction-pool", baseFlex: 1, component: <PredictionPool /> },
        { id: "domino-tracker",  baseFlex: 1, component: <DominoTracker /> },
      ],
      [
        { id: "meme-generator",     baseFlex: 1, component: <MemeGenerator /> },
        { id: "commentary-bot",     baseFlex: 1, component: <CommentaryBot /> },
        { id: "extension-registry", baseFlex: 1, component: <ExtensionRegistry /> },
      ],
    ],
  },

  // ── BentoRow: physical / hardware / time-lapse ───────────────────────────
  {
    type: "row",
    cards: [
      { id: "physical-reactions", baseFlex: 1, component: <PhysicalReactions /> },
      { id: "hardware-status",    baseFlex: 1, component: <HardwareStatus /> },
      { id: "time-lapse-replay",  baseFlex: 1, component: <TimeLapseReplay /> },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function sectionCardIds(section: typeof SECTIONS[number]): string[] {
  if (section.type === "pair")
    return section.rows.flat().map((c) => c.id);
  if (section.type === "pairWithTall")
    return [section.tallCard.id, ...section.rows.flat().map((c) => c.id)];
  if (section.type === "row")
    return section.cards.map((c) => c.id);
  return [section.card.id];
}

// ─────────────────────────────────────────────────────────────────────────────
// Close button
// ─────────────────────────────────────────────────────────────────────────────

function CloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClose(); }}
      style={{
        position: "absolute", top: 18, right: 18, zIndex: 20,
        width: 28, height: 28, borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.09)",
        background: "rgba(255,255,255,0.05)",
        color: "#777", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, transition: "all 0.2s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.13)"; e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#777"; }}
    >✕</button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant A — BentoRow (horizontal expand, row-locked)
// ─────────────────────────────────────────────────────────────────────────────

function BentoRow({
  cards, activeId, setActiveId, isOtherSection,
}: {
  cards: CardDef[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  isOtherSection: boolean;
}) {
  const hasActive = cards.some((c) => c.id === activeId);

  return (
    <div style={{
      display: "flex", gap: GAP, height: ROW_H, width: "100%",
      opacity: isOtherSection ? 0.25 : 1,
      filter: isOtherSection ? "blur(1.5px)" : "none",
      pointerEvents: isOtherSection ? "none" : "auto",
      transition: `opacity 0.4s ease, filter 0.4s ease`,
    }}>
      {cards.map((card) => {
        const isActive     = activeId === card.id;
        const isCompressed = hasActive && !isActive;

        const flexVal = isActive
          ? `${card.baseFlex * 4} 1 0%`
          : isCompressed
          ? "0.55 1 0%"
          : `${card.baseFlex} 1 0%`;

        return (
          <div
            key={card.id}
            onClick={() => { if (!isActive) setActiveId(card.id); }}
            style={{
              flex: flexVal,
              minWidth: isCompressed ? 64 : 0,
              height: "100%",
              position: "relative",
              cursor: isActive ? "default" : "pointer",
              opacity: isCompressed ? 0.5 : 1,
              overflow: "hidden",
              borderRadius: 0,
              transition: `flex 0.55s ${EASE}, min-width 0.55s ${EASE}, opacity 0.35s ease, transform 0.2s ease, border-radius 0.45s ${EASE}`,
            }}
            onMouseEnter={(e) => { if (!isActive && !isCompressed) e.currentTarget.style.transform = "scale(1.012)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
          >
            {isActive && <CloseBtn onClose={() => setActiveId(null)} />}
            <CardCompressedContext.Provider value={isCompressed}>
              <div style={{
                width: "100%", height: "100%",
                display: isCompressed ? "flex" : "block",
                alignItems: "center",
                justifyContent: "center",
              }}>{card.component}</div>
            </CardCompressedContext.Provider>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant B — BentoPair (expands across both axes within a 2-row block)
// ─────────────────────────────────────────────────────────────────────────────

function BentoPair({
  rows, activeId, setActiveId, isOtherSection,
}: {
  rows: [CardDef[], CardDef[]];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  isOtherSection: boolean;
}) {
  const allCards  = rows.flat();
  const hasActive = allCards.some((c) => c.id === activeId);

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: GAP,
      height: PAIR_H, width: "100%",
      opacity: isOtherSection ? 0.25 : 1,
      filter: isOtherSection ? "blur(1.5px)" : "none",
      pointerEvents: isOtherSection ? "none" : "auto",
      transition: `opacity 0.4s ease, filter 0.4s ease`,
    }}>
      {rows.map((row, ri) => {
        const rowHasActive = row.some((c) => c.id === activeId);
        const isOtherRow   = hasActive && !rowHasActive;

        const rowFlex = rowHasActive ? "8 1 0%" : isOtherRow ? "0.35 1 0%" : "1 1 0%";

        return (
          <div key={ri} style={{
            display: "flex", gap: GAP,
            flex: rowFlex,
            minHeight: isOtherRow ? 52 : 0,
            width: "100%",
            transition: `flex 0.55s ${EASE}, min-height 0.55s ${EASE}`,
          }}>
            {row.map((card) => {
              const isActive      = activeId === card.id;
              const isCompressedH = rowHasActive && !isActive;
              const isCompressedV = isOtherRow;

              const flexVal = isActive
                ? `${card.baseFlex * 5} 1 0%`
                : isCompressedH
                ? "0.4 1 0%"
                : `${card.baseFlex} 1 0%`;

              return (
                <div
                  key={card.id}
                  onClick={() => { if (!isActive) setActiveId(card.id); }}
                  style={{
                    flex: flexVal,
                    minWidth: isCompressedH ? 52 : 0,
                    height: "100%",
                    position: "relative",
                    cursor: isActive ? "default" : "pointer",
                    opacity: isCompressedV ? 0.25 : isCompressedH ? 0.5 : 1,
                    overflow: "hidden",
                    borderRadius: 0,
                    transition: `flex 0.55s ${EASE}, min-width 0.55s ${EASE}, opacity 0.4s ease, transform 0.2s ease, border-radius 0.45s ${EASE}`,
                  }}
                  onMouseEnter={(e) => { if (!isActive && !isCompressedH && !isCompressedV) e.currentTarget.style.transform = "scale(1.012)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
                >
                  {isActive && <CloseBtn onClose={() => setActiveId(null)} />}
                  <CardCompressedContext.Provider value={isCompressedH || isCompressedV}>
                    <div style={{
                      width: "100%", height: "100%",
                      display: (isCompressedH || isCompressedV) ? "flex" : "block",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>{card.component}</div>
                  </CardCompressedContext.Provider>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant C — BentoPairWithTall (vertical card spanning 2 rows + pair)
// ─────────────────────────────────────────────────────────────────────────────

function BentoPairWithTall({
  tallCard, rows, tallPosition, activeId, setActiveId, isOtherSection,
}: {
  tallCard: CardDef;
  rows: [CardDef[], CardDef[]];
  tallPosition?: "left" | "right";
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  isOtherSection: boolean;
}) {
  const tallIsActive = activeId === tallCard.id;
  const pairHasActive = rows.flat().some((c) => c.id === activeId);
  const pos = tallPosition ?? "left";

  // Tall: grows when active, shrinks when pair has active
  const tallFlex = tallIsActive ? "5 1 0%" : pairHasActive ? "0.4 1 0%" : "1 1 0%";
  const tallMinWidth = tallIsActive ? 140 : pairHasActive ? 52 : 80;

  // Pair: shrinks when tall active, uses BentoPair logic when pair has active
  const pairFlex = tallIsActive ? "0.6 1 0%" : "3 1 0%";

  const pairEl = (
    <div style={{
      display: "flex", flexDirection: "column", gap: GAP,
      flex: pairFlex, minWidth: 0, height: "100%",
    }}>
      {rows.map((row, ri) => {
        const rowHasActive = row.some((c) => c.id === activeId);
        const isOtherRow = pairHasActive && !rowHasActive;
        const rowFlex = rowHasActive ? "8 1 0%" : isOtherRow ? "0.35 1 0%" : "1 1 0%";

        return (
          <div key={ri} style={{
            display: "flex", gap: GAP,
            flex: rowFlex,
            minHeight: isOtherRow ? 52 : 0,
            width: "100%",
            transition: `flex 0.55s ${EASE}, min-height 0.55s ${EASE}`,
          }}>
            {row.map((card) => {
              const isActive = activeId === card.id;
              const isCompressedH = rowHasActive && !isActive;
              const isCompressedV = isOtherRow;
              const flexVal = isActive
                ? `${card.baseFlex * 5} 1 0%`
                : isCompressedH ? "0.4 1 0%" : `${card.baseFlex} 1 0%`;

              return (
                <div
                  key={card.id}
                  onClick={() => { if (!isActive) setActiveId(card.id); }}
                  style={{
                    flex: flexVal,
                    minWidth: isCompressedH ? 52 : 0,
                    height: "100%",
                    position: "relative",
                    cursor: isActive ? "default" : "pointer",
                    opacity: isCompressedV ? 0.25 : isCompressedH ? 0.5 : 1,
                    overflow: "hidden",
                    borderRadius: 0,
                    transition: `flex 0.55s ${EASE}, min-width 0.55s ${EASE}, opacity 0.4s ease, transform 0.2s ease`,
                  }}
                  onMouseEnter={(e) => { if (!isActive && !isCompressedH && !isCompressedV) e.currentTarget.style.transform = "scale(1.012)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
                >
                  {isActive && <CloseBtn onClose={() => setActiveId(null)} />}
                  <CardCompressedContext.Provider value={isCompressedH || isCompressedV}>
                    <div style={{
                      width: "100%", height: "100%",
                      display: (isCompressedH || isCompressedV) ? "flex" : "block",
                      alignItems: "center", justifyContent: "center",
                    }}>{card.component}</div>
                  </CardCompressedContext.Provider>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  const tallEl = (
    <div
      onClick={() => { if (!tallIsActive) setActiveId(tallCard.id); }}
      style={{
        flex: tallFlex,
        minWidth: tallMinWidth,
        height: "100%",
        position: "relative",
        cursor: tallIsActive ? "default" : "pointer",
        opacity: pairHasActive ? 0.5 : 1,
        overflow: "hidden",
        borderRadius: 0,
        transition: `flex 0.55s ${EASE}, min-width 0.55s ${EASE}, opacity 0.35s ease, transform 0.2s ease`,
      }}
      onMouseEnter={(e) => { if (!tallIsActive && !pairHasActive) e.currentTarget.style.transform = "scale(1.012)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
    >
      {tallIsActive && <CloseBtn onClose={() => setActiveId(null)} />}
      <CardCompressedContext.Provider value={pairHasActive}>
        <div style={{
          width: "100%", height: "100%",
          display: pairHasActive ? "flex" : "block",
          alignItems: "center", justifyContent: "center",
        }}>{tallCard.component}</div>
      </CardCompressedContext.Provider>
    </div>
  );

  return (
    <div style={{
      display: "flex", flexDirection: "row", gap: GAP,
      height: PAIR_H, width: "100%",
      opacity: isOtherSection ? 0.25 : 1,
      filter: isOtherSection ? "blur(1.5px)" : "none",
      pointerEvents: isOtherSection ? "none" : "auto",
      transition: `opacity 0.4s ease, filter 0.4s ease`,
    }}>
      {pos === "left" ? <>{tallEl}{pairEl}</> : <>{pairEl}{tallEl}</>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SoloTall — full-width card at double row height
// ─────────────────────────────────────────────────────────────────────────────

function SoloTall({
  card, isOtherSection,
}: {
  card: CardDef;
  isOtherSection: boolean;
}) {
  return (
    <div style={{
      height: PAIR_H, width: "100%",
      opacity: isOtherSection ? 0.25 : 1,
      filter: isOtherSection ? "blur(1.5px)" : "none",
      transition: `opacity 0.4s ease, filter 0.4s ease`,
    }}>
      {card.component}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────

function getAllCards(sections: typeof SECTIONS): CardDef[] {
  return sections.flatMap((s) =>
    s.type === "pair"         ? s.rows.flat() :
    s.type === "pairWithTall" ? [s.tallCard, ...s.rows.flat()] :
    s.type === "row"          ? s.cards :
    [s.card]
  );
}

export default function App() {
  const character = useCharacter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const torchRef  = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setActiveId(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Torch: update directly on the DOM to avoid React re-renders every mousemove
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!torchRef.current) return;
      torchRef.current.style.background = `
        radial-gradient(
          circle 560px at ${e.clientX}px ${e.clientY}px,
          hsla(25, 100%, 55%, 0.11),
          hsla(22, 90%, 40%, 0.07) 40%,
          hsla(20, 80%, 25%, 0.03) 65%,
          transparent 75%
        )
      `;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Which section index contains the active card?
  const activeSectionIdx = activeId
    ? SECTIONS.findIndex((s) => sectionCardIds(s).includes(activeId))
    : -1;

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(
        180deg,
        hsl(22, 55%, 7%)   0%,
        hsl(20, 40%, 5%)  18%,
        hsl(15, 25%, 4%)  40%,
        #060608           65%,
        #020204          100%
      )`,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "40px 20px 80px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
      position: "relative",
    }}>

      {/* ── Torch: behind cards, glass backdrop-filter pulls it through ── */}
      <div
        ref={torchRef}
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Shadow snake: wanders in the background ── */}
      <ShadowSnake headImageSrc={jotunnSnakeHead} />

      {/* ── Header ── */}
      <header style={{
        width: "100%", maxWidth: 1080, marginBottom: 24,
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        position: "relative", zIndex: 1,
      }}>
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, fontWeight: 600, letterSpacing: ".22em",
            textTransform: "uppercase", color: "hsla(210,80%,65%,0.45)", marginBottom: 6,
          }}>EVE Frontier · Stillness Testnet</div>
          <h1 style={{
            fontSize: 26, fontWeight: 700, color: "#EDEDF0",
            margin: 0, letterSpacing: "-0.03em",
          }}>JOTUNN TRACKER</h1>
          <p style={{
            margin: "8px 0 0",
            fontSize: 13,
            lineHeight: 1.45,
            color: "hsla(210, 20%, 70%, 0.75)",
            maxWidth: 520,
          }}>
            Live dashboard for your EVE Frontier character on the Stillness testnet. On-chain stats, assemblies, transactions, and events—all in one place. Data polls every 5 minutes from Sui.
          </p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 11, color: "hsla(210,20%,65%,0.4)",
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".06em",
        }}>
          {character.isFetching && (
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "hsla(150,80%,55%,0.8)", display: "inline-block",
              animation: "pulse 1s ease-in-out infinite",
            }} />
          )}
          POLL · {POLL_INTERVAL_MS / 1000}s
        </div>
      </header>

      {/* ── Hero section: character + tribe (always visible) ── */}
      <HeroSection />

      {/* ── Bento grid ── */}
      <main style={{
        width: "100%", maxWidth: 1080,
        display: "flex", flexDirection: "column", gap: GAP,
        position: "relative", zIndex: 1,
      }}>
        {isMobile
          ? /* ── Single-column mobile layout ── */
            getAllCards(SECTIONS).map((card) => (
              <div key={card.id} style={{ height: ROW_H, width: "100%" }}>
                {card.component}
              </div>
            ))
          : /* ── Bento desktop layout ── */
            SECTIONS.map((section, si) => {
              const isOtherSection = activeSectionIdx !== -1 && activeSectionIdx !== si;

              if (section.type === "pair") {
                return (
                  <BentoPair
                    key={si}
                    rows={section.rows}
                    activeId={activeId}
                    setActiveId={setActiveId}
                    isOtherSection={isOtherSection}
                  />
                );
              }
              if (section.type === "pairWithTall") {
                return (
                  <BentoPairWithTall
                    key={si}
                    tallCard={section.tallCard}
                    rows={section.rows}
                    tallPosition={section.tallPosition}
                    activeId={activeId}
                    setActiveId={setActiveId}
                    isOtherSection={isOtherSection}
                  />
                );
              }
              if (section.type === "row") {
                return (
                  <BentoRow
                    key={si}
                    cards={section.cards}
                    activeId={activeId}
                    setActiveId={setActiveId}
                    isOtherSection={isOtherSection}
                  />
                );
              }
              return (
                <SoloTall
                  key={si}
                  card={section.card}
                  isOtherSection={isOtherSection}
                />
              );
            })
        }
      </main>

      <footer style={{
        marginTop: 48, fontSize: 11, letterSpacing: ".06em",
        color: "hsla(210,20%,50%,0.2)",
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        click to expand · esc to close · {SECTIONS.flatMap(sectionCardIds).length} cards
      </footer>


      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      `}</style>
    </div>
  );
}
