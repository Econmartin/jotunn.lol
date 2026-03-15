import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CardCompressedContext, CardExpandedContext } from "../GlassCard";

// ─────────────────────────────────────────────────────────────────────────────
// Types & shared constants
// ─────────────────────────────────────────────────────────────────────────────

export interface CardDef {
  id: string;
  baseFlex: number;   // 1 = 1×1, 2 = 2×1, 3 = full-width
  component: ReactNode;
}

export const EASE   = "cubic-bezier(0.4, 0, 0.12, 1)";
export const ROW_H  = 240;
export const GAP    = 12;
export const PAIR_H = ROW_H * 2 + GAP;

// ─────────────────────────────────────────────────────────────────────────────
// Close button
// ─────────────────────────────────────────────────────────────────────────────

export function CloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClose(); }}
      className="absolute top-[18px] right-[18px] z-20 w-7 h-7 rounded-lg border border-white/[0.09] bg-white/5 text-[#777] cursor-pointer flex items-center justify-center text-sm transition-all duration-200"
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.13)"; e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#777"; }}
    >✕</button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant A — BentoRow (horizontal expand, row-locked)
// ─────────────────────────────────────────────────────────────────────────────

export function BentoRow({
  cards, activeId, setActiveId, isOtherSection,
}: {
  cards: CardDef[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  isOtherSection: boolean;
}) {
  const hasActive = cards.some((c) => c.id === activeId);

  return (
    <div
      className="flex w-full"
      style={{
        gap: GAP,
        height: ROW_H,
        opacity: isOtherSection ? 0.25 : 1,
        filter: isOtherSection ? "blur(1.5px)" : "none",
        pointerEvents: isOtherSection ? "none" : "auto",
        transition: `opacity 0.4s ease, filter 0.4s ease`,
      }}
    >
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
            className={cn(
              "relative h-full overflow-hidden rounded-none",
              isActive ? "cursor-default" : "cursor-pointer",
            )}
            style={{
              flex: flexVal,
              minWidth: isCompressed ? 64 : 0,
              opacity: isCompressed ? 0.5 : 1,
              transition: `flex 0.55s ${EASE}, min-width 0.55s ${EASE}, opacity 0.35s ease, transform 0.2s ease, border-radius 0.45s ${EASE}`,
            }}
            onMouseEnter={(e) => { if (!isActive && !isCompressed) e.currentTarget.style.transform = "scale(1.012)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
          >
            {isActive && <CloseBtn onClose={() => setActiveId(null)} />}
            <CardExpandedContext.Provider value={isActive}>
              <CardCompressedContext.Provider value={isCompressed}>
                <div className={cn(
                  "w-full h-full items-center justify-center",
                  isCompressed ? "flex" : "block",
                )}>{card.component}</div>
              </CardCompressedContext.Provider>
            </CardExpandedContext.Provider>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant B — BentoPair (expands across both axes within a 2-row block)
// ─────────────────────────────────────────────────────────────────────────────

export function BentoPair({
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
    <div
      className="flex flex-col w-full"
      style={{
        gap: GAP,
        height: PAIR_H,
        opacity: isOtherSection ? 0.25 : 1,
        filter: isOtherSection ? "blur(1.5px)" : "none",
        pointerEvents: isOtherSection ? "none" : "auto",
        transition: `opacity 0.4s ease, filter 0.4s ease`,
      }}
    >
      {rows.map((row, ri) => {
        const rowHasActive = row.some((c) => c.id === activeId);
        const isOtherRow   = hasActive && !rowHasActive;
        const rowFlex = rowHasActive ? "8 1 0%" : isOtherRow ? "0.35 1 0%" : "1 1 0%";

        return (
          <div
            key={ri}
            className="flex w-full"
            style={{
              gap: GAP,
              flex: rowFlex,
              minHeight: isOtherRow ? 52 : 0,
              transition: `flex 0.55s ${EASE}, min-height 0.55s ${EASE}`,
            }}
          >
            {row.map((card) => {
              const isActive      = activeId === card.id;
              const isCompressedH = rowHasActive && !isActive;
              const isCompressedV = isOtherRow;
              const flexVal = isActive
                ? `${card.baseFlex * 5} 1 0%`
                : isCompressedH ? "0.4 1 0%"
                : `${card.baseFlex} 1 0%`;

              return (
                <div
                  key={card.id}
                  onClick={() => { if (!isActive) setActiveId(card.id); }}
                  className={cn(
                    "relative h-full overflow-hidden rounded-none",
                    isActive ? "cursor-default" : "cursor-pointer",
                  )}
                  style={{
                    flex: flexVal,
                    minWidth: isCompressedH ? 52 : 0,
                    opacity: isCompressedV ? 0.25 : isCompressedH ? 0.5 : 1,
                    transition: `flex 0.55s ${EASE}, min-width 0.55s ${EASE}, opacity 0.4s ease, transform 0.2s ease, border-radius 0.45s ${EASE}`,
                  }}
                  onMouseEnter={(e) => { if (!isActive && !isCompressedH && !isCompressedV) e.currentTarget.style.transform = "scale(1.012)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
                >
                  {isActive && <CloseBtn onClose={() => setActiveId(null)} />}
                  <CardExpandedContext.Provider value={isActive}>
                    <CardCompressedContext.Provider value={isCompressedH || isCompressedV}>
                      <div className={cn(
                        "w-full h-full items-center justify-center",
                        (isCompressedH || isCompressedV) ? "flex" : "block",
                      )}>{card.component}</div>
                    </CardCompressedContext.Provider>
                  </CardExpandedContext.Provider>
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

export function BentoPairWithTall({
  tallCard, rows, tallPosition, activeId, setActiveId, isOtherSection,
}: {
  tallCard: CardDef;
  rows: [CardDef[], CardDef[]];
  tallPosition?: "left" | "right";
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  isOtherSection: boolean;
}) {
  const tallIsActive  = activeId === tallCard.id;
  const pairHasActive = rows.flat().some((c) => c.id === activeId);
  const pos = tallPosition ?? "left";

  const tallFlex     = tallIsActive ? "5 1 0%" : pairHasActive ? "0.4 1 0%" : "1 1 0%";
  const tallMinWidth = tallIsActive ? 140 : pairHasActive ? 52 : 80;
  const pairFlex     = tallIsActive ? "0.6 1 0%" : "3 1 0%";

  const pairEl = (
    <div
      className="flex flex-col h-full min-w-0"
      style={{ gap: GAP, flex: pairFlex }}
    >
      {rows.map((row, ri) => {
        const rowHasActive = row.some((c) => c.id === activeId);
        const isOtherRow   = pairHasActive && !rowHasActive;
        const rowFlex      = rowHasActive ? "8 1 0%" : isOtherRow ? "0.35 1 0%" : "1 1 0%";

        return (
          <div
            key={ri}
            className="flex w-full"
            style={{
              gap: GAP,
              flex: rowFlex,
              minHeight: isOtherRow ? 52 : 0,
              transition: `flex 0.55s ${EASE}, min-height 0.55s ${EASE}`,
            }}
          >
            {row.map((card) => {
              const isActive      = activeId === card.id;
              const isCompressedH = rowHasActive && !isActive;
              const isCompressedV = isOtherRow;
              const flexVal       = isActive ? `${card.baseFlex * 5} 1 0%` : isCompressedH ? "0.4 1 0%" : `${card.baseFlex} 1 0%`;

              return (
                <div
                  key={card.id}
                  onClick={() => { if (!isActive) setActiveId(card.id); }}
                  className={cn(
                    "relative h-full overflow-hidden rounded-none",
                    isActive ? "cursor-default" : "cursor-pointer",
                  )}
                  style={{
                    flex: flexVal,
                    minWidth: isCompressedH ? 52 : 0,
                    opacity: isCompressedV ? 0.25 : isCompressedH ? 0.5 : 1,
                    transition: `flex 0.55s ${EASE}, min-width 0.55s ${EASE}, opacity 0.4s ease, transform 0.2s ease`,
                  }}
                  onMouseEnter={(e) => { if (!isActive && !isCompressedH && !isCompressedV) e.currentTarget.style.transform = "scale(1.012)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
                >
                  {isActive && <CloseBtn onClose={() => setActiveId(null)} />}
                  <CardExpandedContext.Provider value={isActive}>
                    <CardCompressedContext.Provider value={isCompressedH || isCompressedV}>
                      <div className={cn(
                        "w-full h-full items-center justify-center",
                        (isCompressedH || isCompressedV) ? "flex" : "block",
                      )}>{card.component}</div>
                    </CardCompressedContext.Provider>
                  </CardExpandedContext.Provider>
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
      className={cn(
        "relative h-full overflow-hidden rounded-none",
        tallIsActive ? "cursor-default" : "cursor-pointer",
      )}
      style={{
        flex: tallFlex,
        minWidth: tallMinWidth,
        opacity: pairHasActive ? 0.5 : 1,
        transition: `flex 0.55s ${EASE}, min-width 0.55s ${EASE}, opacity 0.35s ease, transform 0.2s ease`,
      }}
      onMouseEnter={(e) => { if (!tallIsActive && !pairHasActive) e.currentTarget.style.transform = "scale(1.012)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
    >
      {tallIsActive && <CloseBtn onClose={() => setActiveId(null)} />}
      <CardExpandedContext.Provider value={tallIsActive}>
        <CardCompressedContext.Provider value={pairHasActive}>
          <div className={cn(
            "w-full h-full items-center justify-center",
            pairHasActive ? "flex" : "block",
          )}>{tallCard.component}</div>
        </CardCompressedContext.Provider>
      </CardExpandedContext.Provider>
    </div>
  );

  return (
    <div
      className="flex flex-row w-full"
      style={{
        gap: GAP,
        height: PAIR_H,
        opacity: isOtherSection ? 0.25 : 1,
        filter: isOtherSection ? "blur(1.5px)" : "none",
        pointerEvents: isOtherSection ? "none" : "auto",
        transition: `opacity 0.4s ease, filter 0.4s ease`,
      }}
    >
      {pos === "left" ? <>{tallEl}{pairEl}</> : <>{pairEl}{tallEl}</>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SoloTall — full-width card at double row height
// ─────────────────────────────────────────────────────────────────────────────

export function SoloTall({
  card, isOtherSection,
}: {
  card: CardDef;
  isOtherSection: boolean;
}) {
  return (
    <div
      className="w-full"
      style={{
        height: PAIR_H,
        opacity: isOtherSection ? 0.25 : 1,
        filter: isOtherSection ? "blur(1.5px)" : "none",
        transition: `opacity 0.4s ease, filter 0.4s ease`,
      }}
    >
      {card.component}
    </div>
  );
}
