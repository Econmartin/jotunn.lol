/**
 * @card TxHistory
 * @description Recent wallet transactions with status badges and Suiscan links.
 *
 * @deps
 *   - src/components/GlassCard/    — glassmorphism wrapper (accentH=270 = purple)
 *   - src/hooks/useTransactions.ts — paginated Sui GraphQL transactions
 *   - src/lib/constants.ts         — SUISCAN_BASE
 *
 * @dataflow
 *   Sui GraphQL → useTransactions() → TxHistory
 */

import { useTransactions } from "../../hooks/useTransactions";
import { SUISCAN_BASE, MARTIAN_H } from "../../lib/constants";
import { GlassCard } from "../../components/GlassCard";
import { SvgIcon } from "../../components/SvgIcon";

const LOADING = { display: "flex", alignItems: "center", justifyContent: "center", minHeight: 80, color: "rgba(250,250,229,0.6)" } as const;
const ERROR   = { ...LOADING, color: "#f87171" } as const;
const MUTED   = { color: "rgba(250,250,229,0.6)" } as const;

function formatTimestamp(ts: string): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

export function TxHistory() {
  const { data: transactions, isLoading, error } = useTransactions();

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="text-[#FAFAE5]" style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <SvgIcon src="/assets/transactions.svg" size={22} />
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: `hsla(${MARTIAN_H}, 20%, 65%, 0.55)` }}>TRANSACTIONS</div>
            <div className="text-sm font-medium" style={{ color: `hsla(${MARTIAN_H}, 20%, 75%, 0.7)` }}>Tx history</div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          {isLoading && <div className="text-sm" style={LOADING}>Loading transactions...</div>}
          {error    && <div className="text-sm" style={ERROR}>Error: {error.message}</div>}
          {transactions && transactions.length === 0 && <p className="text-sm" style={MUTED}>No transactions found affecting this wallet.</p>}
          {transactions && transactions.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {transactions.map((tx) => (
                <div key={tx.digest} className="text-sm grid gap-3 py-2 border-b border-white/15 items-center" style={{ gridTemplateColumns: "1fr auto auto" }}>
                  <a
                    href={`${SUISCAN_BASE}/tx/${tx.digest}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-martian-300 hover:text-martian-200 text-xs break-all"
                    style={{ color: "rgba(255,193,120,0.9)" }}
                  >
                    {tx.digest}
                  </a>
                  <span
                    className="text-xs tracking-wider px-1.5 py-0.5 rounded border"
                    style={{
                      color: tx.status === "SUCCESS" ? "#4ade80" : "#f87171",
                      borderColor: tx.status === "SUCCESS" ? "#4ade80" : "#f87171",
                    }}
                  >
                    {tx.status}
                  </span>
                  <span className="text-xs whitespace-nowrap" style={{ color: "rgba(250,250,229,0.6)" }}>
                    {formatTimestamp(tx.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
