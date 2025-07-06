import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  fromCoordinates: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  to: {
    type: String,
    required: true,
  },
  toCoordinates: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  availableSeats: {
    type: Number,
    required: true,
  },
  pricePerSeat: {
    type: Number,
    required: true,
  },
  passengers: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      seatCount: {
        type: Number,
        required: true,
      },
    },
  ],
  BookingUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  carDetails: {
    model: String,
    licensePlate: String,
    color: String,
  },
  status: {
    type: String,
    enum: ["available", "booked", "ongoing", "completed", "cancelled"],
    default: "available",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

rideSchema.index({ fromCoordinates: "2dsphere" });
rideSchema.index({ toCoordinates: "2dsphere" });

export default mongoose.model("Ride", rideSchema);
