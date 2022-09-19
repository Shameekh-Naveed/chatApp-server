const express = require("express");
const http = require("http");
const { disconnect } = require("process");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const cors = require('cors')
const connectToMongo = require("./db");
const PORT = process.env.PORT || 5050;


// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/index.html");
// });

connectToMongo();


app.use(cors())
app.use(express.json());

// Available routs
app.use("/auth",require('./routes/auth'));
// app.use('chat',require('./routes/chat'));

// let onlineUsers = [];
// io.on("connection", (socket) => {
//   console.log("user: ", socket.id, " connected");
//   onlineUsers.push(socket.id);
//   io.emit("user-connect", onlineUsers);
//   // io.to(socket.id).emit('DM',"This a DM");
//   socket.on("chat message", (message,id) => {
//     // console.log({ message });
//     // io.emit("chat message", { message });
//     // socket.broadcast.emit("chat message", { message });
//     console.log(id)
//     socket.to(id).emit("chat message", { message });
//   });
//   socket.on("disconnect", () => {
//     onlineUsers = onlineUsers.filter(user=>socket.id!=user);
//     console.log(onlineUsers)
//     io.emit("user-connect", onlineUsers);
//     console.log("disconnected");
//   });
// });

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
