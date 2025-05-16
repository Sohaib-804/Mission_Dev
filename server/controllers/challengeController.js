const Challenge = require("../models/Challenge")
const User = require("../models/User")
const UserSkill = require("../models/UserSkill")
const Submission = require("../models/Submission")
const logger = require("../utils/logger")
const { evaluateCode } = require("../utils/codeEvaluator")

// Get challenges for a user based on their role and skills
exports.getChallengesForUser = async (req, res) => {
  try {
    const userId = req.user.id

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

    // Log skills for debugging
    logger.info(`User skills: ${JSON.stringify(userSkills)}`)

    // Create case-insensitive regex patterns for each skill
    const skillPatterns = userSkills.map((skill) => new RegExp(`^${skill}$`, "i"))

    // Find challenges that match the user's role, specialties, and skills
    const query = {
      isActive: true,
      targetRoles: user.role,
      // Use $in with regex patterns for case-insensitive matching
      requiredSkills: { $in: skillPatterns },
    }

    // Add specialties to query if user has specialties
    if (user.specialties && user.specialties.length > 0) {
      query.$or = [
        { targetSpecialties: { $in: user.specialties } },
        { targetSpecialties: { $size: 0 } }, // Also include challenges with no specific specialties
      ]
    }

    // Log the query for debugging
    logger.info(`Challenge query: ${JSON.stringify(query)}`)

    const challenges = await Challenge.find(query)

    // Log found challenges
    logger.info(`Found ${challenges.length} matching challenges`)

    // Get user's completed challenges
    const userCompletedChallenges = user.applicationProgress?.codeChallenge?.completed
      ? [user.applicationProgress.codeChallenge.challengeId]
      : []

    // Add completed status to each challenge
    const challengesWithStatus = challenges.map((challenge) => {
      const isCompleted = userCompletedChallenges.some((id) => id.toString() === challenge._id.toString())

      return {
        ...challenge.toObject(),
        isCompleted,
      }
    })

    res.status(200).json({ challenges: challengesWithStatus })
  } catch (err) {
    logger.error("Error getting challenges:", err)
    res.status(500).json({ msg: "Server error" })
  }
}

// Get a specific challenge by ID
exports.getChallengeById = async (req, res) => {
  try {
    const { challengeId } = req.params
    const userId = req.user.id

    const challenge = await Challenge.findById(challengeId)
    if (!challenge) {
      return res.status(404).json({ msg: "Challenge not found" })
    }

    // Check if user has already completed this challenge
    const user = await User.findById(userId)
    const isCompleted =
      user.applicationProgress?.codeChallenge?.completed &&
      user.applicationProgress.codeChallenge.challengeId.toString() === challengeId

    // Get user's previous submissions for this challenge
    const submissions = await Submission.find({
      user: userId,
      challenge: challengeId,
    })
      .sort({ createdAt: -1 })
      .limit(1)

    // Add completed status and previous submission to challenge
    const challengeWithStatus = {
      ...challenge.toObject(),
      isCompleted,
      previousSubmission: submissions.length > 0 ? submissions[0] : null,
    }

    res.status(200).json({ challenge: challengeWithStatus })
  } catch (err) {
    logger.error("Error getting challenge:", err)
    res.status(500).json({ msg: "Server error" })
  }
}

// Submit a solution for a challenge
exports.submitChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params
    const { code, language } = req.body
    const userId = req.user.id

    // Validate input
    if (!code) {
      return res.status(400).json({ msg: "Code is required" })
    }

    if (!language) {
      return res.status(400).json({ msg: "Language is required" })
    }

    // Get the challenge
    const challenge = await Challenge.findById(challengeId)
    if (!challenge) {
      return res.status(404).json({ msg: "Challenge not found" })
    }

    // Evaluate the code
    const evaluationResult = await evaluateCode(code, language, challenge.testCases)

    // Create a submission record
    const submission = new Submission({
      user: userId,
      challenge: challengeId,
      code,
      language,
      result: evaluationResult,
      passed: evaluationResult.status === "success",
    })

    await submission.save()

    // Return the evaluation result
    res.status(200).json(evaluationResult)
  } catch (err) {
    logger.error("Error submitting challenge:", err)
    res.status(500).json({ msg: "Server error" })
  }
}

// Mark a challenge as completed regardless of solution correctness
exports.markChallengeCompleted = async (req, res) => {
  try {
    const { challengeId } = req.params
    const userId = req.user.id

    // Get the challenge
    const challenge = await Challenge.findById(challengeId)
    if (!challenge) {
      return res.status(404).json({ msg: "Challenge not found" })
    }

    // Update the user's progress to mark challenge as completed
    await User.findByIdAndUpdate(userId, {
      $set: {
        "applicationProgress.codeChallenge": {
          completed: true,
          challengeId: challengeId,
          submissionDate: new Date(),
        },
      },
    })

    res.status(200).json({ msg: "Challenge marked as completed" })
  } catch (err) {
    logger.error("Error marking challenge as completed:", err)
    res.status(500).json({ msg: "Server error" })
  }
}
