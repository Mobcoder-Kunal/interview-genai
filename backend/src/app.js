// In app.js we generally create the instance of app and use middlewares and routes

import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import authRouter from './routes/auth.routes.js';
import interviewRouter from "./routes/interview.routes.js";

const app = express()

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        "http://localhost:5173",
        "interview-genai-gray.vercel.app",
    ],
    credentials: true
}));

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

export default app


// JSDoc is a markup language used to annotate JavaScript source code files. By adding specially formatted comments directly into your code, you can use the JSDoc tool to automatically generate a static HTML documentation website. 

/**
 *  Calculates the total price including tax.
 * 
 *  @param {number} price - The base cost of the item.
 *  @param {number} [taxRate=0.08] - The tax rate decimal (optional, defaults to 0.08).
 *  @returns {number} The final computed price.
 *  @throws {TypeError} Thrown if price is not a positive number.
 */