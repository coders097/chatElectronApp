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
const Group_1 = __importDefault(require("../models/Group"));
const User_1 = __importDefault(require("../models/User"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
const Message_1 = __importDefault(require("../models/Message"));
const socketJwtVerify_1 = __importDefault(require("../middlewares/socketJwtVerify"));
let _ = (io) => {
    let connectedClients = {};
    let mapUserIdToSocketId = {};
    let groupIdToNameMap = {};
    io.on("connection", (socket) => {
        console.log("Connected!");
        connectedClients[socket.id] = socket;
        socket.on("link-id", (_id) => {
            mapUserIdToSocketId[_id] = socket.id;
        });
        socket.on('get-all-groups-info', (data, cb) => __awaiter(void 0, void 0, void 0, function* () {
            if (data === null || data === void 0 ? void 0 : data.token) {
                (0, socketJwtVerify_1.default)(data.token, () => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        let user = yield User_1.default.findById(data._id).populate({
                            path: "groups",
                            select: "name pic _id"
                        });
                        if (user) {
                            cb({
                                success: true,
                                data: user.groups
                            });
                        }
                        else {
                            cb({
                                success: false,
                                error: "INVALID ID"
                            });
                        }
                    }
                    catch (e) {
                        cb({
                            success: false,
                            error: "INVALID ID"
                        });
                    }
                }), (errorMessage) => {
                    cb({
                        success: false,
                        error: errorMessage
                    });
                });
            }
        }));
        socket.on('get-all-conversations-info', (data, cb) => __awaiter(void 0, void 0, void 0, function* () {
            if (data === null || data === void 0 ? void 0 : data.token) {
                (0, socketJwtVerify_1.default)(data.token, () => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        let user = yield User_1.default.findById(data._id).populate({
                            path: "conversations",
                            populate: {
                                path: "personOne personTwo"
                            }
                        });
                        if (user) {
                            let conversationsList = [];
                            user.conversations.forEach((conversation) => {
                                let _tempData = {
                                    userId: "",
                                    userName: "",
                                    userPic: "",
                                    conversationId: ""
                                };
                                _tempData.conversationId = conversation._id;
                                if (conversation.personOne._id === data._id) {
                                    _tempData.userId = conversation.personTwo._id;
                                    _tempData.userName = conversation.personTwo.name;
                                    _tempData.userPic = conversation.personTwo.pic;
                                }
                                else {
                                    _tempData.userId = conversation.personOne._id;
                                    _tempData.userName = conversation.personOne.name;
                                    _tempData.userPic = conversation.personOne.pic;
                                }
                                conversationsList.push(_tempData);
                            });
                            cb({
                                success: true,
                                data: conversationsList
                            });
                        }
                        else {
                            cb({
                                success: false,
                                error: "INVALID ID"
                            });
                        }
                    }
                    catch (e) {
                        cb({
                            success: false,
                            error: "INVALID ID"
                        });
                    }
                }), (errorMessage) => {
                    cb({
                        success: false,
                        error: errorMessage
                    });
                });
            }
        }));
        socket.on('create-group', (data, cb) => __awaiter(void 0, void 0, void 0, function* () {
            if (data === null || data === void 0 ? void 0 : data.token)
                (0, socketJwtVerify_1.default)(data.token, () => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        let user = yield User_1.default.findById(data._id);
                        if (user) {
                            let group = yield Group_1.default.create({
                                name: data.name,
                                pic: data.pic,
                                users: [data._id]
                            });
                            user.groups.push(group._id);
                            user.save()
                                .then(() => {
                                groupIdToNameMap[group._id] = data.name;
                                socket.join(data.name);
                                cb({
                                    success: true,
                                    data: {
                                        name: group.name,
                                        pic: group.pic,
                                        _id: group._id
                                    }
                                });
                            }).catch((err) => {
                                cb({
                                    success: false,
                                    error: "SERVER ERROR"
                                });
                                Group_1.default.findByIdAndDelete(group._id)
                                    .then(() => { }).catch(() => { });
                            });
                        }
                        else {
                            cb({
                                success: false,
                                error: "INVALID ID"
                            });
                        }
                    }
                    catch (e) {
                        cb({
                            success: false,
                            error: "SERVER ERROR"
                        });
                    }
                }), (errorMessage) => {
                    cb({
                        success: false,
                        error: errorMessage
                    });
                });
        }));
        socket.on('join-group', (data, cb) => __awaiter(void 0, void 0, void 0, function* () {
            if (data === null || data === void 0 ? void 0 : data.token)
                (0, socketJwtVerify_1.default)(data.token, () => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        let user = yield User_1.default.findById(data._id);
                        let group = yield Group_1.default.findById(data.groupId)
                            .slice('messages', -60)
                            .populate({
                            path: 'messages',
                            populate: {
                                path: 'sender',
                                select: "_id name pic"
                            }
                        });
                        if (user && group) {
                            let index = group.users.find((id) => {
                                return id.toString() == data._id;
                            });
                            if (index) {
                                cb({
                                    success: false,
                                    error: "ALREADY JOINED"
                                });
                            }
                            else {
                                user.groups.push(group._id);
                                group.users.push(data._id);
                                user.save().then(() => {
                                    group.save().then(() => {
                                        groupIdToNameMap[data.groupId] = group.name;
                                        socket.join(group.name);
                                        cb({
                                            success: true,
                                            data: group.messages
                                        });
                                    }).catch((e) => {
                                        cb({
                                            success: false,
                                            error: "SERVER ERROR"
                                        });
                                        user.groups = user.groups.filter((con) => {
                                            return con.toString() != data.groupId;
                                        });
                                        user.save().then(() => { }).catch(() => { });
                                    });
                                }).catch((e) => {
                                    cb({
                                        success: false,
                                        error: "SERVER ERROR"
                                    });
                                });
                            }
                        }
                        else {
                            cb({
                                success: false,
                                error: "INVALID IDS"
                            });
                        }
                    }
                    catch (e) {
                        cb({
                            success: false,
                            error: "SERVER ERROR"
                        });
                    }
                }), (errorMessage) => {
                    cb({
                        success: false,
                        error: errorMessage
                    });
                });
        }));
        socket.on('create-conversion', (data, cb) => __awaiter(void 0, void 0, void 0, function* () {
            if (data === null || data === void 0 ? void 0 : data.token)
                (0, socketJwtVerify_1.default)(data.token, () => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        let user = yield User_1.default.findById(data._id);
                        let friend = yield User_1.default.findById(data.friendId);
                        if (user && friend) {
                            let conversation = yield Conversation_1.default.create({
                                personOne: data._id,
                                personTwo: data.friendId
                            });
                            if (conversation) {
                                user.conversations.push(conversation._id);
                                friend.conversations.push(conversation._id);
                                user.save().then(() => {
                                    friend.save().then(() => {
                                        if (mapUserIdToSocketId[data.friendId] && connectedClients[mapUserIdToSocketId[data.friendId]]) {
                                            connectedClients[mapUserIdToSocketId[data.friendId]].emit('new-conversation', {
                                                userId: data._id,
                                                userName: user.name,
                                                userPic: user.pic,
                                                conversationId: conversation._id
                                            });
                                        }
                                        cb({
                                            success: true,
                                            data: {
                                                conversationId: conversation._id
                                            }
                                        });
                                    }).catch((err) => {
                                        cb({
                                            success: false,
                                            error: "SERVER ERROR"
                                        });
                                        Conversation_1.default.findByIdAndDelete(conversation._id)
                                            .then(() => { }).catch(() => { });
                                        user.conversations = user.conversations.filter((con) => {
                                            return con.toString() != conversation._id.toString();
                                        });
                                        user.save().then(() => { }).catch(() => { });
                                    });
                                }).catch((err) => {
                                    cb({
                                        success: false,
                                        error: "SERVER ERROR"
                                    });
                                });
                            }
                            else {
                                cb({
                                    success: false,
                                    error: "SERVER ERROR"
                                });
                            }
                        }
                        else {
                            cb({
                                success: false,
                                error: "INVALID IDS"
                            });
                        }
                    }
                    catch (e) {
                        cb({
                            success: false,
                            error: "SERVER ERROR"
                        });
                    }
                }), (errorMessage) => {
                    cb({
                        success: false,
                        error: errorMessage
                    });
                });
        }));
        socket.on('recent-chats', (data, cb) => __awaiter(void 0, void 0, void 0, function* () {
            if (data === null || data === void 0 ? void 0 : data.token)
                (0, socketJwtVerify_1.default)(data.token, () => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        let chattingKeeper = (data.type === 'GROUP') ? (yield Group_1.default.findById(data.groupId)
                            .slice('messages', -60)
                            .populate({
                            path: 'messages',
                            populate: {
                                path: 'sender',
                                select: "_id name pic"
                            }
                        })) : (yield Conversation_1.default.findById(data.conversationId)
                            .slice('messages', -60)
                            .populate({
                            path: 'messages',
                            populate: {
                                path: 'sender',
                                select: "_id name pic"
                            }
                        }));
                        if (chattingKeeper) {
                            let check = false;
                            if (data.type === 'GROUP') {
                                let checkPresent = chattingKeeper.users.find((id) => {
                                    return id.toString() == data._id;
                                });
                                if (checkPresent)
                                    check = true;
                            }
                            else {
                                if (chattingKeeper.personOne.toString() == data._id)
                                    check = true;
                                if (chattingKeeper.personTwo.toString() == data._id)
                                    check = true;
                            }
                            if (check) {
                                if (data.type === 'GROUP') {
                                    groupIdToNameMap[data.groupId] = chattingKeeper.name;
                                    socket.join(chattingKeeper.name);
                                }
                                cb({
                                    success: true,
                                    data: chattingKeeper.messages
                                });
                            }
                            else {
                                cb({
                                    success: false,
                                    error: "NOT AVALILABLE FOR YOU"
                                });
                            }
                        }
                        else {
                            cb({
                                success: false,
                                error: "INVALID ID"
                            });
                        }
                    }
                    catch (e) {
                        cb({
                            success: false,
                            error: "SERVER ERROR"
                        });
                    }
                }), (errorMessage) => {
                    cb({
                        success: false,
                        error: errorMessage
                    });
                });
        }));
        socket.on('send-message', (data) => __awaiter(void 0, void 0, void 0, function* () {
            if (data === null || data === void 0 ? void 0 : data.token)
                (0, socketJwtVerify_1.default)(data.token, () => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        let chattingKeeper = (data.type === 'GROUP') ? (yield Group_1.default.findById(data.groupId)) : (yield Conversation_1.default.findById(data.conversationId));
                        if (chattingKeeper) {
                            let attachments = [];
                            if (data.pics.length > 0) {
                                attachments = [...data.pics];
                            }
                            if (data.attachments.length > 0) {
                                attachments = [
                                    ...attachments,
                                    ...data.attachments
                                ];
                            }
                            let message = yield Message_1.default.create({
                                sender: data._id,
                                message: data.message,
                                attachments: attachments
                            });
                            if (message) {
                                chattingKeeper.messages.push(message._id);
                                chattingKeeper.save().then(() => {
                                    message.sender = {
                                        _id: data._id,
                                        name: data.name,
                                        pic: data.pic
                                    };
                                    if (data.type === 'GROUP') {
                                        if (groupIdToNameMap[data.groupId])
                                            io.in(groupIdToNameMap[data.groupId])
                                                .emit('message-received', {
                                                type: "GROUP",
                                                data: message,
                                                typeId: data.groupId
                                            });
                                    }
                                    else {
                                        if ((data === null || data === void 0 ? void 0 : data.friendId) && mapUserIdToSocketId[data.friendId] && connectedClients[mapUserIdToSocketId[data.friendId]]) {
                                            connectedClients[mapUserIdToSocketId[data.friendId]].emit('message-received', {
                                                type: "CONVERSATION",
                                                data: message,
                                                typeId: data.conversationId
                                            });
                                        }
                                    }
                                }).catch((e) => {
                                    console.log(e);
                                    Message_1.default.findByIdAndDelete(message._id)
                                        .then(() => { }).catch(() => { });
                                });
                            }
                        }
                    }
                    catch (e) {
                        console.log(e);
                    }
                }), (errorMessage) => {
                    console.log(errorMessage);
                });
        }));
        socket.on('typing', (data) => {
            if (data === null || data === void 0 ? void 0 : data.token)
                (0, socketJwtVerify_1.default)(data.token, () => __awaiter(void 0, void 0, void 0, function* () {
                    if (data.type === 'GROUP') {
                        if ((data === null || data === void 0 ? void 0 : data.groupId) && groupIdToNameMap[data.groupId]) {
                            socket.to(groupIdToNameMap[data.groupId]).emit('someone-typing', {
                                type: "GROUP",
                                name: data.name,
                                typeId: data.groupId
                            });
                        }
                    }
                    else {
                        if ((data === null || data === void 0 ? void 0 : data.friendId) && mapUserIdToSocketId[data.friendId] && connectedClients[mapUserIdToSocketId[data.friendId]]) {
                            connectedClients[mapUserIdToSocketId[data.friendId]].emit('someone-typing', {
                                type: "CONVERSATION",
                                name: data.name,
                                typeId: data.friendId
                            });
                        }
                    }
                }), (errorMessage) => {
                    console.log(errorMessage);
                });
        });
        socket.on('disconnect', () => {
            if (connectedClients[socket.id]) {
                delete connectedClients[socket.id];
            }
        });
    });
};
exports.default = _;
