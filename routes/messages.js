import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

/* Posting a Message based on the chatroom id and senderId */

router.post("/", async (req, res) => {
  const newMessage = await new Message({
    chatroomId: req.body.chatroomId,
    senderId: req.body.senderId,
    text: req.body.text,
    read: false,
  });
  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.post("/allmessage", async(req, res) => {
  try {
    const userId = req.body.senderId;

    const msgData = await Message.find({
      senderId: { $ne: userId }
    });

    res.status(200).json(msgData);
  } catch (err) {
    res.status(500).json(err)
  }
})

router.post("/read", async (req, res) => {
  try {
    const userId = req.body.senderId;

    const messages = await Message.find({
      senderId: { $ne: userId }
    });
    // console.log("MESSAGE: ", messages);
    for(var i =0 ;i <messages.length ;i ++ ){
      await Message.findOneAndUpdate(
        { _id: messages[i]._id },
        {
          $set: {
            read: true
          },
        }
      );
    }

    // console.log("Change messages: ", messages)

    res.status(200).json("Success");
  } catch (err) {
    console.log(err);
  }
});

/* Get Messages based on the conversationId */

router.get("/:chatroomId", async (req, res) => {
  try {
    const messages = await Message.find({
      chatroomId: req.params.chatroomId,
    });
    res.status(200).json(messages);
  } catch (err) {
    return res.status(500).json(err);
  }
});

export default router;
