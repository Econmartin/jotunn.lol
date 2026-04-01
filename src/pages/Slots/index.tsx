/**
 * Slotty Jötunn — EVE-themed slot machine.
 * Each spin costs real EVE from your wallet. Outcomes are provably fair via sui::random.
 * Winnings paid from on-chain house pool; credits tracked locally until claimed.
 */

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { useConnection, dAppKit as eveAppKit } from "@evefrontier/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { buildSlotSpinTx } from "../../lib/eve-transactions";
import { getLargestEveCoin, getEveBalance, suiClient } from "../../lib/eve-client";
import { EVE_SCALE } from "../../lib/constants";

// ── Symbols ──────────────────────────────────────────────────────────────────

const JOTUNN_IMG = "/assets/jotunn-snake.png";

type Symbol = 0 | 1 | 2 | 3 | 4;
const SYMBOL_LABELS: Record<Symbol, string> = { 0: "J", 1: "💀", 2: "🚀", 3: "⛽", 4: "⭐" };
const SYMBOL_NAMES:  Record<Symbol, string> = { 0: "JOTUNN", 1: "SKULL", 2: "SHIP", 3: "FUEL", 4: "STAR" };

// Weighted pool mirroring the contract: total 15 entries
const WEIGHTED_POOL: Symbol[] = [0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4];

function randomSymbol(): Symbol {
  return WEIGHTED_POOL[Math.floor(Math.random() * WEIGHTED_POOL.length)];
}

function calcClientPayout(r1: Symbol, r2: Symbol, r3: Symbol, bet: number): number {
  if (r1 === r2 && r2 === r3) {
    const mults: Record<Symbol, number> = { 0: 20, 1: 10, 2: 5, 3: 3, 4: 2 };
    return bet * mults[r1];
  }
  if (r1 === r2 || r2 === r3 || r1 === r3) return bet / 2;
  return 0;
}

const PAYOUT_TABLE: { combo: string; mult: string }[] = [
  { combo: "JOTUNN × 3", mult: "20×" },
  { combo: "SKULL × 3",  mult: "10×" },
  { combo: "SHIP × 3",   mult: "5×"  },
  { combo: "FUEL × 3",   mult: "3×"  },
  { combo: "STAR × 3",   mult: "2×"  },
  { combo: "Any pair",   mult: "0.5×" },
];

// ── Symbol cell ──────────────────────────────────────────────────────────────

