/**
 * @hook useCharityDonate
 * Fetches nonprofit data from Every.org's public API.
 * No API key required for basic nonprofit lookup.
 *
 * Concept: "For every kill Jotunn makes, pledge $1 to charity."
 * Shows kill count × pledge amount as the "donation meter".
 */

import { useQuery } from "@tanstack/react-query";
import { useKillmails } from "../../hooks/useKillmails";

// Default charity: Doctors Without Borders (MSF)
// Change via VITE_CHARITY_SLUG
const CHARITY_SLUG =
  (import.meta.env.VITE_CHARITY_SLUG as string | undefined) ?? "doctors-without-borders";

const PLEDGE_PER_KILL = 1; // USD per kill

export interface EveryOrgNonprofit {
  name: string;
  description: string;
  tags: string[];
  websiteUrl: string;
  profileUrl: string;
  logoUrl: string | null;
}

async function fetchNonprofit(slug: string): Promise<EveryOrgNonprofit | null> {
  try {
    const res = await fetch(`https://api.every.org/v0.2/nonprofit/${slug}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const np = json.data?.nonprofit;
    if (!np) return null;
    return {
      name: np.name ?? slug,
      description: np.descriptionLong ?? np.description ?? "",
      tags: np.tags ?? [],
      websiteUrl: np.websiteUrl ?? "",
      profileUrl: `https://www.every.org/${slug}`,
      logoUrl: np.logoUrl ?? null,
    };
  } catch {
    return null;
  }
}

export function useCharityDonate() {
  const { data: killData } = useKillmails();
  const killCount = killData?.kills.length ?? 0;

  const nonprofit = useQuery({
    queryKey: ["every-org", CHARITY_SLUG],
    queryFn: () => fetchNonprofit(CHARITY_SLUG),
    staleTime: Infinity,
    retry: 1,
  });

  return {
    nonprofit: nonprofit.data ?? null,
    isLoading: nonprofit.isLoading,
    killCount,
    pledgedAmount: killCount * PLEDGE_PER_KILL,
    pledgePerKill: PLEDGE_PER_KILL,
    donateUrl: `https://www.every.org/${CHARITY_SLUG}#donate`,
    charitySlug: CHARITY_SLUG,
  };
}
