import mongoose from "mongoose";

const InCampaign = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    gift: {
      type: Array,
      default: [],
    },
    taskoflist: {
      type: Array,
      default: [],
    },
    information: {
      type: String,
      default: "",
    },
    trakingnumber: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    comment: {
      type: String,
      default: "",
    },
    userid: {
      type: String,
      default: "",
    },
    campaignid: {
      type: String,
      default: "",
    },
    influencername: {
      type: String,
      default: "",
    },
    influencerimage: {
      type: String,
      default: "",
    },
    follower: {
      type: Number,
      default: "",
    },
    rates: {
      type: Number,
      default: 0,
    },
    logoimage: {
      type: String,
      default: "",
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
    orderid: {
      type: String,
      default: "",
    },
    reportuser: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("InCampaign", InCampaign);
