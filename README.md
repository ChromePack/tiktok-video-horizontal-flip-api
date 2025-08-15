# Video Flip API

A super simple Node.js API that flips videos horizontally using FFmpeg.

## Prerequisites

- Node.js (v14 or higher)
- FFmpeg installed on your system

### Install FFmpeg on Ubuntu

```bash
sudo apt update
sudo apt install ffmpeg
```

## Setup

1. Install dependencies:

```bash
yarn install
```

2. Start the server:

```bash
yarn start
```

The API will run on `http://localhost:3000`

## API Endpoints

### Health Check

```
GET /health
```

Returns: `{ "status": "ok" }`

### Flip Video

```
POST /flip-video
```

- Content-Type: `multipart/form-data`
- Field name: `video`
- File size limit: 50MB
- Supported formats: MP4, MOV, AVI

Returns the flipped video file for download.

## Usage Example

Using curl:

```bash
curl -X POST -F "video=@your_video.mp4" http://localhost:3000/flip-video -o flipped_video.mp4
```

## File Structure

```
/
├── package.json
├── server.js
├── README.md
└── uploads/ (auto-created)
```

That's it! Super simple video flip API.
