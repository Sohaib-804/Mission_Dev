// This script will seed the database with sample challenges
// Run with: node scripts/seed-challenges.js

const mongoose = require("mongoose")
const dotenv = require("dotenv")
const Challenge = require("../models/Challenge")

// Load environment variables
dotenv.config()

// Sample challenges data
const challenges = [
  {
    title: "Build a Responsive Dashboard",
    description: "Create a responsive dashboard with charts and data visualization.",
    difficulty: "Medium",
    estimatedTime: "2 hours",
    targetRoles: ["Software Engineer", "UI/UX Designer"],
    targetSpecialties: ["Front-End Developer"],
    requiredSkills: ["React", "JavaScript", "CSS", "HTML"],
    instructions:
      "Build a responsive dashboard that displays various metrics using charts and graphs. The dashboard should be responsive and work well on mobile devices.",
    acceptanceCriteria: [
      "Dashboard is responsive and works on mobile devices",
      "At least 3 different types of charts are implemented",
      "Data can be filtered by date range",
      "Clean, well-organized code",
    ],
    isActive: true,
  },
  {
    title: "Create a RESTful API",
    description: "Design and implement a RESTful API for a simple blog application.",
    difficulty: "Medium",
    estimatedTime: "2 hours",
    targetRoles: ["Software Engineer", "Tech Lead"],
    targetSpecialties: ["Back-End Developer"],
    requiredSkills: ["Node.js", "Express", "MongoDB", "API Design"],
    instructions:
      "Design and implement a RESTful API for a blog application. The API should support CRUD operations for blog posts and comments.",
    acceptanceCriteria: [
      "API supports CRUD operations for posts and comments",
      "Proper error handling and validation",
      "Well-documented API endpoints",
      "Follows RESTful principles",
    ],
    isActive: true,
  },
  {
    title: "Implement Authentication System",
    description: "Create a secure authentication system with JWT.",
    difficulty: "Hard",
    estimatedTime: "3 hours",
    targetRoles: ["Software Engineer", "Tech Lead"],
    targetSpecialties: ["Back-End Developer", "Security"],
    requiredSkills: ["Node.js", "Express", "JWT", "Authentication"],
    instructions:
      "Implement a secure authentication system using JWT. The system should support registration, login, and password reset functionality.",
    acceptanceCriteria: [
      "Secure user registration and login",
      "Password reset functionality",
      "JWT-based authentication",
      "Proper error handling and validation",
    ],
    isActive: true,
  },
  {
    title: "Mobile App UI Design",
    description: "Design a mobile app UI for a fitness tracking application.",
    difficulty: "Medium",
    estimatedTime: "2 hours",
    targetRoles: ["UI/UX Designer"],
    targetSpecialties: [],
    requiredSkills: ["UI Design", "Mobile Design", "Figma", "UX"],
    instructions:
      "Design a mobile app UI for a fitness tracking application. The app should include screens for tracking workouts, viewing progress, and setting goals.",
    acceptanceCriteria: [
      "Clean and intuitive UI design",
      "Consistent design language",
      "Responsive design for different screen sizes",
      "Consideration for accessibility",
    ],
    isActive: true,
  },
  {
    title: "Automated Testing Suite",
    description: "Create an automated testing suite for a web application.",
    difficulty: "Medium",
    estimatedTime: "2 hours",
    targetRoles: ["Quality Assurance Engineer", "Software Engineer"],
    targetSpecialties: [],
    requiredSkills: ["Jest", "Testing", "JavaScript", "Automation"],
    instructions:
      "Create an automated testing suite for a web application. The suite should include unit tests, integration tests, and end-to-end tests.",
    acceptanceCriteria: [
      "Comprehensive test coverage",
      "Tests for critical functionality",
      "Clear test documentation",
      "CI/CD integration",
    ],
    isActive: true,
  },
  {
    title: "Data Analysis Project",
    description: "Analyze a dataset and create visualizations to derive insights.",
    difficulty: "Medium",
    estimatedTime: "2 hours",
    targetRoles: ["Business Analyst", "Data Scientist"],
    targetSpecialties: ["Data Analysis"],
    requiredSkills: ["Python", "Pandas", "Data Visualization", "Statistics"],
    instructions:
      "Analyze the provided dataset and create visualizations to derive meaningful insights. Present your findings in a clear and concise manner.",
    acceptanceCriteria: [
      "Thorough data cleaning and preprocessing",
      "Meaningful visualizations",
      "Actionable insights derived from the data",
      "Clear presentation of findings",
    ],
    isActive: true,
  },
]

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected")
    seedDatabase()
  })
  .catch((err) => console.error("MongoDB connection error:", err))

// Seed the database
async function seedDatabase() {
  try {
    // Clear existing challenges
    await Challenge.deleteMany({})
    console.log("Cleared existing challenges")

    // Insert new challenges
    const result = await Challenge.insertMany(challenges)
    console.log(`Added ${result.length} challenges to the database`)

    // Disconnect from MongoDB
    mongoose.disconnect()
    console.log("MongoDB disconnected")
  } catch (err) {
    console.error("Error seeding database:", err)
    mongoose.disconnect()
  }
}
