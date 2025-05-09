// Update the Overview component to fetch and display user skills and challenges
 import React from "react"
import { useState, useEffect } from "react"
import { Clock, Plus, X, ChevronRight, Circle, CheckCircle, Video, FileText } from "lucide-react"
import axios from "axios"
import Footer from "../components/Footer"

const Overview = ({ userName = "", userRole = "" }) => {
  // State for checklist items
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Complete at least 1 code challenge", completed: false },
    { id: 2, text: "Submit your video interview", completed: false },
    { id: 3, text: "Complete your profile", completed: false },
  ])

  // State for modals
  const [showSkillsModal, setShowSkillsModal] = useState(false)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [skills, setSkills] = useState([])
  const [currentSkill, setCurrentSkill] = useState("")
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Get first name from full name or use a default
  const displayName = userName ? userName.split(" ")[0] : "there"

  // Fetch user skills and challenges on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")

        if (!token) return

        // Fetch user skills
        const skillsResponse = await axios.get("http://localhost:5000/api/skills", {
          headers: { "x-auth-token": token },
        })

        setSkills(skillsResponse.data.skills || [])

        // If user has skills, fetch challenges
        if (skillsResponse.data.skills && skillsResponse.data.skills.length > 0) {
          const challengesResponse = await axios.get("http://localhost:5000/api/challenges", {
            headers: { "x-auth-token": token },
          })

          setChallenges(challengesResponse.data.challenges || [])
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("Failed to load your data. Please try again.")
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Add a skill
  const addSkill = () => {
    if (currentSkill.trim() && skills.length < 16) {
      setSkills([...skills, currentSkill.trim()])
      setCurrentSkill("")
    }
  }

  // Remove a skill
  const removeSkill = (index) => {
    const newSkills = [...skills]
    newSkills.splice(index, 1)
    setSkills(newSkills)
  }

  // Handle key press in skills input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  // Save skills to the backend
  const saveSkills = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setError("You must be logged in to save skills")
        setLoading(false)
        return
      }

      await axios.post("http://localhost:5000/api/skills", { skills }, { headers: { "x-auth-token": token } })

      // After saving skills, fetch challenges
      const challengesResponse = await axios.get("http://localhost:5000/api/challenges", {
        headers: { "x-auth-token": token },
      })

      setChallenges(challengesResponse.data.challenges || [])
      setLoading(false)
      setShowSkillsModal(false)
    } catch (err) {
      console.error("Error saving skills:", err)
      setError("Failed to save skills. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-lg">
                <h1 className="text-4xl font-bold text-indigo-900 mb-6">
                  {displayName}, welcome to Devminds Mission —<br />
                  let's go through the vetting process.
                </h1>
                <p className="text-gray-700 mb-6">
                  Please review your application checklist and complete all required steps before submitting for review.
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">{error}</div>
                )}

                {/* Code Challenge Section */}
                <div className="mt-12 bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-indigo-900">Code Challenge</h2>
                      <div className="flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        ~2 hours
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Show your skills by completing a code challenge. You must complete at least one test before you
                      can submit your application.
                    </p>

                    {skills.length === 0 ? (
                      <div className="bg-indigo-50 p-4 rounded-md mb-4 text-indigo-700 text-sm">
                        Before we can show you code challenges, add your tech stack.
                      </div>
                    ) : challenges.length > 0 ? (
                      <div className="space-y-4">
                        {challenges.map((challenge) => (
                          <div key={challenge._id} className="border border-gray-200 rounded-md p-4">
                            <h3 className="font-medium text-gray-900">{challenge.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">{challenge.description}</p>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="text-xs text-gray-500">Difficulty: {challenge.difficulty}</span>
                              <a
                                href={`/challenge/${challenge._id}`}
                                className="text-indigo-600 text-sm font-medium hover:text-indigo-800"
                              >
                                Start Challenge
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-indigo-50 p-4 rounded-md mb-4 text-indigo-700 text-sm">
                        No challenges match your skills. Try adding more skills.
                      </div>
                    )}

                    <button
                      onClick={() => setShowSkillsModal(true)}
                      className="flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {skills.length > 0 ? "Edit skills" : "Add top skills"}
                    </button>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-500 text-sm">
                    {loading
                      ? "Loading challenges..."
                      : challenges.length === 0
                        ? "No code challenges to show"
                        : `${challenges.length} challenge${challenges.length !== 1 ? "s" : ""} available`}
                  </div>
                </div>

                {/* Video Interview Section */}
                <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-indigo-900">Video Interview</h2>
                      <div className="flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        ~15 mins
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Help us get to know you! Tell us about yourself by recording a brief video introduction.
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 p-3 rounded-full mr-3">
                          <Video className="h-5 w-5 text-indigo-700" />
                        </div>
                        <span className="text-gray-700 font-medium">Mission Contributor</span>
                      </div>
                      <button
                        onClick={() => setShowInterviewModal(true)}
                        className="flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                      >
                        Start Interview
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Profile Section */}
                <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-indigo-900">Profile</h2>
                      <div className="flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        ~10 mins
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6">
                      A quality profile increases your chances of being matched on Mission. You must complete all areas
                      of your Mission profile.
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 p-3 rounded-full mr-3">
                          <FileText className="h-5 w-5 text-indigo-700" />
                        </div>
                        <span className="text-gray-700 font-medium">Profile</span>
                      </div>
                      <a
                        href="/complete-profile"
                        className="flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                      >
                        Complete Profile
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Application Checklist</h2>
                <div className="space-y-4">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-start">
                      {item.completed ? (
                        <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-300 mr-2 flex-shrink-0" />
                      )}
                      <span className="text-gray-700">{item.text}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="w-full mt-6 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-md transition-colors"
                  disabled={!checklist.every((item) => item.completed)}
                >
                  Submit for review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Modal */}
      {showSkillsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            {/* Modal header with gradient */}
            <div className="h-2 bg-gradient-to-r from-indigo-700 via-purple-500 to-pink-500 rounded-t-lg"></div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-indigo-900">Top Skills</h2>
                <button onClick={() => setShowSkillsModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <p className="text-gray-600 mb-8">
                List up to 16 of your most relevant skills — this can include programming languages, software, or any
                other tech skill that sets you apart.
              </p>

              <div className="mb-6">
                <label htmlFor="skills" className="block text-sm font-medium text-indigo-700 mb-2">
                  Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((skill, index) => (
                    <div key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full flex items-center">
                      {skill}
                      <button onClick={() => removeSkill(index)} className="ml-2 text-indigo-500 hover:text-indigo-700">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    id="skills"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a skill..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={skills.length >= 16}
                  />
                </div>
                {skills.length >= 16 && (
                  <p className="text-amber-600 text-sm mt-2">You've reached the maximum of 16 skills.</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 p-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowSkillsModal(false)}
                className="px-4 py-2 text-indigo-600 font-medium hover:bg-indigo-50 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSkills}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-75"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            {/* Modal header with gradient */}
            <div className="h-2 bg-gradient-to-r from-indigo-700 via-purple-500 to-pink-500 rounded-t-lg"></div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-indigo-900">Start Interview</h2>
                <button onClick={() => setShowInterviewModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-8">
                <p className="text-gray-600 mb-6">You're about to start the interview portion of the application.</p>
                <p className="text-gray-600">Click the following link to be redirected to the interview platform.</p>
              </div>

              <a
                href="#"
                className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  // Interview start logic would go here
                  alert("This would redirect to the interview platform")
                }}
              >
                Start Code Challenge
                <ChevronRight className="h-5 w-5 ml-1" />
              </a>
            </div>

            <div className="border-t border-gray-200 p-4 flex justify-end">
              <button
                onClick={() => setShowInterviewModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default Overview
