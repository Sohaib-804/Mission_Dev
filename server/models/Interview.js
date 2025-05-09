const mongoose = require("mongoose")

const interviewSchema = new mongoose.Schema({
  // The user this interview is for
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // The role of the user
  userRole: {
    type: String,
    required: true,
  },
  // Questions for this interview
  questions: [
    {
      question: {
        type: String,
        required: true,
      },
      // Whether this is a role-specific question
      isRoleSpecific: {
        type: Boolean,
        default: false,
      },
      // Whether this is a specialty-specific question
      isSpecialtySpecific: {
        type: Boolean,
        default: false,
      },
    },
  ],
  // Status of the interview
  status: {
    type: String,
    enum: ["pending", "completed", "reviewed"],
    default: "pending",
  },
  // URL to the recorded interview (if applicable)
  recordingUrl: {
    type: String,
  },
  // Reviewer's notes
  reviewerNotes: {
    type: String,
  },
  // Date the interview was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Date the interview was completed
  completedAt: {
    type: Date,
  },
})

module.exports = mongoose.model("Interview", interviewSchema)
