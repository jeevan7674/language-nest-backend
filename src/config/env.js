const dotenv = require('dotenv');

dotenv.config();

const parseAllowedOrigins = () => {
  const origins = [];
  if (process.env.CLIENT_URL) {
    origins.push(...process.env.CLIENT_URL.split(',').map(url => url.trim()));
  }
  if (process.env.ADMIN_URL) {
    origins.push(...process.env.ADMIN_URL.split(',').map(url => url.trim()));
  }
  return origins.filter(Boolean);
};

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/languagenest',
  ALLOWED_ORIGINS: parseAllowedOrigins(),
  JWT_SECRET: process.env.JWT_SECRET || 'language-nest-super-secret-jwt-key-2025',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || 'lax',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'Language Nest <onboarding@resend.dev>',
  GOOGLE_SHEETS_SCRIPT_URL: process.env.GOOGLE_SHEETS_SCRIPT_URL || '',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
};

module.exports = env;
