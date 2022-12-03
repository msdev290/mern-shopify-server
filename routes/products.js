import axios from "axios";
import express from "express";
import Product from "../models/Products.js";
import path from "path";
import multer from "multer";
import Shopify from "shopify-api-node";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
  ];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

let upload = multer({ storage, fileFilter });

router.post("/allproduct", async (req, res) => {
  try {
    const products = await Product.find({
      userid: req.body.userid,
    });
    res.status(200).json(products);
  } catch (err) {
    console.log(err);
  }
});

router.post("/allsku", async (req, res) => {
  try {
    const products = await Product.find({
      sku: req.body.sku,
    });
    res.status(200).json(products);
  } catch (err) {
    console.log(err);
  }
});
router.post("/deleteproduct", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.body._id);
    res.status(200).json("Product Deleted Succesfully");
  } catch (err) {
    console.log(err);
  }
});

router.post("/addproduct", upload.single("image"), async (req, res) => {
  try {
    const sku = await Product.findOne({
      sku: req.body.sku,
    });
    if (!sku) {
      const newproduct = await new Product({
        sku: req.body.sku,
        name: req.body.name,
        image: process.env.IMAGEURL + req.file.filename,
        quantity: req.body.quantity,
        userid: req.body.userid,
      });
      const products = await newproduct.save();
      res.status(200).json(products);
    } else {
      return res.status(400).json("Please enter other SKU");
    }
  } catch (err) {
    return res.status(400).json(req.body);
  }
});

router.post("/updateproduct", upload.single("image"), async (req, res) => {
  const updates = {};

  if (req.body.sku) {
    const sku = req.body.sku;
    updates.sku = sku;
  }
  if (req.body.name) {
    const name = req.body.name;
    updates.name = name;
  }
  if (req.body.quantity) {
    const quantity = req.body.quantity;
    updates.quantity = quantity;
  }
  if (req.body.image) {
    const image = req.body.image;
    updates.image = image;
  }
  if (req.file !== undefined) {
    const image = req.file.filename;
    updates.image = process.env.IMAGEURL + image;
  }
  try {
    await Product.findByIdAndUpdate(req.body._id, {
      $set: updates,
    });
    res.status(200).json("Data Updated Succesfully");
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/addcsvfile", async (req, res) => {
  try {
    const userids = await Product.findOne({
      userid: req.body.data.userid,
    });
    const csvproduct = req.body.data.csvproduct;
    if (userids) {
      Product.find({ userid: req.body.data.userid }).remove().exec();
      csvproduct.map(async (item) => {
        const newproduct = await new Product({
          sku: item.sku,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          userid: req.body.data.userid,
        });
        await newproduct.save();
      });
      res.status(200).json("success");
    } else {
      csvproduct.map(async (item) => {
        const newproduct = await new Product({
          sku: item.sku,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          userid: req.body.data.userid,
        });
        await newproduct.save();
      });
      res.status(200).json("success");
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/addshopify", async (req, res) => {
  try {
    const userids = await Product.findOne({
      userid: req.body.userid,
    });
    try {
      const shopify_data = new Shopify({
        shopName: req.body.storename,
        accessToken: req.body.access,
      });
      const shopifydata = await shopify_data.product.list();
      // shopify_data.order.create(newOrder).then((order) => console.log(order));
      if (userids) {
        Product.find({ userid: req.body.userid }).remove().exec();
        shopifydata.map(async (item) => {
          let temp = [];
          item.variants.map(async (items) => {
            console.log(items);
            item.images.map(async (image) => {
              temp.push(image.src);
            });
            const newproduct = await new Product({
              sku: items.sku,
              name: item.title,
              image: temp,
              quantity: items.inventory_quantity,
              userid: req.body.userid,
              variantid: items.id,
            });
            await newproduct.save();
          });
        });
        res.status(200).json("success");
      } else {
        shopifydata.map(async (item) => {
          let temp = [];
          item.variants.map(async (items) => {
            item.images.map(async (image) => {
              temp.push(image.src);
            });
            const newproduct = await new Product({
              sku: items.sku,
              name: item.title,
              image: temp,
              quantity: items.inventory_quantity,
              userid: req.body.userid,
              variantid: items.id,
            });
            await newproduct.save();
          });
        });
        res.status(200).json("success");
      }
    } catch (err) {
      res
        .status(500)
        .json(
          "The Shopify Store cannot be found or the Access Token is invalid."
        );
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/addmagento", async (req, res) => {
  try {
    var storeName = req.body.storename;
    var accessToken = req.body.access;
    var userid = req.body.userid;
    var resultTotalData = new Array();
    // console.log("storeName:", storeName);
    // console.log("accessToken:", accessToken);
    var please = await axios.get(`${storeName}/rest/V1/categories/2/products`, {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': `Bearer ${accessToken}`,
        "Access-Control-Allow-Origin": '*',
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "OPTIONS, GET, POST",
        "Access-Control-Allow-Headers": "Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control"
      }
    })
    for (var i = 0; i < please.data.length; i++) {
      // console.log("data111:", please.data[i].sku, i);
      var tmp = await axios.get(`${storeName}/rest/V1/products/${please.data[i].sku}/?fields=id,sku,name,price,media_gallery_entries,visibility`, {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Authorization': `Bearer ${accessToken}`,
          "Access-Control-Allow-Origin": '*',
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Methods": "OPTIONS, GET, POST",
          "Access-Control-Allow-Headers": "Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control"
        }
      })
      console.log("tmp:data", tmp.data);
      resultTotalData.push(tmp.data);

    }

    resultTotalData.map(async ( item ) => {
    Product.find({ userid: req.body.userid }).remove().exec();
      const newproduct = await new Product({
        sku: item.sku,
        name: item.name,
        image: "https://www.wulf.fit/pub/media/catalog/product/cache/02ec90383f28140cf7b8d4edf1c75509"+item.media_gallery_entries[0].file,
        quantity: item.visibility,
        userid: userid,
        variantid: "",
      });
      await newproduct.save();
    })
    // resultTotalData.map(async (item) => {
    //   let temp = [];
    //     const newproduct = await new Product({
    //       sku: items.sku,
    //       name: item.title,
    //       image: temp,
    //       quantity: items.inventory_quantity,
    //       userid: req.body.userid,
    //       variantid: items.id,
    //     });
    //     await newproduct.save();
    //   });
    // res.status(200).json("success");

    // res.status(200).json(resultTotalData);
  } catch (err) {
    console.log(err);
  }
});

export default router;
