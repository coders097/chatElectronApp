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
const errors_1 = __importDefault(require("../middlewares/errors"));
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const jwt_key = process.env.jwt_Key;
const jwtAuthentication_1 = __importDefault(require("../middlewares/jwtAuthentication"));
let saltRounds = 14;
let login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, email } = req.body;
    if (!email || !password) {
        errors_1.default.dataMissingError(res);
        return;
    }
    let userMatch = yield User_1.default.findOne({ email: email });
    if (userMatch) {
        let submittedPass = password;
        let savedPass = userMatch.password;
        const comparePassword = bcryptjs_1.default.compareSync(submittedPass, savedPass);
        if (comparePassword === true) {
            let timeInMinutes = 120;
            let expires = Math.floor(Date.now() / 1000) + 60 * timeInMinutes;
            let token = jsonwebtoken_1.default.sign({
                name: userMatch.name,
                _id: userMatch._id,
                exp: expires,
            }, jwt_key);
            res.status(200).send({
                success: true,
                data: {
                    _id: userMatch._id,
                    name: userMatch.name,
                    email: userMatch.email,
                    pic: userMatch.pic,
                    token: token,
                },
            });
        }
        else {
            errors_1.default.authenticationError(res);
        }
    }
    else {
        errors_1.default.authenticationError(res);
    }
});
let signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, pic } = req.body;
    if (!email || !password || !name) {
        errors_1.default.dataMissingError(res);
        return;
    }
    let userMatch = yield User_1.default.findOne({ email: email });
    if (userMatch) {
        res.status(401).send({
            success: false,
            error: "Email present!",
        });
    }
    else {
        const temp_password = bcryptjs_1.default.hashSync(password, saltRounds);
        let pic_name = `${name}_${Date.now()}.jpg`;
        let pic_present = false;
        if (req.files[0]) {
            fs_1.default.writeFileSync(path_1.default.join(__dirname, "../../storage/user/", pic_name), req.files[0].buffer);
            pic_present = true;
        }
        else
            pic_name = pic;
        const new_user = new User_1.default({
            name: name,
            email: email,
            password: temp_password,
            pic: pic_name,
        });
        new_user.save((err, user) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.log(err);
                if (pic_present) {
                    try {
                        fs_1.default.unlinkSync(path_1.default.join(__dirname, "../../storage/user/", pic_name));
                    }
                    catch (e) { }
                }
                errors_1.default.serverError(res);
            }
            else {
                res.status(200).json({
                    success: true,
                });
            }
        }));
    }
});
let editProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, jwtAuthentication_1.default)(req, res, () => {
        console.log("Verified!");
        let { id, name, email, password, oldPassword } = req.body;
        if (!oldPassword) {
            errors_1.default.dataMissingError(res);
            return;
        }
        User_1.default.findById(id)
            .then((user) => __awaiter(void 0, void 0, void 0, function* () {
            const comparePassword = bcryptjs_1.default.compareSync(oldPassword, user.password);
            if (comparePassword === true) {
                let oldPic = user.pic;
                let newPic = oldPic;
                if (req.files && req.files.length != 0) {
                    newPic = `${user.name}_${Date.now()}.jpg`;
                    fs_1.default.writeFileSync(path_1.default.join(__dirname, "../../storage/user/", newPic), req.files[0].buffer);
                    user.pic = newPic;
                }
                if (name) {
                    user.name = name;
                }
                if (email) {
                    user.email = email;
                }
                if (password) {
                    const temp_password = bcryptjs_1.default.hashSync(password, saltRounds);
                    user.password = temp_password;
                }
                user
                    .save()
                    .then(() => __awaiter(void 0, void 0, void 0, function* () {
                    res.status(200).json({
                        success: true,
                        data: {
                            _id: user._id,
                            name: user.name,
                            email: user.email,
                            pic: user.pic,
                        },
                    });
                    if (oldPic !== newPic) {
                        if ((oldPic !== "user0.png") &&
                            (oldPic !== "user1.png") &&
                            (oldPic !== "user2.png") &&
                            (oldPic !== "user3.png") &&
                            (oldPic !== "user4.png") &&
                            (oldPic !== "user5.png")) {
                            try {
                                fs_1.default.unlinkSync(path_1.default.join(__dirname, "../../storage/user/", oldPic));
                            }
                            catch (E) {
                                console.log("ADMIN PROBLEM 4002:", oldPic);
                            }
                        }
                    }
                }))
                    .catch(() => {
                    errors_1.default.serverError(res);
                });
            }
            else {
                errors_1.default.authenticationError(res);
            }
        }))
            .catch((err) => {
            console.log(err);
            errors_1.default.authenticationError(res);
        });
    });
});
let deleteProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id, password } = req.body;
    let _user = yield User_1.default.findById(id);
    if (_user) {
        const comparePassword = bcryptjs_1.default.compareSync(password, _user.password);
        if (comparePassword === true) {
            User_1.default.findByIdAndDelete(id)
                .then((user) => __awaiter(void 0, void 0, void 0, function* () {
                res.status(200).json({
                    success: true,
                });
                try {
                    if ((user.pic !== "user0.png") &&
                        (user.pic !== "user1.png") &&
                        (user.pic !== "user2.png") &&
                        (user.pic !== "user3.png") &&
                        (user.pic !== "user4.png") &&
                        (user.pic !== "user5.png"))
                        fs_1.default.unlinkSync(path_1.default.join(__dirname, "../../storage/user/", user.pic));
                }
                catch (E) {
                    console.log("ADMIN PROBLEM 4002:", user.pic);
                }
            }))
                .catch((err) => {
                errors_1.default.serverError(res);
            });
        }
    }
});
let refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { name, _id } = req.body;
    let timeInMinutes = 120;
    let expires = Math.floor(Date.now() / 1000) + 60 * timeInMinutes;
    try {
        let token = jsonwebtoken_1.default.sign({
            name: name,
            _id: _id,
            exp: expires,
        }, jwt_key);
        res.status(200).json({
            success: true,
            data: {
                token: token
            }
        });
    }
    catch (e) {
        errors_1.default.serverError(res);
    }
});
exports.default = {
    login, signup, editProfile, deleteProfile, refreshToken
};
