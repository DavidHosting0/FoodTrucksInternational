import { DemoBanner } from "@/components/layout/demo-banner";
import { MobileNav, Sidebar } from "@/components/layout/sidebar";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[var(--app-height,100svh)] max-h-[var(--app-height,100svh)] overflow-hidden bg-transparent">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
        <DemoBanner />
        <MobileNav />
        <main className="mx-auto flex w-full min-h-0 max-w-3xl flex-1 flex-col overflow-x-hidden overflow-y-auto bg-transparent px-4 pb-0 pt-2 scrollbar-none md:px-6 lg:max-w-5xl lg:overflow-y-auto lg:px-8 lg:pb-10 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
