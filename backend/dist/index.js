"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const socket_io_1 = __importDefault(require("socket.io"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const socketController_1 = __importDefault(require("./controllers/socketController"));
let app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
dotenv_1.default.config({
    path: "config.env"
});
const auth_1 = __importDefault(require("./routes/auth"));
app.use("/auth", auth_1.default);
const fetch_1 = __importDefault(require("./routes/fetch"));
app.use("/fetch", fetch_1.default);
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.default.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH", "DELETE"]
    }
});
(0, socketController_1.default)(io);
let PORT = process.env.PORT ? process.env.PORT : 3001;
httpServer.listen(PORT, () => {
    console.log("Server started at ", PORT);
});
