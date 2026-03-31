/**
 * @card MemeOps
 * @description Contextual GIF from GIPHY keyed on Jotunn's current game state.
 *   Game state → search query:
 *     recent kill   → "victory war epic celebration"
 *     recent death  → "defeat dramatic shocked"
 *     long streak   → "unstoppable invincible epic"
 *     version bump  → "level up glow up upgrade"
 *     idle default  → "space waiting bored"
 *
 * Requires: VITE_GIPHY_API_KEY
 * Collapsed: GIF fills card + state label overlay.
 * Expanded: larger GIF + state description + shuffle button.
 */

import { useState, useEffect, useCallback, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";
import { MARTIAN_H } from "../../lib/constants";
import { useKillmails } from "../../hooks/useKillmails";
import { useCharacter } from "../../hooks/useCharacter";

const GIPHY_KEY = (import.meta.env.VITE_GIPHY_API_KEY as string | undefined) ?? "";

// ── Game state → query ────────────────────────────────────────────────────────

interface GameState {
  query: string;
  label: string;
  description: string;
}

function deriveGameState(
  killData: { kills: { killTimestamp: number }[]; deaths: { killTimestamp: number }[] } | undefined,
  character: { version?: number } | undefined,
  prevVersion: number | null,
): GameState {
  const now = Date.now();
  const FIVE_MIN = 5 * 60 * 1000;
  const ONE_HOUR = 60 * 60 * 1000;

  if (killData?.kills.length) {
    const latestKill = [...killData.kills].sort((a, b) => b.killTimestamp - a.killTimestamp)[0];
    if (now - latestKill.killTimestamp * 1000 < FIVE_MIN) {
      return {
        query: "victory war epic celebration",
        label: "⚔️ KILL CONFIRMED",
        description: "War Admiral Jotunn just sent someone to the void. Appropriate celebrations are in order.",
      };
    }
  }

  if (killData?.deaths.length) {
    const latestDeath = [...killData.deaths].sort((a, b) => b.killTimestamp - a.killTimestamp)[0];
    if (now - latestDeath.killTimestamp * 1000 < FIVE_MIN) {
      return {
        query: "defeat dramatic shocked explosion",
        label: "💀 PILOT LOST",
        description: "The void claimed Jotunn's hull. A moment of silence, then immediately reship.",
      };
    }
  }

  if (character?.version && prevVersion !== null && character.version !== prevVersion) {
    if (now < ONE_HOUR) { // recent version bump (within session)
      return {
        query: "level up upgrade transformation glow",
        label: "⬆ VERSION BUMP",
        description: "On-chain state changed. Jotunn did something. The blockchain noticed.",
      };
    }
  }

  // Survival streak check
  if (killData && killData.deaths.length === 0 && killData.kills.length > 5) {
    return {
      query: "unstoppable invincible epic warrior",
      label: "🛡 ON A STREAK",
      description: "Jotunn is alive and has racked up kills. Fear is appropriate.",
    };
  }

  return {
    query: "space bored waiting patrol",
    label: "💤 ALL QUIET",
    description: "No significant events. The galaxy is patient. So is this bot.",
  };
}

// ── GIPHY fetch ───────────────────────────────────────────────────────────────

interface GiphyGif {
  id: string;
  url: string;
  title: string;
  images: { fixed_height: { url: string }; original: { url: string } };
}

async function fetchGifs(query: string, key: string): Promise<GiphyGif[]> {
  if (!key) return [];
  const res = await fetch(
    `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(key)}&q=${encodeURIComponent(query)}&limit=10&rating=pg-13`,
  );
  if (!res.ok) throw new Error(`GIPHY ${res.status}`);
  const data = await res.json() as { data: GiphyGif[] };
  return data.data ?? [];
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MemeOps() {
  const isExpanded = useContext(CardExpandedContext);
  const { data: killData } = useKillmails();
  const { data: character } = useCharacter();

  const [prevVersion, setPrevVersion] = useState<number | null>(null);
  const [gifIdx, setGifIdx] = useState(0);

  // Track version changes within session
  useEffect(() => {
    if (character?.version != null) setPrevVersion(character.version);
  }, [character?.version]);

  const gameState = deriveGameState(killData, character ?? undefined, prevVersion);

  const { data: gifs = [], isLoading, error } = useQuery({
    queryKey: ["giphy", gameState.query],
    queryFn: () => fetchGifs(gameState.query, GIPHY_KEY),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Reset gif index when state/gifs change
  useEffect(() => {
    setGifIdx(Math.floor(Math.random() * Math.max(1, gifs.length)));
  }, [gameState.query, gifs.length]);

  const shuffle = useCallback(() => {
    if (gifs.length > 1) {
      setGifIdx((i) => (i + 1) % gifs.length);
    }
  }, [gifs.length]);

  const currentGif = gifs[gifIdx];
  const gifUrl = currentGif?.images?.fixed_height?.url ?? currentGif?.images?.original?.url ?? null;

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col gap-2">

        {/* Header (only visible in expanded — collapsed is image-first) */}
        {isExpanded && (
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
              style={{ background: `hsla(${MARTIAN_H},50%,28%,0.5)`, border: `1px solid hsla(${MARTIAN_H},50%,50%,0.25)` }}
            >
              🎭
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: `hsla(${MARTIAN_H},20%,65%,0.55)` }}>
                MEME OPS
              </div>
              <div className="text-[10px] text-white/20">GIPHY · game-state reactive</div>
            </div>
            <span className="text-[10px] font-bold" style={{ color: `hsla(${MARTIAN_H},70%,65%,0.8)` }}>
              {gameState.label}
            </span>
          </div>
        )}

        {/* GIF display */}
        <div className={`flex-1 rounded-lg overflow-hidden relative min-h-0 ${!isExpanded ? "h-full" : ""}`}>
          {!GIPHY_KEY && (
            <div className="h-full flex items-center justify-center text-center p-4">
              <div>
                <div className="text-2xl mb-2">🎭</div>
                <div className="text-[10px] text-white/30">Set VITE_GIPHY_API_KEY</div>
              </div>
            </div>
          )}
          {GIPHY_KEY && isLoading && (
            <div className="h-full flex items-center justify-center">
              <div className="text-xs text-white/25 animate-pulse">Loading…</div>
            </div>
          )}
          {GIPHY_KEY && error && (
            <div className="h-full flex items-center justify-center">
              <div className="text-[10px] text-red-400/50">GIPHY unreachable</div>
            </div>
          )}
          {gifUrl && (
            <>
              <img
                src={gifUrl}
                alt={currentGif?.title ?? "meme"}
                className="w-full h-full object-cover"
                style={{ imageRendering: "auto" }}
              />
              {/* State label overlay (always visible) */}
              <div
                className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}
              >
                <span className="text-[10px] font-bold tracking-widest"
                      style={{ color: `hsla(${MARTIAN_H},80%,70%,0.9)` }}>
                  {gameState.label}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Expanded: description + shuffle */}
        {isExpanded && (
          <div className="flex items-start justify-between gap-2 shrink-0">
            <div className="text-[10px] text-white/40 leading-relaxed flex-1 min-w-0">
              {gameState.description}
            </div>
            <button
              onClick={shuffle}
              disabled={gifs.length <= 1}
              className="text-[9px] font-bold tracking-widest px-2 py-1 rounded shrink-0"
              style={{
                background: `hsla(${MARTIAN_H},50%,22%,0.5)`,
                border: `1px solid hsla(${MARTIAN_H},50%,40%,0.3)`,
                color: gifs.length > 1 ? `hsla(${MARTIAN_H},70%,65%,0.8)` : "rgba(250,250,229,0.2)",
                cursor: gifs.length > 1 ? "pointer" : "not-allowed",
              }}
            >
              SHUFFLE
            </button>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
