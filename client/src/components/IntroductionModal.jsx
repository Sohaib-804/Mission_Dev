import React from "react"
import { useState, useEffect, useRef } from "react"
import { X, ChevronRight, Video, Loader, Upload, Play, Pause } from "lucide-react"
import axios from "axios"

// API base URL - adjust this to match your backend
const API_BASE_URL = "http://localhost:5000/api"

const IntroductionModal = ({ isOpen, onClose, onSubmit }) => {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [introductionId, setIntroductionId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState("questions") // questions, recording, uploading, complete, preview
  const [videoUrl, setVideoUrl] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [stream, setStream] = useState(null)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [recordedChunks, setRecordedChunks] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [cloudinaryUrl, setCloudinaryUrl] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef(null)
  const previewVideoRef = useRef(null)
  const timerRef = useRef(null)
  const fileInputRef = useRef(null)

  // Fetch questions when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchQuestions()
    }

    // Cleanup function
    return () => {
      stopMediaTracks()
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      // Revoke object URLs to prevent memory leaks
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [isOpen])

  // Handle video play/pause
  const togglePlayPause = () => {
    if (previewVideoRef.current) {
      if (isPlaying) {
        previewVideoRef.current.pause()
      } else {
        previewVideoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Fetch introduction questions from the API
  const fetchQuestions = async () => {
    try {
      setLoading(true)
      setError("")

      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in")
        setLoading(false)
        return
      }

      const response = await axios.get(`${API_BASE_URL}/introductions/questions`, {
        headers: { "x-auth-token": token },
      })

      if (!response.data || !response.data.introduction) {
        throw new Error("Invalid response format from server")
      }

      setQuestions(response.data.introduction.questions)
      setIntroductionId(response.data.introduction._id)

      // Initialize answers object
      const initialAnswers = {}
      response.data.introduction.questions.forEach((q) => {
        initialAnswers[q._id] = q.answer || ""
      })
      setAnswers(initialAnswers)

      setLoading(false)
    } catch (err) {
      console.error("Error fetching questions:", err)
      let errorMessage = "Failed to load questions. Please try again."

      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = "The introduction questions endpoint was not found. Please check your server configuration."
        }
      }

      setError(errorMessage)
      setLoading(false)
    }
  }

  // Save answers to the API
  const saveAnswers = async () => {
    try {
      setLoading(true)
      setError("")

      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in")
        setLoading(false)
        return
      }

      // Format answers for the API
      const formattedAnswers = Object.keys(answers).map((questionId) => ({
        questionId,
        text: answers[questionId],
      }))

      await axios.post(
        `${API_BASE_URL}/introductions/answers`,
        {
          introductionId,
          answers: formattedAnswers,
        },
        {
          headers: { "x-auth-token": token },
        },
      )

      setLoading(false)
      setStep("recording")
      initializeCamera()
    } catch (err) {
      console.error("Error saving answers:", err.response?.data || err.message)
      setError("Failed to save answers. Please try again.")
      setLoading(false)
    }
  }

  // Initialize camera for recording
  const initializeCamera = async () => {
    try {
      setError("")
      setLoading(true)

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support camera access. Please try using Chrome, Firefox, or Edge.")
      }

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      };

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
          .catch(async (err) => {
            console.log("First attempt failed, trying simpler constraints...");
            return await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            });
          });

        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch((e) => {
              console.error("Error playing video:", e);
            });
          };
        }
      } catch (err) {
        console.error("Error with full permissions, trying video only:", err);

        if (err.name === "NotAllowedError") {
          throw new Error(
            "Camera/microphone access was denied. Please allow access in your browser settings."
          );
        }

        // Try with just video as fallback
        const videoOnlyStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        setStream(videoOnlyStream);

        if (videoRef.current) {
          videoRef.current.srcObject = videoOnlyStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch((e) => {
              console.error("Error playing video:", e);
            });
          };
        }
        setError("Microphone access was denied. Your video will be recorded without audio.");
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      
      let errorMessage = "Camera access error";
      if (err.name === "NotAllowedError") {
        errorMessage = "Camera access was denied. Please allow access in your browser settings.";
      } else if (err.name === "NotFoundError") {
        errorMessage = "No camera detected. Please connect a camera and try again.";
      } else if (err.message.includes("denied")) {
        errorMessage = "Camera access was denied. Please check your browser permissions.";
      } else if (err.message.includes("timeout")) {
        errorMessage = "Camera is taking too long to respond. Please check if another app is using it.";
      } else {
        errorMessage = `Failed to access camera: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Start recording
  const startRecording = () => {
    if (!stream) return

    setRecordedChunks([])

    let options = {}
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
      options = { mimeType: "video/webm;codecs=vp9,opus" }
    } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
      options = { mimeType: "video/webm;codecs=vp8,opus" }
    } else if (MediaRecorder.isTypeSupported("video/webm")) {
      options = { mimeType: "video/webm" }
    }

    try {
      const recorder = new MediaRecorder(stream, options)
      setMediaRecorder(recorder)

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data])
        }
      }

      recorder.onstop = () => {
        const videoBlob = new Blob(recordedChunks, { type: options.mimeType || "video/webm" })
        const videoUrl = URL.createObjectURL(videoBlob)
        setVideoUrl(videoUrl)
        uploadToCloudinary(videoBlob)
      }

      recorder.start(1000)
      setIsRecording(true)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error("Error starting recording:", err)
      setError(`Failed to start recording: ${err.message}. Try using Chrome or Firefox.`)
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      setStep("uploading")
    }
  }

  // Stop media tracks
  const stopMediaTracks = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
  }

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("video/")) {
      setError("Please select a video file")
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("Video file is too large. Please select a file smaller than 50MB")
      return
    }

    setUploadedFile(file)
    setError("")

    const videoUrl = URL.createObjectURL(file)
    setVideoUrl(videoUrl)
    setStep("uploading")
    uploadToCloudinary(file)
  }

  // Upload video to Cloudinary
  const uploadToCloudinary = async (videoBlob) => {
    try {
      setLoading(true)
      setError("")
      setUploadProgress(0)

      if (!videoBlob || videoBlob.size === 0) {
        throw new Error("Empty video file. Please try recording again or upload a different file.")
      }

      const formData = new FormData()
      formData.append("file", videoBlob)
      formData.append("upload_preset", "mission_videos")

      const cloudName = "db25fn52t"

      const response = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        },
      })

      if (!response.data?.secure_url) {
        throw new Error("Invalid response from Cloudinary")
      }

      const cloudinaryUrl = response.data.secure_url
      setCloudinaryUrl(cloudinaryUrl)

      // Save video URL to the backend
      const token = localStorage.getItem("token")
      await axios.post(
        `${API_BASE_URL}/introductions/video`,
        {
          introductionId,
          videoUrl: cloudinaryUrl,
        },
        {
          headers: { "x-auth-token": token },
        },
      )

      setLoading(false)
      setStep("preview") // Go to preview step instead of complete
    } catch (err) {
      console.error("Error uploading video:", err)
      
      let errorMessage = "Upload failed. Please try again.";
      if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(`Video upload failed: ${errorMessage}`)
      setLoading(false)
    }
  }

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Handle answer change
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  // Check if all questions are answered
  const areAllQuestionsAnswered = () => {
    return questions.length > 0 && Object.values(answers).every((answer) => answer.trim().length > 0)
  }

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current.click()
  }

  // Text-only fallback option
  const skipVideoAndSubmitText = async () => {
    try {
      setLoading(true)
      setError("")

      const token = localStorage.getItem("token")
      if (!token) {
        setError("You must be logged in")
        setLoading(false)
        return
      }

      await axios.post(
        `${API_BASE_URL}/introductions/video`,
        {
          introductionId,
          videoUrl: "text_only_submission",
          textOnly: true,
        },
        {
          headers: { "x-auth-token": token },
        },
      )

      setLoading(false)
      setStep("complete")

      if (onSubmit) {
        onSubmit("text_only_submission")
      }
    } catch (err) {
      console.error("Error submitting text-only introduction:", err)
      setError("Failed to submit your introduction. Please try again.")
      setLoading(false)
    }
  }

  // Confirm and submit the video
  const confirmAndSubmit = () => {
    setStep("complete")
    if (onSubmit) {
      onSubmit(cloudinaryUrl)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
        {/* Modal header with gradient */}
        <div className="h-2 bg-gradient-to-r from-indigo-700 via-purple-500 to-pink-500 rounded-t-lg"></div>

        <div className="p-6 flex-grow overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-indigo-900">
              {step === "questions" && "Introduction Questions"}
              {step === "recording" && "Record Your Introduction"}
              {step === "uploading" && "Uploading Your Video"}
              {step === "preview" && "Preview Your Video"}
              {step === "complete" && "Introduction Complete"}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
          )}

          {loading && step === "uploading" && (
            <div className="mb-6">
              <div className="flex justify-center items-center py-4">
                <Loader className="h-8 w-8 text-indigo-600 animate-spin mr-3" />
                <span className="text-indigo-600">Uploading your video... {uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}

          {loading && step !== "uploading" && step !== "preview" && (
            <div className="flex justify-center items-center py-8">
              <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
              <span className="ml-2 text-indigo-600">Loading...</span>
            </div>
          )}

          {!loading && step === "questions" && (
            <div>
              <p className="text-gray-600 mb-6">
                Please answer the following questions. Your answers will help us get to know you better.
              </p>

              {questions.length === 0 ? (
                <div className="bg-amber-50 p-4 rounded-md text-amber-800 text-sm">
                  <p>No questions found. Please try refreshing the page or contact support.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <div key={question._id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">
                        {index + 1}. {question.question}
                      </h3>
                      <textarea
                        value={answers[question._id] || ""}
                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        rows={3}
                        placeholder="Type your answer here..."
                      ></textarea>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={saveAnswers}
                  disabled={!areAllQuestionsAnswered()}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Video Recording
                  <ChevronRight className="ml-2 h-4 w-4" />
                </button>
                {questions.length > 0 && !areAllQuestionsAnswered() && (
                  <p className="text-amber-600 text-sm mt-2">Please answer all questions before continuing.</p>
                )}
              </div>
            </div>
          )}

          {!loading && step === "recording" && (
            <div>
              <p className="text-gray-600 mb-6">
                Record a short video introduction (15-30 seconds) or upload a pre-recorded video. Speak clearly and be
                yourself!
              </p>

              <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted={!isRecording}
                  className="w-full h-full object-cover"
                ></video>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  {isRecording ? (
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-red-500 font-medium">Recording: {formatTime(recordingTime)}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Ready to record</span>
                  )}
                </div>

                <div className="flex space-x-4">
                  {!isRecording ? (
                    <>
                      <button
                        onClick={startRecording}
                        className="flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Start Recording
                      </button>
                      <button
                        onClick={triggerFileUpload}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Video
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="video/*"
                        className="hidden"
                      />
                    </>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Stop Recording
                    </button>
                  )}
                </div>
              </div>

              {error && error.includes("Camera access was denied") && (
                <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
                  <p className="font-medium">You can still upload a video from your device!</p>
                  <p className="mt-1">Click the "Upload Video" button to select a pre-recorded video file.</p>
                </div>
              )}

              <div className="bg-amber-50 p-4 rounded-md text-amber-800 text-sm mb-6">
                <p className="font-medium">Tips for a great introduction:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Find a quiet place with good lighting</li>
                  <li>Speak clearly and at a moderate pace</li>
                  <li>Keep your introduction between 15-30 seconds (shorter videos upload more reliably)</li>
                  <li>Briefly cover your background, skills, and what you're looking for</li>
                  <li>
                    <strong>If uploading, ensure your video is less than 50MB in size</strong>
                  </li>
                  <li>MP4 format videos typically work best</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-gray-600 mb-4">Having trouble with your camera or microphone?</p>
                <button onClick={skipVideoAndSubmitText} className="text-indigo-600 font-medium hover:text-indigo-800">
                  Skip video and submit with text answers only
                </button>
              </div>
            </div>
          )}

          {!loading && step === "preview" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Preview Your Video Introduction</h3>
              <p className="text-gray-600">
                Review your video before submitting. You can re-record if needed.
              </p>

              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={previewVideoRef}
                  src={videoUrl}
                  controls
                  className="w-full h-full object-cover"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <button
                  onClick={togglePlayPause}
                  className="absolute inset-0 flex items-center justify-center w-full h-full focus:outline-none"
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  {!isPlaying && (
                    <div className="bg-black bg-opacity-50 rounded-full p-4">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  )}
                </button>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setStep("recording")
                    setError("")
                    initializeCamera()
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Re-record Video
                </button>
                <button
                  onClick={confirmAndSubmit}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Confirm and Submit
                </button>
              </div>
            </div>
          )}

          {!loading && step === "complete" && (
            <div className="text-center py-8">
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Introduction Submitted!</h3>
              <p className="text-gray-600 mb-6">Your video introduction has been successfully uploaded and saved.</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {step !== "complete" && step !== "preview" && (
          <div className="border-t border-gray-200 p-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 font-medium rounded-md hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default IntroductionModal