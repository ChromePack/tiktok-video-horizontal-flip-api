const multer = require("multer");
const FileUtils = require("../utils/fileUtils");
const { ErrorHandler } = require("../utils/errorHandler");
const config = require("../config");

/**
 * Multer storage configuration
 */
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await FileUtils.ensureTempDir();
      cb(null, config.upload.tempDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const tempFilename = FileUtils.generateTempFilename(file.originalname);
    cb(null, tempFilename);
  },
});

/**
 * File filter function for multer
 */
const fileFilter = (req, file, cb) => {
  // Check if the field name is 'video'
  if (file.fieldname !== "video") {
    return cb(new Error('Only "video" field is allowed'), false);
  }

  // Validate file extension
  if (!FileUtils.isValidFileExtension(file.originalname)) {
    return cb(
      new Error(
        "Invalid file format. Only MP4, MOV, and AVI files are allowed"
      ),
      false
    );
  }

  // Validate MIME type
  if (!FileUtils.isValidMimeType(file.mimetype)) {
    return cb(
      new Error("Invalid MIME type. Only video files are allowed"),
      false
    );
  }

  cb(null, true);
};

/**
 * Multer configuration
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize, // 50MB
    files: 1, // Only allow 1 file
  },
});

/**
 * Middleware to validate uploaded file
 */
const validateUploadedFile = (req, res, next) => {
  if (!req.file) {
    return next(
      ErrorHandler.createValidationError("No video file uploaded", "video")
    );
  }

  // Additional validation after upload
  const { file } = req;

  // Check file size again (in case it was modified)
  if (!FileUtils.isValidFileSize(file.size)) {
    return next(
      ErrorHandler.createFileSizeError(
        "File size exceeds the maximum limit of 50MB"
      )
    );
  }

  // Validate file extension again
  if (!FileUtils.isValidFileExtension(file.originalname)) {
    return next(
      ErrorHandler.createValidationError("Invalid file format", "video")
    );
  }

  // Validate MIME type again
  if (!FileUtils.isValidMimeType(file.mimetype)) {
    return next(
      ErrorHandler.createValidationError("Invalid file type", "video")
    );
  }

  next();
};

/**
 * Middleware to clean up uploaded file on error
 */
const cleanupOnError = (req, res, next) => {
  // Store original send method
  const originalSend = res.send;

  // Override send method to clean up file on error
  res.send = function (data) {
    // If response indicates error, clean up the uploaded file
    if (res.statusCode >= 400 && req.file) {
      FileUtils.safeDeleteFile(req.file.path).catch((err) =>
        console.error("Failed to cleanup file:", err)
      );
    }

    // Call original send method
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Middleware to handle multer errors
 */
const handleMulterErrors = (error, req, res, next) => {
  ErrorHandler.multerErrorHandler(error, req, res, next);
};

module.exports = {
  upload: upload.single("video"),
  validateUploadedFile,
  cleanupOnError,
  handleMulterErrors,
};
