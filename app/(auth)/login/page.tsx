import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 size-80 rounded-full bg-income/15 blur-3xl" />
      </div>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Wallet className="size-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Finance Tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your password to continue</p>
        </div>
        <div className="rounded-2xl border bg-card/80 p-6 shadow-xl shadow-black/5 backdrop-blur">
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
