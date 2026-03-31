/**
 * @card CommentaryBot
 * @description Template-based commentary engine watching live game events.
 *   Reacts to: deaths, kills, tribe changes, version bumps, failed txs.
 *   Collapsed: 2 most recent entries, full text.
 *   Expanded: full log of up to 20, newest first.
 */

import { useState, useEffect, useContext } from "react";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";
import { useKillmails } from "../../hooks/useKillmails";
import { useCharacter } from "../../hooks/useCharacter";
import { useTransactions } from "../../hooks/useTransactions";
import { MARTIAN_H } from "../../lib/constants";

type EventKind = "death" | "kill" | "version" | "idle" | "fail";

interface Commentary {
  id: string;
  kind: EventKind;
  text: string;
  timestamp: number;
}

// Multi-sentence, flavourful templates
const DEATH_LINES = [
  (sys: string, killerId: string) =>
    `PILOT LOST — War Admiral Jotunn's vessel has been reduced to wreckage in system ${sys}. The attacker (${killerId.slice(0, 8)}…) will be toasting this one for a while. Another entry in the killboard of regret. The streak is broken. Rebuild. Rearm. Return.`,
  (sys: string, _k: string) =>
    `System ${sys} has claimed our hero in the most definitive way possible. The wreck is already cooling. Insurance is non-existent in this universe. Whatever was fitted on that hull is now someone else's loot. This is fine. This is EVE.`,
  (sys: string, killerId: string) =>
    `BREAKING DISPATCH: Jotunn down in ${sys}. Attacker ${killerId.slice(0, 8)}… outplayed, outgunned, or simply had the numbers. A moment of silence for the fitting choices that led to this outcome. Then: get back out there.`,
  (_sys: string, killerId: string) =>
    `Hostile ${killerId.slice(0, 8)}… has added Jotunn to their killboard. The void doesn't care about your feelings. It cares about your hull points, and yours just hit zero. The survival streak has ended. Time to start a new one.`,
];

const KILL_LINES = [
  (sys: string, victimId: string) =>
    `CONFIRMED KILL — War Admiral Jotunn has destroyed ${victimId.slice(0, 8)}… in system ${sys}. The victim's ship is expanding outward in a debris field of regret and thermal signatures. That's what happens when you undock near Jotunn.`,
  (sys: string, _v: string) =>
    `Another soul fed to the void in ${sys}. Jotunn's weapons spoke and the galaxy listened. The kill has been recorded on-chain — permanent, immutable proof of dominance. The killboard grows.`,
  (_sys: string, victimId: string) =>
    `${victimId.slice(0, 8)}… made the grave error of being in Jotunn's combat range. That error has been corrected violently and immortalised on the Sui blockchain. Structure or ship, the outcome is the same: wreckage and disappointment.`,
  (sys: string, _v: string) =>
    `KILL CONFIRMED IN ${sys}. The targeting computers did not miss. The weapons did not fail. The enemy did not survive. Jotunn's combat record is now officially one entry longer. Fly safe — unless you're the enemy.`,
];

const VERSION_LINES = [
  (v: number) =>
    `On-chain state change detected. Jotunn's character object has advanced to version ${v}. Every version represents a transaction — a moment of agency written into the immutable ledger. Something was done. Something changed. The blockchain witnessed it.`,
  (v: number) =>
    `Character object updated. Version ${v} is now the canonical state of War Admiral Jotunn on the Sui network. Whether this was a fit change, a jump, a fuel refill, or something the game gods ordained — it happened, and it's permanent.`,
  (v: number) =>
    `Version bump: ${v}. The universe took note. Jotunn interacted with the chain and the chain responded. Check the transaction history for what precipitated this. Or don't — the blockchain remembers even when pilots forget.`,
];

