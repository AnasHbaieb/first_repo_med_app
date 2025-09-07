const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create sample class schedules
  const schedules = await Promise.all([
    prisma.classSchedule.create({
      data: {
        name: "Mathématiques - Niveau Lycée",
        dayOfWeek: 1, // Monday
        startTime: "14:00",
        endTime: "16:00",
      },
    }),
    prisma.classSchedule.create({
      data: {
        name: "Physique - Niveau Collège",
        dayOfWeek: 3, // Wednesday
        startTime: "16:00",
        endTime: "18:00",
      },
    }),
    prisma.classSchedule.create({
      data: {
        name: "Français - Niveau Primaire",
        dayOfWeek: 5, // Friday
        startTime: "10:00",
        endTime: "12:00",
      },
    }),
  ])

  console.log(`✅ Created ${schedules.length} class schedules`)

  // Create sample students
  const students = await Promise.all([
    prisma.student.create({
      data: {
        firstName: "Ahmed",
        lastName: "Benali",
        phone: "0612345678",
        parentPhone: "0687654321",
        schoolYear: "Terminale",
        schoolName: "Lycée Mohammed V",
        filiere: "Sciences Mathématiques",
        startDate: new Date("2024-09-01"),
        currentMonth: 2,
        currentSessions: 3,
      },
    }),
    prisma.student.create({
      data: {
        firstName: "Fatima",
        lastName: "El Amrani",
        phone: "0623456789",
        parentPhone: "0698765432",
        schoolYear: "3ème Collège",
        schoolName: "Collège Al Khawarizmi",
        startDate: new Date("2024-10-15"),
        currentMonth: 1,
        currentSessions: 6,
      },
    }),
    prisma.student.create({
      data: {
        firstName: "Youssef",
        lastName: "Tazi",
        phone: "0634567890",
        parentPhone: "0609876543",
        schoolYear: "1ère Bac",
        schoolName: "Lycée Ibn Sina",
        filiere: "Sciences Expérimentales",
        startDate: new Date("2024-08-20"),
        currentMonth: 3,
        currentSessions: 1,
      },
    }),
    prisma.student.create({
      data: {
        firstName: "Aicha",
        lastName: "Benjelloun",
        phone: "0645678901",
        parentPhone: "0620987654",
        schoolYear: "6ème Primaire",
        schoolName: "École Primaire Atlas",
        startDate: new Date("2024-11-01"),
        currentMonth: 1,
        currentSessions: 2,
      },
    }),
    prisma.student.create({
      data: {
        firstName: "Omar",
        lastName: "Chakir",
        phone: "0656789012",
        parentPhone: "0631098765",
        schoolYear: "2ème Bac",
        schoolName: "Lycée Hassan II",
        filiere: "Sciences Économiques",
        startDate: new Date("2024-09-10"),
        currentMonth: 2,
        currentSessions: 7,
      },
    }),
  ])

  console.log(`✅ Created ${students.length} students`)

  // Create progress months for students
  const progressMonths = []

  for (const student of students) {
    // Create completed months
    for (let month = 1; month < student.currentMonth; month++) {
      const startDate = new Date(student.startDate)
      startDate.setMonth(startDate.getMonth() + (month - 1))

      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)

      const progressMonth = await prisma.progressMonth.create({
        data: {
          studentId: student.id,
          monthNumber: month,
          startDate,
          endDate,
          sessionsCompleted: 8,
          isPaid: Math.random() > 0.3, // 70% chance of being paid
        },
      })
      progressMonths.push(progressMonth)
    }
  }

  console.log(`✅ Created ${progressMonths.length} progress months`)

  // Create attendance records
  const attendanceRecords = []
  const today = new Date()

  for (const student of students) {
    // Create some random attendance records for the past month
    for (let i = 0; i < 15; i++) {
      const attendanceDate = new Date(today)
      attendanceDate.setDate(attendanceDate.getDate() - i)

      // Skip weekends
      if (attendanceDate.getDay() === 0 || attendanceDate.getDay() === 6) continue

      // 85% attendance rate
      if (Math.random() > 0.85) continue

      try {
        const record = await prisma.attendanceRecord.create({
          data: {
            studentId: student.id,
            date: attendanceDate,
            isPresent: Math.random() > 0.1, // 90% present when attending
          },
        })
        attendanceRecords.push(record)
      } catch (error) {
        // Skip duplicate dates
        continue
      }
    }
  }

  console.log(`✅ Created ${attendanceRecords.length} attendance records`)

  console.log("🎉 Database seeded successfully!")
  console.log("\n📊 Summary:")
  console.log(`   • ${schedules.length} class schedules`)
  console.log(`   • ${students.length} students`)
  console.log(`   • ${progressMonths.length} progress months`)
  console.log(`   • ${attendanceRecords.length} attendance records`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
