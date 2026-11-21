import Link from "next/link";
import { FileImage, List, Plus, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  {
    href: "/transactions/new",
    label: "Erfassen",
    icon: Plus,
    primary: true,
  },
  {
    href: "/transactions",
    label: "Liste",
    icon: List,
  },
  {
    href: "/budgets",
    label: "Budgets",
    icon: Wallet,
  },
  {
    href: "/receipts",
    label: "Belege",
    icon: FileImage,
  },
] as const;

export function QuickActions() {
  return (
    <section className="animate-hero-in flex justify-center gap-5 px-2 [animation-delay:80ms]">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className="flex w-16 flex-col items-center gap-2 transition-transform active:scale-95"
          >
            <span
              className={cn(
                "flex size-14 items-center justify-center rounded-full",
                "primary" in action && action.primary
                  ? "bg-primary text-primary-foreground shadow-[0_8px_24px_oklch(0.78_0.2_145_/_0.3)]"
                  : "bg-secondary text-foreground"
              )}
            >
              <Icon className="size-6" strokeWidth={2.25} />
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              {action.label}
            </span>
          </Link>
        );
      })}
    </section>
  );
}
