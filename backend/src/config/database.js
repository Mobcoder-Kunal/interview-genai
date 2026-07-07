import mongoose from "mongoose";

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "interview-genai"
        });
        console.log("Connected to the database")
    }
    catch (err) {
        console.log(err)
    }
}

export default connectToDB