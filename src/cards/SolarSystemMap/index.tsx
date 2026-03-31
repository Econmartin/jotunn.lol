/**
 * @card SolarSystemMap
 * @description EF-Map embed centred on Jotunn's last known solar system.
 *   Reacts to on-chain killmail events — zooms to death/kill location on trigger.
 *   Idle: orbit mode on the home system (30013487 — active Stillness cluster).
 *   On death: red palette, close zoom.
 *   On kill:  yellow palette, medium zoom, orbit.
 *
 * @dataflow
 *   useKillmails() → latest kill/death solar_system_id → ef-map.com/embed iframe
 *
 * Configure home system via VITE_HOME_SYSTEM_ID (default: 30013487).
 */

import { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlassCard, CardExpandedContext } from "../../components/GlassCard";
import { useKillmails } from "../../hooks/useKillmails";
import { useWorkerLatest } from "../../hooks/useWorkerLatest";
import { getSolarSystemInfo } from "../../lib/datahub";
import { MARTIAN_H } from "../../lib/constants";
const HOME_SYSTEM = (import.meta.env.VITE_HOME_SYSTEM_ID as string | undefined) ?? "30013487";

type MapMode = "idle" | "death" | "kill";

interface MapState {
  systemId: string;
  color: string;
  zoom: number;
  orbit: boolean;
  mode: MapMode;
}

function buildEmbedUrl(state: MapState): string {
  const params = new URLSearchParams({
    system: state.systemId,
    zoom: String(state.zoom),
    color: state.color,
    orbit: state.orbit ? "1" : "0",
    theme: "minimal",
    search: "false",
    routing: "false",
    controls: "false",
    labels: "true",
  });
  return `https://ef-map.com/embed?${params.toString()}`;
}

const makeIdleState = (systemId: string): MapState => ({ systemId, color: "blue", zoom: 3000, orbit: true, mode: "idle" });
const IDLE_STATE = makeIdleState(HOME_SYSTEM);
const DEATH_STATE = (sys: string): MapState => ({ systemId: sys, color: "red",    zoom: 800,  orbit: false, mode: "death" });
const KILL_STATE  = (sys: string): MapState => ({ systemId: sys, color: "yellow", zoom: 1200, orbit: true,  mode: "kill"  });

const modeBorderColor: Record<MapMode, string> = {
  idle:  "rgba(94,234,212,0.4)",
  death: "rgba(248,113,113,0.5)",
  kill:  "rgba(250,204,21,0.5)",
};

const modeButtonBorder: Record<string, string> = {
  home:  "rgba(94,234,212,0.25)",
  death: "rgba(248,113,113,0.3)",
  kill:  "rgba(250,204,21,0.3)",
};

