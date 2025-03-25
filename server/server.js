import express from "express";
import { config } from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import protectedRoute from "./routes/protected.js";
import rideRoute from "./routes/ride.js";
import { v2 as cloudinary } from "cloudinary";

config();


connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/protected", protectedRoute);
app.use("/api/rides", rideRoute);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
