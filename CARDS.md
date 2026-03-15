# JOTUNN-LOL — Bento Grid Cards

Master reference for every card on the dashboard. Each card is categorized by data flow, sized for the bento grid, and phased for implementation.

---

## Data Flow

```
                     ┌─────────────────┐
                     │  Sui GraphQL    │
                     │  (poll 30s)     │
                     └───────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐  ┌───────────┐  ┌───────────┐
        │ READ     │  │ Event     │  │ Frontier  │
        │ CARDS    │  │ Poller    │  │ Datahub   │
        │ (live)   │  │ (diff)    │  │ API       │
        └──────────┘  └─────┬─────┘  └─────┬─────┘
                            │              │
                            ▼              │
                     ┌─────────────┐       │
                     │ SpacetimeDB │◄──────┘
                     │ (persist)   │
                     └──────┬──────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
        ┌──────────┐  ┌───────────┐  ┌───────────┐
        │ UPDATED  │  │ REACTION  │  │ External  │
        │ CARDS    │  │ CARDS     │  │ APIs      │
        │ (history)│  │ (status)  │  │ (fire)    │
        └──────────┘  └───────────┘  └───────────┘
```

### Card Types

| Type | Description | Persistence |
|------|-------------|-------------|
| **READ** | Current-state snapshot. Re-fetched every poll cycle. No history needed. | None |
| **UPDATED** | Accumulates state over time. Event-driven. Shows trends, counts, histories. | SpacetimeDB |
| **REACTION** | Triggered by events. Fires side effects (APIs, sounds, media). Card shows a log of actions taken. | SpacetimeDB (log) |

### Priority Tiers

| Tier | Meaning |
|------|---------|
| **P0** | MVP -- build first, core dashboard |
| **P1** | v2 -- strong features, build after MVP works |
| **P2** | Stretch -- impressive but not essential |
| **P3** | Dream -- aspirational, hackathon bonus |

---

## READ Cards

Live data pulled directly from Sui GraphQL or Frontier Datahub API on each poll cycle. No persistence needed.

---

### 1. Character Hero

- **Type**: READ
- **Size**: 2x1
- **Priority**: P0
- **Data source**: `useCharacter` hook → `CHARACTER_QUERY` (Sui GraphQL)
- **Triggers**: Poll every 30s
- **Description**: The main hero card. Shows Jotunn's name, tribe (with tag from Datahub), wallet address, character ID, object version, tenant, dynamic field count, and Suiscan links.
- **Visual notes**: Large name, tribe badge, stat badges row, monospace addresses.

---

### 2. Tribe Detail

- **Type**: READ
- **Size**: 1x1
- **Priority**: P0
- **Data source**: `getTribeInfo()` → Frontier Datahub `/v2/tribes/{id}`
- **Triggers**: On character load (staleTime: Infinity, cached)
- **Description**: Tribe name, short tag, tax rate, description, tribe URL. Pulled from Datahub using the on-chain `tribe_id`.
- **Visual notes**: Compact info block. Could merge into Character Hero as a sub-section (currently does).

---

### 3. Owned Objects

- **Type**: READ
- **Size**: 1x1
- **Priority**: P0
- **Data source**: `useOwnedObjects` hook → `OWNED_OBJECTS_QUERY` (Sui GraphQL), filtered client-side by `WORLD_PACKAGE_ID`
- **Triggers**: Poll every 30s
- **Description**: All world-package objects owned by Jotunn's wallet. Shows object address, type name, version, and Suiscan link for each.
- **Visual notes**: Scrollable card grid. Type tag badges.

---

### 4. Assembly Status Panel

- **Type**: READ
- **Size**: 2x1
- **Priority**: P0
- **Data source**: `useOwnedObjects` hook, filtered to assembly types (Smart Gate, SSU, Turret, Network Node)
- **Triggers**: Poll every 30s
- **Description**: All of Jotunn's assemblies with their current on-chain status (online/offline/anchored). Shows type icon, name, status indicator, and energy reservation state.
- **Visual notes**: Status dots: green = online, amber = anchored but offline, red = offline/unanchored. Row layout.

---

### 5. Transaction History

- **Type**: READ
- **Size**: 1x1
- **Priority**: P0
- **Data source**: `useTransactions` hook → `TRANSACTIONS_QUERY` (Sui GraphQL, `affectedAddress` filter)
- **Triggers**: Poll every 30s
- **Description**: Recent transactions affecting Jotunn's wallet. Shows digest (linked to Suiscan), status badge (SUCCESS/FAILURE), and timestamp.
- **Visual notes**: Compact row list. Green/red status badges.

