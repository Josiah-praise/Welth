import React from "react"

const MainLayout = ({ children }: Readonly<{children: React.ReactNode}>) => {
    return (
        <div className="container mx-auto">{ children}</div>
  )
}

export default MainLayout