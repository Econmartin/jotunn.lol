# HeroSection Component
**Type**: Page hero

## What it does
Renders the top hero section with the character portrait, name, tribe info, GSAP-animated strikethrough headline, and a CTA button. Uses Tailwind utility classes for layout (the only component besides App.tsx that does so).

## Critical: `.hero-headline-strike-line`
This CSS class must remain as a named class in `src/main.css`. GSAP targets it directly:
```ts
gsap.to(".hero-headline-strike-line", { scaleX: 1, duration: 0.8, ... })
```
The `transform-origin: left center` in that CSS class is what makes the wipe animation work. Do not convert to an inline style or Tailwind class.

## Layout
Uses `grid grid-cols-[3fr_2fr]` responsive grid that collapses to `grid-cols-1` on narrow viewports.

## Dependencies
| File | Purpose |
|------|---------|
| `src/components/StatBadge/` | Character stat chips |
| `src/hooks/useCharacter.ts` | Character data via Sui GraphQL |
| `src/lib/datahub.ts` | `getTribeInfo()` |
| `src/lib/constants.ts` | `JOTUNN`, `SUISCAN_BASE` |
