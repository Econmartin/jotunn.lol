/**
 * @hook useTribeChangeAlert
 * Watches tribe_id on the character object.
 * On first load with empty localStorage, seeds history from objectVersions
 * so past tribe changes (already happened before tracking began) are visible.
 * On each poll, compares current tribe_id to localStorage and flags changes.
 */

import { useEffect, useRef, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCharacter } from "../../hooks/useCharacter";
import { getTribeInfo } from "../../lib/datahub";
import { graphqlQuery } from "../../lib/graphql";
import { JOTUNN } from "../../lib/constants";

const STORAGE_KEY = "jotunn-tribe-history";
const SEED_VERSION_KEY = "jotunn-tribe-seed-v";
const SEED_VERSION = "2"; // bump to force re-seed

interface TribeRecord {
  tribeId: number;
  detectedAt: number; // ms timestamp
}

function loadHistory(): TribeRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveHistory(h: TribeRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(h.slice(-20)));
}

// ── Seed from objectVersions on first session ─────────────────────────────────

interface CharacterVersionsPage {
  objectVersions: {
    nodes: Array<{
      version: number;
      asMoveObject: {
        contents: { json: { tribe_id: number } };
      } | null;
    }>;
  };
}

const VERSIONS_QUERY = `
  query GetCharacterVersions($address: SuiAddress!, $first: Int) {
    objectVersions(address: $address, first: $first) {
      nodes {
        version
        asMoveObject { contents { json } }
      }
    }
  }
`;

async function seedTribeHistoryFromChain(): Promise<void> {
  try {
    const result = await graphqlQuery<CharacterVersionsPage>(VERSIONS_QUERY, {
      address: JOTUNN.characterId,
      first: 50,
    });

    // Sort ascending (oldest first) — objectVersions returns newest first
    const nodes = [...result.objectVersions.nodes]
      .filter((n) => n.asMoveObject !== null)
      .sort((a, b) => a.version - b.version);

    const history: TribeRecord[] = [];
    for (const node of nodes) {
      const tribeId = node.asMoveObject?.contents?.json?.tribe_id;
      if (typeof tribeId !== "number") continue;
      const last = history[history.length - 1];
      if (!last || last.tribeId !== tribeId) {
        // Estimate timestamp: spread changes roughly 1 day apart going backwards
        const daysAgo = (nodes.length - history.length) * 24 * 3600 * 1000;
        history.push({ tribeId, detectedAt: Date.now() - daysAgo });
      }
    }

    if (history.length > 0) saveHistory(history);
  } catch {
    // Silently ignore — fresh tracking starts from current poll
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useTribeChangeAlert() {
  const { data: character } = useCharacter();
  const currentTribeId = character?.json.tribe_id ?? JOTUNN.tribeId;

  // Seed from chain once (or when SEED_VERSION bumps).
  // Uses useState so setting seedReady=true triggers a re-render and the
  // useMemo below reads the freshly-written localStorage data.
  const [seedReady, setSeedReady] = useState(false);
  const seedRanRef = useRef(false);
  useEffect(() => {
    if (seedRanRef.current) return;
    seedRanRef.current = true;
    if (localStorage.getItem(SEED_VERSION_KEY) !== SEED_VERSION) {
      localStorage.removeItem(STORAGE_KEY); // wipe stale cache
      seedTribeHistoryFromChain().then(() => {
        localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
        setSeedReady(true); // re-render to pick up seeded data
      });
    } else {
      setSeedReady(true); // already seeded — signal ready immediately
    }
  }, []);

  // Persist when tribe_id changes between polls
  useEffect(() => {
    if (!character) return;
    const history = loadHistory();
    const last = history[history.length - 1];
    if (!last || last.tribeId !== currentTribeId) {
      history.push({ tribeId: currentTribeId, detectedAt: Date.now() });
      saveHistory(history);
    }
  }, [character, currentTribeId]);

  // seedReady in deps ensures we re-read localStorage after async seed completes
  const history = useMemo(() => loadHistory(), [currentTribeId, seedReady]);
  const previousRecord = history.length > 1 ? history[history.length - 2] : null;
  const changed = previousRecord !== null && previousRecord.tribeId !== currentTribeId;

  const currentTribe = useQuery({
    queryKey: ["tribe", currentTribeId],
    queryFn: () => getTribeInfo(currentTribeId),
    staleTime: Infinity,
  });

  const previousTribe = useQuery({
    queryKey: ["tribe", previousRecord?.tribeId],
    queryFn: () => getTribeInfo(previousRecord!.tribeId),
    enabled: !!previousRecord,
    staleTime: Infinity,
  });

  return {
    currentTribeId,
    currentTribeName: currentTribe.data?.name ?? `Tribe ${currentTribeId}`,
    currentTribeTag: currentTribe.data?.nameShort ? `[${currentTribe.data.nameShort}]` : `#${currentTribeId}`,
    previousTribeId: previousRecord?.tribeId ?? null,
    previousTribeName: previousTribe.data?.name ?? (previousRecord ? `Tribe ${previousRecord.tribeId}` : null),
    changedAt: previousRecord?.detectedAt ?? null,
    changed,
    history,
  };
}
