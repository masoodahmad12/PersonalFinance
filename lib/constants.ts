export const TRANSACTION_TYPES = ["income", "expense", "returned"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TYPE_LABELS: Record<TransactionType, string> = {
  income: "Income",
  expense: "Expense",
  returned: "Amount Returned",
};

export const TYPE_SHORT_LABELS: Record<TransactionType, string> = {
  income: "Income",
  expense: "Expense",
  returned: "Returned",
};

export const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export const FREQUENCY_LABELS: Record<Frequency, { one: string; many: string }> = {
  daily: { one: "day", many: "days" },
  weekly: { one: "week", many: "weeks" },
  monthly: { one: "month", many: "months" },
  yearly: { one: "year", many: "years" },
};

export const CATEGORY_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#64748b",
  "#a16207",
] as const;

export const TIMEZONE = "Asia/Karachi";
export const TZ_OFFSET = "+05:00";

export const PAGE_SIZE = 30;

export const REPORT_RANGES = [3, 6, 12] as const;

export const DEFAULT_CATEGORIES: {
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
}[] = [
  { name: "Salary", type: "income", color: "#10b981", icon: "briefcase" },
  { name: "Freelance", type: "income", color: "#06b6d4", icon: "laptop" },
  { name: "Business", type: "income", color: "#6366f1", icon: "store" },
  { name: "Investments", type: "income", color: "#8b5cf6", icon: "trending-up" },
  { name: "Gifts", type: "income", color: "#ec4899", icon: "gift" },
  { name: "Other Income", type: "income", color: "#64748b", icon: "wallet" },

  { name: "Groceries", type: "expense", color: "#22c55e", icon: "shopping-cart" },
  { name: "Food & Dining", type: "expense", color: "#f97316", icon: "utensils" },
  { name: "Transport", type: "expense", color: "#0ea5e9", icon: "car" },
  { name: "Fuel", type: "expense", color: "#f59e0b", icon: "fuel" },
  { name: "Bills", type: "expense", color: "#f43f5e", icon: "receipt" },
  { name: "Rent", type: "expense", color: "#8b5cf6", icon: "home" },
  { name: "Shopping", type: "expense", color: "#ec4899", icon: "shopping-bag" },
  { name: "Health", type: "expense", color: "#14b8a6", icon: "heart-pulse" },
  { name: "Education", type: "expense", color: "#3b82f6", icon: "graduation-cap" },
  { name: "Entertainment", type: "expense", color: "#eab308", icon: "film" },
  { name: "POS", type: "expense", color: "#6366f1", icon: "credit-card" },
  { name: "Cash", type: "expense", color: "#84cc16", icon: "banknote" },
  { name: "Other", type: "expense", color: "#64748b", icon: "circle-ellipsis" },

  { name: "Refund", type: "returned", color: "#10b981", icon: "undo" },
  { name: "Friend Payback", type: "returned", color: "#06b6d4", icon: "users" },
  { name: "Cashback", type: "returned", color: "#f59e0b", icon: "coins" },
  { name: "Reimbursement", type: "returned", color: "#6366f1", icon: "briefcase" },
];
