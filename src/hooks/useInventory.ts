/**
 * @hook useInventory
 * @description Fetches the StorageUnit (cargo hold) owned by the wallet
 *   and parses its cargo containers into a flat item list.
 *
 * Data chain:
 *   useOwnedObjects() → find typeName containing "StorageUnit"
 *   → useObjectWithDynamicFields(storageUnit.address)
 *   → each dynamicField.contents.json = cargo container
 *   → container.items.contents[] = [{key: typeId, value: {quantity, volume}}]
 *
 * Falls back to StorageUnitCreatedEvent if not found in owned objects.
 */

import { useMemo } from "react";
import { useOwnedObjects } from "./useOwnedObjects";
import { useObjectWithDynamicFields } from "./useObjectWithDynamicFields";
import { useEvents } from "./useEvents";

export interface CargoItem {
  typeId:   string;
  quantity: number;
  volume:   number;    // per unit
  totalVol: number;    // quantity × volume
  itemId:   string;
}

export interface CargoContainer {
  address:     string;
  maxCapacity: number;
  usedCapacity: number;
  items:       CargoItem[];
}

export interface StorageInfo {
  address:        string;
  status:         string | null;
  containers:     CargoContainer[];
  totalItems:     number;
  totalVolume:    number;
  maxVolume:      number;
}

function parseContainerField(
  fieldNameJson: Record<string, unknown>,
  contentsJson: Record<string, unknown> | undefined,
): CargoContainer | null {
  if (!contentsJson) return null;

  const addr = typeof fieldNameJson === "string"
    ? fieldNameJson
    : (fieldNameJson as Record<string, unknown>)?.id as string ?? JSON.stringify(fieldNameJson);

  const maxCapacity  = parseInt(String(contentsJson.max_capacity ?? "0"), 10);
  const usedCapacity = parseInt(String(contentsJson.used_capacity ?? "0"), 10);

  const itemsMap = contentsJson.items as { contents?: { key: string; value: Record<string, unknown> }[] } | undefined;
  const rawItems = itemsMap?.contents ?? [];

  const items: CargoItem[] = rawItems.map((entry) => {
    const v = entry.value;
    const vol = parseInt(String(v.volume ?? "0"), 10);
    const qty = typeof v.quantity === "number" ? v.quantity : parseInt(String(v.quantity ?? "0"), 10);
    return {
      typeId:   entry.key,
      quantity: qty,
      volume:   vol,
      totalVol: qty * vol,
      itemId:   String(v.item_id ?? ""),
    };
  });

  return { address: addr, maxCapacity, usedCapacity, items };
}

export function useInventory() {
  const { data: ownedObjects } = useOwnedObjects();
  const { data: events } = useEvents();

  // Find StorageUnit address from owned objects first
  const storageUnitAddr = useMemo(() => {
    if (ownedObjects) {
      const su = ownedObjects.find((o) =>
        o.typeName.toLowerCase().includes("storageunit") ||
        o.typeName.toLowerCase().includes("storage_unit") ||
        o.typeName.toLowerCase() === "storageunit",
      );
      if (su) return su.address;
    }
    // Fallback: StorageUnitCreatedEvent from events
    if (events) {
      const ev = events.find((e) => e.eventTypeName === "StorageUnitCreatedEvent");
      if (ev) {
        const j = ev.json as Record<string, unknown>;
        const id = (j.assembly_id ?? j.object_id ?? j.id) as string | undefined;
        if (id) return id;
      }
    }
    return null;
  }, [ownedObjects, events]);

  const { data: storageObj, isLoading, error } = useObjectWithDynamicFields(storageUnitAddr);

  const storageInfo = useMemo((): StorageInfo | null => {
    if (!storageObj) return null;

    const statusRaw = storageObj.json.status as Record<string, unknown> | string | undefined;
    const status = statusRaw
      ? (typeof statusRaw === "object" ? String((statusRaw as Record<string, unknown>)["@variant"] ?? JSON.stringify(statusRaw)) : String(statusRaw))
      : null;

    const containers: CargoContainer[] = [];
    for (const field of storageObj.dynamicFields) {
      const container = parseContainerField(
        field.name.json as Record<string, unknown>,
        field.contents?.json as Record<string, unknown> | undefined,
      );
      if (container) containers.push(container);
    }

    const allItems = containers.flatMap((c) => c.items);
    const totalVolume = allItems.reduce((a, i) => a + i.totalVol, 0);
    const maxVolume   = containers.reduce((a, c) => a + c.maxCapacity, 0);
    const totalItems  = allItems.reduce((a, i) => a + i.quantity, 0);

    return {
      address: storageObj.address,
      status,
      containers,
      totalItems,
      totalVolume,
      maxVolume,
    };
  }, [storageObj]);

  return {
    storageUnitAddr,
    storageInfo,
    isLoading,
    error,
  };
}
