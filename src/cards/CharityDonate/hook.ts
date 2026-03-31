/**
 * @hook useCharityDonate
 * Fetches project data from GlobalGiving's public API.
 * Requires VITE_GLOBAL_GIVING_API_KEY.
 *
 * Concept: each time Jotunn dies, $0.01 is pledged to charity.
 * When the pending balance reaches $10, a donation is sent (payment gateway pending).
 * Already-sent amounts are tracked in localStorage.
 */

import { useQuery } from "@tanstack/react-query";
import { useKillmails } from "../../hooks/useKillmails";

const API_KEY    = import.meta.env.VITE_GLOBAL_GIVING_API_KEY as string | undefined;
const PROJECT_ID = (import.meta.env.VITE_GLOBAL_GIVING_PROJECT_ID as string | undefined) ?? "10045";
const WORKER_URL = (import.meta.env.VITE_WORKER_URL as string | undefined) ?? "";

const PLEDGE_PER_DEATH  = 0.01; // USD per death
const SEND_THRESHOLD    = 10;   // trigger a donation once pending hits $10
const STORAGE_KEY       = "jotunn-charity-sent";

export interface GlobalGivingProject {
  id: number;
  title: string;
  summary: string;
  goal: number;
  funding: number;
  numberOfDonations: number;
  status: string;
  organizationName: string;
  projectLink: string;
  imageUrl: string | null;
  donationOptions: { amount: number; description: string }[];
}

async function fetchProject(projectId: string): Promise<GlobalGivingProject | null> {
  if (!API_KEY || !WORKER_URL) return null;
  try {
    const res = await fetch(
      `${WORKER_URL}/api/proxy/globalgiving?projectId=${projectId}&key=${API_KEY}`,
    );
    if (!res.ok) return null;
    const json = await res.json() as {
      projects?: {
        project?: Array<{
          id: number;
          title: string;
          summary?: string;
          longDescription?: string;
          goal: number;
          funding: number;
          numberOfDonations: number;
          status: string;
          organization?: { name: string };
          projectLink: string;
          image?: { imagelink?: Array<{ url: string; size: string }> };
          donationOptions?: { donationOption?: Array<{ amount: number; description: string }> };
        }>;
      };
    };
    const project = json.projects?.project?.[0];
    if (!project) return null;

    const images = project.image?.imagelink ?? [];
    const imgUrl =
      images.find((i) => i.size === "medium")?.url ??
      images.find((i) => i.size === "small")?.url ??
      images[0]?.url ?? null;

    return {
      id: project.id,
      title: project.title,
      summary: project.summary ?? project.longDescription ?? "",
      goal: project.goal,
      funding: project.funding,
      numberOfDonations: project.numberOfDonations,
      status: project.status,
      organizationName: project.organization?.name ?? "",
      projectLink: project.projectLink,
      imageUrl: imgUrl,
      donationOptions: project.donationOptions?.donationOption ?? [],
    };
  } catch {
    return null;
  }
}

// ── Persistence ───────────────────────────────────────────────────────────────

function loadSentAmount(): number {
  try { return parseFloat(localStorage.getItem(STORAGE_KEY) ?? "0") || 0; }
  catch { return 0; }
}

export function useCharityDonate() {
  const { data: killData } = useKillmails();
  const deathCount = killData?.deaths.length ?? 0;

  const { data: project, isLoading } = useQuery({
    queryKey: ["globalgiving-project", PROJECT_ID],
    queryFn: () => fetchProject(PROJECT_ID),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!API_KEY && !!WORKER_URL,
  });

  const totalPledged  = parseFloat((deathCount * PLEDGE_PER_DEATH).toFixed(2));
  const sentAmount    = loadSentAmount();
  const pendingAmount = parseFloat(Math.max(0, totalPledged - sentAmount).toFixed(2));
  const readyToSend   = pendingAmount >= SEND_THRESHOLD;
  const fundingPct    = project ? Math.min(100, Math.round((project.funding / project.goal) * 100)) : null;

  return {
    project: project ?? null,
    isLoading,
    hasKey: !!API_KEY,
    deathCount,
    totalPledged,
    sentAmount,
    pendingAmount,
    pledgePerDeath: PLEDGE_PER_DEATH,
    sendThreshold: SEND_THRESHOLD,
    readyToSend,
    projectId: PROJECT_ID,
    fundingPct,
  };
}
