import { FileDown } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Export & Backup</p>
      </div>

      <div className="space-y-2">
        <a
          href="/api/reports/csv"
          className="flex h-16 w-full items-center justify-between rounded-3xl bg-card px-5 transition-transform active:scale-[0.99]"
        >
          <span className="text-left">
            <span className="block font-medium">CSV-Export</span>
            <span className="block text-xs text-muted-foreground">
              Alle Transaktionen
            </span>
          </span>
          <FileDown className="size-5 text-primary" />
        </a>
        <a
          href="/api/reports/pdf"
          className="flex h-16 w-full items-center justify-between rounded-3xl bg-card px-5 transition-transform active:scale-[0.99]"
        >
          <span className="text-left">
            <span className="block font-medium">PDF-Monatsreport</span>
            <span className="block text-xs text-muted-foreground">
              Summen & Top-Listen
            </span>
          </span>
          <FileDown className="size-5 text-primary" />
        </a>
      </div>
    </div>
  );
}
