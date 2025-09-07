const { PrismaClient } = require("@prisma/client")

// Create a singleton Prisma client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
})

// Helper function to handle progress month logic
const updateStudentProgress = async (studentId, increment = 1) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { progressMonths: true },
  })

  if (!student) {
    throw new Error("Student not found")
  }

  const newSessionCount = student.currentSessions + increment

  // If student completes 8 sessions, advance to next month
  if (newSessionCount >= 8) {
    const currentMonth = student.currentMonth
    const nextMonth = currentMonth + 1

    // Complete current progress month
    await prisma.progressMonth.upsert({
      where: {
        studentId_monthNumber: {
          studentId: studentId,
          monthNumber: currentMonth,
        },
      },
      update: {
        sessionsCompleted: 8,
        endDate: new Date(),
      },
      create: {
        studentId: studentId,
        monthNumber: currentMonth,
        startDate: student.startDate,
        endDate: new Date(),
        sessionsCompleted: 8,
        isPaid: false,
      },
    })

    // Update student to next month
    await prisma.student.update({
      where: { id: studentId },
      data: {
        currentMonth: nextMonth,
        currentSessions: newSessionCount - 8, // Carry over extra sessions
      },
    })

    return { monthAdvanced: true, newMonth: nextMonth }
  } else {
    // Just update session count
    await prisma.student.update({
      where: { id: studentId },
      data: {
        currentSessions: newSessionCount,
      },
    })

    return { monthAdvanced: false, sessionCount: newSessionCount }
  }
}

// Helper function to get student statistics
const getStudentStats = async () => {
  const totalStudents = await prisma.student.count()

  const paidMonths = await prisma.progressMonth.count({
    where: { isPaid: true },
  })

  const unpaidMonths = await prisma.progressMonth.count({
    where: { isPaid: false },
  })

  const recentAttendance = await prisma.attendanceRecord.count({
    where: {
      date: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
      isPresent: true,
    },
  })

  return {
    totalStudents,
    paidMonths,
    unpaidMonths,
    recentAttendance,
  }
}

module.exports = {
  prisma,
  updateStudentProgress,
  getStudentStats,
}
