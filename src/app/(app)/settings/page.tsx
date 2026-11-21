import { auth } from "@/auth";
import { isDemoMode } from "@/lib/demo/mode";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { PasswordForm } from "@/components/settings/password-form";
import { ThemeToggle } from "@/components/settings/theme-toggle";

export default async function SettingsPage() {
  const session = isDemoMode() ? null : await auth();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Einstellungen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Konto, Darstellung und Abmelden.
        </p>
      </div>

      <section className="rounded-xl border border-border/60 p-4">
        <h2 className="font-medium">Konto</h2>
        {isDemoMode() ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Demo-Modus aktiv – kein echtes Konto.
          </p>
        ) : (
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">E-Mail</dt>
              <dd>{session?.user?.email ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Name</dt>
              <dd>{session?.user?.name ?? "—"}</dd>
            </div>
          </dl>
        )}
      </section>

      {!isDemoMode() ? <PasswordForm /> : null}

      <section className="rounded-xl border border-border/60 p-4">
        <h2 className="font-medium">Darstellung</h2>
        <div className="mt-3">
          <ThemeToggle />
        </div>
      </section>

      <section className="rounded-xl border border-border/60 p-4">
        <h2 className="mb-2 font-medium">Sitzung</h2>
        <SignOutButton />
      </section>

      <section className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Handy-Installation</p>
        <p className="mt-1">
          Unter iOS: Teilen → „Zum Home-Bildschirm“. Unter Android: Menü →
          „App installieren“ / „Zum Startbildschirm“. HTTPS auf dem Server nötig.
        </p>
      </section>
    </div>
  );
}
