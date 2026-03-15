/**
 * @card CardStub
 * Placeholder for a card that hasn't been implemented yet.
 */
import { GlassCard } from "../../components/GlassCard";
import { MARTIAN_H } from "../../lib/constants";

export function CardStub({ label = "Coming soon", icon = "⬡", description }: {
  label?: string;
  icon?: string;
  description?: string;
}) {
  return (
    <GlassCard accentH={MARTIAN_H} style={{ height: "100%", width: "100%" }}>
      <div className="relative z-[1] h-full flex flex-col items-center justify-center gap-1.5 opacity-30">
        <div className="text-2xl">{icon}</div>
        <div className="text-xs font-semibold tracking-widest uppercase text-white/60">
          {label}
        </div>
        {description && (
          <div className="text-xs text-white/40 text-center max-w-[140px] leading-snug">
            {description}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
