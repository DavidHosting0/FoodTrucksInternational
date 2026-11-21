"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  List,
  Plus,
  Settings,
  Wallet,
} from "lucide-react";
import {
  HOME_SPACES,
  resolveSpaceId,
  type HomeSpaceId,
} from "@/components/home/spaces";
import { openReceiptCamera } from "@/components/receipts/receipt-capture-flow";
import { cn } from "@/lib/utils";

type Props = {
  initialSpace?: string;
  panels: Record<HomeSpaceId, ReactNode>;
};

const SWIPE_THRESHOLD_PX = 56;
const SWIPE_VELOCITY = 0.35;

const tabIcon = {
  home: LayoutDashboard,
  list: List,
  capture: Plus,
  budget: Wallet,
  more: Settings,
} as const;

export function SpaceCarousel({ initialSpace, panels }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(0);
  const indexRef = useRef(0);
  const skipUrlSync = useRef(false);
  const touch = useRef<{
    x: number;
    y: number;
    t: number;
    axis: "x" | "y" | null;
    offset: number;
  } | null>(null);

  const spaceFromUrl = resolveSpaceId(
    searchParams.get("tab") ?? searchParams.get("space") ?? initialSpace
  );
  const [activeId, setActiveId] = useState<HomeSpaceId>(spaceFromUrl);
  const [index, setIndex] = useState(
    Math.max(0, HOME_SPACES.findIndex((s) => s.id === spaceFromUrl))
  );

  indexRef.current = index;

  const applyTransform = useCallback(
    (nextIndex: number, dragPx: number, animate: boolean) => {
      const track = trackRef.current;
      const width = widthRef.current || viewportRef.current?.clientWidth || 0;
      if (!track || !width) return;
      track.style.transition = animate
        ? "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)"
        : "none";
      track.style.transform = `translate3d(${-(nextIndex * width) + dragPx}px, 0, 0)`;
    },
    []
  );

  const syncUrl = useCallback(
    (id: HomeSpaceId) => {
      const current = resolveSpaceId(
        searchParams.get("tab") ?? searchParams.get("space")
      );
      if (current === id) return;
      skipUrlSync.current = true;
      const params = new URLSearchParams(searchParams.toString());
      params.delete("space");
      if (id === "home") params.delete("tab");
      else params.set("tab", id);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const goToIndex = useCallback(
    (nextIndex: number) => {
      const clamped = Math.min(
        Math.max(nextIndex, 0),
        HOME_SPACES.length - 1
      );
      const space = HOME_SPACES[clamped];
      if (!space) return;
      indexRef.current = clamped;
      setIndex(clamped);
      setActiveId(space.id);
      applyTransform(clamped, 0, true);
      syncUrl(space.id);
    },
    [applyTransform, syncUrl]
  );

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const measure = () => {
      widthRef.current = el.clientWidth;
      applyTransform(indexRef.current, 0, false);
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyTransform]);

  useEffect(() => {
    const next = resolveSpaceId(
      searchParams.get("tab") ?? searchParams.get("space") ?? initialSpace
    );
    const nextIndex = Math.max(
      0,
      HOME_SPACES.findIndex((s) => s.id === next)
    );
    if (skipUrlSync.current) {
      skipUrlSync.current = false;
      return;
    }
    indexRef.current = nextIndex;
    setActiveId(next);
    setIndex(nextIndex);
    applyTransform(nextIndex, 0, false);
  }, [searchParams, initialSpace, applyTransform]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, button, a, label")) {
        touch.current = null;
        return;
      }
      const t = event.touches[0];
      touch.current = {
        x: t.clientX,
        y: t.clientY,
        t: Date.now(),
        axis: null,
        offset: 0,
      };
    };

    const onMove = (event: TouchEvent) => {
      const state = touch.current;
      if (!state || event.touches.length !== 1) return;
      const t = event.touches[0];
      const dx = t.clientX - state.x;
      const dy = t.clientY - state.y;

      if (!state.axis) {
        if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
        state.axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? "x" : "y";
      }

      if (state.axis !== "x") return;

      event.preventDefault();
      const atStart = indexRef.current === 0 && dx > 0;
      const atEnd =
        indexRef.current === HOME_SPACES.length - 1 && dx < 0;
      const offset = dx * (atStart || atEnd ? 0.28 : 1);
      state.offset = offset;
      applyTransform(indexRef.current, offset, false);
    };

    const onEnd = () => {
      const state = touch.current;
      touch.current = null;
      if (!state || state.axis !== "x") {
        applyTransform(indexRef.current, 0, true);
        return;
      }

      const elapsed = Math.max(Date.now() - state.t, 1);
      const velocity = state.offset / elapsed;
      let next = indexRef.current;
      if (state.offset <= -SWIPE_THRESHOLD_PX || velocity < -SWIPE_VELOCITY) {
        next += 1;
      } else if (
        state.offset >= SWIPE_THRESHOLD_PX ||
        velocity > SWIPE_VELOCITY
      ) {
        next -= 1;
      }
      goToIndex(next);
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [applyTransform, goToIndex]);

  // Desktop drag
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    let active = false;
    let startX = 0;
    let origin = 0;

    const down = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      if (event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, button, a, label")) return;
      active = true;
      startX = event.clientX;
      origin = 0;
      el.setPointerCapture(event.pointerId);
    };

    const move = (event: PointerEvent) => {
      if (!active) return;
      const dx = event.clientX - startX;
      const atStart = indexRef.current === 0 && dx > 0;
      const atEnd =
        indexRef.current === HOME_SPACES.length - 1 && dx < 0;
      origin = dx * (atStart || atEnd ? 0.28 : 1);
      applyTransform(indexRef.current, origin, false);
    };

    const up = (event: PointerEvent) => {
      if (!active) return;
      active = false;
      try {
        el.releasePointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
      let next = indexRef.current;
      if (origin <= -SWIPE_THRESHOLD_PX) next += 1;
      else if (origin >= SWIPE_THRESHOLD_PX) next -= 1;
      goToIndex(next);
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [applyTransform, goToIndex]);

  return (
    <div className="flex h-[calc(100svh-3.5rem-env(safe-area-inset-top,0px))] flex-col lg:h-[calc(100svh-2rem)]">
      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 overflow-hidden"
      >
        <div ref={trackRef} className="flex h-full will-change-transform">
          {HOME_SPACES.map((space) => (
            <section
              key={space.id}
              data-space={space.id}
              aria-hidden={space.id !== activeId}
              className="h-full w-full shrink-0 grow-0 basis-full overflow-x-hidden overflow-y-auto overscroll-y-contain px-1 pb-28 scrollbar-none"
              style={{
                width: "100%",
                minWidth: "100%",
                maxWidth: "100%",
                touchAction: "pan-y",
              }}
            >
              {panels[space.id]}
            </section>
          ))}
        </div>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 px-3 pb-safe lg:hidden"
        aria-label="Hauptnavigation"
      >
        <div className="glass-nav mx-auto mb-2 flex h-[4.25rem] max-w-lg items-stretch justify-around rounded-[1.75rem] px-1">
          {HOME_SPACES.map((space, i) => {
            const Icon = tabIcon[space.id];
            const active = space.id === activeId;
            const primary = space.id === "capture";

            if (primary) {
              return (
                <button
                  key={space.id}
                  type="button"
                  aria-label={space.title}
                  aria-current={active}
                  onClick={() => {
                    goToIndex(i);
                    openReceiptCamera();
                  }}
                  className="-mt-5 flex flex-col items-center justify-end pb-2 transition-transform active:scale-95"
                >
                  <span className="metal-fab flex size-14 items-center justify-center rounded-full">
                    <Icon className="size-7" strokeWidth={2.5} />
                  </span>
                </button>
              );
            }

            return (
              <button
                key={space.id}
                type="button"
                aria-label={space.title}
                aria-current={active}
                onClick={() => goToIndex(i)}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon
                  className={cn("size-5", active && "scale-110")}
                  strokeWidth={active ? 2.4 : 2}
                />
                <span className="truncate">{space.short}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
