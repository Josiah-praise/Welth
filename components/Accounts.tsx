import { accountResponse } from "@/actions/Account";
import AccountCard from "./AccountCard"
import { isAccountsResponse, isSuccessResponse } from "@/lib/utils";
import { serverResponse } from "@/types/response";

async function Accounts({
  accounts,
}: {
  accounts: serverResponse<
    accountResponse & {
      totalIncome?: number;
      totalExpense?: number;
      netBalance?: number;
    }
  >;
}) {
  console.log(accounts);

  return (
    <>
      {isSuccessResponse(accounts) &&
        accounts.data &&
        isAccountsResponse(accounts.data) &&
        accounts.data.map((account, idx) => (
          <AccountCard key={idx} id={idx} data={account} />
        ))}
    </>
  );
}
export default Accounts