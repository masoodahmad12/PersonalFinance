"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Long enough for the intro animation to play; measured from navigation start. */
const MIN_VISIBLE_MS = 900;
const EXIT_MS = 450;

const PARTICLES = [
  { left: "12%", delay: "0s", size: 6 },
  { left: "28%", delay: "1.1s", size: 4 },
  { left: "46%", delay: "0.5s", size: 5 },
  { left: "63%", delay: "1.6s", size: 7 },
  { left: "78%", delay: "0.8s", size: 4 },
  { left: "90%", delay: "2s", size: 5 },
];

/**
 * Covers the server-rendered page until React has hydrated and taps start working. Animations are
 * CSS-only (transform/opacity) so they stay smooth while the main thread is busy hydrating.
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "leaving" | "gone">("visible");

  useEffect(() => {
    const wait = Math.max(0, MIN_VISIBLE_MS - performance.now());
    const leave = setTimeout(() => setPhase("leaving"), wait);
    const remove = setTimeout(() => setPhase("gone"), wait + EXIT_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(remove);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div aria-hidden className={cn("splash", phase === "leaving" && "splash-leaving")}>
      <div className="splash-glow splash-glow-a" />
      <div className="splash-glow splash-glow-b" />

      {PARTICLES.map((p) => (
        <span
          key={p.left}
          className="splash-particle"
          style={{ left: p.left, width: p.size, height: p.size, animationDelay: p.delay }}
        />
      ))}

      <div className="relative flex flex-col items-center">
        <div className="relative flex size-24 items-center justify-center">
          <span className="splash-ring" />
          <span className="splash-ring [animation-delay:0.8s]" />
          <span className="splash-ring [animation-delay:1.6s]" />
          <div className="splash-logo">
            <Image src="/icon-192.png" alt="" width={96} height={96} priority className="size-24" />
            <span className="splash-shine" />
          </div>
        </div>

        <h1 className="splash-title">Finance Tracker</h1>
        <p className="splash-tagline">Every rupee, in its place</p>

        <div className="splash-dots">
          <span className="bg-income" />
          <span className="bg-expense [animation-delay:0.15s]" />
          <span className="bg-returned [animation-delay:0.3s]" />
        </div>
      </div>
    </div>
  );
}
