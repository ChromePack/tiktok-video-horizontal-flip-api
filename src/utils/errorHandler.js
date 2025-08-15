/**
 * Custom error classes for the application
 */
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
    this.field = field;
  }
}

class FileProcessingError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = "FileProcessingError";
    this.statusCode = 500;
    this.originalError = originalError;
  }
}

class FileSizeError extends Error {
  constructor(message) {
    super(message);
    this.name = "FileSizeError";
    this.statusCode = 413;
  }
}

class FFmpegError extends Error {
  constructor(message, ffmpegError = null) {
    super(message);
    this.name = "FFmpegError";
    this.statusCode = 500;
    this.ffmpegError = ffmpegError;
  }
}

/**
 * Error response formatter
 */
class ErrorHandler {
  /**
   * Formats error response for API
   * @param {Error} error - The error object
   * @param {Object} req - Express request object
   * @returns {Object} - Formatted error response
   */
  static formatErrorResponse(error, req) {
    const isDevelopment = process.env.NODE_ENV === "development";

    const errorResponse = {
      error: {
        message: error.message || "An unexpected error occurred",
        statusCode: error.statusCode || 500,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      },
    };

    // Add additional details in development mode
    if (isDevelopment) {
      errorResponse.error.stack = error.stack;
      if (error.originalError) {
        errorResponse.error.originalError = error.originalError.message;
      }
      if (error.ffmpegError) {
        errorResponse.error.ffmpegError = error.ffmpegError;
      }
    }

    return errorResponse;
  }

  /**
   * Creates a validation error for file uploads
   * @param {string} message - Error message
   * @param {string} field - Field name that caused the error
   * @returns {ValidationError} - Validation error instance
   */
  static createValidationError(message, field = null) {
    return new ValidationError(message, field);
  }

  /**
   * Creates a file processing error
   * @param {string} message - Error message
   * @param {Error} originalError - Original error that occurred
   * @returns {FileProcessingError} - File processing error instance
   */
  static createFileProcessingError(message, originalError = null) {
    return new FileProcessingError(message, originalError);
  }

  /**
   * Creates a file size error
   * @param {string} message - Error message
   * @returns {FileSizeError} - File size error instance
   */
  static createFileSizeError(message) {
    return new FileSizeError(message);
  }

  /**
   * Creates an FFmpeg error
   * @param {string} message - Error message
   * @param {Object} ffmpegError - FFmpeg error details
   * @returns {FFmpegError} - FFmpeg error instance
   */
  static createFFmpegError(message, ffmpegError = null) {
    return new FFmpegError(message, ffmpegError);
  }

  /**
   * Global error handler middleware
   * @param {Error} error - The error object
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static globalErrorHandler(error, req, res, _next) {
    const errorResponse = ErrorHandler.formatErrorResponse(error, req);
    const statusCode = error.statusCode || 500;

    // Log error in production
    if (process.env.NODE_ENV === "production") {
      console.error("Error:", {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });
    }

    res.status(statusCode).json(errorResponse);
  }

  /**
   * Handles multer errors specifically
   * @param {Error} error - Multer error
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static multerErrorHandler(error, req, res, _next) {
    if (error.code === "LIMIT_FILE_SIZE") {
      const fileSizeError = this.createFileSizeError(
        "File size exceeds the maximum limit of 50MB"
      );
      return this.globalErrorHandler(fileSizeError, req, res, _next);
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      const validationError = this.createValidationError(
        "Unexpected file field",
        "video"
      );
      return this.globalErrorHandler(validationError, req, res, _next);
    }

    // Handle other multer errors
    const processingError = this.createFileProcessingError(
      "File upload failed",
      error
    );
    return this.globalErrorHandler(processingError, req, res, _next);
  }
}

module.exports = {
  ErrorHandler,
  ValidationError,
  FileProcessingError,
  FileSizeError,
  FFmpegError,
};
