const UserSkill = require("../models/UserSkill")
const User = require("../models/User")
const logger = require("../utils/logger")

// Get skills for a user
exports.getUserSkills = async (req, res) => {
  try {
    const userId = req.user.id // Assuming you have authentication middleware

    // Find the user's skills
    const userSkills = await UserSkill.findOne({ user: userId })

    // If no skills found, return empty array
    if (!userSkills) {
      return res.status(200).json({ skills: [] })
    }

    res.status(200).json({ skills: userSkills.skills })
  } catch (err) {
    console.error("Error getting user skills:", err)
    res.status(500).json({ msg: "Server error" })
  }
}

// Add or update skills for a user
exports.updateUserSkills = async (req, res) => {
  try {
    const userId = req.user.id // Assuming you have authentication middleware
    const { skills } = req.body

    if (!Array.isArray(skills)) {
      return res.status(400).json({ msg: "Skills must be an array" })
    }

    // Limit to 16 skills
    if (skills.length > 16) {
      return res.status(400).json({ msg: "Maximum of 16 skills allowed" })
    }

    // Find and update or create new skills document
    let userSkills = await UserSkill.findOne({ user: userId })

    if (userSkills) {
      userSkills.skills = skills
      userSkills.updatedAt = Date.now()
    } else {
      userSkills = new UserSkill({
        user: userId,
        skills,
      })
    }

    await userSkills.save()

    res.status(200).json({ skills: userSkills.skills })
  } catch (err) {
    logger.error("Error updating user skills:", err)
    res.status(500).json({ msg: "Server error" })
  }
}
