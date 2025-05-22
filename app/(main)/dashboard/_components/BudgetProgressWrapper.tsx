import { serializableAccountResponse } from "@/actions/Account";
import { getCurrentBudget } from "@/actions/Budget";
import BudgetProgress from "./BudgetProgress";
import { serverResponse } from "@/types/response";

async function BudgetProgressWrapper({
  defaultAccount,
}: {
  defaultAccount: serverResponse<serializableAccountResponse | null>;
}) {
  
  let budget;
  if (defaultAccount.info === "successful" && defaultAccount.data) {
    const $budget = await getCurrentBudget(defaultAccount.data.id);
    if ($budget.info === "successful") {
      budget = $budget.data;
    }
  }

  return <BudgetProgress budget={budget} />;
}
export default BudgetProgressWrapper;
