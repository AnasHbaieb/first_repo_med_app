export interface CompletedMonth {
  monthNumber: number
  paymentStatus: boolean
  startDate: string
  endDate: string
}

export interface Student {
  id: string
  firstName: string
  lastName: string
  studentPhone: string
  tutorPhone: string
  schoolYear: string
  schoolName: string
  filiere?: string
  startDate: string
  currentProgressMonth: number
  sessionsAttendedThisMonth: number
  completedMonths: CompletedMonth[]
}

export type SchoolYear =
  | "Neuvième"
  | "Première secondaire"
  | "Deuxième secondaire"
  | "Troisième secondaire"
  | "Baccalauréat"

export type FiliereOption =
  | "Informatique"
  | "Sciences"
  | "Sciences expérimentales"
  | "Technologie"
  | "Mathématiques"
  | "Économie"

export interface SessionAttendance {
  studentId: string
  date: string
  present: boolean
}
