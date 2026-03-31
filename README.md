# jotunn.lol

Personal dashboard and DApp for CCP Jötunn — EVE Frontier player on the Stillness testnet.

Built with React + Vite, deployed on Cloudflare Pages. On-chain interactions run against Sui testnet (Stillness). A Cloudflare Worker polls chain state every 5 minutes and stores snapshots in D1.

---

## Pages

| Route | Description |
|---|---|
| `/` | Dashboard — bento grid of live character cards |
| `/hub` | JotunnHub — unlock exclusive Twitch VODs for 100 EVE each |
| `/slots` | Slotty Jötunn — provably fair on-chain slot machine |

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 6, Tailwind v4, React Router v7 |
| Wallet | `@evefrontier/dapp-kit` (Sui wallet, EVE Frontier integration) |
| Chain | Sui testnet (Stillness) via `@mysten/sui` |
| Worker | Cloudflare Worker + D1 (character snapshot, CORS proxy) |
| Hosting | Cloudflare Pages |

---

## Move Contracts

Deployed to Stillness testnet — package `0x34645a5fe6e562552ca5cb49740c226a1f7aaca3de79feb8af6a2cb8970f55b8`.

### `hub.move`
Shared `HubState` object. Viewers pay 100 EVE to unlock a video; payment goes to treasury. Unlock records are stored on-chain and persist across devices.

### `slots.move`
Shared `SlotsHouse` object with a funded EVE pool. Each spin costs 1/5/10 EVE. Outcomes are determined by `sui::random` (provably fair). Winnings paid directly to the player from the house pool.

| Symbol | Weight | 3× payout |
|---|---|---|
| Jötunn | 1/15 | 20× |
| Skull | 2/15 | 10× |
| Ship | 3/15 | 5× |
| Fuel | 4/15 | 3× |
| Star | 5/15 | 2× |
| Any pair | — | 0.5× |

---

## Cloudflare Worker

Runs at `https://jotunn-snapshot.econmartin1.workers.dev`. Triggered by cron every 5 minutes.

- Polls Sui GraphQL for Jötunn's network node (fuel, location, assembly)
- Polls killmails and tx history
- Stores snapshots in D1 (`jotunn-snapshots`)
- Proxies GlobalGiving API (CORS bypass)

---

## Dashboard Cards

| Card | Data source |
|---|---|
| Fuel Gauge | Cloudflare Worker → D1 snapshot |
| Fuel Trend | Worker snapshot history |
| Solar System Map | ef-map.com embed, reacts to kills/deaths |
| Survival Streak | Killmail data |
| Tribe Change Alert | Character snapshot |
| Tx History | Sui chain |
| Owned Objects | Sui chain |
| Spotify Playlist | Spotify API |
| Charity Donate | GlobalGiving API (project #10045 — Homes for Paws) |
| Postcard Sender | PostGrid API — mails a postcard at kill milestones |
| Commentary Bot | Giphy + character data |
| JotunnHub | Nav to `/hub` |
| Slotty Jötunn | Nav to `/slots` |

---

## Local Dev

```bash
npm install
npm run dev          # Vite dev server → localhost:5173
npm run worker:dev   # Wrangler dev → localhost:3001
```

---

## Environment Variables

Set these in Cloudflare Pages → Settings → Environment Variables.

```
VITE_EVE_WORLD_PACKAGE_ID=0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c
VITE_WORKER_URL=https://jotunn-snapshot.econmartin1.workers.dev

VITE_SPOTIFY_API_ID=
VITE_SPOTIFY_PLAYLIST_ID=
SPOTIFY_API_SECRET=          # set as secret, not plain var

VITE_GIPHY_API_KEY=

VITE_GLOBAL_GIVING_API_KEY=
VITE_GLOBAL_GIVING_PROJECT_ID=10045

VITE_POSTGRID_API_KEY=
VITE_POSTGRID_TO_NAME=
VITE_POSTGRID_TO_LINE1=
VITE_POSTGRID_TO_CITY=
VITE_POSTGRID_TO_STATE=
VITE_POSTGRID_TO_ZIP=
VITE_POSTGRID_TO_COUNTRY=

VITE_JOTUNN_PACKAGE_ID=0x34645a5fe6e562552ca5cb49740c226a1f7aaca3de79feb8af6a2cb8970f55b8
VITE_HUB_STATE_ID=0x6c78482943c2a8597102e13d4ce8a58db921f72370cc6263800b330b52a2a790
VITE_SLOTS_HOUSE_ID=0xc097a6889ba5a24902d4290e6fa937c5a92a4624924f4e63ff118b493d447ce3
VITE_TREASURY_ADDRESS=0xe2eded98fa755561a171d4405c71b2cf28a7ee9c85b123a07134a6457965b94f
```
