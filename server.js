import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/messages.js";
import chatroomRoutes from "./routes/chatrooms.js";
import product from "./routes/products.js";
import campaign from "./routes/campaign.js";
import incampaign from "./routes/incampaign.js";
import mail from "./routes/mail.js";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import bodyParser from "body-parser";
/* App Config */
const __dirname = path.resolve();

const app = express();
const port = process.env.PORT || 80;
dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
/* Middleware -> Deals the Connections between database and the App */
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/* Socket.io Setup */
app.use(express.urlencoded({ extended: true }));

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //when connect
  // console.log("a user connected.");

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    console.log(userId, socket.id);
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  //when disconnect
  socket.on("disconnect", () => {
    // console.log("a user disconnected!");
    // removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

/* API Routes -> The first part is the default path for all the requests in that users.js file there we have to continue from this path */
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chatrooms", chatroomRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/catalogue", product);
app.use("/api/campaign", campaign);
app.use("/api/mail", mail);
app.use("/api/incampaign", incampaign);
app.use("/photo", express.static("images"));

/* Database Connection */

mongoose.connect(
  process.env.MONGO_URL,
  // "mongodb+srv://gifter:gifter@cluster0.m0f2j.mongodb.net/?retryWrites=true&w=majority",
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("MONGODB CONNECTED");
  }
);

// app.use(express.static(path.join(__dirname, "build")));

// app.get("/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

/* Port Listening In */
server.listen(port, () => {
  console.log(`Server is running in PORT ${port}`);
});
