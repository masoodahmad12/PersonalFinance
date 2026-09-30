import type { Frequency, TransactionType } from "./constants";

export type CategoryDTO = {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  isArchived: boolean;
};

export type CategoryRef = Pick<CategoryDTO, "id" | "name" | "color" | "icon">;

export type TransactionDTO = {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  category: CategoryRef | null;
  date: string;
  note: string;
  isRecurring: boolean;
};

export type RecurringDTO = {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  category: CategoryRef | null;
  note: string;
  frequency: Frequency;
  interval: number;
  startDate: string;
  endDate: string | null;
  nextRunDate: string;
  isActive: boolean;
};

export type Summary = {
  income: number;
  expense: number;
  returned: number;
  actualExpense: number;
  net: number;
  count: number;
};

export type CategoryTotal = CategoryRef & { total: number; count: number };
