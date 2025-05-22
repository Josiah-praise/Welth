import { Skeleton } from "./ui/skeleton";

function AccountsLoader() {
  return (
    <>
      {Array(4)
        .fill(<Skeleton className="mb-8 w-full h-full" />)
        .map((each, idx) => (
          <div className="mx-2" key={idx}>
            {each}
          </div>
        ))}
    </>
  );
}
export default AccountsLoader;
