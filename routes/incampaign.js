import express from "express";
import InCampaign from "../models/InCampaign.js";
import User from "../models/User.js";
import Shopify from "shopify-api-node";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/addincampaign", async (req, res) => {
  try {
    const newproduct = await new InCampaign({
      name: req.body.name,
      gift: req.body.gift,
      taskoflist: req.body.taskoflist,
      userid: req.body.userid,
      logoimage: req.body.logoimage,
      information: "",
      status: req.body.status,
      campaignid: req.body.campaignid,
      deliveryfirstname: req.body.deliveryfirstname,
      deliverylastname: req.body.deliverylastname,
      deliveryaddress: req.body.deliveryaddress,
      phone: req.body.phone,
      email: req.body.email,
      influencername: req.body.instauser,
      influencerimage: req.body.photo,
      follower: req.body.followers,
    });
    await newproduct.save();
    res.status(200).json("success");
  } catch (err) {
    console.log(err);
  }
});

router.post("/tracking", async (req, res) => {
  const user = await User.findById(req.body.campaignid);
  const shopify_data = new Shopify({
    shopName: user.storename,
    accessToken: user.accesstoken,
  });
  shopify_data.order.get(req.body.orderid).then((res) => {
    const trackingnumber = res.fulfillments[0].tracking_number;
    InCampaign.findOneAndUpdate(
      { _id: req.body._id },
      { $set: { trakingnumber: trackingnumber } }
    );
  });
  res.status(200).json("Sent Tracking Number");
});

router.post("/changetracking", async (req, res) => {
  const trackingnumber = req.body.tracking;
  const status = "shipped";

  InCampaign.findOneAndUpdate(
    { _id: req.body.userid },
    { $set: { trakingnumber: trackingnumber, status: status } }
  ).then((res) => console.log(res));
  res.status(200).json("Sent Tracking Number");
});

router.post("/shopifyorder", async (req, res) => {
  try {
    const shopify_data = new Shopify({
      shopName: req.body.storename,
      accessToken: req.body.accesstoken,
    });
    const variantid = req.body.shopifyproduct.gift[0].variantid;
    // const address = req.body.shopifyproduct.deliveryaddress.split(",");
    // console.log(address);
    shopify_data.location.list().then((con) => {
      const locationid = con[0].id;
      let newOrder = {
        email: req.body.email,
        fulfillment_status: "fulfilled",
        // billing_address: {
        //   first_name: "Jane",
        //   last_name: "Smith",
        //   address1: "123 Fake Street",
        //   phone: "777-777-7777",
        //   city: "Fakecity",
        //   province: "Ontario",
        //   country: "Canada",
        //   zip: "K2P 1L4",
        // },
        fulfillments: [
          {
            notify_customer: true,
            location_id: locationid,
          },
        ],
        shipping_address: {
          first_name: req.body.shopifyproduct.deliveryfirstname,
          last_name: req.body.shopifyproduct.deliverylastname,
          address1: "123 Fake Street",
          phone: "777-777-7777",
          city: "Fakecity",
          province: "Ontario",
          country: "Canada",
          zip: "K2P 1L4",
        },
        line_items: [
          {
            quantity: 1,
            price: 0,
            variant_id: variantid,
          },
        ],
      };
      shopify_data.order.create(newOrder).then((order) => {
        const orderid = order.id;
        InCampaign.findOneAndUpdate(
          { _id: req.body.shopifyproduct._id },
          { $set: { orderid: orderid } }
        );
      });
    });
    res.status(200).json("success");
    // const customer = {
    //   first_name: req.body.name,
    //   last_name: req.body.name,
    //   phone: req.body.phone,
    //   // verified_email: true,
    //   email: req.body.email,
    //   addresses: [
    //     {
    //       address1: "123 Oak St",
    //       city: "Ottawa",
    //       province: "ON",
    //       phone: "555-1212",
    //       zip: "H1V 1X1",
    //       last_name: "Lastnameson",
    //       first_name: "Mother",
    //       country: "CA",
    //     },
    //   ],
    // };
  } catch (err) {
    console.log(err);
  }
});

router.post("/updatelist", async (req, res) => {
  try {
    const update = {};
    update.taskoflist = req.body.taskoflist;
    if (req.body.status !== "") {
      update.status = req.body.status;
    } else {
      update.status = "Task Pending";
    }
    await InCampaign.findOneAndUpdate(
      { _id: req.body._id },
      {
        $set: update,
      }
    ).then((res) => console.log(res));
    res.status(200).json("Success");
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.post("/requestcomment", async (req, res) => {
  try {
    const update = {};
    update.status = "Exchange Requested";
    update.title = req.body.title;
    update.comment = req.body.comment;
    await InCampaign.findOneAndUpdate(
      { _id: req.body._id },
      {
        $set: update,
      }
    );
    res.status(200).json("Success");
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.post("/deletelist", async (req, res) => {
  try {
    await InCampaign.findByIdAndDelete(req.body._id);
    res.status(200).json("Deleted Succesfully");
  } catch (err) {
    console.log(err);
  }
});

router.post("/updaterating", async (req, res) => {
  try {
    const update = {};
    console.log(req.body);
    update.rates = req.body.rating;
    update.information = req.body.description;
    await InCampaign.findOneAndUpdate(
      { _id: req.body._id },
      {
        $set: update,
      }
    ).then((res) => console.log(res));
    res.status(200).json("Success");
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.post("/searchInfl", async (req, res) => {
  try {
    const search = req.body;
    const result_search = await InCampaign.find().then((res) =>
      res.filter(
        (index) =>
          index.status.toUpperCase().indexOf(search.searchInfl.toUpperCase()) !=
          -1
      )
    );
    return res.status(200).send({ result_search });
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.post("/allincampaign", async (req, res) => {
  try {
    if (!req.body.campaignid) {
      const products = await InCampaign.find({
        userid: req.body.userid,
      });
      res.status(200).json(products);
    } else {
      const products = await InCampaign.find({
        campaignid: req.body.campaignid,
      });
      res.status(200).json(products);
    }
  } catch (err) {
    console.log(err);
  }
});

export default router;
