"use client";

import { deleteAccount, serializableAccountResponse } from "@/actions/Account";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ArrowDownRight, ArrowUpRight, TrendingUp, Trash2 } from "lucide-react";
import IsDefaultSwitch from "./IsDefaultSwitch";
import Link from "next/link";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function AccountCard({
  id,
  data,
}: {
  id: string;
  data: serializableAccountResponse;
}) {
  const [confirmName, setConfirmName] = useState("");

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  

  const handleDelete = async () => {
    toast.promise(deleteAccount(data.id), {
      loading: "Deleting account...",
      success: () => {
        setConfirmName("");
        return "Account deleted successfully!";
      },
      error: (err) => {
        console.error(err);
        if (err?.info === "unauthorized") {
          return "Unauthorized. You can't delete this account.";
        } else if (err?.info === "error") {
          return "Something went wrong. Please try again.";
        } else {
          return "An unexpected error occurred.";
        }
      },
    });
  };

  const deleteAccountWithThrow = async (id: string) => {
    const response = await deleteAccount(id);

    if (response.info !== "successful") {
      throw new Error(response.error || "Error deleting account");
    }

    return response;
  };

  return (
    <Card key={id} className="mx-2">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <h3 className="text-sm font-semibold">{data.name}</h3>
          <div className="flex gap-2 items-center">
            <IsDefaultSwitch isChecked={data.isDefault} accountId={data.id} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to delete this account?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. To confirm, type{" "}
                    <strong>{data.name}</strong> below.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <Input
                  placeholder="Enter account name"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                />

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={confirmName !== data.name}
                    onClick={() => {
                      toast.promise(deleteAccountWithThrow(data.id), {
                        loading: "Deleting account...",
                        success: "Account deleted successfully!",
                        error: (err) => {
                          if (err?.info === "unauthorized")
                            return "You are not authorized.";
                          if (err?.info === "error")
                            return "Something went wrong.";
                          return "Unexpected error.";
                        },
                      });
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardTitle>
      </CardHeader>

      <Link className="flex flex-col gap-8" href={`/account/${data.id}`}>
        <CardContent className="space-y-4">
          <div>
            <span className="font-bold text-lg">
              {formatCurrency(Number(data.balance))}
            </span>
            <p className="text-muted-foreground text-sm">
              {data.type === "SAVINGS" ? "Savings" : "Current"} Account
            </p>
          </div>

          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
            <TrendingUp
              color={data.netBalance >= 0 ? "green" : "red"}
              size="16"
            />
            <div>
              <p className="text-xs text-muted-foreground">Net Balance</p>
              <span
                className={`font-semibold text-sm ${
                  data.netBalance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(data.netBalance)}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="flex gap-1.5 items-center">
            <ArrowUpRight color="green" size="20" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Income</span>
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(data.totalIncome)}
              </span>
            </div>
          </div>

          <div className="flex gap-1.5 items-center">
            <ArrowDownRight color="red" size="20" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Expenses</span>
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(data.totalExpense)}
              </span>
            </div>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}

export default AccountCard;