export function SolarSystemMap() {
  const isExpanded = useContext(CardExpandedContext);
  const { data } = useKillmails();
  const { data: workerData } = useWorkerLatest();

  const workerSystemId = workerData?.solar_system_id ? String(workerData.solar_system_id) : null;

  const [mapState, setMapState] = useState<MapState>(IDLE_STATE);

  // Sync idle state to worker's latest location snapshot
  useEffect(() => {
    setMapState((prev) => {
      if (prev.mode !== "idle") return prev;
      return makeIdleState(workerSystemId ?? HOME_SYSTEM);
    });
  }, [workerSystemId]);

  const { data: systemInfo } = useQuery({
    queryKey: ["solar-system", mapState.systemId],
    queryFn: () => getSolarSystemInfo(Number(mapState.systemId)),
    staleTime: Infinity,
  });
  const systemName = systemInfo?.name ?? `System ${mapState.systemId}`;

  useEffect(() => {
    if (!data) return;

    const latestDeath = data.deaths.length
      ? [...data.deaths].sort((a, b) => b.killTimestamp - a.killTimestamp)[0]
      : null;
    const latestKill = data.kills.length
      ? [...data.kills].sort((a, b) => b.killTimestamp - a.killTimestamp)[0]
      : null;

    if (!latestDeath && !latestKill) { setMapState(makeIdleState(workerSystemId ?? HOME_SYSTEM)); return; }

    const deathTs = latestDeath?.killTimestamp ?? 0;
    const killTs  = latestKill?.killTimestamp  ?? 0;

    let t: ReturnType<typeof setTimeout>;
    if (deathTs >= killTs && latestDeath) {
      setMapState(DEATH_STATE(latestDeath.solarSystemId));
      t = setTimeout(() => setMapState(makeIdleState(workerSystemId ?? HOME_SYSTEM)), 30_000);
    } else if (latestKill) {
      setMapState(KILL_STATE(latestKill.solarSystemId));
      t = setTimeout(() => setMapState(makeIdleState(workerSystemId ?? HOME_SYSTEM)), 30_000);
    }
    return () => clearTimeout(t!);
  }, [data, workerSystemId]);

  const modeLabel: Record<MapMode, string> = {
    idle:  "Last known location",
    death: "📍 Last death location",
    kill:  "⚔️ Last kill location",
  };

  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-sm"
              style={{
                background: `hsla(${MARTIAN_H},50%,28%,0.6)`,
                border: `1px solid hsla(${MARTIAN_H},50%,50%,0.25)`,
              }}
            >
              🌌
            </div>
            <div>
              <div
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: `hsla(${MARTIAN_H},20%,65%,0.5)` }}
              >
                MAP
              </div>
              <div className="text-xs text-white/50 font-mono">{systemName}</div>
              {isExpanded && <div className="text-xs text-white/20">ef-map.com · reacts to kills/deaths · #{mapState.systemId}</div>}
            </div>
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{
              background: "rgba(0,0,0,0.3)",
              border: `1px solid ${modeBorderColor[mapState.mode]}`,
              color: modeBorderColor[mapState.mode],
            }}
          >
            {modeLabel[mapState.mode]}
          </span>
        </div>

        {/* Iframe */}
        <div className="flex-1 rounded overflow-hidden border border-white/[0.06]">
          <iframe
            key={buildEmbedUrl(mapState)}
            src={buildEmbedUrl(mapState)}
            width="100%" height="100%"
            className="border-none block"
            allow="fullscreen"
            title="EVE Frontier Solar System Map"
          />
        </div>

        {/* Manual controls (expanded) */}
        {isExpanded && (
          <div className="flex gap-1.5 mt-2 shrink-0">
            {([
              { label: "🏠 Home",       onClick: () => setMapState(makeIdleState(workerSystemId ?? HOME_SYSTEM)),  active: mapState.mode === "idle",  borderKey: "home"  },
            ] as Array<{ label: string; onClick: () => void; active: boolean; borderKey: string }>).concat(
              data?.deaths[0] ? [{ label: "💀 Last Death", onClick: () => setMapState(DEATH_STATE(data.deaths.sort((a,b)=>b.killTimestamp-a.killTimestamp)[0].solarSystemId)), active: mapState.mode === "death", borderKey: "death" }] : [],
              data?.kills[0]  ? [{ label: "⚔️ Last Kill",  onClick: () => setMapState(KILL_STATE(data.kills.sort((a,b)=>b.killTimestamp-a.killTimestamp)[0].solarSystemId)),   active: mapState.mode === "kill",  borderKey: "kill"  }] : [],
            ).map(({ label, onClick, active, borderKey }) => {
              const border = modeButtonBorder[borderKey];
              return (
                <button
                  key={label}
                  onClick={onClick}
                  className="flex-1 py-[5px] rounded text-xs cursor-pointer text-white/65"
                  style={{
                    border: `1px solid ${border}`,
                    background: active
                      ? border.replace("0.3", "0.12").replace("0.25", "0.1")
                      : "rgba(255,255,255,0.04)",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
