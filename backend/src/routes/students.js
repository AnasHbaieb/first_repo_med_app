const express = require("express")
const { body, query, param, validationResult } = require("express-validator")
const { authenticateAdmin, logSecurityEvent } = require("../middleware/auth")
const { prisma, updateStudentProgress, getStudentStats } = require("../utils/database")
const SecurityUtils = require("../utils/security")

const router = express.Router()

// Get all students with filtering and pagination
router.get(
  "/",
  authenticateAdmin,
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("schoolYear").optional().isString().trim(),
    query("firstName").optional().isString().trim(),
    query("lastName").optional().isString().trim(),
    query("search").optional().isString().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { page = 1, limit = 50, schoolYear, firstName, lastName, search } = req.query

      const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

      // Build where clause for filtering
      const where = {}

      if (schoolYear && schoolYear !== "Tous") {
        where.schoolYear = schoolYear
      }

      if (firstName) {
        where.firstName = {
          contains: firstName,
          mode: "insensitive",
        }
      }

      if (lastName) {
        where.lastName = {
          contains: lastName,
          mode: "insensitive",
        }
      }

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { schoolName: { contains: search, mode: "insensitive" } },
        ]
      }

      // Get students with progress months
      const [students, totalCount] = await Promise.all([
        prisma.student.findMany({
          where,
          include: {
            progressMonths: {
              orderBy: { monthNumber: "desc" },
              take: 3, // Get last 3 months for quick overview
            },
            _count: {
              select: {
                attendanceRecords: {
                  where: {
                    date: {
                      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                    },
                    isPresent: true,
                  },
                },
              },
            },
          },
          orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
          skip,
          take: Number.parseInt(limit),
        }),
        prisma.student.count({ where }),
      ])

      const totalPages = Math.ceil(totalCount / Number.parseInt(limit))

      res.json({
        students,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages,
          totalCount,
          hasNext: Number.parseInt(page) < totalPages,
          hasPrev: Number.parseInt(page) > 1,
        },
      })
    } catch (error) {
      console.error("Get students error:", error)
      logSecurityEvent("STUDENTS_GET_ERROR", { error: error.message })
      res.status(500).json({ error: "Failed to retrieve students" })
    }
  },
)

// Get single student with full details
router.get(
  "/:id",
  authenticateAdmin,
  [param("id").isString().notEmpty().withMessage("Student ID is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params

      const student = await prisma.student.findUnique({
        where: { id },
        include: {
          progressMonths: {
            orderBy: { monthNumber: "asc" },
          },
          attendanceRecords: {
            orderBy: { date: "desc" },
            take: 50, // Last 50 attendance records
          },
        },
      })

      if (!student) {
        return res.status(404).json({ error: "Student not found" })
      }

      res.json(student)
    } catch (error) {
      console.error("Get student error:", error)
      res.status(500).json({ error: "Failed to retrieve student" })
    }
  },
)

