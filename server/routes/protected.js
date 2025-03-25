import express from "express";
import userModel from "../models/userModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  const { uid, name, email, photoURL } = req.user;

  let user = await userModel.findOne({ uid });

  if (!user) {
    user = await userModel.create({ uid, name, email, picture: photoURL });
  }

  res.status(200).json(user);
});

export default router;
