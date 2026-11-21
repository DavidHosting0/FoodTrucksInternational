"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function MonthPickerInner({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <input
      type="month"
      value={month}
      aria-label="Monat"
      className="h-11 rounded-2xl border-0 bg-secondary px-4 text-sm outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("month", e.target.value);
        if (pathname.startsWith("/dashboard")) {
          params.set("tab", "budget");
          params.delete("space");
        }
        router.push(`${pathname}?${params.toString()}`);
      }}
    />
  );
}

export function MonthPicker({ month }: { month: string }) {
  return (
    <Suspense
      fallback={
        <input
          type="month"
          value={month}
          aria-label="Monat"
          disabled
          className="h-11 rounded-2xl border-0 bg-secondary px-4 text-sm opacity-70"
        />
      }
    >
      <MonthPickerInner month={month} />
    </Suspense>
  );
}
