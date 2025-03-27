import bookingModel from "../models/bookingModel.js";
import rideModel from "../models/rideModel.js";
import userModel from "../models/userModel.js";

export const offerRide = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request body is missing (Check JSON Parsing)",
      });
    }

    const { from, to, date, time, availableSeats, pricePerSeat, carDetails } = req.body;

    // Ensure carDetails object has necessary fields
    if (
      !from ||
      !to ||
      !date ||
      !time ||
      !availableSeats ||
      !pricePerSeat ||
      !carDetails?.model ||
      !carDetails?.licensePlate ||
      !carDetails?.color
    ) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    // Fetch authenticated user details
    const driver = await userModel.findOne({ uid: req.user.uid });

    if (!driver) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    // Create and save new ride
    const newRide = await rideModel.create({
      driver: driver._id,
      driverId: driver.uid,
      driverName: driver.name,
      from,
      to,
      date,
      time,
      availableSeats,
      pricePerSeat,
      carDetails,
    });

    res.status(201).json({ success: true, message: "Ride created successfully", ride: newRide });

  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ success: false, error: "Server Side Error" });
  }
};

export const getRidesByMe = async (req, res) => {
  try {
    const { uid } = req.user;
    const user = await userModel.findOne({ uid });

    if (!user) {
      return res.status(404).json({ success: false, error: "user not found" });
    }

    const rides = await rideModel.find({ driver: user._id });

    return res.status(200).json({ success: true, rides });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, error: "Server Side Error" });
  }
};

export const searchRides = async (req, res) => {
  try {
    console.log("Received Query:", req.query);

    let { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    // Trim input values to remove extra spaces
    from = from.trim();
    to = to.trim();
    date = date.trim();


    // Use case-insensitive search
    const rides = await rideModel.find({
      from: new RegExp(`^${from}$`, "i"), // Case-insensitive regex
      to: new RegExp(`^${to}$`, "i"),
      date, // Keep it as it is (assuming DB stores YYYY-MM-DD)
      availableSeats: { $gt: 0 }, // Ensures only rides with available seats are shown
    });

    return res.json({ success: true, rides });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

export const bookARide = async (req, res) => {
  try {
    console.log("🔹 Booking request received:", req.params, req.body);

    const { uid } = req.user; // User ID from Firebase token
    const { rideId } = req.params;
    const { seats } = req.body;

    console.log("User ID:", uid);
    console.log("Ride ID:", rideId);
    console.log("Seats requested:", seats);

    // Check if user exists
    const user = await userModel.findOne({ uid });
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ success: false, error: "Login to book a ride" });
    }

    // Find the ride
    const ride = await rideModel.findById(rideId);
    if (!ride) {
      console.log("Ride not found");
      return res.status(404).json({ success: false, error: "Ride not found" });
    }

    if (ride.status !== "available") {
      console.log("Ride is not available");
      return res.status(400).json({ success: false, error: "Ride is not available" });
    }

    // ❗ Check if enough seats are available
    if (ride.availableSeats < seats) {
      console.log("Not enough seats available");
      return res.status(400).json({ success: false, error: "Not enough seats available" });
    }

    // Create booking
    const newBooking = await bookingModel.create({
      ride: ride._id,
      passenger: user._id,
      seatsBooked: seats,
    });

    // Update ride seat count
    ride.availableSeats -= seats;
    if (ride.availableSeats === 0) {
      ride.status = "booked"; // Mark as fully booked
    }
    await ride.save();

    console.log("Ride booked successfully");
    return res.status(200).json({
      success: true,
      message: "Ride booked successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ success: false, error: "Server Side Error" });
  }
};

export const getBookingsByUser = async (req, res) => {
  try {
    console.log(req);
    const { uid } = req.user;
    const user = await userModel.findOne({uid});
    if(!user){
      return res.status(401).json({status : false, error: "user not found"});
    }

    const bookings = await bookingModel.find({ passenger: user._id }).populate("ride");

   return res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Server Side Error" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { uid } = req.user;
    const { bookingId } = req.params;

    const user = await userModel.findOne({ uid });

    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    const booking = await bookingModel.findById(bookingId);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    if (booking.passenger.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to cancel the booking",
      });
    }

    if (booking.status !== "pending" && booking.status !== "accepted") {
      return res
        .status(400)
        .json({ success: false, error: "Booking already canceled" });
    }

    if (booking.status === "pending") {
      booking.status = "cancelled_by_passenger";
      await booking.save();
    } else if (booking.status === "accepted") {
      booking.status = "cancelled_by_passenger";
      await booking.save();
    }

    return res
      .status(200)
      .json({ success: true, message: "Booking canceled successfully" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ success: false, error: "Server side error" });
  }
};

export const rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { uid } = req.user;

    const booking = await bookingModel.findById(bookingId).populate("ride");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    const user = await userModel.findOne({ uid });

    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (
      !booking.ride ||
      booking.ride.driver.toString() !== user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to cancel the booking",
      });
    }

    if (booking.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, error: "Request already processed" });
    }

    booking.status = "cancelled_by_driver";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking request rejected successfully",
    });
  } catch (error) {
    console.error("Error in rejectBooking:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const acceptBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { uid } = req.user;

    const booking = await bookingModel.findById(bookingId).populate("ride");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    const user = await userModel.findOne({ uid });

    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (
      !booking.ride ||
      booking.ride.driver.toString() !== user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to accept this booking",
      });
    }

    if (booking.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, error: "Request already processed" });
    }

    const ride = booking.ride;
    const seatsToBook = booking.seatsBooked;

    const updatedRide = await rideModel.findOneAndUpdate(
      { _id: ride._id, availableSeats: { $gte: seatsToBook } },
      {
        $inc: { availableSeats: -seatsToBook },
        $set: {
          status:
            ride.availableSeats - seatsToBook <= 0 ? "booked" : ride.status,
        },
      },
      { new: true }
    );

    if (!updatedRide) {
      return res
        .status(400)
        .json({ success: false, error: "Not enough seats available" });
    }

    booking.status = "accepted";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking request accepted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server side error" });
  }
};