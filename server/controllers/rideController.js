import bookingModel from "../models/bookingModel.js";
import rideModel from "../models/rideModel.js";
import userModel from "../models/userModel.js";

export const offerRide = async (req, res) => {
  try {
    const { uid } = req.user;

    console.log(uid);
    const { from, to, date, time, availableSeats, pricePerSeat, carDetails } =
      req.body;

    if (
      !from ||
      !to ||
      !date ||
      !time ||
      !availableSeats ||
      !pricePerSeat ||
      !carDetails
    ) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    const driver = await userModel.findOne({ uid });

    if (!driver) {
      return res.status(401).json({ success: false, error: "user not found" });
    }

    await rideModel.create({
      driver: driver._id,
      from,
      to,
      date,
      time,
      availableSeats,
      pricePerSeat,
      carDetails,
    });

    res
      .status(201)
      .json({ success: true, message: "ride created successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, error: "Server Side Error" });
  }
};

export const bookARide = async (req, res) => {
  try {
    const { uid } = req.user;

    const { rideId } = req.params;

    const { seats } = req.body;

    const user = await userModel.findOne({ uid });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Login to Book a ride" });
    }

    const ride = await rideModel.findById(rideId);

    if (!ride) {
      return res.status(404).json({ success: false, error: "Ride not found" });
    }

    if (ride.status !== "available") {
      return res
        .status(400)
        .json({ success: false, error: "Requested ride is not available" });
    }

    const newBooking = await bookingModel.create({
      ride: ride._id,
      passenger: user._id,
      seatsBooked: seats,
    });

    return res
      .status(200)
      .json({ success: true, message: "Ride requested Successfully" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ success: false, error: "Server Side Error" });
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

export const cancelBooking = async (req, res) => {
  try {
    const { uid } = req.user;
    const { bookingId } = req.params;

    const user = await userModel.findOne({ uid });

    if (!user) {
      return req.res(401).json({ success: false, error: "User not found" });
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
        .json({ sucess: false, error: "Booking already canceled" });
    }

    if (booking.status === "pending") {
      booking.status = "cancelled_by_passenger";
      await booking.save();
    } else if (booking.status === "accepted") {
      booking.status = "cancelled_by_passenger";
      await booking.save();
      // TODO Notification;
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
