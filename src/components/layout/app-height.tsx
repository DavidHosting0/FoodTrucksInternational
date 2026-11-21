"use client";

import { useEffect } from "react";

/**
 * Keeps --app-height in sync with the visible viewport.
 * Fixes mobile/PWA cases where 100dvh is wrong until the first scroll.
 */
export function AppHeight() {
  useEffect(() => {
    const root = document.documentElement;

    const sync = () => {
      const vv = window.visualViewport;
      const height = Math.round(vv?.height ?? window.innerHeight);
      root.style.setProperty("--app-height", `${height}px`);
      // Distance from visual viewport bottom to layout bottom (often 0).
      const insetBottom = vv
        ? Math.max(
            0,
            Math.round(window.innerHeight - vv.height - vv.offsetTop)
          )
        : 0;
      root.style.setProperty("--vv-bottom-gap", `${insetBottom}px`);
    };

    sync();
    const raf = window.requestAnimationFrame(sync);
    const t1 = window.setTimeout(sync, 50);
    const t2 = window.setTimeout(sync, 300);

    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    window.addEventListener("pageshow", sync);
    window.visualViewport?.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("scroll", sync);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      window.removeEventListener("pageshow", sync);
      window.visualViewport?.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("scroll", sync);
    };
  }, []);

  return null;
}
