"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = (io) => {
    io.on("connection", (socket) => {
        console.log("Connected id", socket.id);
        socket.emit("baba", "Hello");
    });
};
exports.default = _;
