# Video Flip API - Product Requirements Document

## Overview

A minimal Node.js REST API that accepts video uploads and returns horizontally flipped videos. **Super simple - just 2-3 files.**

## Functional Requirements

### Core Feature

- **Video Upload & Flip**: Accept a video file via HTTP POST and return the same video flipped horizontally

### Input Specifications

- **Video Duration**: Up to 20 seconds
- **Video Resolution**: 720 × 1280 (portrait orientation)
- **Supported Formats**: MP4 (primary), MOV, AVI
- **File Size Limit**: 50MB maximum
- **Upload Method**: Multipart form data

### Output Specifications

- **Processing**: Horizontal flip (mirror effect)
- **Format**: Same as input (preserve original format)
- **Quality**: Maintain original quality (no compression)
- **Response**: Direct file download

## API Endpoints

### POST /flip-video

- **Purpose**: Upload and flip video
- **Request**:
  - Content-Type: `multipart/form-data`
  - Field name: `video`
- **Response**:
  - Success (200): Flipped video file
  - Error (400): Invalid file/format
  - Error (413): File too large
  - Error (500): Processing failed

### GET /health

- **Purpose**: API health check
- **Response**: `{ "status": "ok" }`

## Technical Requirements

### Dependencies

- Node.js runtime
- FFmpeg system installation
- Express.js framework
- Multer for file handling
- fluent-ffmpeg for video processing

### File Structure (Super Simple)

```
/
├── package.json
├── server.js
└── README.md
```

### Performance

- **Processing Time**: < 30 seconds for 10s video
- **Memory Usage**: Basic cleanup of temporary files

### Error Handling

- Invalid file formats
- File size exceeded
- Processing failures
- Missing FFmpeg installation

## Non-Functional Requirements

### Reliability

- Basic cleanup of temporary files
- Simple error handling
- Process timeout protection (60s max)

### Security

- File type validation
- Size limits enforced

## Out of Scope (V1)

- User authentication
- File storage/persistence
- Batch processing
- Advanced video effects
- Progress tracking
- Rate limiting
- CORS
- Docker
- Compression
- Complex folder structure
- Middleware beyond basic file handling
- Tests

## Success Metrics

- Successfully flip 720×1280 portrait videos
- Complete processing within timeout limits
- Handle expected file formats without crashes
- Basic resource cleanup
