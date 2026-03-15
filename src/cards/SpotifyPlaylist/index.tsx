/**
 * @card SpotifyPlaylist
 * @description Spotify public playlist embed.
 *   Collapsed: 🎵 + animated bars + playlist label.
 *   Expanded:  full Spotify iframe player (no auth needed for public playlists).
 *
 * Configure via VITE_SPOTIFY_PLAYLIST_ID.
 * Default: "37i9dQZF1DWWvvyNmFQkx5" (Space — Spotify curated).
 */

import { useContext } from "react";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";
import { SvgIcon } from "../../components/SvgIcon";
import { MARTIAN_H } from "../../lib/constants";
const PLAYLIST_ID =
  (import.meta.env.VITE_SPOTIFY_PLAYLIST_ID as string | undefined) ??
  "4NcgYw0YYGWp2yxaY5nw7B";

const EMBED_URL = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`;

export function SpotifyPlaylist() {
  const isExpanded = useContext(CardExpandedContext);

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col">

        {/* Header */}
        <div className={`flex items-center gap-2 shrink-0 ${isExpanded ? "mb-3" : "mb-2"}`}>
          <SvgIcon src="/assets/music.svg" size={22} />
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase"
                 style={{ color: `hsla(${MARTIAN_H},20%,65%,0.55)` }}>
              SOUNDTRACK
            </div>
            {!isExpanded && (
              <div className="text-xs text-white/45">Expand to play</div>
            )}
            {isExpanded && (
              <div className="text-xs text-white/20 mt-px">
                Spotify public playlist embed · no auth required
              </div>
            )}
          </div>
        </div>

        {/* Collapsed view */}
        {!isExpanded && (
          <div className="flex-1 flex flex-col justify-center gap-2">
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
                    background: i % 2 === 0 ? `hsla(${MARTIAN_H},90%,55%,0.55)` : `hsla(${MARTIAN_H},90%,55%,0.3)`,
                    animation: `eq-bar ${0.6 + i * 0.1}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
            <div className="text-xs text-white/20 font-mono">
              {PLAYLIST_ID.slice(0, 14)}…
            </div>
          </div>
        )}

        {/* Expanded: full iframe */}
        {isExpanded && (
          <div className="flex-1 rounded-lg overflow-hidden">
            <iframe
              src={EMBED_URL}
              width="100%" height="100%"
              className="border-none block"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Spotify Playlist"
            />
          </div>
        )}
      </div>
    </GlassCard>
  );
}
