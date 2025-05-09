const mongoose = require("mongoose")

const userSkillSchema = new mongoose.Schema({
  // The user these skills belong to
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // The skills the user has added
  skills: {
    type: [String],
    default: [],
  },
  // Date the skills were last updated
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("UserSkill", userSkillSchema)
