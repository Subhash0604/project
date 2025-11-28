import bookingModel from "../models/bookingModel.js";
import rideModel from "../models/rideModel.js";
import userModel from "../models/userModel.js";

export const offerRide = async (req, res) => {
  try {
    const { uid } = req.user;

    const {
      from,
      to,
      date,
      time,
      availableSeats,
      pricePerSeat,
      carDetails,
      fromCoordinates,
      toCoordinates,
    } = req.body;

    if (
      !from ||
      !to ||
      !date ||
      !time ||
      !availableSeats ||
      !pricePerSeat ||
      !carDetails?.model ||
      !carDetails?.licensePlate ||
      !carDetails?.color ||
      !fromCoordinates ||
      !toCoordinates ||
      !Array.isArray(fromCoordinates) ||
      !Array.isArray(toCoordinates) ||
      fromCoordinates.length !== 2 ||
      toCoordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        error: "All fields including coordinates are required",
      });
    }

    const driver = await userModel.findOne({ uid });
    if (!driver) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    await rideModel.create({
      driver: driver._id,
      from,
      to,
      fromCoordinates: {
        type: "Point",
        coordinates: fromCoordinates,
      },
      toCoordinates: {
        type: "Point",
        coordinates: toCoordinates,
      },
      date,
      time,
      availableSeats,
      pricePerSeat,
      carDetails,
    });

    res
      .status(201)
      .json({ success: true, message: "Ride created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Side Error" });
  }
};

export const searchRides = async (req, res) => {
  try {
    console.log("Received Query:", req.query);

    let { from, to, date, availableSeats } = req.query;

    console.log(from === "Hyderabad, Telangana, India");

    let seats = Number(availableSeats);

    if (!from || !to || !date) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    from = from.trim();
    to = to.trim();
    date = date.trim();

    const rides = await rideModel.aggregate([
      {
        $match: {
          from: from,
          to: to,
          date: date,
          availableSeats: { $gte: seats },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "BookingUsers",
          foreignField: "_id",
          as: "Users",
        },
      },
    ]);

    console.log(rides);

    return res.status(200).json({ success: true, rides });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
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

    ride.BookingUsers.push(user._id);
    ride.save();

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

    const rides = await rideModel
      .find({ driver: user._id })
      .sort({ createdAt: -1 });

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
      return res(401).json({ success: false, error: "User not found" });
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

    booking.status = "rejected";
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

    const booking = await bookingModel
      .findById(bookingId)
      .populate("ride")
      .populate("passenger");

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
        $push: {
          passengers: {
            name: booking.passenger.name,
            phone: booking.passenger.phone,
            email: booking.passenger.email,
            seatsBooked: booking.seatsBooked,
            picture: booking.passenger.picture,
          },
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

export const getBookings = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { uid } = req.user;

    const ride = await rideModel.findById(rideId);

    if (!ride) {
      return res.status(404).json({ success: false, error: "Ride not found" });
    }

    const user = await userModel.findOne({ uid });

    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    if (!ride.driver.equals(user._id)) {
      return res.status(403).json({ success: false, error: "UnAuthorized" });
    }

    const bookings = await bookingModel
      .find({ ride: ride._id })
      .sort({ createdAt: -1 })
      .populate("passenger");

    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Server Side Error" });
  }
};

export const getBookingsByUser = async (req, res) => {
  try {
    console.log(req);
    const { uid } = req.user;
    const user = await userModel.findOne({ uid });
    if (!user) {
      return res.status(401).json({ status: false, error: "user not found" });
    }

    const bookings = await bookingModel
      .find({ passenger: user._id })
      .sort({ createdAt: -1 })
      .populate("ride");

    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Server Side Error" });
  }
};

export const getRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { uid } = req.user;

    const ride = await rideModel.findById(rideId).populate("driver");

    if (!ride) {
      return res.status(404).json({ success: false, error: "Ride not found" });
    }

    const user = await userModel.findOne({ uid });

    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, ride });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Server Side Error" });
  }
};

export const completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const { uid } = req.user;

    const user = await userModel.findOne({ uid });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "User not found or unauthorized." });
    }

    const ride = await rideModel.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, error: "Ride not found." });
    }

    if (ride.driver.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: Only the ride driver can complete this trip.",
      });
    }

    if (ride.status !== "ongoing") {
      return res.status(400).json({
        success: false,
        error: `Cannot complete ride. Current status is '${ride.status}'.`,
      });
    }

    ride.status = "completed";
    await ride.save();

    return res.status(200).json({
      success: true,
      message: "Ride successfully completed.",
      ride: ride,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server Side Error" });
  }
};

export const startRide = async (req, res) => {
  const { rideId } = req.params;
  const driverId = req.user.uid;

  try {
    const ride = await rideModel.findById(rideId).populate("driver");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driver.uid.toString() !== driverId) {
      return res.status(403).json({
        message: "Unauthorized: Only the assigned driver can start this ride",
      });
    }

    if (ride.status !== "booked") {
      return res.status(400).json({
        message: `Cannot start ride. Current status is ${ride.status}.`,
      });
    }

    ride.status = "ongoing";
    await ride.save();

    return res.status(200).json({
      success: true,
      message: "Ride started successfully",
      rideStatus: ride.status,
    });
  } catch (error) {
    console.error("Error starting ride:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
