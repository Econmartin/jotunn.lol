import type { OwnedObject } from "../lib/types";
import { SUISCAN_BASE } from "../lib/constants";

interface Props {
  objects: OwnedObject[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function OwnedObjects({ objects, isLoading, error }: Props) {
  return (
    <section className="section">
      <h3 className="section-heading">Owned Objects</h3>

      {isLoading && <div className="card-loading">Loading owned objects...</div>}
      {error && <div className="card-error">Error: {error.message}</div>}

      {objects && objects.length === 0 && (
        <p className="text-muted">No world-package objects owned by this wallet.</p>
      )}

      {objects && objects.length > 0 && (
        <div className="card-grid">
          {objects.map((obj) => (
            <div className="card" key={obj.address}>
              <div className="card-header">
                <h4>{obj.typeName}</h4>
                <span className="card-type-tag">v{obj.version}</span>
              </div>
              <div className="card-field">
                <span className="card-field-label">Address</span>
                <a
                  className="card-field-value link-mono"
                  href={`${SUISCAN_BASE}/object/${obj.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {obj.address}
                </a>
              </div>
              {Object.entries(obj.json)
                .filter(([key]) => key !== "id")
                .map(([key, val]) => (
                  <div className="card-field" key={key}>
                    <span className="card-field-label">{key}</span>
                    <span className="card-field-value">
                      {typeof val === "object"
                        ? JSON.stringify(val)
                        : String(val ?? "")}
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
