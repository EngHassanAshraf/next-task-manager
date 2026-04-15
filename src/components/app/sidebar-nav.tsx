"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutList,
  AlertTriangle,
  Trophy,
  BarChart2,
  Settings,
  User,
  LogOut,
  Zap,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/cn";

type IconKey = "tasks" | "malfunctions" | "achievements" | "reports" | "account" | "admin";

const ICONS: Record<IconKey, React.ElementType> = {
  tasks:          LayoutList,
  malfunctions:   AlertTriangle,
  achievements:   Trophy,
  reports:        BarChart2,
  account:        User,
  admin:          Settings,
};

type NavLink = { href: string; label: string; icon: IconKey };
type NavGroup = { label: string; links: NavLink[] };

export function SidebarNav({
  appTitle,
  groups,
  user,
}: {
  appTitle: string;
  groups: NavGroup[];
  user: { name: string; role: string };
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname?.startsWith(`${href}/`);
  }

  return (
    <aside
      className={cn(
        "flex h-full w-(--sidebar-width) flex-col",
        "border-e border-sidebar-border bg-sidebar",
      )}
    >
      {/* Logo / App title */}
      <div className="flex h-(--header-height) shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
          <Zap className="size-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold text-foreground">{appTitle}</span>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.links.map((link) => {
                const Icon = ICONS[link.icon];
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">{user.name}</p>
            <p className="truncate text-[10px] text-muted-foreground">{user.role}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Sign out"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
