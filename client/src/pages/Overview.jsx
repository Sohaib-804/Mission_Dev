import React from "react"
import { useState, useEffect } from "react"
import { Clock, Plus, ChevronRight, Circle, CheckCircle, Video, FileText } from "lucide-react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Footer from "../components/Footer"
import IntroductionModal from "../components/introductionModal"
import SkillsModal from "../components/SkillsModal"
import { Link } from "react-router-dom"

// API base URL - adjust this to match your backend
const API_BASE_URL = "http://localhost:5000/api"

const Overview = ({ userName = "", userRole = "" }) => {
  // State for checklist items
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Complete at least 1 code challenge", completed: false },
    { id: 2, text: "Submit your introduction video", completed: false },
    { id: 3, text: "Complete your profile", completed: false },
  ])

  // State for modals
  const [showSkillsModal, setShowSkillsModal] = useState(false)
  const [showIntroductionModal, setShowIntroductionModal] = useState(false)
  const [skills, setSkills] = useState([])
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [introductionCompleted, setIntroductionCompleted] = useState(false)
  const [userData, setUserData] = useState(null)
  const navigate = useNavigate()

  // Get first name from full name or use a default
  const displayName = userName ? userName.split(" ")[0] : userData?.fullName?.split(" ")[0] || "there"

  // Fetch user data, skills, challenges, and application progress on component mount
  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError("")
      const token = localStorage.getItem("token")

      if (!token) {
        setError("You must be logged in to view this page")
        setLoading(false)
        return
      }

      // Fetch current user data
      try {
        console.log("Fetching user data from:", `${API_BASE_URL}/auth/me`)
        const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { "x-auth-token": token },
        })

        if (userResponse.data && userResponse.data.user) {
          setUserData(userResponse.data.user)
          console.log("User data loaded:", userResponse.data.user)

          // Update checklist based on user progress
          if (userResponse.data.user.applicationProgress) {
            const progress = userResponse.data.user.applicationProgress
            const updatedChecklist = [...checklist]

            // Check if code challenge is completed
            if (progress.codeChallenge && progress.codeChallenge.completed) {
              updatedChecklist[0].completed = true
            }

            // Check if video introduction is completed
            if (progress.videoIntroduction && progress.videoIntroduction.completed) {
              updatedChecklist[1].completed = true
              setIntroductionCompleted(true)
            }

            // Check if profile is completed
            if (progress.profile && progress.profile.completed) {
              updatedChecklist[2].completed = true
            }

            setChecklist(updatedChecklist)
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err.response?.data || err.message)
        // Continue with other requests even if user data fails
      }

      // Fetch user skills
      try {
        console.log("Fetching user skills from:", `${API_BASE_URL}/skills`)
        const skillsResponse = await axios.get(`${API_BASE_URL}/skills`, {
          headers: { "x-auth-token": token },
        })

        const userSkills = skillsResponse.data.skills || []
        setSkills(userSkills)
        console.log("Skills loaded:", userSkills)

        // If user has skills, fetch challenges
        if (userSkills.length > 0) {
          try {
            console.log("Fetching challenges from:", `${API_BASE_URL}/challenges`)
            const challengesResponse = await axios.get(`${API_BASE_URL}/challenges`, {
              headers: { "x-auth-token": token },
            })

            setChallenges(challengesResponse.data.challenges || [])
            console.log("Challenges loaded:", challengesResponse.data.challenges)
          } catch (err) {
            console.error("Error fetching challenges:", err.response?.data || err.message)
            // Continue even if challenges fail to load
          }
        }
      } catch (err) {
        console.error("Error fetching skills:", err.response?.data || err.message)
        // Continue even if skills fail to load
      }

      setLoading(false)
    } catch (err) {
      console.error("Error in fetchUserData:", err.response?.data || err.message)
      setError("Failed to load your data. Please try again.")
      setLoading(false)
    }
  }

  // Save skills to the backend
  const saveSkills = async (skillsToSave) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setError("You must be logged in to save skills")
        setLoading(false)
        return
      }

      console.log("Saving skills:", skillsToSave)
      await axios.post(`${API_BASE_URL}/skills`, { skills: skillsToSave }, { headers: { "x-auth-token": token } })

      // After saving skills, fetch challenges
      const challengesResponse = await axios.get(`${API_BASE_URL}/challenges`, {
        headers: { "x-auth-token": token },
      })

      setChallenges(challengesResponse.data.challenges || [])
      setSkills(skillsToSave)
      setLoading(false)
      setShowSkillsModal(false)
    } catch (err) {
      console.error("Error saving skills:", err.response?.data || err.message)
      setError("Failed to save skills. Please try again.")
      setLoading(false)
    }
  }

  // Handle introduction video submission
  const handleIntroductionSubmit = (videoUrl) => {
    // Update checklist
    const updatedChecklist = [...checklist]
    updatedChecklist[1].completed = true
    setChecklist(updatedChecklist)
    setIntroductionCompleted(true)
  }

  // Navigate to complete profile page
  const navigateToCompleteProfile = () => {
    navigate("/complete-profile")
  }

  // Retry loading data
  const retryLoadData = () => {
    setError("")
    fetchUserData()
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
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                    <div className="flex justify-between">
                      <span>{error}</span>
                      <button onClick={retryLoadData} className="text-red-700 font-medium hover:text-red-800 underline">
                        Try again
                      </button>
                    </div>
                  </div>
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
                              <Link
                                to={`/challenge/${challenge._id}`}
                                className="text-indigo-600 text-sm font-medium hover:text-indigo-800"
                              >
                                {challenge.isCompleted ? "View Submission" : "Start Challenge"}
                              </Link>
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

                {/* Introduction Video Section */}
                <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-indigo-900">Introduction Video</h2>
                      <div className="flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        ~15 mins
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Help us get to know you! Record a brief video introduction and answer a few questions about your
                      background and skills.
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 p-3 rounded-full mr-3">
                          <Video className="h-5 w-5 text-indigo-700" />
                        </div>
                        <span className="text-gray-700 font-medium">
                          {introductionCompleted ? "Introduction Completed" : "Record Introduction"}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowIntroductionModal(true)}
                        className="flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                      >
                        {introductionCompleted ? "View Introduction" : "Start Recording"}
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
                      <button
                        onClick={navigateToCompleteProfile}
                        className="flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                      >
                        Complete Profile
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
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
      <SkillsModal
        isOpen={showSkillsModal}
        onClose={() => setShowSkillsModal(false)}
        onSave={saveSkills}
        initialSkills={skills}
      />

      {/* Introduction Modal */}
      <IntroductionModal
        isOpen={showIntroductionModal}
        onClose={() => setShowIntroductionModal(false)}
        onSubmit={handleIntroductionSubmit}
      />

      <Footer />
    </div>
  )
}

export default Overview
