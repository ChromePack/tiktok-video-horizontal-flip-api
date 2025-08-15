require("dotenv").config();

const config = {
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800, // 50MB
    processingTimeout: parseInt(process.env.PROCESSING_TIMEOUT) || 60000, // 60 seconds
    tempDir: process.env.TEMP_DIR || "./temp",
    allowedMimeTypes: [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/avi",
    ],
    allowedExtensions: [".mp4", ".mov", ".avi"],
  },

  security: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  video: {
    maxDuration: 10, // seconds
    targetResolution: {
      width: 720,
      height: 1280,
    },
  },
};

module.exports = config;
