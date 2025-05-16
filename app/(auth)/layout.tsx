function AuthLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return (
      <div className="container mx-auto pt-12 flex justify-center items-center">{ children}</div>
  )
}
export default AuthLayout