const express = require("express");
const cors = require("cors");

const config = require("./config");
const videoRoutes = require("./routes/videoRoutes");
const { ErrorHandler } = require("./utils/errorHandler");
const FileUtils = require("./utils/fileUtils");
const {
  corsOptions,
  rateLimitConfig,
  helmetConfig,
  compressionConfig,
  requestLogger,
  securityHeaders,
} = require("./middleware/securityMiddleware");

class Server {
  constructor() {
    this.app = express();
    this.port = config.server.port;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Sets up all middleware
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(helmetConfig);
    this.app.use(cors(corsOptions));
    this.app.use(securityHeaders);

    // Compression middleware
    this.app.use(compressionConfig);

    // Rate limiting
    this.app.use(rateLimitConfig);

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Request logging
    this.app.use(requestLogger);

    // Trust proxy for rate limiting
    this.app.set("trust proxy", 1);
  }

  /**
   * Sets up all routes
   */
  setupRoutes() {
    // Root endpoint (must be before video routes)
    this.app.get("/", (req, res) => {
      res.json({
        message: "TikTok Video Horizontal Flip API",
        version: "1.0.0",
        endpoints: {
          "POST /flip-video": "Upload and flip video horizontally",
          "GET /health": "Health check endpoint",
        },
        documentation: "See README.md for usage instructions",
      });
    });

    // API routes
    this.app.use("/", videoRoutes);
  }

  /**
   * Sets up error handling middleware
   */
  setupErrorHandling() {
    // Global error handler (must be last)
    this.app.use(ErrorHandler.globalErrorHandler);
  }

  /**
   * Initializes the server
   */
  async initialize() {
    try {
      // Ensure temp directory exists
      await FileUtils.ensureTempDir();

      // Schedule cleanup of old temp files
      this.scheduleCleanup();

      console.log("✅ Server initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize server:", error);
      process.exit(1);
    }
  }

  /**
   * Schedules periodic cleanup of temporary files
   */
  scheduleCleanup() {
    // Clean up old temp files every hour
    setInterval(async () => {
      try {
        await FileUtils.cleanupOldTempFiles();
        console.log("🧹 Cleaned up old temporary files");
      } catch (error) {
        console.error("Failed to cleanup temp files:", error);
      }
    }, 60 * 60 * 1000); // 1 hour

    // Also cleanup on process exit
    process.on("SIGINT", this.gracefulShutdown.bind(this));
    process.on("SIGTERM", this.gracefulShutdown.bind(this));
  }

  /**
   * Graceful shutdown handler
   */
  async gracefulShutdown() {
    console.log("\n🛑 Shutting down server gracefully...");

    try {
      // Clean up temp files
      await FileUtils.cleanupOldTempFiles(0); // Clean all temp files
      console.log("✅ Cleanup completed");
    } catch (error) {
      console.error("❌ Error during cleanup:", error);
    }

    process.exit(0);
  }

  /**
   * Starts the server
   */
  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Server running on port ${this.port}`);
      console.log(`📱 Environment: ${config.server.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${this.port}/health`);
      console.log(
        `📹 Video flip endpoint: http://localhost:${this.port}/flip-video`
      );
    });
  }
}

// Create and start server
const server = new Server();

// Initialize and start
server
  .initialize()
  .then(() => {
    server.start();
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });

module.exports = server;
