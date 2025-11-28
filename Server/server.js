import express from "express";
import { config } from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import protectedRoute from "./routes/protected.js";
import rideRoute from "./routes/ride.js";
import { v2 as cloudinary } from "cloudinary";

import http from "http";
import { Server } from "socket.io";

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
app.use("/api/rides", rideRoute);

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("join-ride-room", (rideId) => {
    socket.join(rideId);
    console.log(`➡️ User ${socket.id} joined ride room ${rideId}`);
  });

  socket.on("driver-location", ({ rideId, latitude, longitude }) => {
    io.to(rideId).emit("driver-location-update", {
      lat: latitude,
      lng: longitude,
    });
  });

  socket.on("passenger-location", ({ rideId, latitude, longitude }) => {
    io.to(rideId).emit("passenger-location-update", {
      lat: latitude,
      lng: longitude,
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🌐 Server running on port: ${PORT}`);
});
