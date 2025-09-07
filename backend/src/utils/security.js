const crypto = require("crypto")

class SecurityUtils {
  // Generate secure random strings
  static generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString("hex")
  }

  // Hash sensitive data (not passwords - use bcrypt for those)
  static hashData(data) {
    return crypto.createHash("sha256").update(data).digest("hex")
  }

  // Validate input against common injection patterns
  static sanitizeInput(input) {
    if (typeof input !== "string") return input

    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, "") // Remove HTML tags
      .replace(/['"]/g, "") // Remove quotes
      .replace(/[;]/g, "") // Remove semicolons
      .trim()
  }

  // Check for suspicious patterns in requests
  static detectSuspiciousActivity(req) {
    const suspiciousPatterns = [/union.*select/i, /drop.*table/i, /<script/i, /javascript:/i, /on\w+\s*=/i]

    const requestString = JSON.stringify({
      body: req.body,
      query: req.query,
      params: req.params,
    })

    return suspiciousPatterns.some((pattern) => pattern.test(requestString))
  }

  // Rate limiting helper
  static createCustomLimiter(windowMs, max, message) {
    const rateLimit = require("express-rate-limit")
    return rateLimit({
      windowMs,
      max,
      message: { error: message },
      standardHeaders: true,
      legacyHeaders: false,
    })
  }
}

module.exports = SecurityUtils
