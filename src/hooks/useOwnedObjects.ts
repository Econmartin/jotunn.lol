import { useQuery } from "@tanstack/react-query";
import { graphqlQuery, OWNED_OBJECTS_QUERY } from "../lib/graphql";
import { JOTUNN, POLL_INTERVAL_MS, WORLD_PACKAGE_ID } from "../lib/constants";
import type { OwnedObject } from "../lib/types";

interface RawNode {
  address: string;
  version: number;
  asMoveObject?: {
    contents: {
      json: Record<string, unknown>;
      type: { repr: string };
    };
  };
}

interface RawResult {
  objects: {
    nodes: RawNode[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

export function useOwnedObjects() {
  return useQuery<OwnedObject[]>({
    queryKey: ["owned-objects", JOTUNN.wallet],
    queryFn: async (): Promise<OwnedObject[]> => {
      const allNodes: RawNode[] = [];
      let cursor: string | null = null;
      const maxPages = 5;

      for (let i = 0; i < maxPages; i++) {
        const data: RawResult = await graphqlQuery<RawResult>(OWNED_OBJECTS_QUERY, {
          owner: JOTUNN.wallet,
          first: 50,
          ...(cursor ? { after: cursor } : {}),
        });
        allNodes.push(...data.objects.nodes);
        if (!data.objects.pageInfo.hasNextPage) break;
        cursor = data.objects.pageInfo.endCursor;
      }

      return allNodes
        .filter((n) => n.asMoveObject)
        .map((n) => {
          const repr = n.asMoveObject!.contents.type.repr;
          return {
            address: n.address,
            version: n.version,
            type: repr,
            typeName: repr.split("::").pop() || repr,
            json: n.asMoveObject!.contents.json,
          };
        })
        .filter((o) => o.type.startsWith(WORLD_PACKAGE_ID));
    },
    refetchInterval: POLL_INTERVAL_MS,
  });
}
