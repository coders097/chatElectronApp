"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let messageSchema = new mongoose_1.default.Schema({
    sender: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "user"
    },
    timeStamp: {
        type: Date,
        default: Date.now
    },
    message: {
        type: String
    },
    attachments: [{
            type: String
        }]
});
exports.default = mongoose_1.default.model("message", messageSchema);
