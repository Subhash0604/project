import express from "express";
import { config } from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import protectedRoute from "./routes/protected.js";
import { v2 as cloudinary } from "cloudinary";

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/protected", protectedRoute);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("Server running on port: ", PORT);
});
