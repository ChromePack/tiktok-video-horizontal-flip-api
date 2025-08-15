// Test setup file
process.env.NODE_ENV = "test";
process.env.PORT = 3001;
process.env.MAX_FILE_SIZE = 1048576; // 1MB for tests
process.env.PROCESSING_TIMEOUT = 10000; // 10 seconds for tests
process.env.TEMP_DIR = "./temp-test";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
