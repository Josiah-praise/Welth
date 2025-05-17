import { SelectionProvider } from "./_components/CheckStateProvider"

function AccountLayout
    ({ children}: Readonly<{children: React.ReactNode}>) {
  return (
      <SelectionProvider>{ children}</SelectionProvider>
  )
}
export default AccountLayout
