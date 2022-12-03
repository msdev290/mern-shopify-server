import express from "express";
import sendgrid from "@sendgrid/mail";
import dotenv from "dotenv";
import User from "../models/User.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

dotenv.config();
sendgrid.setApiKey(process.env.SEND_GRID_API);

const router = express.Router();
router.post("/send", async (req, res) => {
  console.log(req.body);
  const msg = {
    to: "awesomegoldgodbird@gmail.com", // Change to your recipient
    from: "awesomegoldgodbird@gmail.com", // Change to your verified sender
    subject: "Hi",
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>The HTML5 Herald</title>
        <meta name="description" content="The HTML5 Herald">
        <meta name="author" content="SitePoint">
      <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
        <link rel="stylesheet" href="css/styles.css?v=1.0">
      </head>
      <body>
        <div class="img-container" style="display: flex;justify-content: center;align-items: center;border-radius: 5px;overflow: hidden; font-family: 'helvetica', 'ui-sans';">
              </div>
              <div class="container" style="margin-left: 20px;margin-right: 20px;">
              <h3>${req.body.email}</h3>
              <div style="font-size: 16px;">  
              <p>Inflencer Number:${req.body.influencernum}</p>
              <p>Follower Url:${req.body.followurl}</p>
              <p>Rating:${req.body.rating}</p>
              <p>Gender:${req.body.gender}</p>
              <p>Followers Number:${req.body.followers}</p>
             <p>Country : ${req.body.country.map((item) => {
               return `<span>${item.label}</span>`;
             })}
              </p>
              <p>your target influencers might follow. : ${req.body.tags.map(
                (item) => {
                  return `<span>${item.text}</span>`;
                }
              )}
              </p>
               <p>your target influencers might use in their posts. : ${req.body.tags2.map(
                 (item) => {
                   return `<span>${item.text}</span>`;
                 }
               )}
              </p>
              <p>your target influencers might tag in their posts. : ${req.body.tags3.map(
                (item) => {
                  return `<span>${item.text}</span>`;
                }
              )}
              </p>
        
              </div>
              </div>
      </body>
      </html>`,
  };
  sendgrid
    .send(msg)
    .then(res.status(200).json("success"))
    .catch((error) => {
      console.error(error);
    });
});

router.post("/sendemail", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (user) {
    user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
    await user
      .save()
      .then((users) => {
        let link =
          "http://" + req.headers.host + "/reset/" + user.resetPasswordToken;
        const msg = {
          to: req.body.email, // Change to your recipient req.headers.host
          from: "awesomegoldgodbird@gmail.com", // Change to your verified sender
          subject: "Password change request",
          text: `Hi ${users.username} \n
                  Please click on the following link ${link} to reset your password. \n\n
                  If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };
        sendgrid.send(msg, (error, result) => {
          if (error) return res.status(500).json({ message: error.message });
          res.status(200).json({
            message: "A reset email has been sent to " + users.email + ".",
          });
        });
      })
      .catch((err) => res.status(500).json({ message: err.message }));
  } else {
    return res.status(401).json({
      message:
        "The email address " +
        req.body.email +
        " is not associated with any account. Double-check your email address and try again.",
    });
  }
});

router.post("/reset/:token", async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(401)
      .json({ message: "Password reset token is invalid or has expired." });
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    user.password = hashedPass;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    // Save
    // send email
    const msg = {
      to: user.email,
      from: "awesomegoldgodbird@gmail.com",
      subject: "Your password has been changed",
      text: `Hi ${user.username} \n
                  This is a confirmation that the password for your account ${user.email} has just been changed.\n`,
    };
    sendgrid.send(msg, (error, result) => {
      if (error) return res.status(500).json({ message: error.message });
      res.status(200).json({ message: "Your password has been updated." });
    });
  }
});
export default router;
