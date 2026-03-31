/**
 * Layout definition — active cards in the bento grid.
 * Stubs removed; only cards with real data sources are included.
 */

import { type ReactNode } from "react";
import { FuelGauge }        from "../cards/FuelGauge";
import { FuelTrend }        from "../cards/FuelTrend";
import { SurvivalStreak }   from "../cards/SurvivalStreak";
import { TribeChangeAlert } from "../cards/TribeChangeAlert";
import { VersionBump }      from "../cards/VersionBump";
import { SolarSystemMap }   from "../cards/SolarSystemMap";
import { TxHistory }        from "../cards/TxHistory";
import { OwnedObjects }     from "../cards/OwnedObjects";
import { SpotifyPlaylist }  from "../cards/SpotifyPlaylist";
import { CharityDonate }    from "../cards/CharityDonate";
import { PostcardSender }   from "../cards/PostcardSender";
import { CommentaryBot }    from "../cards/CommentaryBot";
import { Hub }              from "../cards/Hub";
import { Slot }             from "../cards/Slot";
import { MemeOps }          from "../cards/MemeOps";
import { Inventory }        from "../cards/Inventory";

export interface CardDef {
  id: string;
  baseFlex: number;
  component: ReactNode;
}

export type Section =
  | { type: "pair"; rows: [CardDef[], CardDef[]] }
  | { type: "pairWithTall"; tallCard: CardDef; rows: [CardDef[], CardDef[]]; tallPosition?: "left" | "right" }
  | { type: "row";  cards: CardDef[] }
  | { type: "solo"; card: CardDef };

export const SECTIONS: Section[] = [
  // ── Row: survival streak + tribe watch + version ─────────────────────────
  {
    type: "row",
    cards: [
      { id: "survival-streak",    baseFlex: 2, component: <SurvivalStreak /> },
      { id: "tribe-change-alert", baseFlex: 1, component: <TribeChangeAlert /> },
      { id: "version-bump",       baseFlex: 1, component: <VersionBump /> },
    ],
  },

  // ── Row: network node + cargo inventory + fuel trend ─────────────────────
  {
    type: "row",
    cards: [
      { id: "fuel-gauge",  baseFlex: 1, component: <FuelGauge /> },
      { id: "inventory",   baseFlex: 1, component: <Inventory /> },
      { id: "fuel-trend",  baseFlex: 2, component: <FuelTrend /> },
    ],
  },

  // ── Solo: solar system map ───────────────────────────────────────────────
  {
    type: "solo",
    card: { id: "solar-system-map", baseFlex: 3, component: <SolarSystemMap /> },
  },

  // ── Row: tribe detail + tx history + owned objects ──────────────────────
  {
    type: "row",
    cards: [
      { id: "tx-history",     baseFlex: 2, component: <TxHistory /> },
      { id: "owned-objects",  baseFlex: 2, component: <OwnedObjects /> },
    ],
  },

  // ── Pair: spotify + charity + postcard (top) / commentary (bottom) ──────
  {
    type: "pair",
    rows: [
      [
        { id: "spotify-playlist", baseFlex: 1, component: <SpotifyPlaylist /> },
        { id: "charity-donate",   baseFlex: 1, component: <CharityDonate /> },
        { id: "postcard-sender",  baseFlex: 1, component: <PostcardSender /> },
      ],
      [
        { id: "commentary-bot", baseFlex: 1, component: <CommentaryBot /> },
      ],
    ],
  },

  // ── Row: Hub + Slot + MemeOps ──────────────────────────────────────────
  {
    type: "row",
    cards: [
      { id: "hub",      baseFlex: 1, component: <Hub /> },
      { id: "slot",     baseFlex: 1, component: <Slot /> },
      { id: "meme-ops", baseFlex: 1, component: <MemeOps /> },
    ],
  },
];

export function sectionCardIds(section: Section): string[] {
  if (section.type === "pair")
    return section.rows.flat().map((c) => c.id);
  if (section.type === "pairWithTall")
    return [section.tallCard.id, ...section.rows.flat().map((c) => c.id)];
  if (section.type === "row")
    return section.cards.map((c) => c.id);
  return [section.card.id];
}

export function getAllCards(sections: Section[]): CardDef[] {
  return sections.flatMap((s) =>
    s.type === "pair"         ? s.rows.flat() :
    s.type === "pairWithTall" ? [s.tallCard, ...s.rows.flat()] :
    s.type === "row"          ? s.cards :
    [s.card]
  );
}
