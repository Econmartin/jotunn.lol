# GlassCard Component
**Type**: Layout wrapper
**Accent**: Dynamic — caller passes `accentH` (hue 0–360)

## What it does
Renders a glassmorphism card shell with a subtle colored top-left corner glow and frosted-glass background. The glow color is computed at runtime from `accentH` using `hsla(${accentH}, ...)` — this is intentionally **not** Tailwind, because Tailwind cannot produce per-instance dynamic HSL values.

## Critical constraint
**Do not convert inline styles to Tailwind.** All glassmorphism colors are generated via `hsla(${accentH}, ...)` at render time. The component also references `:root` CSS vars (`--border`, `--accent`, `--bg`) which must remain hex/rgba values — not oklch.

## Props
| Prop | Type | Description |
|------|------|-------------|
| `accentH` | `number` | HSL hue (0–360) for corner glow |
| `style` | `CSSProperties` | Extra styles (height, width, etc.) |
| `className` | `string` | Extra Tailwind classes for layout |
| `children` | `ReactNode` | Card content |

## Usage
```tsx
<GlassCard accentH={120} style={{ height: "100%", width: "100%" }}>
  <div style={{ position: "relative", zIndex: 1 }}>
    ...
  </div>
</GlassCard>
```

## Hue convention
| Hue | Color | Cards |
|-----|-------|-------|
| 25  | Ice blue | CharacterHero |
| 120 | Green | FuelGauge, AssemblyStatus |
| 210 | Blue | TxHistory |
| 280 | Purple | EventFeed, ItemLedger |
| 45  | Amber | ChangeLog |
