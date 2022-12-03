import express from "express";
import User from "../models/User.js";
import path from "path";
import multer from "multer";
import dotenv from "dotenv";
import FormData from "form-data";
import axios from "axios";

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
router.put(
  "/:id",
  upload.fields([
    {
      name: "logoimage",
      maxCount: 1,
    },
    {
      name: "photo",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    const updates = {};
    if (req.body.username) {
      const username = req.body.username;
      updates.username = username;
    }
    if (req.body.phone) {
      const phone = req.body.phone;
      updates.phone = phone;
    }
    if (req.body.deliveryfirstname) {
      const deliveryfirstname = req.body.deliveryfirstname;
      updates.deliveryfirstname = deliveryfirstname;
    }
    if (req.body.deliverylastname) {
      const deliverylastname = req.body.deliverylastname;
      updates.deliverylastname = deliverylastname;
    }
    if (req.body.deliveryaddress) {
      const deliveryaddress = req.body.deliveryaddress;
      updates.deliveryaddress = deliveryaddress;
    }
    if (req.body.instauser) {
      const instauser = req.body.instauser;
      updates.instauser = instauser;
    }
    if (req.body.country) {
      const country = req.body.country;
      updates.country = country;
    }
    if (req.body.ispackage) {
      const ispackage = req.body.ispackage;
      updates.ispackage = ispackage;
    }
    if (req.body.storename) {
      const storename = req.body.storename;
      updates.storename = storename;
    }
    if (req.body.access) {
      const accesstoken = req.body.access;
      updates.accesstoken = accesstoken;
    }
    if (req.body.newmessage) {
      const newmessage = req.body.newmessage;
      updates.newmessage = newmessage;
    }
    if (req.body.photo) {
      const photo = req.body.photo;
      updates.photo = photo;
    }
    if (req.body.reportuser) {
      try{
        const reportuser = req.body.reportuser;
        updates.reportuser = reportuser;
        return res.status(200).json("Account Deleted Succesfully");
      } catch {
        res.status(500).json(err);
      }
    }
    if (req.body.rates) {
      const users = await User.findById(req.params.id);
      const rates = users.rates + req.body.rates;
      updates.rates = rates;
    }

    if (req.files !== undefined) {
      if (req.files.photo) {
        const photo = req.files.photo[0].filename;
        updates.photo = process.env.IMAGEURL + photo;
      } else if (req.files.logoimage) {
        const logoimage = req.files.logoimage[0].filename;
        updates.logoimage = process.env.IMAGEURL + logoimage;
      }
    }

    try {
      const userinfo = await User.findByIdAndUpdate(req.params.id, {
        $set: updates,
      });
      res.status(200).json(userinfo);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account Deleted Succesfully");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    return res.status(403).send("You can Only Update Your Account");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    return res
      .status(200)
      .json(user); /* Removing uneccesary fields for the response JSON */
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.get("/", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.query.username });
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
  }
});

router.post("/alluser", async (req, res) => {
  try {
    const user = await User.find();
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
  }
});

router.get("/insta/:code", async (req, res) => {
  var bodyFormData = new FormData();

  const code = req.params.code;

  bodyFormData.append("client_id", "752600142585429");
  bodyFormData.append("client_secret", "48eb81e08fd8051aea7d802e96497673");
  bodyFormData.append("grant_type", "authorization_code");
  bodyFormData.append("redirect_uri", "https://gifterly.herokuapp.com/");
  bodyFormData.append("code", code);

  const options = {
    method: "POST",
    url: "https://api.instagram.com/oauth/access_token",
    data: bodyFormData,
    headers: { "Content-Type": "multipart/form-data" },
  };

  axios
    .request(options)
    .then(function (response) {
      return res
        .status(200)
        .send({ data: response.data, message: "code fetched" });
    })
    .catch(function (error) {
      return res.status(504).send({ message: "user not found" });
    });
});

router.post("/getuser", async (req, res) => {
  const token = req.body.accessToken;
  await axios
    .get(
      `https://graph.instagram.com/me/media?fields=media_type,username,permalink,media_url&access_token=${token}`
    )
    .then(function (response) {
      return res
        .status(200)
        .send({ data: response.data, message: "user fetched" });
    })
    .catch(function (error) {
      return res.status(400).send({ message: "user not found" });
    });
});

router.post("/getuserinfo", async (req, res) => {
  try {
    const options = {
      method: "GET",
      url: "https://instagram-looter2.p.rapidapi.com/profile",
      params: { username: req.body.username },
      headers: {
        "X-RapidAPI-Key": "7a45ecbd22msha79cca10d28c183p1d2aa2jsnf7e109e4f372",
        "X-RapidAPI-Host": "instagram-looter2.p.rapidapi.com",
      },
    };
    await axios.request(options).then(async (response) => {
      let image = await axios.get(response.data.profile_pic_url, {
        responseType: "arraybuffer",
      });
      let raw = Buffer.from(image.data).toString("base64");
      await User.findOneAndUpdate(
        { _id: req.body.userid },
        {
          $set: {
            instauser: req.body.username,
            photo: "data:" + image.headers["content-type"] + ";base64," + raw,
            followers: response.data.edge_followed_by.count,
          },
        }
      );
    });
    res.status(200).json("Success");
  } catch (err) {
    console.log("error");
  }
});

router.post("/updateUser", async (req, res) => {
  try {
    const updateData = req.body;

    await User.findOneAndUpdate(
      { _id: updateData._id },
      {
        $set: {
          ispackage: updateData.subscript
        },
      }
    );
    res.status(200).json("Success");
  } catch (err) {
    console.log("error");
  }
});

router.post("/deleteuser", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.body._id);
    res.status(200).json("Product Deleted Succesfully");
  } catch (err) {
    console.log(err);
  }
});

router.post("/updatebrand", async (req, res) => {
  try {
    const updateData = req.body;

    await User.findOneAndUpdate(
      { _id: updateData._id },
      {
        $set: {
          username: updateData.username,
          email: updateData.email
        },
      }
    );
    res.status(200).json("Success");
  } catch (err) {
    console.log("error");
  }
});


export default router;
