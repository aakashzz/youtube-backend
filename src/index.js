import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config();
connectDB();



//SECOND OPTION BUT NOT CLEAR CODE
// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     } catch (error) {
//         console.log("ERROR: " + error);
//         throw error;
//     }
// })();