// Create new student
router.post(
  "/",
  authenticateAdmin,
  [
    body("firstName")
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("First name is required (1-50 characters)"),
    body("lastName")
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Last name is required (1-50 characters)"),
    body("phone").optional().isString().trim().isLength({ max: 20 }),
    body("parentPhone").optional().isString().trim().isLength({ max: 20 }),
    body("schoolYear").isString().trim().isLength({ min: 1, max: 30 }).withMessage("School year is required"),
    body("schoolName").isString().trim().isLength({ min: 1, max: 100 }).withMessage("School name is required"),
    body("filiere").optional().isString().trim().isLength({ max: 50 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { firstName, lastName, phone, parentPhone, schoolYear, schoolName, filiere } = req.body

      // Sanitize inputs
      const sanitizedData = {
        firstName: SecurityUtils.sanitizeInput(firstName),
        lastName: SecurityUtils.sanitizeInput(lastName),
        phone: phone ? SecurityUtils.sanitizeInput(phone) : null,
        parentPhone: parentPhone ? SecurityUtils.sanitizeInput(parentPhone) : null,
        schoolYear: SecurityUtils.sanitizeInput(schoolYear),
        schoolName: SecurityUtils.sanitizeInput(schoolName),
        filiere: filiere ? SecurityUtils.sanitizeInput(filiere) : null,
      }

      const student = await prisma.student.create({
        data: sanitizedData,
        include: {
          progressMonths: true,
        },
      })

      logSecurityEvent("STUDENT_CREATED", {
        studentId: student.id,
        adminId: req.admin.jti,
      })

      res.status(201).json(student)
    } catch (error) {
      console.error("Create student error:", error)
      res.status(500).json({ error: "Failed to create student" })
    }
  },
)

// Update student
router.put(
  "/:id",
  authenticateAdmin,
  [
    param("id").isString().notEmpty().withMessage("Student ID is required"),
    body("firstName").optional().isString().trim().isLength({ min: 1, max: 50 }),
    body("lastName").optional().isString().trim().isLength({ min: 1, max: 50 }),
    body("phone").optional().isString().trim().isLength({ max: 20 }),
    body("parentPhone").optional().isString().trim().isLength({ max: 20 }),
    body("schoolYear").optional().isString().trim().isLength({ min: 1, max: 30 }),
    body("schoolName").optional().isString().trim().isLength({ min: 1, max: 100 }),
    body("filiere").optional().isString().trim().isLength({ max: 50 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params
      const updateData = {}

      // Only include fields that are provided
      const allowedFields = ["firstName", "lastName", "phone", "parentPhone", "schoolYear", "schoolName", "filiere"]

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = SecurityUtils.sanitizeInput(req.body[field])
        }
      }

      const student = await prisma.student.update({
        where: { id },
        data: updateData,
        include: {
          progressMonths: {
            orderBy: { monthNumber: "asc" },
          },
        },
      })

      logSecurityEvent("STUDENT_UPDATED", {
        studentId: id,
        adminId: req.admin.jti,
        updatedFields: Object.keys(updateData),
      })

      res.json(student)
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Student not found" })
      }
      console.error("Update student error:", error)
      res.status(500).json({ error: "Failed to update student" })
    }
  },
)

// Delete student
router.delete(
  "/:id",
  authenticateAdmin,
  [param("id").isString().notEmpty().withMessage("Student ID is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params

      await prisma.student.delete({
        where: { id },
      })

      logSecurityEvent("STUDENT_DELETED", {
        studentId: id,
        adminId: req.admin.jti,
      })

      res.json({ success: true, message: "Student deleted successfully" })
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Student not found" })
      }
      console.error("Delete student error:", error)
      res.status(500).json({ error: "Failed to delete student" })
    }
  },
)

// Toggle payment status for a progress month
router.patch(
  "/:id/progress/:monthNumber/payment",
  authenticateAdmin,
  [
    param("id").isString().notEmpty().withMessage("Student ID is required"),
    param("monthNumber").isInt({ min: 1 }).withMessage("Month number must be a positive integer"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id, monthNumber } = req.params

      // Find or create the progress month
      const progressMonth = await prisma.progressMonth.upsert({
        where: {
          studentId_monthNumber: {
            studentId: id,
            monthNumber: Number.parseInt(monthNumber),
          },
        },
        update: {
          isPaid: {
            not: true, // Toggle the payment status
          },
        },
        create: {
          studentId: id,
          monthNumber: Number.parseInt(monthNumber),
          startDate: new Date(),
          sessionsCompleted: 0,
          isPaid: true,
        },
      })

      logSecurityEvent("PAYMENT_STATUS_TOGGLED", {
        studentId: id,
        monthNumber: Number.parseInt(monthNumber),
        newStatus: progressMonth.isPaid,
        adminId: req.admin.jti,
      })

      res.json(progressMonth)
    } catch (error) {
      console.error("Toggle payment error:", error)
      res.status(500).json({ error: "Failed to update payment status" })
    }
  },
)

// Get dashboard statistics
router.get("/stats/dashboard", authenticateAdmin, async (req, res) => {
  try {
    const stats = await getStudentStats()
    res.json(stats)
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({ error: "Failed to retrieve statistics" })
  }
})

module.exports = router
