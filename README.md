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

The API will run on `http://localhost:3001`

## PM2 Deployment

### Local PM2 Commands

```bash
# Start with PM2
yarn pm2:start

# Stop PM2 process
yarn pm2:stop

# Restart PM2 process
yarn pm2:restart

# Reload PM2 process (zero-downtime)
yarn pm2:reload

# Delete PM2 process
yarn pm2:delete

# View logs
yarn pm2:logs

# Monitor processes
yarn pm2:monit
```

### Production Deployment

1. Update `ecosystem.config.js` with your server details:

   - Replace `YOUR_SERVER_IP` with your server IP
   - Replace `YOUR_GITHUB_REPO_URL` with your GitHub repo URL

2. Deploy to production:

```bash
pm2 deploy production setup
pm2 deploy production
```

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
curl -X POST -F "video=@your_video.mp4" http://localhost:3001/flip-video -o flipped_video.mp4
```

## File Structure

```
/
├── package.json
├── server.js
├── ecosystem.config.js
├── README.md
├── logs/ (auto-created by PM2)
└── uploads/ (auto-created)
```

That's it! Super simple video flip API with PM2 deployment.