---

### 6. Fuel Gauge

- **Type**: READ
- **Size**: 1x1
- **Priority**: P0
- **Data source**: Jotunn's Network Node object → dynamic fields → fuel balance. Queried via `CHARACTER_QUERY` style object lookup on the Network Node address.
- **Triggers**: Poll every 30s
- **Description**: Current fuel level displayed as a gauge. Shows absolute fuel amount, estimated burn rate (if FuelEvent history available from SpacetimeDB), and time-until-empty estimate.
- **Visual notes**: Vertical or horizontal bar gauge. Color gradient: green > amber > red as fuel drops. Pulsing glow when critically low (<20%).

---

### 7. Inventory Snapshot

- **Type**: READ
- **Size**: 1x1
- **Priority**: P1
- **Data source**: SSU object → dynamic fields → inventory items. Item metadata enriched via `getGameTypeInfo()` from Datahub `/v2/types/{id}`.
- **Triggers**: Poll every 30s
- **Description**: Current items stored in Jotunn's Smart Storage Units. Shows item name, quantity, category, group, and icon URL.
- **Visual notes**: Item list with category color coding. Could show item icons if Datahub provides them.

---

### 8. Solar System Map

- **Type**: READ
- **Size**: 2x2
- **Priority**: P1
- **Data source**: Frontier Datahub `/v2/solarsystems` + Jotunn's location (from assembly location_hash if available)
- **Triggers**: On load + when JumpEvent fires (future)
- **Description**: 2D/3D visualization of solar systems. Jotunn's current or last-known position highlighted. Nearby systems shown with names. Jump trail overlaid when gate events are available.
- **Visual notes**: Canvas or SVG star map. Jotunn's position as a pulsing dot. System names on hover. Could use Three.js for 3D version.

---

### 9. Gate Network

- **Type**: READ
- **Size**: 1x1
- **Priority**: P2
- **Data source**: GateLinkedEvent / GateUnlinkedEvent from SpacetimeDB + owned gate objects from chain
- **Triggers**: Poll + event-driven
- **Description**: Visualization of linked gates. Shows active routes as connections between systems. Infrastructure health score (routes active / routes possible).
- **Visual notes**: Mini node graph. Animated connections. Fading connections on unlink.

---

### 10. Rival Comparison

- **Type**: READ
- **Size**: 2x1
- **Priority**: P2
- **Data source**: Second player's character + objects queried via same hooks with different address
- **Triggers**: Poll every 60s
- **Description**: Side-by-side "tale of the tape" comparing Jotunn vs a rival. Deaths, items, fuel efficiency, grid uptime, assemblies owned, tribe.
- **Visual notes**: Boxing-style comparison card. Stats bars showing who's ahead/behind.

---

### 11. Extension Registry

- **Type**: READ
- **Size**: 1x1
- **Priority**: P2
- **Data source**: ExtensionAuthorizedEvent from SpacetimeDB + assembly dynamic fields
- **Triggers**: Event-driven
- **Description**: Which extensions (custom dApp logic) are authorized on Jotunn's assemblies. Shows assembly name, extension type, and package ID.
- **Visual notes**: Simple list with extension type badges.

---

### 12. Network Node Status

- **Type**: READ
- **Size**: 1x1
- **Priority**: P1
- **Data source**: Network Node object → dynamic fields (fuel, energy production status)
- **Triggers**: Poll every 30s
- **Description**: Detailed view of Jotunn's Network Nodes. Energy production on/off, fuel remaining, efficiency settings. Complements the Fuel Gauge with node-level detail.
- **Visual notes**: Node cards with status indicators. Production rate shown as energy/tick.

---

### 13. Dynamic Fields

- **Type**: READ
- **Size**: 1x1
- **Priority**: P1
- **Data source**: `useCharacter` hook → `dynamicFields` from CHARACTER_QUERY
- **Triggers**: Poll every 30s
- **Description**: Raw dynamic field data attached to Jotunn's character object. Shows field name types, JSON values. Useful for debugging and understanding on-chain state that other cards don't cover.
- **Visual notes**: Expandable JSON tree. Monospace. Developer-oriented.

---

## UPDATED Cards

Event-driven cards backed by SpacetimeDB. Accumulate state over time to show trends, counts, and histories.

---

### 14. Event Feed

