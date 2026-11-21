"use client";

import { useActionState } from "react";
import {
  analyzeExpenseTipsAction,
  type ActionState,
} from "@/app/actions/expense-tips";
import type { ExpenseTipsReport } from "@/types/database";
import { formatMoney } from "@/lib/format";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const initial: ActionState = {};

const severityLabel = {
  unnecessary: "Unnötig",
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
  report,
  currency,
}: {
  month: string;
  report: ExpenseTipsReport | null;
  currency: string;
}) {
  const [state, action, pending] = useActionState(
    analyzeExpenseTipsAction,
    initial
  );
  const tips = report?.tips ?? [];
  const flagged = tips.filter((tip) => tip.severity !== "ok");

  return (
    <div className="space-y-4">
      <div className="metal-plate rounded-[1.75rem] px-5 py-6 text-white">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/70">
          AI Tipps · {month}
        </p>
        <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
          {formatMoney(report?.estimated_monthly_savings ?? 0, currency)}
        </p>
        <p className="mt-2 text-sm text-white/75">
          geschätztes Sparpotenzial / Monat
        </p>
        {report?.summary ? (
          <p className="mt-4 text-sm leading-relaxed text-white/85">
            {report.summary}
          </p>
        ) : (
          <p className="mt-4 text-sm text-white/70">
            Analysiert Ausgaben und Artikel — markiert Unnötiges und schlägt
            haltbarere Alternativen vor.
          </p>
        )}
        <form action={action} className="mt-5">
          <input type="hidden" name="month" value={month} />
          <Button
            type="submit"
            variant="secondary"
            disabled={pending}
            className="w-full"
          >
            {pending ? "Analysiert…" : report ? "Neu analysieren" : "Jetzt analysieren"}
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
            Starte die Analyse für diesen Monat.
          </p>
        </div>
      ) : (
        <>
          <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {flagged.length} markiert · {tips.length} Tipps
          </p>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li
                key={`${tip.transaction_id ?? "x"}-${tip.item ?? tip.reason}-${index}`}
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
                    {tip.item ? tip.item : tip.merchant}
                  </p>
                  {tip.item ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {tip.merchant}
                    </p>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{tip.reason}</p>
                <p className="text-sm">
                  <span className="font-medium text-primary">Alternative: </span>
                  {tip.alternative}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
