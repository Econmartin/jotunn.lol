/**
 * @card PostcardSender
 * @description Coming soon — real physical postcards via Lob.com on kill milestones.
 */

import { GlassCard } from "../../components/GlassCard";
import { MARTIAN_H } from "../../lib/constants";
import { SvgIcon } from "../../components/SvgIcon";

export function PostcardSender() {
  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col">
        <div className="flex items-center gap-2 mb-2 shrink-0">
          <SvgIcon src="/assets/letter.svg" size={22} />
          <div>
            <div
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: `hsla(${MARTIAN_H},50%,65%,0.55)` }}
            >
              POSTCARD
            </div>
            <div className="text-xs text-white/50">Kill milestone mail</div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-white/30 text-xs">
          Coming soon
        </div>
      </div>
    </GlassCard>
  );
}
