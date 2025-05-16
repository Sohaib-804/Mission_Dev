import React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { Clock, ArrowLeft, Send, CheckCircle, AlertCircle, FileCode } from "lucide-react"
import Footer from "../components/Footer"
import CodeEditor from "../components/CodeEditor"

// API base URL
const API_BASE_URL = "http://localhost:5000/api"

const ChallengePage = () => {
  const { challengeId } = useParams()
  const navigate = useNavigate()
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Fetch challenge details
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")

        if (!token) {
          setError("You must be logged in to view this challenge")
          setLoading(false)
          return
        }

        const response = await axios.get(`${API_BASE_URL}/challenges/${challengeId}`, {
          headers: { "x-auth-token": token },
        })

        setChallenge(response.data.challenge)

        // Set initial code template based on challenge
        if (response.data.challenge.codeTemplate) {
          setCode(response.data.challenge.codeTemplate[language] || "")
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching challenge:", err)
        setError("Failed to load challenge. Please try again.")
        setLoading(false)
      }
    }

    if (challengeId) {
      fetchChallenge()
    }
  }, [challengeId, language])

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value
    setLanguage(newLanguage)

    // Update code template when language changes
    if (challenge?.codeTemplate && challenge.codeTemplate[newLanguage]) {
      setCode(challenge.codeTemplate[newLanguage])
    }
  }

  // Handle code change
  const handleCodeChange = (newCode) => {
    setCode(newCode)
  }

  // Submit solution
  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setError("")
      setResult(null)

      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in to submit a solution")
        setSubmitting(false)
        return
      }

      // Submit code to backend for evaluation
      const response = await axios.post(
        `${API_BASE_URL}/challenges/${challengeId}/submit`,
        {
          code,
          language,
        },
        {
          headers: { "x-auth-token": token },
        },
      )

      setResult(response.data)

      // Mark challenge as completed regardless of result
      await axios.post(
        `${API_BASE_URL}/challenges/${challengeId}/mark-completed`,
        {},
        {
          headers: { "x-auth-token": token },
        },
      )

      // Show success message and redirect after a short delay
      setShowSuccess(true)
      setTimeout(() => {
        navigate("/overview")
      }, 2000)

      setSubmitting(false)
    } catch (err) {
      console.error("Error submitting solution:", err)
      setError(err.response?.data?.msg || "Failed to submit solution. Please try again.")
      setSubmitting(false)
    }
  }

  // Go back to overview
  const goBack = () => {
    navigate("/overview")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error && !challenge) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="max-w-md text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Challenge</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={goBack}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success Modal */}
          {showSuccess && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Challenge Completed!</h2>
                  <p className="text-gray-600 mb-6">Congratulations! You've successfully completed this challenge.</p>
                  <div className="animate-pulse text-sm text-gray-500">Redirecting to overview...</div>
                </div>
              </div>
            </div>
          )}

          {/* Back button */}
          <button onClick={goBack} className="flex items-center text-indigo-600 font-medium hover:text-indigo-800 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Challenge details */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-8">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-bold text-indigo-900">{challenge.title}</h1>
                  <div className="flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {challenge.estimatedTime}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 mb-4">{challenge.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="font-medium mr-2">Difficulty:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        challenge.difficulty === "Easy"
                          ? "bg-green-100 text-green-800"
                          : challenge.difficulty === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {challenge.difficulty}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    <span className="font-medium">Required Skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {challenge.requiredSkills.map((skill) => (
                        <span key={skill} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Instructions</h2>
                  <div className="prose prose-sm max-w-none text-gray-600">
                    <p>{challenge.instructions}</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Acceptance Criteria</h2>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {challenge.acceptanceCriteria.map((criteria, index) => (
                      <li key={index}>{criteria}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Code editor */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <FileCode className="h-5 w-5 text-indigo-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Solution</h2>
                  </div>
                  <div>
                    <select
                      value={language}
                      onChange={handleLanguageChange}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="csharp">C#</option>
                    </select>
                  </div>
                </div>

                <div className="h-[500px]">
                  <CodeEditor code={code} language={language} onChange={handleCodeChange} />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded-md">{error}</div>
                )}

                {result && (
                  <div
                    className={`m-4 p-4 rounded-md ${
                      result.status === "success"
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : "bg-amber-50 border border-amber-200 text-amber-700"
                    }`}
                  >
                    <h3 className="font-medium mb-2">
                      {result.status === "success" ? "Tests Passed!" : "Test Results"}
                    </h3>
                    {result.output && (
                      <pre className="text-sm bg-gray-800 text-white p-3 rounded-md overflow-auto max-h-40">
                        {result.output}
                      </pre>
                    )}
                    {result.testResults && (
                      <div className="mt-3">
                        {result.testResults.map((test, index) => (
                          <div key={index} className="flex items-start mb-2">
                            {test.passed ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="font-medium">{test.name}</div>
                              {!test.passed && test.message && (
                                <div className="text-sm text-red-600">{test.message}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-200 p-4 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Running...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Solution
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ChallengePage
