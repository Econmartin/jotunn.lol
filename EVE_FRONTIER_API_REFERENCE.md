# EVE Frontier API Reference

Comprehensive list of data endpoints available for the jotunn.lol app.
Status markers: ✅ Already in use | 🔲 Available, not yet used

---

## 1. Sui GraphQL API

**Endpoint:** `https://graphql.testnet.sui.io/graphql`
*(In dev, proxied via Vite as `/testnet-graphql`)*

This is the primary on-chain data source. All queries use POST with `{ query, variables }`.

### Queries — Currently In Use ✅

#### Get Single Object by Address
Returns a Move object's type, JSON fields, and dynamic fields. Used for character data and any named on-chain object (e.g. Network Node, Smart Storage Unit).

```graphql
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
```

#### Get Owned Objects by Wallet
Returns all objects owned by an address, paginated. Filtered client-side by `WORLD_PACKAGE_ID` to get only EVE game objects.

```graphql
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
```

#### Get Transactions for Address
Returns recent transactions affecting an address (wallet or character).

```graphql
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
```

#### Get Transaction Events for Address
Returns transactions + their emitted events for an address (wallet or character).

```graphql
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
```

#### Get Object Version History
Returns historical versions of a single object (useful for change detection).

```graphql
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
```

---

### Queries — Available, Not Yet Used 🔲

#### Filter Objects by Move Type
Query all on-chain objects of a specific EVE type. Useful for global state like all killmails, all smart assemblies of a type, etc.

```graphql
query GetObjectsByType($type: String!, $first: Int, $after: String) {
  objects(
    first: $first,
    after: $after,
    filter: { type: $type }
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
```

**Key type filter strings (Stillness):**
| Type | Filter String |
|------|---------------|
| Killmail | `0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c::killmail::Killmail` |
| Any EVE type | `<WORLD_PACKAGE_ID>::<module>::<TypeName>` |

#### Get Events by Module
Query emitted events from a specific contract module directly (without needing a transaction address).

```graphql
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
```

#### Get Object with Inventory Dynamic Fields (value inline)
Same as the current dynamic fields query but fetches the `value` inline using a `MoveValue` fragment — useful for storage/inventory objects where the value is the item data.

```graphql
query GetStorageInventory($address: SuiAddress!) {
  object(address: $address) {
    address
    asMoveObject {
      contents {
        type { repr }
        json
      }
      dynamicFields {
        nodes {
          name {
            type { repr }
            json
          }
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
```

---

## 2. World REST API (Stillness — Live)

**Base URL:** `https://world-api-stillness.live.tech.evefrontier.com/v2`
**Swagger UI:** `https://world-api-stillness.live.tech.evefrontier.com/docs/index.html`

**Sandbox (Utopia):** `https://world-api-utopia.uat.pub.evefrontier.com/v2`

All list endpoints support `limit` (0–1000) and `offset` for pagination.
Endpoints marked with `format=pod` return a signed POD (Provable Object Datatype) instead of plain JSON.

### Endpoints — Currently In Use ✅

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v2/types/{id}` | Game type info: name, description, mass, radius, volume, portionSize, groupName, categoryName, iconUrl |
| GET | `/v2/tribes/{id}` | Tribe info: name, nameShort, description, taxRate, tribeUrl |

### Endpoints — Available, Not Yet Used 🔲

#### Meta / System

| Method | Path | Description |
|--------|------|-------------|
| GET | `/config` | Chain config, `podPublicSigningKey` |
| GET | `/health` | API health check (`{ ok: boolean }`) |
| POST | `/v2/pod/verify` | Verify a POD signature (`{ isValid, error? }`) |

#### Types & Ships

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v2/types` | Paginated list of all game types |
| GET | `/v2/types/{id}` | Single game type by ID ✅ |
| GET | `/v2/ships` | Paginated list of all ships |
| GET | `/v2/ships/{id}` | Detailed ship info by type ID |

#### Tribes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v2/tribes` | Paginated list of all tribes |
| GET | `/v2/tribes/{id}` | Single tribe details ✅ |

#### Universe / Navigation

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v2/solarsystems` | Paginated list of all solar systems |
| GET | `/v2/solarsystems/{id}` | Detailed solar system info (location, connections, etc.) |
| GET | `/v2/constellations` | Paginated list of all constellations |
| GET | `/v2/constellations/{id}` | Constellation details |

#### Authenticated (Requires Bearer Token)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v2/characters/me/jumps` | Gate jumps made by the authenticated character |
| GET | `/v2/characters/me/jumps/{id}` | Single gate jump record (supports `format=pod`) |

---

## 3. On-Chain Registry Objects (Sui)

These are singleton Sui objects that hold global game state. Query them via the Sui GraphQL `object(address:)` query with dynamic fields.

### Stillness (Live) Registry Addresses

