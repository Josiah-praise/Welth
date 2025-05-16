import { getAccounts, serializableAccountResponseWithCount, toggleDefault } from "@/actions/Account";
import AccountCard from "./AccountCard"
import { isAccountsResponse, isSuccessResponse } from "@/lib/utils";

async function Accounts() {
  const accounts = await getAccounts();
  console.log("here mother fucker")

  return (
    <>
      {isSuccessResponse(accounts) && accounts.data && isAccountsResponse(accounts.data) &&
        accounts.data.map(
          (account: serializableAccountResponseWithCount, idx: number) => (
            <AccountCard key={idx} id={idx} data={account} />
          )
        )}
    </>
  );
}
export default Accounts