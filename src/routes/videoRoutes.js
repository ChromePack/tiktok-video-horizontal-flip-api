const express = require("express");
const VideoController = require("../controllers/videoController");
const {
  upload,
  validateUploadedFile,
  cleanupOnError,
  handleMulterErrors,
} = require("../middleware/uploadMiddleware");

const router = express.Router();
const videoController = new VideoController();

/**
 * POST /flip-video
 * Upload and flip video horizontally
 */
router.post(
  "/flip-video",
  upload,
  handleMulterErrors,
  validateUploadedFile,
  cleanupOnError,
  videoController.flipVideo.bind(videoController)
);

/**
 * GET /health
 * Health check endpoint
 */
router.get("/health", videoController.healthCheck.bind(videoController));

/**
 * Handle 404 for undefined routes
 */
router.use("*", videoController.notFound.bind(videoController));

module.exports = router;
