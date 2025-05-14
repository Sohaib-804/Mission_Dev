const express = require("express")
const router = express.Router()
const { cloudinary, uploadToCloudinary } = require("../utils/cloudinaryConfig")
const auth = require("../middleware/auth")
const multer = require("multer")
const logger = require("../utils/logger")

// Configure multer for memory storage
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
})

// Test Cloudinary configuration
router.get("/test", auth, async (req, res) => {
  try {
    cloudinary.api.ping((error, result) => {
      if (error) {
        logger.error("Cloudinary test failed:", error)
        return res.status(500).json({ success: false, error })
      }

      res.status(200).json({
        success: true,
        message: "Cloudinary configuration is working",
        result,
      })
    })
  } catch (err) {
    logger.error("Error testing Cloudinary:", err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Upload a file to Cloudinary
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" })
    }

    // Convert buffer to data URL
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`

    // Determine resource type based on mimetype
    const resourceType = req.file.mimetype.startsWith("video/")
      ? "video"
      : req.file.mimetype.startsWith("image/")
        ? "image"
        : "auto"

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(fileStr, {
      resource_type: resourceType,
      folder: "mission_uploads",
    })

    res.status(200).json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    })
  } catch (err) {
    logger.error("Error uploading to Cloudinary:", err)
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
