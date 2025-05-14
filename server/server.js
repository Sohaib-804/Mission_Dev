const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const authRoutes = require("./routes/authRoutes")
const skillRoutes = require("./routes/skillRoutes")
const challengeRoutes = require("./routes/challengeRoutes")
const introductionRoutes = require("./routes/introductionRoutes")
// const interviewRoutes = require("./routes/interviewRoutes")
const logger = require("./utils/logger")

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()

// Middleware
app.use(express.json({ limit: "50mb" })) // Increase limit for video uploads
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Allow your frontend URL
    credentials: true,
  }),
)

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info("MongoDB connected"))
  .catch((err) => logger.error("MongoDB connection error:", err))

// Test Cloudinary configuration
const { testCloudinaryConfig } = require("./utils/cloudinaryConfig")
testCloudinaryConfig()

// Test email configuration
const { testEmailConfig } = require("./utils/emailService")
;(async () => {
  try {
    await testEmailConfig()
  } catch (err) {
    logger.error("Email configuration test failed:", err)
  }
})()

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/skills", skillRoutes)
app.use("/api/challenges", challengeRoutes)
app.use("/api/introductions", introductionRoutes)
// app.use("/api/interviews", interviewRoutes)

// Add test routes if they exist
try {
  const testRoutes = require("./routes/testRoutes")
  app.use("/api/test", testRoutes)
} catch (err) {
  logger.info("Test routes not found, skipping")
}

// Default route
app.get("/", (req, res) => {
  res.send("Mission API is running")
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`))