- **Type**: UPDATED
- **Size**: 2x1
- **Priority**: P0
- **Data source**: SpacetimeDB `events` table, populated by Event Poller
- **Triggers**: Any event affecting Jotunn (via `TX_EVENTS_QUERY` on wallet + character ID)
- **SpacetimeDB table**: `events`
- **Description**: Chronological log of all on-chain events related to Jotunn. Each event shows icon, human-readable label, category color, summary text, and timestamp. Expandable to show full JSON and description.
- **Visual notes**: Scrollable list. Category color coding (character=blue, combat=red, energy=amber, inventory=green). Click to expand. Newest on top.

---

### 15. Change Log

- **Type**: UPDATED
- **Size**: 1x1
- **Priority**: P0
- **Data source**: SpacetimeDB `snapshots` table, diffed against previous snapshot
- **Triggers**: Character object version change detected by poller
- **SpacetimeDB table**: `snapshots`
- **Description**: Field-level diffs on Jotunn's character object. Shows which fields changed, old value (strikethrough red), arrow, new value (green). Timestamped entries.
- **Visual notes**: Diff rows with color-coded before/after. Clear changelog button.

---

### 16. Kill Counter

- **Type**: UPDATED
- **Size**: 1x1
- **Priority**: P0
- **Data source**: SpacetimeDB `kills` table, populated when KillmailCreatedEvent involves Jotunn
- **Triggers**: `KillmailCreatedEvent` where Jotunn is victim or attacker
- **SpacetimeDB table**: `kills`
- **Description**: Total death count. Current survival streak (time since last death). Longest survival time. Shortest survival time. Deaths per day/week. Kill/death ratio if applicable.
- **Visual notes**: Big number for death count. Skull icon. Survival timer counting up in real-time. Streak indicators. Possibly a mini sparkline of deaths over time.

---

### 17. Item Ledger

- **Type**: UPDATED
- **Size**: 1x1
- **Priority**: P0
- **Data source**: SpacetimeDB `item_ledger` table, populated from ItemMintedEvent / ItemBurnedEvent / ItemDepositedEvent / ItemWithdrawnEvent
- **Triggers**: Any inventory event involving Jotunn's assemblies
- **SpacetimeDB table**: `item_ledger`
- **Description**: Running ledger of items gained vs lost. Shows item name (enriched via Datahub `/v2/types/{id}`), direction (in/out), timestamp. Net balance displayed prominently. Running totals by category.
- **Visual notes**: Two-column layout: green (gained) vs red (lost). Net balance as big number with up/down arrow. Scrollable history.

---

### 18. Fuel Trend

- **Type**: UPDATED
- **Size**: 2x1
- **Priority**: P1
- **Data source**: SpacetimeDB `fuel_readings` table, populated by periodic fuel level snapshots + FuelEvent data
- **Triggers**: FuelEvent, periodic snapshots every poll cycle
- **SpacetimeDB table**: `fuel_readings`
- **Description**: Fuel level over time as a chart. X-axis = time, Y-axis = fuel level. Shows trend line, burn rate, and projected empty time. Historical low/high markers.
- **Visual notes**: Sparkline or area chart. Red zone below 20%. Projected empty time as a dashed extension of the trend line. Zoom controls (1h, 6h, 24h, 7d).

---

### 19. Name Graveyard

- **Type**: UPDATED
- **Size**: 1x1
- **Priority**: P1
- **Data source**: SpacetimeDB `name_history` table, populated from MetadataChangedEvent where Jotunn's assemblies or character are renamed
- **Triggers**: `MetadataChangedEvent` involving Jotunn
- **SpacetimeDB table**: `name_history`
- **Description**: Scrolling list of all previous names for Jotunn's character and assemblies. Each entry shows old name (crossed out), new name, timestamp. "Identity crisis counter" at the top.
- **Visual notes**: Strikethrough styling on old names. Tombstone aesthetic. Counter badge.

---

### 20. Achievements

- **Type**: UPDATED
- **Size**: 2x1
- **Priority**: P1
- **Data source**: SpacetimeDB `achievements` table, computed from event combinations
- **Triggers**: Multiple events — achievement engine evaluates on each new event
- **SpacetimeDB table**: `achievements`
- **Description**: Trophy case of unlockable achievements. Greyed out until earned, then revealed with unlock timestamp and triggering event. Achievements:
  - "Speed Run" — died within 60s of last respawn
  - "Hoarder" — 50+ items minted without a single burn
  - "Glass Cannon" — online <5 min before grid collapse
  - "Frequent Flyer" — 10+ gate jumps in one session
  - "Phoenix" — back online within 2 min of dying
  - "The Collector" — renamed the same assembly 5+ times
  - "Blackout King" — 3+ grid collapses in one day
  - "Cockroach" — survived 24+ hours without dying
  - "Taxman" — tribe tax rate changed 3+ times
  - "Ghost Ship" — 0 fuel, 0 items, still on-chain
