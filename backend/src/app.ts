import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config/env';
import routes from './routes';
import { notFoundHandler } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';

export const createApp = (): Application => {
  const app: Application = express();

  // Core Middlewares
  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Root welcome route
  app.get('/', (_req, res) => {
    res.status(200).json({
      name: 'SSK Natural Gold API',
      status: 'active',
      version: '0.1.0',
    });
  });

  // API Routes
  app.use('/api', routes);

  // Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