const IDLE_LINES = [
  "Monitoring the EVE Frontier. No significant combat events detected. War Admiral Jotunn appears to be alive and docked — or at least in one piece. The galaxy is peaceful, which is either a good sign or the calm before something catastrophic. This bot is watching. Waiting. Always watching.",
  "All quiet on the galactic front. The killboard is stable. The survival streak continues its upward march. Either Jotunn is plotting something significant or the servers are having a moment. Either way: no news is good news in New Eden's successor.",
  "Zero kills. Zero deaths. Zero failed transactions of note. The void is silent, which in this universe is a luxury. Enjoy the downtime. Top up the fuel. Check your fitting. The next engagement is always closer than you think.",
  "The Stillness testnet lives up to its name today. Jotunn is alive, the Network Node is presumably humming, and the killboard hasn't moved. Commentary Bot is officially bored. Wake it up by killing something — or getting killed, this bot doesn't judge.",
];

const FAIL_LINES = [
  (digest: string) =>
    `A transaction has returned FAILURE status. Digest: ${digest.slice(0, 12)}… The blockchain is honest even when it hurts. Something went wrong on-chain. Could be gas, could be a contract condition, could be EVE being EVE. Check Suiscan for the full autopsy.`,
  (_d: string) =>
    `FAILED TRANSACTION detected in the wallet history. The Sui network processed it, judged it, and found it wanting. This is logged and will haunt the history tab. Whatever was attempted did not succeed. Try again, or don't — the choice is yours, pilot.`,
];

function pickLine<T extends (...args: never[]) => string>(lines: T[], ...args: Parameters<T>): string {
  const fn = lines[Math.floor(Math.random() * lines.length)] as unknown as (...a: unknown[]) => string;
  return fn(...args);
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

const kindMeta: Record<EventKind, { label: string; color: string }> = {
  death:   { label: "💀 DEATH",   color: "#f87171" },
  kill:    { label: "⚔️ KILL",    color: "#fbbf24" },
  version: { label: "⬆ UPDATE",  color: "#c084fc" },
  idle:    { label: "💤 IDLE",    color: "rgba(250,250,229,0.25)" },
  fail:    { label: "❌ FAIL",    color: "#fb923c" },
};

const STORAGE_KEY = "jotunn-commentary-log";

function loadLog(): Commentary[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); }
  catch { return []; }
}
function saveLog(log: Commentary[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(-50)));
}

function addEntry(log: Commentary[], entry: Omit<Commentary, "id">): Commentary[] {
  const withId = { ...entry, id: `${entry.kind}-${entry.timestamp}` };
  if (log.find((l) => l.id === withId.id)) return log;
  return [...log, withId];
}

