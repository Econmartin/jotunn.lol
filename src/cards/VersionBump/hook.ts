/**
 * @hook useVersionBump
 * Watches the character's on-chain version number.
 * Stores history in localStorage; flags when a new bump is detected.
 */

import { useEffect, useMemo } from "react";
import { useCharacter } from "../../hooks/useCharacter";

const STORAGE_KEY = "jotunn-version-bumps";

interface VersionRecord {
  version: number;
  detectedAt: number;
}

function load(): VersionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(records: VersionRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(-50)));
}

export function useVersionBump() {
  const { data: character } = useCharacter();
  const currentVersion = character?.version ?? null;

  useEffect(() => {
    if (currentVersion === null) return;
    const records = load();
    const last = records[records.length - 1];
    if (!last || last.version !== currentVersion) {
      records.push({ version: currentVersion, detectedAt: Date.now() });
      save(records);
    }
  }, [currentVersion]);

  const history = useMemo(() => load(), [currentVersion]);
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const bumped = !!prev && last?.version !== prev.version;

  return {
    currentVersion,
    previousVersion: prev?.version ?? null,
    bumpedAt: bumped ? last?.detectedAt ?? null : null,
    bumped,
    history,
    totalBumps: Math.max(0, history.length - 1),
  };
}
