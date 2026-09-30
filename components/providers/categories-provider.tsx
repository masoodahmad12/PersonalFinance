"use client";

import { createContext, useContext } from "react";
import type { CategoryDTO } from "@/lib/types";

const CategoriesContext = createContext<CategoryDTO[]>([]);

export function CategoriesProvider({
  categories,
  children,
}: {
  categories: CategoryDTO[];
  children: React.ReactNode;
}) {
  return <CategoriesContext.Provider value={categories}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  return useContext(CategoriesContext);
}
