const fs = require("fs").promises;
const path = require("path");
const config = require("../config");

class FileUtils {
  /**
   * Validates if the file extension is allowed
   * @param {string} filename - The filename to validate
   * @returns {boolean} - True if extension is allowed
   */
  static isValidFileExtension(filename) {
    const extension = path.extname(filename).toLowerCase();
    return config.upload.allowedExtensions.includes(extension);
  }

  /**
   * Validates if the MIME type is allowed
   * @param {string} mimetype - The MIME type to validate
   * @returns {boolean} - True if MIME type is allowed
   */
  static isValidMimeType(mimetype) {
    return config.upload.allowedMimeTypes.includes(mimetype);
  }

  /**
   * Validates file size against maximum allowed size
   * @param {number} size - File size in bytes
   * @returns {boolean} - True if file size is within limits
   */
  static isValidFileSize(size) {
    return size <= config.upload.maxFileSize;
  }

  /**
   * Generates a unique temporary filename
   * @param {string} originalName - Original filename
   * @returns {string} - Unique temporary filename
   */
  static generateTempFilename(originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalName);
    return `temp_${timestamp}_${random}${extension}`;
  }

  /**
   * Ensures the temporary directory exists
   * @returns {Promise<void>}
   */
  static async ensureTempDir() {
    try {
      await fs.access(config.upload.tempDir);
    } catch (error) {
      await fs.mkdir(config.upload.tempDir, { recursive: true });
    }
  }

  /**
   * Creates a full path for a temporary file
   * @param {string} filename - The filename
   * @returns {string} - Full path to temporary file
   */
  static getTempFilePath(filename) {
    return path.join(config.upload.tempDir, filename);
  }

  /**
   * Safely deletes a file if it exists
   * @param {string} filePath - Path to the file to delete
   * @returns {Promise<void>}
   */
  static async safeDeleteFile(filePath) {
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch (error) {
      // File doesn't exist or already deleted, ignore
    }
  }

  /**
   * Cleans up temporary files older than specified time
   * @param {number} maxAgeMs - Maximum age in milliseconds
   * @returns {Promise<void>}
   */
  static async cleanupOldTempFiles(maxAgeMs = 3600000) {
    // 1 hour default
    try {
      const files = await fs.readdir(config.upload.tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(config.upload.tempDir, file);
        try {
          const stats = await fs.stat(filePath);
          if (now - stats.mtime.getTime() > maxAgeMs) {
            await this.safeDeleteFile(filePath);
          }
        } catch (error) {
          // Ignore errors for individual files
        }
      }
    } catch (error) {
      // Temp directory doesn't exist, ignore
    }
  }

  /**
   * Gets file information including size and creation time
   * @param {string} filePath - Path to the file
   * @returns {Promise<Object>} - File information
   */
  static async getFileInfo(filePath) {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile(),
    };
  }
}

module.exports = FileUtils;
