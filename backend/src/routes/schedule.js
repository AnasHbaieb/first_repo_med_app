const express = require("express")
const { body, query, param, validationResult } = require("express-validator")
const { authenticateAdmin, logSecurityEvent } = require("../middleware/auth")
const { prisma } = require("../utils/database")
const SecurityUtils = require("../utils/security")

const router = express.Router()

// Get all class schedules
router.get(
  "/",
  authenticateAdmin,
  [query("active").optional().isBoolean().withMessage("Active filter must be boolean")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { active } = req.query
      const where = {}

      if (active !== undefined) {
        where.isActive = active === "true"
      }

      const schedules = await prisma.classSchedule.findMany({
        where,
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      })

      // Group schedules by day of week
      const groupedSchedules = schedules.reduce((acc, schedule) => {
        const dayName = getDayName(schedule.dayOfWeek)
        if (!acc[dayName]) {
          acc[dayName] = []
        }
        acc[dayName].push(schedule)
        return acc
      }, {})

      res.json({
        schedules,
        groupedSchedules,
        totalCount: schedules.length,
      })
    } catch (error) {
      console.error("Get schedules error:", error)
      res.status(500).json({ error: "Failed to retrieve schedules" })
    }
  },
)

// Create new class schedule
router.post(
  "/",
  authenticateAdmin,
  [
    body("name")
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Class name is required (1-100 characters)"),
    body("dayOfWeek").isInt({ min: 0, max: 6 }).withMessage("Day of week must be 0-6 (Sunday-Saturday)"),
    body("startTime")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Start time must be in HH:MM format"),
    body("endTime")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("End time must be in HH:MM format"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, dayOfWeek, startTime, endTime } = req.body

      // Validate time logic
      if (startTime >= endTime) {
        return res.status(400).json({ error: "End time must be after start time" })
      }

      // Check for scheduling conflicts
      const conflictingSchedule = await prisma.classSchedule.findFirst({
        where: {
          dayOfWeek: Number.parseInt(dayOfWeek),
          isActive: true,
          OR: [
            {
              AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
            },
            {
              AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
            },
            {
              AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
            },
          ],
        },
      })

      if (conflictingSchedule) {
        return res.status(409).json({
          error: "Schedule conflict detected",
          conflictingSchedule: {
            name: conflictingSchedule.name,
            time: `${conflictingSchedule.startTime}-${conflictingSchedule.endTime}`,
          },
        })
      }

      const schedule = await prisma.classSchedule.create({
        data: {
          name: SecurityUtils.sanitizeInput(name),
          dayOfWeek: Number.parseInt(dayOfWeek),
          startTime,
          endTime,
        },
      })

      logSecurityEvent("SCHEDULE_CREATED", {
        scheduleId: schedule.id,
        name: schedule.name,
        dayOfWeek: schedule.dayOfWeek,
        adminId: req.admin.jti,
      })

      res.status(201).json(schedule)
    } catch (error) {
      console.error("Create schedule error:", error)
      res.status(500).json({ error: "Failed to create schedule" })
    }
  },
)

// Update class schedule
router.put(
  "/:id",
  authenticateAdmin,
  [
    param("id").isString().notEmpty().withMessage("Schedule ID is required"),
    body("name").optional().isString().trim().isLength({ min: 1, max: 100 }),
    body("dayOfWeek").optional().isInt({ min: 0, max: 6 }),
    body("startTime")
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body("endTime")
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body("isActive").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params
      const updateData = {}

      // Build update data
      const allowedFields = ["name", "dayOfWeek", "startTime", "endTime", "isActive"]
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          if (field === "name") {
            updateData[field] = SecurityUtils.sanitizeInput(req.body[field])
          } else if (field === "dayOfWeek") {
            updateData[field] = Number.parseInt(req.body[field])
          } else {
            updateData[field] = req.body[field]
          }
        }
      }

      // Validate time logic if both times are being updated
      if (updateData.startTime && updateData.endTime) {
        if (updateData.startTime >= updateData.endTime) {
          return res.status(400).json({ error: "End time must be after start time" })
        }
      }

      const schedule = await prisma.classSchedule.update({
        where: { id },
        data: updateData,
      })

      logSecurityEvent("SCHEDULE_UPDATED", {
        scheduleId: id,
        updatedFields: Object.keys(updateData),
        adminId: req.admin.jti,
      })

      res.json(schedule)
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Schedule not found" })
      }
      console.error("Update schedule error:", error)
      res.status(500).json({ error: "Failed to update schedule" })
    }
  },
)

// Delete class schedule
router.delete(
  "/:id",
  authenticateAdmin,
  [param("id").isString().notEmpty().withMessage("Schedule ID is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params

      await prisma.classSchedule.delete({
        where: { id },
      })

      logSecurityEvent("SCHEDULE_DELETED", {
        scheduleId: id,
        adminId: req.admin.jti,
      })

      res.json({ success: true, message: "Schedule deleted successfully" })
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Schedule not found" })
      }
      console.error("Delete schedule error:", error)
      res.status(500).json({ error: "Failed to delete schedule" })
    }
  },
)

// Helper function to get day name
function getDayName(dayOfWeek) {
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
  return days[dayOfWeek] || "Unknown"
}

module.exports = router
