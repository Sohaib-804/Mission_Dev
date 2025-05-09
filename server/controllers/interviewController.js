const Interview = require("../models/Interview")
const User = require("../models/User")

// Get interview questions for a user
exports.getInterviewQuestions = async (req, res) => {
  try {
    const userId = req.user.id // Assuming you have authentication middleware

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

    // Create or update the interview document
    let interview = await Interview.findOne({ user: userId, status: "pending" })

    if (!interview) {
      interview = new Interview({
        user: userId,
        userRole: user.role,
        questions: allQuestions,
      })
      await interview.save()
    }

    res.status(200).json({ interview })
  } catch (err) {
    logger.error("Error getting interview questions:", err)
    res.status(500).json({ msg: "Server error" })
  }
}

// Submit a completed interview
exports.submitInterview = async (req, res) => {
  try {
    const userId = req.user.id // Assuming you have authentication middleware
    const { interviewId, recordingUrl } = req.body

    if (!recordingUrl) {
      return res.status(400).json({ msg: "Recording URL is required" })
    }

    // Find the interview
    const interview = await Interview.findOne({ _id: interviewId, user: userId })
    if (!interview) {
      return res.status(404).json({ msg: "Interview not found" })
    }

    // Update the interview
    interview.status = "completed"
    interview.recordingUrl = recordingUrl
    interview.completedAt = Date.now()
    await interview.save()

    res.status(200).json({ msg: "Interview submitted successfully", interview })
  } catch (err) {
    logger.error("Error submitting interview:", err)
    res.status(500).json({ msg: "Server error" })
  }
}
