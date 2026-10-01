"use client";

import { useEffect, useRef } from "react";
import { useIsDesktop } from "@/hooks/use-media-query";
import { useVisibleArea } from "@/hooks/use-visual-viewport";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

/** A centered dialog on desktop and a bottom sheet on mobile. */
export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const isDesktop = useIsDesktop();
  const visible = useVisibleArea(open && !isDesktop);
  const keyboardOpen = !!visible?.keyboardOpen;
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!keyboardOpen) return;
    const focused = document.activeElement;
    if (!(focused instanceof HTMLElement) || !bodyRef.current?.contains(focused)) return;
    const frame = requestAnimationFrame(() => focused.scrollIntoView({ block: "nearest" }));
    return () => cancelAnimationFrame(frame);
  }, [keyboardOpen, visible?.height]);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className={description ? undefined : "sr-only"}>
              {description ?? title}
            </DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent
        className="max-h-[92dvh]"
        style={
          keyboardOpen && visible
            ? { bottom: visible.bottom, maxHeight: visible.height - 8 }
            : undefined
        }
      >
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription className={description ? undefined : "sr-only"}>
            {description ?? title}
          </DrawerDescription>
        </DrawerHeader>
        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pb-safe">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
