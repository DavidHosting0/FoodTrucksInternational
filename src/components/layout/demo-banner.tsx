import { isDemoMode } from "@/lib/demo/mode";

export function DemoBanner() {
  if (!isDemoMode()) return null;

  return (
    <div className="bg-primary/15 px-4 py-2 text-center text-xs text-primary md:text-sm">
      Demo-Modus — Daten nur im Speicher, weg nach Server-Neustart.
    </div>
  );
}
