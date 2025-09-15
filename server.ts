import app from "./src/app.js"

const startServer =()=>{
  const PORT = 3000;
  app.listen(PORT, ()=>{
    console.log(`listinig to port ${PORT}`);
    
  })
}

startServer()
