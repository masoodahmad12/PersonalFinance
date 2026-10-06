"use client";

import { createContext, use, useContext } from "react";
import type { CategoryDTO } from "@/lib/types";

const CategoriesContext = createContext<Promise<CategoryDTO[]>>(Promise.resolve([]));

/** Takes a promise so the app shell can stream before categories have loaded. */
export function CategoriesProvider({
  categories,
  children,
}: {
  categories: Promise<CategoryDTO[]>;
  children: React.ReactNode;
}) {
  return <CategoriesContext.Provider value={categories}>{children}</CategoriesContext.Provider>;
}

/** Suspends until categories have loaded, so callers need a Suspense boundary above them. */
export function useCategories() {
  return use(useContext(CategoriesContext));
}
