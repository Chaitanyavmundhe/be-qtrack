import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'beqtrack_super_secret_jwt_key_2026_exhibition',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
  nodeEnv: process.env.NODE_ENV || 'development',
};
