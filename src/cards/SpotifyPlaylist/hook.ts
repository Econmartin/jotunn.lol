/**
 * @hook useSpotify
 * @description PKCE OAuth flow + kill-triggered track add.
 *
 * Env vars required:
 *   VITE_SPOTIFY_API_ID      — Spotify app Client ID
 *   VITE_SPOTIFY_PLAYLIST_ID — Target playlist ID
 *
 * Auth flow (no client secret needed — PKCE):
 *   1. connect() → generates verifier + challenge → redirects to Spotify
 *   2. Spotify redirects back with ?code= → exchangeCode() swaps for tokens
 *   3. Tokens stored in localStorage; auto-refreshed before expiry
 *
 * Kill detection:
 *   Watches useKillmails().kills.length. On increase, searches Spotify
 *   for a themed track and adds it to PLAYLIST_ID.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useKillmails } from "../../hooks/useKillmails";

const CLIENT_ID   = (import.meta.env.VITE_SPOTIFY_API_ID      as string | undefined) ?? "";
const PLAYLIST_ID = (import.meta.env.VITE_SPOTIFY_PLAYLIST_ID as string | undefined) ?? "";
const SCOPES      = "playlist-modify-public playlist-modify-private";

// localStorage keys
const LS_TOKEN    = "spt-access-token";
const LS_REFRESH  = "spt-refresh-token";
const LS_EXPIRY   = "spt-token-expiry";
const LS_VERIFIER = "spt-pkce-verifier";
const LS_KILL_LOG = "spt-kill-log";

// ── PKCE helpers ─────────────────────────────────────────────────────────────

async function sha256(plain: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(plain));
}

function b64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function randomVerifier(): string {
  const arr = new Uint8Array(64);
  crypto.getRandomValues(arr);
  return b64url(arr.buffer);
}

// ── Kill log persistence ──────────────────────────────────────────────────────

export interface KillTrack {
  trackId: string;
  trackName: string;
  trackArtist: string;
  killId: string;
  timestamp: number;
}

function loadKillLog(): KillTrack[] {
  try { return JSON.parse(localStorage.getItem(LS_KILL_LOG) ?? "[]"); }
  catch { return []; }
}
function saveKillLog(log: KillTrack[]) {
  localStorage.setItem(LS_KILL_LOG, JSON.stringify(log.slice(-50)));
}

// ── Spotify API calls ─────────────────────────────────────────────────────────

/**
 * Cycling list of search queries. Each kill uses the next query in sequence
 * so the playlist builds a varied soundtrack rather than the same track type.
 */
const KILL_QUERIES = [
  "space combat metal aggressive",
  "epic cinematic war orchestra",
  "dark electronic battle industrial",
  "doom metal intense combat",
  "triumph victory epic fanfare",
  "interstellar dark ambient tension",
  "warhammer epic choral battle",
];
let queryIdx = 0;

async function searchTrack(
  token: string,
  query: string,
): Promise<{ id: string; name: string; artist: string } | null> {
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) return null;
    const data = await res.json() as { tracks?: { items?: { id: string; name: string; artists?: { name: string }[] }[] } };
    const items = data.tracks?.items;
    if (!items?.length) return null;
    // Pick randomly from top 10 so the playlist is varied
    const t = items[Math.floor(Math.random() * items.length)];
    return { id: t.id, name: t.name, artist: t.artists?.[0]?.name ?? "Unknown" };
  } catch {
    return null;
  }
}

async function addToPlaylist(token: string, trackId: string): Promise<boolean> {
  if (!PLAYLIST_ID) return false;
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}

async function refreshToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
      }),
    });
    if (!res.ok) return null;
    return res.json() as Promise<{ access_token: string; expires_in: number }>;
  } catch {
    return null;
  }
}

// ── Public hook ───────────────────────────────────────────────────────────────

