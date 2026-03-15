/// <reference types="@cloudflare/workers-types" />

// ── Constants ─────────────────────────────────────────────────────────────────

const SUI_GRAPHQL =
  "https://graphql.testnet.sui.io/graphql";
const WORLD_PACKAGE =
  "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c";
const WALLET =
  "0x80df500f7eb9873531bd0cdc684f1dd7441a846977f560ac2a2f081ec36b261b";
const LOCATION_REGISTRY =
  "0xc87dca9c6b2c95e4a0cbe1f8f9eeff50171123f176fbfdc7b49eef4824fc596b";
const JOTUNN_ITEM_ID = "2112077867";

// ── Env ───────────────────────────────────────────────────────────────────────

interface Env {
  jotunn_snapshots: D1Database;
}

// ── Sui GraphQL helper ────────────────────────────────────────────────────────

async function gql<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(SUI_GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json() as { data: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data;
}

// ── GraphQL queries ───────────────────────────────────────────────────────────

const OWNED_OBJECTS_Q = `
  query OwnedObjects($owner: SuiAddress!, $first: Int) {
    objects(filter: { owner: $owner }, first: $first) {
      nodes {
        address
        asMoveObject { contents { type { repr } } }
      }
    }
  }
`;

const DYNAMIC_FIELDS_Q = `
  query DynFields($address: SuiAddress!) {
    object(address: $address) {
      asMoveObject {
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

// ── Fuel extraction ───────────────────────────────────────────────────────────
// Mirrors FuelGauge/index.tsx logic exactly.

type DynNode = {
  name: { json: unknown; type: { repr: string } };
  contents: { json: unknown };
};

function extractFuelFromFields(nodes: DynNode[]): number | null {
  for (const f of nodes) {
    const nameStr  = JSON.stringify(f.name.json ?? "").toLowerCase();
    const typeRepr = (f.name.type.repr ?? "").toLowerCase();
    if (!nameStr.includes("fuel") && !typeRepr.includes("fuel")) continue;
    const c = f.contents.json;
    if (typeof c === "number") return c;
    if (c && typeof c === "object") {
      const obj = c as Record<string, unknown>;
      const v = obj.value ?? obj.balance ?? obj.amount;
      if (typeof v === "number") return v;
    }
  }
  return null;
}

async function fetchFuel(): Promise<number | null> {
  try {
    const owned = await gql<{
      objects: { nodes: { address: string; asMoveObject?: { contents: { type: { repr: string } } } }[] };
    }>(OWNED_OBJECTS_Q, { owner: WALLET, first: 50 });

    const nn = owned.objects.nodes.find((n) => {
      const repr = n.asMoveObject?.contents.type.repr ?? "";
      return repr.toLowerCase().includes("networknode") ||
             repr.toLowerCase().includes("network_node");
    });
    if (!nn) return null;

    const dyn = await gql<{
      object: { asMoveObject: { dynamicFields: { nodes: DynNode[] } } };
    }>(DYNAMIC_FIELDS_Q, { address: nn.address });

    return extractFuelFromFields(dyn.object.asMoveObject.dynamicFields.nodes);
  } catch (e) {
    console.error("[snapshot] fetchFuel:", e);
    return null;
  }
}

// ── Location extraction ───────────────────────────────────────────────────────
// The Location Registry has dynamic fields: one per character, keyed by item_id.
// Value shape: { solar_system_id: number } or { location: { solar_system_id } }

async function fetchLocation(): Promise<number | null> {
  try {
    const dyn = await gql<{
      object: { asMoveObject: { dynamicFields: { nodes: DynNode[] } } };
    }>(DYNAMIC_FIELDS_Q, { address: LOCATION_REGISTRY });

    const nodes = dyn.object.asMoveObject.dynamicFields.nodes;

    // First pass: find the entry whose key references Jotunn's item_id
    for (const f of nodes) {
      const nameStr = JSON.stringify(f.name.json ?? "");
      if (!nameStr.includes(JOTUNN_ITEM_ID)) continue;
      const sysId = extractSolarSystemId(f.contents.json);
      if (sysId !== null) return sysId;
    }

    // Fallback (testnet may only have 1 character): return first valid entry
    for (const f of nodes) {
      const sysId = extractSolarSystemId(f.contents.json);
      if (sysId !== null) return sysId;
    }
  } catch (e) {
    console.error("[snapshot] fetchLocation:", e);
  }
  return null;
}

function extractSolarSystemId(json: unknown): number | null {
  if (!json || typeof json !== "object") return null;
  const obj = json as Record<string, unknown>;
  if (typeof obj.solar_system_id === "number") return obj.solar_system_id;
  if (obj.location && typeof obj.location === "object") {
    const loc = obj.location as Record<string, unknown>;
    if (typeof loc.solar_system_id === "number") return loc.solar_system_id;
  }
  return null;
}

// ── Snapshot writer ───────────────────────────────────────────────────────────

async function writeSnapshot(env: Env): Promise<{ fuel: number | null; solarSystemId: number | null }> {
  const [fuel, solarSystemId] = await Promise.all([fetchFuel(), fetchLocation()]);
  await env.jotunn_snapshots.prepare(
    "INSERT INTO snapshots (ts, fuel, solar_system_id) VALUES (?, ?, ?)",
  ).bind(Date.now(), fuel, solarSystemId).run();
  console.log(`[snapshot] fuel=${fuel} system=${solarSystemId}`);
  return { fuel, solarSystemId };
}

// ── CORS helper ───────────────────────────────────────────────────────────────

function corsHeaders(req: Request): Headers {
  return new Headers({
    "Access-Control-Allow-Origin":  req.headers.get("Origin") ?? "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  });
}

function json(data: unknown, req: Request, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders(req) });
}

// ── Worker entry ──────────────────────────────────────────────────────────────

export default {
  // Cron: fires every 5 minutes per wrangler.toml
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    await writeSnapshot(env);
  },

  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(req) });
    }

    // GET /api/history/fuel?limit=N  (default 288 = last 24h at 5-min intervals)
    if (url.pathname === "/api/history/fuel" && req.method === "GET") {
      const limit = Math.min(Number(url.searchParams.get("limit") ?? 288), 2016);
      const { results } = await env.jotunn_snapshots.prepare(
        "SELECT ts, fuel FROM snapshots WHERE fuel IS NOT NULL ORDER BY ts DESC LIMIT ?",
      ).bind(limit).all();
      return json(results, req);
    }

    // GET /api/history/location?limit=N
    if (url.pathname === "/api/history/location" && req.method === "GET") {
      const limit = Math.min(Number(url.searchParams.get("limit") ?? 288), 2016);
      const { results } = await env.jotunn_snapshots.prepare(
        "SELECT ts, solar_system_id FROM snapshots WHERE solar_system_id IS NOT NULL ORDER BY ts DESC LIMIT ?",
      ).bind(limit).all();
      return json(results, req);
    }

    // GET /api/history/latest
    if (url.pathname === "/api/history/latest" && req.method === "GET") {
      const { results } = await env.jotunn_snapshots.prepare(
        "SELECT ts, fuel, solar_system_id FROM snapshots ORDER BY ts DESC LIMIT 1",
      ).all();
      return json(results[0] ?? null, req);
    }

    // POST /api/snapshot  — manual trigger for dev/testing
    if (url.pathname === "/api/snapshot" && req.method === "POST") {
      const result = await writeSnapshot(env);
      return json({ ok: true, ...result }, req);
    }

    return new Response("Not found", { status: 404 });
  },
};
