import "server-only";
import type { PipelineStage, Types } from "mongoose";
import { connectDB } from "./db";
import { TIMEZONE, type TransactionType } from "./constants";
import { daysInMonth, monthRange, shiftMonthKey } from "./dates";
import type { CategoryTotal, Summary } from "./types";
import { Transaction } from "@/models/Transaction";

function buildSummary(rows: { _id: TransactionType; total: number; count: number }[]): Summary {
  const get = (t: TransactionType) => rows.find((r) => r._id === t)?.total ?? 0;
  const income = get("income");
  const expense = get("expense");
  const returned = get("returned");
  const actualExpense = expense - returned;
  return {
    income,
    expense,
    returned,
    actualExpense,
    net: income - actualExpense,
    count: rows.reduce((s, r) => s + r.count, 0),
  };
}

export async function getSummary(start: Date, end: Date): Promise<Summary> {
  await connectDB();
  const rows = await Transaction.aggregate<{ _id: TransactionType; total: number; count: number }>([
    { $match: { date: { $gte: start, $lt: end } } },
    { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  return buildSummary(rows);
}

export async function getMonthSummary(monthKey: string): Promise<Summary> {
  const { start, end } = monthRange(monthKey);
  return getSummary(start, end);
}

export async function getCategoryTotals(
  type: TransactionType,
  start: Date,
  end: Date,
): Promise<CategoryTotal[]> {
  await connectDB();
  const rows = await Transaction.aggregate<{
    _id: Types.ObjectId;
    total: number;
    count: number;
    category?: { name: string; color: string; icon: string };
  }>([
    { $match: { type, date: { $gte: start, $lt: end } } },
    { $group: { _id: "$categoryId", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
  ]);
  return rows.map((r) => ({
    id: r._id.toString(),
    name: r.category?.name ?? "Deleted category",
    color: r.category?.color ?? "#64748b",
    icon: r.category?.icon ?? "circle-help",
    total: r.total,
    count: r.count,
  }));
}

export type MonthlyPoint = { month: string } & Summary;

/** Summary per month for `count` months ending at (and including) `endMonthKey`. */
export async function getMonthlyTrend(endMonthKey: string, count: number): Promise<MonthlyPoint[]> {
  await connectDB();
  const firstMonth = shiftMonthKey(endMonthKey, -(count - 1));
  const start = monthRange(firstMonth).start;
  const end = monthRange(endMonthKey).end;

  const rows = await Transaction.aggregate<{
    _id: { month: string; type: TransactionType };
    total: number;
    count: number;
  }>([
    { $match: { date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: {
          month: { $dateToString: { format: "%Y-%m", date: "$date", timezone: TIMEZONE } },
          type: "$type",
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  return Array.from({ length: count }, (_, i) => {
    const month = shiftMonthKey(firstMonth, i);
    const monthRows = rows
      .filter((r) => r._id.month === month)
      .map((r) => ({ _id: r._id.type, total: r.total, count: r.count }));
    return { month, ...buildSummary(monthRows) };
  });
}

export type DailyPoint = { date: string; expense: number; returned: number; income: number };

export async function getDailySeries(monthKey: string): Promise<DailyPoint[]> {
  await connectDB();
  const { start, end } = monthRange(monthKey);
  const rows = await Transaction.aggregate<{
    _id: { day: string; type: TransactionType };
    total: number;
  }>([
    { $match: { date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: TIMEZONE } },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const lookup = new Map(rows.map((r) => [`${r._id.day}|${r._id.type}`, r.total]));
  return daysInMonth(monthKey).map((date) => ({
    date,
    expense: lookup.get(`${date}|expense`) ?? 0,
    returned: lookup.get(`${date}|returned`) ?? 0,
    income: lookup.get(`${date}|income`) ?? 0,
  }));
}

export type CategoryTrend = {
  months: string[];
  categories: { id: string; name: string; color: string }[];
  rows: Record<string, number | string>[];
};

/** Monthly totals of the top categories of `type`; the rest are folded into "Others". */
export async function getCategoryTrend(
  type: TransactionType,
  endMonthKey: string,
  count: number,
  top = 5,
): Promise<CategoryTrend> {
  await connectDB();
  const firstMonth = shiftMonthKey(endMonthKey, -(count - 1));
  const start = monthRange(firstMonth).start;
  const end = monthRange(endMonthKey).end;
  const months = Array.from({ length: count }, (_, i) => shiftMonthKey(firstMonth, i));

  const pipeline: PipelineStage[] = [
    { $match: { type, date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: {
          month: { $dateToString: { format: "%Y-%m", date: "$date", timezone: TIMEZONE } },
          category: "$categoryId",
        },
        total: { $sum: "$amount" },
      },
    },
  ];
  const rows = await Transaction.aggregate<{
    _id: { month: string; category: Types.ObjectId };
    total: number;
  }>(pipeline);

  const totals = await getCategoryTotals(type, start, end);
  const topCats = totals.slice(0, top);
  const topIds = new Set(topCats.map((c) => c.id));
  const hasOthers = totals.length > top;

  const categories = topCats.map((c) => ({ id: c.id, name: c.name, color: c.color }));
  if (hasOthers) categories.push({ id: "others", name: "Others", color: "#94a3b8" });

  const table = months.map((month) => {
    const row: Record<string, number | string> = { month };
    for (const c of categories) row[c.id] = 0;
    for (const r of rows) {
      if (r._id.month !== month) continue;
      const id = r._id.category.toString();
      const key = topIds.has(id) ? id : "others";
      row[key] = ((row[key] as number) ?? 0) + r.total;
    }
    return row;
  });

  return { months, categories, rows: table };
}