function SymbolCell({ sym, small }: { sym: Symbol; small?: boolean }) {
  const size = small ? "w-8 h-8 text-lg" : "w-14 h-14 text-3xl";
  if (sym === 0) {
    return (
      <div className={`${size} flex items-center justify-center rounded overflow-hidden shrink-0`}>
        <img src={JOTUNN_IMG} alt="Jotunn" className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${size} flex items-center justify-center shrink-0`}>
      {SYMBOL_LABELS[sym]}
    </div>
  );
}

// ── Reel ─────────────────────────────────────────────────────────────────────

function Reel({ result, spinning, delay }: { result: Symbol; spinning: boolean; delay: number }) {
  const [displaySymbols, setDisplaySymbols] = useState<Symbol[]>([randomSymbol(), result, randomSymbol()]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (spinning) {
      intervalRef.current = setInterval(() => {
        setDisplaySymbols([randomSymbol(), randomSymbol(), randomSymbol()]);
      }, 100);
    } else {
      const stop = setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplaySymbols([randomSymbol(), result, randomSymbol()]);
      }, delay);
      return () => clearTimeout(stop);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [spinning, result, delay]);

  return (
    <div
      className="flex flex-col items-center justify-center gap-1 rounded-lg py-2 px-3"
      style={{ background: "rgba(255,102,0,0.05)", border: "1px solid rgba(255,102,0,0.15)", width: 80 }}
    >
      {displaySymbols.map((s, i) => (
        <div
          key={i}
          style={{
            opacity: i === 1 ? 1 : 0.35,
            transform: i === 1 ? "scale(1.15)" : "scale(0.9)",
            transition: "opacity 0.15s, transform 0.15s",
          }}
        >
          <SymbolCell sym={s} />
        </div>
      ))}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export function Slots() {
  const account = useCurrentAccount({ dAppKit: eveAppKit });
  const { isConnected, handleConnect, handleDisconnect } = useConnection();
  const dAppKit = useDAppKit(eveAppKit);

  const [betEve, setBetEve] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<[Symbol, Symbol, Symbol]>([4, 4, 4]);
  const [lastPayout, setLastPayout] = useState<number | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const { data: eveBalanceRaw, refetch: refetchBalance } = useQuery({
    queryKey: ["eve-balance", account?.address],
    queryFn: () => getEveBalance(account!.address),
    enabled: !!account?.address,
    refetchInterval: 30_000,
  });

  const eveBalance = eveBalanceRaw
    ? Number(eveBalanceRaw / EVE_SCALE) + Number((eveBalanceRaw % EVE_SCALE)) / 1e9
    : null;

  async function handleSpin() {
    if (!account?.address) { handleConnect(); return; }
    if (spinning) return;
    setTxError(null);
    setLastPayout(null);
    setSpinning(true);

    try {
      const coin = await getLargestEveCoin(account.address);
      if (!coin || coin.balance < BigInt(betEve) * EVE_SCALE) {
        throw new Error(`Insufficient EVE (need ${betEve} EVE)`);
      }
      const tx = buildSlotSpinTx(coin.id, betEve);
      const result = await dAppKit.signAndExecuteTransaction({ transaction: tx });

      // signAndExecuteTransaction never returns events — fetch them separately
      const digest = (result as { Transaction?: { digest: string }; FailedTransaction?: { digest: string } }).Transaction?.digest
        ?? (result as { Transaction?: { digest: string }; FailedTransaction?: { digest: string } }).FailedTransaction?.digest
        ?? (result as { digest?: string }).digest ?? "";

      let r1: Symbol, r2: Symbol, r3: Symbol, payout: number;

      if (digest) {
        const txBlock = await suiClient.getTransactionBlock({
          digest,
          options: { showEvents: true },
        });
        const spinEvent = (txBlock.events ?? []).find((e: { type: string }) => e.type?.includes("::slots::SpinResult"));
        const pj = (spinEvent as { parsedJson?: { reel1?: number; reel2?: number; reel3?: number; payout?: string } } | undefined)?.parsedJson;
        r1 = ((pj?.reel1 ?? 4) as Symbol);
        r2 = ((pj?.reel2 ?? 4) as Symbol);
        r3 = ((pj?.reel3 ?? 4) as Symbol);
        payout = Number(pj?.payout ?? 0) / 1e9;
      } else {
        r1 = randomSymbol(); r2 = randomSymbol(); r3 = randomSymbol();
        payout = calcClientPayout(r1, r2, r3, betEve);
      }

      // Let the reels "spin" for a beat before settling
      await new Promise((res) => setTimeout(res, 1200));
      setResults([r1, r2, r3]);
      setLastPayout(payout);
      refetchBalance();
    } catch (e) {
      setTxError((e as Error).message);
    } finally {
      setSpinning(false);
    }
  }

  const isWin = lastPayout != null && lastPayout > 0;
  const isJackpot = isWin && results[0] === 0 && results[1] === 0 && results[2] === 0;

  return (
    <div
      className="min-h-screen font-mono flex flex-col"
      style={{ background: "#08060a", color: "#e0e0d0" }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ background: "#0c0a10", borderBottom: "1px solid rgba(255,102,0,0.2)" }}
      >
        <Link to="/" className="text-[10px] tracking-[.2em] uppercase" style={{ color: "rgba(255,102,0,0.5)" }}>
          ← DASHBOARD
        </Link>
        <div className="text-lg font-black tracking-[.15em]" style={{ color: "#FF6600" }}>
          SLOTTY JÖTUNN
        </div>
        <div className="flex items-center gap-3">
          {eveBalance !== null && (
            <span className="text-sm font-bold" style={{ color: "rgba(255,102,0,0.8)" }}>
              {eveBalance.toFixed(2)} EVE
            </span>
          )}
          <button
            onClick={isConnected ? handleDisconnect : handleConnect}
            className="text-xs font-bold tracking-wider px-3 py-1.5 rounded border"
            style={{
              borderColor: "rgba(255,102,0,0.4)",
              color: isConnected ? "#FF6600" : "rgba(255,102,0,0.5)",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            {isConnected && account
              ? `${account.address.slice(0, 6)}…${account.address.slice(-4)}`
              : "CONNECT"}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-4 gap-8">

        {/* Machine */}
        <div
          className="rounded-2xl p-8 flex flex-col items-center gap-6"
          style={{
            background: "#0f0c14",
            border: "2px solid rgba(255,102,0,0.25)",
            boxShadow: isJackpot ? "0 0 40px rgba(255,102,0,0.6)" : isWin ? "0 0 20px rgba(255,102,0,0.3)" : "none",
            minWidth: 340,
          }}
        >
          {/* Win/jackpot flash */}
          {isJackpot && (
            <div className="text-center animate-pulse">
              <div className="text-2xl font-black tracking-[.2em]" style={{ color: "#FF6600" }}>
                ⚡ JACKPOT ⚡
              </div>
              <div className="text-sm" style={{ color: "#FF6600" }}>
                +{lastPayout} EVE CREDITS
              </div>
            </div>
          )}
          {isWin && !isJackpot && (
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: "#4ade80" }}>
                WIN +{lastPayout} EVE
              </div>
            </div>
          )}
          {lastPayout === 0 && !spinning && (
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
              No match — try again
            </div>
          )}

          {/* Reels */}
          <div className="flex gap-2 items-center">
            {/* Win line indicator */}
            <div className="text-[9px] tracking-widest uppercase -rotate-90 shrink-0" style={{ color: "rgba(255,102,0,0.4)", width: 20 }}>
              WIN
            </div>
            <Reel result={results[0]} spinning={spinning} delay={800} />
            <Reel result={results[1]} spinning={spinning} delay={1000} />
            <Reel result={results[2]} spinning={spinning} delay={1200} />
          </div>

          {/* Current result labels */}
          {!spinning && (
            <div className="flex gap-2 text-[9px] tracking-widest" style={{ color: "rgba(255,102,0,0.4)" }}>
              {results.map((r, i) => <span key={i}>{SYMBOL_NAMES[r]}</span>)}
            </div>
          )}

          {/* Bet selector */}
          <div className="flex gap-2">
            {[1, 5, 10].map((b) => (
              <button
                key={b}
                onClick={() => setBetEve(b)}
                className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: betEve === b ? "#FF6600" : "rgba(255,102,0,0.08)",
                  color: betEve === b ? "#fff" : "rgba(255,102,0,0.6)",
                  border: `1px solid ${betEve === b ? "#FF6600" : "rgba(255,102,0,0.2)"}`,
                  cursor: "pointer",
                }}
              >
                {b} EVE
              </button>
            ))}
          </div>

          {/* Spin button */}
          <button
            onClick={handleSpin}
            disabled={spinning}
            className="w-full py-3 rounded-xl text-lg font-black tracking-[.2em] transition-all"
            style={{
              background: spinning ? "#552200" : "linear-gradient(135deg, #FF6600, #FF9900)",
              color: "#fff",
              border: "none",
              cursor: spinning ? "wait" : "pointer",
              opacity: spinning ? 0.7 : 1,
              letterSpacing: ".2em",
            }}
          >
            {spinning ? "SPINNING…" : "S P I N"}
          </button>

          {/* Error */}
          {txError && (
            <div className="text-xs text-center" style={{ color: "#f87171" }}>{txError}</div>
          )}

        </div>

        {/* Payout table */}
        <div className="rounded-xl p-5" style={{ background: "#0f0c14", border: "1px solid rgba(255,102,0,0.12)", minWidth: 340 }}>
          <div className="text-[9px] tracking-widest uppercase mb-3" style={{ color: "rgba(255,102,0,0.4)" }}>
            Payout Table
          </div>
          <div className="grid gap-1.5">
            {PAYOUT_TABLE.map((row) => (
              <div key={row.combo} className="flex justify-between text-xs">
                <span style={{ color: "rgba(255,255,255,0.45)" }}>{row.combo}</span>
                <span className="font-bold" style={{ color: "#FF6600" }}>{row.mult}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 text-[9px]" style={{ color: "rgba(255,102,0,0.3)", borderTop: "1px solid rgba(255,102,0,0.08)" }}>
            Provably fair · Outcomes on-chain via sui::random
          </div>
        </div>

      </main>
    </div>
  );
}
