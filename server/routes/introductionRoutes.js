const express = require("express")
const router = express.Router()
const introductionController = require("../controllers/introductionController")
const auth = require("../middleware/auth")

// Get introduction questions
router.get("/questions", auth, introductionController.getIntroductionQuestions)

// Save answers to questions
router.post("/answers", auth, introductionController.saveAnswers)

// Save video URL
router.post("/video", auth, introductionController.saveVideo)

// Get user's introduction
router.get("/", auth, introductionController.getUserIntroduction)

module.exports = router
