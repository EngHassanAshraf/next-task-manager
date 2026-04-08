"use client";

import { Moon, Monitor, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { Locale } from "@/lib/i18n/messages";

const LOCALE_COOKIE = "NEXT_LOCALE";

export function PreferencesToggles({
  locale,
  labels,
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
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  function setLocale(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`;
    router.refresh();
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2 border-border ps-2 text-xs md:border-s"
      role="group"
      aria-label={`${labels.theme} / ${labels.language}`}
    >
      <span className="sr-only md:not-sr-only md:text-muted-foreground">{labels.theme}</span>
      <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5 bg-background">
        {mounted ? (
          <>
            <button
              type="button"
              title={labels.light}
              aria-label={labels.light}
              aria-pressed={theme === "light"}
              onClick={() => setTheme("light")}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground aria-pressed:bg-accent aria-pressed:text-accent-foreground"
            >
              <Sun className="size-3.5" />
            </button>
            <button
              type="button"
              title={labels.system}
              aria-label={labels.system}
              aria-pressed={theme === "system"}
              onClick={() => setTheme("system")}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground aria-pressed:bg-accent aria-pressed:text-accent-foreground"
            >
              <Monitor className="size-3.5" />
            </button>
            <button
              type="button"
              title={labels.dark}
              aria-label={labels.dark}
              aria-pressed={theme === "dark"}
              onClick={() => setTheme("dark")}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground aria-pressed:bg-accent aria-pressed:text-accent-foreground"
            >
              <Moon className="size-3.5" />
            </button>
          </>
        ) : (
          <span className="inline-block h-7 w-18" aria-hidden />
        )}
      </div>
      <span className="sr-only md:not-sr-only md:text-muted-foreground">{labels.language}</span>
      <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5 bg-background">
        <button
          type="button"
          onClick={() => setLocale("en")}
          aria-pressed={locale === "en"}
          className="rounded px-2 py-1 font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground aria-pressed:bg-accent aria-pressed:text-accent-foreground"
        >
          {labels.english}
        </button>
        <button
          type="button"
          onClick={() => setLocale("ar")}
          aria-pressed={locale === "ar"}
          className="rounded px-2 py-1 font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground aria-pressed:bg-accent aria-pressed:text-accent-foreground"
        >
          {labels.arabic}
        </button>
      </div>
    </div>
  );
}
