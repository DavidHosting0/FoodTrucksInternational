"use client";

import { useRouter } from "next/navigation";

export function MonthPicker({ month }: { month: string }) {
  const router = useRouter();

  return (
    <input
      type="month"
      value={month}
      aria-label="Monat"
      className="h-11 rounded-lg border border-input bg-transparent px-3"
      onChange={(e) => {
        router.push(`/budgets?month=${e.target.value}`);
      }}
    />
  );
}
