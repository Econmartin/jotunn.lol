const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_SUI_GRAPHQL_ENDPOINT || "/testnet-graphql";

export async function graphqlQuery<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data;
}

const OBJECT_BY_ADDRESS_QUERY = `
  query GetObject($address: SuiAddress!) {
    object(address: $address) {
      address
      version
      digest
      asMoveObject {
        contents {
          type { repr }
          json
        }
        dynamicFields {
          nodes {
            name { json type { repr } }
            contents { json }
          }
        }
      }
    }
  }
`;

export const CHARACTER_QUERY = OBJECT_BY_ADDRESS_QUERY;

/** Same shape as CHARACTER_QUERY; use for any object address (e.g. Network Node). */
export const OBJECT_WITH_DYNAMIC_FIELDS_QUERY = OBJECT_BY_ADDRESS_QUERY;

export const OWNED_OBJECTS_QUERY = `
  query GetOwnedObjects($owner: SuiAddress!, $first: Int, $after: String) {
    objects(filter: { owner: $owner }, first: $first, after: $after) {
      nodes {
        address
        version
        asMoveObject {
          contents {
            json
            type { repr }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export const TRANSACTIONS_QUERY = `
  query GetTransactions($address: SuiAddress!, $first: Int, $after: String) {
    transactions(filter: { affectedAddress: $address }, first: $first, after: $after) {
      nodes {
        digest
        effects {
          status
          timestamp
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export const EVENTS_QUERY = `
  query GetEvents($module: String!, $first: Int, $after: String) {
    events(filter: { module: $module }, first: $first, after: $after) {
      nodes {
        contents {
          json
          type { repr }
        }
        timestamp
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export const TX_EVENTS_QUERY = `
  query GetTxEvents($address: SuiAddress!, $first: Int, $after: String) {
    transactions(filter: { affectedAddress: $address }, first: $first, after: $after) {
      nodes {
        digest
        effects {
          status
          timestamp
          events {
            nodes {
              contents {
                json
                type { repr }
              }
              timestamp
            }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export const OBJECT_VERSIONS_QUERY = `
  query GetObjectVersions($address: SuiAddress!, $first: Int) {
    objectVersions(address: $address, first: $first) {
      nodes {
        version
        digest
        asMoveObject {
          contents { json }
        }
      }
      pageInfo { hasNextPage }
    }
  }
`;
