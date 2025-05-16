import React from "react"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import "./index.css"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import VerifyEmail from "./pages/VerifyEmail"
import ResendVerification from "./pages/ResendVerification"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Overview from "./pages/Overview"
import Navbar from "./components/Navbar"
import ChallengePage from "./pages/ChallengePage"

// Update the App component to manage the user's role
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")

  // Check authentication status when the component mounts
  useEffect(() => {
    const token = localStorage.getItem("token")
    const storedUserName = localStorage.getItem("userName")
    const storedUserRole = localStorage.getItem("userRole")

    setIsAuthenticated(!!token)

    // Set the user name from localStorage if available
    if (storedUserName) {
      setUserName(storedUserName)
    }

    // Set the user role from localStorage if available
    if (storedUserRole) {
      setUserRole(storedUserRole)
    }
  }, [])

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    // Get the user name and role from localStorage after successful login
    const storedUserName = localStorage.getItem("userName")
    const storedUserRole = localStorage.getItem("userRole")

    if (storedUserName) {
      setUserName(storedUserName)
    }

    if (storedUserRole) {
      setUserRole(storedUserRole)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userName")
    localStorage.removeItem("userRole")
    setIsAuthenticated(false)
    setUserName("")
    setUserRole("")
    // Redirect will happen automatically due to route protection
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {isAuthenticated && (
          <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} userName={userName} userRole={userRole} />
        )}
        <div className="flex-grow">
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/overview" /> : <Login onAuthSuccess={handleAuthSuccess} />}
            />
            <Route
              path="/signup"
              element={isAuthenticated ? <Navigate to="/overview" /> : <Signup onAuthSuccess={handleAuthSuccess} />}
            />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/resend-verification" element={<ResendVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/overview"
              element={
                isAuthenticated ? <Overview userName={userName} userRole={userRole} /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/complete-profile"
              element={
                isAuthenticated ? (
                  <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6 text-center">
                      <h1 className="text-2xl font-bold text-gray-800 mb-4">Complete Your Profile</h1>
                      <p className="text-gray-600">This page is under construction.</p>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/challenge/:challengeId"
              element={isAuthenticated ? <ChallengePage /> : <Navigate to="/login" />}
            />
            <Route path="/dashboard" element={<Navigate to="/overview" />} />
            {/* Changed default route to redirect to signup instead of login */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/overview" /> : <Navigate to="/signup" />} />
            {/* Catch-all route for any undefined paths */}
            <Route path="*" element={<Navigate to="/signup" />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
