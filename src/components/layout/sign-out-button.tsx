"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function SignOutButton() {
  if (demoMode) {
    return (
      <p className="px-3 py-2 text-xs text-muted-foreground">
        Demo-Nutzer (kein Logout)
      </p>
    );
  }

  return (
    <form action={signOut}>
      <Button
        type="submit"
        variant="ghost"
        className="w-full justify-start gap-2 text-muted-foreground"
      >
        <LogOut className="size-4" />
        Abmelden
      </Button>
    </form>
  );
}
