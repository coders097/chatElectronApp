"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
let router = express_1.default.Router();
const fetch_1 = __importDefault(require("../controllers/fetch"));
const multer_1 = __importDefault(require("multer"));
const multerStorage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: multerStorage,
});
router.get("/getUserPic", fetch_1.default.getUserPic);
router.get("/getPostPic", fetch_1.default.getPostPic);
router.get("/getAttachment", fetch_1.default.getAttachment);
router.post("/uploadAttachment", upload.any(), fetch_1.default.uploadAttachment);
router.post("/uploadPic", upload.any(), fetch_1.default.uploadPic);
exports.default = router;
