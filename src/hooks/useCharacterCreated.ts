/**
 * Fetches the timestamp of the first on-chain transaction that touched
 * the character object (i.e. character creation date).
 */
import { useQuery } from "@tanstack/react-query";
import { graphqlQuery } from "../lib/graphql";
import { JOTUNN } from "../lib/constants";

const CREATED_QUERY = `
  query GetCharacterCreated($address: SuiAddress!) {
    transactions(first: 1, filter: { affectedObject: $address }) {
      nodes {
        effects { timestamp }
      }
    }
  }
`;

interface CreatedResult {
  transactions: { nodes: Array<{ effects: { timestamp: string } }> };
}

export function useCharacterCreated(): number | null {
  const { data } = useQuery<number | null>({
    queryKey: ["character-created", JOTUNN.characterId],
    queryFn: async () => {
      const result = await graphqlQuery<CreatedResult>(CREATED_QUERY, {
        address: JOTUNN.characterId,
      });
      const ts = result.transactions.nodes[0]?.effects?.timestamp;
      return ts ? new Date(ts).getTime() : null;
    },
    staleTime: Infinity, // creation date never changes
    refetchInterval: false,
  });
  return data ?? null;
}
