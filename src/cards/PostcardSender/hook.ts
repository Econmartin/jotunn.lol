/**
 * @hook usePostcardSender
 * Sends physical postcards via Lob.com API on kill milestones.
 * Requires VITE_LOB_TEST_API_KEY (free test account at lob.com).
 *
 * In test mode: no real mail is sent; Lob returns a full preview PDF.
 * Milestone triggers: 1st kill, 5th kill, 10th kill, 25th kill.
 *
 * Postcard content:
 *   Front: "WAR ADMIRAL JOTUNN — {KILLS} CONFIRMED KILLS"
 *   Back:  Kill stats + system name + timestamp
 */

import { useKillmails } from "../../hooks/useKillmails";

export interface PostcardRecord {
  id: string;
  sentAt: number;
  milestone: number;
  previewUrl: string | null;
  status: "sent" | "error" | "test";
  error?: string;
}

const STORAGE_KEY = "jotunn-postcards";
const MILESTONES = [1, 5, 10, 25, 50];
const LOB_KEY = import.meta.env.VITE_LOB_TEST_API_KEY as string | undefined;

export function loadSentPostcards(): PostcardRecord[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); }
  catch { return []; }
}

function saveSentPostcards(records: PostcardRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export async function sendMilestonePostcard(
  killCount: number,
  to: { name: string; address_line1: string; city: string; state: string; zip: string; country: string }
): Promise<PostcardRecord> {
  const record: PostcardRecord = {
    id: `milestone-${killCount}-${Date.now()}`,
    sentAt: Date.now(),
    milestone: killCount,
    previewUrl: null,
    status: "test",
  };

  if (!LOB_KEY) {
    record.status = "error";
    record.error = "Set VITE_LOB_TEST_API_KEY to enable sending";
    return record;
  }

  try {
    const body = new URLSearchParams({
      description: `Jotunn Kill Milestone — ${killCount} kills`,
      to: JSON.stringify({ ...to }),
      from: JSON.stringify({
        name: "jotunn.lol",
        address_line1: "1 Galaxy St",
        city: "New Eden",
        state: "CA",
        zip: "94105",
        country: "US",
      }),
      front: `<html><body style="font-family:monospace;background:#000;color:#0ff;padding:40px;text-align:center">
        <h1 style="font-size:24px;letter-spacing:4px">WAR ADMIRAL JOTUNN</h1>
        <h2 style="font-size:48px;color:#f00;margin:20px 0">${killCount}</h2>
        <p style="font-size:16px">CONFIRMED KILLS</p>
        <p style="font-size:12px;opacity:0.5">jotunn.lol · EVE Frontier Stillness</p>
      </body></html>`,
      back: `<html><body style="font-family:monospace;background:#000;color:#fff;padding:30px">
        <h3>KILL MILESTONE: ${killCount}</h3>
        <p>Date: ${new Date().toUTCString()}</p>
        <p>Pilot: War Admiral Jotunn</p>
        <p>Server: Stillness (EVE Frontier)</p>
        <p style="margin-top:20px;font-size:10px;opacity:0.4">Sent automatically by jotunn.lol on milestone achievement.</p>
      </body></html>`,
      size: "4x6",
    });

    const res = await fetch("https://api.lob.com/v1/postcards", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(LOB_KEY + ":")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message ?? "Lob API error");

    record.previewUrl = json.url ?? null;
    record.status = "sent";
    record.id = json.id ?? record.id;
  } catch (e) {
    record.status = "error";
    record.error = (e as Error).message;
  }

  const existing = loadSentPostcards();
  saveSentPostcards([...existing, record]);
  return record;
}

export function usePostcardSender() {
  const { data: killData } = useKillmails();
  const killCount = killData?.kills.length ?? 0;
  const sent = loadSentPostcards();
  const sentMilestones = sent.map((r) => r.milestone);

  const nextMilestone = MILESTONES.find((m) => m > killCount) ?? null;
  const lastSent = sent.length ? sent[sent.length - 1] : null;
  const hasKey = !!LOB_KEY;

  return {
    killCount,
    nextMilestone,
    milestones: MILESTONES,
    sentMilestones,
    lastSent,
    sent,
    hasKey,
  };
}
