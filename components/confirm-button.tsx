"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ConfirmProps = {
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
};

function ConfirmContent({ title, description, confirmLabel = "Delete", onConfirm }: ConfirmProps) {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={onConfirm}>
          {confirmLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function ConfirmButton({
  disabled,
  children,
  ...props
}: ConfirmProps & { disabled?: boolean; children: React.ReactNode }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={disabled}>
        {children}
      </AlertDialogTrigger>
      <ConfirmContent {...props} />
    </AlertDialog>
  );
}

/** Controlled variant, for confirmations triggered from menus that unmount on close. */
export function ConfirmDialog({
  open,
  onOpenChange,
  ...props
}: ConfirmProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <ConfirmContent {...props} />
    </AlertDialog>
  );
}
