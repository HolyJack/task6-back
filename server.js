"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const PORT = process.env.PORT || 80;
const URL = process.env.FRONT_URL;
const httpServer = (0, http_1.createServer)();
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: URL,
    },
});
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
        socket.emit("joined room", room);
        io.in(room).emit("update shapes");
    });
    socket.on("preview", () => {
        socket.emit("preview", shapes);
    });
    socket.on("disconnect", () => {
        Object.keys(users_data).forEach((room) => {
            delete users_data[room][socket.id];
        });
    });
    socket.on("leaveroom", (room) => socket.leave(room));
    socket.on("new shape", (room, shape) => __awaiter(void 0, void 0, void 0, function* () {
        if (!shapes[room])
            shapes[room] = [];
        shapes[room].push(shape);
        io.in(room).emit("update shapes", shapes[room]);
        io.in("preview").emit("preview", shapes);
    }));
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
