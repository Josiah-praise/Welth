"use client";

import { serializableTransaction } from "@/actions/Transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DATE_RANGES: Record<string, { label: string; days: number }> = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: 0 },
};

type props = { transactions: serializableTransaction[] };

function AccountsBarChart({ transactions }: props) {
  const [dateRange, setDateRange] = useState<string>("7D");
  const { resolvedTheme } = useTheme();

  const labelColor = resolvedTheme === "dark" ? "#D1D5DB" : "#4B5563"; // Tailwind gray-300 for dark, gray-700 for light

  const {
    data,
    grossIncomeAndExpense: { income, expense },
  } = useMemo(() => {
    const days = DATE_RANGES[dateRange].days;
    const today = new Date();
    const startDate = days
      ? startOfDay(subDays(today, days))
      : startOfDay(new Date(0));

    const filteredTransactions = transactions.filter((tx) => {
      return tx.date > startDate && tx.date < endOfDay(today);
    });

    const groupedTransactions = filteredTransactions.reduce<
      Record<string, { income: number; expense: number }>
    >((acc, tx) => {
      const formattedDate = format(tx.date, "MMM-d");

      if (!acc[formattedDate]) {
        acc[formattedDate] = { income: 0, expense: 0 };
      }

      if (tx.type === "INCOME") {
        acc[formattedDate].income += tx.amount;
      } else if (tx.type === "EXPENSE") {
        acc[formattedDate].expense += tx.amount;
      }

      return acc;
    }, {});

    const data = Object.entries(groupedTransactions).map(
      ([key, { income, expense }]) => ({
        name: key,
        income,
        expense,
      })
    );

    const grossIncomeAndExpense = filteredTransactions.reduce<{
      income: number;
      expense: number;
    }>(
      (acc, tx) => {
        if (tx.type === "INCOME") {
          acc.income += tx.amount;
        } else if (tx.type === "EXPENSE") {
          acc.expense += tx.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );

    return { data, grossIncomeAndExpense };
  }, [dateRange, transactions]);

  return (
    <div className="mx-2 sm:mx-0">
      <Card className="my-8 rounded-none sm:rounded-md bg-background text-foreground">
        <CardHeader className="space-y-3 sm:space-y-9">
          <CardTitle className="flex flex-col gap-2 sm:gap-0 sm:flex-row justify-between">
            <h3 className="text-sm sm:text-base text-foreground">
              Transaction Overview
            </h3>
            <Select
              value={dateRange}
              onValueChange={(value) => setDateRange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Time filter" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DATE_RANGES).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardTitle>

          <div className="flex sm:flex-row flex-col sm:items-center sm:justify-around">
            <div className="flex sm:flex-col sm:items-center justify-between">
              <span className="text-muted-foreground">Total Income</span>
              <span className="sm:text-2xl font-semibold text-green-500 dark:text-green-400">
                &#8358;{Number(income.toFixed(2)).toLocaleString()}
              </span>
            </div>
            <div className="flex sm:flex-col sm:items-center justify-between sm:justify-center">
              <span className="text-muted-foreground">Total Expense</span>
              <span className="sm:text-2xl font-semibold text-red-500 dark:text-red-400">
                &#8358;{Number(expense.toFixed(2)).toLocaleString()}
              </span>
            </div>
            <div className="flex sm:flex-col sm:items-center justify-between sm:justify-center">
              <span className="text-muted-foreground">Net Flow</span>
              <span
                className={`sm:text-2xl font-semibold ${
                  income - expense < 0
                    ? "text-red-500 dark:text-red-400"
                    : "text-green-500 dark:text-green-400"
                }`}
              >
                {income - expense >= 0 ? "+" : "-"}&#8358;
                {Math.abs(income - expense).toFixed(2)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
              barGap={8}
              barCategoryGap={20}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient
                  id="expenseGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                tick={{ fill: labelColor, fontSize: 12 }}
                dy={10}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                tick={{ fill: labelColor, fontSize: 12 }}
                width={60}
              />
              <Tooltip
                cursor={{ fill: "rgba(224, 231, 255, 0.2)" }}
                contentStyle={{
                  borderRadius: "6px",
                  border: "none",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                }}
                labelStyle={{
                  fontWeight: "bold",
                  color: "var(--foreground)",
                }}
                formatter={(value, name) => [
                  `₦${value.toLocaleString()}`,
                  name,
                ]}
              />
              <Legend
                wrapperStyle={{ paddingTop: 15 }}
                iconType="circle"
                iconSize={10}
              />
              <Bar
                dataKey="income"
                name="Income"
                fill="url(#incomeGradient)"
                radius={[6, 6, 0, 0]}
                barSize={28}
                activeBar={
                  <Rectangle fill="#4ade80" stroke="#16a34a" strokeWidth={2} />
                }
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="url(#expenseGradient)"
                radius={[6, 6, 0, 0]}
                barSize={28}
                activeBar={
                  <Rectangle fill="#fca5a5" stroke="#dc2626" strokeWidth={2} />
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default AccountsBarChart;
