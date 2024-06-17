import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config();
connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => [
            console.log(`Server start ${process.env.PORT}`),
        ]);
        app.on("error", (err) => {
            console.log(`Error is : ${err}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed: " + err);
    });

//SECOND OPTION BUT NOT CLEAR CODE
// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     } catch (error) {
//         console.log("ERROR: " + error);
//         throw error;
//     }
// })();
