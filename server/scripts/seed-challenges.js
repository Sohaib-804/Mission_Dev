// This script will seed the database with additional challenges
// Run with: node scripts/seed-more-challenges.js

const mongoose = require("mongoose")
const dotenv = require("dotenv")
const Challenge = require("../models/Challenge")

// Load environment variables
dotenv.config()

// Additional challenges with more common skills
const additionalChallenges = [
  {
    title: "Build a React Todo App",
    description: "Create a simple todo application with React and state management.",
    difficulty: "Easy",
    estimatedTime: "1 hour",
    targetRoles: ["Software Engineer"],
    targetSpecialties: ["Front-End Developer"],
    requiredSkills: ["react", "javascript", "html", "css"],
    instructions:
      "Build a todo application that allows users to add, edit, delete, and mark tasks as complete. The app should persist data in local storage.",
    acceptanceCriteria: [
      "Users can add new tasks",
      "Users can mark tasks as complete",
      "Users can edit task descriptions",
      "Users can delete tasks",
      "Data persists when the page is refreshed",
    ],
    codeTemplate: {
      javascript: `// Todo App Component
import React, { useState, useEffect } from 'react';
import './TodoApp.css';

function TodoApp() {
  // TODO: Implement state for todos
  
  // TODO: Implement functions for adding, editing, completing, and deleting todos
  
  // TODO: Implement local storage persistence
  
  return (
    <div className="todo-app">
      <h1>Todo App</h1>
      {/* TODO: Implement todo form and list */}
    </div>
  );
}

export default TodoApp;`,
    },
    testCases: [
      {
        name: "Add Todo",
        testCode: `
          const { render, fireEvent } = require('@testing-library/react');
          const TodoApp = require('./TodoApp');
          
          test('Can add a new todo', () => {
            const { getByPlaceholderText, getByText } = render(<TodoApp />);
            const input = getByPlaceholderText('Add a new todo');
            fireEvent.change(input, { target: { value: 'Test todo' } });
            fireEvent.click(getByText('Add'));
            expect(getByText('Test todo')).toBeInTheDocument();
          });
        `,
        keywords: ["todo", "add", "useState", "input"],
      },
    ],
    isActive: true,
  },
  {
    title: "Create a Node.js REST API",
    description: "Build a simple REST API with Node.js and Express.",
    difficulty: "Medium",
    estimatedTime: "2 hours",
    targetRoles: ["Software Engineer"],
    targetSpecialties: ["Back-End Developer"],
    requiredSkills: ["node", "express", "mongodb", "api"],
    instructions:
      "Create a REST API for a simple resource (e.g., products, users, posts). Implement CRUD operations and proper error handling.",
    acceptanceCriteria: [
      "API supports all CRUD operations",
      "Proper error handling and validation",
      "Data is stored in MongoDB",
      "API follows REST principles",
    ],
    codeTemplate: {
      javascript: `// Express API
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

// TODO: Create MongoDB connection

// TODO: Create schema and model

// TODO: Implement CRUD routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`,
    },
    testCases: [
      {
        name: "CRUD Operations",
        testCode: `
          const request = require('supertest');
          const app = require('./app');
          
          test('API supports CRUD operations', async () => {
            // Test POST
            const newItem = { name: 'Test Item', description: 'Test Description' };
            const postRes = await request(app).post('/api/items').send(newItem);
            expect(postRes.status).toBe(201);
            
            // Test GET
            const getRes = await request(app).get('/api/items');
            expect(getRes.status).toBe(200);
            expect(getRes.body.length).toBeGreaterThan(0);
          });
        `,
        keywords: ["express", "mongoose", "router", "crud"],
      },
    ],
    isActive: true,
  },
  {
    title: "Build a Responsive Landing Page",
    description: "Create a responsive landing page with HTML, CSS, and Tailwind CSS.",
    difficulty: "Easy",
    estimatedTime: "1.5 hours",
    targetRoles: ["Software Engineer", "UI/UX Designer"],
    targetSpecialties: ["Front-End Developer"],
    requiredSkills: ["html", "css", "tailwind", "responsive"],
    instructions:
      "Build a responsive landing page for a fictional product or service. The page should include a hero section, features section, testimonials, and a contact form.",
    acceptanceCriteria: [
      "Page is fully responsive and works on mobile, tablet, and desktop",
      "All sections are visually appealing and well-designed",
      "Tailwind CSS is used for styling",
      "Page loads quickly and is optimized for performance",
    ],
    codeTemplate: {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <!-- TODO: Implement landing page sections -->
  
  <!-- Hero Section -->
  
  <!-- Features Section -->
  
  <!-- Testimonials Section -->
  
  <!-- Contact Form -->
</body>
</html>`,
    },
    testCases: [
      {
        name: "Responsive Design",
        testCode: `
          const { JSDOM } = require('jsdom');
          const fs = require('fs');
          
          test('Page is responsive', () => {
            const html = fs.readFileSync('./index.html', 'utf8');
            const dom = new JSDOM(html);
            const document = dom.window.document;
            
            // Check for viewport meta tag
            const metaViewport = document.querySelector('meta[name="viewport"]');
            expect(metaViewport).not.toBeNull();
            expect(metaViewport.getAttribute('content')).toContain('width=device-width');
            
            // Check for responsive classes
            const responsiveElements = document.querySelectorAll('[class*="md:"], [class*="lg:"], [class*="sm:"]');
            expect(responsiveElements.length).toBeGreaterThan(0);
          });
        `,
        keywords: ["responsive", "tailwind", "mobile", "flex", "grid"],
      },
    ],
    isActive: true,
  },
  {
    title: "Implement Authentication with JWT",
    description: "Create a secure authentication system using JWT tokens.",
    difficulty: "Hard",
    estimatedTime: "3 hours",
    targetRoles: ["Software Engineer"],
    targetSpecialties: ["Back-End Developer", "Security"],
    requiredSkills: ["node", "express", "jwt", "authentication"],
    instructions:
      "Implement a secure authentication system with registration, login, and protected routes using JWT tokens.",
    acceptanceCriteria: [
      "Users can register and login securely",
      "JWT tokens are generated and validated correctly",
      "Protected routes are only accessible with valid tokens",
      "Proper error handling and validation",
    ],
    codeTemplate: {
      javascript: `// Authentication System
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// TODO: Implement user model

// TODO: Implement registration route

// TODO: Implement login route

// TODO: Implement middleware to verify token

// TODO: Implement protected route

module.exports = router;`,
    },
    testCases: [
      {
        name: "User Registration",
        testCode: `
          const request = require('supertest');
          const app = require('./app');
          
          test('User can register', async () => {
            const newUser = { 
              email: 'test@example.com', 
              password: 'Password123!', 
              name: 'Test User' 
            };
            const res = await request(app).post('/api/auth/register').send(newUser);
            expect(res.status).toBe(201);
          });
        `,
        keywords: ["register", "bcrypt", "hash", "user"],
      },
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
    // Add new challenges without removing existing ones
    const result = await Challenge.insertMany(additionalChallenges)
    console.log(`Added ${result.length} additional challenges to the database`)

    // Disconnect from MongoDB
    mongoose.disconnect()
    console.log("MongoDB disconnected")
  } catch (err) {
    console.error("Error seeding database:", err)
    mongoose.disconnect()
  }
}
