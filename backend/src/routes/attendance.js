const express = require("express")
const { body, query, param, validationResult } = require("express-validator")
const { authenticateAdmin, logSecurityEvent } = require("../middleware/auth")
const { prisma, updateStudentProgress } = require("../utils/database")

const router = express.Router()

// Mark attendance for a student
router.post(
  "/mark",
  authenticateAdmin,
  [
    body("studentId").isString().notEmpty().withMessage("Student ID is required"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("isPresent").isBoolean().withMessage("Attendance status is required"),
    body("autoCalculate").optional().isBoolean().withMessage("Auto calculate must be boolean"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { studentId, date, isPresent, autoCalculate = true } = req.body
      const attendanceDate = new Date(date)

      // Create or update attendance record
      const attendanceRecord = await prisma.attendanceRecord.upsert({
        where: {
          studentId_date: {
            studentId,
            date: attendanceDate,
          },
        },
        update: {
          isPresent,
        },
        create: {
          studentId,
          date: attendanceDate,
          isPresent,
        },
      })

      let progressUpdate = null

      // Update student progress if present and auto-calculate is enabled
      if (isPresent && autoCalculate) {
        progressUpdate = await updateStudentProgress(studentId, 1)
      }

      logSecurityEvent("ATTENDANCE_MARKED", {
        studentId,
        date: attendanceDate.toISOString(),
        isPresent,
        autoCalculate,
        progressUpdate,
        adminId: req.admin.jti,
      })

      res.json({
        attendanceRecord,
        progressUpdate,
        message: isPresent ? "Attendance marked as present" : "Attendance marked as absent",
      })
    } catch (error) {
      console.error("Mark attendance error:", error)
      res.status(500).json({ error: "Failed to mark attendance" })
    }
  },
)

// Get attendance records for a student
router.get(
  "/student/:id",
  authenticateAdmin,
  [
    param("id").isString().notEmpty().withMessage("Student ID is required"),
    query("startDate").optional().isISO8601().withMessage("Start date must be valid"),
    query("endDate").optional().isISO8601().withMessage("End date must be valid"),
    query("limit").optional().isInt({ min: 1, max: 200 }).withMessage("Limit must be between 1 and 200"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params
      const { startDate, endDate, limit = 50 } = req.query

      const where = { studentId: id }

      if (startDate || endDate) {
        where.date = {}
        if (startDate) where.date.gte = new Date(startDate)
        if (endDate) where.date.lte = new Date(endDate)
      }

      const attendanceRecords = await prisma.attendanceRecord.findMany({
        where,
        orderBy: { date: "desc" },
        take: Number.parseInt(limit),
      })

      // Calculate attendance statistics
      const totalRecords = attendanceRecords.length
      const presentCount = attendanceRecords.filter((record) => record.isPresent).length
      const attendanceRate = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : 0

      res.json({
        attendanceRecords,
        statistics: {
          totalRecords,
          presentCount,
          absentCount: totalRecords - presentCount,
          attendanceRate: Number.parseFloat(attendanceRate),
        },
      })
    } catch (error) {
      console.error("Get attendance error:", error)
      res.status(500).json({ error: "Failed to retrieve attendance records" })
    }
  },
)

// Get attendance for a specific date (all students)
router.get(
  "/date/:date",
  authenticateAdmin,
  [param("date").isISO8601().withMessage("Valid date is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { date } = req.params
      const targetDate = new Date(date)

      const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: {
          date: targetDate,
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              schoolYear: true,
            },
          },
        },
        orderBy: {
          student: {
            lastName: "asc",
          },
        },
      })

      res.json({
        date: targetDate.toISOString(),
        attendanceRecords,
        summary: {
          totalStudents: attendanceRecords.length,
          presentCount: attendanceRecords.filter((r) => r.isPresent).length,
          absentCount: attendanceRecords.filter((r) => !r.isPresent).length,
        },
      })
    } catch (error) {
      console.error("Get date attendance error:", error)
      res.status(500).json({ error: "Failed to retrieve attendance for date" })
    }
  },
)

// Bulk mark attendance for multiple students
router.post(
  "/bulk-mark",
  authenticateAdmin,
  [
    body("date").isISO8601().withMessage("Valid date is required"),
    body("attendanceList").isArray().withMessage("Attendance list must be an array"),
    body("attendanceList.*.studentId").isString().notEmpty().withMessage("Student ID is required"),
    body("attendanceList.*.isPresent").isBoolean().withMessage("Attendance status is required"),
    body("autoCalculate").optional().isBoolean().withMessage("Auto calculate must be boolean"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { date, attendanceList, autoCalculate = true } = req.body
      const attendanceDate = new Date(date)

      const results = []
      const progressUpdates = []

      // Process each attendance record
      for (const attendance of attendanceList) {
        try {
          const attendanceRecord = await prisma.attendanceRecord.upsert({
            where: {
              studentId_date: {
                studentId: attendance.studentId,
                date: attendanceDate,
              },
            },
            update: {
              isPresent: attendance.isPresent,
            },
            create: {
              studentId: attendance.studentId,
              date: attendanceDate,
              isPresent: attendance.isPresent,
            },
          })

          results.push(attendanceRecord)

          // Update progress if present and auto-calculate enabled
          if (attendance.isPresent && autoCalculate) {
            const progressUpdate = await updateStudentProgress(attendance.studentId, 1)
            progressUpdates.push({
              studentId: attendance.studentId,
              progressUpdate,
            })
          }
        } catch (error) {
          console.error(`Failed to mark attendance for student ${attendance.studentId}:`, error)
          results.push({
            studentId: attendance.studentId,
            error: "Failed to mark attendance",
          })
        }
      }

      logSecurityEvent("BULK_ATTENDANCE_MARKED", {
        date: attendanceDate.toISOString(),
        totalStudents: attendanceList.length,
        successCount: results.filter((r) => !r.error).length,
        autoCalculate,
        adminId: req.admin.jti,
      })

      res.json({
        success: true,
        date: attendanceDate.toISOString(),
        results,
        progressUpdates,
        summary: {
          totalProcessed: attendanceList.length,
          successful: results.filter((r) => !r.error).length,
          failed: results.filter((r) => r.error).length,
        },
      })
    } catch (error) {
      console.error("Bulk mark attendance error:", error)
      res.status(500).json({ error: "Failed to process bulk attendance" })
    }
  },
)

module.exports = router
