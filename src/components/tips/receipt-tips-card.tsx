import type { ExpenseTip } from "@/types/database";
import { formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

const severityLabel = {
  unnecessary: "Verschwendung",
  questionable: "Fragwürdig",
  ok: "Ok",
} as const;

export function ReceiptTipsCard({
  tips,
  currency,
  status,
}: {
  tips: ExpenseTip[] | null | undefined;
  currency: string;
  status?: "pending" | "done" | "error" | null;
}) {
  if (status === "pending") {
    return (
      <div className="metal-surface rounded-3xl px-4 py-4 text-sm text-muted-foreground">
        AI bewertet diesen Beleg…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="metal-surface rounded-3xl px-4 py-4 text-sm text-muted-foreground">
        Tipps konnten nicht geladen werden. Im Tipps-Tab nachholen.
      </div>
    );
  }

  const list = tips ?? [];
  if (list.length === 0) {
    if (status === "done") {
      return (
        <div className="metal-surface rounded-3xl px-4 py-4 text-sm text-muted-foreground">
          Beleg geprüft — nichts Auffälliges.
        </div>
      );
    }
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        AI Tipps
      </p>
      <ul className="space-y-2">
        {list.map((tip, index) => {
          const why = tip.why ?? tip.reason;
          const instead = tip.instead ?? tip.alternative;
          const how = tip.how ?? [];
          return (
            <li
              key={`${tip.item ?? tip.title ?? tip.reason}-${index}`}
              className="metal-surface space-y-2.5 rounded-3xl px-4 py-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    tip.severity === "unnecessary" ? "destructive" : "secondary"
                  }
                >
                  {severityLabel[tip.severity]}
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
                {tip.item && tip.title ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {tip.item}
                  </p>
                ) : null}
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}