- **Visual notes**: Grid of achievement badges. Locked = dark/greyed. Unlocked = glowing with date. Hover for description. Toast notification on new unlock.

---

### 21. Insurance Company

- **Type**: UPDATED
- **Size**: 1x1
- **Priority**: P1
- **Data source**: Computed from SpacetimeDB `kills`, `item_ledger`, `fuel_readings` tables
- **Triggers**: Recalculated on each new kill or major event
- **SpacetimeDB table**: Derived (no dedicated table, computed from others)
- **Description**: Fake insurance agency: "Jotunn Mutual -- Insuring the Uninsurable". Shows current premium (based on death rate), total claims filed, claims denied, life expectancy trend, and the latest denial letter.
- **Visual notes**: Corporate insurance aesthetic (serif font, formal layout). Premium as a big number with percentage increase badge. Scrollable denial letters ("Claim #12 denied: death by hubris is not covered").

---

### 22. Newspaper

- **Type**: UPDATED
- **Size**: 2x2
- **Priority**: P2
- **Data source**: AI-generated from SpacetimeDB events. Uses OpenAI/Claude API to write articles from event data.
- **Triggers**: Major events (killmail, grid collapse, milestone achievements)
- **SpacetimeDB table**: `reactions` (stores generated articles)
- **Description**: "THE STILLNESS TIMES" — auto-generated newspaper front page. Headline, AI-written article, date stamp. Archive of past editions. Guest editorials from the "insurance company". Classifieds: "FOR SALE: Slightly used ship. One careless owner."
- **Visual notes**: Newspaper layout (columns, serif headline, dateline). Yellowed parchment background. Scrollable archive.

---

### 23. Spotify Playlist

- **Type**: UPDATED
- **Size**: 1x1
- **Priority**: P1
- **Data source**: Spotify API (playlist state) + SpacetimeDB `reactions` table (track additions log)
- **Triggers**: `KillmailCreatedEvent` (primary), `JumpEvent` (secondary)
- **SpacetimeDB table**: `reactions` (type: "spotify")
- **Description**: Embedded Spotify playlist widget. Shows track count, last track added, and the event that triggered it. Song selection by survival time:
  - <1 min: Benny Hill / Yakety Sax
  - 1-3 min: "Another One Bites the Dust"
  - 3-5 min: "My Heart Will Go On"
  - 5-10 min: "Stayin' Alive"
  - 10+ min: "Eye of the Tiger"
- **Visual notes**: Spotify embed iframe. Track list with event tags. "Deaths soundtracked: N" counter.

---

### 24. Death Certificates

- **Type**: UPDATED
- **Size**: 1x1
- **Priority**: P2
- **Data source**: AI image generation (tombstone/certificate) triggered by `KillmailCreatedEvent`
- **Triggers**: `KillmailCreatedEvent` involving Jotunn
- **SpacetimeDB table**: `reactions` (type: "death_cert", stores image URLs)
- **Description**: Gallery of generated death certificates / tombstone images. Each shows name, survival time, cause of death (attacker info), system, timestamp. Scrollable gallery.
- **Visual notes**: Card gallery with generated images. Click to expand. Share button for X/social.

---

### 25. Prediction Pool

- **Type**: UPDATED
- **Size**: 1x1
- **Priority**: P2
- **Data source**: SpacetimeDB `predictions` table, visitor-submitted predictions
- **Triggers**: Visitor submits prediction; event resolves it
- **SpacetimeDB table**: `predictions`
- **Description**: Visitors predict: How long until next death? How many items lost today? Will the grid survive the night? Leaderboard of most accurate predictors. Mock betting — no real money.
- **Visual notes**: Prediction form. Countdown to resolution. Leaderboard table. Accuracy percentages.

---

### 26. Domino Tracker

- **Type**: UPDATED
- **Size**: 1x1
- **Priority**: P2
- **Data source**: SpacetimeDB `events` table, filtered to EnergyReleasedEvent sequences
- **Triggers**: Multiple `EnergyReleasedEvent` firing within a short window
- **SpacetimeDB table**: `events` (filtered view)
- **Description**: Cascade visualization when multiple assemblies release energy in sequence (domino effect). Shows which assemblies went dark and in what order. Timeline view.
- **Visual notes**: Horizontal timeline with falling domino icons. Animated sequence replay. Red pulse per assembly.

