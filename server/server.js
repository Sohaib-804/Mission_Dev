const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const authRoutes = require("./routes/authRoutes")
const skillRoutes = require("./routes/skillRoutes")
const challengeRoutes = require("./routes/challengeRoutes")
const interviewRoutes = require("./routes/interviewRoutes")
const logger = require("./utils/logger")
// Load environment variables
dotenv.config()

// Add this near the top of your server.js file, after loading environment variables
// but before connecting to MongoDB

const { testEmailConfig } = require("./utils/emailService")

// Test email configuration on server startup
;(async () => {
  try {
    await testEmailConfig()
  } catch (err) {
    console.error("Email configuration test failed:", err)
  }
})()

// Initialize Express app
const app = express()

// Middleware
app.use(express.json())
app.use(cors())

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info("MongoDB connected")) // Use logger instead of console.log
  .catch((err) => logger.error("MongoDB connection error:", err)); // Use logger for errors

// Add this to your server.js file where you define your routes
const testRoutes = require("./routes/testRoutes")

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/skills", skillRoutes)
app.use("/api/challenges", challengeRoutes)
app.use("/api/interviews", interviewRoutes)

// Add this with your other app.use statements
app.use("/api/test", testRoutes)

// Default route
app.get("/", (req, res) => {
  res.send("Mission API is running")
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
