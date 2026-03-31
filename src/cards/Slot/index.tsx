/**
 * @card Slot
 * @description EVE Frontier-themed slot machine.
 *   3 reels · fake ISK · no on-chain tx (pure UI).
 *
 * Symbols (rarest → most common):
 *   🐲 JOTUNN  (weight 1) → 3× = 10× bet  (JACKPOT)
 *   💀 SKULL   (weight 2) → 3× = 5× bet
 *   🚀 SHIP    (weight 3) → 3× = 3× bet
 *   ⛽ FUEL    (weight 4) → 3× = 2× bet
 *   ⭐ STAR    (weight 5) → 3× = 1.5× / 2× = return bet
 *
 * Balance stored in localStorage. Resets to 1000 ISK on game-over reset.
 */

import { useState, useEffect, useRef, useContext } from "react";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";
import { MARTIAN_H } from "../../lib/constants";

// ── Symbols ───────────────────────────────────────────────────────────────────

interface Symbol { emoji: string; name: string; weight: number }

const SYMBOLS: Symbol[] = [
  { emoji: "🐲", name: "JOTUNN", weight: 1 },
  { emoji: "💀", name: "SKULL",  weight: 2 },
  { emoji: "🚀", name: "SHIP",   weight: 3 },
  { emoji: "⛽", name: "FUEL",   weight: 4 },
  { emoji: "⭐", name: "STAR",   weight: 5 },
];

const TOTAL_WEIGHT = SYMBOLS.reduce((a, s) => a + s.weight, 0);

function pickSymbol(): Symbol {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const s of SYMBOLS) {
    r -= s.weight;
    if (r <= 0) return s;
  }
  return SYMBOLS[SYMBOLS.length - 1];
}

// ── Payouts ───────────────────────────────────────────────────────────────────

interface PayResult { multiplier: number; label: string; isWin: boolean }

function calcPayout(reels: Symbol[], bet: number): PayResult {
  const [a, b, c] = reels;
  // Three of a kind
  if (a.name === b.name && b.name === c.name) {
    switch (a.name) {
      case "JOTUNN": return { multiplier: 10,  label: "JACKPOT — 10×",   isWin: true };
      case "SKULL":  return { multiplier: 5,   label: "KILL STREAK — 5×", isWin: true };
      case "SHIP":   return { multiplier: 3,   label: "WARP DRIVE — 3×",  isWin: true };
      case "FUEL":   return { multiplier: 2,   label: "REFUELED — 2×",    isWin: true };
      case "STAR":   return { multiplier: 1.5, label: "STARDUST — 1.5×",  isWin: true };
    }
  }
  // Two stars = return bet
  const stars = reels.filter((s) => s.name === "STAR").length;
  if (stars >= 2) return { multiplier: 1, label: "TWO STARS — bet returned", isWin: true };
  // Jotunn + any two matching = small bonus
  void bet;
  return { multiplier: 0, label: "THE VOID CLAIMS YOU", isWin: false };
}

// ── Balance persistence ───────────────────────────────────────────────────────

const LS_BALANCE = "slot-isk-balance";
const STARTING_ISK = 1_000;

function loadBalance(): number {
  const v = localStorage.getItem(LS_BALANCE);
  const n = v ? parseInt(v, 10) : STARTING_ISK;
  return Number.isNaN(n) || n < 0 ? STARTING_ISK : n;
}
function saveBalance(n: number) {
  localStorage.setItem(LS_BALANCE, String(n));
}

// ── Component ─────────────────────────────────────────────────────────────────

const BET_OPTIONS = [10, 25, 50, 100];
const SPIN_MS = 1_200;
const RESULT_LINGER_MS = 2_500;

