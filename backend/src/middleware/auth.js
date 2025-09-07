const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const rateLimit = require("express-rate-limit")

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    error: "Too many login attempts, please try again later",
    retryAfter: 15 * 60, // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
})

const tokenBlacklist = new Set()

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token required" })
  }

  const token = authHeader.substring(7)

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: "Token has been revoked" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Verify this is an admin token
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" })
    }

    const tokenAge = Date.now() - decoded.timestamp
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

    if (tokenAge > maxAge) {
      return res.status(401).json({ error: "Token expired" })
    }

    req.admin = decoded
    req.token = token // Store token for potential blacklisting
    next()
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" })
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" })
    }
    return res.status(401).json({ error: "Token verification failed" })
  }
}

const verifyAdminPassword = async (password) => {
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  if (!adminPasswordHash) {
    throw new Error("Admin password not configured")
  }

  const dummyHash = "$2b$10$dummy.hash.to.prevent.timing.attacks.dummy"
  const targetHash = adminPasswordHash || dummyHash

  return await bcrypt.compare(password, targetHash)
}

const generateAdminToken = () => {
  return jwt.sign(
    {
      role: "admin",
      timestamp: Date.now(),
      jti: require("crypto").randomUUID(), // JWT ID for tracking
      iss: "med-crm-backend", // Issuer
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
      algorithm: "HS256",
    },
  )
}

const blacklistToken = (token) => {
  tokenBlacklist.add(token)

  // Clean up old tokens periodically (simple cleanup)
  if (tokenBlacklist.size > 1000) {
    const tokensArray = Array.from(tokenBlacklist)
    const tokensToKeep = tokensArray.slice(-500) // Keep last 500 tokens
    tokenBlacklist.clear()
    tokensToKeep.forEach((t) => tokenBlacklist.add(t))
  }
}

const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("X-Frame-Options", "DENY")
  res.setHeader("X-XSS-Protection", "1; mode=block")
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
  next()
}

const logSecurityEvent = (event, details = {}) => {
  const timestamp = new Date().toISOString()
  console.log(`[SECURITY] ${timestamp} - ${event}:`, details)
}

module.exports = {
  authenticateAdmin,
  verifyAdminPassword,
  generateAdminToken,
  adminLoginLimiter,
  blacklistToken,
  securityHeaders,
  logSecurityEvent,
}
