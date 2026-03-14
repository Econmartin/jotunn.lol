import { createContext, useContext, type CSSProperties, type ReactNode } from "react";

// Cards read this to hide their content while the glass shell stays visible
export const CardCompressedContext = createContext(false);


interface GlassCardProps {
  children: ReactNode;
  accentH?: number;   // HSL hue 0-360, default 210
  accentS?: string;   // e.g. "80%", default "80%"
  accentL?: string;   // e.g. "55%", default "55%"
  style?: CSSProperties; // applied to outer wrapper (for sizing)
}

export function GlassCard({
  children,
  accentH = 210,
  accentS = "80%",
  accentL = "55%",
  style,
}: GlassCardProps) {
  const h = accentH;
  const s = accentS;
  const l = accentL;

  const isCompressed = useContext(CardCompressedContext);

  const outerRadius = 0;
  const innerInset  = isCompressed ? 4 : 14;
  const innerRadius = 0;
  const innerPad    = isCompressed ? 6 : 22;

  // ── Outer shell ──────────────────────────────────────────────────────────
  const outerStyle: CSSProperties = {
    borderRadius: outerRadius,
    background: `
      linear-gradient(
        160deg,
        hsla(${h}, 30%, 18%, 0.45) 0%,
        hsla(${h}, 25%, 8%,  0.55) 50%,
        hsla(${h}, 35%, 12%, 0.40) 100%
      )
    `,
    backdropFilter: "blur(40px) saturate(1.4)",
    WebkitBackdropFilter: "blur(40px) saturate(1.4)",
    borderStyle: "solid",
    borderWidth: "1.2px",
    borderTopColor:   `hsla(${h}, 60%, 60%, 0.35)`,
    borderLeftColor:  `hsla(${h}, 50%, 55%, 0.22)`,
    borderRightColor: `hsla(${h}, 40%, 40%, 0.15)`,
    borderBottomColor:`hsla(${h}, 40%, 40%, 0.15)`,
    boxShadow: `
      0 2px  4px  rgba(0,0,0,0.30),
      0 8px  24px rgba(0,0,0,0.40),
      0 20px 60px rgba(0,0,0,0.35),
      inset 0  1px 1px hsla(${h}, 50%, 60%, 0.12),
      inset 0 -1px 1px rgba(0,0,0,0.20)
    `,
    position: "relative",
    overflow: "hidden",
    transition: "border-radius 0.45s cubic-bezier(0.4,0,0.12,1)",
    ...style,
  };

  // ── Top specular line ─────────────────────────────────────────────────────
  const specularStyle: CSSProperties = {
    position: "absolute",
    top: 0, left: "10%", right: "10%",
    height: 1,
    background: `linear-gradient(
      90deg,
      transparent,
      hsla(${h}, 70%, 70%, 0.4),
      hsla(${h}, 90%, 80%, 0.6),
      hsla(${h}, 70%, 70%, 0.4),
      transparent
    )`,
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 0,
  };

  // ── Inner card ────────────────────────────────────────────────────────────
  const innerStyle: CSSProperties = {
    position: "absolute",
    top: innerInset, left: innerInset, right: innerInset, bottom: innerInset,
    borderRadius: innerRadius,
    padding: innerPad,
    overflow: "hidden",
    transition: "top 0.45s cubic-bezier(0.4,0,0.12,1), left 0.45s cubic-bezier(0.4,0,0.12,1), right 0.45s cubic-bezier(0.4,0,0.12,1), bottom 0.45s cubic-bezier(0.4,0,0.12,1), border-radius 0.45s cubic-bezier(0.4,0,0.12,1), padding 0.45s cubic-bezier(0.4,0,0.12,1)",
    background: `
      linear-gradient(
        170deg,
        hsla(${h}, 35%, 22%, 0.40) 0%,
        hsla(${h}, 30%, 12%, 0.50) 40%,
        hsla(${h}, 40%, 15%, 0.35) 100%
      )
    `,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderStyle: "solid",
    borderWidth: 1,
    borderTopColor:   `hsla(${h}, 50%, 55%, 0.25)`,
    borderLeftColor:  `hsla(${h}, 40%, 50%, 0.18)`,
    borderRightColor: `hsla(${h}, 40%, 40%, 0.15)`,
    borderBottomColor:`hsla(${h}, 40%, 40%, 0.15)`,
    boxShadow: `
      inset 0  1px 2px hsla(${h}, 50%, 60%, 0.10),
      inset 0 -2px 6px rgba(0,0,0,0.15),
      0 1px 3px rgba(0,0,0,0.20)
    `,
  };

  // ── Bottom accent glow ────────────────────────────────────────────────────
  const glowStyle: CSSProperties = {
    position: "absolute",
    bottom: "-30%", left: "-10%", right: "-10%",
    height: "70%",
    background: `radial-gradient(
      ellipse 90% 60% at 50% 100%,
      hsla(${h}, ${s}, ${l}, 0.18),
      hsla(${h}, ${s}, ${l}, 0.06) 50%,
      transparent 80%
    )`,
    pointerEvents: "none",
    zIndex: 0,
  };

  return (
    <div style={outerStyle}>
      <div style={specularStyle} />
      <div style={innerStyle}>
        <div style={glowStyle} />
        {/* Content — fades out when compressed, glass shell stays */}
        <div style={{
          position: "relative", zIndex: 1, height: "100%",
          opacity: isCompressed ? 0 : 1,
          transition: "opacity 0.15s ease",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
