const express = require("express");
const router = express.Router();
const { Server } = require("socket.io");
const io = new Server(server);


router.post('/',(req,res)=>{
    io.on("connection", (socket) => {
      console.log("user: ", socket.id, " connected");
      onlineUsers.push(socket.id);
      io.emit("user-connect", onlineUsers);
      // io.to(socket.id).emit('DM',"This a DM");
      socket.on("chat message", (message,id) => {
        // console.log({ message });
        // io.emit("chat message", { message });
        // socket.broadcast.emit("chat message", { message });
        console.log(id)
        socket.to(id).emit("chat message", { message });
      });
      socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter(user=>socket.id!=user);
        console.log(onlineUsers)
        io.emit("user-connect", onlineUsers);
        console.log("disconnected");
      });
    });
})


module.exports  = router;