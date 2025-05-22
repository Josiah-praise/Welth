import { getAccounts, serializableTransaction } from "@/actions/Account";
import { defaultCategories } from "@/data/category";
import { getTransaction } from "@/actions/Transactions";
import { AddTransactionForm } from "../_components/transaction-form";
import { isAccountsResponse, isSuccessResponse } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function AddTransactionPage({
  searchParams,
}: { searchParams: Promise<{ edit?: string }> }) {
  const $accounts = await getAccounts();
  const { edit: editId} = await searchParams;


  if (!(isSuccessResponse($accounts) && $accounts.data && isAccountsResponse($accounts.data))) {
    console.error("Failed to fetch accounts");
    return
  }
  const accounts = $accounts.data;

  let initialData: serializableTransaction | undefined = undefined;
  if (editId) {
    const transaction = await getTransaction(editId);
    console.log(transaction)
    if (transaction.info !== 'successful') {
      console.error("Failed to fetch transaction");
      notFound()
    }
    if (!transaction.data) {
      console.error("Transaction not found");
      notFound()
    }
    initialData = transaction.data;
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <div className="flex justify-center md:justify-normal mb-8">
        <h1 className="gradient-text py-2  font-bold h-fit text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
          Add Transaction
        </h1>
      </div>
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
}
