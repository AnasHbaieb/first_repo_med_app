"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStudents } from "@/contexts/StudentContext"
import type { SchoolYear, FiliereOption } from "@/types/student"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const schoolYears: SchoolYear[] = [
  "Neuvième",
  "Première secondaire",
  "Deuxième secondaire",
  "Troisième secondaire",
  "Baccalauréat",
]

const filiereOptions: Record<string, FiliereOption[]> = {
  "Deuxième secondaire": ["Informatique", "Sciences"],
  "Troisième secondaire": ["Sciences expérimentales", "Informatique", "Technologie", "Mathématiques", "Économie"],
  Baccalauréat: ["Sciences expérimentales", "Informatique", "Technologie", "Mathématiques", "Économie"],
}

export default function InscriptionPage() {
  const router = useRouter()
  const { addStudent } = useStudents()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentPhone: "",
    tutorPhone: "",
    schoolYear: "",
    schoolName: "",
    filiere: "",
  })

  const requiresFiliere = ["Deuxième secondaire", "Troisième secondaire", "Baccalauréat"].includes(formData.schoolYear)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.studentPhone ||
        !formData.tutorPhone ||
        !formData.schoolYear ||
        !formData.schoolName
      ) {
        alert("Veuillez remplir tous les champs obligatoires.")
        return
      }

      if (requiresFiliere && !formData.filiere) {
        alert("Veuillez sélectionner une filière.")
        return
      }

      // Add student with current date as start date
      addStudent({
        firstName: formData.firstName,
        lastName: formData.lastName,
        studentPhone: formData.studentPhone,
        tutorPhone: formData.tutorPhone,
        schoolYear: formData.schoolYear as SchoolYear,
        schoolName: formData.schoolName,
        filiere: formData.filiere || undefined,
        startDate: new Date().toISOString().split("T")[0],
      })

      alert("Inscription réussie! L'étudiant a été ajouté au système.")
      router.push("/")
    } catch (error) {
      alert("Erreur lors de l'inscription. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }

      // Reset filiere when school year changes
      if (field === "schoolYear") {
        updated.filiere = ""
      }

      return updated
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 lg:p-6">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="self-start">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inscription Étudiant</h1>
            <p className="text-sm sm:text-base text-gray-600">Formulaire d'inscription pour nouveaux étudiants</p>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Informations de l'étudiant</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Veuillez remplir tous les champs obligatoires pour compléter l'inscription.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    Prénom de l'élève *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                    placeholder="Entrez le prénom"
                    className="h-10 sm:h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Nom de l'élève *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                    placeholder="Entrez le nom"
                    className="h-10 sm:h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentPhone" className="text-sm font-medium">
                    Numéro de téléphone de l'élève *
                  </Label>
                  <Input
                    id="studentPhone"
                    type="tel"
                    value={formData.studentPhone}
                    onChange={(e) => handleInputChange("studentPhone", e.target.value)}
                    required
                    placeholder="+216 XX XXX XXX"
                    className="h-10 sm:h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tutorPhone" className="text-sm font-medium">
                    Numéro de téléphone du tuteur *
                  </Label>
                  <Input
                    id="tutorPhone"
                    type="tel"
                    value={formData.tutorPhone}
                    onChange={(e) => handleInputChange("tutorPhone", e.target.value)}
                    required
                    placeholder="+216 XX XXX XXX"
                    className="h-10 sm:h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolYear" className="text-sm font-medium">
                  Année Scolaire *
                </Label>
                <Select value={formData.schoolYear} onValueChange={(value) => handleInputChange("schoolYear", value)}>
                  <SelectTrigger className="h-10 sm:h-11">
                    <SelectValue placeholder="Sélectionnez l'année scolaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolName" className="text-sm font-medium">
                  Nom de l'établissement *
                </Label>
                <Input
                  id="schoolName"
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => handleInputChange("schoolName", e.target.value)}
                  required
                  placeholder="Entrez le nom de l'établissement"
                  className="h-10 sm:h-11"
                />
              </div>

              {requiresFiliere && (
                <div className="space-y-2">
                  <Label htmlFor="filiere" className="text-sm font-medium">
                    Filière/Série *
                  </Label>
                  <Select value={formData.filiere} onValueChange={(value) => handleInputChange("filiere", value)}>
                    <SelectTrigger className="h-10 sm:h-11">
                      <SelectValue placeholder="Sélectionnez la filière" />
                    </SelectTrigger>
                    <SelectContent>
                      {filiereOptions[formData.schoolYear]?.map((filiere) => (
                        <SelectItem key={filiere} value={filiere}>
                          {filiere}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="pt-3 sm:pt-4">
                <Button
                  type="submit"
                  className="w-full h-11 sm:h-12 text-sm sm:text-base font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Inscription en cours..." : "Confirmer l'inscription"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
