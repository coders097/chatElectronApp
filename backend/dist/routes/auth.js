"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
let router = express_1.default.Router();
const auth_1 = __importDefault(require("../controllers/auth"));
const jwtAuthentication_1 = __importDefault(require("../middlewares/jwtAuthentication"));
const multer_1 = __importDefault(require("multer"));
const multerStorage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: multerStorage,
});
router.post("/login", auth_1.default.login);
router.post("/signup", upload.any(), auth_1.default.signup);
router.post("/checkValidity", jwtAuthentication_1.default, (req, res) => {
    res.status(200).json({
        success: true,
    });
});
router.post("/editProfile", upload.any(), auth_1.default.editProfile);
router.delete("/deleteProfile", jwtAuthentication_1.default, auth_1.default.deleteProfile);
router.post("/refreshToken", jwtAuthentication_1.default, auth_1.default.refreshToken);
exports.default = router;
