import { isDemoMode } from "@/lib/demo/mode";

export function DemoBanner() {
  if (!isDemoMode()) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-200 md:text-sm">
      Demo-Modus aktiv — kein Login nötig. Daten liegen nur im Speicher und
      gehen beim Neustart des Servers verloren.
    </div>
  );
}