---

### 27. Time-Lapse Replay

- **Type**: UPDATED
- **Size**: 2x1
- **Priority**: P3
- **Data source**: SpacetimeDB `events` table (full history)
- **Triggers**: User-initiated playback
- **SpacetimeDB table**: `events` (read-only replay)
- **Description**: Replay an entire session at 10x/50x/100x speed with all visual effects firing in sequence. Export as video for social media. Scrub bar to jump to specific moments.
- **Visual notes**: Video player UI. Play/pause/speed controls. Scrub bar with event markers. All card animations fire during replay.

---

## REACTION Cards

Side-effect cards that fire external actions when events occur. The card itself shows a log/status of reactions taken.

---

### 28. Webhook Bus

- **Type**: REACTION
- **Size**: 1x1
- **Priority**: P1
- **Data source**: SpacetimeDB `reactions` table (type: "webhook")
- **Triggers**: Any configured event
- **SpacetimeDB table**: `reactions`
- **Endpoint**: `POST /api/events` — public webhook registration
- **Description**: Registered webhook URLs and which events they subscribe to. Shows last fired timestamp, HTTP status, and payload preview. Anyone can register a URL and pick events. Hardware integrations connect here:
  - Philips Hue lights flash red on killmail
  - Desk LED strip pulses with fuel level
  - Raspberry Pi receipt printer for death certificates
  - Arduino buzzer for death jingle
  - WLED strip flickers on grid collapse
- **Visual notes**: Webhook list with status indicators (green/red). Last payload preview. "Register new" button. Future: ship as `@jotunn-lol/events` npm package.

---

### 29. Social Posts

- **Type**: REACTION
- **Size**: 1x1
- **Priority**: P1
- **Data source**: SpacetimeDB `reactions` table (type: "social")
- **Triggers**: Configurable — killmail, fuel low, grid collapse, milestone achievements
- **SpacetimeDB table**: `reactions`
- **APIs**: X/Twitter API, Discord webhook, Telegram Bot API
- **Description**: Log of social media posts fired by events. Shows platform, message, timestamp, and link to the post. Configurable rules for which events trigger which platforms.
- **Visual notes**: Social media post cards with platform icons. Preview of message. Link to live post. Toggle per platform.

---

### 30. Meme Generator

- **Type**: REACTION
- **Size**: 1x1
- **Priority**: P2
- **Data source**: AI image generation triggered by events
- **Triggers**: `KillmailCreatedEvent`, milestone events
- **SpacetimeDB table**: `reactions` (type: "meme")
- **Description**: Auto-generated memes from event data. Uses templates + AI to create contextual memes. Gallery of generated memes. Share buttons.
- **Visual notes**: Meme image with caption. Gallery scroll. Download/share buttons.

---

### 31. Commentary Bot

- **Type**: REACTION
- **Size**: 1x1
- **Priority**: P2
- **Data source**: AI text generation (OpenAI) + TTS (ElevenLabs / OpenAI TTS)
- **Triggers**: Any significant event
- **SpacetimeDB table**: `reactions` (type: "commentary")
- **Description**: AI sports commentator narrating events live. Latest audio clip displayed with play button. Transcript shown below. Auto-posted to X as audio snippets. Example lines:
  - "And Jotunn's fuel is dropping... he's at 15%... this could be it folks"
  - "ANOTHER KILL! That's death number 23 for the War Admiral!"
- **Visual notes**: Audio player widget. Waveform visualization. Transcript text. "Play latest" button.

---

### 32. Physical Reactions

