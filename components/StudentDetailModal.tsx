"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Calendar, Phone, School, GraduationCap } from "lucide-react"
import type { Student } from "@/types/student"

interface StudentDetailModalProps {
  student: Student | null
  isOpen: boolean
  onClose: () => void
  onTogglePayment: (studentId: string, monthNumber: number) => void
}

export function StudentDetailModal({ student, isOpen, onClose, onTogglePayment }: StudentDetailModalProps) {
  if (!student) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="text-lg sm:text-2xl text-balance">
            Historique Complet - {student.firstName} {student.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
                Informations de l'Étudiant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                      <span className="font-medium text-sm sm:text-base">Téléphone étudiant:</span>
                    </div>
                    <span className="text-sm sm:text-base ml-5 sm:ml-0">{student.studentPhone}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                      <span className="font-medium text-sm sm:text-base">Téléphone tuteur:</span>
                    </div>
                    <span className="text-sm sm:text-base ml-5 sm:ml-0">{student.tutorPhone}</span>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-2">
                      <School className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                      <span className="font-medium text-sm sm:text-base">Établissement:</span>
                    </div>
                    <span className="text-sm sm:text-base ml-5 sm:ml-0">{student.schoolName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium text-sm sm:text-base">Année Scolaire:</span>
                    <Badge className="self-start sm:self-auto text-xs sm:text-sm">{student.schoolYear}</Badge>
                  </div>
                  {student.filiere && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-medium text-sm sm:text-base">Filière:</span>
                      <Badge variant="secondary" className="self-start sm:self-auto text-xs sm:text-sm">
                        {student.filiere}
                      </Badge>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                      <span className="font-medium text-sm sm:text-base">Date d'inscription:</span>
                    </div>
                    <span className="text-sm sm:text-base ml-5 sm:ml-0">{formatDate(student.startDate)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Progress */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-green-700 text-base sm:text-lg">Progrès Actuel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 bg-green-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-base sm:text-lg">Mois {student.currentProgressMonth}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">En cours</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {student.sessionsAttendedThisMonth}/8
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">séances complétées</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(student.sessionsAttendedThisMonth / 8) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {8 - student.sessionsAttendedThisMonth} séances restantes pour compléter ce mois
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Completed Months History */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">
                Historique des Mois Complétés ({student.completedMonths.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.completedMonths.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <p className="text-sm sm:text-base">Aucun mois complété pour le moment</p>
                  <p className="text-xs sm:text-sm mt-1">
                    L'historique apparaîtra après la première série de 8 séances
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {student.completedMonths
                    .sort((a, b) => b.monthNumber - a.monthNumber)
                    .map((month) => (
                      <div
                        key={month.monthNumber}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <h4 className="font-semibold text-base sm:text-lg">Mois {month.monthNumber}</h4>
                            <Badge
                              variant={month.paymentStatus ? "default" : "destructive"}
                              className="self-start text-xs sm:text-sm"
                            >
                              {month.paymentStatus ? "Payé" : "En Retard"}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>Début: {formatDate(month.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>Fin: {formatDate(month.endDate)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <div className="text-left sm:text-right">
                            <div className="text-sm font-medium">8/8 séances</div>
                            <div className="text-xs text-gray-500">Complété</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onTogglePayment(student.id, month.monthNumber)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 ${
                              month.paymentStatus
                                ? "bg-green-100 hover:bg-green-200 text-green-700"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-400"
                            }`}
                            title={
                              month.paymentStatus
                                ? "Payé - Cliquer pour marquer en retard"
                                : "En Retard - Cliquer pour marquer payé"
                            }
                          >
                            {month.paymentStatus ? (
                              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                            ) : (
                              <X className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{student.completedMonths.length}</div>
                <p className="text-xs sm:text-sm text-gray-600">Mois Complétés</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {student.completedMonths.filter((m) => m.paymentStatus).length}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Paiements Reçus</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="text-xl sm:text-2xl font-bold text-orange-600">
                  {student.completedMonths.filter((m) => !m.paymentStatus).length}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Paiements En Retard</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
