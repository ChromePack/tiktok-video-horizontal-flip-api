const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const config = require("../config");

/**
 * CORS configuration
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // In production, you might want to restrict origins
    if (process.env.NODE_ENV === "production") {
      // Add your allowed origins here
      const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",")
        : ["http://localhost:3000"];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    }

    // In development, allow all origins
    callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

/**
 * Rate limiting configuration
 */
const rateLimitConfig = rateLimit({
  windowMs: config.security.rateLimitWindowMs, // 15 minutes
  max: config.security.rateLimitMaxRequests, // limit each IP to 100 requests per windowMs
  message: {
    error: {
      message: "Too many requests from this IP, please try again later.",
      statusCode: 429,
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Specific rate limit for video uploads (more restrictive)
 */
const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 uploads per 15 minutes
  message: {
    error: {
      message: "Too many video uploads from this IP, please try again later.",
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Helmet configuration for security headers
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for file uploads
});

/**
 * Compression middleware configuration
 */
const compressionConfig = compression({
  filter: (req, res) => {
    // Don't compress video files
    if (req.path.includes("/flip-video")) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Compression level
});

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // Additional security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  next();
};

module.exports = {
  corsOptions,
  rateLimitConfig,
  uploadRateLimit,
  helmetConfig,
  compressionConfig,
  requestLogger,
  securityHeaders,
};
