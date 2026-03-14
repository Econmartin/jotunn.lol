import type { TransactionEntry } from "../lib/types";
import { SUISCAN_BASE } from "../lib/constants";

interface Props {
  transactions: TransactionEntry[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

function formatTimestamp(ts: string): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString();
}

export function TxHistory({ transactions, isLoading, error }: Props) {
  return (
    <section className="section">
      <h3 className="section-heading">Transaction History</h3>

      {isLoading && <div className="card-loading">Loading transactions...</div>}
      {error && <div className="card-error">Error: {error.message}</div>}

      {transactions && transactions.length === 0 && (
        <p className="text-muted">
          No transactions found affecting this wallet.
        </p>
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
    </section>
  );
}
