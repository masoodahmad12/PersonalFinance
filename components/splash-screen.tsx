"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Covers the server-rendered page until React has hydrated and taps start working. */
export function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "leaving" | "gone">("visible");

  useEffect(() => {
    setPhase("leaving");
    const timer = setTimeout(() => setPhase("gone"), 300);
    return () => clearTimeout(timer);
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-background transition-opacity duration-300",
        phase === "leaving" && "pointer-events-none opacity-0",
      )}
    >
      <Image
        src="/icon-192.png"
        alt=""
        width={88}
        height={88}
        priority
        className="rounded-[22px] shadow-lg shadow-primary/25"
      />
      <span className="size-6 animate-spin rounded-full border-2 border-muted-foreground/25 border-t-primary" />
    </div>
  );
}
