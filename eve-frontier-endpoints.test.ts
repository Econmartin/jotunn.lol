/**
 * EVE Frontier Endpoint Health Tests — Stillness Environment
 * Run: npm test
 *
 * Each test validates that an endpoint is reachable and returns the expected
 * shape. Auth-required endpoints are skipped (no JWT available in CI).
 */

import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WORLD_PACKAGE_ID =
  "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c";

const CHARACTER_ID =
  "0xf2f27890d53a82558bb0a4c69680e77aeac478c851521f532077bbd0c611094a";

const WALLET =
  "0x80df500f7eb9873531bd0cdc684f1dd7441a846977f560ac2a2f081ec36b261b";

const KILLMAIL_REGISTRY =
  "0x7fd9a32d0bbe7b1cfbb7140b1dd4312f54897de946c399edb21c3a12e52ce283";

const LOCATION_REGISTRY =
  "0xc87dca9c6b2c95e4a0cbe1f8f9eeff50171123f176fbfdc7b49eef4824fc596b";

const ENERGY_CONFIG =
  "0xd77693d0df5656d68b1b833e2a23cc81eb3875d8d767e7bd249adde82bdbc952";

const FUEL_CONFIG =
  "0x4fcf28a9be750d242bc5d2f324429e31176faecb5b84f0af7dff3a2a6e243550";

const GATE_CONFIG =
  "0xd6d9230faec0230c839a534843396e97f5f79bdbd884d6d5103d0125dc135827";

const SUI_GQL = "https://graphql.testnet.sui.io/graphql";
const WORLD_API = "https://world-api-stillness.live.tech.evefrontier.com";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function gql<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(SUI_GQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  expect(res.ok, `GraphQL HTTP ${res.status}`).toBe(true);
  const json = await res.json();
  expect(json.errors ?? null, `GraphQL errors: ${JSON.stringify(json.errors)}`).toBeNull();
  return json as T;
}

async function rest(path: string) {
  const res = await fetch(`${WORLD_API}${path}`);
  return { res, json: res.ok ? await res.json() : null };
}

// ---------------------------------------------------------------------------
// A. Sui GraphQL
// ---------------------------------------------------------------------------

