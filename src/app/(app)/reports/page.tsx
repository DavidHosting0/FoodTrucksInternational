import { FileDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Exporte für Backup, Steuer oder Auswertung.
        </p>
      </div>

      <div className="space-y-3">
        <a
          href="/api/reports/csv"
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "flex h-14 w-full items-center justify-between px-4"
          )}
        >
          <span className="text-left">
            <span className="block font-medium">CSV-Export</span>
            <span className="block text-xs text-muted-foreground">
              Alle Transaktionen als Tabelle
            </span>
          </span>
          <FileDown className="size-5" />
        </a>
        <a
          href="/api/reports/pdf"
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "flex h-14 w-full items-center justify-between px-4"
          )}
        >
          <span className="text-left">
            <span className="block font-medium">PDF-Monatsreport</span>
            <span className="block text-xs text-muted-foreground">
              Summen, Top-Kategorien, Top-Händler
            </span>
          </span>
          <FileDown className="size-5" />
        </a>
      </div>
    </div>
  );
}
