import { useState, useEffect, useRef } from "react";
import { useCharacter } from "./hooks/useCharacter";
import { ShadowSnake } from "./components/ShadowSnake";
import { HeroSection } from "./components/HeroSection";
import { BentoRow, BentoPairWithTall, BentoPair, SoloTall, ROW_H, GAP } from "./components/BentoGrid";
import { SECTIONS, sectionCardIds, getAllCards } from "./lib/layout";
import { POLL_INTERVAL_MS } from "./lib/constants";
const jotunnSnakeHead = "/assets/jotunn-snake.png";

/** Counts down to the next poll. Resets whenever dataUpdatedAt changes. */
function usePollCountdown(dataUpdatedAt: number): string {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!dataUpdatedAt) return "—:——";
  const remaining = Math.max(0, dataUpdatedAt + POLL_INTERVAL_MS - now);
  const m = Math.floor(remaining / 60_000);
  const s = Math.floor(remaining / 1_000) % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function App() {
  const character     = useCharacter();
  const pollCountdown = usePollCountdown(character.dataUpdatedAt ?? 0);
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

  // Click outside any glass card closes the active card
  useEffect(() => {
    if (!activeId) return;
    let armed = false;
    const arm = setTimeout(() => { armed = true; }, 50);
    const handler = (e: MouseEvent) => {
      if (!armed) return;
      if (!(e.target as Element).closest(".glass-outer")) setActiveId(null);
    };
    document.addEventListener("click", handler);
    return () => { clearTimeout(arm); document.removeEventListener("click", handler); };
  }, [activeId]);

  // Torch: update directly on the DOM to avoid React re-renders every mousemove
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!torchRef.current) return;
      torchRef.current.style.background = `radial-gradient(
        circle 560px at ${e.clientX}px ${e.clientY}px,
        hsla(25,100%,55%,0.11),
        hsla(22,90%,40%,0.07) 40%,
        hsla(20,80%,25%,0.03) 65%,
        transparent 75%
      )`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const activeSectionIdx = activeId
    ? SECTIONS.findIndex((s) => sectionCardIds(s).includes(activeId))
    : -1;

  return (
    /* Background gradient is multi-stop HSL — keep as inline */
    <div
      className="min-h-screen flex flex-col items-center px-5 py-10 pb-20 relative font-mono"
      style={{ background: "linear-gradient(180deg, hsl(22,55%,7%) 0%, hsl(20,40%,5%) 18%, hsl(15,25%,4%) 40%, #060608 65%, #020204 100%)" }}
    >
      {/* Torch — mouse-position gradient, DOM-updated to skip React render cycle */}
      <div ref={torchRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Shadow snake */}
      <ShadowSnake headImageSrc={jotunnSnakeHead} />

      {/* Header */}
      <header className="w-full max-w-[1080px] mb-6 flex justify-between items-start relative z-[1]">
        <div className="font-heading text-[10px] font-semibold tracking-[.22em] uppercase text-orange-500">
          EVE Frontier · Stillness Testnet
        </div>

        <div className="flex items-center gap-2 text-[11px] text-orange-500 font-heading tracking-[.06em]">
          {/* Dot: green + pulsing while fetching, amber at rest — dynamic so inline */}
          <span
            className="inline-block shrink-0 w-1.5 h-1.5 rounded-full transition-[background,box-shadow] duration-400"
            style={{
              background:  character.isFetching ? "hsla(150,80%,55%,0.9)" : "hsla(30,100%,55%,0.45)",
              boxShadow:   character.isFetching ? "0 0 6px hsla(150,80%,55%,0.6)" : "none",
              animation:   character.isFetching ? "pulse 1s ease-in-out infinite" : "none",
            }}
          />
          NEXT POLL · {character.isFetching ? "fetching…" : pollCountdown}
        </div>
      </header>

      {/* Hero */}
      <HeroSection heroImageSrc={jotunnSnakeHead} />

      {/* Bento grid */}
      <main
        className="w-full max-w-[1080px] flex flex-col relative z-[1]"
        style={{ gap: GAP }}
      >
        {isMobile
          ? getAllCards(SECTIONS).map((card) => (
              <div key={card.id} className="w-full" style={{ height: ROW_H }}>
                {card.component}
              </div>
            ))
          : SECTIONS.map((section, si) => {
              const isOtherSection = activeSectionIdx !== -1 && activeSectionIdx !== si;
              if (section.type === "pair")
                return <BentoPair key={si} rows={section.rows} activeId={activeId} setActiveId={setActiveId} isOtherSection={isOtherSection} />;
              if (section.type === "pairWithTall")
                return <BentoPairWithTall key={si} tallCard={section.tallCard} rows={section.rows} tallPosition={section.tallPosition} activeId={activeId} setActiveId={setActiveId} isOtherSection={isOtherSection} />;
              if (section.type === "row")
                return <BentoRow key={si} cards={section.cards} activeId={activeId} setActiveId={setActiveId} isOtherSection={isOtherSection} />;
              return <SoloTall key={si} card={section.card} isOtherSection={isOtherSection} />;
            })
        }
      </main>

      <footer className="mt-12 text-[11px] tracking-[.06em] font-heading text-[hsla(210,20%,50%,0.2)]">
        click to expand · esc to close · {SECTIONS.flatMap(sectionCardIds).length} cards
      </footer>
    </div>
  );
}
