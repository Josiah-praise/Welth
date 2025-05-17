"use client";

import { serializableAccountResponseWithTransactionAndCount } from "@/actions/Account";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  useDeferredValue,
  useCallback,
} from "react";
import {
  deleteTransactions,
  serializableTransaction,
} from "@/actions/Transactions";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MemoizedTransactionList } from "./TransactionList";
import { SearchIcon, Trash2Icon, X } from "lucide-react";
import { useSelection } from "./CheckStateProvider";
import { Label } from "@/components/ui/label";

type expenseType = "INCOME" | "EXPENSE" | "";

export type filterState = {
  type: expenseType;
  recurring: boolean;
  oneTime: boolean;
};

export type sortState = {
  field: "date" | "amount" | "";
  order: "asc" | "desc";
};

function TransactionTable({
  accountDetails,
}: {
  accountDetails: serializableAccountResponseWithTransactionAndCount;
}) {
  const router = useRouter();
  const { selectedIds: selection, setSelection } = useSelection();

  const [filteredAndSortedTransactions, setTransactions] = useState<
    Array<serializableTransaction>
  >(accountDetails.transactions);
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") ?? "");
  const [filterState, setFilters] = useState<filterState>({
    type: "",
    recurring: false,
    oneTime: false,
  });
  const [sortState, setSortState] = useState<sortState>({
    field: "",
    order: "asc",
  });
  const deferredFilterState = useDeferredValue(filterState);
  // const deferredSortState = useDeferredValue(sortState);
  const deferredSearchValue = useDeferredValue(searchValue);

  // const debouncedValue = useDebounce(searchValue, 5000);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (deferredSearchValue) {
      if (deferredSearchValue === params.get("q")) return;
      params.set("q", deferredSearchValue);
    } else {
      params.delete("q");
    }

    router.replace(`?${params.toString()}`);
  }, [deferredSearchValue, router, searchParams]);

  const readyTransactionList = useMemo(() => {
    let result;

    result = filteredAndSortedTransactions.filter(
      (tx) =>
        tx.description
          ?.toLocaleLowerCase()
          .includes(deferredSearchValue.toLowerCase()) ||
        tx.category.toLowerCase().includes(deferredSearchValue.toLowerCase())
    );

    console.log(deferredFilterState);

    // Start with your base dataset
    const baseData = result || filteredAndSortedTransactions;

    // Apply filters sequentially, narrowing down each time
    result = baseData.filter((tx) => {
      // Only consider type filter if it's set
      if (deferredFilterState.type && tx.type !== deferredFilterState.type) {
        return false;
      }

      // Only consider recurring filter if it's set
      if (deferredFilterState.recurring === true && tx.isRecurring !== true) {
        return false;
      }

      // Only consider oneTime filter if it's set
      if (deferredFilterState.oneTime === true && tx.isRecurring !== false) {
        return false;
      }

      // If transaction has passed all active filters, include it
      return true;
    });

    // sort the filtered list in asc order
    result.sort((a, b) => {
      switch (sortState.field) {
        case "amount":
          const aAmount = a.type === "EXPENSE" ? -a.amount : a.amount;
          const bAmount = b.type === "EXPENSE" ? -b.amount : b.amount;
          return aAmount - bAmount;
          break;
        case "date":
          const aDate = new Date(a.createdAt);
          const bDate = new Date(b.createdAt);
          return aDate.getTime() - bDate.getTime();
          break;
        default:
          return 0;
      }
    });

    if (sortState.order === "desc") result.reverse();

    return result;
  }, [
    deferredSearchValue,
    sortState,
    deferredFilterState,
    filteredAndSortedTransactions,
  ]);

  const deleteSingleTransaction = useCallback(
    async (id: string) => {
      const tempTransaction = filteredAndSortedTransactions.find(
        (tx) => tx.id === id
      );
      console.log(tempTransaction);
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      const result = await deleteTransactions([id]);
      if (result?.info === "successful") {
        setSelection([]);
        router.refresh();
        toast.error("transaction deleted");
      } else {
        if (tempTransaction)
          setTransactions((prev) => [...prev, tempTransaction]);
        toast.warning("failed to delete transaction");
      }
    },
    [filteredAndSortedTransactions, router]
  );

  const deleteMultipleTransactions = useCallback(async () => {
    const txsCopy = filteredAndSortedTransactions.slice();
    const tempTransactions = txsCopy.filter((tx) => selection.includes(tx.id));

    // remove every element in the selection array from the copy
    selection.forEach((id, idx) => {
      // get transaction an index
      const tx = txsCopy.reduce(
        (
          acc: { idx: number | null; t: serializableTransaction | null },
          tx,
          idx
        ) => {
          if (tx.id === id) {
            acc.t = tx;
            acc.idx = idx;
          }
          return acc;
        },
        { idx: null, t: null }
      );

      console.log(`Tx ${tx.t} at index ${tx.idx} is to be deleted`);

      // remove transaction from copy
      if (tx.idx && tx.t) {
        txsCopy.splice(tx.idx, 1);
      }
    });

    setTransactions(txsCopy);
    const result = await deleteTransactions(selection);
    if (result?.info === "successful") {
      setSelection([]);
      toast.error(
        `${
          tempTransactions.length > 1 ? "transactions" : "transaction"
        } deleted`
      );
      router.refresh();
    } else {
      setTransactions((prev) => [...prev, ...tempTransactions]);
      toast.warning(
        `failed to delete ${
          tempTransactions.length > 1 ? "transactions" : "transaction"
        }}`
      );
    }
  }, [filteredAndSortedTransactions, router, selection, setSelection]);

  const handleFilter = useCallback(
    (filterType: keyof filterState, value?: string | boolean) => {
      if (filterType === "type" && typeof value === "string") {
        setFilters((filters) => ({ ...filters, type: value as expenseType }));
      } else if (filterType === "recurring") {
        setFilters((filters) => ({
          ...filters,
          recurring: !!value,
          oneTime: false,
        }));
      } else {
        setFilters((filters) => ({
          ...filters,
          recurring: false,
          oneTime: !!value,
        }));
      }
    },
    []
  );

  const handleSortConfig = useCallback((value: "amount" | "date" | "") => {
    if (value) {
      setSortState((prev) => ({
        field: value,
        order: prev.field === value && prev.order === "asc" ? "desc" : "asc",
      }));
    }
  }, []);

  return (
    <div>
      <div className="flex gap-4">
        <div className="relative flex-1">
          <SearchIcon
            className="absolute text-muted-foreground top-[50%] translate-y-[-50%] left-2"
            size={15}
          />
          <Input
            type={"text"}
            placeholder="search..."
            className="pl-8"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filterState.type}
            onValueChange={(value) =>
              handleFilter("type", value as expenseType)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Label htmlFor="recurring" className="p-2 border rounded-md flex gap-3 items-center">
            <span className="text-sm text-muted-foreground">recurring</span>
            <Switch id="recurring"
              checked={filterState.recurring}
              onCheckedChange={(value) => handleFilter("recurring", value)}
            />
          </Label>
          <Label htmlFor="one-time" className="p-2 border rounded-md flex gap-3 items-center">
            <span className="text-sm text-muted-foreground">one-time</span>
            <Switch id="one-time"
              checked={filterState.oneTime}
              onCheckedChange={(value) => handleFilter("oneTime", value)}
            />
          </Label>
          {(filterState.recurring ||
            filterState.type ||
            filterState.oneTime ||
            sortState.field) && (
            <Button
              variant={"secondary"}
              onClick={() => {
                setFilters({ type: "", recurring: false, oneTime: false });
                setSortState({ field: "", order: "asc" });
              }}
            >
              <X />
            </Button>
          )}
          {selection.length > 0 && (
            <Button
              variant={"destructive"}
              onClick={deleteMultipleTransactions}
            >
              <Trash2Icon />
            </Button>
          )}
        </div>
      </div>

      <MemoizedTransactionList
        readyTransactionList={readyTransactionList}
        deleteSingleTransaction={deleteSingleTransaction} 
        handleSortConfig={handleSortConfig}
        sortState={sortState}
        setSortState={setSortState}
      />
    </div>
  );
}
export default TransactionTable;
