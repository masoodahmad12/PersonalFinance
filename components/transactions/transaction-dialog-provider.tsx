"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { TransactionForm } from "@/components/forms/transaction-form";
import type { TransactionType } from "@/lib/constants";
import type { TransactionDTO } from "@/lib/types";

type Ctx = {
  openCreate: (type?: TransactionType) => void;
  openEdit: (tx: TransactionDTO) => void;
};

const TransactionDialogContext = createContext<Ctx | null>(null);

export function TransactionDialogProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionDTO | null>(null);
  const [defaultType, setDefaultType] = useState<TransactionType>("expense");
  const [formKey, setFormKey] = useState(0);

  const openCreate = useCallback((type: TransactionType = "expense") => {
    setEditing(null);
    setDefaultType(type);
    setFormKey((k) => k + 1);
    setOpen(true);
  }, []);

  const openEdit = useCallback((tx: TransactionDTO) => {
    setEditing(tx);
    setFormKey((k) => k + 1);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openCreate, openEdit }), [openCreate, openEdit]);

  return (
    <TransactionDialogContext.Provider value={value}>
      {children}
      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit transaction" : "New transaction"}
      >
        <TransactionForm
          key={formKey}
          transaction={editing}
          defaultType={defaultType}
          onDone={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </ResponsiveDialog>
    </TransactionDialogContext.Provider>
  );
}

export function useTransactionDialog() {
  const ctx = useContext(TransactionDialogContext);
  if (!ctx) throw new Error("useTransactionDialog must be used inside TransactionDialogProvider");
  return ctx;
}
