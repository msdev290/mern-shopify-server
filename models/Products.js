import mongoose from "mongoose";

const Products = new mongoose.Schema(
  {
    sku: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    image: {
      type: Array,
      default: [],
    },
    quantity: {
      type: String,
      default: "",
    },
    userid: {
      type: String,
      default: "",
    },
    variantid: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", Products);
