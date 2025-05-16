const mongoose = require("mongoose")

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Challenge",
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  result: {
    status: {
      type: String,
      enum: ["success", "error", "timeout", "compilation_error"],
      required: true,
    },
    output: String,
    testResults: [
      {
        name: String,
        passed: Boolean,
        message: String,
      },
    ],
    error: String,
  },
  passed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Submission", submissionSchema)
