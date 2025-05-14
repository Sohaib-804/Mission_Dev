const mongoose = require("mongoose")

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    default: "",
  },
  isRoleSpecific: {
    type: Boolean,
    default: false,
  },
  isSpecialtySpecific: {
    type: Boolean,
    default: false,
  },
})

const introductionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    questions: [questionSchema],
    videoUrl: {
      type: String,
      default: "",
    },
    textOnly: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Introduction", introductionSchema)
