export interface EventMeta {
  label: string;
  description: string;
  category: EventCategory;
  icon: string;
}

export type EventCategory =
  | "player"
  | "combat"
  | "infrastructure"
  | "economy"
  | "admin";

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  player: "Players",
  combat: "Combat",
  infrastructure: "Infrastructure",
  economy: "Economy",
  admin: "Admin / Config",
};

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  player: "#7dd3fc",
  combat: "#f87171",
  infrastructure: "#a78bfa",
  economy: "#4ade80",
  admin: "#94a3b8",
};

const META: Record<string, EventMeta> = {
  CharacterCreatedEvent: {
    label: "Character Created",
    description: "A new player registered their character on-chain",
    category: "player",
    icon: "👤",
  },
  MetadataChangedEvent: {
    label: "Metadata Updated",
    description: "Name, description, or URL changed on an object",
    category: "player",
    icon: "✏️",
  },
  OwnerCapCreatedEvent: {
    label: "Ownership Minted",
    description: "An ownership capability token was created for an object",
    category: "admin",
    icon: "🔑",
  },

  StorageUnitCreatedEvent: {
    label: "Storage Unit Deployed",
    description: "A Smart Storage Unit was anchored in space",
    category: "infrastructure",
    icon: "📦",
  },
  StatusChangedEvent: {
    label: "Status Changed",
    description: "An assembly went online or offline",
    category: "infrastructure",
    icon: "🔄",
  },
  EnergyReservedEvent: {
    label: "Energy Reserved",
    description: "Energy was allocated from a network node to an assembly",
    category: "economy",
    icon: "⚡",
  },
  ItemMintedEvent: {
    label: "Items Minted",
    description: "Items were created inside a storage unit",
    category: "economy",
    icon: "🏭",
  },

  NetworkNodeCreatedEvent: {
    label: "Network Node Deployed",
    description: "A Network Node was anchored to provide energy",
    category: "infrastructure",
    icon: "🌐",
  },
  FuelEvent: {
    label: "Fuel Activity",
    description: "Fuel was deposited into or burned by a network node",
    category: "economy",
    icon: "⛽",
  },
  StartEnergyProductionEvent: {
    label: "Energy Production Started",
    description: "A network node began producing energy for connected assemblies",
    category: "infrastructure",
    icon: "🔋",
  },

  KillmailCreatedEvent: {
    label: "Kill Reported",
    description: "A structure or ship was destroyed and a killmail recorded",
    category: "combat",
    icon: "💀",
  },

  FuelEfficiencySetEvent: {
    label: "Fuel Config Changed",
    description: "Admin updated fuel efficiency parameters",
    category: "admin",
    icon: "⚙️",
  },
};

const FALLBACK: EventMeta = {
  label: "Unknown Event",
  description: "An unrecognized event type",
  category: "admin",
  icon: "❓",
};

export function getEventMeta(eventTypeName: string): EventMeta {
  return META[eventTypeName] || { ...FALLBACK, label: eventTypeName };
}

export function summarizeEvent(
  eventTypeName: string,
  json: Record<string, unknown>,
): string {
  const j = json;
  switch (eventTypeName) {
    case "CharacterCreatedEvent": {
      const key = j.key as { item_id?: string } | undefined;
      return `Player #${key?.item_id ?? "?"} joined tribe ${j.tribe_id ?? "?"}`;
    }
    case "MetadataChangedEvent":
      return `"${j.name || "(unnamed)"}" updated`;
    case "StatusChangedEvent": {
      const status = j.status as { "@variant"?: string } | undefined;
      const action = j.action as { "@variant"?: string } | undefined;
      return `${action?.["@variant"] ?? "?"} → ${status?.["@variant"] ?? "?"}`;
    }
    case "StorageUnitCreatedEvent": {
      const key = j.assembly_key as { item_id?: string } | undefined;
      return `Storage #${key?.item_id ?? "?"} deployed (capacity: ${j.max_capacity ?? "?"})`;
    }
    case "NetworkNodeCreatedEvent": {
      const key = j.assembly_key as { item_id?: string } | undefined;
      return `Node #${key?.item_id ?? "?"} deployed (max energy: ${j.max_energy_production ?? "?"})`;
    }
    case "KillmailCreatedEvent": {
      const killer = j.killer_id as { item_id?: string } | undefined;
      const victim = j.victim_id as { item_id?: string } | undefined;
      const lossType = j.loss_type as { "@variant"?: string } | undefined;
      return `#${killer?.item_id ?? "?"} killed #${victim?.item_id ?? "?"} (${lossType?.["@variant"] ?? "?"})`;
    }
    case "FuelEvent": {
      const action = j.action as { "@variant"?: string } | undefined;
      return `${action?.["@variant"] ?? "?"}: ${j.old_quantity} → ${j.new_quantity}`;
    }
    case "ItemMintedEvent": {
      const key = j.assembly_key as { item_id?: string } | undefined;
      return `${j.quantity ?? "?"}x type ${j.type_id ?? "?"} minted in #${key?.item_id ?? "?"}`;
    }
    case "EnergyReservedEvent":
      return `${j.energy_reserved ?? "?"} energy reserved (total: ${j.total_reserved_energy ?? "?"})`;
    case "StartEnergyProductionEvent":
      return `Producing ${j.current_energy_production ?? "?"} energy`;
    case "FuelEfficiencySetEvent":
      return `Fuel type ${j.fuel_type_id ?? "?"} efficiency set to ${j.efficiency ?? "?"}%`;
    default:
      return JSON.stringify(json);
  }
}
