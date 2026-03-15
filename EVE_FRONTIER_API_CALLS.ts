/**
 * EVE Frontier API Call Reference — Stillness Environment
 * Tested: 2026-03-15
 *
 * IMPORTANT: All 0x hex addresses must be passed as JSON variable values.
 * Do NOT interpolate them directly into GraphQL query strings — use variables.
 * When using curl, write JSON to a file and use -d @file.json to avoid shell
 * escape issues with hex strings.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WORLD_PACKAGE_ID =
  "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c";

const ADDRESSES = {
  // Jotunn character
  CHARACTER_ID:
    "0xf2f27890d53a82558bb0a4c69680e77aeac478c851521f532077bbd0c611094a",
  WALLET:
    "0x80df500f7eb9873531bd0cdc684f1dd7441a846977f560ac2a2f081ec36b261b",

  // Singleton registries / configs
  OBJECT_REGISTRY:
    "0x454a9aa3d37e1d08d3c9181239c1b683781e4087fbbbd48c935d54b6736fd05c",
  KILLMAIL_REGISTRY:
    "0x7fd9a32d0bbe7b1cfbb7140b1dd4312f54897de946c399edb21c3a12e52ce283",
  LOCATION_REGISTRY:
    "0xc87dca9c6b2c95e4a0cbe1f8f9eeff50171123f176fbfdc7b49eef4824fc596b",
  SERVER_ADDRESS_REGISTRY:
    "0xeb97b81668699672b1147c28dacb3d595534c48f4e177d3d80337dbde464f05f",
  ENERGY_CONFIG:
    "0xd77693d0df5656d68b1b833e2a23cc81eb3875d8d767e7bd249adde82bdbc952",
  FUEL_CONFIG:
    "0x4fcf28a9be750d242bc5d2f324429e31176faecb5b84f0af7dff3a2a6e243550",
  GATE_CONFIG:
    "0xd6d9230faec0230c839a534843396e97f5f79bdbd884d6d5103d0125dc135827",
  ADMIN_ACL:
    "0x8ca0e61465f94e60f9c2dadf9566edfe17aa272215d9c924793d2721b3477f93",
} as const;

const SUI_GRAPHQL_URL = "https://graphql.testnet.sui.io/graphql";
const WORLD_API_BASE =
  "https://world-api-stillness.live.tech.evefrontier.com";

// ---------------------------------------------------------------------------
// Shared GraphQL helper
// ---------------------------------------------------------------------------

async function graphqlQuery<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(SUI_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`GraphQL HTTP error: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json as T;
}

// ---------------------------------------------------------------------------
// A. Sui GraphQL Endpoints
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// A1. Get Character Object
// Returns the on-chain Character MoveObject with metadata, tribe_id,
// character_address, and owner_cap_id.
// ---------------------------------------------------------------------------
const GET_OBJECT_QUERY = `
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

async function getCharacterObject() {
  return graphqlQuery(GET_OBJECT_QUERY, {
    address: ADDRESSES.CHARACTER_ID,
  });
}

// ---------------------------------------------------------------------------
// A2. Get Owned Objects by Wallet
// Returns all objects owned by a wallet address (paginated).
// Note: The Character itself is owned by the world contract; the wallet owns
// the PlayerProfile. Use `after` cursor for pagination.
// ---------------------------------------------------------------------------
const GET_OWNED_OBJECTS_QUERY = `
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

async function getOwnedObjects(after?: string) {
  return graphqlQuery(GET_OWNED_OBJECTS_QUERY, {
    owner: ADDRESSES.WALLET,
    first: 10,
    after: after ?? null,
  });
}

// ---------------------------------------------------------------------------
// A3. Get Transactions for Wallet
// Returns recent transactions affecting a wallet address.
// ---------------------------------------------------------------------------
const GET_TRANSACTIONS_QUERY = `
  query GetTransactions($address: SuiAddress!, $first: Int) {
    transactions(filter: { affectedAddress: $address }, first: $first) {
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

async function getTransactionsForWallet() {
  return graphqlQuery(GET_TRANSACTIONS_QUERY, {
    address: ADDRESSES.WALLET,
    first: 5,
  });
}

// ---------------------------------------------------------------------------
// A4. Get Transaction Events for Character
// Returns full event payloads for all transactions affecting the character.
// Useful for reconstructing character history (creation, tribe changes, etc.)
// ---------------------------------------------------------------------------
const GET_TX_EVENTS_QUERY = `
  query GetTxEvents($address: SuiAddress!, $first: Int) {
    transactions(filter: { affectedAddress: $address }, first: $first) {
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

async function getCharacterTxEvents() {
  return graphqlQuery(GET_TX_EVENTS_QUERY, {
    address: ADDRESSES.CHARACTER_ID,
    first: 3,
  });
}

// ---------------------------------------------------------------------------
// A5. Get Object Version History
// Returns all historical versions of an object. Useful for auditing state
// changes (e.g. tribe changes show as different versions with different tribe_id).
// ---------------------------------------------------------------------------
const GET_OBJECT_VERSIONS_QUERY = `
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

async function getCharacterVersionHistory() {
  return graphqlQuery(GET_OBJECT_VERSIONS_QUERY, {
    address: ADDRESSES.CHARACTER_ID,
    first: 3,
  });
}

// ---------------------------------------------------------------------------
// A6. Get All Killmail Objects (filter by full type string)
// Returns Killmail objects on-chain. Each has killer_id, victim_id,
// loss_type (SHIP | STRUCTURE), kill_timestamp (unix seconds), solar_system_id.
// ---------------------------------------------------------------------------
const GET_KILLMAIL_OBJECTS_QUERY = `
  query GetAllKillmailObjects($first: Int) {
    objects(
      first: $first,
      filter: {
        type: "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::killmail::Killmail"
      }
    ) {
      nodes {
        address
        version
        digest
        asMoveObject {
          contents { json }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

async function getKillmailObjects(first = 5) {
  return graphqlQuery(GET_KILLMAIL_OBJECTS_QUERY, { first });
}

// ---------------------------------------------------------------------------
// A7–A13. Get Registry / Config Singleton Objects
// All use the same GET_OBJECT_QUERY with the MoveValue inline fragment for
// dynamic field values.
// ---------------------------------------------------------------------------
const GET_OBJECT_WITH_DYNFIELDS_QUERY = `
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
            value {
              ... on MoveValue {
                json
              }
            }
          }
        }
      }
    }
  }
`;

// A7. Killmail Registry
async function getKillmailRegistry() {
  return graphqlQuery(GET_OBJECT_WITH_DYNFIELDS_QUERY, {
    address: ADDRESSES.KILLMAIL_REGISTRY,
  });
}

// A8. Location Registry
// json.locations is a Move Table { id, size } — the table has 12 entries
async function getLocationRegistry() {
  return graphqlQuery(GET_OBJECT_WITH_DYNFIELDS_QUERY, {
    address: ADDRESSES.LOCATION_REGISTRY,
  });
}

// A9. Object Registry
async function getObjectRegistry() {
  return graphqlQuery(GET_OBJECT_WITH_DYNFIELDS_QUERY, {
    address: ADDRESSES.OBJECT_REGISTRY,
  });
}

// A10. Server Address Registry
// json.authorized_address is a Move VecSet { id, size: "1" }
async function getServerAddressRegistry() {
  return graphqlQuery(GET_OBJECT_WITH_DYNFIELDS_QUERY, {
    address: ADDRESSES.SERVER_ADDRESS_REGISTRY,
  });
}

// A11. Energy Config
// json.assembly_energy is a Move Table { id, size: "19" }
async function getEnergyConfig() {
  return graphqlQuery(GET_OBJECT_WITH_DYNFIELDS_QUERY, {
    address: ADDRESSES.ENERGY_CONFIG,
  });
}

// A12. Fuel Config
// json.fuel_efficiency is a Move Table { id, size: "6" }
async function getFuelConfig() {
  return graphqlQuery(GET_OBJECT_WITH_DYNFIELDS_QUERY, {
    address: ADDRESSES.FUEL_CONFIG,
  });
}

// A13. Gate Config
// json.max_distance_by_type is a Move Table { id, size: "2" }
async function getGateConfig() {
  return graphqlQuery(GET_OBJECT_WITH_DYNFIELDS_QUERY, {
    address: ADDRESSES.GATE_CONFIG,
  });
}

// ---------------------------------------------------------------------------
// A14. Get Events by Module
// Filter by "packageId::moduleName" to get all on-chain events from a module.
// killmail events: KillmailCreatedEvent (has killer_id, victim_id, loss_type, etc.)
// smart_character module returns no events — character creation events come from
// the `character` module instead.
// ---------------------------------------------------------------------------
const GET_EVENTS_BY_MODULE_QUERY = `
  query GetEvents($module: String!, $first: Int) {
    events(filter: { module: $module }, first: $first) {
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

async function getKillmailEvents(first = 10) {
  return graphqlQuery(GET_EVENTS_BY_MODULE_QUERY, {
    module: `${WORLD_PACKAGE_ID}::killmail`,
    first,
  });
}

// Also works for other modules:
async function getCharacterModuleEvents(first = 10) {
  return graphqlQuery(GET_EVENTS_BY_MODULE_QUERY, {
    module: `${WORLD_PACKAGE_ID}::character`,
    first,
  });
}

// ---------------------------------------------------------------------------
// A15. Get Owned Objects filtered by EVE package type
// Pass the package ID as the `type` filter to get all objects owned by a wallet
// that belong to any type in that package.
// ---------------------------------------------------------------------------
const GET_OWNED_OBJECTS_BY_TYPE_QUERY = `
  query GetOwnedObjectsByType($owner: SuiAddress!, $type: String!, $first: Int) {
    objects(filter: { owner: $owner, type: $type }, first: $first) {
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

async function getOwnedEveObjects() {
  return graphqlQuery(GET_OWNED_OBJECTS_BY_TYPE_QUERY, {
    owner: ADDRESSES.WALLET,
    type: WORLD_PACKAGE_ID,
    first: 10,
  });
}

// ---------------------------------------------------------------------------
// B. World REST API (Stillness)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// B1. GET /health
// ---------------------------------------------------------------------------
async function getHealth(): Promise<{ ok: boolean }> {
  const res = await fetch(`${WORLD_API_BASE}/health`);
  return res.json();
}

// ---------------------------------------------------------------------------
// B2. GET /config
// Returns the POD public signing key used to verify in-game auth tokens.
// ---------------------------------------------------------------------------
async function getConfig(): Promise<Array<{ podPublicSigningKey: string }>> {
  const res = await fetch(`${WORLD_API_BASE}/config`);
  return res.json();
}

// ---------------------------------------------------------------------------
// B3. GET /v2/types/{id}
// Returns item type metadata (ships, modules, commodities).
// Note: Character assembly IDs (e.g. 2112077867) are NOT in this database.
// Use numeric EVE item type IDs (e.g. 81609 for USV Frigate).
// ---------------------------------------------------------------------------
async function getType(typeId: number) {
  const res = await fetch(`${WORLD_API_BASE}/v2/types/${typeId}`);
  if (!res.ok) throw new Error(`type not found: ${typeId}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// B4. GET /v2/types — paginated list
// 390 total types. Supports limit/offset pagination.
// ---------------------------------------------------------------------------
async function getTypes(limit = 20, offset = 0) {
  const res = await fetch(
    `${WORLD_API_BASE}/v2/types?limit=${limit}&offset=${offset}`
  );
  return res.json() as Promise<{
    data: Array<{
      id: number;
      name: string;
      description: string;
      mass: number;
      radius: number;
      volume: number;
      portionSize: number;
      groupName: string;
      groupId: number;
      categoryName: string;
      categoryId: number;
      iconUrl: string;
    }>;
    metadata: { total: number; limit: number; offset: number };
  }>;
}

// ---------------------------------------------------------------------------
// B5. GET /v2/tribes/{id}
// Returns a tribe by numeric ID.
// ---------------------------------------------------------------------------
async function getTribe(tribeId: number) {
  const res = await fetch(`${WORLD_API_BASE}/v2/tribes/${tribeId}`);
  if (!res.ok) throw new Error(`tribe not found: ${tribeId}`);
  return res.json() as Promise<{
    id: number;
    name: string;
    nameShort: string;
    description: string;
    taxRate: number;
    tribeUrl: string;
  }>;
}

// Jotunn's tribe
async function getJotunnTribe() {
  return getTribe(98000430);
}

// ---------------------------------------------------------------------------
// B6. GET /v2/tribes — paginated list
// 6 total tribes as of 2026-03-15.
// ---------------------------------------------------------------------------
async function getTribes(limit = 20, offset = 0) {
  const res = await fetch(
    `${WORLD_API_BASE}/v2/tribes?limit=${limit}&offset=${offset}`
  );
  return res.json() as Promise<{
    data: Array<{
      id: number;
      name: string;
      nameShort: string;
      description: string;
      taxRate: number;
      tribeUrl: string;
    }>;
    metadata: { total: number; limit: number; offset: number };
  }>;
}

// ---------------------------------------------------------------------------
// B7. GET /v2/ships — paginated list
// 11 total ship types. Returns summary (no slots/physics detail).
// ---------------------------------------------------------------------------
async function getShips(limit = 20, offset = 0) {
  const res = await fetch(
    `${WORLD_API_BASE}/v2/ships?limit=${limit}&offset=${offset}`
  );
  return res.json() as Promise<{
    data: Array<{
      id: number;
      name: string;
      classId: number;
      className: string;
      description: string;
    }>;
    metadata: { total: number; limit: number; offset: number };
  }>;
}

// ---------------------------------------------------------------------------
// B8. GET /v2/ships/{id}
// Returns full ship detail including slots, health, physics, damage resistances,
// fuel capacity, cpu/powergrid output, and capacitor stats.
// ---------------------------------------------------------------------------
async function getShip(shipId: number) {
  const res = await fetch(`${WORLD_API_BASE}/v2/ships/${shipId}`);
  if (!res.ok) throw new Error(`ship not found: ${shipId}`);
  return res.json() as Promise<{
    id: number;
    name: string;
    classId: number;
    className: string;
    description: string;
    slots: { high: number; medium: number; low: number };
    health: { shield: number; armor: number; structure: number };
    physics: {
      mass: number;
      maximumVelocity: number;
      inertiaModifier: number;
      heat: { heatCapacity: number; conductance: number };
    };
    damageResistances: {
      shield: { emDamage: number; thermalDamage: number; kineticDamage: number; explosiveDamage: number };
      armor: { emDamage: number; thermalDamage: number; kineticDamage: number; explosiveDamage: number };
      structure: { emDamage: number; thermalDamage: number; kineticDamage: number; explosiveDamage: number };
    };
    fuelCapacity: number;
    cpuOutput: number;
    powergridOutput: number;
    capacitor: { capacity: number; rechargeRate: number };
  }>;
}

// ---------------------------------------------------------------------------
// B9. GET /v2/solarsystems — paginated list
// 24,502 total solar systems. Each has id, name, constellationId, regionId,
// and 3D location coordinates (large integers, meters from origin).
// ---------------------------------------------------------------------------
async function getSolarSystems(limit = 20, offset = 0) {
  const res = await fetch(
    `${WORLD_API_BASE}/v2/solarsystems?limit=${limit}&offset=${offset}`
  );
  return res.json() as Promise<{
    data: Array<{
      id: number;
      name: string;
      constellationId: number;
      regionId: number;
      location: { x: number; y: number; z: number };
    }>;
    metadata: { total: number; limit: number; offset: number };
  }>;
}

// ---------------------------------------------------------------------------
// B10. GET /v2/solarsystems/{id}
// Same fields as list item plus gateLinks array (stargate connections).
// ---------------------------------------------------------------------------
async function getSolarSystem(systemId: number) {
  const res = await fetch(`${WORLD_API_BASE}/v2/solarsystems/${systemId}`);
  if (!res.ok) throw new Error(`solar system not found: ${systemId}`);
  return res.json() as Promise<{
    id: number;
    name: string;
    constellationId: number;
    regionId: number;
    location: { x: number; y: number; z: number };
    gateLinks: number[];
  }>;
}

// ---------------------------------------------------------------------------
// B11. GET /v2/constellations — paginated list
// 24,502 total constellations (1:1 with solar systems in this dataset).
// Each entry includes nested solarSystems array.
// ---------------------------------------------------------------------------
async function getConstellations(limit = 20, offset = 0) {
  const res = await fetch(
    `${WORLD_API_BASE}/v2/constellations?limit=${limit}&offset=${offset}`
  );
  return res.json();
}

// ---------------------------------------------------------------------------
// B12. GET /v2/constellations/{id}
// Returns constellation with nested solarSystems array.
// ---------------------------------------------------------------------------
async function getConstellation(constellationId: number) {
  const res = await fetch(
    `${WORLD_API_BASE}/v2/constellations/${constellationId}`
  );
  if (!res.ok) throw new Error(`constellation not found: ${constellationId}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// B13. POST /v2/pod/verify
// Verifies a signed POD (Proof of Data) payload from the EVE Frontier client.
// The `payload` must be a valid POD JSON string (not a plain string).
// On success: { isValid: true }
// On failure: { isValid: false, error: string }
// ---------------------------------------------------------------------------
async function verifyPod(
  podPayload: string
): Promise<{ isValid: boolean; error?: string }> {
  const res = await fetch(`${WORLD_API_BASE}/v2/pod/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload: podPayload }),
  });
  return res.json();
}

// ---------------------------------------------------------------------------
// B14. GET /v2/characters/me/jumps  [REQUIRES AUTH]
// Returns jump history for the authenticated character.
// Requires: Authorization: Bearer <jwt>
// The JWT is obtained after POD verification via /v2/pod/verify.
// Without auth: 401 { "message": "missing authorization header" }
// ---------------------------------------------------------------------------
async function getMyJumps(authToken: string) {
  const res = await fetch(`${WORLD_API_BASE}/v2/characters/me/jumps`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  if (res.status === 401) throw new Error("missing authorization header");
  return res.json();
}

// ---------------------------------------------------------------------------
// Export all functions for use as a module
// ---------------------------------------------------------------------------
export {
  // GraphQL
  graphqlQuery,
  getCharacterObject,
  getOwnedObjects,
  getTransactionsForWallet,
  getCharacterTxEvents,
  getCharacterVersionHistory,
  getKillmailObjects,
  getKillmailRegistry,
  getLocationRegistry,
  getObjectRegistry,
  getServerAddressRegistry,
  getEnergyConfig,
  getFuelConfig,
  getGateConfig,
  getKillmailEvents,
  getCharacterModuleEvents,
  getOwnedEveObjects,
  // REST
  getHealth,
  getConfig,
  getType,
  getTypes,
  getTribe,
  getJotunnTribe,
  getTribes,
  getShips,
  getShip,
  getSolarSystems,
  getSolarSystem,
  getConstellations,
  getConstellation,
  verifyPod,
  getMyJumps,
  // Constants
  ADDRESSES,
  WORLD_PACKAGE_ID,
  SUI_GRAPHQL_URL,
  WORLD_API_BASE,
};
