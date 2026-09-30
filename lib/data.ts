import "server-only";
import { Types, type QueryFilter } from "mongoose";
import { connectDB } from "./db";
import { DEFAULT_CATEGORIES, PAGE_SIZE, TRANSACTION_TYPES, type TransactionType } from "./constants";
import { fromYmd, isValidYmd, toYmd } from "./dates";
import type { CategoryDTO, CategoryRef, RecurringDTO, TransactionDTO } from "./types";
import { Category, type CategoryDoc } from "@/models/Category";
import { Transaction, type TransactionDoc } from "@/models/Transaction";
import { Recurring } from "@/models/Recurring";

type WithId<T> = T & { _id: Types.ObjectId };

function toCategoryDTO(c: WithId<CategoryDoc>): CategoryDTO {
  return {
    id: c._id.toString(),
    name: c.name,
    type: c.type as TransactionType,
    color: c.color,
    icon: c.icon,
    isArchived: !!c.isArchived,
  };
}

function toCategoryRef(c: WithId<CategoryDoc> | null | undefined): CategoryRef | null {
  if (!c) return null;
  return { id: c._id.toString(), name: c.name, color: c.color, icon: c.icon };
}

async function categoryMap(ids: Types.ObjectId[]) {
  const unique = [...new Set(ids.map(String))];
  const cats = await Category.find({ _id: { $in: unique } }).lean<WithId<CategoryDoc>[]>();
  return new Map(cats.map((c) => [c._id.toString(), c]));
}

export async function ensureDefaultCategories() {
  await connectDB();
  if ((await Category.estimatedDocumentCount()) === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES);
  }
}

export async function getCategories(): Promise<CategoryDTO[]> {
  await connectDB();
  const cats = await Category.find().sort({ name: 1 }).lean<WithId<CategoryDoc>[]>();
  return cats.map(toCategoryDTO);
}

export async function getCategoryUsage(): Promise<Record<string, number>> {
  await connectDB();
  const rows = await Transaction.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [r._id.toString(), r.count]));
}

export type TransactionFilters = {
  q?: string;
  type?: string;
  category?: string;
  from?: string;
  to?: string;
  page?: number;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getTransactions(filters: TransactionFilters) {
  await connectDB();
  const query: QueryFilter<TransactionDoc> = {};

  if (filters.type && (TRANSACTION_TYPES as readonly string[]).includes(filters.type)) {
    query.type = filters.type as TransactionType;
  }
  if (filters.category && Types.ObjectId.isValid(filters.category)) {
    query.categoryId = new Types.ObjectId(filters.category);
  }
  const date: Record<string, Date> = {};
  if (isValidYmd(filters.from)) date.$gte = fromYmd(filters.from);
  if (isValidYmd(filters.to)) date.$lte = fromYmd(filters.to);
  if (Object.keys(date).length) query.date = date;

  const q = filters.q?.trim();
  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    const matchingCats = await Category.find({ name: regex }, { _id: 1 }).lean();
    query.$or = [{ note: regex }, { categoryId: { $in: matchingCats.map((c) => c._id) } }];
    const asNumber = Number(q.replace(/,/g, ""));
    if (Number.isFinite(asNumber) && asNumber > 0) query.$or.push({ amount: asNumber });
  }

  const page = Math.max(1, filters.page ?? 1);
  const [docs, total, totals] = await Promise.all([
    Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean<WithId<TransactionDoc>[]>(),
    Transaction.countDocuments(query),
    Transaction.aggregate<{ _id: TransactionType; total: number }>([
      { $match: query },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]),
  ]);

  const cats = await categoryMap(docs.map((d) => d.categoryId));
  const byType = Object.fromEntries(totals.map((t) => [t._id, t.total])) as Partial<
    Record<TransactionType, number>
  >;

  return {
    items: docs.map((d) => toTransactionDTO(d, cats)),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    totals: {
      income: byType.income ?? 0,
      expense: byType.expense ?? 0,
      returned: byType.returned ?? 0,
    },
  };
}

function toTransactionDTO(
  d: WithId<TransactionDoc>,
  cats: Map<string, WithId<CategoryDoc>>,
): TransactionDTO {
  return {
    id: d._id.toString(),
    type: d.type as TransactionType,
    amount: d.amount,
    categoryId: d.categoryId.toString(),
    category: toCategoryRef(cats.get(d.categoryId.toString())),
    date: toYmd(d.date),
    note: d.note ?? "",
    isRecurring: !!d.recurringId,
  };
}

export async function getRecentTransactions(limit = 6): Promise<TransactionDTO[]> {
  await connectDB();
  const docs = await Transaction.find()
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .lean<WithId<TransactionDoc>[]>();
  const cats = await categoryMap(docs.map((d) => d.categoryId));
  return docs.map((d) => toTransactionDTO(d, cats));
}

export async function getRecurring(options: { activeOnly?: boolean; limit?: number } = {}) {
  await connectDB();
  const query = options.activeOnly ? { isActive: true } : {};
  let cursor = Recurring.find(query).sort({ isActive: -1, nextRunDate: 1 });
  if (options.limit) cursor = cursor.limit(options.limit);
  const docs = await cursor.lean();
  const cats = await categoryMap(docs.map((d) => d.categoryId));

  return docs.map(
    (d): RecurringDTO => ({
      id: d._id.toString(),
      type: d.type as TransactionType,
      amount: d.amount,
      categoryId: d.categoryId.toString(),
      category: toCategoryRef(cats.get(d.categoryId.toString())),
      note: d.note ?? "",
      frequency: d.frequency,
      interval: d.interval,
      startDate: toYmd(d.startDate),
      endDate: d.endDate ? toYmd(d.endDate) : null,
      nextRunDate: toYmd(d.nextRunDate),
      isActive: !!d.isActive,
    }),
  );
}
