"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_key = process.env.jwt_Key;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let _ = (token, next, errorFunction) => {
    try {
        let data = jsonwebtoken_1.default.verify(token, jwt_key);
        next();
    }
    catch (e) {
        errorFunction('Invalid or expired Token!');
    }
};
exports.default = _;
