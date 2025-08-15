module.exports = {
  apps: [
    {
      name: "video-flip-api",
      script: "./server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "development",
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      // Logging configuration
      log_file: "./logs/combined.log",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Process management
      max_memory_restart: "200M",
      restart_delay: 4000,
      max_restarts: 10,

      // Watch mode for development (disabled in production)
      watch: false,
      ignore_watch: ["node_modules", "logs", "uploads"],

      // Environment variables
      env_file: ".env",
    },
  ],

  // PM2 Deploy Configuration
  deploy: {
    production: {
      user: "root",
      host: "148.230.93.128",
      ref: "origin/main",
      repo: "https://github.com/ChromePack/tiktok-video-horizontal-flip-api.git",
      path: "/var/www/video-flip-api",
      "pre-deploy-local": "echo 'This is a local executed command'",
      "post-deploy":
        "yarn install --production && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "echo 'This runs on the server before the setup process'",
    },
  },
};
