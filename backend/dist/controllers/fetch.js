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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const jwtAuthentication_1 = __importDefault(require("../middlewares/jwtAuthentication"));
const errors_1 = __importDefault(require("../middlewares/errors"));
let getUserPic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { pic } = req.query;
    if (!pic) {
        res.status(404).send();
        return;
    }
    try {
        if (pic && (pic != 'undefined')) {
            let stream = fs_1.default.createReadStream(path_1.default.join(__dirname, "../../storage/user/", pic));
            stream.pipe(res);
        }
    }
    catch (e) {
        res.status(404).send();
    }
});
let getPostPic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { pic, token } = req.query;
    if (!pic || (pic == 'undefined') || !token || (token == 'undefined')) {
        res.status(404).send();
        return;
    }
    req.headers['Authorization'] = `Bearer ${token}`;
    (0, jwtAuthentication_1.default)(req, res, () => {
        try {
            if (pic) {
                let stream = fs_1.default.createReadStream(path_1.default.join(__dirname, "../../storage/post/", pic));
                stream.pipe(res);
            }
        }
        catch (e) {
            res.status(404).send();
        }
    });
});
let getAttachment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { fileName, token } = req.query;
    if (!fileName || (fileName == 'undefined') || !token || (token == 'undefined')) {
        res.status(404).send();
        return;
    }
    req.headers['Authorization'] = `Bearer ${token}`;
    (0, jwtAuthentication_1.default)(req, res, () => {
        try {
            if (fileName) {
                let stream = fs_1.default.createReadStream(path_1.default.join(__dirname, "../../storage/attachments/", fileName));
                stream.pipe(res);
            }
        }
        catch (e) {
            res.status(404).send();
        }
    });
});
let uploadAttachment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, jwtAuthentication_1.default)(req, res, () => {
        let { _id } = req.body;
        if (req.files && req.files.length > 0) {
            let names = [];
            let size = req.files.length;
            let i = 0;
            while (size-- > 0) {
                let file = req.files[i++];
                let name = `${_id}_attachment_${Date.now()}_${file.fieldname}.${file.mimetype.split("/")[1]}`;
                fs_1.default.writeFileSync(path_1.default.join(__dirname, "../../storage/attachments/", name), file.buffer);
                names.push(name);
            }
            res.status(200).json({
                success: true,
                data: names
            });
        }
        else {
            errors_1.default.dataMissingError(res);
        }
    });
});
let uploadPic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, jwtAuthentication_1.default)(req, res, () => {
        let { _id } = req.body;
        if (req.files && req.files.length > 0) {
            let names = [];
            let size = req.files.length;
            let i = 0;
            while (size-- > 0) {
                let file = req.files[i++];
                let name = `${_id}_postpic_${Date.now()}_${file.fieldname}.${file.mimetype.split("/")[1]}`;
                fs_1.default.writeFileSync(path_1.default.join(__dirname, "../../storage/post/", name), file.buffer);
                names.push(name);
            }
            res.status(200).json({
                success: true,
                data: names
            });
        }
        else {
            errors_1.default.dataMissingError(res);
        }
    });
});
exports.default = {
    getUserPic, getPostPic, getAttachment, uploadAttachment, uploadPic
};
