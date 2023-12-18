import { createServer } from "http";
import { Server } from "socket.io";
import { config } from "dotenv";

config();

const PORT = process.env.PORT || 80;
const URL = process.env.FRONT_URL;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: URL,
  },
});

const shapes: Record<string, any> = {
  room1: [],
  room2: [],
  room3: [],
  room4: [],
};
const users_data: Record<string, Record<string, any>> = {};

io.on("connection", (socket) => {
  socket.join("preview");
  io.in(socket.id).emit("preview", shapes);

  socket.on("join room", (room: string) => {
    if (!(room in shapes)) shapes[room] = [];
    socket.leave("preview");
    socket.join(room);
    socket.emit("joined room", room);
  });

  socket.on("get initial preview", () => {
    io.in(socket.id).emit("initial preview", shapes);
  });

  socket.on("disconnect", () => {
    Object.keys(users_data).forEach((room) => {
      delete users_data[room][socket.id];
    });
  });

  socket.on("leaveroom", (room) => socket.leave(room));

  socket.on("initial shapes", (room) => {
    io.in(socket.id).emit("initial shapes", shapes[room]);
  });

  socket.on("new shape", async (room, shape) => {
    if (!shapes[room]) shapes[room] = [];
    shapes[room].push(shape);
    socket.to(room).emit("add new shape", shape);
    io.in("preview").emit(`update preview ${room}`, shape);
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
