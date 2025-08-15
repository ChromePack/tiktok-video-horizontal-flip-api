const FileUtils = require("../../src/utils/fileUtils");
const fs = require("fs").promises;
const path = require("path");

// Mock fs module
jest.mock("fs", () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    unlink: jest.fn(),
    readdir: jest.fn(),
    stat: jest.fn(),
  },
}));

describe("FileUtils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("isValidFileExtension", () => {
    it("should return true for valid file extensions", () => {
      expect(FileUtils.isValidFileExtension("video.mp4")).toBe(true);
      expect(FileUtils.isValidFileExtension("video.MOV")).toBe(true);
      expect(FileUtils.isValidFileExtension("video.avi")).toBe(true);
    });

    it("should return false for invalid file extensions", () => {
      expect(FileUtils.isValidFileExtension("video.txt")).toBe(false);
      expect(FileUtils.isValidFileExtension("video.jpg")).toBe(false);
      expect(FileUtils.isValidFileExtension("video")).toBe(false);
    });
  });

  describe("isValidMimeType", () => {
    it("should return true for valid MIME types", () => {
      expect(FileUtils.isValidMimeType("video/mp4")).toBe(true);
      expect(FileUtils.isValidMimeType("video/quicktime")).toBe(true);
      expect(FileUtils.isValidMimeType("video/x-msvideo")).toBe(true);
    });

    it("should return false for invalid MIME types", () => {
      expect(FileUtils.isValidMimeType("text/plain")).toBe(false);
      expect(FileUtils.isValidMimeType("image/jpeg")).toBe(false);
      expect(FileUtils.isValidMimeType("application/json")).toBe(false);
    });
  });

  describe("isValidFileSize", () => {
    it("should return true for valid file sizes", () => {
      expect(FileUtils.isValidFileSize(1048576)).toBe(true); // 1MB (test environment limit)
      expect(FileUtils.isValidFileSize(0)).toBe(true);
    });

    it("should return false for invalid file sizes", () => {
      expect(FileUtils.isValidFileSize(52428801)).toBe(false); // 50MB + 1 byte
      expect(FileUtils.isValidFileSize(100000000)).toBe(false); // 100MB
    });
  });

  describe("generateTempFilename", () => {
    it("should generate unique filenames", () => {
      const filename1 = FileUtils.generateTempFilename("video.mp4");
      const filename2 = FileUtils.generateTempFilename("video.mp4");

      expect(filename1).not.toBe(filename2);
      expect(filename1).toMatch(/^temp_\d+_[a-z0-9]+\.mp4$/);
      expect(filename2).toMatch(/^temp_\d+_[a-z0-9]+\.mp4$/);
    });

    it("should preserve file extension", () => {
      const filename = FileUtils.generateTempFilename("video.mov");
      expect(filename).toMatch(/\.mov$/);
    });
  });

  describe("ensureTempDir", () => {
    it("should create directory if it does not exist", async () => {
      fs.access.mockRejectedValue(new Error("Directory does not exist"));

      await FileUtils.ensureTempDir();

      expect(fs.mkdir).toHaveBeenCalledWith("./temp-test", { recursive: true });
    });

    it("should not create directory if it already exists", async () => {
      fs.access.mockResolvedValue();

      await FileUtils.ensureTempDir();

      expect(fs.mkdir).not.toHaveBeenCalled();
    });
  });

  describe("getTempFilePath", () => {
    it("should return correct temp file path", () => {
      const path = FileUtils.getTempFilePath("test.mp4");
      expect(path).toBe("temp-test/test.mp4");
    });
  });

  describe("safeDeleteFile", () => {
    it("should delete file if it exists", async () => {
      fs.access.mockResolvedValue();

      await FileUtils.safeDeleteFile("/path/to/file.mp4");

      expect(fs.unlink).toHaveBeenCalledWith("/path/to/file.mp4");
    });

    it("should not throw error if file does not exist", async () => {
      fs.access.mockRejectedValue(new Error("File not found"));

      await expect(
        FileUtils.safeDeleteFile("/path/to/file.mp4")
      ).resolves.not.toThrow();
      expect(fs.unlink).not.toHaveBeenCalled();
    });
  });

  describe("getFileInfo", () => {
    it("should return file information", async () => {
      const mockStats = {
        size: 1024,
        birthtime: new Date("2024-01-01"),
        mtime: new Date("2024-01-02"),
        isFile: () => true,
      };

      fs.stat.mockResolvedValue(mockStats);

      const result = await FileUtils.getFileInfo("/path/to/file.mp4");

      expect(result).toEqual({
        size: 1024,
        created: new Date("2024-01-01"),
        modified: new Date("2024-01-02"),
        isFile: true,
      });
    });
  });
});
