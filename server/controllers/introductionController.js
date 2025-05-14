const Introduction = require("../models/Introduction")
const User = require("../models/User")
const logger = require("../utils/logger")

// Get introduction questions for a user
exports.getIntroductionQuestions = async (req, res) => {
  try {
    const userId = req.user.id

    // Get the user's information
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    // Define general questions that all roles get
    const generalQuestions = [
      { question: "Tell us about yourself and your background.", isRoleSpecific: false },
      { question: "What are you looking for in your next role?", isRoleSpecific: false },
      { question: "What are your salary expectations?", isRoleSpecific: false },
    ]

    // Define role-specific questions
    const roleSpecificQuestions = {
      "Software Engineer": [
        { question: "Describe a challenging technical problem you've solved recently.", isRoleSpecific: true },
        { question: "How do you stay updated with the latest technologies?", isRoleSpecific: true },
      ],
      "Tech Lead": [
        { question: "How do you approach mentoring junior developers?", isRoleSpecific: true },
        { question: "Describe how you've led a technical decision in a past project.", isRoleSpecific: true },
      ],
      "Squad Lead": [
        { question: "How do you handle conflicts within your team?", isRoleSpecific: true },
        { question: "Describe your approach to project planning and estimation.", isRoleSpecific: true },
      ],
      "Business Analyst": [
        { question: "How do you gather and prioritize requirements?", isRoleSpecific: true },
        { question: "Describe how you bridge the gap between business and technical teams.", isRoleSpecific: true },
      ],
      "UI/UX Designer": [
        { question: "Walk us through your design process.", isRoleSpecific: true },
        { question: "How do you incorporate user feedback into your designs?", isRoleSpecific: true },
      ],
      "Quality Assurance Engineer": [
        { question: "How do you approach test planning for a new feature?", isRoleSpecific: true },
        { question: "Describe your experience with automated testing.", isRoleSpecific: true },
      ],
    }

    // Get questions for the user's role
    const userRoleQuestions = roleSpecificQuestions[user.role] || []

    // Combine general and role-specific questions
    const allQuestions = [...generalQuestions, ...userRoleQuestions]

    // Create or update the introduction document
    let introduction = await Introduction.findOne({ user: userId, status: "pending" })

    if (!introduction) {
      introduction = new Introduction({
        user: userId,
        userRole: user.role,
        questions: allQuestions,
      })
      await introduction.save()
    }

    res.status(200).json({ introduction })
  } catch (err) {
    logger.error("Error getting introduction questions:", err)
    res.status(500).json({ msg: "Server error" })
  }
}

// Save answers to introduction questions
exports.saveAnswers = async (req, res) => {
  try {
    const userId = req.user.id
    const { introductionId, answers } = req.body

    if (!introductionId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ msg: "Invalid request data" })
    }

    // Find the introduction
    const introduction = await Introduction.findOne({ _id: introductionId, user: userId })
    if (!introduction) {
      return res.status(404).json({ msg: "Introduction not found" })
    }

    // Update answers
    answers.forEach((answer) => {
      const questionIndex = introduction.questions.findIndex((q) => q._id.toString() === answer.questionId)
      if (questionIndex !== -1) {
        introduction.questions[questionIndex].answer = answer.text
      }
    })

    await introduction.save()

    res.status(200).json({ msg: "Answers saved successfully", introduction })
  } catch (err) {
    logger.error("Error saving answers:", err)
    res.status(500).json({ msg: "Server error" })
  }
}

// Save video URL
exports.saveVideo = async (req, res) => {
  try {
    const userId = req.user.id
    const { introductionId, videoUrl, textOnly = false } = req.body

    if (!introductionId || !videoUrl) {
      return res.status(400).json({ msg: "Introduction ID and video URL are required" })
    }

    // Find the introduction
    const introduction = await Introduction.findOne({ _id: introductionId, user: userId })
    if (!introduction) {
      return res.status(404).json({ msg: "Introduction not found" })
    }

    // Update the introduction
    introduction.videoUrl = videoUrl
    introduction.status = "completed"
    introduction.completedAt = Date.now()
    introduction.textOnly = textOnly // Add this field to track text-only submissions
    await introduction.save()

    // Update user's application progress
    await User.findByIdAndUpdate(userId, {
      $set: {
        "applicationProgress.videoIntroduction": {
          completed: true,
          introductionId: introduction._id,
          videoUrl: videoUrl,
          textOnly: textOnly,
          submissionDate: new Date(),
        },
      },
    })

    res.status(200).json({ msg: "Video saved successfully", introduction })
  } catch (err) {
    logger.error("Error saving video:", err)
    res.status(500).json({ msg: "Server error" })
  }
}

// Get user's introduction
exports.getUserIntroduction = async (req, res) => {
  try {
    const userId = req.user.id

    const introduction = await Introduction.findOne({ user: userId }).sort({ createdAt: -1 })
    if (!introduction) {
      return res.status(404).json({ msg: "Introduction not found" })
    }

    res.status(200).json({ introduction })
  } catch (err) {
    logger.error("Error getting user introduction:", err)
    res.status(500).json({ msg: "Server error" })
  }
}
