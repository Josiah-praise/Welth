import { serializableAccountResponseWithCount } from "@/actions/Account";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Switch } from "./ui/switch";
import IsDefaultSwitch from "./IsDefaultSwitch";
import Link from "next/link";

function AccountCard({
  id,
  data,
}: {
  id: number;
  data: serializableAccountResponseWithCount;
}) {
  return (
    <Card key={id}>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <h3 className="text-sm font-semibold">{data.name}</h3>
          <IsDefaultSwitch isChecked={data.isDefault} accountId={data.id} />
        </CardTitle>
      </CardHeader>
      <Link className="flex flex-col gap-8" href={`/account/${data.id}`}>
        <CardContent>
          <span className="font-bold ">&#8358;{data.balance}</span>
          <p className="text-muted-foreground text-sm">
            {data.type === "SAVINGS" ? "Current" : "Savings"} Account
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-1.5 items-center">
            <ArrowUpRight color="green" size="20" /> <span>Income</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <ArrowDownRight color="red" size="20" /> <span>Expenses</span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
export default AccountCard;
