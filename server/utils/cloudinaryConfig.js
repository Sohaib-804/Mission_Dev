const cloudinary = require("cloudinary").v2
const logger = require("./logger")

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "db25fn52t",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Always use HTTPS
})

// Test Cloudinary configuration
const testCloudinaryConfig = () => {
  try {
    logger.info("Testing Cloudinary configuration...")
    logger.info(`Cloud name: ${process.env.CLOUDINARY_CLOUD_NAME || "db25fn52t"}`)
    logger.info(`API key set: ${process.env.CLOUDINARY_API_KEY ? "Yes" : "No"}`)
    logger.info(`API secret set: ${process.env.CLOUDINARY_API_SECRET ? "Yes" : "No"}`)

    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      logger.warn("Cloudinary API key or secret is missing. Video uploads may fail.")
      return
    }

    // Test the configuration by pinging Cloudinary
    cloudinary.api.ping((error, result) => {
      if (error) {
        logger.error("Cloudinary configuration test failed:", error)
      } else {
        logger.info("Cloudinary configuration test successful:", result)
      }
    })
  } catch (err) {
    logger.error("Error testing Cloudinary configuration:", err)
  }
}

// Helper function to upload a file to Cloudinary
const uploadToCloudinary = async (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: "auto", // Automatically detect if it's an image, video, or raw file
      ...options,
    }

    cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
      if (error) {
        logger.error("Cloudinary upload error:", error)
        reject(error)
      } else {
        logger.info("Cloudinary upload successful:", result.public_id)
        resolve(result)
      }
    })
  })
}

module.exports = {
  cloudinary,
  testCloudinaryConfig,
  uploadToCloudinary,
}
