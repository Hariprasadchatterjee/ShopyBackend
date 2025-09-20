import {config as conf} from "dotenv"
// import path from 'path';

// 2. Provide the explicit path to your .env file
// This goes up two directories from src/config/ to the project root
// conf({ path: path.resolve(__dirname, '../../', '.env') });
conf()



const _config = {
  port: process.env.PORT,
  mongo_url: process.env.MONGO_URL as string,
  node_env: process.env.NODE_ENV,

  jwt_secret: process.env.JWT_SECRET as string ,
  jwt_expiresIn: process.env.JWT_EXPIRES_TIME as string ,
  cookie_expireIn: process.env.COOKIE_EXPIRES_TIME,

 sendgrid_api_key: process.env.SENDGRID_API_KEY || '',
  email_from: process.env.EMAIL_FROM || 'noreply@example.com',
  client_url: process.env.CLIENT_URL || 'http://localhost:3000',
}

// Add a check to ensure variables are loaded
if (!_config.jwt_secret || !_config.jwt_expiresIn) {
  console.error("FATAL ERROR: JWT_SECRET or JWT_EXPIRES_TIME is not defined.");
  process.exit(1); // Exit the application if secrets are missing
}

// console.log("--- CONFIG OBJECT CREATED ---", _config);

export const config = Object.freeze(_config)