import mongoose from "mongoose";

const Campaign = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    gifts: {
      type: Array,
      default: [],
    },
    taskoflist: {
      type: Array,
    },
    country: {
      type: Array,
    },
    options: {
      type: String,
    },
    userid: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
    logoimage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Campaign", Campaign);
