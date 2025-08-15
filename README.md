# TikTok Video Horizontal Flip API

A minimal Node.js REST API that accepts video uploads and returns horizontally flipped videos.

## Features

- 🎥 Accept video uploads via multipart form data
- 🔄 Horizontally flip videos using FFmpeg
- 📱 Optimized for TikTok-style portrait videos (720×1280)
- ⚡ Fast processing with automatic cleanup
- 🛡️ Built-in security and error handling

## Prerequisites

- Node.js 18+
- FFmpeg installed on your system
- Yarn package manager

### Installing FFmpeg

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**

```bash
brew install ffmpeg
```

**Windows:**
Download from [FFmpeg official website](https://ffmpeg.org/download.html)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd tiktok-video-horizontal-flip-api
```

2. Install dependencies:

```bash
yarn install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Start the server:

```bash
# Development
yarn dev

# Production
yarn start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### POST /flip-video

Upload and flip a video horizontally.

**Request:**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Field name: `video`
- File size limit: 50MB
- Supported formats: MP4, MOV, AVI

**Response:**

- Success (200): Flipped video file
- Error (400): Invalid file/format
- Error (413): File too large
- Error (500): Processing failed

**Example using curl:**

```bash
curl -X POST \
  -F "video=@your-video.mp4" \
  http://localhost:3000/flip-video \
  --output flipped-video.mp4
```

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Video Specifications

- **Duration**: Up to 10 seconds
- **Resolution**: 720×1280 (portrait orientation)
- **File Size**: Maximum 50MB
- **Processing Time**: < 30 seconds

## Development

```bash
# Run tests
yarn test

# Lint code
yarn lint

# Fix linting issues
yarn lint:fix
```

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=3000
NODE_ENV=development
MAX_FILE_SIZE=52428800
PROCESSING_TIMEOUT=60000
TEMP_DIR=./temp
```

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── services/        # Business logic
├── utils/           # Utility functions
└── server.js        # Main server file
```

## Error Handling

The API includes comprehensive error handling for:

- Invalid file formats
- File size exceeded
- Processing failures
- Missing FFmpeg installation
- Timeout protection

## Security Features

- File type validation
- Size limits enforcement
- Input sanitization
- CORS protection
- Rate limiting
- Helmet security headers

## License

MIT
