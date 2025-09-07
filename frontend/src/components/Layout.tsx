import type React from "react"
import type { ReactNode } from "react"

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1">{children}</main>
    </div>
  )
}

export default Layout
