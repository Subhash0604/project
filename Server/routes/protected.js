import express from "express";
import userModel from "../models/userModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  const { uid, name, email, photoURL } = req.user;

  let user = await userModel.findOne({ uid });

  if (!user) {
    user = await userModel.create({
      uid,
      name,
      email,
      picture: photoURL,
      phone: "",
    });
  }

  res.status(200).json(user);
});

router.post("/update-phone", verifyToken, async (req, res) => {
  const { phone } = req.body;
  const { uid } = req.user;

  try {
    const user = await userModel.findOneAndUpdate(
      { uid },
      { phone },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update phone" });
  }
});

export default router;
