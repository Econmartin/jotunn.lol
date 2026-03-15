# BentoGrid Component
**Type**: Layout

## What it does
Provides four bento-grid layout variants for composing cards in `App.tsx`. Each variant receives `CardDef[]` and renders them in a responsive flex/grid container with GSAP-driven expand/collapse animations.

## Exports

### `BentoRow` (Variant A)
Full-width horizontal row. Cards share the row with `baseFlex` weighting.
```tsx
<BentoRow cards={[...]} expanded={expandedId} onToggle={setExpanded} />
```

### `BentoPair` (Variant B)
Two rows stacked. Each row is a `BentoRow`. Useful for 2×N grids.
```tsx
<BentoPair rows={[topCards, bottomCards]} expanded={expandedId} onToggle={setExpanded} />
```

### `BentoPairWithTall` (Variant C)
One tall card on the left or right, paired with two rows on the other side.
```tsx
<BentoPairWithTall tallCard={...} rows={[topCards, bottomCards]} tallPosition="left" ... />
```

### `SoloTall`
A single full-width card, typically for maps/feeds that need the full viewport.
```tsx
<SoloTall card={...} expanded={expandedId} onToggle={setExpanded} />
```

### `CloseBtn`
Internal button rendered inside an expanded card. Uses shadcn `Button` variant="ghost".

## Constants
| Name | Value | Description |
|------|-------|-------------|
| `ROW_H` | `320` | Base row height (px) |
| `GAP` | `16` | Gap between cards (px) |
| `PAIR_H` | `ROW_H * 2 + GAP` | Total height of a BentoPair |
| `EASE` | `"power2.inOut"` | GSAP easing for expand/collapse |

## Dependencies
| File | Purpose |
|------|---------|
| `src/lib/layout.tsx` | `CardDef` type |
| `src/lib/types.ts` | `CardCompressedContext` |
| `shadcn Button` | CloseBtn (ghost/icon variant) |
