import Accounts from "@/components/Accounts";
import AccountsLoader from "@/components/AccountsLoader";
import CreateAccount from "@/components/CreateAccount";
import { Suspense } from "react";
import BudgetProgressWrapper from "./_components/BudgetProgressWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardOverview } from "./_components/transaction-overview";
import { getAccounts, getDefaultAccount } from "@/actions/Account";
import { getDashboardData } from "@/actions/Dashboard";

const DashboardPage = async () => {
  const [accounts, transactions, defaultAccount] = await Promise.all([
    getAccounts(),
    getDashboardData(),
    getDefaultAccount(),
  ]);

  return (
    <div>
      <h1 className="mx-2 mb-4 mt-2.5 gradient-text text-4xl md:text-6xl lg:text-7xl font-extrabold">
        Dashboard
      </h1>
      {/* Budget progress */}
      <Suspense
        fallback={
          <div className="mx-2">
            <Skeleton className="mb-8 w-full h-[100px]" />
          </div>
        }
      >
        <BudgetProgressWrapper defaultAccount={defaultAccount} />
      </Suspense>

      {/* transactions overview */}
      {/* Dashboard Overview */}
      <DashboardOverview
        accounts={accounts.info === 'successful' && accounts.data}
        transactions={transactions.info === 'successful' && transactions.data || []}
      />

      <div className="grid min-h-[70%] mb-8 md:grid-cols-2 gap-8 lg:grid-cols-3">
        <CreateAccount />
        <Suspense fallback={<AccountsLoader />}>
          <Accounts accounts={accounts} />
        </Suspense>
        {/* <AccountsLoader/> */}
      </div>
    </div>
  );
};

export default DashboardPage;
