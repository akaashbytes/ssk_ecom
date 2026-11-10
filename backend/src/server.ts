import { createApp } from './app';
import { config } from './config/env';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`[server]: SSK Natural Gold API is running on http://localhost:${config.port}`);
  console.log(`[server]: Environment: ${config.env}`);
});

// Graceful shutdown
const handleShutdown = (signal: string) => {
  console.log(`[server]: Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[server]: HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
