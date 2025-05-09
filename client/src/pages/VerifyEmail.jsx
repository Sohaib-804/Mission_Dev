import React from "react"

import { useState, useEffect } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import axios from "axios"

function VerifyEmail() {
  const [status, setStatus] = useState("verifying") // verifying, success, error
  const [message, setMessage] = useState("")
  const location = useLocation()
  const navigate = useNavigate()

  // pages/VerifyEmail.jsx - Update the token handling
useEffect(() => {
    const verifyEmailToken = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      
      console.log("Token from URL:", token); // Debug log
      
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. Please try again or request a new verification email.");
        return;
      }
      
      try {
        // Change this line to match your backend route structure
        // Instead of passing the token as a route parameter, send it in the request body
        const response = await axios.post(`http://localhost:5000/api/auth/verify-email`, { token });
        
        setStatus("success");
        setMessage(response.data.msg);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        console.error("Verification error:", error.response?.data || error);
        setStatus("error");
        setMessage(error.response?.data?.msg || "Failed to verify email. Please try again.");
      }
    };
    
    verifyEmailToken();
  }, [location, navigate]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Left side - Content */}
      <div className="w-full md:w-1/2 flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 sm:px-10 md:px-12 lg:px-16 xl:px-20">
          <div className="w-full max-w-md mx-auto text-center">
            {status === "verifying" && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto mb-4"></div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Verifying Your Email</h1>
                <p className="text-gray-600">Please wait while we verify your email address...</p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="bg-green-100 text-green-700 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Verified!</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <p className="text-gray-600">Redirecting you to login page...</p>
              </>
            )}

            {status === "error" && (
               <>
               <div className="bg-green-100 text-green-700 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                 <svg
                   xmlns="http://www.w3.org/2000/svg"
                   className="h-8 w-8"
                   fill="none"
                   viewBox="0 0 24 24"
                   stroke="currentColor"
                 >
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
               </div>
               <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Verified!</h1>
               <p className="text-gray-600 mb-6">{message}</p>
               <p className="text-gray-600">Redirecting you to login page...</p>
             </>
            )}
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
              <h2 className="text-4xl font-bold text-white mb-4">Welcome to the Devminds Studio!</h2>
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

export default VerifyEmail
