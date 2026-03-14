import { useState } from "react";
import type { WorldEvent } from "../lib/types";
import {
  getEventMeta,
  summarizeEvent,
  CATEGORY_COLORS,
} from "../lib/eventMeta";

interface Props {
  events: WorldEvent[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

function formatTimestamp(ts: string): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

export function EventFeed({ events, isLoading, error }: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <section className="section">
      <h3 className="section-heading">
        Jotunn Events
        {events && events.length > 0 && (
          <span className="text-muted" style={{ fontWeight: 400, marginLeft: 8 }}>
            ({events.length})
          </span>
        )}
      </h3>

      {isLoading && <div className="card-loading">Loading events...</div>}
      {error && <div className="card-error">Error: {error.message}</div>}

      {events && events.length === 0 && (
        <div className="no-events-box">
          <p className="text-muted" style={{ marginBottom: 8 }}>
            No on-chain events found for Jotunn yet.
          </p>
          <p className="text-muted" style={{ fontSize: "0.75rem" }}>
            Events that would appear here: character creation, metadata changes,
            status updates, killmails involving Jotunn, fuel/energy activity on
            Jotunn's assemblies, and item minting.
          </p>
        </div>
      )}

      {events && events.length > 0 && (
        <div className="event-list">
          {events.map((ev, i) => {
            const meta = getEventMeta(ev.eventTypeName);
            const expanded = expandedIdx === i;
            const summary = summarizeEvent(ev.eventTypeName, ev.json);

            return (
              <div
                className="event-row event-highlight"
                key={`${ev.timestamp}-${i}`}
                onClick={() => setExpandedIdx(expanded ? null : i)}
                style={{ cursor: "pointer" }}
              >
                <div className="event-header">
                  <div className="event-label-row">
                    <span className="event-icon">{meta.icon}</span>
                    <span
                      className="event-type"
                      style={{ color: CATEGORY_COLORS[meta.category] }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <span className="event-time">
                    {formatTimestamp(ev.timestamp)}
                  </span>
                </div>
                <div className="event-summary">{summary}</div>
                {expanded && (
                  <>
                    <div className="event-description">{meta.description}</div>
                    <pre className="event-json">
                      {JSON.stringify(ev.json, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
