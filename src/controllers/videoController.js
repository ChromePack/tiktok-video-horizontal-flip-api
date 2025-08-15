const VideoProcessor = require("../services/videoProcessor");
const FileUtils = require("../utils/fileUtils");
const { ErrorHandler } = require("../utils/errorHandler");

class VideoController {
  constructor() {
    this.videoProcessor = new VideoProcessor();
  }

  /**
   * Handles video flip request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async flipVideo(req, res, next) {
    const { file } = req;
    let outputPath = null;

    try {
      // Check FFmpeg availability
      const ffmpegAvailable =
        await this.videoProcessor.checkFFmpegAvailability();
      if (!ffmpegAvailable) {
        throw new Error("FFmpeg is not available on the system");
      }

      console.log(
        `Processing video: ${file.originalname} (${file.size} bytes)`
      );

      // Process the video
      const result = await this.videoProcessor.processVideoFile(
        file.path,
        file.originalname
      );

      outputPath = result.outputPath;

      console.log(`Video processing completed in ${result.processingTime}ms`);

      // Set response headers for file download
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="flipped_${file.originalname}"`
      );
      res.setHeader("Content-Length", result.outputFileInfo.size);

      // Send the flipped video file
      res.sendFile(outputPath, (err) => {
        if (err) {
          console.error("Error sending file:", err);
        }

        // Clean up files after sending
        this.cleanupFiles(file.path, outputPath);
      });
    } catch (error) {
      console.error("Video processing error:", error);

      // Clean up files on error
      await this.cleanupFiles(file.path, outputPath);

      // Handle specific error types
      if (error.message.includes("duration exceeds")) {
        return next(ErrorHandler.createValidationError(error.message, "video"));
      }

      if (error.name === "FFmpegError") {
        return next(
          ErrorHandler.createFileProcessingError(
            "Video processing failed",
            error
          )
        );
      }

      // Generic error
      return next(
        ErrorHandler.createFileProcessingError("Failed to process video", error)
      );
    }
  }

  /**
   * Handles health check request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async healthCheck(req, res) {
    try {
      // Check FFmpeg availability
      const ffmpegAvailable =
        await this.videoProcessor.checkFFmpegAvailability();

      const healthStatus = {
        status: "ok",
        timestamp: new Date().toISOString(),
        ffmpeg: ffmpegAvailable ? "available" : "unavailable",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      };

      res.status(200).json(healthStatus);
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  }

  /**
   * Cleans up input and output files
   * @param {string} inputPath - Path to input file
   * @param {string} outputPath - Path to output file
   */
  async cleanupFiles(inputPath, outputPath) {
    try {
      // Clean up input file
      if (inputPath) {
        await FileUtils.safeDeleteFile(inputPath);
      }

      // Clean up output file
      if (outputPath) {
        await FileUtils.safeDeleteFile(outputPath);
      }
    } catch (error) {
      console.error("Error cleaning up files:", error);
    }
  }

  /**
   * Handles 404 errors for undefined routes
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  notFound(req, res, next) {
    const error = ErrorHandler.createValidationError(
      `Route ${req.method} ${req.path} not found`
    );
    error.statusCode = 404;
    next(error);
  }
}

module.exports = VideoController;
