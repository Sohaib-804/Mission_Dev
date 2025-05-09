import React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

const SkillsModal = ({ isOpen, onClose, onSave, initialSkills = [] }) => {
  const [skills, setSkills] = useState(initialSkills)
  const [currentSkill, setCurrentSkill] = useState("")

  useEffect(() => {
    setSkills(initialSkills)
  }, [initialSkills])

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

  // Handle save
  const handleSave = () => {
    onSave(skills)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Modal header with gradient */}
        <div className="h-2 bg-gradient-to-r from-indigo-700 via-purple-500 to-pink-500 rounded-t-lg"></div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-indigo-900">Top Skills</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <p className="text-gray-600 mb-8">
            List up to 16 of your most relevant skills — this can include programming languages, software, or any other
            tech skill that sets you apart.
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
            onClick={onClose}
            className="px-4 py-2 text-indigo-600 font-medium hover:bg-indigo-50 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default SkillsModal
