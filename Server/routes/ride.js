import express from "express";
import {
  acceptBooking,
  bookARide,
  searchRides,
  cancelBooking,
  getRidesByMe,
  offerRide,
  rejectBooking,
  getBookingsByUser,
} from "../controllers/rideController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/offerRide", verifyToken, offerRide); // done
router.get("/getRidesByMe", verifyToken, getRidesByMe); // done
router.get("/searchRides", searchRides); // done
router.post("/bookARide/:rideId", verifyToken, bookARide); // done
router.get("/getBookingsByUser", verifyToken, getBookingsByUser); // working on it
router.post("/cancelBooking/:bookingId", verifyToken, cancelBooking); //
router.post("/rejectBooking/:bookingId", verifyToken, rejectBooking);
router.post("/acceptBooking/:bookingId", verifyToken, acceptBooking);

export default router;
