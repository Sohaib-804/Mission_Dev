const express = require("express")
const router = express.Router()
const { testEmailConfig } = require("../utils/emailService")

// Route to test email configuration
router.get("/email-config", async (req, res) => {
  try {
    const result = await testEmailConfig()
    res.status(200).json({
      success: result,
      message: result ? "Email configuration is working correctly" : "Email configuration test failed",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error testing email configuration",
      error: error.message,
    })
  }
})

module.exports = router
