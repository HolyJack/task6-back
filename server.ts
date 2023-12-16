import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});
const PORT = 3000;

const shapes: Record<string, any> = {};
const users_data: Record<string, any> = {};

io.on("connection", (socket) => {
  socket.join("preview");
  io.in(socket.id).emit("preview", shapes);
  socket.on("join room", (room: string) => {
    if (!(room in shapes)) shapes[room] = [];
    socket.leave("preview");
    socket.join(room);
    socket.emit("joined room", room, shapes[room]);
  });

  socket.on("preview", () => {
    socket.emit("preview", shapes);
  });

  socket.on("disconnect", () => {
    delete users_data[socket.id];
  });

  socket.on("new shape", (room, shape) => {
    if (!shapes[room]) shapes[room] = [];
    shapes[room].push(shape);
    io.in(room).emit("update shapes", shapes[room]);
    io.in("preview").emit("preview", shapes);
  });

  socket.on(
    "broadcast user",
    (room, { user_id, username, pos, shape, color }) => {
      if (!users_data[room]) users_data[room] = {};
      if (user_id) users_data[room][user_id] = { username, pos, shape, color };
      io.in(room).emit("broadcast users", users_data[room]);
    },
  );
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
