import { useQuery } from "@tanstack/react-query";
import { graphqlQuery, TRANSACTIONS_QUERY } from "../lib/graphql";
import { JOTUNN, POLL_INTERVAL_MS } from "../lib/constants";
import type { TransactionEntry } from "../lib/types";

interface RawResult {
  transactions: {
    nodes: {
      digest: string;
      effects: { status: string; timestamp: string } | null;
    }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

export function useTransactions() {
  return useQuery<TransactionEntry[]>({
    queryKey: ["transactions", JOTUNN.wallet],
    queryFn: async (): Promise<TransactionEntry[]> => {
      const allEntries: TransactionEntry[] = [];
      let cursor: string | null = null;
      const maxPages = 3;

      for (let i = 0; i < maxPages; i++) {
        const data: RawResult = await graphqlQuery<RawResult>(TRANSACTIONS_QUERY, {
          address: JOTUNN.wallet,
          first: 20,
          ...(cursor ? { after: cursor } : {}),
        });
        for (const tx of data.transactions.nodes) {
          allEntries.push({
            digest: tx.digest,
            status: tx.effects?.status ?? "UNKNOWN",
            timestamp: tx.effects?.timestamp ?? "",
          });
        }
        if (!data.transactions.pageInfo.hasNextPage) break;
        cursor = data.transactions.pageInfo.endCursor;
      }

      return allEntries;
    },
    refetchInterval: POLL_INTERVAL_MS,
  });
}
