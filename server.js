const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file upload
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["video/mp4", "video/mov", "video/avi"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only MP4, MOV, AVI are allowed."),
        false
      );
    }
  },
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Video flip endpoint
app.post("/flip-video", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    const inputPath = req.file.path;
    const outputPath = path.join("uploads", `flipped_${Date.now()}.mp4`);

    // Use the fast FFmpeg command you mentioned
    const command = `ffmpeg -i "${inputPath}" -vf "hflip" "${outputPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("FFmpeg error:", error);
        cleanupFiles([inputPath]);
        return res.status(500).json({ error: "Video processing failed" });
      }

      // Send the flipped video file
      res.download(outputPath, "flipped_video.mp4", (err) => {
        if (err) {
          console.error("Download error:", err);
        }
        // Clean up files after sending
        cleanupFiles([inputPath, outputPath]);
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(413)
        .json({ error: "File too large. Maximum 50MB allowed." });
    }
  }

  console.error("Error:", error);
  res.status(400).json({ error: error.message || "Bad request" });
});

// Clean up temporary files
function cleanupFiles(filePaths) {
  filePaths.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
  });
}

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.listen(PORT, () => {
  console.log(`Video Flip API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Upload endpoint: http://localhost:${PORT}/flip-video`);
});
