import {
  serializableAccountResponse,
  serializableAccountResponseWithCount,
} from "@/actions/Account";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import IsDefaultSwitch from "./IsDefaultSwitch";
import Link from "next/link";

function AccountCard({
  id,
  data,
}: {
  id: number;
  data: serializableAccountResponse;
}) {
  // Format currency helper
  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  return (
    <Card key={id} className="mx-2">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <h3 className="text-sm font-semibold">{data.name}</h3>
          <IsDefaultSwitch isChecked={data.isDefault} accountId={data.id} />
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

          {/* Net Balance */}
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
