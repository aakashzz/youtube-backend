import express from "express";
import cors from 'cors'
import cookieParser from "cookie-parser";
const app = express();

app.use(cors({
        origin: process.env.CORS_ORIGIN,
        credential: true,
}))


app.use(cookieParser())

//routes import
        
import userRouter from './routes/user.routes.js'

//router 

app.use("/api/v1/users", userRouter)

export {app}