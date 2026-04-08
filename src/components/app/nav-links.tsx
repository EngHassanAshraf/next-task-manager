"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NavLinks({
  links,
  className,
}: {
  links: Array<{ href: string; label: string }>;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div className={cn("flex items-center", className)}>
      <nav aria-label="Main" className="hidden flex-wrap gap-1 text-sm md:flex">
        {links.map((l) => {
          const active = pathname === l.href || pathname?.startsWith(`${l.href}/`);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-md px-2 py-1 font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Menu">
              <Menu className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {links.map((l) => {
              const active = pathname === l.href || pathname?.startsWith(`${l.href}/`);
              return (
                <DropdownMenuItem key={l.href} asChild>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(active ? "font-medium" : undefined)}
                  >
                    {l.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

