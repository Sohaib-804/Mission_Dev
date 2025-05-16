import React from "react"

import { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, User, LogOut, ChevronDown } from "lucide-react"

const Navbar = ({ isAuthenticated, onLogout, userName = "" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Get first name from full name
  const displayName = userName ? userName.split(" ")[0] : "User"

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Close dropdown when route changes
  useEffect(() => {
    setIsDropdownOpen(false)
    setIsMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    setIsDropdownOpen(false)
    onLogout()
  }

  return (
    <nav className="bg-black/30 backdrop-blur shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
  <Link to="/dashboard" className="flex items-center">
    <img
      src="/header-logo.svg"
      alt="Logo"
      className="h-8 w-auto"
    />
  </Link>
</div>


          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex space-x-8">
              <Link
                to="/overview"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  location.pathname === "/overview" || location.pathname === "/dashboard"
                    ? "text-indigo-900 border-b-2 border-indigo-900"
                    : "text-white hover:text-gray-700"
                }`}
              >
                Overview
              </Link>
              <Link
                to="/complete-profile"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  location.pathname === "/complete-profile"
                    ? "text-indigo-900 border-b-2 border-indigo-900"
                    : "text-white hover:text-gray-700"
                }`}
              >
                Complete Profile
              </Link>
            </div>
          </div>

          {/* User Menu (Desktop) */}
          {isAuthenticated && (
            <div className="hidden md:ml-6 md:flex md:items-center">
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="flex items-center text-white text-sm rounded-full focus:outline-none"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="mr-2 text-white font-medium">{displayName}</span>
                  <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <Link to="/overview" className="block px-4 py-2 text-sm text-blue-900 hover:bg-gray-100">
                      Overview
                    </Link>
                    <Link to="/complete-profile" className="block px-4 py-2 text-sm text-blue-900 hover:bg-gray-100">
                      Complete Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-blue-900 hover:bg-gray-100"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/overview"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                location.pathname === "/overview" || location.pathname === "/dashboard"
                  ? "text-indigo-900 border-l-4 border-indigo-900 bg-indigo-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Overview
            </Link>
            <Link
              to="/complete-profile"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                location.pathname === "/complete-profile"
                  ? "text-indigo-900 border-l-4 border-indigo-900 bg-indigo-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Complete Profile
            </Link>
          </div>
          {isAuthenticated && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <User className="h-10 w-10  rounded-full bg-gray-100 p-2" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{displayName}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