- **Type**: REACTION
- **Size**: 1x1
- **Priority**: P3
- **Data source**: SpacetimeDB `reactions` table (type: "physical")
- **Triggers**: Milestone events (death #10, #25, #50)
- **SpacetimeDB table**: `reactions`
- **APIs**: Twilio (SMS/fax), Printful (t-shirts), pizza delivery APIs
- **Description**: Log of physical-world reactions fired. Each entry shows type (fax, pizza, t-shirt, carrier pigeon), target, timestamp, and delivery status. Mostly aspirational but the log is real.
- **Visual notes**: Delivery status tracker aesthetic. Package icons. Humorous status messages.

---

### 33. Ambient Soundscape

- **Type**: REACTION
- **Size**: 1x1
- **Priority**: P1
- **Data source**: Local state driven by current event context
- **Triggers**: Fuel level changes, killmail, grid collapse, item events
- **SpacetimeDB table**: None (client-side audio state)
- **Description**: Persistent ambient sound layer on the landing page. Sound mood shifts with game state:
  - Normal: calm space ambient, gentle hum
  - Fuel <50%: deeper bass drone
  - Fuel <20%: alarm tones, heartbeat
  - Grid collapse: silence, then emergency klaxon
  - Kill: explosion, then deathly silence, slow rebuild
  - Item minted: brief cheerful chime
- **Visual notes**: Small toggle card. Sound on/off. Current mood label. Volume slider. Equalizer visualization.

---

### 34. Hardware Status

- **Type**: REACTION
- **Size**: 1x1
- **Priority**: P3
- **Data source**: WebSocket connections from registered hardware devices
- **Triggers**: Device heartbeat + event forwarding
- **SpacetimeDB table**: `reactions` (type: "hardware")
- **Description**: Connected hardware devices dashboard. Shows device name, type, last signal, connection status. Devices register via the webhook bus and report back their status.
- **Visual notes**: Device list with connection indicators. Heartbeat pulse animation. "No devices connected" empty state.

---

## 3D Overlay Layer

Fullscreen visual effects rendered over/behind the bento grid. Not cards — they are canvas overlays triggered by events.

| Effect | Trigger | Priority | Description |
|--------|---------|----------|-------------|
| Ship Explosion | `KillmailCreatedEvent` | P1 | Three.js particle explosion. Color scales with survival time: <1 min red, 1-3 min orange, 3-5 min blue, 5+ min gold. Bigger explosion = faster death. |
| Graveyard | `KillmailCreatedEvent` | P2 | Each death adds a 3D tombstone to the scene. By death #50 it's a full cemetery. Cumulative — gets more impressive as he dies more. |
| Fuel Cylinder | `FuelEvent` | P2 | 3D cylinder gauge showing fuel level. Glows red when critical. Drains in real-time. |
| NetworkNode Power-Down | `StopEnergyProductionEvent` | P2 | 3D model of a network node with lights flickering out. Dramatic. |
| Stargate Activation | `JumpEvent` | P3 | 3D ring spinning up with particle effects when a gate jump is detected. |

---

## SpacetimeDB Schema

All UPDATED and REACTION cards are backed by SpacetimeDB tables. The poller writes events, and the frontend subscribes to changes in real-time.

### `events`

All historical on-chain events related to Jotunn.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `u64` (auto) | Primary key |
| `event_type` | `String` | Full type repr (e.g. `pkg::module::EventName`) |
| `event_type_name` | `String` | Short name (e.g. `KillmailCreatedEvent`) |
| `json_data` | `String` | Full event JSON serialized |
| `timestamp` | `String` | ISO timestamp from chain |
| `tx_digest` | `String` | Transaction digest that emitted this event |
| `module` | `String` | Emitting module name |

### `kills`

Killmail details extracted from `KillmailCreatedEvent`.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `u64` (auto) | Primary key |
| `event_id` | `u64` | FK to `events.id` |
| `victim_id` | `String` | Character ID of victim |
| `attacker_id` | `String` | Character ID of attacker (if known) |
| `timestamp` | `String` | Kill timestamp |
| `survival_time_ms` | `u64` | Time since last death or character creation |
| `loss_value` | `f64` | Estimated value of items lost (if computable) |

### `fuel_readings`

Periodic fuel level snapshots for trend charting.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `u64` (auto) | Primary key |
| `node_id` | `String` | Network Node object address |
| `fuel_level` | `f64` | Current fuel amount |
| `burn_rate` | `f64` | Estimated burn rate per epoch |
| `timestamp` | `String` | Snapshot timestamp |

### `item_ledger`

Items gained and lost, for net-worth tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `u64` (auto) | Primary key |
| `event_id` | `u64` | FK to `events.id` |
| `item_type_id` | `u64` | Datahub type ID |
| `item_name` | `String` | Resolved name from Datahub |
| `direction` | `String` | `"in"` (minted/deposited) or `"out"` (burned/withdrawn) |
| `quantity` | `u64` | Item count |
| `timestamp` | `String` | Event timestamp |

### `name_history`

Metadata change history for the Name Graveyard card.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `u64` (auto) | Primary key |
| `event_id` | `u64` | FK to `events.id` |
| `assembly_id` | `String` | Object that was renamed |
| `old_name` | `String` | Previous name |
| `new_name` | `String` | New name |
| `timestamp` | `String` | Change timestamp |

### `achievements`

Unlocked achievements computed from event combinations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `String` | Achievement slug (e.g. `speed_run`) |
| `label` | `String` | Display name |
| `description` | `String` | How to unlock |
| `unlocked_at` | `String` | ISO timestamp (empty if locked) |
| `trigger_event_id` | `u64` | FK to `events.id` that unlocked it |

### `snapshots`

Character object snapshots for change detection and diffing.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `u64` (auto) | Primary key |
| `version` | `u64` | Object version |
| `json_data` | `String` | Full JSON serialized |
| `timestamp` | `String` | Snapshot timestamp |

### `reactions`

Log of all external reactions fired (social posts, webhooks, media generation).

| Column | Type | Description |
|--------|------|-------------|
| `id` | `u64` (auto) | Primary key |
| `reaction_type` | `String` | `"webhook"`, `"social"`, `"spotify"`, `"meme"`, `"commentary"`, `"physical"`, `"death_cert"` |
| `trigger_event_id` | `u64` | FK to `events.id` that triggered this |
| `target` | `String` | Where it was sent (URL, platform, etc.) |
| `payload` | `String` | JSON of what was sent/generated |
| `status` | `String` | `"sent"`, `"failed"`, `"pending"` |
| `timestamp` | `String` | When fired |

### `predictions`

Visitor predictions for the Prediction Pool card.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `u64` (auto) | Primary key |
| `visitor_id` | `String` | Anonymous visitor identifier |
| `prediction_type` | `String` | `"next_death"`, `"items_lost_today"`, `"grid_survives"` |
| `prediction_value` | `String` | The predicted value |
| `created_at` | `String` | When prediction was made |
| `resolved_at` | `String` | When resolved (empty if pending) |
| `correct` | `bool` | Whether prediction was correct |

---

## Bento Grid Layouts

### MVP Layout (P0 cards only — 9 cards)

```
┌─────────────────────────────────┬───────────────┐
│                                 │               │
│         CHARACTER HERO          │  KILL COUNTER  │
│            (2x1)                │    (1x1)      │
│                                 │               │
├───────────────┬─────────────────┼───────────────┤
│               │                 │               │
│  FUEL GAUGE   │   ITEM LEDGER   │  EVENT FEED   │
│    (1x1)      │     (1x1)       │    (1x1)      │
│               │                 │               │
├───────────────┴─────────────────┼───────────────┤
│                                 │               │
│       ASSEMBLY STATUS           │  CHANGE LOG   │
│            (2x1)                │    (1x1)      │
│                                 │               │
├─────────────────────────────────┼───────────────┤
│                                 │               │
│       TRANSACTION HISTORY       │  OWNED OBJECTS │
│            (2x1)                │    (1x1)      │
│                                 │               │
└─────────────────────────────────┴───────────────┘
```

### v2 Layout (P0 + P1 cards — 18 cards)

```
┌─────────────────────────────────┬───────────────┐
│         CHARACTER HERO          │  KILL COUNTER  │
│            (2x1)                │    (1x1)      │
├───────────────┬─────────────────┼───────────────┤
│  FUEL GAUGE   │   ITEM LEDGER   │  EVENT FEED   │
│    (1x1)      │     (1x1)       │    (1x1)      │
├───────────────┴─────────────────┼───────────────┤
│         FUEL TREND              │  ACHIEVEMENTS  │
│            (2x1)                │    (1x1)      │
├───────────────┬─────────────────┼───────────────┤
│  ASSEMBLY     │  NETWORK NODE   │  CHANGE LOG   │
│  STATUS (1x1) │  STATUS (1x1)   │    (1x1)      │
├───────────────┼─────────────────┼───────────────┤
│  INVENTORY    │  SPOTIFY        │  INSURANCE    │
│  SNAPSHOT     │  PLAYLIST       │  COMPANY      │
│    (1x1)      │    (1x1)        │    (1x1)      │
├───────────────┼─────────────────┼───────────────┤
│  NAME         │  WEBHOOK BUS    │  SOCIAL POSTS │
│  GRAVEYARD    │    (1x1)        │    (1x1)      │
│    (1x1)      │                 │               │
├───────────────┼─────────────────┼───────────────┤
│  DYNAMIC      │  AMBIENT        │  OWNED        │
│  FIELDS       │  SOUNDSCAPE     │  OBJECTS      │
│    (1x1)      │    (1x1)        │    (1x1)      │
├───────────────┴─────────────────┼───────────────┤
│       TRANSACTION HISTORY       │  TRIBE DETAIL │
│            (2x1)                │    (1x1)      │
└─────────────────────────────────┴───────────────┘
```

### Full Layout (all cards — 34 cards + 3D overlay)

```
┌─────────────────────────────────┬───────────────┐
│         CHARACTER HERO          │  KILL COUNTER  │
│            (2x1)                │    (1x1)      │
├───────────────┬─────────────────┼───────────────┤
│  FUEL GAUGE   │   ITEM LEDGER   │  EVENT FEED   │
│    (1x1)      │     (1x1)       │    (1x1)      │
├───────────────┴─────────────────┼───────────────┤
│         FUEL TREND              │  ACHIEVEMENTS  │
│            (2x1)                │    (1x1)      │
├───────────────┬─────────────────┼───────────────┤
│  ASSEMBLY     │  NETWORK NODE   │  CHANGE LOG   │
│  STATUS       │  STATUS         │               │
├───────────────┼─────────────────┼───────────────┤
│  INVENTORY    │  SPOTIFY        │  INSURANCE    │
│  SNAPSHOT     │  PLAYLIST       │  COMPANY      │
├───────────────┼─────────────────┼───────────────┤
│  NAME         │  WEBHOOK BUS    │  SOCIAL POSTS │
│  GRAVEYARD    │                 │               │
├───────────────┼─────────────────┼───────────────┤
│  DYNAMIC      │  AMBIENT        │  OWNED        │
│  FIELDS       │  SOUNDSCAPE     │  OBJECTS      │
├───────────────┴─────────────────┼───────────────┤
│       TRANSACTION HISTORY       │  TRIBE DETAIL │
│            (2x1)                │    (1x1)      │
├─────────────────────────────────┴───────────────┤
│                                                 │
│              SOLAR SYSTEM MAP                   │
│                   (2x2)                         │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│               NEWSPAPER                         │
│                (2x2)                            │
│                                                 │
├─────────────────────────────────┬───────────────┤
│       RIVAL COMPARISON          │  GATE NETWORK │
│            (2x1)                │    (1x1)      │
├───────────────┬─────────────────┼───────────────┤
│  DEATH CERTS  │  PREDICTION     │  DOMINO       │
│               │  POOL           │  TRACKER      │
├───────────────┼─────────────────┼───────────────┤
│  MEME         │  COMMENTARY     │  EXTENSION    │
│  GENERATOR    │  BOT            │  REGISTRY     │
├───────────────┼─────────────────┼───────────────┤
│  PHYSICAL     │  HARDWARE       │               │
│  REACTIONS    │  STATUS         │               │
├───────────────┴─────────────────┼───────────────┤
│       TIME-LAPSE REPLAY         │               │
│            (2x1)                │               │
└─────────────────────────────────┴───────────────┘

┌─────────────────────────────────────────────────┐
│           3D OVERLAY LAYER (behind grid)        │
│  Ship Explosion · Graveyard · Fuel Cylinder     │
│  NetworkNode Power-Down · Stargate Activation   │
└─────────────────────────────────────────────────┘
```

---

## External API Reference

| Service | Purpose | Card(s) | Auth |
|---------|---------|---------|------|
| Spotify Web API | Add tracks to playlist, embed player | Spotify Playlist | OAuth2 PKCE |
| X/Twitter API v2 | Post tweets on events | Social Posts | OAuth2 |
| Discord Webhooks | Post to channel on events | Social Posts | Webhook URL |
| Telegram Bot API | Send messages on events | Social Posts | Bot token |
| Twilio | SMS and fax on milestones | Physical Reactions | API key |
| OpenAI API | Generate articles, commentary text | Newspaper, Commentary Bot | API key |
| ElevenLabs API | Text-to-speech for commentary | Commentary Bot | API key |
| Printful API | Print t-shirts on milestones | Physical Reactions | API key |
| DALL-E / Stability AI | Generate tombstones, memes | Death Certificates, Meme Generator | API key |
| Frontier Datahub | Game types, tribes, solar systems | Multiple READ cards | None (public) |
| Sui GraphQL | On-chain state and events | All READ cards, Event Poller | None (public) |
| SpacetimeDB | Persistent state, real-time subscriptions | All UPDATED/REACTION cards | Module token |
