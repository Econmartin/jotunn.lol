/*
 * Hero section: 4-quadrant layout.
 * Top-left:    GSAP strikethrough headline.
 * Top-right:   tagline + orange CTA.
 * Bottom-left: CharacterHero card (GlassCard, wallet, IDs, tribe, etc).
 * Bottom-right: image.
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { JOTUNN, SUISCAN_BASE } from "../../lib/constants";
import { CardExpandedContext } from "../GlassCard";
import { CharacterHero } from "../cards/CharacterHero";

const BOTTOM_H = 280;

// ── Headline with GSAP strikethrough ─────────────────────────────────────────

function HeroHeadline() {
  const strikeLineRef  = useRef<HTMLSpanElement>(null);
  const replacementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const strikeLine  = strikeLineRef.current;
    const replacement = replacementRef.current;
    if (!strikeLine || !replacement) return;

    gsap.timeline({ defaults: { ease: "power2.out" } })
      .fromTo(strikeLine,  { scaleX: 0 },        { scaleX: 1, duration: 0.45 })
      .fromTo(replacement, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.15");
  }, []);

  return (
    <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight tracking-tight text-[#FAFAE5] m-0">
      {/* Name fades in above the struck-through line */}
      <span
        ref={replacementRef}
        className="block opacity-0 mb-0.5 font-heading text-[clamp(1.1rem,2.5vw,1.5rem)] font-semibold tracking-[0.12em] uppercase text-orange-500"
      >
        War Admiral Jötunn
      </span>

      {/* "Your character." with animated orange strike */}
      <span className="relative inline-block">
        <span className="text-[rgba(250,250,229,0.45)]">Your character.</span>
        <span
          ref={strikeLineRef}
          className="hero-headline-strike-line"
          aria-hidden
          style={{ color: "#f97316" }}  /* GSAP animates scaleX — colour via CSS var not possible here */
        />
      </span>{" "}
      <span className="text-orange-500">tracked.</span>
    </h2>
  );
}

// ── Hero section ──────────────────────────────────────────────────────────────

export function HeroSection({ heroImageSrc }: { heroImageSrc?: string }) {
  return (
    <section className="w-full max-w-[1080px] mb-6 relative z-[1]">
      <div
        className="grid gap-x-8 gap-y-6 max-[720px]:grid-cols-1"
        style={{ gridTemplateColumns: "3fr 2fr" }}
      >

        {/* 1 ── Top left: headline ─────────────────────────────────────────── */}
        <div className="min-w-0 flex items-end">
          <HeroHeadline />
        </div>

        {/* 2 ── Top right: tagline + CTA ──────────────────────────────────── */}
        <div className="min-w-0 flex flex-col gap-4 justify-end">
          <p className="text-sm leading-relaxed text-[rgba(250,250,229,0.55)] m-0 max-w-xs">
            A live personal dashboard for your EVE Frontier character. On-chain stats,
            tribe history, kills, and events — all in one place.
          </p>
          <a
            href={`${SUISCAN_BASE}/object/${JOTUNN.characterId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 w-fit px-5 py-3 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold no-underline transition-[background,transform] duration-200 hover:-translate-y-px"
          >
            View on Suiscan <span aria-hidden>→</span>
          </a>
        </div>

        {/* 3 ── Bottom left: CharacterHero card ───────────────────────────── */}
        <div className="min-w-0" style={{ height: BOTTOM_H }}>
          <CardExpandedContext.Provider value={true}>
            <CharacterHero />
          </CardExpandedContext.Provider>
        </div>

        {/* 4 ── Bottom right: image ────────────────────────────────────────── */}
        <div
          className="min-w-0 rounded-2xl overflow-hidden flex items-center justify-center border border-orange-500/15 bg-orange-500/5"
          style={{ height: BOTTOM_H }}
        >
          {heroImageSrc ? (
            <img
              src={heroImageSrc}
              alt="Jotunn"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-orange-500/40 text-base tracking-widest font-mono">JOTUNN</span>
          )}
        </div>

      </div>
    </section>
  );
}
