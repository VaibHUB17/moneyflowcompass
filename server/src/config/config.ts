import dotenv from 'dotenv';

// Load env vars
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongoURI: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
}

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-visualizer',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
};

export default config;