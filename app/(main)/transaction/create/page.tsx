async function TransactionCreationPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  return <div>{edit!}</div>;
}
export default TransactionCreationPage;
