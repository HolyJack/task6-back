"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const httpServer = (0, http_1.createServer)();
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "https://task6-front-two.vercel.app",
    },
});
const PORT = process.env.PORT || 80;
const shapes = {};
const users_data = {};
io.on("connection", (socket) => {
    socket.join("preview");
    io.in(socket.id).emit("preview", shapes);
    socket.on("join room", (room) => {
        if (!(room in shapes))
            shapes[room] = [];
        socket.leave("preview");
        socket.join(room);
        socket.emit("joined room", room, shapes[room]);
    });
    socket.on("preview", () => {
        socket.emit("preview", shapes);
    });
    socket.on("disconnect", () => {
        Object.keys(users_data).forEach((room) => {
            delete users_data[room][socket.id];
        });
    });
    socket.on("new shape", (room, shape) => {
        if (!shapes[room])
            shapes[room] = [];
        shapes[room].push(shape);
        io.in(room).emit("update shapes", shapes[room]);
        io.in("preview").emit("preview", shapes);
    });
    socket.on("broadcast user", (room, { user_id, username, pos, shape, color }) => {
        if (!users_data[room])
            users_data[room] = {};
        if (user_id)
            users_data[room][user_id] = { username, pos, shape, color };
        io.in(room).emit("broadcast users", users_data[room]);
    });
});
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
