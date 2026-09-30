"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, MoreVertical, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCategory, restoreDefaultCategories, setCategoryArchived } from "@/actions/categories";
import { CategoryIcon } from "@/components/category-icon";
import { ConfirmDialog } from "@/components/confirm-button";
import { EmptyState } from "@/components/empty-state";
import { CategoryForm } from "@/components/forms/category-form";
import { PageHeader } from "@/components/page-header";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TRANSACTION_TYPES, TYPE_LABELS, type TransactionType } from "@/lib/constants";
import type { CategoryDTO } from "@/lib/types";

export function CategoriesView({
  categories,
  usage,
}: {
  categories: CategoryDTO[];
  usage: Record<string, number>;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TransactionType>("expense");
  const [showArchived, setShowArchived] = useState(false);
  const [dialog, setDialog] = useState<{ open: boolean; category: CategoryDTO | null; key: number }>(
    { open: false, category: null, key: 0 },
  );
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<CategoryDTO | null>(null);

  const visible = categories.filter((c) => c.type === tab && (showArchived || !c.isArchived));
  const archivedCount = categories.filter((c) => c.type === tab && c.isArchived).length;

  const openDialog = (category: CategoryDTO | null) =>
    setDialog((d) => ({ open: true, category, key: d.key + 1 }));

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) return void toast.error(res.error);
      toast.success(success);
      router.refresh();
    });

  return (
    <>
      <PageHeader
        title="Categories"
        description="Organise your income, expenses and returned amounts."
        actions={
          <Button onClick={() => openDialog(null)}>
            <Plus /> New category
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TransactionType)}>
          <TabsList>
            {TRANSACTION_TYPES.map((t) => (
              <TabsTrigger key={t} value={t} className="px-3">
                {t === "returned" ? "Returned" : TYPE_LABELS[t]}
                <span className="ml-1 text-xs text-muted-foreground tabular">
                  {categories.filter((c) => c.type === t && !c.isArchived).length}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {archivedCount > 0 && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Switch checked={showArchived} onCheckedChange={setShowArchived} />
            Show archived ({archivedCount})
          </label>
        )}
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No categories yet"
          description="Start with a ready-made set, or create your own."
          action={
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => run(restoreDefaultCategories, "Default categories added")}
            >
              Add default categories
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Tags}
          title={`No ${TYPE_LABELS[tab].toLowerCase()} categories`}
          action={
            <Button variant="outline" onClick={() => openDialog(null)}>
              <Plus /> Add one
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <div
              key={c.id}
              className="group flex items-center gap-3 rounded-2xl border bg-card p-3 transition-shadow hover:shadow-md data-[archived=true]:opacity-60"
              data-archived={c.isArchived}
            >
              <CategoryIcon icon={c.icon} color={c.color} />
              <button className="min-w-0 flex-1 text-left" onClick={() => openDialog(c)}>
                <p className="truncate font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {usage[c.id] ?? 0} transaction{(usage[c.id] ?? 0) === 1 ? "" : "s"}
                </p>
              </button>
              {c.isArchived && <Badge variant="secondary">Archived</Badge>}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Category actions" disabled={pending}>
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openDialog(c)}>
                    <Pencil /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      run(
                        () => setCategoryArchived(c.id, !c.isArchived),
                        c.isArchived ? "Category restored" : "Category archived",
                      )
                    }
                  >
                    {c.isArchived ? <ArchiveRestore /> : <Archive />}
                    {c.isArchived ? "Unarchive" : "Archive"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setToDelete(c)}
                  >
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`Delete "${toDelete?.name ?? ""}"?`}
        description="Categories that are in use can't be deleted. Archive them instead."
        onConfirm={() => {
          if (toDelete) run(() => deleteCategory(toDelete.id), "Category deleted");
          setToDelete(null);
        }}
      />

      <ResponsiveDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        title={dialog.category ? "Edit category" : "New category"}
      >
        <CategoryForm
          key={dialog.key}
          category={dialog.category}
          defaultType={tab}
          onDone={() => {
            setDialog((d) => ({ ...d, open: false }));
            router.refresh();
          }}
        />
      </ResponsiveDialog>
    </>
  );
}
