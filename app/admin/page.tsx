"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const { isAuthenticated, login } = useAuth()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push("/admin/dashboard")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const success = login(password)
      if (success) {
        router.push("/admin/dashboard")
      } else {
        setError("Mot de passe incorrect. Veuillez réessayer.")
      }
    } catch (error) {
      setError("Erreur de connexion. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAuthenticated) {
    return <div>Redirection...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Accueil
            </Button>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">Espace Administrateur</CardTitle>
              <CardDescription>Connectez-vous pour accéder au tableau de bord</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe administrateur</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Entrez le mot de passe"
                  className={error ? "border-red-500" : ""}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !password.trim()}>
                {isSubmitting ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Utilisez le mot de passe fourni par l'administrateur système pour accéder au
                tableau de bord.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
