import { requireAuth } from "@/lib/auth";
import { getCategories } from "@/lib/data";
import { Sidebar } from "@/components/layout/sidebar";
import { AddFab, BottomNav, MobileHeader } from "@/components/layout/mobile-nav";
import { CategoriesProvider } from "@/components/providers/categories-provider";
import { TransactionDialogProvider } from "@/components/transactions/transaction-dialog-provider";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();
  const categories = await getCategories();

  return (
    <CategoriesProvider categories={categories}>
      <TransactionDialogProvider>
        <div className="flex min-h-dvh">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <MobileHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-5 pb-28 md:px-8 md:pt-8 md:pb-10">
              {children}
            </main>
          </div>
        </div>
        <AddFab />
        <BottomNav />
      </TransactionDialogProvider>
    </CategoriesProvider>
  );
}
