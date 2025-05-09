// /backend/utils/logger.js

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

// Create a debug logger
const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log('[LOG]', new Date().toISOString(), ...args);
    }
  },
  error: (...args) => {
    // Always log errors, even in production
    console.error('[ERROR]', new Date().toISOString(), ...args);
  },
  info: (...args) => {
    if (isDevelopment) {
      console.info('[INFO]', new Date().toISOString(), ...args);
    }
  },
  warn: (...args) => {
    // Always log warnings
    console.warn('[WARN]', new Date().toISOString(), ...args);
  },
  debug: (...args) => {
    if (isDevelopment) {
      console.log('[DEBUG]', new Date().toISOString(), ...args);
    }
  }
};

module.exports = logger;