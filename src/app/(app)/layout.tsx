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
        <main className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-28 pt-2 md:px-6 lg:max-w-5xl lg:px-8 lg:pb-10 lg:pt-6">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
