const express = require("express")
const { body, validationResult } = require("express-validator")
const {
  verifyAdminPassword,
  generateAdminToken,
  adminLoginLimiter,
  blacklistToken,
  authenticateAdmin,
  logSecurityEvent,
} = require("../middleware/auth")

const router = express.Router()

router.post(
  "/admin/login",
  adminLoginLimiter,
  [
    body("password")
      .isLength({ min: 1 })
      .withMessage("Password is required")
      .isLength({ max: 100 })
      .withMessage("Password too long"),
  ],
  async (req, res) => {
    const clientIP = req.ip || req.connection.remoteAddress

    try {
      // Check validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        logSecurityEvent("ADMIN_LOGIN_VALIDATION_ERROR", { ip: clientIP, errors: errors.array() })
        return res.status(400).json({ errors: errors.array() })
      }

      const { password } = req.body

      if (typeof password !== "string") {
        logSecurityEvent("ADMIN_LOGIN_INVALID_INPUT", { ip: clientIP })
        return res.status(400).json({ error: "Invalid input format" })
      }

      // Verify admin password
      const isValidPassword = await verifyAdminPassword(password)

      if (!isValidPassword) {
        logSecurityEvent("ADMIN_LOGIN_FAILED", { ip: clientIP, timestamp: new Date().toISOString() })
        return res.status(401).json({ error: "Invalid admin credentials" })
      }

      // Generate JWT token
      const token = generateAdminToken()

      logSecurityEvent("ADMIN_LOGIN_SUCCESS", { ip: clientIP, timestamp: new Date().toISOString() })

      res.json({
        success: true,
        token,
        message: "Admin authentication successful",
        expiresIn: "24h",
        tokenType: "Bearer",
      })
    } catch (error) {
      console.error("Admin login error:", error)
      logSecurityEvent("ADMIN_LOGIN_ERROR", { ip: clientIP, error: error.message })
      res.status(500).json({ error: "Authentication failed" })
    }
  },
)

router.get("/admin/verify", async (req, res) => {
  const authHeader = req.headers.authorization
  const clientIP = req.ip || req.connection.remoteAddress

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ valid: false, error: "No token provided" })
  }

  const token = authHeader.substring(7)

  try {
    const jwt = require("jsonwebtoken")
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role === "admin") {
      const expiresAt = new Date(decoded.exp * 1000)
      const timeUntilExpiry = expiresAt.getTime() - Date.now()

      res.json({
        valid: true,
        admin: true,
        expiresAt: expiresAt.toISOString(),
        expiresInMinutes: Math.floor(timeUntilExpiry / (1000 * 60)),
      })
    } else {
      logSecurityEvent("ADMIN_VERIFY_INVALID_ROLE", { ip: clientIP, role: decoded.role })
      res.status(403).json({ valid: false, error: "Invalid role" })
    }
  } catch (error) {
    logSecurityEvent("ADMIN_VERIFY_FAILED", { ip: clientIP, error: error.message })
    res.status(401).json({ valid: false, error: "Invalid token" })
  }
})

router.post("/admin/logout", authenticateAdmin, async (req, res) => {
  try {
    const token = req.token
    const clientIP = req.ip || req.connection.remoteAddress

    // Blacklist the current token
    blacklistToken(token)

    logSecurityEvent("ADMIN_LOGOUT", { ip: clientIP, timestamp: new Date().toISOString() })

    res.json({
      success: true,
      message: "Successfully logged out",
    })
  } catch (error) {
    console.error("Admin logout error:", error)
    res.status(500).json({ error: "Logout failed" })
  }
})

router.post("/admin/refresh", authenticateAdmin, async (req, res) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress

    // Generate new token
    const newToken = generateAdminToken()

    // Blacklist old token
    blacklistToken(req.token)

    logSecurityEvent("ADMIN_TOKEN_REFRESH", { ip: clientIP, timestamp: new Date().toISOString() })

    res.json({
      success: true,
      token: newToken,
      message: "Token refreshed successfully",
      expiresIn: "24h",
      tokenType: "Bearer",
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    res.status(500).json({ error: "Token refresh failed" })
  }
})

module.exports = router
