"use client"

import { useState, useMemo } from "react"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StudentDetailModal } from "@/components/StudentDetailModal"
import { useAuth } from "@/contexts/AuthContext"
import { useStudents } from "@/contexts/StudentContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogOut, Eye, Trash2, Check, Calendar, X, Search, Users, CreditCard, AlertCircle, Loader2 } from "lucide-react"
import type { SchoolYear } from "@/types/student"

const schoolYears: SchoolYear[] = [
  "Neuvième",
  "Première secondaire",
  "Deuxième secondaire",
  "Troisième secondaire",
  "Baccalauréat",
]

function DashboardContent() {
  const { logout } = useAuth()
  const { students, loading, deleteStudent, togglePaymentStatus } = useStudents()
  const router = useRouter()

  const [filters, setFilters] = useState({
    schoolYear: "",
    firstName: "",
    lastName: "",
  })
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [deletingStudent, setDeletingStudent] = useState<string | null>(null)
  const [togglingPayment, setTogglingPayment] = useState<string | null>(null)

  const handleLogout = () => {
    logout()
    router.push("/admin")
  }

  const clearFilters = () => {
    setFilters({
      schoolYear: "",
      firstName: "",
      lastName: "",
    })
  }

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSchoolYear =
        !filters.schoolYear || filters.schoolYear === "Tous" || student.schoolYear === filters.schoolYear
      const matchesFirstName =
        !filters.firstName || student.firstName.toLowerCase().includes(filters.firstName.toLowerCase())
      const matchesLastName =
        !filters.lastName || student.lastName.toLowerCase().includes(filters.lastName.toLowerCase())

      return matchesSchoolYear && matchesFirstName && matchesLastName
    })
  }, [students, filters])

  const handleDeleteStudent = async (studentId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) {
      try {
        setDeletingStudent(studentId)
        await deleteStudent(studentId)
      } catch (error) {
        console.error("Error deleting student:", error)
        alert("Erreur lors de la suppression de l'étudiant")
      } finally {
        setDeletingStudent(null)
      }
    }
  }

  const handlePaymentToggle = async (studentId: string, monthNumber: number) => {
    try {
      setTogglingPayment(`${studentId}-${monthNumber}`)
      await togglePaymentStatus(studentId, monthNumber)
    } catch (error) {
      console.error("Error toggling payment:", error)
      alert("Erreur lors de la mise à jour du statut de paiement")
    } finally {
      setTogglingPayment(null)
    }
  }

  const getLastCompletedMonth = (student: any) => {
    if (student.completedMonths.length === 0) return null
    return student.completedMonths[student.completedMonths.length - 1]
  }

  const selectedStudentData = selectedStudent ? students.find((s) => s.id === selectedStudent) : null

  const stats = useMemo(() => {
    const totalStudents = students.length
    const paidPayments = students.reduce(
      (sum, student) => sum + student.completedMonths.filter((m) => m.paymentStatus).length,
      0,
    )
    const overduePayments = students.reduce(
      (sum, student) => sum + student.completedMonths.filter((m) => !m.paymentStatus).length,
      0,
    )
    return { totalStudents, paidPayments, overduePayments }
  }, [students])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Espace Administrateur</h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/admin/sessions">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 sm:gap-2 hover:bg-blue-50 hover:border-blue-200 bg-transparent px-2 sm:px-4"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden xs:inline sm:hidden lg:inline">Séances</span>
                  <span className="hidden sm:inline lg:hidden">Gestion des Séances</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 hover:bg-red-50 hover:border-red-200 bg-transparent px-2 sm:px-4"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden xs:inline sm:hidden lg:inline">Sortir</span>
                <span className="hidden sm:inline lg:hidden">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Étudiants</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.paidPayments}</div>
                  <p className="text-xs sm:text-sm text-gray-600">Paiements Reçus</p>
                </div>
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-orange-600">{stats.overduePayments}</div>
                  <p className="text-xs sm:text-sm text-gray-600">Paiements En Retard</p>
                </div>
                <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                Filtres
              </CardTitle>
              {(filters.schoolYear || filters.firstName || filters.lastName) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700 self-start sm:self-auto"
                >
                  <X className="h-4 w-4 mr-1" />
                  Effacer
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="schoolYearFilter" className="text-sm font-medium">
                  Année Scolaire
                </Label>
                <Select
                  value={filters.schoolYear}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, schoolYear: value }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Toutes les années" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tous">Toutes les années</SelectItem>
                    {schoolYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstNameFilter" className="text-sm font-medium">
                  Prénom
                </Label>
                <Input
                  id="firstNameFilter"
                  type="text"
                  value={filters.firstName}
                  onChange={(e) => setFilters((prev) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Rechercher..."
                  className="transition-all focus:ring-2 focus:ring-blue-500 h-9"
                />
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="lastNameFilter" className="text-sm font-medium">
                  Nom
                </Label>
                <Input
                  id="lastNameFilter"
                  type="text"
                  value={filters.lastName}
                  onChange={(e) => setFilters((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Rechercher..."
                  className="transition-all focus:ring-2 focus:ring-blue-500 h-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-lg sm:text-xl">Liste des Étudiants</span>
              <Badge variant="secondary" className="self-start sm:self-auto">
                {filteredStudents.length} étudiant{filteredStudents.length !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <div className="block sm:hidden">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-gray-500 px-4">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 text-gray-300" />
                    <p>Aucun étudiant trouvé</p>
                    {(filters.schoolYear || filters.firstName || filters.lastName) && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-600">
                        Effacer les filtres
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 px-4">
                  {filteredStudents.map((student) => {
                    const lastMonth = getLastCompletedMonth(student)
                    const progressPercentage = (student.sessionsAttendedThisMonth / 8) * 100
                    const isDeleting = deletingStudent === student.id
                    const isTogglingPayment = lastMonth && togglingPayment === `${student.id}-${lastMonth.monthNumber}`

                    return (
                      <Card key={student.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-gray-900 text-base">
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">{student.studentPhone}</div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedStudent(student.id)}
                                className="hover:bg-blue-50 hover:text-blue-700 p-2"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteStudent(student.id)}
                                disabled={isDeleting}
                                className="hover:bg-red-50 hover:text-red-700 p-2"
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">{student.schoolYear}</div>
                            {student.filiere && (
                              <Badge variant="outline" className="text-xs">
                                {student.filiere}
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-blue-600">Mois {student.currentProgressMonth}</span>
                              <span className="text-gray-600">{student.sessionsAttendedThisMonth}/8</span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Paiement:</span>
                            {lastMonth ? (
                              <button
                                onClick={() => handlePaymentToggle(student.id, lastMonth.monthNumber)}
                                disabled={isTogglingPayment}
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                                  lastMonth.paymentStatus
                                    ? "bg-green-100 hover:bg-green-200 text-green-700"
                                    : "bg-gray-100 hover:bg-orange-100 border-2 border-dashed border-gray-300 hover:border-orange-300"
                                } ${isTogglingPayment ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                {isTogglingPayment ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : lastMonth.paymentStatus ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <X className="h-3 w-3 text-gray-400" />
                                )}
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-xs lg:text-sm">Étudiant</TableHead>
                    <TableHead className="font-semibold text-xs lg:text-sm">Contact</TableHead>
                    <TableHead className="font-semibold text-xs lg:text-sm">Scolarité</TableHead>
                    <TableHead className="font-semibold text-xs lg:text-sm">Progrès Actuel</TableHead>
                    <TableHead className="font-semibold text-center text-xs lg:text-sm">Paiement</TableHead>
                    <TableHead className="font-semibold text-center text-xs lg:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-gray-300" />
                          <p>Aucun étudiant trouvé</p>
                          {(filters.schoolYear || filters.firstName || filters.lastName) && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-600">
                              Effacer les filtres
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => {
                      const lastMonth = getLastCompletedMonth(student)
                      const progressPercentage = (student.sessionsAttendedThisMonth / 8) * 100
                      const isDeleting = deletingStudent === student.id
                      const isTogglingPayment =
                        lastMonth && togglingPayment === `${student.id}-${lastMonth.monthNumber}`

                      return (
                        <TableRow key={student.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="py-3">
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900 text-sm lg:text-base">
                                {student.firstName} {student.lastName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="text-xs lg:text-sm text-gray-600">{student.studentPhone}</div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="space-y-1">
                              <div className="text-xs lg:text-sm font-medium">{student.schoolYear}</div>
                              {student.filiere && (
                                <Badge variant="outline" className="text-xs">
                                  {student.filiere}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="space-y-2 min-w-[120px] lg:min-w-[140px]">
                              <div className="flex items-center justify-between text-xs lg:text-sm">
                                <span className="font-medium text-blue-600">Mois {student.currentProgressMonth}</span>
                                <span className="text-gray-600">{student.sessionsAttendedThisMonth}/8</span>
                              </div>
                              <Progress value={progressPercentage} className="h-1.5 lg:h-2" />
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-3">
                            {lastMonth ? (
                              <button
                                onClick={() => handlePaymentToggle(student.id, lastMonth.monthNumber)}
                                disabled={isTogglingPayment}
                                className={`inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full transition-all ${
                                  lastMonth.paymentStatus
                                    ? "bg-green-100 hover:bg-green-200 text-green-700"
                                    : "bg-gray-100 hover:bg-orange-100 border-2 border-dashed border-gray-300 hover:border-orange-300"
                                } ${isTogglingPayment ? "opacity-50 cursor-not-allowed" : ""}`}
                                title={
                                  lastMonth.paymentStatus
                                    ? "Payé - Cliquer pour marquer en retard"
                                    : "En Retard - Cliquer pour marquer payé"
                                }
                              >
                                {isTogglingPayment ? (
                                  <Loader2 className="h-3 w-3 lg:h-4 lg:w-4 animate-spin" />
                                ) : lastMonth.paymentStatus ? (
                                  <Check className="h-4 w-4 lg:h-5 lg:w-5" />
                                ) : (
                                  <X className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400" />
                                )}
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedStudent(student.id)}
                                className="hover:bg-blue-50 hover:text-blue-700 p-1.5 lg:p-2"
                                title="Voir l'historique complet"
                              >
                                <Eye className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteStudent(student.id)}
                                disabled={isDeleting}
                                className="hover:bg-red-50 hover:text-red-700 p-1.5 lg:p-2"
                                title="Supprimer l'étudiant"
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-3.5 w-3.5 lg:h-4 lg:w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <StudentDetailModal
        student={selectedStudentData}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onTogglePayment={handlePaymentToggle}
      />
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
