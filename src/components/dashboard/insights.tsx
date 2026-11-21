import { Lightbulb } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function InsightsList({ insights }: { insights: string[] }) {
  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="size-4 text-primary" />
          Intelligente Hinweise
        </CardTitle>
        <CardDescription>
          Abgeleitet aus deinen erfassten Transaktionen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {insights.map((insight) => (
            <li
              key={insight}
              className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm leading-relaxed"
            >
              {insight}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
