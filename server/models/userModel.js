import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  picture: {
    type: String,
    default: "/Person.png",
  },
});

const userModel = mongoose.model("User", userSchema);

export default userModel;
