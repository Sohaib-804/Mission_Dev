const express = require("express")
const router = express.Router()
const challengeController = require("../controllers/challengeController")
const authMiddleware = require("../middleware/auth")

// All routes require authentication
router.use(authMiddleware)

// Get challenges for the user
router.get("/", challengeController.getChallengesForUser)

// Get a specific challenge
router.get("/:challengeId", challengeController.getChallengeById)

// Submit a solution for a challenge
router.post("/:challengeId/submit", challengeController.submitChallenge)

// Mark a challenge as completed regardless of solution correctness
router.post("/:challengeId/mark-completed", challengeController.markChallengeCompleted)

module.exports = router
