import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      min: 3,
      max: 15,
      unique: true,
    },
    email: {
      type: String,
      require: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      require: true,
      min: 6,
    },
    photo: {
      type: String,
      default: "",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBrand: {
      type: Boolean,
      default: true,
    },
    deliveryfirstname: {
      type: String,
      default: "",
    },
    deliverylastname: {
      type: String,
      default: "",
    },
    deliveryaddress: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    logoimage: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "GB",
    },
    instauser: {
      type: String,
      default: "",
    },
    rates: {
      type: Number,
      default: 0,
    },
    ispackage: {
      type: String,
      default: "",
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
    storename: {
      type: String,
      default: "",
    },
    followers: {
      type: String,
      default: "",
    },
    accesstoken: { type: String, default: "" },
    newmessage: { type: Array, default: [] },
    reportuser: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);
