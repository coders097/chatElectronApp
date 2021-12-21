"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = __importDefault(require("electron"));
const path_1 = __importDefault(require("path"));
const app = electron_1.default.app;
const BrowserWindow = electron_1.default.BrowserWindow;
const ipcMain = require('electron').ipcMain;
const dialog = electron_1.default.dialog;
let onAppStartFlag = false;
const remoteMain = __importStar(require("@electron/remote/main"));
remoteMain.initialize();
let authWin;
let homeWin;
;
;
let userData = {
    loggedIn: false,
    _id: "",
    name: "",
    email: "",
    pic: "",
    token: "",
};
let chatData = {};
let groupDetails = {};
let conversationDetails = {};
let setUserData = (action, payload) => {
    switch (action) {
        case "LOADUSERDATA":
            userData = Object.assign(Object.assign({}, payload), { loggedIn: true });
            break;
        case "LOGOUT":
            userData = {
                _id: "",
                email: "",
                loggedIn: false,
                name: "",
                pic: "",
                token: ""
            };
            break;
        case "LOADUSERDATAFROMCACHE":
            break;
        case "REFRESHTOKEN":
            userData = Object.assign(Object.assign({}, userData), { token: payload.token });
            break;
        case "EDITPROFILE":
            userData = Object.assign({}, payload);
            break;
        default:
            console.log("NOTHING");
    }
};
let createHomeWindow = () => {
    authWin === null || authWin === void 0 ? void 0 : authWin.close();
    homeWin = new BrowserWindow({
        width: 1600,
        height: 800,
        icon: path_1.default.join(__dirname, "../assets/logo.png"),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    require("@electron/remote/main").enable(homeWin.webContents);
    homeWin.maximize();
    homeWin.loadURL(path_1.default.join(__dirname, "../screens/home.html"));
    homeWin.on('closed', () => {
        homeWin = null;
    });
    homeWin.removeMenu();
    homeWin.setMenu(null);
    homeWin.webContents.openDevTools();
};
let createAuthWindow = () => {
    homeWin === null || homeWin === void 0 ? void 0 : homeWin.close();
    if (!onAppStartFlag) {
        onAppStartFlag = true;
    }
    authWin = new BrowserWindow({
        width: 1600,
        height: 800,
        icon: path_1.default.join(__dirname, "../assets/logo.png"),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    authWin.loadURL(path_1.default.join(__dirname, "../screens/auth.html"));
    authWin.on('closed', () => {
        authWin = null;
    });
    authWin.removeMenu();
    authWin.setMenu(null);
    authWin.webContents.openDevTools();
};
let logout = () => {
    setUserData("LOGOUT", userData);
    createAuthWindow();
};
let checkValidity = () => {
    if (userData.loggedIn) {
        fetch("http://localhost:3001/auth/checkValidity", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${userData.token}`
            }
        }).then(res => res.json())
            .then(data => {
            if (data.success) {
                createHomeWindow();
            }
        }).catch(err => alert(err));
    }
};
let setChatData = (action, payload) => {
    switch (action) {
        case "LOADGROUP":
            break;
        case "LOADCONVERSATION":
            break;
        case "ADDGROUPCONVERSATION":
            break;
        case "ADDMESSAGE":
            break;
        default:
            console.log("NOTHING!");
    }
};
ipcMain.on('signInAuth', (e, args) => {
    setUserData("LOADUSERDATA", args);
    createHomeWindow();
});
ipcMain.on('userDataContext', (e) => {
    e.returnValue = userData;
});
ipcMain.on('update-userData', (e, args) => {
    setUserData("EDITPROFILE", args);
    homeWin === null || homeWin === void 0 ? void 0 : homeWin.webContents.send('new-user-data', args);
});
ipcMain.on('delete-user', () => {
    setUserData("LOGOUT", {});
    createAuthWindow();
});
ipcMain.on("logOutUser", () => {
    setUserData("LOGOUT", {});
    createAuthWindow();
});
app.on('ready', createAuthWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (authWin == null) {
        createAuthWindow();
    }
});
