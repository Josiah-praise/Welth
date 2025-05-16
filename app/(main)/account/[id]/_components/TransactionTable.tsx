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
import { CheckedState } from "@radix-ui/react-checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MemoizedTransactionList } from "./TransactionList";
import { SearchIcon, Trash2Icon, X } from "lucide-react";



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
  const [selection, setSelection] = useState<string[]>([]);
  const [filteredAndSortedTransactions, setTransactions] = useState<
    Array<serializableTransaction>
  >(accountDetails.transactions);
  const [allChecked, checkAll] = useState<boolean>(false);
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
  const deferredSortState = useDeferredValue(sortState);
  const deferredSearchValue = useDeferredValue(searchValue);

  // const debouncedValue = useDebounce(searchValue, 5000);

  useEffect(() => {
  const params = new URLSearchParams(searchParams);
   
    if (deferredSearchValue) {
        if (deferredSearchValue === params.get('q')) return
        params.set("q", deferredSearchValue);
      } else {
        params.delete("q");
      }

      router.replace(`?${params.toString()}`);
}, [deferredSearchValue, router, searchParams])

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
      switch (deferredSortState.field) {
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

    if (deferredSortState.order === "desc") result.reverse();

    return result;
  }, [
    deferredSearchValue,
    deferredSortState,
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
    const tempTransactions = txsCopy.filter((tx) =>
      selection.includes(tx.id)
    );

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
  }, [filteredAndSortedTransactions, router, selection]);

  const toggleSelection = useCallback(
    (id: string) => {
      if (selection.includes(id))
        setSelection((selection) => selection.filter(($id) => $id !== id));
      else setSelection((selection) => [...selection, id]);
    },
    [selection]
  );

  const toggleAllSelection = useCallback(
    (value: CheckedState) => {
      if (value) {
        setSelection(filteredAndSortedTransactions.map((tx) => tx.id));
        checkAll(true);
      } else {
        setSelection([]);
        checkAll(false);
      }
      console.log(value)
    },
    [filteredAndSortedTransactions]
  );

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
      {/* filter section */}
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
          <div className="p-2 border rounded-md flex gap-3 items-center">
            <span className="text-sm text-muted-foreground">recurring</span>
            <Switch
              checked={filterState.recurring}
              onCheckedChange={(value) => handleFilter("recurring", value)}
            />
          </div>
          <div className="p-2 border rounded-md flex gap-3 items-center">
            <span className="text-sm text-muted-foreground">one-time</span>
            <Switch
              checked={filterState.oneTime}
              onCheckedChange={(value) => handleFilter("oneTime", value)}
            />
          </div>
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

      {/* {readyTransactionList.map(tx => (<div className="border rounded-md" key={tx.id}>
        <p>{tx.amount.toFixed(2)}</p>
        <p>{tx.category}</p>
        <p>{tx.description}</p>
        <p>{format(new Date(tx.date), 'PP')}</p>
        <p>{ tx.isRecurring ? 'recurring': 'one-time'}</p>
      </div>))} */}

      <MemoizedTransactionList
        readyTransactionList={readyTransactionList}
        deleteMultipleTransactions={deleteMultipleTransactions}
        deleteSingleTransaction={deleteSingleTransaction}
        toggleAllSelection={toggleAllSelection}
        toggleSelection={toggleSelection}
        handleFilter={handleFilter}
        handleSortConfig={handleSortConfig}
        checkAll={checkAll}
        allChecked={allChecked}
        sortState={deferredSortState}
        setSortState={setSortState}
        selection={selection}
      />
    </div>
  );
}
export default TransactionTable;

// handle filtering by transaction type and isRecurring
// handle sorting by amount, date
// handle searching by description and category
// remember that when deleting, you want to get the sums of the deleted content and alter account balance by it

// for updating url with search value
// useEffect(() => {
//   const timeOutId = setTimeout(() => {
//     const params = new URLSearchParams(searchParams);

//     if (searchValue) {
//       params.set("q", searchValue);
//     } else {
//       params.delete("q");
//     }

//     router.replace(`?${params.toString()}`);
//   }, 500);

//   return () => clearTimeout(timeOutId);
// }, [searchValue, router, searchParams]);

// useEffect(() => {
//   console.log('deferred:', deferedSearchValue)
//   console.log('current:', searchValue)
//   const params = new URLSearchParams(searchParams);

//       if (deferedSearchValue) {
//         params.set("q", deferedSearchValue);
//       } else {
//         params.delete("q");
//       }

//       router.replace(`?${params.toString()}`);
// }, [deferedSearchValue])

{
  /* <div className="border-1 rounded-lg my-8">
        <Table>
          <TableHeader>
            <TableRow className="text-right">
              <TableHead>No</TableHead>
              <TableHead>
                <Checkbox
                  checked={allChecked}

                onCheckedChange={(value) => toggleAllSelection(value)}
                  className="border-gray-400"
                />
              </TableHead>
              <TableHead
                onClick={() => handleSortConfig("date")}
                className="cursor-pointer"
              >
                <div className="flex gap-4 items-center">
                  <span>Date</span>
                  {sortState.field === "date" &&
                    (sortState.order === "asc" ? (
                      <ChevronUp className="text-muted-foreground w-4 h-4" />
                    ) : (
                      <ChevronDown className="text-muted-foreground w-4 h-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead
                onClick={() => handleSortConfig("amount")}
                className="cursor-pointer"
              >
                <div className="flex gap-4 items-center">
                  {" "}
                  Amount{" "}
                  {sortState.field === "amount" &&
                    (sortState.order === "asc" ? (
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
            {readyTransactionList.length > 0 ? (
              readyTransactionList.map((tx, idx) => (
                <TableRow key={tx.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell className="min-w-[20px]">
                    <Checkbox
                      checked={selection.includes(tx.id)}
                      onCheckedChange={() => toggleSelection(tx.id)}
                      className="border-gray-400"
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(tx.createdAt), "PPpp")}
                  </TableCell>
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
                            onClick={() => deleteSingleTransaction(tx.id)}
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
      </div> */
}
