const request = require("supertest");
const express = require("express");
const VideoController = require("../../src/controllers/videoController");

// Create a test app
const app = express();
const videoController = new VideoController();

app.get("/health", videoController.healthCheck.bind(videoController));

describe("Health Check Endpoint", () => {
  it("should return health status", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toHaveProperty("status");
    expect(response.body).toHaveProperty("timestamp");
    expect(response.body).toHaveProperty("ffmpeg");
    expect(response.body).toHaveProperty("uptime");
    expect(response.body).toHaveProperty("memory");

    expect(response.body.status).toBe("ok");
    expect(typeof response.body.uptime).toBe("number");
    expect(typeof response.body.memory).toBe("object");
  });

  it("should return valid timestamp", async () => {
    const response = await request(app).get("/health").expect(200);

    const timestamp = new Date(response.body.timestamp);
    expect(timestamp.getTime()).not.toBeNaN();
  });
});
