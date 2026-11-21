import { DemoBanner } from "@/components/layout/demo-banner";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileNav, Sidebar } from "@/components/layout/sidebar";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DemoBanner />
        <MobileNav />
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 lg:p-8 lg:pb-8">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
