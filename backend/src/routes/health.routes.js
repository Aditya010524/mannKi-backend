import express from 'express';
import logger from '../config/logger.config.js';

const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  // #swagger.tags = ['Health']
  // #swagger.summary = 'Health check endpoint'
  // #swagger.description = 'Returns the current health status of the API'
  // #swagger.responses[200] = { description: 'API is healthy', schema: { status: 'healthy', timestamp: '2024-01-01T00:00:00.000Z', uptime: 3600, environment: 'development', version: '1.0.0' } }
  // #swagger.responses[503] = { description: 'API is unhealthy', schema: { status: 'unhealthy', timestamp: '2024-01-01T00:00:00.000Z', error: 'Service unavailable' } }

  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };

    logger.info('Health check accessed');
    return res.status(200).json(healthData);
  } catch (error) {
    logger.error('Health check failed:', error);
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

router.get('/ping', (req, res) => {
  // #swagger.tags = ['Health']
  // #swagger.summary = 'Simple ping endpoint'
  // #swagger.description = 'Returns a simple pong response to test connectivity'
  // #swagger.responses[200] = { description: 'Pong response', schema: { message: 'pong' } }

  res.status(200).json({ message: 'pong' });
});

export default router;
