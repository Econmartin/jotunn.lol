/**
 * JotunnHub — PornHub parody, orange/black.
 * Unlock 4 Twitch videos for 100 EVE each via on-chain tx.
 * Unlock state persisted in HubState shared object (cross-device).
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { useConnection, dAppKit as eveAppKit } from "@evefrontier/dapp-kit";
import { buildHubUnlockTx } from "../../lib/eve-transactions";
import { getLargestEveCoin } from "../../lib/eve-client";
import { suiClient } from "../../lib/eve-client";
import { HUB_STATE_ID } from "../../lib/constants";

// ── Video catalogue ───────────────────────────────────────────────────────────

interface HubVideo {
  id: number;
  title: string;
  views: string;
  duration: string;
  twitchId: string;   // VOD id (numeric) or clip slug
  type: "vod" | "clip";
}

const VIDEOS: HubVideo[] = [
  {
    id: 0,
    title: "RIFTHUNTING & CHILL W/ CCP JÖTUNN — HE CAME OVER AND ONE THING LED TO ANOTHER",
    views: "420.6K views",
    duration: "24:17",
    twitchId: "2729256576",
    type: "vod",
  },
  {
    id: 1,
    title: "LATE NIGHT BASEBUILDING & CHILL — NOBODY EXPECTED IT TO GO THIS LONG",
    views: "69.4K views",
    duration: "08:42",
    twitchId: "2723291987",
    type: "vod",
  },
  {
    id: 2,
    title: "WHAT THE DUCK — NOBODY SAW THIS COMING IN FRONTIER",
    views: "133.7K views",
    duration: "1:02:44",
    twitchId: "2702807514",
    type: "vod",
  },
  {
    id: 3,
    title: "ONLYFANS — EXCLUSIVE CONTENT YOU CAN'T FIND ANYWHERE ELSE IN FRONTIER",
    views: "88.8K views",
    duration: "15:33",
    twitchId: "AmazingFunnyLapwingOMGScoots-GU5zPtiwyVbntSGt",
    type: "clip",
  },
];

// ── On-chain unlock check ────────────────────────────────────────────────────

async function fetchOnChainUnlocks(viewer: string): Promise<number[]> {
  if (!HUB_STATE_ID) return [];
  try {
    const obj = await suiClient.getObject({ id: HUB_STATE_ID, options: { showContent: true } });
    const content = obj.data?.content as { fields?: { unlocks?: { fields?: { contents?: Array<{ fields?: { key: string; value: { fields?: { contents: number[] } } } }> } } } } | undefined;
    const contents = content?.fields?.unlocks?.fields?.contents ?? [];
    const entry = contents.find((e) => e.fields?.key === viewer);
    return entry?.fields?.value?.fields?.contents ?? [];
  } catch {
    return [];
  }
}

// ── Component ────────────────────────────────────────────────────────────────

function VideoCard({
  video,
  unlocked,
  onUnlock,
  pending,
}: {
  video: HubVideo;
  unlocked: boolean;
  onUnlock: (id: number) => void;
  pending: boolean;
}) {
  const host = window.location.hostname;
  const embedSrc =
    video.type === "vod"
      ? `https://player.twitch.tv/?video=${video.twitchId}&parent=${host}&autoplay=false`
      : `https://clips.twitch.tv/embed?clip=${video.twitchId}&parent=${host}`;

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #FF660033", background: "#0f0800" }}>
      {/* Thumbnail / embed */}
      <div className="relative" style={{ paddingTop: "56.25%" /* 16:9 */ }}>
        {/* Always render the iframe so the Twitch thumbnail loads */}
        <iframe
          src={embedSrc}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          frameBorder="0"
          allow="autoplay; fullscreen"
          style={{ pointerEvents: unlocked ? "auto" : "none" }}
        />

        {/* Lock overlay — backdrop-filter blurs the iframe behind it */}
        {!unlocked && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-4"
            style={{ backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.45)" }}
          >
            <div className="text-4xl" style={{ filter: "drop-shadow(0 0 12px #FF6600)" }}>🔒</div>
            <button
              onClick={() => onUnlock(video.id)}
              disabled={pending}
              className="font-bold tracking-[.12em] px-6 py-2.5 rounded-lg text-sm transition-all"
              style={{
                background: pending ? "#552200" : "#FF6600",
                color: "#fff",
                border: "none",
                cursor: pending ? "wait" : "pointer",
                opacity: pending ? 0.7 : 1,
              }}
            >
              {pending ? "PROCESSING…" : "▶ UNLOCK FOR 100 EVE"}
            </button>
            <div className="text-[10px]" style={{ color: "rgba(255,102,0,0.5)" }}>
              One-time payment · Unlocks permanently
            </div>
            {/* Duration badge */}
            <div
              className="absolute bottom-2 right-2 text-[11px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: "rgba(0,0,0,0.8)", color: "#fff" }}
            >
              {video.duration}
            </div>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="px-3 py-2.5">
        <div className="text-sm font-bold leading-tight mb-1" style={{ color: "#e0e0d0" }}>
          {video.title}
        </div>
        <div className="text-[11px]" style={{ color: "rgba(255,102,0,0.5)" }}>
          {video.views} · {video.duration}
          {unlocked && <span className="ml-2" style={{ color: "#4ade80" }}>● UNLOCKED</span>}
        </div>
      </div>
    </div>
  );
}

