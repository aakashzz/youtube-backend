import mongoose from "mongoose";
import { db_name } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`);
        console.log("run success", connectionInstance.connection.host);
    } catch (error) {
        console.log("Error:", error);
        process.exit(1);
        throw error;
    }
}

export default connectDB;