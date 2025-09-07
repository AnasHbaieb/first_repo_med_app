import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { StudentProvider } from "@/contexts/StudentContext"
import { AuthProvider } from "@/contexts/AuthContext"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Med-CRM - Système de Gestion des Étudiants",
  description: "Système de gestion basé sur les progrès pour centre de tutorat",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <StudentProvider>{children}</StudentProvider>
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
