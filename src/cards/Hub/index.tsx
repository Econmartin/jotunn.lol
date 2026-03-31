/**
 * @card Hub
 * @description EVE Frontier content hub — CCP Games Twitch embed + curated videos.
 *   Collapsed: icon + live indicator + video count.
 *   Expanded: Twitch live stream (top) + curated video/link grid (bottom).
 *
 * To add YouTube videos: fill in CURATED_VIDEOS with { title, videoId, description }.
 * Find videos at: https://www.youtube.com/@CCPGames
 */

import { useState, useContext } from "react";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";
import { MARTIAN_H } from "../../lib/constants";

// ── Curated EVE Frontier content ──────────────────────────────────────────────
// Add YouTube video IDs here. Find them at https://www.youtube.com/@CCPGames
// Format: https://www.youtube.com/watch?v={videoId}
const CURATED_VIDEOS: { title: string; videoId: string; description: string }[] = [
  // Add EVE Frontier video IDs here — get them from https://www.youtube.com/@CCPGames
  // Example: { title: "EVE Frontier Trailer", videoId: "ABC123", description: "Official reveal" },
];

// Curated links shown when no videos are configured (or alongside videos)
const CURATED_LINKS = [
  { label: "EVE Frontier Official", url: "https://evefrontier.com", icon: "🌐" },
  { label: "CCP Twitch",            url: "https://www.twitch.tv/ccpgames", icon: "📺" },
  { label: "CCP YouTube",           url: "https://www.youtube.com/@CCPGames", icon: "▶️" },
  { label: "EVE Frontier Docs",     url: "https://docs.evefrontier.com", icon: "📖" },
  { label: "Stillness Suiexplorer", url: "https://suiscan.xyz/testnet", icon: "🔍" },
  { label: "EVE Reddit",            url: "https://www.reddit.com/r/Eve", icon: "💬" },
];

export function Hub() {
  const isExpanded = useContext(CardExpandedContext);
  const [activeTab, setActiveTab] = useState<"live" | "videos">("live");

  // Twitch embed requires parent to match current hostname
  const hostname = typeof window !== "undefined" ? window.location.hostname : "jotunn.lol";
  const twitchSrc = `https://player.twitch.tv/?channel=ccpgames&parent=${hostname}&autoplay=false`;

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col gap-2">

        {/* Header */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
            style={{ background: `hsla(${MARTIAN_H},50%,28%,0.5)`, border: `1px solid hsla(${MARTIAN_H},50%,50%,0.25)` }}
          >
            📡
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: `hsla(${MARTIAN_H},20%,65%,0.55)` }}>
              EVE FRONTIER HUB
            </div>
            {isExpanded && (
              <div className="text-[10px] text-white/20">CCP Games live · curated content</div>
            )}
          </div>
          <span className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded border shrink-0"
                style={{ color: "hsla(150,70%,55%,0.8)", borderColor: "hsla(150,70%,55%,0.2)" }}>
            ● LIVE
          </span>
        </div>

        {/* Collapsed view */}
        {!isExpanded && (
          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="text-sm font-medium" style={{ color: `hsla(${MARTIAN_H},60%,65%,0.8)` }}>
              CCP Games
            </div>
            <div className="text-[10px]" style={{ color: "rgba(250,250,229,0.35)" }}>
              Twitch live stream · {CURATED_LINKS.length} links
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {CURATED_LINKS.slice(0, 3).map((l) => (
                <span key={l.label} className="text-[9px] px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(250,250,229,0.3)" }}>
                  {l.icon} {l.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expanded view */}
        {isExpanded && (
          <div className="flex-1 flex flex-col gap-2 min-h-0">

            {/* Tabs */}
            <div className="flex gap-2 shrink-0">
              {(["live", "videos"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded transition-colors"
                  style={{
                    background: activeTab === tab ? `hsla(${MARTIAN_H},60%,25%,0.5)` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${activeTab === tab ? `hsla(${MARTIAN_H},60%,45%,0.3)` : "rgba(255,255,255,0.08)"}`,
                    color: activeTab === tab ? `hsla(${MARTIAN_H},70%,70%,0.9)` : "rgba(250,250,229,0.3)",
                    cursor: "pointer",
                  }}
                >
                  {tab === "live" ? "📺 LIVE" : "🎬 VIDEOS"}
                </button>
              ))}
            </div>

            {/* Live tab: Twitch embed */}
            {activeTab === "live" && (
              <div className="flex-1 rounded-lg overflow-hidden min-h-0">
                <iframe
                  src={twitchSrc}
                  width="100%" height="100%"
                  className="border-none block"
                  allowFullScreen
                  title="CCP Games Twitch"
                />
              </div>
            )}

            {/* Videos tab: curated grid */}
            {activeTab === "videos" && (
              <div className="flex-1 overflow-auto">
                {CURATED_VIDEOS.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {CURATED_VIDEOS.map((v) => (
                      <a
                        key={v.videoId}
                        href={`https://www.youtube.com/watch?v=${v.videoId}`}
                        target="_blank" rel="noopener noreferrer"
                        className="block rounded-md overflow-hidden border border-white/[0.08] hover:border-white/20 transition-colors"
                      >
                        <div
                          className="w-full aspect-video bg-black/40 flex items-center justify-center text-2xl"
                          style={{ backgroundImage: `url(https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg)`, backgroundSize: "cover" }}
                        />
                        <div className="p-2">
                          <div className="text-[10px] font-medium text-white/70 leading-snug">{v.title}</div>
                          <div className="text-[9px] text-white/30 mt-0.5">{v.description}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-white/30 mb-3 italic">
                    No videos configured yet — add YouTube video IDs to CURATED_VIDEOS in src/cards/Hub/index.tsx
                  </div>
                )}

                {/* Links grid */}
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {CURATED_LINKS.map((l) => (
                    <a
                      key={l.label}
                      href={l.url}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded border border-white/[0.08] hover:border-white/20 transition-colors"
                      style={{ background: "rgba(255,255,255,0.02)" }}
                    >
                      <span className="text-base">{l.icon}</span>
                      <span className="text-[10px] text-white/55">{l.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
