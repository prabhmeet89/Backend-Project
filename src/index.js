// require('dotenv').config({path: './env'})
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import dotenv from "dotenv";
import connectDB from "./db/index.js"
import { error } from "console";
import app from "./app.js";
dotenv.config({
    path:'./.env'
})
connectDB()
.then(()=>{
    app.on("error",(error) =>{
        console.log("ERR coming",error)
    })
    app.listen(process.env.PORT)
    console.log(`App is runnig at port${process.env.PORT}`)
})
.catch((err)=>{
    console.log("Mongodb connection failed",err)
})
























// method 1  // yeh method hum index kaaafi pollute kar rahe hai kaafi cheeze bhar denge
// import express from "express"
// import mongoose from "mongoose";
// import { DB_NAME } from "./constant.js"

// const app = express()

// ( async () =>{
//     try {
//        await mongoose.connect(`DB is connected to ${process.env.MONGODB_URI}/${DB_NAME}`)  // async await db se baat krne ke liye or try catch bhi taaki error na aaye
//        app.on("error",(error) =>{  // express ke liye app.on use kia kabi kabr express baat ni kar pata to error handling krne ke liye
//         console.log("Err", error)
//         throw error
//        })
       
//        app.listen(process.env.PORT , () =>{
//         console.log(`App is listening at port ${process.env.PORT}`)
//        })

//     } catch (error) {
//         console.log("Error comes", error)
//         throw error
//     }

// } )()