"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let conversationSchema = new mongoose_1.default.Schema({
    personOne: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "user"
    },
    personTwo: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "user"
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
exports.default = mongoose_1.default.model("conversation", conversationSchema);
