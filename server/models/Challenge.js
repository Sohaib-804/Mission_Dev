const mongoose = require("mongoose")

const testCaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  testCode: {
    type: String,
    required: true,
  },
  input: String,
  expectedOutput: String,
  keywords: [String], // For fallback evaluation
})

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  estimatedTime: {
    type: String,
    required: true,
  },
  // The roles this challenge is appropriate for
  targetRoles: {
    type: [String],
    required: true,
  },
  // The specialties this challenge is appropriate for
  targetSpecialties: {
    type: [String],
    default: [],
  },
  // Required skills for this challenge
  requiredSkills: {
    type: [String],
    required: true,
  },
  // Instructions for the challenge
  instructions: {
    type: String,
    required: true,
  },
  // Acceptance criteria
  acceptanceCriteria: {
    type: [String],
    required: true,
  },
  // Code templates for different languages
  codeTemplate: {
    type: Map,
    of: String,
    default: () => new Map(),
  },
  // Test cases for evaluating submissions
  testCases: [testCaseSchema],
  // Whether this challenge is active
  isActive: {
    type: Boolean,
    default: true,
  },
  // Date the challenge was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Challenge", challengeSchema)
