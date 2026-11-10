import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'ssk_dev_fallback_secret_tenkasi_2026',
  adminInitialEmail: process.env.ADMIN_INITIAL_EMAIL || 'admin@ssknaturalgold.com',
  adminInitialPassword: process.env.ADMIN_INITIAL_PASSWORD || '',
};
