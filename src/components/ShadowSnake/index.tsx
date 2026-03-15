import { useEffect, useRef } from "react";

const SEGMENT_SIZE = 36;
const HEAD_SIZE = 96; // 2x body size for head image
const SEGMENT_COUNT = 8;
const MOVE_INTERVAL_MS = 120;
const GRID_STEP = SEGMENT_SIZE + 6;

// Side bands: snakes can extend further into the middle
const SIDE_BAND_WIDTH = 0.32; // left 0–32%, right 68–100%
const SIDE_MARGIN = 40;

// Torch radius (matches App) — snake only visible when cursor is near
const TORCH_RADIUS = 560;

// Placeholder: subtle square with "?" for head image
const PLACEHOLDER_HEAD_SVG = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" stroke-width="1"/><text x="24" y="32" font-size="24" fill="rgba(255,255,255,0.4)" text-anchor="middle" font-family="sans-serif">?</text></svg>'
)}`;

type Dir = "up" | "down" | "left" | "right";

const DIRECTIONS: Dir[] = ["up", "down", "left", "right"];

function pickRandomDir(current: Dir): Dir {
  const others = DIRECTIONS.filter((d) => d !== current);
  return others[Math.floor(Math.random() * others.length)];
}

function pickMaybeSameDir(current: Dir, bias = 0.6): Dir {
  if (Math.random() < bias) return current;
  return pickRandomDir(current);
}

function visibilityAt(mouseX: number, mouseY: number, segX: number, segY: number): number {
  const dx = segX - mouseX;
  const dy = segY - mouseY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > TORCH_RADIUS) return 0;
  const fadeStart = 180;
  if (dist < fadeStart) return 1;
  return 1 - (dist - fadeStart) / (TORCH_RADIUS - fadeStart);
}

type Side = "left" | "right";

function getBounds(side: Side, width: number) {
  if (side === "left") {
    return { xMin: SIDE_MARGIN, xMax: width * SIDE_BAND_WIDTH };
  }
  return { xMin: width * (1 - SIDE_BAND_WIDTH), xMax: width - SIDE_MARGIN };
}

function clampToBounds(nx: number, ny: number, side: Side, width: number, docHeight: number) {
  const { xMin, xMax } = getBounds(side, width);
  let x = Math.max(xMin, Math.min(xMax, nx));
  let y = ny;
  const pad = GRID_STEP * 2;
  // Wrap vertically across full document — scroll to find the snake
  if (y < -pad) y = docHeight + pad;
  if (y > docHeight + pad) y = -pad;
  return { x, y };
}

function pickValidDir(dir: Dir, head: { x: number; y: number }, side: Side, width: number): Dir {
  const { xMin, xMax } = getBounds(side, width);

  const wouldGoLeft = dir === "left" && head.x - GRID_STEP < xMin;
  const wouldGoRight = dir === "right" && head.x + GRID_STEP > xMax;

  if (wouldGoLeft || wouldGoRight) {
    const vertical: Dir[] = ["up", "down"];
    return vertical[Math.floor(Math.random() * 2)];
  }
  return pickMaybeSameDir(dir, 0.7);
}

export function ShadowSnake({ headImageSrc }: { headImageSrc?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const headImgRef = useRef<HTMLImageElement | null>(null);

  // Two snakes: left and right, each with segments + direction
  const leftRef = useRef<{
    segments: { x: number; y: number }[];
    dir: Dir;
    lastMove: number;
  }>({ segments: [], dir: "down", lastMove: 0 });
  const rightRef = useRef<{
    segments: { x: number; y: number }[];
    dir: Dir;
    lastMove: number;
  }>({ segments: [], dir: "up", lastMove: 0 });

  // Preload head image (placeholder or custom)
  useEffect(() => {
    const src = headImageSrc ?? PLACEHOLDER_HEAD_SVG;
    const img = new Image();
    img.onload = () => { headImgRef.current = img; };
    img.src = src;
    return () => { headImgRef.current = null; };
  }, [headImageSrc]);

  // Track mouse for torch visibility
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const getDocHeight = () =>
      Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight
      );

    const initSnake = (side: Side, w: number, docH: number) => {
      const { xMin, xMax } = getBounds(side, w);
      const cx = (xMin + xMax) / 2;
      const cy = Math.floor(docH / 2 / GRID_STEP) * GRID_STEP;
      return Array.from({ length: SEGMENT_COUNT }, (_, i) => ({
        x: cx,
        y: cy - i * GRID_STEP,
      }));
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const docH = getDocHeight();
      canvas.width = w;
      canvas.height = h;
      if (leftRef.current.segments.length === 0) {
        leftRef.current.segments = initSnake("left", w, docH);
      }
      if (rightRef.current.segments.length === 0) {
        rightRef.current.segments = initSnake("right", w, docH);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const stepSnake = (
      ref: typeof leftRef,
      side: Side,
      now: number,
      w: number,
      docH: number
    ) => {
      const { segments, dir, lastMove } = ref.current;
      if (now - lastMove < MOVE_INTERVAL_MS) return;

      ref.current.lastMove = now;
      const head = segments[0];
      const nextDir = pickValidDir(dir, head, side, w);

      let nx = head.x;
      let ny = head.y;
      switch (nextDir) {
        case "up":
          ny -= GRID_STEP;
          break;
        case "down":
          ny += GRID_STEP;
          break;
        case "left":
          nx -= GRID_STEP;
          break;
        case "right":
          nx += GRID_STEP;
          break;
      }

      const { x, y } = clampToBounds(nx, ny, side, w, docH);

      ref.current.segments = [{ x, y }, ...segments.slice(0, -1)];
      ref.current.dir = nextDir;
    };

    const drawSnake = (segments: { x: number; y: number }[], scrollY: number) => {
      const { x: mx, y: my } = mouseRef.current;
      segments.forEach((seg, i) => {
        const viewportY = seg.y - scrollY;
        const vis = visibilityAt(mx, my, seg.x, viewportY);
        if (vis <= 0) return;

        const isHead = i === 0;
        const baseAlpha = isHead ? 0.85 : 0.35 - (i / SEGMENT_COUNT) * 0.15;
        const alpha = baseAlpha * vis;

        // Body squares get smaller towards tail (first body = full size)
        const bodySizeScale = 1 - ((i - 1) / Math.max(1, SEGMENT_COUNT - 2)) * 0.55;
        const size = isHead ? HEAD_SIZE : Math.max(12, SEGMENT_SIZE * bodySizeScale);
        const half = size / 2;

        ctx.save();
        ctx.globalAlpha = alpha;

        if (isHead) {
          if (headImgRef.current) {
            // Head: image only, no background
            ctx.drawImage(headImgRef.current, seg.x - half, viewportY - half, size, size);
          } else {
            ctx.fillStyle = "rgb(255, 140, 60)";
            ctx.fillRect(seg.x - half, viewportY - half, size, size);
          }
        } else {
          // Body: orange gradient, more orange near head, smaller towards tail
          const orangeTint = 1 - i / SEGMENT_COUNT;
          const r = 255;
          const g = Math.round(140 + 50 * (1 - orangeTint));
          const b = Math.round(60 + 80 * (1 - orangeTint));
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(seg.x - half, viewportY - half, size, size);
        }

        ctx.restore();
      });
    };

    const animate = (now: number) => {
      if (!ctx || !canvas) return;

      const w = canvas.width;
      const docH = getDocHeight();
      const scrollY = window.scrollY;

      stepSnake(leftRef, "left", now, w, docH);
      stepSnake(rightRef, "right", now, w, docH);

      ctx.clearRect(0, 0, w, canvas.height);
      drawSnake(leftRef.current.segments, scrollY);
      drawSnake(rightRef.current.segments, scrollY);

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
