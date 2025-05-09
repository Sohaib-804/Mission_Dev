const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: [
      "Software Engineer",
      "Tech Lead",
      "Squad Lead",
      "Business Analyst",
      "UI/UX Designer",
      "Quality Assurance Engineer",
    ],
    required: true,
  },
  // Add new fields for step 2 data
  yearsOfExperience: {
    type: String,
    enum: ["1 year", "2-3 years", "4-6 years", "7-10 years", "10+ years"],
    default: "",
  },
  specialties: {
    type: [String],
    default: [],
  },
  linkedinUrl: {
    type: String,
    default: "",
  },
  // Email verification fields
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  verificationTokenExpires: {
    type: Date,
  },
  // Password reset fields
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  // Application progress tracking
  applicationProgress: {
    codeChallenge: {
      completed: { type: Boolean, default: false },
      challengeId: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge" },
      submissionUrl: { type: String },
      submissionDate: { type: Date },
    },
    videoInterview: {
      completed: { type: Boolean, default: false },
      interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
      recordingUrl: { type: String },
      submissionDate: { type: Date },
    },
    profile: {
      completed: { type: Boolean, default: false },
      lastUpdated: { type: Date },
    },
  },
})

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password)
}

module.exports = mongoose.model("User", userSchema)
