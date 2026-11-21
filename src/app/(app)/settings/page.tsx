import Link from "next/link";
import {
  FileImage,
  FileText,
  List,
  PlusCircle,
  Tags,
} from "lucide-react";
import { auth } from "@/auth";
import { isDemoMode } from "@/lib/demo/mode";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { PasswordForm } from "@/components/settings/password-form";
import { ThemeToggle } from "@/components/settings/theme-toggle";

const links = [
  { href: "/transactions/new", label: "Ausgabe erfassen", icon: PlusCircle },
  { href: "/transactions", label: "Transaktionen", icon: List },
  { href: "/receipts", label: "Belege", icon: FileImage },
  { href: "/categories", label: "Kategorien", icon: Tags },
  { href: "/reports", label: "Reports", icon: FileText },
] as const;

export default async function SettingsPage() {
  const session = isDemoMode() ? null : await auth();

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Konto & Darstellung
        </p>
      </div>

      <section className="metal-surface rounded-3xl p-2">
        <h2 className="px-3 pt-3 text-sm font-medium text-muted-foreground">
          Mehr
        </h2>
        <ul className="mt-2">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-12 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition-colors hover:bg-white/5"
                >
                  <Icon className="size-4 text-primary" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="metal-surface rounded-3xl p-5">
        <h2 className="text-sm font-medium text-muted-foreground">Konto</h2>
        {isDemoMode() ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Demo-Modus aktiv – kein echtes Konto.
          </p>
        ) : (
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">E-Mail</dt>
              <dd className="font-medium">{session?.user?.email ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{session?.user?.name ?? "—"}</dd>
            </div>
          </dl>
        )}
      </section>

      {!isDemoMode() ? <PasswordForm /> : null}

      <section className="metal-surface rounded-3xl p-5">
        <h2 className="text-sm font-medium text-muted-foreground">Darstellung</h2>
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </section>

      <section className="metal-surface rounded-3xl p-5">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Sitzung</h2>
        <SignOutButton />
      </section>

      <section className="rounded-3xl bg-secondary/60 p-5 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Handy-Installation</p>
        <p className="mt-1">
          iOS: Teilen → „Zum Home-Bildschirm“. Android: Menü → „App
          installieren“. Für echte PWA später HTTPS nutzen.
        </p>
      </section>
    </div>
  );
}
