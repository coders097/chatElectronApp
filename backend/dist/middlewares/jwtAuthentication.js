"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_key = process.env.jwt_Key;
function jwtCheckToken(req, res, next) {
    let header = req.header('Authorization');
    if (!header)
        header = req.headers['Authorization'];
    if (!header) {
        res.status(401).send({
            success: false,
            error: 'Invalid Token!'
        });
        return;
    }
    const [type, token] = header.split(' ');
    if (type === 'Bearer' && typeof token !== 'undefined') {
        try {
            let data = jsonwebtoken_1.default.verify(token, jwt_key);
            req.body._id = data['_id'];
            next();
        }
        catch (e) {
            console.log("EXPIRED TOKEN");
            res.status(401).send({
                success: false,
                error: 'Invalid or expired Token!'
            });
        }
    }
    else {
        console.log("INVALID TOKEN");
        res.status(401).send({
            success: false,
            error: 'Invalid Token!'
        });
    }
}
exports.default = jwtCheckToken;
