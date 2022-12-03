import express from "express";
import Campaign from "../models/Campaign.js";
import User from "../models/User.js";
const router = express.Router();

router.post("/allproduct", async (req, res) => {
  try {
    const campaign = await Campaign.find({
      userid: req.body.userid,
    });
    if (campaign) {
      return res.status(200).json(campaign);
    }
  } catch (err) {
    console.log(err);
  }
});
router.post("/incampaign", async (req, res) => {
  try {
    const campaign = await Campaign.find({
      name: req.body.name,
    });
    console.log(campaign, "Campaign");
    if (campaign) {
      return res.status(200).json(campaign);
    } else {
      return res.status(400).json("no");
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/searchRate", async (req, res) => {
  try {
    const search = req.body;
    if(search.label === undefined) {
      const result = await User.find({});
      return res.status(200).send( result );
    } else {
      const result = await User.find({
        rates: search.label
      })
      return res.status(200).send( result );
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.post("/addproduct", async (req, res) => {
  try {
    const name = await Campaign.findOne({
      name: req.body.campaignname,
    });
    if (!name) {
      const newCampaign = await new Campaign({
        name: req.body.campaignname,
        gifts: req.body.gift,
        taskoflist: req.body.taskoflist,
        country: req.body.country,
        userid: req.body.userid,
        url: req.body.url,
        logoimage: req.body.logoimage,
      });
      const campaign = await newCampaign.save();
      res.status(200).json(campaign);
    } else {
      return res.status(400).json("input other Campaign name");
    }
  } catch (err) {
    return res.status(400).json(req.body);
  }
});

router.post("/deletecampaign", async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.body._id);
    res.status(200).json("Campaign Deleted Succesfully");
  } catch (err) {
    console.log(err);
  }
});

router.post("/updatecampaign", async (req, res) => {
  try {
    const updates = {};
    if (req.body.campaignname) {
      const name = req.body.campaignname;
      updates.name = name;
    }
    if (req.body.url) {
      const url = req.body.url;
      updates.url = url;
    }

    if (req.body.taskoflist) {
      const taskoflist = req.body.taskoflist;
      updates.taskoflist = taskoflist;
    }
    if (req.body.gift) {
      const gift = req.body.gift;
      updates.gifts = gift;
    }
    if (req.body.country) {
      const country = req.body.country;
      updates.country = country;
    }
    try {
      await Campaign.findByIdAndUpdate(req.body._id, {
        $set: updates,
      });
      res.status(200).json("Data Updated Succesfully");
    } catch (err) {
      res.status(500).json(err);
    }
  } catch (err) {
    res.status(400).json(err);
  }
});
export default router;
