"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/AuthContext"
import { useStudents } from "@/contexts/StudentContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogOut, ArrowLeft, Calendar, Clock, Users, CheckCircle, Settings, AlertTriangle, Trash2 } from "lucide-react"

const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

interface ClassSchedule {
  id: string
  name: string
  day: string
  time: string
  schoolYear: string
}

function SessionsContent() {
  const { logout } = useAuth()
  const { students, markAttendance } = useStudents()
  const router = useRouter()

  const [schedules, setSchedules] = useState<ClassSchedule[]>([
    {
      id: "1",
      name: "Groupe Mathématiques A",
      day: "Lundi",
      time: "14:00",
      schoolYear: "Troisième secondaire",
    },
    {
      id: "2",
      name: "Groupe Sciences B",
      day: "Mercredi",
      time: "16:00",
      schoolYear: "Baccalauréat",
    },
  ])

  const [newSchedule, setNewSchedule] = useState({
    name: "",
    day: "",
    time: "",
    schoolYear: "",
  })

  const [selectedSchedule, setSelectedSchedule] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [attendanceMarked, setAttendanceMarked] = useState<Set<string>>(new Set())
  const [autoCalculationEnabled, setAutoCalculationEnabled] = useState(true)

  const handleLogout = () => {
    logout()
    router.push("/admin")
  }

  const handleAddSchedule = () => {
    if (!newSchedule.name || !newSchedule.day || !newSchedule.time || !newSchedule.schoolYear) {
      alert("Veuillez remplir tous les champs")
      return
    }

    const schedule: ClassSchedule = {
      id: Date.now().toString(),
      ...newSchedule,
    }

    setSchedules((prev) => [...prev, schedule])
    setNewSchedule({ name: "", day: "", time: "", schoolYear: "" })
  }

  const handleDeleteSchedule = (scheduleId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce planning ?")) {
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId))
    }
  }

  const getStudentsForSchedule = (schedule: ClassSchedule) => {
    return students.filter((student) => student.schoolYear === schedule.schoolYear)
  }

  const handleMarkAttendance = (studentId: string) => {
    if (autoCalculationEnabled) {
      markAttendance(studentId)
    } else {
      const student = students.find((s) => s.id === studentId)
      if (student) {
        alert(`Présence marquée pour ${student.firstName} ${student.lastName} (Calcul automatique désactivé)`)
      }
    }

    setAttendanceMarked((prev) => new Set([...prev, studentId]))

    if (autoCalculationEnabled) {
      const student = students.find((s) => s.id === studentId)
      if (student) {
        alert(`Présence marquée pour ${student.firstName} ${student.lastName}`)
      }
    }
  }

  const selectedScheduleData = schedules.find((s) => s.id === selectedSchedule)
  const studentsForSelectedSchedule = selectedScheduleData ? getStudentsForSchedule(selectedScheduleData) : []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm" className="px-2 sm:px-4">
                  <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Tableau de Bord</span>
                </Button>
              </Link>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Gestion des Séances</h1>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 bg-transparent px-2 sm:px-4"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Auto-Calculation Toggle Section */}
        <Card
          className={`border-2 ${autoCalculationEnabled ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}
        >
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              Système de Calcul Automatique
              {!autoCalculationEnabled && <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div className="space-y-1">
                <p className="font-medium text-sm sm:text-base">
                  {autoCalculationEnabled ? "Calcul automatique activé" : "Calcul automatique désactivé"}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  {autoCalculationEnabled
                    ? "Les séances marquées mettront automatiquement à jour le progrès des étudiants"
                    : "Les présences seront marquées sans affecter le calcul de progression (mode sécurisé)"}
                </p>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <Label htmlFor="auto-calc-toggle" className="text-sm font-medium">
                  {autoCalculationEnabled ? "Activé" : "Désactivé"}
                </Label>
                <Switch
                  id="auto-calc-toggle"
                  checked={autoCalculationEnabled}
                  onCheckedChange={setAutoCalculationEnabled}
                />
              </div>
            </div>
            {!autoCalculationEnabled && (
              <div className="mt-3 p-3 bg-orange-100 rounded-lg border border-orange-200">
                <p className="text-xs sm:text-sm text-orange-800 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  Mode sécurisé activé - Vérifiez manuellement les progressions avant de réactiver le calcul automatique
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule Management */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              Planification des Cours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Add New Schedule Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nom du Groupe</Label>
                <Input
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Groupe Maths A"
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Jour</Label>
                <Select
                  value={newSchedule.day}
                  onValueChange={(value) => setNewSchedule((prev) => ({ ...prev, day: value }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Heure</Label>
                <Select
                  value={newSchedule.time}
                  onValueChange={(value) => setNewSchedule((prev) => ({ ...prev, time: value }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Année Scolaire</Label>
                <Select
                  value={newSchedule.schoolYear}
                  onValueChange={(value) => setNewSchedule((prev) => ({ ...prev, schoolYear: value }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Neuvième">Neuvième</SelectItem>
                    <SelectItem value="Première secondaire">Première secondaire</SelectItem>
                    <SelectItem value="Deuxième secondaire">Deuxième secondaire</SelectItem>
                    <SelectItem value="Troisième secondaire">Troisième secondaire</SelectItem>
                    <SelectItem value="Baccalauréat">Baccalauréat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <Button onClick={handleAddSchedule} className="w-full h-9">
                  Ajouter au Planning
                </Button>
              </div>
            </div>

            {/* Current Schedules */}
            <div>
              <h3 className="font-semibold mb-3 text-base sm:text-lg">Planning Actuel</h3>
              {schedules.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm sm:text-base">Aucun cours planifié</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm sm:text-base truncate">{schedule.name}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                              {schedule.day}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                              {schedule.time}
                            </span>
                          </div>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {schedule.schoolYear}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="text-red-600 hover:text-red-700 p-1.5 sm:p-2 flex-shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Marking */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                Marquage des Présences
              </div>
              {!autoCalculationEnabled && (
                <Badge variant="outline" className="text-orange-600 border-orange-600 self-start sm:self-auto">
                  Mode Manuel
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sélectionner un Cours</Label>
                <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Choisir un cours" />
                  </SelectTrigger>
                  <SelectContent>
                    {schedules.map((schedule) => (
                      <SelectItem key={schedule.id} value={schedule.id}>
                        <span className="block sm:hidden">{schedule.name}</span>
                        <span className="hidden sm:block">
                          {schedule.name} - {schedule.day} {schedule.time}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date de la Séance</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            {selectedScheduleData && (
              <div className="mt-4 sm:mt-6">
                <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">
                  Étudiants - {selectedScheduleData.name} ({studentsForSelectedSchedule.length})
                </h3>
                {studentsForSelectedSchedule.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
                    Aucun étudiant inscrit pour cette année scolaire
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">Nom Complet</TableHead>
                          <TableHead className="text-xs sm:text-sm">Téléphone</TableHead>
                          <TableHead className="text-xs sm:text-sm">Progrès Actuel</TableHead>
                          <TableHead className="text-xs sm:text-sm">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentsForSelectedSchedule.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium text-xs sm:text-sm py-2 sm:py-3">
                              {student.firstName} {student.lastName}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm py-2 sm:py-3">{student.studentPhone}</TableCell>
                            <TableCell className="py-2 sm:py-3">
                              <span className="text-blue-600 text-xs sm:text-sm">
                                Mois {student.currentProgressMonth}: {student.sessionsAttendedThisMonth}/8 séances
                              </span>
                            </TableCell>
                            <TableCell className="py-2 sm:py-3">
                              {attendanceMarked.has(student.id) ? (
                                <Badge variant="default" className="bg-green-600 text-xs">
                                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  Présent
                                </Badge>
                              ) : (
                                <Button
                                  onClick={() => handleMarkAttendance(student.id)}
                                  size="sm"
                                  className={`text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-auto ${autoCalculationEnabled ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-600 hover:bg-orange-700"}`}
                                >
                                  <span className="hidden sm:inline">
                                    {autoCalculationEnabled ? "Marquer Présent" : "Marquer Présent (Manuel)"}
                                  </span>
                                  <span className="sm:hidden">Présent</span>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function SessionsPage() {
  return (
    <ProtectedRoute>
      <SessionsContent />
    </ProtectedRoute>
  )
}
