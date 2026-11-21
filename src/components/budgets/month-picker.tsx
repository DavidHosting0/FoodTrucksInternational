"use client";

import { useRouter } from "next/navigation";

export function MonthPicker({ month }: { month: string }) {
  const router = useRouter();

  return (
    <input
      type="month"
      value={month}
      aria-label="Monat"
      className="h-11 rounded-2xl border-0 bg-secondary px-4 text-sm outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
      onChange={(e) => {
        router.push(`/budgets?month=${e.target.value}`);
      }}
    />
  );
}
