const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

// Import routes
const authRoutes = require("./routes/auth")
const studentRoutes = require("./routes/students")
const attendanceRoutes = require("./routes/attendance")
const scheduleRoutes = require("./routes/schedule")

const { securityHeaders, logSecurityEvent } = require("./middleware/auth")
const SecurityUtils = require("./utils/security")

const app = express()
const PORT = process.env.PORT || 3001

app.use(securityHeaders)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
)

// Security middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/schedule", scheduleRoutes)

app.use((req, res, next) => {
  // Log suspicious activity
  if (SecurityUtils.detectSuspiciousActivity(req)) {
    logSecurityEvent("SUSPICIOUS_REQUEST", {
      ip: req.ip,
      method: req.method,
      url: req.url,
      userAgent: req.get("User-Agent"),
    })
  }
  next()
})

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err)
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...")
  await prisma.$disconnect()
  process.exit(0)
})

app.listen(PORT, () => {
  console.log(`🚀 Med-CRM Backend running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

module.exports = app
