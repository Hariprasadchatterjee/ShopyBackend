import {config as conf} from "dotenv"
// import path from 'path';

// 2. Provide the explicit path to your .env file
// This goes up two directories from src/config/ to the project root
// conf({ path: path.resolve(__dirname, '../../', '.env') });
conf()



const _config = {
  port: process.env.PORT,
  mongo_url: process.env.MONGO_URL as string,
  jwt_secret: process.env.JWT_SECRET as string || 'fallback-secret-key-change-in-production',
  jwt_expiresIn: process.env.JWT_EXPIRES_TIME as string || '7d',
  cookie_expireIn: process.env.COOKIE_EXPIRES_TIME,
  node_env: process.env.NODE_ENV,
}

// Add a check to ensure variables are loaded
if (!_config.jwt_secret || !_config.jwt_expiresIn) {
  console.error("FATAL ERROR: JWT_SECRET or JWT_EXPIRES_TIME is not defined.");
  process.exit(1); // Exit the application if secrets are missing
}

export const config = Object.freeze(_config)