export function Hub() {
  const account = useCurrentAccount({ dAppKit: eveAppKit });
  const { isConnected, handleConnect, handleDisconnect } = useConnection();
  const dAppKit = useDAppKit(eveAppKit);

  const [unlockedIds, setUnlockedIds] = useState<Set<number>>(new Set());
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load on-chain unlocks when wallet connects
  useEffect(() => {
    if (!account?.address) return;
    fetchOnChainUnlocks(account.address).then((ids) =>
      setUnlockedIds(new Set(ids)),
    );
  }, [account?.address]);

  async function handleUnlock(videoId: number) {
    if (!account?.address) { handleConnect(); return; }
    setError(null);
    setPendingId(videoId);
    try {
      const coin = await getLargestEveCoin(account.address);
      if (!coin || coin.balance < 100n * 1_000_000_000n) {
        throw new Error("Insufficient EVE balance (need 100 EVE)");
      }
      const tx = buildHubUnlockTx(coin.id, videoId);
      await dAppKit.signAndExecuteTransaction({ transaction: tx });
      setUnlockedIds((prev) => new Set([...prev, videoId]));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div
      className="min-h-screen font-mono"
      style={{ background: "#0a0a0a", color: "#e0e0d0" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
        style={{ background: "#0f0800", borderBottom: "2px solid #FF6600" }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-decoration-none">
          <span className="text-2xl font-black tracking-tight" style={{ color: "#fff" }}>
            JOTUNN
          </span>
          <span
            className="text-2xl font-black tracking-tight px-1.5 rounded"
            style={{ background: "#FF6600", color: "#fff" }}
          >
            HUB
          </span>
        </Link>

        {/* Wallet */}
        <button
          onClick={isConnected ? handleDisconnect : handleConnect}
          className="text-sm font-bold tracking-wider px-4 py-2 rounded border transition-colors"
          style={{
            borderColor: "#FF6600",
            color: isConnected ? "#fff" : "#FF6600",
            background: isConnected ? "#FF6600" : "transparent",
          }}
        >
          {isConnected && account
            ? `${account.address.slice(0, 6)}…${account.address.slice(-4)}`
            : "CONNECT WALLET"}
        </button>
      </header>

      {/* Hero tagline */}
      <div className="text-center py-6 px-4" style={{ borderBottom: "1px solid #FF660022" }}>
        <div className="text-[11px] tracking-[.3em] uppercase mb-1" style={{ color: "#FF6600" }}>
          The Universe&apos;s #1 EVE Frontier Content Platform
        </div>
        <div className="text-[10px]" style={{ color: "rgba(255,102,0,0.35)" }}>
          Unlock exclusive combat footage for 100 EVE · Payments go on-chain
        </div>
      </div>

      {/* Video grid */}
      <main className="max-w-[1080px] mx-auto px-5 py-8">
        {!isConnected && (
          <div
            className="text-center py-8 mb-6 rounded-lg"
            style={{ background: "#1a0a00", border: "1px solid #FF660033" }}
          >
            <div className="text-sm mb-3" style={{ color: "rgba(255,102,0,0.6)" }}>
              Connect your wallet to unlock content
            </div>
            <button
              onClick={handleConnect}
              className="font-bold tracking-wider px-6 py-2.5 rounded-lg text-sm"
              style={{ background: "#FF6600", color: "#fff", border: "none", cursor: "pointer" }}
            >
              CONNECT WALLET
            </button>
          </div>
        )}

        {error && (
          <div
            className="text-sm mb-4 px-4 py-3 rounded"
            style={{ background: "#1a0505", border: "1px solid #f8717133", color: "#f87171" }}
          >
            {error}
          </div>
        )}

        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(460px, 1fr))" }}>
          {VIDEOS.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              unlocked={unlockedIds.has(video.id)}
              onUnlock={handleUnlock}
              pending={pendingId === video.id}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-[10px]" style={{ color: "rgba(255,102,0,0.2)", borderTop: "1px solid #FF660011" }}>
        JOTUNNHUB · EVE Frontier · Stillness · All transactions on-chain
      </footer>
    </div>
  );
}
