const nodemailer = require("nodemailer")
const logger = require("./logger")
// Create a test function to verify email configuration
exports.testEmailConfig = async () => {
  logger.info("Testing email configuration...")
  logger.info("EMAIL_USER:", process.env.EMAIL_USER)
  logger.info(
    "EMAIL_APP_PASSWORD:",
    process.env.EMAIL_APP_PASSWORD ? "Set (length: " + process.env.EMAIL_APP_PASSWORD.length + ")" : "Not set",
  )

  // Remove spaces from app password if present
  const cleanPassword = process.env.EMAIL_APP_PASSWORD ? process.env.EMAIL_APP_PASSWORD.replace(/\s+/g, "") : ""

  try {
    // Create test transporter
    const testTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: cleanPassword,
      },
      debug: true, // Enable debug logs
      logger: true, // Log to console
    })

    // Verify connection configuration
    const verification = await testTransporter.verify()
    logger.warn("Email configuration verification:", verification ? "SUCCESS" : "FAILED")
    return verification
  } catch (error) {
    logger.error("Email configuration test failed:", error)
    return false
  }
}

// Create transporter with cleaned password
const createTransporter = () => {
  // Remove spaces from app password if present
  const cleanPassword = process.env.EMAIL_APP_PASSWORD ? process.env.EMAIL_APP_PASSWORD.replace(/\s+/g, "") : ""

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: cleanPassword,
    },
    tls: {
      rejectUnauthorized: false,
    },
    debug: true, // Enable debug output
  })
}

// Check if email service is properly configured
exports.isEmailConfigured = () => {
  return process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD
}

// Send verification email
exports.sendVerificationEmail = async (email, token, fullName) => {
  // Check if email service is configured
  if (!exports.isEmailConfigured()) {
    logger.info("Email service not configured. Skipping email verification.")
    return true // Return true to allow registration to proceed
  }

  // Create a fresh transporter for each email
  const transporter = createTransporter()

  const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #554cc5;">Welcome to Mission!</h2>
        <p>Hello ${fullName},</p>
        <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #554cc5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p>If the button above doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
        <p><a href="${verificationUrl}" style="color: #554cc5; word-break: break-all;">${verificationUrl}</a></p>
        <p>This verification link will expire in 24 hours.</p>
        <p>If you did not create an account, please ignore this email.</p>
        <p>Best regards,<br>The Mission Team</p>
      </div>
    `,
  }

  try {
    logger.info(`Attempting to send verification email to: ${email}`)
    const info = await transporter.sendMail(mailOptions)
    logger.info("Verification email sent successfully:", info.messageId)
    return true
  } catch (error) {
    logger.error("Error sending verification email:", error)
    return false
  }
}

// Send password reset email
exports.sendPasswordResetEmail = async (email, token, fullName) => {
  // Check if email service is configured
  if (!exports.isEmailConfigured()) {
    logger.info("Email service not configured. Skipping password reset email.")
    return true // Return true to allow password reset to proceed
  }

  // Create a fresh transporter for each email
  const transporter = createTransporter()

  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #554cc5;">Reset Your Password</h2>
        <p>Hello ${fullName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #554cc5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If the button above doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
        <p><a href="${resetUrl}" style="color: #554cc5; word-break: break-all;">${resetUrl}</a></p>
        <p>This password reset link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p>Best regards,<br>The Mission Team</p>
      </div>
    `,
  }

  try {
    logger.info(`Attempting to send password reset email to: ${email}`)
    const info = await transporter.sendMail(mailOptions)
    logger.info("Password reset email sent successfully:", info.messageId)
    return true
  } catch (error) {
    logger.error("Error sending password reset email:", error)
    return false
  }
}
