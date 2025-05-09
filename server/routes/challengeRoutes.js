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

module.exports = router
