import React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { Link, useLocation, useNavigate } from "react-router-dom"

function ResetPassword() {
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  })
  const [token, setToken] = useState("")
  const [status, setStatus] = useState("validating") // validating, valid, invalid, loading, success, error
  const [message, setMessage] = useState("")
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tokenFromUrl = params.get("token")

    if (!tokenFromUrl) {
      setStatus("invalid")
      setMessage("Invalid password reset link. Please request a new one.")
      return
    }

    setToken(tokenFromUrl)

    // Validate the token
    const validateToken = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/auth/validate-reset-token/${tokenFromUrl}`)
        if (response.data.valid) {
          setStatus("valid")
        } else {
          setStatus("invalid")
          setMessage("This password reset link has expired or is invalid. Please request a new one.")
        }
      } catch (error) {
        setStatus("invalid")
        setMessage("This password reset link has expired or is invalid. Please request a new one.")
      }
    }

    validateToken()
  }, [location])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match")
      return
    }

    if (form.password.length < 8) {
      setMessage("Password must be at least 8 characters long")
      return
    }

    setStatus("loading")
    setMessage("")

    try {
      const response = await axios.post("http://localhost:5000/api/auth/reset-password", {
        token,
        password: form.password,
      })

      setStatus("success")
      setMessage(response.data.msg)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (error) {
      setStatus("error")
      setMessage(error.response?.data?.msg || "Failed to reset password. Please try again.")
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-6 py-8 sm:px-10 md:px-12 lg:px-16 xl:px-20">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
              <p className="mt-2 text-gray-600">
                {status === "valid" ? "Create a new password for your account." : "Verifying your reset link..."}
              </p>
            </div>

            {status === "validating" && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Verifying your reset link...</p>
              </div>
            )}

            {status === "invalid" && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
                <p className="font-medium">Invalid Reset Link</p>
                <p className="mt-1">{message}</p>
                <div className="mt-4">
                  <Link
                    to="/forgot-password"
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Request New Reset Link
                  </Link>
                </div>
              </div>
            )}

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
                <p className="font-medium">Success!</p>
                <p className="mt-1">{message}</p>
                <p className="mt-2">Redirecting you to login page...</p>
              </div>
            )}

            {status === "valid" && (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    value={form.password}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                  />
                  <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long.</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                  />
                </div>

                {message && <div className="text-red-600 text-sm">{message}</div>}

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
                        Resetting Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </div>
              </form>
            )}

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
              <h2 className="text-4xl font-bold text-white mb-4">Create a new password to secure your account.</h2>
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

export default ResetPassword
