import { useEffect, useState, useCallback } from "react";
import type { CharacterObject, ChangeEntry, FieldDiff } from "../lib/types";

const SNAPSHOT_KEY = "jotunn-snapshot";
const CHANGELOG_KEY = "jotunn-changelog";
const MAX_ENTRIES = 100;

function diffObjects(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  prefix = "",
): FieldDiff[] {
  const diffs: FieldDiff[] = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    const path = prefix ? `${prefix}.${key}` : key;
    const bVal = before[key];
    const aVal = after[key];

    if (bVal === aVal) continue;

    if (
      typeof bVal === "object" &&
      bVal !== null &&
      typeof aVal === "object" &&
      aVal !== null &&
      !Array.isArray(bVal) &&
      !Array.isArray(aVal)
    ) {
      diffs.push(
        ...diffObjects(
          bVal as Record<string, unknown>,
          aVal as Record<string, unknown>,
          path,
        ),
      );
    } else if (JSON.stringify(bVal) !== JSON.stringify(aVal)) {
      diffs.push({ path, before: bVal, after: aVal });
    }
  }

  return diffs;
}

function loadChangelog(): ChangeEntry[] {
  try {
    const raw = localStorage.getItem(CHANGELOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveChangelog(entries: ChangeEntry[]) {
  localStorage.setItem(
    CHANGELOG_KEY,
    JSON.stringify(entries.slice(0, MAX_ENTRIES)),
  );
}

export function useChangeDetector(character: CharacterObject | null | undefined) {
  const [changelog, setChangelog] = useState<ChangeEntry[]>(loadChangelog);

  useEffect(() => {
    if (!character) return;

    const currentJson = character.json as unknown as Record<string, unknown>;
    const currentStr = JSON.stringify(currentJson);

    try {
      const prevStr = localStorage.getItem(SNAPSHOT_KEY);
      if (prevStr && prevStr !== currentStr) {
        const prevJson = JSON.parse(prevStr) as Record<string, unknown>;
        const diffs = diffObjects(prevJson, currentJson);
        if (diffs.length > 0) {
          const entry: ChangeEntry = {
            timestamp: Date.now(),
            version: character.version,
            diffs,
          };
          const updated = [entry, ...loadChangelog()].slice(0, MAX_ENTRIES);
          saveChangelog(updated);
          setChangelog(updated);
        }
      }
      localStorage.setItem(SNAPSHOT_KEY, currentStr);
    } catch {
      localStorage.setItem(SNAPSHOT_KEY, currentStr);
    }
  }, [character]);

  const clearChangelog = useCallback(() => {
    localStorage.removeItem(CHANGELOG_KEY);
    setChangelog([]);
  }, []);

  return { changelog, clearChangelog };
}
