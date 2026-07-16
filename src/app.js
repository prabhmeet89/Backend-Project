import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"  // iska kaam yeh ki mai apne server se user ke browser ke cookies ko access kar paun or set kar paun
const app = express()


app.use(cors({  // cors jo hai wo allowed krta hai kosa data ara kitna * ka mtlb saara
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))  // json file ko aloowed karta hai pehel yeh itni asaani se ni le pata tha body parser use karna padta tha
app.use(express.urlencoded()) // yeh jab data url se aega usko handle krne ke liye hai
app.use(express.static("public"))  // public assest isme aate hai mtlb handle ke liye jaise image vgera jo sab acces kar paye
app.use(cookieParser())


export default app


// routes import
import userRouter from "./routes/user.routes.js"

// routes declaration 
app.use("/api/v1/user", userRouter)  // iska mtlb hai ki pehle /api/v1/user par jab clicl hoga fir router call hoga uske baad waha roter mai /register par jana hoga /api/v1/user/register