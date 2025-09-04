import mongoose from 'mongoose';
import configEnv from './env.config.js';
import logger from './logger.config.js';

const connectDB = async () => {
  try {
    // Basic production options
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    };

    const conn = await mongoose.connect(configEnv.DATABASE.MONGODB_URI, options);
    logger.info(`✅ Dev DB connected: ${conn.connection.host}:${conn.connection.port}`);
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('📊 Database disconnected');
  } catch (error) {
    logger.error('❌ Disconnect error:', error.message);
  }
};

// Essential error handling
mongoose.connection.on('error', (err) => {
  logger.error('❌ Database error:', err);
});

// Graceful shutdown
// Signal sent when you press Ctrl+C in the terminal.
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('📊 Database closed due to app termination');
  process.exit(0);
});

export { connectDB, disconnectDB };
// export default connectDB;
