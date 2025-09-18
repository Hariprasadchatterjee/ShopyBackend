import {config as conf} from "dotenv"
import path from "path"; // 1. Import the 'path' module

// 2. Provide the explicit path to your .env file
// This goes up two directories from src/config/ to the project root
conf({ path: path.resolve(__dirname, "../../.env") });

const _config = {
  port: process.env.PORT,
  mongo_url: process.env.MONGO_URL,
  jwt_secret: process.env.JWT_SECRET,
  jwt_expiresIn: process.env.JWT_EXPIRES_TIME,
}

// Add a check to ensure variables are loaded
if (!_config.jwt_secret || !_config.jwt_expiresIn) {
  console.error("FATAL ERROR: JWT_SECRET or JWT_EXPIRES_TIME is not defined.");
  process.exit(1); // Exit the application if secrets are missing
}

export const config = Object.freeze(_config)