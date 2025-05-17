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
  // toggleSelection: (id: string) => void;
  // toggleAllSelection: (value: CheckedState) => void;
  // handleFilter: (
  //   filterType: keyof filterState,
  //   value?: string | boolean
  // ) => void;
  handleSortConfig: (value: "amount" | "date" | "") => void;
  // checkAll: Dispatch<SetStateAction<boolean>>;
  // allChecked: boolean;
  sortState: sortState;
  setSortState: Dispatch<SetStateAction<sortState>>;
  // selection: string[];
};

function TransactionList(props: Props) {
  return (
    <div className="border-1 rounded-lg my-8">
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
                {" "}
                Amount{" "}
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
            props.readyTransactionList.slice(0).map((tx, idx) => (
              <TableRow key={tx.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell className="min-w-[20px]">
                  
                  <SelectCheckbox id={ tx.id} />
                </TableCell>
                <TableCell>{format(new Date(tx.createdAt), "PPpp")}</TableCell>
                <TableCell>{tx.description}</TableCell>
                <TableCell>
                  <Badge
                    style={{ backgroundColor: categoryColors[tx.category] }}
                  >
                    {tx.category}
                  </Badge>
                </TableCell>

                <TableCell
                  className={`${
                    tx.type === "EXPENSE" ? "text-red-500" : "text-green-500"
                  } font-medium`}
                >
                  {tx.type === "EXPENSE" ? "-" : "+"}
                  {tx.amount}
                </TableCell>
                <TableCell>
                  {tx.isRecurring ? (
                    <MoreInfoToolTip
                      trigger={
                        <Badge
                          variant={"secondary"}
                          className="bg-purple-200 cursor-pointer hover:bg-purple-300"
                        >
                          <RefreshCcw />

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
                    <Badge variant={"secondary"}>
                      <Clock />
                      one-time
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant={"ghost"}>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Link href={`/transaction/create?edit=${tx.id}`}>
                          <span>Edit</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <span
                          className="text-red-500"
                          onClick={() => props.deleteSingleTransaction(tx.id)}
                        >
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
                colSpan={7}
                className="text-center text-muted-foreground"
              >
                {" "}
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
