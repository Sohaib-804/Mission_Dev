const Challenge = require("../models/Challenge")
const User = require("../models/User")
const UserSkill = require("../models/UserSkill")
const logger = require("../utils/logger")

// Get challenges for a user based on their role and skills
exports.getChallengesForUser = async (req, res) => {
  try {
    const userId = req.user.id // Assuming you have authentication middleware

    // Get the user's information
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    // Get the user's skills
    const userSkillsDoc = await UserSkill.findOne({ user: userId })
    const userSkills = userSkillsDoc ? userSkillsDoc.skills : []

    // If user has no skills, return appropriate message
    if (userSkills.length === 0) {
      return res.status(200).json({
        challenges: [],
        message: "Please add your skills to see challenges",
      })
    }

    // Find challenges that match the user's role and skills
    const challenges = await Challenge.find({
      isActive: true,
      targetRoles: user.role,
      requiredSkills: { $in: userSkills }, // At least one skill matches
    })

    res.status(200).json({ challenges })
  } catch (err) {
    logger.error("Error getting challenges:", err)
    res.status(500).json({ msg: "Server error" })
  }
}

// Get a specific challenge by ID
exports.getChallengeById = async (req, res) => {
  try {
    const { challengeId } = req.params

    const challenge = await Challenge.findById(challengeId)
    if (!challenge) {
      return res.status(404).json({ msg: "Challenge not found" })
    }

    res.status(200).json({ challenge })
  } catch (err) {
    logger.error("Error getting challenge:", err)
    res.status(500).json({ msg: "Server error" })
  }
}