| Registry | Address | What It Holds |
|----------|---------|---------------|
| World Package | `0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c` | Package ID for all EVE Move module types |
| Object Registry | `0x454a9aa3d37e1d08d3c9181239c1b683781e4087fbbbd48c935d54b6736fd05c` | Global registry of all smart objects |
| Killmail Registry ✅ | `0x7fd9a32d0bbe7b1cfbb7140b1dd4312f54897de946c399edb21c3a12e52ce283` | All PvP killmails |
| Location Registry ✅ | `0xc87dca9c6b2c95e4a0cbe1f8f9eeff50171123f176fbfdc7b49eef4824fc596b` | Object → solar system location map |
| Server Address Registry | `0xeb97b81668699672b1147c28dacb3d595534c48f4e177d3d80337dbde464f05f` | Smart assembly server endpoints |
| Energy Config | `0xd77693d0df5656d68b1b833e2a23cc81eb3875d8d767e7bd249adde82bdbc952` | Energy system configuration |
| Fuel Config | `0x4fcf28a9be750d242bc5d2f324429e31176faecb5b84f0af7dff3a2a6e243550` | Fuel efficiency config |
| Gate Config | `0xd6d9230faec0230c839a534843396e97f5f79bdbd884d6d5103d0125dc135827` | Gate jump configuration |
| AdminACL | `0x8ca0e61465f94e60f9c2dadf9566edfe17aa272215d9c924793d2721b3477f93` | Access control lists |

### Utopia (Sandbox) Registry Addresses

| Registry | Address |
|----------|---------|
| World Package | `0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75` |
| Object Registry | `0xc2b969a72046c47e24991d69472afb2216af9e91caf802684514f39706d7dc57` |
| Killmail Registry | `0xa92de75fde403a6ccfcb1d5a380f79befaed9f1a2210e10f1c5867a4cd82b84e` |
| Server Address Registry | `0x9a9f2f7d1b8cf100feb532223aa6c38451edb05406323af5054f9d974555708b` |
| Location Registry | `0x62e6ec4caea639e21e4b8c3cf0104bace244b3f1760abed340cc3285905651cf` |
| Energy Config | `0x9285364e8104c04380d9cc4a001bbdfc81a554aad441c2909c2d3bd52a0c9c62` |
| Fuel Config | `0x0f354c803af170ac0d1ac9068625c6321996b3013dc67bdaf14d06f93fa1671f` |
| Gate Config | `0x69a392c514c4ca6d771d8aa8bf296d4d7a021e244e792eb6cd7a0c61047fc62b` |
| AdminACL | `0xa8655c6721967e631d8fd157bc88f7943c5e1263335c4ab553247cd3177d4e86` |

---

## 4. @evefrontier/dapp-kit GraphQL Helpers

**Package:** `@evefrontier/dapp-kit`
**GraphQL subpath:** `@evefrontier/dapp-kit/graphql`
**Docs:** `http://sui-docs.evefrontier.com/`

Pre-built query functions that wrap the Sui GraphQL API with EVE-specific types:

| Function | Description |
|----------|-------------|
| `getObjectByAddress(address)` | Single object by address |
| `getObjectWithDynamicFields(address)` | Object + dynamic fields |
| `getOwnedObjectsByType(owner, type)` | Filter wallet objects by Move type |
| `getWalletCharacters(wallet)` | Characters owned by a wallet |
| `getCharacterAndOwnedObjects(characterId)` | Character + all owned objects |
| `getSingletonObjectByType(type)` | Query a singleton (e.g. config objects) |
| `getAssemblyWithOwner(assemblyId)` | Assembly + owner info |
| `getEnergyConfig()` | Energy system config |
| `getFuelEfficiencyConfig()` | Fuel efficiency config |

**Assembly types returned by dapp-kit:**
- `Storage` — Smart Storage Unit
- `Turret` — Smart Turret
- `Manufacturing` — Smart Manufacturing Plant
- `Refinery` — Smart Refinery
- `Gate` — Smart Gate
- `NetworkNode` — Smart Network Node

---

## 5. External Explorer / Block Explorer

**Suiscan (Testnet):** `https://suiscan.xyz/testnet`

Used for linking to transaction digests and object addresses in the UI.

---

## 6. EVE Vault

**GitHub Releases:** `https://github.com/evefrontier/evevault/releases/`

Desktop app for managing EVE Frontier wallet/identity locally. Not a data API, but the source of signed POD credentials used with `/v2/pod/verify`.

---

## Quick Reference: What Data Lives Where

| Data You Want | Source |
|---------------|--------|
| Character stats / attributes | Sui GraphQL → `object(characterId)` |
| Wallet-owned game objects | Sui GraphQL → `objects(filter: { owner })` |
| Transaction history | Sui GraphQL → `transactions(filter: { affectedAddress })` |
| In-game events (fuel, combat, etc.) | Sui GraphQL → `transactions` → `effects.events` |
| All killmails (global) | Sui GraphQL → `objects(filter: { type: "...::Killmail" })` |
| Object location (solar system) | Sui GraphQL → Location Registry dynamic fields |
| Server endpoint for a smart assembly | Sui GraphQL → Server Address Registry |
| Item/type metadata (name, icon, category) | World REST API → `GET /v2/types/{id}` ✅ |
| Tribe info | World REST API → `GET /v2/tribes/{id}` ✅ |
| Ship stats | World REST API → `GET /v2/ships/{id}` |
| Solar system info | World REST API → `GET /v2/solarsystems/{id}` |
| Gate jump history (own character) | World REST API → `GET /v2/characters/me/jumps` (auth required) |
| Energy / fuel config values | Sui GraphQL → Energy/Fuel Config objects, or dapp-kit helpers |
| Smart assembly inventory contents | Sui GraphQL → `object(assemblyId)` → dynamic fields |
