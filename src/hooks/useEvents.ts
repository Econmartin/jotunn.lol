import { useQuery } from "@tanstack/react-query";
import { graphqlQuery, TX_EVENTS_QUERY } from "../lib/graphql";
import { JOTUNN, POLL_INTERVAL_MS } from "../lib/constants";
import type { WorldEvent } from "../lib/types";

interface TxEventNode {
  contents: {
    json: Record<string, unknown>;
    type: { repr: string };
  };
  timestamp: string;
}

interface TxNode {
  digest: string;
  effects: {
    status: string;
    timestamp: string;
    events: { nodes: TxEventNode[] };
  };
}

interface TxEventsResult {
  transactions: {
    nodes: TxNode[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

async function fetchEventsForAddress(address: string): Promise<WorldEvent[]> {
  const events: WorldEvent[] = [];
  let after: string | null = null;
  let pages = 0;

  while (pages < 10) {
      const data: TxEventsResult = await graphqlQuery<TxEventsResult>(TX_EVENTS_QUERY, {
      address,
      first: 50,
      after,
    });

    for (const tx of data.transactions.nodes) {
      if (!tx.effects.events) continue;
      for (const ev of tx.effects.events.nodes) {
        const repr = ev.contents.type.repr;
        events.push({
          eventType: repr,
          eventTypeName: repr.split("::").pop() || repr,
          json: ev.contents.json,
          timestamp: ev.timestamp || tx.effects.timestamp,
        });
      }
    }

    if (!data.transactions.pageInfo.hasNextPage) break;
    after = data.transactions.pageInfo.endCursor;
    pages++;
  }

  return events;
}

export function useEvents() {
  return useQuery<WorldEvent[]>({
    queryKey: ["jotunn-events", JOTUNN.wallet, JOTUNN.characterId],
    queryFn: async (): Promise<WorldEvent[]> => {
      const [walletEvents, charEvents] = await Promise.all([
        fetchEventsForAddress(JOTUNN.wallet),
        fetchEventsForAddress(JOTUNN.characterId),
      ]);

      const seen = new Set<string>();
      const merged: WorldEvent[] = [];

      for (const ev of [...walletEvents, ...charEvents]) {
        const key = `${ev.eventType}:${ev.timestamp}:${JSON.stringify(ev.json)}`;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(ev);
        }
      }

      merged.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      return merged;
    },
    refetchInterval: POLL_INTERVAL_MS * 2,
  });
}
