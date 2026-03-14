import { useQuery } from "@tanstack/react-query";
import { graphqlQuery, CHARACTER_QUERY } from "../lib/graphql";
import { JOTUNN, POLL_INTERVAL_MS } from "../lib/constants";
import type { CharacterObject, CharacterData, DynamicField } from "../lib/types";

interface RawCharacterResult {
  object: {
    address: string;
    version: number;
    digest: string;
    asMoveObject?: {
      contents: { type: { repr: string }; json: CharacterData };
      dynamicFields: {
        nodes: DynamicField[];
      };
    };
  } | null;
}

export function useCharacter() {
  return useQuery<CharacterObject | null>({
    queryKey: ["character", JOTUNN.characterId],
    queryFn: async () => {
      const data = await graphqlQuery<RawCharacterResult>(CHARACTER_QUERY, {
        address: JOTUNN.characterId,
      });
      const obj = data.object;
      if (!obj?.asMoveObject) return null;
      return {
        address: obj.address,
        version: obj.version,
        digest: obj.digest,
        json: obj.asMoveObject.contents.json,
        dynamicFields: obj.asMoveObject.dynamicFields.nodes,
      };
    },
    refetchInterval: POLL_INTERVAL_MS,
  });
}
