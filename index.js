const express = require("express");
const http = require("http");
const { disconnect } = require("process");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
// const io = new Server(server);
const cors = require("cors");
const connectToMongo = require("./db");
const PORT = process.env.PORT || 5050;

// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/index.html");
// });

connectToMongo();

app.use(
  cors({
    "Access-Control-Allow-Origin": "*",
  })
);
app.use(express.json());

// Available routs
app.use("/auth", require("./routes/auth"));
// app.use('chat',require('./routes/chat'));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//  Socket

const User = require("./models/user");
const { findByIdAndUpdate } = require("./models/user");
const { text } = require("express");
const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const appendSocketId = async (userId, socketId) => {
  // Whenever a user joins find him in DB and append his socketId there
  try {
    let user = await User.findByIdAndUpdate(
      userId,
      { socketId },
      {
        new: true,
      }
    );
    console.log("append user socket id:", user);
  } catch (error) {
    console.log({ error });
  }
};

const removeSocketId = async (userSocketId) => {
  // Whenever a user disconnects find him in DB and remove his socketId there
  try {
    let user = await User.findOneAndUpdate(
      { socketId: userSocketId },
      { socketId: "" },
      {
        returnOriginal: false,
      }
    );
    console.log("Remove user socket id:", user);
  } catch (error) {
    console.log({ error });
  }
};

const getSocketId = async (userId) => {
  // Get socket id of any user using just his ID
  try {
    let user = await User.findById(userId);
    console.log("Get user socket id:", user);
    return user.socketId;
  } catch (error) {
    console.log({ error });
  }
};

// const sendMessage = (sender, reciever, message) => {
//   const target = getSocketId(reciever);
//   socket.to(target).emit("incoming message", { message });
// };

io.on("connection", (socket) => {
  console.log("user: ", socket.id, " connected");
  socket.on("incoming user id", (userId) => {
    var userId = appendSocketId(userId, socket.id);
  });

  socket.on("send message", async (data) => {
    // console.log('here')
    
    const {text,target,sender,date} = data
    // Send the message to target
    const targetSocketId = await getSocketId(target);
    console.log({targetSocketId},'104 index js')
    socket.to(targetSocketId).emit("incoming message", data);
    // sendMessage(socket.id, target, message);
  });

  socket.on("disconnect", async () => {
    console.log("user: ", socket.id, " disconnected");
    await removeSocketId(socket.id);
  });
});
