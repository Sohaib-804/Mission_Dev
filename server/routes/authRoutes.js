const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")

// Auth routes
router.post("/signup", authController.signup)
router.post("/login", authController.login)
router.post("/verify-email", authController.verifyEmail)
router.post("/resend-verification", authController.resendVerificationEmail)

// Password reset routes
router.post("/forgot-password", authController.forgotPassword)
router.post("/reset-password", authController.resetPassword)
router.get("/validate-reset-token/:token", authController.validateResetToken)

module.exports = router;
