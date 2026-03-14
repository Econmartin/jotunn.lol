/*
 * Transaction History — READ card. useTransactions (Sui GraphQL, affectedAddress filter).
 */

import { useTransactions } from "../../hooks/useTransactions";
import { SUISCAN_BASE } from "../../lib/constants";
import { GlassCard } from "../GlassCard";

function formatTimestamp(ts: string): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString();
}

export function TxHistory() {
  const { data: transactions, isLoading, error } = useTransactions();

  return (
    <GlassCard accentH={270} style={{ height: "100%", width: "100%" }}>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "hsla(270, 50%, 30%, 0.5)",
            border: "1px solid hsla(270, 50%, 50%, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>📜</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsla(270, 20%, 65%, 0.55)" }}>TRANSACTIONS</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "hsla(270, 20%, 75%, 0.7)" }}>Tx history</div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          {isLoading && <div className="card-loading">Loading transactions...</div>}
          {error && <div className="card-error">Error: {error.message}</div>}
          {transactions && transactions.length === 0 && (
            <p className="text-muted">No transactions found affecting this wallet.</p>
          )}
          {transactions && transactions.length > 0 && (
            <div className="tx-list">
              {transactions.map((tx) => (
                <div className="tx-row" key={tx.digest}>
                  <a
                    className="tx-digest"
                    href={`${SUISCAN_BASE}/tx/${tx.digest}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tx.digest}
                  </a>
                  <span
                    className={`tx-status ${tx.status === "SUCCESS" ? "tx-success" : "tx-fail"}`}
                  >
                    {tx.status}
                  </span>
                  <span className="tx-time">{formatTimestamp(tx.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
