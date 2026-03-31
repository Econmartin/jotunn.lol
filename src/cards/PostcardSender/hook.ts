/**
 * @hook usePostcardSender
 * Sends physical postcards via PostGrid API on kill milestones.
 * Requires VITE_POSTGRID_API_KEY (test or live key from postgrid.com).
 *
 * Milestone triggers: 1st kill, 5th kill, 10th kill, 25th kill, 50th kill.
 *
 * Postcard content:
 *   Front: Kill count + Jotunn branding (or custom image via VITE_POSTGRID_FRONT_IMAGE_URL)
 *   Back:  Last 10 kills with victim, type, system, date.
 *          If no kills: "Oh, you're hiding your kills, are you?"
 *
 * Address config (all required):
 *   VITE_POSTGRID_TO_NAME
 *   VITE_POSTGRID_TO_LINE1
 *   VITE_POSTGRID_TO_CITY
 *   VITE_POSTGRID_TO_STATE    (province or state code)
 *   VITE_POSTGRID_TO_ZIP
 *   VITE_POSTGRID_TO_COUNTRY  (2-letter code, e.g. "US" or "GB")
 */

import { useEffect, useRef } from "react";
import { useKillmails, type Killmail } from "../../hooks/useKillmails";

const POSTGRID_KEY   = import.meta.env.VITE_POSTGRID_API_KEY   as string | undefined;
const FRONT_IMAGE    = import.meta.env.VITE_POSTGRID_FRONT_IMAGE_URL as string | undefined;

const TO_NAME    = import.meta.env.VITE_POSTGRID_TO_NAME    as string | undefined;
const TO_LINE1   = import.meta.env.VITE_POSTGRID_TO_LINE1   as string | undefined;
const TO_CITY    = import.meta.env.VITE_POSTGRID_TO_CITY    as string | undefined;
const TO_STATE   = import.meta.env.VITE_POSTGRID_TO_STATE   as string | undefined;
const TO_ZIP     = import.meta.env.VITE_POSTGRID_TO_ZIP     as string | undefined;
const TO_COUNTRY = import.meta.env.VITE_POSTGRID_TO_COUNTRY as string | undefined;

const POSTGRID_BASE = "https://api.postgrid.com/print-mail/v1";
const STORAGE_KEY = "jotunn-postcards";
const MILESTONES  = [1, 5, 10, 25, 50];

function isLastDayOfMonth(): boolean {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return tomorrow.getMonth() !== now.getMonth();
}

