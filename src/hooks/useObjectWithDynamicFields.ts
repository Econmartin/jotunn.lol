import { useQuery } from "@tanstack/react-query";
import { graphqlQuery, OBJECT_WITH_DYNAMIC_FIELDS_QUERY } from "../lib/graphql";
import { POLL_INTERVAL_MS } from "../lib/constants";
import type { DynamicField } from "../lib/types";

export interface ObjectWithDynamicFields {
  address: string;
  version: number;
  digest: string;
  json: Record<string, unknown>;
  dynamicFields: DynamicField[];
}

interface RawResult {
  object: {
    address: string;
    version: number;
    digest: string;
    asMoveObject?: {
      contents: { type: { repr: string }; json: Record<string, unknown> };
      dynamicFields: {
        nodes: DynamicField[];
      };
    };
  } | null;
}

export async function fetchObjectWithDynamicFields(
  address: string,
): Promise<ObjectWithDynamicFields | null> {
  const data = await graphqlQuery<RawResult>(OBJECT_WITH_DYNAMIC_FIELDS_QUERY, {
    address,
  });
  const obj = data.object;
  if (!obj?.asMoveObject) return null;
  return {
    address: obj.address,
    version: obj.version,
    digest: obj.digest,
    json: obj.asMoveObject.contents.json as Record<string, unknown>,
    dynamicFields: obj.asMoveObject.dynamicFields.nodes,
  };
}

export function useObjectWithDynamicFields(address: string | null) {
  return useQuery<ObjectWithDynamicFields | null>({
    queryKey: ["object-with-dynamic-fields", address],
    queryFn: () => (address ? fetchObjectWithDynamicFields(address) : Promise.resolve(null)),
    enabled: !!address,
    refetchInterval: POLL_INTERVAL_MS,
  });
}
