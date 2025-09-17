import { config } from "./config/config";
import app from "./app";
import { connectDB } from "./config/db";

const startServer = async () => {
  // connect database
  await connectDB();

  const PORT = config.port || 3000;

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
