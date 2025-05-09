const express = require("express")
const router = express.Router()
const interviewController = require("../controllers/interviewController")
const authMiddleware = require("../middleware/auth")

// All routes require authentication
router.use(authMiddleware)

// Get interview questions
router.get("/questions", interviewController.getInterviewQuestions)

// Submit completed interview
router.post("/submit", interviewController.submitInterview)

module.exports = router
