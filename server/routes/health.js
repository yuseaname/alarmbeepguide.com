/**
 * Health Check Route
 * Provides server health status for monitoring
 */

export function healthCheck(req, res) {
  const healthInfo = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(process.memoryUsage().external / 1024 / 1024)} MB`
    },
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform
    }
  };
  
  res.status(200).json(healthInfo);
}
