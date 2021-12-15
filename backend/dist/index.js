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
const mongoose_1 = __importDefault(require("mongoose"));
let app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
mongoose_1.default.connect(process.env.MONGO_URL);
const db = mongoose_1.default.connection;
db.on('error', () => console.log("connection error"));
db.once('open', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Connected To DB");
}));
let PORT = process.env.PORT ? process.env.PORT : 3001;
httpServer.listen(PORT, () => {
    console.log("Server started at ", PORT);
});
