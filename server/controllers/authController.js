const User = require("../models/User")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/emailService")
const logger = require("../utils/logger")

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }
    res.json({ user })
  } catch (err) {
    logger.error("Error getting current user:", err)
    res.status(500).json({ msg: "Server error" })
  }
}

// Generate a token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" })
}

// Generate a random token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex")
}

// Modify the signup function to handle email verification errors gracefully
exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, role, yearsOfExperience, specialties, linkedinUrl } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ msg: "Email already in use" })

    // Generate verification token
    const verificationToken = generateVerificationToken()
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user with all form data and verification info
    const user = await User.create({
      fullName,
      email,
      password,
      role,
      yearsOfExperience,
      specialties,
      linkedinUrl,
      verificationToken,
      verificationTokenExpires,
      isVerified: false,
    })

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken, fullName)

    if (!emailSent && process.env.EMAIL_USER) {
      // Only return an error if email is configured but failed to send
      return res.status(500).json({ msg: "Failed to send verification email. Please try again." })
    }

    // If email service is not configured, we'll still create the user but inform them
    const emailServiceConfigured = process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD

    res.status(201).json({
      msg: emailServiceConfigured
        ? "Registration successful! Please check your email to verify your account."
        : "Registration successful! Email verification is currently disabled. Please proceed to login.",
      userId: user._id,
      emailVerificationDisabled: !emailServiceConfigured,
    })
  } catch (err) {
    logger.error("Signup error:", err)
    res.status(500).json({ msg: err.message })
  }
}

// Modify the login function to bypass email verification if email service is not configured
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    logger.info(`Login attempt for email: ${email}`)

    const user = await User.findOne({ email })
    if (!user) {
      logger.warn("User not found")
      return res.status(401).json({ msg: "Invalid email or password" })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      logger.warn("Invalid password")
      return res.status(401).json({ msg: "Invalid email or password" })
    }

    // Check if email verification is required
    const emailServiceConfigured = process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD

    // Check if email is verified (skip if email service is not configured)
    if (emailServiceConfigured && !user.isVerified) {
      logger.warn("Email not verified")
      return res.status(403).json({
        msg: "Please verify your email before logging in",
        isVerified: false,
        userId: user._id,
      })
    }

    // Generate token and send response
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" })

    logger.info("Login successful")
    res.status(200).json({ user, token })
  } catch (err) {
    logger.error("Login error:", err)
    res.status(500).json({ msg: err.message })
  }
}

exports.verifyEmail = async (req, res) => {
  try {
    // Get token from request body instead of params
    const { token } = req.body

    logger.info("Verification token received:", token)

    if (!token) {
      return res.status(400).json({ msg: "Token is required" })
    }

    // Find user with this token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    })

    logger.info("User found:", user ? "Yes" : "No")

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired verification token" })
    }

    // Update user as verified
    user.isVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpires = undefined
    await user.save()

    logger.info(`User ${user.email} verified successfully`)
    res.status(200).json({ msg: "Email verified successfully! You can now log in." })
  } catch (err) {
    logger.error("Verification error:", err)
    res.status(500).json({ msg: err.message })
  }
}

exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    if (user.isVerified) {
      return res.status(400).json({ msg: "Email is already verified" })
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken()
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    user.verificationToken = verificationToken
    user.verificationTokenExpires = verificationTokenExpires
    await user.save()

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken, user.fullName)

    if (!emailSent) {
      return res.status(500).json({ msg: "Failed to send verification email. Please try again." })
    }

    res.status(200).json({ msg: "Verification email sent! Please check your inbox." })
  } catch (err) {
    logger.error("Resend verification email error:", err)
    res.status(500).json({ msg: err.message })
  }
}

// New functions for password reset

// Request password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    logger.info(`Password reset requested for: ${email}`)

    const user = await User.findOne({ email })
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return res.status(200).json({
        msg: "If your email is registered, you will receive a password reset link shortly.",
      })
    }

    // Generate reset token
    const resetToken = generateVerificationToken()
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save token to user
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = resetTokenExpires
    await user.save()

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(email, resetToken, user.fullName)

    if (!emailSent) {
      return res.status(500).json({ msg: "Failed to send password reset email. Please try again." })
    }

    // Always return success for security (even if email doesn't exist)
    res.status(200).json({
      msg: "If your email is registered, you will receive a password reset link shortly.",
    })
  } catch (err) {
    logger.error("Forgot password error:", err)
    res.status(500).json({ msg: "An error occurred. Please try again later." })
  }
}

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body

    logger.info("Password reset token received")

    if (!token || !password) {
      return res.status(400).json({ msg: "Token and new password are required" })
    }

    // Find user with this token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired password reset token" })
    }

    // Update password
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    logger.info(`Password reset successful for ${user.email}`)
    res.status(200).json({ msg: "Password has been reset successfully. You can now log in with your new password." })
  } catch (err) {
    logger.error("Reset password error:", err)
    res.status(500).json({ msg: err.message })
  }
}

// Validate reset token (optional - to check if token is valid before showing reset form)
exports.validateResetToken = async (req, res) => {
  try {
    const { token } = req.params

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ valid: false })
    }

    res.status(200).json({ valid: true })
  } catch (err) {
    logger.error("Validate token error:", err)
    res.status(500).json({ valid: false })
  }
}


