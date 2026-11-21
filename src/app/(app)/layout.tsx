import { DemoBanner } from "@/components/layout/demo-banner";
import { MobileNav, Sidebar } from "@/components/layout/sidebar";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh bg-transparent">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-transparent">
        <DemoBanner />
        <MobileNav />
        <main className="mx-auto flex w-full min-h-0 max-w-3xl flex-1 flex-col overflow-x-hidden overflow-y-auto bg-transparent px-4 pb-4 pt-2 md:px-6 lg:max-w-5xl lg:px-8 lg:pb-10 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
