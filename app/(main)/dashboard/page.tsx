import Accounts from "@/components/Accounts";
import AccountsLoader from "@/components/AccountsLoader";
import CreateAccount from "@/components/CreateAccount";
import { Suspense } from "react";

const DashboardPage = async () => {
  
  return (
    <div>
      <h1 className="mb-4 mt-2.5 gradient-text text-4xl md:text-6xl lg:text-7xl font-extrabold">Dashboard</h1>
      <div className="grid min-h-[70%] grid-rows-4 mb-8 md:grid-cols-2 gap-8 lg:grid-cols-3">
        <CreateAccount />
        <Suspense fallback={<AccountsLoader/> }>
          <Accounts />
        </Suspense>
        {/* <AccountsLoader/> */}
      </div>
    </div>
  );
};

export default DashboardPage;
