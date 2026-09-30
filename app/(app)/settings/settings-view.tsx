"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Loader2, LogOut, Monitor, Moon, RotateCcw, Sun } from "lucide-react";
import { toast } from "sonner";
import { logoutAction } from "@/actions/auth";
import { restoreDefaultCategories } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  return (
    <div className="grid max-w-2xl gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how the app looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors hover:bg-muted",
                  mounted && theme === t.value && "border-primary bg-primary/8 text-primary",
                )}
              >
                <t.icon className="size-5" />
                {t.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Currency</span>
            <span className="font-medium">Pakistani Rupee (PKR)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Time zone</span>
            <span className="font-medium">Asia/Karachi</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Actual expense</span>
            <span className="font-medium">Total expense - amount returned</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
          <CardDescription>
            Adds the starter categories again if you have no categories at all.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await restoreDefaultCategories();
                toast.success("Checked default categories");
                router.refresh();
              })
            }
          >
            {pending ? <Loader2 className="animate-spin" /> : <RotateCcw />}
            Restore default categories
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>You&apos;ll need your password to sign back in.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={logoutAction}>
            <Button type="submit" variant="destructive">
              <LogOut /> Log out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
