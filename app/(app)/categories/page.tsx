import type { Metadata } from "next";
import { getCategories, getCategoryUsage } from "@/lib/data";
import { CategoriesView } from "./categories-view";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const [categories, usage] = await Promise.all([getCategories(), getCategoryUsage()]);
  return <CategoriesView categories={categories} usage={usage} />;
}
