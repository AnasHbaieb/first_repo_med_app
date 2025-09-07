import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Med-CRM</h1>
          <p className="text-xl text-gray-600">Système de Gestion des Étudiants</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-700">Inscription Étudiant</CardTitle>
              <CardDescription>Formulaire d'inscription pour nouveaux étudiants</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/inscription">
                <Button className="w-full" size="lg">
                  S'inscrire
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl text-green-700">Espace Administrateur</CardTitle>
              <CardDescription>Accès au tableau de bord administrateur</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button variant="outline" className="w-full bg-transparent" size="lg">
                  Se connecter
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
