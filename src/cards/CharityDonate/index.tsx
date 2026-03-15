/**
 * @card CharityDonate
 * @description Coming soon — kill-linked charity pledge via Every.org.
 */

import { GlassCard } from "../../components/GlassCard";
import { MARTIAN_H } from "../../lib/constants";

export function CharityDonate() {
  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col">
        <div className="flex items-center gap-2 mb-2 shrink-0">
          <div
            className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm"
            style={{
              background: `hsla(${MARTIAN_H},50%,28%,0.6)`,
              border: `1px solid hsla(${MARTIAN_H},50%,50%,0.25)`,
            }}
          >
            ❤️
          </div>
          <div>
            <div
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: `hsla(${MARTIAN_H},50%,65%,0.55)` }}
            >
              CHARITY
            </div>
            <div className="text-xs text-white/50">$0.01 per kill pledged</div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-white/30 text-xs">
          Coming soon
        </div>
      </div>
    </GlassCard>
  );
}
