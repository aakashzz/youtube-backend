import connectDB from "./db/connection.js";
import { app } from "./app.js";
import 'dotenv/config'

connectDB()
.then(()=>{
        app.on("error",(err)=>{
            console.log("Error in express on:", err);
        })
        app.listen(process.env.PORT || 8000,()=>{
            console.log("Server Is Start",process.env.PORT);
        })
})
.catch((err)=>{
    console.log("MongoDb connection failed !!", err);
})