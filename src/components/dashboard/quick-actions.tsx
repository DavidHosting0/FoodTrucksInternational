import Link from "next/link";
import { FileImage, List, Plus, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  {
    href: "/dashboard?tab=capture",
    label: "Kamera",
    icon: Plus,
    primary: true,
  },
  {
    href: "/dashboard?tab=list",
    label: "Liste",
    icon: List,
  },
  {
    href: "/dashboard?tab=budget",
    label: "Budget",
    icon: Wallet,
  },
  {
    href: "/dashboard?tab=more",
    label: "Mehr",
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
                  ? "metal-fab"
                  : "metal-surface text-foreground"
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
