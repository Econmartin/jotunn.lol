import type { ChangeEntry } from "../lib/types";

interface Props {
  changelog: ChangeEntry[];
  onClear: () => void;
}

export function ChangeLog({ changelog, onClear }: Props) {
  return (
    <section className="section">
      <div className="section-heading-row">
        <h3 className="section-heading" style={{ marginBottom: 0 }}>
          Change Log
        </h3>
        {changelog.length > 0 && (
          <button className="btn-small" onClick={onClear}>
            Clear
          </button>
        )}
      </div>

      <p className="text-muted" style={{ fontSize: "0.8125rem" }}>
        Tracks diffs between polls. Stored in localStorage — clears on browser
        data reset.
      </p>

      {changelog.length === 0 && (
        <p className="text-muted">
          No changes detected yet. The tracker polls every 30s.
        </p>
      )}

      {changelog.length > 0 && (
        <div className="changelog-list">
          {changelog.map((entry, i) => (
            <div className="changelog-entry" key={`${entry.timestamp}-${i}`}>
              <div className="changelog-header">
                <span className="changelog-time">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
                <span className="changelog-version">v{entry.version}</span>
              </div>
              {entry.diffs.map((d, j) => (
                <div className="diff-row" key={j}>
                  <span className="diff-path">{d.path}</span>
                  <span className="diff-before">
                    {typeof d.before === "object"
                      ? JSON.stringify(d.before)
                      : String(d.before ?? "∅")}
                  </span>
                  <span className="diff-arrow">&rarr;</span>
                  <span className="diff-after">
                    {typeof d.after === "object"
                      ? JSON.stringify(d.after)
                      : String(d.after ?? "∅")}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
