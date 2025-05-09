const express = require("express")
const router = express.Router()
const skillController = require("../controllers/skillController")
const authMiddleware = require("../middleware/auth")

// All routes require authentication
router.use(authMiddleware)

// Get user skills
router.get("/", skillController.getUserSkills)

// Update user skills
router.post("/", skillController.updateUserSkills)

module.exports = router
