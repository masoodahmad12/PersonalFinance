"use client";

import { useEffect, useState } from "react";

export type VisibleArea = {
  /** Gap between the bottom of the layout viewport and the bottom of the visible area. */
  bottom: number;
  height: number;
  keyboardOpen: boolean;
};

const KEYBOARD_THRESHOLD = 120;

/**
 * Tracks the part of the screen that is actually visible. On iOS the keyboard shrinks the visual
 * viewport without moving `position: fixed` elements, so bottom sheets end up behind it.
 */
export function useVisibleArea(enabled: boolean): VisibleArea | null {
  const [area, setArea] = useState<VisibleArea | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!enabled || !vv) {
      setArea(null);
      return;
    }

    const update = () => {
      const covered = window.innerHeight - vv.height;
      setArea({
        bottom: Math.max(0, covered - vv.offsetTop),
        height: vv.height,
        keyboardOpen: covered > KEYBOARD_THRESHOLD,
      });
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [enabled]);

  return area;
}
