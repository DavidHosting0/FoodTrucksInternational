import { Construction } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-row items-start gap-3">
        <div className="rounded-lg bg-primary/15 p-2 text-primary">
          <Construction className="size-5" />
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
          <p className="mt-3 text-sm text-muted-foreground">
            Diese Funktion kommt in einer späteren Phase.
          </p>
        </div>
      </CardHeader>
    </Card>
  );
}
