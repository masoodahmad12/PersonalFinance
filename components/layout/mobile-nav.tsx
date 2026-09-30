"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Settings, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTransactionDialog } from "@/components/transactions/transaction-dialog-provider";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive } from "./nav-items";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-lg md:hidden">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wallet className="size-4" />
        </span>
        <span className="font-semibold tracking-tight">Finance</span>
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button variant="ghost" size="icon" asChild aria-label="Settings">
          <Link href="/settings">
            <Settings className="size-4.5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 pb-safe backdrop-blur-lg md:hidden">
      <div className="grid h-16 grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors",
                active && "text-primary",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                  active && "bg-primary/12",
                )}
              >
                <item.icon className="size-5" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AddFab() {
  const { openCreate } = useTransactionDialog();
  const pathname = usePathname();
  if (!["/", "/transactions"].includes(pathname)) return null;

  return (
    <Button
      onClick={() => openCreate()}
      aria-label="Add transaction"
      className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 size-14 rounded-full shadow-lg shadow-primary/40 md:hidden [&_svg:not([class*='size-'])]:size-6"
    >
      <Plus />
    </Button>
  );
}
