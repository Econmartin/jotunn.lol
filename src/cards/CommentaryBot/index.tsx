/**
 * @card CommentaryBot
 * @description Template-based commentary engine watching live game events.
 *   Reacts to: deaths, kills, tribe changes, version bumps, failed txs.
 *   Collapsed: latest quip (truncated) + event type badge.
 *   Expanded:  full commentary log, newest first.
 *
 * @dataflow
 *   useKillmails() + useCharacter() + useTransactions() → event stream → template match → log
 */

import { useState, useEffect, useContext } from "react";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";
import { SvgIcon } from "../../components/SvgIcon";
import { useKillmails } from "../../hooks/useKillmails";
import { useCharacter } from "../../hooks/useCharacter";
import { useTransactions } from "../../hooks/useTransactions";
import { cn } from "../../lib/utils";
import { MARTIAN_H } from "../../lib/constants";

type EventKind = "death" | "kill" | "version" | "idle" | "fail";

interface Commentary {
  id: string;
  kind: EventKind;
  text: string;
  timestamp: number;
}

const DEATH_LINES = [
  (sys: string) => `Another one bites the dust — War Admiral Jotunn has perished in system ${sys}. The void claims another.`,
  (sys: string) => `BREAKING: Jotunn's killmail just dropped in ${sys}. Ships are expensive, pilot.`,
  (_sys: string) => `Jotunn has died. Somewhere in the universe, an enemy is very pleased with themselves.`,
  (sys: string) => `System ${sys} has claimed our hero. This is fine. Everything is fine.`,
];

const KILL_LINES = [
  (sys: string) => `WAR ADMIRAL JOTUNN HAS CLAIMED A VICTIM IN SYSTEM ${sys}. The void runs red!`,
  (_sys: string) => `Jotunn secured a kill. Justice (or chaos) has been delivered to the galaxy.`,
  (sys: string) => `Confirmed: Someone is having a very bad time in ${sys} right now. Jotunn saw to that.`,
];

const VERSION_LINES = [
  (v: number) => `Something changed. Jotunn's character object just ticked to version ${v}. What did you do?`,
  (v: number) => `On-chain state update detected. Character version is now ${v}. The blockchain doesn't lie.`,
];

const IDLE_LINES = [
  "Monitoring the void. No significant events detected. Jotunn appears to be alive.",
  "All quiet on the galactic front. Either Jotunn is lying low or the game servers are.",
  "Zero kills. Zero deaths. Zero drama. This commentary bot is bored.",
  "The void is silent. Jotunn is alive. For now.",
];

const FAIL_LINES = [
  "A transaction has FAILED. We don't talk about it.",
  "Skill issue detected on-chain. A transaction returned failure status.",
];

function pickLine<T extends (...args: never[]) => string>(lines: T[], ...args: Parameters<T>): string {
  const fn = lines[Math.floor(Math.random() * lines.length)] as unknown as (...a: unknown[]) => string;
  return fn(...args);
}

const kindMeta: Record<EventKind, { label: string; className: string }> = {
  death:   { label: "💀 DEATH",   className: "text-red-400" },
  kill:    { label: "⚔️ KILL",    className: "text-amber-400" },
  version: { label: "⬆ UPDATE",  className: "text-purple-400" },
  idle:    { label: "💤 IDLE",    className: "text-white/30" },
  fail:    { label: "❌ FAIL",    className: "text-orange-400" },
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

  // Watch for new deaths
  useEffect(() => {
    if (!killData?.deaths.length) return;
    const latest = [...killData.deaths].sort((a, b) => b.killTimestamp - a.killTimestamp)[0];
    setLog((prev) => {
      const next = addEntry(prev, {
        kind: "death",
        text: pickLine(DEATH_LINES, latest.solarSystemId),
        timestamp: latest.killTimestamp * 1000,
      });
      saveLog(next);
      return next;
    });
  }, [killData?.deaths.length]);

  // Watch for new kills
  useEffect(() => {
    if (!killData?.kills.length) return;
    const latest = [...killData.kills].sort((a, b) => b.killTimestamp - a.killTimestamp)[0];
    setLog((prev) => {
      const next = addEntry(prev, {
        kind: "kill",
        text: pickLine(KILL_LINES, latest.solarSystemId),
        timestamp: latest.killTimestamp * 1000,
      });
      saveLog(next);
      return next;
    });
  }, [killData?.kills.length]);

  // Watch for version bumps
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

  // Watch for failed txs
  useEffect(() => {
    if (!txData) return;
    const failures = txData.filter((tx) => tx.status === "failure");
    if (!failures.length) return;
    const latest = failures[0];
    setLog((prev) => {
      const alreadyLogged = prev.some((e) => e.kind === "fail" && e.timestamp === new Date(latest.timestamp).getTime());
      if (alreadyLogged) return prev;
      const next = addEntry(prev, {
        kind: "fail",
        text: FAIL_LINES[Math.floor(Math.random() * FAIL_LINES.length)],
        timestamp: new Date(latest.timestamp).getTime(),
      });
      saveLog(next);
      return next;
    });
  }, [txData]);

  // Seed idle message if log is empty
  useEffect(() => {
    setLog((prev) => {
      if (prev.length > 0) return prev;
      const next = [{ id: "idle-0", kind: "idle" as EventKind, text: IDLE_LINES[0], timestamp: Date.now() }];
      saveLog(next);
      return next;
    });
  }, []);

  const sorted = [...log].sort((a, b) => b.timestamp - a.timestamp);
  const latest = sorted[0];

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex items-center gap-2">
            <SvgIcon src="/assets/commentary.svg" size={22} />
            <div>
              <div
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: `hsla(${MARTIAN_H},20%,65%,0.55)` }}
              >COMMENTARY</div>
              {isExpanded && (
                <div className="text-xs text-white/20">
                  Snarky quips triggered by kills, deaths, version bumps, failed txs
                </div>
              )}
            </div>
          </div>
          {latest && (
            <span className={cn("text-xs font-semibold", kindMeta[latest.kind].className)}>
              {kindMeta[latest.kind].label}
            </span>
          )}
        </div>

        {/* Latest line */}
        {latest && (
          <div
            className={cn(
              "px-[10px] py-2 rounded-[5px] mb-2",
              "bg-black/20 border border-white/[0.07]",
              "leading-[1.5] text-white/75 shrink-0",
              "overflow-hidden",
              isExpanded ? "text-xs" : "text-xs [-webkit-line-clamp:3] [display:-webkit-box] [-webkit-box-orient:vertical]"
            )}
          >
            {latest.text}
          </div>
        )}

        {/* Log (expanded) */}
        {isExpanded && sorted.slice(1).length > 0 && (
          <div className="flex-1 overflow-auto flex flex-col gap-1.5">
            <div className="text-xs tracking-widest uppercase text-white/20 mb-0.5">
              Previous ({sorted.slice(1).length})
            </div>
            {sorted.slice(1, 8).map((entry) => (
              <div
                key={entry.id}
                className="px-[10px] py-1.5 rounded-[4px] bg-white/[0.02] border border-white/[0.05]"
              >
                <div className="flex justify-between mb-[3px]">
                  <span className={cn("text-xs", kindMeta[entry.kind].className)}>
                    {kindMeta[entry.kind].label}
                  </span>
                  <span className="text-xs text-white/20">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-white/50 leading-snug">{entry.text}</div>
              </div>
            ))}
          </div>
        )}

        {!latest && (
          <div className="flex-1 flex items-center justify-center text-white/20 text-xs italic">
            Waiting for something to happen…
          </div>
        )}
      </div>
    </GlassCard>
  );
}
