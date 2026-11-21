"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  analyzeExpenseTipsAction,
  type ActionState,
} from "@/app/actions/expense-tips";
import type { ExpenseTip } from "@/types/database";
import { formatMoney } from "@/lib/format";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const initial: ActionState = {};

const severityLabel = {
  unnecessary: "Verschwendung",
  questionable: "Fragwürdig",
  ok: "Ok",
} as const;

const priorityLabel = {
  high: "Hoch",
  medium: "Mittel",
  low: "Niedrig",
} as const;

export function ExpenseTipsPanel({
  month,
  tips,
  currency,
  estimatedSavings,
  pendingCount,
  evaluatedCount,
  totalCount,
}: {
  month: string;
  tips: ExpenseTip[];
  currency: string;
  estimatedSavings: number;
  pendingCount: number;
  evaluatedCount: number;
  totalCount: number;
}) {
  const [state, action, pending] = useActionState(
    analyzeExpenseTipsAction,
    initial
  );

  return (
    <div className="space-y-4">
      <div className="metal-plate rounded-[1.75rem] px-5 py-6 text-white">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/70">
          AI Tipps · {month}
        </p>
        <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
          {formatMoney(estimatedSavings, currency)}
        </p>
        <p className="mt-2 text-sm text-white/75">
          Sparpotenzial aus Beleg-Tipps
        </p>
        <p className="mt-4 text-sm leading-relaxed text-white/85">
          Jeder Beleg wird einzeln bewertet. {evaluatedCount}/{totalCount}{" "}
          geprüft
          {pendingCount > 0 ? ` · ${pendingCount} offen` : ""}.
        </p>
        <form action={action} className="mt-5">
          <input type="hidden" name="month" value={month} />
          <Button
            type="submit"
            variant="secondary"
            disabled={pending || pendingCount === 0}
            className="w-full"
          >
            {pending
              ? "Bewertet…"
              : pendingCount > 0
                ? `Unbewertete nachholen (${pendingCount})`
                : "Alles bewertet"}
          </Button>
        </form>
      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state.success ? (
        <Alert>
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      ) : null}

      {tips.length === 0 ? (
        <div className="metal-surface rounded-3xl px-5 py-12 text-center">
          <p className="font-medium">Noch keine Tipps</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {pendingCount > 0
              ? "Offene Belege nachholen, dann erscheinen Roasts hier."
              : "Erfasse Belege — die AI meldet sich bei Fehlkäufen."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tips.map((tip, index) => {
            const why = tip.why ?? tip.reason;
            const instead = tip.instead ?? tip.alternative;
            const how = tip.how ?? [];
            return (
              <li
                key={`${tip.transaction_id ?? "x"}-${tip.item ?? tip.title}-${index}`}
                className="metal-surface space-y-2.5 rounded-3xl px-4 py-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      tip.severity === "unnecessary"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {severityLabel[tip.severity]}
                  </Badge>
                  <Badge variant="secondary">
                    {priorityLabel[tip.priority]}
                  </Badge>
                  {tip.estimated_savings > 0 ? (
                    <span className="text-xs font-semibold tabular-nums text-primary">
                      ~{formatMoney(tip.estimated_savings, currency)}
                    </span>
                  ) : null}
                </div>
                <div>
                  <p className="font-medium leading-snug">
                    {tip.title ?? tip.item ?? tip.merchant}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {tip.merchant}
                    {tip.item ? ` · ${tip.item}` : ""}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {why}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-primary">Stattdessen: </span>
                  {instead}
                </p>
                {how.length > 0 ? (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {how.map((step, i) => (
                      <li key={i}>→ {step}</li>
                    ))}
                  </ul>
                ) : null}
                {tip.transaction_id ? (
                  <Link
                    href={`/transactions/${tip.transaction_id}/edit`}
                    className="inline-block text-xs font-medium text-primary"
                  >
                    Zum Beleg
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
