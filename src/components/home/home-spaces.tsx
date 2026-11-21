"use client";

import { Suspense, type ReactNode } from "react";
import { SpaceCarousel } from "@/components/home/space-carousel";
import type { HomeSpaceId } from "@/components/home/spaces";

export function HomeSpaces({
  initialSpace,
  panels,
}: {
  initialSpace?: string;
  panels: Record<HomeSpaceId, ReactNode>;
}) {
  return (
    <Suspense
      fallback={
        <div className="rounded-3xl metal-surface px-4 py-16 text-center text-sm text-muted-foreground">
          Spaces laden…
        </div>
      }
    >
      <SpaceCarousel initialSpace={initialSpace} panels={panels} />
    </Suspense>
  );
}
