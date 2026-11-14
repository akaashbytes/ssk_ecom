import { createApp } from './app';
import { config } from './config/env';
import { OrderService } from './services/order.service';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`[server]: SSK Natural Gold API is running on http://localhost:${config.port}`);
  console.log(`[server]: Environment: ${config.env}`);
});

// Automated in-process background scheduler for expired UPI reservations (runs every 60 seconds)
const CLEANUP_INTERVAL_MS = 60 * 1000;
const cleanupScheduler = setInterval(async () => {
  try {
    const result = await OrderService.releaseExpiredReservations();
    if (result.releasedCount > 0) {
      console.log(`[scheduler]: Automatically released ${result.releasedCount} expired UPI reservation(s): ${result.orderNumbers.join(', ')}`);
    }
  } catch (err) {
    console.error('[scheduler]: Failed to execute automatic reservation cleanup:', err);
  }
}, CLEANUP_INTERVAL_MS);

// Graceful shutdown
const handleShutdown = (signal: string) => {
  console.log(`[server]: Received ${signal}. Shutting down gracefully...`);
  clearInterval(cleanupScheduler);
  server.close(() => {
    console.log('[server]: HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
