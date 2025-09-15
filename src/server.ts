import { config } from "./config/config";
import app from "./app"

const startServer =()=>{
  const PORT = config.port;
  app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`);
    
  })
}

startServer()
