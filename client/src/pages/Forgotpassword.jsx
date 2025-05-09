import React from "react"
import { useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle") // idle, loading, success, error
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus("loading")
    setMessage("")

    try {
      const response = await axios.post("http://localhost:5000/api/auth/forgot-password", { email })
      setStatus("success")
      setMessage(response.data.msg)
    } catch (error) {
      setStatus("error")
      setMessage(error.response?.data?.msg || "Failed to send password reset email. Please try again.")
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-6 py-8 sm:px-10 md:px-12 lg:px-16 xl:px-20">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
              <p className="mt-2 text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {status === "error" && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
                <span className="block sm:inline">{message}</span>
              </div>
            )}

            {status === "success" && (
              <div
                className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md"
                role="alert"
              >
                <span className="block sm:inline">{message}</span>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
                  style={{ backgroundColor: "rgb(85, 76, 197)" }}
                >
                  {status === "loading" ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
              <Link to="/login" className="font-medium hover:text-indigo-500" style={{ color: "rgb(56, 51, 148)" }}>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden md:block md:w-1/2 h-screen">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1976&q=80')",
          }}
        >
          <div className="w-full h-full flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-12">
            <div className="max-w-md">
              <h2 className="text-4xl font-bold text-white mb-4">Reset your password to regain access.</h2>
              <div className="mt-6">
                <p className="text-white text-xl font-medium">Faith Adekogbe</p>
                <p className="text-white/80">Frontend Developer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
