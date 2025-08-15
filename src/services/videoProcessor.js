const ffmpeg = require("fluent-ffmpeg");
const { FFmpegError } = require("../utils/errorHandler");
const FileUtils = require("../utils/fileUtils");
const config = require("../config");

class VideoProcessor {
  constructor() {
    this.setupFFmpeg();
  }

  /**
   * Sets up FFmpeg configuration
   */
  setupFFmpeg() {
    // Set FFmpeg path if provided in environment
    if (process.env.FFMPEG_PATH) {
      ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
    }

    // Set FFprobe path if provided in environment
    if (process.env.FFPROBE_PATH) {
      ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
    }
  }

  /**
   * Checks if FFmpeg is available
   * @returns {Promise<boolean>} - True if FFmpeg is available
   */
  async checkFFmpegAvailability() {
    try {
      const ffmpegPath = await this.getFFmpegPath();
      return !!ffmpegPath;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets FFmpeg path
   * @returns {Promise<string>} - FFmpeg path
   */
  getFFmpegPath() {
    return new Promise((resolve, reject) => {
      ffmpeg.getAvailableCodecs((err, _codecs) => {
        if (err) {
          reject(err);
        } else {
          resolve(ffmpeg.path);
        }
      });
    });
  }

  /**
   * Gets video metadata
   * @param {string} inputPath - Path to input video file
   * @returns {Promise<Object>} - Video metadata
   */
  getVideoMetadata(inputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          reject(new FFmpegError("Failed to get video metadata", err));
        } else {
          resolve(metadata);
        }
      });
    });
  }

  /**
   * Validates video duration
   * @param {Object} metadata - Video metadata
   * @returns {boolean} - True if duration is valid
   */
  validateVideoDuration(metadata) {
    const duration = metadata.format.duration;
    return duration <= config.video.maxDuration;
  }

  /**
   * Validates video resolution
   * @param {Object} metadata - Video metadata
   * @returns {boolean} - True if resolution is valid
   */
  validateVideoResolution(metadata) {
    const videoStream = metadata.streams.find(
      (stream) => stream.codec_type === "video"
    );
    if (!videoStream) {
      return false;
    }

    const { width, height } = videoStream;
    const { targetResolution } = config.video;

    // Check if it's portrait orientation (height > width)
    return (
      height > width &&
      Math.abs(width - targetResolution.width) <= 100 &&
      Math.abs(height - targetResolution.height) <= 100
    );
  }

  /**
   * Flips video horizontally
   * @param {string} inputPath - Path to input video file
   * @param {string} outputPath - Path to output video file
   * @returns {Promise<void>}
   */
  async flipVideoHorizontally(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .videoFilters("hflip") // Horizontal flip filter
        .outputOptions([
          "-c:v libx264", // Use H.264 codec
          "-preset fast", // Fast encoding preset
          "-crf 23", // Constant rate factor for quality
          "-c:a copy", // Copy audio without re-encoding
        ])
        .output(outputPath)
        .on("start", (commandLine) => {
          console.log("FFmpeg command:", commandLine);
        })
        .on("progress", (progress) => {
          console.log("Processing:", `${progress.percent}% done`);
        })
        .on("end", () => {
          console.log("Video processing completed");
          resolve();
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
          reject(new FFmpegError("Video processing failed", err));
        });

      // Set timeout for processing
      setTimeout(() => {
        command.kill("SIGKILL");
        reject(new FFmpegError("Video processing timeout"));
      }, config.upload.processingTimeout);
    });
  }

  /**
   * Processes video file with validation and flipping
   * @param {string} inputPath - Path to input video file
   * @param {string} outputPath - Path to output video file
   * @returns {Promise<Object>} - Processing result with metadata
   */
  async processVideo(inputPath, outputPath) {
    try {
      // Get video metadata
      const metadata = await this.getVideoMetadata(inputPath);

      // Validate video duration
      if (!this.validateVideoDuration(metadata)) {
        throw new Error(
          `Video duration exceeds maximum limit of ${config.video.maxDuration} seconds`
        );
      }

      // Validate video resolution (optional for now, but log warning)
      if (!this.validateVideoResolution(metadata)) {
        console.warn(
          "Video resolution may not be optimal for TikTok format (720×1280 portrait)"
        );
      }

      // Flip video horizontally
      await this.flipVideoHorizontally(inputPath, outputPath);

      // Get output file info
      const outputFileInfo = await FileUtils.getFileInfo(outputPath);

      return {
        success: true,
        inputMetadata: metadata,
        outputFileInfo,
        processingTime: Date.now() - this.startTime,
      };
    } catch (error) {
      // Clean up output file if it exists
      await FileUtils.safeDeleteFile(outputPath);
      throw error;
    }
  }

  /**
   * Main method to handle video processing workflow
   * @param {string} inputPath - Path to input video file
   * @param {string} originalFilename - Original filename
   * @returns {Promise<Object>} - Processing result
   */
  async processVideoFile(inputPath, originalFilename) {
    this.startTime = Date.now();

    // Generate output filename
    const outputFilename = FileUtils.generateTempFilename(originalFilename);
    const outputPath = FileUtils.getTempFilePath(outputFilename);

    try {
      // Ensure temp directory exists
      await FileUtils.ensureTempDir();

      // Process the video
      const result = await this.processVideo(inputPath, outputPath);

      return {
        ...result,
        outputPath,
        outputFilename,
      };
    } catch (error) {
      // Clean up on error
      await FileUtils.safeDeleteFile(outputPath);
      throw error;
    }
  }
}

module.exports = VideoProcessor;
