import { connectDB } from './config/database.config.js';
import configEnv from './config/env.config.js';
import logger from './config/logger.config.js';
import app from './app.js';

const PORT = configEnv.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    app.listen(PORT, () => {
      console.log('🚀 =======================================');
      console.log('🌟 API Server Started');
      console.log('🚀 =======================================');
      console.log(`🌍 Environment: ${configEnv.NODE_ENV}`);
      console.log(`🔗 Server: http://localhost:${PORT}`);
      console.log(`🩺 Health: http://localhost:${PORT}/health`);
      console.log(`📡 API: http://localhost:${PORT}${configEnv.API_PREFIX}`);
      console.log('🚀 =======================================');

      // This save in combined.log and log in terminal -
      logger.info(`Server started on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n📤 ${signal} received, shutting down gracefully...`);
  logger.info(`${signal} received, shutting down`);
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Promise Rejection: ${err.message}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Start the server
startServer();