export function useSpotify() {
  const [isConnected, setIsConnected] = useState(() => !!localStorage.getItem(LS_REFRESH));
  const [status, setStatus] = useState<string>("");
  const [killLog, setKillLog] = useState<KillTrack[]>(() => loadKillLog());

  const { data: killData } = useKillmails();
  const prevKillCount = useRef<number | null>(null);

  // ── OAuth callback: exchange ?code= for tokens ──────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code  = params.get("code");
    const error = params.get("error");

    if (error) {
      setStatus(`Spotify auth error: ${error}`);
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }
    if (!code) return;
    const verifier = localStorage.getItem(LS_VERIFIER);
    if (!verifier || !CLIENT_ID) {
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    (async () => {
      const redirectUri = window.location.origin + window.location.pathname;
      const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: CLIENT_ID,
          code_verifier: verifier,
        }),
      });
      localStorage.removeItem(LS_VERIFIER);
      window.history.replaceState({}, "", window.location.pathname);
      if (!res.ok) {
        setStatus("Token exchange failed — check redirect URI is registered in Spotify dev dashboard");
        return;
      }
      const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number };
      localStorage.setItem(LS_TOKEN, data.access_token);
      localStorage.setItem(LS_REFRESH, data.refresh_token);
      localStorage.setItem(LS_EXPIRY, String(Date.now() + data.expires_in * 1000));
      setIsConnected(true);
      setStatus("Connected");
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Get a valid token (auto-refreshes if needed) ────────────────────────────
  const getValidToken = useCallback(async (): Promise<string | null> => {
    const stored  = localStorage.getItem(LS_TOKEN);
    const expiry  = parseInt(localStorage.getItem(LS_EXPIRY) ?? "0", 10);
    if (stored && Date.now() < expiry - 60_000) return stored;

    const rtoken = localStorage.getItem(LS_REFRESH);
    if (!rtoken) return null;
    const data = await refreshToken(rtoken);
    if (!data) { setIsConnected(false); return null; }
    localStorage.setItem(LS_TOKEN, data.access_token);
    localStorage.setItem(LS_EXPIRY, String(Date.now() + data.expires_in * 1000));
    return data.access_token;
  }, []);

  // ── Kill detection → add track ──────────────────────────────────────────────
  useEffect(() => {
    const count = killData?.kills.length ?? 0;

    // First load: record baseline count, do not add tracks for existing kills
    if (prevKillCount.current === null) {
      prevKillCount.current = count;
      return;
    }
    if (count <= prevKillCount.current) {
      prevKillCount.current = count;
      return;
    }
    const newKills = count - prevKillCount.current;
    prevKillCount.current = count;

    if (!isConnected || !PLAYLIST_ID) return;

    (async () => {
      const token = await getValidToken();
      if (!token) return;

      for (let i = 0; i < newKills; i++) {
        const query = KILL_QUERIES[queryIdx % KILL_QUERIES.length];
        queryIdx++;
        const track = await searchTrack(token, query);
        if (!track) continue;
        const ok = await addToPlaylist(token, track.id);
        if (ok) {
          const entry: KillTrack = {
            trackId:     track.id,
            trackName:   track.name,
            trackArtist: track.artist,
            killId:      `kill-${Date.now()}-${i}`,
            timestamp:   Date.now(),
          };
          setKillLog((prev) => {
            const next = [...prev, entry];
            saveKillLog(next);
            return next;
          });
        }
      }
    })();
  }, [killData?.kills.length, isConnected, getValidToken]);

  // ── Connect (start PKCE flow) ───────────────────────────────────────────────
  const connect = useCallback(async () => {
    if (!CLIENT_ID) return;
    const verifier   = randomVerifier();
    const challenge  = b64url(await sha256(verifier));
    localStorage.setItem(LS_VERIFIER, verifier);
    const redirectUri = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      client_id:             CLIENT_ID,
      response_type:         "code",
      redirect_uri:          redirectUri,
      scope:                 SCOPES,
      code_challenge_method: "S256",
      code_challenge:        challenge,
    });
    window.location.href = `https://accounts.spotify.com/authorize?${params}`;
  }, []);

  // ── Disconnect ──────────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_REFRESH);
    localStorage.removeItem(LS_EXPIRY);
    setIsConnected(false);
    setStatus("");
  }, []);

  return {
    isConnected,
    status,
    killLog,
    connect,
    disconnect,
    hasClientId:   !!CLIENT_ID,
    hasPlaylistId: !!PLAYLIST_ID,
  };
}