function sentThisMonth(records: PostcardRecord[]): boolean {
  const now = new Date();
  return records.some((r) => {
    const d = new Date(r.sentAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PostcardRecord {
  id: string;
  sentAt: number;
  milestone: number;
  previewUrl: string | null;
  status: "sent" | "error";
  error?: string;
}

// ── Persistence ───────────────────────────────────────────────────────────────

export function loadSentPostcards(): PostcardRecord[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); }
  catch { return []; }
}

function saveSentPostcards(records: PostcardRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// ── HTML generators ───────────────────────────────────────────────────────────

function buildFrontHTML(killCount: number): string {
  if (FRONT_IMAGE) {
    return `<html><body style="margin:0;padding:0;background:#000">
      <img src="${FRONT_IMAGE}" style="width:100%;height:100%;object-fit:cover" />
    </body></html>`;
  }
  return `<html><body style="margin:0;padding:0;background:#0a0a0a;color:#fff;font-family:monospace;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;box-sizing:border-box;padding:32px">
    <div style="font-size:11px;letter-spacing:6px;color:#ff6600;text-transform:uppercase;margin-bottom:8px">EVE Frontier · Stillness</div>
    <div style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#fff;margin-bottom:4px">WAR ADMIRAL</div>
    <div style="font-size:22px;font-weight:bold;letter-spacing:6px;color:#ff6600;margin-bottom:24px">JOTUNN</div>
    <div style="font-size:72px;font-weight:bold;color:#ff2200;line-height:1">${killCount}</div>
    <div style="font-size:13px;letter-spacing:4px;color:#aaa;margin-top:8px;text-transform:uppercase">Confirmed Kill${killCount !== 1 ? "s" : ""}</div>
    <div style="font-size:9px;color:#444;margin-top:24px;letter-spacing:2px">jotunn.lol</div>
  </body></html>`;
}

function buildBackHTML(kills: Killmail[]): string {
  const recentKills = kills.slice(-10).reverse();

  const killsSection = recentKills.length === 0
    ? `<p style="color:#ff6600;font-size:14px;font-style:italic;margin:20px 0">
        "Oh, you're hiding your kills, are you?"
      </p>`
    : recentKills.map((k) => {
        const date = new Date(k.killTimestamp * 1000).toUTCString().slice(0, 16);
        return `<div style="border-bottom:1px solid #222;padding:4px 0;display:flex;justify-content:space-between;gap:8px">
          <span style="color:#ff6600">${k.lossType}</span>
          <span style="color:#aaa;flex:1;text-align:center">sys ${k.solarSystemId}</span>
          <span style="color:#666">${date}</span>
        </div>`;
      }).join("");

  return `<html><body style="margin:0;padding:24px;background:#0a0a0a;color:#fff;font-family:monospace;font-size:11px;box-sizing:border-box">
    <div style="font-size:13px;font-weight:bold;letter-spacing:3px;color:#ff6600;margin-bottom:4px">WAR ADMIRAL JOTUNN</div>
    <div style="font-size:10px;color:#555;margin-bottom:16px;letter-spacing:1px">EVE Frontier · Stillness · jotunn.lol</div>
    <div style="font-size:10px;color:#888;margin-bottom:8px;letter-spacing:2px;text-transform:uppercase">Kill Record — ${recentKills.length > 0 ? `last ${recentKills.length}` : "no kills yet"}</div>
    ${killsSection}
    <div style="margin-top:16px;font-size:9px;color:#333">Printed ${new Date().toUTCString().slice(0, 16)}</div>
  </body></html>`;
}

// ── API call ──────────────────────────────────────────────────────────────────

export async function sendMilestonePostcard(
  killCount: number,
  kills: Killmail[],
): Promise<PostcardRecord> {
  const record: PostcardRecord = {
    id: `milestone-${killCount}-${Date.now()}`,
    sentAt: Date.now(),
    milestone: killCount,
    previewUrl: null,
    status: "error",
  };

  if (!POSTGRID_KEY) {
    record.error = "Set VITE_POSTGRID_API_KEY to enable sending";
    return record;
  }
  if (!TO_NAME || !TO_LINE1 || !TO_CITY || !TO_ZIP || !TO_COUNTRY) {
    record.error = "Set VITE_POSTGRID_TO_* address env vars";
    return record;
  }

  try {
    const res = await fetch(`${POSTGRID_BASE}/postcards`, {
      method: "POST",
      headers: {
        "x-api-key": POSTGRID_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: `Jotunn Kill Milestone — ${killCount} kills`,
        size: "6x4",
        to: {
          firstName: TO_NAME.split(" ")[0],
          lastName:  TO_NAME.split(" ").slice(1).join(" ") || undefined,
          addressLine1: TO_LINE1,
          city: TO_CITY,
          ...(TO_STATE ? { provinceOrState: TO_STATE } : {}),
          postalOrZip: TO_ZIP,
          countryCode: TO_COUNTRY,
        },
        from: {
          firstName: "jotunn",
          lastName: "lol",
          addressLine1: "1 Galaxy St",
          city: "New Eden",
          provinceOrState: "CA",
          postalOrZip: "94105",
          countryCode: "US",
        },
        frontHTML: buildFrontHTML(killCount),
        backHTML: buildBackHTML(kills),
      }),
    });

    const json = await res.json() as { id?: string; url?: string; error?: { message?: string } };
    if (!res.ok) throw new Error(json.error?.message ?? `PostGrid error ${res.status}`);

    record.id         = json.id ?? record.id;
    record.previewUrl = json.url ?? null;
    record.status     = "sent";
  } catch (e) {
    record.error = (e as Error).message;
  }

  const existing = loadSentPostcards();
  saveSentPostcards([...existing, record]);
  return record;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePostcardSender() {
  const { data: killData } = useKillmails();
  const kills     = killData?.kills ?? [];
  const killCount = kills.length;
  const sent      = loadSentPostcards();
  const sentMilestones = sent.map((r) => r.milestone);
  const prevCountRef = useRef<number | null>(null);

  // Auto-send: on kill milestone OR last day of month — max once per month
  useEffect(() => {
    if (prevCountRef.current === null) {
      prevCountRef.current = killCount;
      // Check end-of-month trigger on load too
      if (isLastDayOfMonth() && !sentThisMonth(sent)) {
        sendMilestonePostcard(killCount, kills);
      }
      return;
    }

    const prevCount = prevCountRef.current;
    prevCountRef.current = killCount;

    if (sentThisMonth(sent)) return;

    // Milestone hit
    if (killCount > prevCount) {
      const hit = MILESTONES.find((m) => m <= killCount && m > prevCount);
      if (hit) { sendMilestonePostcard(killCount, kills); return; }
    }

    // Last day of month
    if (isLastDayOfMonth()) {
      sendMilestonePostcard(killCount, kills);
    }
  }, [killCount, kills, sent]);

  const nextMilestone = MILESTONES.find((m) => !sentMilestones.includes(m) && m >= killCount) ?? null;

  return {
    killCount,
    nextMilestone,
    milestones: MILESTONES,
    sentMilestones,
    sent,
    hasKey: !!POSTGRID_KEY,
    hasAddress: !!(TO_NAME && TO_LINE1 && TO_CITY && TO_ZIP && TO_COUNTRY),
  };
}
