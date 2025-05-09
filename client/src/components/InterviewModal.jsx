import React from "react"

import { X, ChevronRight } from "lucide-react"

const InterviewModal = ({ isOpen, onClose, onStart }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Modal header with gradient */}
        <div className="h-2 bg-gradient-to-r from-indigo-700 via-purple-500 to-pink-500 rounded-t-lg"></div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-indigo-900">Start Interview</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-8">
            <p className="text-gray-600 mb-6">You're about to start the interview portion of the application.</p>
            <p className="text-gray-600">Click the following link to be redirected to the interview platform.</p>
          </div>

          <button
            onClick={onStart}
            className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
          >
            Start Code Challenge
            <ChevronRight className="h-5 w-5 ml-1" />
          </button>
        </div>

        <div className="border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default InterviewModal