describe("A. Sui GraphQL — Objects", () => {
  it("A1: GetObject — Jotunn character", async () => {
    const data = await gql<{ data: { object: { address: string } } }>(
      `query GetObject($address: SuiAddress!) {
         object(address: $address) {
           address version digest
           asMoveObject { contents { type { repr } json } }
         }
       }`,
      { address: CHARACTER_ID }
    );
    expect(data.data.object.address).toBe(CHARACTER_ID);
  });

  it("A2: GetOwnedObjects — wallet", async () => {
    const data = await gql<{ data: { objects: { nodes: unknown[] } } }>(
      `query GetOwnedObjects($owner: SuiAddress!, $first: Int) {
         objects(filter: { owner: $owner }, first: $first) {
           nodes { address asMoveObject { contents { type { repr } json } } }
           pageInfo { hasNextPage endCursor }
         }
       }`,
      { owner: WALLET, first: 10 }
    );
    expect(Array.isArray(data.data.objects.nodes)).toBe(true);
  });

  it("A3: GetTransactions — wallet", async () => {
    const data = await gql<{ data: { transactions: { nodes: unknown[] } } }>(
      `query GetTransactions($address: SuiAddress!, $first: Int) {
         transactions(filter: { affectedAddress: $address }, first: $first) {
           nodes { digest effects { status timestamp } }
           pageInfo { hasNextPage endCursor }
         }
       }`,
      { address: WALLET, first: 5 }
    );
    expect(Array.isArray(data.data.transactions.nodes)).toBe(true);
  });

  it("A4: GetTxEvents — character transactions with events", async () => {
    const data = await gql<{ data: { transactions: { nodes: unknown[] } } }>(
      `query GetTxEvents($address: SuiAddress!, $first: Int) {
         transactions(filter: { affectedAddress: $address }, first: $first) {
           nodes {
             digest
             effects {
               status timestamp
               events { nodes { contents { json type { repr } } timestamp } }
             }
           }
           pageInfo { hasNextPage endCursor }
         }
       }`,
      { address: CHARACTER_ID, first: 3 }
    );
    expect(Array.isArray(data.data.transactions.nodes)).toBe(true);
  });

  it("A5: GetObjectVersions — character version history", async () => {
    const data = await gql<{ data: { objectVersions: { nodes: unknown[] } } }>(
      `query GetObjectVersions($address: SuiAddress!, $first: Int) {
         objectVersions(address: $address, first: $first) {
           nodes { version digest asMoveObject { contents { json } } }
           pageInfo { hasNextPage }
         }
       }`,
      { address: CHARACTER_ID, first: 3 }
    );
    expect(Array.isArray(data.data.objectVersions.nodes)).toBe(true);
  });

  it("A6: GetKillmailObjects — on-chain killmail objects", async () => {
    const data = await gql<{ data: { objects: { nodes: unknown[] } } }>(
      `query GetKillmailObjects($first: Int) {
         objects(
           first: $first,
           filter: { type: "${WORLD_PACKAGE_ID}::killmail::Killmail" }
         ) {
           nodes { address version asMoveObject { contents { json } } }
           pageInfo { hasNextPage endCursor }
         }
       }`,
      { first: 5 }
    );
    expect(Array.isArray(data.data.objects.nodes)).toBe(true);
  });

  it("A7: GetObject — killmail registry (with dynamic fields)", async () => {
    const QUERY = `query GetObject($address: SuiAddress!) {
      object(address: $address) {
        address version
        asMoveObject {
          contents { type { repr } json }
          dynamicFields {
            nodes {
              name { json type { repr } }
              value { ... on MoveValue { json } }
            }
          }
        }
      }
    }`;
    const data = await gql<{ data: { object: { address: string } } }>(QUERY, {
      address: KILLMAIL_REGISTRY,
    });
    expect(data.data.object.address).toBe(KILLMAIL_REGISTRY);
  });

  it("A8: GetObject — location registry", async () => {
    const data = await gql<{ data: { object: { address: string } } }>(
      `query GetObject($address: SuiAddress!) {
         object(address: $address) {
           address version
           asMoveObject { contents { type { repr } json } }
         }
       }`,
      { address: LOCATION_REGISTRY }
    );
    expect(data.data.object.address).toBe(LOCATION_REGISTRY);
  });

  it("A9: GetObject — energy config", async () => {
    const data = await gql<{ data: { object: { address: string } } }>(
      `query GetObject($address: SuiAddress!) {
         object(address: $address) {
           address version
           asMoveObject { contents { type { repr } json } }
         }
       }`,
      { address: ENERGY_CONFIG }
    );
    expect(data.data.object.address).toBe(ENERGY_CONFIG);
  });

  it("A10: GetObject — fuel config", async () => {
    const data = await gql<{ data: { object: { address: string } } }>(
      `query GetObject($address: SuiAddress!) {
         object(address: $address) {
           address version
           asMoveObject { contents { type { repr } json } }
         }
       }`,
      { address: FUEL_CONFIG }
    );
    expect(data.data.object.address).toBe(FUEL_CONFIG);
  });

  it("A11: GetObject — gate config", async () => {
    const data = await gql<{ data: { object: { address: string } } }>(
      `query GetObject($address: SuiAddress!) {
         object(address: $address) {
           address version
           asMoveObject { contents { type { repr } json } }
         }
       }`,
      { address: GATE_CONFIG }
    );
    expect(data.data.object.address).toBe(GATE_CONFIG);
  });

  it("A12: GetEvents — killmail module events", async () => {
    const data = await gql<{ data: { events: { nodes: unknown[] } } }>(
      `query GetEvents($module: String!, $first: Int) {
         events(filter: { module: $module }, first: $first) {
           nodes { contents { json type { repr } } timestamp }
           pageInfo { hasNextPage endCursor }
         }
       }`,
      { module: `${WORLD_PACKAGE_ID}::killmail`, first: 10 }
    );
    expect(Array.isArray(data.data.events.nodes)).toBe(true);
  });

  it("A13: GetEvents — character module events", async () => {
    const data = await gql<{ data: { events: { nodes: unknown[] } } }>(
      `query GetEvents($module: String!, $first: Int) {
         events(filter: { module: $module }, first: $first) {
           nodes { contents { json type { repr } } timestamp }
           pageInfo { hasNextPage endCursor }
         }
       }`,
      { module: `${WORLD_PACKAGE_ID}::character`, first: 10 }
    );
    expect(Array.isArray(data.data.events.nodes)).toBe(true);
  });

  it("A14: GetOwnedObjectsByType — wallet EVE-package objects", async () => {
    const data = await gql<{ data: { objects: { nodes: unknown[] } } }>(
      `query GetOwnedObjectsByType($owner: SuiAddress!, $type: String!, $first: Int) {
         objects(filter: { owner: $owner, type: $type }, first: $first) {
           nodes { address asMoveObject { contents { json type { repr } } } }
           pageInfo { hasNextPage endCursor }
         }
       }`,
      { owner: WALLET, type: WORLD_PACKAGE_ID, first: 10 }
    );
    expect(Array.isArray(data.data.objects.nodes)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// B. World REST API (Stillness)
// ---------------------------------------------------------------------------

describe("B. World REST API — Stillness", () => {
  it("B1: GET /health", async () => {
    const { res, json } = await rest("/health");
    expect(res.status).toBe(200);
    expect(json).toHaveProperty("ok", true);
  });

  it("B2: GET /config — POD signing key", async () => {
    const { res, json } = await rest("/config");
    expect(res.status).toBe(200);
    expect(Array.isArray(json)).toBe(true);
    expect(json[0]).toHaveProperty("podPublicSigningKey");
  });

  it("B3: GET /v2/types — paginated list", async () => {
    const { res, json } = await rest("/v2/types?limit=5&offset=0");
    expect(res.status).toBe(200);
    expect(json).toHaveProperty("data");
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json).toHaveProperty("metadata.total");
  });

  it("B4: GET /v2/types/:id — USV Frigate (81609)", async () => {
    const { res, json } = await rest("/v2/types/81609");
    expect(res.status).toBe(200);
    expect(json).toHaveProperty("id", 81609);
    expect(json).toHaveProperty("name");
  });

  it("B5: GET /v2/tribes — paginated list", async () => {
    const { res, json } = await rest("/v2/tribes?limit=20&offset=0");
    expect(res.status).toBe(200);
    expect(json).toHaveProperty("data");
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it("B6: GET /v2/tribes/:id — Jotunn's tribe (98000430)", async () => {
    const { res, json } = await rest("/v2/tribes/98000430");
    expect(res.status).toBe(200);
    expect(json).toHaveProperty("id", 98000430);
    expect(json).toHaveProperty("name");
  });

  it("B7: GET /v2/ships — paginated list", async () => {
    const { res, json } = await rest("/v2/ships?limit=20&offset=0");
    expect(res.status).toBe(200);
    expect(json).toHaveProperty("data");
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    const ship = json.data[0];
    expect(ship).toHaveProperty("id");
    expect(ship).toHaveProperty("name");
    expect(ship).toHaveProperty("classId");
  });

  it("B8: GET /v2/ships/:id — ship detail", async () => {
    // Get the first ship ID from the list, then fetch its detail
    const listRes = await fetch(`${WORLD_API}/v2/ships?limit=1`);
    const list = await listRes.json();
    const firstId: number = list.data[0].id;

    const { res, json } = await rest(`/v2/ships/${firstId}`);
    expect(res.status).toBe(200);
    expect(json).toHaveProperty("id", firstId);
    expect(json).toHaveProperty("slots");
    expect(json).toHaveProperty("health");
    expect(json).toHaveProperty("damageResistances");
  });

  it("B9: GET /v2/solarsystems — paginated list", async () => {
    const { res, json } = await rest("/v2/solarsystems?limit=5&offset=0");
    expect(res.status).toBe(200);
    expect(json).toHaveProperty("data");
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json).toHaveProperty("metadata.total");
    const sys = json.data[0];
    expect(sys).toHaveProperty("id");
    expect(sys).toHaveProperty("name");
    expect(sys).toHaveProperty("location");
  });

  it("B10: GET /v2/solarsystems/:id — solar system detail", async () => {
    const listRes = await fetch(`${WORLD_API}/v2/solarsystems?limit=1`);
    const list = await listRes.json();
    const firstId: number = list.data[0].id;

    const { res, json } = await rest(`/v2/solarsystems/${firstId}`);
    expect(res.status).toBe(200);
    expect(json).toHaveProperty("id", firstId);
    expect(json).toHaveProperty("gateLinks");
    expect(Array.isArray(json.gateLinks)).toBe(true);
  });

  it("B11: GET /v2/constellations — paginated list", async () => {
    const { res, json } = await rest("/v2/constellations?limit=5&offset=0");
    expect(res.status).toBe(200);
    expect(json).toHaveProperty("data");
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it("B12: GET /v2/constellations/:id — constellation detail", async () => {
    const listRes = await fetch(`${WORLD_API}/v2/constellations?limit=1`);
    const list = await listRes.json();
    const firstId: number = list.data[0].id;

    const { res, json } = await rest(`/v2/constellations/${firstId}`);
    expect(res.status).toBe(200);
    expect(json).toHaveProperty("id", firstId);
  });

  it("B13: POST /v2/pod/verify — rejects malformed payload gracefully", async () => {
    // We don't have a live POD to verify; confirm the endpoint is up and
    // returns a structured error (not a 404/502).
    const res = await fetch(`${WORLD_API}/v2/pod/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: "not-a-real-pod" }),
    });
    // Endpoint should return 200 with { isValid: false } or 4xx — not 404/502
    expect([200, 400, 422]).toContain(res.status);
    const json = await res.json();
    expect(json).toHaveProperty("isValid", false);
  });

  it("B14: GET /v2/characters/me/jumps — 401 without auth (endpoint is up)", async () => {
    const res = await fetch(`${WORLD_API}/v2/characters/me/jumps`);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toHaveProperty("message");
  });
});
