"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let groupSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    users: [{
            type: mongoose_1.default.Types.ObjectId,
            ref: "user"
        }],
    pic: {
        type: mongoose_1.default.Types.ObjectId,
        required: true
    },
    messages: [{
            type: mongoose_1.default.Types.ObjectId,
            ref: "message"
        }],
    creationDate: {
        type: Date,
        default: Date.now
    }
});
exports.default = mongoose_1.default.model("group", groupSchema);
