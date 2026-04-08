"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function SignOutButton({ label = "Sign out" }: { label?: string }) {
  return (
    <Button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      variant="outline"
      size="sm"
    >
      {label}
    </Button>
  );
}
