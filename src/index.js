import connectDB from "./db/connection.js";
import 'dotenv/config'
import express from "express";
const app = express();
connectDB()
.then(()=>{
        app.on("error",(err)=>{
            console.log("Error in express on:", err);
        })
        app.listen(process.env.PORT || 8000,()=>{
            console.log("Server Is Start");
        })
})
.catch((err)=>{
    console.log("MongoDb connection failed !!", err);
})