export function CommentaryBot() {
  const isExpanded = useContext(CardExpandedContext);
  const { data: killData } = useKillmails();
  const { data: character } = useCharacter();
  const { data: txData } = useTransactions();

  const [log, setLog] = useState<Commentary[]>(() => loadLog());

  useEffect(() => {
    if (!killData?.deaths.length) return;
    const latest = [...killData.deaths].sort((a, b) => b.killTimestamp - a.killTimestamp)[0];
    setLog((prev) => {
      const next = addEntry(prev, {
        kind: "death",
        text: pickLine(DEATH_LINES, latest.solarSystemId, latest.killerId),
        timestamp: latest.killTimestamp * 1000,
      });
      saveLog(next);
      return next;
    });
  }, [killData?.deaths.length]);

  useEffect(() => {
    if (!killData?.kills.length) return;
    const latest = [...killData.kills].sort((a, b) => b.killTimestamp - a.killTimestamp)[0];
    setLog((prev) => {
      const next = addEntry(prev, {
        kind: "kill",
        text: pickLine(KILL_LINES, latest.solarSystemId, latest.victimId),
        timestamp: latest.killTimestamp * 1000,
      });
      saveLog(next);
      return next;
    });
  }, [killData?.kills.length]);

  useEffect(() => {
    if (!character?.version) return;
    const v = character.version;
    setLog((prev) => {
      const alreadyLogged = prev.some((e) => e.kind === "version" && e.text.includes(`version ${v}`));
      if (alreadyLogged) return prev;
      const next = addEntry(prev, {
        kind: "version",
        text: pickLine(VERSION_LINES, v),
        timestamp: Date.now(),
      });
      saveLog(next);
      return next;
    });
  }, [character?.version]);

  useEffect(() => {
    if (!txData) return;
    const failures = txData.filter((tx) => tx.status !== "SUCCESS" && tx.status !== "UNKNOWN");
    if (!failures.length) return;
    const latest = failures[0];
    setLog((prev) => {
      const ts = new Date(latest.timestamp).getTime();
      const alreadyLogged = prev.some((e) => e.kind === "fail" && e.timestamp === ts);
      if (alreadyLogged) return prev;
      const next = addEntry(prev, {
        kind: "fail",
        text: pickLine(FAIL_LINES, latest.digest),
        timestamp: ts,
      });
      saveLog(next);
      return next;
    });
  }, [txData]);

  useEffect(() => {
    setLog((prev) => {
      if (prev.length > 0) return prev;
      const next = [{ id: "idle-0", kind: "idle" as EventKind, text: IDLE_LINES[0], timestamp: Date.now() }];
      saveLog(next);
      return next;
    });
  }, []);

  const sorted = [...log].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col gap-2">

        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
              style={{ background: `hsla(${MARTIAN_H},50%,28%,0.6)`, border: `1px solid hsla(${MARTIAN_H},50%,50%,0.25)` }}
            >🎙️</div>
            <div>
              <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: `hsla(${MARTIAN_H},20%,65%,0.55)` }}>COMMENTARY</div>
              {isExpanded && <div className="text-[10px] text-white/20">Reacts to kills, deaths, version bumps, failed txs</div>}
            </div>
          </div>
          {sorted[0] && (
            <span className="text-[10px] font-semibold" style={{ color: kindMeta[sorted[0].kind].color }}>
              {kindMeta[sorted[0].kind].label}
            </span>
          )}
        </div>

        {/* Collapsed: show 2 most recent */}
        {!isExpanded && (
          <div className="flex-1 flex flex-col gap-1.5 overflow-hidden min-h-0">
            {sorted.slice(0, 2).map((entry) => (
              <div
                key={entry.id}
                className="px-2.5 py-1.5 rounded-[4px] bg-black/20 border border-white/[0.06]"
              >
                <div className="flex justify-between mb-0.5">
                  <span className="text-[9px] font-bold" style={{ color: kindMeta[entry.kind].color }}>
                    {kindMeta[entry.kind].label}
                  </span>
                  <span className="text-[9px] text-white/20">{timeAgo(entry.timestamp)}</span>
                </div>
                <div className="text-[10px] text-white/60 leading-snug">{entry.text}</div>
              </div>
            ))}
            {sorted.length === 0 && (
              <div className="flex items-center justify-center flex-1 text-white/20 text-xs italic">
                Waiting for something to happen…
              </div>
            )}
          </div>
        )}

        {/* Expanded: full log up to 20 */}
        {isExpanded && (
          <div className="flex-1 overflow-auto flex flex-col gap-1.5 min-h-0">
            {sorted.slice(0, 20).map((entry, i) => (
              <div
                key={entry.id}
                className="px-3 py-2 rounded-[4px] border"
                style={{
                  background: i === 0 ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.015)",
                  borderColor: i === 0 ? kindMeta[entry.kind].color + "33" : "rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] font-bold" style={{ color: kindMeta[entry.kind].color }}>
                    {kindMeta[entry.kind].label}
                  </span>
                  <span className="text-[10px] text-white/20">{timeAgo(entry.timestamp)}</span>
                </div>
                <div className="text-xs text-white/65 leading-relaxed">{entry.text}</div>
              </div>
            ))}
            {sorted.length === 0 && (
              <div className="flex items-center justify-center flex-1 text-white/20 text-xs italic">
                Waiting for something to happen…
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
