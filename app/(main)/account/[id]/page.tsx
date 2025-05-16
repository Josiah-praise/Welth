import { isSuccessResponse } from "@/lib/utils";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import { getAccountWithTransaction } from "@/actions/Account";
import TransactionTable from "./_components/TransactionTable";

async function AccountsDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const accountDetails = await getAccountWithTransaction({ id });
  if (accountDetails.info === "not found" || !isSuccessResponse(accountDetails))
    notFound();

  if (!accountDetails.data) {
    toast.warning("Something went wrong");
    console.warn("Account details data:", accountDetails.data);
    return notFound();
  }

  return (
    <div className="container">
      <div>
        {/* Account details */}
        <h1 className="gradient-text py-2  font-bold h-fit text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
          {accountDetails.data.name}
        </h1>
        <div className="flex flex-row justify-between items-center text-gray-600">
          <div>
            {accountDetails.data.type === "CURRENT" ? "Current" : "Savings"}{" "}
            Account
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-black">
              &#8358;{accountDetails.data.balance}
            </span>
            <span>
              {accountDetails.data._count["transactions"]} Transactions
            </span>
          </div>
        </div>

        {/* Chart */}

        {/* Transaction Table */}

          <TransactionTable accountDetails={accountDetails.data} />
      </div>
    </div>
  );
}

export default AccountsDetailsPage;
