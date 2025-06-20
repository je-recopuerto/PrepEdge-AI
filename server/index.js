import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
connectDB()
    .then(() => console.log("Database connected successfully"))
    .catch((error) => console.error("Database connection failed:", error));

app.get("/", (req, res) => res.send("PrepEdge AI Backend"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));