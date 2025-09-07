"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Student, CompletedMonth } from "@/types/student"

interface StudentContextType {
  students: Student[]
  loading: boolean
  error: string | null
  addStudent: (
    student: Omit<Student, "id" | "currentProgressMonth" | "sessionsAttendedThisMonth" | "completedMonths">,
  ) => Promise<void>
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>
  deleteStudent: (id: string) => Promise<void>
  markAttendance: (studentId: string, autoCalculate?: boolean) => Promise<void>
  togglePaymentStatus: (studentId: string, monthNumber: number) => Promise<void>
  refreshStudents: () => Promise<void>
}

const StudentContext = createContext<StudentContextType | undefined>(undefined)

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const isSupabaseConfigured = () => {
    return (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co"
    )
  }

  const mockStudents: Student[] = [
    {
      id: "1",
      firstName: "Ahmed",
      lastName: "Benali",
      studentPhone: "0123456789",
      tutorPhone: "0987654321",
      schoolYear: "Terminale",
      schoolName: "Lycée Mohammed V",
      filiere: "Sciences Mathématiques",
      startDate: "2024-01-15",
      currentProgressMonth: 2,
      sessionsAttendedThisMonth: 3,
      completedMonths: [
        {
          monthNumber: 1,
          paymentStatus: true,
          startDate: "2024-01-15",
          endDate: "2024-02-15",
        },
      ],
    },
    {
      id: "2",
      firstName: "Fatima",
      lastName: "El Mansouri",
      studentPhone: "0111222333",
      tutorPhone: "0444555666",
      schoolYear: "1ère Bac",
      schoolName: "Lycée Al Khawarizmi",
      filiere: "Sciences Expérimentales",
      startDate: "2024-02-01",
      currentProgressMonth: 1,
      sessionsAttendedThisMonth: 6,
      completedMonths: [],
    },
  ]

  const convertToStudent = (studentRow: any, progressMonths: any[]): Student => {
    const completedMonths: CompletedMonth[] = progressMonths
      .filter((pm) => pm.is_completed)
      .map((pm) => ({
        monthNumber: pm.month_number,
        paymentStatus: pm.is_paid,
        startDate: pm.date_debut.split("T")[0],
        endDate: pm.date_fin ? pm.date_fin.split("T")[0] : new Date().toISOString().split("T")[0],
      }))

    const currentMonth = progressMonths.find((pm) => !pm.is_completed)

    return {
      id: studentRow.id,
      firstName: studentRow.prenom,
      lastName: studentRow.nom,
      studentPhone: studentRow.telephone_1,
      tutorPhone: studentRow.telephone_2 || "",
      schoolYear: studentRow.annee_scolaire,
      schoolName: studentRow.nom_ecole,
      filiere: studentRow.filiere || "",
      startDate: studentRow.date_inscription.split("T")[0],
      currentProgressMonth: currentMonth?.month_number || 1,
      sessionsAttendedThisMonth: currentMonth?.sessions_completed || 0,
      completedMonths,
    }
  }

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!isSupabaseConfigured()) {
        console.warn("[v0] Using mock data - Supabase not configured")
        setStudents(mockStudents)
        setLoading(false)
        return
      }

      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false })

      if (studentsError) throw studentsError

      const { data: progressData, error: progressError } = await supabase
        .from("progress_months")
        .select("*")
        .order("month_number", { ascending: true })

      if (progressError) throw progressError

      const convertedStudents = studentsData.map((student) => {
        const studentProgress = progressData.filter((pm) => pm.student_id === student.id)
        return convertToStudent(student, studentProgress)
      })

      setStudents(convertedStudents)
    } catch (error) {
      console.error("Error fetching students:", error)
      setError("Failed to fetch students from database. Using sample data.")
      setStudents(mockStudents)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const addStudent = async (
    studentData: Omit<Student, "id" | "currentProgressMonth" | "sessionsAttendedThisMonth" | "completedMonths">,
  ) => {
    try {
      if (!isSupabaseConfigured()) {
        const newStudent: Student = {
          ...studentData,
          id: Date.now().toString(),
          currentProgressMonth: 1,
          sessionsAttendedThisMonth: 0,
          completedMonths: [],
        }
        setStudents((prev) => [newStudent, ...prev])
        return
      }

      const { data, error } = await supabase
        .from("students")
        .insert({
          prenom: studentData.firstName,
          nom: studentData.lastName,
          telephone_1: studentData.studentPhone,
          telephone_2: studentData.tutorPhone || null,
          annee_scolaire: studentData.schoolYear,
          filiere: studentData.filiere || null,
          nom_ecole: studentData.schoolName,
          date_inscription: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      await fetchStudents()
    } catch (error) {
      console.error("Error adding student:", error)
      throw error
    }
  }

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      if (!isSupabaseConfigured()) {
        setStudents((prev) => prev.map((student) => (student.id === id ? { ...student, ...updates } : student)))
        return
      }

      const updateData: any = {}

      if (updates.firstName) updateData.prenom = updates.firstName
      if (updates.lastName) updateData.nom = updates.lastName
      if (updates.studentPhone) updateData.telephone_1 = updates.studentPhone
      if (updates.tutorPhone !== undefined) updateData.telephone_2 = updates.tutorPhone || null
      if (updates.schoolYear) updateData.annee_scolaire = updates.schoolYear
      if (updates.filiere !== undefined) updateData.filiere = updates.filiere || null
      if (updates.schoolName) updateData.nom_ecole = updates.schoolName

      const { error } = await supabase.from("students").update(updateData).eq("id", id)

      if (error) throw error

      await fetchStudents()
    } catch (error) {
      console.error("Error updating student:", error)
      throw error
    }
  }

  const deleteStudent = async (id: string) => {
    try {
      if (!isSupabaseConfigured()) {
        setStudents((prev) => prev.filter((student) => student.id !== id))
        return
      }

      const { error } = await supabase.from("students").delete().eq("id", id)

      if (error) throw error

      await fetchStudents()
    } catch (error) {
      console.error("Error deleting student:", error)
      throw error
    }
  }

  const markAttendance = async (studentId: string, autoCalculate = true) => {
    try {
      if (!isSupabaseConfigured()) {
        if (autoCalculate) {
          setStudents((prev) =>
            prev.map((student) => {
              if (student.id === studentId) {
                const newSessionsCount = student.sessionsAttendedThisMonth + 1
                if (newSessionsCount >= 8) {
                  return {
                    ...student,
                    currentProgressMonth: student.currentProgressMonth + 1,
                    sessionsAttendedThisMonth: 0,
                    completedMonths: [
                      ...student.completedMonths,
                      {
                        monthNumber: student.currentProgressMonth,
                        paymentStatus: false,
                        startDate: new Date().toISOString().split("T")[0],
                        endDate: new Date().toISOString().split("T")[0],
                      },
                    ],
                  }
                } else {
                  return {
                    ...student,
                    sessionsAttendedThisMonth: newSessionsCount,
                  }
                }
              }
              return student
            }),
          )
        }
        return
      }

      if (autoCalculate) {
        const { data: currentMonth, error: monthError } = await supabase
          .from("progress_months")
          .select("*")
          .eq("student_id", studentId)
          .eq("is_completed", false)
          .single()

        if (monthError) throw monthError

        const newSessionsCount = currentMonth.sessions_completed + 1

        if (newSessionsCount >= 8) {
          const { error: completeError } = await supabase
            .from("progress_months")
            .update({
              sessions_completed: 8,
              is_completed: true,
              date_fin: new Date().toISOString(),
            })
            .eq("id", currentMonth.id)

          if (completeError) throw completeError

          const { error: nextMonthError } = await supabase.from("progress_months").insert({
            student_id: studentId,
            month_number: currentMonth.month_number + 1,
            date_debut: new Date().toISOString(),
            sessions_completed: 0,
          })

          if (nextMonthError) throw nextMonthError
        } else {
          const { error: updateError } = await supabase
            .from("progress_months")
            .update({
              sessions_completed: newSessionsCount,
            })
            .eq("id", currentMonth.id)

          if (updateError) throw updateError
        }
      }

      await fetchStudents()
    } catch (error) {
      console.error("Error marking attendance:", error)
      throw error
    }
  }

  const togglePaymentStatus = async (studentId: string, monthNumber: number) => {
    try {
      if (!isSupabaseConfigured()) {
        setStudents((prev) =>
          prev.map((student) => {
            if (student.id === studentId) {
              return {
                ...student,
                completedMonths: student.completedMonths.map((month) =>
                  month.monthNumber === monthNumber ? { ...month, paymentStatus: !month.paymentStatus } : month,
                ),
              }
            }
            return student
          }),
        )
        return
      }

      const { data: progressMonth, error: fetchError } = await supabase
        .from("progress_months")
        .select("*")
        .eq("student_id", studentId)
        .eq("month_number", monthNumber)
        .single()

      if (fetchError) throw fetchError

      const { error: updateError } = await supabase
        .from("progress_months")
        .update({
          is_paid: !progressMonth.is_paid,
        })
        .eq("id", progressMonth.id)

      if (updateError) throw updateError

      await fetchStudents()
    } catch (error) {
      console.error("Error toggling payment status:", error)
      throw error
    }
  }

  const refreshStudents = async () => {
    await fetchStudents()
  }

  return (
    <StudentContext.Provider
      value={{
        students,
        loading,
        error,
        addStudent,
        updateStudent,
        deleteStudent,
        markAttendance,
        togglePaymentStatus,
        refreshStudents,
      }}
    >
      {children}
    </StudentContext.Provider>
  )
}

export function useStudents() {
  const context = useContext(StudentContext)
  if (context === undefined) {
    throw new Error("useStudents must be used within a StudentProvider")
  }
  return context
}
