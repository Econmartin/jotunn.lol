const BASE = "https://world-api-stillness.live.tech.evefrontier.com/v2";

export interface GameTypeInfo {
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
}

export interface TribeInfo {
  id: number;
  name: string;
  nameShort: string;
  description: string;
  taxRate: number;
  tribeUrl: string;
}

const typeCache = new Map<number, GameTypeInfo | null>();
const tribeCache = new Map<number, TribeInfo | null>();

export async function getGameTypeInfo(
  typeId: number,
): Promise<GameTypeInfo | null> {
  if (typeCache.has(typeId)) return typeCache.get(typeId)!;
  try {
    const res = await fetch(`${BASE}/types/${typeId}`);
    if (!res.ok) {
      typeCache.set(typeId, null);
      return null;
    }
    const data: GameTypeInfo = await res.json();
    if (!data.name) {
      typeCache.set(typeId, null);
      return null;
    }
    typeCache.set(typeId, data);
    return data;
  } catch {
    typeCache.set(typeId, null);
    return null;
  }
}

export async function getTribeInfo(
  tribeId: number,
): Promise<TribeInfo | null> {
  if (tribeCache.has(tribeId)) return tribeCache.get(tribeId)!;
  try {
    const res = await fetch(`${BASE}/tribes/${tribeId}`);
    if (!res.ok) {
      tribeCache.set(tribeId, null);
      return null;
    }
    const data: TribeInfo = await res.json();
    tribeCache.set(tribeId, data);
    return data;
  } catch {
    tribeCache.set(tribeId, null);
    return null;
  }
}
