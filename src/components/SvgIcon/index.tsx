import type { CSSProperties } from "react";

interface SvgIconProps {
  src: string;
  size?: number;
  style?: CSSProperties;
}

/**
 * Renders a public-path SVG as an orange gradient icon via CSS mask-image.
 * No circle wrapper — drop it directly where you need the icon.
 */
export function SvgIcon({ src, size = 20, style }: SvgIconProps) {
  return (
    <span
      style={{
        display: "inline-block",
        flexShrink: 0,
        width: size,
        height: size,
        background: "linear-gradient(135deg, hsl(28, 100%, 62%) 0%, hsl(10, 88%, 52%) 100%)",
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        ...style,
      }}
    />
  );
}
