"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TransactionType } from "@/lib/constants";
import { useTransactionDialog } from "./transaction-dialog-provider";

export function AddTransactionButton({
  type,
  className,
  label = "Add transaction",
}: {
  type?: TransactionType;
  className?: string;
  label?: string;
}) {
  const { openCreate } = useTransactionDialog();
  return (
    <Button className={className} onClick={() => openCreate(type)}>
      <Plus /> {label}
    </Button>
  );
}
