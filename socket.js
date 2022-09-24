const User = require("./models/user");
const io = require("socket.io")(8900, {
    cors: {
      origin: "http://localhost:3000",
    },
  });
  
  const appendSocketId = (userId, socketId) => {
    // Whenever a user joins find him in DB and append his socketId there
  };
  
  const removeSocketId = (userSocketId) => {
    // Whenever a user disconnects find him in DB and remove his socketId there
  };
  
  const getSocketId = (userId) => {
    // Get socket id of any user using just his ID
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
  
    socket.on("send message", (reciever, message) => {
      // console.log('here')
      // Send the message to target
      const target = getSocketId(reciever);
      socket.to(target).emit("incoming message",  message );
      // sendMessage(socket.id, target, message);
    });
  
    socket.on("disconnect", () => {
      console.log("user: ", socket.id, " disconnected");
      // removeSocketId(socekt.id);
    });
  });