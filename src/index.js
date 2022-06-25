const path = require("path");
const express = require("express");
const http = require("http");
const Filter = require("bad-words");
const socketio = require("socket.io");

const { generateMessage, generateLoctionMessage } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "../public");

app.use(express.static(publicDir));

io.on("connection", (socket) => {
  socket.on("join", (option, callback) => {
    const { error, user } = addUser({ id: socket.id, ...option });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("Admin", "Welcome!"));

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendingMessage", (message, callback) => {
    const user = getUser(socket.id);

    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profantiy is not allowed");
    }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback("Delverd");
  });

  socket.on("sendLoction", (coords, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "loctaionMessage",
      generateLoctionMessage(user.username, coords)
    );

    callback("Location shared");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has logout`)
      );

      io.to(user.room).emit("roomData", {
        room: user.rom,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log("Server is up on " + port);
});
