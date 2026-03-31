/**
 * @card SpotifyPlaylist
 * @description Spotify playlist embed + kill-triggered track add.
 *   Collapsed: EQ bars + connection status + kill count.
 *   Expanded:  iframe player (left) + kill music log (right).
 *
 * Requires: VITE_SPOTIFY_API_ID (client ID), VITE_SPOTIFY_PLAYLIST_ID
 *
 * Auth: Spotify PKCE OAuth — no client secret exposed to browser.
 * Kill logic: each new Jotunn kill searches Spotify for a themed track
 * (cycling through war/combat/epic/dark queries) and adds it to your
 * playlist automatically. The full log is visible in the expanded view.
 *
 * Setup:
 *  1. Create a Spotify app at developer.spotify.com
 *  2. Set Redirect URI to your site's origin (e.g. https://jotunn.lol/)
 *  3. Set VITE_SPOTIFY_API_ID + VITE_SPOTIFY_PLAYLIST_ID in .env
 *  4. Click "Connect Spotify" in the expanded card
 */

import { useContext } from "react";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";
import { MARTIAN_H } from "../../lib/constants";
import { useSpotify } from "./hook";

const PLAYLIST_ID =
  (import.meta.env.VITE_SPOTIFY_PLAYLIST_ID as string | undefined) ??
  "4NcgYw0YYGWp2yxaY5nw7B";

const EMBED_URL = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`;

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return `${Math.floor(diff / 1_000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function SpotifyPlaylist() {
  const isExpanded = useContext(CardExpandedContext);
  const { isConnected, status, killLog, connect, disconnect, hasClientId, hasPlaylistId } = useSpotify();

  const sortedLog = [...killLog].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col gap-2">

        {/* Header */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
            style={{ background: `hsla(${MARTIAN_H},50%,28%,0.5)`, border: `1px solid hsla(${MARTIAN_H},50%,50%,0.3)` }}
          >
            🎵
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold tracking-widest uppercase"
                 style={{ color: `hsla(${MARTIAN_H},20%,65%,0.55)` }}>
              SOUNDTRACK
            </div>
            {isExpanded && (
              <div className="text-[10px] text-white/20">
                Kills → playlist · PKCE OAuth · no secret exposed
              </div>
            )}
          </div>
          {isConnected && (
            <span className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded border shrink-0"
                  style={{ color: "#4ade80", borderColor: "#4ade8033" }}>
              ● LINKED
            </span>
          )}
        </div>

        {/* Collapsed view */}
        {!isExpanded && (
          <div className="flex-1 flex flex-col justify-center gap-2 overflow-hidden">
            <div className="text-sm font-semibold" style={{ color: `hsla(${MARTIAN_H},70%,65%,0.9)` }}>
              War Admiral Jotunn
            </div>
            {/* Animated EQ bars */}
            <div className="flex items-end gap-[3px] h-5">
              {[12, 18, 10, 20, 15, 8, 16].map((h, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-[1px]"
                  style={{
                    height: h,
                    background: i % 2 === 0
                      ? `hsla(${MARTIAN_H},90%,55%,0.55)`
                      : `hsla(${MARTIAN_H},90%,55%,0.3)`,
                    animation: `eq-bar ${0.6 + i * 0.1}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
            {isConnected ? (
              <div className="text-[10px]" style={{ color: "rgba(250,250,229,0.35)" }}>
                {killLog.length > 0
                  ? `${killLog.length} kill${killLog.length === 1 ? "" : "s"} logged to playlist`
                  : "Watching for kills…"}
              </div>
            ) : (
              <div className="text-[10px]" style={{ color: "rgba(250,250,229,0.25)" }}>
                Expand to connect Spotify
              </div>
            )}
          </div>
        )}

        {/* Expanded view */}
        {isExpanded && (
          <div className="flex-1 flex flex-row gap-4 min-h-0">

            {/* Left: iframe player */}
            <div className="flex-1 min-w-0 rounded-lg overflow-hidden">
              <iframe
                src={EMBED_URL}
                width="100%" height="100%"
                className="border-none block"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify Playlist"
              />
            </div>

            {/* Right: auth + kill log */}
            <div className="flex flex-col gap-3 shrink-0 overflow-auto" style={{ flex: "0 0 200px" }}>

              {/* Auth section */}
              <div className="border border-white/[0.07] rounded-md p-3 bg-black/20">
                <div className="text-[9px] tracking-widest uppercase mb-2"
                     style={{ color: "rgba(250,250,229,0.25)" }}>
                  Spotify Link
                </div>
                {!hasClientId && (
                  <div className="text-[10px] text-amber-400/70">
                    Set VITE_SPOTIFY_API_ID in .env
                  </div>
                )}
                {!hasPlaylistId && hasClientId && (
                  <div className="text-[10px] text-amber-400/70 mb-2">
                    Set VITE_SPOTIFY_PLAYLIST_ID in .env
                  </div>
                )}
                {hasClientId && !isConnected && (
                  <>
                    <p className="text-[10px] text-white/40 leading-relaxed mb-2">
                      Connect once via OAuth. Each Jotunn kill will automatically
                      search Spotify for a themed combat track and add it to your playlist.
                    </p>
                    <button
                      onClick={connect}
                      className="w-full text-[10px] font-bold tracking-widest py-1.5 rounded"
                      style={{
                        background: `hsla(${MARTIAN_H},80%,35%,0.6)`,
                        border: `1px solid hsla(${MARTIAN_H},80%,50%,0.3)`,
                        color: `hsla(${MARTIAN_H},90%,75%,0.9)`,
                        cursor: "pointer",
                      }}
                    >
                      CONNECT SPOTIFY →
                    </button>
                    {status && (
                      <div className="text-[9px] text-red-400/70 mt-1.5">{status}</div>
                    )}
                  </>
                )}
                {isConnected && (
                  <div className="flex flex-col gap-1.5">
                    <div className="text-[10px]" style={{ color: "#4ade80" }}>
                      Connected — kills trigger track adds
                    </div>
                    <div className="text-[10px] text-white/30">
                      Queries cycle: war metal · epic orchestra ·
                      dark electronic · doom metal · triumph fanfare…
                    </div>
                    <button
                      onClick={disconnect}
                      className="text-[9px] text-white/20 hover:text-white/40 transition-colors text-left mt-1"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      disconnect
                    </button>
                  </div>
                )}
              </div>

              {/* Kill music log */}
              <div className="flex-1 flex flex-col gap-1.5 min-h-0">
                <div className="text-[9px] tracking-widest uppercase"
                     style={{ color: "rgba(250,250,229,0.2)" }}>
                  ⚔️ Kill Log
                </div>
                {sortedLog.length === 0 ? (
                  <div className="text-[10px] text-white/20 italic">
                    {isConnected
                      ? "No kills yet this session — get out there"
                      : "Connect Spotify to start logging"}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 overflow-auto">
                    {sortedLog.map((entry) => (
                      <div
                        key={entry.killId}
                        className="py-1 border-b border-white/[0.05]"
                      >
                        <div className="text-[10px] font-medium text-white/70 leading-snug">
                          {entry.trackName}
                        </div>
                        <div className="flex justify-between gap-1 mt-px">
                          <span className="text-[9px] text-white/30">{entry.trackArtist}</span>
                          <span className="text-[9px] text-white/20">{timeAgo(entry.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
