"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

import { PreferencesToggles } from "@/components/preferences-toggles";
import type { Locale } from "@/lib/i18n/messages";

export function TopHeader({
  locale,
  labels,
  mobileNav,
}: {
  locale: Locale;
  labels: {
    theme: string;
    language: string;
    light: string;
    dark: string;
    system: string;
    english: string;
    arabic: string;
  };
  mobileNav: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center justify-between border-b border-border bg-background px-4 md:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <PreferencesToggles locale={locale} labels={labels} />
      </header>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 inset-s-0 w-(--sidebar-width) shadow-xl">
            {mobileNav}
          </div>
        </div>
      ) : null}
    </>
  );
}
