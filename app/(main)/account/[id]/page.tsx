import { isSuccessResponse } from "@/lib/utils";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import { getAccountWithTransaction } from "@/actions/Account";
import TransactionTable from "./_components/TransactionTable";
import AccountsBarChart from "./_components/AccountsBarChart";

async function AccountsDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accountDetails = await getAccountWithTransaction({ id });

  if (
    accountDetails.info === "not found" ||
    !isSuccessResponse(accountDetails)
  ) {
    return notFound();
  }

  if (!accountDetails.data) {
    toast.warning("Something went wrong");
    console.warn("Account details data:", accountDetails.data);
    return notFound();
  }

  return (
    <div className="container text-foreground">
      <div>
        <div className="px-2 sm:px-0">
          {/* Account name */}
          <h1 className="gradient-text py-2 font-bold h-fit text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            {accountDetails.data.name}
          </h1>

          {/* Account meta */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-muted-foreground">
            <div>
              {accountDetails.data.type === "CURRENT" ? "Current" : "Savings"}{" "}
              Account
            </div>
            <div className="flex flex-col-reverse sm:flex-col sm:my-2">
              <span className="font-bold text-foreground text-lg">
                &#8358;
                {Number(
                  accountDetails.data.balance.toFixed(2)
                ).toLocaleString()}
              </span>
              <span className="text-sm">
                {accountDetails.data._count["transactions"]} Transactions
              </span>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <AccountsBarChart transactions={accountDetails.data.transactions} />

        {/* Transaction table */}
        <TransactionTable accountDetails={accountDetails.data} />
      </div>
    </div>
  );
}

export default AccountsDetailsPage;
