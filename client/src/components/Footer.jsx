import React from "react"
const Footer = () => {
    return (
      <footer className="border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">Copyright © 2025 Devminds Studio</div>
            <div className="flex space-x-8">
              <a href="/privacy" className="text-indigo-600 hover:text-indigo-800 text-sm">
                Privacy Policy
              </a>
              <a href="/terms" className="text-indigo-600 hover:text-indigo-800 text-sm">
                Terms and Conditions
              </a>
            </div>
          </div>
        </div>
      </footer>
    )
  }
  
  export default Footer
  