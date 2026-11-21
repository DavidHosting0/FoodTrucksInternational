"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

function subscribe() {
  return () => {};
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card/60 px-4 py-3">
      <div className="flex items-center gap-3">
        {isDark ? (
          <Moon className="size-4 text-primary" />
        ) : (
          <Sun className="size-4 text-primary" />
        )}
        <div>
          <Label htmlFor="theme-toggle">Dark Mode</Label>
          <p className="text-xs text-muted-foreground">
            Anthrazit mit grünem Akzent (Standard)
          </p>
        </div>
      </div>
      <Switch
        id="theme-toggle"
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
    </div>
  );
}