export function Slot() {
  const isExpanded = useContext(CardExpandedContext);

  const [balance, setBalance] = useState<number>(loadBalance);
  const [bet, setBet] = useState(25);
  const [reels, setReels] = useState<Symbol[]>(() => [pickSymbol(), pickSymbol(), pickSymbol()]);
  const [phase, setPhase] = useState<"idle" | "spinning" | "result">("idle");
  const [result, setResult] = useState<PayResult | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const spinRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalReels = useRef<Symbol[]>(reels);

  // Persist balance
  useEffect(() => { saveBalance(balance); }, [balance]);

  function spin() {
    if (phase !== "idle" || gameOver) return;
    if (balance < bet) return;

    setBalance((b) => b - bet);
    setPhase("spinning");
    setResult(null);

    // Determine final reels immediately (but don't show yet)
    const final = [pickSymbol(), pickSymbol(), pickSymbol()];
    finalReels.current = final;

    // Rapid symbol shuffle during spin
    spinRef.current = setInterval(() => {
      setReels([pickSymbol(), pickSymbol(), pickSymbol()]);
    }, 80);

    setTimeout(() => {
      if (spinRef.current) clearInterval(spinRef.current);
      setReels(finalReels.current);
      const pay = calcPayout(finalReels.current, bet);
      const winnings = Math.floor(bet * pay.multiplier);
      setBalance((b) => {
        const next = b + winnings;
        if (next <= 0) setGameOver(true);
        return Math.max(0, next);
      });
      setResult(pay);
      setPhase("result");
      setTimeout(() => setPhase("idle"), RESULT_LINGER_MS);
    }, SPIN_MS);
  }

  function reset() {
    setBalance(STARTING_ISK);
    saveBalance(STARTING_ISK);
    setGameOver(false);
    setPhase("idle");
    setResult(null);
    setReels([pickSymbol(), pickSymbol(), pickSymbol()]);
  }

  const reelDisplay = reels.map((s) => s.emoji);

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col gap-2">

        {/* Header */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
            style={{ background: `hsla(${MARTIAN_H},50%,28%,0.5)`, border: `1px solid hsla(${MARTIAN_H},50%,50%,0.25)` }}
          >
            🎰
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: `hsla(${MARTIAN_H},20%,65%,0.55)` }}>
              VOID SLOTS
            </div>
            {isExpanded && (
              <div className="text-[10px] text-white/20">Fake ISK · no on-chain tx</div>
            )}
          </div>
          <span className="text-[10px] font-mono font-bold" style={{ color: `hsla(${MARTIAN_H},80%,65%,0.9)` }}>
            {balance.toLocaleString()} ISK
          </span>
        </div>

        {/* Collapsed: show reels + balance */}
        {!isExpanded && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="flex gap-3 text-3xl">
              {reelDisplay.map((e, i) => (
                <div
                  key={i}
                  className="w-10 h-10 flex items-center justify-center rounded-md"
                  style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {e}
                </div>
              ))}
            </div>
            <div className="text-[10px] text-white/25">Expand to play</div>
          </div>
        )}

        {/* Expanded: full slot machine */}
        {isExpanded && (
          <div className="flex-1 flex flex-col gap-3 items-center justify-center min-h-0">

            {/* Game over */}
            {gameOver ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="text-3xl">💀</div>
                <div className="text-sm font-bold text-red-400 tracking-widest">GAME OVER</div>
                <div className="text-xs text-white/40">The void claimed your wallet too</div>
                <button
                  onClick={reset}
                  className="text-[10px] font-bold tracking-widest px-3 py-1.5 rounded mt-1"
                  style={{
                    background: `hsla(${MARTIAN_H},70%,30%,0.6)`,
                    border: `1px solid hsla(${MARTIAN_H},70%,50%,0.3)`,
                    color: `hsla(${MARTIAN_H},90%,75%,0.9)`,
                    cursor: "pointer",
                  }}
                >
                  RESTART (1,000 ISK)
                </button>
              </div>
            ) : (
              <>
                {/* Reels */}
                <div className="flex gap-3">
                  {reelDisplay.map((emoji, i) => (
                    <div
                      key={i}
                      className="w-16 h-16 flex items-center justify-center text-4xl rounded-lg"
                      style={{
                        background: phase === "spinning"
                          ? "rgba(0,0,0,0.5)"
                          : result?.isWin
                            ? "rgba(74,222,128,0.08)"
                            : "rgba(0,0,0,0.4)",
                        border: `2px solid ${
                          phase === "spinning"
                            ? `hsla(${MARTIAN_H},60%,45%,0.4)`
                            : result?.isWin
                              ? "rgba(74,222,128,0.3)"
                              : "rgba(255,255,255,0.1)"
                        }`,
                        transition: "border-color 0.2s, background 0.2s",
                        filter: phase === "spinning" ? "blur(0.5px)" : "none",
                      }}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>

                {/* Result label */}
                <div className="h-5 flex items-center">
                  {phase === "result" && result && (
                    <div
                      className="text-xs font-bold tracking-widest"
                      style={{ color: result.isWin ? "#4ade80" : "#f87171" }}
                    >
                      {result.label}
                    </div>
                  )}
                  {phase === "spinning" && (
                    <div className="text-xs text-white/30 tracking-widest animate-pulse">SPINNING…</div>
                  )}
                </div>

                {/* Bet selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/30">BET</span>
                  {BET_OPTIONS.map((b) => (
                    <button
                      key={b}
                      onClick={() => setBet(b)}
                      disabled={phase !== "idle"}
                      className="text-[10px] font-mono px-2 py-1 rounded transition-colors"
                      style={{
                        background: bet === b ? `hsla(${MARTIAN_H},60%,28%,0.7)` : "rgba(255,255,255,0.05)",
                        border: `1px solid ${bet === b ? `hsla(${MARTIAN_H},60%,50%,0.4)` : "rgba(255,255,255,0.08)"}`,
                        color: bet === b ? `hsla(${MARTIAN_H},80%,70%,0.9)` : "rgba(250,250,229,0.35)",
                        cursor: phase === "idle" ? "pointer" : "not-allowed",
                        opacity: phase !== "idle" ? 0.5 : 1,
                      }}
                    >
                      {b}
                    </button>
                  ))}
                  <span className="text-[10px] text-white/20">ISK</span>
                </div>

                {/* Spin button */}
                <button
                  onClick={spin}
                  disabled={phase !== "idle" || balance < bet}
                  className="text-sm font-bold tracking-[0.2em] px-8 py-2.5 rounded-lg transition-all"
                  style={{
                    background: phase === "idle" && balance >= bet
                      ? `hsla(${MARTIAN_H},75%,32%,0.8)`
                      : "rgba(255,255,255,0.05)",
                    border: `1px solid ${phase === "idle" && balance >= bet
                      ? `hsla(${MARTIAN_H},75%,55%,0.5)`
                      : "rgba(255,255,255,0.1)"}`,
                    color: phase === "idle" && balance >= bet
                      ? `hsla(${MARTIAN_H},90%,80%,1)`
                      : "rgba(250,250,229,0.25)",
                    cursor: phase === "idle" && balance >= bet ? "pointer" : "not-allowed",
                    boxShadow: phase === "idle" && balance >= bet
                      ? `0 0 20px hsla(${MARTIAN_H},80%,45%,0.2)`
                      : "none",
                  }}
                >
                  {phase === "spinning" ? "⚡ SPINNING" : "SPIN"}
                </button>

                {/* Balance + payout table */}
                <div className="flex gap-6 mt-1">
                  <div className="text-center">
                    <div className="text-[9px] text-white/20 tracking-widest mb-0.5">BALANCE</div>
                    <div className="text-sm font-mono font-bold" style={{ color: `hsla(${MARTIAN_H},80%,65%,0.9)` }}>
                      {balance.toLocaleString()} ISK
                    </div>
                  </div>
                  <div className="border-l border-white/10 pl-6">
                    <div className="text-[9px] text-white/20 tracking-widest mb-1">PAYOUTS</div>
                    {[
                      { sym: "🐲🐲🐲", pay: "10×" },
                      { sym: "💀💀💀", pay: "5×"  },
                      { sym: "🚀🚀🚀", pay: "3×"  },
                      { sym: "⛽⛽⛽", pay: "2×"  },
                      { sym: "⭐⭐⭐", pay: "1.5×" },
                      { sym: "⭐⭐ ✦ ", pay: "1×"  },
                    ].map((row) => (
                      <div key={row.sym} className="flex justify-between gap-3 text-[9px]">
                        <span className="text-white/40 font-mono">{row.sym}</span>
                        <span style={{ color: `hsla(${MARTIAN_H},70%,60%,0.7)` }}>{row.pay}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
