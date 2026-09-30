"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Plus, Wallet } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTransactionDialog } from "@/components/transactions/transaction-dialog-provider";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, SETTINGS_ITEM, isActive } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();
  const { openCreate } = useTransactionDialog();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-sidebar px-3 py-5 md:flex">
      <Link href="/" className="mb-6 flex items-center gap-2.5 px-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
          <Wallet className="size-5" />
        </span>
        <span className="text-lg font-semibold tracking-tight">Finance</span>
      </Link>

      <Button className="mb-5 h-10 justify-start gap-2 px-3" onClick={() => openCreate()}>
        <Plus /> Add transaction
      </Button>

      <nav className="flex flex-1 flex-col gap-1">
        {[...NAV_ITEMS, SETTINGS_ITEM].map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active && "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
            >
              <item.icon className={cn("size-4.5", active && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between border-t px-1 pt-4">
        <ThemeToggle />
        <form action={logoutAction}>
          <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground">
            <LogOut /> Log out
          </Button>
        </form>
      </div>
    </aside>
  );
}
