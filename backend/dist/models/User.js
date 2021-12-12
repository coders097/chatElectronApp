"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    pic: {
        type: String,
        required: true
    },
    groups: [{
            type: mongoose_1.default.Types.ObjectId,
            ref: "group"
        }],
    conversations: [{
            type: mongoose_1.default.Types.ObjectId,
            ref: "conversation"
        }],
    creationDate: {
        type: Date,
        default: Date.now
    }
});
exports.default = mongoose_1.default.model("user", userSchema);
