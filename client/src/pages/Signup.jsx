import React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { ChevronRight, Code, Users, UserCog, LineChart, Eye, TestTube, ChevronLeft } from "lucide-react"

function Signup({ onAuthSuccess }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState({
    role: "",
    yearsOfExperience: "",
    specialties: [],
    firstName: "",
    lastName: "",
    linkedinUrl: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToPrivacy: false,
    agreeToTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [roleDescription, setRoleDescription] = useState("")
  const navigate = useNavigate()

  // Define role-specific specialties
  const roleSpecialties = {
    "Software Engineer": [
      "Front-End Developer",
      "Back-End Developer",
      "Mobile Developer",
      "AI Developer",
      "DevOps Engineer",
      "Data Engineer",
      "Data Scientist",
    ],
    "Tech Lead": ["Project Manager", "Product Manager"],
    "Squad Lead": ["Project Manager", "Product Manager"],
    "Business Analyst": ["Data Analysis", "Business Intelligence", "Market Research", "Financial Analysis"],
    "UI/UX Designer": [], // No specialties for UI/UX Designer
    "Quality Assurance Engineer": [], // No specialties for QA Engineer
  }

  // Reset specialties when role changes
  useEffect(() => {
    setForm((prevForm) => ({
      ...prevForm,
      specialties: [],
    }))
  }, [form.role])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox") {
      setForm({ ...form, [name]: checked })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSpecialtyChange = (specialty) => {
    const updatedSpecialties = [...form.specialties]

    if (updatedSpecialties.includes(specialty)) {
      const index = updatedSpecialties.indexOf(specialty)
      updatedSpecialties.splice(index, 1)
    } else {
      updatedSpecialties.push(specialty)
    }

    setForm({ ...form, specialties: updatedSpecialties })
  }

  const handleRoleSelect = (role, description) => {
    setForm({ ...form, role })
    setRoleDescription(description)
  }

  // Update the handleSubmit function to handle email verification bypass
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      // Transform the data to match your backend expectations
      const submitData = {
        fullName: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
        role: form.role || "Software Engineer", // Fallback to Software Engineer if no role selected
        yearsOfExperience: form.yearsOfExperience,
        specialties: form.specialties,
        linkedinUrl: form.linkedinUrl,
      }

      const res = await axios.post("http://localhost:5000/api/auth/signup", submitData)
      setSuccess(res.data.msg)

      // Store the user's name for future use
      localStorage.setItem("pendingUserName", `${form.firstName} ${form.lastName}`)

      // If email verification is disabled, redirect to login immediately
      if (res.data.emailVerificationDisabled) {
        setTimeout(() => {
          navigate("/login")
        }, 1500)
      } else {
        // Otherwise, redirect after 3 seconds
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const validateStep = () => {
    if (currentStep === 1 && !form.role) {
      setError("Please select a role")
      return false
    }

    if (currentStep === 2 && !form.yearsOfExperience) {
      setError("Please select your years of experience")
      return false
    }

    if (currentStep === 3) {
      if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword) {
        setError("Please fill in all required fields")
        return false
      }

      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match")
        return false
      }

      if (!form.agreeToPrivacy || !form.agreeToTerms) {
        setError("You must agree to the Privacy Policy and Terms and Conditions")
        return false
      }
    }

    setError("")
    return true
  }

  const handleStepAction = (action) => {
    if (action === "next" && !validateStep()) {
      return
    }

    if (action === "next") {
      nextStep()
    } else if (action === "prev") {
      prevStep()
    } else if (action === "submit" && validateStep()) {
      handleSubmit({ preventDefault: () => {} })
    }
  }

  // Role options with icons and descriptions
  const roles = [
    {
      name: "Software Engineer",
      icon: <Code size={20} />,
      description: "A technical contributor that actively participates in building exciting products.",
    },
    {
      name: "Tech Lead",
      icon: <UserCog size={20} />,
      description: "Leads technical decisions and mentors other engineers.",
    },
    {
      name: "Squad Lead",
      icon: <Users size={20} />,
      description: "Manages a team of engineers and coordinates with stakeholders.",
    },
    {
      name: "Business Analyst",
      icon: <LineChart size={20} />,
      description: "Analyzes business needs and translates them into technical requirements.",
    },
    {
      name: "UI/UX Designer",
      icon: <Eye size={20} />,
      description: "Creates user-centered designs and interfaces.",
    },
    {
      name: "Quality Assurance Engineer",
      icon: <TestTube size={20} />,
      description: "A technical contributor who finds and fixes bugs in software.",
    },
  ]

  // Content for each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Please select the role that best describes you.</h3>

            <div className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role.name}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-900 hover:bg-purple-50/50 ${
                    form.role === role.name ? "border-blue-900 bg-purple-50" : "border-gray-200"
                  }`}
                  onClick={() => handleRoleSelect(role.name, role.description)}
                >
                  <div className="mr-3 text-gray-600 ">{role.icon}</div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-900">{role.name}</h3>
                    {form.role === role.name && <p className="text-sm text-gray-500 mt-1">{role.description}</p>}
                  </div>
                  {form.role === role.name && (
                    <div className="text-purple-600">
                      <ChevronRight size={18} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How many years of experience do you have?
              </label>
              <select
                name="yearsOfExperience"
                value={form.yearsOfExperience}
                onChange={handleInputChange}
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
              >
                <option value="">Select years of experience</option>
                <option value="1 year">1 year</option>
                <option value="2-3 years">2-3 years</option>
                <option value="4-6 years">4-6 years</option>
                <option value="7-10 years">7-10 years</option>
                <option value="10+ years">10+ years</option>
              </select>
            </div>

            {/* Only show specialties if the selected role has specialties */}
            {form.role && roleSpecialties[form.role] && roleSpecialties[form.role].length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">What is your specialty?</label>
                <div className="space-y-2">
                  {roleSpecialties[form.role].map((specialty) => (
                    <div key={specialty} className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={specialty}
                          name="specialty"
                          type="checkbox"
                          checked={form.specialties.includes(specialty)}
                          onChange={() => handleSpecialtyChange(specialty)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-900 focus:ring-purple-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={specialty} className="font-medium text-gray-700">
                          {specialty}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Almost there! Please complete the following fields to finish your registration.
              </h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
                    value={form.firstName}
                    onChange={handleInputChange}
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
                    value={form.lastName}
                    onChange={handleInputChange}
                    placeholder="Last name"
                  />
                </div>

                <div>
                  <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">
                    LinkedIn profile URL <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    id="linkedinUrl"
                    name="linkedinUrl"
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
                    placeholder="https://www.linkedin.com/in/"
                    value={form.linkedinUrl}
                    onChange={handleInputChange}
                  />
                </div>

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
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
                    placeholder="Enter email..."
                    value={form.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
                    value={form.password}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="agreeToPrivacy"
                      name="agreeToPrivacy"
                      type="checkbox"
                      checked={form.agreeToPrivacy}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeToPrivacy" className="font-medium text-gray-700">
                      I have read and understand Mission's{" "}
                      <a href="#" className="text-indigo-700 hover:text-indigo-500">
                        Privacy Policy
                      </a>
                      .
                    </label>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      checked={form.agreeToTerms}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                      I have read and understand Mission's{" "}
                      <a href="#" className="text-indigo-700 hover:text-indigo-500">
                        Terms and Conditions
                      </a>
                      .
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col justify-between px-6 py-8 sm:px-10 md:px-12 lg:px-16 xl:px-20">
          <div className="w-full max-w-md mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Sign Up</h1>
              <p className="text-xl text-gray-400">Step {currentStep} of 3</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {success && (
              <div
                className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md"
                role="alert"
              >
                <span className="block sm:inline">{success}</span>
              </div>
            )}

            <form className="space-y-6">
              {renderStepContent()}

              <div className="pt-6">
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => handleStepAction("next")}
                    className="w-full h-12 flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    style={{ backgroundColor: "rgb(85, 76, 197)" }}
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStepAction("submit")}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
                    style={{ backgroundColor: "rgb(85, 76, 197)" }}
                  >
                    {isLoading ? (
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
                        Creating account...
                      </>
                    ) : (
                      "Complete"
                    )}
                  </button>
                )}

                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => handleStepAction("prev")}
                    className="w-full mt-3 flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Go Back
                  </button>
                )}
              </div>
            </form>

            <div className="mt-8 text-center text-md text-gray-500">
              Already a member?{" "}
              <Link to="/login" className="font-medium hover:text-indigo-500" style={{ color: "rgb(56, 51, 148)" }}>
                Login
              </Link>
            </div>
          </div>

          <div className="w-full max-w-md mt-8">
            <div className="text-md text-gray-500">
              © 2025 All Rights Reserved.{" "}
              <Link to="/terms" className="text-indigo-700 hover:text-indigo-500">
                Terms and Conditions
              </Link>{" "}
              |{" "}
              <Link to="/privacy" className="text-indigo-700 hover:text-indigo-500">
                Privacy
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
              <h2 className="text-4xl font-bold text-white mb-4">
                Gain access to exclusive opportunities and a network of top professionals.
              </h2>
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

export default Signup
