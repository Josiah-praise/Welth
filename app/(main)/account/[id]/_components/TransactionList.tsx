"use client";

import { serializableTransaction } from "@/actions/Transactions";
import { CheckedState } from "@radix-ui/react-checkbox";
import { filterState, sortState } from "./TransactionTable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MoreInfoToolTip from "@/components/moreInfoToolTip";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  MoreHorizontal,
  RefreshCcw,
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { categoryColors } from "@/data/category";
import React from "react";
import { SelectAllCheckbox, SelectCheckbox } from "./CheckStateProvider";

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

type Props = {
  readyTransactionList: serializableTransaction[];
  deleteSingleTransaction: (id: string) => Promise<void>;
  handleSortConfig: (value: "amount" | "date" | "") => void;
  sortState: sortState;
  setSortState: Dispatch<SetStateAction<sortState>>;
};

function TransactionList(props: Props) {
  return (
    <div className="border border-border rounded-none mx-2 sm:mx-0 sm:rounded-sm my-8 bg-background text-foreground">
      <Table>
        <TableHeader>
          <TableRow className="text-right">
            <TableHead>No</TableHead>
            <TableHead>
              <SelectAllCheckbox
                allIds={props.readyTransactionList.map((tx) => tx.id)}
              />
            </TableHead>
            <TableHead
              onClick={() => props.handleSortConfig("date")}
              className="cursor-pointer"
            >
              <div className="flex gap-4 items-center">
                <span>Date</span>
                {props.sortState.field === "date" &&
                  (props.sortState.order === "asc" ? (
                    <ChevronUp className="text-muted-foreground w-4 h-4" />
                  ) : (
                    <ChevronDown className="text-muted-foreground w-4 h-4" />
                  ))}
              </div>
            </TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead
              onClick={() => props.handleSortConfig("amount")}
              className="cursor-pointer"
            >
              <div className="flex gap-4 items-center">
                Amount
                {props.sortState.field === "amount" &&
                  (props.sortState.order === "asc" ? (
                    <ChevronUp className="text-muted-foreground w-4 h-4" />
                  ) : (
                    <ChevronDown className="text-muted-foreground w-4 h-4" />
                  ))}
              </div>
            </TableHead>
            <TableHead colSpan={2}>Recurring</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.readyTransactionList.length > 0 ? (
            props.readyTransactionList.map((tx, idx) => (
              <TableRow key={tx.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell className="min-w-[20px]">
                  <SelectCheckbox id={tx.id} />
                </TableCell>
                <TableCell>{format(new Date(tx.createdAt), "PPpp")}</TableCell>
                <TableCell>{tx.description ?? "-"}</TableCell>
                <TableCell>
                  <Badge
                    className="text-white"
                    style={{
                      backgroundColor: categoryColors[tx.category],
                    }}
                  >
                    {tx.category}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`font-medium ${
                    tx.type === "EXPENSE"
                      ? "text-red-500 dark:text-red-400"
                      : "text-green-500 dark:text-green-400"
                  }`}
                >
                  {tx.type === "EXPENSE" ? "-" : "+"}
                  &#8358;{Number(tx.amount.toFixed(2)).toLocaleString()}
                </TableCell>
                <TableCell>
                  {tx.isRecurring ? (
                    <MoreInfoToolTip
                      trigger={
                        <Badge
                          variant="secondary"
                          className="bg-purple-200 dark:bg-purple-400 text-purple-900 dark:text-white cursor-pointer hover:bg-purple-300 dark:hover:bg-purple-500"
                        >
                          <RefreshCcw className="mr-1 h-4 w-4" />
                          {tx.recurringInterval &&
                            RECURRING_INTERVALS[tx.recurringInterval]}
                        </Badge>
                      }
                      infoText={
                        <div>
                          <div>Next Date:</div>
                          <div>
                            {tx.nextRecurringDate &&
                              format(new Date(tx.nextRecurringDate), "PP")}
                          </div>
                        </div>
                      }
                    />
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="mr-1 h-4 w-4" />
                      one-time
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <Link href={`/transaction/create?edit=${tx.id}`}>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => props.deleteSingleTransaction(tx.id)}
                      >
                        <span className="text-red-500 dark:text-red-400">
                          Delete
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-muted-foreground"
              >
                No transaction
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export const MemoizedTransactionList = React.memo(TransactionList);
