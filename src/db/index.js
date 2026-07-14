import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MONGODB is connected and the DB HOST IS !!! ${connectionInstance.connection.host}`); // host ke liye isisliye kyu ki bhtt saare db hote hai production level par to wo kahi or connect na hojaye isiliye specify kia host ko
    } catch (error) {
        console.error("MONGODB connection Failed", error);
        process.exit(1);
    }
};

export default connectDB