/// <reference types="@cloudflare/workers-types" />

// ── Constants ─────────────────────────────────────────────────────────────────

const SUI_GRAPHQL =
  "https://graphql.testnet.sui.io/graphql";
const WORLD_PACKAGE =
  "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c";
const CHARACTER_ID =
  "0xf2f27890d53a82558bb0a4c69680e77aeac478c851521f532077bbd0c611094a";
const NETWORK_NODE_ID =
  "0xf0a1d56c80a8b369fcbc56dd230380a222c085b6ca9725077d88ff048f696c7c";
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

const OBJECT_JSON_Q = `
  query GetObject($address: SuiAddress!) {
    object(address: $address) {
      asMoveObject { contents { json } }
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
// 1. Fetch character object → metadata.assembly_id = NetworkNode address
// 2. Fetch NetworkNode object → json.fuel.quantity (top-level, NOT dynamic fields)

type DynNode = {
  name: { json: unknown; type: { repr: string } };
  contents: { json: unknown };
};

async function fetchFuel(): Promise<number | null> {
  try {
    const nnData = await gql<{
      object: { asMoveObject: { contents: { json: Record<string, unknown> } } } | null;
    }>(OBJECT_JSON_Q, { address: NETWORK_NODE_ID });

    const fuel = nnData.object?.asMoveObject?.contents?.json?.fuel as Record<string, unknown> | undefined;
    if (!fuel?.quantity) { console.error("[snapshot] no fuel.quantity on NetworkNode"); return null; }

    const qty = parseInt(String(fuel.quantity), 10);
    return Number.isNaN(qty) ? null : qty;
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

  function toInt(v: unknown): number | null {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") { const n = parseInt(v, 10); return isNaN(n) ? null : n; }
    if (v && typeof v === "object") {
      const id = (v as Record<string, unknown>).item_id;
      if (id !== undefined) return toInt(id);
    }
    return null;
  }

  const direct = toInt(obj.solar_system_id);
  if (direct !== null) return direct;

  if (obj.location && typeof obj.location === "object") {
    const nested = toInt((obj.location as Record<string, unknown>).solar_system_id);
    if (nested !== null) return nested;
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

    // GET /api/proxy/globalgiving?projectId=10045&key=xxx
    // Proxies GlobalGiving public project API (works around CORS)
    if (url.pathname === "/api/proxy/globalgiving" && req.method === "GET") {
      const projectId = url.searchParams.get("projectId");
      const apiKey    = url.searchParams.get("key");
      if (!projectId || !apiKey) return json({ error: "missing projectId or key" }, req, 400);
      try {
        const ggRes = await fetch(
          `https://api.globalgiving.org/api/public/projectservice/projects/collection/ids?api_key=${apiKey}&projectIds=${projectId}&v=2`,
          { headers: { Accept: "application/json" } },
        );
        const data = await ggRes.json();
        return json(data, req, ggRes.ok ? 200 : 502);
      } catch (e) {
        return json({ error: String(e) }, req, 502);
      }
    }

    return new Response("Not found", { status: 404 });
  },
};
