/**
 * @hook useKillmails
 * Fetches all on-chain Killmail objects and filters for Jotunn as killer or victim.
 * Paginates until exhausted (currently ~67 total on Stillness, grows slowly).
 *
 * @returns { kills, deaths, allKillmails, isLoading, error }
 */

import { useQuery } from "@tanstack/react-query";
import { graphqlQuery } from "../lib/graphql";
import { JOTUNN, WORLD_PACKAGE_ID, POLL_INTERVAL_MS } from "../lib/constants";

// Fallback to hardcoded Stillness package if env var not set
const PKG =
  WORLD_PACKAGE_ID ||
  "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c";

export interface Killmail {
  address: string;
  killmailId: string;     // key.item_id
  killerId: string;       // item_id
  victimId: string;       // item_id
  lossType: "SHIP" | "STRUCTURE";
  solarSystemId: string;  // item_id (numeric string)
  killTimestamp: number;  // unix seconds
}

interface RawKillmailPage {
  objects: {
    nodes: Array<{
      address: string;
      asMoveObject: {
        contents: {
          json: {
            id: string;
            key: { item_id: string };
            killer_id: { item_id: string };
            victim_id: { item_id: string };
            loss_type: { "@variant": string };
            solar_system_id: { item_id: string };
            kill_timestamp: string;
          };
        };
      };
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

function buildQuery(after?: string) {
  const afterClause = after ? `, after: "${after}"` : "";
  return `
    query GetKillmails {
      objects(first: 50${afterClause}, filter: { type: "${PKG}::killmail::Killmail" }) {
        nodes {
          address
          asMoveObject {
            contents {
              json
            }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  `;
}

async function fetchAllKillmails(): Promise<Killmail[]> {
  const all: Killmail[] = [];
  let cursor: string | null = null;

  while (true) {
    const data: RawKillmailPage = await graphqlQuery<RawKillmailPage>(buildQuery(cursor ?? undefined));
    const { nodes, pageInfo }: RawKillmailPage["objects"] = data.objects;

    for (const node of nodes) {
      const j = node.asMoveObject.contents.json;
      all.push({
        address: node.address,
        killmailId: j.key.item_id,
        killerId: j.killer_id.item_id,
        victimId: j.victim_id.item_id,
        lossType: j.loss_type["@variant"] as "SHIP" | "STRUCTURE",
        solarSystemId: j.solar_system_id.item_id,
        killTimestamp: parseInt(j.kill_timestamp, 10),
      });
    }

    if (!pageInfo.hasNextPage) break;
    cursor = pageInfo.endCursor;
  }

  return all;
}

export function useKillmails() {
  return useQuery({
    queryKey: ["killmails", JOTUNN.itemId],
    queryFn: async () => {
      const all = await fetchAllKillmails();
      const kills  = all.filter((k) => k.killerId === JOTUNN.itemId);
      const deaths = all.filter((k) => k.victimId === JOTUNN.itemId);
      return { kills, deaths, allKillmails: all };
    },
    refetchInterval: POLL_INTERVAL_MS,
    staleTime: POLL_INTERVAL_MS,
  });
}
